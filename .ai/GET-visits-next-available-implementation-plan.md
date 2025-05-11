# API Endpoint Implementation Plan: GET /visits/next-available

## 1. Przegląd punktu końcowego

Oblicza i zwraca najbliższy dostępny slot wizyty na podstawie żądanej długości (60 lub 120 minut) dla pacjenta.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- URL: `/visits/next-available`
- Nagłówek: `Authorization: Bearer <token>`
- Parametry zapytania:
  - `duration` (number) – wymagana, wartość 60 lub 120

## 3. Szczegóły odpowiedzi

- 200 OK

```json
NextAvailableDTO
```

- 400 Bad Request: brak lub nieprawidłowy `duration`
- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: użytkownik nie jest pacjentem
- 404 Not Found: brak dostępnych slotów
- 500 Internal Server Error: nieoczekiwany błąd serwera

## 4. Przepływ danych

1. Middleware autoryzuje JWT, ustawia `context.locals.user`.
2. Walidacja `duration` przez Zod w `visit.schema.ts` (`NextAvailableQuery`).
3. `VisitService.nextAvailable(duration, user.id)`:
   - Pobranie `work_schedule` i `time_blocks` z serwisu.
   - Obliczenia dostępnych przedziałów (>24h od teraz).
   - Zwrócenie pierwszego wolnego slotu.
4. Zwrócenie `NextAvailableDTO`.

## 5. Względy bezpieczeństwa

- Tylko pacjenci mogą wywołać.
- Weryfikacja, że `user.role === 'patient'`.

## 6. Obsługa błędów

- 400: ZodValidationError.
- 401: brak/nieprawidłowy token.
- 403: nie-pacjent.
- 404: brak dostępnych slotów.
- 500: wyjątki DB i logiki.

## 7. Wydajność

- Buforowanie `work_schedule` w pamięci serwera.
- Optymalizacja wykluczania `time_blocks`.

## 8. Kroki implementacji

1. Zdefiniować Zod schema `NextAvailableQuery` w `src/lib/schemas/visit.schema.ts`.
2. Implementować metodę `nextAvailable` w `src/lib/services/visit.service.ts`.
3. Utworzyć plik `src/pages/api/visits/next-available.ts` z handlerem GET.
