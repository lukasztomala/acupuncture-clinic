# API Endpoint Implementation Plan: POST /auth/login

## 1. Przegląd punktu końcowego

Logowanie użytkownika (pacjenta lub pracownika) i pobranie tokenów JWT.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Ścieżka: `/auth/login`
- Autoryzacja: brak (public endpoint)
- Request Body (JSON):
  - `email` (string, wymagane)
  - `password` (string, wymagane)

## 3. Wykorzystywane typy

- `LoginCommand` – definicja payload z `src/types.ts`
- `LoginResponse` – odpowiedź zwracana przy statusie 200
- Zod schema: `AuthLoginSchema` (validacja typu i formatu email/password)

## 4. Szczegóły odpowiedzi

- 200 OK
  ```json
  {
    "access_token": "string",
    "refresh_token": "string",
    "expires_in": 3600
  }
  ```
- 400 Bad Request: błędy walidacji formatów
- 401 Unauthorized: niepoprawne dane logowania
- 500 Internal Server Error: niespodziewany błąd serwera

## 5. Przepływ danych

1. Parsowanie i walidacja `LoginCommand` przez Zod (`AuthLoginSchema`).
2. Wywołanie `supabase.auth.signInWithPassword({ email, password })`.
3. Jeśli sukces, zwrócenie `access_token`, `refresh_token`, `expires_in`.
4. Jeśli błąd uwierzytelnienia (403 kod Supabase), zwrócenie 401 Unauthorized.

## 6. Względy bezpieczeństwa

- Brak wrażliwych informacji w odpowiedzi (zwraca tylko tokeny).
- Rate limiting (np. 5 prób na IP na minutę) w middleware.
- Ograniczenie ujawniania szczegółów błędu logowania.

## 7. Obsługa błędów

| Scenariusz                  | Kod | Opis                                  |
| --------------------------- | --- | ------------------------------------- |
| Nieprawidłowy payload       | 400 | Zod: brak pola lub zły format         |
| Zła para email/password     | 401 | Supabase zwraca błąd uwierzytelnienia |
| Błąd wewnętrzny Auth lub DB | 500 | Niespodziewany błąd serwera           |

## 8. Rozważania dotyczące wydajności

- Minimalne zapytanie do Supabase.
- Możliwość cachowania niektórych informacji o sesji.

## 9. Kroki implementacji

1. W `src/lib/validators/auth.ts` dodać `AuthLoginSchema`.
2. W `src/lib/services/auth.ts` implementować `login(command: LoginCommand)`:
   - walidacja przez `AuthLoginSchema`
   - wywołanie `supabase.auth.signInWithPassword`
3. W `src/pages/api/auth/login.ts` zdefiniować handler:
   - `export const POST` z `prerender = false`
   - parsowanie JSON, wywołanie `AuthService.login`
   - obsługa i mapowanie błędów na odpowiednie statusy
4. Zaimplementować rate limiting w `src/middleware/index.ts`
