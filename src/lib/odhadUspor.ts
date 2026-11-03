// Výpočet kalkulačky úspor. Používá ho stránka (živý odhad) i server (e-maily a Excel),
// aby čísla v e-mailu vždy odpovídala tomu, co návštěvník viděl.

// Předpoklady (realistický scénář z kalkulátoru pro nabídky; opatrný = polovina)
const FOND_HPP = 38
const FOND_ZKRACENY = 20
const TYDNU_V_MESICI = 4.345
const VYKON_V_NEEFEKTIVNICH_HODINACH = 0.3
const PRIPLATEK_PRESCAS = 1.25
export const NASOBEK_VEDOUCI = 1.4
const NAKLADY_ZASKOLENI = 30000

export type Vstupy = { lide: number; mzda: number; hppProcent: number; vedouci: number }
export type Oblast = { nazev: string; lo: number; hi: number; rozpeti: string }
export type Odhad = { oblasti: Oblast[]; lo: number; hi: number; rocne: string; mesicne: string; shrnuti: string }

export const LIMITY = {
  lide: { min: 10, max: 3000 },
  mzda: { min: 120, max: 600 },
  hppProcent: { min: 0, max: 100 },
  vedouci: { min: 1, max: 100 },
} as const

export const cislo = (v: unknown, d: number) => {
  const x = parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(x) && x >= 0 ? x : d
}

export const nf = (x: number, d = 0) => x.toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d })

export const rozpeti = (lo: number, hi: number) => {
  if (hi >= 1e6) return `${nf(lo / 1e6, 1)}–${nf(hi / 1e6, 1)} mil. Kč`
  if (hi >= 1e4) return `${nf(Math.round(lo / 1e3))}–${nf(Math.round(hi / 1e3))} tis. Kč`
  return `${nf(Math.round(lo / 100) * 100)}–${nf(Math.round(hi / 100) * 100)} Kč`
}

export function spocitej({ lide: N, mzda: W, hppProcent, vedouci: M }: Vstupy): Odhad {
  const hpp = Math.min(100, Math.max(0, hppProcent))
  const H = hpp / 100
  const fond = (H * FOND_HPP + (1 - H) * FOND_ZKRACENY) * TYDNU_V_MESICI
  const zaklad = [
    { nazev: 'Obsazení provozu', lo: N * fond * W * 0.005 * (1 - VYKON_V_NEEFEKTIVNICH_HODINACH) * 12, hi: N * fond * W * 0.01 * (1 - VYKON_V_NEEFEKTIVNICH_HODINACH) * 12 },
    { nazev: 'Přesčasy a neodpracované hodiny', lo: N * H * (0.05 * W * PRIPLATEK_PRESCAS + 0.005 * W) * 12, hi: N * H * (0.1 * W * PRIPLATEK_PRESCAS + 0.01 * W) * 12 },
    { nazev: 'Čas vedoucích', lo: M * 16 * W * NASOBEK_VEDOUCI * 12, hi: M * 32 * W * NASOBEK_VEDOUCI * 12 },
    { nazev: 'Fluktuace', lo: N * 0.01 * NAKLADY_ZASKOLENI, hi: N * 0.02 * NAKLADY_ZASKOLENI },
  ]
  const lo = zaklad.reduce((s, a) => s + a.lo, 0)
  const hi = zaklad.reduce((s, a) => s + a.hi, 0)
  return {
    oblasti: zaklad.map((a) => ({ ...a, rozpeti: rozpeti(a.lo, a.hi) })),
    lo,
    hi,
    rocne: rozpeti(lo, hi),
    mesicne: rozpeti(lo / 12, hi / 12),
    shrnuti: `${nf(N)} lidí ve směnách, ${nf(W)} Kč/h, ${nf(hpp)} % HPP, ${nf(M)} vedoucích, odhad ${rozpeti(lo, hi)} ročně`,
  }
}
