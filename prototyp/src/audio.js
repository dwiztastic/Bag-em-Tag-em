// Effektljud skapas i kod med Web Audio – inga ljudfiler behövs.
window.Sfx = (() => {
  let ctx = null;

  function unlock() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
  }

  function tone(type, f0, f1, dur, vol = 0.15, delay = 0) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(dur, vol, highpass = 800, delay = 0) {
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf; f.type = 'highpass'; f.frequency.value = highpass;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(t);
  }

  // Jamande: sågtand genom lågpassfilter med en böjd tonkurva och lite vibrato
  function meow(pitch = 1) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(480 * pitch, t);
    o.frequency.linearRampToValueAtTime(820 * pitch, t + 0.13);
    o.frequency.linearRampToValueAtTime(520 * pitch, t + 0.45);
    lfo.frequency.value = 7; lg.gain.value = 18;
    lfo.connect(lg).connect(o.frequency);
    f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(2200, t + 0.15); f.frequency.linearRampToValueAtTime(800, t + 0.45);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
    o.connect(f).connect(g).connect(ctx.destination);
    o.start(t); lfo.start(t); o.stop(t + 0.5); lfo.stop(t + 0.5);
  }

  return {
    unlock,
    meow,
    bark() { tone('square', 260, 140, 0.12, 0.1); tone('square', 240, 130, 0.12, 0.1, 0.16); noise(0.08, 0.06, 1200); },
    caught() { tone('sine', 520, 700, 0.1, 0.18); tone('sine', 780, 1040, 0.14, 0.18, 0.09); },
    miss() { tone('triangle', 380, 180, 0.25, 0.15); },
    swing() { noise(0.12, 0.1, 2000); },
    treat() { tone('sine', 300, 600, 0.15, 0.12); tone('sine', 450, 900, 0.12, 0.08, 0.1); },
    warn() { tone('square', 980, 980, 0.07, 0.05); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f, 0.18, 0.15, i * 0.11)); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone('triangle', f, f * 0.97, 0.22, 0.15, i * 0.16)); }
  };
})();
