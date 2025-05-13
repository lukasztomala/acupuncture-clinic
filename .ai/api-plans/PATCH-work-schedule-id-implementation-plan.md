# API Endpoint Implementation Plan: PATCH /work-schedule/{id}

## 1. Przegląd punktu końcowego

Pozwala pracownikowi edytować istniejący wpis planu pracy.

## 2. Szczegóły żądania

- Metoda HTTP: PATCH
- URL: `/work-schedule/{id}`
- Nagłówek: `Authorization: Bearer <token>`
- Path parametry:
  - `id` (UUID) – identyfikator wpisu
- Body (JSON):

```json
WorkScheduleUpdateCommand
// { day_of_week?: number, start_time?: string, end_time?: string }
```

## 3. Szczegóły odpowiedzi

- 200 OK

```json
WorkScheduleDTO
```

- 400 Bad Request: błędy walidacji (Zod) lub unikalny conflict
- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: brak roli worker
- 404 Not Found: brak wpisu
- 500 Internal Server Error: błąd serwera

## 4. Przepływ danych

1. Middleware autoryzuje JWT.
2. Weryfikacja `user.role === 'worker'`.
3. Walidacja `id` i body przez Zod (`WorkScheduleUpdateCommand`).
4. `WorkScheduleService.update(id, user.id, payload)`:
   - SELECT istniejącego wpisu.
   - Sprawdzenie własności (`created_by`).
   - UPDATE z nowymi danymi.
5. Zwrócenie zaktualizowanego `WorkScheduleDTO`.

## 5. Względy bezpieczeństwa

- Worker-only.
- RLS lub guard w kodzie.

## 6. Obsługa błędów

- 400: ZodValidationError, conflict.
- 401: brak tokenu.
- 403: brak roli.
- 404: brak wpisu.
- 500: wyjątki.

## 7. Wydajność

- Indywidualne UPDATE; indeks na PK.

## 8. Kroki implementacji

1. Zdefiniować `WorkScheduleUpdateCommand` w `src/lib/schemas/work-schedule.schema.ts`.
2. Implementować `update` w `src/lib/services/work-schedule.service.ts`.
3. Utworzyć `src/pages/api/work-schedule/[id].ts` z handlerem PATCH.
