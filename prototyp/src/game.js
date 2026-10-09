// Spelets logik: titelskärm, själva rundan och resultatskärm.
(() => {
  const L = window.LANG, CFG = window.CONFIG, MAP = window.MAP;
  const rotateText = document.getElementById('rotate-text');
  if (rotateText) rotateText.textContent = L.rotate;
  const W = CFG.width, H = CFG.height;
  const FONT = '"Lilita One", "Arial Rounded MT Bold", system-ui, sans-serif';
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Slumpen. I fas 3 ska fröet komma från servern så att resultat kan kontrolleras.
  function mulberry32(a) {
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const weighted = (rng, weights) => { let r = rng() * weights.reduce((a, b) => a + b, 0); for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r < 0) return i; } return weights.length - 1; };

  const label = (scene, x, y, s, size = 20, color = '#ffffff', style = {}) =>
    scene.add.text(x, y, s, Object.assign({ fontFamily: FONT, fontSize: size + 'px', color }, style)).setOrigin(0.5);

  // Album och totalpoäng sparas lokalt i webbläsaren i prototypen (på servern i fas 3)
  const Save = {
    load() { try { const d = JSON.parse(localStorage.getItem('bagem.save')); if (d && d.album) return d; } catch (e) { /* tom */ } return { album: {}, total: 0 }; },
    store(d) { try { localStorage.setItem('bagem.save', JSON.stringify(d)); } catch (e) { /* inget sparas */ } }
  };
  const catKey = c => c.breed.id + ':' + c.color.id + (c.golden ? ':golden' : '');
  const catName = c => (c.golden ? L.golden + ' ' : '') + c.color.name + ' ' + c.breed.name;
  const catValue = c => Math.round(RARITY[c.breed.rarity].points * c.color.mult * (c.golden ? 10 : 1));
  const dupValue = c => Math.round(RARITY[c.breed.rarity].dup * c.color.mult * (c.golden ? 10 : 1));
  const ALBUM_MAX = Object.values(BREEDS).reduce((n, b) => n + b.colors.length, 0);

  function hitKey(scene, r) {
    const key = 'hit' + r;
    if (!scene.textures.exists(key)) {
      const g = scene.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1).fillCircle(r, r, r);
      g.generateTexture(key, r * 2, r * 2);
      g.destroy();
    }
    return key;
  }
  // En osynlig fysikkropp som figuren följer
  function mover(scene, x, y, r) {
    const m = scene.physics.add.image(x, y, hitKey(scene, r)).setVisible(false);
    m.body.setCircle(r);
    m.setCollideWorldBounds(true);
    return m;
  }

  /* ================= Titelskärm ================= */
  class TitleScene extends Phaser.Scene {
    constructor() { super('Title'); }
    create() {
      this.add.rectangle(0, 0, W, H, 0x6aa84f).setOrigin(0);
      for (let x = 0; x < W; x += 80) this.add.rectangle(x, 0, 40, H, 0x76b65a).setOrigin(0);
      this.add.rectangle(0, H - 84, W, 84, 0x50565c).setOrigin(0);
      this.add.rectangle(0, H - 88, W, 4, 0xbfb6a2).setOrigin(0);
      label(this, W / 2, 92, L.title, 68, '#ffffff', { stroke: '#1d2421', strokeThickness: 12 });
      label(this, W / 2, 158, L.goal, 22, '#1d2421', { align: 'center', wordWrap: { width: 720 } });
      this.cats = Object.values(BREEDS).map((b, i) => Art.cat(this, b, b.colors[i % 3], false).setPosition(255 + i * 150, 290).setScale(1.7));
      label(this, W / 2, 392, L.controls, 16, '#1d2421', { align: 'center', wordWrap: { width: 820 } });
      const go = label(this, W / 2, H - 42, L.tapToStart, 28, '#f2c230');
      this.tweens.add({ targets: go, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
      const start = () => { if (this.started) return; this.started = true; Sfx.unlock(); this.scene.start('Game'); };
      this.input.once('pointerdown', start);
      this.input.keyboard.once('keydown', start);
    }
    update(time) {
      this.cats.forEach((c, i) => Art.animateCat(c, time, false, i * 1.7, false));
    }
  }

  /* ================= Rundan ================= */
  class GameScene extends Phaser.Scene {
    constructor() { super('Game'); }

    create() {
      this.rng = mulberry32((Date.now() ^ 0x9e3779b9) >>> 0);
      this.save = Save.load();
      this.timeLeft = CFG.roundSeconds;
      this.ended = false;
      this.treats = CFG.startTreats;
      this.treat = null;
      this.sack = [];
      this.cats = [];
      this.lastBeep = Infinity;
      this.hurried = false;

      this.physics.world.setBounds(0, 0, MAP.w, MAP.h);
      this.blockers = World.build(this);

      const pc = Art.player(this).setPosition(MAP.start.x, MAP.start.y);
      this.player = { c: pc, m: mover(this, MAP.start.x, MAP.start.y, 13), stun: 0, swing: 0, moving: false, running: false, face: 1 };
      this.physics.add.collider(this.player.m, this.blockers);
      this.cameras.main.setBounds(0, 0, MAP.w, MAP.h).startFollow(pc, true, 0.12, 0.12);

      for (let i = 0; i < CFG.startCats; i++) this.spawnCat(this.pickBreed());
      if (this.rng() < CFG.siameseNaturalChance) this.spawnCat(BREEDS.siamese);
      this.respawnT = CFG.respawnEvery;

      this.makeDog();
      this.exitRect = new Phaser.Geom.Rectangle(MAP.exit.x, MAP.exit.y, MAP.exit.w, MAP.exit.h);

      this.buildHud();
      this.buildInput();
      this.toast(L.goal, 3200);
    }

    /* ---------- Katter ---------- */
    pickBreed() {
      const list = Object.values(BREEDS).filter(b => b.weight > 0);
      return list[weighted(this.rng, list.map(b => b.weight))];
    }

    freeSpot(minDist) {
      for (let i = 0; i < 60; i++) {
        const l = MAP.lawns[Math.floor(this.rng() * MAP.lawns.length)];
        const x = l.x + this.rng() * l.w, y = l.y + this.rng() * l.h;
        if (World.blocked(x, y, 26)) continue;
        if (dist({ x, y }, this.player.m) < minDist) continue;
        return { x, y };
      }
      return null;
    }

    spotNear(p, min, max) {
      for (let i = 0; i < 50; i++) {
        const a = this.rng() * Math.PI * 2, d = min + this.rng() * (max - min);
        const x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d;
        if (y > 830 || World.blocked(x, y, 26)) continue;
        return { x, y };
      }
      return null;
    }

    spawnCat(breed, spot) {
      spot = spot || this.freeSpot(280);
      if (!spot) return null;
      const color = breed.colors[weighted(this.rng, COLOR_WEIGHTS)];
      const golden = this.rng() < CFG.goldenChance;
      const c = Art.cat(this, breed, color, golden).setPosition(spot.x, spot.y);
      const m = mover(this, spot.x, spot.y, Math.round(10 * breed.size));
      this.physics.add.collider(m, this.blockers);
      const top = -(30 * breed.size);
      if (breed.rarity !== 'common' || golden) {
        const tag = golden ? L.golden : L.rarity[breed.rarity];
        const bg = golden ? '#b8860b' : '#' + RARITY[breed.rarity].tag.toString(16).padStart(6, '0');
        c.add(label(this, 0, top - 16, tag.toUpperCase(), 11, '#ffffff', { backgroundColor: bg, padding: { x: 5, y: 2 } }));
      }
      const meter = breed.scare ? this.add.graphics() : null;
      if (meter) c.add(meter);
      const cat = { c, m, breed, color, golden, meter, top, state: 'wander', t: 0, next: 0, cool: 0, scare: 0, meowed: false, lured: false, jitter: 0, face: 1, phase: this.rng() * 10, sparkle: 0 };
      this.cats.push(cat);
      return cat;
    }

    startFlee(cat, force) {
      if (cat.state === 'bolt' || cat.state === 'flee') return;
      if (!force && cat.state === 'tired') return;
      cat.state = 'flee';
      cat.t = cat.breed.flee.time;
      cat.jitter = (this.rng() - 0.5) * 0.8;
    }

    removeCat(cat) {
      const i = this.cats.indexOf(cat);
      if (i >= 0) this.cats.splice(i, 1);
      if (cat.lured) this.removeTreat();
      cat.m.destroy();
      cat.c.destroy();
    }

    updateCat(cat, dt, time) {
      const P = this.player, b = cat.breed, m = cat.m;
      const d = dist(m, P.m);
      cat.cool = Math.max(0, cat.cool - dt);
      if (b.scare) this.updateScare(cat, d, dt);

      switch (cat.state) {
        case 'wander':
          cat.next -= dt;
          if (cat.next <= 0) {
            cat.next = 1.5 + this.rng() * 2.5;
            if (this.rng() < 0.4) m.setVelocity(0, 0);
            else { const a = this.rng() * Math.PI * 2; m.setVelocity(Math.cos(a) * b.wander, Math.sin(a) * b.wander); }
          }
          if (!b.scare && cat.cool <= 0 && d < (P.running ? b.flee.run : b.flee.sneak)) this.startFlee(cat);
          break;
        case 'flee': {
          cat.t -= dt;
          const bl = m.body.blocked;
          if (bl.left || bl.right || bl.up || bl.down) cat.jitter = (this.rng() - 0.5) * 2.6;
          const a = Math.atan2(m.y - P.m.y, m.x - P.m.x) + cat.jitter;
          m.setVelocity(Math.cos(a) * b.flee.speed, Math.sin(a) * b.flee.speed);
          if (cat.t <= 0) { cat.state = 'tired'; cat.t = b.flee.tired; m.setVelocity(0, 0); }
          break;
        }
        case 'tired':
          cat.t -= dt;
          m.setVelocity(0, 0);
          if (cat.t <= 0) { cat.state = cat.lured && this.treat ? 'lured' : 'wander'; cat.cool = 1.2; cat.next = 0; }
          break;
        case 'lured': {
          if (!this.treat) { cat.state = 'wander'; break; }
          const dd = dist(m, this.treat);
          if (dd > 20) { const a = Math.atan2(this.treat.y - m.y, this.treat.x - m.x); m.setVelocity(Math.cos(a) * 60, Math.sin(a) * 60); }
          else m.setVelocity(0, 0);
          cat.t -= dt;
          if (cat.t <= 0) { cat.state = 'wander'; this.removeTreat(); }
          break;
        }
        case 'bolt': {
          const a = Math.atan2(m.y - P.m.y, m.x - P.m.x) + cat.jitter;
          m.setVelocity(Math.cos(a) * 240, Math.sin(a) * 240);
          cat.t -= dt;
          cat.c.alpha = clamp(cat.t / 0.8, 0, 1);
          if (cat.t <= 0) { this.removeCat(cat); return; }
          break;
        }
      }

      cat.c.setPosition(m.x, m.y).setDepth(m.y);
      const vx = m.body.velocity.x;
      if (Math.abs(vx) > 4) cat.face = vx < 0 ? -1 : 1;
      const p = cat.c.parts;
      p.inner.scaleX = cat.face;
      Art.animateCat(cat.c, time, m.body.speed > 5, cat.phase, cat.state === 'tired');
      p.inner.rotation = b.roll && cat.state === 'flee' ? p.inner.rotation + dt * 11 * cat.face : 0;
      if (cat.golden) {
        cat.sparkle -= dt;
        if (cat.sparkle <= 0) { cat.sparkle = 0.3; this.sparkle(m.x + (this.rng() - 0.5) * 34, m.y - 14 + (this.rng() - 0.5) * 26); }
      }
    }

    // Sällsynta katter: skrämselmätaren fylls om man springer nära, sjunker om man står still
    updateScare(cat, d, dt) {
      const P = this.player;
      let inc;
      if (d < 230) inc = P.moving ? (P.running ? 60 : (d < 110 ? 14 : 8)) : -16;
      else inc = -25;
      if (inc > 0 && cat.lured) inc *= 0.5;
      cat.scare = clamp(cat.scare + inc * dt, 0, 100);

      if (cat.scare >= 50 && !cat.meowed && cat.state !== 'bolt') {
        cat.meowed = true;
        Sfx.meow(1.15);
        this.floatText(cat.m.x, cat.m.y + cat.top - 30, L.meow, '#ffffff');
        this.cats.forEach(o => { if (o !== cat && dist(o.m, cat.m) < 260) this.startFlee(o); });
      }
      if (cat.scare < 20) cat.meowed = false;
      if (cat.scare >= 100 && cat.state !== 'bolt') {
        cat.state = 'bolt'; cat.t = 1.6; cat.jitter = (this.rng() - 0.5) * 0.6;
        this.toast(L.scared);
        Sfx.miss();
        if (cat.lured) { cat.lured = false; this.removeTreat(); }
      }

      const g = cat.meter, w = 42, y = cat.top - 4;
      g.clear();
      if (cat.state === 'bolt') return;
      g.fillStyle(0x1d2421, 0.85).fillRoundedRect(-w / 2 - 2, y - 2, w + 4, 9, 4);
      const col = cat.scare < 40 ? 0x5bb06a : cat.scare < 70 ? 0xf2c230 : 0xe2553a;
      g.fillStyle(col, 1).fillRoundedRect(-w / 2, y, Math.max(3, w * cat.scare / 100), 5, 2);
    }

    sparkle(x, y) {
      const s = this.add.star(x, y, 4, 1.5, 5, 0xfff3b0).setDepth(9000);
      this.tweens.add({ targets: s, scale: { from: 0.3, to: 1.3 }, alpha: { from: 1, to: 0 }, angle: 90, duration: 600, onComplete: () => s.destroy() });
    }

    /* ---------- Fånga ---------- */
    sackUsed() { return this.sack.reduce((n, s) => n + s.breed.slots, 0); }

    tryCatch() {
      const P = this.player;
      if (this.ended || P.stun > 0 || P.swing > 0) return;
      P.swing = 0.32;
      Sfx.swing();
      Art.swingNet(this, P.c);

      let best = null, bd = CFG.catchRange;
      this.cats.forEach(c => { if (c.state === 'bolt') return; const d = dist(c.m, P.m); if (d < bd) { bd = d; best = c; } });
      if (!best) return;

      if (this.sackUsed() + best.breed.slots > CFG.sackSlots) { this.toast(L.sackFull); Sfx.miss(); return; }
      if (best.breed.scare && best.scare >= 60) {
        best.scare = Math.min(100, best.scare + 30);
        this.toast(L.tooScared); Sfx.miss();
        return;
      }
      if (best.state === 'flee' && this.rng() < 0.5) { this.floatText(best.m.x, best.m.y - 30, L.missed, '#ffffff'); Sfx.miss(); return; }
      this.bagCat(best);
    }

    bagCat(cat) {
      const P = this.player, x = cat.m.x, y = cat.m.y;
      this.cats.splice(this.cats.indexOf(cat), 1);
      cat.m.destroy();
      if (cat.lured) this.removeTreat();

      const key = catKey(cat), value = catValue(cat);
      const isNew = !this.save.album[key] && !this.sack.some(s => s.key === key);
      this.sack.push({ breed: cat.breed, color: cat.color, golden: cat.golden, key, value });

      Sfx.caught();
      if (cat.breed.rarity !== 'common' || cat.golden) Sfx.meow(1.3);
      this.tweens.add({ targets: cat.c, x: P.m.x - 20, y: P.m.y, scale: 0.2, alpha: 0, duration: 260, onComplete: () => cat.c.destroy() });
      this.floatText(x, y - 30, `+${value}  ${catName(cat)}`, '#ffffff');
      if (isNew) this.floatText(x, y - 54, L.newCat, '#f2c230');
      this.refreshSack();
    }

    /* ---------- Godis ---------- */
    useTreat() {
      if (this.ended) return;
      if (this.treat) { this.toast(L.treatBusy); return; }
      if (this.treats <= 0) { this.toast(L.noTreats); return; }
      const P = this.player;
      this.treats--;
      const g = Art.treat(this);
      const x = P.m.x + P.face * 22, y = P.m.y + 12;
      g.setPosition(x, y).setDepth(y);
      const treat = { x, y, g };
      this.treat = treat;
      Sfx.treat();
      this.toast(L.lured);
      this.refreshTreats();
      this.time.delayedCall(2500, () => {
        if (this.ended || this.treat !== treat) return;
        const spot = this.spotNear(treat, 240, 320);
        const c = spot && this.spawnCat(BREEDS.siamese, spot);
        if (c) { c.state = 'lured'; c.lured = true; c.t = 25; }
      });
      this.time.delayedCall(30000, () => { if (this.treat === treat && !this.cats.some(c => c.lured)) this.removeTreat(); });
    }

    removeTreat() {
      if (!this.treat) return;
      this.treat.g.destroy();
      this.treat = null;
      this.cats.forEach(c => { c.lured = false; if (c.state === 'lured') c.state = 'wander'; });
    }

    /* ---------- Hunden ---------- */
    makeDog() {
      const wp = MAP.dogPath[0];
      const c = Art.dog(this).setPosition(wp.x, wp.y);
      const m = mover(this, wp.x, wp.y, 16);
      this.physics.add.collider(m, this.blockers);
      this.dog = { c, m, state: 'patrol', i: 1, t: 0, cool: 2, face: 1 };
    }

    moveToward(m, target, speed) {
      const a = Math.atan2(target.y - m.y, target.x - m.x);
      m.setVelocity(Math.cos(a) * speed, Math.sin(a) * speed);
    }

    updateDog(dt, time) {
      const D = this.dog, P = this.player, m = D.m;
      const d = dist(m, P.m);
      D.cool = Math.max(0, D.cool - dt);
      switch (D.state) {
        case 'patrol': {
          const wp = MAP.dogPath[D.i];
          if (dist(m, wp) < 14) D.i = (D.i + 1) % MAP.dogPath.length;
          else this.moveToward(m, wp, 85);
          const sight = P.moving && P.running ? 200 : 110;
          if (D.cool <= 0 && P.stun <= 0 && d < sight) {
            D.state = 'chase'; D.t = 0;
            Sfx.bark();
            this.floatText(m.x, m.y - 40, L.bark, '#ffffff');
          }
          break;
        }
        case 'chase':
          D.t += dt;
          this.moveToward(m, P.m, 172);
          if (d < 30) this.bite();
          else if (d > 340 || D.t > 6) { D.state = 'patrol'; D.cool = 2; }
          break;
        case 'sit':
          m.setVelocity(0, 0);
          D.t -= dt;
          if (D.t <= 0) D.state = 'patrol';
          break;
      }
      D.c.setPosition(m.x, m.y).setDepth(m.y);
      if (Math.abs(m.body.velocity.x) > 4) D.face = m.body.velocity.x < 0 ? -1 : 1;
      Art.animateDog(D.c, time, m.body.speed > 5, D.state === 'chase', D.face);
    }

    // Hunden når gubben: snubblar, förlorar tid, katterna runt omkring flyr. Säcken påverkas inte.
    bite() {
      const P = this.player, D = this.dog;
      P.stun = CFG.dogStun;
      P.m.setVelocity(0, 0);
      this.timeLeft = Math.max(0, this.timeLeft - CFG.dogPenalty);
      this.floatText(P.m.x, P.m.y - 56, L.dizzy, '#e2553a');
      Sfx.bark(); Sfx.miss();
      this.cameras.main.shake(220, 0.006);
      this.cats.forEach(c => {
        if (dist(c.m, P.m) > 220) return;
        if (c.breed.scare) c.scare = Math.min(100, c.scare + 40); else this.startFlee(c, true);
      });
      D.state = 'sit'; D.t = 3.5; D.cool = 6;
    }

    /* ---------- Spelaren ---------- */
    readInput() {
      const k = this.keys;
      let x = 0, y = 0;
      if (k.LEFT.isDown || k.A.isDown) x -= 1;
      if (k.RIGHT.isDown || k.D.isDown) x += 1;
      if (k.UP.isDown || k.W.isDown) y -= 1;
      if (k.DOWN.isDown || k.S.isDown) y += 1;
      if (x || y) { const l = Math.hypot(x, y); return { x: x / l, y: y / l, on: true, sneak: k.SHIFT.isDown }; }
      const J = this.joy;
      if (J.active) {
        const l = Math.hypot(J.dx, J.dy);
        if (l > 8) { const mag = Math.min(1, l / J.max); return { x: J.dx / l, y: J.dy / l, on: true, sneak: mag < 0.6 }; }
      }
      return { x: 0, y: 0, on: false, sneak: false };
    }

    updatePlayer(dt, time) {
      const P = this.player, v = this.readInput();
      P.stun = Math.max(0, P.stun - dt);
      P.swing = Math.max(0, P.swing - dt);
      const speed = P.stun <= 0 && v.on ? (v.sneak ? CFG.sneakSpeed : CFG.runSpeed) : 0;
      P.m.setVelocity(v.x * speed, v.y * speed);
      P.moving = speed > 0;
      P.running = P.moving && !v.sneak;
      if (P.moving && Math.abs(v.x) > 0.15) P.face = v.x < 0 ? -1 : 1;
      P.c.setPosition(P.m.x, P.m.y).setDepth(P.m.y);
      Art.animatePlayer(P.c, time, P.moving, P.running, P.face, P.stun > 0);
    }

    /* ---------- Kontroller ---------- */
    buildInput() {
      this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,SPACE,E,Q');
      this.input.keyboard.on('keydown-SPACE', () => this.tryCatch());
      this.input.keyboard.on('keydown-E', () => this.tryCatch());
      this.input.keyboard.on('keydown-Q', () => this.useTreat());
      this.input.addPointer(2);

      // Joysticken dyker upp där man sätter tummen på vänstra halvan
      this.joy = { active: false, id: -1, bx: 0, by: 0, dx: 0, dy: 0, max: 60 };
      this.input.on('pointerdown', p => {
        if (this.joy.active || p.x > W * 0.5) return;
        Object.assign(this.joy, { active: true, id: p.id, bx: p.x, by: p.y, dx: 0, dy: 0 });
      });
      this.input.on('pointermove', p => {
        const J = this.joy;
        if (!J.active || p.id !== J.id) return;
        let dx = p.x - J.bx, dy = p.y - J.by;
        const l = Math.hypot(dx, dy);
        if (l > J.max) { dx *= J.max / l; dy *= J.max / l; }
        J.dx = dx; J.dy = dy;
      });
      const release = p => { if (p.id === this.joy.id) { this.joy.active = false; this.joy.id = -1; } };
      this.input.on('pointerup', release);
      this.input.on('pointerupoutside', release);
    }

    /* ---------- HUD ---------- */
    buildHud() {
      const fix = o => o.setScrollFactor(0).setDepth(10000);
      const h = this.hud = {};
      const bg = fix(this.add.graphics());
      bg.fillStyle(0x1d2421, 0.88).fillRoundedRect(W / 2 - 58, 10, 116, 40, 20).fillRoundedRect(10, 10, 150, 40, 20);
      h.timer = fix(label(this, W / 2, 30, '', 28));
      h.value = fix(label(this, 26, 30, '', 20).setOrigin(0, 0.5));

      h.sack = fix(this.add.graphics());
      h.sackX = W - 12 - CFG.sackSlots * 30;
      h.sackLabel = fix(label(this, h.sackX - 36, 30, L.sack, 18, '#f2c230'));

      const net = fix(this.add.circle(W - 78, H - 78, 50, 0xf2c230, 0.95)).setInteractive();
      fix(label(this, W - 78, H - 78, L.net, 24, '#1d2421'));
      net.on('pointerdown', () => this.tryCatch());

      const tr = fix(this.add.circle(W - 186, H - 52, 34, 0x7ac35a, 0.95)).setInteractive();
      fix(label(this, W - 186, H - 60, L.treat, 15, '#1d2421'));
      h.treatCount = fix(label(this, W - 186, H - 41, '', 16, '#1d2421'));
      tr.on('pointerdown', () => this.useTreat());

      h.joy = fix(this.add.graphics());
      h.toast = fix(label(this, W / 2, 84, '', 22, '#ffffff', { stroke: '#1d2421', strokeThickness: 6, align: 'center', wordWrap: { width: 640 } })).setAlpha(0);

      h.arrow = fix(this.add.container(0, 0));
      const ag = this.add.graphics();
      ag.fillStyle(0xf2c230, 1).fillTriangle(16, 0, -10, -13, -10, 13);
      ag.lineStyle(3, 0x1d2421, 1).strokeTriangle(16, 0, -10, -13, -10, 13);
      h.arrowG = ag;
      h.arrowText = label(this, 0, 24, L.exit, 14, '#f2c230', { stroke: '#1d2421', strokeThickness: 4 });
      h.arrow.add([ag, h.arrowText]);

      this.refreshSack();
      this.refreshTreats();
    }

    refreshSack() {
      const g = this.hud.sack, x0 = this.hud.sackX, n = CFG.sackSlots;
      g.clear();
      g.fillStyle(0x1d2421, 0.88).fillRoundedRect(x0 - 70, 10, n * 30 + 76, 40, 20);
      let i = 0;
      this.sack.forEach(s => {
        for (let k = 0; k < s.breed.slots; k++, i++) {
          g.fillStyle(s.golden ? 0xe8b622 : s.color.body, 1).fillRoundedRect(x0 + i * 30, 18, 24, 24, 6);
          g.lineStyle(2, 0xffffff, 0.8).strokeRoundedRect(x0 + i * 30, 18, 24, 24, 6);
        }
      });
      for (; i < n; i++) g.lineStyle(2, 0x5b6661, 1).strokeRoundedRect(x0 + i * 30, 18, 24, 24, 6);
      const value = this.sack.reduce((a, s) => a + s.value, 0);
      this.hud.value.setText(`${L.value} ${value}`);
    }

    refreshTreats() { this.hud.treatCount.setText('x' + this.treats); }

    toast(s, ms = 1500) {
      const t = this.hud.toast;
      this.tweens.killTweensOf(t);
      t.setText(s).setAlpha(1);
      this.tweens.add({ targets: t, alpha: 0, delay: ms, duration: 400 });
    }

    floatText(x, y, s, color) {
      const t = label(this, x, y, s, 18, color, { stroke: '#1d2421', strokeThickness: 5 }).setDepth(9500);
      this.tweens.add({ targets: t, y: y - 34, alpha: 0, delay: 400, duration: 900, onComplete: () => t.destroy() });
    }

    updateHud(time) {
      const h = this.hud, t = Math.max(0, this.timeLeft);
      const sec = Math.ceil(t);
      h.timer.setText(`${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`);
      const warn = t <= CFG.warningAt;
      h.timer.setColor(warn ? '#e2553a' : '#ffffff');
      if (warn) {
        if (!this.hurried) { this.hurried = true; this.toast(L.hurry); }
        const beepEvery = t <= 10 ? 1 : 5;
        const mark = Math.ceil(t / beepEvery);
        if (mark !== this.lastBeep) { this.lastBeep = mark; Sfx.warn(); }
      }

      // Joysticken
      const J = this.joy, g = h.joy;
      g.clear();
      if (J.active) {
        g.fillStyle(0xffffff, 0.15).fillCircle(J.bx, J.by, J.max);
        g.lineStyle(3, 0xffffff, 0.5).strokeCircle(J.bx, J.by, J.max);
        g.lineStyle(2, 0xffffff, 0.35).strokeCircle(J.bx, J.by, J.max * 0.6);
        g.fillStyle(0xffffff, 0.75).fillCircle(J.bx + J.dx, J.by + J.dy, 24);
      }

      // Pil mot utgången när den inte syns
      const v = this.cameras.main.worldView;
      const ex = this.exitRect.centerX, ey = this.exitRect.centerY;
      if (v.contains(ex, ey)) { h.arrow.setVisible(false); return; }
      const a = Math.atan2(ey - v.centerY, ex - v.centerX);
      const c = Math.cos(a), s = Math.sin(a);
      // nedåt hålls pilen ovanför NET-knappen
      const r = Math.min((W / 2 - 44) / Math.max(Math.abs(c), 1e-3), (s > 0 ? H / 2 - 150 : H / 2 - 80) / Math.max(Math.abs(s), 1e-3));
      h.arrow.setVisible(true).setPosition(W / 2 + c * r, H / 2 + s * r);
      h.arrowG.rotation = a;
      h.arrow.setScale(warn ? 1 + Math.abs(Math.sin(time * 0.008)) * 0.35 : 1);
    }

    /* ---------- Huvudloop ---------- */
    update(time, delta) {
      if (this.ended) return;
      const dt = Math.min(delta, 50) / 1000;
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) { this.endRound(false); return; }

      this.updatePlayer(dt, time);
      this.cats.slice().forEach(c => this.updateCat(c, dt, time));
      this.updateDog(dt, time);

      this.respawnT -= dt;
      if (this.respawnT <= 0) {
        this.respawnT = CFG.respawnEvery;
        if (this.cats.length < CFG.maxCats) this.spawnCat(this.pickBreed());
      }

      if (this.exitRect.contains(this.player.m.x, this.player.m.y)) { this.endRound(true); return; }
      this.updateHud(time);
    }

    endRound(won) {
      if (this.ended) return;
      this.ended = true;
      this.physics.pause();
      const seen = new Set(Object.keys(this.save.album));
      const results = [];
      let roundPts = 0;
      this.sack.forEach(s => {
        const isNew = !seen.has(s.key);
        seen.add(s.key);
        const pts = isNew ? s.value : dupValue(s);
        roundPts += pts;
        results.push({ name: catName(s), isNew, pts, golden: s.golden });
        if (won) this.save.album[s.key] = (this.save.album[s.key] || 0) + 1;
      });
      if (won) { this.save.total += roundPts; Save.store(this.save); Sfx.win(); } else Sfx.lose();
      const albumCount = Object.keys(this.save.album).filter(k => !k.endsWith(':golden')).length;
      this.time.delayedCall(500, () => this.scene.start('End', { won, results, roundPts: won ? roundPts : 0, total: this.save.total, albumCount }));
    }
  }

  /* ================= Resultat ================= */
  class EndScene extends Phaser.Scene {
    constructor() { super('End'); }
    create(data) {
      this.add.rectangle(0, 0, W, H, 0x1d2421).setOrigin(0);
      label(this, W / 2, 58, data.won ? L.escaped : L.timeUp, 54, data.won ? '#f2c230' : '#e2553a');
      let y = 112;
      if (!data.won) { label(this, W / 2, 106, L.lostSack, 21, '#d6cdb8'); y = 140; }
      if (!data.results.length) label(this, W / 2, y + 40, L.nothingCaught, 22, '#d6cdb8');

      const lineG = this.add.graphics();
      data.results.slice(0, 7).forEach((r, i) => {
        const yy = y + i * 34;
        const col = !data.won ? '#7d857f' : r.golden ? '#f2c230' : '#ffffff';
        const style = { fontFamily: FONT, fontSize: '21px', color: col };
        this.add.text(W / 2 - 290, yy, r.name, style);
        this.add.text(W / 2 + 120, yy + 2, r.isNew ? L.newCat : L.duplicate, Object.assign({}, style, { fontSize: '17px', color: r.isNew ? '#f2c230' : '#9aa79f' }));
        this.add.text(W / 2 + 290, yy, data.won ? `+${r.pts}` : '0', style).setOrigin(1, 0);
        if (!data.won) lineG.lineStyle(2, 0x7d857f, 1).beginPath().moveTo(W / 2 - 290, yy + 13).lineTo(W / 2 + 290, yy + 13).strokePath();
      });
      if (data.results.length > 7) label(this, W / 2, y + 7 * 34 + 10, L.more(data.results.length - 7), 18, '#9aa79f');

      label(this, W / 2, H - 132, `${L.roundValue}: ${data.roundPts} ${L.points}`, 28, '#ffffff');
      label(this, W / 2, H - 98, `${L.totalScore}: ${data.total}   ·   ${L.album}: ${data.albumCount}/${ALBUM_MAX}`, 20, '#9aa79f');

      const btn = this.add.rectangle(W / 2, H - 46, 240, 52, 0xf2c230).setInteractive({ useHandCursor: true });
      label(this, W / 2, H - 46, L.playAgain, 26, '#1d2421');
      const again = () => this.scene.start('Game');
      btn.on('pointerdown', again);
      this.input.keyboard.once('keydown-SPACE', again);
      this.input.keyboard.once('keydown-ENTER', again);
    }
  }

  /* ================= Start ================= */
  const boot = () => new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: H,
    backgroundColor: '#1d2421',
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [TitleScene, GameScene, EndScene]
  });
  const fontReady = document.fonts ? document.fonts.load('20px "Lilita One"').catch(() => null) : Promise.resolve();
  // window.bagem gör det möjligt att felsöka spelet från webbläsarens konsol
  Promise.race([fontReady, new Promise(r => setTimeout(r, 1500))]).then(() => { window.bagem = boot(); });
})();
