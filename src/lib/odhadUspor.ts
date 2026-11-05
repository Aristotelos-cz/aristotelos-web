// Výpočet kalkulaček úspor (kontaktní centrum, retail). Používá ho stránka (živý odhad)
// i server (e-maily, PDF a Excel), aby čísla v e-mailu a PDF vždy odpovídala tomu, co návštěvník viděl.
// Pozor: soubor spouští i testy přímo v Node.js, proto bez enumů a bez importů s aliasem @/.

// ---------- Společné ----------

export type Obor = 'kontaktni-centrum' | 'retail'
export const OBORY: Obor[] = ['kontaktni-centrum', 'retail']
export const ADRESA: Record<Obor, string> = {
  'kontaktni-centrum': '/kalkulacka-uspor/kontaktni-centrum',
  retail: '/kalkulacka-uspor/retail',
}
export const NAZEV_OBORU: Record<Obor, string> = {
  'kontaktni-centrum': 'Kontaktní centrum',
  retail: 'Retail',
}

export const NASOBEK_VEDOUCI = 1.4 // hodinové náklady vedoucího proti průměru
const PRIPLATEK_PRESCAS = 1.25
const FOND_HPP = 38 // hodin týdně na plný úvazek
const FOND_ZKRACENY = 20 // hodin týdně na zkrácený úvazek (jen pro převod do Excelu)
const TYDNU_V_ROCE = 52

export const cislo = (v: unknown, d: number) => {
  const x = parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(x) && x >= 0 ? x : d
}
const omez = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x))

export const nf = (x: number, d = 0) => x.toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d })
/** Číslo s desetinnou čárkou jen tam, kde je potřeba (2; 2,5) */
export const nfp = (x: number) => nf(x, Number.isInteger(Math.round(x * 10) / 10) ? 0 : 1)

export const rozpeti = (lo: number, hi: number) => {
  if (hi >= 1e6) return `${nf(lo / 1e6, 1)}–${nf(hi / 1e6, 1)} mil. Kč`
  if (hi >= 1e4) return `${nf(Math.round(lo / 1e3))}–${nf(Math.round(hi / 1e3))} tis. Kč`
  return `${nf(Math.round(lo / 100) * 100)}–${nf(Math.round(hi / 100) * 100)} Kč`
}
const odDo = (a: number, b: number, jednotka: string) => (nfp(a) === nfp(b) ? `${nfp(a)} ${jednotka}` : `${nfp(a)}–${nfp(b)} ${jednotka}`)

// ---------- Nastavení kalkulaček ----------

/** posuvnik = horní mez posuvníku (do pole jde zapsat víc, až do max); nula = co napsat do e-mailu a PDF, když je 0 („nevím“) */
export type PoleCislo = { typ: 'cislo'; klic: string; label: string; napoveda: string; jednotka: string; min: number; max: number; krok: number; vychozi: number; posuvnik?: number; nula?: string }
export type PoleVolba = { typ: 'volba'; klic: string; label: string; moznosti: { hodnota: string; label: string }[]; vychozi: string }
export type Pole = PoleCislo | PoleVolba

/** Předpoklad s opatrnou a realistickou hodnotou. „jedna“ = jediná hodnota (upřesnění), 0 často znamená „nepočítat“. */
export type Predpoklad = { klic: string; label: string; jednotka: string; min: number; max: number; krok: number; opatrne: number; realisticky: number; jedna?: boolean; napoveda?: string }

export type Odkaz = { nazev: string; url: string }
export type Hodnoty = Record<string, number | string>
export type Scenare = Record<string, [number, number]>
type Kontext = { h: Hodnoty; p: Scenare }

export type OblastInfo = {
  klic: string
  nazev: string
  /** Vzorec pro panel „Jak počítáme“ */
  vzorec: string
  /** Klíče předpokladů, které oblast používá (v tomto pořadí se ukážou v tabulce) */
  predpoklady: string[]
  /** Proč zrovna tato čísla, z jakých zdrojů */
  opora: string
  odkazy: Odkaz[]
  /** hlavni = počítá se vždy, doplnek = jen když uživatel doplní údaj */
  skupina: 'hlavni' | 'doplnek'
  /** Neprojde do součtu (tržby) */
  mimoSoucet?: boolean
  /** Co ukázat v tabulce, když se oblast nepočítá (chybí údaj) */
  neaktivni?: string
}
type OblastDef = OblastInfo & { aktivni?: (k: Kontext) => boolean; spocti: (k: Kontext, s: 0 | 1) => number }

