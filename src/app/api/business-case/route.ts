// Žádost o business case z kalkulačky úspor:
// 1) obchodu přijde e-mail se zadáním a předvyplněným Excelem,
// 2) zájemci přijde potvrzení s jeho odhadem a dalším postupem.
import { vytvorBusinessCase } from '@/lib/businessCaseExcel'
import { cislo, LIMITY, nf, spocitej, type Odhad, type Vstupy } from '@/lib/odhadUspor'
import { posliEmail, postaNastavena } from '@/lib/posta'

const KONTAKT_TELEFON = '+420 606 337 182'
const KONTAKT_EMAIL = 'info@aristotelos.com'

const omez = (x: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, x))
const text = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max)
const html = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/

// Jednoduchá ochrana proti opakovanému odesílání (v rámci jedné instance serveru)
const pokusy = new Map<string, number[]>()
function prilisMnoho(ip: string) {
  const ted = Date.now()
  const posledni = (pokusy.get(ip) || []).filter((t) => ted - t < 10 * 60_000)
  posledni.push(ted)
  pokusy.set(ip, posledni)
  return posledni.length > 5
}

const chyba = (status: number, zprava: string) => Response.json({ ok: false, chyba: zprava }, { status })

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).host !== request.headers.get('host')) return chyba(403, 'Neplatný původ požadavku.')

  let d: Record<string, unknown>
  try {
    d = await request.json()
  } catch {
    return chyba(400, 'Neplatná data formuláře.')
  }

  // Past na roboty: skryté pole vyplněné nebo formulář odeslaný nelidsky rychle. Tváříme se, že je vše v pořádku.
  if (text(d.web, 200) || cislo(d.cas, 0) < 2500) return Response.json({ ok: true })

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'neznámá'
  if (prilisMnoho(ip)) return chyba(429, 'Odeslali jste formulář několikrát za sebou. Zkuste to prosím za pár minut.')

  const kontakt = {
    jmeno: text(d.jmeno, 120),
    firma: text(d.firma, 160),
    email: text(d.email, 200).toLowerCase(),
    telefon: text(d.telefon, 40),
  }
  if (kontakt.jmeno.length < 2 || kontakt.firma.length < 2 || !EMAIL_RE.test(kontakt.email)) {
    return chyba(400, 'Vyplňte prosím jméno, firmu a platný pracovní e-mail.')
  }

  const vstupy: Vstupy = {
    lide: omez(cislo(d.lide, 0), LIMITY.lide),
    mzda: omez(cislo(d.mzda, 0), LIMITY.mzda),
    hppProcent: omez(cislo(d.hpp, 0), LIMITY.hppProcent),
    vedouci: omez(cislo(d.vedouci, 0), LIMITY.vedouci),
  }
  const odhad = spocitej(vstupy)

  if (!postaNastavena()) {
    if (!process.env.VERCEL_ENV) {
      console.info('[business case] Odesílání e-mailů není nastavené, žádost jen vypisuji:', kontakt, odhad.shrnuti)
      return Response.json({ ok: true })
    }
    console.error('[business case] Chybí nastavení e-mailu (MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MAIL_FROM).')
    return chyba(503, `Formulář se teď nepodařilo odeslat. Napište nám prosím na ${KONTAKT_EMAIL} nebo zavolejte na ${KONTAKT_TELEFON}.`)
  }

  const prijemci = (process.env.LEAD_EMAIL_TO || KONTAKT_EMAIL).split(',').map((s) => s.trim()).filter(Boolean)
  const datum = new Date()
  const nazevSouboru = `Business case ${kontakt.firma.replace(/[^\p{L}\p{N} .-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 60) || 'zakaznik'} ${datum.toISOString().slice(0, 10)}.xlsx`

  // Excel je bonus: když se ho nepodaří připravit (např. chybí šablona), žádost odejde i bez něj
  let excel: Uint8Array | null = null
  try {
    excel = await vytvorBusinessCase(kontakt.firma, vstupy, datum)
  } catch (e) {
    console.error('[business case] Excel se nepodařilo připravit:', e)
  }

  try {
    await posliEmail({
      komu: prijemci,
      predmet: `Business case: ${kontakt.firma} (${nf(vstupy.lide)} lidí ve směnách)`,
      html: emailObchod(kontakt, vstupy, odhad, Boolean(excel)),
      odpovedetNa: kontakt.email,
      prilohy: excel ? [{ nazev: nazevSouboru, typ: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', data: excel }] : [],
    })
  } catch (e) {
    // Záloha: žádost zůstane aspoň v záznamech serveru na Vercelu
    console.error('[business case] Nepodařilo se odeslat žádost obchodu:', e, kontakt, odhad.shrnuti)
    return chyba(502, `Formulář se teď nepodařilo odeslat. Napište nám prosím na ${KONTAKT_EMAIL} nebo zavolejte na ${KONTAKT_TELEFON}.`)
  }

  try {
    await posliEmail({
      komu: [kontakt.email],
      predmet: 'Váš odhad úspor s AristoTelos',
      html: emailZajemce(vstupy, odhad),
      odpovedetNa: prijemci[0],
    })
  } catch (e) {
    console.error('[business case] Potvrzení zájemci se nepodařilo odeslat:', e)
  }

  return Response.json({ ok: true })
}

// ---------- E-maily ----------

const PISMO = "font-family: 'Segoe UI', Arial, Helvetica, sans-serif; color: #0E1A24;"
const radek = (k: string, v: string, sirka = 250) =>
  `<tr><td width="${sirka}" style="width: ${sirka}px; padding: 6px 16px 6px 0; color: #4A5866; vertical-align: top;">${k}</td><td style="padding: 6px 0; font-weight: 600;">${v}</td></tr>`

function tabulkaOdhadu(v: Vstupy, o: Odhad) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px; margin: 8px 0 20px;">
    ${radek('Lidí ve směnách', nf(v.lide))}
    ${radek('Průměrné hodinové mzdové náklady', `${nf(v.mzda)} Kč`)}
    ${radek('Podíl zaměstnanců na HPP', `${nf(v.hppProcent)} %`)}
    ${radek('Vedoucích, kteří plánují směny', nf(v.vedouci))}
  </table>
  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px; margin: 0 0 8px;">
    ${o.oblasti.map((a) => radek(a.nazev, a.rozpeti)).join('')}
    <tr><td width="250" style="width: 250px; padding: 10px 16px 6px 0; border-top: 1px solid #DCE3E9; font-weight: 700;">Odhad roční úspory</td><td style="padding: 10px 0 6px; border-top: 1px solid #DCE3E9; font-weight: 700; color: #C2410C;">${o.rocne}</td></tr>
  </table>
  <p style="margin: 0 0 20px; font-size: 13px; color: #4A5866;">Rozpětí od opatrného po realistický odhad, měsíčně zhruba ${o.mesicne}.</p>`
}

function emailObchod(k: { jmeno: string; firma: string; email: string; telefon: string }, v: Vstupy, o: Odhad, sExcelem: boolean) {
  return `<div style="${PISMO} font-size: 15px; line-height: 1.5; max-width: 640px;">
  <h2 style="margin: 0 0 12px; font-size: 20px;">Nová žádost o business case z webu</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px; margin: 0 0 20px;">
    ${radek('Jméno', html(k.jmeno), 90)}
    ${radek('Firma', html(k.firma), 90)}
    ${radek('E-mail', `<a href="mailto:${html(k.email)}">${html(k.email)}</a>`, 90)}
    ${radek('Telefon', k.telefon ? `<a href="tel:${html(k.telefon.replace(/\s/g, ''))}">${html(k.telefon)}</a>` : '—', 90)}
  </table>
  <h3 style="margin: 0; font-size: 16px;">Zadání z kalkulačky</h3>
  ${tabulkaOdhadu(v, o)}
  <p style="margin: 0 0 8px;">${
    sExcelem
      ? 'V příloze je komplexní business case předvyplněný těmito údaji (firma, datum, počet lidí, podíl HPP, hodinová mzda, mzda vedoucího jako 1,4násobek a počet vedoucích). Doplňte víkendy, agenturní pracovníky, fluktuaci a ceny.'
      : 'Komplexní business case se tentokrát nepodařilo předvyplnit, údaje výše přepište do Excelu ručně.'
  }</p>
  <p style="margin: 0; color: #4A5866; font-size: 13px;">Zájemci odešlo automatické potvrzení s jeho odhadem. Odpovědí na tento e-mail píšete přímo jemu.</p>
</div>`
}

function emailZajemce(v: Vstupy, o: Odhad) {
  return `<div style="${PISMO} font-size: 15px; line-height: 1.55; max-width: 600px;">
  <p style="margin: 0 0 14px;">Dobrý den,</p>
  <p style="margin: 0 0 14px;">děkujeme za zájem o business case. Žádost máme a ozveme se vám do dvou pracovních dnů.</p>
  <p style="margin: 0 0 4px; font-weight: 600;">Váš odhad z kalkulačky</p>
  ${tabulkaOdhadu(v, o)}
  <p style="margin: 0 0 6px; font-weight: 600;">Co bude následovat</p>
  <ol style="margin: 0 0 16px; padding-left: 20px;">
    <li style="margin-bottom: 4px;">Krátce si zavoláme a domluvíme, jaká data budeme potřebovat: počty lidí podle směn a úvazků, mzdové náklady, přesčasy, víkendovou práci a agenturní pracovníky.</li>
    <li style="margin-bottom: 4px;">Z vašich čísel připravíme business case ve třech scénářích, s náklady, dobou návratnosti a pětiletým cash flow.</li>
    <li>Výsledek s vámi projdeme, aby ho šlo rovnou předložit vedení.</li>
  </ol>
  <p style="margin: 0 0 20px;">Když budete chtít cokoli doplnit, stačí odpovědět na tento e-mail.</p>
  <p style="margin: 0; color: #33424F;">Tým AristoTelos<br>
  <a href="tel:${KONTAKT_TELEFON.replace(/\s/g, '')}" style="color: #006E99;">${KONTAKT_TELEFON}</a> · <a href="mailto:${KONTAKT_EMAIL}" style="color: #006E99;">${KONTAKT_EMAIL}</a><br>
  <a href="https://aristotelos.com" style="color: #006E99;">aristotelos.com</a></p>
  <p style="margin: 20px 0 0; font-size: 12px; color: #4A5866;">Odhad vychází z průměrných předpokladů a není nabídkou. Matematické a Statistické Projekty a Software s.r.o., Podskalská 2046/14, 128 00 Praha 2, IČO 28478614.</p>
</div>`
}
