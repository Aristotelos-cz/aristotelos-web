# Architektura

Web je Next.js 16 (App Router) s Reactem 19 na Vercelu. Všech 17 stránek se vygeneruje staticky při sestavení,
na serveru běží jen dvě API pro formuláře kalkulaček. Obsah je zatím v kódu a v JSON souborech, napojení na Sanity
je v plánu (proměnné jsou připravené v `.env.example`, kód je zatím nepoužívá).

## Mapa souborů

| Kde | Co tam je |
| --- | --- |
| `src/app/layout.tsx` | Kostra každé stránky: hlavička, `<main id="obsah">`, patička, výchozí metadata, strukturovaná data Organization a SoftwareApplication |
| `src/app/[[...slug]]/page.tsx` | Jediná trasa pro všechny stránky: mapa `COMPONENTS` (adresa → komponenta), metadata z `PAGES`, strukturovaná data FAQPage z `faq.json`. Neznámá adresa vrátí 404 (`dynamicParams = false`) |
| `src/lib/site.ts` | Adresa webu `SITE_URL`, přepínač indexování `INDEXABLE`, seznam stránek `PAGES` (adresa, titulek, popis, `noindex`) |
| `src/components/pages/` | Obsah stránek, jedna komponenta na stránku |
| `src/components/SiteHeader.tsx`, `SiteFooter.tsx` | Hlavička s menu a patička |
| `src/components/FaqSekce.tsx` | Časté otázky vykreslené přímo z `faq.json` (stránky kalkulaček) |
| `src/components/JsonLd.tsx` | Vložení strukturovaných dat (schema.org) do stránky |
| `src/components/KalkulackaInteraktivni.tsx`, `PrepinacOboru.tsx` | Kalkulačky úspor, viz [kalkulacky.md](kalkulacky.md) |
| `src/components/PrehledFunkciSeznam.tsx` | Hledání a katalog na stránce Přehled funkcí, viz [prehled-funkci.md](prehled-funkci.md) |
| `src/content/faq.json` | Časté otázky podle adresy stránky |
| `src/content/prehled-funkci.json` | Katalog funkcí: fáze, oblasti, funkce, role |
| `src/lib/odhadUspor.ts` | Výpočet a nastavení kalkulaček, sdílí ho stránka i server |
| `src/lib/shrnutiPdf.ts`, `businessCaseExcel.ts` | PDF se shrnutím a předvyplněný Excel s business casem |
| `src/lib/posta.ts`, `emailOdhad.ts`, `formular.ts` | Odesílání e-mailů přes Microsoft 365, texty e-mailů, společné kontroly formulářů |
| `src/app/api/business-case/`, `src/app/api/shrnuti/` | Formuláře kalkulaček, viz [formulare-a-emaily.md](formulare-a-emaily.md) |
| `src/app/robots.ts`, `sitemap.ts`, `llms.txt/route.ts` | robots.txt, mapa webu, přehled pro AI asistenty |
| `src/app/not-found.tsx` | Stránka 404 s odkazy na hlavní stránky |
| `src/app/globals.css` | Globální styly a pravidla rozvržení podle výšky okna, viz [vzhled-a-rozvrzeni.md](vzhled-a-rozvrzeni.md) |
| `src/assets/fonts/` | Písmo Schibsted Grotesk pro PDF (licence OFL v `OFL.txt`) |
| `public/brand/`, `public/logos/`, `public/screens/` | Logo AristoTela, loga zákazníků, snímky aplikace |
| `next.config.ts` | Bezpečnostní hlavičky, soubory přibalené k API, přesměrování starých adres (zatím prázdné) |
| `tests/odhadUspor.test.mjs` | Testy výpočtu kalkulaček |
| `scripts/kontrola-obrazovek.mjs`, `kontrola-dokumentace.mjs` | Kontrola rozvržení v prohlížeči a kontrola dokumentace proti kódu |
| `docs/` | Tato dokumentace |
| `AGENTS.md` | Upozornění pro AI asistenty od Next.js; zapisuje ho `next dev`, ručně se neupravuje |

## Stránky a adresy

Seznam stránek je na dvou místech a obě musí souhlasit:

- `PAGES` v `src/lib/site.ts`: titulek a popis pro vyhledávače, statické generování, mapa webu a `llms.txt`,
- `COMPONENTS` v `src/app/[[...slug]]/page.tsx`: která komponenta se na adrese vykreslí.

Postup pro novou stránku:

1. Komponenta v `src/components/pages/`. Každá část stránky je `<section>` přímo v `<main>`, kvůli pravidlu
   [jedna část = jedna obrazovka](vzhled-a-rozvrzeni.md).
2. Záznam v `PAGES`. Titulek se v prohlížeči doplní o „| AristoTelos“ (šablona v `layout.tsx`),
   úvodní stránka má titulek „AristoTelos – …“.
3. Záznam v `COMPONENTS`.
4. Odkaz v menu (`SiteHeader.tsx`: nabídky `PRODUKT` a `RESENI`, samostatné odkazy `PRED` a `ZA`), v patičce
   (`SiteFooter.tsx`) a případně v `not-found.tsx`.
5. Časté otázky: záznam v `faq.json` pod adresou stránky, viz [obsah-a-texty.md](obsah-a-texty.md#časté-otázky).
6. Kontroly z [nasazeni-a-kontroly.md](nasazeni-a-kontroly.md#kontroly-před-nahráním).

Stránka, která nemá být ve vyhledávačích (dnes jen Ochrana osobních údajů), dostane v `PAGES` `noindex: true`:
vypadne z mapy webu i z `llms.txt` a má značku noindex.

## Vyhledávače a AI asistenti

- Metadata: titulek, popis, canonical a Open Graph z `PAGES` (`generateMetadata` v `page.tsx`).
- Strukturovaná data: Organization a SoftwareApplication v `layout.tsx`, FAQPage na stránkách s častými otázkami,
  ItemList oblastí na Přehledu funkcí.
- `robots.txt` povoluje celý web všem robotům včetně AI (GPTBot, ClaudeBot, PerplexityBot a další) kromě `/studio`
  (místo pro budoucí Sanity Studio).
- `llms.txt` je stručný popis firmy a seznam stránek pro AI asistenty. Klíčová fakta jsou v něm napsaná ručně,
  při změně čísel na webu je potřeba je upravit i tam.
- Indexování je zapnuté jen na produkční doméně, viz [nasazeni-a-kontroly.md](nasazeni-a-kontroly.md#indexování).

## Styly

Většina stylů je přímo v komponentách (atribut `style`), protože stránky vznikly převodem z návrhu na plátně.
V `globals.css` je to, co v atributu `style` nejde: pravidla podle šířky a výšky okna, stavy (hover, vybraná záložka),
pravidlo jedna část = jedna obrazovka a třídy jednotlivých stránek. Písma Schibsted Grotesk a IBM Plex Mono se
načítají z balíčků `@fontsource` v `layout.tsx`.

Barvy: tmavá #0E1A24 (text, tmavé části), modrá #006E99 a #0072A3 (odkazy, tlačítka), oranžová #FF6633 (akcent,
podtržení aktivní položky menu), šedé texty #33424F a #4A5866, světlé pozadí #F5F8FA.

## Bezpečnost

`next.config.ts` posílá hlavičky `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` a `Permissions-Policy`
a nastavením `poweredByHeader: false` skrývá hlavičku X-Powered-By. Content Security Policy zatím není (je v seznamu před spuštěním v README).
Ochrana formulářů je popsaná v [formulare-a-emaily.md](formulare-a-emaily.md#ochrana-proti-zneužití).
