# Speldesign – Bag em & Tag em

Underlaget kommer från intervjuer 2026-10-09. Allt under "Beslutat" gäller tills ägaren säger annat.

## I en mening
En busig kattfångare jagar katter i villaområden och i staden. Under 5–10 minuter
fångar man så värdefulla katter man hinner och tar sig sedan ut. Hinner man inte ut
förlorar man hela säcken.

## Beslutat

### Utseende och plattform
- 2D sett ovanifrån, med liggande skärm.
- Tonen är busig och humoristisk. Spelet passar alla åldrar: lätt att börja, svårt att bemästra.
- Miljöerna är villaområde/bakgårdar och stad.
- Webbläsare först, sedan App Store och Google Play. Det finns ingen Mac, så iOS byggs i molnet (se teknik).
- **Språk: engelska** är spelets huvudspråk. Texterna ligger i en språkfil från början, så fler språk kan läggas till senare. Engelska namn på raser, godis och banor finns i `docs/katter.md`.

### Gubben
- En kattfångare och samlare med håv och säck.
- Spelaren styr med en virtuell joystick.

### Rundan
- Varje runda spelas på en bana och tar 5–10 minuter.
- Man samlar katter i en säck som rymmer ett begränsat antal och måste nå en utgång innan tiden tar slut.
- **Allt eller inget:** tar man sig ut behåller man allt. Hinner man inte ut förlorar man allt från rundan. Ingen slump tar bort halva säcken.
- Det som gör rundan svår:
  - Katterna flyr.
  - Säcken rymmer bara ett visst antal katter.
  - Arga hundar. Når en hund gubben snubblar han och förlorar några sekunder, och katterna i närheten flyr. Säcken påverkas inte.

### Katter
Raser, färger, godis, uppdrag och banor finns i detalj i `docs/katter.md`. Det är godkänt 2026-10-09, inklusive gyllene katter, att Maine coon tar 2 platser, max 2 godisar per runda och upplåsning av banor via albumet.
- Varje katt är en kombination av ras och färg. Både ras och färg påverkar värdet och sällsyntheten.
- Raserna är blandade. Riktiga raser är de vanligare, och påhittade legendariska raser är de extremt sällsynta.
- Vid lansering finns cirka 10 raser med 3–4 färger var, alltså 30–40 katter att samla. Fler läggs till via uppdateringar.
- Varje ras har ett eget jamande.

### Fånga
- **Vanliga katter:** ett tryck eller en lättare jakt.
- **Sällsynta katter:** lockas fram med rätt godis och kräver sedan en precis jakt. Om man jagar slarvigt blir katten skrämd och försvinner. Jakten tar längre tid, så man måste väga det mot klockan och en full säck.

### Godis
- Det finns olika typer av godis. Varje typ lockar vissa raser.
- Ovanliga typer av godis är kopplade till ovanliga raser och är själva sällsynta.
- Godiset sänker svårigheten att fånga katten, till exempel med 50 %. Fångsten är ändå inte garanterad.
- Man får godis från uppdrag och från en daglig belöning. Man kan också byta dubbletter av katter mot godis.

### Poäng och topplista
- **Unika + bonus:** första gången man fångar en kombination av ras och färg ger den full poäng. Dubbletter ger lite.
- Spelarkortet syns på topplistan och visar:
  - 3 favoritkatter
  - hur stor del av albumet man har hittat
  - skin
  - titel och märken från prestationer
- Kattalbumet visar alla kombinationer av ras och färg, både hittade och ohittade.

### Ekonomi
- Alla jagar på samma villkor. Det enda som går att köpa är kosmetik, till exempel skins.
- Spelet har inga lootboxar och inget köpt godis.

### Ljud
- Ljudet är viktigt och en del av humorn. Varje ras har ett eget jamande, och fångsterna har egna ljud.
- Musiken blir stressigare när tiden börjar ta slut.

### Omfattning vid lansering
- 3 banor och cirka 10 raser.

## Genomförbarhet (bedömd 2026-10-09)

