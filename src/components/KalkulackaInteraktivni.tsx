'use client'
import Link from 'next/link'
import { useMemo, useState, type ReactNode, type CSSProperties } from 'react'

// Předpoklady (realistický scénář z kalkulátoru pro nabídky; opatrný = polovina)
const FOND_HPP = 38
const FOND_ZKRACENY = 20
const TYDNU_V_MESICI = 4.345
const VYKON_V_NEEFEKTIVNICH_HODINACH = 0.3
const PRIPLATEK_PRESCAS = 1.25
const NASOBEK_VEDOUCI = 1.4
const NAKLADY_ZASKOLENI = 30000

const MONO = "'IBM Plex Mono', Menlo, monospace"
const label: CSSProperties = { fontWeight: 600, fontSize: '15.5px' }
const input: CSSProperties = { width: '100%', boxSizing: 'border-box', minHeight: '48px', padding: '0 14px', border: '1px solid #C5D0D9', borderRadius: '8px', font: 'inherit', fontSize: '17px', color: '#0E1A24', background: '#FFFFFF', maxWidth: '160px' }
const range: CSSProperties = { width: '100%', accentColor: '#0072A3', minHeight: '32px', margin: 0 }
const finput: CSSProperties = { width: '100%', boxSizing: 'border-box', minHeight: '48px', padding: '0 14px', border: '1px solid #4A5866', borderRadius: '8px', font: 'inherit', fontSize: '16px', color: '#0E1A24', background: '#FFFFFF' }

const num = (v: string, d: number) => {
  const x = parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(x) && x >= 0 ? x : d
}
const nf = (x: number, d: number) => x.toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d })
const range2 = (lo: number, hi: number) => {
  if (hi >= 1e6) return `${nf(lo / 1e6, 1)}–${nf(hi / 1e6, 1)} mil. Kč`
  if (hi >= 1e4) return `${nf(Math.round(lo / 1e3), 0)}–${nf(Math.round(hi / 1e3), 0)} tis. Kč`
  return `${nf(Math.round(lo / 100) * 100, 0)}–${nf(Math.round(hi / 100) * 100, 0)} Kč`
}

type FieldProps = { id: string; label: string; hint: string; value: string; onChange: (v: string) => void; min: number; max: number; step: number; unit: string }
function Field({ id, label: l, hint, value, onChange, min, max, step, unit }: FieldProps) {
  const n = Math.min(max, num(value, 0))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label htmlFor={id} style={label}>{l}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input id={id} type="number" inputMode="decimal" min={min} step={step} value={value} onChange={(e) => onChange(e.target.value)} style={input} />
        <span style={{ fontSize: '15px', color: '#4A5866' }}>{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={n} onChange={(e) => onChange(e.target.value)} aria-label={`${l} – posuvník`} style={range} />
      <span style={{ fontSize: '13.5px', color: '#4A5866' }}>{hint}</span>
    </div>
  )
}

