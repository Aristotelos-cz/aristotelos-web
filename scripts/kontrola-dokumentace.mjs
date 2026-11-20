// Kontrola dokumentace proti kódu: odkazy mezi dokumenty (i kotvy), cesty k souborům, adresy stránek
// a názvy z kódu uvedené v `uvozovkách pro kód`. Spuštění: node scripts/kontrola-dokumentace.mjs
// Hlásí jen to, co v kódu nenajde. Shodu významu (co dokument tvrdí) je potřeba ověřit ručně.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { PAGES } from '../src/lib/site.ts'

const KOREN = path.resolve(import.meta.dirname, '..')
const DOKUMENTY = ['README.md', 'CLAUDE.md', ...readdirSync(path.join(KOREN, 'docs')).filter((f) => f.endsWith('.md')).map((f) => `docs/${f}`)]

function soubory(slozka) {
  return readdirSync(path.join(KOREN, slozka), { withFileTypes: true }).flatMap((e) => {
    const cesta = path.join(slozka, e.name)
    if (e.isDirectory()) return soubory(cesta)
    return [cesta]
  })
}
const KOD = [...soubory('src'), ...soubory('scripts'), ...soubory('tests'), 'next.config.ts', 'package.json', '.env.example', '.gitignore']
const VSECHNY = [...KOD, ...soubory('public'), ...soubory('docs'), 'README.md', 'CLAUDE.md', 'AGENTS.md']
const TEXT_KODU = KOD.filter((f) => !/\.(ttf|webp|png|svg|xlsx)$/.test(f))
  .map((f) => readFileSync(path.join(KOREN, f), 'utf-8'))
  .join('\n')
// Příkazy a místa mimo repozitář, která dokumentace zmiňuje záměrně
const MIMO_KOD = new Set([
  'git push', 'git hash-object', 'git/trees/main', 'Aristotelos-cz/aristotelos-web',
  'github.com/Aristotelos-cz/aristotelos-web/upload/main/<složka>', '/edit/main/<cesta>',
  '/mnt/user-data/uploads/aristotelos-web/<stejná cesta>', 'Connect-ExchangeOnline', 'Mail.Send',
])
const ADRESY = new Set([...PAGES.map((p) => p.path), '/api/shrnuti', '/api/business-case', '/llms.txt', '/robots.txt', '/sitemap.xml', '/studio'])

// Kotva nadpisu tak, jak ji tvoří GitHub
const kotva = (nadpis) => nadpis.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-')
const kotvyDokumentu = (soubor) =>
  new Set(
    readFileSync(path.join(KOREN, soubor), 'utf-8')
      .split('\n')
      .filter((r) => /^#{1,6} /.test(r))
      .map((r) => kotva(r.replace(/^#+ /, ''))),
  )

const chyby = []
for (const dok of DOKUMENTY) {
  // bloky kódu se nekontrolují (jsou v nich příkazy a ukázky)
  const text = readFileSync(path.join(KOREN, dok), 'utf-8').replace(/```[\s\S]*?```/g, '')
  const hlas = (zprava) => chyby.push(`${dok}: ${zprava}`)

  for (const [, cil] of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^https?:/.test(cil)) continue
    const [soubor, k] = cil.split('#')
    const cesta = soubor ? path.normalize(path.join(path.dirname(dok), soubor)) : dok
    if (!existsSync(path.join(KOREN, cesta))) hlas(`odkaz na neexistující soubor ${cil}`)
    else if (k && cesta.endsWith('.md') && !kotvyDokumentu(cesta).has(k)) hlas(`odkaz na neexistující kotvu ${cil}`)
  }

  for (const [, cely] of text.matchAll(/`([^`\n]+)`/g)) {
    if (MIMO_KOD.has(cely)) continue
    const kod = cely.replace(/^(GET|POST) /, '')
    if (/[…<>*]/.test(kod) || kod.includes('…')) {
      // vzor s výpustkou nebo hvězdičkou: stačí, že existuje soubor nebo text se stejným začátkem
      const zacatek = kod.split(/[…<>*]/)[0]
      if (zacatek.length >= 3 && !VSECHNY.some((f) => f.includes(zacatek)) && !TEXT_KODU.includes(zacatek)) hlas(`nic nezačíná na \`${zacatek}\``)
      continue
    }
    if (kod.startsWith('/') && !kod.includes('.')) {
      const adresa = kod.split('#')[0].replace(/\/$/, '') || '/'
      if (!ADRESY.has(adresa) && !existsSync(path.join(KOREN, 'src/app', adresa))) hlas(`neznámá adresa ${kod}`)
      continue
    }
    if (/\.(tsx?|mjs|json|css|md|xlsx|txt|svg|ts)$|\/$/.test(kod) || kod.includes('/')) {
      const cesta = kod.replace(/\/$/, '')
      const nalezeno =
        existsSync(path.join(KOREN, cesta)) ||
        VSECHNY.some((f) => f.endsWith('/' + cesta) || path.basename(f) === cesta) ||
        TEXT_KODU.includes(cesta)
      // šablona business casu v repozitáři záměrně není
      if (!nalezeno && cesta !== 'src/assets/business-case-sablona.xlsx') hlas(`neexistující soubor nebo cesta \`${kod}\``)
      continue
    }
    if (!TEXT_KODU.includes(kod) && !VSECHNY.some((f) => f.includes(kod))) hlas(`v kódu chybí \`${kod}\``)
  }
}

console.log(chyby.length ? `NESOUHLASÍ (${chyby.length}):\n${chyby.join('\n')}` : `Dokumentace souhlasí s kódem (${DOKUMENTY.length} dokumentů).`)
process.exit(chyby.length ? 1 : 0)
