// Komplexní business case (Excel pro obchod) předvyplněný údaji z kalkulačky.
// Šablonu upravujeme přímo v XML, aby zůstaly grafy, formáty i ověření dat beze změny.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { NASOBEK_VEDOUCI, type Vstupy } from './odhadUspor'

const SABLONA = path.join(process.cwd(), 'src/assets/business-case-sablona.xlsx')
const LIST_VSTUPY = 'xl/worksheets/sheet3.xml' // list „Vstupy“

const xml = (s: string) =>
  s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Excel počítá datum jako počet dní od 30. 12. 1899
const excelDatum = (d: Date) => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1899, 11, 30)) / 86400000)

function nastavBunku(list: string, adresa: string, hodnota: string | number): string {
  const re = new RegExp(`<c r="${adresa}"([^>]*?)(?:/>|>[\\s\\S]*?</c>)`)
  const m = list.match(re)
  if (!m) throw new Error(`Buňka ${adresa} v šabloně chybí`)
  const styl = (m[1].match(/\ss="\d+"/) || [''])[0]
  const nova =
    typeof hodnota === 'number'
      ? `<c r="${adresa}"${styl} t="n"><v>${hodnota}</v></c>`
      : `<c r="${adresa}"${styl} t="inlineStr"><is><t xml:space="preserve">${xml(hodnota)}</t></is></c>`
  return list.replace(re, nova)
}

// Vzorcům smažeme uložené výsledky, aby náhled e-mailu neukazoval čísla ze šablony.
// Excel je při otevření přepočítá (fullCalcOnLoad).
const bezUlozenychVysledku = (list: string) =>
  list.replace(/<c ([^>]*?)>(<f[ >][\s\S]*?)<\/c>/g, (_, attrs: string, obsah: string) => {
    const a = attrs.replace(/\st="\w+"/, '')
    return `<c ${a}>${obsah.replace(/<v>[\s\S]*?<\/v>/, '').replace(/<v\/>/, '')}</c>`
  })

export async function vytvorBusinessCase(firma: string, v: Vstupy, datum = new Date()): Promise<Uint8Array> {
  const soubory = unzipSync(new Uint8Array(await readFile(SABLONA)))

  let vstupy = strFromU8(soubory[LIST_VSTUPY])
  vstupy = nastavBunku(vstupy, 'B5', firma)
  vstupy = nastavBunku(vstupy, 'B6', excelDatum(datum))
  vstupy = nastavBunku(vstupy, 'B10', Math.round(v.lide))
  vstupy = nastavBunku(vstupy, 'B11', Math.round(v.hppProcent) / 100)
  vstupy = nastavBunku(vstupy, 'B19', Math.round(v.mzda))
  vstupy = nastavBunku(vstupy, 'B21', Math.round(v.mzda * NASOBEK_VEDOUCI))
  vstupy = nastavBunku(vstupy, 'B31', Math.round(v.vedouci))
  soubory[LIST_VSTUPY] = strToU8(vstupy)

  for (const nazev of Object.keys(soubory)) {
    if (/^xl\/worksheets\/sheet\d+\.xml$/.test(nazev)) {
      soubory[nazev] = strToU8(bezUlozenychVysledku(strFromU8(soubory[nazev])))
    }
  }

  const sesit = strFromU8(soubory['xl/workbook.xml'])
  soubory['xl/workbook.xml'] = strToU8(
    sesit.includes('fullCalcOnLoad') ? sesit : sesit.replace('<calcPr ', '<calcPr fullCalcOnLoad="1" '),
  )

  return zipSync(soubory, { level: 6 })
}