export type Nastaveni = {
  obor: Obor
  pole: Pole[]
  predpoklady: Predpoklad[]
  oblasti: OblastDef[]
  /** Jak se úspora mění podle toho, jak dnes plánují (pro panel předpokladů) */
  nastrojText?: string
  /** Věta pod výsledkem (úvazky, hodiny vedoucích) */
  poznamka?: (k: Kontext, lo: number, hi: number) => string | null
  shrnuti: (k: Kontext, rocne: string) => string
}

const MZDA: PoleCislo = { typ: 'cislo', klic: 'mzda', label: 'Hodinové mzdové náklady', napoveda: 'Průměr včetně odvodů zaměstnavatele.', jednotka: 'Kč/h', min: 120, max: 600, krok: 5, vychozi: 200 }
const n = (k: Kontext, klic: string) => Number(k.h[klic]) || 0
const s1 = (k: Kontext, klic: string) => k.p[klic]?.[0] ?? 0
const ps = (k: Kontext, klic: string, s: 0 | 1) => k.p[klic]?.[s] ?? 0
const PRESCAS_OPORA = 'Případové studie dodavatelů uvádějí pokles přesčasů o 16–70 %, nezávislý zdroj chybí. Proto jen volitelně a opatrně.'
/** Ostatní náklady na zaměstnance (místo, technika, licence, benefity) se připočítají k ušetřeným hodinám. Opatrně polovina, realisticky celé. */
const PODIL_OSTATNICH: Predpoklad = { klic: 'podilOstatnich', label: 'Započtené ostatní náklady', jednotka: '%', min: 0, max: 100, krok: 10, opatrne: 50, realisticky: 100, napoveda: 'jen když jsou zadané' }
const OSTATNI_OPORA = ' Ostatní náklady na zaměstnance počítáme opatrně z poloviny: místo nebo počítač ušetříte, jen když opravdu ubyde pracovníků.'

// ----- Kontaktní centrum -----
const ROK_H = FOND_HPP * TYDNU_V_ROCE // 1 976 h ročně na plný úvazek
const faktorKC = (k: Kontext, oblast: string) => {
  const p = k.h.planovani
  if (p === 's-predpovedi') return 0.5
  if (p === 'bez-predpovedi' && oblast === 'planovaci') return 0.5
  return 1
}

