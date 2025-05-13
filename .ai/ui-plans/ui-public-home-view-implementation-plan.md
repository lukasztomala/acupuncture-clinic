# Plan implementacji widoku Home

## 1. Przegląd

Widok **Home** jest stroną główną publiczną, prezentującą sekcję hero z CTA do logowania/rejestracji oraz zestaw sekcji informacyjnych o usłudze.

## 2. Routing widoku

Ścieżka: `/`

## 3. Struktura komponentów

```
HomePage
├─ Navbar
├─ HeroSection
├─ InfoSection[]
└─ Footer
```

## 4. Szczegóły komponentów

### HomePage

- Opis: główny wrapper strony, importuje Navbar, HeroSection, listę InfoSection oraz Footer.
- Główne elementy: `<Navbar />`, `<HeroSection />`, seria `<InfoSection data={...} />`, `<Footer />`.
- Obsługiwane interakcje: brak (kliknięcia delegowane do podkomponentów).
- Walidacja: brak.
- Typy: `InfoSectionData[]`.
- Propsy: brak.

### Navbar

- Opis: górna nawigacja z linkami: Home, O nas, Kontakt, Logowanie/Rejestracja.
- Główne elementy: `<nav>`, `<Link>`.
- Obsługiwane interakcje: nawigacja.
- Walidacja: brak.
- Propsy: brak.

### HeroSection

- Opis: sekcja powitalna z tytułem, opisem i przyciskiem CTA.
- Główne elementy: `<h1>`, `<p>`, `<Button variant="primary">`.
- Obsługiwane interakcje: kliknięcie CTA → `navigate('/login')` lub `'/signup'`.
- Walidacja: brak.
- Typy:
  ```ts
  interface HeroSectionProps {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
  }
  ```
- Propsy: `HeroSectionProps`.

### InfoSection

- Opis: pojedyncza sekcja informacyjna z obrazkiem i tekstem.
- Główne elementy: `<img>`, `<h2>`, `<p>`.
- Obsługiwane interakcje: brak.
- Walidacja: brak.
- Typy:
  ```ts
  interface InfoSectionData {
    title: string;
    text: string;
    imageSrc: string;
    imageAlt: string;
  }
  ```
- Propsy: `{ data: InfoSectionData }`.

### Footer

- Opis: stopka z informacjami kontaktowymi i linkami społecznymi.
- Główne elementy: `<footer>`.
- Obsługiwane interakcje: brak.
- Walidacja: brak.
- Propsy: brak.

## 5. Typy

```ts
interface InfoSectionData {
  title: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
}
```

## 6. Zarządzanie stanem

Brak globalnego stanu; komponenty statyczne.

## 7. Integracja API

Nie dotyczy; wszystkie sekcje są statyczne.

## 8. Interakcje użytkownika

- Kliknięcie przycisku CTA w `HeroSection` → przekierowanie do `/login` lub `/signup`.

## 9. Warunki i walidacja

Brak.

## 10. Obsługa błędów

Brak.

## 11. Kroki implementacji

1. Utworzyć `src/pages/index.astro` i osadzić `HomePage` w layoucie `Layout.astro`.
2. Utworzyć komponenty:
   - `src/components/Navbar.astro`
   - `src/components/Footer.astro`
   - `src/components/HeroSection.tsx`
   - `src/components/InfoSection.tsx`
3. Zdefiniować dane dla `HeroSection` i tablicę `InfoSectionData`.
4. Zaimportować i wykorzystać komponenty w `HomePage`.
5. Stylować Tailwind + Shadcn UI (przyciski, responsywność).
6. Przetestować działanie CTA i responsywność.
