// Shrnutí odhadu z kalkulačky v PDF (jedna strana A4). Vzniká na serveru, písmo je přiložené
// v src/assets/fonts (Schibsted Grotesk, licence OFL), aby fungovala čeština bez dalších služeb.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { KONTAKT_EMAIL, KONTAKT_TELEFON } from './formular'
import { ADRESA, NASTAVENI, NAZEV_OBORU, type OdhadOboru } from './odhadUspor'

const SLOZKA = path.join(process.cwd(), 'src', 'assets', 'fonts')
let fonty: Promise<Uint8Array[]> | null = null
const nactiFonty = () => (fonty ??= Promise.all(['SchibstedGrotesk-Regular.ttf', 'SchibstedGrotesk-Bold.ttf'].map((f) => readFile(path.join(SLOZKA, f)))))

const barva = (hex: string) => rgb(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255)
const INK = barva('#0E1A24')
const TICHA = barva('#4A5866')
const LINKA = barva('#DCE3E9')
const PODKLAD = barva('#F5F8FA')
const MODRA = barva('#006699')
const ORANZOVA = barva('#FF6633')
const AKCENT = barva('#C2410C')

const A4: [number, number] = [595.28, 841.89]
const OKRAJ = 48
const SIRKA = A4[0] - 2 * OKRAJ

type Styl = { velikost: number; tucne?: boolean; barva?: ReturnType<typeof rgb>; radkovani?: number }

