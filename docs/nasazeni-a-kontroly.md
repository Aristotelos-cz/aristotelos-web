# Nasazení a kontroly

## Kde web běží

| Co | Kde |
| --- | --- |
| Repozitář | GitHub `Aristotelos-cz/aristotelos-web`, větev `main`, veřejný |
| Hosting | Vercel, projekt aristotelos-web, nasazuje se automaticky po každém commitu do `main` |
| Zkušební adresa | https://aristotelos-web.vercel.app (skrytá před vyhledávači) |
| Produkční doména | aristotelos.com, zatím nepřipojená (běží na ní starý web) |

Vercelová aplikace pro GitHub má přístup jen k tomuto repozitáři.

## Proměnné prostředí

| Proměnná | Povinná | Význam |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ne | Produkční adresa pro canonical, mapu webu a robots.txt, výchozí `https://aristotelos.com` |
| `SITE_INDEXING` | ne | `on` nebo `off` ručně zapne nebo vypne indexování, bez nastavení rozhoduje doména (níže) |
| `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MAIL_FROM` | pro e-maily | Odesílání přes Microsoft 365, viz [formulare-a-emaily.md](formulare-a-emaily.md#odesílání-přes-microsoft-365) |
| `LEAD_EMAIL_TO` | ne | Kam chodí žádosti obchodu, výchozí `info@aristotelos.com` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | ne | Připravené pro Sanity (`kgbqsodt`, `production`), kód je zatím nepoužívá |

Vzor je v `.env.example`. Soubory `.env*` se do repozitáře nedávají, výjimkou je jen `.env.example`.

## Indexování

Vyhledávače web indexují, jen když běží jako produkční nasazení na doméně z `NEXT_PUBLIC_SITE_URL`
(`INDEXABLE` v `src/lib/site.ts`). Adresa `*.vercel.app` i náhledová nasazení jsou skryté (robots.txt zakáže vše
a stránky mají značku noindex), aby nekonkurovaly starému webu. Na vlastním počítači (bez `VERCEL_ENV`) je indexování
zapnuté. Po připojení domény aristotelos.com na Vercelu stačí web znovu nasadit a indexování se zapne samo.

## Kontroly před nahráním

```bash
npm test             # výpočet kalkulaček
npm run typecheck
npm run lint
npm run build        # musí projít bez chyb, jinak Vercel nenasadí
node scripts/kontrola-dokumentace.mjs   # odkazy, cesty a názvy v dokumentaci existují v kódu
```

Potřebujete Node.js 22.18 nebo novější: testy spouštějí TypeScript přímo v Node.js. Samotný Next.js by stačil s 20.9.

Kontrola dokumentace najde jen to, co v kódu chybí (přejmenovaný soubor, smazanou konstantu, rozbitý odkaz). Jestli
dokument správně popisuje chování, je potřeba ověřit při každé změně ručně.

Po změně vzhledu nebo textů navíc kontrola rozvržení v 11 velikostech okna, viz
[vzhled-a-rozvrzeni.md](vzhled-a-rozvrzeni.md#kontrola-v-11-velikostech-okna).

## Nahrání a pořadí commitů

Každý commit do `main` se hned nasazuje, proto musí každý commit sám o sobě projít sestavením. Když změna zasahuje
do víc souborů, které na sobě závisí, nahrávejte je v takovém pořadí, aby po každém commitu web šel sestavit
(například nejdřív nová data i se starou strukturou, pak kód, nakonec úklid). Neúspěšné sestavení posílá e-maily
o chybě nasazení.

Po nahrání ověřte, že Vercel nasazení dokončil (stav commitu na GitHubu je „success“), a projděte změnu na zkušební adrese.

## Co je v repozitáři záměrně jinak

- Šablona business casu `src/assets/business-case-sablona.xlsx` v repozitáři není a do veřejného repozitáře se nedává.
- `AGENTS.md` zapisuje a obnovuje `next dev`, ručně se neupravuje.
- Playwright pro kontrolu rozvržení není v závislostech, aby se neinstaloval při každém nasazení.
