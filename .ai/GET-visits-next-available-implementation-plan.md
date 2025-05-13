# Plan wdrożenia punktu końcowego REST API: GET /visits/next-available

## 1. Przegląd punktu końcowego
Endpoint służy do obliczenia i zwrócenia kolejnych dostępnych terminów wizyt dla aktualnie zalogowanego pacjenta, z uwzględnieniem tygodniowego harmonogramu pracy, istniejących wizyt oraz blokad czasowych.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Ścieżka: `/api/visits/next-available`
- Nagłówki:
  - `Authorization: Bearer <token>` (JWT pacjenta)
- Parametry zapytania:
  - page (number, opcjonalny): numer strony paginacji, domyślnie `1`
  - limit (number, opcjonalny): liczba slotów na stronę, domyślnie `10`, maksymalnie `50`
- Body: brak

## 3. Wykorzystywane typy
- NextAvailableQuery (w `src/types.ts`): parametry paginacji
- NextAvailableDTO (`src/types.ts`): obiekt `{ start_time: string; end_time: string }`
- NextAvailableResponse (`src/types.ts`): `PaginatedResponse<NextAvailableDTO>` czyli `{ data: NextAvailableDTO[]; meta: { total: number; page: number; limit: number } }`

## 4. Szczegóły odpowiedzi
- 200 OK
```json
{
  "data": [
    { "start_time": "2025-05-12T09:00:00Z", "end_time": "2025-05-12T10:00:00Z" },
    ...
  ],
  "meta": { "total": 42, "page": 1, "limit": 10 }
}
```
- 404 Not Found – brak dostępnych slotów (pusta lista)
- 400 Bad Request – nieprawidłowe parametry query (walidacja Zod)
- 401 Unauthorized – brak lub nieważny token JWT
- 403 Forbidden – użytkownik zalogowany, ale nie ma roli `patient`
- 500 Internal Server Error – nieoczekiwany błąd serwera lub bazy danych

## 5. Przepływ danych
1. **Handler HTTP (`src/pages/api/visits/next-available.ts`)**
   - Parsowanie URL i wyciągnięcie `page`, `limit` z `request.url`
   - Walidacja za pomocą Zod (NextAvailableQuerySchema)
   - Pobranie `supabase` i `user` z `context.locals` (`PATIENT_LOCALS`)
   - Weryfikacja roli pacjenta (`user.role === 'patient'`)
   - Wywołanie serwisu: `VisitService.nextAvailable(supabase, user.user_id, page, limit)`
   - Jeśli zwrócone `data.length === 0` => `return Response(null, { status: 404 })`
   - W przeciwnym razie => `return Response(JSON.stringify({ data, meta }), { status: 200 })`

2. **Logika biznesowa (serwis `src/lib/services/visit.service.ts`)**
   - Nowa sygnatura metody: `nextAvailable(supabase, patientId, page, limit)`
   - Wywołanie RPC w bazie: `supabase.rpc('get_next_available_slots', { p_patient_id, p_page: page, p_limit: limit })`
   - Odbiór `data` i ewentualnie `count` (zwracany przez RPC lub dodatkowe zapytanie)
   - Normalizacja czasów do ISO
   - Zbudowanie obiektu `PaginatedResponse<NextAvailableDTO>`

3. **Baza danych**
   - Funkcja PostgreSQL `get_next_available_slots(p_patient_id UUID, p_page INT, p_limit INT)`
   - Generowanie przedziałów zgodnie z `work_schedule`
   - Wykluczenie istniejących wizyt (`visits`) i blokad (`time_blocks`) poprzez `tsrange`
   - Zwrócenie podzbioru slotów dla paginacji oraz całkowitej liczby dostępnych slotów (np. jako OUT param lub dodatkowy rekord)

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: JWT Supabase; weryfikacja tokenu przed handlerem (middleware Astro)
- Autoryzacja: kontrola roli pacjenta w handlerze
- RLS (Row-Level Security): tabele `visits` i `time_blocks` zabezpieczone politykami RLS
- Walidacja Zod: zabezpieczenie przed nieprawidłowymi danymi i atakami typu injection
- Ograniczenie `limit` do maksymalnie `50` w schemacie Zod
- Monitoring i logowanie błędów krytycznych (Sentry / Astro logger)

## 7. Obsługa błędów
| Kod | Scenariusz                                         | Opis                              |
|-----|----------------------------------------------------|-----------------------------------|
| 400 | Błędy walidacji Zod (np. `limit > 50`)             | Zwrócenie szczegółów walidacji    |
| 401 | Brak tokenu lub niepoprawny token                  | Brak uprawnień                    |
| 403 | Użytkownik zalogowany, ale rola !== `patient`      | Odmowa dostępu                    |
| 404 | `data.length === 0`                                | Brak dostępnych slotów            |
| 500 | Błędy serwisu, RPC lub bazy danych                  | Internal Server Error + log entry |

## 8. Rozważania dotyczące wydajności
- Indeksy GiST na kolumnach `tsrange(start_time, end_time)` w tabelach `visits` oraz `time_blocks`
- Efektywna paginacja przy użyciu `LIMIT` i `OFFSET` w RPC
- Kontrola maksymalnego `limit` w schemacie Zod
- Opcjonalne cachowanie wyników na warstwie API (krótkotrwały TTL)

## 9. Kroki implementacji
1. Zaktualizować plik `src/types.ts`:
   - Rozszerzyć `NextAvailableQuery` o pola `page` i `limit` lub użyć `VisitListQueryParams`
2. Zaktualizować schemat Zod w `src/lib/schemas/visit.schema.ts`:
   - Rozbudować `NextAvailableQuerySchema` o `page` i `limit` z domyślnymi wartościami i ograniczeniami
3. Rozbudować serwis w `src/lib/services/visit.service.ts`:
   - Zmienić sygnaturę `nextAvailable`
   - Zwracać `PaginatedResponse<NextAvailableDTO>`
4. Zaktualizować handler w `src/pages/api/visits/next-available.ts`:
   - Parsować i walidować wszystkie parametry query
   - Wywoływać serwis z właściwymi argumentami
   - Obsłużyć przypadek pustej listy (404)
5. Utworzyć lub zmodyfikować funkcję RPC `get_next_available_slots` w bazie:
   - Przyjmować `p_patient_id, p_page, p_limit`
   - Zwracać listę slotów oraz całkowitą liczbę dostępnych
6. Zweryfikować implementację z wytycznymi:
   - Zgodność z zasadami shared.mdc, backend.mdc, astro.mdc
   - Użycie `locals.supabase` z politykami RLS
   - Optymalizacja i czytelność kodu
