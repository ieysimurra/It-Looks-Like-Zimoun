// ═══════════════════════════════════════════════════════
// spatial.js — Player, controles de câmera, hit-test
// Dois modos: EXPLORAR (câmera ativa) | PAUSA (painel acessível)
// It Looks Like Zimoun · NICS/UNICAMP · 2026
// ═══════════════════════════════════════════════════════

import { WORLD_SIZE } from './world.js';

const PSPEED = 0.045;
const RSPEED = 0.0022;

// ── Player ──────────────────────────────────────────────
export const player = {
  x: WORLD_SIZE / 2,
  y: WORLD_SIZE / 2,
  angle: 0,
  keys: { w: false, s: false, a: false, d: false },

  update() {
    const c = Math.cos(this.angle), s = Math.sin(this.angle);
    let nx = this.x, ny = this.y;
    if (this.keys.w) { nx += c*PSPEED; ny += s*PSPEED; }
    if (this.keys.s) { nx -= c*PSPEED; ny -= s*PSPEED; }
    if (this.keys.a) { nx += s*PSPEED*0.6; ny -= c*PSPEED*0.6; }
    if (this.keys.d) { nx -= s*PSPEED*0.6; ny += c*PSPEED*0.6; }
    const m = 0.5;
    this.x = Math.max(m, Math.min(WORLD_SIZE - m, nx));
    this.y = Math.max(m, Math.min(WORLD_SIZE - m, ny));
  },

  dir() {
    const a = ((this.angle * 180 / Math.PI) % 360 + 360) % 360;
    return ['E','NE','N','NO','O','SO','S','SE'][Math.round(a / 45) % 8];
  }
};

// ── Estado de câmera ─────────────────────────────────────
let pointerLocked = false;
let paused        = false;   // TRUE = painel acessível, câmera parada
let lastMouseX    = null;
let mouseDown     = false;

export function isLocked()  { return pointerLocked; }
export function isPaused()  { return paused; }

// Callbacks externos
let _onPauseChange = null;
export function setOnPauseChange(fn) { _onPauseChange = fn; }

function setPaused(v) {
  paused = v;
  _onPauseChange && _onPauseChange(paused);
  if (paused) {
    // Liberar pointer lock para acessar o painel
    if (document.pointerLockElement) document.exitPointerLock();
  }
}

export function togglePause() { setPaused(!paused); }
export function enterExplore() { setPaused(false); }
export function enterPause()   { setPaused(true); }

// ── Drag de pêndulo ──────────────────────────────────────
let drag = {
  active: false, obj: null,
  startX: 0, startY: 0,
  startT: 0, lastX: 0, totalDx: 0
};
export function getDrag() { return drag; }

function startDrag(lastVisible, W, H) {
  const hit = findHit(lastVisible, W, H);
  if (!hit) return;
  drag = {
    active: true, obj: hit.obj,
    startX: W/2, startY: H/2,
    startT: performance.now(),
    lastX: W/2, totalDx: 0
  };
}

function moveDrag(dxPx) {
  if (!drag.active || !drag.obj) return;
  drag.obj.dragging = true;
  drag.obj.pend.angle += dxPx * 0.0042;
  drag.obj.pend.vel    = 0;
  drag.obj.dragVx      = dxPx;
  drag.lastX          += dxPx;
  drag.totalDx        += Math.abs(dxPx);
}

function endDrag(onToggle, onLaunch) {
  if (!drag.active) return;
  const dur   = performance.now() - drag.startT;
  const obj   = drag.obj;
  if (obj) {
    obj.dragging = false;
    if (dur < 250 && drag.totalDx < 10) {
      obj.toggle();
      onToggle && onToggle(obj);
    } else {
      obj.pend.vel = obj.dragVx * 0.011;
      onLaunch && onLaunch(obj);
    }
  }
  drag = { active:false, obj:null, startX:0, startY:0, startT:0, lastX:0, totalDx:0 };
}

// ── Hit-test (crosshair central) ─────────────────────────
export function findHit(lastVisible, W, H) {
  const cx = W/2, cy = H/2, tol = 62;
  let best = null, bd = Infinity;
  for (const v of lastVisible) {
    if (v._cx === undefined) continue;
    const dx = cx - v._cx, dy = cy - v._cy;
    const d  = Math.sqrt(dx*dx + dy*dy);
    if (d < Math.max(tol, v._sz * 1.3) && d < bd) { bd = d; best = v; }
  }
  return best;
}

