// Úplný přehled funkcí. Obsah je v src/content/prehled-funkci.json (katalog funkcí doplněný o funkce z ostatních stránek webu).
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import PrehledFunkciSeznam from '@/components/PrehledFunkciSeznam'
import data from '@/content/prehled-funkci.json'

type Funkce = { n: string; p: string }
type Oblast = { id: string; nazev: string; skupiny: { nazev?: string; funkce: Funkce[] }[] }
type Cast = { id: string; nazev: string; oblasti: Oblast[] }

const CASTI = data.casti as Cast[]
const ROLE = data.role as Funkce[]
const pocetFunkci = (o: Oblast[]) => o.reduce((a, x) => a + x.skupiny.reduce((b, s) => b + s.funkce.length, 0), 0)
const OBLASTI = CASTI.flatMap((c) => c.oblasti)
const CELKEM = pocetFunkci(OBLASTI)
const oblasti = (n: number) => (n === 1 ? 'oblast' : n <= 4 ? 'oblasti' : 'oblastí')

const MONO = "'IBM Plex Mono', Menlo, monospace"

export default function PrehledFunkciPage() {
  return (
    <>
      <section style={{ backgroundColor: '#F5F8FA', backgroundImage: 'linear-gradient(#E3EAF0 1px, transparent 1px), linear-gradient(90deg, #E3EAF0 1px, transparent 1px)', backgroundSize: '32px 32px', borderBottom: '1px solid #E3E8ED' }}>
        <div className="hero-wrap" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(460px, 100%), 1fr))', gap: '56px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <div className="hero-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: MONO, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5866' }}>
              <span aria-hidden="true" style={{ display: 'flex', width: '44px', height: '4px' }}>
                <span style={{ flex: '55', background: '#006699' }}></span>
                <span style={{ flex: '45', background: '#FF6633' }}></span>
              </span>
              <span>Přehled funkcí</span>
            </div>
            <h1 className="hero-h1-stranka" style={{ margin: 0, lineHeight: 1.04, letterSpacing: '-0.025em', fontWeight: 700, textWrap: 'balance' }}>Všechno, co AristoTelos umí</h1>
            <p style={{ margin: 0, fontSize: '1.2rem', color: '#33424F', maxWidth: '34em' }}>
              Více než 200 funkcí ve {OBLASTI.length} oblastech, od předpovědi objemu práce po podklady pro mzdy. Všechny jsou součástí AristoTela. Které využijete, záleží na typu vašeho provozu.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <a href="#prehled" style={{ display: 'inline-flex', alignItems: 'center', minHeight: '52px', padding: '0 26px', borderRadius: '8px', background: '#0072A3', color: '#FFFFFF', fontWeight: 600, fontSize: '16px', textDecoration: 'none' }}>Najít funkci</a>
              <a href="#demo" style={{ display: 'inline-flex', alignItems: 'center', minHeight: '52px', padding: '0 24px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #C5D0D9', color: '#0E1A24', fontWeight: 600, fontSize: '16px', textDecoration: 'none' }}>Domluvit ukázku</a>
            </div>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #D5DEE6', borderTop: '4px solid #006699', borderRadius: '14px', boxShadow: '0 28px 56px -28px rgba(14, 26, 36, 0.28)', padding: 'clamp(22px, 3.6vh, 32px)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <span style={{ fontFamily: MONO, fontSize: '13px', color: '#4A5866', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Přehled v číslech</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{CELKEM} funkcí</span>
              <span style={{ color: '#33424F' }}>ve {OBLASTI.length} oblastech, vše v jednom systému</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {CASTI.map((c, i) => (
                <a key={c.id} href={'#' + c.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.2fr) auto', gap: '12px', alignItems: 'baseline', padding: 'clamp(9px, 1.6vh, 14px) 0', borderTop: i ? '1px solid #E3E8ED' : '0', fontSize: '15px', color: '#0E1A24', textDecoration: 'none' }}>
                  <span style={{ fontWeight: 600 }}>{c.nazev}</span>
                  <span style={{ fontFamily: MONO, fontSize: '14px', color: '#33424F' }}>
                    {c.oblasti.length} {oblasti(c.oblasti.length)} · {pocetFunkci(c.oblasti)} funkcí
                  </span>
                  <span aria-hidden="true" style={{ color: '#006E99', fontWeight: 600 }}>→</span>
                </a>
              ))}
            </div>
            <Link href="/funkce" style={{ alignSelf: 'flex-start', fontWeight: 600, fontSize: '15px', display: 'inline-flex', alignItems: 'center', minHeight: '44px' }}>Od předpovědi po mzdy →</Link>
          </div>
        </div>
      </section>

      <section id="prehled" className="pf-sekce" aria-labelledby="pf-nadpis" style={{ padding: '88px 0', background: '#FFFFFF' }}>
        <div className="pf-obal" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <PrehledFunkciSeznam />
        </div>
      </section>

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
