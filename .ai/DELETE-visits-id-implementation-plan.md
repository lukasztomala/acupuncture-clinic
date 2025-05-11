# API Endpoint Implementation Plan: DELETE /visits/{id}

## 1. Przegląd punktu końcowego

Usuwa (anuluje) wizytę o danym `id`. Pacjent może anulować własną wizytę, jeśli pozostało co najmniej 24h. Pracownik może anulować dowolną wizytę bez ograniczeń czasowych.

## 2. Szczegóły żądania

- Metoda HTTP: DELETE
- URL: `/visits/{id}`
- Nagłówek: `Authorization: Bearer <token>`
- Path parametry:
  - `id` (UUID) – identyfikator wizyty

## 3. Szczegóły odpowiedzi

- 204 No Content: pomyślnie usunięto
- 400 Bad Request: nieprawidłowy `id`
- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: pacjent próbuje anulować ≤24h przed wizytą
- 404 Not Found: brak wizyty o podanym `id`
- 500 Internal Server Error: błąd serwera

## 4. Przepływ danych

1. Middleware autoryzuje JWT, ustawia `context.locals.user`.
2. Walidacja `id` (UUID) w Zod.
3. `VisitService.delete(id, user)`:
   - Select istniejącej wizyty.
   - Jeśli `user.role === 'patient'`, sprawdzenie >24h.
   - Usunięcie (soft delete) lub hard delete.
4. Zwrot 204.

## 5. Względy bezpieczeństwa

- RLS i sprawdzenie roli użytkownika.
- Pacjent tylko własne wizyty.

## 6. Obsługa błędów

- 400: ZodValidationError.
- 401: brak/nieprawidłowy token.
- 403: próba anulowania ≤24h.
- 404: wizyta nie istnieje.
- 500: wyjątki.

## 7. Wydajność

- Single-row delete; indeks na PK.

## 8. Kroki implementacji

1. Zdefiniować Zod schema dla `id` w `src/lib/schemas/visit.schema.ts`.
2. Implementować `delete` w `src/lib/services/visit.service.ts` z logiką 24h.
3. Utworzyć handler DELETE w `src/pages/api/visits/[id].ts`.
