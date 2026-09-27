// Chapter 1: friction as a force you can measure. A block on a long table is pulled through a spring
// scale (newton meter). The hand pulls harder and harder; the table's static friction grows to match
// the pull exactly, until it reaches its limit μs × N. Then the block breaks free and the scale drops
// to the kinetic friction μk × N while the hand keeps it sliding at a steady speed. A live force–time
// trace records the scale reading.
//   N = m g on a level table. The block is 2 kg; each brass weight adds 1 kg.
//   The hand's pull ramps from 0 to μs N in 2.2 s (so every surface shows the same shape), then the
//   reading relaxes to μk N with a 0.12 s time constant while the block speeds up to 0.25 m/s over
//   about 0.25 s. The shape of the drop is illustrative; the two levels, μs N and μk N, are the physics.
// Tilt: the angle-of-repose method (Euler 1750 used the incline to measure friction). On a slope of
//   angle θ the pull down the slope is m g sin θ and static friction can give up to μs m g cos θ.
//   The block stays put while tan θ ≤ μs, and slides once tan θ > μs, with a = g (sin θ − μk cos θ).
//   The mass cancels, so the critical angle doesn't depend on the weight.
// Zoom: Bowden and Tabor (1950). Surfaces touch only at the tips of their bumps (asperities), which
//   squash until the pressure on them equals the softer metal's hardness H. So the real contact area is
//   A_r = N ÷ H, whatever the size of the block. Mild steel: Vickers hardness about 150 HV ≈ 1.5 GPa
//   (HV × 9.81 MPa). The block's base is 10 cm × 5 cm. The picture is magnified about 10,000 times and
//   the number of touching spots is exaggerated so you can see them; the numbers in the readout are real.
import { THREE, M, box, sphere, torus, approach, clamp } from '../kit.js';
import {
  G, D2R, SURF, SURF_KEYS, board, panelBg, title, axes, line, dot, tag, COL, HEX, force, makeSpringScale,
  roughField, roughMesh, dots, fitNarrow, inReel, focusView, fmt, fmtN,
} from '../friction.js';

const TOP = 0.8, BL = 0.26, BH = 0.12, BW = 0.18, M_BLOCK = 2, T_RAMP = 2.2, T_SLIDE = 2.6, T_HOLD = 1.2;
const V_SLIDE = 0.25, TAU_F = 0.12, TAU_V = 0.25, X0 = -0.5;
const TX = 20, ZX = 40;                                  // tilt and zoom scenes along X
const H_STEEL = 1.5e9, A_BASE = 0.1 * 0.05;
const VIEWS = {
  pull: { pos: [0.25, 1.75, 2.45], target: [0.3, 1.02, -0.1] },
  tilt: { pos: [TX + 0.3, 1.85, 3.7], target: [TX + 0.3, 1.2, 0] },
  zoom: { pos: [ZX + 0.2, 0.9, 2.9], target: [ZX + 0.2, 0.66, 0] },
};
const NARROW = { pull: { pos: [0.05, 1.7, 2.3], target: [0.05, 0.95, 0.1] }, tilt: { pos: [TX + 0.1, 1.6, 3.4], target: [TX + 0.1, 0.95, 0] } };
const mass = (s) => M_BLOCK + s.extra;

// The pull's timeline: what the scale reads and how far the block has slid, t seconds after "pull".
export function pullAt(t, us, uk, N) {
  const Fs = us * N, Fk = uk * N;
  if (t < T_RAMP) return { F: Fs * (t / T_RAMP), x: 0, v: 0, stuck: true, fr: Fs * (t / T_RAMP) };
  const tau = Math.min(t - T_RAMP, T_SLIDE);
  const F = Fk + (Fs - Fk) * Math.exp(-tau / TAU_F);
  const x = V_SLIDE * (tau - TAU_V * (1 - Math.exp(-tau / TAU_V)));
  const v = t - T_RAMP > T_SLIDE ? 0 : V_SLIDE * (1 - Math.exp(-tau / TAU_V));
  return { F: t - T_RAMP > T_SLIDE ? 0 : F, x, v, stuck: false, fr: t - T_RAMP > T_SLIDE ? 0 : Fk };
}
const CYCLE = T_RAMP + T_SLIDE + T_HOLD;

