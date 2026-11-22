/* rider.js — the delivery rider, our own Subway Surfers-style hero. Chunky cartoon proportions (big head, big hands,
   big trainers), soft toon shading, rounded everything. Brown skin, black fade + short beard, backwards cap, muted green
   jacket with orange trim, charcoal joggers, white trainers, square thermal food bag on his back. No logos.
   animRider(st) poses him: idle, run, jump, roll, lean, land squash, stumble, crash, rocket bag, hoverboard. */
import * as THREE from 'three';
import { T, rb, sph, capsule, blobShadow } from './kit.js';

const RID = { name: 'rider' }, SKIN = T(0x9a6447), HAIR = T(0x1d1a1a), CAP = T(0x2f4a3c, RID), JACK = T(0x3f9467, RID), JACK2 = T(0x2f7652, RID), TRIM = T(0xe8873a, RID),
  JOG = T(0x35383f), SHOE = T(0xf4f1ea), SOLE = T(0xe8873a, RID), BAG = T(0x3a8a5f, RID), BAGD = T(0x2b6b49, RID), STRIPE = T(0xeef2ee), EYE = T(0x1a1a1a), WHITE = T(0xffffff), MOUTH = T(0x6b3328);
const J = (p, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); p.add(j); return j; };

export const rider = new THREE.Group();            // feet on y = 0, facing -z (away from the camera)
export const shadow = blobShadow(.9, .9);           // added to the scene by the game (stays on the ground)
const body = J(rider, 0, 0, 0), hips = J(body, 0, .66, 0), squash = J(hips, 0, 0, 0);
// torso: chunky rounded jacket, hem band, zip, collar
const chest = J(squash, 0, .02, 0);
rb(.5, .5, .36, .16, JACK, 0, .27, 0, chest); rb(.52, .09, .38, .04, TRIM, 0, .04, 0, chest); rb(.05, .4, .02, .01, TRIM, 0, .28, -.18, chest);
rb(.34, .1, .28, .05, JACK2, 0, .53, -.01, chest);
// bag: the hero's look from behind (big rounded thermal box, lid, reflective stripes, orange top handle)
const bag = J(chest, 0, .33, .29);
rb(.62, .6, .38, .1, BAG, 0, 0, 0, bag); rb(.64, .1, .4, .05, BAGD, 0, .27, 0, bag);
rb(.56, .05, .02, .02, STRIPE, 0, -.1, .19, bag); rb(.56, .05, .02, .02, STRIPE, 0, .06, .19, bag); rb(.22, .05, .06, .025, TRIM, 0, .33, 0, bag);
[-1, 1].forEach(s => rb(.07, .4, .05, .025, T(0x22252b), s * .16, .32, -.19, chest));
// head: big round head, black fade, backwards cap, ears, short beard, eyes + brows, small nose
const neck = J(chest, 0, .55, 0), head = J(neck, 0, .2, 0);
sph(.25, SKIN, 0, .08, 0, head, 1, 1.02, .98);
sph(.255, HAIR, 0, .14, .02, head, 1.0, .85, 1.0);
const capG = J(head, 0, .2, .01); sph(.245, CAP, 0, .02, 0, capG, 1.02, .55, 1.03); rb(.24, .05, .2, .025, CAP, 0, -.04, .27, capG);
sph(.215, HAIR, 0, -.03, -.03, head, .98, .62, .96);
sph(.17, SKIN, 0, .02, -.1, head, 1, .8, .9);
[-1, 1].forEach(s => { sph(.055, SKIN, s * .245, .07, .01, head, .55, 1, 1); sph(.034, WHITE, s * .085, .12, -.205, head, 1, 1.1, .5); sph(.02, EYE, s * .085, .118, -.222, head);
  rb(.08, .02, .02, .01, HAIR, s * .085, .185, -.21, head).rotation.z = -s * .12; });
