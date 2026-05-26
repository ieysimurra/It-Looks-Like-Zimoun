// ═══════════════════════════════════════════════════════
// world.js — Objetos sonoros, pêndulo físico, mundo
// Voice pooling: áudio alocado apenas para objetos audíveis
// It Looks Like Zimoun · NICS/UNICAMP · 2026
// ═══════════════════════════════════════════════════════

import { AC, MixSynth } from './synth.js';

export const WORLD_SIZE = 72;   // expandido para suportar alta densidade
export const GRAVITY    = 0.0035;
export const DAMPING    = 0.986;

// Máximo de vozes de áudio simultâneas (independente do nº de objetos)
const MAX_VOICES = 30;

export const MATS = {
  paper:  { label: 'Papel',    col: [220,210,185], em: [255,245,215], shape: 'circle'   },
  wood:   { label: 'Madeira',  col: [158,108, 52], em: [205,148, 75], shape: 'square'   },
  glass:  { label: 'Vidro',    col: [145,205,225], em: [190,235,255], shape: 'diamond'  },
  metal:  { label: 'Metal',    col: [155,165,178], em: [205,215,235], shape: 'triangle' },
  stone:  { label: 'Pedra',    col: [115,110,100], em: [165,155,145], shape: 'hexagon'  },
  rubber: { label: 'Borracha', col: [ 75, 75, 70], em: [135,125,115], shape: 'circle'   },
};
export const MAT_KEYS = Object.keys(MATS);

// ── Pêndulo físico ──────────────────────────────────────
export class Pendulum {
  constructor() {
    this.angle  = (Math.random() - 0.5) * 0.5;
    this.vel    = (Math.random() - 0.5) * 0.014;
    this.length = 0.65 + Math.random() * 0.75;
  }
  update() {
    const acc = -GRAVITY * Math.sin(this.angle) / this.length;
    this.vel   = (this.vel + acc) * DAMPING;
    this.angle += this.vel;
  }
  tipX() { return Math.sin(this.angle) * this.length; }
  tipY() { return Math.cos(this.angle) * this.length; }
  pan()  { return Math.sin(this.angle) * 0.8; }
  impulse(v) { this.vel += v * 0.013; }
}

// ── Objeto sonoro ───────────────────────────────────────
export class SObj {
  constructor(x, y, mat) {
    this.x = x; this.y = y;
    this.recipe    = [{ mat, weight: 100 }, { mat: '', weight: 0 }, { mat: '', weight: 0 }];
    this.active    = true;
    this.phase     = Math.random() * Math.PI * 2;
    this.pulseRate = 0.3 + Math.random() * 2.0;
    this.pulseAmp  = 0.20 + Math.random() * 0.45;
    this.baseSize  = 12 + Math.random() * 13;
    this.pend      = new Pendulum();
    this.synth     = null;
    this.hasVoice  = false;
    this.dragging  = false;
    this.dragVx    = 0;
    this.freqMult  = 1;
    this._dist     = 9999;
  }
  get mat() { return this.recipe[0].mat; }

  toggle() {
    this.active = !this.active;
    if (!this.synth) return;
    if (this.active) this.synth.activate(); else this.synth.deactivate();
  }
  setActive(v) {
    if (this.active === v) return;
    this.active = v;
    if (!this.synth) return;
    if (v) this.synth.activate(); else this.synth.deactivate();
  }
  applyRecipe() {
    if (!this.synth) return;
    this.synth.setRecipe(this.recipe);
    if (this.active) this.synth.activate();
    this.synth.setFreqMult(this.freqMult);
  }
  update() { if (!this.dragging) this.pend.update(); }
  pulse(t) { return 1 + Math.sin(t * this.pulseRate + this.phase) * this.pulseAmp; }
}

// ── Voice Pool ──────────────────────────────────────────
let _poolFrame = 0;
const POOL_INTERVAL = 6; // reavalia vozes a cada N frames (não precisa ser todo frame)