// ── Registro de eventos ──────────────────────────────────
export function registerControls(canvas, callbacks) {
  const { onToggle, onLaunch, onScroll, onMix,
          onPanel, onInfo, getVisible, getW, getH } = callbacks;

  // ─ Pointer Lock ──────────────────────────────────────
  document.addEventListener('pointerlockchange', () => {
    pointerLocked = !!document.pointerLockElement;
    // Se o browser liberou o lock por ESC, entrar em pausa automaticamente
    if (!pointerLocked && !paused) {
      setPaused(true);
    }
  });

  // ─ Teclado ───────────────────────────────────────────
  document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();

    // Tab ou P: toggle entre explorar e pausar
    if (k === 'tab' || k === 'p') {
      e.preventDefault();
      togglePause();
      return;
    }

    // ESC: entrar em pausa (o browser também libera o pointer lock)
    if (k === 'escape') {
      if (!paused) setPaused(true);
      return;
    }

    // Teclas de navegação só funcionam no modo explorar
    if (!paused) {
      if (k==='w'||k==='arrowup')    player.keys.w = true;
      if (k==='s'||k==='arrowdown')  player.keys.s = true;
      if (k==='a'||k==='arrowleft')  player.keys.a = true;
      if (k==='d'||k==='arrowright') player.keys.d = true;
    }

    // Atalhos globais (funcionam em qualquer modo)
    if (k==='h') onPanel && onPanel();
    if (k==='i') onInfo  && onInfo();
    if (k==='m') {
      const hit = findHit(getVisible(), getW(), getH());
      if (hit) {
        setPaused(true);
        setTimeout(() => onMix && onMix(hit.obj, getW()/2, getH()/2), 60);
      }
    }
  });

  document.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    // Sempre soltar teclas para não ficar "preso"
    if (k==='w'||k==='arrowup')    player.keys.w = false;
    if (k==='s'||k==='arrowdown')  player.keys.s = false;
    if (k==='a'||k==='arrowleft')  player.keys.a = false;
    if (k==='d'||k==='arrowright') player.keys.d = false;
  });

  // ─ Mouse: movimento ──────────────────────────────────
  document.addEventListener('mousemove', e => {
    // Só rotaciona câmera no modo explorar
    if (paused) return;

    if (pointerLocked) {
      player.angle += e.movementX * RSPEED;
      if (drag.active) moveDrag(e.movementX);
    } else {
      // Fallback: arrastar com botão pressionado
      if (!mouseDown) { lastMouseX = e.clientX; return; }
      if (lastMouseX !== null) {
        const dx = e.clientX - lastMouseX;
        if (drag.active) moveDrag(dx);
        else player.angle += dx * RSPEED;
      }
      lastMouseX = e.clientX;
    }
  });

  // ─ Click no canvas: SEMPRE retoma exploração ────────
  // (exceto se o clique foi no painel ou em overlays)
  canvas.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    mouseDown  = true;
    lastMouseX = e.clientX;

    // Clique no canvas → sair do modo pausa e retomar exploração
    if (paused) {
      setPaused(false);
      canvas.requestPointerLock().catch(() => {});
      return; // não inicia drag neste clique — é o clique de retomada
    }

    if (!pointerLocked) {
      canvas.requestPointerLock().catch(() => {});
    }
    startDrag(getVisible(), getW(), getH());
  });

  document.addEventListener('mouseup', e => {
    if (e.button !== 0) return;
    mouseDown = false;
    if (!paused) endDrag(onToggle, onLaunch);
  });

  canvas.addEventListener('mouseleave', () => {
    if (!pointerLocked) {
      mouseDown  = false;
      lastMouseX = null;
    }
  });

  // ─ Scroll ────────────────────────────────────────────
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    if (!paused) onScroll && onScroll(e.deltaY, getVisible(), getW(), getH());
  }, { passive: false });

  // ─ Touch ─────────────────────────────────────────────
  let touchX = null;
  canvas.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    if (paused) { setPaused(false); return; }
    startDrag(getVisible(), getW(), getH());
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    if (paused || touchX === null) return;
    const dx = e.touches[0].clientX - touchX;
    if (drag.active) moveDrag(dx);
    else player.angle += dx * RSPEED;
    touchX = e.touches[0].clientX;
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    if (!paused) endDrag(onToggle, onLaunch);
    touchX = null;
  }, { passive: true });
}
