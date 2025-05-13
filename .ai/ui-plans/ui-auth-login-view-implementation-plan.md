# Plan implementacji widoku Logowanie

## 1. Przegląd

Widok Logowanie umożliwia pacjentowi wprowadzenie danych uwierzytelniających (e-mail, hasło) w celu uzyskania dostępu do panelu pacjenta. Po poprawnym zalogowaniu następuje przekierowanie do `/patient/dashboard`.

## 2. Routing widoku

Ścieżka: `/login` (plik: `src/pages/login.tsx` lub `login.astro` z komponentem React)

## 3. Struktura komponentów

- LoginPage
  - AuthLayout (opcjonalny wspólny wrapper)
    - LoginForm

## 4. Szczegóły komponentów

### LoginPage

- Opis: Strona zawierająca formularz logowania.
- Główne elementy: `AuthLayout`, `LoginForm`.
- Propsy: brak.

### LoginForm

- Opis: Formularz z polami e-mail i hasła oraz przyciskiem zatwierdzenia.
- Główne elementy:
  - `<Input name="email" type="email" placeholder={t('Email')} />`
  - `<Input name="password" type="password" placeholder={t('Hasło')} />`
  - `<Button type="submit">{t('Zaloguj')}</Button>`
  - Linki: "Nie masz konta? Zarejestruj się" (`/signup`), "Zapomniałeś hasła?" (`/password-reset`)
- Obsługiwane zdarzenia:
  - `onSubmit`: wywołuje mutację `useAuthLogin`
- Walidacja:
  - email: wymagane, format e-mail
  - password: wymagane
- Typy:
  - DTO żądania: `LoginCommand`
  - DTO odpowiedzi: `LoginResponse`
- Propsy:
  - brak (formularz samodzielny)

## 5. Typy

- `interface LoginCommand { email: string; password: string }`
- `interface LoginResponse { access_token: string; refresh_token: string; expires_in: number }`

## 6. Zarządzanie stanem

- React Hook Form (`useForm<LoginCommand>`) z resolverem Zod (schemat `AuthLoginSchema`).
- Custom hook: `useAuthLogin`  do wywołania POST `/api/auth/login`.

## 7. Integracja API

- Endpoint: POST `/api/auth/login`
  - Request body: `LoginCommand`
  - Response: `LoginResponse`
- Przy sukcesie:
  - Zapis tokenów w kontekście (lub HttpOnly cookie)
  - Przekierowanie do `/patient/dashboard`

## 8. Interakcje użytkownika

1. Użytkownik wypełnia pola e-mail i hasło.
2. Kliknięcie "Zaloguj" aktywuje spinner.
3. Po powrocie odpowiedzi:
   - Sukces: redirect + toast powitalny.
   - Błąd 401: wyświetl komunikat "Nieprawidłowy e-mail lub hasło".
   - Inne błędy: globalny `ErrorAlert`.

## 9. Warunki i walidacja

- Walidacja klient-side przed submisją; pola muszą być uzupełnione.
- Zablokuj przycisk, jeśli formularz invalid lub mutacja w trakcie.

## 10. Obsługa błędów

- 401: user-friendly message pod formularzem.
- 400/500: `ErrorAlert` z komunikatem ogólnym.

## 11. Kroki implementacji

1. Utworzyć plik `src/pages/login.tsx` i zaimportować `AuthLayout` oraz `LoginForm`.
2. Zdefiniować hook `useAuthLogin` w `src/lib/hooks/useAuthLogin.ts`.
3. W `LoginForm` skonfigurować `useForm` z Zod.
4. Obsłużyć mutację `useAuthLogin` w `onSubmit` i przekierowanie.
5. Dodać spinner oraz blokadę przycisku podczas ładowania.
6. Dodać komponenty Shadcn/ui oraz przetłumaczyć stringi przez Lingui.
7. Przetestować scenariusze sukcesu i błędów.
