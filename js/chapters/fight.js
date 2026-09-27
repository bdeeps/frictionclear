// Chapter 3: friction we fight. Every machine loses some of its work to friction, as heat.
// Rolling vs sliding. Rolling resistance F = Crr × m g. Car tyres on asphalt Crr ≈ 0.010 (0.007–0.015);
//   a road bike's tyres ≈ 0.004; a steel train wheel on a rail ≈ 0.001 (Wikipedia "Rolling
//   resistance", table of Crr; Gillespie, Fundamentals of Vehicle Dynamics). Dragging the same load:
//   a car on locked tyres, μk ≈ 0.7 on dry asphalt; a bike and rider, rubber on tar μk 0.8; a rail
//   wagon, steel on steel μk 0.57 (see friction.js). Masses: car 1,200 kg, bike and rider 85 kg, an
//   empty 20 t goods wagon. A person can push steadily with about 300 N (a firm shove, leaning in).
// Bearings. SKF's simple estimate of a bearing's friction torque: M = 0.5 × μ × P × d, with μ ≈ 0.0015
//   for a deep groove ball bearing (SKF Rolling Bearings catalogue, "Friction"). A plain sleeve with oil
//   in it runs at roughly 0.05 at low speed; a dry steel shaft in a bronze bush about 0.2 (typical
//   handbook values). Power lost P = M ω. Ceiling fan: 350 rpm, about 40 N on each bearing (a 4 kg
//   rotor shared by two, plus the belt of wobble), 15 mm bore (a 6202 bearing). Mixer grinder motor:
//   18,000 rpm, about 20 N, 8 mm bore (a 608). See FanClear and MixerClear.
// Oil film (Stribeck curve). An engine's crankshaft bearing: film thickness h grows with speed, here
//   h ≈ 2.5 µm × √(rpm ÷ 2000) (journal bearings run with a minimum film of a few µm; illustrative),
//   against a combined roughness σ ≈ 0.4 µm. λ = h ÷ σ. Below λ ≈ 1 the peaks touch (boundary
//   lubrication, μ ≈ 0.1); between 1 and 3 they share the load (mixed); above 3 the film carries it all
//   (hydrodynamic, μ ≈ 0.001–0.005, rising slowly with speed as the oil is sheared). With no oil,
//   steel on steel is about 0.6 and parts gall and seize. The curve's shape follows Stribeck (1902);
//   its numbers are illustrative.
// Heat. A 1,200 kg car stopping from v loses ½ m v²; the front brakes do about 70% of the work. Two
//   front discs of cast iron, 8 kg each, c = 460 J/(kg·K) (Engineering Toolbox). With no time to cool,
//   each stop raises them by 0.7 × ½ m v² ÷ (2 × 8 × 460). Iron starts to glow dull red at about
//   525 °C (the Draper point). Rubbing your hands: μ ≈ 0.5 for skin, 10 N pressing, 0.5 m/s back and
//   forth: P = μ N v = 2.5 W. See HeatClear.
import { THREE, M, box, beam, sphere, torus, clamp } from '../kit.js';
import {
  G, KMH, TAU, board, panelBg, title, axes, line, dot, tag, hbars, COL, HEX, force, makeCar, makePerson,
  disc, roughField, roughMesh, dots, fitNarrow, inReel, focusView, fmt, fmtN, fmtW, rng,
} from '../friction.js';

const BX = 40, OX = 80, HX = 120;
export const ROLLERS = {
  car: { name: 'Car', m: 1200, crr: 0.010, slide: 0.7, what: 'tyres on asphalt', dragWhat: 'locked tyres' },
  bike: { name: 'Bicycle', m: 85, crr: 0.004, slide: 0.8, what: 'road-bike tyres', dragWhat: 'rubber on tar' },
  wagon: { name: 'Rail wagon', m: 20000, crr: 0.001, slide: 0.57, what: 'steel wheel on rail', dragWhat: 'steel on steel' },
};
const PUSH = 300;
export const BEARINGS = { ball: { name: 'Ball bearing', mu: 0.0015 }, oil: { name: 'Oiled sleeve', mu: 0.05 }, dry: { name: 'Dry bush', mu: 0.2 } };
export const MACHINES = { fan: { name: 'Ceiling fan', rpm: 350, P: 40, d: 0.015 }, mixer: { name: 'Mixer grinder', rpm: 18000, P: 20, d: 0.008 } };
const SIGMA = 0.4, C_IRON = 460, M_DISC = 8, M_CAR = 1200, FRONT = 0.7, T_AIR = 30;
const VIEWS = {
  roll: { pos: [0.4, 3.2, 10.2], target: [1.0, 1.35, 0] },
  bearing: { pos: [BX + 0.05, 0.6, 1.45], target: [BX + 0.18, 0.38, 0] },
  oil: { pos: [OX + 0.3, 1.25, 4.3], target: [OX + 0.55, 0.85, 0] },
  heat: { pos: [HX + 0.2, 0.95, 2.7], target: [HX + 0.4, 0.66, 0] },
};

