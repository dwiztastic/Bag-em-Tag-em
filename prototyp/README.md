# Prototyp (fas 1)

Spelbar prototyp av bana 1, Maple Street. Den är skriven i vanlig JavaScript och laddar
spelmotorn Phaser 3.80.1 från cdnjs. Den kräver varken Node eller ett byggsteg.

- **Spela online:** https://claude.ai/artifact/Lu8ESBCwNnwCLvrXEidv7G (privat länk)
- **Spela lokalt:** kör kommandot nedan och öppna http://localhost:8080
  ```
  powershell -ExecutionPolicy Bypass -File verktyg/serve.ps1
  ```
  Att dubbelklicka på `index.html` fungerar inte. Webbläsaren laddar inte filerna i `src/` direkt från disken.

## Filer
| Fil | Innehåll |
|---|---|
| `src/lang/en.js` | Alla texter i spelet (engelska) |
| `src/config.js` | Värden som går att justera: tid, säck, hastigheter, raser och bana |
| `src/art.js` | All grafik, ritad i kod: katter, gubbe, hund och godis |
| `src/world.js` | Banan ritas och får hinder |
| `src/audio.js` | Effektljud som skapas i kod |
| `src/game.js` | Spelets logik: titel, runda och resultat |

## Det här finns med
- Joystick (mobil), WASD/piltangenter och Shift för att smyga.
- 4 raser × 3 färger. Gyllene katter dyker upp i 1 fall på 500.
- Katterna flyr, tröttnar och går då att fånga. Brittiskt korthår rullar iväg.
- Siames med skrämselmätare, jamande som varnar andra katter och godis (catnip) som lockar.
- Maine coon tar 2 platser i säcken.
- En arg hund patrullerar. Når den gubben snubblar han, tappar 5 sekunder och katterna i närheten flyr.
- Timer på 3 minuter. Hinner man inte ut förlorar man allt.
- Resultatet räknas som unika + bonus. Albumet sparas lokalt i webbläsaren.

## Ska flyttas i fas 2
- Till Vite + TypeScript när det finns en dator med Node.
- Slumpen och albumet ska flyttas till servern i fas 3.
