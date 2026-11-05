'use client'
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Polozka = { href: string; label: string }

const PRED: Polozka[] = [
  { href: '/funkce', label: 'Produkt' },
  { href: '/mobilni-aplikace', label: 'Mobilní aplikace' },
  { href: '/integrace-a-api', label: 'Integrace a API' },
]
const RESENI: (Polozka & { popis: string })[] = [
  { href: '/reseni/kontaktni-centra', label: 'Kontaktní centra', popis: 'Předpověď hovorů, napojení na Genesys, Cisco a Daktelu' },
  { href: '/reseni/obchodni-retezce-a-lekarny', label: 'Obchodní řetězce a lékárny', popis: 'Směny podle návštěvnosti a prodejů' },
  { href: '/reseni/distribucni-centra', label: 'Distribuční centra', popis: 'Rotace směn, konto pracovní doby, agentury' },
  { href: '/reseni/banky-a-pojistovny', label: 'Banky a pojišťovny', popis: 'ISO/IEC 27001, provoz i ve vaší infrastruktuře' },
  { href: '/reseni/energetika-a-telekomunikace', label: 'Energetika a telekomunikace', popis: 'Kontaktní centra, pobočky i prodejny v jednom plánu' },
]
const ZA: Polozka[] = [
  { href: '/reference', label: 'Reference' },
  { href: '/bezpecnost', label: 'Bezpečnost' },
  { href: '/o-nas', label: 'O nás' },
  { href: '/kalkulacka-uspor', label: 'Kalkulačka úspor' },
]

const base = { color: '#0E1A24', textDecoration: 'none', padding: '10px 0' }
const active = { color: '#006E99', textDecoration: 'none', padding: '10px 0', boxShadow: 'inset 0 -2px 0 #FF6633' }

function Odkaz({ p, pathname }: { p: Polozka; pathname: string }) {
  const on = pathname === p.href || pathname.startsWith(p.href + '/')
  return (
    <Link href={p.href} aria-current={on ? 'page' : undefined} style={on ? active : base}>
      {p.label}
    </Link>
  )
}

function MenuReseni({ pathname }: { pathname: string }) {
  const [otevreno, setOtevreno] = useState(false)
  const obal = useRef<HTMLDivElement>(null)
  const tlacitko = useRef<HTMLButtonElement>(null)
  const on = pathname.startsWith('/reseni')

  // Zavřít po přechodu na jinou stránku, kliknutí mimo nabídku nebo klávese Escape
  const [minula, setMinula] = useState(pathname)
  if (minula !== pathname) {
    setMinula(pathname)
    setOtevreno(false)
  }
  useEffect(() => {
    if (!otevreno) return
    const mimo = (e: PointerEvent) => {
      if (obal.current && !obal.current.contains(e.target as Node)) setOtevreno(false)
    }
    const klavesa = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOtevreno(false)
        tlacitko.current?.focus()
      }
    }
    document.addEventListener('pointerdown', mimo)
    document.addEventListener('keydown', klavesa)
    return () => {
      document.removeEventListener('pointerdown', mimo)
      document.removeEventListener('keydown', klavesa)
    }
  }, [otevreno])

  return (
    <div ref={obal} style={{ position: 'relative' }}>
      <button
        ref={tlacitko}
        type="button"
        aria-expanded={otevreno}
        aria-controls="menu-reseni"
        onClick={() => setOtevreno((o) => !o)}
        style={{ ...(on ? active : base), display: 'inline-flex', alignItems: 'center', gap: '6px', border: 0, background: 'none', font: 'inherit', cursor: 'pointer' }}
      >
        Řešení
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" style={{ transition: 'transform .15s', transform: otevreno ? 'rotate(180deg)' : 'none' }}>
          <path d="M2.5 4.5L6 8l3.5-3.5" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
        </svg>
      </button>
      <div
        id="menu-reseni"
        hidden={!otevreno}
        className="menu-reseni"
        style={{ position: 'absolute', top: 'calc(100% + 10px)', left: '-20px', zIndex: 60, width: 'min(390px, calc(100vw - 32px))', padding: '8px', background: '#FFFFFF', border: '1px solid #DCE3E9', borderRadius: '12px', boxShadow: '0 20px 40px -16px rgba(14, 26, 36, 0.28)' }}
      >
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {RESENI.map((r) => {
            const tady = pathname === r.href
            return (
              <li key={r.href}>
                <Link
                  href={r.href}
                  aria-current={tady ? 'page' : undefined}
                  onClick={() => setOtevreno(false)}
                  className="menu-reseni-odkaz"
                  style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', color: '#0E1A24', background: tady ? '#EEF5F9' : undefined }}
                >
                  <span style={{ fontWeight: 600, color: tady ? '#006E99' : undefined }}>{r.label}</span>
                  <span style={{ fontSize: '13.5px', fontWeight: 400, color: '#4A5866' }}>{r.popis}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default function SiteHeader() {
  const pathname = usePathname() || '/'
  // Na užších obrazovkách je menu schované pod tlačítkem „Menu“
  const [menu, setMenu] = useState(false)
  const [minula, setMinula] = useState(pathname)
  if (minula !== pathname) {
    setMinula(pathname)
    setMenu(false)
  }
  return (
    <header className={'site-header' + (menu ? ' otevreno' : '')} style={{ background: '#FFFFFF', borderBottom: '1px solid #E3E8ED' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px 32px' }}>
        <Link href="/" aria-label="AristoTelos – úvodní stránka" style={{ display: 'flex', alignItems: 'center', minHeight: '44px' }}>
          <img src="/brand/aristotelos-logo.svg" alt="AristoTelos" width={146} height={34} style={{ height: '32px', width: 'auto', display: 'block' }} />
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menu}
          aria-controls="hlavni-menu"
          onClick={() => setMenu((o) => !o)}
          style={{ alignItems: 'center', gap: '8px', minHeight: '44px', padding: '0 14px', border: '1px solid #C5D0D9', borderRadius: '8px', background: '#FFFFFF', color: '#0E1A24', font: 'inherit', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18">
            {menu ? (
              <path d="M4 4l10 10M14 4L4 14" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }} />
            ) : (
              <path d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }} />
            )}
          </svg>
          {menu ? 'Zavřít' : 'Menu'}
        </button>
        <nav id="hlavni-menu" className="site-nav" aria-label="Hlavní menu" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 20px', fontSize: '14.5px', fontWeight: 500 }}>
          {PRED.map((p) => <Odkaz key={p.href} p={p} pathname={pathname} />)}
          <MenuReseni pathname={pathname} />
          {ZA.map((p) => <Odkaz key={p.href} p={p} pathname={pathname} />)}
        </nav>
        <Link href="/#demo" className="site-cta" onClick={() => setMenu(false)} style={{ display: 'inline-flex', alignItems: 'center', minHeight: '44px', padding: '0 20px', borderRadius: '8px', background: '#0072A3', color: '#FFFFFF', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
          Domluvit ukázku
        </Link>
      </div>
    </header>
  )
}
