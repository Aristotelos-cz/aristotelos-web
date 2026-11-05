import Link from 'next/link'
import { ADRESA, NAZEV_OBORU, OBORY, type Obor } from '@/lib/odhadUspor'

// Přepínač kalkulaček nad zadáním. Každý obor má vlastní adresu, aby ho šlo poslat odkazem a našly ho vyhledávače.
export default function PrepinacOboru({ aktivni }: { aktivni: Obor }) {
  return (
    <nav aria-label="Kalkulačka pro obor" className="kalk-prepinac">
      {OBORY.map((o) => (
        <Link key={o} href={ADRESA[o]} aria-current={o === aktivni ? 'page' : undefined}>
          {NAZEV_OBORU[o]}
        </Link>
      ))}
    </nav>
  )
}