const KONTAKTNI_CENTRUM: Nastaveni = {
  obor: 'kontaktni-centrum',
  nastrojText: 'Když už plánujete v nástroji bez předpovědi, počítáme s polovičním ušetřeným časem plánovačů. S nástrojem s předpovědí počítáme s poloviční úsporou ve všech oblastech. Mzdové náklady plánovačů jsou 1,4násobek průměru, rok má 1 976 h na plný úvazek.',
  pole: [
    { typ: 'cislo', klic: 'operatori', label: 'Počet operátorů', napoveda: 'Přepočtené plné úvazky.', jednotka: 'úvazků', min: 10, max: 10000, krok: 5, vychozi: 100, posuvnik: 1500 },
    MZDA,
    { typ: 'cislo', klic: 'ostatniNaklady', label: 'Ostatní náklady na operátora', napoveda: 'Místo, technika, licence, benefity.', jednotka: 'Kč/měsíc', min: 0, max: 50000, krok: 500, vychozi: 5500, posuvnik: 20000 },
    { typ: 'cislo', klic: 'fluktuace', label: 'Roční fluktuace operátorů', napoveda: 'Odchody za rok, běžně 23–38 %.', jednotka: '%', min: 0, max: 100, krok: 1, vychozi: 30 },
    { typ: 'cislo', klic: 'planovaci', label: 'Plánovači a team leadeři', napoveda: 'Ti, kdo sestavují a mění rozpisy.', jednotka: 'pracovníků', min: 1, max: 500, krok: 1, vychozi: 5, posuvnik: 60 },
    { typ: 'cislo', klic: 'hodinyPlanovani', label: 'Čas plánovače na rozpisy', napoveda: 'Za týden, včetně volna a výměn směn.', jednotka: 'h týdně', min: 0.5, max: 40, krok: 0.5, vychozi: 8, posuvnik: 40 },
    {
      typ: 'volba', klic: 'planovani', label: 'Dnes plánujete', vychozi: 'excel',
      moznosti: [
        { hodnota: 'excel', label: 'v Excelu nebo na papíře' },
        { hodnota: 'bez-predpovedi', label: 'v nástroji bez předpovědi' },
        { hodnota: 's-predpovedi', label: 'v nástroji s předpovědí' },
      ],
    },
  ],
  predpoklady: [
    { klic: 'usporaHodin', label: 'Úspora hodin operátorů', jednotka: '%', min: 0, max: 20, krok: 0.5, opatrne: 3, realisticky: 5 },
    PODIL_OSTATNICH,
    { klic: 'poklesFluktuace', label: 'Pokles fluktuace', jednotka: '%', min: 0, max: 60, krok: 1, opatrne: 10, realisticky: 20 },
    { klic: 'nahrazeni', label: 'Nahrazení operátora (z roční mzdy)', jednotka: '%', min: 0, max: 150, krok: 5, opatrne: 30, realisticky: 40 },
    { klic: 'hodinyPlanovace', label: 'Ušetřený čas plánovače týdně', jednotka: 'h', min: 0, max: 40, krok: 0.5, opatrne: 3, realisticky: 6, napoveda: 'nejvýš zadaný čas na rozpisy' },
    { klic: 'prescasHodiny', label: 'Přesčasové hodiny měsíčně (všichni operátoři)', jednotka: 'h', min: 0, max: 200000, krok: 10, opatrne: 0, realisticky: 0, jedna: true, napoveda: '0 = nepočítat' },
    { klic: 'poklesPrescasu', label: 'Pokles přesčasů', jednotka: '%', min: 0, max: 100, krok: 5, opatrne: 10, realisticky: 20 },
  ],
  oblasti: [
    {
      klic: 'intervaly', nazev: 'Přesnější obsazení intervalů', skupina: 'hlavni', predpoklady: ['usporaHodin', 'podilOstatnich'],
      vzorec: 'operátoři × (1 976 h × Kč/h + ostatní náklady × 12 × podíl) × úspora hodin',
      opora: 'Forrester pro NICE: o 10 % méně operátorů za 3 roky. Počítáme výrazně méně.' + OSTATNI_OPORA,
      odkazy: [{ nazev: 'Forrester pro NICE 2021', url: 'https://resources.martechseries.com/whitepapers/MTH-ORDER-CS-ABM-NICE-6.pdf' }],
      spocti: (k, s) => n(k, 'operatori') * (ROK_H * n(k, 'mzda') + n(k, 'ostatniNaklady') * 12 * (ps(k, 'podilOstatnich', s) / 100)) * (ps(k, 'usporaHodin', s) / 100) * faktorKC(k, 'intervaly'),
    },
    {
      klic: 'fluktuace', nazev: 'Nižší fluktuace operátorů', skupina: 'hlavni', predpoklady: ['poklesFluktuace', 'nahrazeni'],
      vzorec: 'operátoři × fluktuace × pokles × náklady na nahrazení',
      opora: 'SQM: nahrazení stojí 30–50 % roční mzdy. Forrester pro Verint: fluktuace z 35 na 27 %.',
      odkazy: [
        { nazev: 'SQM 2023', url: 'https://www.sqmgroup.com/resources/library/blog/call-center-attrition-rate' },
        { nazev: 'Forrester pro Verint 2021', url: 'https://www.verint.com/wp-content/uploads/Forrester-Total-Economic-Impact-of-Verint-Study_6-2021-1.pdf' },
      ],
      spocti: (k, s) => n(k, 'operatori') * (n(k, 'fluktuace') / 100) * (ps(k, 'poklesFluktuace', s) / 100) * (ps(k, 'nahrazeni', s) / 100) * ROK_H * n(k, 'mzda') * faktorKC(k, 'fluktuace'),
    },
    {
      klic: 'planovaci', nazev: 'Čas plánovačů a team leaderů', skupina: 'hlavni', predpoklady: ['hodinyPlanovace'],
      vzorec: 'plánovači × ušetřené hodiny (nejvýš zadaný čas) × Kč/h × 1,4 × 52',
      opora: 'ICMI: plánovači tráví 8 h týdně jen žádostmi o volno a výměnami směn.',
      odkazy: [{ nazev: 'ICMI 2021', url: 'https://www.callcentrehelper.com/images/resources/2022/nice-imic-state-of-workforce-management-whitepaper-20220128.pdf' }],
      spocti: (k, s) => n(k, 'planovaci') * Math.min(ps(k, 'hodinyPlanovace', s), n(k, 'hodinyPlanovani')) * n(k, 'mzda') * NASOBEK_VEDOUCI * TYDNU_V_ROCE * faktorKC(k, 'planovaci'),
    },
    {
      klic: 'prescasy', nazev: 'Méně přesčasů', skupina: 'doplnek', predpoklady: ['prescasHodiny', 'poklesPrescasu'],
      vzorec: 'přesčasové hodiny × 12 × Kč/h × 1,25 × pokles',
      opora: PRESCAS_OPORA, odkazy: [],
      aktivni: (k) => s1(k, 'prescasHodiny') > 0,
      spocti: (k, s) => s1(k, 'prescasHodiny') * 12 * n(k, 'mzda') * PRIPLATEK_PRESCAS * (ps(k, 'poklesPrescasu', s) / 100) * faktorKC(k, 'prescasy'),
    },
  ],
  poznamka: (k, lo, hi) => {
    const ostatni = n(k, 'ostatniNaklady')
    const rok = ROK_H * n(k, 'mzda') + ostatni * 12
    return rok > 0 && hi > 0 ? `Odpovídá to ${ostatni > 0 ? 'nákladům na' : 'mzdám'} ${odDo(lo / rok, hi / rok, 'operátorů')} na plný úvazek.` : null
  },
  shrnuti: (k, rocne) => `${nf(n(k, 'operatori'))} operátorů, ${nf(n(k, 'mzda'))} Kč/h, fluktuace ${nf(n(k, 'fluktuace'))} %, ${nf(n(k, 'planovaci'))} plánovačů, odhad ${rocne} ročně`,
}

