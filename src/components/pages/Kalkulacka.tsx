// Rozcestník kalkulaček úspor: kontaktní centrum a retail
import Link from 'next/link'
import FaqSekce from '@/components/FaqSekce'

const MONO = "'IBM Plex Mono', Menlo, monospace"

const KARTY = [
  {
    href: '/kalkulacka-uspor/kontaktni-centrum',
    nazev: 'Kontaktní centrum',
    pro: 'Pro kontaktní centra, banky, pojišťovny a energetiku',
    co: ['Přesnější obsazení intervalů', 'Nižší fluktuace operátorů', 'Čas plánovačů a team leaderů'],
  },
  {
    href: '/kalkulacka-uspor/retail',
    nazev: 'Retail',
    pro: 'Pro obchodní řetězce a lékárny',
    co: ['Čas vedoucích prodejen', 'Pracovní doba podle návštěvnosti', 'Nižší fluktuace'],
  },
]

export default function KalkulackaPage() {
  return (
    <>
      <section aria-labelledby="rozcestnik-h1" style={{ backgroundColor: '#F5F8FA', backgroundImage: 'linear-gradient(#E3EAF0 1px, transparent 1px), linear-gradient(90deg, #E3EAF0 1px, transparent 1px)', backgroundSize: '32px 32px', borderBottom: '1px solid #E3E8ED' }}>
        <div className="kalk-sekce rozcestnik" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
          <div className="kalk-uvod" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: MONO, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5866' }}>
              <span aria-hidden="true" style={{ display: 'flex', width: '44px', height: '4px' }}><span style={{ flex: 55, background: '#006699' }} /><span style={{ flex: 45, background: '#FF6633' }} /></span>
              <span>Kalkulačka úspor</span>
            </div>
            <h1 id="rozcestnik-h1" className="kalk-h1" style={{ margin: 0, lineHeight: 1.08, letterSpacing: '-0.025em', fontWeight: 700, textWrap: 'balance' }}>Kolik ušetří automatické plánování směn</h1>
            <p className="kalk-perex">Vyberte kalkulačku pro svůj provoz. Výsledek uvidíte hned, bez formuláře.</p>
          </div>
          <div className="rozcestnik-karty">
            {KARTY.map((k) => (
              <Link key={k.href} href={k.href} className="rozcestnik-karta">
                <span style={{ fontFamily: MONO, fontSize: '12.5px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#4A5866' }}>{k.pro}</span>
                <span className="rozcestnik-nazev">{k.nazev}</span>
                <span style={{ fontSize: '15px', color: '#33424F' }}>Spočítá:</span>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '15.5px', color: '#0E1A24' }}>
                  {k.co.map((c) => <li key={c}>{c}</li>)}
                </ul>
                <span className="rozcestnik-tlacitko">Spočítat úsporu →</span>
              </Link>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '15px', color: '#33424F' }}>
            Máte sklad nebo jiný provoz? Úsporu spočítáme s vámi v business casu. <Link href="/#demo" style={{ fontWeight: 600 }}>Domluvit ukázku</Link>
          </p>
        </div>
      </section>
      <FaqSekce path="/kalkulacka-uspor" nadpis="Časté otázky ke kalkulačkám" />
    </>
  )
}
