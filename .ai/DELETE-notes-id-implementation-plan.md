# API Endpoint Implementation Plan: DELETE /notes/{id}

## 1. Przegląd punktu końcowego

Usuwa notatkę o danym `id`, dostępna tylko dla pracowników.

## 2. Szczegóły żądania

- Metoda HTTP: DELETE
- URL: `/notes/{id}`
- Nagłówek: `Authorization: Bearer <token>`
- Path parametry:
  - `id` (UUID) – identyfikator notatki

## 3. Szczegóły odpowiedzi

- 204 No Content: pomyślnie usunięto
- 400 Bad Request: nieprawidłowe `id`
- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: użytkownik nie jest pracownikiem
- 404 Not Found: notatka nie istnieje
- 500 Internal Server Error: błąd serwera

## 4. Przepływ danych

1. Middleware autoryzuje JWT.
2. Weryfikacja `user.role === 'worker'`.
3. Walidacja `id` w Zod.
4. `NoteService.delete(id, user.id)`:
   - SELECT istniejącej notatki.
   - DELETE rekordu.
5. Zwrócenie 204.

## 5. Względy bezpieczeństwa

- Worker-only.
- RLS na `notes`.

## 6. Obsługa błędów

- 400: ZodValidationError.
- 401: brak tokenu.
- 403: brak roli.
- 404: notatka nie istnieje.
- 500: wyjątki.

## 7. Wydajność

- Single-row delete; indeks PK.

## 8. Kroki implementacji

1. Zdefiniować schema dla `id` w `src/lib/schemas/note.schema.ts`.
2. Implementować `delete` w `src/lib/services/note.service.ts`.
3. Utworzyć `src/pages/api/notes/[id].ts` z handlerem DELETE.
