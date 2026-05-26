// ═══════════════════════════════════════════════════════
// synth.js — Síntese por material + Reverb Convolution
// It Looks Like Zimoun · NICS/UNICAMP · 2026
// ═══════════════════════════════════════════════════════

export let AC = null;
export let masterGain = null;
export let convolver = null;
export let dryGain = null;
export let wetGain = null;
export let wetRatio = 0.65;
export let currentRoom = 'stone';

export function initAudio() {
  AC = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = AC.createGain();
  masterGain.gain.value = 0.78;

  dryGain = AC.createGain(); dryGain.gain.value = 1 - wetRatio;
  wetGain = AC.createGain(); wetGain.gain.value = wetRatio;
  convolver = AC.createConvolver();

  masterGain.connect(dryGain);     dryGain.connect(AC.destination);
  masterGain.connect(convolver);   convolver.connect(wetGain);
  wetGain.connect(AC.destination);

  buildIR('stone');
}

export function setWetRatio(r) {
  wetRatio = r;
  if (!dryGain || !wetGain) return;
  dryGain.gain.setTargetAtTime(1 - r, AC.currentTime, 0.05);
  wetGain.gain.setTargetAtTime(r,     AC.currentTime, 0.05);
}

export function setMasterVolume(v) {
  if (!masterGain) return;
  masterGain.gain.setTargetAtTime(v, AC.currentTime, 0.05);
}

// ── Impulse Response sintética ─────────────────────────
export function buildIR(room) {
  if (!AC) return;
  currentRoom = room;

  const cfg = {
    anechoic: { dur: 0.15, decay: 8,   diffuse: 0.02, early: 0.6, late: 0.10, lpf: 8000 },
    room:     { dur: 0.80, decay: 3,   diffuse: 0.30, early: 0.7, late: 0.40, lpf: 6000 },
    stone:    { dur: 3.20, decay: 1.2, diffuse: 0.65, early: 0.5, late: 0.85, lpf: 4500 },
    corridor: { dur: 1.80, decay: 1.8, diffuse: 0.45, early: 0.8, late: 0.60, lpf: 5500 },
    open:     { dur: 1.20, decay: 2.5, diffuse: 0.20, early: 0.4, late: 0.25, lpf: 7000 },
  }[room] || { dur: 2, decay: 2, diffuse: 0.4, early: 0.6, late: 0.5, lpf: 5000 };

  const sr = AC.sampleRate;
  const len = Math.floor(sr * cfg.dur);
  const ir = AC.createBuffer(2, len, sr);

  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    const nEarly = Math.floor(12 * cfg.early);
    const earlyTimes = Array.from({ length: nEarly }, () => Math.floor(Math.random() * sr * 0.06));
    for (let i = 0; i < len; i++) {
      let v = 0;
      v += (Math.random() * 2 - 1) * Math.pow(1 - i / len, cfg.decay) * cfg.late;
      if (earlyTimes.includes(i)) v += (Math.random() * 2 - 1) * 0.8 * cfg.early;
      v += (Math.random() * 2 - 1) * cfg.diffuse * Math.exp(-i / (sr * 0.3));
      d[i] = v * 0.6;
    }
    // LP colouring
    let prev = 0;
    const rc = cfg.lpf / (cfg.lpf + sr / (2 * Math.PI));
    for (let i = 0; i < len; i++) { d[i] = prev = prev + (d[i] - prev) * rc; }
  }
  convolver.buffer = ir;
}

// ── BaseSynth: um único material ────────────────────────
export class BaseSynth {
  constructor(mat) {
    this.mat = mat;
    this.nodes = [];
    this.out = AC.createGain();
    this.out.gain.value = 0;
    this._baseFreq = 220;
    this.freqMult = 1;
    this._build();
  }

