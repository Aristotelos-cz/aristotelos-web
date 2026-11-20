'use client'

// Přehled funkcí: úvod s hledáním a katalog. Nahoře šest záložek podle fází práce s AristoTelem,
// pod nimi všechny funkce vybrané fáze. Ostatní fáze zůstávají v HTML (jen skryté), aby je viděly vyhledávače.
import Link from 'next/link'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import data from '@/content/prehled-funkci.json'

type Funkce = { n: string; p: string }
type Skupina = { nazev?: string; funkce: Funkce[] }
type Oblast = { id: string; nazev: string; popis: string; skupiny: Skupina[] }
type Faze = { id: string; nazev: string; popis: string; oblasti: Oblast[] }

const FAZE = data.faze as Faze[]

// Ikony oblastí: cesta SVG v mřížce 24 × 24, kreslená obrysem
const IKONY: Record<string, string> = {
  organizace: 'M9 3h6v5H9z M3 16h6v5H3z M15 16h6v5h-6z M12 8v4 M6 16v-4h12v4',
  zamestnanci: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  pravidla: 'M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z M9 12l2 2 4-4',
  predpoved: 'M3 3v18h18 M7 15l4-5 3 3 5-7',
  planovani: 'M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4',
  rizeni: 'M3 12h4l3-8 4 16 3-8h4',
  samoobsluha: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z M11 18h2',
  vedouci: 'M9 3h6v3H9z M7 5H5v16h14V5h-2 M9 13l2 2 4-4',
  schvalovani: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z M10 21h4',
  dochazka: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  nepritomnosti: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  mzdy: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M3 7V6a2 2 0 0 1 2-2h11v3 M16 13.5h2',
  reporty: 'M5 21V10 M12 21V3 M19 21v-7 M3 21h18',
  napojeni: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  api: 'M8 7l-5 5 5 5 M16 7l5 5-5 5 M14 4l-4 16',
  importy: 'M4 8h14l-3-3 M20 16H6l3 3',
  dohled: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  'web-a-mobil': 'M3 4h18v12H3z M8 20h8 M12 16v4',
  prihlaseni: 'M6 11h12v10H6z M8 11V8a4 4 0 0 1 8 0v3',
  sprava: 'M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01',
  spolecne: 'M4 6h10 M18 6h2 M4 12h4 M12 12h8 M4 18h12 M14 4v4 M8 10v4 M16 16v4',
}

const NAPOVEDY = ['výměna směn', 'dovolená', 'přesčasy', 'zákoník práce', 'API']

const pocet = (o: Oblast) => o.skupiny.reduce((a, s) => a + s.funkce.length, 0)
const pocetFaze = (f: Faze) => f.oblasti.reduce((a, o) => a + pocet(o), 0)
const CELKEM = FAZE.reduce((a, f) => a + pocetFaze(f), 0)
const OBLASTI = FAZE.reduce((a, f) => a + f.oblasti.length, 0)
const cislo = (i: number) => String(i + 1).padStart(2, '0')

// Hledání bez ohledu na diakritiku a velikost písmen
const zaklad = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
// Kmen slova: čeština skloňuje, proto se u delších slov porovnává jen začátek (výměna najde i výměny)
const kmen = (w: string) => (w.length <= 3 ? w : w.length === 4 ? w.replace(/[aeiouy]$/, '') : w.slice(0, Math.max(4, w.length - 2)))
const funkci = (n: number) => (n >= 1 && n <= 4 ? 'funkce' : 'funkcí')
// „ve 3 oblastech“, ale „v 5 oblastech“
const vOblastech = (n: number) => `${[2, 3, 4, 12, 13, 14].includes(n) || n >= 20 ? 've' : 'v'} ${n} ${n === 1 ? 'oblasti' : 'oblastech'}`

function shody(o: Oblast, slova: string[]): Funkce[] {
  const sedi = (t: string) => slova.every((s) => t.includes(s))
  const vse = o.skupiny.flatMap((s) => s.funkce)
  if (sedi(zaklad(o.nazev))) return vse
  return vse.filter((f) => sedi(zaklad(f.n + ' ' + f.p)))
}

