# Plan implementacji widoku Harmonogram pracy dla pracownika

## 1. Przegląd

Widok **Harmonogram pracy** umożliwia pracownikowi przeglądanie, dodawanie, edycję i usuwanie zakresów godzin pracy gabinetu w układzie tygodniowym. Zmiany są zapisywane w bazie poprzez API i odświeżają dostępność terminów wizyt.

## 2. Routing widoku

Ścieżka: `/worker/work-schedule`

## 3. Struktura komponentów

```
WorkSchedulePage
├─ Header / Breadcrumbs
├─ Button "Dodaj zakres"
├─ WorkScheduleTable
│   └─ ScheduleEntryRow[]
├─ WorkScheduleModalForm (Add/Edit)
└─ DeleteConfirmationModal
```

## 4. Szczegóły komponentów

### WorkSchedulePage

- Opis: Główny wrapper widoku; odpowiada za pobieranie danych, stan modali i uruchamianie mutacji.
- Główne elementy:
  - Nagłówek strony (np. tytuł i breadcrumbs)
  - Przycisk `Button` "Dodaj zakres"
  - Komponent `WorkScheduleTable`
  - Modale: `WorkScheduleModalForm`, `DeleteConfirmationModal`
- Obsługiwane zdarzenia:
  - kliknięcie "Dodaj zakres" → otwarcie modalu
  - zamknięcie modali
- Walidacja: brak (delegowana do formularzy)
- Typy:
  - `ScheduleEntryVM[]` (lista wpisów)
- Propsy: brak

### WorkScheduleTable

- Opis: Renderuje tabelę wpisów harmonogramu.
- Główne elementy:
  - `<table>` z nagłówkami: Dzień, Od, Do, Akcje
  - Wiersze: `ScheduleEntryRow`
- Obsługiwane zdarzenia:
  - `onEdit(id: string)`
  - `onDelete(id: string)`
- Walidacja: brak
- Typy:
  - `entries: ScheduleEntryVM[]`
  - `onEdit: (id: string) => void`
  - `onDelete: (id: string) => void`

### ScheduleEntryRow

- Opis: Pojedynczy wiersz tabeli.
- Główne elementy: `<tr>` z komórkami: dzień, start, end, przyciski Akcje
- Obsługiwane zdarzenia: przekazywanie `onEdit`, `onDelete` do przycisków
- Walidacja: brak
- Typy: `ScheduleEntryVM`
- Propsy: `entry: ScheduleEntryVM`, `onEdit`, `onDelete`

### WorkScheduleModalForm

- Opis: Modal z formularzem do dodawania/edycji wpisu.
- Główne elementy:
  - `Select` (dayOfWeek)
  - `TimePicker` dla `startTime` i `endTime`
  - `Button` "Zapisz" i "Anuluj"
- Obsługiwane zdarzenia:
  - zmiana pól formularza
  - submit → `onSubmit(formData)`
- Walidacja (React Hook Form + ZodResolver):
  - `dayOfWeek` ∈ [0,6]
  - `startTime` / `endTime` format HH:MM (regex `/^\d{2}:\d{2}$/`)
  - `startTime` < `endTime`
- Typy:
  - `CreateScheduleVM`: `{ dayOfWeek: number; startTime: string; endTime: string; }`
  - `UpdateScheduleVM`: `CreateScheduleVM & { id: string; }`
- Propsy:
  - `isOpen: boolean`
  - `initialData?: ScheduleEntryVM`
  - `onSubmit: (data: CreateScheduleVM | UpdateScheduleVM) => void`
  - `onClose: () => void`

### DeleteConfirmationModal

- Opis: Modal potwierdzenia usunięcia wpisu.
- Główne elementy: komunikat tekstowy, `Button` "Tak, usuń", `Button` "Anuluj"
- Obsługiwane zdarzenia:
  - `onConfirm()`
  - `onCancel()`