export const bearingLoss = (b, mc) => { const B = BEARINGS[b], Mm = MACHINES[mc], T = 0.5 * B.mu * Mm.P * Mm.d, w = (Mm.rpm * TAU) / 60; return { T, P: T * w, w }; };
export function film(rpm, oil) {
  if (!oil) return { h: 0, lam: 0, mu: 0.6, regime: 'no oil: metal on metal' };
  const h = rpm <= 0 ? 0 : 2.5 * Math.sqrt(rpm / 2000), lam = h / SIGMA;
  const hydro = 0.002 + 0.0006 * (rpm / 1000);
  let mu, regime;
  if (lam < 1) { mu = 0.12; regime = 'boundary: peaks touch'; }
  else if (lam < 3) { const k = (lam - 1) / 2; mu = Math.exp(Math.log(0.12) * (1 - k) + Math.log(hydro) * k); regime = 'mixed: peaks share the load'; }
  else { mu = hydro; regime = 'full film: floating on oil'; }
  return { h, lam, mu, regime };
}
export const discRise = (vKmh) => (FRONT * 0.5 * M_CAR * (vKmh / KMH) ** 2) / (2 * M_DISC * C_IRON);

export default {
  id: 'fight',
  short: 'Friction we fight',
  title: 'Friction we fight: wheels, bearings and oil',
  subtitle: 'Rolling beats sliding, balls beat bushes, and a film of oil beats them all. What is left becomes heat.',
  view: VIEWS.roll,
  learn: `<p>Friction turns useful work into <b>heat</b>. Engineers spend a lot of effort fighting it, and they have three big tricks.</p>
    <p><b>Roll instead of slide.</b> A wheel doesn't rub the road; it just squashes a little as it turns, and some energy is lost in the squashing. That is <b>rolling resistance</b>, F = <b>Crr × m g</b>, and Crr is tiny: about 0.01 for car tyres, 0.004 for a racing bike, 0.001 for a train wheel on a steel rail. One person can push a 1,200 kg car on a flat road (about 120 N), but could never drag it with the wheels locked (over 8,000 N).</p>
    <p><b>Put balls in the bearings.</b> A spinning shaft needs a <b>bearing</b> to hold it. A plain bush rubs; a <b>ball bearing</b> lets hardened steel balls roll between two rings, with a friction coefficient of about 0.0015. That is why a ceiling fan spins for so long after you switch it off, and why a mixer grinder's motor can turn 18,000 times a minute without cooking itself (see FanClear and MixerClear).</p>
    <p><b>Float it on oil.</b> Where parts must slide, like the crankshaft in a car engine (see CarClear), <b>engine oil</b> is dragged into the gap and builds up a pressure that lifts the shaft off the metal on a film a few thousandths of a millimetre thick. The <b>Stribeck curve</b> shows how friction plunges once that film forms. At start-up the film isn't there yet, which is when engines wear most.</p>
    <p>Whatever friction is left becomes <b>heat</b>. Rub your hands and you make about 2.5 W. Stop a car from 100 km/h and its front brake discs warm by about 40 °C; stop again and again with no time to cool and they glow red (see HeatClear).</p>
    <p class="tip"><b>Try it:</b> lock the car's wheels and try to push it. Swap the mixer's ball bearings for a dry bush and see the watts. Start the engine from zero rpm, and take the oil out. Then brake a car from 130 km/h ten times in a row.</p>`,
  terms: [
    { t: 'Rolling resistance', d: 'The small force that slows a rolling wheel, mostly from the tyre squashing and springing back. F = Crr × m g.' },
    { t: 'Bearing', d: 'A part that holds a turning shaft and lets it spin with as little friction as possible.' },
    { t: 'Ball bearing', d: 'A bearing with steel balls rolling between an inner and an outer ring.' },
    { t: 'Lubricant', d: 'Oil or grease between two surfaces that keeps them apart and lowers friction.' },
    { t: 'Stribeck curve', d: 'A graph of friction against speed for an oiled bearing: high at start-up, lowest once an oil film forms.' },
    { t: 'Wear', d: 'Material rubbed away where two surfaces touch. Oil films and bearings cut it down.' },
  ],
  defaults: { focus: 'roll', thing: 'car', locked: false, bear: 'ball', mach: 'mixer', rpm: 2000, oil: true, vbrake: 100, stops: 1 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'roll', label: 'Rolling' }, { v: 'bearing', label: 'Bearings' }, { v: 'oil', label: 'Oil film' }, { v: 'heat', label: 'Heat' }] },
    { key: 'thing', type: 'seg', label: 'Rolling: push a…', options: [{ v: 'car', label: 'Car' }, { v: 'bike', label: 'Bicycle' }, { v: 'wagon', label: 'Rail wagon' }] },
    { key: 'locked', type: 'toggle', label: 'Rolling: lock the wheels', hint: 'Now it must slide instead of roll.' },
    { key: 'bear', type: 'seg', label: 'Bearings: type', options: [{ v: 'ball', label: 'Ball' }, { v: 'oil', label: 'Oiled sleeve' }, { v: 'dry', label: 'Dry bush' }], fmt: (v) => `μ ≈ ${BEARINGS[v].mu}` },
    { key: 'mach', type: 'seg', label: 'Bearings: in a…', options: [{ v: 'fan', label: 'Ceiling fan' }, { v: 'mixer', label: 'Mixer grinder' }], fmt: (v) => `${MACHINES[v].rpm.toLocaleString('en-IN')} rpm` },
    { key: 'rpm', type: 'range', label: 'Oil film: engine speed', min: 0, max: 6000, step: 50, ends: ['stopped', '6,000 rpm'], fmt: (v) => `${v.toLocaleString('en-IN')} rpm` },
    { key: 'oil', type: 'toggle', label: 'Oil film: engine oil' },
    { key: 'vbrake', type: 'range', label: 'Heat: stop from', min: 30, max: 130, step: 5, ends: ['30 km/h', '130 km/h'], fmt: (v) => `${v} km/h` },
    { key: 'stops', type: 'range', label: 'Heat: stops in a row, no cooling', min: 1, max: 12, step: 1, ends: ['1', '12'], fmt: (v) => `${v}` },
  ],
  onChange(s, key) {
    if (['thing', 'locked'].includes(key)) s.focus = 'roll';
    if (['bear', 'mach'].includes(key)) s.focus = 'bearing';
    if (['rpm', 'oil'].includes(key)) s.focus = 'oil';
    if (['vbrake', 'stops'].includes(key)) s.focus = 'heat';
  },
  quiz: [
    { q: 'Car tyres have a rolling resistance coefficient of about 0.01. Roughly what force keeps a 1,200 kg car rolling slowly on a flat road?', options: ['12 N', '120 N', '1,200 N', '12,000 N'], answer: 1, why: 'F = Crr × m g = 0.01 × 1,200 kg × 9.81 m/s² ≈ 118 N. That is why one person can push a car.' },
    { q: 'Why do engines wear most just after they start?', options: ['The oil is too hot', 'The oil film hasn’t built up yet, so metal touches metal', 'The fuel is cold', 'The pistons are lighter'], answer: 1, why: 'The oil film needs speed to form. At start-up the bearings run in boundary lubrication, where the high points touch.' },
    { q: 'Where does the energy go when friction slows something down?', options: ['It is destroyed', 'Mostly into heat', 'Into the air as light', 'Back into the fuel'], answer: 1, why: 'Energy is conserved (see EnergyClear). Friction turns kinetic energy into heat in the rubbing surfaces.' },
  ],
  reel: [
    { ms: 5000, caption: 'Brake again and again with no time to cool, and friction heats the discs until they glow.', set: { focus: 'heat', vbrake: 120, stops: 1 }, anim: { stops: [1, 12] }, view: { pos: [HX + 0.05, 0.66, 1.2], target: [HX + 0.05, 0.64, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gR = new THREE.Group(), gB = new THREE.Group(), gO = new THREE.Group(), gH = new THREE.Group(); root.add(gR, gB, gO, gH);
    gB.position.x = BX; gO.position.x = OX; gH.position.x = HX;

    // ================================================================ rolling: a person pushing
    const road = box(30, 0.06, 6, M.matte(0x2b2f36)); road.position.y = -0.03; gR.add(road);
    const marks = new THREE.Group(); gR.add(marks);
    for (let x = -15; x < 15; x += 1.5) { const d = box(0.7, 0.01, 0.1, M.matte(0xe8e2c8)); d.position.set(x, 0.005, 1.6); marks.add(d); }
    const rail = new THREE.Group(); gR.add(rail);
    for (const z of [-0.72, 0.72]) { const r = box(30, 0.12, 0.07, M.metal(0xb9bec8)); r.position.set(0, 0.06, z); rail.add(r); }
    for (let x = -15; x < 15; x += 0.7) { const sl = box(0.25, 0.08, 2.2, M.matte(0x4a3a2a)); sl.position.set(x, 0.0, 0); rail.add(sl); }
    const car = makeCar(0x3b82f6); gR.add(car);
    const bike = makeBike(); gR.add(bike);
    const wagon = makeWagon(); gR.add(wagon);
    const pusher = makePerson({ shirt: 0xffb547 }); gR.add(pusher);
    const aPush = force(HEX.pull, 0.04, 0.22), aRes = force(HEX.fric, 0.04, 0.22); gR.add(aPush, aRes);
    const lPush = stage.label('', [0, 0, 0], gR, 'hot'), lRes = stage.label('', [0, 0, 0], gR);
    let rollX = 0;

    // ================================================================ bearing: a cutaway ball bearing on a shaft
    const bear = new THREE.Group(); bear.position.set(0, 0.3, 0); gB.add(bear);
    const steel = M.metal(0xc9ced8, { roughness: 0.2 }), dark = M.metal(0x8c95a3, { roughness: 0.35 });
    const outer = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 20, 64), steel); outer.scale.z = 1.4; bear.add(outer);
    const inner = new THREE.Group(); bear.add(inner);
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.03, 20, 64), steel); innerRing.scale.z = 1.4; inner.add(innerRing);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 32), dark); shaft.rotation.x = Math.PI / 2; inner.add(shaft);
    const flat = box(0.02, 0.09, 0.5, M.metal(0x6b7280)); flat.position.x = 0.036; inner.add(flat);
    const balls = new THREE.Group(); bear.add(balls);
    const ballM = M.metal(0xe8ecf2, { roughness: 0.08 });
    const NB = 9;
    for (let i = 0; i < NB; i++) { const b = sphere(0.037, ballM, 24); const a = (i / NB) * TAU; b.position.set(0.1175 * Math.cos(a), 0.1175 * Math.sin(a), 0); balls.add(b); }
    const cage = new THREE.Mesh(new THREE.TorusGeometry(0.1175, 0.006, 8, 64), M.plastic(0xc79a3a)); cage.position.z = 0.03; balls.add(cage);
    const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.1, 48, 1, true), M.metal(0xb08d57, { roughness: 0.35, side: THREE.DoubleSide })); bush.rotation.x = Math.PI / 2; bear.add(bush);
    const bushIn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 48, 1, true), M.metal(0xb08d57, { roughness: 0.35, side: THREE.DoubleSide })); bushIn.rotation.x = Math.PI / 2; bear.add(bushIn);
    const bushFace = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.19, 48), M.metal(0xb08d57, { roughness: 0.4, side: THREE.DoubleSide })); bushFace.position.z = 0.05; bear.add(bushFace);
    const oilRing = new THREE.Mesh(new THREE.RingGeometry(0.045, 0.051, 48), M.glow(0xffb547, { transparent: true, opacity: 0.8, side: THREE.DoubleSide })); oilRing.position.z = 0.051; bear.add(oilRing);
    const hot = new THREE.Mesh(new THREE.RingGeometry(0.045, 0.06, 48), M.glow(0xff5a3a, { transparent: true, opacity: 0.0, side: THREE.DoubleSide })); hot.position.z = 0.052; bear.add(hot);
    const stand = box(0.5, 0.08, 0.3, M.matte(0x3a3f4b)); stand.position.set(0, 0.04, 0); gB.add(stand);
    const pillar = box(0.08, 0.12, 0.1, M.matte(0x3a3f4b)); pillar.position.set(0, 0.12, 0); gB.add(pillar);
    const lBear = stage.label('', [0, 0.02, 0.22], gB, 'hot');

    // ================================================================ oil film: rough shaft over rough bearing, oil between
    const OW = 2.0, OD = 1.0;
    const fL = roughField(21, 60, OW, OD, 0.1, 0.15), fU = roughField(27, 60, OW + 0.4, OD, 0.1, 0.15);
    const lowO = roughMesh(fL, OW, OD, M.metal(0xb08d57, { roughness: 0.4 }), { seg: 110 }); lowO.position.y = 0.3; gO.add(lowO);
    const baseO = box(OW, 0.3, OD, M.metal(0x8d6f44, { roughness: 0.5 })); baseO.position.y = 0.15; gO.add(baseO);
    const upO = new THREE.Group(); gO.add(upO);
    const upMesh = roughMesh(fU, OW + 0.4, OD, M.metal(0xc9ced8, { roughness: 0.3 }), { flip: true, seg: 130 }); upO.add(upMesh);
    const upBodyO = box(OW + 0.4, 0.25, OD, M.metal(0xaab2bf, { roughness: 0.3 })); upBodyO.position.y = 0.13; upO.add(upBodyO);
    const oilSlab = box(OW, 1, OD, M.clear(0xffb547, 0.35, { roughness: 0.1 })); gO.add(oilSlab);
    const oilDots = dots(120, 0.018, 0xffcf7a, 6, 0.8); gO.add(oilDots);
    const cO = dots(60 * 32, 0.02, 0xff5a3a, 6, 0.95); gO.add(cO);
    const gridO = []; for (let i = 0; i < 60; i++) for (let j = 0; j < 32; j++) gridO.push([(-0.5 + (i + 0.5) / 60) * OW * 0.96, (-0.5 + (j + 0.5) / 32) * OD * 0.94]);
    const lOil = stage.label('', [0, 1.2, 0], gO, 'hot'), lScale = stage.label('crankshaft bearing, magnified about 20,000×', [0, 0.02, 0.65], gO);
    const r = rng(5), oilP = Array.from({ length: 120 }, () => [r() * OW - OW / 2, r(), (r() - 0.5) * OD * 0.9]);
    let oilOff = 0;

    // ================================================================ heat: brake disc and caliper
    const hub = new THREE.Group(); hub.position.set(0, 0.45, 0); gH.add(hub);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x8a8f98, metalness: 0.85, roughness: 0.35, emissive: 0x000000 });
    const bDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.028, 64), discMat); bDisc.rotation.x = Math.PI / 2; bDisc.castShadow = true; hub.add(bDisc);
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 32), M.metal(0x6b7280)); hat.rotation.x = Math.PI / 2; hat.position.z = 0.03; hub.add(hat);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8), M.metal(0xd8dde6)); nut.rotation.x = Math.PI / 2; nut.position.set(0.06 * Math.cos(a), 0.06 * Math.sin(a), 0.065); hub.add(nut); }
    for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU; const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 8), M.matte(0x1b1d22)); hole.rotation.x = Math.PI / 2; hole.position.set(0.21 * Math.cos(a), 0.21 * Math.sin(a), 0); hub.add(hole); }
    const caliper = box(0.11, 0.2, 0.09, M.plastic(0xd8332f, { roughness: 0.3 })); caliper.position.set(0.25, 0.45 + 0.08, 0); caliper.rotation.z = -0.35; gH.add(caliper);
    const standH = box(0.9, 0.06, 0.4, M.matte(0x3a3f4b)); standH.position.set(0, 0.03, 0); gH.add(standH);
    const post = box(0.06, 0.4, 0.06, M.matte(0x3a3f4b)); post.position.set(0, 0.23, -0.08); gH.add(post);
    const heatDots = dots(40, 0.012, 0xff9a5a, 6, 0.6); gH.add(heatDots);
    const lHeat = stage.label('', [0, 0.92, 0], gH, 'hot');

    // ================================================================ board
    let cur = null;
    const chart = board(root, 2.0, 1.5, 720, 540, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      if (cur.focus === 'roll') {
        const R = ROLLERS[cur.thing];
        title(g, 'Force to keep it moving', `${R.name}, ${R.m.toLocaleString('en-IN')} kg · log scale`);
        const rows = [];
        for (const k of ['car', 'bike', 'wagon']) { const q = ROLLERS[k], W = q.m * G; rows.push({ label: `${q.name}, rolling`, v: q.crr * W, col: COL.good, on: k === cur.thing && !cur.locked }); rows.push({ label: `${q.name}, sliding`, v: q.slide * W, col: COL.warn, on: k === cur.thing && cur.locked }); }
        const L = (v) => Math.log10(Math.max(1, v));
        rows.forEach((rw) => { rw.text = fmtN(rw.v); rw.lv = L(rw.v); });
        hbars(g, rows.map((rw) => ({ ...rw, v: rw.lv })), { x0: 210, x1: w - 30, y0: 84, dy: 58, max: 6, bh: 30 });
        const px = 210 + (L(PUSH) / 6) * (w - 240);
        g.strokeStyle = COL.pull; g.setLineDash([6, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(px, 76); g.lineTo(px, 440); g.stroke(); g.setLineDash([]);
        tag(g, 'one person: ~300 N', px - 80, 462, COL.pull, 'bold 16px sans-serif');
        g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('Each step on the scale is 10× more force.', 20, h - 20);
        return;
      }
      if (cur.focus === 'bearing') {
        title(g, 'Power lost in one bearing', `${MACHINES[cur.mach].name}, ${MACHINES[cur.mach].rpm.toLocaleString('en-IN')} rpm · log scale`);
        const rows = [];
        for (const mc of ['fan', 'mixer']) for (const b of ['ball', 'oil', 'dry']) { const q = bearingLoss(b, mc); rows.push({ label: `${mc === 'fan' ? 'Fan' : 'Mixer'}: ${BEARINGS[b].name.toLowerCase()}`, v: Math.log10(q.P * 1000) + 0.5, col: b === 'ball' ? COL.good : b === 'oil' ? COL.static : COL.warn, on: b === cur.bear && mc === cur.mach, text: fmtW(q.P) }); }
        hbars(g, rows, { x0: 250, x1: w - 30, y0: 84, dy: 58, max: 5.5, bh: 30 });
        g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('Friction torque = ½ × μ × load × bore (SKF).', 20, h - 46); g.fillText('Power = torque × spin speed. Every watt becomes heat.', 20, h - 20);
        return;
      }
      if (cur.focus === 'oil') {
        title(g, 'The Stribeck curve', 'friction in an oiled bearing · log scales');
        const LY = (mu) => Math.log10(mu), LX = (rpm) => Math.log10(Math.max(10, rpm));
        const A0 = axes(g, w, h, { x0: 90, y0: h - 70, y1: 80, xMin: 1, xMax: 4, yMin: -3, yMax: 0, xTicks: [1, 2, 3, 4], yTicks: [-3, -2, -1, 0], xFmt: (v) => (10 ** v).toLocaleString('en-IN'), yFmt: (v) => String(10 ** v), xLabel: 'rpm →', yLabel: 'μ' });
        const A = { ...A0, X: (rpm) => A0.X(LX(rpm)) };
        const r1 = 2000 * (SIGMA / 2.5) ** 2, r3 = 2000 * ((3 * SIGMA) / 2.5) ** 2;
        g.fillStyle = 'rgba(255,122,89,.12)'; g.fillRect(A.X(10), A.y1, A.X(r1) - A.X(10), A.y0 - A.y1);
        g.fillStyle = 'rgba(255,181,71,.10)'; g.fillRect(A.X(r1), A.y1, A.X(r3) - A.X(r1), A.y0 - A.y1);
        const pts = []; for (let e = 1; e <= 3.78; e += 0.02) pts.push([10 ** e, LY(film(10 ** e, true).mu)]);
        line(g, pts, A.X, A.Y, COL.static, 4);
        tag(g, 'boundary', A.X(11), A.y0 - 12, COL.warn, 'bold 15px sans-serif');
        tag(g, 'mixed', A.X(r1) + 4, A.y0 - 12, COL.static, 'bold 15px sans-serif');
        tag(g, 'full oil film', A.X(1500), A.Y(-2.1), COL.good, 'bold 15px sans-serif');
        g.strokeStyle = 'rgba(255,255,255,.35)'; g.setLineDash([4, 6]); g.beginPath(); g.moveTo(A.X(800), A.y1); g.lineTo(A.X(800), A.y0); g.stroke(); g.setLineDash([]);
        tag(g, 'idle', A.X(800) + 5, A.y1 + 40, 'rgba(255,255,255,.6)', '15px sans-serif');
        g.setLineDash([8, 6]); g.strokeStyle = COL.warn; g.lineWidth = 2; g.beginPath(); g.moveTo(A.x0, A.Y(LY(0.6))); g.lineTo(A.x1, A.Y(LY(0.6))); g.stroke(); g.setLineDash([]);
        tag(g, 'no oil: steel on steel, 0.6', A.X(700), A.Y(LY(0.6)) + 22, COL.warn, '15px sans-serif');
        const f = film(cur.rpm, cur.oil);
        dot(g, A.X(Math.max(10, cur.rpm)), A.Y(LY(f.mu)), cur.oil ? COL.static : COL.warn, 9);
        return;
      }
      title(g, 'Front brake disc temperature', `stops from ${cur.vbrake} km/h, no time to cool`);
      const A = axes(g, w, h, { x0: 80, y0: h - 70, y1: 80, xMax: 12, yMax: 1000, xTicks: [0, 3, 6, 9, 12], yTicks: [0, 250, 500, 750, 1000], xFmt: String, yFmt: (v) => v + '', xLabel: 'stops →', yLabel: '°C' });
      const dT = discRise(cur.vbrake), pts = []; for (let n = 0; n <= 12; n++) pts.push([n, Math.min(1000, T_AIR + n * dT)]);
      g.setLineDash([8, 6]); g.strokeStyle = '#ff5a3a'; g.lineWidth = 2; g.beginPath(); g.moveTo(A.x0, A.Y(525)); g.lineTo(A.x1, A.Y(525)); g.stroke(); g.setLineDash([]);
      tag(g, 'iron starts to glow red, 525 °C', A.X(0.3), A.Y(525) - 10, '#ff7a59', '15px sans-serif');
      line(g, pts, A.X, A.Y, COL.static, 4);
      dot(g, A.X(cur.stops), A.Y(Math.min(1000, T_AIR + cur.stops * dT)), COL.static, 9);
    }, [0, 0, 0]);
    const BOARD = { roll: [5.4, 2.5, -2.2, 2.3], bearing: [BX + 0.62, 0.36, -0.3, 0.3], oil: [OX + 1.75, 1.3, -0.7, 0.62], heat: [HX + 1.05, 0.62, -0.3, 0.5] };

    const st = {};
    let t = 0, ck = '';
    const inst = {
      update(dt, s) {
        dt = Math.max(0, dt);
        focusView(stage, st, s.focus, VIEWS);
        const narrow = fitNarrow(stage, [lRes, lScale]);
        const reel = inReel(), f = s.focus;
        gR.visible = f === 'roll'; gB.visible = f === 'bearing'; gO.visible = f === 'oil'; gH.visible = f === 'heat';
        const Bp = BOARD[f];
        chart.mesh.position.set(...(reel ? { roll: [1.3, 4.3, -2], bearing: [BX + 0.1, 0.62, -0.3], oil: [OX + 0.2, 1.7, -0.5], heat: [HX + 0.05, 1.08, -0.3] }[f] : Bp.slice(0, 3)));
        chart.mesh.scale.setScalar(reel ? { roll: 2.2, bearing: 0.28, oil: 0.9, heat: 0.5 }[f] : Bp[3]);
        chart.mesh.visible = reel || !narrow;
        t += dt;

        if (f === 'roll') {
          const R = ROLLERS[s.thing], W = R.m * G, need = (s.locked ? R.slide : R.crr) * W, moves = need <= PUSH;
          car.visible = s.thing === 'car'; bike.visible = s.thing === 'bike'; wagon.visible = s.thing === 'wagon';
          rail.visible = s.thing === 'wagon'; marks.visible = s.thing !== 'wagon';
          const v = moves ? 0.8 : 0;                               // a slow walking push, m/s
          rollX += v * dt;
          marks.position.x = -(rollX % 1.5); rail.position.x = -(rollX % 0.7);
          const rear = s.thing === 'car' ? -2.14 : s.thing === 'bike' ? -0.95 : -3.3;
          const obj = s.thing === 'car' ? car : s.thing === 'bike' ? bike : wagon;
          if (!s.locked) obj.roll?.(v * dt);
          obj.position.set(0, 0, 0);
          const handY = s.thing === 'bike' ? 0.9 : s.thing === 'car' ? 0.95 : 1.1;
          pusher.position.set(rear - 0.75, 0, 0.2);
          const st2 = moves ? Math.sin(t * 5) * 0.35 : Math.sin(t * 14) * 0.05;
          pusher.pose({ arm: 1.35, lean: moves ? 0.35 : 0.5, stride: st2, swing: 0 });
          const kA = 1.4 / 3.2;                                      // arrow: log scale, 1 N → 0, 1 MN → 2.6 m
          aPush.aim([rear - 0.05, handY, 0.25], [1, 0, 0], kA * Math.log10(Math.max(1, Math.min(PUSH, need * 1.001))) );
          aRes.aim([rear + 0.6, 0.06, 0.9], [-1, 0, 0], kA * Math.log10(Math.max(1, need)));
          lPush.position.set(rear - 0.8, 2.15, 0.2);
          lPush.element.innerHTML = moves ? `pushing <b>${fmtN(need)}</b>: it rolls` : `max ${fmtN(PUSH)}: <b>won't budge</b>`;
          lPush.element.style.setProperty('--c', moves ? COL.good : COL.warn);
          lRes.position.set(rear + 1.2, 0.15, 1.2); lRes.element.innerHTML = `${s.locked ? 'sliding friction' : 'rolling resistance'} ${fmtN(need)}`;
        } else if (f === 'bearing') {
          const q = bearingLoss(s.bear, s.mach), ball = s.bear === 'ball';
          balls.visible = ball; outer.visible = ball; innerRing.visible = ball;
          bush.visible = bushIn.visible = bushFace.visible = !ball; oilRing.visible = s.bear === 'oil';
          bushFace.material.color.setHex(s.bear === 'oil' ? 0xb08d57 : 0x9a7a4a);
          const spinV = s.mach === 'mixer' ? 6 : 1.5;               // shown slowed right down
          inner.rotation.z -= spinV * dt;
          balls.rotation.z -= spinV * dt * 0.4;                     // the cage turns at about 0.4× shaft speed
          balls.children.forEach((b) => { if (b.isMesh && b !== cage) b.rotation.z += spinV * dt * 1.6; });
          hot.material.opacity = s.bear === 'dry' ? clamp(Math.log10(q.P * 1000) / 5, 0, 0.9) : 0;
          lBear.element.innerHTML = `${BEARINGS[s.bear].name}: loses <b>${fmtW(q.P)}</b>`;
          lBear.element.style.setProperty('--c', ball ? COL.good : s.bear === 'oil' ? COL.static : COL.warn);
        } else if (f === 'oil') {
          const fm = film(s.rpm, s.oil);
          // Place the upper surface so the share of touching peaks follows λ: many at λ < 1, none past 3.
          const sums = gridO.map(([x, z]) => fL.h(x, z) + fU.h(x - oilOff, z));
          const sorted = sums.slice().sort((p2, q2) => q2 - p2);
          const lam = s.oil ? fm.lam : 0;
          const idx = Math.round(clamp(60 * (1 - (lam - 1) / 2), 0, 60));
          const gyT = lam < 3 ? sorted[idx] : sorted[0] + 0.04 * Math.min(8, lam - 3);
          upO.position.y = 0.3 + gyT;
          const gy = upO.position.y - 0.3;
          let n = 0;
          gridO.forEach(([x, z], i) => { if (sums[i] > gy && n < cO.count) cO.place(n++, x, 0.3 + fL.h(x, z) + (sums[i] - gy) * 0.5, z, 1); });
          for (let i = n; i < cO.count; i++) cO.place(i, 0, -5, 0, 0.0001);
          cO.done();
          const moving = s.rpm > 0;
          oilOff = moving ? 0.15 * Math.sin(t * (0.3 + s.rpm / 6000)) : oilOff;
          upMesh.position.x = oilOff; upBodyO.position.x = oilOff;
          oilSlab.visible = s.oil; oilDots.visible = s.oil;
          oilSlab.scale.y = Math.max(0.01, gy + 0.1); oilSlab.position.y = 0.3 + (gy + 0.1) / 2 - 0.02;
          oilP.forEach((p, i) => { p[0] += (moving ? (0.15 + s.rpm / 8000) * p[1] : 0) * dt; if (p[0] > OW / 2) p[0] -= OW; oilDots.place(i, p[0], 0.3 + 0.12 + p[1] * Math.max(0, gy - 0.1), p[2], 1); });
          oilDots.done();
          lOil.position.set(0, 0.3 + gy + 0.45, 0.3);
          lOil.element.innerHTML = `${fm.regime} · μ ≈ ${fm.mu < 0.01 ? fm.mu.toFixed(4) : fm.mu.toFixed(2)}`;
          lOil.element.style.setProperty('--c', fm.lam >= 3 ? COL.good : fm.lam >= 1 ? COL.static : COL.warn);
        } else {
          const T = T_AIR + s.stops * discRise(s.vbrake);
          const k = clamp((T - 400) / 600, 0, 1);                  // glow from dull red towards orange
          discMat.emissive.setRGB(k * 1.0, k * k * 0.35, 0); discMat.emissiveIntensity = 1.2;
          discMat.color.setHex(T > 300 ? 0x6e6a6a : 0x8a8f98);
          hub.rotation.z -= dt * 1.2;
          const shim = clamp((T - 150) / 500, 0, 1);
          for (let i = 0; i < 40; i++) { const ph = (t * 0.4 + i / 40) % 1, a = (i / 40) * TAU; heatDots.place(i, 0.26 * Math.cos(a) * (1 - ph * 0.2), 0.45 + 0.26 * Math.sin(a) + ph * 0.5, 0.05, shim); }
          heatDots.done();
          lHeat.position.set(0, 0.1, 0.3); lHeat.element.innerHTML = `disc at <b>${fmt(T, 0)} °C</b>`;
          lHeat.element.style.setProperty('--c', T > 525 ? '#ff5a3a' : T > 300 ? COL.static : COL.good);
        }
        cur = { focus: f, thing: s.thing, locked: s.locked, bear: s.bear, mach: s.mach, rpm: s.rpm, oil: s.oil, vbrake: s.vbrake, stops: Math.round(s.stops) };
        const kk = JSON.stringify(cur);
        if (kk !== ck) { ck = kk; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'roll') {
          const R = ROLLERS[s.thing], W = R.m * G, roll = R.crr * W, slide = R.slide * W;
          return `<div class="big">${s.locked ? `Sliding: ${fmtN(slide)}` : `Rolling: ${fmtN(roll)}`}</div>
            <div class="row"><span>Weight, ${R.m.toLocaleString('en-IN')} kg × g</span><b>${fmtN(W)}</b></div>
            <div class="row"><span>Rolling, Crr ${R.crr} (${R.what})</span><b>${fmtN(roll)}</b></div>
            <div class="row"><span>Sliding, μk ${R.slide} (${R.dragWhat})</span><b>${fmtN(slide)}</b></div>
            <div class="row"><span>Sliding ÷ rolling</span><b>${fmt(slide / roll, 0)}×</b></div>
            <small>A firm push is about 300 N. ${roll <= PUSH ? 'Rolling, you can move it yourself.' : 'Even rolling, this needs more than one person.'}</small>`;
        }
        if (f === 'bearing') {
          const q = bearingLoss(s.bear, s.mach), Mm = MACHINES[s.mach], ball = bearingLoss('ball', s.mach);
          return `<div class="big">Loses ${fmtW(q.P)} as heat</div>
            <div class="row"><span>${Mm.name}: speed · load · bore</span><b>${Mm.rpm.toLocaleString('en-IN')} rpm · ${Mm.P} N · ${Mm.d * 1000} mm</b></div>
            <div class="row"><span>Friction coefficient μ</span><b>${BEARINGS[s.bear].mu}</b></div>
            <div class="row"><span>Friction torque ½ μ P d</span><b>${fmt(q.T * 1000, 3)} mN·m</b></div>
            <div class="row"><span>Compared with a ball bearing</span><b>${fmt(q.P / ball.P, 0)}×</b></div>
            <small>${s.bear === 'dry' && s.mach === 'mixer' ? 'Tens of watts in a spot the size of a pea: it would overheat and seize.' : 'Balls roll instead of rubbing, so they lose the least.'}</small>`;
        }
        if (f === 'oil') {
          const fm = film(s.rpm, s.oil);
          return `<div class="big">μ ≈ ${fm.mu < 0.01 ? fm.mu.toFixed(4) : fm.mu.toFixed(2)}</div>
            <div class="row"><span>Oil film thickness</span><b>${s.oil ? fmt(fm.h, 2) + ' µm' : 'none'}</b></div>
            <div class="row"><span>Film ÷ roughness (λ)</span><b>${s.oil ? fmt(fm.lam, 1) : '0'}</b></div>
            <div class="row"><span>Regime</span><b>${fm.regime}</b></div>
            <small>A human hair is about 70 µm thick. Numbers are illustrative; the shape follows Stribeck (1902).</small>`;
        }
        const dT = discRise(s.vbrake), T = T_AIR + Math.round(s.stops) * dT, E = 0.5 * M_CAR * (s.vbrake / KMH) ** 2;
        return `<div class="big">Discs at ${fmt(T, 0)} °C</div>
          <div class="row"><span>Energy per stop, ½ m v²</span><b>${fmt(E / 1000, 0)} kJ</b></div>
          <div class="row"><span>Front discs take 70%, 2 × 8 kg iron</span><b>+${fmt(dT, 0)} °C per stop</b></div>
          <div class="row"><span>Stops in a row</span><b>${Math.round(s.stops)}</b></div>
          <div class="row"><span>Rubbing your hands, μ N v</span><b>about 2.5 W</b></div>
          <small>${T > 525 ? 'Glowing: pads fade and grip less when this hot. Real brakes cool between stops.' : 'All that kinetic energy becomes heat in the discs, by friction.'}</small>`;
      },
    };
    return inst;
  },
};

