// Chapter 4: friction we need. Without it you couldn't walk, write, tie a knot or play a violin.
// Walking. To push off, your shoe pushes the ground backwards and the ground's friction pushes you
//   forwards (Newton's third law, see NewtonClear). The "required coefficient of friction" (RCOF), the
//   ratio of the sideways to the downward force on the foot, peaks at about 0.17–0.20 for normal level
//   walking, more for fast walking and turning, less for short shuffling steps (e.g. Chang et al.,
//   Applied Ergonomics 2016; Burnfield & Powers, Ergonomics 2006). We use 0.10, 0.18 and 0.26.
//   Available μ for a rubber sole: dry concrete about 0.7; wet polished tiles about 0.22 (the UK HSE
//   treats a pendulum value below 24, μ ≈ 0.24, as high slip risk); ice about 0.1, less when wet.
//   You slip when the friction you need is more than the floor can give.
// Ballpoint pen. A 0.7 mm tungsten-carbide ball sits in a socket; friction from the paper makes it
//   roll, and as it rolls it carries ink from the reservoir onto the page (see PenClear). Each
//   centimetre of line turns it 10 mm ÷ (π × 0.7 mm) ≈ 4.5 times. On glass or grease the ball skids
//   instead of rolling, so no ink comes out.
// Rope round a post: the capstan equation (Euler 1769, Eytelwein 1808). T_load = T_hold × e^(μ θ),
//   θ = 2π × turns. μ ≈ 0.25 for a rope on a smooth steel bollard, about 0.4 on a rough wooden post
//   (typical values; they depend on the rope).
// Violin. Rosin makes the hair's static friction much bigger than its sliding friction, so the bow
//   grabs the string, drags it sideways, lets it slip back, and grabs it again: stick–slip. We model
//   the string under the bow as a mass on a spring (1 cycle a second, slowed down) dragged by a belt
//   with μs 0.8 and μk 0.35 with rosin, 0.25 and 0.25 without (illustrative values, of the order
//   measured for rosin by Smith and Woodhouse, J. Mech. Phys. Solids, 2000). The real A string of a
//   violin sounds 440 times a second. Bow forces are typically 0.1–1.5 N, bow speeds 0.05–0.5 m/s
//   (Schelleng, JASA 1973). A simple model: a real string's Helmholtz motion is a travelling kink.
import { THREE, M, box, beam, sphere, torus, tube, clamp } from '../kit.js';
import {
  G, TAU, board, panelBg, title, axes, line, dot, tag, hbars, COL, HEX, force, makePerson, disc,
  fitNarrow, inReel, focusView, fmt, fmtN,
} from '../friction.js';

const PX = 40, RX = 80, VX = 120;
export const FLOORS = { dry: { name: 'Dry concrete', mu: 0.7, col: 0x8c8f96 }, wet: { name: 'Wet polished tiles', mu: 0.22, col: 0xcfd8e6 }, ice: { name: 'Ice', mu: 0.1, col: 0xcfe8ff } };
export const STRIDES = { shuffle: { name: 'Short shuffling steps', rcof: 0.10, amp: 0.18, rate: 3.2 }, normal: { name: 'Normal walking', rcof: 0.18, amp: 0.38, rate: 2.2 }, fast: { name: 'Hurrying', rcof: 0.26, amp: 0.55, rate: 3.0 } };
export const POSTS = { steel: { name: 'Steel bollard', mu: 0.25 }, wood: { name: 'Wooden post', mu: 0.4 } };
const BALL_MM = 0.7;
const ROSIN = { on: { us: 0.8, uk: 0.35 }, off: { us: 0.25, uk: 0.25 } };
const K_STR = (TAU * 1) ** 2, C_STR = 0.25, N_SIM = 7.4;
const VIEWS = {
  walk: { pos: [-0.2, 1.35, 6.0], target: [-0.35, 1.15, 0] },
  pen: { pos: [PX - 0.3, 1.2, 3.8], target: [PX - 0.05, 0.85, 0] },
  rope: { pos: [RX + 1.5, 3.6, 8.8], target: [RX + 1.9, 1.55, 0] },
  violin: { pos: [VX - 0.05, 2.35, 2.4], target: [VX + 0.1, 0.72, 0] },
};
export const capstan = (hold, turns, mu) => hold * Math.exp(mu * TAU * turns);

