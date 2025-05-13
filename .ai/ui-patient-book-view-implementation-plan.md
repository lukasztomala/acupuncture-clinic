# Plan implementacji widoku Rezerwacja wizyty pacjenta

## 1. Przegląd

Widok pozwala pacjentowi zarezerwować wizytę, wpisując cel wizyty i wybierając jeden z dostępnych wolnych terminów zwróconych z serwera (paginacja).

## 2. Routing widoku

Ścieżka: `/patient/book` (dostępna po zalogowaniu).

## 3. Struktura komponentów

```
PatientLayout
└─ BookAppointmentPage
   └─ BookAppointmentForm
      ├─ PurposeField (Textarea)
      ├─ SlotList
      │   ├─ SlotItem (radio)
      │   └─ PaginationControls
      ├─ ErrorAlert
      └─ ConfirmButton
```

## 4. Szczegóły komponentów

### BookAppointmentPage

- Opis: wrapper strony; ustawia nagłówek i kontekst (Toaster).
- Elementy: `<BookAppointmentForm />`.
- Propsy: brak.

### BookAppointmentForm

- Opis: formularz rezerwacji z React Hook Form.
- Główne elementy:
  - `Textarea` dla `purpose` (cel wizyty)
  - `SlotList` pokazujący wolne terminy jako listę radio
  - `PaginationControls` (Przycisk Poprzednia/Następna)
  - `ErrorAlert` (Shadcn/ui `Alert`) dla błędów operacji
  - `ConfirmButton` do zatwierdzenia
- Obsługiwane zdarzenia:
  - Zmiana `page` → fetch kolejnej strony slotów
  - Wybór slotu → ustawienie `selectedSlot`
  - `onSubmit` → wywołanie `createVisit`
- Walidacja:
  - `purpose`: wymagane
  - `selectedSlot`: wymagane przed wysłaniem
- Typy:
  - `BookFormValues { purpose: string }`
  - `SlotVM { start_time: string; end_time: string; label: string }`
  - `VisitCreateCommand { start_time:string; end_time:string; purpose:string }`
- Propsy: brak (sam pobiera i tworzy)

### SlotList

- Opis: lista dostępnych slotów z możliwością wyboru.
- Elementy: `radio input` + `label` z formatem `dd.MM.yyyy HH:mm - HH:mm`.
- Zdarzenia: `onChange` wybór slotu.
- Walidacja: radio wymagane.
- Typy:
  - `SlotVM[]`
- Propsy:
  - `slots: SlotVM[]`, `selected: SlotVM | null`, `onSelect: (slot: SlotVM) => void`

### PaginationControls

- Opis: przyciski poruszania się po stronach slotów.
- Elementy: `Button` "Poprzednia", "Następna".
- Zdarzenia: `onPrev`, `onNext`.
- Propsy: `page: number`, `limit: number`, `hasMore: boolean`, `onPageChange: (newPage:number)=>void`

### ErrorAlert

- Opis: inline alert (Shadcn/ui) pokazujący `error`.
- Propsy: `message: string`

### ConfirmButton

- Opis: przycisk wysyłający dane.
- Propsy: `disabled: boolean`, `isLoading: boolean`

## 5. Typy

- `BookFormValues { purpose:string }`
- `SlotVM { start_time:string; end_time:string; label:string }`
- `VisitCreateCommand { start_time:string; end_time:string; purpose:string }`
- `VisitDTO`, `NextAvailableDTO` z `src/types.ts`

## 6. Zarządzanie stanem

- `useForm<BookFormValues>()` dla pól
- `useState` dla `slots`, `page`, `limit`, `selectedSlot`
- Custom hook `useNextAvailable(page, limit)` wykonujący GET `/api/visits/next-available?page&limit`
- Custom hook `useCreateVisit()` dla POST
- Toasty z `sonner`

## 7. Integracja API

- GET `/api/visits/next-available?page={page}&limit={limit}` → `SlotVM[]`
- POST `/api/visits` (body: `VisitCreateCommand`) → `VisitDTO`

## 8. Interakcje użytkownika

1. Wypełnia `purpose` → fetch slotów (page=1)
2. Przegląda listę slotów, może przejść do kolejnych stron
3. Zaznacza slot radio
4. Klika "Potwierdź" → wysyła POST
5. Na sukces: toast + redirect `/patient/dashboard`

## 9. Warunki i walidacja

- Pole `purpose` musi być wypełnione
- `selectedSlot` musi być wybrany
- Backend waliduje pełne godziny i 24h

## 10. Obsługa błędów

- Błędy pobierania slotów → komunikat zamiast listy
- Brak slotów → alert "Brak dostępnych terminów"
- Błąd walidacji POST → inline `ErrorAlert`
- Błąd sieci → toast globalny

## 11. Kroki implementacji

1. Utworzyć `src/pages/patient/book.astro` z `Layout` + `Navbar` + `BookAppointmentPage` + `Footer`.
2. W `src/components/patient/BookAppointment/` dodać pliki: `BookAppointmentPage.tsx`, `BookAppointmentForm.tsx`, `SlotList.tsx`, `PaginationControls.tsx`, hooki `useNextAvailable.ts`, `useCreateVisit.ts`.
3. Zaimplementować `BookAppointmentForm` zgodnie ze specyfikacją powyżej (bez pola duration).
4. Stworzyć komponent `SlotList` z radio inputami i generacją etykiet.
5. Stworzyć `PaginationControls` obsługujące stan `page`.
6. Zaimplementować hook `useNextAvailable` i użyć go w formularzu.
7. Zaimplementować hook `useCreateVisit` i powiązać z akcją `onSubmit`.
8. Dodać walidację i obsługę błędów oraz toasty.
9. Stylować za pomocą Tailwind i komponentów Shadcn/ui.
