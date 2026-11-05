// Testy výpočtu kalkulaček: ručně spočítané příklady. Spuštění: npm test
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spocitejObor, normalizuj, vstupyProExcel } from '../src/lib/odhadUspor.ts'

const blizko = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.01, `${msg}: ${a} ≠ ${b}`)
const oblast = (o, klic) => o.oblasti.find((a) => a.klic === klic) || o.mimoSoucet.find((a) => a.klic === klic)

test('kontaktní centrum bez ostatních nákladů', () => {
  const o = spocitejObor('kontaktni-centrum', { hodnoty: { ostatniNaklady: 0 } })
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
  assert.equal(o.poznamka, 'Odpovídá to mzdám 4,5–8,5 operátorů na plný úvazek.')
})

test('kontaktní centrum, výchozí hodnoty (ostatní náklady 5 500 Kč měsíčně)', () => {
  const o = spocitejObor('kontaktni-centrum')
  // Ostatní náklady: 100 × 66 000 Kč ročně × 50 % × 3 % = 99 000 Kč, × 100 % × 5 % = 330 000 Kč
  blizko(oblast(o, 'intervaly').lo, 1_185_600 + 99_000, 'intervaly lo')
  blizko(oblast(o, 'intervaly').hi, 1_976_000 + 330_000, 'intervaly hi')
  blizko(oblast(o, 'fluktuace').lo, 355_680, 'fluktuace se nemění')
  blizko(oblast(o, 'planovaci').lo, 218_400, 'plánovači se nemění')
  blizko(o.lo, 1_858_680, 'celkem lo')
  blizko(o.hi, 3_691_280, 'celkem hi')
  assert.equal(o.rocne, '1,9–3,7 mil. Kč')
  assert.equal(o.mesicne, '155–308 tis. Kč')
  assert.equal(o.poznamka, 'Odpovídá to nákladům na 4–8 operátorů na plný úvazek.')
  assert.ok(o.zadani.some((r) => /^5\s500 Kč\/měsíc$/.test(r.hodnota)), 'ostatní náklady v zadání')
})

test('kontaktní centrum, nástroj, přesčasy a čas plánovače', () => {
  const s = spocitejObor('kontaktni-centrum', { hodnoty: { planovani: 's-predpovedi' } })
  blizko(s.lo, 1_858_680 / 2, 'nástroj s předpovědí: polovina všude')
  const b = spocitejObor('kontaktni-centrum', { hodnoty: { planovani: 'bez-predpovedi' } })
  blizko(b.lo, 1_284_600 + 355_680 + 109_200, 'nástroj bez předpovědi: polovina jen u plánovačů')
  const p = spocitejObor('kontaktni-centrum', { predpoklady: { prescasHodiny: 400 } })
  // 400 h × 12 × 200 Kč × 1,25 × 10 % / 20 %
  blizko(oblast(p, 'prescasy').lo, 120_000, 'přesčasy lo')
  blizko(oblast(p, 'prescasy').hi, 240_000, 'přesčasy hi')
  blizko(p.lo, 1_858_680 + 120_000, 'přesčasy v součtu')
  assert.ok(p.zadani.some((r) => r.hodnota === '400 h'), 'přesčasy patří do zadání')
  // Čas plánovače na rozpisy 4 h: ušetří se nejvýš 4 h místo 6 h
  const c = spocitejObor('kontaktni-centrum', { hodnoty: { hodinyPlanovani: 4 } })
  blizko(oblast(c, 'planovaci').lo, 218_400, 'plánovači lo beze změny (3 h)')
  blizko(oblast(c, 'planovaci').hi, 5 * 4 * 200 * 1.4 * 52, 'plánovači hi omezeno na 4 h')
})

test('retail bez ostatních nákladů a fluktuace', () => {
  const o = spocitejObor('retail', { hodnoty: { ostatniNaklady: 0, fluktuace: 0 } })
  // 50 prodejen × 2 h / 3 h × 200 Kč × 1,4 × 52
  blizko(oblast(o, 'vedouci').lo, 1_456_000, 'vedoucí lo')
  blizko(oblast(o, 'vedouci').hi, 2_184_000, 'vedoucí hi')
  // 50 × 12 pracovníků × 34 h × 52 × 200 Kč × 2 % / 4 %
  blizko(oblast(o, 'hodiny').lo, 4_243_200, 'hodiny lo')
  blizko(oblast(o, 'hodiny').hi, 8_486_400, 'hodiny hi')
  assert.equal(o.oblasti.length, 2, 'fluktuace 0 se nepočítá')
  assert.equal(o.rocne, '5,7–10,7 mil. Kč')
  assert.equal(o.poznamka, 'Každý vedoucí získá zpět 2–3 h týdně pro zákazníky a tým.')
})

test('retail, výchozí hodnoty (ostatní náklady 5 500 Kč, fluktuace 15 %)', () => {
  const o = spocitejObor('retail')
  // Ostatní náklady: 600 pracovníků × 66 000 Kč ročně × 50 % × 2 % = 396 000 Kč, × 100 % × 4 % = 1 584 000 Kč
  blizko(oblast(o, 'hodiny').lo, 4_243_200 + 396_000, 'hodiny lo')
  blizko(oblast(o, 'hodiny').hi, 8_486_400 + 1_584_000, 'hodiny hi')
  // 600 pracovníků × 15 % × 10 % × 15 % × 353 600 Kč / × 15 % × 25 %
  blizko(oblast(o, 'fluktuace').lo, 477_360, 'fluktuace lo')
  blizko(oblast(o, 'fluktuace').hi, 1_193_400, 'fluktuace hi')
  blizko(o.lo, 6_572_560, 'celkem lo')
  blizko(o.hi, 13_447_800, 'celkem hi')
  assert.equal(o.rocne, '6,6–13,4 mil. Kč')
})

test('retail, strop času vedoucího, doplňky, tržby mimo součet a jiný nástroj', () => {
  const o = spocitejObor('retail', { hodnoty: { hodinyVedouci: '1,5' } })
  blizko(oblast(o, 'vedouci').lo, 1_092_000, 'strop lo')
  blizko(oblast(o, 'vedouci').hi, 1_092_000, 'strop hi')
  assert.equal(o.poznamka, 'Každý vedoucí získá zpět 1,5 h týdně pro zákazníky a tým.')

  const d = spocitejObor('retail', { hodnoty: { fluktuace: 40 }, predpoklady: { trzby: 20 } })
  // 600 pracovníků × 40 % × 10 % × 15 % × (34 h × 52 × 200 Kč)
  blizko(oblast(d, 'fluktuace').lo, 1_272_960, 'fluktuace lo')
  blizko(oblast(d, 'fluktuace').hi, 3_182_400, 'fluktuace hi')
  // 50 prodejen × 20 mil. Kč × 0,5 % / 2 %
  blizko(oblast(d, 'trzby').lo, 5_000_000, 'tržby lo')
  blizko(oblast(d, 'trzby').hi, 20_000_000, 'tržby hi')
  blizko(d.lo, 1_456_000 + 4_639_200 + 1_272_960, 'tržby nejsou v součtu')

  const n = spocitejObor('retail', { hodnoty: { planovani: 'nastroj' } })
  blizko(n.lo, 6_572_560 / 2, 'jiný nástroj: polovina')
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
