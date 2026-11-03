import type { MetadataRoute } from 'next'
import { PAGES, SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.filter((p) => !p.noindex).map((p) => ({
    url: SITE_URL + (p.path === '/' ? '' : p.path),
    changeFrequency: 'monthly',
    priority: p.path === '/' ? 1 : p.path.startsWith('/reseni') ? 0.8 : 0.7,
  }))
}
