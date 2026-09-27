// Shared parts for FrictionClear: constants and friction data, chart boards, arrows that point
// anywhere, a spring scale, rough surfaces for the close-ups, and simple models (person, car, road).
// Scenes are built in metres unless a chapter says otherwise: +x to the right, +y up, +z towards you.
// Boards, arrows, the spring scale, people and cars follow ForceClear and MomentumClear (same kit).
import { THREE, M, box, beam, sphere, torus, arrow, canvasTexture, clamp, lerp, smooth, approach } from './kit.js';

// ---------------------------------------------------------------- constants
export const G = 9.81;                 // m/s², standard gravity (9.80665)
export const KMH = 3.6;                // 1 m/s = 3.6 km/h
export const TAU = Math.PI * 2;
export const D2R = Math.PI / 180;
export const RHO_AIR = 1.2;            // kg/m³, air near 20 °C at sea level

// Coefficients of friction, dry and clean, at room temperature. They vary a lot with the exact
// surfaces, so treat them as typical values.
// Wood on wood: μs 0.25–0.62, μk 0.32–0.48 (Wikipedia "Friction", table of coefficients; Serway,
//   Physics for Scientists and Engineers, Table 5.1, μs 0.25–0.5, μk 0.2). We use 0.45 and 0.30.
// Rubber on concrete or asphalt: μs 1.0, μk 0.8 (Serway Table 5.1; Wikipedia gives μk 0.6–0.85).
// Steel on ice: μs 0.03 (Wikipedia table). Sliding steel on ice near −7 °C is about 0.01–0.02
//   (Weber et al., J. Phys. Chem. Lett. 9, 2838, 2018). We use μk 0.02.
// PTFE (Teflon) on PTFE: μs 0.04, μk 0.04 (Wikipedia table; Serway). No stick-slip, because μs = μk.
// Steel on steel, clean and dry: μs 0.74–0.80, μk 0.42–0.62 (Wikipedia table). We use 0.74 and 0.57.
export const SURF = {
  wood: { name: 'Wood on wood', us: 0.45, uk: 0.30, top: 0xc8995a, blk: 0xa8743e, rough: 0.8 },
  rubber: { name: 'Rubber on tar', us: 1.0, uk: 0.8, top: 0x2b2f36, blk: 0x1b1d22, rough: 1.0 },
  ice: { name: 'Steel on ice', us: 0.03, uk: 0.02, top: 0xcfe8ff, blk: 0xb9bec8, rough: 0.25 },
  teflon: { name: 'Teflon on Teflon', us: 0.04, uk: 0.04, top: 0xf2f4f7, blk: 0xe4e7ec, rough: 0.35 },
  steel: { name: 'Steel on steel', us: 0.74, uk: 0.57, top: 0x9aa3b2, blk: 0xc9ced8, rough: 0.5 },
};
export const SURF_KEYS = ['wood', 'rubber', 'ice', 'teflon'];

// Stopping distance on a level road with steady braking at μ g: d = v² ÷ (2 μ g).
export const brakeDist = (v, mu) => (v * v) / (2 * Math.max(1e-4, mu) * G);

// ---------------------------------------------------------------- formatting
export const fmt = (v, d = 1) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('en-IN') : v.toFixed(d));
export function fmtN(F, big = 1e4) {
  const a = Math.abs(F), s = F < 0 ? '−' : '';
  if (a >= 1e6) return s + (a / 1e6).toFixed(a >= 1e7 ? 0 : 1) + ' MN';
  if (a >= big) return s + (a / 1000).toFixed(a >= 1e5 ? 0 : 1) + ' kN';
  if (a >= 100) return s + Math.round(a).toLocaleString('en-IN') + ' N';
  if (a >= 10) return s + a.toFixed(0) + ' N';
  return s + a.toFixed(a >= 1 ? 1 : 2) + ' N';
}
export const fmtM = (m) => (m >= 1000 ? (m / 1000).toFixed(2) + ' km' : m >= 100 ? m.toFixed(0) + ' m' : m.toFixed(1) + ' m');
export const fmtW = (p) => (p >= 1000 ? (p / 1000).toFixed(1) + ' kW' : p >= 10 ? p.toFixed(0) + ' W' : p >= 0.1 ? p.toFixed(2) + ' W' : (p * 1000).toFixed(1) + ' mW');

