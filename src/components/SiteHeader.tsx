'use client'
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/funkce', label: 'Produkt', match: (p: string) => p === '/funkce' },
  { href: '/mobilni-aplikace', label: 'Mobilní aplikace', match: (p: string) => p === '/mobilni-aplikace' },
  { href: '/integrace-a-api', label: 'Integrace a API', match: (p: string) => p === '/integrace-a-api' },
  { href: '/#odvetvi', label: 'Řešení', match: (p: string) => p.startsWith('/reseni') },
  { href: '/reference', label: 'Reference', match: (p: string) => p === '/reference' },
  { href: '/bezpecnost', label: 'Bezpečnost', match: (p: string) => p === '/bezpecnost' },
  { href: '/o-nas', label: 'O nás', match: (p: string) => p === '/o-nas' },
]

const base = { color: '#0E1A24', textDecoration: 'none', padding: '10px 0' }
const active = { color: '#006E99', textDecoration: 'none', padding: '10px 0', boxShadow: 'inset 0 -2px 0 #FF6633' }

export default function SiteHeader() {
  const pathname = usePathname() || '/'
  return (
    <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E3E8ED' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px 32px' }}>
        <Link href="/" aria-label="AristoTelos – úvodní stránka" style={{ display: 'flex', alignItems: 'center', minHeight: '44px' }}>
          <img src="/brand/aristotelos-logo.svg" alt="AristoTelos" width={146} height={34} style={{ height: '32px', width: 'auto', display: 'block' }} />
        </Link>
        <nav aria-label="Hlavní menu" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 28px', fontSize: '15px', fontWeight: 500 }}>
          {NAV.map((item) => {
            const on = item.match(pathname)
            return (
              <Link key={item.href} href={item.href} aria-current={on ? 'page' : undefined} style={on ? active : base}>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <Link href="/#demo" style={{ display: 'inline-flex', alignItems: 'center', minHeight: '44px', padding: '0 20px', borderRadius: '8px', background: '#0072A3', color: '#FFFFFF', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
          Domluvit ukázku
        </Link>
      </div>
    </header>
  )
}
