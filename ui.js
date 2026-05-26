// ═══════════════════════════════════════════════════════
// ui.js — Painel, temas visuais, mix, info page, tooltips
// It Looks Like Zimoun · NICS/UNICAMP · 2026
// ═══════════════════════════════════════════════════════

import { MATS, MAT_KEYS, world } from './world.js';
import { buildIR, setWetRatio, setMasterVolume } from './synth.js';
import { findHit } from './spatial.js';
import { THEMES, setTheme } from './sketch.js';

let panelVisible = true;
let mixTarget    = null;
let onPanelResize = null;

export function setPanelResizeCallback(fn) { onPanelResize = fn; }
export function isPanelVisible() { return panelVisible; }

// ── HUD ──────────────────────────────────────────────────
export function updateHUD(player, roomLabel) {
  document.getElementById('sa').textContent   = world.activeCount();
  document.getElementById('sv').textContent   = world.voiceCount();
  document.getElementById('st').textContent   = world.totalCount();
  document.getElementById('sp').textContent   = `${player.x.toFixed(1)},${player.y.toFixed(1)}`;
  document.getElementById('sd').textContent   = player.dir();
  document.getElementById('acount').textContent = world.activeCount();
  if (roomLabel) document.getElementById('sr').textContent = roomLabel;
}

// ── Panel toggle ─────────────────────────────────────────
export function togglePanel() {
  panelVisible = !panelVisible;
  document.getElementById('panel').classList.toggle('hidden', !panelVisible);
  const rr = panelVisible ? '200px' : '0';
  document.getElementById('hb').style.right       = rr;
  document.getElementById('fab-info').style.right = panelVisible ? '210px' : '18px';
  onPanelResize && onPanelResize();
}

// ── Init painel ──────────────────────────────────────────
export function initPanel(callbacks) {
  const { onGenerate } = callbacks;
  let targetN = 48;

  // Espaços acústicos
  document.querySelectorAll('.room-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.room-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      buildIR(btn.dataset.room);
      const labels = { anechoic:'ANECOICO', room:'SALA', stone:'PEDRA', corridor:'METAL', open:'ABERTO' };
      document.getElementById('sr').textContent = labels[btn.dataset.room] || btn.dataset.room.toUpperCase();
    });
  });

  document.getElementById('wetslider').addEventListener('input', function() {
    setWetRatio(this.value / 100);
    document.getElementById('wetval').textContent = this.value;
  });

  // Temas visuais
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setTheme(btn.dataset.theme);
      applyThemeToDOM(btn.dataset.theme);
    });
  });

  // Materiais
  document.querySelectorAll('.mbtn[data-mat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mat = btn.dataset.mat;
      btn.classList.toggle('active');
      if (btn.classList.contains('active')) world.enabled.add(mat);
      else world.enabled.delete(mat);
      world.objs.forEach(o => { if (o.mat === mat) o.setActive(world.enabled.has(mat)); });
    });
  });

  // Densidade — slider de 8 a 500
  const densSlider = document.getElementById('dens-slider');
  const densLabel  = document.getElementById('dval');
  densSlider.addEventListener('input', function() {
    targetN = parseInt(this.value);
    densLabel.textContent = targetN;
  });
  densSlider.addEventListener('change', function() {
    targetN = parseInt(this.value);
    densLabel.textContent = targetN;
    onGenerate && onGenerate(targetN);
  });

  document.getElementById('vslider').addEventListener('input', function() {
    setMasterVolume(this.value / 100);
    document.getElementById('vval').textContent = this.value;
  });

  document.getElementById('allon').addEventListener('click',
    () => world.objs.forEach(o => o.setActive(true)));
  document.getElementById('alloff').addEventListener('click',
    () => world.objs.forEach(o => o.setActive(false)));
}

// Aplicar variáveis CSS do tema ao DOM
function applyThemeToDOM(key) {
  const th = THEMES[key];
  if (!th) return;
  // Adaptar cores do painel ao tema
  const isLight = key === 'light' || key === 'white';
  const root = document.documentElement;
  if (isLight) {
    root.style.setProperty('--bg',   '#e8e4dc');
    root.style.setProperty('--s1',   '#d8d4cc');
    root.style.setProperty('--brd',  '#c0bcb4');
    root.style.setProperty('--brd2', '#a8a49c');
    root.style.setProperty('--tx',   '#282420');
    root.style.setProperty('--dim',  '#888078');
    root.style.setProperty('--acc',  '#181410');
    root.style.setProperty('--gold', '#806020');
    root.style.setProperty('--gold2','#a07828');
  } else if (key === 'cyan') {
    root.style.setProperty('--bg',   '#000a0e');
    root.style.setProperty('--s1',   '#001218');
    root.style.setProperty('--brd',  '#002830');
    root.style.setProperty('--brd2', '#003840');
    root.style.setProperty('--tx',   '#80d8d0');
    root.style.setProperty('--dim',  '#206860');
    root.style.setProperty('--acc',  '#c0f8f0');
    root.style.setProperty('--gold', '#00c8b0');
    root.style.setProperty('--gold2','#00f0d0');
  } else if (key === 'amber') {
    root.style.setProperty('--bg',   '#0a0600');
    root.style.setProperty('--s1',   '#180e00');
    root.style.setProperty('--brd',  '#301800');
    root.style.setProperty('--brd2', '#402000');
    root.style.setProperty('--tx',   '#d8a060');
    root.style.setProperty('--dim',  '#604010');
    root.style.setProperty('--acc',  '#f8d890');
    root.style.setProperty('--gold', '#c88020');
    root.style.setProperty('--gold2','#f0a030');
  } else {
    // dark (padrão)
    root.style.setProperty('--bg',   '#070706');
    root.style.setProperty('--s1',   '#0e0e0c');
    root.style.setProperty('--brd',  '#1c1c19');
    root.style.setProperty('--brd2', '#2a2a25');
    root.style.setProperty('--tx',   '#bab6aa');
    root.style.setProperty('--dim',  '#4a4740');
    root.style.setProperty('--acc',  '#e0d8c0');
    root.style.setProperty('--gold', '#c8a04a');
    root.style.setProperty('--gold2','#e8c070');
  }
}