// ---------------------------------------------------------------- boards
export const COL = { pull: '#8ef0ff', fric: '#ff7a59', normal: '#7be08c', weight: '#c49bff', static: '#ffb547', kinetic: '#ff5a8a', soft: 'rgba(255,255,255,.55)', dim: 'rgba(255,255,255,.4)', good: '#5ce1a9', warn: '#ff7a59' };
export const HEX = { pull: 0x8ef0ff, fric: 0xff7a59, normal: 0x7be08c, weight: 0xc49bff, static: 0xffb547, kinetic: 0xff5a8a, good: 0x5ce1a9 };
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.9)'; g.fillRect(0, 0, w, h); }
export function board(root, w, h, pxW, pxH, draw, pos) {
  const tex = canvasTexture(pxW, pxH, draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex.tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return Object.assign(tex, { mesh: m });
}
export function title(g, text, sub = '', x = 20) {
  g.fillStyle = '#e8eef8'; g.font = 'bold 24px sans-serif'; g.fillText(text, x, 34);
  if (sub) { g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(sub, x, 58); }
}
// Axes with a grid. Returns X(x) and Y(y) for the plot area.
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '' }) {
  const X = (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '19px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '18px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 52);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function line(g, pts, X, Y, col, wdt = 5, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function tag(g, text, x, y, col, font = 'bold 19px sans-serif', w = null) {
  g.font = font; g.fillStyle = col;
  const tw = g.measureText(text).width;
  g.fillText(text, w ? Math.min(x, w - tw - 12) : x, y);
}
// Horizontal bars: rows = [{ label, v, col, on, text }], scaled to max.
export function hbars(g, rows, { x0 = 220, x1, y0 = 90, dy = 58, max, bh = 30 }) {
  rows.forEach((r, i) => {
    const y = y0 + i * dy, wd = clamp(r.v / max, 0, 1) * (x1 - x0);
    g.font = `${r.on ? 'bold ' : ''}19px sans-serif`; g.fillStyle = r.on ? '#fff' : 'rgba(255,255,255,.65)';
    g.fillText(r.label, 20, y + bh * 0.72);
    g.globalAlpha = r.on ? 1 : 0.45; g.fillStyle = r.col; g.fillRect(x0, y, Math.max(4, wd), bh); g.globalAlpha = 1;
    if (r.v > max) { g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; g.fillText('»', x1 - 18, y + bh * 0.75); }
    g.font = 'bold 17px sans-serif'; g.fillStyle = '#e8eef8';
    const t = r.text ?? String(r.v), tw = g.measureText(t).width;
    g.fillText(t, Math.min(x0 + wd + 10, x1 - tw), wd > x1 - x0 - tw - 14 ? y - 6 : y + bh * 0.72);
  });
}

// ---------------------------------------------------------------- stage helpers
export const inReel = () => document.body.classList.contains('gb-reel');
// On a phone-width stage: hide the minor labels and nudge the picture down, clear of the readout.
export function fitNarrow(stage, minor = []) {
  const narrow = stage.host.clientWidth < 560;
  minor.forEach((l) => { if (l) l.visible = !narrow; });
  const y = narrow && !inReel() ? -0.12 : 0;
  if (!stage.shift || stage.shift[1] !== y) stage.setShift(0, y);
  return narrow;
}
// Switch the camera when a chapter's "Look at" choice changes (not while the reel is recording).
export function focusView(stage, st, focus, views) {
  if (focus === st.focus) return false;
  if (st.focus !== undefined && !inReel()) stage.setView(views[focus].pos, views[focus].target, 1.0);
  st.focus = focus;
  return true;
}
// Deterministic pseudo-random numbers so every run (and every video frame) looks the same.
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ---------------------------------------------------------------- arrows
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3();
// A kit arrow that can point any way and draws over the model: aim(from, dir, len).
export function force(color, r = 0.03, head = 0.16) {
  const a = arrow(color, 1, head, r);
  a.renderOrder = 10;
  a.traverse((o) => { if (o.material) { o.material.depthTest = false; o.material.transparent = true; o.renderOrder = 10; } });
  a.aim = (from, dir, len) => {
    a.position.set(...from);
    tmpV.set(...dir); if (tmpV.lengthSq() < 1e-9) tmpV.set(1, 0, 0);
    a.quaternion.setFromUnitVectors(UP, tmpV.normalize());
    a.set(Math.max(0.001, len));
    if (len < 0.03) a.visible = false;
  };
  return a;
}

// ---------------------------------------------------------------- springs and scales
// A helical spring along +Y from its origin. setLength(L) re-shapes the same mesh every frame.
export function makeCoil({ turns = 10, R = 0.05, r = 0.007, mat, seg = 16, rs = 6 } = {}) {
  const N = turns * seg + 1;
  const pos = new Float32Array(N * rs * 3), nor = new Float32Array(N * rs * 3), idx = [];
  for (let i = 0; i < N - 1; i++) for (let j = 0; j < rs; j++) {
    const a = i * rs + j, b = i * rs + ((j + 1) % rs), c = (i + 1) * rs + j, d = (i + 1) * rs + ((j + 1) % rs);
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3).setUsage(THREE.DynamicDrawUsage));
  g.setIndex(idx);
  const mesh = new THREE.Mesh(g, mat || M.metal(0xc9ced8, { roughness: 0.3 }));
  mesh.castShadow = true; mesh.frustumCulled = false;
  const w = turns * TAU;
  let last = -1;
  mesh.setLength = (L) => {
    L = Math.max(turns * r * 2.05, L);
    if (Math.abs(L - last) < 1e-5) return; last = L;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1), th = w * t, c = Math.cos(th), s = Math.sin(th);
      const px = R * c, py = L * t, pz = R * s;
      for (let j = 0; j < rs; j++) {
        const f = (j / rs) * TAU, cf = Math.cos(f), sf = Math.sin(f);
        const ox = cf * c, oy = sf, oz = cf * s, k = (i * rs + j) * 3;
        pos[k] = px + r * ox; pos[k + 1] = py + r * oy; pos[k + 2] = pz + r * oz;
        nor[k] = ox; nor[k + 1] = oy; nor[k + 2] = oz;
      }
    }
    g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true;
  };
  mesh.setLength(0.2);
  return mesh;
}

