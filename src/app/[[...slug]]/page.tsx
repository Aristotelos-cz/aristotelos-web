import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ComponentType } from 'react'
import JsonLd from '@/components/JsonLd'
import { PAGES, SITE_URL } from '@/lib/site'
import faq from '@/content/faq.json'
import MainPage from '@/components/pages/Main'
import FunkcePage from '@/components/pages/Funkce'
import MobilniAplikacePage from '@/components/pages/MobilniAplikace'
import IntegraceApiPage from '@/components/pages/IntegraceApi'
import KontaktniCentraPage from '@/components/pages/KontaktniCentra'
import ObchodniRetezcePage from '@/components/pages/ObchodniRetezce'
import DistribucniCentraPage from '@/components/pages/DistribucniCentra'
import BankyPojistovnyPage from '@/components/pages/BankyPojistovny'
import EnergetikaTelcoPage from '@/components/pages/EnergetikaTelco'
import ReferencePage from '@/components/pages/Reference'
import BezpecnostPage from '@/components/pages/Bezpecnost'
import ONasPage from '@/components/pages/ONas'
import KalkulackaPage from '@/components/pages/Kalkulacka'
import OchranaUdajuPage from '@/components/pages/OchranaUdaju'

// Všechny stránky webu: adresa → komponenta
const COMPONENTS: Record<string, ComponentType> = {
  '/': MainPage,
  '/funkce': FunkcePage,
  '/mobilni-aplikace': MobilniAplikacePage,
  '/integrace-a-api': IntegraceApiPage,
  '/reseni/kontaktni-centra': KontaktniCentraPage,
  '/reseni/obchodni-retezce-a-lekarny': ObchodniRetezcePage,
  '/reseni/distribucni-centra': DistribucniCentraPage,
  '/reseni/banky-a-pojistovny': BankyPojistovnyPage,
  '/reseni/energetika-a-telekomunikace': EnergetikaTelcoPage,
  '/reference': ReferencePage,
  '/bezpecnost': BezpecnostPage,
  '/o-nas': ONasPage,
  '/kalkulacka-uspor': KalkulackaPage,
  '/ochrana-osobnich-udaju': OchranaUdajuPage,
}

type Props = { params: Promise<{ slug?: string[] }> }
const toPath = (slug?: string[]) => '/' + (slug || []).join('/')

export const dynamicParams = false

export function generateStaticParams() {
  return PAGES.map((p) => ({ slug: p.path === '/' ? [] : p.path.slice(1).split('/') }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = toPath((await params).slug)
  const info = PAGES.find((p) => p.path === path)
  if (!info) return {}
  return {
    title: path === '/' ? { absolute: 'AristoTelos – ' + info.title } : info.title,
    description: info.description,
    alternates: { canonical: path },
    openGraph: { title: info.title, description: info.description, url: SITE_URL + (path === '/' ? '' : path) },
    robots: info.noindex ? { index: false, follow: true } : undefined,
  }
}

export default async function Page({ params }: Props) {
  const path = toPath((await params).slug)
  const Component = COMPONENTS[path]
  if (!Component) notFound()
  const faqItems = (faq as Record<string, { q: string; a: string }[]>)[path] || []
  return (
    <>
      <Component />
      {faqItems.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }}
        />
      )}
    </>
  )
}
