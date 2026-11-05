import FaqSekce from '@/components/FaqSekce'
import KalkulackaInteraktivni from '@/components/KalkulackaInteraktivni'
import PrepinacOboru from '@/components/PrepinacOboru'

export default function KalkulackaKontaktniCentrumPage() {
  return (
    <>
      <KalkulackaInteraktivni
        obor="kontaktni-centrum"
        uvod={
          <>
            <div className="kalk-titulek">
              <h1 className="kalk-h1" style={{ margin: 0, lineHeight: 1.08, letterSpacing: '-0.025em', fontWeight: 700, textWrap: 'balance' }}>Kolik ušetří vaše kontaktní centrum</h1>
              <PrepinacOboru aktivni="kontaktni-centrum" />
            </div>
            <p className="kalk-perex">Zadejte pět údajů a hned uvidíte odhad roční úspory. Předpoklady i zdroje najdete pod kalkulačkou.</p>
          </>
        }
      />
      <FaqSekce path="/kalkulacka-uspor/kontaktni-centrum" nadpis="Časté otázky ke kalkulačce pro kontaktní centra" />
    </>
  )
}