// A simple bicycle, 1.75 m long, facing +x, with a rider. roll(dx) turns the wheels.
function makeBike() {
  const g = new THREE.Group(), frame = M.metal(0xd8332f, { roughness: 0.35 }), black = M.matte(0x16181d);
  const wheels = [];
  for (const x of [-0.52, 0.52]) { const w = new THREE.Group(); w.position.set(x, 0.34, 0); w.add(torus(0.33, 0.02, black, 40)); for (let i = 0; i < 8; i++) { const sp = box(0.64, 0.006, 0.006, M.metal(0xd8dde6)); sp.rotation.z = (i / 8) * Math.PI; w.add(sp); } g.add(w); wheels.push(w); }
  const P = { bb: [0, 0.3, 0], seat: [-0.14, 0.82, 0], head: [0.4, 0.84, 0], rear: [-0.52, 0.34, 0], front: [0.52, 0.34, 0] };
  [[P.bb, P.seat], [P.bb, P.head], [P.seat, P.head], [P.bb, P.rear], [P.seat, P.rear], [P.head, P.front]].forEach(([a, b]) => g.add(beam(a, b, 0.018, frame)));
  g.add(beam([0.4, 0.84, 0], [0.34, 0.98, 0], 0.015, frame));
  g.add(beam([0.34, 0.98, -0.2], [0.34, 0.98, 0.2], 0.012, M.metal(0xb7bfcc)));
  const saddle = box(0.2, 0.04, 0.1, black); saddle.position.set(-0.16, 0.86, 0); g.add(saddle);
  const rider = makePerson({ shirt: 0x5ce1a9, s: 0.95 }); rider.position.set(-0.16, 0.86 - 0.92 * 0.95, 0); rider.pose({ arm: 1.0, lean: 0.35, stride: 0.6, swing: 0 }); g.add(rider);
  g.roll = (dx) => wheels.forEach((w) => { w.rotation.z -= dx / 0.34; });
  return g;
}
// An open goods wagon on steel wheels, 7 m long, facing +x.
function makeWagon() {
  const g = new THREE.Group(), body = M.matte(0x7a3b2a), steel = M.metal(0x6b7280, { roughness: 0.4 });
  const tub = box(6.6, 1.3, 2.6, body); tub.position.set(0, 1.55, 0); g.add(tub);
  const deck = box(6.8, 0.2, 2.2, steel); deck.position.set(0, 0.8, 0); g.add(deck);
  const wheels = [];
  for (const x of [-2.4, -1.5, 1.5, 2.4]) for (const z of [-0.72, 0.72]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.12, 24), steel); w.rotation.x = Math.PI / 2; w.position.set(x, 0.58, z); w.castShadow = true; g.add(w); const sp = box(0.8, 0.06, 0.13, M.metal(0x9aa3b2)); w.add(sp); sp.rotation.x = Math.PI / 2; wheels.push(w); }
  g.roll = (dx) => wheels.forEach((w) => { w.rotation.y -= dx / 0.46; });
  return g;
}
