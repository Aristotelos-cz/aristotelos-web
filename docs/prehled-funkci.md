# Přehled funkcí

Stránka `/prehled-funkci` ukazuje všechny funkce AristoTela: 233 funkcí ve 21 oblastech a šesti fázích práce
(Základ, Plánování, Provoz, Docházka a mzdy, Integrace, Platforma) a sedm rolí. Nahoře je hledání, pod ním záložky
fází a pod nimi všechny funkce vybrané fáze, oblast po oblasti. Ostatní fáze zůstávají v HTML, jen skryté,
aby je četly vyhledávače i AI.

Vede na ni hlavní menu (Produkt → Přehled funkcí), odkazy „Všechny funkce … →“ pod částmi stránky Od předpovědi po mzdy,
patička a stránka 404.

## Soubory

| Soubor | Co dělá |
| --- | --- |
| `src/content/prehled-funkci.json` | Obsah: fáze, oblasti, skupiny, funkce a role |
| `src/components/PrehledFunkciSeznam.tsx` | Úvod s hledáním, záložky fází, katalog, výsledky hledání, ikony oblastí (`IKONY`) |
| `src/components/pages/PrehledFunkci.tsx` | Stránka: seznam, role, výzva k ukázce, strukturovaná data ItemList |
| `src/app/globals.css` | Třídy `pf-*` |

## Formát dat

```json
{
  "faze": [
    { "id": "dochazka", "nazev": "Docházka a mzdy", "popis": "…",
      "oblasti": [
        { "id": "nepritomnosti", "nazev": "Nepřítomnosti a dovolené", "popis": "Jedna věta o oblasti.",
          "skupiny": [ { "nazev": "Nepovinný mezititulek", "funkce": [ { "n": "Název", "p": "Jedna věta, co umí." } ] } ] }
      ] }
  ],
  "role": [ { "n": "Název role", "p": "Jedna věta." } ]
}
```

- Novou funkci přidáte jako `{ "n": "…", "p": "…" }` do správné oblasti. Počty na stránce, v hledání
  i ve strukturovaných datech se přepočítají samy.
- Nová oblast potřebuje `id`, `nazev`, `popis` a ikonu v `IKONY` v `PrehledFunkciSeznam.tsx` (cesta SVG v mřížce 24 × 24,
  kreslená obrysem). `id` je zároveň kotva v adrese, proto musí být jedinečné a nesmí se shodovat s jinými `id`
  na stránce (`obsah`, `prehled`, `demo`, `pf-dotaz`, `pf-role`, `hlavni-menu`, `menu-produkt`, `menu-reseni`).
- Celkové počty jsou napsané ručně v popisu stránky v `PAGES` a v `llms.txt` („více než 200 funkcí ve 21 oblastech“).
  Při přidání nebo odebrání oblasti je upravte.

## Kotvy

Odkaz s kotvou oblasti, například `/prehled-funkci#dochazka`, přepne na fázi, do které oblast patří, a posune na ni.
Kotvy používají odkazy ze stránky Od předpovědi po mzdy. Kotva se hledá jen mezi oblastmi, takže `#planovani` nebo
`#dochazka` znamená oblast, i když se stejně jmenuje fáze.

## Hledání

- Hledá se bez ohledu na velikost písmen a diakritiku. Slova kratší než dva znaky se přeskočí.
- Slova delší než čtyři znaky se zkracují o dva znaky na kmen, takže „dovolená“ najde i „dovolenou“ a „dovolené“.
- Funkce se najde, když její název a popis dohromady obsahují všechna hledaná slova. Když je všechna obsahuje
  název oblasti, ukáže se celá oblast.
- Během hledání se záložky schovají a výsledky se ukážou po oblastech s číslem a názvem fáze.
- Nalezená slova jsou podsvícená celá, i když se shoduje jen jejich část (komponenta `Zvyrazni`).
- Rychlé dotazy pod polem jsou v `NAPOVEDY`.

## Pravidla pro obsah

Platí [obsah a texty](obsah-a-texty.md), zvlášť to, že přehled tvrzení ostatních stránek nezeslabuje, nepíše se
„modul navíc“ a API se popisuje oblastmi bez technických názvů rozhraní.
