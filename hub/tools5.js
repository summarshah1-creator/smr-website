/* Luton Community Hub: tools5.js (24 Nov 2026)
   Writing tools: Caption & post writer, Proofreader & rewriter, Meeting minutes from notes.
   QR code maker (types, colours, logo with high error correction, frame + label, PNG/SVG, scan checks).
   Short links with tap counts (built, behind window.HUB_SHORTLINKS; shown as Coming soon).
   Logo vectorise & refresh service, and the certificate upgrade.
   Flow ideas: Buffer/Later caption tools (platform, tone, 3 options, character limits), Grammarly/Hemingway
   (changes highlighted, reading age, one-tap rewrites), Otter/Notion meeting notes (attendees, decisions, actions with
   owners and dates), QR Code Generator Pro / Canva QR (type first, then content, then design, live preview).
   Never says "AI" in the interface (owner rule). Every generation counts towards the organisation's monthly fair use. */
(window.LCH_EXT = window.LCH_EXT || []).push(L => {
const T = L.T3; if (!T) return;
const { V, store, esc, toast, back, TOOL, GLYPH } = L;
const { si, $, $$, addNav, tAns } = T;
const CHECKED = '24 Nov 2026';
const page = (key, title, lede, body, crumb = ['alltools', 'Tools']) => `<div class="wrap t5">${back(crumb[0], crumb[1], title)}<div class="sec-h"><div><h1>${esc(title)}</h1><p class="lede">${lede}</p></div></div>${body}</div>`;
const prof = () => store.get('profile', null) || {};
const orgName = () => prof().org || '';

/* ---------- icons + menu ---------- */
Object.assign(GLYPH, {
  i_caption: 'M4 5h16v11H9l-5 4V5zM8 9h8M8 12h5',
  i_proof: 'M4 19l3.5-1L18 7.5 16.5 6 6 16.5 4 19zM14 8l2 2M13 19h7',
  i_minutes: 'M7 3h8l4 4v14H7zM15 3v4h4M10 11h6M10 14.5h6M10 18h3',
  i_logofix: 'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z',
  i_short: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
});
Object.assign(TOOL, { captions: ['square', 'm', 'y', 'i_caption'], proofread: ['hex', 'b', 'y', 'i_proof'], minutes: ['square', 't', 'y', 'i_minutes'], logoservice: ['burst', 'o', 'y', 'i_logofix'], shortlinks: ['circle', 'g', 'y', 'i_short'] });
addNav('tools', [['captions', 'Caption & post writer', 'studio', 'Three ready-to-post versions for any platform'], ['proofread', 'Proofreader & rewriter', 'studio', 'Fix spelling and grammar, then make it friendlier, shorter or simpler']], 'writer');
addNav('tools', [['shortlinks', 'Short links', 'qr', 'Short links that count every tap']], 'qr');
addNav('mine', [['minutes', 'Meeting minutes', 'frm', 'Rough notes in, tidy minutes and actions out']], 'policies');
addNav('studio', [['logoservice', 'Logo vectorise & refresh', 'studio', 'A clean, sharp logo in every format, usually back within 24 hours']], 'brief');

/* ---------- shared: the writing service ---------- */
const ERR = e => ({ off: 'This tool isn’t switched on in this preview. It works on the live hub.', rate_limited: 'You’ve made a lot in the last hour. Try again in a little while.', org_cap: 'Your organisation has used this month’s writing tools allowance. It resets on the 1st of the month.', unavailable: 'The writing tools are resting just now. Please try again later.' }[e?.code] || 'That didn’t work just now. Please try again.');
const write = async (prompt, tool, max = 900) => { let s = null; try { s = window.claude ? await claude.use('sample') : null; } catch (e) { } if (!s) throw Object.assign(new Error('off'), { code: 'off' });
  const r = await s(prompt, { modelTier: 'quick', tool, max }); if (r && r.left != null) store.set('ai-left', { left: r.left, cap: r.cap, at: Date.now() }); return r; };
const leftNote = () => { const l = store.get('ai-left', null); if (!l || l.left == null) return '<p class="t5left"></p>'; const d = new Date(l.at), n = new Date(); if (d.getMonth() !== n.getMonth()) return '<p class="t5left"></p>'; return `<p class="t5left">${l.left} of ${l.cap} left this month for your organisation</p>`; };
const jsonOf = t => { const s = String(t || ''); const a = s.indexOf('{'), b = s.lastIndexOf('}'); if (a < 0 || b < a) return null; try { return JSON.parse(s.slice(a, b + 1)); } catch (e) { return null; } };
const busy = (el, t) => { el.innerHTML = `<div class="t5busy" role="status"><span class="t5dots" aria-hidden="true"><i></i><i></i><i></i></span>${esc(t)}</div>`; };
const copyTxt = (t, msg = 'Copied') => navigator.clipboard?.writeText(t).then(() => toast(msg), () => toast('Couldn’t copy'));
const chips = (name, opts, val, multi) => `<div class="t5chips" role="${multi ? 'group' : 'radiogroup'}">${opts.map(([v, l]) => `<label class="t5chip"><input type="${multi ? 'checkbox' : 'radio'}" name="${name}" value="${esc(v)}"${(multi ? (val || []).includes(v) : val === v) ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div>`;
const LANGS = ['Urdu', 'Bengali', 'Polish', 'Romanian', 'Arabic', 'Punjabi', 'Gujarati', 'Somali', 'Portuguese', 'Hindi', 'Turkish', 'Lithuanian'];
const transNote = '<p class="note">Translations are a starting point. Ask a fluent speaker to check them before you post.</p>';

/* =====================================================================
   1) CAPTION & POST WRITER
   ===================================================================== */
const PLAT = [['instagram', 'Instagram', 2200], ['facebook', 'Facebook', 63206], ['tiktok', 'TikTok', 4000], ['whatsapp', 'WhatsApp', 0], ['linkedin', 'LinkedIn', 3000], ['x', 'X', 280]];
const capLast = () => store.get('caps-last', null);
V.captions = () => { const l = capLast() || {}, a = l.a || {}, ev = tAns('ev_plan');
  return page('captions', 'Caption & post writer', 'Tell us what the post is about. You’ll get three versions to choose from, sized for the platform, in your tone.',
  `<div class="t5grid"><form class="form t5form" id="capForm">
    <fieldset><legend>Where will you post it?</legend>${chips('plat', PLAT.map(p => [p[0], p[1]]), a.plat || 'instagram')}</fieldset>
    <label class="f">What’s it about?<small>The facts: what, when, where, who it’s for and what people should do. We only use what you write here.</small><textarea class="in" name="about" rows="5" required placeholder="e.g. Free winter coat giveaway, Sat 6 Dec, 10am to 1pm, Bury Park Community Centre. Children’s and adult sizes. Just turn up.">${esc(a.about || '')}</textarea></label>
    ${ev && !a.about ? `<button type="button" class="linkbtn t5ev" data-capev>Use my event: ${esc(ev.name || 'from the Event planner')}</button>` : ''}
    <fieldset><legend>Tone</legend>${chips('tone', [['warm', 'Warm'], ['upbeat', 'Upbeat'], ['professional', 'Professional'], ['heartfelt', 'Heartfelt'], ['urgent', 'Urgent']], a.tone || 'warm')}</fieldset>
    <fieldset><legend>Length</legend>${chips('len', [['short', 'Short'], ['medium', 'Medium'], ['long', 'Long']], a.len || 'medium')}</fieldset>
    <div class="t5tog"><label><input type="checkbox" name="emoji" ${a.emoji !== false ? 'checked' : ''}> Emojis</label><label><input type="checkbox" name="tags" ${a.tags !== false ? 'checked' : ''}> Hashtags</label></div>
    <label class="f">Also in another language? <small>Optional. The English comes first, then the translation.</small><select class="in" name="lang" data-uxd="1"><option value="">English only</option>${LANGS.map(x => `<option${a.lang === x ? ' selected' : ''}>${x}</option>`).join('')}</select></label>
    <label class="f">Organisation name<input class="in" name="org" value="${esc(a.org || orgName())}" placeholder="So the post can sign off with it"></label>
    <button class="btn p">Write 3 versions</button>${leftNote()}</form>
  <div class="t5out" id="capOut" aria-live="polite">${l.posts ? capCards(l.posts, l.a) : `<div class="t5empty">${si('star')}<b>Your three versions appear here</b><span>Pick one, copy it, done. Each shows the character count for the platform.</span></div>`}</div></div>`, ['tools', 'Marketing support']); };
const capCards = (posts, a) => { const p = PLAT.find(x => x[0] === a.plat) || PLAT[0];
  return `<div class="t5res"><div class="t5rh"><b>Three versions for ${esc(p[1])}</b><button type="button" class="btn s sm" data-capmore>Write 3 more</button></div>${posts.map((t, i) => { const n = [...t].length, over = p[2] && n > p[2];
    return `<article class="t5card"><div class="t5ch"><span class="t5n">${i + 1}</span><span class="t5len${over ? ' over' : ''}">${n.toLocaleString('en-GB')}${p[2] ? ' / ' + p[2].toLocaleString('en-GB') : ''} characters${over ? ' · too long' : ''}</span></div><div class="t5txt" id="cap${i}">${esc(t)}</div>
      <div class="row"><button type="button" class="btn p sm" data-capcopy="${i}">Copy</button>${a.plat === 'whatsapp' ? `<a class="btn s sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(t)}">Open WhatsApp</a>` : ''}<button type="button" class="btn s sm" data-capproof="${i}">Proofread</button></div></article>`; }).join('')}
    ${a.lang ? transNote : ''}<p class="note">Check names, dates and prices before you post. Need the picture too? <a href="#studio">Design & Print Studio</a></p></div>`; };
const capPrompt = a => { const p = PLAT.find(x => x[0] === a.plat) || PLAT[0];
  return `You write social media posts for a UK community organisation in Luton${a.org ? ' called "' + a.org + '"' : ''}.
Write 3 different versions of a ${p[1]} post. Facts to use (use ONLY these; never invent dates, prices, names, figures or quotes): """${a.about}"""
Tone: ${a.tone}. Length: ${a.len === 'short' ? 'one or two short sentences' : a.len === 'long' ? 'a full post of 4 to 6 short paragraphs' : 'about 3 to 5 sentences'}${p[2] ? `, and never more than ${p[2]} characters` : ''}.
${a.emoji ? 'Use a few relevant emojis, never more than one per sentence.' : 'Use no emojis.'} ${a.tags ? 'End with 2 to 4 relevant hashtags, including #Luton.' : 'Use no hashtags.'}
${p[0] === 'whatsapp' ? 'Format for WhatsApp: short lines, *bold* for the key detail.' : ''}${p[0] === 'linkedin' ? 'Keep it professional and suitable for partners and funders.' : ''}${p[0] === 'x' ? 'Keep each version under 280 characters including hashtags.' : ''}
British English, plain words, a clear call to action. Make the 3 versions genuinely different (different opening line and angle).
${a.lang ? `After the English text of EACH version, add a blank line, then "${a.lang}:" and a natural translation into ${a.lang}.` : ''}
Reply with JSON only: {"posts":["version 1","version 2","version 3"]}`; };
const capRun = async a => { const out = $('#capOut'); if (!out) return; busy(out, 'Writing your three versions…');
  try { const r = await write(capPrompt(a), 'captions', a.lang ? 1500 : 1000); let j = jsonOf(r.text), posts = j && Array.isArray(j.posts) ? j.posts : String(r.text || '').split(/\n-{3,}\n/);
    posts = posts.map(x => String(x || '').trim()).filter(Boolean).slice(0, 3); if (!posts.length) throw new Error('empty');
    store.set('caps-last', { a, posts, at: Date.now() }); out.innerHTML = capCards(posts, a); const ln = $('.t5left'); if (ln) ln.outerHTML = leftNote();
    out.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  catch (e) { out.innerHTML = `<div class="t5err">${esc(ERR(e))}</div>`; } };
const capForm = f => { const fd = new FormData(f); return { plat: fd.get('plat') || 'instagram', about: String(fd.get('about') || '').trim(), tone: fd.get('tone') || 'warm', len: fd.get('len') || 'medium', emoji: !!fd.get('emoji'), tags: !!fd.get('tags'), lang: fd.get('lang') || '', org: String(fd.get('org') || '').trim() }; };
document.addEventListener('submit', e => { if (e.target.id !== 'capForm') return; e.preventDefault(); e.stopImmediatePropagation(); const a = capForm(e.target); if (a.about.length < 8) { toast('Add a few details about the post'); return; } capRun(a); }, true);
document.addEventListener('click', e => {
  const c = e.target.closest('[data-capcopy]'); if (c) { const l = capLast(); if (l) copyTxt(l.posts[+c.dataset.capcopy], 'Caption copied'); return; }
  if (e.target.closest('[data-capmore]')) { const f = $('#capForm'); if (f) capRun(capForm(f)); return; }
  const p = e.target.closest('[data-capproof]'); if (p) { const l = capLast(); if (l) { store.set('proof-in', l.posts[+p.dataset.capproof]); location.hash = 'proofread'; } return; }
  if (e.target.closest('[data-capev]')) { const ev = tAns('ev_plan'), ta = $('#capForm [name=about]'); if (ev && ta) { const d = ev.date ? new Date(ev.date + 'T12:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : ''; ta.value = `${ev.name || 'Our event'}${d ? ', ' + d : ''}. `; ta.focus(); e.target.closest('[data-capev]').remove(); } } });

/* =====================================================================
   2) PROOFREADER & REWRITER
   ===================================================================== */
const words = s => (String(s).match(/[A-Za-z’']+/g) || []);
const syl = w => { w = w.toLowerCase().replace(/[^a-z]/g, ''); if (w.length <= 3) return 1; w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, ''); return Math.max(1, (w.match(/[aeiouy]{1,2}/g) || []).length); };
const readAge = s => { const w = words(s), sn = Math.max(1, (String(s).match(/[.!?]+(\s|$)/g) || []).length); if (w.length < 12) return null; const sy = w.reduce((t, x) => t + syl(x), 0);
  const fk = 0.39 * (w.length / sn) + 11.8 * (sy / w.length) - 15.59; return Math.max(6, Math.min(19, Math.round(fk + 5))); };
const tok = s => String(s).split(/(\s+)/).filter(x => x !== '');
const diffHTML = (a, b) => { const A = tok(a), B = tok(b), n = A.length, m = B.length; if (n * m > 4e6) return esc(b);
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1)); for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0, o = '', ch = 0; while (i < n && j < m) { if (A[i] === B[j]) { o += esc(A[i]); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) { if (A[i].trim()) { o += `<del>${esc(A[i])}</del>`; ch++; } i++; } else { if (B[j].trim()) { o += `<ins>${esc(B[j])}</ins>`; ch++; } else o += esc(B[j]); j++; } }
  while (i < n) { if (A[i].trim()) { o += `<del>${esc(A[i])}</del>`; ch++; } i++; } while (j < m) { o += B[j].trim() ? `<ins>${esc(B[j])}</ins>` : esc(B[j]); if (B[j].trim()) ch++; j++; } return { html: o, ch }; };
const RW = [['fix', 'Fix spelling & grammar'], ['friendly', 'Friendlier'], ['formal', 'More formal'], ['short', 'Shorter'], ['simple', 'Simpler English'], ['parents', 'For parents']];
const rwPrompt = (k, t) => { const base = `Text: """${t}"""\nRules: British English (UK spelling), keep every fact, name, number, date, link and phone number exactly as written, don't add anything new, keep line breaks and lists, keep any emojis. Reply with ONLY the new text, nothing before or after it.`;
  return ({ fix: 'Correct the spelling, grammar and punctuation of this text. Change as little as possible: don’t rephrase sentences that are already correct.',
    friendly: 'Rewrite this text so it sounds warmer and friendlier, like a kind neighbour, while staying clear.', formal: 'Rewrite this text so it sounds more formal and professional, suitable for a funder, council or school.',
    short: 'Rewrite this text to be about half as long, keeping every important fact and the call to action.', simple: 'Rewrite this text in simple, plain English for someone who is still learning English: short sentences, everyday words, no idioms.',
    parents: 'Rewrite this text for parents and carers: clear, friendly and practical, saying what their child needs and what they need to do.' }[k]) + '\n' + base; };
V.proofread = () => { const pre = store.get('proof-in', ''); if (pre) store.set('proof-in', '');
  return page('proofread', 'Proofreader & rewriter', 'Paste your text. Fix the spelling and grammar in UK English and see every change highlighted, then make it friendlier, more formal, shorter, simpler or right for parents in one tap.',
  `<div class="t5grid"><div class="form t5form"><label class="f">Your text<textarea class="in" id="prIn" rows="10" placeholder="Paste a post, letter, email or notice…">${esc(pre)}</textarea></label><div class="t5meta" id="prMeta"></div>
    <div class="t5rw">${RW.map(([k, t], i) => `<button type="button" class="btn ${i ? 's' : 'p'} sm" data-rw="${k}">${esc(t)}</button>`).join('')}</div>${leftNote()}</div>
    <div class="t5out" id="prOut" aria-live="polite"><div class="t5empty">${si('check')}<b>Your corrected text appears here</b><span>Changes are highlighted: <ins>added</ins> and <del>taken out</del>. Tap “Use this” to carry on editing it.</span></div></div></div>`, ['tools', 'Marketing support']); };
const prMeta = () => { const t = $('#prIn')?.value || '', m = $('#prMeta'); if (!m) return; const w = words(t).length, ra = readAge(t); m.textContent = w ? `${w} word${w === 1 ? '' : 's'}${ra ? ` · reading age about ${ra}${ra > 14 ? ' (try Simpler English for a wider audience)' : ''}` : ''}` : ''; };
let prLast = null;
document.addEventListener('input', e => { if (e.target.id === 'prIn') prMeta(); });
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-rw]'); if (b) { const t = ($('#prIn')?.value || '').trim(), out = $('#prOut'); if (t.length < 3) { toast('Paste some text first'); return; } if (t.length > 5000) { toast('That’s long: try up to about 800 words at a time'); return; }
    const k = b.dataset.rw; busy(out, k === 'fix' ? 'Checking your text…' : 'Rewriting…');
    try { const r = await write(rwPrompt(k, t), 'proofread', Math.min(1600, Math.round(t.length / 2.5) + 200)); const nt = String(r.text || '').trim().replace(/^"""|"""$/g, '').trim(); if (!nt) throw new Error('empty'); prLast = { k, before: t, after: nt };
      const d = diffHTML(t, nt), same = nt === t;
      out.innerHTML = `<div class="t5res"><div class="t5rh"><b>${k === 'fix' ? (same ? 'No changes needed' : `${d.ch} change${d.ch === 1 ? '' : 's'}`) : esc(RW.find(x => x[0] === k)[1])}</b><div class="t5seg" role="tablist"><button type="button" class="on" data-prview="diff" aria-selected="true">Show changes</button><button type="button" data-prview="clean" aria-selected="false">Clean copy</button></div></div>
        <div class="t5txt t5diff" id="prDiff">${d.html || esc(nt)}</div><div class="t5txt" id="prClean" hidden>${esc(nt)}</div>
        <div class="row"><button type="button" class="btn p sm" data-prcopy>Copy</button><button type="button" class="btn s sm" data-pruse>Use this</button></div>${k === 'fix' ? '<p class="note">Names, local words and other languages may be flagged or changed by mistake: check them.</p>' : ''}</div>`;
      const ln = $('.t5left'); if (ln) ln.outerHTML = leftNote(); }
    catch (er) { out.innerHTML = `<div class="t5err">${esc(ERR(er))}</div>`; } return; }
  const v = e.target.closest('[data-prview]'); if (v) { $$('[data-prview]').forEach(x => { x.classList.toggle('on', x === v); x.setAttribute('aria-selected', x === v); }); $('#prDiff').hidden = v.dataset.prview !== 'diff'; $('#prClean').hidden = v.dataset.prview === 'diff'; return; }
  if (e.target.closest('[data-prcopy]') && prLast) { copyTxt(prLast.after); return; }
  if (e.target.closest('[data-pruse]') && prLast) { const i = $('#prIn'); i.value = prLast.after; prMeta(); i.focus(); toast('Ready to edit'); } });

