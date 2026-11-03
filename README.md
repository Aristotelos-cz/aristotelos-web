# Web AristoTelos

Nový web aristotelos.com: Next.js (App Router) na Vercelu, obsah později v Sanity.

## Spuštění na vlastním počítači

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # produkční build (musí projít bez chyb)
npm run lint
```

Potřebujete Node.js 20.9 nebo novější.

## Struktura

| Kde | Co tam je |
| --- | --- |
| `src/app/[[...slug]]/page.tsx` | Všechny stránky webu: adresa → komponenta, metadata, FAQ pro vyhledávače |
| `src/components/pages/` | Obsah jednotlivých stránek (převedený z návrhu na plátně) |
| `src/components/SiteHeader.tsx`, `SiteFooter.tsx` | Hlavička a patička |
| `src/components/KalkulackaInteraktivni.tsx` | Kalkulačka úspor (počítá v prohlížeči) |
| `src/lib/site.ts` | Seznam stránek, titulky a popisy pro vyhledávače, adresa webu |
| `src/content/faq.json` | Časté otázky pro strukturovaná data (schema.org FAQPage) |
| `src/app/robots.ts`, `sitemap.ts`, `llms.txt/` | robots.txt (AI boti povoleni), mapa webu, přehled pro AI asistenty |
| `public/` | Logo, loga zákazníků, snímky aplikace |

## Proměnné prostředí

Viz `.env.example`. Na Vercelu nastavte `NEXT_PUBLIC_SITE_URL` na produkční adresu.
Náhledová nasazení na Vercelu mají automaticky zakázané indexování.

## Co ještě chybí před spuštěním

- Odesílání formulářů (ukázka, business case) – zatím jen potvrzení na stránce
- Odkaz na aplikaci v Google Play, certifikát ISO ke stažení
- Přesměrování starých adres (`next.config.ts` → `redirects`)
- Napojení obsahu na Sanity (projekt `kgbqsodt`, dataset `production`)
- Verze SK a EN, měření návštěvnosti s cookie lištou
- Tarif Vercel Pro před spuštěním (Hobby je jen pro nekomerční weby)
