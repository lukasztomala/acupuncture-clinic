# API Endpoint Implementation Plan: GET /visits/{visit_id}/notes

## 1. Przegląd punktu końcowego

Zwraca listę notatek przypisanych do konkretnej wizyty, dostępna tylko dla pracowników.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- URL: `/visits/{visit_id}/notes`
- Nagłówek: `Authorization: Bearer <token>`
- Path parametry:
  - `visit_id` (UUID) – identyfikator wizyty

## 3. Szczegóły odpowiedzi

- 200 OK

```json
NoteDTO[]
```

- 400 Bad Request: nieprawidłowy `visit_id`
- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: użytkownik nie jest pracownikiem
- 404 Not Found: wizyta lub notatki nie istnieją
- 500 Internal Server Error: błąd serwera

## 4. Przepływ danych

1. Middleware autoryzuje JWT.
2. Weryfikacja `user.role === 'worker'`.
3. Walidacja `visit_id` przez Zod.
4. `NoteService.listByVisit(visit_id)`:
   - SELECT \* FROM `notes` WHERE `visit_id` = visit_id.
5. Zwrócenie tablicy `NoteDTO`.

## 5. Względy bezpieczeństwa

- Tylko rola worker.
- RLS na `notes` (policy `worker_notes`).

## 6. Obsługa błędów

- 400: ZodValidationError.
- 401: brak tokenu.
- 403: brak roli.
- 404: wizyta lub notatki nie istnieją.
- 500: wyjątki.

## 7. Wydajność

- Indeks na `notes.visit_id`.

## 8. Kroki implementacji

1. Zdefiniować Zod schema dla `visit_id` w `src/lib/schemas/note.schema.ts`.
2. Implementować `listByVisit` w `src/lib/services/note.service.ts`.
3. Utworzyć plik `src/pages/api/visits/[visit_id]/notes.ts` z handlerem GET.
