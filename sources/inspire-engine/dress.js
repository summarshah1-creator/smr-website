/* Inspire FM · How to dress: awrah for men and women by situation and school (Hanafi, Shafi'i, Maliki, Hanbali),
   dressing for salah, hijab and niqab, men's dress, children and special situations, with illustrated figures.
   Compiled from published fatwas and fiqh summaries of each school (see Sources). To be checked by Inspire FM's scholars. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc, store, TOOLS } = X;

/* ---------------- drawing helpers ---------------- */
let uid = 0;
const mir = p => p.map(([x, y]) => [200 - x, y]);
const rp = pts => { const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; let d = `M${m(pts[n - 1], pts[0]).join(',')}`; for (let i = 0; i < n; i++) { const p = pts[i], q = m(p, pts[(i + 1) % n]); d += `Q${p.join(',')} ${q.join(',')}`; } return d + 'Z'; };
const both = (pts, f = rp) => f(pts) + f(mir(pts));
const sym = half => { const r = mir(half).reverse(); if (half[half.length - 1][0] === 100) r.shift(); return half.concat(r); }; // left half (top to bottom) + mirrored right half
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join(''); };

/* body geometry (viewBox 0 0 200 440), left half only; the right is mirrored */
const G = {
  m: { navel: 188, head: [100, 34, 16, 20], face: [100, 39, 11.5, 15], neck: [[91, 52], [91, 72], [109, 72], [109, 52]],
    torso: sym([[91, 68], [76, 73], [63, 80], [59, 93], [63, 122], [67, 152], [71, 182], [73, 204], [72, 224], [76, 238], [100, 248]]),
    up: [[64, 80], [55, 88], [50, 112], [47, 140], [47, 168], [63, 168], [66, 140], [69, 112], [71, 94]],
    fore: [[47, 164], [45, 190], [45, 214], [47, 238], [60, 238], [62, 214], [63, 190], [63, 164]],
    hand: [[46, 236], [61, 236], [64, 249], [60, 263], [52, 265], [45, 257], [44, 245]],
    thigh: [[75, 226], [73, 252], [75, 290], [78, 324], [96, 324], [98, 290], [100, 246]],
    knee: [[78, 320], [78, 344], [95, 344], [96, 320]],
    shin: [[78, 340], [76, 366], [80, 402], [93, 402], [95, 366], [95, 340]],
    foot: [[79, 398], [93, 398], [95, 411], [92, 421], [69, 421], [69, 413]],
    hair: 'M84 22Q100 6 116 22Q118 28 116 30Q108 22 100 22Q92 22 84 30Q82 28 84 22Z' },
  f: { navel: 180, head: [100, 35, 15, 19], face: [100, 40, 11, 14.5], neck: [[93, 52], [93, 72], [107, 72], [107, 52]],
    torso: sym([[93, 68], [80, 73], [70, 79], [66, 92], [70, 118], [74, 140], [80, 166], [79, 186], [73, 208], [70, 230], [76, 242], [100, 250]]),
    up: [[70, 78], [62, 86], [57, 110], [54, 138], [54, 164], [68, 164], [71, 138], [73, 112], [75, 92]],
    fore: [[54, 160], [52, 188], [52, 212], [54, 234], [65, 234], [67, 212], [68, 188], [68, 160]],
    hand: [[53, 232], [66, 232], [68, 245], [64, 258], [57, 260], [51, 252], [50, 241]],
    thigh: [[71, 226], [70, 256], [74, 292], [78, 324], [96, 324], [98, 292], [100, 248]],
    knee: [[78, 320], [78, 344], [95, 344], [96, 320]],
    shin: [[78, 340], [77, 366], [81, 402], [93, 402], [95, 366], [95, 340]],
    foot: [[80, 398], [93, 398], [95, 410], [92, 420], [72, 420], [72, 413]],
    hair: 'M84 26Q100 2 116 26Q124 40 122 62Q124 80 116 88L108 80Q113 60 112 44Q100 30 88 44Q87 60 92 80L84 88Q76 80 78 62Q76 40 84 26Z' }
};
const parts = g => ({
  head: `<ellipse cx="${g.head[0]}" cy="${g.head[1]}" rx="${g.head[2]}" ry="${g.head[3]}"/>`,
  neck: `<path d="${rp(g.neck)}"/>`, torso: `<path d="${rp(g.torso)}"/>`,
  arms: `<path d="${both(g.up) + both(g.fore) + both(g.hand)}"/>`,
  legs: `<path d="${both(g.thigh) + both(g.knee) + both(g.shin) + both(g.foot)}"/>`
});
const ZONES = { hair: [['head', 0, 80]], neck: [['neck', 40, 80]], shoulders: [['torso', 60, 98], ['arms', 70, 100]], chest: [['torso', 98, 150]], upperArm: [['arms', 100, 166]],
  forearm: [['arms', 166, 236]], hands: [['arms', 236, 270]], belly: [['torso', 150, 'N']], hips: [['torso', 'N', 260], ['legs', 200, 252]], thighs: [['legs', 252, 322]],
  knees: [['legs', 322, 344]], shins: [['legs', 344, 400]], feet: [['legs', 400, 430]] };
const ZN = { hair: 'Head & hair', face: 'Face', neck: 'Neck', shoulders: 'Shoulders', chest: 'Chest & upper back', upperArm: 'Upper arms', forearm: 'Forearms', hands: 'Hands', belly: 'Stomach & lower back', hips: 'Navel to top of thighs', thighs: 'Thighs', knees: 'Knees', shins: 'Lower legs', feet: 'Feet' };
const ZORDER = ['hair', 'face', 'neck', 'shoulders', 'chest', 'upperArm', 'forearm', 'hands', 'belly', 'hips', 'thighs', 'knees', 'shins', 'feet'];
const COL = { c: '#e5534b', s: '#7cc243', d: '#f2b531' };