export default {
  id: 'idea',
  short: 'Stick, then slip',
  title: 'The force that grips before it slips',
  subtitle: 'Pull a block with a spring scale: friction matches you, up to a limit, then lets go.',
  view: VIEWS.pull,
  learn: `<p><b>Friction</b> is the force between two surfaces that resists them sliding over each other. It is a force, so it is measured in <b>newtons</b> (N), and you can measure it with a <b>spring scale</b> (see ForceClear).</p>
    <p>Hook a block to a spring scale and pull gently. Nothing moves, because the table pulls back on the block with exactly the same force. That is <b>static friction</b>: it grows to match your pull, but only up to a limit. The limit is <b>μs × N</b>, where <b>N</b> is the <b>normal force</b> pressing the surfaces together (on a flat table, the block's weight) and <b>μs</b>, "mu-s", is the <b>coefficient of static friction</b>. μ has no unit: it is a ratio, friction ÷ normal force.</p>
    <p>Pull past the limit and the block breaks free. Now <b>kinetic friction</b> (sliding friction) takes over, and it is usually smaller: <b>μk × N</b>. That is why the scale reading <b>drops</b> the moment the block starts to slide, and why a heavy cupboard is hardest to shift at the very start.</p>
    <p>Add weight and N grows, so friction grows in step: double the weight, double the friction. The size of μ depends on the pair of surfaces: about 1 for rubber on tar, 0.45 for dry wood, 0.04 for Teflon and 0.03 for steel on ice.</p>
    <p>Two neat tricks. <b>Tilt the table</b> until the block just starts to slide: at that angle <b>tan θ = μs</b>, and the block's weight doesn't matter. And <b>zoom in</b>: even polished steel is a mountain range. The surfaces touch only on the tips of the bumps, called <b>asperities</b>, and the real contact is often less than a millionth of the area you see.</p>
    <p class="tip"><b>Try it:</b> pull the wooden block and watch the trace peak, then drop. Add weights and pull again. Try Teflon, where there is no drop at all. Then tilt the ramp and find the angle where each surface lets go.</p>`,
  terms: [
    { t: 'Friction', d: 'The force between two touching surfaces that resists them sliding over each other.' },
    { t: 'Normal force (N)', d: 'The push of a surface on something pressed against it, at right angles to the surface. On a flat table it equals the weight.' },
    { t: 'Static friction', d: 'Friction that stops a still object from starting to slide. It matches the pull, up to μs × N.' },
    { t: 'Kinetic friction', d: 'Friction on an object that is already sliding: about μk × N, usually less than the static limit.' },
    { t: 'Coefficient of friction (μ)', d: 'Friction divided by the normal force. It has no unit and depends on the two surfaces.' },
    { t: 'Angle of repose', d: 'The steepest slope an object can rest on without sliding. Its tangent equals μs.' },
    { t: 'Asperities', d: 'The microscopic bumps on every surface. Surfaces only really touch at their tips.' },
  ],
  defaults: { focus: 'pull', surf: 'wood', extra: 0, angle: 10 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'pull', label: 'Pull' }, { v: 'tilt', label: 'Tilt' }, { v: 'zoom', label: 'Zoom in' }] },
    { key: 'surf', type: 'seg', label: 'Surfaces', options: SURF_KEYS.map((k) => ({ v: k, label: SURF[k].name.replace(' on ', ' / ') })), fmt: (v) => `μs ${SURF[v].us} · μk ${SURF[v].uk}` },
    { key: 'extra', type: 'range', label: 'Add weight', min: 0, max: 8, step: 1, ends: ['block alone, 2 kg', '+8 kg'], fmt: (v, s) => `${v} kg extra · N = ${fmtN((M_BLOCK + v) * G)}` },
    { key: 'angle', type: 'range', label: 'Tilt: ramp angle', min: 0, max: 50, step: 0.5, ends: ['flat', '50°'], fmt: (v) => `${v.toFixed(1)}° · tan θ = ${Math.tan(v * D2R).toFixed(2)}` },
    { key: 'go', type: 'buttons', label: 'Do it', items: [{ label: '▶ Pull again', act: (s, inst) => { s.focus = 'pull'; inst.go(); } }, { label: 'Tilt: find the angle', act: (s) => { s.focus = 'tilt'; s.angle = +(Math.atan(SURF[s.surf].us) / D2R + 0.5).toFixed(1); } }] },
  ],
  onChange(s, key) {
    if (key === 'angle') s.focus = 'tilt';
  },
  quiz: [
    { q: 'A 10 kg crate rests on a floor with μs = 0.5. You push it sideways with 20 N and it doesn’t move. How big is the friction force?', options: ['49 N', '20 N', '0 N', '98 N'], answer: 1, why: 'Static friction only matches what you push with, up to its limit. The limit here is 0.5 × 98 N = 49 N, but you only push with 20 N, so friction is 20 N.' },
    { q: 'Why does a spring scale reading drop the moment a block starts to slide?', options: ['The block gets lighter', 'Kinetic friction is smaller than the static limit', 'The spring gets tired', 'Air starts to hold it up'], answer: 1, why: 'For most surfaces μk is smaller than μs, so less force is needed to keep the block sliding than to start it.' },
    { q: 'A block starts to slide down a ramp tilted at 31°. What is μs? (tan 31° ≈ 0.6)', options: ['About 0.3', 'About 0.6', 'About 0.9', 'It depends on the block’s weight'], answer: 1, why: 'At the angle where sliding begins, tan θ = μs, so μs ≈ 0.6. The weight cancels out.' },
  ],
  reel: [
    { ms: 6400, caption: 'Pull a block: friction grows to match you, up to μs × N. Then it slips, and friction drops.', set: { focus: 'pull', surf: 'wood', extra: 3 }, act: (s, inst) => inst.go(), view: { pos: [-0.25, 1.3, 1.3], target: [-0.25, 1.08, 0] }, spin: 0 },
    { ms: 5400, caption: 'Tilt the ramp. The block lets go exactly when tan θ reaches μs, whatever it weighs.', set: { focus: 'tilt', surf: 'wood', extra: 0, angle: 8 }, anim: { angle: [8, 30] }, view: { pos: [TX + 0.1, 1.3, 1.65], target: [TX + 0.1, 1.08, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gP = new THREE.Group(), gT = new THREE.Group(), gZ = new THREE.Group(); root.add(gP, gT, gZ);
    gT.position.x = TX; gZ.position.x = ZX;

    // ================================================================ pull
    const legM = M.metal(0x6b7280);
    const frame = box(3.2, 0.05, 0.8, M.matte(0x3a3f4b)); frame.position.set(0.3, TOP - 0.045, 0); gP.add(frame);
    for (const x of [-1.2, 1.8]) for (const z of [-0.33, 0.33]) { const l = box(0.06, TOP - 0.07, 0.06, legM); l.position.set(x, (TOP - 0.07) / 2, z); gP.add(l); }
    const topMat = M.matte(0xc8995a, { roughness: 0.8 });
    const top = box(3.0, 0.02, 0.5, topMat); top.position.set(0.3, TOP - 0.01, 0); gP.add(top);
    const blockMat = M.matte(0xa8743e, { roughness: 0.7 });
    const blk = new THREE.Group(); gP.add(blk);
    const body = box(BL, BH, BW, blockMat); body.position.y = BH / 2; blk.add(body);
    const brass = M.metal(0xc9a24a, { roughness: 0.35 });
    const weights = [];
    for (let i = 0; i < 8; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.036, 24), brass); w.castShadow = true; w.position.set(i % 2 ? 0.055 : -0.055, BH + 0.019 + Math.floor(i / 2) * 0.037, 0); blk.add(w); weights.push(w); }
    const scale = makeSpringScale(0.62, 100); scale.position.set(BL / 2 + 0.03, BH * 0.55, 0); blk.add(scale);
    const hand = sphere(0.055, M.matte(0xc68b64), 20); hand.scale.set(1.3, 0.9, 1); hand.position.set(BL / 2 + 0.03 + 0.62 + 0.16, BH * 0.55, 0); blk.add(hand);
    const aPull = force(HEX.pull, 0.012, 0.07), aFr = force(HEX.fric, 0.012, 0.07), aN = force(HEX.normal, 0.012, 0.07), aW = force(HEX.weight, 0.012, 0.07);
    gP.add(aPull, aFr, aN, aW);
    const lPull = stage.label('', [0, 0, 0], gP), lFr = stage.label('', [0, 0, 0], gP, 'hot'), lN = stage.label('', [0, 0, 0], gP), lState = stage.label('', [0, 0, 0], gP, 'hot');
    lFr.element.style.setProperty('--c', COL.fric);

    // Force–time trace.
    const trace = [];
    let cur = null;
    const chart = board(gP, 1.5, 0.667, 900, 400, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      const { us, uk, N, name } = cur, Fs = us * N, Fk = uk * N;
      title(g, 'Spring scale reading', `${name} · N = ${fmtN(N)}`);
      const yMax = niceMax(Fs * 1.25);
      const A = axes(g, w, h, { x0: 90, y0: h - 56, y1: 76, xMax: CYCLE, yMax, xTicks: [0, 1, 2, 3, 4, 5, 6], yTicks: [0, yMax / 2, yMax], xFmt: (v) => v + ' s', yFmt: (v) => fmtN(v).replace(' N', ''), xLabel: 'time →', yLabel: 'N' });
      g.setLineDash([10, 8]); g.lineWidth = 2;
      g.strokeStyle = COL.static; g.beginPath(); g.moveTo(A.x0, A.Y(Fs)); g.lineTo(A.x1, A.Y(Fs)); g.stroke();
      if (Fs - Fk > 0.001 * yMax) { g.strokeStyle = COL.kinetic; g.beginPath(); g.moveTo(A.x0, A.Y(Fk)); g.lineTo(A.x1, A.Y(Fk)); g.stroke(); }
      g.setLineDash([]);
      tag(g, `limit μs N = ${fmtN(Fs)}`, A.x1 - 230, A.Y(Fs) - 8, COL.static, 'bold 17px sans-serif');
      if (Fs - Fk > 0.06 * yMax) tag(g, `sliding μk N = ${fmtN(Fk)}`, A.x1 - 230, A.Y(Fk) + 22, COL.kinetic, 'bold 17px sans-serif');
      else if (Fs - Fk > 0.001 * yMax) tag(g, `sliding μk N = ${fmtN(Fk)}`, A.x1 - 230, A.Y(Fk) + 22, COL.kinetic, 'bold 17px sans-serif');
      else tag(g, 'μs = μk: no drop at all', A.x1 - 230, A.Y(Fs) + 24, COL.kinetic, 'bold 17px sans-serif');
      if (trace.length > 1) line(g, trace, A.X, A.Y, COL.pull, 5);
      const last = trace[trace.length - 1];
      if (last) dot(g, A.X(last[0]), A.Y(last[1]), COL.pull, 8);
      g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.55)';
      g.fillText('sticking', A.X(0.6), A.y0 - 10); g.fillText('sliding', A.X(T_RAMP + 0.6), A.y0 - 10);
    }, [0.85, 1.45, -0.45]);
    chart.mesh.rotation.x = -0.1;

    // ================================================================ tilt
    const hinge = new THREE.Group(); hinge.position.set(-0.8, 0.62, 0); gT.add(hinge);
    const plankMat = M.matte(0xc8995a, { roughness: 0.8 });
    const plank = box(1.7, 0.04, 0.44, plankMat); plank.position.set(0.85, -0.02, 0); hinge.add(plank);
    const baseT = box(1.9, 0.06, 0.6, M.matte(0x3a3f4b)); baseT.position.set(0.05, 0.03, 0); gT.add(baseT);
    const standT = box(0.08, 0.56, 0.5, M.matte(0x3a3f4b)); standT.position.set(-0.8, 0.34, 0); gT.add(standT);
    const prop = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 10), legM); gT.add(prop);
    const blkT = new THREE.Group(); hinge.add(blkT);
    const bodyT = box(BL, BH, BW, blockMat.clone()); bodyT.position.y = BH / 2; blkT.add(bodyT);
    const arc = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.52, 48, 1, 0, 0.01), M.glow(0xffb547, { side: THREE.DoubleSide })); arc.position.set(-0.8, 0.62, 0.23); gT.add(arc);
    const aDown = force(HEX.weight, 0.016, 0.09), aFrT = force(HEX.fric, 0.016, 0.09);
    gT.add(aDown, aFrT);
    const lAng = stage.label('', [0, 0, 0], gT, 'hot'), lTstate = stage.label('', [0, 0, 0], gT);
    let curT = null;
    const tChart = board(gT, 1.5, 0.836, 700, 390, (g, w, h) => {
      panelBg(g, w, h);
      if (!curT) return;
      const { us, ang, name } = curT;
      title(g, 'Along the slope, per newton of weight', name);
      const A = axes(g, w, h, { x0: 80, y0: h - 56, y1: 80, xMax: 50, yMax: 1, xTicks: [0, 10, 20, 30, 40, 50], yTicks: [0, 0.5, 1], xFmt: (v) => v + '°', yFmt: (v) => v.toFixed(1), xLabel: 'angle →' });
      const sinP = [], frP = [];
      for (let a = 0; a <= 50; a += 1) { sinP.push([a, Math.sin(a * D2R)]); frP.push([a, Math.min(1, us * Math.cos(a * D2R))]); }
      line(g, sinP, A.X, A.Y, COL.weight, 4);
      line(g, frP, A.X, A.Y, COL.static, 4, [10, 7]);
      const ac = Math.atan(us) / D2R;
      if (ac <= 50) { g.strokeStyle = 'rgba(255,255,255,.5)'; g.setLineDash([4, 6]); g.beginPath(); g.moveTo(A.X(ac), A.y1); g.lineTo(A.X(ac), A.y0); g.stroke(); g.setLineDash([]); tag(g, `slips at ${ac.toFixed(1)}°`, A.X(ac) + 8, A.y1 + 22, '#fff', 'bold 17px sans-serif', w); }
      tag(g, 'pull down the slope, sin θ', A.X(26), A.Y(Math.sin(26 * D2R)) - 12, COL.weight, '16px sans-serif', w);
      tag(g, 'most friction can give, μs cos θ', A.X(2), A.Y(Math.min(1, us)) + (us > 0.8 ? 24 : -10), COL.static, '16px sans-serif', w);
      dot(g, A.X(Math.min(50, ang)), A.Y(Math.sin(ang * D2R)), COL.weight, 8);
    }, [1.62, 1.72, -0.5]);

    // ================================================================ zoom
    const ZW = 2.0, ZD = 1.0;
    const fLow = roughField(3, 60, ZW, ZD, 0.1, 0.15), fUp = roughField(9, 60, ZW + 0.8, ZD, 0.1, 0.15);
    const lowM = roughMesh(fLow, ZW, ZD, M.metal(0x9aa3b2, { roughness: 0.45 }), { seg: 110 }); lowM.position.y = 0.3; gZ.add(lowM);
    const baseZ = box(ZW, 0.3, ZD, M.metal(0x7c8594, { roughness: 0.5 })); baseZ.position.y = 0.15; gZ.add(baseZ);
    const upG = new THREE.Group(); gZ.add(upG);
    const upM = roughMesh(fUp, ZW + 0.8, ZD, M.metal(0xc9a24a, { roughness: 0.4, transparent: true, opacity: 0.88 }), { flip: true, seg: 130 }); upG.add(upM);
    const upBody = box(ZW + 0.8, 0.25, ZD, M.metal(0xc9a24a, { roughness: 0.4, transparent: true, opacity: 0.3, depthWrite: false })); upBody.position.y = 0.125 + 0.005; upG.add(upBody);
    const NC = 60 * 32, cDots = dots(NC, 0.022, 0xff5a3a, 8, 0.95); gZ.add(cDots);
    const lZoom = stage.label('magnified about 10,000×: steel on steel', [0, 0.02, 0.65], gZ), lTouch = stage.label('', [0, 0, 0], gZ, 'hot');
    lTouch.element.style.setProperty('--c', '#ff7a59');
    const grid = []; for (let i = 0; i < 60; i++) for (let j = 0; j < 32; j++) grid.push([(-0.5 + (i + 0.5) / 60) * ZW * 0.96, (-0.5 + (j + 0.5) / 32) * ZD * 0.94]);
    const sums = new Float32Array(NC), order = new Array(NC);

    const st = {};
    let t = 0, key = '', ck = '', tk = '', slideT = 0, tiltWait = 0, zt = 0, wasNarrow = false;
    const inst = {
      go() { t = 0; trace.length = 0; },
      update(dt, s) {
        dt = Math.max(0, dt);
        focusView(stage, st, s.focus, VIEWS);
        const narrow = fitNarrow(stage, [lN, lZoom]);
        const reel = inReel();
        if (narrow !== wasNarrow && !reel) { wasNarrow = narrow; const v = narrow ? (NARROW[s.focus] || VIEWS[s.focus]) : VIEWS[s.focus]; stage.setView(v.pos, v.target, 0.6); }
        gP.visible = s.focus === 'pull'; gT.visible = s.focus === 'tilt'; gZ.visible = s.focus === 'zoom';
        const S = SURF[s.surf], m = mass(s), N = m * G, W = N;
        topMat.color.setHex(S.top); plankMat.color.setHex(S.top); blockMat.color.setHex(S.blk); bodyT.material.color.setHex(S.blk);
        weights.forEach((w, i) => { w.visible = i < s.extra; });
        const kA = 1.0 / (10 * G);                        // arrow length per newton: 10 kg's weight = 1 m

        // ---------------- pull
        const k2 = `${s.surf}|${s.extra}`;
        if (k2 !== key) { key = k2; inst.go(); }
        if (s.focus === 'pull') {
          t += dt;
          if (t > CYCLE) inst.go();
          const p = pullAt(t, S.us, S.uk, N);
          if (!trace.length || t - trace[trace.length - 1][0] > 0.03) trace.push([t, p.F]);
          const bx = X0 + p.x;
          blk.position.set(bx, TOP, 0);
          scale.setForce(p.F);
          const y = TOP + BH * 0.55;
          const kH = 0.55 / Math.max(1e-6, S.us * N);        // pull and friction arrows: the static limit is 55 cm
          aPull.aim([bx + BL / 2 + 0.98, y, 0], [1, 0, 0], p.F * kH);
          aFr.aim([bx - BL / 2, TOP + 0.01, 0.13], [-1, 0, 0], p.fr * kH);
          aN.aim([bx - 0.02, TOP + 0.002, -0.14], [0, 1, 0], N * kA);
          aW.aim([bx + 0.02, TOP + BH / 2, -0.14], [0, -1, 0], W * kA);
          aN.visible = aW.visible = false;
          lPull.position.set(bx + BL / 2 + 1.05 + p.F * kH * 0.5, y + 0.14, 0); lPull.element.innerHTML = `pull <b>${fmtN(p.F)}</b>`;
          lFr.position.set(bx - BL / 2 - Math.max(0.12, p.fr * kH * 0.6), TOP + 0.1, 0.18); lFr.element.innerHTML = `friction ${fmtN(p.fr)}`;
          lFr.visible = p.fr > 0.001;
          lN.position.set(bx - 0.05, TOP - 0.12, 0.3); lN.element.innerHTML = `N = ${fmtN(N)}`;
          lState.position.set(bx, TOP + BH + 0.1 + Math.ceil(s.extra / 2) * 0.037 + 0.08, 0);
          lState.element.innerHTML = p.stuck ? 'stuck: static friction' : t - T_RAMP > T_SLIDE ? 'stopped' : 'sliding!';
          lState.element.style.setProperty('--c', p.stuck ? COL.static : COL.kinetic);
          cur = { us: S.us, uk: S.uk, N, name: S.name };
          chart.redraw();
          if (narrow && !reel) { chart.mesh.position.set(0.05, 0.62, 0.55); chart.mesh.scale.setScalar(0.62); }
          else if (reel) { chart.mesh.position.set(-0.25, 1.52, -0.35); chart.mesh.scale.setScalar(0.85); }
          else { chart.mesh.position.set(0.85, 1.45, -0.45); chart.mesh.scale.setScalar(1); }
        }

        // ---------------- tilt
        if (s.focus === 'tilt') {
          const th = s.angle * D2R, slips = Math.tan(th) > S.us;
          hinge.rotation.z = th;
          const a = slips ? Math.max(0, G * (Math.sin(th) - S.uk * Math.cos(th))) : 0;
          const tkey = `${s.surf}|${slips}`;
          if (tkey !== tk) { tk = tkey; slideT = 0; tiltWait = 0; }
          if (slips) {
            if (tiltWait > 0) { tiltWait -= dt; if (tiltWait <= 0) slideT = 0; }
            else { slideT += dt; if (0.5 * a * slideT * slideT > 1.2) tiltWait = 0.8; }
          } else slideT = 0;
          const u = Math.min(1.25, 0.5 * a * slideT * slideT);
          blkT.position.set(1.4 - u, 0, 0);
          // prop under the far end of the plank
          const ex = -0.8 + 1.62 * Math.cos(th), ey = 0.62 + 1.62 * Math.sin(th);
          prop.position.set(ex, (ey + 0.06) / 2, 0); prop.scale.y = Math.max(0.01, ey - 0.06); prop.visible = th > 0.01;
          arc.geometry.dispose(); arc.geometry = new THREE.RingGeometry(0.46, 0.49, 40, 1, 0, Math.max(0.001, th));
          // forces along the slope, drawn at the block (in the scene's frame)
          const c = Math.cos(th), sn = Math.sin(th), bxw = -0.8 + (1.4 - u) * c - (BH / 2) * sn, byw = 0.62 + (1.4 - u) * sn + (BH / 2) * c;
          const down = m * G * sn, fr = slips ? S.uk * m * G * c : down;
          const kT = 0.5 / (m * G);                          // 50 cm = the block's whole weight
          aDown.aim([bxw, byw, 0.2], [-c, -sn, 0], down * kT);
          aFrT.aim([bxw, byw, 0.2], [c, sn, 0], fr * kT);
          lAng.position.set(-0.2, 0.75, 0.25); lAng.element.innerHTML = `θ = <b>${s.angle.toFixed(1)}°</b> · tan θ = ${Math.tan(th).toFixed(2)}`;
          lAng.element.style.setProperty('--c', slips ? COL.kinetic : COL.static);
          lTstate.position.set(bxw - 0.1 * sn, byw + 0.3, 0); lTstate.element.innerHTML = slips ? 'slides: tan θ > μs' : 'holds: tan θ ≤ μs';
          curT = { us: S.us, ang: s.angle, name: `${S.name}: μs = ${S.us}` };
          const kk = `${s.surf}|${s.angle}`;
          if (kk !== ck) { ck = kk; tChart.redraw(); }
          tChart.mesh.visible = !narrow || reel;
          if (reel) { tChart.mesh.position.set(0.1, 1.95, -0.4); tChart.mesh.scale.setScalar(1.0); } else { tChart.mesh.position.set(1.62, 1.72, -0.5); tChart.mesh.scale.setScalar(1); }
        }

        // ---------------- zoom
        if (s.focus === 'zoom') {
          zt += dt;
          const off = 0.35 * Math.sin(zt * 0.45);
          upM.position.x = off; upBody.position.x = off;
          for (let i = 0; i < NC; i++) { const [x, z] = grid[i]; sums[i] = fLow.h(x, z) + fUp.h(x - off, z); order[i] = i; }
          order.sort((a2, b2) => sums[b2] - sums[a2]);
          const frac = 0.006 + 0.0045 * m;                // exaggerated share of the picture in contact
          const kC = Math.max(1, Math.round(frac * NC)), gap = sums[order[kC]];
          upG.position.y = 0.3 + gap;
          let n = 0;
          for (let r = 0; r < kC; r++) { const i = order[r], [x, z] = grid[i]; cDots.place(n++, x, 0.3 + fLow.h(x, z) + (sums[i] - gap) * 0.5, z, 1); }
          for (; n < NC; n++) cDots.place(n, 0, -5, 0, 0.0001);
          cDots.done();
          weightsZ(s.extra);
          lTouch.position.set(0.75, 0.95, 0.4); lTouch.element.innerHTML = `touching at the glowing tips only`;
          lTouch.visible = !narrow;
        }
      },
      readout(s) {
        const S = SURF[s.surf], m = mass(s), N = m * G;
        if (s.focus === 'tilt') {
          const th = s.angle * D2R, slips = Math.tan(th) > S.us, ac = Math.atan(S.us) / D2R;
          const a = slips ? Math.max(0, G * (Math.sin(th) - S.uk * Math.cos(th))) : 0;
          return `<div class="big">${slips ? `Slides: a = ${a.toFixed(2)} m/s²` : 'Holds still'}</div>
            <div class="row"><span>tan θ</span><b>${Math.tan(th).toFixed(3)}</b></div>
            <div class="row"><span>μs, ${S.name.toLowerCase()}</span><b>${S.us}</b></div>
            <div class="row"><span>Critical angle, tan⁻¹ μs</span><b>${ac.toFixed(1)}°</b></div>
            <div class="row"><span>Pull down the slope, m g sin θ</span><b>${fmtN(m * G * Math.sin(th))}</b></div>
            <small>The weight cancels: a 2 kg block and a 10 kg block let go at the same angle.</small>`;
        }
        if (s.focus === 'zoom') {
          const Ar = N / H_STEEL, share = A_BASE / Ar;
          return `<div class="big">Real contact: ${fmt(Ar * 1e6, 3)} mm²</div>
            <div class="row"><span>Steel block's base, 10 cm × 5 cm</span><b>5,000 mm²</b></div>
            <div class="row"><span>Load N</span><b>${fmtN(N)}</b></div>
            <div class="row"><span>Real area = N ÷ hardness (1.5 GPa)</span><b>1 part in ${Math.round(share).toLocaleString('en-IN')}</b></div>
            <small>More weight squashes the bumps and makes more contact, in proportion to N. That is why friction ∝ N and not to the size of the block.</small>`;
        }
        const t0 = t, p = pullAt(t0, S.us, S.uk, N);
        return `<div class="big">${p.stuck ? `Static friction: ${fmtN(p.fr)}` : `Sliding: ${fmtN(S.uk * N)}`}</div>
          <div class="row"><span>Normal force N = m g, ${m} kg</span><b>${fmtN(N)}</b></div>
          <div class="row"><span>Static limit, μs N = ${S.us} × N</span><b>${fmtN(S.us * N)}</b></div>
          <div class="row"><span>Kinetic friction, μk N = ${S.uk} × N</span><b>${fmtN(S.uk * N)}</b></div>
          <div class="row"><span>Spring scale now</span><b>${fmtN(p.F)}</b></div>
          <small>${S.us > S.uk ? `It takes ${Math.round((S.us / S.uk - 1) * 100)}% more force to start it than to keep it going.` : 'Teflon: starting and sliding friction are the same, so there is no jerk.'}</small>`;
      },
    };
    // The zoom has its own brass weights, stacked on the upper block.
    const zW = [];
    for (let i = 0; i < 8; i++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.09, 24), brass); w.position.set(-0.75 + (i % 4) * 0.5, 0.3 + (i < 4 ? 0 : 0.09), -0.25); upG.add(w); zW.push(w); }
    const weightsZ = (n) => zW.forEach((w, i) => { w.visible = i < n; });
    return inst;
  },
};

function niceMax(v) {
  const p = 10 ** Math.floor(Math.log10(Math.max(1e-6, v))), r = v / p;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * p;
}
