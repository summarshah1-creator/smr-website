/* Lakri Man (owner 23 Nov): the owner's orange log character, rigged from his own parts sheet (art/logman/*.webp).
   drawLogman(g, x, y, sc, st): x,y = point between his feet on the ground; sc = game units per art pixel;
   st = { ph: run phase, air: 0..1, face: 'smile'..., spin: windmill arms, flip: rotation, squash } */
(() => {
  const P = {}, names = ['body', 'n_uarm', 'f_uarm', 'n_farm', 'f_farm', 'n_hand', 'f_hand', 'n_thigh', 'f_thigh', 'n_shin', 'f_shin', 'n_foot', 'f_foot',
    'n_bat', 'face_neutral', 'face_smile', 'face_grin', 'face_laugh', 'face_shock', 'face_scared', 'face_frown', 'face_angry', 'face_smug', 'face_sad'];
  names.forEach(n => { const im = new Image(); im.src = 'art/logman/' + n + '.webp?v=1'; P[n] = im; });
  // joints in each part's own picture (art pixels): [top joint x, y, bottom joint x, y]
  const J = { uarm: [40, 13, 17.5, 83], farm: [19, 5.5, 19, 78], hand: [26.5, 4.5], bat: [16, 7], thigh: [22.5, 5, 19, 80], shin: [21.5, 5, 19, 85], foot: [24.5, 5] };
  const BODY = { hipN: [66, 468], hipF: [88, 466], shN: [44, 272], shF: [58, 266], face: [136, 152] };
  const LEG = 75 + 80 + 52;   // hip to sole when straight
  const ok = im => im.complete && im.naturalWidth;
  function seg(g, im, jx, jy, ang) { g.rotate(ang); if (ok(im)) g.drawImage(im, -jx, -jy); }
  // joint sizes (outer radius incl. outline, art px) where part i meets part i+1
  const JR = { uarm: 13.5, farm: 12.5, thigh: 15, shin: 13 }, FILL = { n: '#d16c2a', f: '#ad4f1b' }, INK = '#1d120c';
  function limb(g, side, parts, angs) {   // a chain of parts hanging from the current origin; owner 23 Nov: no outlines across the joints, one clean outline round the whole limb
    const base = g.getTransform(), joints = [];
    for (let i = 0; i < parts.length; i++) { const k = parts[i], j = J[k]; g.rotate(angs[i]); if (j.length > 2) { g.translate(j[2] - j[0], j[3] - j[1]); joints.push([g.getTransform(), JR[k] || 12]); } }
    g.setTransform(base); g.fillStyle = INK; joints.forEach(([m, r]) => { g.save(); g.setTransform(m); g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.restore(); });   // outline discs behind the joints
    g.setTransform(base);
    for (let i = 0; i < parts.length; i++) { const k = parts[i], j = J[k], im = P[side + '_' + k]; g.rotate(angs[i]); if (ok(im)) g.drawImage(im, -j[0], -j[1]); if (j.length > 2) g.translate(j[2] - j[0], j[3] - j[1]); }
    g.fillStyle = FILL[side]; joints.forEach(([m, r]) => { g.save(); g.setTransform(m); g.beginPath(); g.arc(0, 0, r - 3.6, 0, 7); g.fill(); g.restore(); });   // paint over the seams
    g.setTransform(base); }
  window.LOGMAN_H = LEG + 478;   // full height in art pixels
  window.drawLogman = (g, x, y, sc, st = {}) => {
    const p = st.ph || 0, air = st.air || 0, run = 1 - air;
    const lift = Math.abs(Math.sin(p)) * 6 * run;   // bob
    // legs: run cycle on the ground, tucked and kicking in the air
    const legA = s => { const q = p + s; const thigh = (-0.55 * Math.sin(q)) * run + air * (s ? 0.1 : -0.65), shin = (0.15 + 0.95 * Math.max(0, -Math.cos(q))) * run + air * (s ? 0.9 : 0.55), foot = -(thigh + shin) * 0.75; return [thigh, shin, foot]; };
    const armA = s => { const q = p + s; if (st.spin) { const a = st.spin * (s ? 1 : 1) + (s ? Math.PI : 0); return [a, -0.3, 0]; }
      const up = air * (-2.2 + Math.sin((st.t || 0) * 18 + s) * .35); return [0.5 * Math.sin(q) * run + up, (-0.35 - 0.35 * Math.max(0, Math.sin(q))) * run - air * 0.5, 0]; };
    g.save(); g.translate(x, y); if (st.flip) { g.translate(0, -LEG * sc - 240 * sc); g.rotate(st.flip); g.translate(0, LEG * sc + 240 * sc); }
    const sq = st.squash || 0; g.scale(sc * (1 + sq * .12), sc * (1 - sq * .15)); g.translate(-BODY.hipN[0] - 10, -(LEG + 470) + lift * -1 + (air ? -6 : 0));
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    const at = (pt, fn) => { g.save(); g.translate(pt[0], pt[1]); fn(); g.restore(); };
    at(BODY.shF, () => limb(g, 'f', ['uarm', 'farm', 'hand'], armA(Math.PI)));
    at(BODY.hipF, () => limb(g, 'f', ['thigh', 'shin', 'foot'], legA(Math.PI)));
    at(BODY.hipN, () => limb(g, 'n', ['thigh', 'shin', 'foot'], legA(0)));
    g.save(); g.translate(0, 0); if (ok(P.body)) g.drawImage(P.body, 0, 0); g.restore();
    const fi = P['face_' + (st.face || 'smile')] || P.face_smile; if (ok(fi)) g.drawImage(fi, BODY.face[0] - fi.naturalWidth / 2, BODY.face[1] - fi.naturalHeight / 2);
    at(BODY.shN, () => limb(g, 'n', ['uarm', 'farm', st.bat ? 'bat' : 'hand'], st.swing != null ? [st.swing, st.swingE || 0, 0] : armA(0)));
    g.restore(); };
})();