sph(.035, T(0x8a5840), 0, .06, -.24, head, .9, .8, 1); rb(.07, .015, .02, .008, MOUTH, 0, -.02, -.215, head);
// arms: shoulder → elbow → big hand
const arm = s => { const sh = J(chest, s * .3, .44, 0); capsule(.075, .16, JACK, 0, -.11, 0, sh); const el = J(sh, 0, -.24, 0);
  capsule(.068, .14, JACK, 0, -.09, 0, el); rb(.15, .05, .15, .02, TRIM, 0, -.17, 0, el); sph(.085, SKIN, 0, -.25, 0, el, 1, 1.1, 1); return { sh, el }; };
const AL = arm(-1), AR = arm(1);
// legs: hip → knee → foot, joggers, chunky trainers
const leg = s => { const hp = J(squash, s * .13, -.02, 0); capsule(.1, .16, JOG, 0, -.13, 0, hp); const kn = J(hp, 0, -.29, 0);
  capsule(.088, .14, JOG, 0, -.1, 0, kn); const ft = J(kn, 0, -.25, 0); rb(.2, .13, .34, .065, SHOE, 0, -.04, -.06, ft); rb(.21, .04, .35, .02, SOLE, 0, -.1, -.06, ft);
  rb(.16, .03, .12, .015, T(0x3a3d44), 0, .025, .02, ft); return { hp, kn, ft }; };
const LL = leg(-1), LR = leg(1);
// hoverboard (our own board: purple deck with a pink top, glowing underside)
export const board = new THREE.Group();
{ rb(.5, .07, 1.35, .035, T(0x6d4fb0), 0, 0, 0, board); rb(.44, .02, 1.2, .01, T(0xe05d9a), 0, .04, 0, board);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(.5, 1.3), new THREE.MeshBasicMaterial({ color: 0xff7ac0, transparent: true, opacity: .55, depthWrite: false })); glow.rotation.x = Math.PI / 2; glow.position.y = -.05; board.add(glow);
  board.visible = false; rider.add(board); }
// rocket bag flames
export const flames = new THREE.Group();
{ const fm = new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: .85, depthWrite: false }), fi = new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: .95, depthWrite: false });
  [-.18, .18].forEach(x => { const o = new THREE.Mesh(new THREE.ConeGeometry(.12, .7, 12), fm); o.rotation.x = Math.PI; o.position.set(x, -.38, 0); flames.add(o); const i = new THREE.Mesh(new THREE.ConeGeometry(.06, .45, 10), fi); i.rotation.x = Math.PI; i.position.set(x, -.3, 0); flames.add(i); });
  flames.visible = false; bag.add(flames); }

