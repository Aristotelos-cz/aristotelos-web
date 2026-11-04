'use client'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode, type CSSProperties } from 'react'
import { cislo, spocitej } from '@/lib/odhadUspor'

const MONO = "'IBM Plex Mono', Menlo, monospace"
const label: CSSProperties = { fontWeight: 600, fontSize: '15px', lineHeight: 1.3 }
const input: CSSProperties = { width: '100%', boxSizing: 'border-box', minHeight: '44px', padding: '0 12px', border: '1px solid #C5D0D9', borderRadius: '8px', font: 'inherit', fontSize: '17px', color: '#0E1A24', background: '#FFFFFF', maxWidth: '140px' }
const range: CSSProperties = { width: '100%', accentColor: '#0072A3', minHeight: '26px', margin: 0 }
const finput: CSSProperties = { width: '100%', boxSizing: 'border-box', minHeight: '48px', padding: '0 14px', border: '1px solid #4A5866', borderRadius: '8px', font: 'inherit', fontSize: '16px', color: '#0E1A24', background: '#FFFFFF' }

type FieldProps = { id: string; label: string; hint: string; value: string; onChange: (v: string) => void; min: number; max: number; step: number; unit: string }
function Field({ id, label: l, hint, value, onChange, min, max, step, unit }: FieldProps) {
  const n = Math.min(max, cislo(value, 0))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
      <label htmlFor={id} style={label}>{l}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input id={id} type="number" inputMode="decimal" min={min} step={step} value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={`${id}-napoveda`} style={input} />
        <span style={{ fontSize: '14.5px', color: '#4A5866' }}>{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={n} onChange={(e) => onChange(e.target.value)} aria-label={`${l} – posuvník`} style={range} />
      <span id={`${id}-napoveda`} className="kalk-nizko-skryt" style={{ fontSize: '12.5px', lineHeight: 1.35, color: '#4A5866' }}>{hint}</span>
    </div>
  )
}

