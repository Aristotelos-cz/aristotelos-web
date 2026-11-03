// Odesílání e-mailů z webu přes firemní Microsoft 365 (Microsoft Graph, přihlášení aplikace přes OAuth).
// Starší SMTP s heslem Microsoft od konce roku 2026 vypíná, Graph je náhrada, kterou doporučuje.
// Nastavení: MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, MAIL_FROM (viz README).

export type Priloha = { nazev: string; typ: string; data: Uint8Array }
export type Zprava = {
  komu: string[]
  predmet: string
  html: string
  odpovedetNa?: string
  prilohy?: Priloha[]
}

export const postaNastavena = () =>
  Boolean(process.env.MS_TENANT_ID && process.env.MS_CLIENT_ID && process.env.MS_CLIENT_SECRET && process.env.MAIL_FROM)

let token: { hodnota: string; platiDo: number } | null = null

async function ziskejToken(): Promise<string> {
  if (token && token.platiDo > Date.now() + 60_000) return token.hodnota
  const odpoved = await fetch(`https://login.microsoftonline.com/${process.env.MS_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID!,
      client_secret: process.env.MS_CLIENT_SECRET!,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
    cache: 'no-store',
  })
  if (!odpoved.ok) throw new Error(`Přihlášení k Microsoft 365 selhalo (${odpoved.status}): ${(await odpoved.text()).slice(0, 300)}`)
  const j = (await odpoved.json()) as { access_token: string; expires_in: number }
  token = { hodnota: j.access_token, platiDo: Date.now() + j.expires_in * 1000 }
  return token.hodnota
}

const base64 = (data: Uint8Array) => Buffer.from(data).toString('base64')

export async function posliEmail(z: Zprava): Promise<void> {
  const odesilatel = process.env.MAIL_FROM!
  const odpoved = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(odesilatel)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await ziskejToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: z.predmet,
        body: { contentType: 'HTML', content: z.html },
        toRecipients: z.komu.map((address) => ({ emailAddress: { address } })),
        replyTo: z.odpovedetNa ? [{ emailAddress: { address: z.odpovedetNa } }] : [],
        attachments: (z.prilohy || []).map((p) => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: p.nazev,
          contentType: p.typ,
          contentBytes: base64(p.data),
        })),
      },
      saveToSentItems: true,
    }),
    cache: 'no-store',
  })
  if (odpoved.status !== 202) throw new Error(`Odeslání e-mailu selhalo (${odpoved.status}): ${(await odpoved.text()).slice(0, 300)}`)
}
