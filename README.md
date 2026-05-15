# Val 2026

![Val 2026 screenshot](src/assets/Screenshot.png)

Desktop-app för att följa opinionsmätningarna inför det svenska riksdagsvalet 2026.

## Funktioner

Appen är uppdelad i tre flikar:

### Opinionsmätningar

- Hämtar **alla mätningar från åtta institut** (Verian, Novus, Ipsos, Indikator, Demoskop, SCB, Sentio, Skop) från Wikipedia
- **KPI-stripe** överst med dagar kvar till valet, mandat per block, största parti och totalt antal mätningar
- **Trendlinjer** per parti med valbart 14/30/60/90-dagars glidande snitt och råa mätpunkter
- **Poll of polls** med deltaindikator vs valet 2022 och markörer för 2022-resultatet
- **Mandatfördelning** med jämkad uddatalsmetod (349 mandat, 4 % spärr)
- **Riksdagshalvmånen** — interaktiv parlamentsgrafik med 349 prickar i politisk vänster→höger-ordning, hoverbar legend
- **Koalitionsbyggare** — klicka in/ut partier och se direkt om koalitionen når 175 mandat. Mini-riksdagshalvmåne lyser upp valda partier. Förvalda koalitioner: Tidöblocket, Rödgröna+C, Rödgröna, Mitten
- **Blockstöd över tid** för Tidöblocket, Rödgröna och Rödgröna+C
- **Förändring sedan 2022** rankad efter största vinst→största förlust
- **Spärriskindikator** med sparklines för partier under ~6 % — visar hur många av senaste mätningarna som legat under 4 %
- **Mätningslista** med alla institut, datum och partiprocent — sortbar och radvis raderbar

### Valkompass

- **10, 15 eller 20 frågor** över politikens viktigaste områden (försvar, skola, migration, energi, klimat, skatt, välfärd, brott, EU, bidrag, vård, pension, bostäder, drivmedel, media, värnplikt, m.fl.)
- 5-gradig svarsskala (Helt emot → Helt för)
- En fråga åt gången med progressbar, framåt/bakåt-navigering och hoppbara steg
- **Resultatvy** med ditt närmast matchande parti i procent och rankad lista över alla 8 partier med matchningsstapel
- Svar och vald storlek sparas i `localStorage` — du kan stänga appen och fortsätta senare
- Byter du storlek (t.ex. från 10 till 20) behålls befintliga svar och du fortsätter på nästa fråga

### Partier

- En profil per parti med **officiell logotyp**, partifärgad accent och kort beskrivning
- **Partiledare och roll** (statsminister, språkrör, m.fl.), grundlagsår och länk till officiella hemsidan
- Live-siffror: aktuell snittprocent, förändring sedan 2022 och prognosticerat mandat
- **Utfällbar lista** med partiets position i alla 20 valkompass-frågor — färgmarkerade pillar (grön = för, röd = emot, grå = neutral)

### Övriga funktioner

- **Tema-växlare** (ljust/mörkt/system) — partifärger justeras automatiskt för läsbarhet i mörkt läge
- **Officiella partilogotyper** används överallt — i KPI-stripen, mätningstabellen, koalitionschips, riksdagshalvmånen, valkompassen och partiprofilerna
- **Automatisk uppdateringsnotis** — appen kollar GitHub Releases vid uppstart och visar en banner när en ny version finns; klick öppnar release-sidan i webbläsaren
- **Lokalt SQLite-lager** — fungerar offline efter första hämtningen, ingen data lämnar din dator
- **Persistent state** — temat, valkompass-svar och dismissade uppdateringsnotiser sparas mellan sessioner

## Installation

### macOS: "Val 2026 is damaged and can't be opened"

macOS blockerar appar som inte är signerade med ett Apple Developer-certifikat. Kör följande kommando i terminalen för att kringgå detta:


```bash
xattr -cr /Applications/Val\ 2026.app
```


### Windows: "Windows protected your PC"

Windows SmartScreen blockerar installeraren eftersom den saknar en betald code-signing-certifikat. Så här kringgår du:

1. Dubbelklicka på `Val 2026_x.y.z_x64-setup.exe`
2. När varningen "Windows protected your PC" dyker upp, klicka på **More info**
3. Klicka på **Run anyway**

Alternativt via PowerShell (kör som administratör i mappen där installeraren ligger):


```powershell
Unblock-File -Path ".\Val 2026_*_x64-setup.exe"
```



## Utveckling


```bash
npm install
npm run tauri dev
```


I dev-läge syns en testknapp (🧪) i topbaren som simulerar att en ny version finns att ladda ned — användbar för att verifiera uppdateringsbannerns utseende utan att faktiskt släppa en release.

## Bygg


```bash
npm run tauri build
```



### Ny version + release


```bash
npm run new:version 1.2.3
```


Uppdaterar versionsnummer i `package.json`, `tauri.conf.json` och `Cargo.toml`, regenererar `package-lock.json`, skapar en commit och git-tagg samt pushar. GitHub Actions bygger då automatiskt DMG (macOS Apple Silicon) och EXE/MSI (Windows) och publicerar en release. Nästa gång användarna öppnar appen ser de uppdateringsbannern.

## Stack

- [Tauri 2](https://tauri.app/) — native shell, Rust-backend, SQLite-lagring
- [Vue 3](https://vuejs.org/) + [vue-echarts](https://vue-echarts.dev/) — UI och diagram
- [Lucide](https://lucide.dev/) — ikoner
- [scraper](https://crates.io/crates/scraper) + [reqwest](https://crates.io/crates/reqwest) — Wikipedia-parser
- Datakälla: [Wikipedia — Opinionsmätningar inför riksdagsvalet i Sverige 2026](https://sv.wikipedia.org/wiki/Opinionsm%C3%A4tningar_inf%C3%B6r_riksdagsvalet_i_Sverige_2026)
- Partilogotyper: officiella SVG-versioner från Wikimedia Commons
