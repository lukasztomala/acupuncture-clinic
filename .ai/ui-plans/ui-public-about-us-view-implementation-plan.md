# Plan implementacji widoku O nas

## 1. Przegląd

Widok **O nas** prezentuje informacje o gabinecie i zespole, łącząc sekcje tekstowe z galerią zdjęć.

## 2. Routing widoku

Ścieżka: `/o-nas`

## 3. Struktura komponentów

```
AboutUsPage
├─ Navbar
├─ ContentSection[]
├─ ImageGallery
└─ Footer
```

## 4. Szczegóły komponentów

### AboutUsPage

- Opis: wrapper strony; importuje Navbar, serię `ContentSection` i `ImageGallery`, a także Footer.
- Główne elementy: `<Navbar />`, `<ContentSection data={...} />`, `<ImageGallery images={...} />`, `<Footer />`.
- Obsługiwane interakcje: brak (statyczne wyświetlanie).
- Walidacja: brak.
- Typy: `ContentSectionData[]`, `GalleryImage[]`.
- Propsy: brak.

### ContentSection

- Opis: blok tekstowy z nagłówkiem i akapitem.
- Główne elementy: `<h2>`, `<p>`.
- Obsługiwane interakcje: brak.
- Walidacja: brak.
- Typy:
  ```ts
  interface ContentSectionData {
    heading: string;
    text: string;
  }
  ```
- Propsy: `{ data: ContentSectionData }`.

### ImageGallery

- Opis: siatka lub karuzela zdjęć zespołu i gabinetu.
- Główne elementy: `<img>` w układzie grid, opcjonalnie strzałki do przewijania.
- Obsługiwane interakcje: ewentualne kliknięcie → powiększenie (lightbox).
- Walidacja: brak.
- Typy:
  ```ts
  interface GalleryImage {
    src: string;
    alt: string;
  }
  ```
- Propsy: `{ images: GalleryImage[] }`.

### Navbar

- (opis jak w Home)

### Footer

- (opis jak w Home)

## 5. Typy

```ts
interface ContentSectionData {
  heading: string;
  text: string;
}
interface GalleryImage {
  src: string;
  alt: string;
}
```

## 6. Zarządzanie stanem

Brak; komponenty renderowane statycznie.

## 7. Integracja API

Nie dotyczy.

## 8. Interakcje użytkownika

- Kliknięcie miniatury w ImageGallery (jeśli zaimplementowany lightbox).

## 9. Warunki i walidacja

Brak.

## 10. Obsługa błędów

- Brak obrazów → wyświetlić placeholder lub komunikat.

## 11. Kroki implementacji

1. Utworzyć `src/pages/o-nas.astro`, osadzić `AboutUsPage` w layoucie.
2. Utworzyć komponent `ContentSection.tsx`.
3. Utworzyć `ImageGallery.tsx` lub wykorzystać Shadcn UI DataTable/Carousel.
4. Przygotować statyczne dane w pliku konfiguracyjnym lub kolekcji Astro.
5. Zaimportować i wystylować komponenty za pomocą Tailwind.
6. Przetestować układ i responsywność na różnych urządzeniach.
