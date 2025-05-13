# API Endpoint Implementation Plan: POST /auth/signup

## 1. Przegląd punktu końcowego

Rejestracja nowego konta pacjenta. Punkt końcowy umożliwia założenie konta w systemie, waliduje wiek (>=18 lat) i tworzy rekordy w Supabase Auth oraz w tabeli `profiles`.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Ścieżka: `/auth/signup`
- Autoryzacja: brak (public endpoint)
- Request Body (JSON):
  - `email` (string, wymagane)
  - `password` (string, wymagane)
  - `first_name` (string, wymagane)
  - `last_name` (string, wymagane)
  - `phone` (string, wymagane)
  - `date_of_birth` (string, format `YYYY-MM-DD`, wymagane)

## 3. Wykorzystywane typy

- `SignupCommand` – definicja payload z `src/types.ts`
- `SignupResponse` – odpowiedź zwracana przy statusie 201
- Zod schema: `AuthSignupSchema` (weryfikacja typów i reguły wieku)

## 4. Szczegóły odpowiedzi

- 201 Created
  ```json
  {
    "user_id": "uuid",
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  }
  ```
- 400 Bad Request: błędy walidacji (np. niepoprawny format, wiek <18)
- 409 Conflict: e-mail już istnieje
- 500 Internal Server Error: niespodziewany błąd serwera

## 5. Przepływ danych

1. Otrzymanie i parsowanie `SignupCommand`
2. Walidacja wejścia za pomocą Zod (`AuthSignupSchema`):
   - wszystkie pola obecne i poprawne typy
   - obliczenie wieku z `date_of_birth` i sprawdzenie, czy >=18
3. Wywołanie Supabase Auth SDK: `supabase.auth.signUp({ email, password })`
4. Przy sukcesie:
   - Wyciągnięcie `user.id` z odpowiedzi Auth
   - Wstawienie rekordu do tabeli `profiles` z wartościami z payload oraz przypisaniem roli `role_patient`
5. Sformułowanie `SignupResponse` i zwrócenie 201

## 6. Względy bezpieczeństwa

- Publiczny endpoint, nie wymaga tokena
- Rate limiting na poziomie Astro middleware (np. 10 żądań na IP na minutę)
- Unikać ujawniania szczegółów przy błędach (send generic message)
- RLS w `profiles` nie ma tu zastosowania (INSERT wyłącznie z backendu)

## 7. Obsługa błędów

| Scenariusz                       | Kod | Opis                                    |
| -------------------------------- | --- | --------------------------------------- |
| Nieprawidłowy payload            | 400 | Zod: brak pola, zły format lub wiek <18 |
| E-mail już istnieje              | 409 | Supabase zwróci kod duplikacji          |
| Błąd zapisu do tabeli `profiles` | 500 | Niespodziewany błąd DB                  |
| Inny błąd w Supabase Auth        | 500 | Niespodziewany błąd Auth                |

## 8. Rozważania dotyczące wydajności

- Jedno wywołanie Auth i jedno do tabeli `profiles` – minimalne opóźnienie
- Możliwość asynchronicznego wysłania e-maila powitalnego w tle

## 9. Kroki implementacji

1. W `src/lib/validators/auth.ts` zdefiniować Zod schema `AuthSignupSchema`.
2. W `src/lib/services/auth.ts` dodać funkcję `signup(command: SignupCommand)`:
   - walidacja przez `AuthSignupSchema`
   - wywołanie Supabase Auth i `profiles` insert
3. W `src/pages/api/auth/signup.ts` zdefiniować handler API:
   - `export const POST` z `prerender = false`
   - parsowanie JSON, wywołanie `AuthService.signup`
   - obsługa błędów i zwrócenie odpowiedniego statusu
4. Skonfigurować middleware rate limiting w `src/middleware/index.ts`
