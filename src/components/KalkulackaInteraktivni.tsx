'use client'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { cislo, NASTAVENI, type Nastaveni, type Obor, type OdhadOboru, type PoleCislo, type Predpoklad, spocitejObor } from '@/lib/odhadUspor'

const MONO = "'IBM Plex Mono', Menlo, monospace"
const KONTAKT = 'Napište nám prosím na info@aristotelos.com nebo zavolejte na +420 606 337 182.'
const label: CSSProperties = { fontWeight: 600, fontSize: '15px', lineHeight: 1.3 }
const input: CSSProperties = { width: '100%', boxSizing: 'border-box', minHeight: '44px', padding: '0 12px', border: '1px solid #C5D0D9', borderRadius: '8px', font: 'inherit', fontSize: '17px', color: '#0E1A24', background: '#FFFFFF', maxWidth: '140px' }
const range: CSSProperties = { width: '100%', accentColor: '#0072A3', minHeight: '26px', margin: 0 }
const finput: CSSProperties = { width: '100%', boxSizing: 'border-box', minHeight: '48px', padding: '0 14px', border: '1px solid #4A5866', borderRadius: '8px', font: 'inherit', fontSize: '16px', color: '#0E1A24', background: '#FFFFFF' }
const eyebrow: CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', fontFamily: MONO, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4A5866' }
const h2: CSSProperties = { margin: 0, fontSize: 'clamp(1.5rem, min(3vw, 4.2vh), 2.4rem)', lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 700, textWrap: 'balance' }

// Texty sekcí s předpoklady podle oboru
const TEXTY: Record<Obor, { hlavni: { nadpis: string; text: string }; doplnek: { nadpis: string; text: string; navic: string } }> = {
  'kontaktni-centrum': {
    hlavni: { nadpis: 'Výpočet a předpoklady, které můžete upravit', text: 'Vlevo opatrný, vpravo realistický odhad. Procenta jsou nižší, než uvádějí studie objednané dodavateli. Když je přepíšete, výsledek nahoře se hned přepočítá.' },
    doplnek: { nadpis: 'Doplňte přesčasy, pokud je znáte', text: 'Přesčasy počítáme, jen když zadáte, kolik jich operátoři měsíčně odpracují. Bez toho zůstávají mimo odhad.', navic: 'V business casu navíc spočítáme úroveň obsluhy při stejném počtu lidí, víkendové a noční příplatky a agenturní pracovníky.' },
  },
  retail: {
    hlavni: { nadpis: 'Výpočet a předpoklady, které můžete upravit', text: 'Vlevo opatrný, vpravo realistický odhad. Procenta jsou pod spodní hranicí veřejných studií. Když je přepíšete, výsledek nahoře se hned přepočítá.' },
    doplnek: { nadpis: 'Doplňte, co o prodejnách víte', text: 'Přesčasy a tržby počítáme, jen když zadáte výchozí údaj. Bez něj zůstávají mimo odhad.', navic: 'Růst tržeb ukazujeme zvlášť a do celkové úspory ho nezapočítáváme.' },
  },
}

type Hodnoty = Record<string, string>
type Predp = Record<string, [string, string]>
// Pole s „0 = nevím“ začínají prázdná, s nápisem „nevím“
const vychoziHodnoty = (n: Nastaveni): Hodnoty => Object.fromEntries(n.pole.map((p) => [p.klic, p.typ === 'cislo' && p.nula && p.vychozi === 0 ? '' : String(p.vychozi)]))
const vychoziPredp = (n: Nastaveni): Predp => Object.fromEntries(n.predpoklady.map((p) => [p.klic, [String(p.opatrne), String(p.realisticky)]]))

