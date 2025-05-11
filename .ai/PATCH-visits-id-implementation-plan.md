# API Endpoint Implementation Plan: PATCH /visits/{id}

## 1. Przegląd punktu końcowego

Pozwala pacjentowi zmodyfikować szczegóły istniejącej wizyty (data, czas, cel) pod warunkiem, że modyfikacja następuje co najmniej 24 godziny przed zaplanowanym rozpoczęciem.

## 2. Szczegóły żądania

- Metoda HTTP: PATCH
- URL: `/visits/{id}`
- Nagłówek: `Authorization: Bearer <token>`
- Path parametry:
  - `id` (UUID) – identyfikator wizyty
- Body (JSON):

```json
VisitUpdateCommand
// { start_time?: string, end_time?: string, purpose?: string }
```

## 3. Szczegóły odpowiedzi

- 200 OK

```json
VisitDTO
```

- 400 Bad Request: błędy walidacji (Zod lub biznesowe)
- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: modyfikacja poniżej 24h przed wizytą lub brak uprawnień
- 404 Not Found: wizyta nie istnieje
- 409 Conflict: kolizja terminu
- 500 Internal Server Error: nieoczekiwany błąd

## 4. Przepływ danych

1. Middleware autoryzuje JWT, ustawia `context.locals.user`.
2. Walidacja `id` i body przez Zod (`VisitUpdateCommand`).
3. `VisitService.update(id, user.id, payload)`:
   - Pobranie istniejącej wizyty.
   - Sprawdzenie, czy `user.id` jest właścicielem.
   - Weryfikacja >24h przed `start_time`.
   - Sprawdzenie konfliktów.
   - Aktualizacja rekordu.
4. Zwrócenie zaktualizowanego `VisitDTO`.

## 5. Względy bezpieczeństwa

- RLS oraz sprawdzenie właściciela rekordu.
- Ograniczenie pacjenta do własnej wizyty.

## 6. Obsługa błędów

- 400: ZodValidationError, niepełne/wadliwe dane.
- 401: brak tokenu.
- 403: próba edycji poniżej 24h lub brak roli.
- 404: nie znaleziono wizyty.
- 409: kolizja terminu.
- 500: wyjątki DB.

## 7. Wydajność

- Ograniczone operacje aktualizacji; indeksy GiST dla konfliktów.

## 8. Kroki implementacji

1. Zdefiniować Zod schema `VisitUpdateCommand` w `src/lib/schemas/visit.schema.ts`.
2. Implementować metodę `update` w `src/lib/services/visit.service.ts` z logiką 24h.
3. Utworzyć plik `src/pages/api/visits/[id].ts` z handlerem PATCH.
