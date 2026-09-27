// Chapter 5: myths and limits of the simple friction law F = μ N.
// Myth 1, "more contact area, more friction". Amontons's second law (1699): friction doesn't depend on
//   the apparent area. A brick slid flat or on its edge needs the same pull. Reason (Bowden and Tabor,
//   1950): the real contact area is N ÷ hardness either way. Brick 23 × 11 × 7 cm, 3 kg, on a wooden
//   plank, μk ≈ 0.5 (brick on wood μ ≈ 0.6 static: Engineering Toolbox). Rubber tyres are the exception:
//   rubber is soft and sticky, so it breaks the rule a little.
// Myth 2, "smoother always means less friction". For clean metals, friction against roughness is
//   U-shaped: rough surfaces lock together, very smooth ones touch over more area and stick by
//   adhesion (after Rabinowicz, Friction and Wear of Materials, 1965). Our curve is illustrative, in
//   μ against the average roughness Ra. Extreme case: clean metals in a vacuum cold-weld. Gauge blocks
//   polished to about 0.025 µm "wring" together. Galileo's high-gain antenna (April 1991) failed to open:
//   friction at bare pins whose MoS₂ dry lubricant had worn away held 2–3 of its 18 ribs (NASA Lessons
//   Learned 492).
// Myth 3, "ice is slippery because pressure melts it". Clausius–Clapeyron for ice: the melting point
//   falls by about 0.0074 °C per atmosphere (7.4 × 10⁻⁸ K/Pa). A 60 kg skater on one blade touching
//   30 mm × 1 mm presses at 19.6 MPa (194 atm), lowering the melting point by only about 1.5 °C, yet
//   skating works at −20 °C. Ice has a thin "premelted" liquid-like surface layer (Faraday 1850; seen by
//   X-rays down to about −13.5 °C, Dosch et al. 1987–95), and sliding also melts it by frictional
//   heating (Bowden and Hughes 1939). Steel slides most easily on ice near −7 °C, the temperature
//   speed-skating rinks use (Weber et al., J. Phys. Chem. Lett. 2018). Our μ(T)
//   curve follows that shape; the values are illustrative (about 0.01 at best).
// Superlubricity. Dienwiebel et al. (PRL 92, 126101, 2004): a graphite flake on graphite has high
//   friction only when its atoms line up with the layer below (every 60°); twisted a few degrees, the
//   bumps can't lock and friction almost vanishes. Our curve: sharp peaks at 0° and 60°, a few
//   degrees wide, relative to the peak.
// Air resistance: friction with a fluid. Drag F = ½ ρ Cd A v² grows with speed squared, unlike dry
//   friction. A cyclist sitting up: Cd A ≈ 0.32 m² (Wilson, Bicycling Science). Rolling resistance of
//   an 85 kg bike and rider with Crr 0.004: 3.3 N, the same at any speed. Power = F × v.
import { THREE, M, box, beam, sphere, torus, clamp } from '../kit.js';
import {
  G, KMH, TAU, D2R, RHO_AIR, board, panelBg, title, axes, line, dot, tag, COL, HEX, force, makeSpringScale,
  makePerson, roughField, roughMesh, dots, fitNarrow, inReel, focusView, fmt, fmtN, rng,
} from '../friction.js';

const SX = 40, IX = 80, GX = 120, AX = 160;
const BRICK = { m: 3, L: 0.23, W: 0.11, H: 0.07, uk: 0.5 };
const DTDP = 7.4e-8, ATM = 101325, SKATER = 60, BLADE = 0.03 * 0.001;
const CDA = 0.32, M_RIDE = 85, CRR = 0.004;
const VIEWS = {
  area: { pos: [0.2, 1.3, 1.5], target: [0.45, 0.88, 0] },
  smooth: { pos: [SX + 0.2, 0.95, 3.2], target: [SX + 0.4, 0.7, 0] },
  ice: { pos: [IX + 0.05, 1.25, 3.0], target: [IX + 0.35, 0.75, 0] },
  super: { pos: [GX + 0.2, 2.5, 3.1], target: [GX + 0.55, 0.8, 0] },
  air: { pos: [AX + 0.3, 1.75, 5.6], target: [AX + 0.75, 1.5, 0] },
};
// Friction against roughness Ra (µm) for clean metal on metal: illustrative U-shape.
export const muRough = (ra) => { const u = Math.log10(ra); return 0.28 + 0.55 * Math.exp(-(u + 2) * 2.5) + 0.1 * Math.max(0, u + 0.3) ** 2; };
// Steel on ice against temperature (°C): illustrative, lowest near −7 °C.
const ICE_PTS = [[-40, 0.05], [-30, 0.036], [-20, 0.024], [-13, 0.015], [-7, 0.01], [-3, 0.012], [0, 0.02]];
export const muIce = (T) => { for (let i = 1; i < ICE_PTS.length; i++) { const [a, ma] = ICE_PTS[i - 1], [b, mb] = ICE_PTS[i]; if (T <= b) return ma + ((T - a) / (b - a)) * (mb - ma); } return 0.02; };
export const muTwist = (deg) => { const d = ((deg % 60) + 60) % 60, e = Math.min(d, 60 - d); return 0.02 + 0.98 * Math.exp(-((e / 3) ** 2)); };
const drag = (v) => 0.5 * RHO_AIR * CDA * v * v;

