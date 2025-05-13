# Plan implementacji widoku Reset hasła

## 1. Przegląd

Widok Reset hasła umożliwia pacjentowi zainicjowanie procesu odzyskiwania hasła poprzez podanie swojego adresu e-mail. Po wysłaniu żądania wyświetlane jest potwierdzenie wysłania linku resetującego.

## 2. Routing widoku

Ścieżka: `/password-reset` (plik: `src/pages/password-reset.tsx` lub `password-reset.astro`)

## 3. Struktura komponentów

- PasswordResetPage
  - AuthLayout (opcjonalny wspólny wrapper)
    - PasswordResetForm

## 4. Szczegóły komponentów

### PasswordResetPage

- Opis: Strona zawierająca formularz do wprowadzenia e-maila i wysłania żądania resetu.
- Główne elementy: `AuthLayout`, `PasswordResetForm`.
- Propsy: brak.

### PasswordResetForm

- Opis: Formularz z polem e-mail oraz przyciskiem do wysłania żądania.
- Główne elementy:
  - `<Input name="email" type="email" placeholder={t('Email')} />`
  - `<Button type="submit">{t('Wyślij link')}</Button>`
- Obsługiwane zdarzenia:
  - `onSubmit`: wywołuje mutację `useAuthPasswordReset`
- Walidacja:
  - email: wymagane, format e-mail
- Typy:
  - DTO żądania: `PasswordResetCommand`
  - Response: brak (tylko message)
- Propsy:
  - brak (formularz samodzielny)

## 5. Typy

- `interface PasswordResetCommand { email: string }`

## 6. Zarządzanie stanem

- React Hook Form (`useForm<PasswordResetCommand>`) z resolverem Zod (`AuthPasswordResetSchema`).
- Custom hook: `useAuthPasswordReset`  do wywołania POST `/api/auth/password-reset`.

## 7. Integracja API

- Endpoint: POST `/api/auth/password-reset`
  - Request body: `PasswordResetCommand`
- Przy sukcesie:
  - Wyświetlenie toast/info message "Link wysłany na adres e-mail".

## 8. Interakcje użytkownika

1. Użytkownik wpisuje adres e-mail.
2. Kliknięcie "Wyślij link" aktywuje spinner.
3. Po powrocie odpowiedzi:
   - Sukces (200): pokaz modal lub toast `t('Link wysłany')`.
   - Błąd 404: `t('Email nie znaleziony')`.
   - Błąd 429: `t('Zbyt wiele żądań, spróbuj później')`.
   - Inne błędy: `ErrorAlert`.

## 9. Warunki i walidacja

- Walidacja klient-side: pole wymagane, format e-mail.
- Zablokuj przycisk, jeśli formularz invalid lub mutacja w trakcie.

## 10. Obsługa błędów

- 404: komunikat pod polem.
- 429: komunikat globalny.
- 500: `ErrorAlert`.

## 11. Kroki implementacji

1. Utworzyć plik `src/pages/password-reset.tsx` i zaimportować `AuthLayout` oraz `PasswordResetForm`.
2. Zdefiniować hook `useAuthPasswordReset` w `src/lib/hooks/useAuthPasswordReset.ts`.
3. W `PasswordResetForm` skonfigurować `useForm` z Zod.
4. Obsłużyć mutację `useAuthPasswordReset` w `onSubmit`.
5. Dodać spinner oraz blokadę przycisku.
6. Dodać toast/modal potwierdzający sukces.
7. Przetłumaczyć wszystkie stringi przez Lingui.