export default {
  id: 'need',
  short: 'Friction we need',
  title: 'Friction we need: walking, writing, knots and music',
  subtitle: 'Take friction away and you couldn’t take a step, write a word, tie a knot or play a note.',
  view: VIEWS.walk,
  learn: `<p>We fight friction in machines, but we <b>depend</b> on it everywhere else.</p>
    <p><b>Walking.</b> To step forward, your shoe pushes the ground <b>backwards</b>, and friction from the ground pushes you <b>forwards</b> (Newton's third law, see NewtonClear). A normal step needs a friction coefficient of about <b>0.18</b>. Dry concrete gives 0.7, so no problem. Wet polished tiles give about 0.2 and ice about 0.1: hurry, and your foot shoots out. That is why people <b>shuffle like penguins</b> on ice: short steps need less grip.</p>
    <p><b>Writing.</b> The tiny ball in a ballpoint pen (see PenClear) only turns because the paper grips it. As it rolls, it picks up ink from inside and lays it on the page, turning about 4.5 times for every centimetre. On glass it just skids and nothing comes out.</p>
    <p><b>Knots, nails and screws.</b> A knot holds because the rope presses on itself, and friction multiplies. Wrap a rope round a post and the friction grows <b>exponentially</b> with each turn: T = T₀ × e^(μθ), found by Euler. Three turns let one hand hold a boat. A nail holds only by friction from the squeezed wood fibres; a screw adds its threads.</p>
    <p><b>Matches.</b> Striking a safety match rubs the head on the box. Friction heats a speck of the box's red phosphorus enough to turn it into a far more touchy form, which catches fire and lights the head.</p>
    <p><b>Music.</b> A violin bow is coated in sticky <b>rosin</b>, so its static friction is far bigger than its sliding friction. The bow <b>grabs</b> the string, drags it sideways, the string <b>slips</b> back, and the bow grabs it again: <b>stick–slip</b>, hundreds of times a second. The same jerky dance makes chalk squeak, doors creak, brakes squeal and faults in the Earth snap in earthquakes.</p>
    <p class="tip"><b>Try it:</b> walk on ice with normal steps, then shuffle. Write on glass. Add turns of rope round the post until one hand holds a tonne. Then take the rosin off the bow.</p>`,
  terms: [
    { t: 'Required friction', d: 'How much friction a step needs: the forward push divided by the downward push on your foot.' },
    { t: 'Newton’s third law', d: 'When your foot pushes the ground back, the ground pushes you forward just as hard.' },
    { t: 'Capstan equation', d: 'Friction on a rope wrapped round a post grows exponentially with the angle of wrap: T = T₀ e^(μθ).' },
    { t: 'Stick–slip', d: 'Jerky motion where surfaces stick, build up force, slip, and stick again. It makes violins sing and doors squeak.' },
    { t: 'Rosin', d: 'Tree resin rubbed on a bow. It makes static friction much bigger than sliding friction.' },
  ],
  defaults: { focus: 'walk', floor: 'dry', stride: 'normal', paper: 'paper', post: 'steel', turns: 1, hold: 100, rosin: true, bowF: 1, bowV: 0.25 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'walk', label: 'Walking' }, { v: 'pen', label: 'Pen' }, { v: 'rope', label: 'Rope' }, { v: 'violin', label: 'Violin' }] },
    { key: 'floor', type: 'seg', label: 'Walking: floor', options: [{ v: 'dry', label: 'Dry concrete' }, { v: 'wet', label: 'Wet tiles' }, { v: 'ice', label: 'Ice' }], fmt: (v) => `μ ≈ ${FLOORS[v].mu}` },
    { key: 'stride', type: 'seg', label: 'Walking: how', options: [{ v: 'shuffle', label: 'Shuffle' }, { v: 'normal', label: 'Normal' }, { v: 'fast', label: 'Hurry' }], fmt: (v) => `needs μ ≈ ${STRIDES[v].rcof}` },
    { key: 'paper', type: 'seg', label: 'Pen: write on', options: [{ v: 'paper', label: 'Paper' }, { v: 'glass', label: 'Glass' }] },
    { key: 'post', type: 'seg', label: 'Rope: post', options: [{ v: 'steel', label: 'Steel bollard' }, { v: 'wood', label: 'Wooden post' }], fmt: (v) => `μ ≈ ${POSTS[v].mu}` },
    { key: 'turns', type: 'range', label: 'Rope: turns round the post', min: 0, max: 4, step: 0.25, ends: ['none', '4 turns'], fmt: (v) => `${v} (${Math.round(v * 360)}°)` },
    { key: 'hold', type: 'range', label: 'Rope: your pull', min: 20, max: 300, step: 10, ends: ['20 N', '300 N'], fmt: (v) => `${v} N` },
    { key: 'rosin', type: 'toggle', label: 'Violin: rosin on the bow' },
    { key: 'bowF', type: 'range', label: 'Violin: bow pressure', min: 0.2, max: 1.5, step: 0.05, ends: ['light', 'heavy'], fmt: (v) => `${v.toFixed(2)} N` },
    { key: 'bowV', type: 'range', label: 'Violin: bow speed', min: 0.05, max: 0.5, step: 0.01, ends: ['slow', 'fast'], fmt: (v) => `${v.toFixed(2)} m/s` },
  ],
  onChange(s, key) {
    if (['floor', 'stride'].includes(key)) s.focus = 'walk';
    if (key === 'paper') s.focus = 'pen';
    if (['post', 'turns', 'hold'].includes(key)) s.focus = 'rope';
    if (['rosin', 'bowF', 'bowV'].includes(key)) s.focus = 'violin';
  },
  quiz: [
    { q: 'When you walk forward, which way does friction from the ground push on your shoe?', options: ['Backwards', 'Forwards', 'Straight up', 'There is no friction when walking'], answer: 1, why: 'Your shoe pushes the ground backwards; the ground pushes your shoe forwards with an equal and opposite friction force. That is what moves you.' },
    { q: 'A rope is wrapped once round a post (μ = 0.25) and you hold it with 100 N. Roughly what load can it hold?', options: ['125 N', '200 N', 'About 480 N', '10,000 N'], answer: 2, why: 'T = T₀ e^(μθ) = 100 × e^(0.25 × 2π) ≈ 100 × 4.8 ≈ 480 N. Each extra turn multiplies it by 4.8 again.' },
    { q: 'Why does a violin bow need rosin?', options: ['To make it smell nice', 'To make static friction much bigger than sliding friction, so the bow grabs and slips', 'To stop the hair wearing out', 'To make the bow lighter'], answer: 1, why: 'Rosin gives a big difference between static and kinetic friction. That gives stick–slip, which keeps the string vibrating.' },
  ],
  reel: [
    { ms: 5400, caption: 'Wrap a rope round a post and friction multiplies with every turn: one hand holds a boat.', set: { focus: 'rope', post: 'steel', hold: 100, turns: 0 }, anim: { turns: [0, 3] }, view: { pos: [RX + 0.5, 2.4, 4.8], target: [RX + 0.5, 1.5, 0] }, spin: 0 },
    { ms: 5600, caption: 'Rosin makes a bow grab, drag, slip and grab again: stick–slip that makes a violin sing.', set: { focus: 'violin', rosin: true, bowF: 1, bowV: 0.25 }, view: { pos: [VX + 0.6, 1.85, 0.85], target: [VX + 0.6, 0.8, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gW = new THREE.Group(), gP = new THREE.Group(), gR = new THREE.Group(), gV = new THREE.Group(); root.add(gW, gP, gR, gV);
    gP.position.x = PX; gR.position.x = RX; gV.position.x = VX;

    // ================================================================ walking
    const floorMat = M.matte(0x8c8f96, { roughness: 0.6 });
    const floor = box(12, 0.06, 3, floorMat); floor.position.y = -0.03; gW.add(floor);
    const lines = new THREE.Group(); gW.add(lines);
    for (let x = -6; x < 6; x += 0.6) { const l = box(0.01, 0.005, 3, M.matte(0x5a5d66)); l.position.set(x, 0.003, 0); lines.add(l); }
    const walker = makePerson({ shirt: 0x7aa2ff }); gW.add(walker);
    const aOnFoot = force(HEX.good, 0.02, 0.1), aOnGround = force(HEX.fric, 0.02, 0.1); gW.add(aOnFoot, aOnGround);
    const lWalk = stage.label('', [0, 2.1, 0], gW, 'hot'), lFoot = stage.label('', [0, 0, 0], gW), lGround = stage.label('', [0, 0, 0], gW);
    let floorX = 0, slipT = 0;

    // ================================================================ ballpoint pen tip (big)
    const paperMat = M.matte(0xf4f1e8, { roughness: 0.95 });
    const sheet = box(3, 0.02, 1.2, paperMat); sheet.position.y = -0.01; gP.add(sheet);
    const pen = new THREE.Group(); gP.add(pen);
    const R_B = 0.1;                                            // ball radius in the scene (0.35 mm)
    const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.085, 0.55, 40, 1, true), M.metal(0xc9a24a, { roughness: 0.3, side: THREE.DoubleSide })); socket.position.y = R_B + 0.3; pen.add(socket);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.0, 40), M.clear(0xdfefff, 0.3)); barrel.position.y = R_B + 1.05; pen.add(barrel);
    const inkCol = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.3, 20), M.plastic(0x1f3fbf)); inkCol.position.y = R_B + 0.75; pen.add(inkCol);
    const ballG = new THREE.Group(); ballG.position.y = R_B; pen.add(ballG);
    const ball = sphere(R_B, M.metal(0xb9bec8, { roughness: 0.15 }), 32); ballG.add(ball);
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(R_B * 1.003, R_B * 0.12, 8, 40), M.plastic(0x1f3fbf)); ballG.add(stripe);
    const inkLine = box(1, 0.004, 0.13, M.plastic(0x1f3fbf)); inkLine.position.y = 0.003; gP.add(inkLine);
    pen.rotation.z = 0.35;
    const lPen = stage.label('', [0, 0, 0], gP, 'hot'), lBall = stage.label('ball: 0.7 mm tungsten carbide', [0, 0, 0], gP);
    let penX = -0.9, penDir = 1, inkFrom = -0.9, roll = 0;

    // ================================================================ rope round a bollard
    const dock = box(4.5, 0.3, 2.2, M.matte(0x6b5a45)); dock.position.set(0.3, 0.15, 0); gR.add(dock);
    const water = box(8, 0.05, 6, M.clear(0x2f6fd8, 0.55)); water.position.set(4.5, 0.05, 0); gR.add(water);
    const postMat = M.metal(0x3a3f4b, { roughness: 0.5 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.7, 32), postMat); post.position.set(0.3, 0.65, 0); post.castShadow = true; gR.add(post);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 32), postMat); cap.position.set(0.3, 1.02, 0); gR.add(cap);
    const ropeMat = M.matte(0xd9b77a, { roughness: 0.9 });
    let ropeMesh = null, ropeKey = '';
    const boat = new THREE.Group(); boat.position.set(4.6, 0.12, 0); gR.add(boat);
    const hull = box(2.4, 0.5, 1.0, M.plastic(0xd8332f)); hull.position.y = 0.2; boat.add(hull);
    const deckB = box(2.3, 0.05, 0.9, M.matte(0xe9e4d8)); deckB.position.y = 0.46; boat.add(deckB);
    const cabin = box(0.8, 0.45, 0.7, M.plastic(0xf2f4f7)); cabin.position.set(0.3, 0.7, 0); boat.add(cabin);
    const holder = makePerson({ shirt: 0xffb547 }); holder.position.set(-1.1, 0.3, 0.9); holder.rotation.y = -Math.PI / 2 + 0.3; holder.pose({ arm: 0.9, lean: -0.25 }); gR.add(holder);
    const aHold = force(HEX.pull, 0.025, 0.12), aLoad = force(HEX.fric, 0.035, 0.18); gR.add(aHold, aLoad);
    const lHold = stage.label('', [0, 0, 0], gR), lLoad = stage.label('', [0, 0, 0], gR, 'hot');
    lLoad.element.style.setProperty('--c', COL.fric);

    // ================================================================ violin: a string, a bridge and a bow
    const bodyV = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 48), M.plastic(0x8a4a1c, { roughness: 0.35 })); bodyV.scale.set(1.5, 1, 0.75); bodyV.position.set(0.6, 0.55, 0); gV.add(bodyV);
    const neck = box(1.4, 0.06, 0.14, M.matte(0x1b1410)); neck.position.set(-0.6, 0.62, 0); gV.add(neck);
    const bridge = box(0.03, 0.14, 0.2, M.matte(0xd9b77a)); bridge.position.set(0.95, 0.66, 0); gV.add(bridge);
    const nutV = box(0.03, 0.06, 0.16, M.matte(0xe9e4d8)); nutV.position.set(-1.28, 0.68, 0); gV.add(nutV);
    const standV = box(2.8, 0.5, 1.2, M.matte(0x3a3f4b)); standV.position.set(0, 0.25, 0); gV.add(standV);
    const strPts = [new THREE.Vector3(-1.28, 0.72, 0), new THREE.Vector3(0.75, 0.72, 0), new THREE.Vector3(0.95, 0.73, 0)];
    const strGeo = new THREE.BufferGeometry().setFromPoints(strPts);
    const strLine = new THREE.Line(strGeo, new THREE.LineBasicMaterial({ color: 0xe8ecf2 })); strLine.visible = false; gV.add(strLine);
    const strM = M.metal(0xe8ecf2, { roughness: 0.2 });
    const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 8), strM), seg2 = seg1.clone(); gV.add(seg1, seg2);
    const Y1 = new THREE.Vector3(0, 1, 0), vA = new THREE.Vector3(), vB = new THREE.Vector3();
    const setSeg = (m, a, b) => { vA.set(...a); vB.set(...b); m.position.copy(vA).add(vB).multiplyScalar(0.5); m.scale.y = vA.distanceTo(vB); m.quaternion.setFromUnitVectors(Y1, vB.sub(vA).normalize()); };
    const strBall = sphere(0.012, M.glow(0xffb547), 12); gV.add(strBall);
    const bow = new THREE.Group(); gV.add(bow);
    const stick = beam([0, 0.07, -0.9], [0, 0.07, 0.9], 0.012, M.matte(0x5a2e12)); bow.add(stick);
    const hair = box(0.02, 0.006, 1.7, M.matte(0xf2efe6)); hair.position.y = 0.01; bow.add(hair);
    const frog = box(0.04, 0.06, 0.1, M.matte(0x1b1410)); frog.position.set(0, 0.04, 0.85); bow.add(frog);
    const lBow = stage.label('', [0, 0, 0], gV, 'hot');
    const sim = { x: 0, v: 0, stuck: true, hist: [], time: 0, slips: 0 };

    // ================================================================ board
    let cur = null;
    const chart = board(root, 2.0, 1.4, 720, 504, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur) return;
      if (cur.focus === 'walk') {
        const Fl = FLOORS[cur.floor];
        title(g, 'Friction a step needs vs what the floor gives', Fl.name);
        const rows = ['shuffle', 'normal', 'fast'].map((k) => ({ label: STRIDES[k].name, v: STRIDES[k].rcof, col: STRIDES[k].rcof > Fl.mu ? COL.warn : COL.good, on: k === cur.stride, text: `needs ${STRIDES[k].rcof}` }));
        hbars(g, rows, { x0: 250, x1: w - 30, y0: 100, dy: 70, max: 0.8, bh: 36 });
        const x = 250 + (Fl.mu / 0.8) * (w - 280);
        g.strokeStyle = '#fff'; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(x, 84); g.lineTo(x, 320); g.stroke(); g.setLineDash([]);
        tag(g, `floor gives μ ≈ ${Fl.mu}`, Math.min(x - 60, w - 200), 350, '#fff', 'bold 18px sans-serif');
        g.font = '17px sans-serif'; g.fillStyle = 'rgba(255,255,255,.65)';
        g.fillText('Red bar past the line: the foot slips.', 20, h - 60); g.fillText('Short steps need less grip: walk like a penguin on ice.', 20, h - 30);
        return;
      }
      if (cur.focus === 'pen') {
        title(g, 'A rolling ball carries the ink', cur.paper === 'paper' ? 'on paper: it grips and rolls' : 'on glass: it skids');
        const circ = Math.PI * BALL_MM;
        g.font = 'bold 22px sans-serif'; g.fillStyle = '#e8eef8';
        g.fillText(`Ball: ${BALL_MM} mm across, ${fmt(circ, 2)} mm round`, 20, 110);
        g.fillText(`Turns per cm of line: ${fmt(10 / circ, 1)}`, 20, 150);
        g.fillText(`Writing at 5 cm/s: ${fmt((50 / circ), 0)} turns a second`, 20, 190);
        g.font = '18px sans-serif'; g.fillStyle = 'rgba(255,255,255,.7)';
        g.fillText('The paper’s grip turns the ball, like a wheel on a road.', 20, 250);
        g.fillText('Each turn wipes a film of ink from inside onto the page.', 20, 280);
        g.fillText(cur.paper === 'paper' ? 'Rough paper fibres give plenty of grip.' : 'Glass is too smooth: the ball slides, stays dry, no line.', 20, 330);
        return;
      }
      if (cur.focus === 'rope') {
        const mu = POSTS[cur.post].mu;
        title(g, 'Load one hand can hold', `${POSTS[cur.post].name}, μ ≈ ${mu} · log scale`);
        const A = axes(g, w, h, { x0: 100, y0: h - 70, y1: 80, xMax: 4, yMin: 1, yMax: 6, xTicks: [0, 1, 2, 3, 4], yTicks: [1, 2, 3, 4, 5, 6], xFmt: (v) => v + '', yFmt: (v) => fmtN(10 ** v).replace('.0', ''), xLabel: 'turns →', yLabel: 'load' });
        const pts = []; for (let n = 0; n <= 4.001; n += 0.05) pts.push([n, Math.log10(capstan(cur.hold, n, mu))]);
        line(g, pts.map(([x, y]) => [x, Math.min(6, y)]), A.X, A.Y, COL.fric, 4);
        const tonne = Math.log10(1000 * G);
        g.strokeStyle = 'rgba(255,255,255,.35)'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(A.x0, A.Y(tonne)); g.lineTo(A.x1, A.Y(tonne)); g.stroke(); g.setLineDash([]);
        tag(g, 'weight of a tonne', A.x0 + 10, A.Y(tonne) - 8, 'rgba(255,255,255,.6)', '15px sans-serif');
        const L = capstan(cur.hold, cur.turns, mu);
        dot(g, A.X(cur.turns), A.Y(Math.min(6, Math.log10(L))), COL.fric, 9);
        return;
      }
      title(g, 'Where the bow grips the string', cur.rosin ? 'with rosin: stick, slip, stick…' : 'no rosin: it just slides');
      const A = axes(g, w, h, { x0: 80, y0: h - 70, y1: 80, xMax: 4, yMin: -0.05, yMax: 0.25, xTicks: [0, 1, 2, 3, 4], yTicks: [0, 0.1, 0.2], xFmt: (v) => v + ' s', yFmt: (v) => v.toFixed(1), xLabel: 'slowed-down time →', yLabel: 'string pulled aside' });
      const hs = sim.hist, t0 = hs.length ? hs[hs.length - 1][0] - 4 : 0;
      line(g, hs.filter((p) => p[0] >= t0).map(([t, x]) => [t - t0, x]), A.X, A.Y, COL.static, 4);
      g.font = '16px sans-serif'; g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText('Slow rise: stuck to the bow. Sudden drop: slipping back.', 20, h - 20);
    }, [0, 0, 0]);
    const BOARD = { walk: [1.75, 1.55, -1.2, 1.0], pen: [PX + 1.55, 1.2, -0.6, 0.7], rope: [RX + 4.6, 2.5, -1.6, 1.5], violin: [VX + 1.5, 1.35, -0.7, 0.75] };

    const st = {};
    let t = 0, ck = '';
    const inst = {
      update(dt, s) {
        dt = Math.max(0, dt);
        focusView(stage, st, s.focus, VIEWS);
        const narrow = fitNarrow(stage, [lGround, lBall, lHold]);
        const reel = inReel(), f = s.focus;
        gW.visible = f === 'walk'; gP.visible = f === 'pen'; gR.visible = f === 'rope'; gV.visible = f === 'violin';
        const Bp = BOARD[f];
        chart.mesh.position.set(...(reel ? { walk: [0.6, 2.6, -1], pen: [PX + 0.3, 1.5, -0.5], rope: [RX + 0.5, 3.4, -1.2], violin: [VX + 0.6, 1.25, -0.45] }[f] : Bp.slice(0, 3)));
        chart.mesh.scale.setScalar(reel ? { walk: 1.1, pen: 0.7, rope: 1.2, violin: 0.6 }[f] : Bp[3]);
        chart.mesh.visible = reel || !narrow;
        chart.mesh.rotation.x = reel && f === 'violin' ? -0.75 : 0;
        t += dt;

        if (f === 'walk') {
          const Fl = FLOORS[s.floor], Sd = STRIDES[s.stride], slips = Sd.rcof > Fl.mu;
          floorMat.color.setHex(Fl.col);
          const speed = slips ? 0.25 : Sd.amp * Sd.rate * 0.55;
          floorX += speed * dt; lines.position.x = -(floorX % 0.6);
          const ph = t * Sd.rate * Math.PI;
          slipT = slips ? slipT + dt : 0;
          const wobble = slips ? Math.sin(t * 9) * 0.12 : 0;
          walker.pose({ arm: 0, lean: slips ? -0.18 + wobble * 0.5 : 0.05, stride: Sd.amp * Math.sin(ph) * (slips ? 1.5 : 1), swing: Sd.amp * 0.6 * Math.sin(ph) });
          walker.position.set(0, 0, 0);
          // the back (pushing) foot: at push-off the shoe pushes the ground backwards
          const back = Math.sin(ph) > 0 ? 0 : 1, footX = -0.25 * Math.abs(Math.sin(ph)) - 0.05;
          const Fneed = Sd.rcof * 70 * G, Fgot = Math.min(Fneed, Fl.mu * 70 * G);
          aOnFoot.aim([footX, 0.04, 0.35], [1, 0, 0], 0.15 + Fgot / 300);
          aOnGround.aim([footX, 0.02, 0.55], [-1, 0, 0], 0.15 + Fneed / 300);
          lFoot.position.set(footX + 0.6, 0.1, 0.35); lFoot.element.innerHTML = `ground pushes you forward ${fmtN(Fgot)}`;
          lGround.position.set(footX - 0.8, -0.12, 0.8); lGround.element.innerHTML = `shoe pushes ground back ${fmtN(Fneed)}`;
          lWalk.position.set(0, 2.05, 0);
          lWalk.element.innerHTML = slips ? 'slipping! not enough friction' : `needs ${Sd.rcof}, floor gives ${Fl.mu}: safe`;
          lWalk.element.style.setProperty('--c', slips ? COL.warn : COL.good);
          void back;
        } else if (f === 'pen') {
          const grip = s.paper === 'paper';
          paperMat.color.setHex(grip ? 0xf4f1e8 : 0x9fc3e6); paperMat.roughness = grip ? 0.95 : 0.05; paperMat.transparent = !grip; paperMat.opacity = grip ? 1 : 0.5;
          const v = 0.35;
          penX += penDir * v * dt;
          if (penX > 0.9) { penX = 0.9; penDir = -1; inkFrom = 0.9; }
          if (penX < -0.9) { penX = -0.9; penDir = 1; inkFrom = -0.9; }
          pen.position.x = penX;
          if (grip) roll -= (penDir * v * dt) / R_B;
          ballG.rotation.z = roll;
          const a = Math.min(inkFrom, penX), b = Math.max(inkFrom, penX);
          inkLine.visible = grip && b - a > 0.01; inkLine.scale.x = Math.max(0.01, b - a); inkLine.position.x = (a + b) / 2;
          lPen.position.set(penX, 0.02, 0.4); lPen.element.innerHTML = grip ? 'grips: the ball rolls and leaves ink' : 'too smooth: the ball skids, no ink';
          lPen.element.style.setProperty('--c', grip ? COL.good : COL.warn);
          lBall.position.set(penX + 0.5, 0.15, 0.2);
        } else if (f === 'rope') {
          const mu = POSTS[s.post].mu, L = capstan(s.hold, s.turns, mu);
          postMat.color.setHex(s.post === 'steel' ? 0x3a3f4b : 0x6b4a2e); postMat.metalness = s.post === 'steel' ? 0.9 : 0; postMat.roughness = s.post === 'steel' ? 0.4 : 0.9;
          const rk = s.turns.toFixed(2);
          if (rk !== ropeKey) {
            ropeKey = rk;
            if (ropeMesh) { gR.remove(ropeMesh); ropeMesh.geometry.dispose(); }
            const pts = [], R0 = 0.185, n = s.turns, cx = 0.3;
            pts.push(new THREE.Vector3(3.5, 0.55, 0));                            // to the boat's bow
            const a0 = Math.PI / 2 * 0;                                            // rope arrives from +x, wraps anticlockwise seen from above
            const steps = Math.max(2, Math.round(n * 40));
            pts.push(new THREE.Vector3(cx + 0.4, 0.62, -R0));
            for (let i = 0; i <= steps; i++) { const k = i / steps, a = -Math.PI / 2 + a0 - k * n * TAU; pts.push(new THREE.Vector3(cx + R0 * Math.cos(a), 0.62 + 0.28 * k, -R0 * Math.sin(a) * -1)); }
            const aEnd = -Math.PI / 2 - n * TAU, ex = cx + R0 * Math.cos(aEnd), ez = R0 * Math.sin(aEnd);
            pts.push(new THREE.Vector3(ex - 0.5, 0.95, ez + 0.3));
            pts.push(new THREE.Vector3(-1.0, 1.35, 0.85));                          // to the hand
            ropeMesh = tube(pts, 0.025, ropeMat, false, 300); gR.add(ropeMesh);
          }
          boat.position.x = 4.6 + 0.08 * Math.sin(t * 0.8); boat.rotation.z = 0.02 * Math.sin(t * 1.1);
          aHold.aim([-0.6, 1.25, 0.7], [-1, 0.3, 0.3], 0.2 + 0.25 * Math.log10(s.hold));
          aLoad.aim([2.2, 0.75, 0], [1, 0, 0], 0.2 + 0.35 * Math.log10(L));
          lHold.position.set(-1.2, 1.8, 0.9); lHold.element.innerHTML = `your pull ${fmtN(s.hold)}`;
          lLoad.position.set(2.7, 1.2, 0); lLoad.element.innerHTML = `holds <b>${fmtN(L)}</b> · like ${fmt(L / G, 0)} kg`;
        } else {
          const R = ROSIN[s.rosin ? 'on' : 'off'], vb = s.bowV * 0.6, N = s.bowF * N_SIM;
          const n = Math.max(1, Math.ceil(dt / 0.001)), hh = dt / n;
          for (let i = 0; i < n; i++) {
            const Fs = K_STR * sim.x + C_STR * sim.v;
            if (sim.stuck) {
              sim.v = vb; sim.x += vb * hh;
              if (Math.abs(K_STR * sim.x) > R.us * N) { sim.stuck = false; sim.slips++; }
            } else {
              const rel = vb - sim.v, fr = R.uk * N * Math.sign(rel || 1);
              const a = -K_STR * sim.x - C_STR * sim.v + fr;
              const v0 = sim.v;
              sim.v += a * hh; sim.x += sim.v * hh;
              if ((v0 - vb) * (sim.v - vb) <= 0 && Math.abs(K_STR * sim.x) <= R.us * N) { sim.stuck = true; sim.v = vb; }
            }
            void Fs;
            sim.time += hh;
          }
          if (!sim.hist.length || sim.time - sim.hist[sim.hist.length - 1][0] > 0.02) sim.hist.push([sim.time, sim.x]);
          while (sim.hist.length > 400) sim.hist.shift();
          const bx = 0.75, dz = clamp(sim.x, -0.3, 0.3);
          setSeg(seg1, [-1.28, 0.72, 0], [bx, 0.72, dz]); setSeg(seg2, [bx, 0.72, dz], [0.95, 0.73, 0]);
          strBall.position.set(bx, 0.72, dz);
          bow.position.set(bx, 0.72, ((t * vb * 0.8) % 1.2) - 0.6);
          lBow.position.set(bx, 1.02, 0.35);
          lBow.element.innerHTML = !s.rosin ? 'no rosin: bow just slides, no note' : sim.stuck ? 'stick: the bow drags the string' : 'slip: the string flies back';
          lBow.element.style.setProperty('--c', !s.rosin ? COL.warn : sim.stuck ? COL.static : COL.kinetic);
        }
        cur = { focus: f, floor: s.floor, stride: s.stride, paper: s.paper, post: s.post, turns: s.turns, hold: s.hold, rosin: s.rosin };
        const kk = JSON.stringify(cur);
        if (kk !== ck || f === 'violin') { ck = kk; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus;
        if (f === 'walk') {
          const Fl = FLOORS[s.floor], Sd = STRIDES[s.stride], slips = Sd.rcof > Fl.mu;
          return `<div class="big">${slips ? 'Slip!' : 'Steady footing'}</div>
            <div class="row"><span>Friction a step needs (${Sd.name.toLowerCase()})</span><b>μ ≈ ${Sd.rcof}</b></div>
            <div class="row"><span>${Fl.name} with rubber soles</span><b>μ ≈ ${Fl.mu}</b></div>
            <div class="row"><span>Push-off for a 70 kg person</span><b>${fmtN(Sd.rcof * 70 * G)}</b></div>
            <div class="row"><span>Most the floor can give</span><b>${fmtN(Fl.mu * 70 * G)}</b></div>
            <small>You push the ground back; the ground pushes you forward (Newton's third law).</small>`;
        }
        if (f === 'pen') {
          const circ = Math.PI * BALL_MM;
          return `<div class="big">${s.paper === 'paper' ? 'Rolls and writes' : 'Skids: no ink'}</div>
            <div class="row"><span>Ball diameter</span><b>${BALL_MM} mm</b></div>
            <div class="row"><span>Distance per turn, π d</span><b>${fmt(circ, 2)} mm</b></div>
            <div class="row"><span>Turns per centimetre</span><b>${fmt(10 / circ, 1)}</b></div>
            <small>Friction from the paper makes the ball roll. Pens don't write on glass or greasy paper for the same reason tyres spin on ice.</small>`;
        }
        if (f === 'rope') {
          const mu = POSTS[s.post].mu, L = capstan(s.hold, s.turns, mu), th = s.turns * TAU;
          return `<div class="big">Holds ${fmtN(L)}</div>
            <div class="row"><span>Your pull T₀</span><b>${fmtN(s.hold)}</b></div>
            <div class="row"><span>Angle of wrap θ</span><b>${fmt(th, 2)} rad (${Math.round(s.turns * 360)}°)</b></div>
            <div class="row"><span>Multiplier e^(μθ), μ = ${mu}</span><b>×${fmt(Math.exp(mu * th), 1)}</b></div>
            <div class="row"><span>Like holding up</span><b>${fmt(L / G, 0)} kg</b></div>
            <small>Each extra turn multiplies the grip by ${fmt(Math.exp(mu * TAU), 1)}. Sailors and dock workers have used this for thousands of years.</small>`;
        }
        const R = ROSIN[s.rosin ? 'on' : 'off'];
        return `<div class="big">${s.rosin ? 'Stick–slip: a note!' : 'Smooth slide: silence'}</div>
          <div class="row"><span>Static μs · sliding μk</span><b>${R.us} · ${R.uk}</b></div>
          <div class="row"><span>Bow pressure · speed</span><b>${s.bowF.toFixed(2)} N · ${s.bowV.toFixed(2)} m/s</b></div>
          <div class="row"><span>A string, real speed</span><b>440 grabs a second</b></div>
          <small>Shown about 440 times slower. Press harder and the string is dragged further before it slips: louder.</small>`;
      },
    };
    return inst;
  },
};
