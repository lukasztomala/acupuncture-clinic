# API Endpoint Implementation Plan: POST /visits

## 1. Przegląd punktu końcowego

Umożliwia pacjentowi zaplanowanie nowej wizyty, wybierając datę, godzinę i cel spotkania.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- URL: `/visits`
- Nagłówek: `Authorization: Bearer <token>`
- Body (JSON):

```json
VisitCreateCommand
// { start_time: string, end_time: string, purpose: string }
```

## 3. Szczegóły odpowiedzi

- 201 Created

```json
VisitDTO
```

- 400 Bad Request: błędy walidacji (Zod)
- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: użytkownik nie jest pacjentem
- 409 Conflict: konflikt terminu
- 500 Internal Server Error: nieoczekiwany błąd

## 4. Przepływ danych

1. Middleware autoryzuje JWT, ustawia `context.locals.user`.
2. Walidacja body przez Zod w `visit.schema.ts` (`VisitCreateCommand`):
   - `start_time` musi być pełną godziną
   - `end_time` = `start_time` + 60 lub 120 min
   - `start_time` ≥ teraz + 24h
3. `VisitService.create(user.id, payload)` w transakcji:
   - Sprawdzenie konfliktów przez tsrange EXCLUDE w DB lub manualne.
   - Wstawienie rekordu.
4. Zwrócenie nowego `VisitDTO`.

## 5. Względy bezpieczeństwa

- Tylko pacjenci mogą tworzyć wizyty.
- RLS w tabeli `visits`.

## 6. Obsługa błędów

- 400: ZodValidationError i reguły biznesowe.
- 401: brak tokenu.
- 403: nie-pacjent.
- 409: konflikt terminu.
- 500: wyjątki DB.

## 7. Wydajność

- Transakcja w izolacji serializable lub SELECT FOR UPDATE.
- GiST na tsrange dla szybkich wykluczeń.

## 8. Kroki implementacji

1. Zdefiniować Zod schema `VisitCreateCommand` w `src/lib/schemas/visit.schema.ts`.
2. Implementować metodę `create` w `src/lib/services/visit.service.ts`, używając transakcji.
3. Utworzyć plik `src/pages/api/visits.ts` z handlerem POST.