- Walidacja: brak
- Typy:
  - Props: `isOpen: boolean`, `onConfirm: () => void`, `onCancel: () => void`

## 5. Typy

```ts
// DTO z backendu
type WorkScheduleDTO = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

// Model widoku
type ScheduleEntryVM = {
  id: string;
  dayOfWeek: number;
  dayLabel: string; // np. "Poniedziałek"
  startTime: string;
  endTime: string;
};

// Payloady formularza
type CreateScheduleVM = Omit<ScheduleEntryVM, "id" | "dayLabel">;
type UpdateScheduleVM = Partial<Omit<ScheduleEntryVM, "dayLabel">> & { id: string };
```

## 6. Zarządzanie stanem

- Dane: React Query
  - `useWorkSchedules()` → `useQuery("work-schedule", fetchWorkSchedules)`
  - `useCreateWorkSchedule()` → `useMutation(createWorkSchedule, { onSuccess: invalidate })`
  - `useUpdateWorkSchedule()` → podobnie
  - `useDeleteWorkSchedule()` → podobnie
- UI state w `WorkSchedulePage`:
  - `isModalOpen: boolean`
  - `editingEntry?: ScheduleEntryVM`
  - `deletingEntryId?: string`

## 7. Integracja API

- GET `/api/work-schedule` → `WorkScheduleDTO[]`
- POST `/api/work-schedule` z `CreateScheduleVM` → `WorkScheduleDTO`
- PATCH `/api/work-schedule/{id}` z `UpdateScheduleVM` → `WorkScheduleDTO`
- DELETE `/api/work-schedule/{id}` → status 204
- Mapowanie DTO → VM: dodanie `dayLabel` (mapa dni tygodnia)

## 8. Interakcje użytkownika

1. Załadowanie strony → fetch danych → tabela / spinner / komunikat "Brak zakresów"
2. Kliknięcie "Dodaj zakres" → otwarcie `WorkScheduleModalForm`
3. Wypełnienie i zatwierdzenie → walidacja → POST → zamknięcie modalu → toast sukces → odświeżenie
4. Kliknięcie "Edytuj" przy wierszu → otwarcie modalu z wstępnymi danymi → PATCH → odświeżenie
5. Kliknięcie "Usuń" → otwarcie `DeleteConfirmationModal` → potwierdzenie → DELETE → odświeżenie

## 9. Warunki i walidacja

- dayOfWeek musi być liczbą 0–6
- startTime/endTime format HH:MM
- startTime < endTime
- Autoryzacja: komponent tylko dla role "worker" (przekierowanie lub komunikat 403)

## 10. Obsługa błędów

- Walidacja formularza → inline error messages
- Błąd duplikatu (kod 23505) → toast "Zakres już istnieje"
- Błędy sieciowe / 500 → toast / `ErrorAlert`
- 403 → przekierowanie do `/unauthorized` lub wyświetlenie komunikatu

## 11. Kroki implementacji

1. Utworzyć folder `src/components/worker/WorkSchedule`.
2. Dodać typy VM do `src/types.ts` lub `src/types/ui.ts`.
3. Zaimplementować hooki w `src/lib/hooks/useWorkSchedule.ts`.
4. Utworzyć `WorkScheduleModalForm.tsx` (React Hook Form + ZodResolver).
5. Utworzyć `WorkScheduleTable.tsx` i wewnętrzny `ScheduleEntryRow.tsx`.
6. Utworzyć `DeleteConfirmationModal.tsx` wykorzystując Shadcn/ui Modal.
7. Utworzyć `WorkSchedulePage.tsx`, użyć hooków i komponentów, zarządzać stanem.
8. Dodać plik Astro `src/pages/worker/work-schedule.astro`, osadzić `WorkSchedulePage`.
9. Dodać style Tailwind i Shadcn/ui.
10. Przetestować CRUD, walidacje, responsywność.
11. Code review i merge.
