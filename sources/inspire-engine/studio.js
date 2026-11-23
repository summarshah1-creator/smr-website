/* Inspire FM · Staff Studio: Jummah times → ready-made social posts (story / post / square),
   download one by one or all as a ZIP, and a scheduler that posts once the accounts are connected. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc, store, toast, TOOLS } = X;

/* ---------- data ---------- */
const AREAS = ['Bury Park & Dunstable Road', 'Dallow & town centre', 'Biscot & Saints', 'Leagrave, Hockwell Ring & Lewsey', 'Farley Hill', 'Marsh Farm, Limbury & Sundon Park', 'High Town & east Luton', 'Dunstable'];
const SEED = [
['Bury Park Jamia Masjid','21-27 Bury Park Rd, LU1 1HB',0,['13:00']],['Kokni Masjid','2-3 Bury Park Estate, LU1 1HB',0,['12:30'],'Y'],['Luton Islamic Centre','116 Bury Park Rd, LU1 1HE',0,['12:50'],'Y'],['Madinah Masjid','Crescent Hall, 50 Dunstable Rd, LU1 1EF',0,['13:00'],'Y'],['Luton Central Mosque','2-12 Westbourne Rd, LU4 8JD',0,['12:30','13:30']],['Jamia Islamia Ghosia Trust','23 Westbourne Rd, LU4 8JD',0,['13:00']],['Jamia Al-Akbaria','241 Selbourne Rd, LU4 8NP',0,['12:00','13:00'],'Y'],['Masjid as Sunnah','48 Kingsway, LU4 8EH',0,['13:00']],['Jalalabad Jame Masjid','36-38 Leagrave Rd, LU4 8HZ',0,['13:00']],['Al Hira Masjid','1-7 Beechwood Rd, LU4 8RR',0,['12:30','13:30']],['Masjid e Ali','2-32 Beechwood Rd, LU4 8RP',0,['12:10']],['Masjid Suffa-Tul-Islam','129 Bradley Rd, LU4 8SW',0,['12:30','13:15']],
['Masjid Irshad','400 Dallow Rd, LU1 1UR',1,['12:30','13:15']],['The Dallow Centre','234 Dallow Rd, LU1 1TB',1,['13:30'],'Y'],['Venue Central Jumaah','15-17 Chapel St, LU1 2SE',1,['12:45','13:30']],['Turkish Community Association','58 Dumfries St, LU1 5BS',1,['12:30']],
['Al Jalal Masjid','314 Biscot Rd, LU3 1AZ',2,['12:30','13:15'],'2nd jamaat'],['Masjid-e-Noor','20 Cromwell Rd, LU3 1DN',2,['12:30','13:30']],['Masjid Al Huda','198b Leagrave Rd, LU3 1JD',2,['13:15'],'Y'],['Saints Area Mosque','1 St Ethelberts Ave, LU3 1QH',2,['12:30','13:30']],['Bait ul Abraar Jami Masjid','364-370 Leagrave Rd, LU3 1RF',2,['12:30','13:20']],['Zuhri Academy','Brittania House, Leagrave Rd, LU3 1RJ',2,['13:00'],'Y'],
['Leagrave Hall Masjid','145 High St, LU4 9LE',3,['12:45'],'Y'],['Faizan-E-Mushkil Kusha','91 Leagrave High St, LU4 9JZ',3,['12:30','13:30']],['Hockwell Ring Masjid','13-17 Barley Lane, LU4 9HT',3,['12:30','13:10'],'Y'],['Lewsey Community Centre','Landrace Rd, LU4 0SW',3,['12:30','13:00']],['Zakariya Masjid','1 Beadlow Rd, Lewsey Farm, LU4 0QY',3,['12:20','13:15']],
['Farley Hill Masjid','31 The Cross Way, LU1 5LY',4,['12:30','13:15','13:45']],['Farley Hill Community Centre','Delphine Close, LU1 5RE',4,['13:00']],
['Al Furqan Masjid','33-35 Mount Pleasant Rd, LU3 2ST',5,['13:15'],'Y'],['Masjid Al Bilal','4 Sarum Rd, LU3 2RA',5,['13:00']],['Shah Jalal Islamic Foundation','Marsh Farm Futures House, LU3 3QB',5,['13:00']],['Yusuf Hall','Hill Rise, Sundon Park, LU3 3EE',5,['12:10','12:50']],['Keech Hospice','Great Bramingham Lane, LU3 3NT',5,['13:00'],'Y'],['Lucas Gardens','St Margaret Church, LU3 4BG',5,['13:00']],
['Masjid Ibrahim','45 Dudley St, LU2 0NP',6,['12:35','13:10']],['Bushmead Hub, UKIM Luton North','Hancock Dr, LU2 7SF',6,['12:45','13:30'],'Y'],['Raynham Way Community Centre','66 Eaton Green Rd, LU2 9JE',6,['13:00','13:30']],
['Dunstable Masjid','249 Luton Rd, Dunstable, LU5 4LR',7,['13:15']]];
const fresh = () => ({ month: 'November', year: 2026, updated: '2026-10-29', list: SEED.map(([n, a, ar, t, s]) => ({ n, a, ar: AREAS[ar], t: t.slice(), s: s || '' })) });
let J = store.get('studio_jummah', null) || fresh();
const save = () => { J.updated = new Date().toISOString().slice(0, 10); store.set('studio_jummah', J); };
const ukDate = s => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y.slice(2)}`; };

/* ---------- drawing ---------- */
const SIZES = { story: { w: 1080, h: 1920, top: 205, bot: 165, band: 330, logo: 104, title: 60, label: 'Story', sub: '1080 × 1920 · Instagram & WhatsApp Status', more: 'Tap for more areas' },
  post: { w: 1080, h: 1350, top: 50, bot: 40, band: 210, logo: 84, title: 52, label: 'Post', sub: '1080 × 1350 · Instagram & Facebook feed', more: 'Swipe for more areas' },
  square: { w: 1080, h: 1080, top: 44, bot: 36, band: 190, logo: 76, title: 48, label: 'Square', sub: '1080 × 1080 · Facebook, X, WhatsApp chat', more: 'Swipe for more areas' } };
const C = { g: '#7cb82f', gd: '#4f8a14', ink: '#1d2419', mut: '#6b7564', line: '#dfe8d2', alt: '#eef6e3', pill: '#eef1ea' };
const img = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
let LOGO = null;
async function ready() {
  if (!LOGO) LOGO = await img('img/logo-inv.png');
  try { await Promise.all(['800 60px Saira', '700 32px Saira', '700 30px "DM Sans"', '400 21px "DM Sans"', '600 20px "DM Sans"'].map(f => document.fonts.load(f))); } catch (e) {}
}
const F = { d: 'Saira, "Arial Narrow", sans-serif', b: '"DM Sans", system-ui, sans-serif' };
function rr(c, x, y, w, h, r) { r = typeof r === 'number' ? [r, r, r, r] : r; c.beginPath(); c.moveTo(x + r[0], y); c.lineTo(x + w - r[1], y); c.quadraticCurveTo(x + w, y, x + w, y + r[1]); c.lineTo(x + w, y + h - r[2]); c.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h); c.lineTo(x + r[3], y + h); c.quadraticCurveTo(x, y + h, x, y + h - r[3]); c.lineTo(x, y + r[0]); c.quadraticCurveTo(x, y, x + r[0], y); c.closePath(); }
function pattern(c, W, H) {
  c.save(); c.strokeStyle = 'rgba(205,211,198,.75)'; c.lineWidth = 1.6;
  for (let y = 0; y < H + 120; y += 120) for (let x = 0; x < W + 120; x += 120) {
    c.beginPath(); c.moveTo(x + 60, y + 14); c.lineTo(x + 73, y + 47); c.lineTo(x + 106, y + 60); c.lineTo(x + 73, y + 73); c.lineTo(x + 60, y + 106); c.lineTo(x + 47, y + 73); c.lineTo(x + 14, y + 60); c.lineTo(x + 47, y + 47); c.closePath(); c.stroke();
    c.strokeRect(x + 38, y + 38, 44, 44); c.save(); c.translate(x + 60, y + 60); c.rotate(Math.PI / 4); c.strokeRect(-22, -22, 44, 44); c.restore();
    c.beginPath(); c.arc(x, y, 16, 0, 7); c.stroke();
  }
  const g = c.createRadialGradient(W / 2, H * .55, 50, W / 2, H * .55, H * .7); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
function fit(c, text, max) { if (c.measureText(text).width <= max) return text; let t = text; while (t.length > 3 && c.measureText(t + '…').width > max) t = t.slice(0, -1); return t + '…'; }
/* split the list into pages: areas kept together where possible */
function pages(S) {
  const avail = S.h - S.top - S.bot - (S.band - S.top + S.title + 40) - 110, rmin = S.h > 1500 ? 66 : S.h > 1200 ? 64 : 72, head = 62, gap = 16;
  const P = []; let cur = [], used = 0;
  AREAS.forEach(a => {
    let L = J.list.filter(m => m.ar === a); if (!L.length) return;
    while (L.length) {
      const room = Math.floor((avail - used - (cur.length ? gap : 0) - head) / rmin);
      if (room < 2 && cur.length) { P.push(cur); cur = []; used = 0; continue; }
      const take = L.slice(0, Math.max(room, 1)), cont = cur.some(s => s.a === a) || P.some(p => p.some(s => s.a === a));
      cur.push({ a, cont, L: take }); used += (cur.length > 1 ? gap : 0) + head + take.length * rmin; L = L.slice(take.length);
      if (L.length) { P.push(cur); cur = []; used = 0; }
    }
  });
  if (cur.length) P.push(cur);
  return P.map(p => ({ secs: p, avail, head, gap }));
}
function draw(size, page, n, N, scale = 1) {
  const S = SIZES[size], W = S.w, H = S.h, cv = document.createElement('canvas'); cv.width = W * scale; cv.height = H * scale;
  const c = cv.getContext('2d'); c.scale(scale, scale);
  c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); pattern(c, W, H);
  // green corner
  const bw = 640, bh = S.band, bx = W - bw; const g = c.createLinearGradient(bx, 0, W, bh); g.addColorStop(0, '#a6d65c'); g.addColorStop(.6, '#7cb82f'); g.addColorStop(1, '#64a01f');
  c.fillStyle = g; rr(c, bx, -40, bw + 40, bh + 40, [0, 0, 0, 90]); c.fill();
  const lh = S.logo, lw = LOGO ? LOGO.width / LOGO.height * lh : 0, ly = bh - lh - 26;
  if (LOGO) c.drawImage(LOGO, W - 50 - lw, ly, lw, lh);
  // page pill
  c.font = `700 26px ${F.d}`; const pt = `${n} / ${N}`, pw = c.measureText(pt).width + 36, py = ly + lh / 2 - 22;
  c.fillStyle = C.pill; rr(c, 60, py, pw, 44, 22); c.fill(); c.fillStyle = C.ink; c.textBaseline = 'middle'; c.fillText(pt, 78, py + 23);
  // title
  let y = bh + 34 + S.title * .8; c.textBaseline = 'alphabetic'; c.font = `800 ${S.title}px ${F.d}`; c.fillStyle = C.ink;
  const t1 = 'Jummah jamaat times · '; c.fillText(t1, 60, y); c.fillStyle = C.gd; c.fillText(J.month, 60 + c.measureText(t1).width, y);
  y += 26;
  // sections
  const fh = 110, endY = H - S.bot - fh, secs = page.secs, rows = secs.reduce((s, x) => s + x.L.length, 0);
  const rh = Math.min(96, (endY - y - secs.length * page.head - (secs.length - 1) * page.gap) / rows);
  const nT = Math.max(...secs.flatMap(s => s.L.map(m => m.t.length)));
  secs.forEach((s, si) => {
    if (si) y += page.gap;
    c.font = `800 ${S.h > 1100 ? 44 : 40}px ${F.d}`; c.fillStyle = C.gd; c.textBaseline = 'alphabetic'; c.fillText(s.a + (s.cont ? ' (cont.)' : ''), 64, y + 44); y += page.head;
    const cx = 60, cw = W - 120, ch = s.L.length * rh;
    c.save(); c.shadowColor = 'rgba(40,70,10,.22)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = '#fff'; rr(c, cx, y, cw, ch, 26); c.fill(); c.restore();
    c.save(); rr(c, cx, y, cw, ch, 26); c.clip();
    s.L.forEach((m, i) => {
      const ry = y + i * rh; if (i % 2) { c.fillStyle = C.alt; c.fillRect(cx, ry, cw, rh); }
      const tw = 110, tg = 8, tx0 = cx + cw - 20 - nT * tw - (nT - 1) * tg, mid = ry + rh / 2;
      c.textBaseline = 'alphabetic'; c.font = `700 ${rh < 70 ? 28 : 30}px ${F.b}`; c.fillStyle = C.ink;
      c.fillText(fit(c, m.n, tx0 - cx - 40), cx + 22, mid - 4);
      c.font = `400 ${rh < 70 ? 19 : 21}px ${F.b}`; c.fillStyle = C.mut; const ad = fit(c, m.a, tx0 - cx - 200); c.fillText(ad, cx + 22, mid + (rh < 70 ? 22 : 26));
      if (m.s) { const st = m.s === 'Y' ? 'Sisters ✓' : 'Sisters: ' + m.s; const ax = cx + 22 + c.measureText(ad).width + 12; c.font = `700 17px ${F.b}`; const sw = c.measureText(st).width + 22; c.fillStyle = 'rgba(124,184,47,.15)'; rr(c, ax, mid + (rh < 70 ? 6 : 9), sw, 24, 12); c.fill(); c.fillStyle = C.gd; c.fillText(st, ax + 11, mid + (rh < 70 ? 24 : 27)); }
      m.t.forEach((t, k) => { const x = tx0 + k * (tw + tg), ph = Math.min(52, rh - 18); c.fillStyle = k ? (i % 2 ? '#fff' : C.pill) : C.g; rr(c, x, mid - ph / 2, tw, ph, 12); c.fill(); c.fillStyle = k ? C.ink : '#fff'; c.font = `700 ${rh < 70 ? 30 : 32}px ${F.d}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, x + tw / 2, mid + 2); c.textAlign = 'left'; });
    });
    c.restore(); c.strokeStyle = C.line; c.lineWidth = 2; rr(c, cx, y, cw, ch, 26); c.stroke(); y += ch;
  });
  // footer
  const fy = H - S.bot - 74; c.textBaseline = 'middle'; c.font = `500 22px ${F.b}`;
  c.fillStyle = C.g; rr(c, 60, fy - 11, 22, 22, 6); c.fill(); c.fillStyle = C.ink; c.fillText('1st jamaat', 92, fy);
  const kx = 92 + c.measureText('1st jamaat').width + 26; c.fillStyle = '#e3e8dc'; rr(c, kx, fy - 11, 22, 22, 6); c.fill(); c.fillStyle = C.ink; c.fillText('2nd / 3rd', kx + 32, fy);
  c.font = `700 22px ${F.b}`; const k2 = '30 mins before'; const k2w = c.measureText(k2).width; c.textAlign = 'right'; c.fillText(k2, W - 60, fy); c.font = `500 22px ${F.b}`; c.fillText('Khutbah starts ', W - 60 - k2w, fy);
  const kw = c.measureText('Khutbah starts ').width; c.textAlign = 'left';
  c.strokeStyle = C.gd; c.lineWidth = 2.4; c.beginPath(); c.arc(W - 60 - k2w - kw - 18, fy, 12, 0, 7); c.stroke(); c.beginPath(); c.moveTo(W - 60 - k2w - kw - 18, fy - 6); c.lineTo(W - 60 - k2w - kw - 18, fy); c.lineTo(W - 60 - k2w - kw - 13, fy + 3); c.stroke();
  c.font = `700 32px ${F.d}`; c.fillStyle = C.gd; c.textAlign = 'center';
  c.fillText(n < N ? S.more + '  →' : `inspirefm.org · Updated ${ukDate(J.updated)}`, W / 2, H - S.bot - 22); c.textAlign = 'left';
  return cv;
}