const voicePool = {
  assign(objs, px, py, maxDist) {
    if (!AC) return;
    _poolFrame++;
    if (_poolFrame % POOL_INTERVAL !== 0) {
      // frames intermediários: só atualiza distância, não realoca vozes
      for (const o of objs) {
        const dx = o.x - px, dy = o.y - py;
        o._dist = Math.sqrt(dx*dx + dy*dy);
      }
      return;
    }

    for (const o of objs) {
      const dx = o.x - px, dy = o.y - py;
      o._dist = Math.sqrt(dx*dx + dy*dy);
    }

    // Candidatos: ativos, dentro do raio, ordenados por distância
    const candidates = objs
      .filter(o => o.active && o._dist <= maxDist)
      .sort((a, b) => a._dist - b._dist)
      .slice(0, MAX_VOICES);

    const candidateSet = new Set(candidates);

    // Revogar vozes de objetos fora da zona
    for (const o of objs) {
      if (o.synth && !candidateSet.has(o)) {
        o.synth.destroy();
        o.synth = null;
        o.hasVoice = false;
      }
    }

    // Alocar vozes para candidatos sem voz
    for (const o of candidates) {
      if (!o.synth) {
        o.synth = new MixSynth(o.recipe);
        o.synth.activate();
        o.synth.setFreqMult(o.freqMult);
        o.hasVoice = true;
      }
    }
  },

  updateSpatial(objs, px, py, pa, maxDist) {
    for (const o of objs) {
      if (!o.synth || !o.active) continue;
      const dist = o._dist;
      if (dist > maxDist) { o.synth.setSpatial(0, 0); continue; }
      const gain = Math.pow(1 - dist / maxDist, 2);
      const dx = o.x - px, dy = o.y - py;
      const wa = Math.atan2(dy, dx) - pa;
      const worldPan = Math.sin(wa) * Math.min(1, dist / 3);
      const pendPan  = o.pend.pan() * 0.32;
      o.synth.setSpatial(gain, worldPan + pendPan);
    }
  }
};

// ── Mundo ───────────────────────────────────────────────
export const world = {
  objs: [],
  enabled: new Set(MAT_KEYS),

  gen(n = 48) {
    this.objs.forEach(o => { if (o.synth) o.synth.destroy(); });
    this.objs = [];
    const mg = 3;
    // Separação mínima adaptativa
    const minSep = Math.max(1.0, Math.sqrt((WORLD_SIZE * WORLD_SIZE) / n) * 0.48);

    for (let i = 0; i < n; i++) {
      let x, y, ok, tries = 0;
      do {
        ok = true;
        x = mg + Math.random() * (WORLD_SIZE - mg * 2);
        y = mg + Math.random() * (WORLD_SIZE - mg * 2);
        const cx = WORLD_SIZE / 2, cy = WORLD_SIZE / 2;
        if ((x-cx)**2 + (y-cy)**2 < 9) { ok = false; continue; }
        // Para alta densidade, checar apenas vizinhos próximos (grade)
        const recent = this.objs.slice(-60);
        for (const o of recent) {
          if ((x-o.x)**2 + (y-o.y)**2 < minSep*minSep) { ok = false; break; }
        }
        tries++;
      } while (!ok && tries < 60);

      const mat = MAT_KEYS[Math.floor(Math.random() * MAT_KEYS.length)];
      const obj = new SObj(x, y, mat);
      if (!this.enabled.has(mat)) obj.active = false;
      this.objs.push(obj);
    }
  },

  initSynths() { /* vozes gerenciadas pelo pool */ },

  updateAll(px, py, pa, maxDist) {
    // Física de todos (leve)
    for (const o of this.objs) o.update();
    // Gerenciar vozes de áudio
    voicePool.assign(this.objs, px, py, maxDist);
    // Espacialização
    voicePool.updateSpatial(this.objs, px, py, pa, maxDist);
  },

  activeCount() { return this.objs.filter(o => o.active).length; },
  voiceCount()  { return this.objs.filter(o => o.synth !== null).length; },
  totalCount()  { return this.objs.length; }
};
