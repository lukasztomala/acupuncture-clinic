# API Endpoint Implementation Plan: POST /work-schedule

## 1. Przegląd punktu końcowego

Umożliwia pracownikowi dodanie nowego wpisu do tygodniowego planu pracy.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- URL: `/work-schedule`
- Nagłówek: `Authorization: Bearer <token>`
- Body (JSON):

```json
WorkScheduleCreateCommand
// { day_of_week: number, start_time: string, end_time: string }
```

## 3. Szczegóły odpowiedzi

- 201 Created

```json
WorkScheduleDTO
```

- 400 Bad Request: błędy walidacji (Zod) lub duplikat wpisu
- 401 Unauthorized: brak/nieprawidłowy token
- 403 Forbidden: brak roli worker
- 500 Internal Server Error: nieoczekiwany błąd

## 4. Przepływ danych

1. Middleware autoryzuje JWT, ustawia `context.locals.user`.
2. Weryfikacja `user.role === 'worker'`.
3. Walidacja body przez Zod (`WorkScheduleCreateCommand`).
4. `WorkScheduleService.create(user.id, payload)`:
   - INSERT do `work_schedule`, uwzględniając unikalny constraint.
5. Zwrócenie nowego `WorkScheduleDTO`.

## 5. Względy bezpieczeństwa

- Ograniczenie do roli worker.
- RLS na `work_schedule`.

## 6. Obsługa błędów

- 400: ZodValidationError, duplikat.
- 401: brak tokenu.
- 403: brak roli.
- 500: wyjątki DB.

## 7. Wydajność

- Niewielka liczba wpisów, szybkie INSERTy.

## 8. Kroki implementacji

1. Zdefiniować Zod schema `WorkScheduleCreateCommand` w `src/lib/schemas/work-schedule.schema.ts`.
2. Implementować `create` w `src/lib/services/work-schedule.service.ts`.
3. Utworzyć `src/pages/api/work-schedule.ts` z handlerem POST.
