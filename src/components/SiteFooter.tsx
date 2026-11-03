/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

const link = { color: '#33424F', textDecoration: 'none' }
const head = { fontWeight: 600, color: '#0E1A24' }

export default function SiteFooter() {
  return (
    <footer style={{ background: '#F5F8FA', borderTop: '1px solid #E3E8ED', padding: '56px 0 36px', fontSize: '14.5px', color: '#33424F' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <img src="/brand/aristotelos-logo.svg" alt="AristoTelos" width={128} height={30} loading="lazy" style={{ height: '28px', width: 'auto', alignSelf: 'flex-start' }} />
            <span>Matematické a Statistické Projekty a Software s.r.o.</span>
            <span>Podskalská 2046/14, 128 00 Praha 2<br />IČO 28478614</span>
          </div>
          <nav aria-label="Produkt" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={head}>Produkt</span>
            <Link href="/funkce" style={link}>Funkce</Link>
            <Link href="/mobilni-aplikace" style={link}>Mobilní aplikace</Link>
            <Link href="/integrace-a-api" style={link}>Integrace a API</Link>
            <Link href="/bezpecnost" style={link}>Bezpečnost</Link>
            <Link href="/kalkulacka-uspor" style={link}>Kalkulačka úspor</Link>
          </nav>
          <nav aria-label="Řešení" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={head}>Řešení</span>
            <Link href="/reseni/kontaktni-centra" style={link}>Kontaktní centra</Link>
            <Link href="/reseni/obchodni-retezce-a-lekarny" style={link}>Obchodní řetězce a lékárny</Link>
            <Link href="/reseni/distribucni-centra" style={link}>Distribuční centra</Link>
            <Link href="/reseni/banky-a-pojistovny" style={link}>Banky a pojišťovny</Link>
            <Link href="/reseni/energetika-a-telekomunikace" style={link}>Energetika a telekomunikace</Link>
          </nav>
          <nav aria-label="Firma" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={head}>Firma</span>
            <Link href="/o-nas" style={link}>O nás</Link>
            <Link href="/reference" style={link}>Reference</Link>
            <a href="tel:+420606337182" style={link}>+420 606 337 182</a>
            <a href="mailto:info@aristotelos.com" style={link}>info@aristotelos.com</a>
            <span>Kancelář: DOMYNO Office House,<br />Novodvorská 1062/12, Praha 4</span>
          </nav>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px 24px', paddingTop: '24px', borderTop: '1px solid #D5DEE6', fontSize: '13.5px', color: '#4A5866' }}>
          <span>© {new Date().getFullYear()} Matematické a Statistické Projekty a Software s.r.o.</span>
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
            <Link href="/ochrana-osobnich-udaju" style={{ color: '#4A5866' }}>Ochrana osobních údajů</Link>
            <span>ISO/IEC 27001:2022</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