/* =====================================================================
   3) MEETING MINUTES FROM NOTES (text only)
   ===================================================================== */
const MTYPE = [['trustees', 'Trustees or board'], ['committee', 'Committee'], ['team', 'Staff team'], ['volunteers', 'Volunteers'], ['pta', 'Parents or PTA'], ['other', 'Other']];
const minLast = () => store.get('minutes-last', null);
V.minutes = () => { const l = minLast(), a = l?.a || {};
  return page('minutes', 'Meeting minutes', 'Paste your rough notes. You’ll get tidy minutes: who came, apologies, each item, what was decided and the actions with who and by when. Print them, copy them, or add the actions to your reminders.',
  `<div class="t5grid"><form class="form t5form" id="minForm">
    <label class="f">Meeting<input class="in" name="name" value="${esc(a.name || '')}" placeholder="e.g. Trustees meeting" required></label>
    <div class="two"><label class="f">Date<input class="in" type="date" name="date" value="${esc(a.date || new Date().toISOString().slice(0, 10))}" required></label><label class="f">Where (optional)<input class="in" name="where" value="${esc(a.where || '')}" placeholder="e.g. Online, or the hall"></label></div>
    <fieldset><legend>Type of meeting</legend>${chips('type', MTYPE, a.type || 'trustees')}</fieldset>
    <label class="f">Your notes<small>Paste them as they are: bullet points, half sentences, initials are fine. Up to about 2,500 words.</small><textarea class="in" name="notes" rows="10" required placeholder="Present: AK (chair), SR, Bilal, Jo. Apols: Hannah&#10;1. Winter coat drive – 120 coats so far. Agreed extend to 20 Dec. SR to tell schools by Fri&#10;2. Budget – hall hire up to £45/hr from Jan…">${esc(a.notes || '')}</textarea></label>
    <button class="btn p">Write the minutes</button>${leftNote()}</form>
  <div class="t5out" id="minOut" aria-live="polite">${l?.m ? minDoc(l.m, l.a) : `<div class="t5empty">${si('check')}<b>Your minutes appear here</b><span>Laid out the way funders, auditors and the Charity Commission expect: attendance, decisions and actions with owners.</span></div>`}</div></div>`, ['account', 'Your organisation']); };