// A school spring scale (newton meter) lying along +X from its hook end at the origin, with the pull
// ring at the far end. setForce(F) moves the red pointer in proportion to F (Hooke's law).
export function makeSpringScale(len = 0.62, Fmax = 50) {
  const g = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, len, 24, 1, true), M.clear(0xdfefff, 0.22));
  tube.rotation.z = Math.PI / 2; tube.position.x = len / 2 + 0.06; g.add(tube);
  const c = document.createElement('canvas'); c.width = 512; c.height = 64;
  const x = c.getContext('2d'); x.fillStyle = '#f3e7c4'; x.fillRect(0, 0, 512, 64); x.fillStyle = '#222'; x.strokeStyle = '#222'; x.font = 'bold 20px sans-serif';
  const step = Fmax > 60 ? 10 : 5;
  for (let n = 0; n <= Fmax; n += step) { const px = 8 + (n / Fmax) * 490; x.lineWidth = n % (step * 2) === 0 ? 3 : 1.5; x.beginPath(); x.moveTo(px, 0); x.lineTo(px, n % (step * 2) === 0 ? 30 : 18); x.stroke(); if (n % (step * 2) === 0) x.fillText(String(n), px - (n >= 100 ? 17 : n >= 10 ? 11 : 5), 54); }
  x.fillText('N', 496, 54);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(len * 0.92, 0.07), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  strip.rotation.x = -Math.PI / 2; strip.position.set(len / 2 + 0.06, 0.047, 0); g.add(strip);
  const capM = M.plastic(0x2f6fd8);
  const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 24), capM); cap1.rotation.z = Math.PI / 2; cap1.position.x = 0.06; g.add(cap1);
  const cap2 = cap1.clone(); cap2.position.x = len + 0.06; g.add(cap2);
  const coil = makeCoil({ turns: 14, R: 0.028, r: 0.005 }); coil.rotation.z = -Math.PI / 2; coil.position.set(len + 0.04, 0, 0); g.add(coil);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 8), M.metal(0xd8dde6)); rod.rotation.z = Math.PI / 2; g.add(rod);
  const pointer = box(0.012, 0.03, 0.1, M.glow(0xff3b30)); g.add(pointer);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 8, 20, Math.PI * 1.4), M.metal(0xd8dde6)); hook.position.x = -0.02; hook.rotation.z = Math.PI * 0.3; g.add(hook);
  const ring = torus(0.05, 0.009, M.metal(0xd8dde6), 24); ring.position.x = len + 0.14; ring.rotation.y = Math.PI / 2; g.add(ring);
  g.len = len;
  g.setForce = (F) => {
    const k = clamp(F / Fmax, 0, 1.02), px = 0.06 + 0.04 * len + k * len * 0.9;
    pointer.position.set(px, 0.03, 0);
    coil.setLength(Math.max(0.05, len + 0.04 - px));
    rod.scale.y = px + 0.02; rod.position.x = (px - 0.02) / 2;
    return F;
  };
  g.setForce(0);
  return g;
}

