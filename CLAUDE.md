# CLAUDE.md

@AGENTS.md

Web aristotelos.com: Next.js 16 (App Router), React 19, Vercel. Uživatel je obchodník AristoTelos, ne programátor.
Komunikuj česky, krátce a bez technického žargonu. Komentáře v kódu a dokumentace jsou česky.

## Příkazy

```bash
npm test && npm run typecheck && npm run lint && npm run build   # vše musí projít před nahráním
node scripts/kontrola-dokumentace.mjs                             # dokumentace proti kódu
node scripts/kontrola-obrazovek.mjs http://localhost:3000        # rozvržení, 17 stránek × 11 oken (potřebuje Playwright)
```

## Kde co je

- Stránky: `PAGES` v `src/lib/site.ts` + `COMPONENTS` v `src/app/[[...slug]]/page.tsx` (obojí musí souhlasit), obsah v `src/components/pages/`.
- Kalkulačky: `src/lib/odhadUspor.ts` (jediný zdroj čísel), testy `tests/odhadUspor.test.mjs`.
- Přehled funkcí: `src/content/prehled-funkci.json`, `src/components/PrehledFunkciSeznam.tsx`.
- Časté otázky: `src/content/faq.json`. Rozvržení: `src/app/globals.css`.
- Podrobnosti: README → `docs/`. Než něco měníš, přečti příslušný dokument.

## Závazná pravidla

- **Jedna část = jedna obrazovka.** Každá `main > section` vyplní obrazovku a na počítači se do ní vejde. Po každé změně
  vzhledu nebo textu spusť kontrolu rozvržení v 11 oknech a nenahrávej, dokud hlásí chyby. Nové přesahy nepřidávej.
  Výjimka: katalog na `/prehled-funkci`. Výška hlavičky je natvrdo v `--hlavicka: 73px`.
- **Slovník:** pracovníci (ne lidé), operátoři (ne agenti, linka), distribuční centra (ne DC), Veřejný plán (Main schedule).
  Výjimky a další pravidla: `docs/obsah-a-texty.md`.
- **Fakta musí souhlasit všude:** stránky, `PAGES`, `llms.txt`, `faq.json`, strukturovaná data. Text častých otázek je
  na stránkách mimo kalkulačky napsaný dvakrát (komponenta a `faq.json`), uprav obě místa.
- **Kalkulačky:** po změně uprav testy a ve stejný den živý dokument „Kalkulačky úspor – jak fungují“
  (https://claude.ai/artifact/JcKC8bD72qHweAQEBNdWNL) včetně řádku v Historii změn.
- **Dokumentace drží krok s kódem:** změna chování, souboru nebo pravidla = úprava dokumentu v `docs/` ve stejném nahrání.
- **Snímky z ostrého provozu** před použitím anonymizuj (klient, fronty, jména). Na `/funkce` jen široké pásy.
- **Repozitář je veřejný.** Nikdy do něj nedávej `src/assets/business-case-sablona.xlsx` ani nic tajného.
- **Tajné hodnoty, hesla a ověřovací kódy** (Vercel, Microsoft 365, GitHub) zadává uživatel sám. Ty je nezadáváš.
- **Měření návštěvnosti** jen po souhlasu s cookies.
- Závislosti neaktualizuj bez souhlasu uživatele. `AGENTS.md` neupravuj, zapisuje ho `next dev`.

## Nahrávání (z cloudové relace)

`git push` z cloudu nejde, nahrává se přes webové rozhraní GitHubu v Chrome uživatele (Claude in Chrome, uživatel je přihlášený).

1. Každý commit musí sám projít sestavením, Vercel nasazuje po každém. Závislé soubory nahrávej v pořadí, které to zajistí.
2. Soubory zkopíruj do `/mnt/user-data/uploads/aristotelos-web/<stejná cesta>` a nahraj na
   `github.com/Aristotelos-cz/aristotelos-web/upload/main/<složka>` (pole „choose your files“). Před potvrzením
   zkontroluj, že seznam nahraných souborů přesně odpovídá.
3. Složky s hranatými závorkami (`[[...slug]]`) přes upload nejdou: uprav soubor na stránce `/edit/main/<cesta>`.
4. Ověř: hashe souborů v `git/trees/main` = `git hash-object` místních souborů, stav commitu na Vercelu „success“,
   změna na https://aristotelos-web.vercel.app (z cloudu je vercel.app nedostupná, ověřuj v Chrome). Zavři své záložky.
