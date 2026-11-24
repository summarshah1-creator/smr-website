/* Luton Community Hub: pdfsign.js (24 Nov 2026)
   Sign & fill a PDF, on the device only. Nothing is uploaded.
   - Fillable PDFs: reads the form fields with pdf-lib (vendor/pdf-lib.min.js, MIT) and shows each one in place on the
     page: text, multi-line text, tick boxes, radio buttons, dropdowns and lists, dates (date picker, written dd/mm/yyyy)
     and signature fields (tap to sign). The original form is kept; "Flatten" makes it uneditable.
   - Any PDF: tap a tool, then tap the page to place text, a tick, a cross, today's date, your signature or initials.
     Items snap to the line or box under your finger (found by looking for straight lines and small squares in the
     rendered page). Drag to move, corner handle to resize, A−/A+ for text size, undo, zoom buttons, every page.
   - Signatures: draw (smoothed, thicker when slow like a pen), type in a handwriting font, or upload a picture
     (background removed). Kept on this device for next time (localStorage "pdfsign-*", never synced).
   Pages are drawn with pdf.js 3.11 (vendor/, Apache-2.0). Flow modelled on Adobe Fill & Sign and Smallpdf:
   open → fields highlighted → tools along the bottom on phones → Done → download or share. */
(window.LCH_EXT = window.LCH_EXT || []).push(L => {
const T = L.T3; if (!T) return;
const { V, esc, toast, back, TOOL, GLYPH } = L;
const { si, $, $$, addNav } = T;
Object.assign(GLYPH, { i_pdfsign: 'M7 3h8l4 4v14H7zM15 3v4h4M9.5 17c1.5-2 2.5-4 3-3.5s-.5 2 1 2 1.5-1.5 2.5-1' });
TOOL.pdfsign = ['square', 'r', 'y', 'i_pdfsign'];
addNav('mine', [['pdfsign', 'Sign & fill a PDF', 'frm', 'Fill in forms and sign them on your phone. Nothing is uploaded']], 'minutes');

const BASE = (() => { const s = $$('script').find(x => /pdfsign\.js/.test(x.src)); return s ? s.src.replace(/pdfsign\.js.*$/, '') : ''; })();
const load = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = BASE + src; s.onload = res; s.onerror = rej; document.head.append(s); });
let libs = null;
const libsReady = () => libs || (libs = Promise.all([window.PDFLib ? 0 : load('vendor/pdf-lib.min.js'), window.pdfjsLib ? 0 : load('vendor/pdf.min.js')]).then(() => { const pj = window.pdfjsLib || window['pdfjs-dist/build/pdf']; pj.GlobalWorkerOptions.workerSrc = BASE + 'vendor/pdf.worker.min.js'; window.pdfjsLib = pj; }));
const FONTS = [['Dancing Script', 'dancing-script.woff2'], ['Caveat', 'caveat.woff2']];
let fontsOk = null;
const fontsReady = () => fontsOk || (fontsOk = Promise.all(FONTS.map(([n, f]) => { const ff = new FontFace(n, `url(${BASE}vendor/fonts/${f})`); return ff.load().then(x => document.fonts.add(x)).catch(() => { }); })));
const ls = { get: k => { try { return JSON.parse(localStorage.getItem('pdfsign-' + k)); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem('pdfsign-' + k) : localStorage.setItem('pdfsign-' + k, JSON.stringify(v)); } catch (e) { toast('Your browser is full: the signature wasn’t saved'); } } };

/* ---------- state ---------- */
let S = null; // { name, bytes, doc (pdf-lib), pj (pdf.js), pages:[{vp, w, h, segs, boxes, el}], fields:[], vals:{}, items:[], undo:[], zoom, tool, sel }
const uid = () => Math.random().toString(36).slice(2, 9);
const snap = () => { if (!S) return; S.undo.push(JSON.stringify({ items: S.items, vals: S.vals })); if (S.undo.length > 60) S.undo.shift(); };

/* ---------- page ---------- */
V.pdfsign = () => `<div class="wrap pdfs">${back('account', 'Your organisation', 'Sign & fill a PDF')}<div class="sec-h"><div><h1>Sign & fill a PDF</h1><p class="lede">Fill in forms and sign documents on your phone or computer, then download or share the finished PDF.</p></div></div>
  <div id="pdfsApp">${startHTML()}</div></div>`;
const sigThumb = k => { const s = ls.get(k); return s ? `<img src="${s.img}" alt="Your saved ${k === 'sig' ? 'signature' : 'initials'}">` : `<span class="pdfs-none">Not set up yet</span>`; };
const startHTML = () => `<label class="pdfs-drop" id="pdfsDrop"><input type="file" accept="application/pdf,.pdf" id="pdfsFile" hidden>${si('print')}<b>Choose a PDF</b><span>or drop it here</span><small>Up to 40 MB</small></label>
  <p class="pdfs-priv">${si('check')} Your PDF never leaves this device. It’s opened, filled and saved right here in your browser, and nothing is uploaded.</p>
  <div class="pdfs-sigs"><div><b>Your signature</b>${sigThumb('sig')}<button type="button" class="btn s sm" data-pdfsig="sig">${ls.get('sig') ? 'Change' : 'Create'}</button>${ls.get('sig') ? '<button type="button" class="linkbtn" data-pdfsigdel="sig">Remove</button>' : ''}</div>
  <div><b>Your initials</b>${sigThumb('ini')}<button type="button" class="btn s sm" data-pdfsig="ini">${ls.get('ini') ? 'Change' : 'Create'}</button>${ls.get('ini') ? '<button type="button" class="linkbtn" data-pdfsigdel="ini">Remove</button>' : ''}</div></div>
  <div class="pdfs-how"><div><span>1</span><b>Open your PDF</b><small>Forms with boxes to fill are found automatically</small></div><div><span>2</span><b>Fill and sign</b><small>Tap a tool, then tap where it goes. It lines up with the line or box</small></div><div><span>3</span><b>Download or share</b><small>Keep the form editable, or flatten it so it can’t be changed</small></div></div>
  <p class="note">This adds a picture of your signature, like signing on paper. It isn’t a certified digital signature: if an organisation asks for one, use the service they name.</p>`;

/* ---------- open ---------- */
const openPdf = async f => { if (!f) return; if (!/pdf$/i.test(f.type) && !/\.pdf$/i.test(f.name)) { toast('That isn’t a PDF'); return; } if (f.size > 40e6) { toast('That PDF is over 40 MB'); return; }
  const app = $('#pdfsApp'); app.innerHTML = '<div class="t5busy"><span class="t5dots" aria-hidden="true"><i></i><i></i><i></i></span>Opening your PDF…</div>';
  try { await libsReady(); const bytes = new Uint8Array(await f.arrayBuffer());
    const doc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
    const pj = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    S = { name: f.name.replace(/\.pdf$/i, ''), bytes, doc, pj, pages: [], fields: [], vals: {}, items: [], undo: [], zoom: 1, tool: null, sel: null, flat: false };
    readFields(); app.innerHTML = editorHTML(); await renderPages(); updBar();
    if (S.fields.length) toast(`${S.fields.length} box${S.fields.length === 1 ? '' : 'es'} to fill found`); }
  catch (e) { console.warn(e); app.innerHTML = startHTML(); toast(/password|encrypt/i.test(String(e)) ? 'That PDF is password-protected. Open it, save a copy without the password, then try again.' : 'Couldn’t open that PDF'); } };

