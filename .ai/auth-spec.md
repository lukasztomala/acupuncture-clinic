# Specyfikacja modułu uwierzytelniania użytkowników

Poniższa dokumentacja opisuje architekturę i sposób implementacji funkcjonalności rejestracji (US-001), logowania (US-002, US-009), konfiguracji godzin pracy (US-010) oraz odzyskiwania hasła w oparciu o stack technologiczny (Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui, Supabase).

## 1. Architektura interfejsu użytkownika

### 1.1 Strony i layouty

- Layouty:

  - `BaseLayout` (publiczny): nagłówek, stopka, główne kontenery.
  - `AuthLayout` (zalogowany): rozszerza `BaseLayout`, dodaje `AuthHeader` z `UserMenu` i przyciskiem wyloguj.
  - W `astro.config.mjs` rejestrujemy `src/middleware/index.ts`, który na podstawie sesji dobiera layout oraz chroni wybrane strony.

- Strony Astro (`src/pages`):
  - `/register.astro` – formularz rejestracji pacjenta.
  - `/login.astro` – formularz logowania (pacjent/pracownik).
  - `/reset-password.astro` – wprowadzenie e-mail do wysłania linku resetującego.
  - `/update-password.astro` – formularz ustawienia nowego hasła z tokenem.
  - `/employee-schedule-settings.astro` – konfiguracja godzin pracy (tylko dla zalogowanych pracowników).
    - SSR: chroniona ścieżka, dostępna tylko dla użytkowników z rolą `employee`.
    - Wykorzystuje React w komponencie `ScheduleSettings.tsx` do przeglądu i edycji godzin pracy.
  - Pozostałe strony (np. publiczne Contact, About) pozostają bez zmian.

### 1.2 Komponenty React

- Formularze interaktywne (`src/components/auth`):
  - `RegisterForm.tsx`
  - `LoginForm.tsx` (parametr `role`: pacjent/pracownik)
  - `ResetPasswordForm.tsx`
  - `UpdatePasswordForm.tsx`
- Komponenty dla konfiguracji godzin pracy (`src/components/employee`):
  - `ScheduleSettings.tsx` – komponent do przeglądu i edycji zakresów godzin pracy (pełne godziny).
- Elementy wspólne:
  - `AuthHeader.tsx` – nagłówek w trybie auth.
  - `UserMenu.tsx` – dropdown z linkami do panelu i wylogowania.
- Stylowanie: Tailwind + Shadcn/ui (`Input`, `Button`, `Alert`).

### 1.3 Podział odpowiedzialności

- Astro Pages:
  - SSR, wybór layoutu, przekazywanie `session` do komponentów React.
  - Logika przekierowań: np. jeśli użytkownik jest już zalogowany, wejście na `/login` lub `/register` powoduje redirect do dashboardu.
- Komponenty React:
  - Walidacja client-side (biblioteka `zod` lub inna), zarządzanie stanem formularzy.
  - Wywoływanie API (`fetch` POST na `/api/auth/...`) i obsługa odpowiedzi.
  - Wyświetlanie błędów i success message.

### 1.4 Walidacja i komunikaty błędów

- Rejestracja:
  - Pola: imię, nazwisko (min. 2 znaki), email (RFC), telefon (regex), data urodzenia (≥18 lat), hasło (min. 8 znaków, 1 cyfra, 1 znak specjalny).
  - Komunikaty inline pod polami i globalne alerty dla błędów z serwera (np. email już istnieje).
- Logowanie:
  - Pola: email i hasło obowiązkowe.
  - Błąd 401 → toast "Nieprawidłowy e-mail lub hasło".
- Reset hasła:
  - Email obowiązkowy.
  - Po wysłaniu: informacja "Sprawdź skrzynkę pocztową".
- Ustawienie nowego hasła:
  - Hasło i potwierdzenie, zasady jak przy rejestracji.
  - Token wygasły → redirect na `/reset-password` z komunikatem.

## 2. Logika backendowa

### 2.1 Endpointy API i modele danych

Folder: `src/pages/api/auth`

