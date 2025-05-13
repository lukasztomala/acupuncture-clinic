# API Endpoint Implementation Plan: DELETE /work-schedule/{id}

## 1. Przegląd punktu końcowego

Usuwa wpis z planu pracy o wskazanym `id` dla pracownika.

## 2. Szczegóły żądania

- Metoda HTTP: DELETE
- URL: `/work-schedule/{id}`
- Nagłówek: `Authorization: Bearer <token>`
- Path parametry:
  - `id` (UUID) – identyfikator wpisu

## 3. Szczegóły odpowiedzi

- 204 No Content: pomyślnie usunięto
- 400 Bad Request: nieprawidłowe `id`
- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: brak roli worker
- 404 Not Found: wpis nie istnieje
- 500 Internal Server Error: błąd serwera

## 4. Przepływ danych

1. Middleware autoryzuje JWT.
2. Weryfikacja `user.role === 'worker'`.
3. Walidacja `id` w Zod.
4. `WorkScheduleService.delete(id, user.id)`:
   - SELECT istniejącego wpisu.
   - Sprawdzenie własności (`created_by`).
   - DELETE rekordu.
5. Zwrócenie 204.

## 5. Względy bezpieczeństwa

- Tylko rola worker.
- RLS lub guard.

## 6. Obsługa błędów

- 400: ZodValidationError.
- 401: brak lub nieprawidłowy token.
- 403: brak roli.
- 404: wpis nie istnieje.
- 500: wyjątki.

## 7. Wydajność

- Simple DELETE; indeks PK.

## 8. Kroki implementacji

1. Zdefiniować schema dla `id` w `src/lib/schemas/work-schedule.schema.ts`.
2. Implementować `delete` w `src/lib/services/work-schedule.service.ts`.
3. Utworzyć handler DELETE w `src/pages/api/work-schedule/[id].ts`.
