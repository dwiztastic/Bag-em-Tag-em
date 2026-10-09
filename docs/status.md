# Status

## Nu
**Fas 1, prototypen, är byggd och spelbar.** Den finns i `prototyp/` och online på https://claude.ai/artifact/Lu8ESBCwNnwCLvrXEidv7G (privat länk).
Den är skriven i vanlig JavaScript med Phaser från cdnjs, eftersom den här datorn saknar Node.

## Nästa steg
1. Ägaren provspelar på mobil och dator och säger vad som känns fel eller tråkigt.
2. Värdena i `prototyp/src/config.js` justeras efter provspelet: tid, hastigheter, skrämselmätare och hundens syn.
3. Fas 2 påbörjas: fler raser (alla 10), precisionsjakt, kattalbum och ljud.
4. När det finns en dator med Node: flytta koden till Vite + TypeScript enligt `CLAUDE.md`.

## Testa lokalt
`powershell -ExecutionPolicy Bypass -File verktyg/serve.ps1` och öppna http://localhost:8080. Claude Code kan också starta servern med preview-konfigurationen `prototyp` i `.claude/launch.json`.

## Logg
- 2026-10-09: Intervju del 1–3 genomförd. `CLAUDE.md` och speldesignen skapade.
- 2026-10-09: Namnet bestämt: Bag em & Tag em. Repot pushat till GitHub (dwiztastic/Bag-em-Tag-em, privat).
- 2026-10-09: Fördjupande intervju genomförd: miljö, gubbe, ton, poäng, godis, hundar, ljud och spelarkort. Genomförbarhetsanalys och grafikrekommendation tillagda.
- 2026-10-09: Utkast till raser, godis, uppdrag och banor skapat och godkänt (`docs/katter.md`). Spelet är på engelska.
- 2026-10-09: Stilprov i 4 stilar skapat (`docs/grafikstilar.html`). Beslut: Claude kodar allt, även grafiken, i platt tecknad stil.
- 2026-10-09: Prototypen (fas 1) byggd: bana 1, 4 raser, joystick, säck, timer, hund, godis, skrämselmätare, resultat och album. Testad i webbläsaren.