function Ikona({ id, velikost }: { id: string; velikost: number }) {
  return (
    <svg aria-hidden="true" width={velikost} height={velikost} viewBox="0 0 24 24">
      <path d={IKONY[id]} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RadekFunkce({ f }: { f: Funkce }) {
  return (
    <div>
      <strong>{f.n}</strong>
      <span>{f.p}</span>
    </div>
  )
}

export default function PrehledFunkciSeznam() {
  const [dotaz, setDotaz] = useState('')
  const [vybrana, setVybrana] = useState(FAZE[0].id)
  const zalozky = useRef<HTMLDivElement>(null)

  const slova = useMemo(() => zaklad(dotaz).split(/\s+/).filter((s) => s.length >= 2).map(kmen), [dotaz])
  const hleda = slova.length > 0
  const vysledky = useMemo(
    () =>
      slova.length
        ? FAZE.flatMap((f, i) => f.oblasti.map((o) => ({ faze: `${cislo(i)} ${f.nazev}`, o, funkce: shody(o, slova) }))).filter((v) => v.funkce.length)
        : [],
    [slova],
  )
  const nalezeno = vysledky.reduce((a, v) => a + v.funkce.length, 0)

  // Odkaz na oblast (například /prehled-funkci#dochazka) přepne na její fázi a posune na ni
  useEffect(() => {
    const otevri = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      const f = FAZE.find((x) => x.oblasti.some((o) => o.id === id))
      if (!f) return
      setDotaz('')
      setVybrana(f.id)
      // až po překreslení, dřív je oblast ve skryté fázi
      requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView()))
    }
    otevri()
    window.addEventListener('hashchange', otevri)
    return () => window.removeEventListener('hashchange', otevri)
  }, [])

  // Na telefonu se záložky posouvají do strany: vybraná má být vidět
  useEffect(() => {
    const pas = zalozky.current
    const tlacitko = pas?.querySelector('[aria-pressed="true"]')
    if (!pas || !tlacitko || pas.scrollWidth <= pas.clientWidth) return
    pas.scrollLeft += tlacitko.getBoundingClientRect().left - pas.getBoundingClientRect().left - 24
  }, [vybrana])

  const vyber = (id: string) => {
    setVybrana(id)
    // Když čtenář přepne fázi uprostřed dlouhého seznamu, nová fáze začne od začátku
    const sekce = document.getElementById('prehled')
    const pas = sekce?.querySelector('.pf-zalozky')
    if (sekce && pas && sekce.getBoundingClientRect().top < pas.getBoundingClientRect().top - 1) sekce.scrollIntoView()
  }

  return (
    <>
      <section className="pf-uvod">
        <div className="pf-uvod-obal">
          <div className="pf-uvod-text">
            <div className="pf-eyebrow">
              <span aria-hidden="true">
                <span></span>
                <span></span>
              </span>
              <span>Přehled funkcí</span>
            </div>
            <h1>Všechno, co AristoTelos umí</h1>
            <p>
              {CELKEM} funkcí ve {OBLASTI} oblastech, od předpovědi objemu práce po podklady pro mzdy. Všechny jsou součástí AristoTela. Které využijete, záleží na typu vašeho provozu.
            </p>
            <Link href="/funkce" className="pf-dal">
              Od předpovědi po mzdy: prohlídka se snímky&nbsp;→
            </Link>
          </div>
          <div className="pf-hledani">
            <label htmlFor="pf-dotaz">Najděte funkci</label>
            <div className="pf-pole">
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24">
                <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-3.6-3.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input id="pf-dotaz" type="search" value={dotaz} placeholder="Například výměna směn" autoComplete="off" onChange={(e) => setDotaz(e.target.value)} />
            </div>
            <div className="pf-cipy">
              <span>Zkuste:</span>
              {NAPOVEDY.map((t) => (
                <button key={t} type="button" className="pf-cip" onClick={() => setDotaz(t)}>
                  {t}
                </button>
              ))}
            </div>
            <div className="pf-stav" role="status" aria-live="polite">
              {hleda ? (nalezeno ? `${nalezeno} ${funkci(nalezeno)} ${vOblastech(vysledky.length)}` : 'Nic jsme nenašli') : `${CELKEM} funkcí ve ${OBLASTI} oblastech`}
            </div>
          </div>
        </div>
      </section>

      <section id="prehled" className="pf-sekce" aria-label="Funkce podle fází">
        <div className="pf-zalozky" hidden={hleda}>
          <div ref={zalozky} className="pf-zalozky-obal" role="group" aria-label="Fáze práce s AristoTelem">
            {FAZE.map((f, i) => (
              <button key={f.id} type="button" className="pf-zalozka" aria-pressed={f.id === vybrana} onClick={() => vyber(f.id)}>
                <span className="pf-zalozka-hlava">
                  <span className="pf-zalozka-cislo">{cislo(i)}</span>
                  <span className="pf-zalozka-pocet">{pocetFaze(f)} funkcí</span>
                </span>
                <span className="pf-zalozka-nazev">{f.nazev}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pf-obal">
          {FAZE.map((f, i) => (
            <div key={f.id} className="pf-faze" hidden={hleda || f.id !== vybrana}>
              <div className="pf-faze-uvod">
                <h2>
                  <span>{cislo(i)}</span> {f.nazev}
                </h2>
                <p>{f.popis}</p>
                <span className="pf-mono">
                  {pocetFaze(f)} funkcí {vOblastech(f.oblasti.length)}
                </span>
              </div>
              {f.oblasti.map((o) => (
                <article key={o.id} id={o.id} className="pf-oblast">
                  <div className="pf-oblast-hlava">
                    <span className="pf-ikona">
                      <Ikona id={o.id} velikost={26} />
                    </span>
                    <h3>{o.nazev}</h3>
                    <p>{o.popis}</p>
                    <span className="pf-mono">{pocet(o)} funkcí</span>
                  </div>
                  <div className="pf-funkce">
                    {o.skupiny.map((s, k) => (
                      <Fragment key={s.nazev || k}>
                        {s.nazev && <h4>{s.nazev}</h4>}
                        {s.funkce.map((x) => (
                          <RadekFunkce key={x.n} f={x} />
                        ))}
                      </Fragment>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ))}

          {hleda && (
            <div className="pf-vysledky">
              <div className="pf-vysledky-hlava">
                <h2>Výsledky hledání</h2>
                <button type="button" className="pf-odkaz" onClick={() => setDotaz('')}>
                  Zrušit hledání
                </button>
              </div>
              {nalezeno === 0 ? (
                <p className="pf-nic">
                  Pro „{dotaz.trim()}“ jsme nic nenašli. Zkuste jiné slovo, nebo se <a href="#demo">zeptejte na ukázce</a>.
                </p>
              ) : (
                <div className="pf-vysledky-seznam">
                  {vysledky.map((v) => (
                    <Fragment key={v.o.id}>
                      <h3>
                        {v.o.nazev} <span>{v.faze}</span>
                      </h3>
                      {v.funkce.map((x) => (
                        <RadekFunkce key={x.n} f={x} />
                      ))}
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
