// Tabulka s odhadem z kalkulačky pro e-maily (obchodu i zájemci). Styly jsou přímo v HTML kvůli Outlooku.
import { html, KONTAKT_EMAIL, KONTAKT_TELEFON } from './formular'
import { NAZEV_OBORU, type OdhadOboru } from './odhadUspor'

export const PISMO = "font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #0E1A24;"
export const radek = (k: string, v: string, sirka = 250) =>
  `<tr><td width="${sirka}" style="width: ${sirka}px; padding: 6px 16px 6px 0; color: #4A5866; vertical-align: top;">${k}</td><td style="padding: 6px 0; font-weight: 600;">${v}</td></tr>`

export function tabulkaOdhadu(o: OdhadOboru) {
  const zadani = [{ label: 'Kalkulačka', hodnota: NAZEV_OBORU[o.obor] }, ...o.zadani]
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px; margin: 8px 0 20px;">
    ${zadani.map((r) => radek(html(r.label), html(r.hodnota))).join('')}
  </table>
  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px; margin: 0 0 8px;">
    ${o.oblasti.map((a) => radek(html(a.nazev), a.rozpeti)).join('')}
    <tr><td width="250" style="width: 250px; padding: 10px 16px 6px 0; border-top: 1px solid #DCE3E9; font-weight: 700;">Odhad roční úspory</td><td style="padding: 10px 0 6px; border-top: 1px solid #DCE3E9; font-weight: 700; color: #C2410C;">${o.rocne}</td></tr>
    ${o.mimoSoucet.map((a) => radek(`${html(a.nazev)}`, a.rozpeti)).join('')}
  </table>
  <p style="margin: 0 0 20px; font-size: 13px; color: #4A5866;">Rozpětí od opatrného po realistický odhad, měsíčně zhruba ${o.mesicne}.${o.poznamka ? ` ${html(o.poznamka)}` : ''}</p>`
}

export const PODPIS = `<p style="margin: 0; color: #33424F;">Tým AristoTelos<br>
  <a href="tel:${KONTAKT_TELEFON.replace(/\s/g, '')}" style="color: #006E99;">${KONTAKT_TELEFON}</a> · <a href="mailto:${KONTAKT_EMAIL}" style="color: #006E99;">${KONTAKT_EMAIL}</a><br>
  <a href="https://aristotelos.com" style="color: #006E99;">aristotelos.com</a></p>
  <p style="margin: 20px 0 0; font-size: 12px; color: #4A5866;">Odhad vychází z průměrných předpokladů a není nabídkou. Matematické a Statistické Projekty a Software s.r.o., Podskalská 2046/14, 128 00 Praha 2, IČO 28478614.</p>`

export function upravenePredpoklady(o: OdhadOboru) {
  if (!o.upraveno.length) return ''
  return `<h3 style="margin: 0; font-size: 16px;">Upravené předpoklady</h3>
  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px; margin: 8px 0 20px;">
    ${o.upraveno.map((r) => radek(html(r.label), html(r.hodnota))).join('')}
  </table>`
}
