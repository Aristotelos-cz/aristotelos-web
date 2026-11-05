// Testy výpočtu kalkulaček: ručně spočítané příklady. Spuštění: npm test
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spocitejObor, normalizuj, vstupyProExcel } from '../src/lib/odhadUspor.ts'

const blizko = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.01, `${msg}: ${a} ≠ ${b}`)
const oblast = (o, klic) => o.oblasti.find((a) => a.klic === klic) || o.mimoSoucet.find((a) => a.klic === klic)

test('kontaktní centrum, výchozí hodnoty', () => {
  const o = spocitejObor('kontaktni-centrum')
  // 100 operátorů × 1 976 h × 200 Kč × 3 % / 5 %
  blizko(oblast(o, 'intervaly').lo, 1_185_600, 'intervaly lo')
  blizko(oblast(o, 'intervaly').hi, 1_976_000, 'intervaly hi')
  // 100 × 30 % × 10 % × 30 % × 395 200 Kč / 100 × 30 % × 20 % × 40 % × 395 200 Kč
  blizko(oblast(o, 'fluktuace').lo, 355_680, 'fluktuace lo')
  blizko(oblast(o, 'fluktuace').hi, 948_480, 'fluktuace hi')
  // 5 plánovačů × 3 h / 6 h × 200 Kč × 1,4 × 52
  blizko(oblast(o, 'planovaci').lo, 218_400, 'plánovači lo')
  blizko(oblast(o, 'planovaci').hi, 436_800, 'plánovači hi')
  assert.equal(o.oblasti.length, 3, 'přesčasy bez zadání nepočítáme')
  blizko(o.lo, 1_759_680, 'celkem lo')
  blizko(o.hi, 3_361_280, 'celkem hi')
  assert.equal(o.rocne, '1,8–3,4 mil. Kč')
  assert.equal(o.mesicne, '147–280 tis. Kč')
  assert.equal(o.poznamka, 'Odpovídá to mzdám 4,5–8,5 operátorů na plný úvazek.')
})

test('kontaktní centrum, nástroj a přesčasy', () => {
  const s = spocitejObor('kontaktni-centrum', { hodnoty: { planovani: 's-predpovedi' } })
  blizko(s.lo, 1_759_680 / 2, 'nástroj s předpovědí: polovina všude')
  const b = spocitejObor('kontaktni-centrum', { hodnoty: { planovani: 'bez-predpovedi' } })
  blizko(b.lo, 1_185_600 + 355_680 + 109_200, 'nástroj bez předpovědi: polovina jen u plánovačů')
  const p = spocitejObor('kontaktni-centrum', { predpoklady: { prescasHodiny: 400 } })
  // 400 h × 12 × 200 Kč × 1,25 × 10 % / 20 %
  blizko(oblast(p, 'prescasy').lo, 120_000, 'přesčasy lo')
  blizko(oblast(p, 'prescasy').hi, 240_000, 'přesčasy hi')
  blizko(p.lo, 1_759_680 + 120_000, 'přesčasy v součtu')
  assert.ok(p.zadani.some((r) => r.hodnota === '400 h'), 'přesčasy patří do zadání')
})

test('retail, výchozí hodnoty', () => {
  const o = spocitejObor('retail')
  // 50 prodejen × 2 h / 3 h × 200 Kč × 1,4 × 52
  blizko(oblast(o, 'vedouci').lo, 1_456_000, 'vedoucí lo')
  blizko(oblast(o, 'vedouci').hi, 2_184_000, 'vedoucí hi')
  // 50 × 12 lidí × 34 h × 52 × 200 Kč × 2 % / 4 %
  blizko(oblast(o, 'hodiny').lo, 4_243_200, 'hodiny lo')
  blizko(oblast(o, 'hodiny').hi, 8_486_400, 'hodiny hi')
  assert.equal(o.oblasti.length, 2)
  assert.equal(o.mimoSoucet.length, 0)
  assert.equal(o.rocne, '5,7–10,7 mil. Kč')
  assert.equal(o.poznamka, 'Každý vedoucí získá zpět 2–3 h týdně pro zákazníky a tým.')
})

