// ═══════════════════════════════════════════════════════
// sketch.js — Raycaster 3D, Minimap, Temas visuais
// It Looks Like Zimoun · NICS/UNICAMP · 2026
// ═══════════════════════════════════════════════════════

import { MATS, WORLD_SIZE } from './world.js';

export const FOV  = Math.PI / 3;
export const HFOV = FOV / 2;

// ── Temas visuais ────────────────────────────────────────
export const THEMES = {
  dark: {
    label: 'ESCURO',
    sky1: '#020202', sky2: '#0d0d0b',
    floor1: '#0b0b09', floor2: '#040403',
    horizon: 'rgba(38,36,30,.22)',
    mmBg: 'rgba(7,7,6,.84)', mmBorder: 'rgba(72,67,55,.35)',
    mmGrid: 'rgba(255,255,255,.035)',
    mmPlayer: 'rgba(224,216,192,.95)', mmArrow: 'rgba(200,160,74,.9)',
    mmAura: ['rgba(200,160,74,.07)','rgba(200,160,74,0)'],
    mmFov: 'rgba(224,216,192,.07)', mmLabel: 'rgba(90,86,72,.75)',
    mmEdge: 'rgba(200,160,74,.14)',
    ropeAlpha: 0.45, haloAlpha: 0.17, shapeAlpha: 0.88,
    anchorAlpha: 0.5,
    crosshair: 'rgba(224,216,192,.5)',
  },
  light: {
    label: 'CLARO',
    sky1: '#e8e4dc', sky2: '#d0ccc0',
    floor1: '#c8c4b8', floor2: '#b8b4a8',
    horizon: 'rgba(80,76,68,.25)',
    mmBg: 'rgba(240,236,228,.9)', mmBorder: 'rgba(140,132,112,.5)',
    mmGrid: 'rgba(0,0,0,.06)',
    mmPlayer: 'rgba(40,35,25,.9)', mmArrow: 'rgba(140,100,30,.9)',
    mmAura: ['rgba(140,100,30,.09)','rgba(140,100,30,0)'],
    mmFov: 'rgba(40,35,25,.08)', mmLabel: 'rgba(120,112,90,.8)',
    mmEdge: 'rgba(140,100,30,.2)',
    ropeAlpha: 0.55, haloAlpha: 0.22, shapeAlpha: 0.90,
    anchorAlpha: 0.6,
    crosshair: 'rgba(40,35,25,.5)',
  },
  cyan: {
    label: 'CIANO',
    sky1: '#000a0e', sky2: '#001418',
    floor1: '#00100e', floor2: '#000806',
    horizon: 'rgba(0,200,180,.15)',
    mmBg: 'rgba(0,10,14,.88)', mmBorder: 'rgba(0,160,140,.3)',
    mmGrid: 'rgba(0,200,180,.04)',
    mmPlayer: 'rgba(0,255,220,.95)', mmArrow: 'rgba(0,220,180,.9)',
    mmAura: ['rgba(0,200,160,.09)','rgba(0,200,160,0)'],
    mmFov: 'rgba(0,220,180,.07)', mmLabel: 'rgba(0,160,140,.8)',
    mmEdge: 'rgba(0,200,160,.18)',
    ropeAlpha: 0.5, haloAlpha: 0.20, shapeAlpha: 0.90,
    anchorAlpha: 0.55,
    crosshair: 'rgba(0,255,220,.55)',
    tint: [0, 60, 50],   // deslocamento de cor RGB aplicado ao emit
  },
  amber: {
    label: 'ÂMBAR',
    sky1: '#0a0600', sky2: '#180e00',
    floor1: '#140a00', floor2: '#0a0500',
    horizon: 'rgba(200,120,0,.18)',
    mmBg: 'rgba(10,6,0,.88)', mmBorder: 'rgba(160,90,0,.35)',
    mmGrid: 'rgba(200,120,0,.04)',
    mmPlayer: 'rgba(255,200,80,.95)', mmArrow: 'rgba(220,150,40,.9)',
    mmAura: ['rgba(200,120,0,.09)','rgba(200,120,0,0)'],
    mmFov: 'rgba(220,150,40,.07)', mmLabel: 'rgba(160,90,0,.8)',
    mmEdge: 'rgba(200,120,0,.18)',
    ropeAlpha: 0.5, haloAlpha: 0.20, shapeAlpha: 0.90,
    anchorAlpha: 0.55,
    crosshair: 'rgba(255,200,80,.55)',
    tint: [60, 20, -40],
  },
  white: {
    label: 'BRANCO',
    sky1: '#f4f2ee', sky2: '#e4e0d8',
    floor1: '#dedad2', floor2: '#ccc8c0',
    horizon: 'rgba(60,55,48,.18)',
    mmBg: 'rgba(248,244,238,.92)', mmBorder: 'rgba(100,95,85,.35)',
    mmGrid: 'rgba(0,0,0,.04)',
    mmPlayer: 'rgba(20,18,14,.9)', mmArrow: 'rgba(80,60,20,.9)',
    mmAura: ['rgba(80,60,20,.08)','rgba(80,60,20,0)'],
    mmFov: 'rgba(20,18,14,.06)', mmLabel: 'rgba(100,95,85,.75)',
    mmEdge: 'rgba(80,60,20,.18)',
    ropeAlpha: 0.4, haloAlpha: 0.15, shapeAlpha: 0.80,
    anchorAlpha: 0.45,
    crosshair: 'rgba(20,18,14,.45)',
  },
};

