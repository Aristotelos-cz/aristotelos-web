import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Šablona Excelu pro business case se čte ze souboru, musí být součástí serverové funkce
  outputFileTracingIncludes: {
    '/api/business-case': ['./src/assets/business-case-sablona.xlsx'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  // Přesměrování starých adres (doplníme podle mapy starého webu před spuštěním)
  async redirects() {
    return []
  },
}

export default nextConfig