// ---------------------------------------------------------------- rough surfaces
// A patch of surface, w × d, whose height is a sum of bumps: its asperities. h(x, z) gives the height
// at any point (for finding contacts). flip = true makes it face downwards (the underside of a block).
export function roughField(seed = 1, n = 60, w = 2, d = 1.2, amp = 0.12, size = 0.18) {
  const r = rng(seed), bumps = [];
  for (let i = 0; i < n; i++) bumps.push([(r() - 0.5) * w * 1.1, (r() - 0.5) * d * 1.1, amp * (0.35 + 0.65 * r()), size * (0.6 + 0.8 * r())]);
  const h = (x, z) => { let s = 0; for (const [bx, bz, a, sz] of bumps) { const q = ((x - bx) ** 2 + (z - bz) ** 2) / (sz * sz); if (q < 9) s += a * Math.exp(-q); } return Math.min(s, amp * 1.4); };
  return { h, bumps };
}
export function roughMesh(field, w, d, mat, { flip = false, seg = 90, scaleY = 1 } = {}) {
  const geo = new THREE.PlaneGeometry(w, d, seg, Math.round((seg * d) / w));
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, (flip ? -1 : 1) * field.h(x, z) * scaleY); }
  if (flip) geo.rotateY(0);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true;
  if (flip) mat.side = THREE.DoubleSide;
  return m;
}

// Many small glowing dots. place(i, x, y, z, s) then done().
export function dots(n, r, color = 0xffffff, seg = 8, opacity = 0.9) {
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity }), n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const o = new THREE.Object3D();
  mesh.place = (i, x, y, z, s = 1) => { o.position.set(x, y, z); o.scale.setScalar(Math.max(0.0001, s)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); };
  mesh.done = () => { mesh.instanceMatrix.needsUpdate = true; };
  return mesh;
}

// ---------------------------------------------------------------- people and machines
// A person standing with feet at the origin, facing +x. pose({ arm, lean, stride }).
export function makePerson({ shirt = 0x3b6fd8, pants = 0x2b3242, skin = 0xc68b64, hair = 0x1b1410, s = 1 } = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const cloth = M.matte(shirt), jeans = M.matte(pants), sk = M.matte(skin);
  const hipY = 0.92 * s;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.16 * s, 0.38 * s, 6, 14), cloth); torso.position.y = 0.3 * s; torso.scale.z = 1.25; torso.castShadow = true; body.add(torso);
  const head = sphere(0.11 * s, sk, 24); head.position.y = 0.74 * s; body.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.115 * s, 20, 10, 0, TAU, 0, 1.3), M.matte(hair)); hairM.position.copy(head.position); hairM.rotation.z = 0.35; body.add(hairM);
  const limb = (len, r, mat) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len - 2 * r, 4, 10), mat); m.position.y = -len / 2; m.castShadow = true; p.add(m); return p; };
  const arms = [-1, 1].map((z) => { const a = limb(0.62 * s, 0.05 * s, cloth); a.position.set(0, 0.52 * s, z * 0.22 * s); body.add(a); const hand = sphere(0.05 * s, sk, 12); hand.position.y = -0.62 * s; a.add(hand); return a; });
  const legs = [-1, 1].map((z) => { const l = limb(0.88 * s, 0.065 * s, jeans); l.position.set(0, hipY, z * 0.1 * s); g.add(l); const shoe = box(0.24 * s, 0.07 * s, 0.1 * s, M.matte(0x1b1d22)); shoe.position.set(0.05 * s, -0.88 * s, 0); l.add(shoe); return l; });
  body.position.y = hipY;
  g.pose = ({ arm = 0, lean = 0, stride = 0, swing = null } = {}) => {
    const sw = swing ?? stride * 0.8;
    arms[0].rotation.z = arm - sw; arms[1].rotation.z = arm + sw;
    body.rotation.z = -lean;
    legs[0].rotation.z = stride; legs[1].rotation.z = -stride;
  };
  g.arms = arms; g.legs = legs; g.body = body; g.hipY = hipY;
  return g;
}

