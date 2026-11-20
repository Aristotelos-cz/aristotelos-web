# Formuláře a e-maily

Web má dva funkční formuláře, oba na stránkách kalkulaček. Formulář „Domluvit ukázku“ na úvodní stránce (`#demo`
v `Main.tsx`) je zatím jen vzhled: tlačítko „Odeslat žádost“ nic nedělá. Napojení je v seznamu před spuštěním v README.

| Formulář | API | Zájemci přijde | Obchodu přijde |
| --- | --- | --- | --- |
| Poslat shrnutí v PDF | `POST /api/shrnuti` | e-mail s PDF (odhad, předpoklady, zdroje, další postup) | upozornění se zadáním |
| Chci business case na míru | `POST /api/business-case` | potvrzení s odhadem a dalším postupem | e-mail se zadáním, s předvyplněným Excelem, když je na serveru šablona |

Odpovědí na e-mail obchodu se píše rovnou zájemci (`replyTo`). Server přepočítá odhad stejným kódem jako stránka
(`spocitejObor` v `src/lib/odhadUspor.ts`), z prohlížeče bere jen zadání.

## Šablona business casu

Excel se vyrábí ze šablony `src/assets/business-case-sablona.xlsx` (`src/lib/businessCaseExcel.ts`). Šablona záměrně
není ve veřejném repozitáři, aby si výpočetní model nemohl stáhnout kdokoli. Přidá se, až bude repozitář soukromý.
Do té doby odchází e-mail obchodu bez přílohy a s pokynem přepsat údaje do listu Vstupy ručně.
Šablonu nikdy nenahrávejte do veřejného repozitáře.

## Ochrana proti zneužití

Společné kontroly jsou v `src/lib/formular.ts`:

- požadavek s hlavičkou `Origin` z cizího webu dostane chybu 403,
- skryté pole `web` vyplněné nebo formulář odeslaný do 2,5 s od otevření stránky: odpověď „v pořádku“, ale nic se nepošle,
- nejvýš 5 odeslání za 10 minut z jedné IP adresy na formulář (počítá se v paměti jedné instance serveru),
- kontrola tvaru e-mailu, u business casu i jména a firmy, délky textů jsou omezené.

## Když e-mail není nastavený nebo selže

- Na vlastním počítači bez nastavení Microsoft 365 se žádost jen vypíše do konzole a formulář hlásí úspěch.
- Na Vercelu bez nastavení dostane zájemce chybu s odkazem na e-mail a telefon (stav do nastavení Microsoft 365).
- Když selže hlavní e-mail (PDF zájemci, žádost obchodu), zájemce dostane stejnou chybu a žádost zůstane v záznamech
  serveru na Vercelu.
- Když selže jen druhý e-mail (upozornění obchodu, potvrzení zájemci), zájemce dostane úspěch a chyba je jen v záznamech.

## Odesílání přes Microsoft 365

E-maily odcházejí z firemní schránky přes Microsoft Graph (`src/lib/posta.ts`, přihlášení aplikace přes OAuth).
Klasické SMTP s heslem Microsoft od konce roku 2026 vypíná, proto se nepoužívá.

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
| `LEAD_EMAIL_TO` | kam chodí žádosti obchodu, víc adres oddělte čárkou; bez nastavení na `info@aristotelos.com` |

Odesílání se zapne, jen když jsou nastavené všechny čtyři první proměnné. Po uložení proměnných nasaďte web znovu
(Deployments → Redeploy). Tajný klíč zadává do Vercelu člověk, nikdy ne AI asistent.
