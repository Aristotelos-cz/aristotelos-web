// Kontrola rozvržení „jedna část = jedna obrazovka“ ve všech stránkách a v 11 velikostech okna.
// Popis pravidla: docs/vzhled-a-rozvrzeni.md
//
// Spuštění (web musí běžet, například npm run build && npm start):
//   node scripts/kontrola-obrazovek.mjs [adresa] [velikosti]
//   node scripts/kontrola-obrazovek.mjs http://localhost:3000 1470x835,390x700
// Potřebuje Playwright, který není v závislostech projektu:
//   npm install --no-save playwright && npx playwright install chromium
//
// Chyby (konec s kódem 1):
//   1. úvod přesahuje první obrazovku nebo je pod ním vidět další část,
//   2. některá část je nižší než viditelná plocha,
//   3. stránka přetéká do šířky.
// Upozornění (jen výpis): na počítači je část vyšší než obrazovka.
import { chromium } from 'playwright'
import { PAGES } from '../src/lib/site.ts'

const ADRESA = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '')
const VELIKOSTI = (process.argv[3] || '1920x960,1536x730,1470x835,1440x780,1366x625,1280x680,1280x600,1024x700,768x950,390x700,360x640')
  .split(',')
  .map((s) => s.split('x').map(Number))

const prohlizec = await chromium.launch()
const chyby = []
const upozorneni = []

for (const [w, h] of VELIKOSTI) {
  const stranka = await prohlizec.newPage({ viewport: { width: w, height: h } })
  for (const { path } of PAGES) {
    await stranka.goto(ADRESA + path, { waitUntil: 'networkidle' })
    const nalez = await stranka.evaluate(({ w, h }) => {
      const chyby = []
      const vysoke = []
      const hlavicka = document.querySelector('header')
      const prichycena = getComputedStyle(hlavicka).position === 'sticky'
      const viditelna = prichycena ? h - hlavicka.getBoundingClientRect().height : h
      const casti = [...document.querySelectorAll('main > section')]
      const uvod = casti[0].getBoundingClientRect()

      if (casti[0].classList.contains('pf-uvod')) {
        // Přehled funkcí je výjimka: úvod je nízký a hned pod ním musí být vidět záložky fází
        const zalozky = document.querySelector('.pf-zalozky').getBoundingClientRect()
        if (w > 1000 && Math.round(zalozky.bottom) > h) chyby.push(`záložky fází nejsou celé na první obrazovce (${Math.round(zalozky.bottom)})`)
        if (w > 1000 && h - Math.round(zalozky.bottom) < 60) chyby.push(`pod záložkami nezbývá místo na obsah (${h - Math.round(zalozky.bottom)})`)
      } else {
        if (w > 1000 && Math.round(uvod.bottom) > h) chyby.push(`úvod přesahuje obrazovku (${Math.round(uvod.bottom)})`)
        if (Math.round(uvod.bottom) < h - 1) chyby.push(`pod úvodem je vidět další část (${Math.round(uvod.bottom)})`)
      }

      casti.forEach((cast, i) => {
        if (i === 0) return
        const vyska = cast.getBoundingClientRect().height
        if (vyska < viditelna - 1) chyby.push(`část ${i + 1} je nižší než obrazovka (${Math.round(vyska)} < ${Math.round(viditelna)})`)
        // Katalog Přehledu funkcí je záměrně delší než obrazovka
        if (w > 1000 && !cast.classList.contains('pf-sekce') && vyska > viditelna + 1) vysoke.push(`část ${i + 1} je vyšší než obrazovka o ${Math.round(vyska - viditelna)} px`)
      })
      if (document.documentElement.scrollWidth > w) chyby.push(`přetéká do šířky (${document.documentElement.scrollWidth})`)
      return { chyby, vysoke }
    }, { w, h })
    for (const c of nalez.chyby) chyby.push(`${w}×${h} ${path}: ${c}`)
    for (const c of nalez.vysoke) upozorneni.push(`${w}×${h} ${path}: ${c}`)
  }
  await stranka.close()
  console.log(`hotovo ${w}×${h}`)
}
await prohlizec.close()

if (upozorneni.length) console.log(`\nUPOZORNĚNÍ (${upozorneni.length}):\n${upozorneni.join('\n')}`)
console.log(chyby.length ? `\nCHYBY (${chyby.length}):\n${chyby.join('\n')}` : '\nPravidlo platí ve všech velikostech.')
process.exit(chyby.length ? 1 : 0)
