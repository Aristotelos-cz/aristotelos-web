// Žádost o business case z kalkulačky úspor:
// 1) obchodu přijde e-mail se zadáním a předvyplněným Excelem,
// 2) zájemci přijde potvrzení s jeho odhadem a dalším postupem.
import { vytvorBusinessCase } from '@/lib/businessCaseExcel'
import { PISMO, PODPIS, radek, tabulkaOdhadu, upravenePredpoklady } from '@/lib/emailOdhad'
import { chyba, EMAIL_RE, html, NEJDE_ODESLAT, PRIJEMCI_OBCHOD, prilisMnoho, robot, text, ZMENA_STRANKY, zCizihoWebu } from '@/lib/formular'
import { jeObor, NAZEV_OBORU, spocitejObor, vstupyProExcel, type OdhadOboru } from '@/lib/odhadUspor'
import { posliEmail, postaNastavena } from '@/lib/posta'

export async function POST(request: Request) {
  if (zCizihoWebu(request)) return chyba(403, 'Neplatný původ požadavku.')

  let d: Record<string, unknown>
  try {
    d = await request.json()
  } catch {
    return chyba(400, 'Neplatná data formuláře.')
  }

  // Past na roboty: tváříme se, že je vše v pořádku
  if (robot(d)) return Response.json({ ok: true })
  if (prilisMnoho(request, 'business-case')) return chyba(429, 'Odeslali jste formulář několikrát za sebou. Zkuste to prosím za pár minut.')

  const kontakt = {
    jmeno: text(d.jmeno, 120),
    firma: text(d.firma, 160),
    email: text(d.email, 200).toLowerCase(),
    telefon: text(d.telefon, 40),
  }
  if (kontakt.jmeno.length < 2 || kontakt.firma.length < 2 || !EMAIL_RE.test(kontakt.email)) {
    return chyba(400, 'Vyplňte prosím jméno, firmu a platný pracovní e-mail.')
  }

  // Obor musí být jedna ze stávajících kalkulaček (stránka otevřená před změnou webu ho mít nemusí)
  if (!jeObor(d.obor)) return chyba(400, ZMENA_STRANKY)
  const odhad = spocitejObor(d.obor, { hodnoty: d.hodnoty, predpoklady: d.predpoklady })

  if (!postaNastavena()) {
    if (!process.env.VERCEL_ENV) {
      console.info('[business case] Odesílání e-mailů není nastavené, žádost jen vypisuji:', kontakt, odhad.shrnuti)
      return Response.json({ ok: true })
    }
    console.error('[business case] Chybí nastavení e-mailu (MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MAIL_FROM).')
    return chyba(503, NEJDE_ODESLAT)
  }

  const prijemci = PRIJEMCI_OBCHOD()
  const datum = new Date()
  const nazevSouboru = `Business case ${kontakt.firma.replace(/[^\p{L}\p{N} .-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 60) || 'zakaznik'} ${datum.toISOString().slice(0, 10)}.xlsx`

  // Excel je bonus: šablona záměrně není ve veřejném repozitáři. Když chybí, žádost odejde bez přílohy.
  let excel: Uint8Array | null = null
  try {
    excel = await vytvorBusinessCase(kontakt.firma, vstupyProExcel(odhad), datum)
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') console.error('[business case] Excel se nepodařilo připravit:', e)
  }

  try {
    await posliEmail({
      komu: prijemci,
      predmet: `Business case: ${kontakt.firma} (${NAZEV_OBORU[odhad.obor].toLowerCase()}, ${odhad.rocne} ročně)`,
      html: emailObchod(kontakt, odhad, Boolean(excel)),
      odpovedetNa: kontakt.email,
      prilohy: excel ? [{ nazev: nazevSouboru, typ: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', data: excel }] : [],
    })
  } catch (e) {
    // Záloha: žádost zůstane aspoň v záznamech serveru na Vercelu
    console.error('[business case] Nepodařilo se odeslat žádost obchodu:', e, kontakt, odhad.shrnuti)
    return chyba(502, NEJDE_ODESLAT)
  }

  try {
    await posliEmail({
      komu: [kontakt.email],
      predmet: 'Váš odhad úspor s AristoTelos',
      html: emailZajemce(odhad),
      odpovedetNa: prijemci[0],
    })
  } catch (e) {
    console.error('[business case] Potvrzení zájemci se nepodařilo odeslat:', e)
  }

  return Response.json({ ok: true })
}

// ---------- E-maily ----------

function emailObchod(k: { jmeno: string; firma: string; email: string; telefon: string }, o: OdhadOboru, sExcelem: boolean) {
  return `<div style="${PISMO} font-size: 15px; line-height: 1.5; max-width: 640px;">
  <h2 style="margin: 0 0 12px; font-size: 20px;">Nová žádost o business case z webu</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px; margin: 0 0 20px;">
    ${radek('Jméno', html(k.jmeno), 90)}
    ${radek('Firma', html(k.firma), 90)}
    ${radek('E-mail', `<a href="mailto:${html(k.email)}">${html(k.email)}</a>`, 90)}
    ${radek('Telefon', k.telefon ? `<a href="tel:${html(k.telefon.replace(/\s/g, ''))}">${html(k.telefon)}</a>` : '—', 90)}
  </table>
  <h3 style="margin: 0; font-size: 16px;">Zadání z kalkulačky</h3>
  ${tabulkaOdhadu(o)}
  ${upravenePredpoklady(o)}
  <p style="margin: 0 0 8px;">${
    sExcelem
      ? 'V příloze je komplexní business case předvyplněný těmito údaji (firma, datum, počet lidí, podíl HPP, hodinová mzda, mzda vedoucího jako 1,4násobek a počet vedoucích). Doplňte víkendy, agenturní pracovníky, fluktuaci a ceny.'
      : 'Údaje výše přepište do komplexního business casu v Excelu (list Vstupy) a doplňte víkendy, agenturní pracovníky, fluktuaci a ceny.'
  }</p>
  <p style="margin: 0; color: #4A5866; font-size: 13px;">Zájemci odešlo automatické potvrzení s jeho odhadem. Odpovědí na tento e-mail píšete přímo jemu.</p>
</div>`
}

function emailZajemce(o: OdhadOboru) {
  return `<div style="${PISMO} font-size: 15px; line-height: 1.55; max-width: 600px;">
  <p style="margin: 0 0 14px;">Dobrý den,</p>
  <p style="margin: 0 0 14px;">děkujeme za zájem o business case. Žádost máme a ozveme se vám do dvou pracovních dnů.</p>
  <p style="margin: 0 0 4px; font-weight: 600;">Váš odhad z kalkulačky</p>
  ${tabulkaOdhadu(o)}
  <p style="margin: 0 0 6px; font-weight: 600;">Co bude následovat</p>
  <ol style="margin: 0 0 16px; padding-left: 20px;">
    <li style="margin-bottom: 4px;">Krátce si zavoláme a domluvíme, jaká data budeme potřebovat: počty lidí podle směn a úvazků, mzdové náklady, přesčasy, víkendovou práci a agenturní pracovníky.</li>
    <li style="margin-bottom: 4px;">Z vašich čísel připravíme business case ve třech scénářích, s náklady, dobou návratnosti a pětiletým cash flow.</li>
    <li>Výsledek s vámi projdeme, aby ho šlo rovnou předložit vedení.</li>
  </ol>
  <p style="margin: 0 0 20px;">Když budete chtít cokoli doplnit, stačí odpovědět na tento e-mail.</p>
  ${PODPIS}
</div>`
}