  _build() {
    switch (this.mat) {

      case 'paper': {
        const buf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.55;
        const src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
        const hpf = AC.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 1600; hpf.Q.value = 0.5;
        const lpf = AC.createBiquadFilter(); lpf.type = 'lowpass';  lpf.frequency.value = 7500;
        const lfo = AC.createOscillator(); lfo.frequency.value = 0.5 + Math.random() * 1.2;
        const lg  = AC.createGain(); lg.gain.value = 0.32;
        lfo.connect(lg); lg.connect(this.out.gain);
        src.connect(hpf); hpf.connect(lpf); lpf.connect(this.out);
        src.start(); lfo.start();
        this.nodes = [src, lfo];
        break;
      }

      case 'wood': {
        const bf = 80 + Math.random() * 130; this._baseFreq = bf;
        const o1 = AC.createOscillator(); o1.type = 'sine'; o1.frequency.value = bf;
        const o2 = AC.createOscillator(); o2.type = 'sine'; o2.frequency.value = bf * 2.76;
        const g1 = AC.createGain(); g1.gain.value = 0.5;
        const g2 = AC.createGain(); g2.gain.value = 0.22;
        const bpf = AC.createBiquadFilter(); bpf.type = 'bandpass'; bpf.frequency.value = bf; bpf.Q.value = 9;
        const lfo = AC.createOscillator(); lfo.frequency.value = 1.8 + Math.random() * 4;
        const lg  = AC.createGain(); lg.gain.value = 0.28;
        lfo.connect(lg); lg.connect(this.out.gain);
        o1.connect(g1); o2.connect(g2); g1.connect(bpf); g2.connect(bpf); bpf.connect(this.out);
        o1.start(); o2.start(); lfo.start();
        this._o1 = o1; this._o2 = o2; this._bpf = bpf;
        this.nodes = [o1, o2, lfo];
        break;
      }

      case 'glass': {
        const bf = 650 + Math.random() * 500; this._baseFreq = bf;
        this._goscs = [1, 1.5, 2, 3].map((r, i) => {
          const o = AC.createOscillator(); o.type = 'sine';
          o.frequency.value = bf * r * (1 + Math.random() * 0.03);
          const g = AC.createGain(); g.gain.value = 0.17 / (i + 1);
          o.connect(g); g.connect(this.out); o.start(); return o;
        });
        const lfo = AC.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.12 + Math.random() * 0.35;
        const lg  = AC.createGain(); lg.gain.value = 0.5;
        lfo.connect(lg); lg.connect(this.out.gain); lfo.start();
        this.nodes = [...this._goscs, lfo];
        break;
      }

      case 'metal': {
        const bf = 170 + Math.random() * 380; this._baseFreq = bf;
        this._ratio = [1.41, 2.1, 3.14][Math.floor(Math.random() * 3)];
        const car = AC.createOscillator(); car.frequency.value = bf;
        const mod = AC.createOscillator(); mod.frequency.value = bf * this._ratio;
        const mg  = AC.createGain(); mg.gain.value = bf * 2.1;
        const lfo = AC.createOscillator(); lfo.frequency.value = 0.07 + Math.random() * 0.3;
        const lg  = AC.createGain(); lg.gain.value = 0.58;
        lfo.connect(lg); lg.connect(this.out.gain);
        mod.connect(mg); mg.connect(car.frequency); car.connect(this.out);
        car.start(); mod.start(); lfo.start();
        this._car = car; this._mod = mod;
        this.nodes = [car, mod, lfo];
        break;
      }

      case 'stone': {
        const buf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
        const src  = AC.createBufferSource(); src.buffer = buf; src.loop = true;
        this._lpf  = AC.createBiquadFilter(); this._lpf.type = 'lowpass'; this._lpf.frequency.value = 300; this._lpf.Q.value = 2.5;
        const comp = AC.createDynamicsCompressor(); comp.threshold.value = -22; comp.ratio.value = 14;
        const lfo  = AC.createOscillator(); lfo.frequency.value = 0.8 + Math.random() * 2.2;
        const lg   = AC.createGain(); lg.gain.value = 0.65;
        lfo.connect(lg); lg.connect(this.out.gain);
        src.connect(this._lpf); this._lpf.connect(comp); comp.connect(this.out);
        src.start(); lfo.start();
        this.nodes = [src, lfo];
        break;
      }

      case 'rubber': {
        const bf = 42 + Math.random() * 88; this._baseFreq = bf;
        const osc = AC.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = bf;
        this._lpf2 = AC.createBiquadFilter(); this._lpf2.type = 'lowpass'; this._lpf2.frequency.value = 260; this._lpf2.Q.value = 5;
        const lfo  = AC.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.35 + Math.random() * 1.4;
        const lf   = AC.createGain(); lf.gain.value = 170;
        lfo.connect(lf); lf.connect(this._lpf2.frequency);
        const lfo2 = AC.createOscillator(); lfo2.frequency.value = 0.18 + Math.random() * 0.65;
        const lg2  = AC.createGain(); lg2.gain.value = 0.36;
        lfo2.connect(lg2); lg2.connect(this.out.gain);
        osc.connect(this._lpf2); this._lpf2.connect(this.out);
        osc.start(); lfo.start(); lfo2.start();
        this._osc = osc;
        this.nodes = [osc, lfo, lfo2];
        break;
      }
    }
  }

