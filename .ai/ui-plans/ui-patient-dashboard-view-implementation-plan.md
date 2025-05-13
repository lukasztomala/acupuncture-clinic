# Plan implementacji widoku Dashboard pacjenta

## 1. Przegląd

Dashboard pacjenta wyświetla listę nadchodzących wizyt zalogowanego użytkownika z paginacją oraz przyciskiem "Zarezerwuj wizytę" prowadzącym do formularza rezerwacji.

## 2. Routing widoku

Ścieżka: `/patient/dashboard`
W pliku: `src/pages/patient/dashboard.astro`

```astro
---
export const prerender = false;
import Layout from "../../layouts/Layout.astro";
import Navbar from "../../components/Navbar.astro";
import Footer from "../../components/Footer.astro";
import PatientDashboard from "../../components/patient/PatientDashboard";
---

<Layout title="Dashboard pacjenta">
  <Navbar />
  <PatientDashboard client:load />
  <Footer />
</Layout>
```

## 3. Struktura komponentów

- **PatientDashboard** (React)
  - Button CTA "Zarezerwuj wizytę"
  - UpcomingVisitsTable
  - Pagination
- **UpcomingVisitsTable**
  - Table, TableHeader, TableBody, TableRow, TableCell
- **Pagination** (Shadcn UI / własny)
- **VisitRow** (wewnętrzny dla UpcomingVisitsTable)

## 4. Szczegóły komponentów

### PatientDashboard

- Opis: Logika pobierania wizyt, stan, obsługa błędów, nawigacja.
- Elementy:
  - `<Button variant="default" onClick={() => navigate("/patient/book")}>Zarezerwuj wizytę</Button>`
  - `<UpcomingVisitsTable visits={visits} />`
  - `<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />`
- Zdarzenia:
  - onClick CTA → zmiana ścieżki
  - onPageChange → zmiana stanu `page`
- Typy:
  - props: `{}` (brak)
  - lokalny stan: `page: number`, `limit: number`
- Hooki:
  - `useVisits({ status: "upcoming", page, limit })`

### UpcomingVisitsTable

- Opis: Renderuje tabelę wizyt.
- Elementy:
  - `<Table>` z nagłówkami: "Data startu", "Data końca", "Cel wizyty"
  - Rzędy: VisitRow
- Typy:
  - props: `visits: VisitVM[]`
- Brak walidacji.

### Pagination

- Opis: Przełącznik stron.
- Elementy:
  - Strzałki / numery stron (Shadcn UI `Pagination` lub własny `<nav>`)
- Typy:
  - props: `{ page: number; totalPages: number; onPageChange: (p: number) => void }`

### VisitRow

- Opis: Pojedynczy wiersz tabeli.
- Elementy:
  - `<TableCell>` z sformatowaną datą (date-fns: `dd.MM.yyyy HH:mm`)
  - `<TableCell>` z celem wizyty
- Typy:
  - props: `{ visit: VisitVM }`

## 5. Typy

```ts
// DTO z backendu
type VisitDTO = {
  id: string;
  patient_id: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: string;
};

// ViewModel dla tabeli
interface VisitVM {
  id: string;
  formattedStart: string; // dd.MM.yyyy HH:mm
  formattedEnd: string;
  purpose: string;
}
```

## 6. Zarządzanie stanem

- `PatientDashboard` ma lokalny `page: number` i `limit: number` (np. 10).
- Hook `useVisits` utrzymuje `data`, `isLoading`, `error`.
- W razie błędu pokaz toast (Sonner).

## 7. Integracja API

- Endpoint: `GET /api/visits?status=upcoming&page=${page}&limit=${limit}`
- Request: bez body, ciasteczka sesyjne dołączane automatycznie.
- Response: `{ data: VisitDTO[]; meta: { total: number; page: number; limit: number } }`
- Po otrzymaniu mapowanie:
  ```ts
  const visitsVM: VisitVM[] = data.map((v) => ({
    id: v.id,
    formattedStart: format(new Date(v.start_time), "dd.MM.yyyy HH:mm"),
    formattedEnd: format(new Date(v.end_time), "dd.MM.yyyy HH:mm"),
    purpose: v.purpose,
  }));
  const totalPages = Math.ceil(meta.total / meta.limit);
  ```

## 8. Interakcje użytkownika

- Załadowanie strony → fetch wizyt.
- Przełączanie stron → wywołanie fetch z nowym page.
- Pusty stan (brak wizyt) → komunikat "Brak nadchodzących wizyt".
- Kliknięcie "Zarezerwuj wizytę" → przekierowanie do `/patient/book`.

## 9. Warunki i walidacja

- Sprawdzić `status === "upcoming"` przy fetch.
- Walidacja `page ≥ 1` i `page ≤ totalPages` w komponencie Pagination.

## 10. Obsługa błędów

- `401 Unauthorized` → automatyczne przekierowanie do `/login`.
- Inne błędy (fetch/network) → `toast.error("Nie udało się pobrać wizyt")`.
- Błąd walidacji parametrów → traktować jak pusty stan.

## 11. Kroki implementacji

1. Stworzyć hook `useVisits` w `src/lib/hooks/useVisits.ts`.
2. Zdefiniować typy `VisitVM` w `src/types.ts` lub `src/types/view.ts`.
3. Dodać komponent `UpcomingVisitsTable.tsx` w `src/components/patient/`.
4. Dodać komponent `Pagination.tsx` w `src/components/ui/`.
5. Dodać `PatientDashboard.tsx` w `src/components/patient/`, wykorzystujący hook i komponenty.
6. Utworzyć stronę `src/pages/patient/dashboard.astro` z klientowym ładowaniem `PatientDashboard`.
7. Przetestować paginację, obsługę pustego stanu i przekierowanie CTA.
8. Dodać testy manualne i e2e: logowanie → dashboard → paginacja → rezerwacja.
