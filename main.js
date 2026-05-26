// ═══════════════════════════════════════════════════════
// main.js — Orquestrador principal
// It Looks Like Zimoun · NICS/UNICAMP · 2026
// ═══════════════════════════════════════════════════════

import { initAudio, buildIR }          from './synth.js';
import { world, MATS }                 from './world.js';
import { render, drawMinimap, THEMES } from './sketch.js';
import { player, registerControls, findHit,
         setOnPauseChange, enterExplore, isPaused } from './spatial.js';
import { updateHUD, togglePanel, initPanel, initMixPanel,
         initInfoPage, openMixPanel, openInfo, closeInfo,
         showTip, handleScroll,
         isPanelVisible, setPanelResizeCallback } from './ui.js';

// ── Canvas ───────────────────────────────────────────────
const canvas = document.getElementById('cvs');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth  - (isPanelVisible() ? 200 : 0);
  H = canvas.height = window.innerHeight;
}
setPanelResizeCallback(resize);
window.addEventListener('resize', resize);

// ── Estado ───────────────────────────────────────────────
let started     = false;
let lastVisible = [];
let maxDist     = 14;

const ROOM_LABELS = {
  anechoic:'ANECOICO', room:'SALA', stone:'PEDRA',
  corridor:'METAL', open:'ABERTO'
};
let currentRoomLabel = 'PEDRA';

// ── Elementos de modo ────────────────────────────────────
const modeBadge   = document.getElementById('mode-badge');
const pauseOverlay = document.getElementById('pause-overlay');
const xhair       = document.getElementById('xh');

function applyModeUI(paused) {
  if (paused) {
    canvas.style.cursor   = 'default';
    xhair.style.display   = 'none';
    pauseOverlay.classList.add('vis');
    modeBadge.textContent = '';
  } else {
    canvas.style.cursor   = 'crosshair';
    xhair.style.display   = 'block';
    pauseOverlay.classList.remove('vis');
    modeBadge.textContent = 'TAB · pausar e abrir painel';
  }
  // Notifica o indicador de modo no painel
  document.dispatchEvent(new CustomEvent('pausechange', { detail: paused }));
}

// Registrar callback de troca de modo
setOnPauseChange(applyModeUI);

// ── Loop ─────────────────────────────────────────────────
function loop(t) {
  requestAnimationFrame(loop);
  if (!started) return;

  // Física e áudio continuam mesmo em pausa (pêndulos continuam)
  if (!isPaused()) player.update();
  world.updateAll(player.x, player.y, player.angle, maxDist);

  ctx.clearRect(0, 0, W, H);
  lastVisible = render(ctx, W, H, t * 0.001, player, world.objs, maxDist);
  drawMinimap(ctx, W, H, player, world.objs, maxDist);
  updateHUD(player, currentRoomLabel);
}

// ── Controles ────────────────────────────────────────────
registerControls(canvas, {
  getVisible: () => lastVisible,
  getW: () => W,
  getH: () => H,

  onToggle: (obj) => {
    const label = MATS[obj.mat]?.label || obj.mat;
    showTip(obj.active ? `${label} — ativo` : `${label} — silenciado`);
  },
  onLaunch: () => showTip('lançado'),

  onScroll: (deltaY, vis, w, h) => handleScroll(deltaY, vis, w, h),

  onMix: (obj, sx, sy) => openMixPanel(obj, sx, sy),

  onPanel: () => togglePanel(),

  onInfo: () => {
    const ip = document.getElementById('infopage');
    if (ip.classList.contains('vis')) closeInfo();
    else openInfo();
  },
});

// Clique no botão "Retomar" do overlay de pausa
document.getElementById('btn-resume').addEventListener('click', () => {
  enterExplore();
  canvas.requestPointerLock().catch(() => {});
});

// ── Distância ────────────────────────────────────────────
document.getElementById('dslider').addEventListener('input', function() {
  maxDist = parseInt(this.value);
  document.getElementById('distval').textContent = maxDist;
});

// ── UI ───────────────────────────────────────────────────
initPanel({
  onGenerate: (n) => { world.gen(n); },
});
initMixPanel();
initInfoPage();

// ── Início ───────────────────────────────────────────────
document.getElementById('sbtn').addEventListener('click', () => {
  initAudio();
  world.gen(48);

  document.getElementById('entry').style.display = 'none';
  ['ht','panel','hb'].forEach(id => document.getElementById(id).style.display = 'flex');
  document.getElementById('fab-info').style.display  = 'flex';
  document.getElementById('mode-badge').style.display = 'block';

  started = true;
  resize();

  // Iniciar em modo explorar
  applyModeUI(false);
  canvas.requestPointerLock().catch(() => {});
  requestAnimationFrame(loop);
});

// ── Esconder HUD inicial ─────────────────────────────────
['ht','panel','hb'].forEach(id => document.getElementById(id).style.display = 'none');
document.getElementById('fab-info').style.display    = 'none';
document.getElementById('mode-badge').style.display  = 'none';
resize();