// ----- Retail (obchody a lékárny) -----
const faktorR = (k: Kontext) => (k.h.planovani === 'nastroj' ? 0.5 : 1)
const hodinyVedouciho = (k: Kontext, s: 0 | 1) => Math.min(ps(k, 'hodinyVedouciho', s), n(k, 'hodinyVedouci')) * faktorR(k)
const rocniMzdaR = (k: Kontext) => s1(k, 'uvazek') * TYDNU_V_ROCE * n(k, 'mzda')

const RETAIL: Nastaveni = {
  obor: 'retail',
  nastrojText: 'Když už plánujete v jiném nástroji, počítáme s poloviční úsporou ve všech oblastech. Mzdové náklady vedoucího prodejny jsou 1,4násobek průměru.',
  pole: [
    { typ: 'cislo', klic: 'prodejny', label: 'Počet prodejen', napoveda: 'Prodejny nebo lékárny.', jednotka: 'prodejen', min: 1, max: 5000, krok: 1, vychozi: 50, posuvnik: 600 },
    { typ: 'cislo', klic: 'lide', label: 'Pracovníků na prodejnu', napoveda: 'Průměrně, včetně brigádníků.', jednotka: 'pracovníků', min: 1, max: 500, krok: 1, vychozi: 12, posuvnik: 60 },
    MZDA,
    { typ: 'cislo', klic: 'ostatniNaklady', label: 'Ostatní náklady na zaměstnance', napoveda: 'Oblečení, benefity, školení, technika.', jednotka: 'Kč/měsíc', min: 0, max: 50000, krok: 500, vychozi: 5500, posuvnik: 20000 },
    { typ: 'cislo', klic: 'hodinyVedouci', label: 'Čas vedoucího na rozpisy', napoveda: 'Plánování a změny směn za týden.', jednotka: 'h týdně', min: 0.5, max: 40, krok: 0.5, vychozi: 4, posuvnik: 20 },
    { typ: 'cislo', klic: 'fluktuace', label: 'Roční fluktuace', napoveda: 'Kolik pracovníků za rok odejde.', jednotka: '%', min: 0, max: 200, krok: 1, vychozi: 15, posuvnik: 100 },
    {
      typ: 'volba', klic: 'planovani', label: 'Dnes plánujete', vychozi: 'excel',
      moznosti: [
        { hodnota: 'excel', label: 'na papíře nebo v Excelu' },
        { hodnota: 'nastroj', label: 'v jiném nástroji' },
      ],
    },
  ],
  predpoklady: [
    { klic: 'hodinyVedouciho', label: 'Ušetřený čas vedoucího týdně', jednotka: 'h', min: 0, max: 40, krok: 0.5, opatrne: 2, realisticky: 3, napoveda: 'nejvýš zadaný čas na rozpisy' },
    { klic: 'usporaHodin', label: 'Úspora odpracovaných hodin', jednotka: '%', min: 0, max: 20, krok: 0.5, opatrne: 2, realisticky: 4 },
    { klic: 'uvazek', label: 'Průměrný úvazek na pracovníka', jednotka: 'h týdně', min: 4, max: 48, krok: 1, opatrne: 34, realisticky: 34, jedna: true, napoveda: 'plný úvazek 38 h, část pracovníků má zkrácený' },
    PODIL_OSTATNICH,
    { klic: 'poklesFluktuace', label: 'Pokles fluktuace', jednotka: '%', min: 0, max: 60, krok: 1, opatrne: 10, realisticky: 15 },
    { klic: 'nahrazeni', label: 'Nahrazení pracovníka (z roční mzdy)', jednotka: '%', min: 0, max: 150, krok: 5, opatrne: 15, realisticky: 25 },
    { klic: 'prescasHodiny', label: 'Přesčasové hodiny měsíčně (všechny prodejny)', jednotka: 'h', min: 0, max: 200000, krok: 10, opatrne: 0, realisticky: 0, jedna: true, napoveda: '0 = nepočítat' },
    { klic: 'poklesPrescasu', label: 'Pokles přesčasů', jednotka: '%', min: 0, max: 100, krok: 5, opatrne: 10, realisticky: 20 },
    { klic: 'trzby', label: 'Roční tržby na prodejnu', jednotka: 'mil. Kč', min: 0, max: 10000, krok: 0.5, opatrne: 0, realisticky: 0, jedna: true, napoveda: '0 = nepočítat' },
    { klic: 'rustTrzeb', label: 'Růst tržeb', jednotka: '%', min: 0, max: 10, krok: 0.5, opatrne: 0.5, realisticky: 2 },
  ],
  oblasti: [
    {
      klic: 'vedouci', nazev: 'Čas vedoucích prodejen', skupina: 'hlavni', predpoklady: ['hodinyVedouciho'],
      vzorec: 'prodejny × ušetřené hodiny × Kč/h × 1,4 × 52',
      opora: 'Forrester: vedoucí ušetří 2 h (Quinyx) až 4 h (UKG) týdně. Průzkum Legion: 65 % vedoucích tráví nad rozpisy přes 3 h týdně.',
      odkazy: [
        { nazev: 'Forrester pro Quinyx 2022', url: 'https://www.quinyx.com/hubfs/Forrester_TEI_Quinyx.pdf' },
        { nazev: 'Forrester pro UKG 2022', url: 'https://www.ukg.com/sites/default/files/2025-02/TEI_Of_UKG_Pro_Workforce_Management_Rebrand.pdf' },
        { nazev: 'Legion 2025', url: 'https://hrreview.co.uk/hr-news/administrative-burden-hindering-retail-managers-productivity/381815?amp=1' },
      ],
      spocti: (k, s) => n(k, 'prodejny') * hodinyVedouciho(k, s) * n(k, 'mzda') * NASOBEK_VEDOUCI * TYDNU_V_ROCE,
    },
    {
      klic: 'hodiny', nazev: 'Pracovní doba podle návštěvnosti', skupina: 'hlavni', predpoklady: ['usporaHodin', 'uvazek', 'podilOstatnich'],
      vzorec: 'prodejny × pracovníci × (úvazek × 52 × Kč/h + ostatní náklady × 12 × podíl) × úspora',
      opora: 'McKinsey: plánování podle práce ušetří 4–12 % mezd, v pilotu evropského řetězce 6 %. Počítáme pod spodní hranicí.' + OSTATNI_OPORA,
      odkazy: [{ nazev: 'McKinsey 2015', url: 'https://www.mckinsey.com/~/media/McKinsey/Industries/Retail/Our%20Insights/Smarter%20schedules%20better%20budgets%20How%20to%20improve%20store%20operations/Smarter%20schedules%20better%20budgets%20How%20to%20improve%20store%20operations.pdf' }],
      spocti: (k, s) => n(k, 'prodejny') * n(k, 'lide') * (rocniMzdaR(k) + n(k, 'ostatniNaklady') * 12 * (ps(k, 'podilOstatnich', s) / 100)) * (ps(k, 'usporaHodin', s) / 100) * faktorR(k),
    },
    {
      klic: 'fluktuace', nazev: 'Nižší fluktuace', skupina: 'hlavni', predpoklady: ['poklesFluktuace', 'nahrazeni'], neaktivni: 'zadejte fluktuaci nahoře',
      vzorec: 'pracovníci × fluktuace × pokles × náklady na nahrazení',
      opora: 'Shift Project (1 725 pracovníků v retailu): při rušených směnách odchází 41 % pracovníků, při stabilních 27 %.',
      odkazy: [{ nazev: 'Shift Project', url: 'https://equitablegrowth.org/wp-content/uploads/2019/10/WP-Choper-Schneider-and-Harknett-Uncertain-Time.pdf' }],
      aktivni: (k) => n(k, 'fluktuace') > 0,
      spocti: (k, s) => n(k, 'prodejny') * n(k, 'lide') * (n(k, 'fluktuace') / 100) * (ps(k, 'poklesFluktuace', s) / 100) * (ps(k, 'nahrazeni', s) / 100) * rocniMzdaR(k) * faktorR(k),
    },
    {
      klic: 'prescasy', nazev: 'Méně přesčasů', skupina: 'doplnek', predpoklady: ['prescasHodiny', 'poklesPrescasu'],
      vzorec: 'přesčasové hodiny × 12 × Kč/h × 1,25 × pokles',
      opora: PRESCAS_OPORA, odkazy: [],
      aktivni: (k) => s1(k, 'prescasHodiny') > 0,
      spocti: (k, s) => s1(k, 'prescasHodiny') * 12 * n(k, 'mzda') * PRIPLATEK_PRESCAS * (ps(k, 'poklesPrescasu', s) / 100) * faktorR(k),
    },
    {
      klic: 'trzby', nazev: 'Růst tržeb (mimo součet)', skupina: 'doplnek', mimoSoucet: true, predpoklady: ['trzby', 'rustTrzeb'],
      vzorec: 'prodejny × tržby × růst',
      opora: 'Gap (randomizovaný pokus): +7 % při stabilních rozpisech. Fisher a kol.: +4,5 % s personálem podle prodejny. Prodejny ale zároveň nabíraly pracovníky, proto jen 0,5–2 % a mimo součet.',
      odkazy: [
        { nazev: 'Gap, University of Chicago', url: 'https://news.uchicago.edu/story/stable-scheduling-increases-sales-and-employee-productivity-study-finds' },
        { nazev: 'Fisher, Gallino, Netessine 2021', url: 'https://ideas.repec.org/a/inm/ormsom/v23y2021i6p1562-1579.html' },
      ],
      aktivni: (k) => s1(k, 'trzby') > 0,
      spocti: (k, s) => n(k, 'prodejny') * s1(k, 'trzby') * 1e6 * (ps(k, 'rustTrzeb', s) / 100) * faktorR(k),
    },
  ],
  poznamka: (k) => {
    const a = hodinyVedouciho(k, 0)
    const b = hodinyVedouciho(k, 1)
    return b > 0 ? `Každý vedoucí získá zpět ${odDo(Math.min(a, b), Math.max(a, b), 'h')} týdně pro zákazníky a tým.` : null
  },
  shrnuti: (k, rocne) => `${nf(n(k, 'prodejny'))} prodejen po ${nf(n(k, 'lide'))} pracovnících, ${nf(n(k, 'mzda'))} Kč/h, vedoucí ${nfp(n(k, 'hodinyVedouci'))} h týdně na rozpisy, odhad ${rocne} ročně`,
}

