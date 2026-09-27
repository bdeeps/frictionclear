// Chapter 2: grip on the road. Friction between tyre and road is what lets a vehicle speed up, turn
// and stop at all.
// Braking. A tyre gives most grip when it still rolls, slipping about 10–20% against the road; once
//   the wheel locks it slides, and grip falls. Peak μ on dry asphalt about 0.8, wet 0.5, ice 0.1 (the
//   round figures used by road-safety texts; real tyres range from 0.7–1.0 dry and 0.05–0.15 on
//   ice). A locked, sliding tyre gives roughly 80% of its peak (Bosch Automotive Handbook, tyre μ–slip
//   curves; accident reconstruction uses about 0.7 for locked skids on dry asphalt). The curve
//   drawn is a simple fit with its peak at 12% slip.
//   ABS (Bosch, Mercedes-Benz S-Class, 1978) releases and re-applies each brake up to about 15 times a
//   second, holding the wheel just short of locking: near the peak, and still able to steer.
//   Braking distance at a steady deceleration μ g: d = v² ÷ (2 μ g). Reaction distance: 1 s × v
//   (drivers take roughly 0.7–1.5 s to react).
// Aquaplaning. In front of the tyre, water of depth h is met at speed v: the tyre must push away
//   Q = v × w × h (w = 195 mm tyre). Continental: a new tyre can move up to 30 litres a second at
//   80 km/h. The grooves carry some away: about void × tread depth (void ≈ 30% of the tread area).
//   About 2 mm more is squeezed out sideways (a rough allowance). What neither can clear builds a
//   wedge of water that lifts the tyre. Horne and Dreher (NASA TN
//   D-2056, 1963): full aquaplaning speed in deep water V ≈ 6.35 √p km/h with p in kPa; for a car tyre
//   at 220 kPa that is 94 km/h. Our wedge grows as (v ÷ V)² once the grooves are overwhelmed: a
//   rough teaching model, not a tyre test. New tread 8 mm, legal minimum 1.6 mm (EU and India's CMVR).
// Bicycle rim brake. Hand force on the lever, times about 4 through the lever and caliper arms (a
//   typical overall ratio for caliper brakes), clamps each pad on the rim. Two pads, μ about 0.5 dry
//   and 0.2 wet (typical rubber pad on aluminium rim; it varies a lot with the compound). The rim
//   braking surface is at 0.30 m radius on a 0.34 m wheel, so the road force is 0.30 ÷ 0.34 of the
//   rim friction. Rider plus bike 85 kg. A front brake can't stop harder than about 0.56 g on a
//   typical bike before the rear wheel lifts and the rider pitches over (Wilson, Bicycling Science).
import { THREE, M, box, beam, sphere, torus, clamp } from '../kit.js';
import {
  G, KMH, TAU, brakeDist, board, panelBg, title, axes, line, dot, tag, hbars, COL, HEX, force,
  makeCar, makeStrip, makePerson, disc, fitNarrow, inReel, focusView, fmt, fmtN, fmtM,
} from '../friction.js';

const AX = 40, BX = 80;
export const ROAD = {
  dry: { name: 'Dry', mu: 0.8, col: 0x2b2f36 },
  wet: { name: 'Wet', mu: 0.5, col: 0x1d2433 },
  ice: { name: 'Ice', mu: 0.1, col: 0xb9d4ea },
};
const LOCK = 0.8, SP = 0.12, T_REACT = 1.0;
const muSlip = (s, mu) => (s < SP ? mu * (2 * (s / SP) - (s / SP) ** 2) : LOCK * mu + (1 - LOCK) * mu * Math.exp(-(s - SP) / 0.22));
const W_TYRE = 0.195, P_KPA = 220, V_HORNE = 6.35 * Math.sqrt(P_KPA), VOID = 0.3, SIDE = 2;
const M_BIKE = 85, RATIO = 4, R_RIM = 0.3, R_WHEEL = 0.34, PITCH = 0.56;
const PAD = { dry: 0.5, wet: 0.2 };
const VIEWS = {
  brake: { pos: [3.6, 5.2, 14.5], target: [4.2, 1.4, 0] },
  aqua: { pos: [AX + 0.05, 0.95, 2.9], target: [AX + 0.25, 0.62, 0] },
  bike: { pos: [BX + 0.1, 1.05, 3.0], target: [BX + 0.2, 0.78, 0] },
};

