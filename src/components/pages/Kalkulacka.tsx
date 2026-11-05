// Vygenerováno z návrhu na plátně (Kalkulacka.dc.html); interaktivní část je v KalkulackaInteraktivni.tsx
import KalkulackaInteraktivni from '@/components/KalkulackaInteraktivni'

export default function KalkulackaPage() {
  return (
    <>


<KalkulackaInteraktivni
  uvod={<>
<div className="kalk-nizko-skryt" style={{ display: "flex", alignItems: "center", gap: "12px", fontFamily: "'IBM Plex Mono', Menlo, monospace", fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A5866" }}>
<span aria-hidden="true" style={{ display: "flex", width: "44px", height: "4px" }}>
<span style={{ flex: "55", background: "#006699" }}>
</span>
<span style={{ flex: "45", background: "#FF6633" }}>
</span>
</span>
<span>Kalkulačka úspor</span>
</div>
<h1 className="kalk-h1" style={{ margin: "0", lineHeight: "1.08", letterSpacing: "-0.025em", fontWeight: "700", textWrap: "balance" }}>Kolik ušetříte s automatickým plánováním směn</h1>
<p style={{ margin: "0", fontSize: "1.05rem", lineHeight: "1.5", color: "#33424F", maxWidth: "62em" }}>Zadejte čtyři čísla o svém provozu a hned uvidíte odhad roční úspory. Vychází z předpokladů, se kterými počítáme v nabídkách. Podrobný business case s návratností připravíme s vámi.</p>
</>}
>
<section id="jak-pocitame" style={{ padding: "96px 0", background: "#FFFFFF" }}>
<div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "clamp(20px, 4.2vh, 48px)" }}>
<div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "760px" }}>
<div style={{ display: "flex", alignItems: "center", gap: "12px", fontFamily: "'IBM Plex Mono', Menlo, monospace", fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A5866" }}>
<span aria-hidden="true" style={{ display: "flex", width: "44px", height: "4px" }}>
<span style={{ flex: "55", background: "#006699" }}>
</span>
<span style={{ flex: "45", background: "#FF6633" }}>
</span>
</span>
<span>Jak počítáme</span>
</div>
<h2 style={{ margin: "0", fontSize: "clamp(1.7rem, min(3.2vw, 5.2vh), 2.8rem)", lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700", textWrap: "balance" }}>Čtyři oblasti, které jde spočítat hned</h2>
<p style={{ margin: "0", fontSize: "1.1rem", color: "#33424F" }}>Opatrný odhad počítá s polovičními hodnotami předpokladů. Měsíční fond pracovní doby: 38 h týdně na HPP a 20 h týdně na zkrácený úvazek.</p>
</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "20px" }}>
<div style={{ background: "#FFFFFF", border: "1px solid #DCE3E9", borderRadius: "14px", padding: "clamp(16px, 2.6vh, 28px)", display: "flex", flexDirection: "column", gap: "12px" }}>
<span style={{ fontFamily: "'IBM Plex Mono', Menlo, monospace", fontSize: "13px", color: "#FF6633", fontWeight: "600" }}>01</span>
<h3 style={{ margin: "0", fontSize: "1.25rem", fontWeight: "700" }}>Obsazení provozu</h3>
<p style={{ margin: "0", fontSize: "15.5px", color: "#33424F" }}>Při ručním plánování vznikají hodiny, kdy je v provozu víc lidí, než je potřeba. Počítáme s 0,5–1 % takových hodin a s tím, že lidé v nich pracují na 30 % výkonu.</p>
<p style={{ margin: "0", padding: "12px 14px", background: "#F5F8FA", borderRadius: "8px", fontFamily: "'IBM Plex Mono', Menlo, monospace", fontSize: "13px", lineHeight: "1.6", color: "#33424F" }}>lidé × měsíční fond × Kč/h<br />× 0,5–1 % × 70 % × 12</p>
</div>
<div style={{ background: "#FFFFFF", border: "1px solid #DCE3E9", borderRadius: "14px", padding: "clamp(16px, 2.6vh, 28px)", display: "flex", flexDirection: "column", gap: "12px" }}>
<span style={{ fontFamily: "'IBM Plex Mono', Menlo, monospace", fontSize: "13px", color: "#FF6633", fontWeight: "600" }}>02</span>
<h3 style={{ margin: "0", fontSize: "1.25rem", fontWeight: "700" }}>Přesčasy a neodpracované hodiny</h3>
<p style={{ margin: "0", fontSize: "15.5px", color: "#33424F" }}>AristoTelos hlídá saldo ve vyrovnávacím období. Počítáme s 0,05–0,1 h zbytečného přesčasu (příplatek 25 %) a 0,005–0,01 h neodpracované doby na člověka s HPP měsíčně.</p>
<p style={{ margin: "0", padding: "12px 14px", background: "#F5F8FA", borderRadius: "8px", fontFamily: "'IBM Plex Mono', Menlo, monospace", fontSize: "13px", lineHeight: "1.6", color: "#33424F" }}>lidé na HPP × (přesčas × Kč/h × 1,25<br />+ neodpracováno × Kč/h) × 12</p>
</div>
<div style={{ background: "#FFFFFF", border: "1px solid #DCE3E9", borderRadius: "14px", padding: "clamp(16px, 2.6vh, 28px)", display: "flex", flexDirection: "column", gap: "12px" }}>
<span style={{ fontFamily: "'IBM Plex Mono', Menlo, monospace", fontSize: "13px", color: "#FF6633", fontWeight: "600" }}>03</span>
<h3 style={{ margin: "0", fontSize: "1.25rem", fontWeight: "700" }}>Čas vedoucích</h3>
<p style={{ margin: "0", fontSize: "15.5px", color: "#33424F" }}>Sběr požadavků, plánování, zveřejnění, změny, reporting a měsíční uzávěrka. Počítáme s úsporou 16–32 hodin měsíčně na vedoucího a jeho hodinovými náklady o 40 % vyššími než průměr.</p>
<p style={{ margin: "0", padding: "12px 14px", background: "#F5F8FA", borderRadius: "8px", fontFamily: "'IBM Plex Mono', Menlo, monospace", fontSize: "13px", lineHeight: "1.6", color: "#33424F" }}>vedoucí × 16–32 h × Kč/h × 1,4 × 12</p>
</div>
<div style={{ background: "#FFFFFF", border: "1px solid #DCE3E9", borderRadius: "14px", padding: "clamp(16px, 2.6vh, 28px)", display: "flex", flexDirection: "column", gap: "12px" }}>
<span style={{ fontFamily: "'IBM Plex Mono', Menlo, monospace", fontSize: "13px", color: "#FF6633", fontWeight: "600" }}>04</span>
<h3 style={{ margin: "0", fontSize: "1.25rem", fontWeight: "700" }}>Fluktuace</h3>
<p style={{ margin: "0", fontSize: "15.5px", color: "#33424F" }}>Spravedlivé plány, přání a výměny směn v mobilu zvyšují spokojenost lidí. Počítáme s poklesem roční fluktuace o 1–2 procentní body a 30 000 Kč na zaškolení nového člověka.</p>
<p style={{ margin: "0", padding: "12px 14px", background: "#F5F8FA", borderRadius: "8px", fontFamily: "'IBM Plex Mono', Menlo, monospace", fontSize: "13px", lineHeight: "1.6", color: "#33424F" }}>lidé × 1–2 % × 30 000 Kč</p>
</div>
</div>
</div>
</section>
</KalkulackaInteraktivni>

<section aria-labelledby="k-faq" style={{ padding: "104px 0", background: "#FFFFFF" }}>
<div style={{ maxWidth: "880px", margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: "32px" }}>
<h2 id="k-faq" style={{ margin: "0", fontSize: "clamp(1.7rem, min(3.2vw, 5.2vh), 2.8rem)", lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700", textWrap: "balance" }}>Časté otázky ke kalkulačce</h2>
<div className="faq-mrizka" style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #D5DEE6" }}>
<details open style={{ borderBottom: "1px solid #D5DEE6", padding: "clamp(8px, 1.4vh, 14px) 0" }}>
<summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", minHeight: "44px", fontWeight: "600", fontSize: "1.12rem" }}>Jak přesný je odhad?<span aria-hidden="true" style={{ fontFamily: "'IBM Plex Mono', Menlo, monospace", color: "#006E99", fontSize: "20px" }}>+</span>
</summary>
<p style={{ margin: "6px 0 8px", color: "#33424F", maxWidth: "44em" }}>Je to orientační odhad z průměrných předpokladů. Přesná čísla spočítáme v business casu z dat o vašem provozu.</p>
</details>
<details style={{ borderBottom: "1px solid #D5DEE6", padding: "clamp(8px, 1.4vh, 14px) 0" }}>
<summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", minHeight: "44px", fontWeight: "600", fontSize: "1.12rem" }}>Proč kalkulačka nepočítá s cenou AristoTela?<span aria-hidden="true" style={{ fontFamily: "'IBM Plex Mono', Menlo, monospace", color: "#006E99", fontSize: "20px" }}>+</span>
</summary>
<p style={{ margin: "6px 0 8px", color: "#33424F", maxWidth: "44em" }}>Cenu připravujeme na míru podle počtu uživatelů a rozsahu nasazení. Náklady, návratnost a ROI proto počítáme až v business casu.</p>
</details>
<details style={{ borderBottom: "1px solid #D5DEE6", padding: "clamp(8px, 1.4vh, 14px) 0" }}>
<summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", minHeight: "44px", fontWeight: "600", fontSize: "1.12rem" }}>Co když nemám všechna čísla?<span aria-hidden="true" style={{ fontFamily: "'IBM Plex Mono', Menlo, monospace", color: "#006E99", fontSize: "20px" }}>+</span>
</summary>
<p style={{ margin: "6px 0 8px", color: "#33424F", maxWidth: "44em" }}>Stačí odhad. Chybějící údaje doplníme spolu při přípravě business casu.</p>
</details>
</div>
</div>
</section>
    </>
  )
}
