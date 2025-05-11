# API Endpoint Implementation Plan: GET /work-schedule

## 1. Przegląd punktu końcowego

Zwraca listę wpisów planu pracy (work_schedule) dla zalogowanego pracownika.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- URL: `/work-schedule`
- Nagłówek: `Authorization: Bearer <token>`

## 3. Szczegóły odpowiedzi

- 200 OK

```json
WorkScheduleDTO[]
```

- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: użytkownik nie jest pracownikiem
- 500 Internal Server Error: błąd serwera

## 4. Przepływ danych

1. Middleware autoryzuje JWT, ustawia `context.locals.user`.
2. Weryfikacja `user.role === 'worker'`.
3. `WorkScheduleService.list(user.id)`:
   - SELECT z filtracją `created_by = user.id`.
4. Zwrócenie tablicy `WorkScheduleDTO`.

## 5. Względy bezpieczeństwa

- Ograniczenie dostępu do pracowników.
- RLS na tabeli `work_schedule` (opcjonalnie policy worker).

## 6. Obsługa błędów

- 401: brak/nieprawidłowy token.
- 403: brak roli worker.
- 500: wyjątki DB.

## 7. Wydajność

- Niewielka ilość rekordów (<=7), szybkość odczytu.

## 8. Kroki implementacji

1. Dodać metodę `list` w `src/lib/services/work-schedule.service.ts`.
2. Utworzyć plik `src/pages/api/work-schedule.ts` z handlerem GET.
3. Zaimplementować guardę `user.role` w handlerze.
