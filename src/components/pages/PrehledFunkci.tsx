// Úplný přehled funkcí. Obsah je v src/content/prehled-funkci.json (katalog funkcí doplněný o funkce z ostatních stránek webu).
// Úvod s hledáním a katalog podle fází vykresluje PrehledFunkciSeznam, tady jsou role, výzva k ukázce a strukturovaná data.
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import PrehledFunkciSeznam from '@/components/PrehledFunkciSeznam'
import data from '@/content/prehled-funkci.json'

type Funkce = { n: string; p: string }
type Oblast = { id: string; nazev: string; popis: string; skupiny: { nazev?: string; funkce: Funkce[] }[] }
type Faze = { id: string; nazev: string; popis: string; oblasti: Oblast[] }

const OBLASTI = (data.faze as Faze[]).flatMap((f) => f.oblasti)
const ROLE = data.role as Funkce[]

const MONO = "'IBM Plex Mono', Menlo, monospace"

export default function PrehledFunkciPage() {
  return (
    <>
      <PrehledFunkciSeznam />

      <section aria-labelledby="pf-role" style={{ padding: '88px 0', background: '#F5F8FA', borderTop: '1px solid #E3E8ED' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 4.2vh, 48px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '760px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: MONO, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5866' }}>
              <span aria-hidden="true" style={{ display: 'flex', width: '44px', height: '4px' }}>
                <span style={{ flex: '55', background: '#006699' }}></span>
                <span style={{ flex: '45', background: '#FF6633' }}></span>
              </span>
              <span>Role</span>
            </div>
            <h2 id="pf-role" style={{ margin: 0, fontSize: 'clamp(1.7rem, min(3.2vw, 5.2vh), 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 700, textWrap: 'balance' }}>Kdo s AristoTelem pracuje</h2>
            <p style={{ margin: 0, fontSize: '1.1rem', color: '#33424F' }}>Role a jejich oprávnění si nastavíte podle své organizace. Tohle jsou ty nejčastější.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: 'clamp(12px, 2vh, 20px)' }}>
            {ROLE.map((r) => (
              <div key={r.n} style={{ background: '#FFFFFF', border: '1px solid #DCE3E9', borderRadius: '12px', padding: 'clamp(14px, 2.4vh, 24px)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>{r.n}</h3>
                <p style={{ margin: 0, fontSize: '15.5px', color: '#4A5866' }}>{r.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" style={{ padding: '96px 0', background: '#0E1A24', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
            <span aria-hidden="true" style={{ display: 'flex', width: '44px', height: '4px' }}>
              <span style={{ flex: '55', background: '#006699' }}></span>
              <span style={{ flex: '45', background: '#FF6633' }}></span>
            </span>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.65rem, min(3.2vw, 5vh), 2.7rem)', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 700, textWrap: 'balance' }}>Ukážeme vám funkce, které využije váš provoz</h2>
            <p style={{ margin: 0, fontSize: '1.1rem', color: '#C3CED7' }}>Na ukázce projdeme váš způsob plánování a vybereme funkce, které se vám vyplatí. Bez závazků.</p>
          </div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', minHeight: '52px', padding: '0 26px', borderRadius: '8px', background: '#FFFFFF', color: '#0E1A24', fontWeight: 600, fontSize: '16px', textDecoration: 'none' }}>Domluvit ukázku</Link>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Přehled funkcí AristoTela',
          numberOfItems: OBLASTI.length,
          itemListElement: OBLASTI.map((o, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: o.nazev,
            description: o.skupiny.flatMap((s) => s.funkce.map((f) => f.n)).join(', '),
          })),
        }}
      />
    </>
  )
}