export default {
  id: 'limits',
  short: 'Myths and limits',
  title: 'Friction myths, and where the simple rule breaks',
  subtitle: 'Area doesn’t matter, smoother isn’t always slipperier, and pressure doesn’t melt ice.',
  view: VIEWS.area,
  learn: `<p><b>Myth: more contact area means more friction.</b> It feels obvious, but slide a brick flat or on its edge and the pull is the same. That is <b>Amontons's law</b> (1699): friction depends on the load, not on the apparent area. The reason is the tiny real contact you saw in chapter 1. Spread the brick over a bigger area and each bump is pressed less, so fewer bumps touch: the real contact area stays about the same. <b>Rubber</b> tyres break the rule a little, because rubber is soft and sticky.</p>
    <p><b>Myth: smoother always means less friction.</b> Up to a point. Polish two clean metals too far and they touch over so much area that the atoms <b>stick</b>. In a vacuum, clean metals can even <b>cold-weld</b>. Polished steel gauge blocks "wring" together so hard you must slide them apart. In 1991 the Galileo spacecraft's big antenna jammed half-open on the way to Jupiter: dry lubricant had worn off a few metal pins, and bare metal gripped bare metal.</p>
    <p><b>Myth: ice is slippery because your weight melts it.</b> Pressure does lower ice's melting point, but only by about 0.0074 °C per atmosphere. A skater's blade lowers it by about 1.5 °C, yet skating works at −20 °C. The real reasons: ice has a naturally <b>wet, loose surface layer</b> a few molecules thick (Faraday guessed it in 1850), and sliding <b>heats</b> the surface. Ice is slipperiest near −7 °C, which is why skating rinks are kept close to that.</p>
    <p><b>Superlubricity.</b> Twist one sheet of graphite a few degrees on another and their atomic bumps can't lock together: friction almost vanishes. Line them up again and it comes back.</p>
    <p><b>Air resistance</b> is friction with a fluid (see BernoulliClear). Unlike dry friction, it grows with <b>speed squared</b>. Above about 15 km/h, a cyclist fights the air far more than the road.</p>
    <p class="tip"><b>Try it:</b> pull both bricks. Polish the metal from rough to mirror-smooth. Cool the ice to −30 °C, then warm it. Twist the graphite flake. Then ride faster and watch drag take over.</p>`,
  terms: [
    { t: 'Amontons’s laws', d: 'Friction is proportional to the load and doesn’t depend on the apparent contact area.' },
    { t: 'Adhesion', d: 'Atoms of two surfaces sticking to each other where they really touch.' },
    { t: 'Cold welding', d: 'Clean metal surfaces bonding together without heat, especially in a vacuum.' },
    { t: 'Premelting', d: 'The thin, liquid-like layer on the surface of ice, even well below 0 °C.' },
    { t: 'Superlubricity', d: 'Almost zero friction, when two crystal surfaces are twisted so their atoms can’t interlock.' },
    { t: 'Drag', d: 'Friction from air or water. It grows with the square of the speed.' },
  ],
  defaults: { focus: 'area', ra: 0.3, temp: -7, twist: 0, vkmh: 20 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'area', label: 'Area' }, { v: 'smooth', label: 'Smoothness' }, { v: 'ice', label: 'Ice' }, { v: 'super', label: 'Graphite' }, { v: 'air', label: 'Air' }] },
    { key: 'ra', type: 'log', label: 'Smoothness: surface roughness', min: 0.01, max: 10, ends: ['mirror, 0.01 µm', 'rough, 10 µm'], fmt: (v) => `${v < 0.1 ? v.toFixed(3) : v.toFixed(2)} µm` },
    { key: 'temp', type: 'range', label: 'Ice: temperature', min: -40, max: 0, step: 1, ends: ['−40 °C', '0 °C'], fmt: (v) => `${v} °C` },
    { key: 'twist', type: 'range', label: 'Graphite: twist of the flake', min: 0, max: 60, step: 0.5, ends: ['0°', '60°'], fmt: (v) => `${v}°` },
    { key: 'vkmh', type: 'range', label: 'Air: cycling speed', min: 5, max: 50, step: 1, ends: ['5 km/h', '50 km/h'], fmt: (v) => `${v} km/h` },
    { key: 'go', type: 'buttons', label: 'Area', items: [{ label: '▶ Pull both bricks', act: (s, inst) => { s.focus = 'area'; inst.go(); } }] },
  ],
  onChange(s, key) {
    if (key === 'ra') s.focus = 'smooth';
    if (key === 'temp') s.focus = 'ice';
    if (key === 'twist') s.focus = 'super';
    if (key === 'vkmh') s.focus = 'air';
  },
  quiz: [
    { q: 'A brick slides on a plank lying flat. You turn it onto its narrow edge. What happens to the friction?', options: ['It halves', 'It stays about the same', 'It doubles', 'It disappears'], answer: 1, why: 'Friction depends on the load, not on the apparent area (Amontons’s law). The real contact area stays about the same either way.' },
    { q: 'Why is pressure melting NOT the main reason ice is slippery?', options: ['Ice can’t melt', 'A skater lowers the melting point by only about 1–2 °C, yet skating works at −20 °C', 'Skates are too light', 'Pressure makes ice harder'], answer: 1, why: 'The melting point drops by only about 0.0074 °C per atmosphere. The real reasons are a liquid-like surface layer and frictional heating.' },
    { q: 'You double your cycling speed from 15 to 30 km/h. What happens to the air resistance?', options: ['It stays the same', 'It doubles', 'It goes up about four times', 'It halves'], answer: 2, why: 'Drag grows with speed squared: ½ ρ Cd A v². Twice the speed, four times the drag.' },
  ],
  reel: [
    { ms: 5000, caption: 'Myth: bigger contact, more friction. A brick flat or on its edge needs the same pull.', set: { focus: 'area' }, act: (s, inst) => inst.go(), view: { pos: [0.2, 1.05, 0.85], target: [0.2, 0.88, 0] }, spin: 0 },
    { ms: 5400, caption: 'Myth: pressure melts ice. It shifts melting by barely 1 °C. Ice is slipperiest near −7 °C.', set: { focus: 'ice', temp: -30 }, anim: { temp: [-30, -2] }, view: { pos: [IX, 0.78, 1.25], target: [IX, 0.68, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gA = new THREE.Group(), gS = new THREE.Group(), gI = new THREE.Group(), gG = new THREE.Group(), gR = new THREE.Group(); root.add(gA, gS, gI, gG, gR);
    gS.position.x = SX; gI.position.x = IX; gG.position.x = GX; gR.position.x = AX;

    // ================================================================ area: two bricks
    const TOPA = 0.7;
    const plank = box(2.6, 0.05, 1.1, M.matte(0xc8995a, { roughness: 0.8 })); plank.position.set(0.55, TOPA - 0.025, 0); gA.add(plank);
    const tbl = box(2.7, TOPA - 0.05, 1.0, M.matte(0x3a3f4b)); tbl.position.set(0.55, (TOPA - 0.05) / 2, 0); gA.add(tbl);
    const brickM = M.matte(0xb5523a, { roughness: 0.9 });
    const b1 = box(BRICK.L, BRICK.H, BRICK.W, brickM); const b2 = box(BRICK.L, BRICK.W, BRICK.H, brickM);
    gA.add(b1, b2);
    const sc1 = makeSpringScale(0.5, 50), sc2 = makeSpringScale(0.5, 50); gA.add(sc1, sc2);
    const l1 = stage.label('', [0, 0, 0], gA, 'hot'), l2 = stage.label('', [0, 0, 0], gA, 'hot');
    const lA1 = stage.label('flat: 253 cm² touching', [0, 0, 0], gA), lA2 = stage.label('on edge: 161 cm² touching', [0, 0, 0], gA);

    // ================================================================ smoothness: two metal blocks, variable roughness
    const SW = 2.0, SD = 1.0;
    const fS1 = roughField(31, 60, SW, SD, 0.1, 0.15), fS2 = roughField(37, 60, SW, SD, 0.1, 0.15);
    const lowS = roughMesh(fS1, SW, SD, M.metal(0x9aa3b2, { roughness: 0.35 }), { seg: 100 }); lowS.position.y = 0.4; gS.add(lowS);
    const baseS = box(SW, 0.4, SD, M.metal(0x7c8594, { roughness: 0.45 })); baseS.position.y = 0.2; gS.add(baseS);
    const upS = new THREE.Group(); gS.add(upS);
    const upSM = roughMesh(fS2, SW, SD, M.metal(0xc9ced8, { roughness: 0.3 }), { flip: true, seg: 100 }); upS.add(upSM);
    const upSB = box(SW, 0.3, SD, M.metal(0xb7bfcc, { roughness: 0.3 })); upSB.position.y = 0.15; upS.add(upSB);
    const cS = dots(60 * 30, 0.02, 0xff5a3a, 6, 0.95); gS.add(cS);
    const gridS = []; for (let i = 0; i < 60; i++) for (let j = 0; j < 30; j++) gridS.push([(-0.5 + (i + 0.5) / 60) * SW * 0.96, (-0.5 + (j + 0.5) / 30) * SD * 0.94]);
    const lSm = stage.label('', [0, 1.15, 0.3], gS, 'hot');

    // ================================================================ ice: a skate blade on ice
    const iceM = M.matte(0xcfe8ff, { roughness: 0.15, transparent: true, opacity: 0.9 });
    const iceB = box(2.4, 0.3, 1.2, iceM); iceB.position.y = 0.15; gI.add(iceB);
    const layer = box(2.4, 0.012, 1.2, M.glow(0x8ec5ff, { transparent: true, opacity: 0.5 })); layer.position.y = 0.306; gI.add(layer);
    const skate = new THREE.Group(); gI.add(skate);
    const blade = box(0.9, 0.08, 0.012, M.metal(0xd8dde6, { roughness: 0.15 })); blade.position.y = 0.34; skate.add(blade);
    const boot = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.45, 6, 16), M.matte(0xf2f4f7)); boot.rotation.z = Math.PI / 2; boot.position.set(0, 0.5, 0); boot.scale.set(1, 1, 0.9); skate.add(boot);
    const shaftB = box(0.18, 0.4, 0.18, M.matte(0xf2f4f7)); shaftB.position.set(-0.12, 0.72, 0); skate.add(shaftB);
    for (const x of [-0.3, 0.3]) skate.add(beam([x, 0.38, 0], [x * 0.9, 0.45, 0], 0.012, M.metal(0xb7bfcc)));
    const melt = dots(30, 0.01, 0x8ec5ff, 6, 0.8); gI.add(melt);
    const lIce = stage.label('', [0, 0.95, 0.3], gI, 'hot'), lLayer = stage.label('liquid-like surface layer (drawn much thicker)', [-0.6, 0.33, 0.62], gI);
    let skX = 0;

    // ================================================================ graphite: two hexagonal lattices
    const hexPts = (R, a) => { const out = []; for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) { if (Math.abs(i + j) > R) continue; const x = a * (i + j / 2), z = a * (j * Math.sqrt(3) / 2); for (const [dx, dz] of [[0, 0], [a / 2, a / (2 * Math.sqrt(3))]]) out.push([x + dx, z + dz]); } return out; };
    const lowPts = hexPts(9, 0.14), flakePts = hexPts(4, 0.14);
    const lowL = dots(lowPts.length, 0.035, 0x6b7280, 8, 1); gG.add(lowL);
    lowPts.forEach(([x, z], i) => lowL.place(i, x, 0.5, z, 1)); lowL.done();
    const flake = new THREE.Group(); gG.add(flake);
    const flakeL = dots(flakePts.length, 0.038, 0x8ef0ff, 8, 1); flake.add(flakeL);
    flakePts.forEach(([x, z], i) => flakeL.place(i, x, 0, z, 1)); flakeL.done();
    flake.position.y = 0.6;
    const slab = box(2.8, 0.45, 2.6, M.matte(0x2b2f36)); slab.position.y = 0.24; gG.add(slab);
    const lGr = stage.label('', [0, 1.05, 0.5], gG, 'hot');

    // ================================================================ air: a cyclist and air streaks
    const road = box(12, 0.05, 3, M.matte(0x2b2f36)); road.position.y = -0.025; gR.add(road);
    const bikeG = new THREE.Group(); gR.add(bikeG);
    const frameM = M.metal(0x2f6fd8, { roughness: 0.35 }), blk = M.matte(0x16181d);
    const wheels = [];
    for (const x of [-0.52, 0.52]) { const w = new THREE.Group(); w.position.set(x, 0.34, 0); w.add(torus(0.33, 0.02, blk, 40)); for (let i = 0; i < 8; i++) { const sp = box(0.64, 0.006, 0.006, M.metal(0xd8dde6)); sp.rotation.z = (i / 8) * Math.PI; w.add(sp); } bikeG.add(w); wheels.push(w); }
    [[[0, 0.3, 0], [-0.14, 0.82, 0]], [[0, 0.3, 0], [0.4, 0.84, 0]], [[-0.14, 0.82, 0], [0.4, 0.84, 0]], [[0, 0.3, 0], [-0.52, 0.34, 0]], [[-0.14, 0.82, 0], [-0.52, 0.34, 0]], [[0.4, 0.84, 0], [0.52, 0.34, 0]], [[0.4, 0.84, 0], [0.34, 0.98, 0]]].forEach(([a, b]) => bikeG.add(beam(a, b, 0.018, frameM)));
    const rider = makePerson({ shirt: 0xff7a59, s: 0.95 }); rider.position.set(-0.16, 0.86 - 0.92 * 0.95, 0); rider.pose({ arm: 1.0, lean: 0.35, stride: 0.6, swing: 0 }); bikeG.add(rider);
    const r = rng(9), streaks = [];
    for (let i = 0; i < 40; i++) { const s2 = box(0.4, 0.008, 0.008, M.glow(0x8ec5ff, { transparent: true, opacity: 0.5 })); s2.userData.p = [r() * 6 - 1, 0.3 + r() * 1.6, (r() - 0.5) * 1.6]; gR.add(s2); streaks.push(s2); }
    const aDrag = force(HEX.fric, 0.03, 0.14), aRoll = force(HEX.static, 0.03, 0.14); gR.add(aDrag, aRoll);
    const lDrag = stage.label('', [0, 0, 0], gR, 'hot'), lRoll = stage.label('', [0, 0, 0], gR);
    lDrag.element.style.setProperty('--c', COL.fric);
    let bikeX = 0;

    // ================================================================ board
    let cur = null;
    const chart = board(root, 2.0, 1.4, 720, 504, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      if (cur.focus === 'area') {
        title(g, 'Same brick, same load, same friction', '3 kg brick on a wooden plank, μk ≈ 0.5');
        const N = BRICK.m * G, F = BRICK.uk * N;
        const rows = [['Flat', BRICK.L * BRICK.W], ['On its edge', BRICK.L * BRICK.H]];
        g.font = 'bold 20px sans-serif';
        rows.forEach(([nm, A], i) => {
          const y = 120 + i * 150;
          g.fillStyle = '#e8eef8'; g.fillText(nm, 20, y);
          g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.75)';
          g.fillText(`Apparent area: ${fmt(A * 1e4, 0)} cm²`, 20, y + 32);
          g.fillText(`Pressure: ${fmt(N / A / 1000, 2)} kPa`, 20, y + 60);
          g.fillText(`Real contact ≈ N ÷ hardness: same`, 20, y + 88);
          g.fillStyle = COL.fric; g.fillRect(420, y - 20, (F / 20) * 250, 34);
          g.font = 'bold 20px sans-serif'; g.fillStyle = '#fff'; g.fillText(`friction ${fmtN(F)}`, 430, y + 4);
          g.font = 'bold 20px sans-serif';
        });
        g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('Amontons, 1699: friction ∝ load, not area.', 20, h - 20);
        return;
      }
      if (cur.focus === 'smooth') {
        title(g, 'Friction against roughness', 'clean metal on metal · illustrative');
        const A0 = axes(g, w, h, { x0: 80, y0: h - 70, y1: 80, xMin: -2, xMax: 1, yMax: 1, xTicks: [-2, -1, 0, 1], yTicks: [0, 0.5, 1], xFmt: (v) => String(10 ** v) + ' µm', yFmt: (v) => v.toFixed(1), xLabel: 'roughness →', yLabel: 'μ' });
        const pts = []; for (let u = -2; u <= 1.001; u += 0.02) pts.push([u, muRough(10 ** u)]);
        line(g, pts, A0.X, A0.Y, COL.static, 4);
        tag(g, 'atoms stick: adhesion', A0.X(-1.95), A0.Y(0.9), COL.warn, 'bold 16px sans-serif');
        tag(g, 'bumps lock together', A0.X(0.2), A0.Y(0.62), COL.warn, 'bold 16px sans-serif', w);
        tag(g, 'lowest in between', A0.X(-0.9), A0.Y(0.18), COL.good, 'bold 16px sans-serif');
        dot(g, A0.X(Math.log10(cur.ra)), A0.Y(muRough(cur.ra)), COL.static, 9);
        return;
      }
      if (cur.focus === 'ice') {
        title(g, 'Steel sliding on ice', 'shape after Weber et al. 2018 · illustrative values');
        const A0 = axes(g, w, h, { x0: 90, y0: h - 70, y1: 80, xMin: -40, xMax: 0, yMax: 0.06, xTicks: [-40, -30, -20, -10, 0], yTicks: [0, 0.02, 0.04, 0.06], xFmt: (v) => v + ' °C', yFmt: (v) => v.toFixed(2), xLabel: 'temperature →', yLabel: 'μ' });
        const pts = []; for (let T = -40; T <= 0; T += 0.5) pts.push([T, muIce(T)]);
        line(g, pts, A0.X, A0.Y, '#8ec5ff', 4);
        g.fillStyle = 'rgba(255,181,71,.18)'; const dTm = ((SKATER * G) / BLADE) * DTDP; g.fillRect(A0.X(-dTm), A0.y1, A0.X(0) - A0.X(-dTm), A0.y0 - A0.y1);
        tag(g, 'pressure melting', A0.X(-9.5), A0.y1 + 20, COL.static, 'bold 15px sans-serif');
        tag(g, 'only reaches here', A0.X(-9.5), A0.y1 + 40, COL.static, 'bold 15px sans-serif');
        tag(g, 'rinks: about −7 °C', A0.X(-12), A0.Y(0.01) + 30, COL.good, 'bold 15px sans-serif');
        dot(g, A0.X(cur.temp), A0.Y(muIce(cur.temp)), '#8ec5ff', 9);
        return;
      }
      if (cur.focus === 'super') {
        title(g, 'Graphite flake on graphite', 'friction vs twist, relative to lined-up');
        const A0 = axes(g, w, h, { x0: 80, y0: h - 70, y1: 80, xMax: 60, yMax: 1, xTicks: [0, 15, 30, 45, 60], yTicks: [0, 0.5, 1], xFmt: (v) => v + '°', yFmt: (v) => v.toFixed(1), xLabel: 'twist →' });
        const pts = []; for (let a = 0; a <= 60; a += 0.25) pts.push([a, muTwist(a)]);
        line(g, pts, A0.X, A0.Y, '#8ef0ff', 4);
        tag(g, 'lined up: locks', A0.X(3), A0.Y(0.95), COL.warn, 'bold 16px sans-serif');
        tag(g, 'twisted: superlubric', A0.X(18), A0.Y(0.12), COL.good, 'bold 16px sans-serif');
        dot(g, A0.X(cur.twist), A0.Y(muTwist(cur.twist)), '#8ef0ff', 9);
        g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('After Dienwiebel et al., Physical Review Letters, 2004.', 20, h - 20);
        return;
      }
      title(g, 'What slows a cyclist', '85 kg, sitting up · forces in newtons');
      const A0 = axes(g, w, h, { x0: 80, y0: h - 70, y1: 80, xMax: 50, yMax: 60, xTicks: [0, 10, 20, 30, 40, 50], yTicks: [0, 20, 40, 60], xFmt: (v) => v + '', yFmt: (v) => v + '', xLabel: 'km/h →', yLabel: 'N' });
      const pD = [], pR = [];
      for (let v = 0; v <= 50; v += 1) { pD.push([v, Math.min(60, drag(v / KMH))]); pR.push([v, CRR * M_RIDE * G]); }
      line(g, pR, A0.X, A0.Y, COL.static, 4); line(g, pD, A0.X, A0.Y, COL.fric, 4);
      tag(g, 'rolling: same at any speed', A0.X(22), A0.Y(CRR * M_RIDE * G) - 10, COL.static, 'bold 16px sans-serif');
      tag(g, 'air drag ∝ v²', A0.X(32), A0.Y(Math.min(60, drag(36 / KMH))) - 12, COL.fric, 'bold 16px sans-serif', w);
      dot(g, A0.X(cur.vkmh), A0.Y(Math.min(60, drag(cur.vkmh / KMH))), COL.fric, 9);
    }, [0, 0, 0]);
    const BOARD = { area: [1.25, 1.15, -0.55, 0.55], smooth: [SX + 1.8, 1.05, -0.5, 0.62], ice: [IX + 1.2, 0.72, -0.5, 0.5], super: [GX + 1.75, 1.15, -0.8, 0.75], air: [AX + 2.3, 1.75, -0.8, 1.0] };

    const st = {};
    let t = 0, tp = 0, ck = '';
    const inst = {
      go() { tp = 0; },
      update(dt, s) {
        dt = Math.max(0, dt);
        focusView(stage, st, s.focus, VIEWS);
        const narrow = fitNarrow(stage, [lA1, lA2, lLayer, lRoll]);
        const reel = inReel(), f = s.focus;
        gA.visible = f === 'area'; gS.visible = f === 'smooth'; gI.visible = f === 'ice'; gG.visible = f === 'super'; gR.visible = f === 'air';
        const Bp = BOARD[f];
        chart.mesh.position.set(...(reel ? { area: [0.2, 1.2, -0.4], smooth: [SX + 0.4, 1.65, -0.5], ice: [IX, 1.18, -0.4], super: [GX + 0.5, 1.9, -0.6], air: [AX + 0.8, 2.6, -0.8] }[f] : Bp.slice(0, 3)));
        chart.mesh.scale.setScalar(reel ? { area: 0.4, smooth: 0.7, ice: 0.5, super: 0.85, air: 1.1 }[f] : Bp[3]);
        chart.mesh.visible = reel || !narrow;
        t += dt; tp += dt;

        if (f === 'area') {
          const N = BRICK.m * G, Fk = BRICK.uk * N, Fs = 0.6 * N;
          const T1 = 1.5, T2 = 3.3;
          const F = tp < T1 ? Fs * (tp / T1) : tp < T2 ? Fk : 0;
          const x = tp < T1 ? 0 : 0.18 * Math.min(tp - T1, T2 - T1);
          if (tp > T2 + 1) inst.go();
          const x0 = 0.05;
          b1.position.set(x0 + x, TOPA + BRICK.H / 2, -0.25); b2.position.set(x0 + x, TOPA + BRICK.W / 2, 0.25);
          sc1.position.set(x0 + x + BRICK.L / 2 + 0.03, TOPA + 0.035, -0.25); sc2.position.set(x0 + x + BRICK.L / 2 + 0.03, TOPA + 0.035, 0.25);
          sc1.setForce(F); sc2.setForce(F);
          l1.position.set(x0 + x + 0.45, TOPA + 0.15, -0.25); l1.element.innerHTML = `pull <b>${fmtN(F)}</b>`;
          l2.position.set(x0 + x + 0.45, TOPA + 0.17, 0.25); l2.element.innerHTML = `pull <b>${fmtN(F)}</b>`;
          [l1, l2].forEach((l) => l.element.style.setProperty('--c', tp < T1 ? COL.static : COL.kinetic));
          lA1.position.set(x0 + x - 0.05, TOPA + 0.13, -0.25); lA2.position.set(x0 + x - 0.05, TOPA - 0.06, 0.42);
        } else if (f === 'smooth') {
          const amp = clamp(0.15 + 0.35 * Math.log10(s.ra / 0.01) / 3, 0.12, 0.5) * 0.9;   // bumps drawn bigger for rougher
          lowS.scale.y = amp / 0.1 * 0.35; upSM.scale.y = amp / 0.1 * 0.35;
          const ky = lowS.scale.y;
          const off = 0.12 * Math.sin(t * 0.4); upSM.position.x = off; upSB.position.x = off;
          const sums = gridS.map(([x, z]) => (fS1.h(x, z) + fS2.h(x - off, z)) * ky);
          const sorted = sums.slice().sort((a, b) => b - a);
          const smoothness = clamp(1 - Math.log10(s.ra / 0.01) / 3, 0, 1);    // 1 = mirror, 0 = rough
          const share = 0.01 + 0.25 * smoothness ** 3;
          const idx = Math.round(share * sums.length), gy = sorted[idx];
          upS.position.y = 0.4 + gy;
          let n = 0;
          gridS.forEach(([x, z], i) => { if (sums[i] > gy && n < cS.count) cS.place(n++, x, 0.4 + fS1.h(x, z) * ky + (sums[i] - gy) * 0.5, z, 1); });
          for (let i = n; i < cS.count; i++) cS.place(i, 0, -5, 0, 0.0001);
          cS.done();
          const mu = muRough(s.ra);
          lSm.position.set(0.4, 0.12, 0.6);
          lSm.element.innerHTML = s.ra < 0.03 ? `so smooth it sticks: μ ≈ ${mu.toFixed(2)}` : s.ra > 3 ? `rough: bumps lock, μ ≈ ${mu.toFixed(2)}` : `μ ≈ ${mu.toFixed(2)}`;
          lSm.element.style.setProperty('--c', mu > 0.45 ? COL.warn : COL.good);
        } else if (f === 'ice') {
          const layerK = s.temp > -13.5 ? 1 - (-s.temp) / 13.5 : 0;
          layer.material.opacity = 0.15 + 0.6 * layerK; layer.scale.y = 0.4 + 2.5 * layerK; layer.position.y = 0.3 + 0.006 * layer.scale.y;
          iceM.color.setHex(s.temp < -20 ? 0xe4f1ff : 0xcfe8ff);
          const mu = muIce(s.temp), sp = 0.6 * (0.05 / mu) ** 0.5;
          skX += sp * dt; if (skX > 0.7) skX = -0.7;
          skate.position.x = skX;
          for (let i = 0; i < 30; i++) { const ph = (t * 1.5 + i / 30) % 1; melt.place(i, skX - 0.45 - ph * 0.4, 0.31, (i % 3 - 1) * 0.01, (1 - ph) * (0.6 + layerK)); }
          melt.done();
          lIce.position.set(skX, 0.1, 0.75); lIce.element.innerHTML = `μ ≈ ${mu.toFixed(3)} at ${s.temp} °C`;
          lIce.element.style.setProperty('--c', mu < 0.013 ? COL.good : COL.static);
        } else if (f === 'super') {
          flake.rotation.y = s.twist * D2R;
          const mu = muTwist(s.twist);
          flake.position.x = 0.08 * Math.sin(t * 1.5) * (mu > 0.5 ? 0.2 : 1);   // locked flakes barely move
          flakeL.material.color.setHex(mu > 0.5 ? 0xff7a59 : 0x8ef0ff);
          lGr.position.set(0, 1.05, 0.6); lGr.element.innerHTML = mu > 0.5 ? 'atoms lined up: they lock' : 'twisted: glides almost freely';
          lGr.element.style.setProperty('--c', mu > 0.5 ? COL.warn : COL.good);
        } else {
          const v = s.vkmh / KMH, Fd = drag(v), Fr = CRR * M_RIDE * G;
          bikeX += v * dt;
          wheels.forEach((w) => { w.rotation.z = -bikeX / 0.34; });
          streaks.forEach((sk) => { const p = sk.userData.p; p[0] -= v * dt * 0.6; if (p[0] < -1.5) p[0] += 6; sk.position.set(p[0] + 0.6, p[1], p[2]); sk.scale.x = 0.3 + v / 5; });
          const kF = 0.04;
          aDrag.aim([-0.1, 1.35, 0.3], [-1, 0, 0], Fd * kF + 0.05);
          aRoll.aim([0, 0.03, 0.3], [-1, 0, 0], Fr * kF + 0.05);
          lDrag.position.set(-0.6 - Fd * kF * 0.5, 1.55, 0.3); lDrag.element.innerHTML = `air drag <b>${fmtN(Fd)}</b>`;
          lRoll.position.set(-0.7, 0.12, 0.4); lRoll.element.innerHTML = `rolling ${fmtN(Fr)}`;
        }
        cur = { focus: f, ra: s.ra, temp: s.temp, twist: s.twist, vkmh: s.vkmh };
        const kk = JSON.stringify(cur);
        if (kk !== ck) { ck = kk; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'area') {
          const N = BRICK.m * G;
          return `<div class="big">Both pulls: ${fmtN(BRICK.uk * N)}</div>
            <div class="row"><span>Load on each brick, 3 kg</span><b>${fmtN(N)}</b></div>
            <div class="row"><span>Flat: apparent area</span><b>253 cm²</b></div>
            <div class="row"><span>On edge: apparent area</span><b>161 cm²</b></div>
            <div class="row"><span>Sliding friction μk N, both</span><b>${fmtN(BRICK.uk * N)}</b></div>
            <small>Less area means more pressure on each bump, so the real contact comes out the same.</small>`;
        }
        if (f === 'smooth') {
          return `<div class="big">μ ≈ ${muRough(s.ra).toFixed(2)}</div>
            <div class="row"><span>Roughness, Ra</span><b>${s.ra < 0.1 ? s.ra.toFixed(3) : s.ra.toFixed(2)} µm</b></div>
            <div class="row"><span>For scale: a gauge block</span><b>≈ 0.025 µm</b></div>
            <div class="row"><span>A machined surface</span><b>≈ 1–3 µm</b></div>
            <small>Illustrative curve for clean metals. In air, oxide and grease films stop most cold-welding.</small>`;
        }
        if (f === 'ice') {
          const p = (SKATER * G) / BLADE, dT = p * DTDP;
          return `<div class="big">${Math.abs(s.temp) > dT ? 'Too cold for pressure melting' : 'Pressure could melt it here'}</div>
            <div class="row"><span>60 kg on a blade, 30 mm × 1 mm</span><b>${fmt(p / 1e6, 1)} MPa (${fmt(p / ATM, 0)} atm)</b></div>
            <div class="row"><span>Melting point lowered by</span><b>${fmt(dT, 1)} °C</b></div>
            <div class="row"><span>Ice temperature</span><b>${s.temp} °C</b></div>
            <div class="row"><span>Sliding friction, steel on ice</span><b>μ ≈ ${muIce(s.temp).toFixed(3)}</b></div>
            <small>${s.temp > -13.5 ? 'A liquid-like layer covers the ice, and sliding warms it further.' : 'Very cold ice is drier and stickier, more like sand; sliding still warms it a little.'}</small>`;
        }
        if (f === 'super') {
          const mu = muTwist(s.twist);
          return `<div class="big">${mu > 0.5 ? 'Locked: high friction' : 'Superlubric'}</div>
            <div class="row"><span>Twist of the flake</span><b>${s.twist}°</b></div>
            <div class="row"><span>Friction, relative to lined-up</span><b>${Math.round(mu * 100)}%</b></div>
            <small>Graphite’s atoms sit in hexagons, so the flake lines up again every 60°. In between the bumps can’t mesh.</small>`;
        }
        const v = s.vkmh / KMH, Fd = drag(v), Fr = CRR * M_RIDE * G;
        return `<div class="big">Air: ${fmtN(Fd)} · road: ${fmtN(Fr)}</div>
          <div class="row"><span>Drag ½ ρ Cd A v², Cd A = ${CDA} m²</span><b>${fmtN(Fd)}</b></div>
          <div class="row"><span>Rolling, Crr ${CRR} × 85 kg × g</span><b>${fmtN(Fr)}</b></div>
          <div class="row"><span>Power to keep going, F × v</span><b>${fmt((Fd + Fr) * v, 0)} W</b></div>
          <div class="row"><span>Share spent on the air</span><b>${Math.round((Fd / (Fd + Fr)) * 100)}%</b></div>
          <small>Double the speed: four times the drag and eight times the power for it.</small>`;
      },
    };
    return inst;
  },
};
