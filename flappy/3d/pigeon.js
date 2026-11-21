/* pigeon.js — THE PIGEON. Feathered 3D pigeon (pig) and its wingbeat animPigeon(dt, flapT, vy, dead). */
import * as THREE from 'three';
import { cyl, mat, noise, scene, tex } from './core.js';


/* ================= the pigeon: modelled from the photos (seen from behind) ================= */
export const pig = new THREE.Group(); scene.add(pig);
export const P = {}; {
  // feather texture: quill down the middle, barbs either side, colour runs from base to tip, optional dark band near the tip
  const FT = {}; const featherTex = (base, tip, band) => { const k = base + tip + band; if (FT[k]) return FT[k]; const t = tex(64, 256, (x, w, h) => {
      x.clearRect(0, 0, w, h); x.save(); x.beginPath(); x.moveTo(w / 2, 2); x.bezierCurveTo(w * .99, h * .2, w, h * .85, w * .55, h - 1); x.lineTo(w * .45, h - 1); x.bezierCurveTo(w * 0, h * .85, w * .01, h * .2, w / 2, 2); x.clip();
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, base); g.addColorStop(.55, base); g.addColorStop(1, tip); x.fillStyle = g; x.fillRect(0, 0, w, h);
      if (band) { x.fillStyle = band; x.fillRect(0, h * .74, w, h * .2); }
      for (let y = 6; y < h; y += 4) { x.strokeStyle = 'rgba(255,255,255,.10)'; x.beginPath(); x.moveTo(w / 2, y); x.lineTo(1, y + 10); x.moveTo(w / 2, y); x.lineTo(w - 1, y + 10); x.stroke(); x.strokeStyle = 'rgba(0,0,0,.13)'; x.beginPath(); x.moveTo(w / 2, y + 2); x.lineTo(3, y + 12); x.stroke(); }
      const e = x.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(0,0,0,.28)'); e.addColorStop(.25, 'rgba(0,0,0,0)'); e.addColorStop(.75, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,.28)'); x.fillStyle = e; x.fillRect(0, 0, w, h);
      x.restore(); x.strokeStyle = 'rgba(225,230,240,.7)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(w / 2, 4); x.lineTo(w / 2, h - 8); x.stroke(); });
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.repeat.set(1, 1); return FT[k] = t; };
  const fMat = (base, tip, band) => new THREE.MeshStandardMaterial({ map: featherTex(base, tip, band), alphaTest: .4, side: THREE.DoubleSide, roughness: .72 });
  const feather = (m, len, wid) => { const g = new THREE.PlaneGeometry(wid, len, 1, 3); g.translate(0, -len / 2, 0); const pos = g.attributes.position; for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setZ(i, Math.pow(-y / len, 2) * len * .08); } g.computeVertexNormals(); const f = new THREE.Mesh(g, m); f.castShadow = true; return f; };
  // a feather rooted at (x,y,z) pointing back (+z), turned outwards by a, lying flat
  const put = (parent, m, len, wid, x, y, z, a, tilt = 0) => { const h = new THREE.Group(); h.position.set(x, y, z); h.rotation.y = a; const f = feather(m, len, wid); f.rotation.x = -Math.PI / 2 + tilt; h.add(f); parent.add(h); return h; };
  const scaleTex = (c1, c2, irid) => tex(256, 256, (x, w, h) => { x.fillStyle = c1; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 26; r++) for (let c = 0; c < 26; c++) { const cx = c * 11 + (r % 2) * 5.5, cy = r * 10; const g = x.createRadialGradient(cx, cy + 3, 1, cx, cy, 8);
      g.addColorStop(0, irid ? ['#5fae7e', '#8a58b0', '#4e9e8e', '#a06aa8'][(r * 3 + c) % 4] : c2); g.addColorStop(.75, c1); g.addColorStop(1, 'rgba(0,0,0,.22)'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, 7, 0, Math.PI); x.fill(); }
    noise(x, w, h, 900, .06); }, 2, 2);
  const bodyM = new THREE.MeshStandardMaterial({ map: scaleTex('#8a94a6', '#a2abbb'), roughness: .8 }), neckM = new THREE.MeshStandardMaterial({ map: scaleTex('#6f7a8c', '#8995a6', 1), roughness: .3, metalness: .45 }), headM = new THREE.MeshStandardMaterial({ map: scaleTex('#77818f', '#8c96a6'), roughness: .7 });
  // sleek tapered body (a stretched teardrop)
  const bg = new THREE.SphereGeometry(.5, 32, 24); { const p = bg.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); const k = z > 0 ? 1 - z * .9 : 1 + z * .15; p.setX(i, p.getX(i) * k); p.setY(i, p.getY(i) * (z > 0 ? 1 - z * .7 : 1)); } bg.computeVertexNormals(); }
  const body = new THREE.Mesh(bg, bodyM); body.scale.set(.95, .82, 1.75); body.castShadow = true; pig.add(body);
  const breast = new THREE.Mesh(new THREE.SphereGeometry(.42, 24, 16), bodyM); breast.scale.set(1, .95, 1.1); breast.position.set(0, .02, -.48); pig.add(breast);
  const neck = new THREE.Mesh(new THREE.SphereGeometry(.3, 24, 16), neckM); neck.scale.set(.95, 1.05, 1.1); neck.position.set(0, .2, -.74); pig.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.2, 24, 16), headM); head.scale.set(.92, .95, 1.15); head.position.set(0, .38, -.98); head.castShadow = true; pig.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(.04, .2, 10), mat(0x2e2e30, { roughness: .4 })); beak.rotation.x = -Math.PI / 2 - .2; beak.position.set(0, .33, -1.22); pig.add(beak);
  const cere = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), mat(0xf2f2ef, { roughness: .9 })); cere.scale.set(1, .7, 1.4); cere.position.set(0, .39, -1.13); pig.add(cere);
  [-1, 1].forEach(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), mat(0xe8742a, { roughness: .3 })); e.position.set(s * .14, .41, -1.04); pig.add(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(.026, 8, 6), mat(0x0a0a0a, { roughness: .1 })); p.position.set(s * .175, .415, -1.055); pig.add(p);
    const leg = cyl(.032, .028, .26, mat(0xd24a55, { roughness: .5 }), s * .13, -.36, .2, pig, 6); leg.rotation.x = 1.25; });   // red feet tucked back in flight
  // rump + tail: a broad fan with the black band at the end
  const rump = new THREE.Mesh(new THREE.SphereGeometry(.3, 20, 14), new THREE.MeshStandardMaterial({ map: scaleTex('#a4acba', '#b7bfcc'), roughness: .8 })); rump.scale.set(1.05, .55, 1.2); rump.position.set(0, .1, .55); pig.add(rump);
  const tailM = fMat('#7d8697', '#2a2d34', '#25282e'); P.tail = new THREE.Group(); P.tail.position.set(0, .1, .72); P.tail.rotation.x = .25; pig.add(P.tail);
  P.tailF = []; for (let i = 0; i < 12; i++) { const t = i / 11 - .5; P.tailF.push(put(P.tail, tailM, 1.05, .3, t * .3, Math.abs(t) * -.02, 0, t * 1.0)); }
  // wings: shoulder -> arm (secondaries, coverts with the two black bars) -> wrist -> hand (long primaries spreading like fingers)
  const covS = fMat('#9aa3b3', '#919aaa', null), covG = fMat('#97a0b0', '#8d96a6', '#24272e'), secM = fMat('#8790a2', '#4c5362', '#2a2d35'), priM = fMat('#7a8395', '#33373f', null), aluM = fMat('#848d9e', '#5d6575', null);
  P.wings = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * .34, .2, -.3); pig.add(sh);
    const arm = new THREE.Group(); sh.add(arm);
    for (let i = 0; i < 12; i++) { const t = i / 11; put(arm, secM, .82 - t * .06, .3, s * (.05 + t * .86), -.01 + i * .001, .04, s * (.04 + t * .18)); }
    for (let i = 0; i < 11; i++) { const t = i / 10; put(arm, covG, .5, .27, s * (.04 + t * .84), .012 + i * .001, -.05, s * (.02 + t * .14)); }
    for (let i = 0; i < 10; i++) { const t = i / 9; put(arm, covS, .32, .24, s * (.03 + t * .8), .03 + i * .001, -.16, s * (t * .1)); }
    const bone = new THREE.Mesh(new THREE.CapsuleGeometry(.075, .8, 4, 8), bodyM); bone.rotation.z = Math.PI / 2; bone.position.set(s * .45, .035, -.2); arm.add(bone);
    const wr = new THREE.Group(); wr.position.set(s * .92, .02, -.16); arm.add(wr);
    const pri = []; for (let i = 0; i < 10; i++) { const t = i / 9; pri.push(put(wr, priM, 1.18 + Math.sin(t * Math.PI) * .2, .3, s * (.02 + t * .5), -.01 - i * .001, .1 - t * .1, s * (.32 + t * 1.05), t * .05)); }
    for (let i = 0; i < 6; i++) { const t = i / 5; put(wr, covS, .42, .24, s * t * .45, .03, -.04, s * (.25 + t * .7)); }
    put(wr, aluM, .3, .14, s * .02, .045, -.05, s * .2);
    const hb = new THREE.Mesh(new THREE.CapsuleGeometry(.06, .45, 4, 8), bodyM); hb.rotation.z = Math.PI / 2; hb.position.set(s * .25, .03, -.04); wr.add(hb);
    return { sh, arm, wr, s, pri, base: pri.map(p => p.rotation.y) }; });
  P.phase = 0;
  pig.scale.setScalar(.85);
}
// wingbeat like the reference clips: big downstroke with the hand spread, upstroke with the wrist folded back and the primaries closed
export function animPigeon(dt, flapT, vy, dead) {
  const fast = flapT < .45, rate = dead ? 0 : fast ? 15 : (vy < -2 ? 3.5 : 8); P.phase += dt * rate;
  const ph = P.phase, sn = Math.sin(ph), cs = Math.cos(ph), up = Math.max(0, cs);   // cs > 0 = wing on the way up
  P.wings.forEach(w => { const s = w.s, glide = dead ? -.2 : (!fast && vy < -2 ? .12 : 0);
    w.sh.rotation.z = s * (glide || (.2 + sn * .85));
    w.sh.rotation.x = -cs * .18;                                 // wing sweeps a little forward on the downstroke
    w.wr.rotation.y = -s * up * .75;                             // wrist folds back on the upstroke
    w.wr.rotation.z = -s * up * .45;
    w.pri.forEach((p, i) => { p.rotation.y = w.base[i] * (1 - up * .55); }); });   // primaries close up on the upstroke
  P.tail.rotation.x = .25 + Math.max(-.3, Math.min(.35, -vy * .03));
  P.tailF.forEach((f, i) => { f.rotation.y = (i / 11 - .5) * (fast ? 1.25 : .95); });
}
