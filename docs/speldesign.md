# Speldesign

Arbetsnamn: Kattspel. Underlaget kommer från en intervju 2026-10-09.

## I en mening
Ett extraction-spel där man jagar katter. Du har 5–10 minuter på en bana för att fånga
så värdefulla katter som möjligt och ta dig ut. Hinner du inte ut förlorar du säcken.

## Utseende och plattform
- 2D sett ovanifrån. 3D i stil med Subway Surfers har diskuterats men valts bort tills vidare.
- Liggande skärm.
- Grafisk stil: inte bestämd.
- Webbläsare först, sedan App Store och Google Play.
- Man spelar ensam och har en topplista online.

## Styrning och runda
- Virtuell joystick.
- Det finns 3–5 banor. En runda tar 5–10 minuter.
- Man samlar katter i en säck och måste nå en utgång innan tiden tar slut.

## Katter
- Varje katt är en kombination av ras och färg. Både ras och färg påverkar värdet och sällsyntheten.
- Vissa raser är vanliga, andra extremt ovanliga och värda mycket.
- Värdet läggs ihop till gubbens totalpoäng, och den visas på topplistan.

## Fånga
- **Vanliga katter:** ett tryck eller en lättare jakt.
- **Sällsynta katter:** lockas fram med godis. Sedan krävs en precis jakt. Om man jagar slarvigt blir katten skrämd och försvinner.
- Sällsynta katter tar längre tid att fånga. Därför måste man väga en full säck mot hur mycket tid som är kvar.

## Risk och svårighet
- Hinner man inte ut förlorar man allt från rundan.
  - Idé att testa: en slumpad händelse där halva säcken försvinner.
- Katterna flyr.
- Säcken rymmer ett begränsat antal katter.

## Ekonomi
- Alla jagar på samma villkor. Det som går att köpa är bara kosmetiskt.
- Spelarkortet visas på topplistan, med dina katter och ditt skin.
- Kattalbumet visar vilka raser och färger du har hittat.
- Skins för gubben kan köpas i appen.

## System som behövs
1. Rörelse: joystick, kamera och kollisioner.
2. Banor: timer och utgångar.
3. Katter: tabeller för ras, färg och sällsynthet. Katterna vandrar runt, blir rädda och flyr.
4. Fångst: tryck, jakt och precisionsjakt med en mätare för hur rädd katten är.
5. Godis och uppdrag.
6. Säcken: kapacitet och förlust om man inte tar sig ut.
7. Poäng och topplista. Servern äger slumpen och kontrollerar resultaten.
8. Spelarkort och kattalbum.
9. Skins och butik.

## Faser
1. **Prototyp i webbläsaren:** en bana, 3–4 raser, joystick, timer, säck och utgång. Grafiken är enkla former. Målet är att ta reda på om spelet är roligt.
2. **Kärnspelet:** fler raser och färger, jakten på sällsynta katter, godis och kattalbumet.
3. **Online:** anonyma konton, topplista och spelarkort på Cloudflare.
4. **Appar:** Capacitor, utvecklarkonton, publicering i butikerna och skins.

## Öppna frågor
- Tema och miljö: var jagar man? En stad, en bakgård, ett villaområde eller Köping?
- Vem är gubben?
- Hur får man godis? Genom uppdrag, dagliga belöningar eller hittar man det på banan?
- Räknas dubbletter av samma katt i poängen, eller bara unika katter?
- Grafik: AI-genererad, köpta grafikpaket eller egen?
- Finns tillgång till en Mac för iOS-bygget, eller ska vi använda en molntjänst?
- Vad ska spelet heta?