export const NASTAVENI: Record<Obor, Nastaveni> = { 'kontaktni-centrum': KONTAKTNI_CENTRUM, retail: RETAIL }
export const jeObor = (x: unknown): x is Obor => x === 'kontaktni-centrum' || x === 'retail'

// ---------- Výpočet ----------

export type Oblast = { klic: string; nazev: string; lo: number; hi: number; rozpeti: string }
export type Radek = { label: string; hodnota: string }
export type OdhadOboru = {
  obor: Obor
  hodnoty: Hodnoty
  scenare: Scenare
  oblasti: Oblast[]
  /** Spočítané, ale mimo součet (tržby) */
  mimoSoucet: Oblast[]
  lo: number
  hi: number
  rocne: string
  mesicne: string
  poznamka: string | null
  shrnuti: string
  /** Zadání pro e-mail a PDF */
  zadani: Radek[]
  /** Předpoklady po oblastech pro e-mail a PDF */
  predpokladyOblasti: Radek[]
  /** Předpoklady, které uživatel změnil proti výchozím */
  upraveno: Radek[]
}

const hodnotaPredpokladu = (p: Predpoklad, v: [number, number]) => (p.jedna ? `${nfp(v[0])} ${p.jednotka}` : odDo(v[0], v[1], p.jednotka))

