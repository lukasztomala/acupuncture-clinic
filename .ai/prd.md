# Dokument wymagań produktu (PRD) - System rezerwacji wizyt gabinetu akupunktury

## 1. Przegląd produktu

Aplikacja webowa umożliwiająca pacjentom samodzielne rezerwowanie, modyfikowanie i anulowanie wizyt w gabinecie akupunktury oraz pracownikowi zarządzanie harmonogramem, blokadami czasowymi, wizytami i notatkami. Interfejs dostępny w językach polskim i angielskim, w pełni responsywny.

## 2. Problem użytkownika

Obecny proces ustalania terminów wizyt prowadzi się telefonicznie, co jest czasochłonne, podatne na błędy i ogranicza elastyczność pacjentów i efektywność pracy recepcji.

## 3. Wymagania funkcjonalne

1. Rejestracja pacjenta z walidacją daty urodzenia (18+)
2. Uwierzytelnianie pacjenta (logowanie, reset hasła przez e-mail)
3. Planowanie wizyty z algorytmem wyszukiwania najbliższego wolnego terminu (pełne godziny, długość wizyty: 2 h/1 h)
4. Modyfikacja terminu wizyty do 24 h przed jej rozpoczęciem
5. Anulacja wizyty do 24 h przed jej rozpoczęciem
6. Przeglądanie historii wizyt przez pacjenta (bez dostępu do notatek)
7. Żądanie usunięcia konta i wszystkich danych przez pacjenta (self-service)
8. Uwierzytelnianie pracownika (logowanie, reset hasła przez e-mail)
9. Konfiguracja godzin pracy gabinetu (dni tygodnia i pełne godziny)
10. Dodawanie i usuwanie blokad czasowych (minuty/godziny/dni)
11. Zarządzanie wizytami przez pracownika (dodawanie, przesuwanie, anulowanie bez ograniczeń 24 h)
12. Dodawanie i edycja notatek tekstowych do pacjenta i wizyty (widoczne tylko dla pracownika)
13. Przeglądanie publicznych podstron (Kontakt, O nas) bez uwierzytelnienia
14. Wsparcie wielojęzyczności interfejsu (polski, angielski)
15. Pełna responsywność na urządzeniach desktop, tablet, mobile

## 4. Granice produktu

- Jeden gabinet, jeden pracownik, jedna strefa czasowa (Polska)
- Brak powiadomień SMS/e-mail w MVP
- Brak szyfrowania danych w spoczynku i kopii zapasowych
- Brak audytu operacji
- Brak zgodności WCAG
- Brak integracji z zewnętrznymi systemami

## 5. Historyjki użytkowników

- ID: US-001  
  Tytuł: Rejestracja pacjenta  
  Opis: Pacjent wypełnia formularz rejestracji, podając imię, nazwisko, e-mail, telefon i datę urodzenia.  
  Kryteria akceptacji:

  - Formularz zawiera pola imię, nazwisko, e-mail, telefon i data urodzenia.
  - Wszystkie pola są obowiązkowe.
  - Data urodzenia wskazuje wiek minimum 18 lat.
  - Po poprawnym wypełnieniu konto zostaje utworzone, a pacjent jest zalogowany.
  - Przy niepoprawnych danych wyświetlany jest komunikat o błędzie.

- ID: US-002  
  Tytuł: Logowanie pacjenta  
  Opis: Pacjent podaje adres e-mail i hasło, aby uzyskać dostęp do swojego konta.  
  Kryteria akceptacji:

  - Formularz logowania zawiera pola e-mail i hasło.
  - Poprawne dane uwierzytelniają użytkownika i przekierowują do panelu.
  - Niepoprawne dane wyświetlają komunikat o błędnych poświadczeniach.

- ID: US-003  
  Tytuł: Reset hasła pacjenta  
  Opis: Pacjent wprowadza adres e-mail, otrzymuje wiadomość z linkiem do ustawienia nowego hasła.  
  Kryteria akceptacji:

  - Formularz resetu hasła zawiera pole e-mail.
  - System wysyła wiadomość z jednorazowym tokenem.
  - Link prowadzi do formularza ustawienia nowego hasła.
  - Po zmianie hasła pacjent może zalogować się przy użyciu nowego hasła.

- ID: US-004  
  Tytuł: Planowanie wizyty przez pacjenta  
  Opis: Pacjent wybiera cel wizyty i uruchamia algorytm, który proponuje najbliższy wolny termin na pełną godzinę.  
  Kryteria akceptacji:

  - Pacjent wpisuje cel wizyty.
  - System oblicza najbliższy dostępny termin z uwzględnieniem długości wizyty (2 h/1 h) i pełnej godziny.
  - Pacjent potwierdza termin i wizyta zostaje zapisana.

- ID: US-005  
  Tytuł: Modyfikacja wizyty przez pacjenta  
  Opis: Pacjent zmienia termin istniejącej wizyty, o ile znajduje się co najmniej 24 h przed jej rozpoczęciem.  
  Kryteria akceptacji:

  - Pacjent widzi listę swoich nadchodzących wizyt.
  - Modyfikacja możliwa tylko, jeśli do wizyty pozostało ≥ 24 h.
  - Po zmianie termin jest aktualizowany w kalendarzu.

