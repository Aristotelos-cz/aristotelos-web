// Shrnutí z kalkulačky v PDF za e-mail:
// 1) zájemci přijde e-mail s PDF (odhad, předpoklady, zdroje, další postup),
// 2) obchodu přijde upozornění se zadáním, aby se mohl ozvat.
import { PISMO, PODPIS, radek, tabulkaOdhadu, upravenePredpoklady } from '@/lib/emailOdhad'
import { chyba, EMAIL_RE, html, NEJDE_ODESLAT, PRIJEMCI_OBCHOD, prilisMnoho, robot, text, ZMENA_STRANKY, zCizihoWebu } from '@/lib/formular'
import { jeObor, NAZEV_OBORU, spocitejObor, type OdhadOboru } from '@/lib/odhadUspor'
import { posliEmail, postaNastavena } from '@/lib/posta'
import { SITE_URL } from '@/lib/site'
import { vytvorShrnuti } from '@/lib/shrnutiPdf'

export async function POST(request: Request) {
  if (zCizihoWebu(request)) return chyba(403, 'Neplatný původ požadavku.')

  let d: Record<string, unknown>
  try {
    d = await request.json()
  } catch {
    return chyba(400, 'Neplatná data formuláře.')
  }

  if (robot(d)) return Response.json({ ok: true })
  if (prilisMnoho(request, 'shrnuti')) return chyba(429, 'Shrnutí jste si nechali poslat několikrát za sebou. Zkuste to prosím za pár minut.')

  const email = text(d.email, 200).toLowerCase()
  if (!EMAIL_RE.test(email)) return chyba(400, 'Zadejte prosím platný e-mail.')

  // Obor musí být jedna ze stávajících kalkulaček (stránka otevřená před změnou webu ho mít nemusí)
  if (!jeObor(d.obor)) return chyba(400, ZMENA_STRANKY)
  const obor = d.obor
  const odhad = spocitejObor(obor, { hodnoty: d.hodnoty, predpoklady: d.predpoklady })

  let pdf: Uint8Array
  try {
    pdf = await vytvorShrnuti(odhad, new Date(), SITE_URL)
  } catch (e) {
    console.error('[shrnutí] PDF se nepodařilo vytvořit:', e)
    return chyba(500, NEJDE_ODESLAT)
  }

  if (!postaNastavena()) {
    if (!process.env.VERCEL_ENV) {
      console.info(`[shrnutí] Odesílání e-mailů není nastavené, PDF (${pdf.length} B) pro ${email} jen vypisuji:`, odhad.shrnuti)
      return Response.json({ ok: true })
    }
    console.error('[shrnutí] Chybí nastavení e-mailu (MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MAIL_FROM).')
    return chyba(503, NEJDE_ODESLAT)
  }

  const prijemci = PRIJEMCI_OBCHOD()
  try {
    await posliEmail({
      komu: [email],
      predmet: 'Shrnutí odhadu úspor z plánování směn',
      html: emailZajemce(odhad),
      odpovedetNa: prijemci[0],
      prilohy: [{ nazev: `Odhad úspor AristoTelos – ${NAZEV_OBORU[obor]}.pdf`, typ: 'application/pdf', data: pdf }],
    })
  } catch (e) {
    console.error('[shrnutí] PDF se nepodařilo odeslat:', e, email, odhad.shrnuti)
    return chyba(502, NEJDE_ODESLAT)
  }

  try {
    await posliEmail({
      komu: prijemci,
      predmet: `Shrnutí z kalkulačky: ${email} (${NAZEV_OBORU[obor].toLowerCase()}, ${odhad.rocne} ročně)`,
      html: emailObchod(email, odhad),
      odpovedetNa: email,
    })
  } catch (e) {
    // Zájemce PDF dostal, upozornění obchodu je bonus. Záloha v záznamech serveru:
    console.error('[shrnutí] Upozornění obchodu se nepodařilo odeslat:', e, email, odhad.shrnuti)
  }

  return Response.json({ ok: true })
}

function emailZajemce(o: OdhadOboru) {
  return `<div style="${PISMO} font-size: 15px; line-height: 1.55; max-width: 600px;">
  <p style="margin: 0 0 14px;">Dobrý den,</p>
  <p style="margin: 0 0 14px;">posíláme shrnutí z kalkulačky úspor. V příloze je PDF s odhadem, předpoklady a zdroji, které můžete poslat dál.</p>
  ${tabulkaOdhadu(o)}
  <p style="margin: 0 0 20px;">Kalkulačka ukazuje jen část úspor. Když nám pošlete pár čísel o svém provozu, připravíme business case ve třech scénářích, s náklady, dobou návratnosti a pětiletým cash flow. Stačí odpovědět na tento e-mail.</p>
  ${PODPIS}
</div>`
}

function emailObchod(email: string, o: OdhadOboru) {
  return `<div style="${PISMO} font-size: 15px; line-height: 1.5; max-width: 640px;">
  <h2 style="margin: 0 0 12px; font-size: 20px;">Někdo si nechal poslat shrnutí z kalkulačky</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px; margin: 0 0 20px;">
    ${radek('E-mail', `<a href="mailto:${html(email)}">${html(email)}</a>`, 90)}
  </table>
  <h3 style="margin: 0; font-size: 16px;">Zadání z kalkulačky</h3>
  ${tabulkaOdhadu(o)}
  ${upravenePredpoklady(o)}
  <p style="margin: 0; color: #4A5866; font-size: 13px;">Zájemce dostal PDF se shrnutím. Odpovědí na tento e-mail píšete přímo jemu.</p>
</div>`
}