/** Vstupy z formuláře nebo z požadavku → platné hodnoty v povolených mezích */
export function normalizuj(obor: Obor, vstup: { hodnoty?: unknown; predpoklady?: unknown }): { hodnoty: Hodnoty; scenare: Scenare } {
  const nast = NASTAVENI[obor]
  const h = (vstup.hodnoty && typeof vstup.hodnoty === 'object' ? vstup.hodnoty : {}) as Record<string, unknown>
  const p = (vstup.predpoklady && typeof vstup.predpoklady === 'object' ? vstup.predpoklady : {}) as Record<string, unknown>
  const hodnoty: Hodnoty = {}
  for (const pole of nast.pole) {
    if (pole.typ === 'volba') {
      const v = String(h[pole.klic] ?? '')
      hodnoty[pole.klic] = pole.moznosti.some((m) => m.hodnota === v) ? v : pole.vychozi
    } else {
      hodnoty[pole.klic] = omez(cislo(h[pole.klic], pole.vychozi), pole.min, pole.max)
    }
  }
  const scenare: Scenare = {}
  for (const pr of nast.predpoklady) {
    const raw = Array.isArray(p[pr.klic]) ? (p[pr.klic] as unknown[]) : [p[pr.klic], p[pr.klic]]
    const a = omez(cislo(raw[0], pr.opatrne), pr.min, pr.max)
    const b = pr.jedna ? a : omez(cislo(raw[1], pr.realisticky), pr.min, pr.max)
    scenare[pr.klic] = [a, b]
  }
  return { hodnoty, scenare }
}

