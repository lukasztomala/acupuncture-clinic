# API Endpoint Implementation Plan: GET /visits

## 1. Przegląd punktu końcowego

Pobiera paginowaną listę wizyt dla zalogowanego użytkownika: pacjent otrzymuje własne wizyty, a pracownik widzi wszystkie.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- URL: `/visits`
- Nagłówek: `Authorization: Bearer <token>`
- Parametry zapytania:
  - `page?` (number, domyślnie 1)
  - `limit?` (number, domyślnie 20)
  - `sort_by?` (string, tylko `'start_time'`)
  - `status?` (Enums<'status_enum'>)

## 3. Szczegóły odpowiedzi

- 200 OK

```json
{
  "data": VisitDTO[],
  "meta": {
    "total": number,
    "page": number,
    "limit": number
  }
}
```

- 400 Bad Request: nieprawidłowe parametry
- 401 Unauthorized: brak lub nieprawidłowy token
- 500 Internal Server Error: nieoczekiwany błąd serwera

## 4. Przepływ danych

1. Middleware w `src/middleware/index.ts` uwierzytelnia JWT, ustawia `context.locals.user`.
2. Handler w `src/pages/api/visits.ts` parsuje i waliduje query przy użyciu Zod (`VisitListQueryParams`).
3. `VisitService.list(params, user)`:
   - Buduje zapytanie do Supabase z filtrami, paginacją i sortowaniem.
   - Wykonuje `.select()` z uwzględnieniem RLS.
4. Wynik zwracany jest jako `VisitListResponse`.

## 5. Względy bezpieczeństwa

- RLS w tabeli `visits` (policy `patient_visits` oraz `worker_visits`).
- W kodzie dodatkowa weryfikacja roli (`user.role`) i `patient_id`.

## 6. Obsługa błędów

- 400: ZodValidationError → odpowiedź z listą błędów.
- 401: brak/nieprawidłowy token → `return Response.status(401)`.
- 500: wyjątki po stronie DB lub wewnętrzne → `return Response.status(500)`.

## 7. Wydajność

- Indeksy B-tree na `visits.start_time`, `visits.status`.
- GiST na tsrange(`start_time`, `end_time`) w zapytaniach wykluczających.
- Ograniczenie liczby rekordów przez paginację.

## 8. Kroki implementacji

1. Zdefiniować Zod schema `VisitListQueryParams` w `src/lib/schemas/visit.schema.ts`.
2. Implementować metodę `list` w `src/lib/services/visit.service.ts`, używając `context.locals.supabase`.
3. Utworzyć plik `src/pages/api/visits.ts` z handlerem GET, łącząc walidację i serwis.