let currentTheme = THEMES.dark;
export function setTheme(key) { currentTheme = THEMES[key] || THEMES.dark; }
export function getTheme() { return currentTheme; }

// ── Utilitários ──────────────────────────────────────────
function getRopePts(x1, y1, x2, y2, segs, sag) {
  const pts = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    pts.push({ x: x1+(x2-x1)*t, y: y1+(y2-y1)*t + Math.sin(t*Math.PI)*sag });
  }
  return pts;
}

function drawShape(ctx, shape, cx, cy, sz, filled) {
  ctx.beginPath();
  switch (shape) {
    case 'circle':  ctx.arc(cx, cy, sz*0.52, 0, Math.PI*2); break;
    case 'square': { const s=sz*0.43; ctx.rect(cx-s,cy-s,s*2,s*2); break; }
    case 'diamond':
      ctx.moveTo(cx,cy-sz*.58); ctx.lineTo(cx+sz*.42,cy);
      ctx.lineTo(cx,cy+sz*.58); ctx.lineTo(cx-sz*.42,cy); ctx.closePath(); break;
    case 'triangle':
      ctx.moveTo(cx,cy-sz*.58); ctx.lineTo(cx+sz*.5,cy+sz*.38);
      ctx.lineTo(cx-sz*.5,cy+sz*.38); ctx.closePath(); break;
    case 'hexagon':
      for (let i=0;i<6;i++){
        const a=i*Math.PI/3-Math.PI/6;
        i===0?ctx.moveTo(cx+Math.cos(a)*sz*.5,cy+Math.sin(a)*sz*.5)
             :ctx.lineTo(cx+Math.cos(a)*sz*.5,cy+Math.sin(a)*sz*.5);
      }
      ctx.closePath(); break;
  }
  if (filled) ctx.fill();
  ctx.stroke();
}

// Aplica tint do tema à cor do material
function tintColor(rgb, active) {
  const t = currentTheme.tint;
  if (!t) return rgb;
  return [
    Math.max(0, Math.min(255, rgb[0] + t[0])),
    Math.max(0, Math.min(255, rgb[1] + t[1])),
    Math.max(0, Math.min(255, rgb[2] + t[2])),
  ];
}

