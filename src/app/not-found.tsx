import Link from 'next/link'

export default function NotFound() {
  return (
    <section style={{ padding: '120px 24px', maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>Stránka nenalezena</h1>
      <p style={{ margin: 0, fontSize: '1.1rem', color: '#33424F' }}>Tahle stránka neexistuje nebo se přesunula. Zkuste úvodní stránku nebo přehled funkcí.</p>
      <p style={{ margin: 0, display: 'flex', gap: '20px', flexWrap: 'wrap' }}><Link href="/">Úvodní stránka</Link><Link href="/funkce">Funkce</Link><Link href="/kalkulacka-uspor">Kalkulačka úspor</Link></p>
    </section>
  )
}
