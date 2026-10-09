// Banan ritas en gång till en bild (textur) och får osynliga hinder för kollisioner.
window.World = (() => {
  // Förutsägbar slump så att blomrabatterna ser likadana ut varje gång
  const seeded = seed => () => (seed = (seed * 16807) % 2147483647, (seed - 1) / 2147483646);

  function drawGround(g, M) {
    const r = seeded(42);
    g.fillStyle(0x6aa84f, 1).fillRect(0, 0, M.w, M.h);
    M.lawns.forEach(l => { for (let x = l.x; x < l.x + l.w; x += 60) g.fillStyle(0x76b65a, 1).fillRect(x, l.y, 30, l.h); });
    for (let i = 0; i < 140; i++) {
      const x = r() * M.w, y = r() * 840;
      g.fillStyle([0xffffff, 0xf2c230, 0xe98a9a][i % 3], 0.8).fillCircle(x, y, 1.6);
    }
    // trottoar och gata
    g.fillStyle(0xd6cdb8, 1).fillRect(0, 856, M.w, 44);
    g.fillStyle(0xbfb6a2, 1);
    for (let x = 0; x < M.w; x += 50) g.fillRect(x, 856, 2, 44);
    g.fillStyle(0x50565c, 1).fillRect(0, 900, M.w, 100);
    g.fillStyle(0xbfb6a2, 1).fillRect(0, 900, M.w, 4);
    g.fillStyle(0xf4f1e8, 0.8);
    for (let x = 20; x < M.w; x += 90) g.fillRect(x, 948, 44, 5);
    // uteplatser
    M.patios.forEach(p => {
      g.fillStyle(0xcfc3ad, 1).fillRect(p.x, p.y, p.w, p.h);
      g.fillStyle(0xb5a98f, 1);
      for (let x = p.x; x <= p.x + p.w; x += 25) g.fillRect(x, p.y, 2, p.h);
      for (let y = p.y; y <= p.y + p.h; y += 25) g.fillRect(p.x, y, p.w, 2);
    });
  }

  function drawRect(g, o) {
    const { x, y, w, h } = o;
    if (o.kind === 'house') {
      g.fillStyle(0x0f2a12, 0.22).fillRect(x + 6, y + h, w, 12);
      g.fillStyle(o.color, 1).fillRect(x, y, w, h);
      g.fillStyle(Art.shade(o.color, -0.15), 1);
      for (let yy = y + 14; yy < y + h; yy += 16) g.fillRect(x, yy, w, 2);
      g.fillStyle(Art.shade(o.color, -0.3), 1).fillRect(x, y + h / 2 - 5, w, 10);
      g.fillStyle(0x6e6e6e, 1).fillRect(x + w * 0.7, y + h * 0.2, 26, 26);
      g.fillStyle(0x3a3a3a, 1).fillRect(x + w * 0.7 + 5, y + h * 0.2 + 5, 16, 16);
    } else if (o.kind === 'hedge') {
      g.fillStyle(0x2f6a2c, 1).fillRoundedRect(x - 4, y, w + 8, h, 10);
      g.fillStyle(0x3f7a34, 1);
      for (let yy = y + 10; yy < y + h; yy += 18) g.fillCircle(x + w / 2, yy, 11);
    } else if (o.kind === 'fence') {
      g.fillStyle(0xdcbc8c, 1).fillRect(x, y + 3, w, 10);
      g.fillStyle(0xb48f5c, 1);
      for (let xx = x; xx < x + w; xx += 40) g.fillRect(xx, y - 3, 8, 22);
      g.fillRect(x + w - 8, y - 3, 8, 22);
    } else if (o.kind === 'flowerbed') {
      const r = seeded(x + y);
      g.fillStyle(0x6b4a33, 1).fillRoundedRect(x, y, w, h, 10);
      for (let i = 0; i < w * h / 160; i++) {
        g.fillStyle([0xe2553a, 0xf2c230, 0xffffff, 0xb07ad9][i % 4], 1).fillCircle(x + 8 + r() * (w - 16), y + 8 + r() * (h - 16), 3.5);
      }
    } else if (o.kind === 'sandbox') {
      g.fillStyle(0xb48f5c, 1).fillRect(x, y, w, h);
      g.fillStyle(0xead9a4, 1).fillRect(x + 8, y + 8, w - 16, h - 16);
      g.fillStyle(0xe2553a, 1).fillCircle(x + 34, y + 40, 9);
      g.fillStyle(0x3b82c4, 1).fillRect(x + 60, y + 55, 22, 8);
    } else if (o.kind === 'shed') {
      g.fillStyle(0x0f2a12, 0.22).fillRect(x + 6, y + h, w, 10);
      g.fillStyle(0x8b5e3c, 1).fillRect(x, y, w, h);
      g.fillStyle(0x6e4630, 1);
      for (let xx = x + 14; xx < x + w; xx += 16) g.fillRect(xx, y, 2, h);
    }
  }

  function drawCircle(g, o) {
    const { x, y, r } = o;
    if (o.kind === 'bush') {
      g.fillStyle(0x0f2a12, 0.22).fillEllipse(x + 5, y + r * 0.7, r * 2.1, r * 0.8);
      g.fillStyle(0x3f7a34, 1).fillCircle(x, y, r);
      g.fillStyle(0x57983f, 1).fillCircle(x - r * 0.25, y - r * 0.25, r * 0.55);
    } else if (o.kind === 'grill') {
      g.fillStyle(0x0f2a12, 0.22).fillEllipse(x + 3, y + 16, 46, 14);
      g.fillStyle(0x2b2b2b, 1).fillCircle(x, y, r);
      g.fillStyle(0x5a5a5a, 1).fillCircle(x, y - 2, r * 0.72);
      g.fillStyle(0x2b2b2b, 1);
      for (let i = -9; i <= 9; i += 5) g.fillRect(x - 12, y - 2 + i, 24, 2);
    } else if (o.kind === 'pool') {
      g.fillStyle(0x3b82c4, 1).fillCircle(x, y, r);
      g.fillStyle(0x7cc7e8, 1).fillCircle(x, y, r - 8);
      g.fillStyle(0xffffff, 0.5).fillEllipse(x - 12, y - 14, 22, 8);
    } else if (o.kind === 'trampoline') {
      g.fillStyle(0x0f2a12, 0.22).fillEllipse(x + 8, y + 50, r * 2, 34);
      g.fillStyle(0x3d7fc4, 1).fillCircle(x, y, r);
      g.fillStyle(0x22292f, 1).fillCircle(x, y, r - 13);
    } else if (o.kind === 'tree') {
      g.fillStyle(0x0f2a12, 0.25).fillEllipse(x + 14, y + 20, o.canopy * 2, o.canopy);
      g.fillStyle(0x6b4a2b, 1).fillCircle(x, y, r);
    }
  }

  function drawVan(g, M) {
    const e = M.exit;
    g.lineStyle(4, 0xf2c230, 0.9);
    for (let x = e.x; x < e.x + e.w; x += 24) { g.beginPath().moveTo(x, e.y + 2).lineTo(x + 12, e.y + 2).strokePath(); }
    g.fillStyle(0x0f2a12, 0.3).fillRoundedRect(1446, 914, 144, 72, 12);
    g.fillStyle(0xf2c230, 1).fillRoundedRect(1440, 906, 144, 70, 12);
    g.fillStyle(0x9fd3e6, 1).fillRoundedRect(1548, 914, 26, 54, 6);
    g.fillStyle(0xd9a91c, 1).fillRect(1452, 916, 84, 4).fillRect(1452, 962, 84, 4);
  }

  function build(scene) {
    const M = window.MAP;
    if (!scene.textures.exists('world')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      drawGround(g, M);
      M.rects.forEach(o => drawRect(g, o));
      M.circles.forEach(o => drawCircle(g, o));
      drawVan(g, M);
      g.generateTexture('world', M.w, M.h);
      g.destroy();
    }
    scene.add.image(0, 0, 'world').setOrigin(0).setDepth(-10);
    scene.add.text(1494, 941, LANG.van, { fontFamily: '"Lilita One", sans-serif', fontSize: '20px', color: '#1d2421' }).setOrigin(0.5).setDepth(-5);
    scene.add.text(M.exit.x + 50, M.exit.y + 22, LANG.exit, { fontFamily: '"Lilita One", sans-serif', fontSize: '22px', color: '#f2c230', stroke: '#1d2421', strokeThickness: 5 }).setOrigin(0.5).setDepth(-5);

    // trädkronor ligger ovanför figurerna
    M.circles.filter(o => o.kind === 'tree').forEach(o => {
      const c = scene.add.graphics().setDepth(6000);
      c.fillStyle(0x2f6a2c, 0.93).fillCircle(o.x, o.y - 10, o.canopy);
      c.fillStyle(0x3f7a34, 0.95).fillCircle(o.x - o.canopy * 0.3, o.y - 10 - o.canopy * 0.25, o.canopy * 0.55);
      c.fillStyle(0x57983f, 0.9).fillCircle(o.x + o.canopy * 0.35, o.y - o.canopy * 0.1, o.canopy * 0.35);
    });

    const blockers = [];
    M.rects.forEach(o => {
      const z = scene.add.zone(o.x + o.w / 2, o.y + o.h / 2, o.w, o.h);
      scene.physics.add.existing(z, true);
      blockers.push(z);
    });
    M.circles.forEach(o => {
      const z = scene.add.zone(o.x, o.y, o.r * 2, o.r * 2);
      scene.physics.add.existing(z, true);
      z.body.setCircle(o.r);
      blockers.push(z);
    });
    return blockers;
  }

  // Ligger punkten (med marginal) i ett hinder?
  function blocked(x, y, pad) {
    const M = window.MAP;
    return M.rects.some(o => x > o.x - pad && x < o.x + o.w + pad && y > o.y - pad && y < o.y + o.h + pad)
      || M.circles.some(o => Math.hypot(x - o.x, y - o.y) < o.r + pad)
      || x < pad || y < pad || x > M.w - pad || y > M.h - pad;
  }

  return { build, blocked };
})();