// Aquaplaning: water flow, what the grooves carry, and how much of the contact patch is lifted.
export function aqua(vKmh, treadMm, waterMm) {
  const v = vKmh / KMH, Q = v * W_TYRE * waterMm / 1000 * 1000, Qg = v * W_TYRE * (VOID * treadMm) / 1000 * 1000;
  const extra = Math.max(0, waterMm - VOID * treadMm - SIDE);
  const lift = extra <= 0 ? 0 : clamp((vKmh / V_HORNE) ** 2 * Math.min(1, extra / 1.5), 0, 1);
  return { Q, Qg, extra, lift, mu: ROAD.wet.mu * (1 - lift) };
}
export function bikeBrake(hand, pad) {
  const Np = hand * RATIO, rim = 2 * PAD[pad] * Np, road = rim * (R_RIM / R_WHEEL);
  const a = Math.min(road / M_BIKE, PITCH * G);
  return { Np, rim, road, a, pitch: road / M_BIKE > PITCH * G };
}

export default {
  id: 'road',
  short: 'Grip on the road',
  title: 'Grip: how tyres drive, turn and stop',
  subtitle: 'Every push that moves a car or a bike comes through a patch of rubber the size of your palm.',
  view: VIEWS.brake,
  learn: `<p>A car's engine turns the wheels, but what actually pushes the car forward is the <b>road</b>, through friction on four patches of rubber, each about the size of your hand. The same grip lets you <b>turn</b> and <b>stop</b>. With no friction, like on sheet ice, the wheels just spin (see CarClear and MotorcycleClear).</p>
    <p>A rolling tyre doesn't slide on the road: the bit touching the ground is momentarily still. So the grip is <b>static friction</b>, and it is bigger than sliding friction. Typical tyre grip, μ: about <b>0.8 on a dry road, 0.5 in the wet, 0.1 on ice</b>. The shortest stop is a steady <b>μ × g</b> of deceleration, and the braking distance is <b>d = v² ÷ (2 μ g)</b>. Double the speed and you need <b>four times</b> the distance. On ice it is eight times longer than on a dry road.</p>
    <p>Stamp too hard and the wheels <b>lock</b> and skid. Now it is kinetic friction: grip drops by about a fifth, and a sliding tyre can't steer. <b>ABS</b> (anti-lock brakes) watches each wheel and releases the brake up to about 15 times a second, holding the tyre just short of skidding, at the top of its grip.</p>
    <p>In the rain, the tyre must push water out of the way: at 80 km/h a new tyre clears up to 30 litres a second through its <b>tread grooves</b>. Worn tread can't, water builds up in front, and the tyre rides up on a film of water: <b>aquaplaning</b>. There's nothing to grip, so you can't steer or brake.</p>
    <p>A bicycle's <b>rim brakes</b> squeeze rubber pads onto the wheel rim (see CycleClear). Friction at the rim turns into friction at the road. Wet rims grip far less until the pads wipe them dry.</p>
    <p class="tip"><b>Try it:</b> stop from 80 km/h on dry, wet and ice, with and without ABS. Then drive faster through deeper water on worn tyres. Squeeze the bike's brake harder until the rider tips over the bars.</p>`,
  terms: [
    { t: 'Grip', d: 'The friction between a tyre and the road. It drives, steers and stops every vehicle.' },
    { t: 'Braking distance', d: 'How far a vehicle travels once the brakes are on: v² ÷ (2 μ g) for a steady stop.' },
    { t: 'Wheel lock', d: 'When braking stops a wheel turning, so the tyre slides. Grip drops and you can’t steer.' },
    { t: 'ABS', d: 'Anti-lock braking system: it pulses the brakes so the wheels keep turning just short of a skid.' },
    { t: 'Tread', d: 'The grooves in a tyre. They channel water away so the rubber can touch the road.' },
    { t: 'Aquaplaning', d: 'When a tyre rides up on a film of water and loses contact with the road.' },
    { t: 'Rim brake', d: 'A bicycle brake that squeezes rubber pads onto the wheel’s rim.' },
  ],
  defaults: { focus: 'brake', road: 'dry', speed: 80, abs: true, aspeed: 80, tread: 8, water: 4, hand: 60, pad: 'dry' },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'brake', label: 'Braking' }, { v: 'aqua', label: 'Aquaplaning' }, { v: 'bike', label: 'Bike brake' }] },
    { key: 'road', type: 'seg', label: 'Braking: road', options: [{ v: 'dry', label: 'Dry' }, { v: 'wet', label: 'Wet' }, { v: 'ice', label: 'Ice' }], fmt: (v) => `μ ≈ ${ROAD[v].mu}` },
    { key: 'speed', type: 'range', label: 'Braking: speed', min: 20, max: 120, step: 5, ends: ['20 km/h', '120 km/h'], fmt: (v) => `${v} km/h` },
    { key: 'abs', type: 'toggle', label: 'Braking: ABS', hint: 'Off: the wheels lock and the tyres skid.' },
    { key: 'aspeed', type: 'range', label: 'Aquaplaning: speed', min: 30, max: 130, step: 5, ends: ['30 km/h', '130 km/h'], fmt: (v) => `${v} km/h` },
    { key: 'tread', type: 'seg', label: 'Aquaplaning: tread depth', options: [{ v: 8, label: 'New, 8 mm' }, { v: 4, label: 'Half, 4 mm' }, { v: 1.6, label: 'Legal limit, 1.6 mm' }] },
    { key: 'water', type: 'range', label: 'Aquaplaning: water on the road', min: 0.5, max: 10, step: 0.5, ends: ['damp', '10 mm'], fmt: (v) => `${v} mm` },
    { key: 'hand', type: 'range', label: 'Bike: squeeze on the lever', min: 0, max: 150, step: 5, ends: ['none', 'hard'], fmt: (v) => `${v} N` },
    { key: 'pad', type: 'seg', label: 'Bike: rim', options: [{ v: 'dry', label: 'Dry rim' }, { v: 'wet', label: 'Wet rim' }], fmt: (v) => `pad μ ≈ ${PAD[v]}` },
    { key: 'go', type: 'buttons', label: 'Run', items: [{ label: '▶ Brake again', act: (s, inst) => inst.go() }] },
  ],
  onChange(s, key) {
    if (['road', 'speed', 'abs'].includes(key)) s.focus = 'brake';
    if (['aspeed', 'tread', 'water'].includes(key)) s.focus = 'aqua';
    if (['hand', 'pad'].includes(key)) s.focus = 'bike';
  },
  quiz: [
    { q: 'A car needs 32 m to brake from 80 km/h on a dry road. About how far does it need from 80 km/h on ice, where grip is 8 times lower?', options: ['32 m', '64 m', '250 m', '4 m'], answer: 2, why: 'Braking distance is v² ÷ (2 μ g). With μ eight times smaller, the distance is eight times longer: about 250 m.' },
    { q: 'Why do anti-lock brakes (ABS) usually stop a car sooner on a wet road?', options: ['They press harder', 'They keep the tyres rolling, using static grip instead of sliding', 'They make the car lighter', 'They dry the road'], answer: 1, why: 'A rolling tyre grips with static friction, which is bigger than the kinetic friction of a skidding tyre. ABS also lets you keep steering.' },
    { q: 'What is the main job of the grooves in a tyre’s tread?', options: ['To look good', 'To carry water out of the way so the rubber can touch the road', 'To make the tyre lighter', 'To cool the engine'], answer: 1, why: 'On a wet road the grooves channel water away. With worn tread, water builds up and lifts the tyre: aquaplaning.' },
  ],
  reel: [
    { ms: 5600, caption: 'Braking distance is v² ÷ 2μg: on ice, a car at 60 km/h needs eight times as far to stop.', set: { focus: 'brake', road: 'ice', speed: 60, abs: true }, act: (s, inst) => inst.go(), view: { pos: [0.8, 2.4, 5.8], target: [0.8, 1.9, 0] }, spin: 0 },
    { ms: 5000, caption: 'Too fast on worn tyres, a wedge of water lifts the tyre off the road: aquaplaning.', set: { focus: 'aqua', tread: 1.6, water: 5, aspeed: 50 }, anim: { aspeed: [50, 110] }, view: { pos: [AX + 0.1, 0.62, 1.35], target: [AX + 0.08, 0.58, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gB = new THREE.Group(), gA = new THREE.Group(), gK = new THREE.Group(); root.add(gB, gA, gK);
    gA.position.x = AX; gK.position.x = BX;

    // ================================================================ braking
    const strip = makeStrip(160); gB.add(strip);
    const car = makeCar(0x3b82f6); gB.add(car);
    const skidM = M.matte(0x0b0c0f, { transparent: true, opacity: 0.8 });
    const skids = [-1, 1].map((z) => { const k = box(1, 0.012, 0.16, skidM); k.position.set(0, 0.008, z * 0.81); gB.add(k); return k; });
    const stopLine = box(0.12, 0.02, 7, M.glow(0xffb547)); stopLine.position.y = 0.012; gB.add(stopLine);
    const lStop = stage.label('', [0, 0.4, 3.2], gB, 'hot'); lStop.element.style.setProperty('--c', COL.static);
    const lCar = stage.label('', [0, 2.2, 0], gB, 'hot');
    const aF = force(HEX.fric, 0.05, 0.28); gB.add(aF);

    // ================================================================ aquaplaning: a tyre close up
    const tyre = new THREE.Group(); tyre.position.set(0, 0.33, 0); gA.add(tyre);
    const rubber = M.matte(0x16181d, { roughness: 0.9 });
    const tyreBody = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, W_TYRE, 64, 1, true), rubber); tyreBody.rotation.x = Math.PI / 2; tyre.add(tyreBody);
    const side = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.33, 48), M.matte(0x22252c, { side: THREE.DoubleSide }));
    for (const z of [-1, 1]) { const sd = side.clone(); sd.position.z = z * W_TYRE / 2; tyre.add(sd); }
    const rimA = disc(0.2, W_TYRE * 0.9, M.metal(0xb7bfcc)); rimA.rotation.x = Math.PI / 2; tyre.add(rimA);
    const grooves = [];
    for (const z of [-0.06, -0.02, 0.02, 0.06]) { const gr = torus(0.328, 0.007, M.matte(0x050506), 64); gr.position.z = z; tyre.add(gr); grooves.push(gr); }
    const treadBlocks = [];
    for (let i = 0; i < 36; i++) { const b = box(0.012, 0.03, W_TYRE * 0.96, M.matte(0x050506)); const a = (i / 36) * TAU; b.position.set(0.33 * Math.cos(a), 0.33 * Math.sin(a), 0); b.rotation.z = a; tyre.add(b); treadBlocks.push(b); }
    const roadA = box(3.2, 0.06, 1.2, M.matte(0x1d2433, { roughness: 0.6 })); roadA.position.y = -0.03; gA.add(roadA);
    const waterMat = M.clear(0x4aa3ff, 0.45, { roughness: 0.05 });
    const waterA = box(3.2, 1, 1.2, waterMat); gA.add(waterA);
    // The wedge of water pushing in under the front of the tyre.
    const wedgeGeo = new THREE.BufferGeometry();
    wedgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6 * 3), 3));
    wedgeGeo.setIndex([0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0]);
    const wedge = new THREE.Mesh(wedgeGeo, M.glow(0x4aa3ff, { transparent: true, opacity: 0.75, side: THREE.DoubleSide })); gA.add(wedge);
    const spray = [];
    for (let i = 0; i < 40; i++) { const d = sphere(0.012, M.glow(0x9fd0ff, { transparent: true, opacity: 0.7 }), 6); gA.add(d); spray.push(d); }
    const lPatch = stage.label('', [0, 0, 0.35], gA, 'hot'), lMag = stage.label('water depth drawn 10× deeper', [-0.9, 0.06, 0.62], gA);

    // ================================================================ bicycle front wheel and rim brake
    const bike = new THREE.Group(); gK.add(bike);
    const wheel = new THREE.Group(); wheel.position.set(0, R_WHEEL, 0); bike.add(wheel);
    wheel.add(torus(R_WHEEL - 0.014, 0.014, M.matte(0x1b1d22), 64));
    const rimK = torus(R_RIM + 0.012, 0.012, M.metal(0xc9ced8, { roughness: 0.25 }), 64); rimK.scale.z = 1.3; wheel.add(rimK);
    for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU; wheel.add(beam([0, 0, (i % 2 ? 1 : -1) * 0.025], [R_RIM * Math.cos(a), R_RIM * Math.sin(a), 0], 0.0025, M.metal(0xd8dde6), 6)); }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 16), M.metal(0x8c95a3)); hub.rotation.x = Math.PI / 2; wheel.add(hub);
    const valve = box(0.012, 0.03, 0.012, M.metal(0xd8dde6)); valve.position.set(0, R_RIM - 0.02, 0); wheel.add(valve);
    // fork and caliper at the top of the wheel, a little forward
    const forkM = M.metal(0x2a2e37, { roughness: 0.4 });
    for (const z of [-0.055, 0.055]) bike.add(beam([0, R_WHEEL, z], [-0.06, R_WHEEL + 0.46, z * 0.7], 0.012, forkM));
    bike.add(beam([-0.06, R_WHEEL + 0.46, 0], [-0.13, R_WHEEL + 0.78, 0], 0.018, forkM));
    const bar = beam([-0.13, R_WHEEL + 0.78, -0.22], [-0.13, R_WHEEL + 0.78, 0.22], 0.012, M.metal(0xb7bfcc)); bike.add(bar);
    const lever = new THREE.Group(); lever.position.set(-0.11, R_WHEEL + 0.78, 0.16); bike.add(lever);
    const levArm = box(0.12, 0.012, 0.02, M.metal(0xc9ced8)); levArm.position.x = 0.06; lever.add(levArm);
    const pads = [], padMat = M.matte(0x2b2f36);
    const cal = new THREE.Group(); cal.position.set(0, R_WHEEL + R_RIM + 0.005, 0); cal.rotation.z = -0.35; bike.add(cal);
    for (const z of [-1, 1]) { const arm = box(0.03, 0.09, 0.012, M.metal(0xb7bfcc)); arm.position.set(0, 0.03, z * 0.045); cal.add(arm); const pd = box(0.05, 0.02, 0.012, padMat); pd.position.set(0, -0.015, z * 0.03); cal.add(pd); pads.push(pd); }
    const cable = beam([-0.11, R_WHEEL + 0.78, 0.16], [0, R_WHEEL + R_RIM + 0.07, 0], 0.004, M.matte(0x1b1d22)); bike.add(cable);
    const groundK = box(3, 0.04, 1, M.matte(0x2b2f36)); groundK.position.set(0, -0.02, 0); gK.add(groundK);
    const aRoadK = force(HEX.fric, 0.012, 0.06), aPadK = force(HEX.static, 0.01, 0.05); gK.add(aRoadK, aPadK);
    const lPad = stage.label('', [0, 0, 0], gK, 'hot'), lRoadK = stage.label('', [0, 0, 0], gK);
    lPad.element.style.setProperty('--c', COL.static);

    // ================================================================ board
    let cur = null;
    const chart = board(root, 2.0, 1.5, 720, 540, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      if (cur.focus === 'brake') {
        const { road, speed, abs } = cur, mu = ROAD[road].mu;
        title(g, 'Tyre grip vs wheel slip', `${ROAD[road].name} road`);
        const A = axes(g, w, 270, { x0: 70, y0: 230, y1: 76, xMax: 100, yMax: 1, xTicks: [0, 25, 50, 75, 100], yTicks: [0, 0.5, 1], xFmt: (v) => v + '%', yFmt: (v) => v.toFixed(1), xLabel: 'slip →', yLabel: 'μ' });
        for (const k of ['dry', 'wet', 'ice']) { const pts = []; for (let s = 0; s <= 1.001; s += 0.01) pts.push([s * 100, muSlip(s, ROAD[k].mu)]); line(g, pts, A.X, A.Y, k === road ? COL.good : 'rgba(255,255,255,.25)', k === road ? 4 : 2); }
        g.fillStyle = 'rgba(92,225,169,.15)'; g.fillRect(A.X(8), A.y1, A.X(18) - A.X(8), A.y0 - A.y1);
        tag(g, 'ABS', A.X(8) + 4, A.y1 + 20, COL.good, 'bold 16px sans-serif');
        const sNow = abs ? SP : 1;
        dot(g, A.X(sNow * 100), A.Y(muSlip(sNow, mu)), abs ? COL.good : COL.warn, 9);
        tag(g, abs ? 'rolling, near peak grip' : 'locked: sliding', A.X(abs ? 22 : 64), A.Y(muSlip(sNow, mu)) - 14, abs ? COL.good : COL.warn, 'bold 16px sans-serif');
        g.font = 'bold 20px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText(`Braking distance from ${speed} km/h`, 20, 318);
        const v = speed / KMH, rows = ['dry', 'wet', 'ice'].map((k) => { const d = brakeDist(v, ROAD[k].mu * (abs ? 1 : LOCK)); return { label: ROAD[k].name, v: d, col: k === 'ice' ? '#8ec5ff' : k === 'wet' ? '#5b9bff' : COL.good, on: k === road, text: fmtM(d) }; });
        hbars(g, rows, { x0: 110, x1: w - 30, y0: 340, dy: 54, max: Math.max(...rows.map((r) => r.v)), bh: 30 });
        g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText(abs ? 'With ABS: peak grip.' : 'Wheels locked: about 20% less grip.', 20, h - 16);
        return;
      }
      if (cur.focus === 'aqua') {
        const a = aqua(cur.aspeed, cur.tread, cur.water);
        title(g, 'Water in the tyre’s path', `${cur.water} mm of water · ${cur.tread} mm tread`);
        const vs = []; for (let v = 20; v <= 140; v += 20) vs.push(v);
        const A = axes(g, w, h - 150, { x0: 80, y0: h - 200, y1: 80, xMax: 140, xMin: 20, yMax: 60, xTicks: [20, 60, 100, 140], yTicks: [0, 20, 40, 60], xFmt: (v) => v + '', yFmt: (v) => v + '', xLabel: 'km/h →', yLabel: 'litres per second' });
        const qp = [], gp = [];
        for (let v = 20; v <= 140; v += 2) { const q = aqua(v, cur.tread, cur.water); qp.push([v, Math.min(60, q.Q)]); gp.push([v, Math.min(60, q.Qg)]); }
        line(g, qp, A.X, A.Y, '#4aa3ff', 4); line(g, gp, A.X, A.Y, COL.good, 3, [9, 6]);
        tag(g, 'water to move', A.X(100), A.Y(Math.min(60, aqua(100, cur.tread, cur.water).Q)) - 10, '#4aa3ff', 'bold 16px sans-serif', w);
        tag(g, 'grooves can carry', A.X(96), A.Y(Math.min(60, aqua(96, cur.tread, cur.water).Qg)) + 22, COL.good, 'bold 16px sans-serif', w);
        dot(g, A.X(cur.aspeed), A.Y(Math.min(60, a.Q)), '#4aa3ff', 8);
        g.font = 'bold 20px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText('Tyre touching the road', 20, h - 118);
        g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(20, h - 100, w - 40, 34);
        g.fillStyle = a.lift > 0.6 ? COL.warn : COL.good; g.fillRect(20, h - 100, (w - 40) * (1 - a.lift), 34);
        g.font = 'bold 18px sans-serif'; g.fillStyle = '#fff'; g.fillText(`${Math.round((1 - a.lift) * 100)}%`, 30, h - 76);
        g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(`Deep-water aquaplaning speed (NASA, 1963): about ${Math.round(V_HORNE)} km/h`, 20, h - 30);
        return;
      }
      const b = bikeBrake(cur.hand, cur.pad);
      title(g, 'Front brake: hand to road', `${cur.pad === 'dry' ? 'dry' : 'wet'} rim, pad μ ≈ ${PAD[cur.pad]}`);
      const rows = [
        { label: 'Your hand', v: cur.hand, col: COL.pull, text: fmtN(cur.hand) },
        { label: 'Each pad', v: b.Np, col: COL.normal, text: fmtN(b.Np) },
        { label: 'Rim friction', v: b.rim, col: COL.static, text: fmtN(b.rim) },
        { label: 'Road grip', v: b.road, col: COL.fric, text: fmtN(b.road) },
      ];
      hbars(g, rows, { x0: 170, x1: w - 30, y0: 86, dy: 62, max: 700, bh: 34 });
      g.font = 'bold 20px sans-serif'; g.fillStyle = '#e8eef8'; g.fillText(`Slowing at ${fmt(b.a, 1)} m/s² (${fmt(b.a / G, 2)} g)`, 20, 380);
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(20, 400, w - 40, 30);
      g.fillStyle = b.pitch ? COL.warn : COL.good; g.fillRect(20, 400, (w - 40) * Math.min(1, b.a / (PITCH * G)), 30);
      g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.65)'; g.fillText(b.pitch ? 'Past 0.56 g the back wheel lifts: over the bars!' : 'The bar fills at 0.56 g, where the back wheel lifts.', 20, 458);
      g.fillText(`From 25 km/h: stops in ${b.a > 0.01 ? fmtM(brakeDist(25 / KMH, b.a / G)) : 'never'}`, 20, 490);
    }, [0, 0, 0]);
    const BOARD = { brake: [9.2, 3.6, -2.5, 3.2], aqua: [AX + 1.25, 0.95, -0.7, 0.6], bike: [BX + 1.05, 0.72, -0.4, 0.56] };

    const st = {};
    let t = 0, key = '', ck = '', dist = 0, spin = 0;
    const inst = {
      go() { t = 0; dist = 0; },
      update(dt, s) {
        dt = Math.max(0, dt);
        if (focusView(stage, st, s.focus, VIEWS) && !inReel()) inst.go();
        const narrow = fitNarrow(stage, [lMag, lRoadK]);
        const reel = inReel(), f = s.focus;
        gB.visible = f === 'brake'; gA.visible = f === 'aqua'; gK.visible = f === 'bike';
        const B = BOARD[f];
        chart.mesh.position.set(...(reel ? (f === 'brake' ? [0.8, 4.3, -2] : [AX + 0.08, 1.28, -0.4]) : B.slice(0, 3)));
        chart.mesh.scale.setScalar(reel ? (f === 'brake' ? 2.4 : 0.6) : B[3]);
        chart.mesh.visible = reel || !narrow || f !== 'brake';
        if (narrow && !reel && f !== 'brake') chart.mesh.position.set(f === 'aqua' ? AX + 0.5 : BX + 0.4, f === 'aqua' ? 1.05 : 1.45, -0.5);
        const k = `${f}|${s.road}|${s.speed}|${s.abs}`;
        if (k !== key) { key = k; inst.go(); }
        t += dt;

        if (f === 'brake') {
          const mu = ROAD[s.road].mu * (s.abs ? 1 : LOCK), v0 = s.speed / KMH, a = mu * G, tStop = v0 / a, dStop = brakeDist(v0, mu);
          const T0 = 0.8, fast = Math.max(1, tStop / 3.2);
          let v = v0, d = 0, braking = false;
          if (t < T0) { dist += v0 * dt; }
          else { braking = true; const ts = Math.min(tStop, (t - T0) * fast); d = v0 * ts - 0.5 * a * ts * ts; v = v0 - a * ts; }
          const travelled = t < T0 ? dist : dist + d;
          strip.scroll(travelled);
          strip.mat.color.setHex(ROAD[s.road].col);
          car.position.set(0, 0, 0);
          car.brakeLights(braking && v > 0.01);
          if (s.abs || !braking) { spin = travelled; car.wheels.forEach((w) => { w.rotation.z = -spin / 0.33; }); }
          const skidLen = braking && !s.abs ? Math.min(80, d) : 0;
          skids.forEach((m) => { m.visible = skidLen > 0.05; m.scale.x = Math.max(0.01, skidLen); m.position.x = 1.32 - skidLen / 2; });
          const ahead = dStop - d;                           // where the car's nose will stop
          stopLine.position.x = 2.1 + ahead; stopLine.visible = braking && ahead < 60;
          lStop.position.set(2.1 + ahead, 0.4, 3.0); lStop.visible = stopLine.visible; lStop.element.innerHTML = `stops here · ${fmtM(dStop)}`;
          lCar.position.set(-0.2, 2.2, 0);
          lCar.element.innerHTML = !braking ? `${s.speed} km/h` : v > 0.01 ? `${fmt(v * KMH, 0)} km/h · ${s.abs ? 'ABS pulsing' : 'wheels locked!'}${fast > 1.05 ? ` · ${fmt(fast, 0)}× faster` : ''}` : `stopped after ${fmtM(dStop)}`;
          lCar.element.style.setProperty('--c', s.abs ? COL.good : COL.warn);
          aF.aim([0, 0.05, 1.3], [-1, 0, 0], braking && v > 0.01 ? 0.6 + 2.4 * mu : 0);
          if (braking && (t - T0) * fast > tStop + 2.5 * fast) inst.go();
        } else if (f === 'aqua') {
          const q = aqua(s.aspeed, s.tread, s.water), v = s.aspeed / KMH, hv = (s.water / 1000) * 10;   // water drawn 10× deeper
          waterA.scale.y = Math.max(0.001, hv); waterA.position.y = hv / 2;
          const lift = q.lift * Math.min(0.02, hv * 0.6);
          tyre.position.y = 0.33 + lift;
          tyre.rotation.z -= (v * dt) / 0.33 / 12;
          const gd = s.tread / 8;
          grooves.forEach((gr) => { gr.scale.set(1 - 0.02 * (1 - gd), 1 - 0.02 * (1 - gd), 0.4 + 0.8 * gd); gr.material.color.setHex(gd > 0.3 ? 0x050506 : 0x101114); });
          treadBlocks.forEach((b) => { b.scale.y = Math.max(0.15, gd); });
          // wedge: from ahead of the tyre, running under the front of the contact patch
          const len = 0.05 + 0.2 * q.lift, xf = 0.12, hh = Math.max(0.004, hv);
          const P = wedgeGeo.attributes.position, z = W_TYRE / 2;
          const pts = [[xf + 0.12, 0, -z], [xf - len, 0, -z], [xf + 0.12, hh * 1.3, -z], [xf + 0.12, 0, z], [xf - len, 0, z], [xf + 0.12, hh * 1.3, z]];
          pts.forEach((p, i) => P.setXYZ(i, p[0], p[1] + 0.001, p[2])); P.needsUpdate = true; wedgeGeo.computeVertexNormals();
          wedge.visible = q.extra > 0;
          spray.forEach((d, i) => { const ph = (t * (0.6 + v / 25) + i / spray.length) % 1, sd = i % 2 ? 1 : -1; d.position.set(0.2 + ph * 0.3, 0.02 + Math.sin(ph * Math.PI) * 0.1 * Math.min(1, v / 25), sd * (0.11 + ph * 0.25)); d.visible = s.water > 0.4; });
          lPatch.position.set(0, -0.02, 0.35);
          lPatch.element.innerHTML = q.lift > 0.85 ? 'aquaplaning: riding on water!' : q.lift > 0.05 ? `${Math.round((1 - q.lift) * 100)}% of the tyre still touches` : 'grooves clear the water: full grip';
          lPatch.element.style.setProperty('--c', q.lift > 0.5 ? COL.warn : COL.good);
        } else {
          const b = bikeBrake(s.hand, s.pad);
          // wheel spins down from 25 km/h at the braking rate, then starts again
          const v0 = 25 / KMH, tS = b.a > 0.05 ? v0 / b.a : 1e9, ts = t % (Math.min(tS, 6) + 1.2);
          const v = Math.max(0, v0 - b.a * Math.min(ts, tS));
          wheel.rotation.z -= (v * dt) / R_WHEEL / 4;         // shown at a quarter of real speed
          lever.rotation.y = -0.4 * (s.hand / 150);
          pads.forEach((p, i) => { p.position.z = (i ? 1 : -1) * (0.03 - 0.012 * Math.min(1, s.hand / 20)); });
          padMat.color.setHex(s.pad === 'wet' ? 0x3a4a5a : 0x2b2f36);
          rimK.material.color.setHex(s.pad === 'wet' ? 0x9fc3e6 : 0xc9ced8);
          const kF = 0.4 / 700;
          aPadK.aim([0.12, R_WHEEL + R_RIM + 0.04, 0.1], [1, -0.3, 0], b.rim * kF * 0.5);
          aRoadK.aim([0, 0.01, 0.12], [-1, 0, 0], b.road * kF);
          lPad.position.set(0.18, R_WHEEL + R_RIM + 0.14, 0.1); lPad.element.innerHTML = `rim friction <b>${fmtN(b.rim)}</b>`;
          lRoadK.position.set(-0.28, 0.08, 0.12); lRoadK.element.innerHTML = `road grip ${fmtN(b.road)}`;
        }
        cur = { focus: f, road: s.road, speed: s.speed, abs: s.abs, aspeed: s.aspeed, tread: s.tread, water: s.water, hand: s.hand, pad: s.pad };
        const kk = JSON.stringify(cur);
        if (kk !== ck) { ck = kk; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'brake') {
          const mu = ROAD[s.road].mu * (s.abs ? 1 : LOCK), v = s.speed / KMH, d = brakeDist(v, mu), dry = brakeDist(v, ROAD.dry.mu);
          return `<div class="big">Stops in ${fmtM(d)}</div>
            <div class="row"><span>Grip μ, ${ROAD[s.road].name.toLowerCase()} road${s.abs ? ', ABS' : ', locked'}</span><b>${fmt(mu, 2)}</b></div>
            <div class="row"><span>Deceleration μ g</span><b>${fmt(mu * G, 1)} m/s²</b></div>
            <div class="row"><span>Braking time v ÷ μg</span><b>${fmt(v / (mu * G), 1)} s</b></div>
            <div class="row"><span>Braking distance v² ÷ 2μg</span><b>${fmtM(d)}</b></div>
            <div class="row"><span>Plus 1 s to react</span><b>${fmtM(v * T_REACT)}</b></div>
            <small>${s.road === 'dry' && s.abs ? 'Double the speed and the braking distance goes up four times.' : `That is ${fmt(d / dry, 1)}× the dry-road distance with ABS.`}</small>`;
        }
        if (f === 'aqua') {
          const q = aqua(s.aspeed, s.tread, s.water);
          return `<div class="big">${q.lift > 0.85 ? 'Aquaplaning!' : `Grip left: μ ≈ ${fmt(q.mu, 2)}`}</div>
            <div class="row"><span>Water to push away, v × w × h</span><b>${fmt(q.Q, 1)} L/s</b></div>
            <div class="row"><span>Grooves can carry (30% of ${s.tread} mm)</span><b>${fmt(q.Qg, 1)} L/s</b></div>
            <div class="row"><span>Water left after ~2 mm squeezes out sideways</span><b>${fmt(q.extra, 1)} mm</b></div>
            <div class="row"><span>Tyre touching the road</span><b>${Math.round((1 - q.lift) * 100)}%</b></div>
            <small>A simple model. In deep water even new tyres aquaplane near ${Math.round(V_HORNE)} km/h (NASA, 1963).</small>`;
        }
        const b = bikeBrake(s.hand, s.pad);
        return `<div class="big">${b.pitch ? 'Over the bars!' : `Slowing at ${fmt(b.a / G, 2)} g`}</div>
          <div class="row"><span>Pad pressed on rim, ×${RATIO} lever</span><b>${fmtN(b.Np)} each</b></div>
          <div class="row"><span>Rim friction, 2 × μ × pad force</span><b>${fmtN(b.rim)}</b></div>
          <div class="row"><span>Road grip, × 0.30 ÷ 0.34 m</span><b>${fmtN(b.road)}</b></div>
          <div class="row"><span>Stopping from 25 km/h</span><b>${b.a > 0.01 ? fmtM(brakeDist(25 / KMH, b.a / G)) : '—'}</b></div>
          <small>${s.pad === 'wet' ? 'A wet rim: the pads must wipe off water before they grip, and μ falls to less than half.' : 'Rider and bike: 85 kg. The tyre could grip more; tipping over the front limits you first.'}</small>`;
      },
    };
    return inst;
  },
};
