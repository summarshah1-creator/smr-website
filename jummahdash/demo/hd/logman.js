/* Lakri Man (owner 23 Nov): the owner's orange log character, rigged from his own parts sheet (art/logman/*.webp).
   drawLogman(g, x, y, sc, st): x,y = point between his feet on the ground; sc = game units per art pixel;
   st = { ph: run phase, air: 0..1, face: 'smile'..., spin: windmill arms, flip: rotation, squash } */
(() => {
  const P = {}, names = ['body', 'n_uarm', 'f_uarm', 'n_farm', 'f_farm', 'n_hand', 'f_hand', 'n_thigh', 'f_thigh', 'n_shin', 'f_shin', 'n_foot', 'f_foot',
    'n_bat', 'face_neutral', 'face_smile', 'face_grin', 'face_laugh', 'face_shock', 'face_scared', 'face_frown', 'face_angry', 'face_smug', 'face_sad'];
  names.push('n_bat_tape', 'n_bat_alu', 'n_bat_gold');
  names.forEach(n => { const im = new Image(); im.src = 'art/logman/' + n + '.webp?v=3'; P[n] = im; });
  const G = {}; let gLoaded = false; const gold = () => { if (!gLoaded) { gLoaded = true; names.forEach(n => { const im = new Image(); im.src = 'art/logman_gold/' + n + '.webp?v=2'; G[n] = im; }); } return G; };   // golden Lakri Man (rare), loaded when first needed
  window.LOGMAN_GOLD_PRELOAD = gold;
  // joints in each part's own picture (art pixels): [top joint x, y, bottom joint x, y]
  const J = { uarm: [40, 13, 17.5, 83], farm: [19, 5.5, 19, 78], hand: [26.5, 4.5], bat: [48, 7], thigh: [22.5, 5, 19, 80], shin: [21.5, 5, 19, 85], foot: [24.5, 5] };
  const BODY = { hipN: [66, 468], hipF: [88, 466], shN: [44, 272], shF: [58, 266], face: [136, 152] };
  const LEG = 75 + 80 + 52;   // hip to sole when straight
  const ok = im => im.complete && im.naturalWidth;
  function seg(g, im, jx, jy, ang) { g.rotate(ang); if (ok(im)) g.drawImage(im, -jx, -jy); }
  // joint sizes (outer radius incl. outline, art px) where part i meets part i+1
  const JR = { uarm: 13.5, farm: 12.5, thigh: 15, shin: 13 }, FILLS = { n: '#d16c2a', f: '#ad4f1b' }, FILLG = { n: '#f0c850', f: '#c89628' }, INK = '#1d120c';
  let SKIN = P, BATK = '';
  function limb(g, side, parts, angs) {   // a chain of parts hanging from the current origin; owner 23 Nov: no outlines across the joints, one clean outline round the whole limb
    const base = g.getTransform(), joints = [];
    for (let i = 0; i < parts.length; i++) { const k = parts[i], j = J[k]; g.rotate(angs[i]); if (j.length > 2) { g.translate(j[2] - j[0], j[3] - j[1]); joints.push([g.getTransform(), JR[k] || 12]); } }
    g.setTransform(base); g.fillStyle = INK; joints.forEach(([m, r]) => { g.save(); g.setTransform(m); g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.restore(); });   // outline discs behind the joints
    g.setTransform(base);
    for (let i = 0; i < parts.length; i++) { const k = parts[i], j = J[k], im = k === 'bat' && BATK ? (SKIN['n_bat_' + BATK] || SKIN.n_bat) : SKIN[side + '_' + k]; g.rotate(angs[i]); if (ok(im)) g.drawImage(im, -j[0], -j[1]); if (j.length > 2) g.translate(j[2] - j[0], j[3] - j[1]); }
    g.fillStyle = (SKIN === P ? FILLS : FILLG)[side]; joints.forEach(([m, r]) => { g.save(); g.setTransform(m); g.beginPath(); g.arc(0, 0, r - 3.6, 0, 7); g.fill(); g.restore(); });   // paint over the seams
    g.setTransform(base); }
  window.LOGMAN_P = P; window.LOGMAN_H = LEG + 478;   // full height in art pixels
  window.drawLogman = (g, x, y, sc, st = {}) => {
    SKIN = st.skin === 'gold' ? gold() : P; BATK = st.batK || ''; if (SKIN === G && !(ok(G.body))) SKIN = P;
    const p = st.ph || 0, air = st.air || 0, run = 1 - air;
    const lift = Math.abs(Math.sin(p)) * 6 * run;   // bob
    // legs: run cycle on the ground, tucked and kicking in the air
    const legA = s => { const q = p + s; const thigh = (-0.55 * Math.sin(q)) * run + air * (s ? 0.1 : -0.65), shin = (0.15 + 0.95 * Math.max(0, -Math.cos(q))) * run + air * (s ? 0.9 : 0.55), foot = -(thigh + shin) * 0.75; const tk = st.tuck || 0; if (tk) { const T = [s ? -2.0 : -2.2, s ? 2.75 : 2.85, s ? -0.4 : -0.5]; return [thigh + (T[0] - thigh) * tk, shin + (T[1] - shin) * tk, foot + (T[2] - foot) * tk]; } return [thigh, shin, foot]; };   // owner 23 Nov: real somersault: knees pulled up to the chest, heels to the bum
    const armA = s => { const q = p + s; if (st.spin) { const a = st.spin * (s ? 1 : 1) + (s ? Math.PI : 0); return [a, -0.3, 0]; }
      const up = air * (-2.2 + Math.sin((st.t || 0) * 18 + s) * .35); let r = [0.5 * Math.sin(q) * run + up, (-0.35 - 0.35 * Math.max(0, Math.sin(q))) * run - air * 0.5, 0];
      const tk = st.tuck || 0; if (tk) { const T = [s ? -1.5 : -1.7, s ? -1.4 : -1.2, 0]; r = r.map((v, i) => v + (T[i] - v) * tk); } return r; };   // arms hug the shins in the tuck
    g.save(); g.translate(x, y); if (st.flip && !window.__noRot) { const pv = (LEG + 240 - (st.tuck || 0) * 120) * sc; g.translate(0, -pv - (st.tuck || 0) * 60 * sc); g.rotate(st.flip); g.translate(0, pv); }
    const sq = st.squash || 0; g.scale(sc * (1 + sq * .12), sc * (1 - sq * .15)); g.translate(-BODY.hipN[0] - 10, -(LEG + 470) + lift * -1 + (air ? -6 : 0));
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    const at = (pt, fn) => { g.save(); g.translate(pt[0], pt[1]); fn(); g.restore(); };
    at(BODY.shF, () => limb(g, 'f', ['uarm', 'farm', 'hand'], armA(Math.PI)));
    at(BODY.hipF, () => limb(g, 'f', ['thigh', 'shin', 'foot'], legA(Math.PI)));
    if ((st.tuck || 0) <= .3) at(BODY.hipN, () => limb(g, 'n', ['thigh', 'shin', 'foot'], legA(0)));
    g.save(); g.translate(0, 0); if (ok(SKIN.body)) g.drawImage(SKIN.body, 0, 0); g.restore();
    if ((st.tuck || 0) > .3) at(BODY.hipN, () => limb(g, 'n', ['thigh', 'shin', 'foot'], legA(0)));   // tucked knee comes in front of the log
    const fi = SKIN['face_' + (st.face || 'smile')] || SKIN.face_smile; if (ok(fi)) g.drawImage(fi, BODY.face[0] - fi.naturalWidth / 2, BODY.face[1] - fi.naturalHeight / 2);
    at(BODY.shN, () => limb(g, 'n', ['uarm', 'farm', st.bat ? 'bat' : 'hand'], st.swing != null ? [st.swing, st.swingE || 0, 0] : armA(0)));
    g.restore(); };
})();