/* the coverage figure: a smooth, faceless mannequin with each body area coloured by its ruling */
function bodyFig(sex, st, opt = {}) {
  const g = G[sex], P = parts(g), id = 'df' + (++uid), N = g.navel;
  const clip = k => `<clipPath id="${id}${k}">${P[k]}${k === 'head' ? `<path d="${g.hair}"/>` : ''}</clipPath>`;
  const zone = z => (ZONES[z] || []).map(([p, a, b]) => { const y1 = a === 'N' ? N : a, y2 = b === 'N' ? N : b; const s = st[z] || 's'; return `<rect x="0" y="${y1}" width="200" height="${y2 - y1}" clip-path="url(#${id}${p})" fill="${s === 'd' ? `url(#${id}h)` : COL[s]}" opacity="${s === 's' ? .5 : .82}"/>`; }).join('');
  const base = `url(#${id}b)`;
  return `<svg class="dfig" viewBox="0 0 200 440" role="img" aria-label="${esc(opt.label || 'Body coverage diagram')}"><defs>
    <linearGradient id="${id}b" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#efe5da"/><stop offset="1" stop-color="#cdbcaa"/></linearGradient>
    <linearGradient id="${id}sh" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
    <pattern id="${id}h" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="${COL.d}"/><rect width="3.2" height="8" fill="#fff" opacity=".45"/></pattern>
    ${['head', 'neck', 'torso', 'arms', 'legs'].map(clip).join('')}
    <clipPath id="${id}all">${P.head}${P.neck}${P.torso}${P.arms}${P.legs}<path d="${g.hair}"/></clipPath></defs>
    <ellipse cx="100" cy="426" rx="54" ry="7" fill="#000" opacity=".12"/>
    <g fill="${base}">${P.legs}${P.torso}${P.neck}${P.arms}${P.head}</g>
    <path d="${g.hair}" fill="#5b4636"/>
    ${ZORDER.filter(z => z !== 'face').map(zone).join('')}
    <ellipse cx="${g.face[0]}" cy="${g.face[1]}" rx="${g.face[2]}" ry="${g.face[3]}" fill="#f3e9df"/>
    <ellipse cx="${g.face[0]}" cy="${g.face[1]}" rx="${g.face[2]}" ry="${g.face[3]}" fill="${(st.face || 's') === 'd' ? `url(#${id}h)` : COL[st.face || 's']}" opacity="${(st.face || 's') === 's' ? .45 : .82}"/>
    <rect x="0" y="0" width="200" height="440" fill="url(#${id}sh)" clip-path="url(#${id}all)"/>
    <g fill="none" stroke="#3a2f27" stroke-opacity=".35" stroke-width="1">${P.legs}${P.torso}${P.neck}${P.arms}${P.head}</g>
    ${opt.marks !== false ? `<g stroke="#2b2420" stroke-width="1" stroke-dasharray="3 3" opacity=".55"><line x1="58" x2="142" y1="${N}" y2="${N}"/><line x1="70" x2="130" y1="322" y2="322"/><line x1="70" x2="130" y1="344" y2="344"/></g>
    <circle cx="100" cy="${N}" r="2.2" fill="#2b2420" opacity=".6"/>
    <g font-family="DM Sans,system-ui" font-size="9" fill="#5a524b" font-weight="700"><text x="146" y="${N + 3}">navel</text><text x="134" y="336">knee</text></g>` : ''}
  </svg>`;
}

/* outfit illustrations: a faceless figure dressed in the garment being described */
const SKIN = '#d9b693';
function outfitFig(sex, look, opt = {}) {
  const g = G[sex], P = parts(g), id = 'do' + (++uid);
  const gr = (k, c) => `<linearGradient id="${id}${k}" x1="0" x2="1" y1="0" y2=".6"><stop offset="0" stop-color="${shade(c, .28)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -.32)}"/></linearGradient>`;
  const defs = []; const fill = (k, c) => { defs.push(gr(k, c)); return `url(#${id}${k})`; };
  const L = []; const add = (d, f, extra = '') => L.push(`<path d="${d}" fill="${f}" stroke="${'#000'}" stroke-opacity=".18" stroke-width="1" ${extra}/>`);
  const fold = (d, w = 1.2) => L.push(`<path d="${d}" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="${w}" stroke-linecap="round"/>`);
  const hi = d => L.push(`<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-linecap="round"/>`);
  const skinF = fill('sk', SKIN);
  const bare = { head: 1, neck: 1, arms: 1, legs: 1, torso: 1 };
  const face = () => `<ellipse cx="${g.face[0]}" cy="${g.face[1]}" rx="${g.face[2]}" ry="${g.face[3]}" fill="${shade(SKIN, .12)}"/>`;
  const C = look.c || {};
  /* lower garments */
  if (look.trousers) { const f = fill('tr', look.trousers); const half = [[73, 222], [71, 258], [73, 300], [75, 352], [75, 404], [96, 404], [97, 352], [99, 300], [100, 250]]; add(both(half), f); add(rp([[73, 212], [127, 212], [128, 240], [100, 258], [72, 240]]), f); fold('M84 280L86 400M116 280L114 400'); }
  if (look.izar) { const f = fill('iz', '#f7f5ef'); add(rp([[66, 184], [134, 184], [140, 260], [138, 362], [62, 362], [60, 260]]), f); fold('M80 200L76 356M100 196L100 358M120 200L124 356'); fold('M64 220Q100 232 136 220', 1); }
  if (look.skirt) { const f = fill('sk2', look.skirt); add(rp([[74, 190], [126, 190], [140, 300], [150, 412], [50, 412], [60, 300]]), f); fold('M84 230L72 408M100 230L100 410M116 230L128 408'); }
  /* shoes */
  const shoes = look.shoes || '#3b3530';
  if (!look.barefeet) { const f = fill('sh', shoes); add(both([[76, 402], [94, 402], [96, 412], [93, 421], [68, 421], [67, 412]]), f); }
  if (look.sandals) { L.push(`<g stroke="#7a5a3a" stroke-width="2.4" fill="none">${[0, 1].map(s => { const x = s ? 200 - 86 : 86; return `<path d="M${x - 9} 410Q${x} 404 ${x + 9} 410"/><path d="M${x - 11} 420H${x + 9}"/>`; }).join('')}</g>`); }
  /* upper garments */
  if (look.robe) { const r = look.robe, f = fill('rb', r.c), hem = r.hem || 404, w = r.wide || 0;
    const tight = r.sleeve === 'short', side = (tight ? [[66, 86], [67, 120], [70, 170], [71, 250]] : [[56 - w * .2, 110], [60 - w * .3, 170], [58 - w * .6, 250], [56 - w, 330]]).filter(p => p[1] < hem - 6);
    add(rp(sym([[90, 64], [74, 70], [tight ? 62 : 58, 82]].concat(side, [[tight ? 71 : 52 - w * 1.2, hem], [100, hem + 2]]))), f);
    if (r.slit) fold(`M${58 - w * .6} ${hem - 50}L${56 - w} ${hem}M${142 + w * .6} ${hem - 50}L${144 + w} ${hem}`, 1.4);
    fold(`M84 ${Math.max(120, hem - 150)}L${80 - w * .4} ${hem - 4}M100 150L100 ${hem}M116 ${Math.max(120, hem - 150)}L${120 + w * .4} ${hem - 4}`);
    hi(`M${tight ? 72 : 70} 92Q${tight ? 72 : 66} 160 ${tight ? 73 : 66} ${hem - 30}`);
    if (r.placket) fold('M100 68L100 140', 1.6);
    if (r.collar) add('M90 64Q100 76 110 64L110 58Q100 66 90 58Z', fill('cl', shade(r.c, -.1)));
    const sl = r.sleeve || 'long'; const sf = fill('sl', r.c);
    if (sl === 'long') add(both([[60, 80], [50, 92], [44 - w * .1, 140], [42 - w * .2, 234], [62, 234], [64, 150], [72, 96]]), sf);
    if (sl === 'wide') add(both([[60, 80], [48, 94], [38, 150], [34, 232], [64, 232], [64, 150], [72, 96]]), sf);
    if (sl === 'short') add(both([[60, 80], [50, 92], [47, 128], [66, 128], [72, 96]]), sf);
    if (sl === 'long' || sl === 'wide') fold('M50 150L48 226M150 150L152 226');
  }
  if (look.rida) { const f = fill('rd', '#fbfaf5'); add(rp([[116, 70], [142, 80], [154, 112], [152, 158], [146, 206], [64, 206], [62, 160], [74, 128], [96, 100]]), f); fold('M80 186L132 98M96 200L144 116M70 170L116 92'); }
  if (look.vest) { add(rp(sym([[90, 66], [74, 72], [64, 84], [66, 130], [70, 190], [72, 226], [100, 228]])), fill('vs', look.vest)); fold('M100 70L100 226', 1.6); }
  /* head */
  if (look.kufi) add('M83 25Q84 10 100 9Q116 10 117 25Q100 20 83 25Z', fill('ku', look.kufi));
  if (look.turban) { add('M80 30Q78 10 100 7Q122 10 120 30Q100 22 80 30Z', fill('tu', look.turban)); fold('M82 22Q100 12 118 22M81 27Q100 17 119 27', 1); }
  if (look.hijab) { const f = fill('hj', look.hijab), long = look.hijabLong ? 180 : 150;
    add(rp([[100, 10], [119, 14], [127, 30], [129, 50], [124, 66], [140, 80], [148, 106], [142, long], [100, long + 10], [58, long], [52, 106], [60, 80], [76, 66], [71, 50], [73, 30], [81, 14]]), f);
    fold(`M70 90Q74 ${long - 30} 66 ${long - 4}M130 90Q126 ${long - 30} 134 ${long - 4}M100 70Q96 120 100 ${long + 6}`); hi('M78 20Q100 8 120 20'); }
  if (look.jilbab) { const f = fill('jb', look.jilbab);
    add(rp([[100, 8], [122, 14], [130, 40], [140, 74], [156, 120], [162, 250], [166, 414], [34, 414], [38, 250], [44, 120], [60, 74], [70, 40], [78, 14]]), f);
    fold('M64 140L50 408M84 120L78 410M100 110L100 412M116 120L122 410M136 140L150 408'); hi('M78 20Q100 6 122 20'); }
  /* everything drawn in body order */
  const show = look.hands !== false;
  const body = `<g fill="${skinF}">${P.legs}${P.neck}${P.torso}${show ? P.arms : ''}${P.head}</g>`;
  const hair = look.hijab || look.jilbab || look.turban ? '' : `<path d="${g.hair}" fill="#3c2c22"/>`;
  const faceEl = face() + (look.niqab ? `<path d="M${g.face[0] - g.face[2] - 1} ${g.face[1] - 2}Q100 ${g.face[1] - 6} ${g.face[0] + g.face[2] + 1} ${g.face[1] - 2}L${g.face[0] + g.face[2] + 4} ${g.face[1] + 26}Q100 ${g.face[1] + 34} ${g.face[0] - g.face[2] - 4} ${g.face[1] + 26}Z" fill="url(#${id}hj)" stroke="#000" stroke-opacity=".2"/>` : '') +
    (look.hijab || look.jilbab ? `<ellipse cx="${g.face[0]}" cy="${g.face[1]}" rx="${g.face[2] + 1.5}" ry="${g.face[3] + 1.5}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.6"/>` : '');
  const hands = show ? `<path d="${both(g.hand)}" fill="${skinF}" stroke="#000" stroke-opacity=".15"/>` : '';
  return `<svg class="dfig dout" viewBox="0 0 200 440" role="img" aria-label="${esc(opt.label || 'Clothing illustration')}"><defs>${defs.join('')}</defs>
    <ellipse cx="100" cy="426" rx="58" ry="7" fill="#000" opacity=".13"/>${body}${hair}${L.join('')}${faceEl}${hands}</svg>`;
}
const LOOKS = {
  thobe: ['m', { robe: { c: '#f4f1ea', placket: 1, collar: 1 }, kufi: '#ffffff', sandals: 1, barefeet: 1 }],
  thobeDark: ['m', { robe: { c: '#3a4a5c', placket: 1, collar: 1 }, kufi: '#f2efe8' }],
  kameez: ['m', { trousers: '#e9e2d3', robe: { c: '#7d8f6a', hem: 330, slit: 1, placket: 1, collar: 1 }, kufi: '#ffffff' }],
  casualM: ['m', { trousers: '#2f3c52', robe: { c: '#8cc63f', hem: 236, sleeve: 'short' }, shoes: '#e9e9e9' }],
  ihramM: ['m', { izar: 1, rida: 1, sandals: 1, barefeet: 1 }],
  sportM: ['m', { trousers: '#20262d', robe: { c: '#2f7d32', hem: 236, sleeve: 'short' }, shoes: '#f4f4f4' }],
  workM: ['m', { trousers: '#3b4252', robe: { c: '#e9eef5', hem: 236, collar: 1, placket: 1 }, shoes: '#2a221c' }],
  hijab: ['f', { skirt: '#4f6d8a', robe: { c: '#c98b6b', hem: 262 }, hijab: '#ead9c6' }],
  abaya: ['f', { robe: { c: '#1d1f24', hem: 414, wide: 8, sleeve: 'wide' }, hijab: '#2a2c33' }],
  jilbab: ['f', { jilbab: '#4a5a4a', hands: true }],
  niqab: ['f', { robe: { c: '#15161a', hem: 414, wide: 8, sleeve: 'wide' }, hijab: '#15161a', hijabLong: 1, niqab: 1 }],
  prayerW: ['f', { jilbab: '#efe9df' }],
  ihramW: ['f', { robe: { c: '#f2efe9', hem: 414, wide: 6, sleeve: 'wide' }, hijab: '#f7f5f0', shoes: '#c9b9a5' }],
  sportW: ['f', { trousers: '#22262c', robe: { c: '#2f7d32', hem: 300, slit: 1 }, hijab: '#22262c', shoes: '#f4f4f4' }],
  workW: ['f', { trousers: '#3b4252', robe: { c: '#a9b8c9', hem: 300, slit: 1, collar: 1 }, hijab: '#3b4252', shoes: '#2a221c' }],
  eidM: ['m', { trousers: '#efe7d6', robe: { c: '#0f3b2e', hem: 340, slit: 1, placket: 1, collar: 1 }, vest: '#a07a2c', shoes: '#6b4a2b' }],
  eidW: ['f', { robe: { c: '#7a2e4d', hem: 414, wide: 10, sleeve: 'wide' }, hijab: '#e8c9a8', shoes: '#c9a46a' }]
};
const look = (k, label) => outfitFig(LOOKS[k][0], LOOKS[k][1], { label });

/* ---------------- rulings (draft, compiled from each school's references) ---------------- */
const SCH = [['h', 'Hanafi'], ['s', "Shafi'i"], ['m', 'Maliki'], ['b', 'Hanbali']];
const fill = (base, over) => { const o = {}; ZORDER.forEach(z => o[z] = base); return Object.assign(o, over); };
const MEN = {
  pray: { t: 'In prayer', d: {
    h: [fill('s', { hips: 'c', thighs: 'c', knees: 'c', shoulders: 'd' }), 'From just below the navel down to and including the knees. Bare shoulders in prayer are disliked (makruh), so wear a top.'],
    s: [fill('s', { hips: 'c', thighs: 'c', knees: 'd', shoulders: 'd' }), 'Between the navel and the knee (the navel and knees themselves are not awrah), but cover a little of the knee to be sure. Covering the shoulders is recommended.'],
    m: [fill('s', { hips: 'c', thighs: 'd', knees: 's', shoulders: 'd' }), 'The private parts must be covered for the prayer to count. The rest of the navel-to-knee area is "lighter" awrah: still to be covered, and if it shows the prayer is repeated within its time.'],
    b: [fill('s', { hips: 'c', thighs: 'c', knees: 's', shoulders: 'c' }), 'Between the navel and the knee. For a fard prayer at least one shoulder must also be covered if you are able to.'] } },
  day: { t: 'Everyday', d: {
    h: [fill('s', { hips: 'c', thighs: 'c', knees: 'c' }), 'From the navel down to and including the knees, in front of anyone except your wife.'],
    s: [fill('s', { hips: 'c', thighs: 'c', knees: 'd' }), 'Between the navel and the knee. The knee itself is not awrah, but it is covered to make sure the thigh is.'],
    m: [fill('s', { hips: 'c', thighs: 'd', knees: 's' }), 'The private parts are the "heavy" awrah. The area from navel to knee is the "lighter" awrah and should still be covered in public.'],
    b: [fill('s', { hips: 'c', thighs: 'c', knees: 's' }), 'Between the navel and the knee; the navel and knees themselves are not included.'] } }
};
const WOMEN = {
  pray: { t: 'In prayer', d: {
    h: [fill('c', { face: 's', hands: 's', feet: 's' }), 'Everything except the face, hands and feet. Hair that hangs down must be covered too. The feet are not awrah in the relied-upon view, but covering them is better.'],
    s: [fill('c', { face: 's', hands: 's' }), 'Everything except the face and the hands (front and back, up to the wrist). The feet, including the soles, must be covered.'],
    m: [fill('c', { face: 's', hands: 's' }), 'Everything except the face and hands. If the feet, hair or arms show, the prayer is repeated while its time is still in.'],
    b: [fill('c', { face: 's', hands: 'd' }), 'Everything except the face. There are two views on the hands; the well-known view is to cover them, and the other allows them to show.'] } },
  non: { t: 'Non-mahram men', d: {
    h: [fill('c', { face: 'd', hands: 's', feet: 'd' }), 'The face, hands and feet are not awrah. But the school has said since early times that a young woman should cover her face where there is fear of fitnah (temptation).'],
    s: [fill('c', { face: 'd', hands: 'd' }), 'Two views are recorded. Imam an-Nawawi held the face and hands are not awrah; most later Shafi\'i scholars say they should be covered in front of non-mahram men.'],
    m: [fill('c', { face: 's', hands: 's' }), 'Everything except the face and hands. Covering the face is not required, unless there is a real fear of fitnah.'],
    b: [fill('c', { face: 'c', hands: 'c' }), 'The relied-upon view is that the whole body, including the face and hands, is covered in front of non-mahram men. Another narration from Imam Ahmad exempts the face and hands.'] } },
  mah: { t: 'Mahram men', d: {
    h: [fill('s', { belly: 'c', hips: 'c', thighs: 'c', knees: 'c', chest: 'd' }), 'Father, brothers, sons, uncles and others she can never marry may see her head, face, neck, chest, arms and lower legs. The stomach, back, thighs and knees stay covered. Showing the chest is not the norm (adab).'],
    s: [fill('s', { hips: 'c', thighs: 'c', knees: 'd', chest: 'd', belly: 'd' }), 'The minimum is between the navel and the knee. Scholars add that what isn\'t normally shown at home is kept covered as good manners.'],
    m: [fill('c', { hair: 's', face: 's', neck: 's', upperArm: 's', forearm: 's', hands: 's', shins: 's', feet: 's', shoulders: 'd' }), 'She may show her head, neck, arms and feet, the parts that normally show at home. The chest, back and everything down to below the knees stays covered.'],
    b: [fill('c', { hair: 's', face: 's', neck: 's', forearm: 's', hands: 's', shins: 's', feet: 's', shoulders: 'd', upperArm: 'd' }), 'She may show what usually shows at home: head, face, neck, hands, forearms, lower legs and feet.'] } },
  wom: { t: 'Other women', d: {
    h: [fill('s', { hips: 'c', thighs: 'c', knees: 'c' }), 'With Muslim women the awrah is the same as a man\'s: from the navel down to and including the knees. Modesty in what is normally shown still applies.'],
    s: [fill('s', { hips: 'c', thighs: 'c', knees: 'd' }), 'Between the navel and the knee. Before non-Muslim women, the school\'s stricter view is to show only what is shown while working at home.'],
    m: [fill('s', { hips: 'c', thighs: 'c', knees: 'd' }), 'Between the navel and the knee with Muslim women. Some Maliki scholars ask for more cover before non-Muslim women.'],
    b: [fill('s', { hips: 'c', thighs: 'c', knees: 'd' }), 'Between the navel and the knee. Most Hanbali scholars treat non-Muslim women the same as Muslim women here.'] } }
};

/* ---------------- content for the other tabs ---------------- */
const tbl = (rows) => `<div class="dr-tb">${rows.map(([k, v]) => `<div><b>${esc(k)}</b><span>${v}</span></div>`).join('')}</div>`;
const card = (t, body, fig) => `<article class="tk-card dr-card${fig ? ' hasfig' : ''}">${fig ? `<div class="dr-cf">${fig}</div>` : ''}<div class="dr-cb"><h4>${t}</h4>${body}</div></article>`;
const ul = a => `<ul class="dr-ul">${a.map(x => `<li>${x}</li>`).join('')}</ul>`;
const pill = (t, k) => `<span class="dr-pl ${k}">${t}</span>`;

const PAGES = {
  salah: () => `
    <div class="dr-duo"><figure>${look('thobe', 'Man dressed for prayer in a white thobe and cap')}<figcaption>Clean, loose, covers navel to knees and the shoulders</figcaption></figure><figure>${look('prayerW', 'Woman in a one-piece prayer garment')}<figcaption>Everything covered except the face and hands</figcaption></figure></div>
    ${card('The conditions', ul(['Covering the awrah is a condition of the prayer, in all four schools, even when praying alone in a dark room.', 'Clothes, body and place must be clean (free of najasah).', 'Clothes must not be see-through: if the colour of the skin shows, it doesn\'t count as covered.', 'Tight clothes that show the shape are disliked. The prayer is still valid if the awrah is covered.']))}
    ${card('For men', ul(['Wear a top: praying with bare shoulders is disliked; in the Hanbali school one shoulder must be covered for a fard prayer.', 'Covering the head (cap, turban) is a sunnah and good adab. It is not a condition.', 'Hanafi: praying with sleeves rolled up is disliked. Roll them down before you start.', 'Avoid clothes with pictures of people or animals, or slogans, especially at the front.']))}
    ${card('For women', ul(['Hair must be covered, including hair that hangs down.', 'A loose prayer garment over normal clothes is the easiest way.', 'Feet: covered in the Shafi\'i, Maliki and Hanbali schools. Hanafi: not awrah, but better covered (socks or a long garment).', 'Hands: Hanbali scholars differ; long sleeves or a garment that covers to the fingers settles it.']))}
    ${card('If part of the awrah shows during prayer', tbl([['Hanafi', 'Prayer breaks if a quarter of a limb shows for as long as it takes to say "SubhanAllah" three times.'], ["Shafi'i", 'Prayer breaks if it shows, unless the wind blows it and you cover it straight away.'], ['Maliki', 'Prayer breaks if the private parts show. If the lighter awrah shows, repeat it while the time is still in.'], ['Hanbali', 'A small amount showing for a short time is forgiven; a lot, or for long, breaks it.']]))}
  `,
  hijab: () => `
    <div class="dr-four">${[['hijab', 'Hijab (khimar)', 'Covers the hair, neck and chest'], ['abaya', 'Abaya + hijab', 'Loose outer garment over clothes'], ['jilbab', 'Jilbab', 'One piece from head to feet'], ['niqab', 'Niqab', 'Face veil, eyes showing']].map(([k, n, d]) => `<figure>${look(k, n)}<figcaption><b>${n}</b>${d}</figcaption></figure>`).join('')}</div>
    ${card('What makes clothing Islamic', ul(['Covers the awrah (see the Awrah tab for each school).', 'Loose: doesn\'t show the shape of the body.', 'Thick enough that skin and hair don\'t show through.', 'Not made to attract attention or show off (libas ash-shuhrah).', 'Not imitating the opposite sex.', 'For women going out: not heavily perfumed.']))}
    ${card('In the Qur\'an', `<p>An-Nur 24:31 tells believing women to draw their head-coverings (khumur) over their chests and not show their adornment except what normally appears. Al-Ahzab 33:59 tells them to draw their outer garments (jalabib) around them so they are recognised and not harmed.</p>`)}
    ${card('Face covering (niqab) in the four schools', tbl([['Hanafi', `${pill('Not awrah', 'g')} The face isn't awrah, but the school's recorded position is that young women cover it where there's fear of fitnah.`], ["Shafi'i", `${pill('Two views', 'a')} Imam an-Nawawi: not required. Most later scholars: cover it in front of non-mahram men.`], ['Maliki', `${pill('Not required', 'g')} Permitted. Some Maliki scholars disliked it where it isn't local custom.`], ['Hanbali', `${pill('Required', 'r')} The relied-upon view: cover the face and hands in front of non-mahram men.`]]) + '<p class="dr-n">Every school agrees a woman may cover her face, and that it is not worn in ihram for Hajj or Umrah.</p>')}
    ${card('Wearing it well in the UK', ul(['Pins and underscarves stop slipping at school, work and sport.', 'You can be asked to show your face for ID (passport control, police): ask for a woman officer and a private space.', 'Breathable fabrics (jersey, chiffon, modal) for summer; a sports hijab for PE and the gym.']))}
  `,
  men: () => `
    <div class="dr-three">${[['thobe', 'Thobe & cap'], ['kameez', 'Kameez & trousers'], ['casualM', 'Everyday']].map(([k, n]) => `<figure>${look(k, n)}<figcaption><b>${n}</b></figcaption></figure>`).join('')}</div>
    ${card('Silk and gold', `<p>${pill('All four agree', 'r')} Pure silk clothes and gold jewellery (rings, chains, watches made of gold) are haram for men. A silk trim up to four fingers wide is allowed, and silk for a medical need such as a skin condition.</p><p>A silver ring is allowed, and wearing one is a sunnah.</p>`)}
    ${card('Trousers below the ankles (isbal)', tbl([['Hanafi', 'Disliked (makruh tanzihi) without pride; sinful with pride. Some Indian-subcontinent scholars hold it is prohibitively disliked either way.'], ["Shafi'i", 'Disliked without pride, haram with pride. Best is mid-shin; to the ankle is fine.'], ['Maliki', 'Haram with pride; without pride the majority say it isn\'t haram.'], ['Hanbali', 'Disliked without pride, haram with pride. Some later scholars say haram either way.']]) + '<p class="dr-n">Every school agrees that letting it drag out of arrogance is haram.</p>')}
    ${card('The beard', tbl([['Hanafi', 'Growing it is wajib; shaving it is not allowed. Trim what goes beyond a fist length.'], ["Shafi'i", 'The relied-upon view: shaving is disliked (makruh). Some Shafi\'i scholars say haram.'], ['Maliki', 'Shaving is haram. Trimming the untidy edges is fine.'], ['Hanbali', 'Shaving is haram. Leaving it is the sunnah.']]))}
    ${card('Other points', ul(['Covering the head (kufi, turban) is a sunnah of dress, not an obligation.', 'Men must not dress like women, and women must not dress like men (the Prophet ﷺ cursed both, Bukhari).', 'White clothes are recommended, especially for Jummah and the masjid.', 'Gym and football: shorts that cover the knees, or tracksuit bottoms.']))}
  `,
  kids: () => `
    ${card('When does it start?', ul(['The rules of awrah become an obligation at puberty (buloogh), for boys and girls.', 'Parents teach prayer from age 7. Children practise wearing what they will need to wear.', 'Girls are often encouraged to start the hijab gently before puberty so it feels natural.']))}
    ${card('Young children', tbl([['Hanafi', 'A very young child (around 4 or under) has no awrah; it grows gradually as they get older.'], ["Shafi'i", 'Before seven the child is taught; from around seven what is between the navel and knee is covered.'], ['Maliki', 'Small children are taught modesty; the full rules apply at puberty.'], ['Hanbali', 'Ages 7 to 10 cover the private parts; from 10, a boy covers what a man covers.']]))}
    ${card('School', ul(['Most Luton schools allow a hijab in school colours, and long skirts or trousers.', 'PE: tracksuit bottoms, a long-sleeve top and a sports hijab. Ask the school; they will usually agree.', 'Swimming lessons: a full-length swimsuit (burkini) is usually allowed.']))}
  `,
  special: () => `
    <div class="dr-duo"><figure>${look('ihramM', 'Man in ihram')}<figcaption><b>Ihram (men)</b>Two white unstitched sheets, head uncovered</figcaption></figure><figure>${look('ihramW', 'Woman in ihram')}<figcaption><b>Ihram (women)</b>Normal modest clothes, face and hands uncovered</figcaption></figure></div>
    ${card('Hajj & Umrah', ul(['Men: an izar (lower sheet) and rida (upper sheet), sandals that show the ankle bone, nothing covering the head.', 'During tawaf the right shoulder is uncovered (idtiba) in the tawaf after entering ihram.', 'Women: any loose, modest clothes in any colour. No niqab and no gloves while in ihram; she may let a cloth hang in front of her face if men come close.']) + '<a class="btn sm g" href="#tb-hajj">Open the Hajj & Umrah guide</a>')}
    <div class="dr-duo"><figure>${look('workM', 'Work outfit for men')}<figcaption><b>Work</b>Covers navel to knees, smart and loose</figcaption></figure><figure>${look('workW', 'Work outfit for women')}<figcaption><b>Work</b>Long tunic, trousers, hijab in uniform colour</figcaption></figure></div>
    ${card('Work & uniforms', ul(['In the UK, religion is protected under the Equality Act 2010. You can ask your employer to adapt a uniform, for example a hijab in company colours or a longer tunic.', 'Safety rules (hard hats, food hygiene, theatre scrubs) can be met in modest ways: hijab under a hard hat, disposable sleeve covers, long scrubs.', 'Put your request in writing and keep it friendly. Most employers agree.']))}
    <div class="dr-duo"><figure>${look('sportM', 'Sports outfit for men')}<figcaption><b>Gym & football</b>Knees covered</figcaption></figure><figure>${look('sportW', 'Sports outfit for women')}<figcaption><b>Gym & swimming</b>Sports hijab, long top, leggings with a tunic</figcaption></figure></div>
    ${card('Swimming & the gym', ul(['Men: swim shorts that cover the knees.', 'Women: a burkini, or women-only sessions. Ask your local leisure centre what they run.', 'Changing rooms: change in a cubicle where you can.']))}
    ${card('The masjid & Jummah', ul(['"Take your adornment at every place of prayer" (Al-A\'raf 7:31). Wear clean, good clothes.', 'Ghusl, perfume (for men), miswak and your best clothes for Jummah are sunnah.', 'Avoid strong smells such as raw onion or garlic.', 'Women going out to the masjid: modest dress and no strong perfume.']))}
    <div class="dr-duo"><figure>${look('eidM', 'Eid outfit for men')}<figcaption><b>Eid</b>Your best clothes</figcaption></figure><figure>${look('eidW', 'Eid outfit for women')}<figcaption><b>Eid & weddings</b>Beautiful and still modest</figcaption></figure></div>
    ${card('Eid, weddings & celebrations', ul(['Wearing your best clothes on Eid is sunnah; the Prophet ﷺ had a special cloak for Eid and Jummah.', 'Women can dress beautifully for women-only gatherings; outer clothes and hijab go back on in mixed company.', 'Avoid overspending and showing off.']))}
    ${card('Travel & airports', ul(['You can ask for a same-sex private search at security.', 'Pack a lightweight prayer garment or a long scarf for praying on the way.', 'Long-haul: loose layers make wudu and prayer on the plane easier.']))}
  `,
  src: () => `${card('Where this comes from', `<p>Compiled by SMR Digital from published fatwas and fiqh summaries of each school, for Inspire FM's scholars to check before launch:</p>` + ul([
    'Hanafi: DarulUloomTT, Darul Ifta Birmingham, SeekersGuidance (Shaykh Faraz Rabbani), Qibla.com (Radd al-Muhtar, al-Hidaya, al-Ikhtiyar).',
    "Shafi'i: ShafiiFiqh.com, Imam an-Nawawi's al-Majmu' and Rawdat at-Talibin, Ibn Hajar al-Haytami (as summarised by Islamweb).",
    'Maliki: ad-Dardir, al-Sharh al-Kabir and Aqrab al-Masalik (via Dar al-Ifta al-Misriyyah and IslamOnline).',
    'Hanbali: HanbaliDisciples (Hidayat al-Raghib), Ibn Qudamah\'s al-Mughni, Ibn Uthaymin\'s ash-Sharh al-Mumti\' (via IslamQA).',
    'General: Islamweb, IslamQA, Questions on Islam, Dar al-Ifta al-Misriyyah.']) + '<p class="dr-n">Where a school has more than one view, the relied-upon (mu\'tamad) view is shown first. If you follow a particular scholar or masjid, follow their guidance. For your own situation, ask a local imam.</p><a class="btn sm g" href="#jummah">Find your local masjid</a>')}`
};

/* ---------------- "Dressing for Allah": practical guide, motivation cards and private tools ---------------- */
const IC = {
  quran: '<path d="M8 12c6-3 12-2 16 2v28c-4-4-10-5-16-2z"/><path d="M40 12c-6-3-12-2-16 2v28c4-4 10-5 16-2z"/><path d="M14 20h6M14 26h6M28 20h6M28 26h6" opacity=".55"/>',
  outfit: '<path d="M24 8a4 4 0 0 1 4 4c0 2-1.6 3-3 3.6V18l14 8c1.4.8.9 3-.7 3H9.7c-1.6 0-2.1-2.2-.7-3l14-8"/><path d="M15 29h18l4 13H11z" opacity=".55"/>',
  work: '<rect x="8" y="16" width="32" height="22" rx="4"/><path d="M18 16v-4h12v4M8 25h32" /><path d="M22 25v4h4v-4" opacity=".55"/>',
  sport: '<path d="M8 20v8M40 20v8M12 16v16M36 16v16M12 24h24"/><circle cx="24" cy="24" r="0" />',
  weather: '<circle cx="18" cy="18" r="6"/><path d="M18 6v3M6 18h3M9.5 9.5l2 2M26.5 9.5l-2 2"/><path d="M20 36h16a6 6 0 0 0 0-12 9 9 0 0 0-17 3 5 5 0 0 0 1 9z" opacity=".55"/>',
  budget: '<path d="M10 22 24 8h14v14L24 36z"/><circle cx="32" cy="14" r="2.4"/><path d="M19 23h7M20 27h6" opacity=".55"/>',
  why: '<path d="M24 40s-14-8-14-19a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 19-14 19z"/>',
  reply: '<path d="M8 12h28a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H20l-8 7v-7H8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z"/><path d="M12 20h20M12 25h13" opacity=".55"/>',
  steady: '<rect x="8" y="10" width="32" height="30" rx="5"/><path d="M8 18h32M16 6v8M32 6v8"/><path d="M16 28l5 5 10-10" opacity=".7"/>',
  bell: '<path d="M14 32V22a10 10 0 0 1 20 0v10l3 4H11z"/><path d="M20 40a4 4 0 0 0 8 0" opacity=".6"/>',
  talk: '<path d="M10 12h20a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H18l-6 5v-5h-2a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z"/><path d="M34 18h4a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-2v5l-6-5h-8" opacity=".55"/>',
  shop: '<path d="M8 18l3-8h26l3 8"/><path d="M8 18h32v4a5 5 0 0 1-8 0 5 5 0 0 1-8 0 5 5 0 0 1-8 0 5 5 0 0 1-8 0z"/><path d="M11 26v12h26V26M21 38v-8h6v8" opacity=".6"/>',
  sound: '<path d="M10 19h6l8-7v24l-8-7h-6z"/><path d="M30 18a8 8 0 0 1 0 12M34 13a14 14 0 0 1 0 22" opacity=".6"/>',
  star: '<path d="m24 8 4.7 9.6 10.6 1.5-7.7 7.5 1.8 10.5L24 32.2l-9.4 4.9 1.8-10.5-7.7-7.5 10.6-1.5z"/>',
  copy: '<rect x="14" y="14" width="22" height="26" rx="4"/><path d="M10 32V12a4 4 0 0 1 4-4h16"/>'
};
const gi = (k, cls = '') => `<svg class="dg-i ${cls}" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</g></svg>`;
const REV = '<span class="dg-rev">Awaiting review</span>';
const ref = (txt, r) => `<blockquote class="dg-q"><p>${txt}</p><cite>${r}</cite>${REV}</blockquote>`;
const SCHOLAR = '<p class="dg-sch">For detailed rulings, speak to your local imam or a qualified scholar.</p>';

/* the six tiles of the practical guide, per brothers (m) / sisters (f) */
const TILES = [['quran', 'What the Quran and Sunnah say'], ['outfit', 'Everyday outfits'], ['work', 'Work and school'], ['sport', 'Sport and gym'], ['weather', 'Weather: hot, cold, rain'], ['budget', 'On a budget']];
const tipList = a => `<ul class="dr-ul">${a.map(x => `<li>${x}</li>`).join('')}</ul>`;
const GUIDE = {
  quran: { m: () => ref('O children of Adam, We have sent down to you clothing to cover your bodies and as adornment. But the clothing of righteousness, that is best.', 'Quran 7:26') +
      ref('Tell the believing men to lower their gaze and guard their modesty. That is purer for them.', 'Quran 24:30') +
      ref('Do not follow one glance with another. The first is allowed for you, but not the second.', 'Abu Dawud 2149; Tirmidhi 2777') +
      ref('Modesty (haya) is a branch of faith.', 'Bukhari 9; Muslim 35') +
      `<h5>For brothers</h5>${tipList(['Modesty is for men too: in how you dress, how you look at others and how you carry yourself.', 'Lowering the gaze is the first instruction in the Quran\'s passage on modesty, and it comes before the instruction to women.', 'Loose, clean, decent clothes that cover from the navel to the knee as a minimum. Many brothers keep the shoulders and thighs covered in public too.', 'Looking good is not the opposite of modesty: Allah is beautiful and loves beauty (Muslim 91).'])}` + SCHOLAR,
    f: () => ref('O children of Adam, We have sent down to you clothing to cover your bodies and as adornment. But the clothing of righteousness, that is best.', 'Quran 7:26') +
      ref('Tell the believing women to lower their gaze and guard their modesty, and not to show their adornment except what normally appears, and to draw their head-coverings over their chests.', 'Quran 24:31') +
      ref('O Prophet, tell your wives, your daughters and the believing women to draw their outer garments close around them. That is better, so they will be recognised and not harmed.', 'Quran 33:59') +
      ref('Modesty (haya) is a branch of faith.', 'Bukhari 9; Muslim 35') +
      `<h5>For sisters</h5>${tipList(['Clothes that are loose, not see-through, and cover what Allah asks to be covered, with the head-covering brought over the chest.', 'Modesty is also in the gaze, the voice and how we carry ourselves, for men and women alike.', 'Looking beautiful is not the opposite of modesty: Allah is beautiful and loves beauty (Muslim 91).', 'Every step taken for Allah counts, even if you are not where you want to be yet.'])}` + SCHOLAR },
  outfit: { m: () => `<div class="dr-three">${[['thobe', 'Thobe for Jummah'], ['kameez', 'Kameez & trousers'], ['casualM', 'Everyday']].map(([k, n]) => `<figure>${look(k, n)}<figcaption><b>${n}</b></figcaption></figure>`).join('')}</div>` +
      tipList(['Straight or relaxed-fit trousers instead of skinny fits.', 'A longer T-shirt or overshirt that doesn\'t ride up when you bend or pray.', 'Joggers and shorts that come past the knee.', 'A plain thobe or kurta for Jummah and Eid: smart, easy, and comfortable to pray in.', 'Keep a spare top in the car or bag for praying at work or the gym.']),
    f: () => `<div class="dr-three">${[['hijab', 'Tunic & skirt'], ['abaya', 'Abaya'], ['workW', 'Long top & trousers']].map(([k, n]) => `<figure>${look(k, n)}<figcaption><b>${n}</b></figcaption></figure>`).join('')}</div>` +
      tipList(['A long tunic or shirt dress over wide-leg trousers.', 'A maxi dress or skirt with a long cardigan or kimono layered on top.', 'An open abaya over everyday clothes: quick and smart.', 'Hijabs that stay put: a jersey or modal scarf over an underscarf.', 'Keep a lightweight prayer garment in your bag.']) },
  work: { m: () => tipList(['Smart trousers and a shirt or jumper that stays tucked or long enough when you bend.', 'Ask HR where you can pray, and how to fit Jummah around your shift. Most employers are glad to help.', 'Uniform or safety wear: there is usually a modest option. Ask before you assume there isn\'t.', 'In the UK, religion is protected under the Equality Act 2010.', 'School: tracksuit bottoms for PE, and a quiet word with a teacher if something feels unfair.']),
    f: () => tipList(['A long blazer or cardigan over a top and trousers works in almost every office.', 'Ask for a hijab in uniform colours, or a longer tunic in the uniform fabric.', 'Hard hats, hairnets and theatre caps can go over a close-fitting hijab.', 'In the UK, religion is protected under the Equality Act 2010. Put requests in writing and keep it friendly.', 'School: many Luton schools allow a hijab in school colours, long skirts or trousers.']) },
  sport: { m: () => tipList(['Shorts that come past the knee, or joggers.', 'A loose T-shirt rather than a vest.', 'In a mixed gym, choose a spot facing the wall or mirrors away from others and lower your gaze.', 'Swim shorts that cover the knee.', 'Football: long shorts or under-shorts that cover the knee.']),
    f: () => tipList(['A sports hijab (one piece, pull-on) that stays in place.', 'Leggings with a long top or sports skirt over them, or loose joggers.', 'Look for women-only sessions and classes: ask your local leisure centre.', 'Swimming: a burkini, or a women-only swim session.', 'A breathable long-sleeve base layer under a T-shirt.']) },
  weather: { m: () => tipList(['Hot: loose cotton or linen in light colours keeps you cooler than tight clothes.', 'Cold: thermal base layers under normal clothes, and a long coat.', 'Rain: a waterproof jacket that covers the hips, and quick-dry trousers.', 'Wudu in winter: socks you can wipe over (khuffs) after wudu, if your school allows; ask your imam.']),
    f: () => tipList(['Hot: modal, cotton or chiffon hijabs, a cotton underscarf, and light-coloured loose layers.', 'Cold: a thermal base layer, a long padded coat, and a wool or jersey scarf over your hijab.', 'Rain: a long waterproof coat with a hood that fits over the hijab, and a spare scarf in your bag.', 'Windy days: magnetic or pin fastenings, and an underscarf with a grip band.']) },
  budget: { m: () => tipList(['Start with what you already own: a longer top or looser trousers can change a whole outfit.', 'A few plain basics (navy, black, grey, white) go with everything.', 'Charity shops and sales are good for overshirts, coats and smart trousers.', 'Thobes and kurtas are often cheaper from local Muslim shops than online.', 'Buy one piece at a time. There\'s no need to change everything at once.']),
    f: () => tipList(['Start with what you already own: layer a long cardigan or shirt over things you have.', 'Three neutral hijabs (black, cream, grey) go with almost everything.', 'Charity shops are good for long skirts, cardigans and coats.', 'Swap clothes with friends or family.', 'Buy one piece at a time. There\'s no need to change everything at once.']) }
};

/* "For the sake of Allah" cards */
const CARDS = [
  { k: 'why', h: 'Your why', q: [['Actions are judged by intentions, and everyone will have what they intended.', 'Bukhari 1']], r: 'Self-determination theory (Deci & Ryan): changes made for your own deeply held reasons last longer than changes made under pressure.', t: 'Write your reason in My why.', go: 'why' },
  { k: 'shape', h: 'What shapes you', q: [['When it is said to them, "Follow what Allah has revealed," they say, "No, we will follow what we found our forefathers doing."', 'Quran 2:170'], ['If you obey most of those on earth, they will lead you away from the path of Allah.', 'Quran 6:116']], r: 'Asch\'s conformity studies (1950s) and social identity theory (Tajfel & Turner): we all take on the norms of the people around us. Everyone is shaped by something. The question is what you choose to be shaped by.', t: 'Notice one habit you picked up only because others do it.', go: 'notice' },
  { k: 'people', h: 'What will people say?', q: [['Whoever seeks Allah\'s pleasure at the displeasure of people, Allah will suffice him against the people.', 'Tirmidhi 2414']], r: 'The spotlight effect (Gilovich, 2000): people notice and judge us far less than we think they do.', t: 'Save a ready reply.', go: 'replies' },
  { k: 'steady', h: 'Small and steady', q: [['The most beloved deeds to Allah are the most consistent, even if they are small.', 'Bukhari 6464']], r: 'A new habit takes about 66 days on average to form, and missing a day doesn\'t undo it (Lally et al., 2009).', t: 'Pick one small change for this week.', go: 'week' },
  { k: 'hard', h: 'When it\'s hard', q: [['Those who strive for Us, We will surely guide them to Our ways.', 'Quran 29:69'], ['Islam began as something strange, and it will return to being strange as it began. So glad tidings to the strangers.', 'Muslim 145']], r: 'Implementation intentions (Gollwitzer, 1999): "When X happens, I will do Y" plans make follow-through much more likely.', t: 'Make one "When... I will..." plan.', go: 'plan' },
  { k: 'circle', h: 'Your circle', q: [['A person is on the religion of their close friend, so let each of you look at who you befriend.', 'Abu Dawud 4833; Tirmidhi 2378']], r: 'Social support is one of the strongest predictors of keeping up a habit.', t: 'Find a class or circle in Events.', go: 'events' }
];

/* ready replies (calm, polite); users can star and add their own */
const REPLIES = {
  Family: ['I know you care about me, and I really appreciate it. This means a lot to me, and I\'ve thought about it properly.', 'I\'m still the same person. I just want to be closer to Allah, and this is one way I\'m doing it.', 'Can we talk about it another time when we\'re both calm? I\'d really like you to understand why.'],
  Work: ['It\'s part of my faith. It won\'t change how I do my job.', 'Happy to talk through anything practical, like uniform or safety, so it works for everyone.', 'Thanks for checking. I\'m comfortable, and it\'s my choice.'],
  School: ['It\'s my choice, and it\'s part of my religion.', 'I\'m comfortable like this, honestly.', 'If there\'s a uniform question, I\'m happy to talk to a teacher about it.'],
  Friends: ['I\'m still me. I just feel better dressing this way.', 'You don\'t have to change anything. I\'m doing this for myself and for Allah.', 'Come to the next thing with me. Nothing\'s changed between us.'],
  Strangers: ['It\'s part of my faith. Have a good day.', 'Thanks for asking. I\'m Muslim, and it matters to me.', 'I\'m happy to explain if you\'re curious.']
};
const WEEK = { m: ['Lower my gaze on my commute', 'Wear shorts past the knee at the gym', 'Choose a looser fit for one outfit', 'Wear a kufi or thobe to Jummah', 'Keep a spare top for praying at work'],
  f: ['Wear my hijab on one more outing', 'Swap one tight top for a looser one', 'Layer a long cardigan over one outfit', 'Keep a prayer garment in my bag', 'Try a sports hijab at the gym'] };
const REMIND = [['Actions are judged by intentions.', 'Bukhari 1'], ['The most beloved deeds to Allah are the most consistent, even if small.', 'Bukhari 6464'], ['Those who strive for Us, We will surely guide them to Our ways.', 'Quran 29:69'], ['The clothing of righteousness, that is best.', 'Quran 7:26'], ['Modesty is a branch of faith.', 'Bukhari 9'], ['Whoever seeks Allah\'s pleasure at the displeasure of people, Allah will suffice him against the people.', 'Tirmidhi 2414']];
const SOURCES = ['Quran: 2:170, 6:116, 7:26, 24:30, 24:31, 29:69, 33:59.', 'Hadith: Sahih al-Bukhari 1, 9, 6464; Sahih Muslim 35, 91, 145; Sunan Abi Dawud 2149, 4833; Jami at-Tirmidhi 2378, 2414, 2777.',
  'Deci, E. L. & Ryan, R. M. (2000). The "what" and "why" of goal pursuits. Psychological Inquiry, 11(4).', 'Asch, S. E. (1951, 1956). Studies of independence and conformity.', 'Tajfel, H. & Turner, J. C. (1979). An integrative theory of intergroup conflict.',
  'Gilovich, T., Medvec, V. H. & Savitsky, K. (2000). The spotlight effect in social judgment. Journal of Personality and Social Psychology, 78(2).', 'Lally, P. et al. (2009). How are habits formed: modelling habit formation in the real world. European Journal of Social Psychology, 40(6).',
  'Gollwitzer, P. M. (1999). Implementation intentions: strong effects of simple plans. American Psychologist, 54(7).', 'Rulings in "What to cover" and the other tabs: compiled from published fatwas of the four schools (see Sources tab).'];

const dkey = d => d.toISOString().slice(0, 10);
function steadyHTML(G) {
  const days = store.get('dgDays', []), now = new Date(), y = now.getFullYear(), mo = now.getMonth(), first = new Date(y, mo, 1), n = new Date(y, mo + 1, 0).getDate();
  const off = (first.getDay() + 6) % 7, todayK = dkey(new Date(Date.UTC(y, mo, now.getDate())));
  let cells = Array(off).fill('<span></span>').join('');
  for (let i = 1; i <= n; i++) { const k = dkey(new Date(Date.UTC(y, mo, i))), on = days.includes(k), fut = i > now.getDate(); cells += `<button type="button" class="dg-day${on ? ' on' : ''}${k === todayK ? ' td' : ''}" data-day="${k}" ${fut ? 'disabled' : ''} aria-label="${i} ${first.toLocaleString('en-GB', { month: 'long' })}${on ? ', done' : ''}">${i}</button>`; }
  const cnt = days.filter(k => k.startsWith(todayK.slice(0, 7))).length, doneToday = days.includes(todayK);
  const yK = dkey(new Date(Date.UTC(y, mo, now.getDate() - 1))), missed = !doneToday && !days.includes(yK) && days.length;
  const msg = doneToday ? 'Another step for Allah. May He make it easy for you.' : missed ? 'A missed day doesn\'t undo anything. Today is a fresh start.' : 'Tap today when you\'ve kept to your change.';
  const wk = store.get('dgWeek', '');
  return `<p class="dg-sm">${wk ? `This week: <b>${esc(wk)}</b>` : 'Pick a small change for this week in "Small and steady" above.'}</p>
    <div class="dg-cal"><b>${first.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}</b><div class="dg-wd">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<span>${x}</span>`).join('')}</div><div class="dg-grid">${cells}</div></div>
    <p class="dg-msg">${msg}</p><p class="dg-sm">${cnt} steady ${cnt === 1 ? 'day' : 'days'} this month. Saved on this phone only.</p>`;
}
function guideHTML(S) {
  const G = S.sex, sub = S.sub;
  if (sub && GUIDE[sub]) { const t = TILES.find(x => x[0] === sub); return `<button type="button" class="dg-back" data-sub="">‹ Back to the guide</button><div class="tk-card dg-detail"><div class="dg-dh">${gi(sub, 'big')}<h4>${t[1]}</h4></div>${GUIDE[sub][G]()}</div>`; }
  const replies = Object.assign({}, REPLIES, { 'My own': store.get('dgMine', []) }), favs = store.get('dgFav', []), rc = S.rc || 'Family';
  return `<div class="dr-sex dg-sx" role="group" aria-label="Guidance for">${[['m', 'Brothers'], ['f', 'Sisters']].map(([k, n]) => `<button type="button" data-sex="${k}" aria-pressed="${G === k}">${n}</button>`).join('')}</div>
  <div class="dg-tiles">${TILES.map(([k, n]) => `<button type="button" class="dg-tile t-${k}" data-sub="${k}">${gi(k)}<b>${n}</b></button>`).join('')}</div>
  <a class="tk-card dg-shop" href="#tb-business">${gi('shop')}<div><b>Shop local</b><small>Modest clothing from Luton businesses in the Halal Business Directory. No clothing shops are listed yet. Own one? List it free.</small></div><span class="dg-go">›</span></a>

  <h3 class="dg-h">For the sake of Allah</h3><p class="dg-sub">Six short reminders for making changes that last. Swipe through.</p>
  <div class="dg-cards" data-noswipe>${CARDS.map((c, i) => `<article class="dg-card c${i}"><span class="dg-n">${i + 1} of 6</span><h4>${c.h}</h4>${c.q.map(([t, r]) => ref(t, r)).join('')}<div class="dg-res"><b>What research says</b><p>${c.r}</p></div><button type="button" class="dg-try" data-try="${c.go}"><span>Try this</span>${c.t}</button></article>`).join('')}</div>
  <div id="dgTry"></div>

  <h3 class="dg-h">Your tools</h3>
  <section class="tk-card dg-tool" id="dgWhy">${gi('why')}<div><h4>My why</h4><p class="dg-sm">Why are you making this change? Only you can see this. It stays on this phone.</p><textarea id="dgWhyT" rows="3" placeholder="For the sake of Allah, because…">${esc(store.get('dgWhy', ''))}</textarea><span class="dg-saved" id="dgWhyS"></span></div></section>
  <section class="tk-card dg-tool" id="dgReplies">${gi('reply')}<div><h4>Ready replies</h4><p class="dg-sm">Calm, polite answers for when people comment. Star the ones you like.</p>
    <div class="tk-seg dr-seg">${Object.keys(replies).map(k => `<button type="button" data-rc="${k}" aria-pressed="${k === rc}">${k}</button>`).join('')}<button type="button" data-rc="Saved" aria-pressed="${rc === 'Saved'}">Starred</button></div>
    <div class="dg-rl">${(rc === 'Saved' ? favs : replies[rc]).map(t => `<div class="dg-r"><p>${esc(t)}</p><button type="button" class="dg-ib${favs.includes(t) ? ' on' : ''}" data-fav="${esc(t)}" aria-label="Star">${gi('star')}</button><button type="button" class="dg-ib" data-cp="${esc(t)}" aria-label="Copy">${gi('copy')}</button></div>`).join('') || `<p class="dg-sm">${rc === 'Saved' ? 'Star a reply and it will appear here.' : 'Add your own reply below.'}</p>`}</div>
    <div class="dg-add"><input id="dgMineT" placeholder="Write your own reply" maxlength="240"><button type="button" class="btn sm g" data-addr>Add</button></div></div></section>
  <section class="tk-card dg-tool" id="dgSteady">${gi('steady')}<div><h4>Steady days</h4><div id="dgSteadyB">${steadyHTML(G)}</div></div></section>
  <section class="tk-card dg-tool" id="dgRem">${gi('bell')}<div><h4>Daily reminder</h4><p class="dg-sm">One ayah or hadith a day, at a time you choose. Off unless you turn it on.</p>
    <div class="dg-remr"><button class="sw" type="button" role="switch" id="dgRemOn" aria-checked="${!!store.get('dgRem', {}).on}" aria-label="Daily reminder"><i></i></button><label>Time <input type="time" id="dgRemT" value="${store.get('dgRem', {}).t || '08:00'}"></label></div><p class="dg-sm" id="dgRemN"></p></div></section>
  <a class="tk-card dg-tool dg-talk" href="#help">${gi('talk')}<div><h4>Need to talk?</h4><p class="dg-sm">If things feel heavy at home, school or work, there is support in Luton. Find help in Luton.</p></div></a>

  <footer class="dg-foot">
    <div class="dg-revby"><span class="dg-ph">Placeholder</span>Reviewed by [Imam name] and [Teacher name]. Review pending: every ayah and hadith on this page is awaiting review.</div>
    <details class="dg-src"><summary>Sources</summary><ul class="dr-ul">${SOURCES.map(s => `<li>${s}</li>`).join('')}</ul></details>
    <button type="button" class="btn ghost sm dg-listen" data-listen>${gi('sound')}Listen to this page</button>
    <h3 class="dg-h">Keep exploring</h3>
    <div class="dg-more">${[['#tb-duas', 'Duas', 'For every moment'], ['#tb-salah', 'Learn to pray', 'Step by step'], ['#tb-feel', 'How I feel', 'Guidance & help'], ['#events', 'Halal events', 'Classes and circles']].map(([h, t, s]) => `<a href="${h}"><b>${t}</b><small>${s}</small></a>`).join('')}</div>
  </footer>`;
}
function tryHTML(go, G) {
  if (go === 'notice') return `<div class="tk-card dg-tryb"><h4>One habit I picked up from others</h4><textarea id="dgNoticeT" rows="2" placeholder="I noticed that I…">${esc(store.get('dgNotice', ''))}</textarea><p class="dg-sm">Saved on this phone only.</p></div>`;
  if (go === 'week') { const cur = store.get('dgWeek', ''); return `<div class="tk-card dg-tryb"><h4>One small change for this week</h4><div class="dg-wk">${WEEK[G].map(w => `<button type="button" data-wk="${esc(w)}" aria-pressed="${cur === w}">${esc(w)}</button>`).join('')}</div><div class="dg-add"><input id="dgWkT" placeholder="Or write your own" maxlength="120"><button type="button" class="btn sm g" data-wkadd>Set</button></div><p class="dg-sm">Track it in Steady days below.</p></div>`; }
  if (go === 'plan') { const p = store.get('dgPlan', {}); return `<div class="tk-card dg-tryb"><h4>Make a "When... I will..." plan</h4><label class="dg-pl">When<input id="dgPlW" value="${esc(p.w || '')}" placeholder="someone comments on my clothes at work"></label><label class="dg-pl">I will<input id="dgPlI" value="${esc(p.i || '')}" placeholder="smile and use my saved reply"></label><button type="button" class="btn sm g" data-plsave>Save my plan</button></div>`; }
  return '';
}
function remindTick() { const R = store.get('dgRem', {}); if (!R.on || !R.t) return; const now = new Date(), [h, m] = R.t.split(':').map(Number), k = dkey(now); if (store.get('dgRemLast', '') === k) return; if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
  store.set('dgRemLast', k); const r = REMIND[(now.getDate()) % REMIND.length], body = `${r[0]} (${r[1]})`;
  if ('Notification' in window && Notification.permission === 'granted') { (navigator.serviceWorker && navigator.serviceWorker.ready ? navigator.serviceWorker.ready.then(reg => reg.showNotification('Inspire FM', { body, icon: 'icons/icon-192.png', tag: 'dress-reminder' })) : Promise.reject()).catch(() => { try { new Notification('Inspire FM', { body }); } catch (e) {} }); } }
setInterval(remindTick, 60000); setTimeout(remindTick, 4000);
function bindGuide(node, S, draw) {
  const why = $('#dgWhyT', node); if (why) { let t; why.oninput = () => { clearTimeout(t); t = setTimeout(() => { store.set('dgWhy', why.value); $('#dgWhyS', node).textContent = 'Saved'; }, 400); }; }
  const n = $('#dgNoticeT', node); if (n) n.oninput = () => store.set('dgNotice', n.value);
  const rt = $('#dgRemT', node); if (rt) rt.onchange = () => { store.set('dgRem', Object.assign(store.get('dgRem', {}), { t: rt.value })); };
  const note = $('#dgRemN', node); if (note) note.textContent = store.get('dgRem', {}).on ? 'On. On the live site it arrives even when the app is closed; in this preview it comes while Inspire FM is open.' : '';
}
function guideClick(b, node, S, draw) {
  const d = b.dataset;
  if (d.sub !== undefined) { S.sub = d.sub; draw(); const sc = node.closest('.scr-body'); if (sc) sc.scrollTop = 0; return true; }
  if (d.try) { if (d.try === 'why') { $('#dgWhyT', node).focus(); $('#dgWhy', node).scrollIntoView({ behavior: 'smooth', block: 'center' }); return true; }
    if (d.try === 'replies') { $('#dgReplies', node).scrollIntoView({ behavior: 'smooth', block: 'start' }); return true; }
    if (d.try === 'events') { location.hash = '#events'; return true; }
    $('#dgTry', node).innerHTML = tryHTML(d.try, S.sex); $('#dgTry', node).scrollIntoView({ behavior: 'smooth', block: 'center' }); const nt = $('#dgNoticeT', node); if (nt) nt.oninput = () => store.set('dgNotice', nt.value); return true; }
  if (d.rc) { S.rc = d.rc; draw(); $('#dgReplies', node).scrollIntoView({ block: 'start' }); return true; }
  if (d.fav !== undefined) { const f = store.get('dgFav', []), i = f.indexOf(d.fav); i < 0 ? f.push(d.fav) : f.splice(i, 1); store.set('dgFav', f); b.classList.toggle('on', i < 0); X.toast && X.toast(i < 0 ? 'Starred' : 'Removed from starred'); return true; }
  if (d.cp !== undefined) { X.copy ? X.copy(d.cp) : navigator.clipboard.writeText(d.cp); return true; }
  if (b.hasAttribute('data-addr')) { const v = $('#dgMineT', node).value.trim(); if (!v) return true; const m = store.get('dgMine', []); m.unshift(v); store.set('dgMine', m); S.rc = 'My own'; draw(); return true; }
  if (d.day) { const a = store.get('dgDays', []), i = a.indexOf(d.day); i < 0 ? a.push(d.day) : a.splice(i, 1); store.set('dgDays', a); $('#dgSteadyB', node).innerHTML = steadyHTML(S.sex); return true; }
  if (d.wk !== undefined || b.hasAttribute('data-wkadd')) { const v = d.wk !== undefined ? d.wk : $('#dgWkT', node).value.trim(); if (!v) return true; store.set('dgWeek', v); $('#dgTry', node).innerHTML = tryHTML('week', S.sex); $('#dgSteadyB', node).innerHTML = steadyHTML(S.sex); X.toast && X.toast('Set for this week'); return true; }
  if (b.hasAttribute('data-plsave')) { store.set('dgPlan', { w: $('#dgPlW', node).value.trim(), i: $('#dgPlI', node).value.trim() }); X.toast && X.toast('Plan saved'); return true; }
  if (b.id === 'dgRemOn') { const R = store.get('dgRem', {}); R.on = !R.on; R.t = $('#dgRemT', node).value; store.set('dgRem', R); b.setAttribute('aria-checked', R.on);
    if (R.on && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    bindGuide(node, S, draw); return true; }
  if (b.hasAttribute('data-listen')) { const t = [...node.querySelectorAll('.dg-card h4, .dg-q p, .dg-q cite, .dg-res p')].map(e => e.textContent).join('. '); X.speak ? X.speak('Dressing for Allah, in everyday life. ' + t) : 0; return true; }
  return false;
}

/* ---------------- the tool ---------------- */
const TABS = [['guide', 'Guide'], ['awrah', 'What to cover'], ['salah', 'In salah'], ['hijab', 'Hijab & niqab'], ['men', 'Men'], ['kids', 'Children'], ['special', 'Situations'], ['src', 'Sources']];
TOOLS.dress = ['How to dress', null, node => {
  const S = Object.assign({ tab: 'guide', sex: 'f', ctx: 'pray', sch: 'h' }, store.get('dress', {})); if (S.sch === 'all') S.sch = 'h'; S.sub = '';
  const draw = () => {
    store.set('dress', { tab: S.tab, sex: S.sex, ctx: S.ctx, sch: S.sch, rc: S.rc });
    const DATA = S.sex === 'm' ? MEN : WOMEN; if (!DATA[S.ctx]) S.ctx = 'pray';
    let body = '';
    if (S.tab === 'awrah') {
      const ctx = DATA[S.ctx];
      const sel = (id, lab, arr, cur) => `<label class="dr-dd"><span>${lab}</span><select id="${id}">${arr.map(([k, n]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`;
      const [st, note] = ctx.d[S.sch], nm = SCH.find(x => x[0] === S.sch)[1];
      const group = s => ZORDER.filter(z => (st[z] || 's') === s).map(z => ZN[z]);
      const list = (s, t) => { const a = group(s); return a.length ? `<div class="dr-gl ${s}"><b>${t}</b><span>${a.join(' · ')}</span></div>` : ''; };
      body = `<div class="dr-sex" role="group" aria-label="Who">${[['f', 'Women'], ['m', 'Men']].map(([k, n]) => `<button type="button" data-sex="${k}" aria-pressed="${S.sex === k}">${n}</button>`).join('')}</div>
        <div class="dr-dds">${sel('drCtx', 'Situation', Object.entries(DATA).map(([k, v]) => [k, v.t]), S.ctx)}${sel('drSch', 'School of thought', SCH, S.sch)}</div>
        <div class="dr-leg dr-leg1"><span><i style="background:${COL.c}"></i>Must be covered</span><span><i style="background:${COL.s}"></i>Can be shown</span><span><i class="hz"></i>Differs</span></div>
        <div class="dr-main"><div class="dr-figw">${bodyFig(S.sex, st, { label: `${nm}: ${S.sex === 'm' ? 'men' : 'women'}, ${ctx.t.toLowerCase()}` })}</div><div class="dr-side">
          <div class="dr-note"><span class="dr-sch">${nm} · ${esc(ctx.t)}</span><p>${esc(note)}</p></div>
          ${list('c', 'Must be covered')}${list('d', 'Differs, see note')}${list('s', 'Can be shown')}</div></div>`;
    } else if (S.tab === 'guide') body = guideHTML(S); else body = PAGES[S.tab]();
    const hero = S.tab === 'guide'
      ? `<div class="dr-hero g"><span class="dr-hk">The guide</span><h3>Dressing for Allah, in everyday life.</h3><p>Outfit ideas, reminders that help you stay steady, and private tools for making the change for Allah.</p></div>`
      : `<button type="button" class="dr-hero cta" data-tab="guide"><span class="dr-hk">Start here</span><b>Dressing for Allah: the guide</b><small>Outfit ideas, reminders that help you stay steady, and tools to keep you going</small><span class="dr-hgo">Open the guide <svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></span></button>`;
    node.innerHTML = hero + `
      <div class="tk-seg dr-tabs">${TABS.map(([k, n]) => `<button type="button" data-tab="${k}" aria-pressed="${S.tab === k}">${n}</button>`).join('')}</div>
      <div class="dr-body">${body}</div>
      <p class="dr-fn">${S.tab === 'guide' ? 'Ayat and hadith are awaiting review by our imam.' : 'Compiled from published fatwas of the four schools. For detailed rulings, speak to your local imam or a qualified scholar.'}</p>`;
    if (S.tab === 'guide') bindGuide(node, S, draw);
    const cs = $('#drCtx', node), ss = $('#drSch', node); if (cs) cs.onchange = () => { S.ctx = cs.value; draw(); }; if (ss) ss.onchange = () => { S.sch = ss.value; draw(); };
  };
  node.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
    if (S.tab === 'guide' && !d.tab && !d.sex && guideClick(b, node, S, draw)) return;
    if (d.tab) { S.tab = d.tab; S.sub = ''; draw(); const sc = node.closest('.scr-body'); if (sc) sc.scrollTop = 0; return; }
    if (d.sex) { S.sex = d.sex; S.ctx = 'pray'; $('#dgTry', node) && ($('#dgTry', node).innerHTML = ''); } else if (d.ctx) S.ctx = d.ctx; else if (d.x) S.sch = d.x; else return; draw(); });
  draw();
}];
window.IFM_DRESS_FIG = { bodyFig, outfitFig, look };
})();