export function spocitejObor(obor: Obor, vstup: { hodnoty?: unknown; predpoklady?: unknown } = {}): OdhadOboru {
  const nast = NASTAVENI[obor]
  const { hodnoty, scenare } = normalizuj(obor, vstup)
  const k: Kontext = { h: hodnoty, p: scenare }

  const spoctene = nast.oblasti
    .filter((o) => !o.aktivni || o.aktivni(k))
    .map((o) => {
      const a = Math.max(0, o.spocti(k, 0))
      const b = Math.max(0, o.spocti(k, 1))
      const lo = Math.min(a, b)
      const hi = Math.max(a, b)
      return { o, oblast: { klic: o.klic, nazev: o.nazev, lo, hi, rozpeti: rozpeti(lo, hi) } }
    })
  const oblasti = spoctene.filter((x) => !x.o.mimoSoucet).map((x) => x.oblast)
  const mimoSoucet = spoctene.filter((x) => x.o.mimoSoucet).map((x) => x.oblast)
  const lo = oblasti.reduce((s, a) => s + a.lo, 0)
  const hi = oblasti.reduce((s, a) => s + a.hi, 0)
  const rocne = rozpeti(lo, hi)

  const zadani: Radek[] = nast.pole.map((pole) =>
    pole.typ === 'volba'
      ? { label: pole.label, hodnota: pole.moznosti.find((m) => m.hodnota === hodnoty[pole.klic])?.label || '' }
      : { label: pole.label, hodnota: pole.nula && Number(hodnoty[pole.klic]) === 0 ? pole.nula : `${nfp(Number(hodnoty[pole.klic]))} ${pole.jednotka}` },
  )
  // Doplňující údaje (přesčasy, tržby…) patří k zadání, jen když je uživatel vyplnil
  for (const pr of nast.predpoklady) {
    const v = scenare[pr.klic]
    if (pr.jedna && v[0] !== pr.opatrne) zadani.push({ label: pr.label, hodnota: hodnotaPredpokladu(pr, v) })
  }
  const pdef = (klic: string) => nast.predpoklady.find((p) => p.klic === klic)!
  const predpokladyOblasti: Radek[] = spoctene.map(({ o }) => ({
    label: o.nazev,
    hodnota: o.predpoklady
      .filter((klic) => klic !== 'podilOstatnich' || Number(hodnoty.ostatniNaklady) > 0)
      .map((klic) => `${pdef(klic).label.toLowerCase()} ${hodnotaPredpokladu(pdef(klic), scenare[klic])}`)
      .join(', '),
  }))
  const upraveno: Radek[] = nast.predpoklady
    .filter((pr) => !pr.jedna && (scenare[pr.klic][0] !== pr.opatrne || scenare[pr.klic][1] !== pr.realisticky))
    .map((pr) => ({ label: pr.label, hodnota: `${hodnotaPredpokladu(pr, scenare[pr.klic])} (výchozí ${hodnotaPredpokladu(pr, [pr.opatrne, pr.realisticky])})` }))

  return {
    obor,
    hodnoty,
    scenare,
    oblasti,
    mimoSoucet,
    lo,
    hi,
    rocne,
    mesicne: rozpeti(lo / 12, hi / 12),
    poznamka: nast.poznamka ? nast.poznamka(k, lo, hi) : null,
    shrnuti: nast.shrnuti(k, rocne),
    zadani,
    predpokladyOblasti,
    upraveno,
  }
}

// ---------- Excel s business casem ----------

/** Zadání, se kterým počítá šablona business casu v Excelu */
export type Vstupy = { lide: number; mzda: number; hppProcent: number; vedouci: number }

/** Údaje pro předvyplnění komplexního business casu v Excelu (šablona počítá s obecným zadáním) */
export function vstupyProExcel(o: OdhadOboru): Vstupy {
  const h = o.hodnoty
  const c = (klic: string) => Number(h[klic]) || 0
  if (o.obor === 'kontaktni-centrum') return { lide: c('operatori'), mzda: c('mzda'), hppProcent: 100, vedouci: c('planovaci') }
  const uvazek = o.scenare.uvazek?.[0] ?? 34
  return { lide: c('prodejny') * c('lide'), mzda: c('mzda'), hppProcent: omez(Math.round(((uvazek - FOND_ZKRACENY) / (FOND_HPP - FOND_ZKRACENY)) * 100), 0, 100), vedouci: c('prodejny') }
}
