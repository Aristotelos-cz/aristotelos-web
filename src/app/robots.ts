import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Vyhledávače i AI asistenti (ChatGPT, Claude, Perplexity, Gemini…) mají přístup k celému webu
export default function robots(): MetadataRoute.Robots {
  const preview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production'
  if (preview) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/studio'] },
      { userAgent: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot'], allow: '/' },
    ],
    sitemap: SITE_URL + '/sitemap.xml',
    host: SITE_URL,
  }
}
