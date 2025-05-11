# API Endpoint Implementation Plan: POST /visits/{visit_id}/notes

## 1. Przegląd punktu końcowego

Pozwala pracownikowi dodać nową notatkę do określonej wizyty.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- URL: `/visits/{visit_id}/notes`
- Nagłówek: `Authorization: Bearer <token>`
- Path parametry:
  - `visit_id` (UUID) – identyfikator wizyty
- Body (JSON):

```json
NoteCreateCommand
// { content: string }
```

## 3. Szczegóły odpowiedzi

- 201 Created

```json
NoteDTO
```

- 400 Bad Request: błędy walidacji (Zod)
- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: użytkownik nie jest pracownikiem
- 404 Not Found: wizyta nie istnieje
- 500 Internal Server Error: błąd serwera

## 4. Przepływ danych

1. Middleware autoryzuje JWT.
2. Weryfikacja `user.role === 'worker'`.
3. Walidacja `visit_id` i body przez Zod (`NoteCreateCommand`).
4. `NoteService.create(visit_id, user.id, payload)`:
   - INSERT do `notes`, ustawienie `author_id = user.id`, `patient_id` z wizyty.
5. Zwrócenie utworzonego `NoteDTO`.

## 5. Względy bezpieczeństwa

- Worker-only.
- RLS na `notes`.

## 6. Obsługa błędów

- 400: ZodValidationError.
- 401: brak tokenu.
- 403: brak roli.
- 404: brak wizyty.
- 500: wyjątki.

## 7. Wydajność

- Indeks na `notes.visit_id`.

## 8. Kroki implementacji

1. Zdefiniować `NoteCreateCommand` w `src/lib/schemas/note.schema.ts`.
2. Implementować `create` w `src/lib/services/note.service.ts`.
3. Utworzyć `src/pages/api/visits/[visit_id]/notes.ts` z handlerem POST.