// ── Render principal ────────────────────────────────────
export function render(ctx, W, H, t, player, objs, maxDist) {
  const hH = H / 2;
  const th = currentTheme;

  // Fundo
  const sky = ctx.createLinearGradient(0,0,0,hH);
  sky.addColorStop(0, th.sky1); sky.addColorStop(1, th.sky2);
  ctx.fillStyle = sky; ctx.fillRect(0,0,W,hH);

  const fl = ctx.createLinearGradient(0,hH,0,H);
  fl.addColorStop(0, th.floor1); fl.addColorStop(1, th.floor2);
  ctx.fillStyle = fl; ctx.fillRect(0,hH,W,hH);

  ctx.fillStyle = th.horizon; ctx.fillRect(0,hH-1,W,2);

  // Coletar objetos visíveis
  const vis = [];
  for (const obj of objs) {
    const dx = obj.x - player.x, dy = obj.y - player.y;
    const dist = obj._dist !== undefined ? obj._dist : Math.sqrt(dx*dx+dy*dy);
    if (dist > maxDist + 4) continue;
    let ang = Math.atan2(dy,dx) - player.angle;
    while (ang < -Math.PI) ang += Math.PI*2;
    while (ang >  Math.PI) ang -= Math.PI*2;
    if (Math.abs(ang) > HFOV + 0.4) continue;
    const screenX = ((ang/FOV)+0.5)*W;
    const projH   = (H/(dist+0.001))*1.15;
    vis.push({ obj, dist, screenX, projH, pulse: obj.pulse(t) });
  }
  vis.sort((a,b) => b.dist - a.dist);

  for (const v of vis) {
    const { obj, dist, screenX, projH, pulse } = v;
    const fade  = Math.pow(1 - Math.min(1, dist/maxDist), 1.65);
    const alpha = obj.active ? fade : fade * 0.15;
    if (alpha < 0.01) continue;

    const domRec = obj.recipe.reduce((a,b) => b.weight>a.weight?b:a, obj.recipe[0]);
    const mat    = MATS[domRec.mat] || MATS.paper;
    let [r,g,b2] = obj.active ? tintColor(mat.em) : tintColor(mat.col);

    const pendOffX = obj.pend.tipX() * (projH*0.33);
    const pendOffY = obj.pend.tipY() * (projH*0.10);
    const cx = screenX + pendOffX;
    const cy = hH + pendOffY;
    const sz = (projH*0.42*pulse) * (obj.baseSize/22);
    const ancX = screenX, ancY = hH - projH*0.28;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Corda
    const rpts = getRopePts(ancX,ancY,cx,cy, Math.min(9, Math.ceil(projH/20)), projH*0.042);
    ctx.strokeStyle = `rgba(${r},${g},${b2},${obj.active?th.ropeAlpha:th.ropeAlpha*0.35})`;
    ctx.lineWidth   = Math.max(0.4, projH*0.012);
    ctx.beginPath(); ctx.moveTo(rpts[0].x,rpts[0].y);
    for (let i=1;i<rpts.length;i++) ctx.lineTo(rpts[i].x,rpts[i].y);
    ctx.stroke();

    // Âncora
    if (obj.active && projH > 20) {
      ctx.fillStyle = `rgba(${r},${g},${b2},${th.anchorAlpha})`;
      ctx.beginPath(); ctx.arc(ancX,ancY,2,0,Math.PI*2); ctx.fill();
    }

    // Halo — apenas para objetos próximos (otimização)
    if (obj.active && dist < maxDist*0.7) {
      const haloR = sz * 2.6;
      const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,haloR);
      grd.addColorStop(0, `rgba(${r},${g},${b2},${th.haloAlpha})`);
      grd.addColorStop(1, `rgba(${r},${g},${b2},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx,cy,haloR,0,Math.PI*2); ctx.fill();
    }

    // Anel de mistura
    const activeMats = obj.recipe.filter(rm => rm.weight>0 && rm.mat);
    if (activeMats.length > 1 && obj.active && sz > 6) {
      const total = activeMats.reduce((s,rm) => s+rm.weight, 0);
      let startA = 0;
      for (const rm of activeMats) {
        const mat2 = MATS[rm.mat]; if (!mat2) continue;
        const col2 = tintColor(mat2.em);
        const span = (rm.weight/total)*Math.PI*2;
        ctx.strokeStyle = `rgba(${col2[0]},${col2[1]},${col2[2]},.65)`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx,cy,sz*0.62,startA,startA+span); ctx.stroke();
        startA += span;
      }
    }

    // Forma
    ctx.fillStyle   = obj.active ? `rgb(${r},${g},${b2})` : 'transparent';
    ctx.strokeStyle = `rgba(${r},${g},${b2},${obj.active?th.shapeAlpha:0.35})`;
    ctx.lineWidth   = Math.max(0.8, projH*0.012);
    drawShape(ctx, mat.shape, cx, cy, sz, obj.active);

    ctx.restore();
    v._cx = cx; v._cy = cy; v._sz = sz;
  }

  return vis;
}

// ── Minimap ──────────────────────────────────────────────
export function drawMinimap(ctx, W, H, player, objs, maxDist) {
  const SZ=155, MG=16;
  const ox=MG, oy=H-MG-SZ;
  const sc=SZ/WORLD_SIZE;
  const th=currentTheme;

  ctx.fillStyle   = th.mmBg;
  ctx.strokeStyle = th.mmBorder; ctx.lineWidth=1;
  ctx.beginPath(); ctx.rect(ox,oy,SZ,SZ); ctx.fill(); ctx.stroke();

  ctx.strokeStyle = th.mmGrid; ctx.lineWidth=0.5;
  for (let i=8;i<WORLD_SIZE;i+=8){
    ctx.beginPath(); ctx.moveTo(ox+i*sc,oy); ctx.lineTo(ox+i*sc,oy+SZ); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox,oy+i*sc); ctx.lineTo(ox+SZ,oy+i*sc); ctx.stroke();
  }

  // Objetos — para muitos, usar pontos menores
  const dotSize = objs.length > 100 ? 1.4 : 2.2;
  for (const obj of objs) {
    const mx=ox+obj.x*sc, my=oy+obj.y*sc;
    const mat=MATS[obj.mat]||MATS.paper;
    const [r,g,b]=tintColor(obj.active?mat.em:mat.col);
    ctx.fillStyle=obj.active?`rgba(${r},${g},${b},.88)`:`rgba(${r},${g},${b},.18)`;
    ctx.beginPath(); ctx.arc(mx,my,obj.active?dotSize:dotSize*0.7,0,Math.PI*2); ctx.fill();
  }

  const px=ox+player.x*sc, py=oy+player.y*sc;
  const hr=maxDist*sc;
  const grd=ctx.createRadialGradient(px,py,0,px,py,hr);
  grd.addColorStop(0, th.mmAura[0]); grd.addColorStop(1, th.mmAura[1]);
  ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(px,py,hr,0,Math.PI*2); ctx.fill();

  ctx.fillStyle=th.mmFov;
  ctx.beginPath(); ctx.moveTo(px,py);
  ctx.arc(px,py,30*sc,player.angle-HFOV,player.angle+HFOV);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle=th.mmPlayer;
  ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=th.mmArrow; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(px,py);
  ctx.lineTo(px+Math.cos(player.angle)*8, py+Math.sin(player.angle)*8); ctx.stroke();

  ctx.fillStyle=th.mmLabel;
  ctx.font='5.5px IBM Plex Mono,monospace';
  ctx.fillText('PLANTA', ox+4, oy+SZ-5);

  ctx.strokeStyle=th.mmEdge; ctx.lineWidth=1;
  ctx.beginPath(); ctx.rect(ox,oy,SZ,SZ); ctx.stroke();
}

// Exportar cor do crosshair para o CSS do index.html usar
export function getCrosshairColor() { return currentTheme.crosshair; }
