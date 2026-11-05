import FaqSekce from '@/components/FaqSekce'
import KalkulackaInteraktivni from '@/components/KalkulackaInteraktivni'
import PrepinacOboru from '@/components/PrepinacOboru'

export default function KalkulackaRetailPage() {
  return (
    <>
      <KalkulackaInteraktivni
        obor="retail"
        uvod={
          <>
            <div className="kalk-titulek">
              <h1 className="kalk-h1" style={{ margin: 0, lineHeight: 1.08, letterSpacing: '-0.025em', fontWeight: 700, textWrap: 'balance' }}>Kolik ušetří vaše prodejny</h1>
              <PrepinacOboru aktivni="retail" />
            </div>
            <p className="kalk-perex">Zadejte údaje o prodejnách nebo lékárnách a hned uvidíte odhad roční úspory.</p>
          </>
        }
      />
      <FaqSekce path="/kalkulacka-uspor/retail" nadpis="Časté otázky ke kalkulačce pro retail" />
    </>
  )
}