function Field({ pole, value, onChange }: { pole: PoleCislo; value: string; onChange: (v: string) => void }) {
  const id = `k-${pole.klic}`
  const max = pole.posuvnik ?? pole.max
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
      <label htmlFor={id} style={label}>{pole.label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input id={id} type="number" inputMode="decimal" min={pole.min} max={pole.max} step={pole.krok} value={value} placeholder={pole.nula ? 'nevím' : undefined} onChange={(e) => onChange(e.target.value)} aria-describedby={`${id}-napoveda`} style={input} />
        <span style={{ fontSize: '14.5px', color: '#4A5866' }}>{pole.jednotka}</span>
      </div>
      <input type="range" className="kalk-posuvnik" min={pole.min} max={max} step={pole.krok} value={Math.min(max, cislo(value, 0))} onChange={(e) => onChange(e.target.value)} aria-label={`${pole.label} – posuvník`} style={range} />
      <span id={`${id}-napoveda`} className="kalk-napoveda" style={{ fontSize: '12.5px', lineHeight: 1.35, color: '#4A5866' }}>{pole.napoveda}</span>
    </div>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div style={eyebrow}>
      <span aria-hidden="true" style={{ display: 'flex', width: '44px', height: '4px' }}><span style={{ flex: 55, background: '#006699' }} /><span style={{ flex: 45, background: '#FF6633' }} /></span>
      <span>{children}</span>
    </div>
  )
}