/* ---------- tiny ZIP (stored, no compression) ---------- */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zip(files) {
  const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
  files.forEach(f => { const nm = enc.encode(f.name), d = f.data, cr = crc32(d), h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint32(14, cr, true); h.setUint32(18, d.length, true); h.setUint32(22, d.length, true); h.setUint16(26, nm.length, true);
    parts.push(h.buffer, nm, d); const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true); cd.setUint32(16, cr, true); cd.setUint32(20, d.length, true); cd.setUint32(24, d.length, true); cd.setUint16(28, nm.length, true); cd.setUint32(42, off, true);
    cen.push(cd.buffer, nm); off += 30 + nm.length + d.length; });
  const cs = cen.reduce((s, x) => s + (x.byteLength || x.length), 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...cen, e.buffer], { type: 'application/zip' });
}
const blob = cv => new Promise(r => cv.toBlob(r, 'image/png'));
const dl = (b, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); };
const fname = (size, i) => `inspire-jummah-${J.month.toLowerCase()}-${J.year}-${size}-${i}.png`;

/* ---------- screen ---------- */
TOOLS.studio = ['Studio', null, node => {
  let tab = 'posts', size = 'story';
  const Q = () => store.get('studio_queue', []), setQ = q => store.set('studio_queue', q);
  const auto = () => store.get('studio_auto', { on: true, day: 4, time: '18:00', to: ['ig-story', 'fb-story', 'ig-post'] });
  node.innerHTML = `<div class="st-top"><b>Inspire Studio</b><span>Staff area · Jummah posts</span><a class="st-wc" href="#winter" id="stWc">${IFM_IC('snow')} Winter campaign team</a></div>
    <div class="seg st-tabs" id="stTabs"><button type="button" data-t="posts" aria-pressed="true">Posts</button><button type="button" data-t="times" aria-pressed="false">Jummah times</button><button type="button" data-t="sched" aria-pressed="false">Schedule</button></div>
    <div id="stBody"></div>`;
  const body = $('#stBody', node);
  $('#stWc', node).onclick = e => { e.preventDefault(); location.hash = '#winter'; setTimeout(() => { const f = $('#wfFrame'); if (f) f.src = 'winter/index.html#admin'; }, 120); };
  $('#stTabs', node).onclick = e => { const b = e.target.closest('button'); if (!b) return; tab = b.dataset.t; $$('#stTabs button', node).forEach(x => x.setAttribute('aria-pressed', x === b)); render(); };
  async function renderPosts() {
    body.innerHTML = `<div class="seg st-size" id="stSize">${Object.entries(SIZES).map(([k, s]) => `<button type="button" data-s="${k}" aria-pressed="${k === size}">${s.label}</button>`).join('')}</div>
      <p class="st-note">${SIZES[size].sub} · made from the Jummah times (${J.month} ${J.year}, updated ${ukDate(J.updated)})</p>
      <div class="st-prev" id="stPrev"><div class="tk-empty">Making the posts…</div></div>
      <div class="st-act"><button class="btn g" type="button" id="stZip">Download all (ZIP)</button><button class="btn ghost" type="button" id="stAllSizes">All sizes (ZIP)</button>${navigator.canShare ? '<button class="btn ghost" type="button" id="stShare">Share / save to phone</button>' : ''}</div>`;
    $('#stSize', node).onclick = e => { const b = e.target.closest('button'); if (b) { size = b.dataset.s; renderPosts(); } };
    await ready(); const P = pages(SIZES[size]), cvs = P.map((p, i) => draw(size, p, i + 1, P.length, 1));
    const pv = $('#stPrev', node); pv.innerHTML = ''; pv.dataset.size = size;
    cvs.forEach((cv, i) => { const f = document.createElement('figure'); f.appendChild(cv); const cap = document.createElement('figcaption'); cap.innerHTML = `<span>${i + 1} / ${cvs.length}</span><button type="button" class="btn sm ghost" data-dl="${i}">Download HD</button>`; f.appendChild(cap); pv.appendChild(f); });
    pv.onclick = async e => { const b = e.target.closest('[data-dl]'); if (!b) return; const i = +b.dataset.dl; dl(await blob(draw(size, P[i], i + 1, P.length, 2)), fname(size, i + 1)); };
    const hd = async sizes => { const files = []; for (const s of sizes) { const PP = pages(SIZES[s]); for (let i = 0; i < PP.length; i++) { const b = await blob(draw(s, PP[i], i + 1, PP.length, 2)); files.push({ name: (sizes.length > 1 ? s + '/' : '') + fname(s, i + 1), data: new Uint8Array(await b.arrayBuffer()), b }); } } return files; };
    $('#stZip', node).onclick = async e => { e.target.disabled = true; dl(zip(await hd([size])), `inspire-jummah-${J.month.toLowerCase()}-${size}.zip`); e.target.disabled = false; };
    $('#stAllSizes', node).onclick = async e => { e.target.disabled = true; dl(zip(await hd(Object.keys(SIZES))), `inspire-jummah-${J.month.toLowerCase()}-all-sizes.zip`); e.target.disabled = false; };
    const sh = $('#stShare', node); if (sh) sh.onclick = async () => { const fs = (await hd([size])).map(f => new File([f.b], f.name.split('/').pop(), { type: 'image/png' })); if (navigator.canShare({ files: fs })) navigator.share({ files: fs }).catch(() => {}); else toast('Sharing files isn\'t supported here, use Download'); };
  }
  function renderTimes() {
    body.innerHTML = `<div class="st-meta"><label>Month<input id="stMonth" value="${esc(J.month)}"></label><label>Year<input id="stYear" type="number" value="${J.year}"></label></div>
      <p class="st-note">Change a time and the posts are made again straight away. Last saved ${ukDate(J.updated)}.</p>
      ${AREAS.map(a => `<h3 class="st-ah">${esc(a)}</h3><div class="st-list">${J.list.map((m, i) => m.ar !== a ? '' : `<div class="st-m" data-i="${i}">
        <div class="st-mh"><input class="st-n" data-k="n" value="${esc(m.n)}" aria-label="Masjid name"><button type="button" class="st-x" data-del aria-label="Remove">×</button></div>
        <input class="st-a" data-k="a" value="${esc(m.a)}" aria-label="Address">
        <div class="st-tr">${[0, 1, 2].map(k => `<input type="time" data-t="${k}" value="${m.t[k] || ''}" aria-label="Jamaat ${k + 1}">`).join('')}
        <select data-k="s" aria-label="Sisters"><option value="">No sisters' area</option><option value="Y"${m.s === 'Y' ? ' selected' : ''}>Sisters ✓</option><option value="2nd jamaat"${m.s === '2nd jamaat' ? ' selected' : ''}>Sisters: 2nd jamaat</option></select>
        <select data-k="ar" aria-label="Area">${AREAS.map(x => `<option${x === m.ar ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></div></div>`).join('')}</div>`).join('')}
      <div class="st-act"><button class="btn g" type="button" id="stAdd">Add a masjid</button><button class="btn ghost" type="button" id="stReset">Reset to Inspire's November list</button></div>`;
    const changed = () => { save(); const a = auto(); toast(a.on ? 'Saved · new posts made and queued for ' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][a.day] + ' ' + a.time : 'Saved · posts updated'); if (a.on) queueAuto(); };
    $('#stMonth', node).onchange = e => { J.month = e.target.value.trim() || J.month; changed(); };
    $('#stYear', node).onchange = e => { J.year = +e.target.value || J.year; changed(); };
    body.onchange = e => { const r = e.target.closest('.st-m'); if (!r) return; const m = J.list[+r.dataset.i];
      if (e.target.dataset.t != null) m.t = $$('[data-t]', r).map(x => x.value).filter(Boolean).sort();
      else if (e.target.dataset.k) m[e.target.dataset.k] = e.target.value.trim();
      changed(); if (e.target.dataset.k === 'ar') renderTimes(); };
    body.onclick = e => { const d = e.target.closest('[data-del]'); if (d) { const i = +d.closest('.st-m').dataset.i; if (confirm('Remove ' + J.list[i].n + '?')) { J.list.splice(i, 1); changed(); renderTimes(); } } };
    $('#stAdd', node).onclick = () => { J.list.push({ n: 'New masjid', a: 'Address, postcode', ar: AREAS[0], t: ['13:00'], s: '' }); save(); renderTimes(); const l = $$('.st-m', node); l[l.length - 1]?.scrollIntoView({ block: 'center' }); };
    $('#stReset', node).onclick = () => { if (confirm('Go back to the November list from Inspire\'s sheet?')) { J = fresh(); store.set('studio_jummah', J); renderTimes(); } };
  }
  const NEXT = (day, time) => { const d = new Date(), [h, mi] = time.split(':').map(Number); d.setHours(h, mi, 0, 0); let add = (day - d.getDay() + 7) % 7; if (!add && d < new Date()) add = 7; d.setDate(d.getDate() + add); return d; };
  const TO = { 'ig-story': 'Instagram Story', 'fb-story': 'Facebook Story', 'ig-post': 'Instagram post (carousel)', 'fb-post': 'Facebook post', 'x-post': 'X post' };
  const fmt = { 'ig-story': 'story', 'fb-story': 'story', 'ig-post': 'post', 'fb-post': 'post', 'x-post': 'square' };
  function queueAuto() { const a = auto(), when = NEXT(a.day, a.time).toISOString(); const q = Q().filter(x => !(x.auto && x.status === 'Scheduled')); a.to.forEach(t => q.push({ id: Date.now() + t, when, to: t, auto: 1, status: 'Scheduled', what: `Jummah times · ${J.month}` })); setQ(q); }
  function renderSched() {
    const a = auto(), conn = store.get('studio_conn', {});
    const ACC = [['ig', 'Instagram', '@inspirefmluton', '#E1306C'], ['fb', 'Facebook', 'Inspire FM Luton', '#1877F2'], ['x', 'X', '@inspirefmluton', '#111'], ['wa', 'WhatsApp Channel', 'Manual: we remind you', '#25D366']];
    body.innerHTML = `<h3 class="st-ah">Accounts</h3><div class="st-acc">${ACC.map(([k, n, h, col]) => `<div class="st-ac"><span style="background:${col}">${n[0]}</span><div><b>${n}</b><small>${conn[k] ? 'Connected · ' + h : h}</small></div><button type="button" class="btn sm ${conn[k] ? 'ghost' : 'g'}" data-conn="${k}">${conn[k] ? 'Disconnect' : 'Connect'}</button></div>`).join('')}</div>
      <h3 class="st-ah">Post automatically</h3>
      <div class="st-auto"><label class="st-sw"><input type="checkbox" id="stAuto"${a.on ? ' checked' : ''}><span>When the Jummah times change, make new posts and schedule them</span></label>
        <div class="st-tr"><select id="stDay">${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => `<option value="${i}"${i === a.day ? ' selected' : ''}>${d}</option>`).join('')}</select><input type="time" id="stTime" value="${a.time}"></div>
        <div class="st-to">${Object.entries(TO).map(([k, n]) => `<label><input type="checkbox" value="${k}"${a.to.includes(k) ? ' checked' : ''}>${n}</label>`).join('')}</div></div>
      <h3 class="st-ah">Schedule now</h3>
      <div class="st-auto"><div class="st-tr"><input type="datetime-local" id="stWhen" value="${new Date(Date.now() + 3600e3 - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16)}"><select id="stTo">${Object.entries(TO).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></div><button class="btn g" type="button" id="stQ">Add to schedule</button></div>
      <h3 class="st-ah">Scheduled</h3><div class="st-q" id="stQueue"></div>
      <p class="st-note">Posts go out from Inspire FM's own server once Instagram and Facebook are connected with a Meta Business login (and X with its API). WhatsApp doesn't allow automatic Status or Channel posts, so those get a reminder with the pictures ready to share.</p>`;
    const drawQ = () => { const q = Q().sort((x, y) => x.when < y.when ? -1 : 1); $('#stQueue', node).innerHTML = q.length ? q.map(x => `<div class="st-qi"><div><b>${esc(TO[x.to] || x.to)}</b><small>${new Date(x.when).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · ${esc(x.what)} · ${SIZES[fmt[x.to]].label} ${pages(SIZES[fmt[x.to]]).length} pics${x.auto ? ' · auto' : ''}</small></div><span class="st-st${conn[x.to.split('-')[0]] ? ' ok' : ''}">${conn[x.to.split('-')[0]] ? x.status : 'Needs account'}</span><button type="button" class="st-x" data-rm="${x.id}" aria-label="Remove">×</button></div>`).join('') : '<div class="tk-empty">Nothing scheduled yet.</div>'; };
    drawQ();
    const setA = () => { store.set('studio_auto', { on: $('#stAuto', node).checked, day: +$('#stDay', node).value, time: $('#stTime', node).value || '18:00', to: $$('.st-to input:checked', node).map(x => x.value) }); if (auto().on) queueAuto(); else setQ(Q().filter(x => !(x.auto && x.status === 'Scheduled'))); drawQ(); };
    ['#stAuto', '#stDay', '#stTime'].forEach(s => $(s, node).onchange = setA); $$('.st-to input', node).forEach(x => x.onchange = setA);
    $('#stQ', node).onclick = () => { const w = $('#stWhen', node).value; if (!w) return; const q = Q(); q.push({ id: Date.now(), when: new Date(w).toISOString(), to: $('#stTo', node).value, status: 'Scheduled', what: `Jummah times · ${J.month}` }); setQ(q); drawQ(); toast('Added to the schedule'); };
    $('#stQueue', node).onclick = e => { const b = e.target.closest('[data-rm]'); if (b) { setQ(Q().filter(x => String(x.id) !== b.dataset.rm)); drawQ(); } };
    $$('[data-conn]', node).forEach(b => b.onclick = () => { const k = b.dataset.conn, c2 = store.get('studio_conn', {}); if (c2[k]) { delete c2[k]; store.set('studio_conn', c2); renderSched(); return; }
      if (k === 'wa') { c2[k] = 1; store.set('studio_conn', c2); toast('WhatsApp reminders on'); renderSched(); return; }
      X.modal(`<h3 style="font-size:1.35rem;margin-bottom:8px">Connect ${b.closest('.st-ac').querySelector('b').textContent}</h3><p style="color:var(--mut);margin-bottom:14px">On the live site this opens the official ${k === 'x' ? 'X' : 'Meta'} sign-in, where Inspire FM's admin approves posting for the business account. In this preview it's simulated.</p><button class="btn g" type="button" id="stOk">Simulate connect</button>`);
      setTimeout(() => { const ok = $('#stOk'); if (ok) ok.onclick = () => { c2[k] = 1; store.set('studio_conn', c2); X.closeModal(); toast('Connected (preview)'); renderSched(); }; }, 50); });
  }
  const render = () => tab === 'posts' ? renderPosts() : tab === 'times' ? renderTimes() : renderSched();
  render();
}];
})();
