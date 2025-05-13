# Plan implementacji widoku Rejestracja

## 1. Przegląd

Widok Rejestracja umożliwia pacjentowi utworzenie konta poprzez podanie imienia, nazwiska, e-maila, telefonu, daty urodzenia oraz hasła. Po poprawnej rejestracji następuje automatyczne zalogowanie i przekierowanie do `/patient/dashboard`.

## 2. Routing widoku

Ścieżka: `/signup` (plik: `src/pages/signup.tsx` lub `signup.astro` z komponentem React)

## 3. Struktura komponentów

- SignupPage
  - Navbar
  - SignupForm
  - Footer

## 4. Szczegóły komponentów

### SignupPage

- Opis: Strona zawierająca formularz rejestracji.
- Główne elementy: `Navbar`, `SignupForm`, `Footer`.
- Propsy: brak.

### SignupForm

- Opis: Formularz z polami wymaganymi do utworzenia konta.
- Główne elementy:
  - `<Input name="first_name" placeholder={t('Imię')} />`
  - `<Input name="last_name" placeholder={t('Nazwisko')} />`
  - `<Input name="email" type="email" placeholder={t('Email')} />`
  - `<Input name="phone" type="tel" placeholder={t('Telefon')} />`
  - `<DateInput name="date_of_birth" placeholder={t('Data urodzenia')} />`
  - `<Input name="password" type="password" placeholder={t('Hasło')} />`
  - `<Button type="submit">{t('Zarejestruj się')}</Button>`
- Obsługiwane zdarzenia:
  - `onSubmit`: wywołuje mutację `useAuthSignup`
- Walidacja:
  - first_name, last_name: wymagane
  - email: wymagane, format e-mail
  - phone: wymagane, pattern cyfr, min długość 9
  - date_of_birth: wymagane, wiek ≥18 lat
  - password: wymagane, min długość (np. 8)
- Typy:
  - DTO żądania: `SignupCommand`
  - DTO odpowiedzi: `SignupResponse`
- Propsy:
  - brak (formularz samodzielny)

### Navbar

- Opis: Górna nawigacja aplikacji, zawiera logo i linki do głównych stron.
- Propsy: brak.

### Footer

- Opis: Stopka aplikacji, zawiera informacje o prawach autorskich i linki pomocnicze.
- Propsy: brak.

## 5. Typy

- `interface SignupCommand { email: string; password: string; first_name: string; last_name: string; phone: string; date_of_birth: string; }`
- `interface SignupResponse { user_id: string; email: string; first_name: string; last_name: string; }`

## 6. Zarządzanie stanem

- React Hook Form (`useForm<SignupCommand>`) z resolverem Zod (schemat `AuthSignupSchema`).
- Custom hook: `useAuthSignup`  do wywołania POST `/api/auth/signup`.

## 7. Integracja API

- Endpoint: POST `/api/auth/signup`
  - Request body: `SignupCommand`
  - Response: `SignupResponse`
- Przy sukcesie:
  - Zapis tokenów i utworzonego profilu w kontekście
  - Przekierowanie do `/patient/dashboard`

## 8. Interakcje użytkownika

1. Użytkownik wypełnia wszystkie pola formularza.
2. Kliknięcie "Zarejestruj się" aktywuje spinner.
3. Po powrocie odpowiedzi:
   - Sukces: redirect + toast powitalny.
   - Błąd 400: wyświetlenie walidacji pól
   - Błąd 409: komunikat "Email już istnieje"
   - Inne błędy: globalny `ErrorAlert`.

## 9. Warunki i walidacja

- Walidacja klient-side przed submisją; pola muszą być uzupełnione i poprawne.
- Sprawdzenie daty urodzenia (≥18 lat) w resolverze.
- Zablokuj przycisk, jeśli formularz invalid lub mutacja w trakcie.

## 10. Obsługa błędów

- 400: wyświetl błędy walidacji Zod przy odpowiednich polach.
- 409: wyświetl komunikat "Email już istnieje".
- 500: `ErrorAlert` z komunikatem ogólnym.

## 11. Kroki implementacji

1. Utworzyć plik `src/pages/signup.tsx` i zaimportować `Navbar`, `SignupForm` oraz `Footer`.
2. Utworzyć komponent `Navbar` w `src/components/Navbar.tsx`.
3. Utworzyć komponent `Footer` w `src/components/Footer.tsx`.
4. Zdefiniować hook `useAuthSignup` w `src/lib/hooks/useAuthSignup.ts`.
5. W `SignupForm` skonfigurować `useForm` z Zod.
6. Obsłużyć mutację `useAuthSignup` w `onSubmit` i przekierowanie.
7. Dodać spinner oraz blokadę przycisku podczas ładowania.
8. Dodać komponent `DateInput` i wzory walidacji.
9. Przetłumaczyć wszystkie stringi przez Lingui.
10. Przetestować scenariusze sukcesu i błędów.
