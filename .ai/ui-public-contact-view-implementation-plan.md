# Plan implementacji widoku Kontakt

## 1. Przegląd

Widok **Kontakt** umożliwia użytkownikom wysłanie wiadomości do gabinetu oraz prezentuje mapę lokalizacji.

## 2. Routing widoku

Ścieżka: `/kontakt`

## 3. Struktura komponentów

```
ContactPage
├─ Navbar
├─ ContactForm
├─ MapEmbed
└─ Footer
```

## 4. Szczegóły komponentów

### ContactPage

- Opis: wrapper strony; importuje Navbar, ContactForm, MapEmbed oraz Footer.
- Główne elementy: `<Navbar />`, `<ContactForm />`, `<MapEmbed />`, `<Footer />`.
- Obsługiwane interakcje: wysyłanie formularza.
- Walidacja: brak (delegowana do ContactForm).
- Typy: `ContactFormData`.
- Propsy: brak.

### ContactForm

- Opis: formularz kontaktowy z polami: Imię, Email, Wiadomość.
- Główne elementy: `<input type="text">`, `<input type="email">`, `<textarea>`, `<Button>`.
- Obsługiwane interakcje:
  - `onSubmit(formData: ContactFormData)`
- Walidacja (React Hook Form + ZodResolver):
  - `name`: wymagane, min. 2 znaki
  - `email`: wymagane, poprawny format email
  - `message`: wymagane, min. 10 znaków
- Typy:
  ```ts
  interface ContactFormData {
    name: string;
    email: string;
    message: string;
  }
  ```
- Propsy: `onSubmit: (data: ContactFormData) => void` (można przewidzieć wysłanie do API lub adres mailto).

### MapEmbed

- Opis: osadzenie mapy (iframe) z lokalizacją gabinetu.
- Główne elementy: `<iframe src="...">`.
- Obsługiwane interakcje: zoom/pan w mapie.
- Walidacja: brak.
- Typy: brak (statyczny kod embed).
- Propsy: opcjonalnie `src: string`.

### Navbar

- (opis jak w Home)

### Footer

- (opis jak w Home)

## 5. Typy

```ts
interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
```

## 6. Zarządzanie stanem

- `useForm<ContactFormData>` z React Hook Form do obsługi pól i walidacji.
- Ewentualny lokalny stan: `isSubmitting`, `submitError`, `submitSuccess`.

## 7. Integracja API

- Brak gotowego endpointu w MVP — opcjonalnie wyświetlić `mailto:` lub stub.
- Można przygotować API route Astro (`src/pages/api/contact.ts`) w przyszłości.

## 8. Interakcje użytkownika

1. Wypełnienie pól i kliknięcie "Wyślij".
2. Walidacja formularza;
3. Po poprawnym submit: wyświetlenie komunikatu potwierdzenia.

## 9. Warunki i walidacja

- `name` ≥ 2 znaki
- `email` poprawny wzorzec
- `message` ≥ 10 znaków

## 10. Obsługa błędów

- Błędy walidacji inline.
- W przypadku błędu wysyłki: komunikat error.
- Po sukcesie: komunikat success i reset formularza.

## 11. Kroki implementacji

1. Utworzyć `src/pages/kontakt.astro`, osadzić `ContactPage`.
2. Stworzyć komponent `ContactForm.tsx` z React Hook Form + ZodResolver.
3. Stworzyć `MapEmbed.astro` lub `MapEmbed.tsx` z iframe.
4. Zaimportować i ostylować komponenty w `ContactPage`.
5. Dodać logikę stub submit (alert lub toast).
6. Przetestować walidację i UX przesyłania wiadomości.
