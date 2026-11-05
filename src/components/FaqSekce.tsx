import faq from '@/content/faq.json'

const PLUS = { fontFamily: "'IBM Plex Mono', Menlo, monospace", color: '#006E99', fontSize: '20px' }

// Časté otázky ze souboru faq.json: stejný text jde na stránku i do strukturovaných dat (FAQPage)
export default function FaqSekce({ path, nadpis }: { path: string; nadpis: string }) {
  const polozky = (faq as Record<string, { q: string; a: string }[]>)[path] || []
  if (!polozky.length) return null
  return (
    <section aria-labelledby="faq-nadpis" style={{ padding: '104px 0', background: '#FFFFFF' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <h2 id="faq-nadpis" style={{ margin: 0, fontSize: 'clamp(1.7rem, min(3.2vw, 5.2vh), 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 700, textWrap: 'balance' }}>{nadpis}</h2>
        <div className="faq-mrizka" style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #D5DEE6' }}>
          {polozky.map((f, i) => (
            <details key={f.q} open={i === 0} style={{ borderBottom: '1px solid #D5DEE6', padding: 'clamp(8px, 1.4vh, 14px) 0' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', minHeight: '44px', fontWeight: 600, fontSize: '1.12rem' }}>
                {f.q}
                <span aria-hidden="true" style={PLUS}>+</span>
              </summary>
              <p style={{ margin: '6px 0 8px', color: '#33424F', maxWidth: '44em' }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
