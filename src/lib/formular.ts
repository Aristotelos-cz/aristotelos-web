// Společné kontroly pro formuláře z webu (business case, shrnutí v PDF)

export const KONTAKT_TELEFON = '+420 606 337 182'
export const KONTAKT_EMAIL = 'info@aristotelos.com'
export const PRIJEMCI_OBCHOD = () => (process.env.LEAD_EMAIL_TO || KONTAKT_EMAIL).split(',').map((s) => s.trim()).filter(Boolean)
export const NEJDE_ODESLAT = `Formulář se teď nepodařilo odeslat. Napište nám prosím na ${KONTAKT_EMAIL} nebo zavolejte na ${KONTAKT_TELEFON}.`
export const ZMENA_STRANKY = 'Stránka se mezitím změnila. Načtěte ji prosím znovu a odešlete formulář ještě jednou.'

export const text = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max)
export const html = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/

export const chyba = (status: number, zprava: string) => Response.json({ ok: false, chyba: zprava }, { status })

/** Požadavek musí přijít z našeho webu */
export function zCizihoWebu(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).host !== request.headers.get('host')
  } catch {
    return true
  }
}

/** Past na roboty: skryté pole vyplněné nebo formulář odeslaný nelidsky rychle */
export const robot = (d: Record<string, unknown>) => Boolean(text(d.web, 200)) || Number(d.cas) < 2500 || !Number.isFinite(Number(d.cas))

// Jednoduchá ochrana proti opakovanému odesílání (v rámci jedné instance serveru)
const pokusy = new Map<string, number[]>()
export function prilisMnoho(request: Request, formular: string, limit = 5) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'neznámá'
  const klic = `${formular}:${ip}`
  const ted = Date.now()
  const posledni = (pokusy.get(klic) || []).filter((t) => ted - t < 10 * 60_000)
  posledni.push(ted)
  pokusy.set(klic, posledni)
  if (pokusy.size > 5000) pokusy.clear()
  return posledni.length > limit
}