- ID: US-006  
  Tytuł: Anulacja wizyty przez pacjenta  
  Opis: Pacjent anuluje umówioną wizytę, o ile jest to co najmniej 24 h przed terminem.  
  Kryteria akceptacji:

  - Pacjent widzi opcję anulacji przy każdej nadchodzącej wizycie.
  - System blokuje anulowanie, jeśli do terminu pozostało < 24 h.
  - Po anulowaniu wizyta jest usuwana z kalendarza pacjenta.

- ID: US-007  
  Tytuł: Przeglądanie historii wizyt przez pacjenta  
  Opis: Pacjent może przeglądać listę swoich przeszłych wizyt, bez dostępu do notatek.  
  Kryteria akceptacji:

  - Zalogowany pacjent widzi chronologiczną listę wizyt z datami i statusem.
  - Notatki pozostają ukryte.

- ID: US-008  
  Tytuł: Żądanie usunięcia danych przez pacjenta  
  Opis: Pacjent składa żądanie usunięcia swojego konta i danych poprzez interfejs.  
  Kryteria akceptacji:

  - Pacjent widzi opcję usunięcia konta w ustawieniach.
  - System sprawdza brak nadchodzących wizyt.
  - Po potwierdzeniu konto i dane pacjenta są trwale usunięte.

- ID: US-009  
  Tytuł: Logowanie pracownika  
  Opis: Pracownik podaje adres e-mail i hasło, aby uzyskać dostęp do panelu administracyjnego.  
  Kryteria akceptacji:

  - Formularz logowania zawiera pola e-mail i hasło.
  - Poprawne dane uwierzytelniają pracownika i przekierowują do panelu.
  - Niepoprawne dane wyświetlają komunikat o błędnych poświadczeniach.

- ID: US-010  
  Tytuł: Konfiguracja godzin pracy przez pracownika  
  Opis: Pracownik ustawia dni tygodnia i pełne godziny pracy gabinetu.  
  Kryteria akceptacji:

  - Panel pokazuje kalendarz tygodniowy.
  - Pracownik może dodać lub zmodyfikować zakresy godzin pracy.
  - Zmiany zapisują się i wpływają na dostępność terminów.

- ID: US-011  
  Tytuł: Dodawanie blokad czasowych przez pracownika  
  Opis: Pracownik tworzy blokadę, aby uniemożliwić rezerwację w określonym przedziale.  
  Kryteria akceptacji:

  - Pracownik wybiera datę i przedział czasowy (minuty/godziny/dni).
  - Blokada zostaje zapisana i widoczna w kalendarzu.

- ID: US-012  
  Tytuł: Usuwanie blokad czasowych przez pracownika  
  Opis: Pracownik usuwa istniejącą blokadę, przywracając dostępność terminu.  
  Kryteria akceptacji:

  - Lista blokad wyświetla wszystkie aktywne blokady.
  - Pracownik może usunąć blokadę jednym kliknięciem.
  - Termin staje się ponownie dostępny.

- ID: US-013  
  Tytuł: Zarządzanie wizytami przez pracownika  
  Opis: Pracownik dodaje, przesuwa i anuluje wizyty bez ograniczeń czasowych.  
  Kryteria akceptacji:

  - Panel umożliwia tworzenie wizyty dowolnie w przyszłości.
  - Przesunięcie wizyty aktualizuje datę/godzinę w kalendarzu.
  - Anulacja usuwa wizytę niezależnie od przedziału 24 h.

- ID: US-014  
  Tytuł: Dodawanie i edycja notatek przez pracownika  
  Opis: Pracownik dodaje lub edytuje notatki tekstowe do wizyty i pacjenta.  
  Kryteria akceptacji:

  - Panel wizyty zawiera sekcję notatek.
  - Notatki są zapisywane w bazie i wyświetlane tylko pracownikowi.

- ID: US-015  
  Tytuł: Przeglądanie publicznych podstron  
  Opis: Niezalogowany użytkownik przegląda strony Kontakt i O nas.  
  Kryteria akceptacji:

  - Strony można otworzyć bez logowania.
  - Zawartość jest wyświetlana zgodnie z wersją językową.

- ID: US-016  
  Tytuł: Wybór języka interfejsu  
  Opis: Użytkownik (zalogowany lub nie) wybiera język polski lub angielski.  
  Kryteria akceptacji:

  - Interfejs pozwala przełączać języki.
  - Wszystkie elementy UI zmieniają się zgodnie z wyborem.

- ID: US-017  
  Tytuł: Korzystanie z interfejsu na urządzeniach mobilnych  
  Opis: Użytkownik używa aplikacji na smartfonie lub tablecie.  
  Kryteria akceptacji:
  - Układ dostosowuje się do rozdzielczości mobilnych.
  - Formularze i kalendarz remain czytelne i funkcjonalne.

## 6. Metryki sukcesu

- MS-001: Procent rezerwacji wizyt dokonywanych przez pacjentów (miesięczny i roczny).
- MS-002: Procent rezerwacji wizyt dokonywanych przez pracownika (miesięczny i roczny).
- MS-003: Terminowa realizacja MVP w ciągu 4 tygodni od rozpoczęcia prac.
- MS-004: Procent pomyślnie przeprowadzonych testów UAT (cel ≥ 95%).
- MS-005: Średni czas ładowania kluczowych widoków na urządzeniach mobilnych < 2s.
- MS-006: Poziom responsywności UI potwierdzony testami na desktop, tablet i mobile.