export async function vytvorShrnuti(o: OdhadOboru, datum = new Date(), web = 'https://aristotelos.com'): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const [reg, bold] = await nactiFonty()
  const R = await pdf.embedFont(reg, { subset: true })
  const B = await pdf.embedFont(bold, { subset: true })
  const nazevOboru = NAZEV_OBORU[o.obor]
  pdf.setTitle(`Odhad úspor z plánování směn – ${nazevOboru}`)
  pdf.setAuthor('AristoTelos')
  pdf.setSubject('Shrnutí z kalkulačky úspor na aristotelos.com')
  pdf.setLanguage('cs-CZ')
  pdf.setCreator('aristotelos.com')
  pdf.setProducer('aristotelos.com')
  pdf.setCreationDate(datum)

  let strana: PDFPage = pdf.addPage(A4)
  let y = A4[1] - OKRAJ
  const font = (s: Styl): PDFFont => (s.tucne ? B : R)

  const zalom = (t: string, s: Styl, sirka: number) => {
    const f = font(s)
    const radky: string[] = []
    // Číslo a jednotku ani telefon nerozdělovat na dva řádky
    const nbsp = t
      .replace(/(\d) (?=%|h\b|Kč|mil\.|tis\.|lid|úvazk|prodej|operát)/g, '$1\u00A0')
      .replace(/\+420 (\d{3}) (\d{3}) (\d{3})/g, '+420\u00A0$1\u00A0$2\u00A0$3')
    for (const odstavec of nbsp.split('\n')) {
      let r = ''
      for (const slovo of odstavec.split(' ')) {
        const zkus = r ? `${r} ${slovo}` : slovo
        if (f.widthOfTextAtSize(zkus, s.velikost) <= sirka || !r) r = zkus
        else {
          radky.push(r)
          r = slovo
        }
      }
      radky.push(r)
    }
    return radky
  }
  const vyska = (radku: number, s: Styl) => radku * s.velikost * (s.radkovani ?? 1.35)
  const misto = (h: number) => {
    if (y - h < OKRAJ + 30) {
      strana = pdf.addPage(A4)
      y = A4[1] - OKRAJ
    }
  }
  /** Napíše text od pozice x na aktuální řádek a vrátí jeho výšku (y neposouvá) */
  const pis = (t: string, x: number, yy: number, s: Styl, sirka = SIRKA, zarovnat: 'vlevo' | 'vpravo' = 'vlevo') => {
    const radky = zalom(t, s, sirka)
    const f = font(s)
    radky.forEach((r, i) => {
      const w = f.widthOfTextAtSize(r, s.velikost)
      strana.drawText(r, { x: zarovnat === 'vpravo' ? x + sirka - w : x, y: yy - s.velikost - i * s.velikost * (s.radkovani ?? 1.35) + 2, size: s.velikost, font: f, color: s.barva ?? INK })
    })
    return vyska(radky.length, s)
  }
  const odstavec = (t: string, s: Styl, mezera = 6) => {
    const h = vyska(zalom(t, s, SIRKA).length, s)
    misto(h)
    pis(t, OKRAJ, y, s)
    y -= h + mezera
  }
  const nadpis = (t: string) => {
    misto(60)
    y -= 6
    pis(t, OKRAJ, y, { velikost: 12.5, tucne: true })
    y -= 20
  }
  const cara = (yy: number) => strana.drawLine({ start: { x: OKRAJ, y: yy }, end: { x: OKRAJ + SIRKA, y: yy }, thickness: 0.6, color: LINKA })

  // Hlavička: značka a datum
  strana.drawRectangle({ x: OKRAJ, y: y - 3, width: 24, height: 3, color: MODRA })
  strana.drawRectangle({ x: OKRAJ + 24, y: y - 3, width: 20, height: 3, color: ORANZOVA })
  y -= 12
  pis('AristoTelos', OKRAJ, y, { velikost: 15, tucne: true })
  pis(datum.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Prague' }), OKRAJ, y, { velikost: 10, barva: TICHA }, SIRKA, 'vpravo')
  y -= 32
  y -= pis('Odhad úspor z automatického plánování směn', OKRAJ, y, { velikost: 20, tucne: true, radkovani: 1.2 }) + 2
  y -= pis(`Kalkulačka úspor: ${nazevOboru}`, OKRAJ, y, { velikost: 11, barva: TICHA }) + 12

  // Výsledek v rámečku
  const radkyVysledku = [
    `Od opatrného po realistický odhad. Měsíc odkladu stojí zhruba ${o.mesicne}.`,
    ...(o.poznamka ? [o.poznamka] : []),
    ...o.mimoSoucet.map((a) => `Navíc možný růst tržeb o ${a.rozpeti} ročně, ten v součtu není.`),
  ]
  const sVysl: Styl = { velikost: 10.5, barva: INK }
  const hBox = 18 + 12 + 34 + radkyVysledku.reduce((s, t) => s + vyska(zalom(t, sVysl, SIRKA - 36).length, sVysl) + 2, 0) + 14
  strana.drawRectangle({ x: OKRAJ, y: y - hBox, width: SIRKA, height: hBox, color: PODKLAD })
  strana.drawRectangle({ x: OKRAJ, y: y - hBox, width: 3, height: hBox, color: ORANZOVA })
  let yb = y - 18
  pis('ODHAD ROČNÍ ÚSPORY', OKRAJ + 18, yb, { velikost: 9, barva: TICHA })
  yb -= 14
  pis(o.rocne, OKRAJ + 18, yb, { velikost: 26, tucne: true, barva: AKCENT })
  yb -= 36
  for (const t of radkyVysledku) yb -= pis(t, OKRAJ + 18, yb, sVysl, SIRKA - 36) + 2
  y -= hBox + 10

  // Zadání ve dvou sloupcích
  nadpis('Vaše zadání')
  const sL: Styl = { velikost: 10, barva: TICHA, radkovani: 1.3 }
  const sH: Styl = { velikost: 10, tucne: true, radkovani: 1.3 }
  const sloupec = (SIRKA - 24) / 2
  const sirkaL = 138
  for (let i = 0; i < o.zadani.length; i += 2) {
    const dvojice = o.zadani.slice(i, i + 2)
    const h = Math.max(...dvojice.map((r) => Math.max(vyska(zalom(r.label, sL, sirkaL).length, sL), vyska(zalom(r.hodnota, sH, sloupec - sirkaL - 8).length, sH))))
    misto(h + 4)
    dvojice.forEach((r, j) => {
      const x = OKRAJ + j * (sloupec + 24)
      pis(r.label, x, y, sL, sirkaL)
      pis(r.hodnota, x + sirkaL + 8, y, sH, sloupec - sirkaL - 8)
    })
    y -= h + 3
  }

  // Oblasti
  nadpis('Úspora po oblastech')
  const sloupce = { nazev: 150, predp: SIRKA - 150 - 110 - 24, uspora: 110 }
  const sP: Styl = { velikost: 9.5, barva: TICHA }
  const predpoklady = new Map(o.predpokladyOblasti.map((r) => [r.label, r.hodnota]))
  const radekOblasti = (nazev: string, predp: string, uspora: string, tucne = false) => {
    const sN: Styl = { velikost: 10.5, tucne: true }
    const sU: Styl = { velikost: 10.5, tucne: true, barva: tucne ? AKCENT : INK }
    const h = Math.max(vyska(zalom(nazev, sN, sloupce.nazev).length, sN), vyska(zalom(predp, sP, sloupce.predp).length, sP), 14) + 8
    misto(h)
    cara(y)
    y -= 6
    pis(nazev, OKRAJ, y, sN, sloupce.nazev)
    pis(predp, OKRAJ + sloupce.nazev + 12, y, sP, sloupce.predp)
    pis(uspora, OKRAJ + SIRKA - sloupce.uspora, y, sU, sloupce.uspora, 'vpravo')
    y -= h - 6
  }
  for (const a of o.oblasti) radekOblasti(a.nazev, predpoklady.get(a.nazev) || '', a.rozpeti)
  radekOblasti('Odhad roční úspory', 'součet, od opatrného po realistický odhad', o.rocne, true)
  for (const a of o.mimoSoucet) radekOblasti(a.nazev, predpoklady.get(a.nazev) || '', a.rozpeti)
  cara(y)
  y -= 8

  // Zdroje
  const nast = NASTAVENI[o.obor]
  const aktivni = new Set([...o.oblasti, ...o.mimoSoucet].map((a) => a.klic))
  const opory = nast.oblasti.filter((x) => aktivni.has(x.klic) && x.opora)
  nadpis('Z čeho vycházíme')
  if (opory.length) {
    for (const x of opory) odstavec(`${x.nazev}: ${x.opora}${x.odkazy.length ? ` Zdroj: ${x.odkazy.map((z) => z.nazev).join(', ')}.` : ''}`, { velikost: 9, barva: INK, radkovani: 1.3 }, 2)
    if (nast.nastrojText && o.hodnoty.planovani !== 'excel') odstavec(nast.nastrojText, { velikost: 9, barva: TICHA, radkovani: 1.3 }, 3)
    odstavec(`Odkazy na zdroje najdete na ${web.replace(/^https?:\/\//, '')}${ADRESA[o.obor]}.`, { velikost: 9, barva: TICHA }, 3)
  } else {
    odstavec('Z předpokladů, se kterými počítáme v nabídkách. Opatrný odhad počítá s polovičními hodnotami. Měsíční fond pracovní doby: 38 h týdně na HPP a 20 h týdně na zkrácený úvazek.', { velikost: 9.5 }, 4)
  }

  // Co dál
  nadpis('Co dál: business case z vašich čísel')
  odstavec('Kalkulačka ukazuje jen část úspor. Z vašich čísel připravíme business case ve třech scénářích, s náklady, dobou návratnosti a pětiletým cash flow, který půjde rovnou předložit vedení.', { velikost: 10 }, 3)
  odstavec(`Stačí odpovědět na e-mail se shrnutím, napsat na ${KONTAKT_EMAIL} nebo zavolat na ${KONTAKT_TELEFON}.`, { velikost: 10, tucne: true }, 4)

  // Patička na každé straně
  const paticka = `Odhad vychází z průměrných předpokladů a není nabídkou. Matematické a Statistické Projekty a Software s.r.o., Podskalská 2046/14, 128 00 Praha 2, IČO 28478614 · ${web.replace(/^https?:\/\//, '')}`
  for (const s of pdf.getPages()) {
    strana = s
    strana.drawLine({ start: { x: OKRAJ, y: OKRAJ + 22 }, end: { x: OKRAJ + SIRKA, y: OKRAJ + 22 }, thickness: 0.6, color: LINKA })
    pis(paticka, OKRAJ, OKRAJ + 16, { velikost: 8, barva: TICHA })
  }

  return pdf.save()
}