const fmtLong = d => { const x = new Date(d + 'T12:00'); return isNaN(x) ? d : x.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
const isISO = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));
const minDoc = (m, a) => `<div class="t5res"><div class="t5min" id="minDoc" contenteditable="false">
  <h2>${esc(m.title || a.name || 'Meeting')}</h2><p class="t5mm">${esc(fmtLong(a.date))}${a.where ? ' · ' + esc(a.where) : ''}${(m.org || orgName()) ? ' · ' + esc(m.org || orgName()) : ''}</p>
  <h3>Present</h3><p>${esc((m.attendees || []).join(', ') || 'Not recorded')}</p>${(m.apologies || []).length ? `<h3>Apologies</h3><p>${esc(m.apologies.join(', '))}</p>` : ''}
  ${(m.items || []).map((it, i) => `<h3>${i + 1}. ${esc(it.title || 'Item')}</h3>${it.discussion ? `<p>${esc(it.discussion)}</p>` : ''}${(it.decisions || []).length ? `<p class="t5dec"><b>Decided:</b> ${esc(it.decisions.join(' '))}</p>` : ''}`).join('')}
  <h3>Actions</h3>${(m.actions || []).length ? `<table class="t3t"><tr><th>Action</th><th>Who</th><th>By when</th></tr>${m.actions.map((x, i) => `<tr><td>${esc(x.action)}</td><td>${esc(x.owner || '—')}</td><td>${isISO(x.due) ? esc(new Date(x.due + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })) : esc(x.due || '—')}</td></tr>`).join('')}</table>` : '<p>No actions recorded.</p>'}
  ${m.next ? `<h3>Next meeting</h3><p>${esc(m.next)}</p>` : ''}<p class="t5sig">Signed as a true record: ____________________ (Chair) &nbsp; Date: ____________</p></div>
  <div class="row noprint"><button type="button" class="btn p sm" data-minprint>${si('print')} Print or PDF</button><button type="button" class="btn s sm" data-mincopy>Copy</button><button type="button" class="btn s sm" data-minedit>Edit the wording</button>${(m.actions || []).some(x => isISO(x.due)) ? `<button type="button" class="btn s sm" data-minrem>${si('bell')} Add actions to My reminders</button>` : ''}</div>
  <p class="note">Check the minutes against your notes before you share them, especially names, figures and decisions. Minutes are approved at the next meeting.</p></div>`;