  setFreqMult(m) {
    this.freqMult = Math.max(0.25, Math.min(4, m));
    const f = this.freqMult;
    if (this._car)   { this._car.frequency.value = this._baseFreq * f; this._mod.frequency.value = this._baseFreq * this._ratio * f; }
    if (this._o1)    { this._o1.frequency.value = this._baseFreq * f; this._o2.frequency.value = this._baseFreq * 2.76 * f; this._bpf.frequency.value = this._baseFreq * f; }
    if (this._goscs)   this._goscs.forEach((o, i) => o.frequency.value = this._baseFreq * [1, 1.5, 2, 3][i] * f);
    if (this._lpf)     this._lpf.frequency.value  = Math.min(18000, 300 * f);
    if (this._lpf2)    this._lpf2.frequency.value = Math.min(18000, 260 * f);
    if (this._osc)     this._osc.frequency.value  = this._baseFreq * f;
  }

  destroy() {
    setTimeout(() => {
      this.nodes.forEach(n => { try { n.stop(); } catch (e) {} });
      this.out.disconnect();
    }, 500);
  }
}

// ── MixSynth: mistura de até 3 materiais ───────────────
export class MixSynth {
  constructor(recipe) {
    this.recipe  = recipe;
    this.panner  = AC.createStereoPanner();
    this.gainNode = AC.createGain(); this.gainNode.gain.value = 0;
    this.gainNode.connect(this.panner);
    this.panner.connect(masterGain);
    this.active   = false;
    this.freqMult = 1;
    this.synths   = [];
    this._buildSynths();
  }

  _buildSynths() {
    const total = this.recipe.reduce((s, r) => s + r.weight, 0) || 1;
    for (const r of this.recipe) {
      if (!r.mat || r.weight <= 0) continue;
      const bs = new BaseSynth(r.mat);
      const wg = AC.createGain(); wg.gain.value = (r.weight / total) * 0.38;
      bs.out.connect(wg); wg.connect(this.gainNode);
      this.synths.push({ bs, wg, w: r.weight / total });
    }
  }

  setRecipe(recipe) {
    this.synths.forEach(s => { s.bs.destroy(); s.wg.disconnect(); });
    this.synths = [];
    this.recipe = recipe;
    this._buildSynths();
    if (this.active) this.gainNode.gain.setTargetAtTime(0.38, AC.currentTime, 0.15);
    this.setFreqMult(this.freqMult);
  }

  setFreqMult(m) {
    this.freqMult = Math.max(0.25, Math.min(4, m));
    this.synths.forEach(s => s.bs.setFreqMult(this.freqMult));
  }

  setSpatial(gain, pan) {
    if (!this.active) return;
    this.gainNode.gain.setTargetAtTime(Math.max(0, gain * 0.38), AC.currentTime, 0.06);
    this.panner.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), AC.currentTime, 0.1);
  }

  activate()   { this.active = true;  this.gainNode.gain.setTargetAtTime(0.38, AC.currentTime, 0.25); }
  deactivate() { this.active = false; this.gainNode.gain.setTargetAtTime(0,    AC.currentTime, 0.30); }

  destroy() {
    this.deactivate();
    setTimeout(() => {
      this.synths.forEach(s => { s.bs.destroy(); s.wg.disconnect(); });
      this.gainNode.disconnect();
      this.panner.disconnect();
    }, 600);
  }
}