// ── Mix Panel ────────────────────────────────────────────
export function openMixPanel(obj, sx, sy) {
  mixTarget = obj;
  const mp = document.getElementById('mixpanel');
  const pw = 210, H = window.innerHeight;
  const px = Math.min(sx + 20, window.innerWidth - pw - 10);
  const py = Math.max(Math.min(sy - 80, H - 180), 10);
  mp.style.left = px + 'px'; mp.style.top = py + 'px';
  mp.style.display = 'block';

  document.querySelectorAll('.mxsel').forEach((sel, i) => {
    sel.innerHTML = '<option value="">—</option>' +
      MAT_KEYS.map(k => `<option value="${k}">${MATS[k].label}</option>`).join('');
    sel.value = obj.recipe[i]?.mat || '';
  });
  document.querySelectorAll('.mxw').forEach((sl, i) => {
    sl.value = obj.recipe[i]?.weight || 0;
    document.querySelector(`.wpct[data-idx="${i}"]`).textContent =
      (obj.recipe[i]?.weight || 0) + '%';
  });
}

export function closeMixPanel() {
  document.getElementById('mixpanel').style.display = 'none';
  mixTarget = null;
}

export function initMixPanel() {
  function syncMix() {
    if (!mixTarget) return;
    const recipe = [];
    document.querySelectorAll('.mxsel').forEach((sel, i) => {
      const mat = sel.value;
      const w   = parseInt(document.querySelector(`.mxw[data-idx="${i}"]`).value) || 0;
      recipe.push({ mat, weight: w });
    });
    mixTarget.recipe = recipe;
    mixTarget.applyRecipe();
  }
  document.querySelectorAll('.mxsel').forEach(sel => sel.addEventListener('change', syncMix));
  document.querySelectorAll('.mxw').forEach(sl => {
    sl.addEventListener('input', function() {
      document.querySelector(`.wpct[data-idx="${this.dataset.idx}"]`).textContent =
        this.value + '%';
      syncMix();
    });
  });
  document.getElementById('mxclose').addEventListener('click', closeMixPanel);
}

// ── Info page ────────────────────────────────────────────
export function openInfo() {
  document.getElementById('infopage').classList.add('vis');
}
export function closeInfo() {
  document.getElementById('infopage').classList.remove('vis');
}
export function initInfoPage() {
  document.getElementById('fab-info').addEventListener('click', openInfo);
  document.getElementById('ip-close-btn').addEventListener('click', closeInfo);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.dataset.lang;
      document.querySelectorAll('.ip-content').forEach(c => {
        c.classList.toggle('vis', c.dataset.lang === lang);
      });
    });
  });
}

// ── Tooltips ─────────────────────────────────────────────
let tipTimer, freqTimer;

export function showTip(msg) {
  const el = document.getElementById('tip');
  el.textContent = msg; el.classList.add('vis');
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => el.classList.remove('vis'), 2200);
}

export function showFreqLabel(sx, sy, txt) {
  const el = document.getElementById('flbl');
  el.textContent = txt;
  el.style.left = sx + 'px'; el.style.top = (sy - 42) + 'px';
  el.classList.add('vis');
  clearTimeout(freqTimer);
  freqTimer = setTimeout(() => el.classList.remove('vis'), 1800);
}

// ── Scroll → frequência ──────────────────────────────────
export function handleScroll(deltaY, lastVisible, W, H) {
  const hit = findHit(lastVisible, W, H);
  if (!hit || !hit.obj.synth) return;
  const obj = hit.obj;
  const nm  = Math.max(0.25, Math.min(4, obj.freqMult * (deltaY > 0 ? 0.88 : 1.14)));
  obj.freqMult = nm;
  obj.synth.setFreqMult(nm);
  const st = (Math.log2(nm) * 12).toFixed(1);
  showFreqLabel(hit._cx, hit._cy, `${nm >= 1 ? '+' : ''}${st} st`);
}
