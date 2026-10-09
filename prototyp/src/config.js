// Alla justerbara värden för prototypen. Ändra här när något känns fel vid provspel.
window.CONFIG = {
  width: 960,
  height: 540,
  roundSeconds: 180,     // speldesignen säger 6 min för bana 1 – kortare i prototypen för snabba tester
  warningAt: 30,         // sekunder kvar när det blir bråttom
  sackSlots: 6,
  runSpeed: 190,
  sneakSpeed: 78,
  catchRange: 64,
  goldenChance: 1 / 500,
  dogPenalty: 5,         // sekunder som dras av när hunden når gubben
  dogStun: 1.5,
  startTreats: 1,
  startCats: 9,
  maxCats: 10,
  respawnEvery: 18,
  siameseNaturalChance: 0.25
};

window.RARITY = {
  common: { points: 10, dup: 1, tag: 0x3f8a4a },
  uncommon: { points: 25, dup: 3, tag: 0x2e8b57 },
  rare: { points: 60, dup: 6, tag: 0x3b82c4 }
};

// Sannolikhet för grundfärg / ovanlig färg / sällsynt färg
window.COLOR_WEIGHTS = [70, 22, 8];

// Raser i prototypen (4 av 10). Varje katt ritas i kod utifrån dessa inställningar.
window.BREEDS = {
  domestic: {
    id: 'domestic', name: 'Domestic Shorthair', rarity: 'common', weight: 50, slots: 1,
    size: 1, chub: 1, cheek: 1, ears: 'normal', eye: 0x9bc53d, wander: 40,
    flee: { run: 115, sneak: 45, speed: 150, time: 0.9, tired: 1.6 },
    colors: [
      { id: 'greytabby', name: 'Grey Tabby', body: 0x8d8f93, accent: 0x5d5f64, pattern: 'tabby', mult: 1 },
      { id: 'tuxedo', name: 'Tuxedo', body: 0x2b2b30, accent: 0xf2f2f2, pattern: 'tux', mult: 1.5 },
      { id: 'tortie', name: 'Tortoiseshell', body: 0x4a3426, accent: 0xd9822b, pattern: 'patches', mult: 3 }
    ]
  },
  british: {
    id: 'british', name: 'British Shorthair', rarity: 'common', weight: 30, slots: 1,
    size: 1.1, chub: 1.12, cheek: 1.18, ears: 'small', eye: 0xe0902a, wander: 25, roll: true,
    flee: { run: 75, sneak: 38, speed: 85, time: 1.3, tired: 2.0 },
    colors: [
      { id: 'blue', name: 'Blue', body: 0x7d8a99, accent: 0x6a7686, pattern: 'solid', mult: 1 },
      { id: 'cream', name: 'Cream', body: 0xe8d3b0, accent: 0xd4b98f, pattern: 'solid', mult: 1.5 },
      { id: 'lilac', name: 'Lilac', body: 0xb9a8b4, accent: 0xa695a2, pattern: 'solid', mult: 3 }
    ]
  },
  mainecoon: {
    id: 'mainecoon', name: 'Maine Coon', rarity: 'uncommon', weight: 20, slots: 2,
    size: 1.35, chub: 1.05, cheek: 1.05, ears: 'tufted', eye: 0xc9b037, wander: 35, ruff: true,
    flee: { run: 120, sneak: 50, speed: 140, time: 1.0, tired: 1.4 },
    colors: [
      { id: 'browntabby', name: 'Brown Tabby', body: 0x7a5636, accent: 0x3f2a18, pattern: 'tabby', mult: 1 },
      { id: 'red', name: 'Red', body: 0xc9692e, accent: 0x8f4317, pattern: 'tabby', mult: 1.5 },
      { id: 'silver', name: 'Silver', body: 0xc7ccd1, accent: 0x5f666e, pattern: 'tabby', mult: 3 }
    ]
  },
  siamese: {
    id: 'siamese', name: 'Siamese', rarity: 'rare', weight: 0, slots: 1, scare: true,
    size: 0.95, chub: 0.9, cheek: 0.92, ears: 'big', eye: 0x4aa3e8, wander: 25,
    flee: { run: 0, sneak: 0, speed: 200, time: 1.2, tired: 1.0 },
    colors: [
      { id: 'sealpoint', name: 'Seal Point', body: 0xefe2c8, accent: 0x4a3a32, pattern: 'point', mult: 1 },
      { id: 'chocolate', name: 'Chocolate Point', body: 0xf1e6d2, accent: 0x7a5a43, pattern: 'point', mult: 1.5 },
      { id: 'bluepoint', name: 'Blue Point', body: 0xeef0f2, accent: 0x6f7f93, pattern: 'point', mult: 3 }
    ]
  }
};

// Bana 1: Maple Street (1600 × 1000). Tre trädgårdar, gata nederst, skåpbilen är utgången.
window.MAP = {
  w: 1600, h: 1000,
  start: { x: 90, y: 940 },
  exit: { x: 1400, y: 860, w: 200, h: 140 },
  rects: [
    { x: 40, y: 0, w: 360, h: 230, kind: 'house', color: 0xb4553f },
    { x: 600, y: 0, w: 360, h: 200, kind: 'house', color: 0x5d7a99 },
    { x: 1130, y: 0, w: 390, h: 220, kind: 'house', color: 0x7a6a5a },
    { x: 520, y: 230, w: 20, h: 240, kind: 'hedge' },
    { x: 520, y: 540, w: 20, h: 300, kind: 'hedge' },
    { x: 1060, y: 230, w: 20, h: 240, kind: 'hedge' },
    { x: 1060, y: 540, w: 20, h: 300, kind: 'hedge' },
    { x: 0, y: 840, w: 220, h: 16, kind: 'fence' },
    { x: 310, y: 840, w: 450, h: 16, kind: 'fence' },
    { x: 850, y: 840, w: 450, h: 16, kind: 'fence' },
    { x: 1390, y: 840, w: 210, h: 16, kind: 'fence' },
    { x: 40, y: 600, w: 160, h: 56, kind: 'flowerbed' },
    { x: 880, y: 680, w: 110, h: 100, kind: 'sandbox' },
    { x: 1420, y: 330, w: 140, h: 130, kind: 'shed' },
    { x: 1300, y: 560, w: 200, h: 50, kind: 'flowerbed' }
  ],
  circles: [
    { x: 330, y: 300, r: 20, kind: 'grill' },
    { x: 60, y: 420, r: 34, kind: 'bush' },
    { x: 470, y: 720, r: 30, kind: 'bush' },
    { x: 420, y: 500, r: 14, kind: 'tree', canopy: 62 },
    { x: 290, y: 560, r: 46, kind: 'pool' },
    { x: 800, y: 420, r: 76, kind: 'trampoline' },
    { x: 610, y: 300, r: 30, kind: 'bush' },
    { x: 1010, y: 650, r: 34, kind: 'bush' },
    { x: 1130, y: 700, r: 30, kind: 'bush' },
    { x: 1550, y: 760, r: 28, kind: 'bush' },
    { x: 1250, y: 420, r: 14, kind: 'tree', canopy: 66 }
  ],
  patios: [{ x: 110, y: 230, w: 200, h: 100 }, { x: 1150, y: 220, w: 220, h: 80 }],
  lawns: [{ x: 30, y: 250, w: 470, h: 570 }, { x: 560, y: 220, w: 480, h: 600 }, { x: 1100, y: 240, w: 480, h: 580 }],
  dogPath: [{ x: 620, y: 580 }, { x: 1000, y: 580 }, { x: 1000, y: 268 }, { x: 665, y: 262 }]
};