### Funktioner: allt går att bygga i Phaser
| Funktion | Bedömning | Hur |
|---|---|---|
| Joystick, rörelse, kamera | Enkelt | Färdiga Phaser-plugins (rexrainbow virtual joystick) |
| Banor | Enkelt | Ritas i den gratis kartredigeraren **Tiled**. Ägaren kan själv rita banor där. |
| Katter som vandrar och flyr | Medel | En tillståndsmaskin: vandra → bli misstänksam → fly. Får mycket justering. |
| Hundar som jagar | Medel | Vägsökning med easystar.js |
| Precisionsjakt på sällsynta katter | Medel–svårt | Själva koden är inte svår. Det svåra är att justera den tills den känns rolig. Se förslag nedan. |
| Godis, uppdrag, daglig belöning, byten | Medel | Allt måste ligga på servern, annars går det att fuska till sig godis. |
| Topplista, spelarkort, album | Medel | Cloudflare Workers + D1 |
| Fuskskydd | Delvis | Servern bestämmer vilka katter som dyker upp i varje runda och kontrollerar att resultatet är rimligt. Det stoppar enkelt fusk men inte allt. Det räcker för ett hobbyspel. |
| Konton | Medel | Anonyma konton först. Med bara anonyma konton försvinner framstegen när man byter telefon, så inloggning behövs i fas 3–4. Apple kräver "Logga in med Apple" om man erbjuder Google-inloggning. |
| iOS utan Mac | Går | Bygget görs med Codemagic eller GitHub Actions (macOS i molnet). Testning på iPhone sker via TestFlight. |
| Köp av skins | Medel | RevenueCat. Kräver Apple- och Google-konton. |

**Förslag på precisionsjakt:** en skrämselmätare fylls om man springer rakt mot katten
eller rör sig ryckigt. Man måste smyga, det vill säga dra joysticken bara lite, och närma
sig från sidan. När man är nära nog kommer ett tryck vid rätt tillfälle. Godis sänker hur
snabbt mätaren fylls. Detta prövas i prototypen.

### Grafik: rekommendation
- **Pixelgrafik ovanifrån.** Stilen passar busig humor och laddar snabbt. Det finns också färdiga, enhetliga grafikpaket för just villaområden och stad ovanifrån, till exempel LimeZus "Modern Exteriors" på itch.io för några hundralappar.
- **Miljöer:** köpta grafikpaket. Det ger en enhetlig stil direkt och är billigt.
- **Katter:** en grundfigur per ras. **Färgerna läggs på i koden** (palettbyte), så 10 figurer räcker för 30–40 katter. Raserna kan ritas med AI som utgångspunkt och sedan städas, eller beställas av en pixelartist. Cirka 10 figurer är en överkomlig beställning.
- **Gubben och skins:** samma princip, alltså en grundfigur med utbytbara delar som hatt och färg.
- **Ljud:** gratis effektljud (Kenney, freesound.org) och royaltyfri musik. Jamanden kan spelas in från riktiga katter.

### Att känna till om butikerna
- **Google Play:** ett nytt privat utvecklarkonto måste ha 12 testare i 14 dagar innan appen får släppas publikt. Planera in det.
- **Apple:** 99 USD per år. Granskningen tar normalt 1–3 dagar. "Alla åldrar" och köp i appen ger en åldersgräns enligt Apples formulär. Spelet har inga lootboxar, och det förenklar.

## Öppna frågor
- Vilken grafikstil gäller? Se stilprovet i `docs/grafikstilar.html`: platt tecknad (AI 2/5), pixel (3/5), tusch (4/5) eller lera/3D (5/5).
- Siffror och värden i `docs/katter.md` (poäng, byten, säck och tider) justeras när prototypen har provspelats.
- Ska det finnas en veckotopplista utöver den totala?
- Hur mycket är säcken värd i poäng? Exakta värden per sällsynthetsnivå sätts i prototypen.

## Faser
1. **Prototyp i webbläsaren:** en bana, 3–4 raser, joystick, timer, säck, utgång, katter som flyr och en hund. Grafiken är enkla former. Målet är att ta reda på om spelet är roligt.
2. **Kärnspelet:** alla 10 raser och deras färger, precisionsjakt, godis och kattalbumet. Riktig grafik och ljud.
3. **Online:** konton, topplista, spelarkort, uppdrag, daglig belöning och byten. Allt ligger på Cloudflare.
4. **Appar:** Capacitor, molnbygge för iOS, testperiod på Google Play, publicering i butikerna och skins.
