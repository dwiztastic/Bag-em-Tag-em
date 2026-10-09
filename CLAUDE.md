# Bag em & Tag em – arbetsinstruktioner för Claude Code

Ett extraction-spel där man jagar katter. Byggs först för webbläsaren, sedan som app
för iOS och Android. Ägaren har ingen spelutvecklingsvana – Claude Code bygger,
ägaren bestämmer och testar. Arbetet sker från flera datorer.

## Börja varje session så här
1. `git pull` – annat kan ha gjorts från en annan dator.
2. Läs `docs/speldesign.md` (vad spelet är) och `docs/status.md` (var vi är).
3. Fråga hellre än att gissa om något i "Öppna frågor" påverkar uppgiften.

## Avsluta varje session så här
1. Uppdatera `docs/status.md`: vad som gjordes, vad som är nästa steg.
2. Nya beslut → in i `docs/speldesign.md` (flytta från "Öppna frågor" till rätt avsnitt).
3. Committa och pusha. Inget får bara ligga lokalt.

## Teknik (beslutad 2026-10-09, kan omprövas)
- Spelmotor: Phaser 3 + TypeScript, byggs med Vite.
- Backend (fas 3): Cloudflare Workers + D1 för topplista och spelarkort.
- Appar (fas 4): Capacitor. Köp i appen via RevenueCat.
- iOS byggs i molnet (Codemagic/GitHub Actions) – ägaren har ingen Mac.
- Kräver Node.js LTS. Alla datorer har det inte – kontrollera med `node --version` först.

## Regler
- **Spelet är på engelska** (huvudspråk, beslutat 2026-10-09). Alla texter i spelet skrivs på engelska och läggs i en språkfil, aldrig direkt i koden. Då går det att lägga till fler språk, till exempel svenska, senare.
- Dokumenten i `docs/` och samtalet med ägaren är på svenska.
- All grafik ritas i kod (platt tecknad stil) – inga externa bilder utan att ägaren godkänt det. Kattfigurer byggs av delar med inställningar, inte en bild per katt.
- Rättvisa: inget som går att köpa får ge fördelar i spelet – bara kosmetik.
- Topplistan måste tåla fusk: servern ska äga slumpen och rimlighetskontrollera resultat.