export default function KalkulackaInteraktivni({ children }: { children: ReactNode }) {
  const [n, setN] = useState('550')
  const [w, setW] = useState('200')
  const [hpp, setHpp] = useState('90')
  const [m, setM] = useState('5')
  const [sent, setSent] = useState(false)

  const r = useMemo(() => {
    const N = num(n, 0), W = num(w, 0), M = num(m, 0)
    const hppPct = Math.min(100, num(hpp, 0)), H = hppPct / 100
    const fond = (H * FOND_HPP + (1 - H) * FOND_ZKRACENY) * TYDNU_V_MESICI
    const areas = [
      { title: 'Obsazení provozu', lo: N * fond * W * 0.005 * (1 - VYKON_V_NEEFEKTIVNICH_HODINACH) * 12, hi: N * fond * W * 0.01 * (1 - VYKON_V_NEEFEKTIVNICH_HODINACH) * 12 },
      { title: 'Přesčasy a neodpracované hodiny', lo: N * H * (0.05 * W * PRIPLATEK_PRESCAS + 0.005 * W) * 12, hi: N * H * (0.1 * W * PRIPLATEK_PRESCAS + 0.01 * W) * 12 },
      { title: 'Čas vedoucích', lo: M * 16 * W * NASOBEK_VEDOUCI * 12, hi: M * 32 * W * NASOBEK_VEDOUCI * 12 },
      { title: 'Fluktuace', lo: N * 0.01 * NAKLADY_ZASKOLENI, hi: N * 0.02 * NAKLADY_ZASKOLENI },
    ]
    const max = Math.max(1, ...areas.map((a) => a.hi))
    const lo = areas.reduce((s, a) => s + a.lo, 0)
    const hi = areas.reduce((s, a) => s + a.hi, 0)
    return {
      areas: areas.map((a) => ({ ...a, range: range2(a.lo, a.hi), loW: `${((a.lo / max) * 100).toFixed(1)}%`, hiW: `${((a.hi / max) * 100).toFixed(1)}%` })),
      total: range2(lo, hi),
      month: range2(lo / 12, hi / 12),
      summary: `${nf(N, 0)} lidí ve směnách, ${nf(W, 0)} Kč/h, ${nf(hppPct, 0)} % HPP, ${nf(M, 0)} vedoucích, odhad ${range2(lo, hi)} ročně`,
    }
  }, [n, w, hpp, m])

  return (
    <>
      <section aria-label="Kalkulačka" style={{ padding: '56px 0 96px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))', gap: '32px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', padding: '32px', border: '1px solid #DCE3E9', borderRadius: '14px', background: '#F5F8FA' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Váš provoz</h2>
            <Field id="k-n" label="Počet lidí ve směnách" hint="Všichni, kterým se plánují směny, včetně brigádníků." value={n} onChange={setN} min={10} max={3000} step={10} unit="lidí" />
            <Field id="k-w" label="Průměrné hodinové mzdové náklady" hint="Mzda včetně odvodů zaměstnavatele, průměr za všechny lidi ve směnách." value={w} onChange={setW} min={120} max={600} step={5} unit="Kč/h" />
            <Field id="k-h" label="Podíl zaměstnanců na HPP" hint="Zbytek jsou DPP, DPČ a další zkrácené úvazky." value={hpp} onChange={setHpp} min={0} max={100} step={5} unit="%" />
            <Field id="k-m" label="Počet vedoucích, kteří plánují směny" hint="Vedoucí směn, prodejen, týmů nebo plánovači." value={m} onChange={setM} min={1} max={100} step={1} unit="lidí" />
          </div>
          <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: '22px', padding: '32px', borderRadius: '14px', background: '#0E1A24', color: '#FFFFFF' }}>
            <span style={{ fontFamily: MONO, fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#C3CED7' }}>Odhad roční úspory</span>
            <span style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, color: '#FF8A2B' }}>{r.total}</span>
            <p style={{ margin: 0, fontSize: '15px', color: '#C3CED7' }}>Rozpětí od opatrného po realistický odhad. Měsíčně zhruba {r.month}.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.16)' }}>
              {r.areas.map((a) => (
                <div key={a.title} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', fontSize: '15.5px' }}>
                    <span style={{ fontWeight: 600 }}>{a.title}</span>
                    <span style={{ fontFamily: MONO, fontSize: '14px', whiteSpace: 'nowrap' }}>{a.range}</span>
                  </div>
                  <div aria-hidden="true" style={{ position: 'relative', height: '10px', borderRadius: '5px', background: 'rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: '5px', background: 'rgba(255, 138, 43, 0.45)', width: a.hiW }} />
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: '5px', background: '#FF8A2B', width: a.loW }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: '13px', color: '#C3CED7' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span aria-hidden="true" style={{ width: '14px', height: '8px', borderRadius: '3px', background: '#FF8A2B' }} />opatrný odhad</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span aria-hidden="true" style={{ width: '14px', height: '8px', borderRadius: '3px', background: 'rgba(255, 138, 43, 0.45)' }} />realistický odhad</span>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#C3CED7' }}>Odhad počítá s předpoklady, které používáme v nabídkách. Skutečná úspora závisí na vašem provozu. Víkendové příplatky, agenturní pracovníky a riziko pokut spočítáme v business casu.</p>
            <a href="#business-case" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: '48px', padding: '0 22px', borderRadius: '8px', background: '#FFFFFF', color: '#0E1A24', fontWeight: 600, fontSize: '16px', textDecoration: 'none' }}>Chci business case na míru</a>
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
            {!sent ? (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Chci business case na míru</h3>
                <p style={{ margin: 0, padding: '12px 14px', background: '#F5F8FA', borderRadius: '8px', fontSize: '14.5px', color: '#33424F' }}>Z kalkulačky: {r.summary}</p>
                <input type="hidden" name="kalkulacka" value={r.summary} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label htmlFor="bc-jmeno" style={{ fontWeight: 600, fontSize: '14.5px' }}>Jméno a příjmení</label><input id="bc-jmeno" name="jmeno" type="text" autoComplete="name" required style={finput} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label htmlFor="bc-firma" style={{ fontWeight: 600, fontSize: '14.5px' }}>Firma</label><input id="bc-firma" name="firma" type="text" autoComplete="organization" required style={finput} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label htmlFor="bc-email" style={{ fontWeight: 600, fontSize: '14.5px' }}>Pracovní e-mail</label><input id="bc-email" name="email" type="email" autoComplete="email" required style={finput} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label htmlFor="bc-tel" style={{ fontWeight: 600, fontSize: '14.5px' }}>Telefon</label><input id="bc-tel" name="telefon" type="tel" autoComplete="tel" style={finput} /></div>
                </div>
                <button type="submit" style={{ minHeight: '52px', border: 0, borderRadius: '8px', background: '#0072A3', color: '#FFFFFF', font: 'inherit', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}>Odeslat žádost</button>
                <p style={{ margin: 0, fontSize: '13px', color: '#4A5866' }}>Ozveme se do dvou pracovních dnů. Odesláním souhlasíte se zpracováním údajů podle <Link href="/ochrana-osobnich-udaju">zásad ochrany osobních údajů</Link>.</p>
              </form>
            ) : (
              <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Děkujeme, žádost máme</h3>
                <p style={{ margin: 0, color: '#33424F' }}>Ozveme se do dvou pracovních dnů a domluvíme, jaká data pro business case budeme potřebovat.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