export default function KalkulackaInteraktivni({ uvod, children }: { uvod?: ReactNode; children: ReactNode }) {
  const [n, setN] = useState('550')
  const [w, setW] = useState('200')
  const [hpp, setHpp] = useState('90')
  const [m, setM] = useState('5')
  const [stav, setStav] = useState<'vyplnuje' | 'odesila' | 'odeslano' | 'chyba'>('vyplnuje')
  const [chyba, setChyba] = useState('')
  const zobrazeno = useRef(0)
  useEffect(() => {
    zobrazeno.current = Date.now()
  }, [])

  const r = useMemo(() => {
    const o = spocitej({ lide: cislo(n, 0), mzda: cislo(w, 0), hppProcent: cislo(hpp, 0), vedouci: cislo(m, 0) })
    const max = Math.max(1, ...o.oblasti.map((a) => a.hi))
    return {
      areas: o.oblasti.map((a) => ({ title: a.nazev, range: a.rozpeti, loW: `${((a.lo / max) * 100).toFixed(1)}%`, hiW: `${((a.hi / max) * 100).toFixed(1)}%` })),
      total: o.rocne,
      month: o.mesicne,
      summary: o.shrnuti,
    }
  }, [n, w, hpp, m])

  async function odeslat(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setStav('odesila')
    setChyba('')
    try {
      const odpoved = await fetch('/api/business-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jmeno: f.get('jmeno'),
          firma: f.get('firma'),
          email: f.get('email'),
          telefon: f.get('telefon'),
          web: f.get('web'),
          cas: zobrazeno.current ? Date.now() - zobrazeno.current : 0,
          lide: n,
          mzda: w,
          hpp,
          vedouci: m,
        }),
      })
      const j = (await odpoved.json().catch(() => ({}))) as { ok?: boolean; chyba?: string }
      if (!odpoved.ok || !j.ok) throw new Error(j.chyba || '')
      setStav('odeslano')
    } catch (err) {
      setChyba((err as Error).message || 'Formulář se nepodařilo odeslat. Napište nám prosím na info@aristotelos.com nebo zavolejte na +420 606 337 182.')
      setStav('chyba')
    }
  }

  return (
    <>
      {/* První obrazovka: nadpis a celá kalkulačka (zadání i výsledek) najednou */}
      <section aria-label="Kalkulačka" style={{ backgroundColor: '#F5F8FA', backgroundImage: 'linear-gradient(#E3EAF0 1px, transparent 1px), linear-gradient(90deg, #E3EAF0 1px, transparent 1px)', backgroundSize: '32px 32px', borderBottom: '1px solid #E3E8ED' }}>
        <div className="kalk-sekce" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
          <div className="kalk-uvod" style={{ display: 'flex', flexDirection: 'column' }}>{uvod}</div>
          <div className="kalk-mrizka" style={{ display: 'grid', gap: '20px', alignItems: 'stretch' }}>
            <div className="kalk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid #DCE3E9', borderRadius: '14px', background: '#FFFFFF' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Váš provoz</h2>
              <div className="kalk-pole" style={{ display: 'grid', gap: '16px 22px' }}>
                <Field id="k-n" label="Počet lidí ve směnách" hint="Všichni ve směnách, i brigádníci." value={n} onChange={setN} min={10} max={3000} step={10} unit="lidí" />
                <Field id="k-w" label="Hodinové mzdové náklady" hint="Průměr včetně odvodů zaměstnavatele." value={w} onChange={setW} min={120} max={600} step={5} unit="Kč/h" />
                <Field id="k-h" label="Podíl zaměstnanců na HPP" hint="Zbytek jsou DPP, DPČ a zkrácené úvazky." value={hpp} onChange={setHpp} min={0} max={100} step={5} unit="%" />
                <Field id="k-m" label="Vedoucí, kteří plánují směny" hint="Vedoucí směn, prodejen nebo plánovači." value={m} onChange={setM} min={1} max={100} step={1} unit="lidí" />
              </div>
              <a href="#jak-pocitame" className="kalk-nizko-skryt" style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #E3E8ED', fontSize: '14px', fontWeight: 600 }}>Jak kalkulačka počítá a s jakými předpoklady ↓</a>
              {/* Na mobilu zůstane souhrn při vyplňování přichycený dole na obrazovce */}
              <a href="#k-vysledek" className="kalk-lista" style={{ alignItems: 'center', justifyContent: 'space-between', gap: '12px', margin: '4px -4px -4px', padding: '12px 16px', borderRadius: '10px', background: '#0E1A24', color: '#FFFFFF', textDecoration: 'none', boxShadow: '0 -8px 24px -12px rgba(14, 26, 36, 0.4)' }}>
                <span style={{ fontSize: '13.5px', color: '#C3CED7' }}>Odhad roční úspory</span>
                <span style={{ fontWeight: 700, fontSize: '17px', color: '#FF8A2B', whiteSpace: 'nowrap' }}>{r.total} ↓</span>
              </a>
            </div>
            <div id="k-vysledek" aria-live="polite" className="kalk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '14px', background: '#0E1A24', color: '#FFFFFF' }}>
              <span style={{ fontFamily: MONO, fontSize: '12.5px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#C3CED7' }}>Odhad roční úspory</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="kalk-celkem" style={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, color: '#FF8A2B' }}>{r.total}</span>
                <span style={{ fontSize: '13.5px', color: '#C3CED7' }}>Od opatrného po realistický odhad, měsíčně zhruba {r.month}.</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.16)' }}>
                {r.areas.map((a) => (
                  <div key={a.title} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', fontSize: '14.5px' }}>
                      <span style={{ fontWeight: 600 }}>{a.title}</span>
                      <span style={{ fontFamily: MONO, fontSize: '13px', whiteSpace: 'nowrap' }}>{a.range}</span>
                    </div>
                    <div aria-hidden="true" style={{ position: 'relative', height: '8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: '4px', background: 'rgba(255, 138, 43, 0.45)', width: a.hiW }} />
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: '4px', background: '#FF8A2B', width: a.loW }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="kalk-nizko-skryt" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', fontSize: '12.5px', color: '#C3CED7' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span aria-hidden="true" style={{ width: '14px', height: '8px', borderRadius: '3px', background: '#FF8A2B' }} />opatrný odhad</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span aria-hidden="true" style={{ width: '14px', height: '8px', borderRadius: '3px', background: 'rgba(255, 138, 43, 0.45)' }} />realistický odhad</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 16px', marginTop: 'auto' }}>
                <a href="#business-case" style={{ display: 'inline-flex', alignItems: 'center', minHeight: '44px', padding: '0 20px', borderRadius: '8px', background: '#FFFFFF', color: '#0E1A24', fontWeight: 600, fontSize: '15.5px', textDecoration: 'none' }}>Chci business case na míru</a>
                <span className="kalk-nizko-skryt" style={{ flex: '1 1 220px', fontSize: '12.5px', lineHeight: 1.4, color: '#C3CED7' }}>Víkendové příplatky, agenturní pracovníky a riziko pokut spočítáme v business casu.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {children}

      <section id="business-case" aria-labelledby="k-bc" style={{ padding: '104px 0', background: '#0E1A24', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(440px, 100%), 1fr))', gap: '56px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: MONO, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C3CED7' }}>
              <span aria-hidden="true" style={{ display: 'flex', width: '44px', height: '4px' }}><span style={{ flex: 55, background: '#006699' }} /><span style={{ flex: 45, background: '#FF6633' }} /></span>
              <span>Pro rozhodnutí vedení</span>
            </div>
            <h2 id="k-bc" style={{ margin: 0, fontSize: 'clamp(2rem, 3.2vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 700, textWrap: 'balance' }}>Business case pro vaše vedení</h2>
            <p style={{ margin: 0, fontSize: '1.1rem', color: '#C3CED7' }}>Kalkulačka ukazuje jen část úspor. S vašimi daty připravíme kompletní propočet návratnosti, se kterým půjdete za vedením nebo finančním ředitelem.</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Všech 7 oblastí úspor, včetně víkendových příplatků a náhrady agenturních pracovníků',
                'Vaše čísla místo průměrů, ve třech scénářích: opatrném, realistickém a optimistickém',
                'Náklady na licence a nasazení, doba návratnosti v měsících a ROI',
                'Pětiletý cash flow včetně rozjezdu během nasazení',
                'Riziko pokut od inspekce práce zvlášť',
                'Souhrn pro vedení připravený k tisku nebo do PDF',
              ].map((t) => (
                <li key={t} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" style={{ flex: 'none', marginTop: '3px' }}><path d="M4 10.5l4 4 8-9" style={{ fill: 'none', stroke: '#FF8A2B', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }} /></svg>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: '#FFFFFF', color: '#0E1A24', borderRadius: '14px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {stav !== 'odeslano' ? (
              <form onSubmit={odeslat} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Chci business case na míru</h3>
                <p style={{ margin: 0, padding: '12px 14px', background: '#F5F8FA', borderRadius: '8px', fontSize: '14.5px', color: '#33424F' }}>Z kalkulačky: {r.summary}</p>
                <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
                  <label htmlFor="bc-web">Nevyplňujte</label>
                  <input id="bc-web" name="web" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label htmlFor="bc-jmeno" style={{ fontWeight: 600, fontSize: '14.5px' }}>Jméno a příjmení</label><input id="bc-jmeno" name="jmeno" type="text" autoComplete="name" required style={finput} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label htmlFor="bc-firma" style={{ fontWeight: 600, fontSize: '14.5px' }}>Firma</label><input id="bc-firma" name="firma" type="text" autoComplete="organization" required style={finput} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label htmlFor="bc-email" style={{ fontWeight: 600, fontSize: '14.5px' }}>Pracovní e-mail</label><input id="bc-email" name="email" type="email" autoComplete="email" required style={finput} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label htmlFor="bc-tel" style={{ fontWeight: 600, fontSize: '14.5px' }}>Telefon</label><input id="bc-tel" name="telefon" type="tel" autoComplete="tel" style={finput} /></div>
                </div>
                {stav === 'chyba' && (
                  <p role="alert" style={{ margin: 0, padding: '12px 14px', borderRadius: '8px', background: '#FDECEA', color: '#8A1C12', fontSize: '14.5px' }}>{chyba}</p>
                )}
                <button type="submit" disabled={stav === 'odesila'} style={{ minHeight: '52px', border: 0, borderRadius: '8px', background: '#0072A3', color: '#FFFFFF', font: 'inherit', fontWeight: 600, fontSize: '16px', cursor: stav === 'odesila' ? 'progress' : 'pointer', opacity: stav === 'odesila' ? 0.75 : 1 }}>{stav === 'odesila' ? 'Odesílám…' : 'Odeslat žádost'}</button>
                <p style={{ margin: 0, fontSize: '13px', color: '#4A5866' }}>Ozveme se do dvou pracovních dnů. Odesláním souhlasíte se zpracováním údajů podle <Link href="/ochrana-osobnich-udaju">zásad ochrany osobních údajů</Link>.</p>
              </form>
            ) : (
              <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Děkujeme, žádost máme</h3>
                <p style={{ margin: 0, color: '#33424F' }}>Na váš e-mail jsme poslali potvrzení s odhadem z kalkulačky. Ozveme se do dvou pracovních dnů a domluvíme, jaká data pro business case budeme potřebovat.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
