# Web AristoTelos

Nový web aristotelos.com: Next.js (App Router) na Vercelu, obsah později v Sanity.

## Spuštění na vlastním počítači

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # produkční build (musí projít bez chyb)
npm run lint
npm test         # testy výpočtu kalkulaček (ručně spočítané příklady)
```

Potřebujete Node.js 20.9 nebo novější.

## Struktura

| Kde | Co tam je |
| --- | --- |
| `src/app/[[...slug]]/page.tsx` | Všechny stránky webu: adresa → komponenta, metadata, FAQ pro vyhledávače |
| `src/components/pages/` | Obsah jednotlivých stránek (převedený z návrhu na plátně) |
| `src/components/SiteHeader.tsx`, `SiteFooter.tsx` | Hlavička a patička |
| `src/components/KalkulackaInteraktivni.tsx` | Kalkulačky úspor: zadání, výsledek, upravitelné předpoklady, shrnutí v PDF a formulář pro business case |
| `src/components/pages/Kalkulacka.tsx` | Rozcestník kalkulaček na `/kalkulacka-uspor` |
| `src/lib/odhadUspor.ts` | Výpočet a nastavení obou kalkulaček (kontaktní centrum, retail): pole, výchozí hodnoty, předpoklady, zdroje. Sdílí ho stránka i server |
| `tests/odhadUspor.test.mjs` | Testy výpočtu (`npm test`) |
| `src/app/api/business-case/` | Odeslání žádosti o business case: e-mail obchodu s Excelem, potvrzení zájemci |
| `src/app/api/shrnuti/` | Shrnutí z kalkulačky za e-mail: zájemci PDF, obchodu upozornění |
| `src/lib/shrnutiPdf.ts` | Vytvoření PDF se shrnutím (písmo v `src/assets/fonts`, licence OFL) |
| `src/lib/businessCaseExcel.ts` | Předvyplnění komplexního business casu ze šablony `src/assets/business-case-sablona.xlsx` (šablona záměrně není ve veřejném repozitáři) |
| `src/lib/posta.ts` | Odesílání e-mailů přes Microsoft 365 (Microsoft Graph) |
| `src/lib/site.ts` | Seznam stránek, titulky a popisy pro vyhledávače, adresa webu |
| `src/content/faq.json` | Časté otázky pro strukturovaná data (schema.org FAQPage) |
| `src/app/robots.ts`, `sitemap.ts`, `llms.txt/` | robots.txt (AI boti povoleni), mapa webu, přehled pro AI asistenty |
| `public/` | Logo, loga zákazníků, snímky aplikace (`public/screens`). Snímky z ostrého provozu se před použitím anonymizují: název klienta, názvy front a jména zaměstnanců se nahradí neutrálními |

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
Obě kalkulačky mají zadání i výsledek na stejném místě a ve stejné velikosti, aby při přepínání nic neposkakovalo
(nadpis a úvodní věta na jeden řádek, kalkulačka vysoká jako okno, nejvýš 800 px). Na oknech nižších než 800 px
se schovají nápovědy u polí, pod 700 px i posuvníky.

## Proměnné prostředí

Viz `.env.example`. `NEXT_PUBLIC_SITE_URL` je výchozí `https://aristotelos.com`, měnit ho není potřeba.

Vyhledávače web indexují, jen když běží jako produkční nasazení na doméně z `NEXT_PUBLIC_SITE_URL`.
Adresa `*.vercel.app` i náhledová nasazení jsou skryté (robots.txt i značka noindex).
Po připojení domény aristotelos.com na Vercelu stačí web znovu nasadit a indexování se zapne samo.
Ručně to lze přepnout proměnnou `SITE_INDEXING=on` nebo `off`.

## Kalkulačky úspor

Dvě kalkulačky na vlastních adresách, mezi nimiž se přepíná vedle nadpisu, a rozcestník:

| Adresa | Co tam je | Odkazují na ni |
| --- | --- | --- |
| `/kalkulacka-uspor` | rozcestník: karty Kontaktní centrum a Retail, časté otázky | hlavní menu, patička, úvodní stránka, Produkt |
| `/kalkulacka-uspor/kontaktni-centrum` | kalkulačka pro kontaktní centra | Kontaktní centra, Banky a pojišťovny, Energetika a telekomunikace |
| `/kalkulacka-uspor/retail` | kalkulačka pro obchody a lékárny | Obchodní řetězce a lékárny |

Obecná kalkulačka pro sklady a další provozy byla zrušena (5. 11. 2026), úsporu pro ně spočítá obchod v business casu.

Vstupy, výchozí hodnoty, procenta (opatrně a realisticky) a zdroje jsou na jednom místě v `src/lib/odhadUspor.ts`.
Po změně čísel spusťte `npm test` a upravte ručně spočítané příklady v testech.
Jak kalkulačky fungují (vzorce, výchozí hodnoty, zdroje, e-maily, převod do Excelu, návod pro obchod) popisuje
dokument [Kalkulačky úspor – jak fungují](https://claude.ai/artifact/JcKC8bD72qHweAQEBNdWNL).
**Při každé změně kalkulaček ho aktualizujte** spolu s testy a změnu zapište do jeho Historie změn.

## Odesílání e-mailů z formulářů (Microsoft 365)

Shrnutí v PDF za e-mail (tlačítko „Poslat shrnutí v PDF“ pod výsledkem kalkulačky): zájemci přijde PDF
s odhadem, předpoklady a zdroji, obchodu upozornění se zadáním (odpovědí píše přímo zájemci).

Formulář „Chci business case na míru“ na stránkách kalkulaček:

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

Po uložení proměnných nasaďte web znovu (Deployments → Redeploy). Bez nastavení formuláře na Vercelu
ukážou zájemci chybu s odkazem na e-mail a telefon. Na vlastním počítači se žádost jen vypíše do konzole.

## Co ještě chybí před spuštěním

- Odesílání formuláře „Domluvit ukázku“ (stejným způsobem jako business case)
- Odkaz na aplikaci v Google Play, certifikát ISO ke stažení
- Přesměrování starých adres (`next.config.ts` → `redirects`)
- Napojení obsahu na Sanity (projekt `kgbqsodt`, dataset `production`)
- Verze SK a EN, měření návštěvnosti s cookie lištou
- Tarif Vercel Pro před spuštěním (Hobby je jen pro nekomerční weby)