/* ---------- fillable fields (mode 1) ---------- */
const readFields = () => { let form; try { form = S.doc.getForm(); } catch (e) { return; }
  const pages = S.doc.getPages(), refPage = new Map(); pages.forEach((p, i) => { const an = p.node.Annots && p.node.Annots(); if (an) for (let k = 0; k < an.size(); k++) refPage.set(String(an.get(k)), i); });
  const kind = fd => { const P = PDFLib; return fd instanceof P.PDFTextField ? 'PDFTextField' : fd instanceof P.PDFCheckBox ? 'PDFCheckBox' : fd instanceof P.PDFRadioGroup ? 'PDFRadioGroup' : fd instanceof P.PDFDropdown ? 'PDFDropdown' : fd instanceof P.PDFOptionList ? 'PDFOptionList' : fd instanceof P.PDFSignature ? 'PDFSignature' : ''; };
  form.getFields().forEach(fd => { const C = kind(fd), name = fd.getName(), ws = fd.acroField.getWidgets();
    let type = C === 'PDFTextField' ? 'text' : C === 'PDFCheckBox' ? 'check' : C === 'PDFRadioGroup' ? 'radio' : C === 'PDFDropdown' ? 'drop' : C === 'PDFOptionList' ? 'list' : C === 'PDFSignature' ? 'sig' : null; if (!type) return;
    let opts = []; try { if (type === 'radio' || type === 'drop' || type === 'list') opts = fd.getOptions(); } catch (e) { }
    let ro = false; try { ro = fd.isReadOnly(); } catch (e) { }
    if (type === 'text') { try { S.vals[name] = fd.getText() || ''; } catch (e) { S.vals[name] = ''; } if (/(^|[^a-z])(date|dob|d\.o\.b)([^a-z]|$)/i.test(name)) type = 'date'; }
    if (type === 'check') { try { S.vals[name] = fd.isChecked(); } catch (e) { } } if (type === 'radio') { try { S.vals[name] = fd.getSelected() || ''; } catch (e) { } }
    if (type === 'drop' || type === 'list') { try { S.vals[name] = (fd.getSelected() || [])[0] || ''; } catch (e) { } }
    let multi = false; try { multi = type === 'text' && fd.isMultiline(); } catch (e) { }
    ws.forEach((w, wi) => { const r = w.getRectangle(); let pi = -1; const ref = S.doc.context.getObjectRef(w.dict); if (ref) pi = refPage.get(String(ref)) ?? -1;
      if (pi < 0) { const P = w.P && w.P(); pi = P ? pages.findIndex(p => String(p.ref) === String(P)) : -1; } if (pi < 0) pi = 0;
      S.fields.push({ id: uid(), name, type, pi, r: [r.x, r.y, r.x + r.width, r.y + r.height], opts, opt: type === 'radio' ? opts[wi] ?? String(wi) : null, multi, ro }); }); }); };
