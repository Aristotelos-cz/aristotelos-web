'use client'

import { useEffect, useMemo, useState } from 'react'
import data from '@/content/prehled-funkci.json'

type Funkce = { n: string; p: string }
type Skupina = { nazev?: string; funkce: Funkce[] }
type Oblast = { id: string; nazev: string; skupiny: Skupina[] }
type Cast = { id: string; nazev: string; oblasti: Oblast[] }

const CASTI = data.casti as Cast[]

// Hledání bez ohledu na diakritiku a velikost písmen
const zaklad = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
// Kmen slova: čeština skloňuje, proto se u delších slov porovnává jen začátek (výměna najde i výměny)
const kmen = (w: string) => (w.length <= 3 ? w : w.length === 4 ? w.replace(/[aeiouy]$/, '') : w.slice(0, Math.max(4, w.length - 2)))
const funkci = (n: number) => (n >= 1 && n <= 4 ? 'funkce' : 'funkcí')
// „ve 3 oblastech“, ale „v 5 oblastech“
const vOblastech = (n: number) => `${[2, 3, 4, 12, 13, 14].includes(n) || n >= 20 ? 've' : 'v'} ${n} ${n === 1 ? 'oblasti' : 'oblastech'}`

function vyfiltruj(o: Oblast, slova: string[]): Oblast | null {
  if (!slova.length) return o
  const sedi = (t: string) => slova.every((s) => t.includes(s))
  if (sedi(zaklad(o.nazev))) return o
  const skupiny = o.skupiny
    .map((s) => (s.nazev && sedi(zaklad(s.nazev)) ? s : { ...s, funkce: s.funkce.filter((f) => sedi(zaklad(f.n + ' ' + f.p))) }))
    .filter((s) => s.funkce.length)
  return skupiny.length ? { ...o, skupiny } : null
}

export default function PrehledFunkciSeznam() {
  const [dotaz, setDotaz] = useState('')
  const [otevrene, setOtevrene] = useState<Record<string, boolean>>({})
  const [zavreneVHledani, setZavreneVHledani] = useState<Record<string, boolean>>({})

  const slova = useMemo(() => zaklad(dotaz).split(/\s+/).filter((s) => s.length >= 2).map(kmen), [dotaz])
  const hleda = slova.length > 0

  const casti = useMemo(
    () => CASTI.map((c) => ({ ...c, oblasti: c.oblasti.map((o) => vyfiltruj(o, slova)).filter((o): o is Oblast => o !== null) })),
    [slova],
  )
  const pocetOblasti = casti.reduce((a, c) => a + c.oblasti.length, 0)
  const pocetFunkci = casti.reduce((a, c) => a + c.oblasti.reduce((b, o) => b + o.skupiny.reduce((d, s) => d + s.funkce.length, 0), 0), 0)

  // Odkaz na oblast (například /prehled-funkci#dochazka) ji rovnou rozbalí
  useEffect(() => {
    const otevri = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (id && CASTI.some((c) => c.oblasti.some((o) => o.id === id))) setOtevrene((s) => ({ ...s, [id]: true }))
    }
    otevri()
    window.addEventListener('hashchange', otevri)
    return () => window.removeEventListener('hashchange', otevri)
  }, [])

  const oblast = (o: Oblast) => {
    const pocet = o.skupiny.reduce((a, s) => a + s.funkce.length, 0)
    const otevreno = hleda ? !zavreneVHledani[o.id] : Boolean(otevrene[o.id])
    return (
      <details
        key={o.id}
        id={o.id}
        className="pf-oblast"
        open={otevreno}
        onToggle={(e) => {
          const je = e.currentTarget.open
          if (hleda) setZavreneVHledani((s) => (Boolean(s[o.id]) === !je ? s : { ...s, [o.id]: !je }))
          else setOtevrene((s) => (Boolean(s[o.id]) === je ? s : { ...s, [o.id]: je }))
        }}
      >
        <summary>
          <span className="pf-nazev">{o.nazev}</span>
          <span className="pf-pocet">{pocet}</span>
          <span className="pf-plus" aria-hidden="true">+</span>
        </summary>
        <div className="pf-obsah">
          {o.skupiny.map((s, i) => (
            <div key={s.nazev || i}>
              {s.nazev && <h4>{s.nazev}</h4>}
              <ul>
                {s.funkce.map((f) => (
                  <li key={f.n}>
                    <strong>{f.n}</strong>
                    <span>{f.p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    )
  }

  const cast = (id: string) => casti.find((c) => c.id === id)
  const funkce = cast('funkce')
  const integrace = cast('integrace')
  const platforma = cast('platforma')
  // Funkce ve dvou sloupcích: první polovina vlevo, druhá vpravo
  const pul = funkce ? (hleda ? Math.ceil(funkce.oblasti.length / 2) : 7) : 0

  return (
    <>
      <div className="pf-hlavicka">
        <h2 id="pf-nadpis">Najděte funkci</h2>
        <div className="pf-hledani">
          <label htmlFor="pf-dotaz" className="pf-skryty">Hledat ve funkcích</label>
          <input
            id="pf-dotaz"
            type="search"
            value={dotaz}
            placeholder="Hledat, například výměna směn"
            autoComplete="off"
            onChange={(e) => {
              setDotaz(e.target.value)
              setZavreneVHledani({})
            }}
          />
          <span className="pf-stav" role="status" aria-live="polite">
            {pocetFunkci ? `${pocetFunkci} ${funkci(pocetFunkci)} ${vOblastech(pocetOblasti)}` : 'Nic jsme nenašli'}
          </span>
        </div>
      </div>

      {hleda && pocetFunkci === 0 ? (
        <p className="pf-nic">
          Pro „{dotaz.trim()}“ jsme nic nenašli. Zkuste jiné slovo, nebo se <a href="#demo">zeptejte na ukázce</a>.
        </p>
      ) : (
        <div className="pf-mrizka">
          {funkce && funkce.oblasti.length > 0 && (
            <div className="pf-cast pf-cast-siroka" id="funkce">
              <h3>{funkce.nazev}</h3>
              <div className="pf-dva-sloupce">
                <div>{funkce.oblasti.slice(0, pul).map(oblast)}</div>
                <div>{funkce.oblasti.slice(pul).map(oblast)}</div>
              </div>
            </div>
          )}
          {((integrace && integrace.oblasti.length > 0) || (platforma && platforma.oblasti.length > 0)) && (
            <div className="pf-treti">
              {integrace && integrace.oblasti.length > 0 && (
                <div className="pf-cast" id="integrace">
                  <h3>{integrace.nazev}</h3>
                  <div>{integrace.oblasti.map(oblast)}</div>
                </div>
              )}
              {platforma && platforma.oblasti.length > 0 && (
                <div className="pf-cast" id="platforma">
                  <h3>{platforma.nazev}</h3>
                  <div>{platforma.oblasti.map(oblast)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
