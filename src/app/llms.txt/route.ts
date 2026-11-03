import { PAGES, SITE_URL } from '@/lib/site'

// Stručný přehled webu pro AI asistenty (https://llmstxt.org)
export const dynamic = 'force-static'

export function GET() {
  const pages = PAGES.filter((p) => !p.noindex)
    .map((p) => `- [${p.title}](${SITE_URL}${p.path === '/' ? '' : p.path}): ${p.description}`)
    .join('\n')
  const body = `# AristoTelos

> AristoTelos je český software pro automatické plánování směn a evidenci docházky (workforce management). Plán směn sestaví za hodiny místo dnů a vždy dodrží zákoník práce. Vyvíjí ho firma Matematické a Statistické Projekty a Software s.r.o. v Praze od roku 2009. Používají ho Albert, Benu, ČSOB, T-Mobile, innogy, Kooperativa a další; plánuje směny pro více než 20 000 lidí v Česku a na Slovensku.

Klíčová fakta:
- Předpověď objemu práce po 15, 30 nebo 60 minutách, automatické plánování směn matematickým modelem, přání zaměstnanců, řízení provozu, docházka a podklady pro mzdy.
- Mobilní aplikace pro iOS a Android (česky, slovensky, anglicky, maďarsky).
- Otevřené API, napojení na Genesys, Cisco, Daktelu, Sprinkl, SAP a personální a docházkové systémy.
- Pracovní právo nastavené pro Česko, Slovensko, Německo a Rakousko.
- Certifikace ISO/IEC 27001:2022, každoroční penetrační testy, provoz v datovém centru ČRa (Tier III) nebo u zákazníka.
- Nasazení typicky 3 až 9 měsíců. Ceny se připravují na míru.
- Kontakt: info@aristotelos.com, +420 606 337 182.

## Stránky

${pages}
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
