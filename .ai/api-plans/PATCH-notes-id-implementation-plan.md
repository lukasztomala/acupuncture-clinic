# API Endpoint Implementation Plan: PATCH /notes/{id}

## 1. Przegląd punktu końcowego

Pozwala pracownikowi zaktualizować treść istniejącej notatki.

## 2. Szczegóły żądania

- Metoda HTTP: PATCH
- URL: `/notes/{id}`
- Nagłówek: `Authorization: Bearer <token>`
- Path parametry:
  - `id` (UUID) – identyfikator notatki
- Body (JSON):

```json
NoteUpdateCommand
// { content: string }
```

## 3. Szczegóły odpowiedzi

- 200 OK

```json
NoteDTO
```

- 400 Bad Request: błędy walidacji (Zod)
- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: użytkownik nie jest pracownikiem
- 404 Not Found: notatka nie istnieje
- 500 Internal Server Error: błąd serwera

## 4. Przepływ danych

1. Middleware autoryzuje JWT.
2. Weryfikacja `user.role === 'worker'`.
3. Walidacja `id` i body przez Zod (`NoteUpdateCommand`).
4. `NoteService.update(id, user.id, payload)`:
   - SELECT istniejącej notatki.
   - Sprawdzenie uprawnień (autor lub rola worker).
   - UPDATE `content`.
5. Zwrócenie zaktualizowanego `NoteDTO`.

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

- Single-row update; indeks PK.

## 8. Kroki implementacji

1. Zdefiniować `NoteUpdateCommand` w `src/lib/schemas/note.schema.ts`.
2. Implementować `update` w `src/lib/services/note.service.ts`.
3. Utworzyć `src/pages/api/notes/[id].ts` z handlerem PATCH.
