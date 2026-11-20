# Vzhled a rozvržení

## Pravidlo: první obrazovka

Úvod každé stránky (nadpis, text, hlavní tlačítko a obrázek, u kalkulačky celé zadání i výsledek) musí být vidět celý
hned po otevření, bez posouvání, na každé velikosti displeje. Na tabletu na výšku a na telefonech musí být vidět nadpis,
text a hlavní tlačítko, u kalkulačky zadání a souhrn výsledku.

## Pravidlo: jedna část = jedna obrazovka

Každá část stránky (`main > section`) vyplní celou viditelnou plochu pod hlavičkou, obsah je svisle uprostřed
a posouvání se zastaví na začátku části (`scroll-snap`), takže z další části není nic vidět. Na počítači se každá část
vejde celá na jednu obrazovku: mezery, nadpisy a snímky se řídí výškou okna a na nízkých oknech se obsah mírně zmenší
(`zoom` 0,94 až 0,84). Na telefonu jsou delší části vyšší než obrazovka.

Jak to funguje v `src/app/globals.css`:

- `main > section` má minimální výšku okna bez hlavičky, je to sloupec se svisle vycentrovaným obsahem.
- Výška hlavičky je v proměnné `--hlavicka: 73px`. Když se výška hlavičky změní (například nová položka menu zalomí řádek),
  musí se změnit i proměnná, jinak pravidlo přestane sedět. Kontrolní skript to odhalí.
- Od šířky 1200 px je hlavička přichycená nahoře a části začínají pod ní. Pod 1200 px hlavička odjede a menu je
  pod tlačítkem „Menu“.
- Mezery a velikost nadpisů v úvodech řídí třídy `hero-*` (úvodní stránka a podstránky) a `kalk-*` (kalkulačky),
  nadpisy částí používají `clamp(…, min(…vw, …vh), …)`.

Výjimka je Přehled funkcí: úvod je nízký, aby byly záložky fází vidět hned po otevření, a katalog je delší než obrazovka,
protože funkce se nezbalují. Ostatní části té stránky (role, výzva k ukázce) pravidlo dodržují.

## Kontrola v 11 velikostech okna

Před každým nahráním změny vzhledu nebo textu se pravidla kontrolují v těchto oknech:

| Zařízení | Velikosti |
| --- | --- |
| Počítač | 1920 × 960, 1536 × 730, 1470 × 835, 1440 × 780, 1366 × 625, 1280 × 680, 1280 × 600, 1024 × 700 |
| Tablet na výšku | 768 × 950 |
| Telefon | 390 × 700, 360 × 640 |

Kontrolu dělá `scripts/kontrola-obrazovek.mjs` (projde všechny stránky z `PAGES` ve všech velikostech):

```bash
npm run build && npm start                      # web na http://localhost:3000
npm install --no-save playwright && npx playwright install chromium   # jednou, Playwright není v závislostech
node scripts/kontrola-obrazovek.mjs             # nebo s adresou a velikostmi: … http://localhost:3000 1470x835,390x700
```

Chyby (úvod přesahuje nebo je pod ním vidět další část, část nižší než obrazovka, přetečení do šířky) ukončí skript
s kódem 1. Části vyšší než obrazovka na počítači skript vypíše jako upozornění. Dnes jich je nula a tak to má zůstat:
před nahráním upravte rozvržení, aby se část vešla.

Když se část na nízkém nebo užším okně nevejde, nemění se text, ale rozložení jen pro ta okna (pravidla
`@media (min-width: 1001px) and (max-height: …)` v `globals.css`). Příklady:

- víc sloupců, aby karty zabraly méně řad (`reseni-mrizka` na úvodní stránce, `it-mrizka` na Bankách a pojišťovnách),
- těsnější mezery a okraje karet (`it-mrizka`, `provoz-karta`, `sla-blok` na Bezpečnosti),
- číslo a popis vedle sebe místo pod sebou (`sla-karta`).

## Snímky aplikace

- Snímky z ostrého provozu se před použitím anonymizují: název klienta, názvy front a jména zaměstnanců se nahradí
  neutrálními.
- Formát WebP v `public/screens/`, pojmenování podle stránky a obsahu (`funkce-…`, `mobil-…`, `nahled-…`).
- Na stránce Od předpovědi po mzdy (`/funkce`) jsou snímky široké pásy (poměr stran zhruba 4 : 1 až 5 : 1), aby vyplnily
  celou šířku části a vedle snímku nezůstávalo prázdné místo. V nízkém okně se pás nezužuje, jen se zespodu ořízne
  (třída `snimek-pas`), grafy se neořezávají (`snimek-graf`), dva grafy vedle sebe drží `snimek-dvojice`.
  Nový snímek proto ořízněte na pás a to důležité dejte nahoru. Na telefonu se ukáže levá část pásu ve větším měřítku.
- Telefony v částech mají šířku podle výšky okna (pravidlo pro obrázky `/screens/mobil-…` v `globals.css`).

## Seznamy a texty v částech

- Na stránce Od předpovědi po mzdy má každá část osm bodů a každý bod má dva řádky, aby řádky seznamu byly stejně vysoké.
- Časté otázky jsou na širších obrazovkách ve dvou sloupcích (`faq-mrizka`), aby se část vešla na obrazovku.

## Kalkulačky

Obě kalkulačky mají zadání i výsledek na stejném místě a ve stejné velikosti, aby při přepínání nic neposkakovalo:
nadpis a úvodní věta na jeden řádek, kalkulačka vysoká jako okno, nejvýš 800 px. Na oknech nižších než 800 px se schovají
nápovědy u polí (`kalk-napoveda`), pod 700 px i posuvníky (`kalk-posuvnik`).

## Přehled funkcí

Záložky fází (`pf-zalozky`) zůstávají při posouvání nahoře, na šířce od 1200 px pod přichycenou hlavičkou.
Pod 1000 px se řada záložek posouvá do strany a vybraná záložka se sama posune do zorného pole.
Výsledky hledání tečou do tří sloupců (dvou pod 1000 px, jednoho pod 700 px), oblast s nejvýš deseti nálezy se nerozdělí
mezi sloupce (`pf-skupina-cela`) a hledaná slova jsou podsvícená (`mark`).
