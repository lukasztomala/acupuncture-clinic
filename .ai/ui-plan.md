# Architektura UI dla Systemu Rezerwacji Wizyt Akupunktury

## 1. Przegląd struktury UI

Propozycja oparta na trzech głównych layoutach:

- **Publiczny** (Home, O nas, Kontakt)
- **Pacjent** (Dashboard pacjenta, Rezerwacja wizyty, Historia wizyt, Profil)
- **Pracownik** (Dashboard pracownika, Harmonogram pracy, Blokady czasowe, Zarządzanie wizytami)

Wspólne elementy: navbar, footer, modale (profile, reset hasła, potwierdzenia), globalny banner toast, spinnery i obsługa błędów.

## 2. Lista widoków

### Publiczne

- **Home** (`/`)

  - Cel: wprowadzenie, CTA do rejestracji/logowania
  - Kluczowe: hero, sekcje informacyjne, linki do Auth
  - Komponenty: `Navbar`, `Footer`, `HeroSection`, `InfoSection`

- **O nas** (`/o-nas`)

  - Cel: prezentacja gabinetu i personelu
  - Komponenty: `ContentSection`, `ImageGallery`

- **Kontakt** (`/kontakt`)
  - Cel: formularz kontaktowy (React)
  - Komponenty: `ContactForm`, `MapEmbed`

### Auth

- **Logowanie** (`/login`)

  - Cel: uwierzytelnienie i przekierowanie
  - Komponenty: `Input`, `Button`, `FormContainer`, `ErrorModal`

- **Rejestracja** (`/signup`)

  - Cel: utworzenie konta pacjenta (walidacja ≥18 lat)
  - Komponenty: `Input`, `DateInput`, `Button`, inline validation

- **Reset hasła** (modal)
  - Cel: wysłanie linku resetującego
  - Komponenty: `Modal`, `Input`, `Button`, komunikat "Link wysłany..."

### Pacjent

- **Dashboard pacjenta** (`/patient/dashboard`)

  - Cel: podgląd nadchodzących wizyt
  - Komponenty: `Table` (GET `/visits?status=upcoming`), `Pagination`, `Button` "Zarezerwuj wizytę"

- **Rezerwacja wizyty** (`/patient/book`)

  - Cel: szybkie umówienie wizyty
  - Kluczowe pola: `purpose`, `duration`
  - Źródło terminów: GET `/visits/next-available?page={page}&limit={limit}` (domyślnie limit=10), zwraca listę dostępnych slotów
  - Komponenty: `Input`, `Select`, `Button`, `Spinner`, `ErrorModal`

- **Historia wizyt** (`/patient/visits`)

  - Cel: przegląd wszystkich wizyt z filtrem statusu (Nadchodzące, Zakończone, Anulowane)
  - Komponenty: `FilterDropdown`, `Table`, `Pagination`

- **Profil** (modal)
  - Cel: edycja danych pacjenta
  - Komponenty: `Modal`, `Input`, `Button`

### Pracownik

- **Dashboard pracownika** (`/worker/dashboard`)

  - Cel: szybki podgląd nadchodzących wizyt i blokad
  - Komponenty: dwie tabele (`/visits`, `/time-blocks`), `Pagination`

- **Harmonogram pracy** (`/worker/work-schedule`)

  - Cel: CRUD harmonogramu (dni tygodnia, godziny)
  - Komponenty: `Table`, `Modal` (dodaj/edytuj), `Form` z `Select`, `TimePicker`

- **Blokady czasowe** (`/worker/time-blocks`)

  - Cel: CRUD blokad
  - Komponenty: `Table`, `Modal`, `DateTimeRangePicker`

- **Zarządzanie wizytami** (`/worker/visits`)

  - Cel: lista wszystkich wizyt
  - Komponenty: `Table`, `Pagination`, `Modal` do szybkiej edycji/anulowania

- **Szczegóły wizyty i notatki** (`/worker/visits/[id]`)
  - Cel: przegląd i edycja notatek
  - Komponenty: `NoteList` (GET `/visits/{id}/notes`), `NoteForm`, `Button`, `ErrorModal`

### Wspólne widoki

- **Unauthorized** (`/unauthorized`)
- **404 Not Found**

## 3. Mapa podróży użytkownika

### Pacjent

1. Public > Logowanie/Rejestracja
2. Dashboard pacjenta
3. Rezerwacja wizyty (`/patient/book`) → potwierdzenie
4. Powrót na Dashboard
5. Historia wizyt → filtrowanie statusu
6. Otworzenie modalu Profil → edycja danych
7. Wylogowanie

### Pracownik

1. Logowanie
2. Dashboard pracownika
3. Przejście do Harmonogramu pracy lub Blokad
4. Przejście do Zarządzania wizytami → Szczegóły wizyty → Notatki
5. Wylogowanie

## 4. Układ i struktura nawigacji

- **Publiczny navbar**: Home, O nas, Kontakt, Logowanie/Rejestracja
- **Pacjent**: top nav lub sidebar z: Dashboard, Rezerwacja, Historia, Profil (modal), Wyloguj
- **Pracownik**: top nav/sidebar: Dashboard, Harmonogram, Blokady, Wizyty, Wyloguj
- **Breadcrumbs**: na stronach zagnieżdżonych (np. szczegóły wizyty)

## 5. Kluczowe komponenty

- `Navbar`, `Footer`, `HeroSection`, `InfoSection`
- Formularze z React Hook Form: `Input`, `Select`, `DateInput`, `TimePicker`, `Button`
- `Table`, `Pagination`, `FilterDropdown`
- `Modal` (profile, reset hasła, CRUD)
- `Spinner` (`LoadingSpinner`), `ErrorAlert`
- `ToastProvider` dla globalnych komunikatów
- Provider-y: React Query, Lingui, React Context + Zustand, Auth interceptor

## 6. Obsługa stanów błędów i edge cases

- Modalne potwierdzenia i inline validation
- Retry logic w interceptorze dla nieudanych żądań
- Wyświetlanie prostych komunikatów "Brak dostępnych terminów"
- Spinner w miejscu komponentu podczas ładowania

---

_Plan UI gotowy do dalszej implementacji w Astro + React._
