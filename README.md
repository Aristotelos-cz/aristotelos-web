# Web AristoTelos

Nový web aristotelos.com: Next.js (App Router) na Vercelu, obsah později v Sanity.

## Spuštění na vlastním počítači

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # produkční build (musí projít bez chyb)
npm run lint
```

Potřebujete Node.js 20.9 nebo novější.

## Struktura

| Kde | Co tam je |
| --- | --- |
| `src/app/[[...slug]]/page.tsx` | Všechny stránky webu: adresa → komponenta, metadata, FAQ pro vyhledávače |
| `src/components/pages/` | Obsah jednotlivých stránek (převedený z návrhu na plátně) |
| `src/components/SiteHeader.tsx`, `SiteFooter.tsx` | Hlavička a patička |
| `src/components/KalkulackaInteraktivni.tsx` | Kalkulačka úspor a formulář pro business case |
| `src/lib/odhadUspor.ts` | Výpočet kalkulačky (sdílí ho stránka i server) |
| `src/app/api/business-case/` | Odeslání žádosti o business case: e-mail obchodu s Excelem, potvrzení zájemci |
| `src/lib/businessCaseExcel.ts` | Předvyplnění komplexního business casu ze šablony `src/assets/business-case-sablona.xlsx` (šablona záměrně není ve veřejném repozitáři) |
| `src/lib/posta.ts` | Odesílání e-mailů přes Microsoft 365 (Microsoft Graph) |
| `src/lib/site.ts` | Seznam stránek, titulky a popisy pro vyhledávače, adresa webu |
| `src/content/faq.json` | Časté otázky pro strukturovaná data (schema.org FAQPage) |
| `src/app/robots.ts`, `sitemap.ts`, `llms.txt/` | robots.txt (AI boti povoleni), mapa webu, přehled pro AI asistenty |
| `public/` | Logo, loga zákazníků, snímky aplikace |

## Pravidlo: první obrazovka

Úvodní část každé stránky (nadpis, text, hlavní tlačítko a obrázek, u kalkulačky celé zadání i výsledek)
musí být vidět celá hned po otevření, bez posouvání, na každé velikosti displeje.
Kontroluje se v oknech 1920 × 960, 1536 × 730, 1470 × 835, 1440 × 780, 1366 × 625, 1280 × 680, 1280 × 600
a 1024 × 700. Na tabletu na výšku a na telefonech (768 × 950, 390 × 700, 360 × 640) musí být vidět nadpis,
text a hlavní tlačítko, u kalkulačky zadání a souhrn výsledku.
Navíc platí „jedna část = jedna obrazovka“: každá část stránky (`main > section`) vyplní celou viditelnou
plochu pod hlavičkou, obsah je svisle uprostřed a posouvání se zastaví na začátku části, takže z další části
není nic vidět. Na počítači se každá část vejde celá na jednu obrazovku (mezery, nadpisy a snímky se řídí výškou
okna, na nízkých oknech se obsah mírně zmenší). Na telefonu jsou delší části vyšší než obrazovka.
Mezery a velikost nadpisů se proto řídí výškou okna (třídy `hero-*`, `kalk-*` a pravidla pro `main > section`
v `src/app/globals.css`).

## Proměnné prostředí

Viz `.env.example`. `NEXT_PUBLIC_SITE_URL` je výchozí `https://aristotelos.com`, měnit ho není potřeba.

Vyhledávače web indexují, jen když běží jako produkční nasazení na doméně z `NEXT_PUBLIC_SITE_URL`.
Adresa `*.vercel.app` i náhledová nasazení jsou skryté (robots.txt i značka noindex).
Po připojení domény aristotelos.com na Vercelu stačí web znovu nasadit a indexování se zapne samo.
Ručně to lze přepnout proměnnou `SITE_INDEXING=on` nebo `off`.

## Odesílání e-mailů z formulářů (Microsoft 365)

Formulář „Chci business case na míru“ na stránce Kalkulačka úspor:

1. pošle obchodu e-mail se zadáním; když je na serveru šablona `src/assets/business-case-sablona.xlsx`,
   přiloží i komplexní business case předvyplněný údaji z kalkulačky (šablona ve veřejném repozitáři není,
   aby si výpočetní model nemohl stáhnout kdokoli; přidáme ji, až bude repozitář soukromý),
2. pošle zájemci potvrzení s jeho odhadem a dalším postupem.

E-maily odcházejí z firemní schránky v Microsoft 365 přes Microsoft Graph. Klasické SMTP s heslem
Microsoft od konce roku 2026 vypíná, proto se nepoužívá.

### Nastavení v Microsoft 365 (udělá správce Microsoft 365)

1. **Entra admin center** (entra.microsoft.com) → Aplikace → Registrace aplikací → Nová registrace.
   Název třeba „Web aristotelos.com“, jen pro tuto organizaci.
2. U aplikace si zapište **ID aplikace (klienta)** a **ID adresáře (tenanta)**.
3. Certifikáty a tajné kódy → Nový tajný klíč klienta (platnost 24 měsíců) → zkopírujte **hodnotu** (zobrazí se jen jednou).
   Do kalendáře si dejte připomínku na obnovení před vypršením.
4. Povolte aplikaci posílat poštu **jen z jedné schránky** (doporučeno, RBAC for Applications v Exchange Online).
   V Exchange Online PowerShellu (`Connect-ExchangeOnline`):

   ```powershell
   # ID aplikace = ID klienta z kroku 2, ObjectId = ID objektu z Entra → Podnikové aplikace → Web aristotelos.com
   New-ServicePrincipal -AppId <ID aplikace> -ObjectId <ID objektu podnikové aplikace> -DisplayName "Web aristotelos.com"
   New-ManagementScope -Name "Web aristotelos.com" -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'info@aristotelos.com'"
   New-ManagementRoleAssignment -App <ID objektu podnikové aplikace> -Role "Application Mail.Send" -CustomResourceScope "Web aristotelos.com"
   ```

   V tom případě aplikaci v Entra **nepřidávejte** oprávnění Mail.Send (dalo by jí přístup ke všem schránkám).
   Projevení může trvat až 2 hodiny.

   Rychlejší, ale širší varianta: v Entra → Oprávnění rozhraní API → Microsoft Graph → Oprávnění aplikace → `Mail.Send`
   → Udělit souhlas správce. Aplikace pak může posílat z kterékoli schránky ve firmě.

### Proměnné prostředí na Vercelu

Vercel → projekt aristotelos-web → Settings → Environment Variables (pro Production i Preview):

| Proměnná | Hodnota |
| --- | --- |
| `MS_TENANT_ID` | ID adresáře (tenanta) |
| `MS_CLIENT_ID` | ID aplikace (klienta) |
| `MS_CLIENT_SECRET` | hodnota tajného klíče (označte jako Sensitive) |
| `MAIL_FROM` | schránka, ze které web posílá, např. `info@aristotelos.com` |
| `LEAD_EMAIL_TO` | kam chodí žádosti obchodu, víc adres oddělte čárkou |

Po uložení proměnných nasaďte web znovu (Deployments → Redeploy). Bez nastavení formulář na Vercelu
ukáže zájemci chybu s odkazem na e-mail a telefon. Na vlastním počítači se žádost jen vypíše do konzole.

## Co ještě chybí před spuštěním

- Odesílání formuláře „Domluvit ukázku“ (stejným způsobem jako business case)
- Odkaz na aplikaci v Google Play, certifikát ISO ke stažení
- Přesměrování starých adres (`next.config.ts` → `redirects`)
- Napojení obsahu na Sanity (projekt `kgbqsodt`, dataset `production`)
- Verze SK a EN, měření návštěvnosti s cookie lištou
- Tarif Vercel Pro před spuštěním (Hobby je jen pro nekomerční weby)
