# API Endpoint Implementation Plan: POST /auth/password-reset

## 1. Przegląd punktu końcowego

Wysłanie linku resetującego hasło do użytkownika na podstawie podanego adresu e-mail.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Ścieżka: `/auth/password-reset`
- Autoryzacja: brak (public endpoint)
- Request Body (JSON):
  - `email` (string, wymagane)

## 3. Wykorzystywane typy

- `PasswordResetCommand` – definicja payload z `src/types.ts`
- Brak specyficznego DTO odpowiedzi (204 No Content lub informacja o wysłaniu e-maila)
- Zod schema: `AuthPasswordResetSchema` (weryfikacja formatu email)

## 4. Szczegóły odpowiedzi

- 200 OK (email wysłany pomyślnie)
- 404 Not Found: brak konta o podanym e-mailu
- 500 Internal Server Error: niespodziewany błąd serwera

## 5. Przepływ danych

1. Parsowanie `PasswordResetCommand` i walidacja przez Zod (`AuthPasswordResetSchema`).
2. Wywołanie `supabase.auth.resetPasswordForEmail(email)`.
3. Jeśli e-mail nie istnieje, zwrócenie 404.
4. Jeśli sukces, zwrócenie 200 OK.

## 6. Względy bezpieczeństwa

- Nie ujawniać czy e-mail istnieje (opcjonalnie: zawsze zwracać 200 aby unikać wycieku informacji o istnieniu konta).
- Rate limiting (np. 3 na IP na godzinę).

## 7. Obsługa błędów

| Scenariusz                   | Kod | Opis                        |
| ---------------------------- | --- | --------------------------- |
| Nieprawidłowy format e-mail  | 400 | Zod: błędny format          |
| Brak konta o podanym e-mailu | 404 | Brak rekordu w Supabase     |
| Błąd wewnętrzny Auth lub DB  | 500 | Niespodziewany błąd serwera |

## 8. Rozważania dotyczące wydajności

- Pojedyncze wywołanie do Supabase Auth SDK.

## 9. Kroki implementacji

1. W `src/lib/validators/auth.ts` dodać `AuthPasswordResetSchema`.
2. W `src/lib/services/auth.ts` dodać `passwordReset(command: PasswordResetCommand)`:
   - walidacja przez `AuthPasswordResetSchema`
   - wywołanie `supabase.auth.resetPasswordForEmail`
   - mapowanie błędów na odpowiednie HTTP statusy
3. W `src/pages/api/auth/password-reset.ts` zdefiniować handler:
   - `export const POST` z `prerender = false`
   - parsowanie JSON, wywołanie `AuthService.passwordReset`
   - obsługa błędów i odpowiedzi
4. Zaimplementować rate limiting w `src/middleware/index.ts`