/** Tabulka oblastí a předpokladů: vzorec, upravitelné hodnoty, výsledek oblasti a zdroje */
function Predpoklady({ nast, skupina, odhad, predp, setPredp }: { nast: Nastaveni; skupina: 'hlavni' | 'doplnek'; odhad: OdhadOboru; predp: Predp; setPredp: (f: (p: Predp) => Predp) => void }) {
  const pdef = (klic: string) => nast.predpoklady.find((p) => p.klic === klic) as Predpoklad
  const oblasti = nast.oblasti.filter((o) => o.skupina === skupina)
  const nastav = (klic: string, i: 0 | 1, v: string, jedna?: boolean) =>
    setPredp((p) => ({ ...p, [klic]: jedna ? [v, v] : i === 0 ? [v, p[klic][1]] : [p[klic][0], v] }))
  const vstup = (p: Predpoklad, i: 0 | 1, nazev: string) => (
    <span className="predp-vstup">
      <input type="number" inputMode="decimal" min={p.min} max={p.max} step={p.krok} value={predp[p.klic][i]} onChange={(e) => nastav(p.klic, i, e.target.value, p.jedna)} aria-label={`${p.label}${nazev ? ` – ${nazev}` : ''} (${p.jednotka})`} />
      <span aria-hidden="true">{p.jednotka.length <= 2 ? p.jednotka : ''}</span>
    </span>
  )
  return (
    <div className="predp">
      <div className="predp-radek predp-hlavicka" aria-hidden="true">
        <span>Oblast</span>
        <span className="predp-vstupy"><span>Předpoklad</span><span>Opatrně</span><span>Realisticky</span></span>
        <span>Úspora za rok</span>
        <span>Z čeho vycházíme</span>
      </div>
      {oblasti.map((o) => {
        const vysledek = odhad.oblasti.find((a) => a.klic === o.klic) || odhad.mimoSoucet.find((a) => a.klic === o.klic)
        return (
          <div key={o.klic} className="predp-radek" role="group" aria-label={o.nazev}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '16px', lineHeight: 1.25 }}>{o.nazev}</span>
              <span className="predp-vzorec">{o.vzorec}</span>
            </div>
            <div className="predp-vstupy">
              <span className="predp-mobil" aria-hidden="true">Předpoklad</span>
              <span className="predp-mobil" aria-hidden="true">Opatrně</span>
              <span className="predp-mobil" aria-hidden="true">Realisticky</span>
              {o.predpoklady.map((klic) => {
                const p = pdef(klic)
                return (
                  <div key={klic} style={{ display: 'contents' }}>
                    <span className="predp-label">
                      {p.label}
                      {p.jednotka.length > 2 && <span style={{ color: '#4A5866' }}> ({p.jednotka})</span>}
                      {p.napoveda && <span className="predp-napoveda">{p.napoveda}</span>}
                    </span>
                    {p.jedna ? (
                      <span style={{ gridColumn: 'span 2' }}>{vstup(p, 0, '')}</span>
                    ) : (
                      <>
                        {vstup(p, 0, 'opatrně')}
                        {vstup(p, 1, 'realisticky')}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="predp-uspora">
              <span className="predp-mobil" aria-hidden="true">Úspora za rok</span>
              {vysledek ? (
                <span style={{ fontWeight: 700, fontFamily: MONO, fontSize: '14.5px', color: '#0E1A24' }}>{vysledek.rozpeti}{o.mimoSoucet && <span style={{ display: 'block', fontFamily: 'inherit', fontWeight: 400, fontSize: '13px', color: '#4A5866' }}>mimo součet</span>}</span>
              ) : (
                <span style={{ fontSize: '14px', color: '#4A5866' }}>{o.neaktivni || 'zadejte údaj'}</span>
              )}
            </div>
            <div className="predp-opora">
              <span>{o.opora}</span>
              {o.odkazy.length > 0 && (
                <span>
                  Zdroj:{' '}
                  {o.odkazy.map((z, i) => (
                    <span key={z.url}>{i > 0 && ' · '}<a href={z.url} target="_blank" rel="noopener">{z.nazev}</a></span>
                  ))}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function KalkulackaInteraktivni({ obor, uvod, children }: { obor: Obor; uvod?: ReactNode; children?: ReactNode }) {
  const nast = NASTAVENI[obor]
  const texty = TEXTY[obor]
  const [hodnoty, setHodnoty] = useState<Hodnoty>(() => vychoziHodnoty(nast))
  const [predp, setPredp] = useState<Predp>(() => vychoziPredp(nast))
  const [stav, setStav] = useState<'vyplnuje' | 'odesila' | 'odeslano' | 'chyba'>('vyplnuje')
  const [chyba, setChyba] = useState('')
  const [pdf, setPdf] = useState<'zavreno' | 'otevreno' | 'odesila' | 'odeslano' | 'chyba'>('zavreno')
  const [pdfChyba, setPdfChyba] = useState('')
  const [pdfEmail, setPdfEmail] = useState('')
  const pdfVstup = useRef<HTMLInputElement>(null)
  const pdfTlacitko = useRef<HTMLButtonElement>(null)
  const zobrazeno = useRef(0)
  useEffect(() => {
    zobrazeno.current = Date.now()
  }, [])
  useEffect(() => {
    if (pdf === 'otevreno') pdfVstup.current?.focus()
  }, [pdf])

  const odhad = useMemo(() => spocitejObor(obor, { hodnoty, predpoklady: predp }), [obor, hodnoty, predp])
  const r = useMemo(() => {
    const max = Math.max(1, ...odhad.oblasti.map((a) => a.hi))
    return odhad.oblasti.map((a) => ({ ...a, loW: `${((a.lo / max) * 100).toFixed(1)}%`, hiW: `${((a.hi / max) * 100).toFixed(1)}%` }))
  }, [odhad])
  const volba = nast.pole.find((p) => p.typ === 'volba')
  const cisla = nast.pole.filter((p): p is PoleCislo => p.typ === 'cislo')
  const zmeneno = (skupina: 'hlavni' | 'doplnek') =>
    nast.oblasti.filter((o) => o.skupina === skupina).flatMap((o) => o.predpoklady).some((k) => {
      const p = nast.predpoklady.find((x) => x.klic === k)!
      return cislo(predp[k][0], -1) !== p.opatrne || cislo(predp[k][1], -1) !== p.realisticky
    })
  const vratit = (skupina: 'hlavni' | 'doplnek') => {
    const klice = new Set(nast.oblasti.filter((o) => o.skupina === skupina).flatMap((o) => o.predpoklady))
    const v = vychoziPredp(nast)
    setPredp((p) => Object.fromEntries(Object.entries(p).map(([k, x]) => [k, klice.has(k) ? v[k] : x])))
  }
  const data = () => ({ obor, hodnoty, predpoklady: predp, cas: zobrazeno.current ? Date.now() - zobrazeno.current : 0 })

  async function posli(url: string, telo: object) {
    const odpoved = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(telo) })
    const j = (await odpoved.json().catch(() => ({}))) as { ok?: boolean; chyba?: string }
    if (!odpoved.ok || !j.ok) throw new Error(j.chyba || `Formulář se nepodařilo odeslat. ${KONTAKT}`)
  }

  async function odeslat(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setStav('odesila')
    setChyba('')
    try {
      await posli('/api/business-case', { ...data(), jmeno: f.get('jmeno'), firma: f.get('firma'), email: f.get('email'), telefon: f.get('telefon'), web: f.get('web') })
      setStav('odeslano')
    } catch (err) {
      setChyba((err as Error).message)
      setStav('chyba')
    }
  }

  async function odeslatPdf(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setPdf('odesila')
    setPdfChyba('')
    try {
      await posli('/api/shrnuti', { ...data(), email: f.get('email'), web: f.get('web') })
      setPdfEmail(String(f.get('email') || ''))
      setPdf('odeslano')
    } catch (err) {
      setPdfChyba((err as Error).message)
      setPdf('chyba')
    }
  }
  const zavritPdf = () => {
    setPdf('zavreno')
    setPdfChyba('')
    requestAnimationFrame(() => pdfTlacitko.current?.focus())
  }

  const souhrn = (
    <p className="predp-souhrn" aria-live="polite">
      S těmito předpoklady: <strong>{odhad.rocne} ročně</strong>
    </p>
  )

  return (
    <>
      {/* První obrazovka: nadpis a celá kalkulačka (zadání i výsledek) najednou */}
      <section aria-label="Kalkulačka" style={{ backgroundColor: '#F5F8FA', backgroundImage: 'linear-gradient(#E3EAF0 1px, transparent 1px), linear-gradient(90deg, #E3EAF0 1px, transparent 1px)', backgroundSize: '32px 32px', borderBottom: '1px solid #E3E8ED' }}>
        <div className="kalk-sekce" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
          <div className="kalk-uvod" style={{ display: 'flex', flexDirection: 'column' }}>{uvod}</div>
          <div className="kalk-mrizka" style={{ display: 'grid', gap: '20px', alignItems: 'stretch' }}>
            <div className="kalk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid #DCE3E9', borderRadius: '14px', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px 16px', minHeight: '40px' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Váš provoz</h2>
                {volba && volba.typ === 'volba' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14.5px', fontWeight: 600 }}>
                    {volba.label}
                    <select value={hodnoty[volba.klic]} onChange={(e) => setHodnoty((h) => ({ ...h, [volba.klic]: e.target.value }))} className="kalk-volba">
                      {volba.moznosti.map((m) => <option key={m.hodnota} value={m.hodnota}>{m.label}</option>)}
                    </select>
                  </label>
                )}
              </div>
              <div className="kalk-pole" style={{ display: 'grid', gap: '16px 22px' }}>
                {cisla.map((p) => <Field key={p.klic} pole={p} value={hodnoty[p.klic]} onChange={(v) => setHodnoty((h) => ({ ...h, [p.klic]: v }))} />)}
              </div>
              <a href="#jak-pocitame" className="kalk-nizko-skryt" style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #E3E8ED', fontSize: '14px', fontWeight: 600 }}>
                {nast.predpoklady.length ? 'Ukázat výpočet a upravit předpoklady ↓' : 'Jak kalkulačka počítá a s jakými předpoklady ↓'}
              </a>
              {/* Na mobilu zůstane souhrn při vyplňování přichycený dole na obrazovce */}
              <a href="#k-vysledek" className="kalk-lista" style={{ alignItems: 'center', justifyContent: 'space-between', gap: '12px', margin: '4px -4px -4px', padding: '12px 16px', borderRadius: '10px', background: '#0E1A24', color: '#FFFFFF', textDecoration: 'none', boxShadow: '0 -8px 24px -12px rgba(14, 26, 36, 0.4)' }}>
                <span style={{ fontSize: '13.5px', color: '#C3CED7' }}>Odhad roční úspory</span>
                <span style={{ fontWeight: 700, fontSize: '17px', color: '#FF8A2B', whiteSpace: 'nowrap' }}>{odhad.rocne} ↓</span>
              </a>
            </div>
            <div id="k-vysledek" className="kalk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '14px', background: '#0E1A24', color: '#FFFFFF' }}>
              <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontFamily: MONO, fontSize: '12.5px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#C3CED7' }}>Odhad roční úspory</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="kalk-celkem" style={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, color: '#FF8A2B' }}>{odhad.rocne}</span>
                  <span style={{ fontSize: '13.5px', color: '#C3CED7' }}>Od opatrného po realistický odhad. Měsíc odkladu stojí zhruba {odhad.mesicne}.</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.16)' }}>
                  {r.map((a) => (
                    <div key={a.klic} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', fontSize: '14.5px' }}>
                        <span style={{ fontWeight: 600 }}>{a.nazev}</span>
                        <span style={{ fontFamily: MONO, fontSize: '13px', whiteSpace: 'nowrap' }}>{a.rozpeti}</span>
                      </div>
                      <div aria-hidden="true" style={{ position: 'relative', height: '8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: '4px', background: 'rgba(255, 138, 43, 0.45)', width: a.hiW }} />
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: '4px', background: '#FF8A2B', width: a.loW }} />
                      </div>
                    </div>
                  ))}
                </div>
                {(odhad.poznamka || odhad.mimoSoucet.length > 0) && (
                  <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.4, color: '#E3E8ED' }}>
                    {odhad.poznamka}
                    {odhad.mimoSoucet.map((a) => <span key={a.klic}> Navíc možný růst tržeb o {a.rozpeti} ročně, ten v součtu není.</span>)}
                  </p>
                )}
              </div>
              <div className="kalk-nizko-skryt" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', fontSize: '12.5px', color: '#C3CED7' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span aria-hidden="true" style={{ width: '14px', height: '8px', borderRadius: '3px', background: '#FF8A2B' }} />opatrný odhad</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span aria-hidden="true" style={{ width: '14px', height: '8px', borderRadius: '3px', background: 'rgba(255, 138, 43, 0.45)' }} />realistický odhad</span>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pdf === 'zavreno' ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 12px' }}>
                    <a href="#business-case" style={{ display: 'inline-flex', alignItems: 'center', minHeight: '44px', padding: '0 20px', borderRadius: '8px', background: '#FFFFFF', color: '#0E1A24', fontWeight: 600, fontSize: '15.5px', textDecoration: 'none' }}>Chci business case na míru</a>
                    <button ref={pdfTlacitko} type="button" onClick={() => setPdf('otevreno')} style={{ display: 'inline-flex', alignItems: 'center', minHeight: '44px', padding: '0 18px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.55)', background: 'transparent', color: '#FFFFFF', font: 'inherit', fontWeight: 600, fontSize: '15.5px', cursor: 'pointer' }}>Poslat shrnutí v PDF</button>
                  </div>
                ) : pdf === 'odeslano' ? (
                  <div role="status" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 14px', fontSize: '14.5px' }}>
                    <span>Shrnutí jsme poslali na <strong>{pdfEmail}</strong>. Nepřijde-li do pár minut, podívejte se do spamu.</span>
                    <button type="button" onClick={zavritPdf} className="kalk-odkaz-tlacitko">Zpět</button>
                  </div>
                ) : (
                  <form onSubmit={odeslatPdf} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="pdf-email" style={{ fontSize: '14px', fontWeight: 600 }}>Kam poslat shrnutí v PDF</label>
                    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
                      <label htmlFor="pdf-web">Nevyplňujte</label>
                      <input id="pdf-web" name="web" type="text" tabIndex={-1} autoComplete="off" />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <input ref={pdfVstup} id="pdf-email" name="email" type="email" autoComplete="email" required placeholder="jmeno@firma.cz" aria-describedby="pdf-info" style={{ ...finput, flex: '1 1 180px', minHeight: '44px', width: 'auto', borderColor: '#FFFFFF' }} />
                      <button type="submit" disabled={pdf === 'odesila'} style={{ minHeight: '44px', padding: '0 18px', border: 0, borderRadius: '8px', background: '#FFFFFF', color: '#0E1A24', font: 'inherit', fontWeight: 600, fontSize: '15.5px', cursor: pdf === 'odesila' ? 'progress' : 'pointer', opacity: pdf === 'odesila' ? 0.75 : 1 }}>{pdf === 'odesila' ? 'Posílám…' : 'Poslat'}</button>
                      <button type="button" onClick={zavritPdf} className="kalk-odkaz-tlacitko">Zrušit</button>
                    </div>
                    {pdf === 'chyba' && <p role="alert" style={{ margin: 0, padding: '8px 12px', borderRadius: '8px', background: '#FDECEA', color: '#8A1C12', fontSize: '14px' }}>{pdfChyba}</p>}
                    <p id="pdf-info" style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.4, color: '#C3CED7' }}>E-mail uvidí i náš obchod a může se vám ozvat. <Link href="/ochrana-osobnich-udaju" style={{ color: '#FFFFFF' }}>Ochrana údajů</Link></p>
                  </form>
                )}
                {pdf === 'zavreno' && <span className="kalk-nizko-skryt" style={{ fontSize: '12.5px', lineHeight: 1.4, color: '#C3CED7' }}>Víkendové příplatky, agenturní pracovníky a riziko pokut spočítáme v business casu.</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {texty && (
        <>
          <section id="jak-pocitame" aria-labelledby="k-jak" style={{ background: '#FFFFFF' }}>
            <div className="predp-sekce">
              <div className="predp-uvod">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '760px' }}>
                  <Eyebrow>Jak počítáme</Eyebrow>
                  <h2 id="k-jak" style={h2}>{texty.hlavni.nadpis}</h2>
                  <p className="predp-nizko-skryt" style={{ margin: 0, fontSize: '1.05rem', color: '#33424F' }}>{texty.hlavni.text}</p>
                </div>
                <div className="predp-akce">
                  {souhrn}
                  {zmeneno('hlavni') && <button type="button" onClick={() => vratit('hlavni')} className="kalk-odkaz-tlacitko kalk-odkaz-svetle">Vrátit výchozí předpoklady</button>}
                </div>
              </div>
              <Predpoklady nast={nast} skupina="hlavni" odhad={odhad} predp={predp} setPredp={setPredp} />
              {nast.nastrojText && <p className="predp-nizko-skryt" style={{ margin: 0, fontSize: '14px', color: '#4A5866', maxWidth: '62em' }}>{nast.nastrojText}</p>}
            </div>
          </section>
          <section id="upresnit" aria-labelledby="k-upresnit" style={{ background: '#F5F8FA', borderTop: '1px solid #E3E8ED' }}>
            <div className="predp-sekce">
              <div className="predp-uvod">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '760px' }}>
                  <Eyebrow>Upřesněte výpočet</Eyebrow>
                  <h2 id="k-upresnit" style={h2}>{texty.doplnek.nadpis}</h2>
                  <p className="predp-nizko-skryt" style={{ margin: 0, fontSize: '1.05rem', color: '#33424F' }}>{texty.doplnek.text}</p>
                </div>
                <div className="predp-akce">
                  {souhrn}
                  {zmeneno('doplnek') && <button type="button" onClick={() => vratit('doplnek')} className="kalk-odkaz-tlacitko kalk-odkaz-svetle">Vrátit výchozí hodnoty</button>}
                </div>
              </div>
              <Predpoklady nast={nast} skupina="doplnek" odhad={odhad} predp={predp} setPredp={setPredp} />
              <p className="predp-nizko-skryt" style={{ margin: 0, fontSize: '14px', color: '#4A5866', maxWidth: '62em' }}>{texty.doplnek.navic}</p>
            </div>
          </section>
        </>
      )}

      {children}

      <section id="business-case" aria-labelledby="k-bc" style={{ padding: '104px 0', background: '#0E1A24', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(440px, 100%), 1fr))', gap: '56px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ ...eyebrow, color: '#C3CED7' }}>
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
                <p style={{ margin: 0, padding: '12px 14px', background: '#F5F8FA', borderRadius: '8px', fontSize: '14.5px', color: '#33424F' }}>Z kalkulačky: {odhad.shrnuti}</p>
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

