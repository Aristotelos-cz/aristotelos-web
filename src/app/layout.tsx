import type { Metadata, Viewport } from 'next'
import '@fontsource/schibsted-grotesk/400.css'
import '@fontsource/schibsted-grotesk/500.css'
import '@fontsource/schibsted-grotesk/600.css'
import '@fontsource/schibsted-grotesk/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/600.css'
import './globals.css'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import JsonLd from '@/components/JsonLd'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'AristoTelos – plánování směn a docházka', template: '%s | AristoTelos' },
  description: 'AristoTelos naplánuje směny za hodiny místo dnů, vždy podle zákoníku práce. Docházka, mobilní aplikace pro iOS a Android a otevřené API.',
  applicationName: 'AristoTelos',
  openGraph: { type: 'website', locale: 'cs_CZ', siteName: 'AristoTelos' },
  // Náhledový web na Vercelu nesmí být v indexu – zapne se až na produkční doméně
  robots: process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production' ? { index: false, follow: false } : undefined,
}

export const viewport: Viewport = { themeColor: '#0E1A24' }

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AristoTelos',
  legalName: 'Matematické a Statistické Projekty a Software s.r.o.',
  url: SITE_URL,
  logo: SITE_URL + '/brand/aristotelos-logo.svg',
  foundingDate: '2009',
  email: 'info@aristotelos.com',
  telephone: '+420 606 337 182',
  identifier: 'IČO 28478614',
  address: { '@type': 'PostalAddress', streetAddress: 'Podskalská 2046/14', postalCode: '128 00', addressLocality: 'Praha 2', addressCountry: 'CZ' },
  areaServed: ['CZ', 'SK', 'DE', 'AT'],
}

const software = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AristoTelos',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Plánování směn a evidence docházky (workforce management)',
  operatingSystem: 'Web, iOS, Android',
  inLanguage: ['cs', 'sk', 'en', 'hu'],
  description: 'Software pro automatické plánování směn podle zákoníku práce, evidenci docházky a podklady pro mzdy, s mobilní aplikací a otevřeným API.',
  publisher: { '@type': 'Organization', name: 'AristoTelos' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs">
      <body>
        <a href="#obsah" className="skip-link">Přeskočit na obsah</a>
        <SiteHeader />
        <main id="obsah">{children}</main>
        <SiteFooter />
        <JsonLd data={organization} />
        <JsonLd data={software} />
      </body>
    </html>
  )
}
