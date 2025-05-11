# API Endpoint Implementation Plan: GET /visits/{id}

## 1. Przegląd punktu końcowego

Pobiera szczegóły pojedynczej wizyty na podstawie jej `id` dla zalogowanego użytkownika (pacjent: własna wizyta; pracownik: dowolna).

## 2. Szczegóły żądania

- Metoda HTTP: GET
- URL: `/visits/{id}`
- Nagłówek: `Authorization: Bearer <token>`
- Path parametry:
  - `id` (UUID) – identyfikator wizyty

## 3. Szczegóły odpowiedzi

- 200 OK

```json
VisitDTO
```

- 400 Bad Request: nieprawidłowy `id`
- 401 Unauthorized: brak lub nieprawidłowy token
- 403 Forbidden: brak uprawnień do tej wizyty
- 404 Not Found: wizyta o podanym `id` nie istnieje
- 500 Internal Server Error: nieoczekiwany błąd serwera

## 4. Przepływ danych

1. Middleware autoryzuje JWT, ustawia `context.locals.user`.
2. Walidacja `id` (UUID) przez Zod w `visit.schema.ts`.
3. `VisitService.getById(id, user)`:
   - Zapytanie SELECT z uwzględnieniem RLS.
   - Weryfikacja, czy pacjent = `user.id` lub `user.role === 'worker'`.
4. Zwrócenie obiektu `VisitDTO`.

## 5. Względy bezpieczeństwa

- RLS na tabeli `visits` (policy `patient_visits`, `worker_visits`).
- Dodatkowa weryfikacja właściciela rekordu lub roli `worker`.

## 6. Obsługa błędów

- 400: ZodValidationError → szczegóły błędów walidacji.
- 401: brak/nieprawidłowy token.
- 403: brak uprawnień.
- 404: brak wizyty.
- 500: wyjątki DB lub wewnętrzne.

## 7. Wydajność

- Single-row lookup z indeksem na PK `visits.id`.

## 8. Kroki implementacji

1. Zdefiniować Zod schema dla parametru `id` w `src/lib/schemas/visit.schema.ts`.
2. Dodać metodę `getById` w `src/lib/services/visit.service.ts`.
3. Utworzyć plik `src/pages/api/visits/[id].ts` z handlerem GET.