- `register.ts` (POST /api/auth/register)
- `login.ts` (POST /api/auth/login)
- `logout.ts` (POST /api/auth/logout)
- `reset-password.ts` (POST /api/auth/reset-password)
- `update-password.ts` (POST /api/auth/update-password)

Modele DTO (`src/types.ts`):

```ts
interface RegistrationDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  password: string;
}
interface LoginDTO {
  email: string;
  password: string;
  role: "patient" | "employee";
}
interface ResetPasswordDTO {
  email: string;
}
interface UpdatePasswordDTO {
  token: string;
  newPassword: string;
}
```

**Uwaga:** Endpoint rejestracji automatycznie przypisuje `role: 'patient'` w metadanych użytkownika. Konta pracowników tworzone są ręcznie przez administratora (Supabase).

### 2.2 Walidacja danych wejściowych

- Schematy `zod` w `src/lib/schemas/auth.ts`.
- Middleware walidacyjne `src/lib/middleware/validation.ts`.
- Nieudana walidacja → HTTP 400 + `{ error: string, field?: string }`.

### 2.3 Obsługa wyjątków

- `try/catch` w handlerach.
- Mapowanie błędów Supabase na kody: 401 (nieautoryzowany), 409 (konflikt), 500 (serwer).
- Logowanie błędów w konsoli / zewnętrznym syslog.

### 2.4 SSR i middleware

- `src/middleware/index.ts`:
  - Parsowanie ciasteczek `supabase-auth-token` i `supabase-refresh-token`.
  - Ustawienie `request.locals.session`.
  - Redirect dla chronionych stron.
- W `astro.config.mjs`:

```js
export default {
  server: {
    middleware: ["src/middleware/index.ts"],
  },
};
```

### 2.1.1 Konfiguracja godzin pracy

Folder: `src/pages/api/schedule`

- `get.ts` (GET /api/schedule) – zwraca listę zakresów godzin pracy dla zalogowanego pracownika.
- `update.ts` (POST /api/schedule) – zapisuje nowe zakresy godzin pracy zgodnie z dostarczonymi danymi.

Modele DTO (`src/types.ts`):

```ts
interface WorkHourDTO {
  dayOfWeek: number; // 0 (niedziela) – 6 (sobota)
  startHour: string; // format "HH:MM", pełne godziny
  endHour: string; // format "HH:MM", pełne godziny
}
```

## 3. System uwierzytelniania

### 3.1 Konfiguracja Supabase Auth

- Zmienne środowiskowe: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Klient w `src/db/supabaseClient.ts`:

```ts
import { createBrowserClient, createServerClient } from '@supabase/auth-helpers';
export const supabase = /* inicjalizacja */;
```

### 3.2 Rejestracja

- `await supabase.auth.signUp({ email, password }, { data: { firstName, lastName, phone, birthDate } })`.
- Obsługa email verification (opcjonalnie w MVP).

### 3.3 Logowanie

- `await supabase.auth.signInWithPassword({ email, password })`.
- Zapis tokenów w ciasteczkach HttpOnly, Secure.
- Po pomyślnym logowaniu sprawdzamy `session.user.user_metadata.role === role`; w razie niezgodności zwracamy HTTP 403 (Brak dostępu).

### 3.4 Wylogowywanie

- `await supabase.auth.signOut()` + usunięcie ciasteczek.

### 3.5 Resetowanie hasła

- `await supabase.auth.resetPasswordForEmail(email, { redirectTo: '/update-password' })`.
- Link w e-mailu prowadzi do `/update-password?token=...`.

### 3.6 Aktualizacja hasła

- `await supabase.auth.updateUser({ password: newPassword })` – wykonane w API po zweryfikowanym tokenie.

### 3.7 Bezpieczeństwo i sesja

- Ciasteczka: HttpOnly, Secure, SameSite=Lax.
- Ochrona CSRF na endpointach mutujących.
- Tokeny odświeżane automatycznie przez Supabase SDK.

---

Powyższa specyfikacja stanowi kompletną podstawę do implementacji modułu uwierzytelniania użytkowników, zgodnie z wymaganiami PRD i zachowaniem spójności ze strukturą oraz stackiem istniejącej aplikacji.
