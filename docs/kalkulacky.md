# Kalkulačky úspor

Vzorce, výchozí hodnoty, zdroje, příklady, e-maily, převod do Excelu a návod pro obchod popisuje živý dokument
[Kalkulačky úspor – jak fungují](https://claude.ai/artifact/JcKC8bD72qHweAQEBNdWNL). Tady je jen to, co potřebuje
vývojář, aby věděl, kde co je a co při změně udělat.

## Adresy

| Adresa | Co tam je | Odkazují na ni |
| --- | --- | --- |
| `/kalkulacka-uspor` | rozcestník: karty Kontaktní centrum a Retail, časté otázky | hlavní menu, patička, úvodní stránka, Od předpovědi po mzdy, stránka 404 |
| `/kalkulacka-uspor/kontaktni-centrum` | kalkulačka pro kontaktní centra | Kontaktní centra, Banky a pojišťovny, Energetika a telekomunikace |
| `/kalkulacka-uspor/retail` | kalkulačka pro obchody a lékárny | Obchodní řetězce a lékárny |

Mezi kalkulačkami se přepíná přepínačem vedle nadpisu (`PrepinacOboru.tsx`). Obecná kalkulačka pro sklady a další provozy
byla zrušena 5. 11. 2026, úsporu pro ně spočítá obchod v business casu.

## Kód

| Soubor | Co dělá |
| --- | --- |
| `src/lib/odhadUspor.ts` | Celý výpočet a nastavení obou kalkulaček: pole (výchozí hodnoty, rozsahy, nápovědy), předpoklady (opatrně a realisticky), oblasti (vzorce, zdroje), kontrola vstupů. Sdílí ho stránka i server, takže e-mail a PDF ukazují stejná čísla jako stránka |
| `src/components/KalkulackaInteraktivni.tsx` | Zadání, výsledek, tabulka předpokladů, formuláře shrnutí v PDF a business casu, úvodní texty sekcí (`TEXTY`) |
| `src/components/pages/Kalkulacka*.tsx` | Rozcestník a dvě stránky kalkulaček |
| `src/lib/shrnutiPdf.ts`, `src/lib/businessCaseExcel.ts` | PDF se shrnutím a Excel s business casem |
| `src/app/api/shrnuti/`, `src/app/api/business-case/` | Odeslání formulářů, viz [formulare-a-emaily.md](formulare-a-emaily.md) |
| `tests/odhadUspor.test.mjs` | Ručně spočítané příklady, `npm test` |

`odhadUspor.ts` spouštějí testy přímo v Node.js, proto v něm nesmí být enumy ani importy s aliasem `@/`.

## Postup při změně

1. Změnit hodnoty nebo vzorce v `src/lib/odhadUspor.ts`.
2. Upravit ručně spočítané příklady v `tests/odhadUspor.test.mjs` a spustit `npm test`.
3. Upravit texty, které čísla zmiňují: `src/content/faq.json`, popisy v `src/lib/site.ts`, `TEXTY`
   v `KalkulackaInteraktivni.tsx`, text PDF v `src/lib/shrnutiPdf.ts`.
4. Kontroly z [nasazeni-a-kontroly.md](nasazeni-a-kontroly.md#kontroly-před-nahráním), včetně rozvržení.
5. Ve stejný den aktualizovat dokument [Kalkulačky úspor – jak fungují](https://claude.ai/artifact/JcKC8bD72qHweAQEBNdWNL):
   tabulky vstupů a výpočtu, příklady s výchozími hodnotami a Historii změn.