// A family hatchback, 4.2 m long, from an extruded side profile. roll(dx) turns the wheels for dx
// metres of travel; spin(i, da) turns one axle's wheels (0 rear, 1 front).
export function makeCar(color = 0xd8332f) {
  const g = new THREE.Group();
  const prof = [[-2.1, 0.3], [2.08, 0.3], [2.12, 0.62], [2.02, 0.82], [1.1, 0.96], [0.35, 1.42], [-1.35, 1.44], [-2.0, 1.05], [-2.12, 0.85]];
  const sh = new THREE.Shape(); prof.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
  const W = 1.72;
  const geo = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2, curveSegments: 4 });
  geo.translate(0, 0, -W / 2);
  const paint = M.plastic(color, { roughness: 0.3, metalness: 0.3, transparent: true, opacity: 1 });
  const shell = new THREE.Mesh(geo, paint); shell.castShadow = true; g.add(shell);
  const glass = M.plastic(0x0e1420, { roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
  const side = [[1.02, 1.0], [0.4, 1.36], [-1.28, 1.38], [-1.85, 1.04]];
  const gs = new THREE.Shape(); side.forEach(([x, y], i) => (i ? gs.lineTo(x, y) : gs.moveTo(x, y))); gs.closePath();
  for (const z of [-1, 1]) { const w = new THREE.Mesh(new THREE.ShapeGeometry(gs), glass); w.position.z = z * (W / 2 + 0.07); g.add(w); }
  const wheels = [];
  for (const x of [-1.3, 1.32]) for (const z of [-1, 1]) {
    const t = torus(0.24, 0.085, M.matte(0x16181d), 32); t.position.set(x, 0.32, z * (W / 2 - 0.05)); g.add(t);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 20), M.metal(0xb7bfcc)); rim.rotation.x = Math.PI / 2; t.add(rim);
    const spoke = box(0.36, 0.05, 0.13, M.metal(0x8c95a3)); t.add(spoke);
    t.axle = x > 0 ? 1 : 0;
    wheels.push(t);
  }
  const lamp = box(0.04, 0.1, 0.34, M.glow(0xfff2c8)); for (const z of [-0.6, 0.6]) { const l = lamp.clone(); l.position.set(2.1, 0.74, z); g.add(l); }
  const tailM = M.glow(0x7a1a16);
  const tails = [];
  for (const z of [-0.62, 0.62]) { const l = box(0.04, 0.12, 0.3, tailM); l.position.set(-2.14, 0.92, z); g.add(l); tails.push(l); }
  g.paint = paint; g.W = W; g.wheels = wheels;
  g.brakeLights = (on) => tailM.color.setHex(on ? 0xff2a1f : 0x7a1a16);
  g.roll = (dx) => wheels.forEach((w) => { w.rotation.z -= dx / 0.33; });
  return g;
}

// A plain road that scrolls under a vehicle standing still on screen.
export function makeStrip(len = 80, color = 0x2b2f36) {
  const g = new THREE.Group();
  const mat = M.matte(color, { roughness: 0.9 });
  const road = box(len, 0.06, 7, mat); road.position.y = -0.03; g.add(road);
  const dashes = new THREE.Group(); g.add(dashes);
  for (let x = -len / 2; x < len / 2; x += 6) { const d = box(3, 0.01, 0.16, M.matte(0xe8e2c8)); d.position.set(x, 0.005, 0); dashes.add(d); }
  g.scroll = (x) => { dashes.position.x = -(((x % 6) + 6) % 6); };
  g.mat = mat;
  return g;
}

// A small cylinder standing on its end.
export function disc(r, h, mat, seg = 40) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat); m.castShadow = true; m.receiveShadow = true; return m; }

export { clamp, lerp, smooth, approach, THREE, M, box, beam, sphere, torus, canvasTexture };