const fieldEl = f => { const v = S.vals[f.name], lab = esc(f.name.replace(/[_.]+/g, ' ').trim());
  if (f.type === 'check') return `<button type="button" class="pf-chk${v ? ' on' : ''}" data-ff="${f.id}" aria-pressed="${!!v}" aria-label="${lab}">${v ? '✓' : ''}</button>`;
  if (f.type === 'radio') return `<button type="button" class="pf-rad${v === f.opt ? ' on' : ''}" data-ff="${f.id}" aria-pressed="${v === f.opt}" aria-label="${lab}: ${esc(f.opt)}"></button>`;
  if (f.type === 'drop' || f.type === 'list') return `<select class="pf-in" data-ff="${f.id}" data-uxd="1" aria-label="${lab}"><option value=""></option>${f.opts.map(o => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  if (f.type === 'sig') { const it = S.items.find(i => i.field === f.id); return it ? '' : `<button type="button" class="pf-sig" data-ffsig="${f.id}">${si('star')} Tap to sign</button>`; }
  if (f.type === 'date') { const iso = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v || ''); return `<input class="pf-in" type="date" data-ff="${f.id}" value="${iso ? `${iso[3]}-${iso[2]}-${iso[1]}` : ''}" aria-label="${lab}">`; }
  return f.multi ? `<textarea class="pf-in" data-ff="${f.id}" aria-label="${lab}">${esc(v || '')}</textarea>` : `<input class="pf-in" data-ff="${f.id}" value="${esc(v || '')}" aria-label="${lab}" ${f.ro ? 'readonly' : ''}>`; };

/* ---------- editor ---------- */
const TOOLS = [['text', 'Text', 'M5 6h14M12 6v13'], ['tick', 'Tick', 'M5 12.5l4.5 4.5L19 7'], ['cross', 'Cross', 'M6 6l12 12M18 6L6 18'], ['date', 'Date', 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4'], ['sig', 'Sign', 'M3 17c3-4 5-9 7-8s-1 6 1 6 3-3 4-2 2 2 6-1'], ['ini', 'Initials', 'M6 18V6M10 18V6l6 12V6']];
const editorHTML = () => `<div class="pdfs-top"><div class="pdfs-file"><b>${esc(S.name)}.pdf</b><small>${S.pj.numPages} page${S.pj.numPages === 1 ? '' : 's'}${S.fields.length ? ` · ${new Set(S.fields.map(f => f.name)).size} boxes to fill` : ''}</small></div>
  <div class="pdfs-zoom"><button type="button" data-pz="-1" aria-label="Zoom out">−</button><span id="pdfsZ">100%</span><button type="button" data-pz="1" aria-label="Zoom in">+</button></div><button type="button" class="linkbtn" data-pdfsclose>Close</button></div>
  ${S.fields.length ? `<p class="pdfs-tip">${si('check')} This is a fillable form: tap the highlighted boxes to fill them in. You can also add text and signatures anywhere with the tools.</p>` : `<p class="pdfs-tip">${si('check')} Tap a tool below, then tap where it should go. It lines up with the line or box you tap.</p>`}
  <div class="pdfs-pages" id="pdfsPages"></div>
  <div class="pdfs-bar" role="toolbar" aria-label="Tools">${TOOLS.map(([k, t, p]) => `<button type="button" data-pt="${k}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${p}"/></svg><span>${t}</span></button>`).join('')}
    <button type="button" data-pundo aria-label="Undo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3"/></svg><span>Undo</span></button>
    <button type="button" class="pdfs-done" data-pdone><span>Done</span></button></div>`;
const renderPages = async () => { const box = $('#pdfsPages'), W = Math.min(box.clientWidth || 360, 900), dpr = Math.min(2, window.devicePixelRatio || 1);
  for (let i = 1; i <= S.pj.numPages; i++) { const pg = await S.pj.getPage(i), v1 = pg.getViewport({ scale: 1 }), sc = W / v1.width, vp = pg.getViewport({ scale: sc });
    const wrap = document.createElement('div'); wrap.className = 'pdfs-page'; wrap.dataset.pi = i - 1; wrap.style.width = vp.width + 'px'; wrap.style.height = vp.height + 'px';
    const cv = document.createElement('canvas'); cv.width = Math.round(vp.width * dpr); cv.height = Math.round(vp.height * dpr); cv.style.width = '100%'; cv.style.height = '100%';
    wrap.append(cv); const lay = document.createElement('div'); lay.className = 'pdfs-lay'; wrap.append(lay); const no = document.createElement('span'); no.className = 'pdfs-no'; no.textContent = `Page ${i} of ${S.pj.numPages}`; wrap.append(no); box.append(wrap);
    await pg.render({ canvasContext: cv.getContext('2d'), viewport: pg.getViewport({ scale: sc * dpr }) }).promise;
    S.pages[i - 1] = { vp, w: vp.width, h: vp.height, el: wrap, lay, ...findLines(cv, dpr) }; drawLayer(i - 1); } applyZoom(); };
/* straight lines and small boxes in the rendered page, for snapping (no AI: just runs of dark pixels) */
const findLines = (cv, dpr) => { const x = cv.getContext('2d'), w = cv.width, h = cv.height; let d; try { d = x.getImageData(0, 0, w, h).data; } catch (e) { return { segs: [], vsegs: [], boxes: [] }; }
  const dark = (i) => d[i + 3] > 100 && d[i] + d[i + 1] + d[i + 2] < 420, segs = [], vsegs = [], minH = Math.round(8 * dpr);
  for (let y = 0; y < h; y++) { let run = 0; for (let X = 0; X <= w; X++) { if (X < w && dark((y * w + X) * 4)) run++; else { if (run >= minH) segs.push({ y: y / dpr, x1: (X - run) / dpr, x2: X / dpr }); run = 0; } } }
  for (let X = 0; X < w; X += 1) { let run = 0; for (let y = 0; y <= h; y++) { if (y < h && dark((y * w + X) * 4)) run++; else { if (run >= minH && run < 60 * dpr) vsegs.push({ x: X / dpr, y1: (y - run) / dpr, y2: y / dpr }); run = 0; } } }
  const merge = l => { const o = []; l.sort((a, b) => a.y - b.y || a.x1 - b.x1).forEach(s => { const p = o.find(q => Math.abs(q.y - s.y) <= 1.2 && s.x1 <= q.x2 + 2 && s.x2 >= q.x1 - 2); if (p) { p.x1 = Math.min(p.x1, s.x1); p.x2 = Math.max(p.x2, s.x2); } else o.push({ ...s }); }); return o; };
  const hs = merge(segs), boxes = [];
  const short = hs.filter(s => s.x2 - s.x1 >= 7 && s.x2 - s.x1 <= 46);
  short.forEach(a => short.forEach(b => { const dy = b.y - a.y; if (dy >= 7 && dy <= 46 && Math.abs(a.x1 - b.x1) < 3 && Math.abs(a.x2 - b.x2) < 3 && Math.abs((a.x2 - a.x1) - dy) < 12) { if (!boxes.some(q => Math.abs(q.x - a.x1) < 3 && Math.abs(q.y - a.y) < 3)) boxes.push({ x: a.x1, y: a.y, w: a.x2 - a.x1, h: dy }); } }));
  return { segs: hs.filter(s => s.x2 - s.x1 >= 40), vsegs, boxes }; };
const snapAt = (pi, x, y, kind) => { const P = S.pages[pi]; if (!P) return { x, y };
  if (kind === 'tick' || kind === 'cross') { const b = P.boxes.find(q => x >= q.x - 8 && x <= q.x + q.w + 8 && y >= q.y - 8 && y <= q.y + q.h + 8); if (b) { const s = Math.min(b.w, b.h) * .9; return { x: b.x + b.w / 2 - s / 2, y: b.y + b.h / 2 - s / 2, w: s, h: s, snapped: 1 }; } return { x: x - 9, y: y - 9 }; }
  const l = P.segs.filter(s => x >= s.x1 - 12 && x <= s.x2 + 12 && s.y >= y - 10 && s.y <= y + 28).sort((a, b) => Math.abs(a.y - y - 8) - Math.abs(b.y - y - 8))[0];
  if (l) return { x: Math.max(l.x1 + 2, Math.min(x, l.x2 - 20)), base: l.y - 2, line: l, snapped: 1 }; return { x, base: y + 6 }; };

/* ---------- items ---------- */
const today = () => new Date().toLocaleDateString('en-GB');
const drawLayer = pi => { const P = S.pages[pi]; if (!P) return; const f = S.fields.filter(q => q.pi === pi), it = S.items.filter(q => q.pi === pi);
  P.lay.innerHTML = f.map(q => { const r = P.vp.convertToViewportRectangle(q.r), x = Math.min(r[0], r[2]), y = Math.min(r[1], r[3]), w = Math.abs(r[2] - r[0]), h = Math.abs(r[3] - r[1]); const html = fieldEl(q); return html ? `<div class="pf pf-${q.type}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;--fs:${Math.max(9, Math.min(15, h * .62))}px">${html}</div>` : ''; }).join('')
    + it.map(itemHTML).join(''); };
const itemHTML = i => { const sel = S.sel === i.id;
  const inner = i.k === 'text' || i.k === 'date' ? `<div class="pi-t" contenteditable="${sel}" spellcheck="true" data-pit="${i.id}" style="font-size:${i.fs}px">${esc(i.t || '')}</div>`
    : i.k === 'tick' ? '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6"/></svg>' : i.k === 'cross' ? '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>' : `<img src="${i.img}" alt="">`;
  return `<div class="pi pi-${i.k}${sel ? ' sel' : ''}" data-pi="${i.id}" style="left:${i.x}px;top:${i.y}px;width:${i.w}px;${i.h ? `height:${i.h}px;` : ''}">${inner}${sel ? `<span class="pi-h" data-pih aria-hidden="true"></span><div class="pi-m">${i.k === 'text' || i.k === 'date' ? '<button type="button" data-pfs="-1" aria-label="Smaller text">A−</button><button type="button" data-pfs="1" aria-label="Bigger text">A+</button>' : ''}<button type="button" data-pdel aria-label="Delete">${si('x')}</button></div>` : ''}</div>`; };
const place = async (pi, x, y) => { const k = S.tool; if (!k) return; snap();
  if (k === 'sig' || k === 'ini') { let s = ls.get(k); if (!s) { s = await sigModal(k); if (!s) { S.undo.pop(); return; } }
    const sc = S.pages[pi].vp.scale, sn = snapAt(pi, x, y, k), w = (k === 'sig' ? 150 : 55) * sc, h = w / s.ar; S.items.push({ id: uid(), k, pi, x: sn.x, y: (sn.base != null ? sn.base : y) - h + 4, w, h, img: s.img, ar: s.ar }); }
  else if (k === 'tick' || k === 'cross') { const sn = snapAt(pi, x, y, k); const ts = 14 * S.pages[pi].vp.scale; S.items.push({ id: uid(), k, pi, x: sn.w ? sn.x : x - ts / 2, y: sn.w ? sn.y : y - ts / 2, w: sn.w || ts, h: sn.h || ts }); }
  else { const sn = snapAt(pi, x, y, k), fs = Math.round(11 * S.pages[pi].vp.scale * 10) / 10, it = { id: uid(), k, pi, x: sn.x, y: sn.base - fs * 1.15, w: sn.line ? Math.max(60, sn.line.x2 - sn.x - 2) : 160, fs, t: k === 'date' ? today() : '' }; S.items.push(it); S.sel = it.id; }
  if (!['tick', 'cross'].includes(k)) S.tool = null;
  drawLayer(pi); if (S.sel) { const t = $(`[data-pit="${S.sel}"]`); if (t && !t.textContent) setTimeout(() => t.focus(), 30); } updBar(); };
const findIt = id => S.items.find(i => i.id === id);

/* ---------- zoom, toolbar ---------- */
const applyZoom = () => { $$('.pdfs-page').forEach(p => { const P = S.pages[p.dataset.pi]; if (!P) return; p.style.transform = `scale(${S.zoom})`; p.style.marginBottom = `${P.h * (S.zoom - 1) + 18}px`; p.style.marginRight = `${P.w * (S.zoom - 1)}px`; }); const z = $('#pdfsZ'); if (z) z.textContent = Math.round(S.zoom * 100) + '%'; };
const updBar = () => { $$('[data-pt]').forEach(b => { b.classList.toggle('on', b.dataset.pt === S?.tool); b.setAttribute('aria-pressed', b.dataset.pt === S?.tool); }); const u = $('[data-pundo]'); if (u) u.disabled = !S?.undo.length; };

/* ---------- events ---------- */
document.addEventListener('change', e => { if (e.target.id === 'pdfsFile') openPdf(e.target.files[0]);
  const f = e.target.closest('[data-ff]'); if (f && S) { const q = S.fields.find(x => x.id === f.dataset.ff); snap(); if (q.type === 'date') { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(f.value); S.vals[q.name] = m ? `${m[3]}/${m[2]}/${m[1]}` : ''; } else S.vals[q.name] = f.value; } });
document.addEventListener('input', e => { const f = e.target.closest('input[data-ff],textarea[data-ff]'); if (f && S && f.type !== 'date') { const q = S.fields.find(x => x.id === f.dataset.ff); S.vals[q.name] = f.value; }
  const t = e.target.closest('[data-pit]'); if (t && S) { const i = findIt(t.dataset.pit); if (i) i.t = t.innerText.replace(/\n+$/, ''); } });
document.addEventListener('focusin', e => { const f = e.target.closest('input[data-ff],textarea[data-ff]'); if (f && S && !f._s) { f._s = 1; snap(); } });
document.addEventListener('dragover', e => { if (e.target.closest?.('#pdfsDrop')) { e.preventDefault(); e.target.closest('#pdfsDrop').classList.add('over'); } });
document.addEventListener('dragleave', e => { e.target.closest?.('#pdfsDrop')?.classList.remove('over'); });
document.addEventListener('drop', e => { if (e.target.closest?.('#pdfsDrop')) { e.preventDefault(); openPdf(e.dataTransfer.files[0]); } });
document.addEventListener('click', async e => {
  const sg = e.target.closest('[data-pdfsig]'); if (sg) { await sigModal(sg.dataset.pdfsig); const a = $('#pdfsApp'); if (a && !S) a.innerHTML = startHTML(); return; }
  const sd = e.target.closest('[data-pdfsigdel]'); if (sd) { ls.set(sd.dataset.pdfsigdel, null); $('#pdfsApp').innerHTML = startHTML(); toast('Removed from this device'); return; }
  if (!S) return;
  if (e.target.closest('[data-pdfsclose]')) { if ((S.items.length || S.undo.length) && !confirm('Close this PDF? Anything you haven’t downloaded will be lost.')) return; S = null; $('#pdfsApp').innerHTML = startHTML(); return; }
  const z = e.target.closest('[data-pz]'); if (z) { S.zoom = Math.max(.5, Math.min(3, Math.round((S.zoom + (+z.dataset.pz) * .25) * 100) / 100)); applyZoom(); return; }
  const t = e.target.closest('[data-pt]'); if (t) { S.tool = S.tool === t.dataset.pt ? null : t.dataset.pt; S.sel = null; S.pages.forEach((p, i) => drawLayer(i)); updBar(); if (S.tool) toast(S.tool === 'sig' || S.tool === 'ini' ? (ls.get(S.tool) ? 'Tap where to sign' : 'Tap where to sign. You’ll set it up first') : 'Now tap the page'); return; }
  if (e.target.closest('[data-pundo]')) { const u = S.undo.pop(); if (u) { const o = JSON.parse(u); S.items = o.items; S.vals = o.vals; S.sel = null; S.pages.forEach((p, i) => drawLayer(i)); } updBar(); return; }
  if (e.target.closest('[data-pdone]')) { doneSheet(); return; }
  const fs = e.target.closest('[data-pfs]'); if (fs) { const i = findIt(S.sel); if (i) { snap(); i.fs = Math.max(7, Math.min(40, i.fs + (+fs.dataset.pfs) * 1.5)); drawLayer(i.pi); } return; }
  if (e.target.closest('[data-pdel]')) { const i = findIt(S.sel); if (i) { snap(); S.items = S.items.filter(x => x !== i); S.sel = null; drawLayer(i.pi); updBar(); } return; }
  const ck = e.target.closest('.pf-chk[data-ff],.pf-rad[data-ff]'); if (ck) { const q = S.fields.find(x => x.id === ck.dataset.ff); snap(); S.vals[q.name] = q.type === 'check' ? !S.vals[q.name] : (S.vals[q.name] === q.opt ? '' : q.opt); drawLayer(q.pi); updBar(); return; }
  const fsg = e.target.closest('[data-ffsig]'); if (fsg) { const q = S.fields.find(x => x.id === fsg.dataset.ffsig), s = ls.get('sig') || await sigModal('sig'); if (!s) return; snap(); const P = S.pages[q.pi], r = P.vp.convertToViewportRectangle(q.r), x = Math.min(r[0], r[2]), y = Math.min(r[1], r[3]), w = Math.abs(r[2] - r[0]), h = Math.abs(r[3] - r[1]);
    const ww = Math.min(w, h * s.ar), hh = ww / s.ar; S.items.push({ id: uid(), k: 'sig', pi: q.pi, x: x + 2, y: y + (h - hh) / 2, w: ww, h: hh, img: s.img, ar: s.ar, field: q.id }); drawLayer(q.pi); updBar(); return; } });
/* tap to place, tap to select, drag to move, handle to resize */
let drag = null;
document.addEventListener('pointerdown', e => { if (!S) return; const page = e.target.closest('.pdfs-page'); if (!page) return; const pi = +page.dataset.pi, rect = page.getBoundingClientRect(), k = S.zoom, x = (e.clientX - rect.left) / k, y = (e.clientY - rect.top) / k;
  const el = e.target.closest('.pi'); if (e.target.closest('.pi-m')) return;
  if (el) { const i = findIt(el.dataset.pi); if (S.sel !== i.id) { S.sel = i.id; S.tool = null; updBar(); S.pages.forEach((p, n) => drawLayer(n)); } else if (e.target.closest('[contenteditable=true]') && !e.target.closest('[data-pih]')) return;
    snap(); drag = { i, sx: e.clientX, sy: e.clientY, ox: i.x, oy: i.y, ow: i.w, oh: i.h || 0, rs: !!e.target.closest('[data-pih]'), moved: false, k }; e.preventDefault(); return; }
  if (e.target.closest('.pf')) return;
  if (S.tool) { e.preventDefault(); place(pi, x, y); return; }
  if (S.sel) { S.sel = null; S.pages.forEach((p, n) => drawLayer(n)); } }, { passive: false });
document.addEventListener('pointermove', e => { if (!drag) return; const dx = (e.clientX - drag.sx) / drag.k, dy = (e.clientY - drag.sy) / drag.k; if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true; const i = drag.i, el = $(`[data-pi="${i.id}"]`); if (!el) return;
  if (drag.rs) { i.w = Math.max(14, drag.ow + dx); if (i.ar) i.h = i.w / i.ar; else if (i.k === 'tick' || i.k === 'cross') i.h = i.w; el.style.width = i.w + 'px'; if (i.h) el.style.height = i.h + 'px'; }
  else { const P = S.pages[i.pi]; i.x = Math.max(0, Math.min(P.w - 10, drag.ox + dx)); i.y = Math.max(0, Math.min(P.h - 8, drag.oy + dy)); el.style.left = i.x + 'px'; el.style.top = i.y + 'px'; } });
document.addEventListener('pointerup', () => { if (!drag) return; if (!drag.moved) S.undo.pop(); else { const i = drag.i; if (!drag.rs && (i.k === 'text' || i.k === 'date')) { const sn = snapAt(i.pi, i.x + 4, i.y + i.fs, 'text'); if (sn.line && Math.abs(sn.base - (i.y + i.fs * 1.15)) < 9) { i.y = sn.base - i.fs * 1.15; drawLayer(i.pi); } } }
  if (!drag.moved && drag.i && (drag.i.k === 'text' || drag.i.k === 'date')) { const t = $(`[data-pit="${drag.i.id}"]`); if (t) { t.contentEditable = 'true'; t.focus(); } } drag = null; updBar(); });

/* ---------- signature maker ---------- */
const sigModal = k => new Promise(res => { const name = (L.store.get('profile', null) || {}).name || '';
  L.modal(`<div class="mhead"><h3>${k === 'sig' ? 'Your signature' : 'Your initials'}</h3><button class="ib" data-close aria-label="Close">${si('x')}</button></div>
  <div class="t5seg sgtabs" role="tablist"><button type="button" class="on" data-sgt="draw">Draw</button><button type="button" data-sgt="type">Type</button><button type="button" data-sgt="up">Upload</button></div>
  <div data-sgp="draw"><div class="sgpad"><canvas id="sgCv" aria-label="Sign here with your finger or mouse"></canvas><span class="sgline"></span><span class="sghint">Sign here</span></div><div class="row"><span class="sgcols">${['#111111', '#1D3A8A'].map((c, i) => `<button type="button" class="sgc${i ? '' : ' on'}" data-sgc="${c}" style="background:${c}" aria-label="${i ? 'Blue' : 'Black'} ink"></button>`).join('')}</span><button type="button" class="linkbtn" data-sgclear>Clear</button></div></div>
  <div data-sgp="type" hidden><label class="f">Type your ${k === 'sig' ? 'name' : 'initials'}<input class="in" id="sgName" value="${esc(k === 'sig' ? name : name.split(/\s+/).map(w => w[0] || '').join('').toUpperCase())}"></label><div class="sgfonts">${FONTS.map(([n], i) => `<button type="button" class="sgf${i ? '' : ' on'}" data-sgf="${n}" style="font-family:'${n}'">${esc((k === 'sig' ? name : '') || 'Your name')}</button>`).join('')}</div></div>
  <div data-sgp="up" hidden><label class="btn s sm">Choose a picture<input type="file" accept="image/*" id="sgUp" hidden></label><p class="note">A photo of your signature on white paper works best. We take the background out.</p><div class="sgprev" id="sgPrev"></div></div>
  <label class="t5ck" style="margin-top:10px"><input type="checkbox" id="sgKeep" checked> Keep it on this device for next time</label>
  <div class="row" style="margin-top:12px"><button type="button" class="btn p" data-sgsave>Use this</button></div><p class="note">Kept only in this browser. It’s never uploaded.</p>`);
  let tab = 'draw', col = '#111111', font = FONTS[0][0], upImg = null, strokes = [], cur = null; const cv = $('#sgCv'), ctx = cv.getContext('2d');
  const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(3, devicePixelRatio || 1); cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); redraw(); };
  const seg = (p0, p1, p2, w) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2); ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2); ctx.stroke(); };
  const redraw = () => { const r = cv.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; strokes.forEach(s => { ctx.strokeStyle = s.c; if (s.p.length === 1) { ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(s.p[0].x, s.p[0].y, 1.6, 0, 7); ctx.fill(); } for (let i = 1; i < s.p.length; i++) seg(s.p[Math.max(0, i - 2)] || s.p[i - 1], s.p[i - 1], s.p[i], s.p[i].w); }); $('.sghint').hidden = strokes.length > 0; };
  requestAnimationFrame(size);
  cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); const r = cv.getBoundingClientRect(); cur = { c: col, p: [{ x: e.clientX - r.left, y: e.clientY - r.top, t: e.timeStamp, w: 2.4 }] }; strokes.push(cur); redraw(); });
  cv.addEventListener('pointermove', e => { if (!cur) return; const r = cv.getBoundingClientRect(), p = { x: e.clientX - r.left, y: e.clientY - r.top, t: e.timeStamp }, l = cur.p[cur.p.length - 1], dist = Math.hypot(p.x - l.x, p.y - l.y); if (dist < 1.2) return;
    const v = dist / Math.max(1, p.t - l.t), pr = e.pressure && e.pointerType === 'pen' ? e.pressure : null; p.w = pr ? 1 + pr * 3.2 : Math.max(1.1, Math.min(3.4, 3.6 - v * 1.6)); p.w = l.w * .6 + p.w * .4; cur.p.push(p);
    ctx.strokeStyle = cur.c; ctx.lineCap = 'round'; const n = cur.p.length; seg(cur.p[Math.max(0, n - 3)], cur.p[n - 2], cur.p[n - 1], p.w); });
  const end = () => { cur = null; }; cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  const box = $('.modal') || document.body;
  const onClick = e => { const tb = e.target.closest('[data-sgt]'); if (tb) { tab = tb.dataset.sgt; $$('[data-sgt]').forEach(b => b.classList.toggle('on', b === tb)); $$('[data-sgp]').forEach(p => p.hidden = p.dataset.sgp !== tab); if (tab === 'draw') requestAnimationFrame(size); if (tab === 'type') fontsReady().then(() => $$('.sgf').forEach(b => b.textContent = $('#sgName').value || 'Your name')); return; }
    const c = e.target.closest('[data-sgc]'); if (c) { col = c.dataset.sgc; $$('[data-sgc]').forEach(b => b.classList.toggle('on', b === c)); strokes.forEach(s => s.c = col); redraw(); return; }
    if (e.target.closest('[data-sgclear]')) { strokes = []; redraw(); return; }
    const f = e.target.closest('[data-sgf]'); if (f) { font = f.dataset.sgf; $$('[data-sgf]').forEach(b => b.classList.toggle('on', b === f)); return; }
    if (e.target.closest('[data-sgsave]')) { const out = makeSig(); if (!out) { toast(tab === 'draw' ? 'Sign in the box first' : tab === 'type' ? 'Type your name first' : 'Choose a picture first'); return; } if ($('#sgKeep').checked) ls.set(k, out); cleanup(); L.closeModal(); res(out); return; }
    if (e.target.closest('[data-close]')) { cleanup(); res(null); } };
  const onInput = e => { if (e.target.id === 'sgName') $$('.sgf').forEach(b => b.textContent = e.target.value || 'Your name'); };
  const onChange = e => { if (e.target.id !== 'sgUp') return; const fl = e.target.files[0]; if (!fl) return; const im = new Image(), u = URL.createObjectURL(fl); im.onload = () => { upImg = im; $('#sgPrev').innerHTML = ''; const o = makeSig(); if (o) $('#sgPrev').innerHTML = `<img src="${o.img}" alt="Your signature">`; }; im.onerror = () => toast('Couldn’t open that picture'); im.src = u; };
  const cleanup = () => { document.removeEventListener('click', onClick, true); document.removeEventListener('input', onInput); document.removeEventListener('change', onChange); };
  document.addEventListener('click', onClick, true); document.addEventListener('input', onInput); document.addEventListener('change', onChange);
  fontsReady();
  const trim = c => { const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let a = c.width, b = c.height, C = 0, D = 0; for (let y = 0; y < c.height; y++) for (let X = 0; X < c.width; X++) if (d[(y * c.width + X) * 4 + 3] > 20) { if (X < a) a = X; if (X > C) C = X; if (y < b) b = y; if (y > D) D = y; }
    if (C <= a || D <= b) return null; const p = 6, o = document.createElement('canvas'); o.width = C - a + p * 2; o.height = D - b + p * 2; o.getContext('2d').drawImage(c, a - p, b - p, o.width, o.height, 0, 0, o.width, o.height); return { img: o.toDataURL('image/png'), ar: o.width / o.height }; };
  const makeSig = () => { if (tab === 'draw') { if (!strokes.length) return null; return trim(cv); }
    if (tab === 'type') { const t = ($('#sgName').value || '').trim(); if (!t) return null; const c = document.createElement('canvas'); c.width = 1400; c.height = 360; const x = c.getContext('2d'); x.fillStyle = col; x.font = `${font === 'Caveat' ? 190 : 160}px '${font}'`; x.textBaseline = 'middle'; x.fillText(t, 30, 190); return trim(c); }
    if (!upImg) return null; const k2 = Math.min(1, 1200 / Math.max(upImg.naturalWidth, upImg.naturalHeight)), c = document.createElement('canvas'); c.width = upImg.naturalWidth * k2; c.height = upImg.naturalHeight * k2; const x = c.getContext('2d'); x.drawImage(upImg, 0, 0, c.width, c.height);
    const im = x.getImageData(0, 0, c.width, c.height), d = im.data; for (let i = 0; i < d.length; i += 4) { const l = (d[i] + d[i + 1] + d[i + 2]) / 3; d[i + 3] = l > 200 ? 0 : l > 150 ? Math.round((200 - l) / 50 * 255) : 255; } x.putImageData(im, 0, 0); return trim(c); }; });

/* ---------- save ---------- */
const doneSheet = () => { L.modal(`<div class="mhead"><h3>Your PDF is ready</h3><button class="ib" data-close aria-label="Close">${si('x')}</button></div>
  ${S.fields.length ? `<label class="t5ck"><input type="checkbox" id="pdFlat"> Flatten it, so the answers can’t be changed</label><p class="note">Leave it unticked if someone else still needs to fill in their part.</p>` : ''}
  <div class="row" style="margin-top:12px"><button type="button" class="btn p" data-pdsave="dl">Download</button>${navigator.canShare ? '<button type="button" class="btn s" data-pdsave="share">Share</button>' : ''}</div><p class="note">Made on this device. Check it before you send it.</p>`); };
const hexRgb = h => { const n = parseInt(h.replace('#', ''), 16); return PDFLib.rgb((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255); };
const build = async flat => { const { PDFDocument, StandardFonts, rgb } = PDFLib; const doc = await PDFDocument.load(S.bytes, { ignoreEncryption: true }), font = await doc.embedFont(StandardFonts.Helvetica), pages = doc.getPages();
  let form = null; try { form = doc.getForm(); } catch (e) { }
  if (form) { const byName = {}; form.getFields().forEach(f => byName[f.getName()] = f);
    const P = PDFLib, kd = f => f instanceof P.PDFTextField ? 'PDFTextField' : f instanceof P.PDFCheckBox ? 'PDFCheckBox' : f instanceof P.PDFRadioGroup ? 'PDFRadioGroup' : f instanceof P.PDFDropdown ? 'PDFDropdown' : f instanceof P.PDFOptionList ? 'PDFOptionList' : '';
    Object.entries(S.vals).forEach(([n, v]) => { const f = byName[n]; if (!f) return; const C = kd(f); try {
      if (C === 'PDFTextField') { f.setText(String(v || '')); try { if (f.isMultiline()) f.setFontSize(10); } catch (e) { } } else if (C === 'PDFCheckBox') { v ? f.check() : f.uncheck(); } else if (C === 'PDFRadioGroup') { v ? f.select(v) : f.clear(); } else if (C === 'PDFDropdown' || C === 'PDFOptionList') { v ? f.select(v) : f.clear(); } } catch (e) { console.warn('field', n, e); } });
    try { form.updateFieldAppearances(font); } catch (e) { } }
  const enc = t => { try { font.encodeText(t); return true; } catch (e) { return false; } };
  for (const it of S.items) { const P = S.pages[it.pi], pg = pages[it.pi]; if (!P || !pg) continue; const k = 1 / P.vp.scale, [x1, y1] = P.vp.convertToPdfPoint(it.x, it.y), [x2, y2] = P.vp.convertToPdfPoint(it.x + it.w, it.y + (it.h || 0));
    const X = Math.min(x1, x2), W = Math.abs(x2 - x1);
    if (it.k === 'text' || it.k === 'date') { const lines = String(it.t || '').split('\n'), fs = it.fs * k; if (!lines.join('').trim()) continue;
      if (lines.every(enc)) lines.forEach((l, n) => pg.drawText(l, { x: x1, y: y1 - fs * (n + 1) + fs * .12, size: fs, font, color: rgb(.07, .07, .1) }));
      else { const c = document.createElement('canvas'), s = 4; c.width = Math.ceil(it.w * s); c.height = Math.ceil(it.fs * 1.3 * lines.length * s); const x = c.getContext('2d'); x.scale(s, s); x.font = `${it.fs}px Arial, sans-serif`; x.fillStyle = '#121219'; x.textBaseline = 'top'; lines.forEach((l, n) => x.fillText(l, 0, n * it.fs * 1.3)); const im = await doc.embedPng(c.toDataURL('image/png')); const h = c.height / s * k; pg.drawImage(im, { x: x1, y: y1 - h, width: c.width / s * k, height: h }); } }
    else if (it.k === 'tick' || it.k === 'cross') { const Y = Math.min(y1, y2), H = Math.abs(y2 - y1), th = Math.max(1, W * .12), col = rgb(.07, .07, .1);
      if (it.k === 'tick') { pg.drawLine({ start: { x: X + W * .15, y: Y + H * .5 }, end: { x: X + W * .4, y: Y + H * .22 }, thickness: th, color: col }); pg.drawLine({ start: { x: X + W * .4, y: Y + H * .22 }, end: { x: X + W * .88, y: Y + H * .82 }, thickness: th, color: col }); }
      else { pg.drawLine({ start: { x: X + W * .18, y: Y + H * .18 }, end: { x: X + W * .82, y: Y + H * .82 }, thickness: th, color: col }); pg.drawLine({ start: { x: X + W * .18, y: Y + H * .82 }, end: { x: X + W * .82, y: Y + H * .18 }, thickness: th, color: col }); } }
    else { const im = await doc.embedPng(it.img), Y = Math.min(y1, y2), H = Math.abs(y2 - y1); pg.drawImage(im, { x: X, y: Y, width: W, height: H }); } }
  if (flat && form) { try { form.flatten(); } catch (e) { console.warn(e); } }
  return new Blob([await doc.save()], { type: 'application/pdf' }); };
document.addEventListener('click', async e => { const b = e.target.closest('[data-pdsave]'); if (!b || !S) return; b.disabled = true; const old = b.textContent; b.textContent = 'Making it…';
  try { const blob = await build(!!$('#pdFlat')?.checked), fn = S.name + '-filled.pdf';
    if (b.dataset.pdsave === 'share') { const f = new File([blob], fn, { type: 'application/pdf' }); if (navigator.canShare?.({ files: [f] })) { await navigator.share({ files: [f], title: fn }).catch(() => { }); } else toast('Sharing isn’t available here: use Download'); }
    else { const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = fn; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000); toast('Downloaded'); }
    L.track?.('pdf_signed', { fields: S.fields.length, items: S.items.length }); }
  catch (er) { console.warn(er); toast('Couldn’t make the PDF. Try Flatten off, or another copy of the file.'); } b.disabled = false; b.textContent = old; });

/* ---------- styles ---------- */
const css = document.createElement('style'); css.textContent = `
.pdfs-drop{display:flex;flex-direction:column;align-items:center;gap:6px;padding:34px 18px;border-radius:20px;border:2px dashed #A9A7C4;background:#fff;cursor:pointer;text-align:center}.pdfs-drop.over{border-color:#4545D6;background:#F3F3FF}.pdfs-drop .si{width:34px;height:34px;color:#4545D6}.pdfs-drop b{font-size:18px}.pdfs-drop small{opacity:.65}
.pdfs-priv{display:flex;gap:8px;align-items:flex-start;margin:12px 0;padding:10px 12px;border-radius:12px;background:#E9F7EF;font-size:14px;line-height:1.45}.pdfs-priv .si,.pdfs-tip .si{width:16px;height:16px;flex:none;margin-top:3px;color:#16865F}
.pdfs-sigs{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pdfs-sigs>div{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:14px;border-radius:16px;background:#fff;border:1.5px solid var(--line,#D9D8E6)}.pdfs-sigs img{max-height:54px;max-width:100%}.pdfs-none{font-size:13px;opacity:.6}
.pdfs-how{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.pdfs-how>div{display:flex;flex-direction:column;gap:3px;padding:14px;border-radius:16px;background:#fff;border:1.5px solid var(--line,#D9D8E6)}.pdfs-how span{width:26px;height:26px;border-radius:50%;background:#C23A54;color:#fff;display:grid;place-items:center;font-weight:800}.pdfs-how small{opacity:.75;line-height:1.4}
@media(max-width:620px){.pdfs-how{grid-template-columns:1fr}.pdfs-sigs{grid-template-columns:1fr}}
.pdfs-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}.pdfs-file{flex:1;min-width:0;display:flex;flex-direction:column}.pdfs-file b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pdfs-file small{opacity:.7}
.pdfs-zoom{display:flex;align-items:center;border:1.5px solid var(--line,#D9D8E6);border-radius:999px;background:#fff}.pdfs-zoom button{width:40px;height:40px;border:0;background:none;font-size:20px;cursor:pointer}.pdfs-zoom span{min-width:48px;text-align:center;font-size:13px;font-weight:700}
.pdfs-tip{display:flex;gap:8px;align-items:flex-start;margin:0 0 10px;padding:10px 12px;border-radius:12px;background:#EEF0FF;font-size:14px;line-height:1.45}
.pdfs-pages{overflow:auto;padding:4px 0 120px;-webkit-overflow-scrolling:touch}.pdfs-page{position:relative;margin:0 auto 18px;background:#fff;box-shadow:0 6px 24px rgba(20,20,60,.16);transform-origin:0 0;touch-action:pan-x pan-y;user-select:none}
.pdfs-lay{position:absolute;inset:0}.pdfs-no{position:absolute;right:6px;bottom:-16px;font-size:11px;opacity:.6}
.pf{position:absolute;display:flex}.pf-in{width:100%;height:100%;border:0;background:rgba(69,69,214,.12);outline:1px solid rgba(69,69,214,.5);font:var(--fs) Helvetica,Arial,sans-serif;color:#111;padding:0 3px;border-radius:2px;resize:none}.pf-in:focus{background:rgba(69,69,214,.06);outline:2px solid #4545D6}
.pf-chk,.pf-rad{width:100%;height:100%;border:1px solid rgba(69,69,214,.7);background:rgba(69,69,214,.12);display:grid;place-items:center;font-size:var(--fs);font-weight:800;color:#111;cursor:pointer;padding:0}.pf-rad{border-radius:50%}.pf-rad.on::after{content:"";width:55%;height:55%;border-radius:50%;background:#111}.pf-chk.on{background:rgba(69,69,214,.06)}
.pf-sig{width:100%;height:100%;border:1.5px dashed #C23A54;background:rgba(194,58,84,.08);color:#9B1D38;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;gap:4px;cursor:pointer}.pf-sig .si{width:14px;height:14px}
.pi{position:absolute;cursor:move;touch-action:none}.pi-t{font-family:Helvetica,Arial,sans-serif;color:#121219;line-height:1.15;white-space:pre;min-width:12px;outline:none;min-height:1em}.pi-t:empty::before{content:"Type here";color:#9A98AA}
.pi img,.pi svg{width:100%;height:100%;display:block;pointer-events:none}.pi svg path{fill:none;stroke:#121219;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.pi.sel{outline:1.5px dashed #4545D6;outline-offset:2px}.pi-h{position:absolute;right:-9px;bottom:-9px;width:18px;height:18px;border-radius:50%;background:#4545D6;border:2px solid #fff;cursor:nwse-resize}
.pi-m{position:absolute;left:0;top:-42px;display:flex;gap:4px;background:#1E1D2A;border-radius:10px;padding:3px;z-index:3}.pi-m button{min-width:34px;height:32px;border:0;border-radius:8px;background:none;color:#fff;font-weight:800;cursor:pointer;display:grid;place-items:center}.pi-m .si{width:16px;height:16px}
.pdfs-bar{position:sticky;bottom:calc(env(safe-area-inset-bottom,0) + 84px);z-index:20;display:flex;gap:2px;padding:6px;border-radius:18px;background:#1E1D2A;box-shadow:0 10px 30px rgba(0,0,0,.3);margin-top:-100px}
.pdfs-bar button{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;border:0;border-radius:12px;background:none;color:#fff;font:inherit;font-size:11px;font-weight:700;cursor:pointer}.pdfs-bar svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.pdfs-bar button.on{background:#4545D6}.pdfs-bar button:disabled{opacity:.4}.pdfs-bar .pdfs-done{background:#16865F;justify-content:center;font-size:13px;flex:1.3 1 0}
@media(min-width:1060px){.pdfs-bar{bottom:16px}}
.sgtabs{margin:0 0 12px}.sgpad{position:relative;height:180px;border-radius:14px;background:#fff;border:1.5px solid var(--line,#D9D8E6);touch-action:none}.sgpad canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none}
.sgline{position:absolute;left:18px;right:18px;bottom:46px;border-bottom:1.5px solid #C9C7D6;pointer-events:none}.sghint{position:absolute;left:20px;bottom:52px;font-size:13px;opacity:.5;pointer-events:none}
.sgcols{display:flex;gap:8px;flex:1}.sgc{width:30px;height:30px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1.5px #C9C7D6;cursor:pointer}.sgc.on{box-shadow:0 0 0 2.5px #4545D6}
.sgfonts{display:grid;gap:8px}.sgf{padding:12px 16px;border-radius:14px;border:1.5px solid var(--line,#D9D8E6);background:#fff;font-size:34px;line-height:1.2;text-align:left;cursor:pointer;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.sgf.on{border-color:#4545D6;background:#F6F6FF}
.sgprev img{max-width:100%;max-height:120px;margin-top:8px;background:repeating-conic-gradient(#F1F0F6 0 25%,#fff 0 50%) 0 0/16px 16px;border-radius:8px}`;
document.head.appendChild(css);
/* Big typing box on phones: PDF text is drawn at its real size (often ~11pt, too small to read while typing on a phone),
   so when you start typing into small text, a large box opens above the keyboard. What you type goes straight into the
   PDF at its real size; tap Done (or outside) to close it. */
const TS = document.createElement('style'); TS.textContent = `.pdfs-type{position:fixed;left:0;right:0;bottom:0;z-index:60;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0));background:#1E1D2A;box-shadow:0 -10px 30px rgba(0,0,0,.3);border-radius:18px 18px 0 0;display:flex;flex-direction:column;gap:8px;transform:translateY(110%);transition:transform .22s ease}.pdfs-type.on{transform:none}.pdfs-type .r{display:flex;align-items:center;gap:8px;color:#fff;font-size:13px}.pdfs-type .r .c{flex:1;min-width:0;display:flex;flex-direction:column}.pdfs-type .r b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pdfs-type small{opacity:.7}.pdfs-type textarea{width:100%;min-height:64px;max-height:34vh;border:0;border-radius:12px;padding:12px;font:17px/1.4 Helvetica,Arial,sans-serif;color:#111;background:#fff;resize:none}body:has(#pdfsType.on) #toast{opacity:0!important}.pdfs-type button{border:0;border-radius:999px;padding:9px 16px;background:#16865F;color:#fff;font:inherit;font-weight:800;font-size:14px;cursor:pointer}`;
document.head.appendChild(TS);
const small = () => matchMedia('(pointer:coarse)').matches || innerWidth < 760;
let TY = null; // { el, kind: 'item'|'field', id }
const tyBox = () => { let b = $('#pdfsType'); if (!b) { b = document.createElement('div'); b.id = 'pdfsType'; b.className = 'pdfs-type'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Type your text');
  b.innerHTML = '<div class="r"><span class="c"><b id="pdfsTyL">Typing</b><small>Goes on the PDF at its real size</small></span><button type="button" data-tydone>Done</button></div><textarea id="pdfsTyIn" rows="2" aria-label="Your text" autocapitalize="sentences"></textarea>'; document.body.append(b); } return b; };
const shownPx = el => { const fs = parseFloat(getComputedStyle(el).fontSize) || 12; return fs * (S ? S.zoom : 1); };
const tyOpen = (el, kind, id, label, multi) => { if (!S) return; const b = tyBox(), ta = $('#pdfsTyIn'); TY = { el, kind, id, multi };
  $('#pdfsTyL').textContent = label; ta.value = kind === 'item' ? (findIt(id)?.t || '') : el.value; ta.rows = multi ? 3 : 2; b.classList.add('on');
  el.blur(); setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 30); place2(); };
const tyClose = () => { const b = $('#pdfsType'); if (b) b.classList.remove('on'); const t = TY; TY = null; if (t && t.kind === 'item' && S) { const i = findIt(t.id); if (i) drawLayer(i.pi); } };
const place2 = () => { const b = $('#pdfsType'), vv = window.visualViewport; if (!b || !vv) return; b.style.bottom = Math.max(0, innerHeight - vv.height - vv.offsetTop) + 'px'; };
if (window.visualViewport) { visualViewport.addEventListener('resize', place2); visualViewport.addEventListener('scroll', place2); }
document.addEventListener('focusin', e => { if (!S || !small() || e.target.id === 'pdfsTyIn') return;
  const it = e.target.closest('[data-pit]'); if (it && shownPx(it) < 15) { const i = findIt(it.dataset.pit); tyOpen(it, 'item', it.dataset.pit, i && i.k === 'date' ? 'Date' : 'Your text', true); return; }
  const f = e.target.closest('input[data-ff],textarea[data-ff]'); if (f && f.type !== 'date' && !f.readOnly && shownPx(f) < 15) { const q = S.fields.find(x => x.id === f.dataset.ff); tyOpen(f, 'field', f.dataset.ff, q ? q.name.replace(/[_.]+/g, ' ').trim() : 'Your answer', f.tagName === 'TEXTAREA'); } }, true);
document.addEventListener('input', e => { if (e.target.id !== 'pdfsTyIn' || !TY || !S) return; let v = e.target.value; if (!TY.multi && TY.kind === 'field') v = v.replace(/\n/g, ' ');
  if (TY.kind === 'item') { const i = findIt(TY.id); if (i) { i.t = v.replace(/\n+$/, ''); const el = $(`[data-pit="${TY.id}"]`); if (el) el.textContent = i.t; } }
  else { const q = S.fields.find(x => x.id === TY.id); if (q) { S.vals[q.name] = v; const el = $(`[data-ff="${TY.id}"]`); if (el) el.value = v; } } });
document.addEventListener('keydown', e => { if (e.target.id === 'pdfsTyIn' && e.key === 'Enter' && !(TY && TY.multi)) { e.preventDefault(); tyClose(); } });
document.addEventListener('click', e => { if (e.target.closest('[data-tydone]')) { tyClose(); return; } if (TY && !e.target.closest('#pdfsType') && !e.target.closest('[data-pit],[data-ff]')) tyClose(); });
addEventListener('hashchange', tyClose);
if (T.gate) Object.keys(V).forEach(T.gate);
});
