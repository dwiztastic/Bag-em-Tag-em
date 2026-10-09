// All grafik ritas i kod (platt tecknad stil). Figurer byggs av delar som animeras var för sig.
window.Art = (() => {
  const PINK = 0xe98a9a, DARK = 0x1b1b1b, INNER_EAR = 0xf2a7b4;

  // Ljusa (t > 0) eller mörka (t < 0) en färg
  const shade = (c, t) => {
    const f = v => Math.round(t > 0 ? v + (255 - v) * t : v * (1 + t));
    return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255);
  };
  const curve = (x0, y0, x1, y1, x2, y2, n = 14) =>
    new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(x0, y0), new Phaser.Math.Vector2(x1, y1), new Phaser.Math.Vector2(x2, y2)).getPoints(n);
  // Tjock rundad linje: cirklar längs en kurva
  const tube = (g, pts, w, col) => { g.fillStyle(col, 1); pts.forEach(p => g.fillCircle(p.x, p.y, w / 2)); };

  /* ---------- Katt ---------- */
  function cat(scene, breed, color, golden) {
    const s = breed.size;
    const body = golden ? 0xe8b622 : color.body;
    const acc = golden ? 0xb8860b : color.accent;
    const pat = golden ? 'solid' : color.pattern;
    const root = scene.add.container(0, 0);

    const shadow = scene.add.graphics();
    shadow.fillStyle(0x0f2a12, 0.22).fillEllipse(2, 13 * s, 34 * s, 10 * s);

    const inner = scene.add.container(0, 0);

    const tail = scene.add.graphics({ x: 9 * s, y: 6 * s });
    tube(tail, curve(0, 0, 14 * s, -4 * s, 12 * s, -17 * s), (breed.ruff ? 8 : 5) * s, body);
    if (pat === 'point') tube(tail, curve(13 * s, -9 * s, 12.6 * s, -13 * s, 12 * s, -17 * s, 6), 5 * s, acc);
    if (pat === 'tabby') { tail.fillStyle(acc, 1).fillCircle(13.5 * s, -7 * s, 2.2 * s).fillCircle(12.4 * s, -13 * s, 2.2 * s); }

    const pawCol = (pat === 'point' || pat === 'tux') ? acc : shade(body, 0.08);
    const pawA = scene.add.graphics(), pawB = scene.add.graphics();
    pawA.fillStyle(pawCol, 1).fillEllipse(-6 * s, 13 * s, 7 * s, 5 * s).fillEllipse(7 * s, 10 * s, 7 * s, 5 * s);
    pawB.fillStyle(pawCol, 1).fillEllipse(6 * s, 13 * s, 7 * s, 5 * s).fillEllipse(-7 * s, 10 * s, 7 * s, 5 * s);

    const bodyG = scene.add.graphics();
    bodyG.fillStyle(body, 1).fillEllipse(0, 4 * s, 26 * s * breed.chub, 21 * s);
    if (pat === 'tabby') bodyG.fillStyle(acc, 1).fillEllipse(0, 1 * s, 20 * s, 2.6 * s).fillEllipse(0, 7 * s, 18 * s, 2.6 * s);
    if (pat === 'tux') bodyG.fillStyle(acc, 1).fillEllipse(0, 7 * s, 13 * s, 12 * s);
    if (pat === 'patches') bodyG.fillStyle(acc, 1).fillEllipse(-6 * s, 2 * s, 10 * s, 8 * s).fillEllipse(6 * s, 8 * s, 8 * s, 6 * s);
    if (breed.ruff) bodyG.fillStyle(shade(body, 0.25), 1).fillEllipse(0, -1 * s, 22 * s, 9 * s);

    const headY = -8 * s;
    const head = scene.add.container(0, headY);
    const hg = scene.add.graphics();
    const earH = { big: 13, small: 7, normal: 10, tufted: 11 }[breed.ears] || 10;
    const earCol = pat === 'point' ? acc : body;
    hg.fillStyle(earCol, 1)
      .fillTriangle(-10 * s, -3 * s, -8 * s, (-3 - earH) * s, -1.5 * s, -7 * s)
      .fillTriangle(10 * s, -3 * s, 8 * s, (-3 - earH) * s, 1.5 * s, -7 * s);
    hg.fillStyle(INNER_EAR, 1)
      .fillTriangle(-8.6 * s, -4 * s, -7.7 * s, (-3 - earH * 0.72) * s, -3.6 * s, -6.6 * s)
      .fillTriangle(8.6 * s, -4 * s, 7.7 * s, (-3 - earH * 0.72) * s, 3.6 * s, -6.6 * s);
    if (breed.ears === 'tufted') hg.fillStyle(acc, 1)
      .fillTriangle(-8.6 * s, (-1 - earH) * s, -7.4 * s, (-6 - earH) * s, -6.6 * s, (-1 - earH) * s)
      .fillTriangle(8.6 * s, (-1 - earH) * s, 7.4 * s, (-6 - earH) * s, 6.6 * s, (-1 - earH) * s);
    hg.fillStyle(body, 1).fillEllipse(0, 0, 21 * s * breed.cheek, 18 * s);
    if (pat === 'tabby') hg.fillStyle(acc, 1).fillEllipse(-3.5 * s, -6 * s, 2 * s, 5 * s).fillEllipse(0, -6.5 * s, 2 * s, 6 * s).fillEllipse(3.5 * s, -6 * s, 2 * s, 5 * s);
    if (pat === 'tux') hg.fillStyle(acc, 1).fillEllipse(0, 4 * s, 11 * s, 8 * s);
    if (pat === 'patches') hg.fillStyle(acc, 1).fillEllipse(-4 * s, -2 * s, 9 * s, 10 * s);
    if (pat === 'point') hg.fillStyle(acc, 1).fillEllipse(0, 3 * s, 12 * s, 10 * s);
    hg.fillStyle(golden ? 0x6b4a00 : breed.eye, 1).fillEllipse(-4.3 * s, -1 * s, 4.2 * s, 5 * s).fillEllipse(4.3 * s, -1 * s, 4.2 * s, 5 * s);
    hg.fillStyle(DARK, 1).fillEllipse(-4.3 * s, -0.8 * s, 1.6 * s, 4 * s).fillEllipse(4.3 * s, -0.8 * s, 1.6 * s, 4 * s);
    hg.fillStyle(0xffffff, 0.9).fillCircle(-4.9 * s, -2.2 * s, 0.8 * s).fillCircle(3.7 * s, -2.2 * s, 0.8 * s);
    hg.fillStyle(PINK, 1).fillTriangle(-1.6 * s, 3 * s, 1.6 * s, 3 * s, 0, 4.8 * s);
    head.add(hg);

    inner.add([tail, pawB, bodyG, pawA, head]);
    root.add([shadow, inner]);
    root.parts = { inner, tail, head, headY, paws: [pawA, pawB] };
    return root;
  }

  function animateCat(c, t, moving, phase, tired) {
    const p = c.parts;
    p.inner.y = moving ? -Math.abs(Math.sin(t * 0.018 + phase)) * 2.5 : 0;
    const step = moving ? Math.sin(t * 0.022 + phase) * 2.2 : 0;
    p.paws[0].y = step; p.paws[1].y = -step;
    p.tail.rotation = Math.sin(t * (moving ? 0.012 : 0.004) + phase) * (moving ? 0.35 : 0.22);
    p.head.y = p.headY + (tired ? Math.sin(t * 0.03) * 1.2 : Math.sin(t * 0.003 + phase) * 0.6);
  }

  /* ---------- Kattfångaren ---------- */
  function player(scene) {
    const root = scene.add.container(0, 0);
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x0f2a12, 0.25).fillEllipse(2, 27, 46, 14);
    const inner = scene.add.container(0, 0);

    const sack = scene.add.graphics();
    sack.fillStyle(0xb08a57, 1).fillEllipse(-21, 5, 24, 28);
    sack.fillStyle(0x8a6a3f, 1).fillRoundedRect(-26, -11, 10, 6, 3);
    sack.fillStyle(0x8a6a3f, 0.6).fillEllipse(-24, 9, 6, 10);

    const legL = scene.add.graphics(), legR = scene.add.graphics();
    legL.fillStyle(0x1d2421, 1).fillRoundedRect(-9, 12, 7, 14, 3);
    legR.fillStyle(0x1d2421, 1).fillRoundedRect(2, 12, 7, 14, 3);

    const bodyG = scene.add.graphics();
    bodyG.fillStyle(0x2f6f8f, 1).fillRoundedRect(-15, -10, 30, 26, 9);
    bodyG.fillStyle(0x4a8fb0, 1).fillRect(-1, -8, 2, 22);
    bodyG.fillStyle(0xf2c230, 1).fillRect(-14, -4, 4, 3).fillRect(10, -4, 4, 3);

    const head = scene.add.graphics();
    head.fillStyle(0xf0c7a0, 1).fillEllipse(0, -20, 22, 20);
    head.fillStyle(DARK, 1).fillEllipse(-4, -19, 3, 4).fillEllipse(4, -19, 3, 4);
    head.fillStyle(0xd98f7a, 1).fillEllipse(0, -15, 6, 3);
    head.fillStyle(0xc9a227, 1).fillEllipse(0, -27, 38, 14);
    head.fillStyle(0xa8861d, 1).fillEllipse(0, -31, 22, 16);
    head.fillStyle(0x8a3f2f, 1).fillRect(-11, -29, 22, 3);

    const net = scene.add.container(12, -2);
    const ng = scene.add.graphics();
    ng.lineStyle(4, 0x6b4a2b, 1).beginPath().moveTo(0, 0).lineTo(34, -24).strokePath();
    ng.lineStyle(1, 0xffffff, 0.45);
    for (let i = -8; i <= 8; i += 4) { ng.beginPath().moveTo(44 + i, -44).lineTo(44 + i, -20).strokePath(); ng.beginPath().moveTo(32, -32 + i).lineTo(56, -32 + i).strokePath(); }
    ng.lineStyle(3, 0xf4f4f4, 1).strokeCircle(44, -32, 13);
    net.add(ng);

    const stars = scene.add.graphics({ y: -44 });
    stars.fillStyle(0xf2c230, 1);
    [0, 2.1, 4.2].forEach(a => stars.fillCircle(Math.cos(a) * 14, Math.sin(a) * 5, 3.5));
    stars.setVisible(false);

    inner.add([sack, legL, legR, bodyG, head, net]);
    root.add([shadow, inner, stars]);
    root.parts = { inner, legs: [legL, legR], net, stars };
    return root;
  }

  function animatePlayer(c, t, moving, running, face, stunned) {
    const p = c.parts;
    const speed = running ? 0.032 : 0.016;
    const step = moving ? Math.sin(t * speed) * 3 : 0;
    p.legs[0].y = step; p.legs[1].y = -step;
    p.inner.y = moving ? -Math.abs(Math.sin(t * speed)) * (running ? 2.5 : 1) : 0;
    p.inner.scaleX = face;
    p.inner.scaleY = moving && !running ? 0.9 : 1;
    p.stars.setVisible(stunned);
    if (stunned) { p.stars.rotation = 0; p.stars.x = Math.sin(t * 0.012) * 4; }
  }

  function swingNet(scene, c) {
    scene.tweens.add({ targets: c.parts.net, rotation: { from: -1.3, to: 0.5 }, duration: 140, yoyo: true, onComplete: () => { c.parts.net.rotation = 0; } });
  }

  /* ---------- Hund ---------- */
  function dog(scene) {
    const root = scene.add.container(0, 0);
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x0f2a12, 0.25).fillEllipse(0, 18, 62, 14);
    const inner = scene.add.container(0, 0);
    const tail = scene.add.graphics({ x: -22, y: -2 });
    tube(tail, curve(0, 0, -12, -6, -14, -16), 6, 0x8a5a3b);
    const legA = scene.add.graphics(), legB = scene.add.graphics();
    legA.fillStyle(0x5e3b25, 1).fillEllipse(-14, 15, 9, 7).fillEllipse(12, 13, 9, 7);
    legB.fillStyle(0x5e3b25, 1).fillEllipse(-10, 13, 9, 7).fillEllipse(16, 15, 9, 7);
    const bodyG = scene.add.graphics();
    bodyG.fillStyle(0x8a5a3b, 1).fillEllipse(0, 2, 50, 30);
    bodyG.fillStyle(0x6e4630, 1).fillEllipse(-6, -2, 16, 11);
    const head = scene.add.container(22, -8);
    const hg = scene.add.graphics();
    hg.fillStyle(0x5e3b25, 1).fillEllipse(-9, 0, 9, 19).fillEllipse(10, -1, 9, 19);
    hg.fillStyle(0x8a5a3b, 1).fillEllipse(0, 0, 26, 24);
    hg.fillStyle(0xb07a52, 1).fillEllipse(5, 6, 15, 10);
    hg.fillStyle(DARK, 1).fillCircle(10, 3, 3).fillCircle(-3, -3, 2).fillCircle(6, -4, 2);
    hg.lineStyle(2.5, DARK, 1).beginPath().moveTo(-7, -9).lineTo(-1, -6).strokePath().beginPath().moveTo(10, -9).lineTo(4, -6).strokePath();
    const tongue = scene.add.graphics();
    tongue.fillStyle(PINK, 1).fillEllipse(7, 12, 6, 8);
    head.add([hg, tongue]);
    inner.add([tail, legB, bodyG, legA, head]);
    root.add([shadow, inner]);
    root.parts = { inner, tail, head, tongue, legs: [legA, legB] };
    return root;
  }

  function animateDog(c, t, moving, chasing, face) {
    const p = c.parts;
    const speed = chasing ? 0.035 : 0.018;
    const step = moving ? Math.sin(t * speed) * 2.5 : 0;
    p.legs[0].y = step; p.legs[1].y = -step;
    p.inner.y = moving ? -Math.abs(Math.sin(t * speed)) * 2 : 0;
    p.inner.scaleX = face;
    p.tail.rotation = Math.sin(t * (chasing ? 0.04 : 0.01)) * 0.4;
    p.tongue.setVisible(chasing);
  }

  function treat(scene) {
    const g = scene.add.graphics();
    g.fillStyle(0x0f2a12, 0.25).fillEllipse(1, 8, 22, 7);
    g.fillStyle(0xd9c27a, 1).fillRoundedRect(-8, -6, 16, 14, 4);
    g.fillStyle(0x3f7a34, 1).fillEllipse(-5, -8, 9, 6).fillEllipse(4, -9, 9, 6);
    g.fillStyle(0x7ac35a, 1).fillEllipse(0, -10, 6, 8);
    return g;
  }

  return { shade, cat, animateCat, player, animatePlayer, swingNet, dog, animateDog, treat };
})();