test('retail, úspora času vedoucího nejvýš zadaný čas, doplňky a tržby mimo součet', () => {
  const o = spocitejObor('retail', { hodnoty: { hodinyVedouci: '1,5' } })
  blizko(oblast(o, 'vedouci').lo, 1_092_000, 'strop lo')
  blizko(oblast(o, 'vedouci').hi, 1_092_000, 'strop hi')
  assert.equal(o.poznamka, 'Každý vedoucí získá zpět 1,5 h týdně pro zákazníky a tým.')

  const d = spocitejObor('retail', { hodnoty: { fluktuace: 40 }, predpoklady: { trzby: 20 } })
  // 600 lidí × 40 % × 10 % × 15 % × (34 h × 52 × 200 Kč)
  blizko(oblast(d, 'fluktuace').lo, 1_272_960, 'fluktuace lo')
  blizko(oblast(d, 'fluktuace').hi, 3_182_400, 'fluktuace hi')
  // 50 prodejen × 20 mil. Kč × 0,5 % / 2 %
  blizko(oblast(d, 'trzby').lo, 5_000_000, 'tržby lo')
  blizko(oblast(d, 'trzby').hi, 20_000_000, 'tržby hi')
  blizko(d.lo, 1_456_000 + 4_243_200 + 1_272_960, 'tržby nejsou v součtu')

  const n = spocitejObor('retail', { hodnoty: { planovani: 'nastroj' } })
  blizko(n.lo, (1_456_000 + 4_243_200) / 2, 'jiný nástroj: polovina')
})

test('kontaktní centrum, čas plánovače a ostatní náklady', () => {
  // Čas plánovače na rozpisy 4 h: ušetří se nejvýš 4 h místo 6 h
  const c = spocitejObor('kontaktni-centrum', { hodnoty: { hodinyPlanovani: 4 } })
  blizko(oblast(c, 'planovaci').lo, 218_400, 'plánovači lo beze změny (3 h)')
  blizko(oblast(c, 'planovaci').hi, 5 * 4 * 200 * 1.4 * 52, 'plánovači hi omezeno na 4 h')
  // Ostatní náklady 5 000 Kč měsíčně: 100 × 60 000 Kč × 50 % / 100 % × 3 % / 5 %
  const o = spocitejObor('kontaktni-centrum', { hodnoty: { ostatniNaklady: 5000 } })
  blizko(oblast(o, 'intervaly').lo, 1_185_600 + 90_000, 'intervaly lo s polovinou ostatních nákladů')
  blizko(oblast(o, 'intervaly').hi, 1_976_000 + 300_000, 'intervaly hi s celými ostatními náklady')
  blizko(oblast(o, 'fluktuace').lo, 355_680, 'fluktuace se nemění')
  assert.match(o.poznamka, /^Odpovídá to nákladům na /)
  assert.ok(spocitejObor('kontaktni-centrum').zadani.some((r) => r.hodnota === 'nezadáno'), 'ostatní náklady 0 = nezadáno')
})

test('retail, fluktuace v zadání a ostatní náklady', () => {
  const f = spocitejObor('retail', { hodnoty: { fluktuace: 40 } })
  blizko(oblast(f, 'fluktuace').lo, 1_272_960, 'fluktuace lo')
  blizko(oblast(f, 'fluktuace').hi, 3_182_400, 'fluktuace hi')
  // Ostatní náklady 2 000 Kč měsíčně: 600 lidí × 24 000 Kč × 50 % / 100 % × 2 % / 4 %
  const o = spocitejObor('retail', { hodnoty: { ostatniNaklady: 2000 } })
  blizko(oblast(o, 'hodiny').lo, 4_243_200 + 144_000, 'hodiny lo s polovinou ostatních nákladů')
  blizko(oblast(o, 'hodiny').hi, 8_486_400 + 576_000, 'hodiny hi s celými ostatními náklady')
  blizko(oblast(o, 'vedouci').lo, 1_456_000, 'čas vedoucích se nemění')
})

test('neplatné vstupy se opraví na povolené hodnoty', () => {
  const { hodnoty, scenare } = normalizuj('kontaktni-centrum', {
    hodnoty: { operatori: '50000', mzda: 'abc', fluktuace: -5, planovani: '<script>' },
    predpoklady: { usporaHodin: ['99', '1,5'], prescasHodiny: '250' },
  })
  assert.equal(hodnoty.operatori, 10000)
  assert.equal(hodnoty.mzda, 200)
  assert.equal(hodnoty.fluktuace, 30)
  assert.equal(hodnoty.planovani, 'excel')
  assert.deepEqual(scenare.usporaHodin, [20, 1.5])
  assert.deepEqual(scenare.prescasHodiny, [250, 250])
  // Obrácené pořadí předpokladů nevadí: lo je vždy menší
  const o = spocitejObor('kontaktni-centrum', { predpoklady: { usporaHodin: [5, 3] } })
  assert.ok(o.oblasti[0].lo <= o.oblasti[0].hi)
})

test('údaje pro Excel', () => {
  assert.deepEqual(vstupyProExcel(spocitejObor('kontaktni-centrum')), { lide: 100, mzda: 200, hppProcent: 100, vedouci: 5 })
  assert.deepEqual(vstupyProExcel(spocitejObor('retail')), { lide: 600, mzda: 200, hppProcent: 78, vedouci: 50 })
})