const minText = (m, a) => `${m.title || a.name}\n${fmtLong(a.date)}${a.where ? ' · ' + a.where : ''}\n\nPresent: ${(m.attendees || []).join(', ')}${(m.apologies || []).length ? '\nApologies: ' + m.apologies.join(', ') : ''}\n\n${(m.items || []).map((it, i) => `${i + 1}. ${it.title}\n${it.discussion || ''}${(it.decisions || []).length ? '\nDecided: ' + it.decisions.join(' ') : ''}`).join('\n\n')}\n\nActions\n${(m.actions || []).map(x => `- ${x.action} (${x.owner || 'who?'}, ${x.due || 'when?'})`).join('\n') || '- none'}${m.next ? '\n\nNext meeting: ' + m.next : ''}`;
document.addEventListener('submit', async e => { if (e.target.id !== 'minForm') return; e.preventDefault(); e.stopImmediatePropagation(); const fd = new FormData(e.target), a = Object.fromEntries(fd); const out = $('#minOut');
  if ((a.notes || '').trim().length < 20) { toast('Paste your notes first'); return; } if (a.notes.length > 15000) { toast('Those notes are very long: split them into two parts'); return; }
  busy(out, 'Writing your minutes…');
  const prompt = `Turn these rough meeting notes into formal minutes for a UK community organisation${orgName() ? ' called "' + orgName() + '"' : ''}.
Meeting: ${a.name}. Type: ${(MTYPE.find(x => x[0] === a.type) || [, 'meeting'])[1]}. Date of the meeting: ${a.date} (use it to turn "Friday", "next week", "end of month" etc. into real dates in YYYY-MM-DD).
Notes: """${a.notes}"""
Rules: British English, neutral third person ("The committee agreed…"). Use ONLY what is in the notes: never invent people, figures, decisions or dates. Expand initials only if the notes say who they are. If a due date is unclear, write it in words as the notes say, or leave it empty.
Reply with JSON only: {"title":"","attendees":["Name (role)"],"apologies":[""],"items":[{"title":"","discussion":"1 to 3 sentences","decisions":["Agreed that…"]}],"actions":[{"action":"","owner":"","due":"YYYY-MM-DD or words"}],"next":"next meeting date/place if mentioned, else empty"}`;
  try { const r = await write(prompt, 'minutes', 1600); const m = jsonOf(r.text); if (!m || !(m.items || m.actions)) throw new Error('parse'); store.set('minutes-last', { a, m, at: Date.now() }); out.innerHTML = minDoc(m, a); const ln = $('.t5left'); if (ln) ln.outerHTML = leftNote(); out.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  catch (er) { out.innerHTML = `<div class="t5err">${esc(ERR(er))}</div>`; } }, true);
document.addEventListener('click', e => { const l = minLast();
  if (e.target.closest('[data-minprint]')) { const b = document.createElement('button'); b.dataset.t3print = 'minutes'; b.dataset.t3el = 'minDoc'; b.dataset.t3title = 'Minutes'; b.hidden = true; document.body.append(b); b.click(); b.remove(); return; }
  if (e.target.closest('[data-mincopy]') && l) { const d = $('#minDoc'); copyTxt(d && d.isContentEditable ? d.innerText : minText(l.m, l.a), 'Minutes copied'); return; }
  const ed = e.target.closest('[data-minedit]'); if (ed) { const d = $('#minDoc'); const on = d.contentEditable !== 'true'; d.contentEditable = on; d.classList.toggle('editing', on); ed.textContent = on ? 'Done editing' : 'Edit the wording'; if (on) d.focus(); return; }
  if (e.target.closest('[data-minrem]') && l) { const rs = store.get('reminders', []); let n = 0; (l.m.actions || []).forEach((x, i) => { if (!isISO(x.due)) return; const key = 'min:' + l.a.date + ':' + i; if (rs.some(r => r.key === key)) return; rs.push({ key, title: `${x.action}${x.owner ? ' (' + x.owner + ')' : ''}`, href: 'minutes', date: x.due, offs: [1, 0], shown: [], at: Date.now() }); n++; }); store.set('reminders', rs); toast(n ? `${n} action${n === 1 ? '' : 's'} added to My reminders` : 'Already in your reminders'); } });

/* =====================================================================
   4) QR CODE MAKER
   ===================================================================== */
const QT = [['url', 'Link'], ['text', 'Text'], ['wa', 'WhatsApp'], ['tel', 'Phone'], ['wifi', 'Wi-Fi'], ['mail', 'Email']];
const qrS = () => Object.assign({ type: 'url', url: '', text: '', waNum: '', waMsg: '', tel: '', ssid: '', pass: '', sec: 'WPA', hidden: false, mail: '', subj: '', body: '', fg: '#1E1D2A', bg: '#FFFFFF', logo: '', frame: true, label: 'Scan me', fc: '#4545D6' }, store.get('qr-last', {}) || {}, store.get('qr-prefill', null) ? { type: 'url', url: store.get('qr-prefill') } : {});
let Q = null;
const ukNum = s => { let d = String(s || '').replace(/\D/g, ''); if (d.startsWith('0')) d = '44' + d.slice(1); return d; };
const wEsc = s => String(s || '').replace(/([\\;,:"])/g, '\\$1');
const qrData = q => ({ url: () => { const u = q.url.trim(); return u ? (/^[a-z]+:/i.test(u) ? u : 'https://' + u) : ''; }, text: () => q.text, wa: () => ukNum(q.waNum) ? `https://wa.me/${ukNum(q.waNum)}${q.waMsg ? '?text=' + encodeURIComponent(q.waMsg) : ''}` : '',
  tel: () => ukNum(q.tel) ? '+' + ukNum(q.tel) : '' , wifi: () => q.ssid ? `WIFI:T:${q.sec === 'nopass' ? 'nopass' : q.sec};S:${wEsc(q.ssid)};${q.sec === 'nopass' ? '' : 'P:' + wEsc(q.pass) + ';'}${q.hidden ? 'H:true;' : ''};` : '',
  mail: () => q.mail ? `mailto:${q.mail}${q.subj || q.body ? '?' + [q.subj ? 'subject=' + encodeURIComponent(q.subj) : '', q.body ? 'body=' + encodeURIComponent(q.body) : ''].filter(Boolean).join('&') : ''}` : '' }[q.type] || (() => ''))().replace(/^\+/, q.type === 'tel' ? 'tel:+' : '+');
const lum = h => { const c = String(h).replace('#', ''), v = [0, 2, 4].map(i => { const x = parseInt(c.substr(i, 2), 16) / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const qrMatrix = (data, ec) => { if (typeof qrcode !== 'function' || !data) return null; try { const q = qrcode(0, ec); q.addData(unescape(encodeURIComponent(data)), 'Byte'); q.make(); const n = q.getModuleCount(); return { n, at: (r, c) => q.isDark(r, c) }; } catch (e) { return null; } };
const qrGeom = (q, px) => { const pad = Math.round(px * 0.06), fw = q.frame ? Math.round(px * 0.035) : 0, lab = q.frame && q.label ? Math.round(px * 0.17) : 0; return { pad, fw, lab, W: px + (fw + pad) * 2, H: px + (fw + pad) * 2 + lab }; };
let logoImg = null;
const qrDrawCanvas = (cv, q, px) => { const data = qrData(q), m = qrMatrix(data, q.logo ? 'H' : 'M'); const g = qrGeom(q, px); cv.width = g.W; cv.height = g.H; const x = cv.getContext('2d');
  x.fillStyle = q.bg; x.fillRect(0, 0, g.W, g.H);
  if (q.frame) { x.fillStyle = q.fc; const r = g.fw * 3; x.beginPath(); x.roundRect(0, 0, g.W, g.H, r); x.fill(); x.fillStyle = q.bg; x.beginPath(); x.roundRect(g.fw, g.fw, g.W - g.fw * 2, px + g.pad * 2, r * .6); x.fill();
    if (q.label) { x.fillStyle = lum(q.fc) > 0.45 ? '#1E1D2A' : '#FFFFFF'; x.font = `800 ${Math.round(g.lab * .48)}px "Plus Jakarta Sans", Arial, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(q.label.slice(0, 24), g.W / 2, g.H - g.lab / 2 - g.fw * .3); } }
  if (!m) { x.fillStyle = '#9A98AA'; x.font = `600 ${Math.round(px * .05)}px Arial`; x.textAlign = 'center'; x.fillText('Add your details to see the code', g.W / 2, g.fw + g.pad + px / 2); return null; }
  const o = g.fw + g.pad, s = px / m.n; x.fillStyle = q.fg; for (let r = 0; r < m.n; r++) for (let c = 0; c < m.n; c++) if (m.at(r, c)) x.fillRect(Math.floor(o + c * s), Math.floor(o + r * s), Math.ceil(s), Math.ceil(s));
  if (q.logo && logoImg && logoImg.complete) { const L2 = px * 0.22, lx = o + (px - L2) / 2, ly = o + (px - L2) / 2, b = L2 * 0.12; x.fillStyle = q.bg; x.beginPath(); x.roundRect(lx - b, ly - b, L2 + b * 2, L2 + b * 2, b * 1.4); x.fill();
    const r = Math.min(L2 / logoImg.naturalWidth, L2 / logoImg.naturalHeight), w = logoImg.naturalWidth * r, h = logoImg.naturalHeight * r; x.drawImage(logoImg, lx + (L2 - w) / 2, ly + (L2 - h) / 2, w, h); }
  return { m, data }; };
const qrSVG = q => { const data = qrData(q), m = qrMatrix(data, q.logo ? 'H' : 'M'); if (!m) return ''; const px = 1000, g = qrGeom(q, px), o = g.fw + g.pad, s = px / m.n; let d = '';
  for (let r = 0; r < m.n; r++) for (let c = 0; c < m.n; c++) if (m.at(r, c)) d += `M${(o + c * s).toFixed(2)} ${(o + r * s).toFixed(2)}h${s.toFixed(2)}v${s.toFixed(2)}h-${s.toFixed(2)}z`;
  const L2 = px * 0.22, lx = o + (px - L2) / 2, b = L2 * 0.12;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.W} ${g.H}" width="${g.W}" height="${g.H}"><rect width="${g.W}" height="${g.H}" fill="${q.bg}"/>${q.frame ? `<rect width="${g.W}" height="${g.H}" rx="${g.fw * 3}" fill="${q.fc}"/><rect x="${g.fw}" y="${g.fw}" width="${g.W - g.fw * 2}" height="${px + g.pad * 2}" rx="${g.fw * 1.8}" fill="${q.bg}"/>${q.label ? `<text x="${g.W / 2}" y="${g.H - g.lab / 2 - g.fw * .3}" text-anchor="middle" dominant-baseline="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="800" font-size="${Math.round(g.lab * .48)}" fill="${lum(q.fc) > 0.45 ? '#1E1D2A' : '#FFFFFF'}">${esc(q.label.slice(0, 24))}</text>` : ''}` : ''}<path d="${d}" fill="${q.fg}"/>${q.logo ? `<rect x="${lx - b}" y="${lx - b}" width="${L2 + b * 2}" height="${L2 + b * 2}" rx="${b * 1.4}" fill="${q.bg}"/><image href="${q.logo}" x="${lx}" y="${lx}" width="${L2}" height="${L2}" preserveAspectRatio="xMidYMid meet"/>` : ''}</svg>`; };
const qrFields = q => ({ url: `<label class="f">Web address<input class="in" data-q="url" value="${esc(q.url)}" inputmode="url" placeholder="e.g. yourcharity.org.uk/donate"></label>`,
  text: `<label class="f">Text<textarea class="in" data-q="text" rows="3" placeholder="Shown on the phone when scanned">${esc(q.text)}</textarea></label>`,
  wa: `<div class="two"><label class="f">WhatsApp number<input class="in" data-q="waNum" value="${esc(q.waNum)}" inputmode="tel" placeholder="07…"></label><label class="f">Message they start with (optional)<input class="in" data-q="waMsg" value="${esc(q.waMsg)}" placeholder="e.g. Hi, I’d like to volunteer"></label></div>`,
  tel: `<label class="f">Phone number<input class="in" data-q="tel" value="${esc(q.tel)}" inputmode="tel" placeholder="01582…"></label>`,
  wifi: `<div class="two"><label class="f">Network name<input class="in" data-q="ssid" value="${esc(q.ssid)}"></label><label class="f">Password<input class="in" data-q="pass" value="${esc(q.pass)}" ${q.sec === 'nopass' ? 'disabled' : ''}></label></div><div class="two"><label class="f">Security<select class="in" data-q="sec" data-uxd="1"><option value="WPA"${q.sec === 'WPA' ? ' selected' : ''}>WPA/WPA2/WPA3</option><option value="WEP"${q.sec === 'WEP' ? ' selected' : ''}>WEP</option><option value="nopass"${q.sec === 'nopass' ? ' selected' : ''}>No password</option></select></label><label class="t5ck"><input type="checkbox" data-q="hidden" ${q.hidden ? 'checked' : ''}> Hidden network</label></div><p class="note">Anyone who scans it can join. Use your guest network.</p>`,
  mail: `<label class="f">Email address<input class="in" data-q="mail" value="${esc(q.mail)}" type="email" placeholder="hello@…"></label><div class="two"><label class="f">Subject (optional)<input class="in" data-q="subj" value="${esc(q.subj)}"></label><label class="f">Message (optional)<input class="in" data-q="body" value="${esc(q.body)}"></label></div>` }[q.type]);
V.qr = () => { Q = qrS(); store.set('qr-prefill', null);
  return page('qr', 'QR code maker', 'Codes that never expire: they go straight to your link with no middleman. Pick what it does, add your details, make it yours with colours, a logo and a frame, then download.',
  `<div id="qrBox" hidden></div><div class="t5grid qrg"><div class="form t5form">
    <div class="t5step"><span>1</span><b>What should it do?</b></div><div class="t5chips qrtypes" role="radiogroup">${QT.map(([v, l]) => `<label class="t5chip"><input type="radio" name="qrtype" value="${v}" ${Q.type === v ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
    <div class="t5step"><span>2</span><b>Your details</b></div><div id="qrF">${qrFields(Q)}</div>
    <div class="t5step"><span>3</span><b>Make it yours</b></div>
    <div class="qrcols"><label>Code<input type="color" data-q="fg" value="${esc(Q.fg)}"></label><label>Background<input type="color" data-q="bg" value="${esc(Q.bg)}"></label><label>Frame<input type="color" data-q="fc" value="${esc(Q.fc)}"></label></div>
    <div class="t5tog"><label><input type="checkbox" data-q="frame" ${Q.frame ? 'checked' : ''}> Frame with a label</label></div>
    <label class="f" ${Q.frame ? '' : 'hidden'} id="qrLabW">Label<input class="in" data-q="label" value="${esc(Q.label)}" maxlength="24" placeholder="e.g. Scan to donate"></label>
    <div class="qrlogo"><label class="btn s sm">${Q.logo ? 'Change logo' : 'Add a logo in the middle'}<input type="file" accept="image/*" id="qrLogo" hidden></label>${Q.logo ? '<button type="button" class="linkbtn" data-qrnologo>Remove logo</button>' : ''}</div>
    <p class="note">With a logo the code uses the highest error correction, so it still scans with the middle covered.</p></div>
  <div class="qrprev"><div class="qrstage"><canvas id="qrCv" role="img" aria-label="Your QR code"></canvas></div><div id="qrChk" class="qrchk" aria-live="polite"></div>
    <div class="row"><button type="button" class="btn p" data-qrdl="png">Download PNG</button><button type="button" class="btn s" data-qrdl="svg">Download SVG</button></div>
    <p class="note">PNG is 2000 pixels wide, sharp enough for posters. SVG scales to any size for print. Always test-scan the printed code with two different phones.</p>
    <div class="dlbox"><b>Want it on a poster, banner or flyer?</b><p class="note">We design it with your code and print it at community rates. Nothing is printed until you approve the proof.</p><a class="btn s sm" href="#studio">Design & Print Studio</a></div></div></div>`, ['tools', 'Marketing support']); };
const qrRender = () => { const cv = $('#qrCv'); if (!cv || !Q) return; const r = qrDrawCanvas(cv, Q, 560); store.set('qr-last', { ...Q });
  const c = $('#qrChk'); if (!c) return; const w = []; const cr = contrast(Q.fg, Q.bg);
  if (!r) { c.innerHTML = ''; return; }
  if (lum(Q.fg) > lum(Q.bg)) w.push('The code is lighter than its background. Many phones can’t read inverted codes: use a dark code on a light background.');
  else if (cr < 4) w.push(`Low contrast (${cr.toFixed(1)} to 1). Aim for 4 to 1 or more so every phone can read it.`);
  if (Q.frame && contrast(Q.fc, Q.bg) < 1.3) w.push('The frame is very close to the background colour, so the edge of the code is hard to see.');
  if (r.data.length > 300) w.push('That’s a lot of information, so the squares are small. Print it bigger, or use a shorter link.');
  if (Q.type === 'url' && /^https?:\/\/[^/]*\.(?:ly|gl|gd)\//i.test(r.data)) w.push('Shortened links from other services can stop working or show adverts. A direct link is safer.');
  c.innerHTML = w.length ? w.map(x => `<p class="qrw">${esc(x)}</p>`).join('') : `<p class="qrok">${si('check')} Good contrast · ${r.m.n}×${r.m.n} squares · print at least 2 cm wide</p>`; };
document.addEventListener('input', e => { const i = e.target.closest('[data-q]'); if (!i || !Q) return; const k = i.dataset.q; Q[k] = i.type === 'checkbox' ? i.checked : i.value;
  if (k === 'frame') { const w = $('#qrLabW'); if (w) w.hidden = !i.checked; } if (k === 'sec') { const p = $('[data-q=pass]'); if (p) p.disabled = i.value === 'nopass'; } qrRender(); });
document.addEventListener('change', e => { if (e.target.name === 'qrtype' && Q) { Q.type = e.target.value; $('#qrF').innerHTML = qrFields(Q); qrRender(); return; }
  if (e.target.matches('[data-q]')) { e.target.dispatchEvent(new Event('input', { bubbles: true })); return; }
  if (e.target.id === 'qrLogo' && Q) { const f = e.target.files[0]; if (!f) return; const img = new Image(), u = URL.createObjectURL(f); img.onload = () => { const k = Math.min(1, 400 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); Q.logo = c.toDataURL('image/png'); URL.revokeObjectURL(u); logoImg = new Image(); logoImg.onload = () => { qrRender(); const w = $('.qrlogo'); if (w) w.innerHTML = `<label class="btn s sm">Change logo<input type="file" accept="image/*" id="qrLogo" hidden></label><button type="button" class="linkbtn" data-qrnologo>Remove logo</button>`; }; logoImg.src = Q.logo; }; img.onerror = () => toast('Couldn’t open that picture'); img.src = u; } });
document.addEventListener('click', e => { if (e.target.closest('[data-qrnologo]') && Q) { Q.logo = ''; logoImg = null; e.target.closest('.qrlogo').innerHTML = `<label class="btn s sm">Add a logo in the middle<input type="file" accept="image/*" id="qrLogo" hidden></label>`; qrRender(); return; }
  const d = e.target.closest('[data-qrdl]'); if (d && Q) { const name = 'qr-' + (Q.label || Q.type).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'qr';
    if (!qrData(Q)) { toast('Add your details first'); return; }
    if (d.dataset.qrdl === 'svg') { const b = new Blob([qrSVG(Q)], { type: 'image/svg+xml' }); dl(b, name + '.svg'); }
    else { const c = document.createElement('canvas'); qrDrawCanvas(c, Q, 1800); c.toBlob(b => dl(b, name + '.png'), 'image/png'); } L.track?.('qr_download', { type: Q.type }); } });
const dl = (b, n) => { const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = n; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); toast('Downloaded'); };

/* =====================================================================
   5) SHORT LINKS (behind window.HUB_SHORTLINKS)
   ===================================================================== */
const SL_ON = () => !!window.HUB_SHORTLINKS, SL_BASE = () => window.HUB_SHORT_BASE || 'https://smrgraphics.co.uk/hub/s.php?c=';
const slApi = (a, body, q = '') => fetch('/hub/api.php?a=' + a + q, body ? { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { credentials: 'same-origin', cache: 'no-store' }).then(r => r.json());
V.shortlinks = () => SL_ON() ? page('shortlinks', 'Short links', 'Turn a long link into a short one you can say out loud and print, and see how many people tap it and where they came from.',
  `<div class="t5grid"><form class="form t5form" id="slForm"><label class="f">Where should it go?<input class="in" name="url" inputmode="url" required placeholder="https://…"></label><label class="f">Ending (optional)<small>${esc(SL_BASE())}<b>your-ending</b></small><input class="in" name="slug" pattern="[a-z0-9][a-z0-9-]{1,39}" placeholder="e.g. winter-coats"></label><label class="f">Name it (for you)<input class="in" name="title" placeholder="e.g. Winter coat drive poster"></label><button class="btn p">Make the short link</button><p class="note">Add <b>?s=poster</b> or <b>?s=instagram</b> to the end of a copy to see which one people used.</p></form>
  <div class="t5out" id="slOut"><div class="t5busy">Loading your links…</div></div></div>`, ['tools', 'Marketing support'])
  : page('shortlinks', 'Short links', 'Coming soon: short links you can print and say out loud, with a count of every tap and where it came from.',
  `<div class="t5soon"><b>Coming soon</b><ul class="ticks"><li>Short, memorable links for posters, radio and leaflets</li><li>Tap counts by day, and where people came from</li><li>A QR code for every link</li><li>Change where a link goes without reprinting</li></ul><p class="note">For now, the <a href="#qr">QR code maker</a> and <a href="#linkpage">Your one link</a> cover most of this.</p></div>`, ['tools', 'Marketing support']);
const slList = async () => { const o = $('#slOut'); if (!o) return; try { const j = await slApi('sl_list', null, L.isOwner ? '&all=1' : ''); const l = j.links || [];
  o.innerHTML = l.length ? `<div class="t5res"><div class="t5rh"><b>${L.isOwner ? 'All short links' : 'Your short links'}</b></div>${l.map(x => `<article class="t5card"><div class="t5ch"><b>${esc(x.title || x.slug)}</b><span class="t5len">${x.taps} tap${x.taps == 1 ? '' : 's'}</span></div><p class="slurl">${esc(SL_BASE() + x.slug)}</p><p class="note">Goes to ${esc(x.url)}</p><div class="row"><button type="button" class="btn p sm" data-slcopy="${esc(x.slug)}">Copy</button><button type="button" class="btn s sm" data-slqr="${esc(x.slug)}">QR code</button><button type="button" class="btn s sm" data-slstats="${esc(x.slug)}">Taps</button><button type="button" class="linkbtn" data-sldel="${esc(x.slug)}">Delete</button></div><div class="slstats" id="sls-${esc(x.slug)}"></div></article>`).join('')}</div>` : `<div class="t5empty"><b>No short links yet</b><span>Make your first one on the left.</span></div>`; } catch (e) { o.innerHTML = '<div class="t5err">Couldn’t load your links.</div>'; } };
document.addEventListener('submit', async e => { if (e.target.id !== 'slForm') return; e.preventDefault(); e.stopImmediatePropagation(); const fd = Object.fromEntries(new FormData(e.target)); let u = fd.url.trim(); if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  const j = await slApi('sl_make', { url: u, slug: fd.slug.trim().toLowerCase(), title: fd.title }); if (j.error) { toast({ taken: 'That ending is taken, try another', bad_url: 'Check the link', bad_slug: 'Use letters, numbers and dashes', rate_limited: 'Slow down a little' }[j.error] || 'Couldn’t make it'); return; } e.target.reset(); toast('Short link made'); slList(); }, true);
document.addEventListener('click', async e => { const c = e.target.closest('[data-slcopy]'); if (c) { copyTxt(SL_BASE() + c.dataset.slcopy, 'Link copied'); return; }
  const q = e.target.closest('[data-slqr]'); if (q) { store.set('qr-prefill', SL_BASE() + q.dataset.slqr); location.hash = 'qr'; return; }
  const d = e.target.closest('[data-sldel]'); if (d) { if (!confirm('Delete this short link? Printed copies will stop working.')) return; await slApi('sl_del', { slug: d.dataset.sldel }); slList(); return; }
  const s = e.target.closest('[data-slstats]'); if (s) { const box = $('#sls-' + s.dataset.slstats); const j = await slApi('sl_stats', { slug: s.dataset.slstats }); const t = j.taps || [], by = {}, src = {}; t.forEach(r => { by[r.day] = (by[r.day] || 0) + +r.n; src[r.src] = (src[r.src] || 0) + +r.n; });
    const days = Object.keys(by).sort().slice(-14), mx = Math.max(1, ...days.map(d => by[d])); box.innerHTML = t.length ? `<div class="slbars">${days.map(d => `<span title="${d}: ${by[d]}" style="height:${Math.round(by[d] / mx * 100)}%"></span>`).join('')}</div><p class="note">Last ${days.length} day${days.length === 1 ? '' : 's'} with taps · from ${Object.entries(src).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${esc(k)} ${v}`).join(', ')}</p>` : '<p class="note">No taps yet.</p>'; } });

/* =====================================================================
   6) LOGO VECTORISE & REFRESH (a Design & Print service)
   ===================================================================== */
V.logoservice = () => page('logoservice', 'Logo vectorise & refresh', 'Blurry logo, or only a photo of the sign? We redraw it as a clean, sharp file that works at any size, and can freshen it up too. Usually back within 24 hours, at community rates.',
  `<div class="lgsv"><div class="lgopts">
    <label class="lgopt"><input type="checkbox" name="lgv" value="vectorise" checked><span><b>Vectorise</b><small>Redrawn exactly as it is, as a crisp file for print, signs, clothing and web.</small><ul class="ticks"><li>SVG and PDF that scale to any size</li><li>PNG with a see-through background</li><li>Colour, black and white-out versions</li></ul></span></label>
    <label class="lgopt"><input type="checkbox" name="lgv" value="refresh"><span><b>Refresh</b><small>The same logo, modernised: cleaner shapes and lettering, so people still recognise it.</small><ul class="ticks"><li>Two or three directions to choose from</li><li>Colour versions and a simple brand mini-kit</li><li>Colours, fonts and how to use the logo</li></ul></span></label></div>
  <form class="form lgform" id="lgForm"><label class="f">Your current logo<small>Any format: picture, screenshot, PDF, AI, EPS or a photo of a sign. If it won’t upload, choose “Send it later”.</small><input class="in" type="file" name="file" accept="image/*,.pdf,.svg,.ai,.eps,.psd"></label><div class="lgpv" id="lgPv" hidden></div>
    <label class="t5ck"><input type="checkbox" name="later"> I’ll send the file later on WhatsApp or email</label>
    <div class="two"><label class="f">Organisation<input class="in" name="org" required value="${esc(orgName())}"></label><label class="f">Your name<input class="in" name="name" required value="${esc(prof().name || '')}"></label></div>
    <div class="two"><label class="f">Email or phone<input class="in" name="contact" required value="${esc(prof().email || '')}"></label><label class="f">Needed by (optional)<input class="in" type="date" name="by"></label></div>
    <label class="f">Anything we should know?<small>Colours to keep, what it’s for (sign, hoodies, website), words that must stay.</small><textarea class="in" name="notes" rows="3"></textarea></label>
    <button class="btn p">Send my request</button><p class="note">No order is placed and nothing is charged until you’ve seen the proof and approved it in writing. We’ll confirm the community rate first.</p></form></div>
  <div class="steps lgsteps">${[['Send your logo', 'Any file or photo'], ['We redraw it', 'Usually within 24 hours'], ['Check the proof', 'Ask for changes, or approve it'], ['Get every file', 'For print, signs, clothing and web']].map(([a, b], i) => `<div><span>${i + 1}</span><b>${a}</b><small>${b}</small></div>`).join('')}</div>`, ['studio', 'Design & Print Studio']);
let lgFile = null;
document.addEventListener('change', e => { if (!e.target.closest('#lgForm') || e.target.name !== 'file') return; const f = e.target.files[0], pv = $('#lgPv'); lgFile = null; if (!f) { pv.hidden = true; return; }
  if (f.size > 25e6) { toast('That file is over 25 MB: send it later instead'); e.target.value = ''; return; }
  lgFile = { name: f.name, size: f.size, type: f.type, prev: '' }; pv.hidden = false;
  if (/^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(f.type)) { const img = new Image(), u = URL.createObjectURL(f); img.onload = () => { const k = Math.min(1, 900 / Math.max(img.naturalWidth || 900, img.naturalHeight || 900)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round((img.naturalWidth || 900) * k)); c.height = Math.max(1, Math.round((img.naturalHeight || 900) * k)); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); lgFile.prev = c.toDataURL('image/png'); if (lgFile.prev.length > 150000) lgFile.prev = c.toDataURL('image/jpeg', .8); pv.innerHTML = `<img src="${lgFile.prev}" alt="Your logo"><span>${esc(f.name)} · ${Math.round(f.size / 1024)} KB${img.naturalWidth < 500 ? ' · small picture: that’s fine, we redraw it' : ''}</span>`; URL.revokeObjectURL(u); }; img.src = u; }
  else pv.innerHTML = `<span>${esc(f.name)} · ${Math.round(f.size / 1024)} KB. We’ll ask you to send the original file on WhatsApp or email.</span>`; });
document.addEventListener('submit', e => { if (e.target.id !== 'lgForm') return; e.preventDefault(); e.stopImmediatePropagation(); const fd = new FormData(e.target), opts = $$('input[name=lgv]:checked').map(x => x.value);
  if (!opts.length) { toast('Choose Vectorise, Refresh or both'); return; } if (!lgFile && !fd.get('later')) { toast('Add your logo, or tick “send it later”'); return; }
  L.submit('logo-service', { title: 'Logo ' + opts.join(' + ') + ': ' + fd.get('org'), want: opts.join(', '), org: fd.get('org'), name: fd.get('name'), contact: fd.get('contact'), by: fd.get('by'), notes: fd.get('notes'), file: lgFile ? lgFile.name : 'sending later', preview: lgFile?.prev || '' },
    `Hi SMR, I’ve asked for a logo ${opts.join(' and ')} for ${fd.get('org')} on the Community Hub.${lgFile ? ' File: ' + lgFile.name + '.' : ' I’ll send the file here.'}`, { title: 'Logo request sent', text: 'Thanks. We’ll be in touch, usually within one working day, to confirm the community rate. Your first proof is usually back within 24 hours of that. Nothing is charged until you approve the proof.' }); });
const logoCTA = `<aside class="lgcta noprint">${L.tic ? L.tic('logoservice', 'ti sm') : ''}<div><b>Logo blurry or only a photo?</b><span>We redraw it as a sharp file for print, signs and web, usually within 24 hours.</span></div><a class="btn s sm" href="#logoservice">Fix my logo</a></aside>`;
['brand', 'setup'].forEach(k => { const f0 = V[k]; if (!f0) return; V[k] = id => { const h = f0(id); return typeof h === 'string' ? h.replace(/<\/div>\s*$/, logoCTA + '</div>') : h; }; });
const org0 = V.org; if (org0) V.org = id => { const h = org0(id); return typeof h === 'string' ? h.replace(/<\/div>\s*$/, `<p class="note lgorg">Is this your organisation and the logo looks blurry? <a href="#logoservice">We can redraw it</a>.</p></div>`) : h; };

/* =====================================================================
   7) CERTIFICATES: make the upgrade clear
   ===================================================================== */
const certUp = `<aside class="certup noprint"><div><b>Want your own certificate design?</b><span>We’ll make a unique template in your brand that anyone in your team can fill in. You approve the proof first.</span></div><div class="row"><button type="button" class="btn p sm" data-xq="template-design" data-pre='{"kind":"Certificate"}'>Get your own design</button></div></aside>`;
['templates', 'hours'].forEach(k => { const f0 = V[k]; if (f0) V[k] = id => { const h = f0(id); return typeof h === 'string' ? h.replace('<div class="certwrap">', certUp + '<div class="certwrap">') : h; }; });

/* ---------- Coming soon look for short links in menus and All tools ---------- */
const markSoon = () => { if (SL_ON()) return; $$('a[href="#shortlinks"]').forEach(a => { if (a.classList.contains('t5soonlink')) return; a.classList.add('t5soonlink'); a.setAttribute('aria-label', 'Short links: coming soon'); if (!a.querySelector('.t5sb')) a.insertAdjacentHTML('beforeend', '<span class="t5sb">Coming soon</span>'); }); };
new MutationObserver(() => { markSoon(); if (location.hash === '#qr' && $('#qrCv') && !$('#qrCv').dataset.on) { $('#qrCv').dataset.on = 1; if (Q?.logo) { logoImg = new Image(); logoImg.onload = qrRender; logoImg.src = Q.logo; } (document.fonts?.ready || Promise.resolve()).then(qrRender); }
  if (location.hash === '#shortlinks' && SL_ON() && $('#slOut') && !$('#slOut').dataset.on) { $('#slOut').dataset.on = 1; slList(); } if (location.hash === '#proofread' && $('#prIn') && !$('#prIn').dataset.on) { $('#prIn').dataset.on = 1; prMeta(); } }).observe(document.body, { childList: true, subtree: true });

/* ---------- styles ---------- */
const css = document.createElement('style'); css.textContent = `
.t5grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:18px;align-items:start}.qrg{grid-template-columns:minmax(0,1fr) minmax(0,.9fr)}
@media(max-width:860px){.t5grid,.qrg{grid-template-columns:1fr}}
.t5form{padding:16px;border-radius:18px;background:#fff;border:1.5px solid var(--line,#D9D8E6)}.t5form fieldset{border:0;padding:0;margin:0 0 12px}.t5form legend{font-weight:700;margin-bottom:6px}
.t5chips{display:flex;flex-wrap:wrap;gap:6px}.t5chip{position:relative}.t5chip input{position:absolute;opacity:0;pointer-events:none}.t5chip span{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:999px;border:1.5px solid var(--line,#D9D8E6);background:#fff;font-weight:600;font-size:14px;cursor:pointer;user-select:none}
.t5chip input:checked+span{background:#EEF0FF;border-color:#4545D6;color:#2E2FA8}.t5chip input:focus-visible+span{outline:3px solid #9A9CF0;outline-offset:2px}
.t5tog{display:flex;flex-wrap:wrap;gap:16px;margin:4px 0 12px}.t5tog label,.t5ck{display:flex;align-items:center;gap:8px;font-weight:600}.t5tog input,.t5ck input{width:20px;height:20px}
.t5ev{margin:-6px 0 12px;font-weight:700}.t5left{margin:8px 0 0;font-size:12.5px;opacity:.7}
.t5empty{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:34px 20px;border-radius:18px;border:1.5px dashed var(--line,#D9D8E6);color:#55536A}.t5empty .si{width:28px;height:28px;color:#4545D6}.t5empty span{max-width:360px;font-size:14px;line-height:1.5}
.t5busy{display:flex;align-items:center;gap:10px;padding:22px;border-radius:18px;background:#fff;border:1.5px solid var(--line,#D9D8E6);font-weight:600}
.t5dots{display:inline-flex;gap:4px}.t5dots i{width:8px;height:8px;border-radius:50%;background:#4545D6;animation:t5b 1s infinite ease-in-out}.t5dots i:nth-child(2){animation-delay:.15s}.t5dots i:nth-child(3){animation-delay:.3s}@keyframes t5b{0%,80%,100%{opacity:.25;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
@media(prefers-reduced-motion:reduce){.t5dots i{animation:none}}
.t5err{padding:16px;border-radius:14px;background:#FFF1F0;border:1px solid #F2B8B5;color:#8C1D18;font-weight:600}
.t5res{display:grid;gap:10px}.t5rh{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.t5rh b{font-size:17px}
.t5card{padding:14px;border-radius:16px;background:#fff;border:1.5px solid var(--line,#D9D8E6);display:grid;gap:10px}.t5ch{display:flex;align-items:center;justify-content:space-between;gap:8px}
.t5n{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#EEF0FF;color:#2E2FA8;font-weight:800}.t5len{font-size:12.5px;opacity:.75}.t5len.over{color:#B3261E;opacity:1;font-weight:700}
.t5txt{white-space:pre-wrap;line-height:1.55;font-size:15px;overflow-wrap:anywhere}.t5diff ins{background:#DDF4E4;color:#0E5E35;text-decoration:none;border-radius:3px;padding:0 1px}.t5diff del{background:#FBE3E1;color:#9B2C25;border-radius:3px;padding:0 1px}
.t5meta{font-size:13px;opacity:.75;margin:-4px 0 10px;min-height:1em}.t5rw{display:flex;flex-wrap:wrap;gap:6px}
.t5seg{display:inline-flex;border:1.5px solid var(--line,#D9D8E6);border-radius:999px;overflow:hidden}.t5seg button{border:0;background:#fff;padding:8px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer}.t5seg button.on{background:#4545D6;color:#fff}
.t5min{padding:22px;border-radius:16px;background:#fff;border:1.5px solid var(--line,#D9D8E6);line-height:1.55}.t5min.editing{outline:3px solid #9A9CF0}.t5min h2{margin:0 0 2px}.t5min h3{margin:16px 0 4px;font-size:16px}.t5mm{opacity:.75;margin:0 0 6px}.t5dec{background:#F3F2FA;border-radius:8px;padding:6px 10px}.t5sig{margin-top:22px;font-size:14px}
.t5step{display:flex;align-items:center;gap:8px;margin:14px 0 8px}.t5step:first-child{margin-top:0}.t5step span{width:24px;height:24px;border-radius:50%;background:#4545D6;color:#fff;display:grid;place-items:center;font-size:13px;font-weight:800}
.qrcols{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:10px}.qrcols label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:600}.qrcols input{width:64px;height:44px;border:1.5px solid var(--line,#D9D8E6);border-radius:10px;padding:2px;background:#fff}
.qrlogo{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.qrprev{position:sticky;top:76px;display:grid;gap:10px}
.qrstage{display:grid;place-items:center;padding:20px;border-radius:18px;background:repeating-conic-gradient(#F1F0F6 0 25%,#fff 0 50%) 0 0/20px 20px;border:1.5px solid var(--line,#D9D8E6)}#qrCv{width:min(100%,320px);height:auto;border-radius:10px;box-shadow:0 8px 26px rgba(30,30,80,.14)}
.qrchk p{margin:0;padding:10px 12px;border-radius:12px;font-size:14px;line-height:1.45}.qrw{background:#FFF4E6;border:1px solid #F3C58B}.qrok{background:#E9F7EF;border:1px solid #9AD5B1;display:flex;align-items:center;gap:8px}.qrok .si{width:16px;height:16px;color:#16865F}
.t5soon{padding:20px;border-radius:18px;background:#fff;border:1.5px dashed var(--line,#D9D8E6)}.t5soon>b{display:inline-block;padding:4px 10px;border-radius:999px;background:#EEEDF2;font-size:13px;margin-bottom:8px}
.t5soonlink{opacity:.55;filter:grayscale(1)}.t5sb{display:inline-block;margin-left:6px;padding:2px 8px;border-radius:999px;background:#EEEDF2;color:#55536A;font-size:11px;font-weight:700;white-space:nowrap}
.slurl{font-weight:700;margin:0;overflow-wrap:anywhere}.slbars{display:flex;align-items:flex-end;gap:3px;height:60px;padding:6px;border-radius:10px;background:#F3F2FA}.slbars span{flex:1;background:#4545D6;border-radius:3px 3px 0 0;min-height:3px}
.lgsv{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;align-items:start}@media(max-width:860px){.lgsv{grid-template-columns:1fr}}
.lgopts{display:grid;gap:10px}.lgopt{display:flex;gap:12px;padding:16px;border-radius:18px;background:#fff;border:1.5px solid var(--line,#D9D8E6);cursor:pointer}.lgopt:has(input:checked){border-color:#4545D6;background:#F6F6FF}.lgopt input{width:22px;height:22px;flex:none;margin-top:2px}
.lgopt span{display:flex;flex-direction:column;gap:4px}.lgopt b{font-size:17px}.lgopt small{font-size:14px;opacity:.8;line-height:1.45}.lgopt ul{margin:6px 0 0}
.lgform{padding:16px;border-radius:18px;background:#fff;border:1.5px solid var(--line,#D9D8E6)}.lgpv{display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;background:#F3F2FA;margin:-4px 0 10px;font-size:13px}.lgpv img{max-width:120px;max-height:80px;object-fit:contain;background:#fff;border-radius:8px;padding:4px}
.lgsteps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.lgsteps>div{display:flex;flex-direction:column;gap:4px;padding:14px;border-radius:16px;background:#fff;border:1.5px solid var(--line,#D9D8E6)}.lgsteps span{width:26px;height:26px;border-radius:50%;background:#E8A33D;color:#fff;display:grid;place-items:center;font-weight:800}.lgsteps small{opacity:.75}
@media(max-width:620px){.lgsteps{grid-template-columns:1fr 1fr}}
.lgcta,.certup{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:18px 0 6px;padding:14px 16px;border-radius:16px;background:linear-gradient(135deg,#FFF6EA,#FFF0F3);border:1px solid #F3D2B8}.lgcta div,.certup>div:first-child{flex:1 1 220px;display:flex;flex-direction:column;gap:2px}.lgcta span,.certup span{font-size:14px;opacity:.85;line-height:1.45}.certup{margin:0 0 14px}
@media print{.qrprev{position:static}}`;
document.head.appendChild(css);
if (T.gate) Object.keys(V).forEach(T.gate);
});
