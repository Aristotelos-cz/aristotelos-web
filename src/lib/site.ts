// Základní údaje o webu a stránkách (metadata, sitemap, llms.txt)
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aristotelos.com').replace(/\/$/, '')

export type PageInfo = { path: string; title: string; description: string; noindex?: boolean }

export const PAGES: PageInfo[] = [
  { path: '/', title: 'Plánování směn a docházka', description: 'AristoTelos naplánuje směny za hodiny místo dnů, vždy podle zákoníku práce. Docházka, mobilní aplikace pro iOS a Android a otevřené API.' },
  { path: '/funkce', title: 'Funkce plánování směn a docházky', description: 'Předpověď objemu práce, automatické plánování směn, přání zaměstnanců, řízení provozu, docházka, mobilní aplikace, reporty a podklady pro mzdy.' },
  { path: '/mobilni-aplikace', title: 'Mobilní aplikace pro plánování směn', description: 'Zaměstnanci v aplikaci pro iOS a Android vidí své směny, zadávají přání, vyměňují si směny a potvrzují plán i docházku.' },
  { path: '/integrace-a-api', title: 'Integrace a API', description: 'AristoTelos se napojí na personální, mzdové a docházkové systémy, na Genesys, Cisco, Daktelu, Sprinkl i SAP. Přes API, databázi nebo soubory.' },
  { path: '/reseni/kontaktni-centra', title: 'Plánování směn pro kontaktní centra', description: 'Předpověď hovorů po 15 minutách, počet agentů na úroveň obsluhy a napojení na Genesys, Cisco, Daktelu a Sprinkl. Používají ČSOB, Kooperativa a Conectart.' },
  { path: '/reseni/obchodni-retezce-a-lekarny', title: 'Plánování směn pro obchody a lékárny', description: 'Směny podle návštěvnosti a prodejů, výpomoc mezi prodejnami a docházka v jednom systému. Používají Albert, Benu a Sconto.' },
  { path: '/reseni/distribucni-centra', title: 'Plánování směn pro sklady a distribuční centra', description: 'Rotace směn, konto pracovní doby, spravedlivé noci a víkendy i agenturní pracovníci. Plán směn za 2–3 hodiny místo 2–3 dnů.' },
  { path: '/reseni/banky-a-pojistovny', title: 'Plánování směn pro banky a pojišťovny', description: 'ISO/IEC 27001, každoroční penetrační testy, jednotné přihlášení a provoz i ve vaší infrastruktuře. Používají ČSOB, Kooperativa a Generali Česká pojišťovna.' },
  { path: '/reseni/energetika-a-telekomunikace', title: 'Plánování směn pro energetiku a telekomunikace', description: 'Kontaktní centra, zákaznické kanceláře i značkové prodejny v jednom plánu. Používají innogy, T-Mobile a Pražská energetika.' },
  { path: '/reference', title: 'Reference a případové studie', description: 'Plánujeme směny pro více než 20 000 lidí. Albert, Benu, ČSOB, T-Mobile, innogy, Kooperativa a další: počty lidí, napojení a zkušenosti.' },
  { path: '/bezpecnost', title: 'Bezpečnost a ISO/IEC 27001', description: 'Certifikace ISO/IEC 27001:2022, každoroční penetrační testy, jednotné přihlášení, audit změn a provoz v datovém centru ČRa s úrovní Tier III.' },
  { path: '/o-nas', title: 'O nás', description: 'AristoTelos vyvíjíme sami v Praze od roku 2009. Tým matematiků a fyziků, vlastní optimalizační model a plánování směn do hloubky.' },
  { path: '/kalkulacka-uspor', title: 'Kalkulačka úspor z plánování směn', description: 'Spočítejte si, kolik ušetříte automatickým plánováním směn: obsazení provozu, přesčasy, čas vedoucích a fluktuace.' },
  { path: '/ochrana-osobnich-udaju', title: 'Ochrana osobních údajů', description: 'Jak AristoTelos zachází s osobními údaji z webu, formuláře pro ukázku a obchodní komunikace.', noindex: true },
]

export function pageInfo(path: string): PageInfo {
  const p = PAGES.find((x) => x.path === path)
  if (!p) throw new Error('Neznámá stránka ' + path)
  return p
}
