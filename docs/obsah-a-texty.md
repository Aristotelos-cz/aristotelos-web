# Obsah a texty

## Slovník webu

| Píšeme | Nepíšeme | Poznámka |
| --- | --- | --- |
| pracovníci | lidé | Výjimky: „mluvíte přímo s lidmi, kteří systém navrhli“ (O nás), „Slovy lidí, kteří s AristoTelem plánují“ (Reference) |
| operátoři | agenti, linka | O lidech v kontaktním centru, „linka“ ne jako počet osob |
| distribuční centra | DC | |
| Veřejný plán | hlavní plán | Anglicky „Main schedule“ |
| znalosti | skilly, dovednosti | Anglicky „Skills“ |

Pojmy z aplikace a jejich anglické názvy pro budoucí anglickou verzi jsou ve [slovníku pro anglickou verzi](slovnik-en.md).

## Tvrzení na webu

- Čísla a fakta (počet pracovníků, zákazníci, certifikace, délka nasazení) musí na všech stránkách, v `llms.txt`,
  v popisech v `PAGES` a ve strukturovaných datech souhlasit. Při změně je hledejte ve všech těchto místech.
- Přehled funkcí tvrzení ostatních stránek jen doplňuje, nikdy je nezeslabuje (například 100% hlídání zákoníku práce).
- Všechny funkce jsou součástí AristoTela. Které zákazník využije, záleží na typu provozu, proto se nepíše „modul navíc“.
- API se popisuje oblastmi (plán směn a požadavky, agentury, objem práce, stavy zaměstnanců, hromadná synchronizace,
  příjem souborů). Technické názvy rozhraní se nezveřejňují, zákazník je dostane v dokumentaci.
- Ceny se na webu neuvádějí („ceny se připravují na míru“), kalkulačky ukazují jen úsporu.

## Časté otázky

Časté otázky jsou v `src/content/faq.json` pod adresou stránky. Z tohoto souboru vznikají strukturovaná data FAQPage
(`page.tsx`), takže vyhledávače vidí přesně tyto otázky a odpovědi. Google vyžaduje, aby stejný text byl vidět
i na stránce, proto:

- na stránkách kalkulaček se otázky vykreslují přímo z `faq.json` (`FaqSekce.tsx`), stačí upravit soubor,
- na ostatních stránkách je text otázek napsaný i v komponentě stránky a musí být shodný s `faq.json`.
  Při změně upravte obě místa.

## Stránka Od předpovědi po mzdy

Adresa `/funkce` se v menu, v patičce a v odkazech jmenuje „Od předpovědi po mzdy“, aby se nepletla s Přehledem funkcí.
Titulek pro vyhledávače zůstává „Funkce plánování směn a docházky“. Pod každou částí vede odkaz
„Všechny funkce … →“ na odpovídající oblast Přehledu funkcí.

## Kontakty a údaje o firmě

Telefon +420 606 337 182, e-mail info@aristotelos.com, sídlo Podskalská 2046/14, 128 00 Praha 2, IČO 28478614.
Opakují se na několika stránkách, ve strukturovaných datech, v `llms.txt`, v e-mailech a v PDF. E-maily, PDF a chybové
hlášky serveru berou telefon a e-mail z konstant `KONTAKT_TELEFON` a `KONTAKT_EMAIL` v `src/lib/formular.ts`, ostatní
místa (stránky, patička, kalkulačka v prohlížeči, `layout.tsx`, `llms.txt`) mají údaje napsané přímo. Při změně je najděte všechny:

```bash
grep -rn "606 337 182\|606337182\|info@aristotelos.com\|Podskalská\|28478614" src
```
