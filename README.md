# Web AristoTelos

Nový web aristotelos.com: Next.js 16 (App Router) na Vercelu, obsah později v Sanity.
Zkušební adresa: https://aristotelos-web.vercel.app

## Spuštění na vlastním počítači

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # testy výpočtu kalkulaček
npm run typecheck
npm run lint
npm run build        # produkční build, musí projít bez chyb
```

Potřebujete Node.js 22.18 nebo novější. Proměnné prostředí jsou popsané v `.env.example`, pro běh na vlastním počítači
nejsou potřeba (formuláře pak žádosti jen vypíšou do konzole).

## Dokumentace

| Dokument | O čem je |
| --- | --- |
| [Architektura](docs/architektura.md) | Mapa souborů, stránky a adresy, nová stránka, vyhledávače a AI, styly, bezpečnostní hlavičky |
| [Vzhled a rozvržení](docs/vzhled-a-rozvrzeni.md) | Pravidla první obrazovka a jedna část = jedna obrazovka, kontrola v 11 velikostech okna, snímky aplikace |
| [Obsah a texty](docs/obsah-a-texty.md) | Slovník webu, pravidla pro tvrzení, časté otázky, kontaktní údaje |
| [Přehled funkcí](docs/prehled-funkci.md) | Stránka `/prehled-funkci`: formát dat, kotvy, hledání |
| [Kalkulačky úspor](docs/kalkulacky.md) | Adresy, kód a postup při změně čísel |
| [Formuláře a e-maily](docs/formulare-a-emaily.md) | Shrnutí v PDF, business case, ochrana proti zneužití, nastavení Microsoft 365 |
| [Nasazení a kontroly](docs/nasazeni-a-kontroly.md) | GitHub a Vercel, proměnné prostředí, indexování, kontroly a pořadí commitů |
| [Slovník pro anglickou verzi](docs/slovnik-en.md) | České pojmy webu a anglické pojmy z aplikace |
| [Kalkulačky úspor – jak fungují](https://claude.ai/artifact/JcKC8bD72qHweAQEBNdWNL) | Živý dokument mimo repozitář: vzorce, výchozí hodnoty, zdroje, návod pro obchod, historie změn |

`CLAUDE.md` jsou pokyny pro AI asistenta Claude, `AGENTS.md` je upozornění od Next.js pro AI asistenty.

## Co ještě chybí před spuštěním

- Odesílání formuláře „Domluvit ukázku“ (stejným způsobem jako business case)
- Nastavení odesílání e-mailů v Microsoft 365 a proměnných na Vercelu
- Odkaz na aplikaci v Google Play, certifikát ISO ke stažení
- Přesměrování starých adres (`next.config.ts` → `redirects`)
- Content Security Policy a hlídání závislostí (Dependabot)
- Napojení obsahu na Sanity (projekt `kgbqsodt`, dataset `production`)
- Verze SK a EN, měření návštěvnosti s cookie lištou (měřit až po souhlasu)
- Tarif Vercel Pro (Hobby je jen pro nekomerční weby), připojení domény a Google Search Console