/* st = { t, phase, mode: 'idle'|'run'|'air'|'roll'|'fly'|'board'|'dead', vy, roll (0..1), lean (-1..1), land (0..1 squash), stumble, dead (s) } */
export function animRider(st) {
  const p = st.phase, s = Math.sin(p), c = Math.cos(p), t = st.t;
  let lh = 0, rh = 0, lk = .1, rk = .1, lf = 0, rf = 0, la = 0, ra = 0, le = -.3, re = -.3, lsz = -.15, rsz = .15, lean = .05, twist = 0, bob = 0, headX = 0, sq = 1, bx = 0;
  switch (st.mode) {
    case 'idle': bob = Math.sin(t * 2.2) * .012; la = .1; ra = .1; le = -.25; re = -.25; headX = Math.sin(t * .7) * .25; twist = Math.sin(t * .7) * .06; break;
    case 'run': lh = s * 1.1 + .15; rh = -s * 1.1 + .15; lk = .3 + Math.max(0, c) * 1.9; rk = .3 + Math.max(0, -c) * 1.9;
      lf = Math.max(0, -s) * .35; rf = Math.max(0, s) * .35; la = -s * 1.15 - .1; ra = s * 1.15 - .1; le = -1.45; re = -1.45; lsz = -.25; rsz = .25;
      lean = .32; twist = s * .18; bob = Math.abs(c) * .085; headX = -.12; break;
    case 'air': { const up = st.vy > 1; lh = 1.25; rh = up ? -.25 : .35; lk = 1.85; rk = up ? .9 : 1.3; lf = 0; rf = 0; la = 2.5; ra = up ? 2.0 : 1.5; le = -.4; re = -.7; lsz = -.7; rsz = .7; lean = .14; headX = -.05; break; }
    case 'roll': lh = rh = 2.1; lk = rk = 2.5; la = ra = -1.3; le = re = -2.1; lsz = -.15; rsz = .15; lean = .55; break;
    case 'fly': lh = -.25; rh = .15; lk = .9; rk = .5; la = -.4; ra = -.4; le = -.3; re = -.3; lsz = -1.25; rsz = 1.25; lean = .75; bob = Math.sin(t * 3) * .04; headX = -.4; break;
    case 'board': lh = .55; rh = -.35; lk = 1.1; rk = .8; la = -.5; ra = .4; le = -.8; re = -.5; lsz = -1.0; rsz = 1.0; lean = .25; twist = .5; bob = Math.sin(t * 6) * .02 - .12; break;
    case 'dead': { const d = Math.min(1, st.dead * 2.2); lh = .7 * d; rh = -.4 * d; lk = rk = .5; la = -2.9; ra = -2.4; le = re = -.2; lsz = -1.1; rsz = 1.1; lean = -1.25 * d; bob = -.42 * d; bx = d * .5; break; }
  }
  if (st.stumble > 0) { lean = -.2 + Math.sin(st.stumble * 28) * .18; la = -2.5; ra = -1.2; lsz = -.9; rsz = .9; }
  if (st.land > 0) sq = 1 - st.land * .16;
  LL.hp.rotation.x = lh; LR.hp.rotation.x = rh; LL.kn.rotation.x = -lk; LR.kn.rotation.x = -rk; LL.ft.rotation.x = -(lh - lk) * .85 + lf; LR.ft.rotation.x = -(rh - rk) * .85 + rf;
  AL.sh.rotation.set(la, 0, lsz); AR.sh.rotation.set(ra, 0, rsz); AL.el.rotation.x = -le; AR.el.rotation.x = -re;
  hips.position.y = .66 + bob; squash.scale.set(1 + (1 - sq) * .7, sq, 1 + (1 - sq) * .7);
  chest.rotation.set(-lean * .9, twist, 0); hips.rotation.y = -twist * .5; head.rotation.set(lean * .45, headX, 0); bag.rotation.x = Math.sin(p * 2) * .04;
  if (st.mode === 'roll') { const a = -st.roll * Math.PI * 2, pv = .42; body.rotation.set(a, 0, 0); body.position.set(0, pv - pv * Math.cos(a) - .28, -pv * Math.sin(a)); }
  else { body.rotation.set(0, 0, -st.lean * .32); body.position.set(0, 0, bx); }
  board.visible = st.mode === 'board'; board.position.set(0, .07, 0);
  flames.visible = st.mode === 'fly'; if (flames.visible) flames.scale.set(1, .75 + Math.random() * .5, 1);
}

/* outfits: [jacket, collar, bag, bag lid, trim, cap] */
export const OUTFITS = [
  { name: 'Green Rider', c: [0x3f9467, 0x2f7652, 0x3a8a5f, 0x2b6b49, 0xe8873a, 0x2f4a3c], cost: 0 },
  { name: 'Orange Rush', c: [0xe07b3a, 0xb85e26, 0xe58a45, 0xb86a30, 0x2f3440, 0x3a3d44], cost: 800 },
  { name: 'Midnight', c: [0x2f3b57, 0x222b40, 0x34405e, 0x26304a, 0x56c1b0, 0x1c2233], cost: 1500 },
  { name: 'Luton Orange & Navy', c: [0xef7d2a, 0x1f2b4d, 0x1f2b4d, 0x16203a, 0xffffff, 0xef7d2a], cost: 2500 },
  { name: 'Maroon', c: [0x7d3242, 0x5e2432, 0x8a3a4a, 0x6a2a38, 0xe9c46a, 0x3a1d24], cost: 4000 },
  { name: 'SMR Purple', c: [0x6d4fb0, 0x55399a, 0x7a5bc0, 0x5a3f9a, 0xff6fb0, 0x2c2245], cost: 6000 }];
export function setOutfit(i) { const c = (OUTFITS[i] || OUTFITS[0]).c; [JACK, JACK2, BAG, BAGD, TRIM, CAP].forEach((m, k) => m.color.setHex(c[k])); SOLE.color.setHex(c[4]); }
