/* SMR Admin → Proofs: send designs to a client on a link (/p/<token>) to check and sign off, or ask for changes.
   Items (roller banner, card front/back…) each have versions (v1, v2…) of one or more pages. PDFs are turned into pictures here.
   Talks to api.php?a=pf_* (demo-lib/proofs.php). */
(function () {
  var A = window.SMRA, $ = function (id) { return document.getElementById(id); }, esc = A.esc;
  var P = { sets: [], jobs: [], sum: null, mail: false, ai: { on: false } }, filt = 'open', loaded = false;
  var KINDS = ['Roller banner', 'Vinyl banner', 'Poster', 'Flyer / leaflet', 'Menu', 'Business card', 'Sticker', 'Sign board', 'A-board', 'Social post', 'Logo', 'Clothing', 'Website / app screen', 'Other'];
  var now = function () { return Math.floor(Date.now() / 1000); };
  var dShort = function (t) { return t ? new Date(t * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' + new Date(t * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''; };
  var ago = function (t) { var s = now() - t; if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return Math.round(s / 86400) + ' days ago'; };
  var WA = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>';
  var STATE = { empty: ['draft', 'No designs yet'], draft: ['draft', 'Not sent yet'], ready: ['ready', 'Ready to send'], waiting: ['waiting', 'Waiting for sign-off'], changes: ['changes', 'Changes asked'], done: ['done', 'All signed off'] };
  var IST = { draft: 'No design yet', waiting: 'Waiting', approved: '✓ Signed off', changes: 'Changes asked' };

  var css = document.createElement('style');
  css.textContent = [
    '#pf .pfh{display:flex;align-items:center;gap:10px;margin-bottom:14px}#pf .pfh h1{flex:1;margin:0}#pf .pfh small{display:block;color:var(--muted);font:600 13px Manrope,sans-serif;margin-top:2px}',
    '.pfstat{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}.pfstat button{padding:10px 4px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.03);text-align:center}.pfstat b{display:block;font:800 20px Sora,sans-serif}.pfstat span{font-size:11px;color:var(--muted);font-weight:700}.pfstat .r b{color:#ff7a90}.pfstat .a b{color:#ffc061}.pfstat .p b{color:#cfb4ff}.pfstat .g b{color:#7ff0bd}',
    '.pfseg{display:flex;gap:4px;padding:4px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.03);margin:4px 0 12px}.pfseg button{flex:1;padding:8px 6px;border-radius:9px;font-weight:700;font-size:13px;color:var(--muted)}.pfseg button.on{background:rgba(214,59,255,.16);color:#fff}',
    '.pfc{display:flex;gap:12px;width:100%;text-align:left;padding:12px;border-radius:18px;border:1px solid var(--line);background:rgba(255,255,255,.03);margin-bottom:10px}.pfc .th{width:64px;height:64px;border-radius:12px;flex:none;background:#2a2838 center/cover no-repeat}.pfc .tx{flex:1;min-width:0}.pfc b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pfc .who{font-size:12.5px;color:var(--muted)}.pfc .l3{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}',
    '.pfc.hot{border-color:rgba(255,84,112,.6)}',
    '.ps{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:800;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.08);color:#d9d9ea}.ps.waiting,.ps.ready{background:rgba(255,181,71,.16);color:#ffd08a}.ps.changes{background:rgba(255,84,112,.2);color:#ff9db0}.ps.done,.ps.approved{background:rgba(61,220,151,.16);color:#7ff0bd}.ps.draft{color:var(--muted)}',
    '.pfi{display:flex;gap:12px;padding:12px 0;border-top:1px solid var(--line)}.pfi:first-of-type{border-top:0}.pfi .th{width:72px;height:72px;border-radius:12px;flex:none;background:#2a2838 center/contain no-repeat;border:1px solid var(--line)}.pfi .tx{flex:1;min-width:0}.pfi b{display:block;font-size:15px}.pfi small{display:block;font-size:12px;color:var(--muted)}.pfi .fb{margin-top:6px;padding:8px 10px;border-radius:10px;background:rgba(255,84,112,.12);color:#ffc2cc;font-size:13px}.pfi .bt{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
    '.pfbox{border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin-top:12px;background:rgba(255,255,255,.02)}.pfbox h3{font:800 11.5px Manrope,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}',
    '.pfev{font-size:12.5px;color:var(--muted);padding:5px 0;border-top:1px solid var(--line)}.pfev:first-of-type{border-top:0}.pfev b{color:#d9d9ea;font-weight:700}.pfev.ok b{color:#7ff0bd}.pfev.ch b{color:#ff9db0}',
    '.pfdrop{margin-top:10px;padding:18px;border-radius:14px;border:2px dashed var(--line);text-align:center;color:var(--muted);font-size:13.5px;cursor:pointer}.pfdrop b{display:block;color:var(--ink);font-size:15px}',
    '.pfprog{height:8px;border-radius:9px;background:rgba(255,255,255,.1);overflow:hidden;margin-top:10px}.pfprog i{display:block;height:100%;width:0;background:var(--grad);transition:width .2s}',
    '.pfthumbs{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.pfthumbs img{width:60px;height:60px;object-fit:contain;border-radius:8px;background:#2a2838}',
    '.pffab{position:fixed;right:18px;bottom:calc(22px + env(safe-area-inset-bottom));z-index:40;width:58px;height:58px;border-radius:50%;background:var(--grad);color:#fff;font-size:30px;font-weight:300;box-shadow:0 14px 30px -10px rgba(214,59,255,.9);display:grid;place-items:center}.pffab.hidden{display:none}',
    '.pfchk{margin-top:6px;font-size:12.5px;color:var(--muted)}.pfchk.ok{color:#7ff0bd}.pfchk.warn{color:#ffd08a}.pfchk summary{cursor:pointer;font-weight:800}.pfchk ul{margin:6px 0 4px 18px}.pfchk li{margin:3px 0}.pfchk small{display:block;opacity:.8}.lnk{text-decoration:underline;font-weight:800;color:inherit}',
    '.pfpre{margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid var(--line);font-size:13px}.pfpre div{margin:3px 0}',
    '.pfnudge{display:block;width:100%;text-align:left;padding:13px 14px;border-radius:16px;margin-bottom:14px;border:1px solid rgba(255,181,71,.5);background:rgba(255,181,71,.08)}.pfnudge b{display:block;font-size:14.5px}.pfnudge span{font-size:12.5px;color:#ffe0a8}'
  ].join('\n');
  document.head.appendChild(css);

  var api = function (a, b, form) { return A.api(a, b, form).then(function (j) { if (j.sets) { P.sets = j.sets; P.jobs = j.jobs; P.sum = j.sum; P.mail = j.mail; P.ai = j.ai || P.ai; badge(); } return j; }); };
  var load = function () { return api('pf_list').then(function () { loaded = true; render(); if (window.SMRJobs && SMRJobs.repaint) SMRJobs.repaint(); }).catch(function (e) { var el = $('pf'); if (el) el.innerHTML = '<div class="plempty">' + esc(e.message) + '</div>'; }); };
  var badge = function () { var c = $('pfcnt'); if (c && P.sum) c.textContent = (P.sum.changes + P.sum.ready) || ''; };
  var byId = function (id) { for (var i = 0; i < P.sets.length; i++) if (P.sets[i].id === id) return P.sets[i]; };
  var tag = function (s) { var t = STATE[s.state] || STATE.draft; return '<span class="ps ' + t[0] + '">' + t[1] + '</span>'; };
  var lastPage = function (it) { var v = it.vers[it.vers.length - 1]; return v && v.pages[0] ? v.pages[0].src : ''; };

  /* ---------- quick checks (free, in the browser) ---------- */
  var RATIO = { 'Roller banner': [[85, 200], [100, 200], [120, 200], [80, 200]], 'Business card': [[85, 55], [55, 55], [90, 50]], 'Poster': [[1, 1.414]], 'Flyer / leaflet': [[1, 1.414], [99, 210]], 'Menu': [[1, 1.414], [99, 210]], 'A-board': [[1, 1.414]], 'Social post': [[1, 1], [4, 5], [9, 16]] };
  var autoChecks = function (kind, pages) {
    var out = [], R = RATIO[kind];
    pages.forEach(function (p, i) {
      var r = p.w / p.h, lab = pages.length > 1 ? 'Page ' + (i + 1) + ': ' : '';
      if (R) { var ok = R.some(function (x) { var a = x[0] / x[1]; return Math.abs(r - a) / a < 0.07 || Math.abs(r - 1 / a) * a < 0.07; });
        if (!ok) out.push('⚠ ' + lab + 'the shape (' + p.w + '×' + p.h + ') doesn\'t match a standard ' + kind.toLowerCase() + '. Check the size before it goes to print.'); }
      if (Math.max(p.w, p.h) < 1200) out.push('⚠ ' + lab + 'quite small (' + Math.max(p.w, p.h) + ' px), so the small print may be hard to read on their phone.');
    });
    if (!out.length) out.push('✓ Shape and size look right' + (R ? ' for a ' + kind.toLowerCase() : ''));
    return out;
  };
  var checksHtml = function (s, it) {
    var lv = it.vers[it.vers.length - 1]; if (!lv) return '';
    var c = lv.checks || {}, warn = (c.auto || []).filter(function (x) { return x.charAt(0) === '⚠'; }).map(function (x) { return x.slice(2); }), ai = c.ai;
    var aiIss = ai && ai.issues ? ai.issues.map(function (x) { return x.what; }) : [];
    var all = warn.concat(aiIss);
    var h = '';
    if (all.length) h += '<details class="pfchk warn"><summary>⚠ ' + all.length + ' thing' + (all.length > 1 ? 's' : '') + ' to look at</summary><ul>' + all.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' + (ai && ai.text ? '<small>Text it read: ' + esc(ai.text.slice(0, 300)) + (ai.text.length > 300 ? '…' : '') + '</small>' : '') + '</details>';
    else if (ai && !ai.err) h += '<div class="pfchk ok">✓ Proof-read: no spelling mistakes or odd details spotted</div>';
    if (P.ai.on && !ai && now() - lv.at < 600) h += '<div class="pfchk">Proof-reading the text…</div>';
    else if (ai && ai.err) h += '<div class="pfchk">Proof-read didn\'t run: ' + esc(ai.err) + ' <button class="lnk" data-pfrecheck="' + s.id + ':' + it.id + '">Try again</button></div>';
    else if (!P.ai.on && !all.length) h += '<div class="pfchk">✓ Shape and size look right · <button class="lnk" data-pfcfg>Turn on the AI spell check</button></div>';
    return h;
  };

  /* ---------- list ---------- */
  var render = function () {
    var el = $('pf'); if (!el || !P.sum) return;
    var S = P.sum;
    var h = '<div class="pfh"><h1>Proofs<small>Nothing gets made until the client signs it off</small></h1><button class="btn sm icon" data-pfcfg aria-label="Proof settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg></button></div>'
      + '<div class="pfstat"><button class="r" data-pff="changes"><b>' + S.changes + '</b><span>Changes asked</span></button><button class="a" data-pff="waiting"><b>' + S.waiting + '</b><span>Waiting</span></button>'
      + '<button class="p" data-pff="ready"><b>' + S.ready + '</b><span>To send</span></button><button class="g" data-pff="done"><b>' + S.done + '</b><span>Signed off</span></button></div>';
    var noProof = ((window.SMRJobs && SMRJobs.needProof) ? SMRJobs.needProof() : []).filter(function (j) { return !P.sets.some(function (s) { return s.job_id === j.id && !s.archived; }); });
    if (noProof.length) h += '<button class="pfnudge" data-pfnew="' + noProof[0].id + '"><b>' + noProof.length + ' agreed job' + (noProof.length > 1 ? 's' : '') + ' with no proof yet</b><span>' + esc(noProof.map(function (j) { return j.client + ' · ' + j.title; }).slice(0, 3).join(', ')) + '. Tap to start one.</span></button>';
    h += '<div class="pfseg">' + [['open', 'Open'], ['changes', 'Changes'], ['waiting', 'Waiting'], ['done', 'Signed off'], ['arch', 'Archive']].map(function (b) { return '<button data-pff="' + b[0] + '" class="' + (filt === b[0] ? 'on' : '') + '">' + b[1] + '</button>'; }).join('') + '</div>';
    var list = P.sets.filter(function (s) {
      if (filt === 'arch') return s.archived; if (s.archived) return false;
      if (filt === 'open') return s.state !== 'done'; if (filt === 'waiting') return s.state === 'waiting' || s.state === 'ready'; return s.state === filt;
    });
    h += list.length ? list.map(function (s) {
      var bits = [tag(s), '<span class="ps">' + s.n.ok + '/' + s.n.total + ' signed off</span>'];
      if (s.sent_at) bits.push('<span class="ps">' + (s.views ? 'Opened ' + ago(s.last_view) : 'Not opened') + '</span>');
      return '<button class="pfc' + (s.state === 'changes' ? ' hot' : '') + '" data-pfo="' + s.id + '"><span class="th" style="' + (s.thumb ? 'background-image:url(\'' + esc(s.thumb) + '\')' : '') + '"></span><span class="tx"><b>' + esc(s.title) + '</b><span class="who">' + esc(s.client) + (s.job ? ' · job: ' + esc(s.job) : '') + '</span><span class="l3">' + bits.join('') + '</span></span></button>';
    }).join('') : '<div class="plempty">' + (filt === 'open' ? 'No proofs open. Tap + to send one.' : 'Nothing here.') + '</div>';
    el.innerHTML = h;
  };

  /* ---------- one proof ---------- */
  var open = function (id) {
    var s = byId(id); if (!s) return;
    var h = '<div class="hd2" style="display:flex;gap:10px;align-items:flex-start"><div style="flex:1;min-width:0"><h2 style="margin:0">' + esc(s.title) + '</h2><div class="sub">' + esc(s.client) + (s.job ? ' · job: ' + esc(s.job) : '') + '</div></div><button class="btn sm" data-pfe="' + s.id + '">Edit</button></div>'
      + '<div style="margin-top:8px">' + tag(s) + '</div>';
    h += '<div class="pfbox"><h3>Client link</h3><div style="font-size:13px;color:var(--muted);margin-bottom:10px">' + (s.sent_at ? 'Sent ' + ago(s.sent_at) + (s.views ? ' · opened ' + s.views + '×, last ' + ago(s.last_view) : ' · not opened yet') : (s.n.total ? 'Ready to send. They check each item, then sign it off with their name, or ask for changes.' : 'Add the designs first (below), then send the link.')) + '</div>'
      + '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm wa" data-pfsend="' + s.id + '"' + (s.n.total ? '' : ' disabled') + '>' + WA + 'Send on WhatsApp</button><button class="btn sm" data-pfcopy="' + s.id + '">Copy message</button>'
      + (s.email ? '<button class="btn sm" data-pfmail="' + s.id + '">Email it</button>' : '') + '<a class="btn sm" href="' + esc(s.url) + '" target="_blank" rel="noopener">See what they see</a></div></div>';
    h += '<div class="pfbox"><h3>Items · ' + s.n.ok + ' of ' + s.n.total + ' signed off</h3>' + (s.items.length ? s.items.map(function (it) {
      var lv = it.vers[it.vers.length - 1], ch = it.acts.filter(function (a) { return a.kind === 'changes'; }).pop(), ok = it.acts.filter(function (a) { return a.kind === 'approve'; }).pop();
      return '<div class="pfi"><span class="th" style="' + (lastPage(it) ? 'background-image:url(\'' + esc(lastPage(it)) + '\')' : '') + '"></span><div class="tx"><b>' + esc(it.name) + '</b><small>' + esc(it.kind || '') + (lv ? (it.kind ? ' · ' : '') + 'version ' + lv.v + ' · ' + lv.pages.length + ' page' + (lv.pages.length > 1 ? 's' : '') : '') + '</small>'
        + '<div style="margin-top:5px"><span class="ps ' + it.status + '">' + (IST[it.status] || it.status) + '</span></div>'
        + (it.status === 'changes' && ch ? '<div class="fb"><b>' + esc(ch.name) + ':</b> ' + esc(ch.text) + '</div>' : '') + (it.status !== 'approved' ? checksHtml(s, it) : '')
        + (it.status === 'approved' && ok ? '<small style="margin-top:5px;color:#7ff0bd">Signed off by ' + esc(ok.name) + ' · ' + dShort(ok.at) + ' · ref ' + esc(ok.ref) + '</small>' : '')
        + '<div class="bt"><button class="btn sm' + (it.status === 'changes' || !lv ? ' pri' : '') + '" data-pfup="' + s.id + ':' + it.id + '">' + (lv ? 'Upload version ' + (lv.v + 1) : 'Upload design') + '</button><button class="btn sm" data-pfren="' + s.id + ':' + it.id + '">Rename</button><button class="btn sm bad" data-pfdel="' + s.id + ':' + it.id + '">×</button></div></div></div>';
    }).join('') : '<div class="pfev">No items yet.</div>') + '<button class="btn sm pri" style="margin-top:10px" data-pfadd="' + s.id + '">+ Add an item</button></div>';
    if (s.note) h += '<div class="pfbox"><h3>Note on their page</h3><div style="font-size:13.5px;white-space:pre-wrap">' + esc(s.note) + '</div></div>';
    h += '<div class="pfbox"><h3>Activity</h3>' + (s.acts.length ? s.acts.map(function (a) {
      var it = s.items.filter(function (x) { return x.id === a.item_id; })[0];
      return '<div class="pfev' + (a.kind === 'approve' ? ' ok' : a.kind === 'changes' ? ' ch' : '') + '"><b>' + dShort(a.at) + '</b> · ' + (a.kind === 'approve' ? esc(a.name) + ' signed off ' + esc(it ? it.name : '') : a.kind === 'changes' ? esc(a.name) + ' asked for changes to ' + esc(it ? it.name : '') + ': “' + esc(a.text) + '”' : esc(a.text)) + '</div>';
    }).join('') : '<div class="pfev">Nothing yet</div>') + '</div>';
    h += '<div class="row" style="gap:8px;margin-top:14px"><button class="btn sm" data-pfarch="' + s.id + '">' + (s.archived ? 'Bring back' : 'Archive') + '</button><button class="btn sm bad" data-pfkill="' + s.id + '">Delete</button></div>';
    A.openSheet('<div class="pfd">' + h + '</div>');
  };

  /* ---------- new / edit proof ---------- */
  var edit = function (id, jobId) {
    var s = id ? byId(id) : null, j = jobId ? P.jobs.filter(function (x) { return x.id === jobId; })[0] : null;
    var o = s || { client: j ? j.client : '', person: j ? j.person : '', phone: j ? j.phone : '', email: j ? j.email : '', area: j ? j.area : 'graphics', title: j ? j.title : '', note: '', job_id: j ? j.id : 0 };
    var jobsOpt = '<option value="0">No job (just a proof)</option>' + P.jobs.map(function (x) { return '<option value="' + x.id + '"' + (x.id === o.job_id ? ' selected' : '') + '>' + esc(x.client + ' · ' + x.title) + '</option>'; }).join('');
    A.openSheet('<form class="plf jbf" id="pfform"><h2>' + (s ? 'Edit proof' : 'New proof') + '</h2>'
      + '<label class="f">Part of a job? (it then can\'t be handed over until signed off)</label><select name="job_id">' + jobsOpt + '</select>'
      + '<label class="f">Client</label><input type="text" name="client" value="' + esc(o.client) + '" placeholder="e.g. Kaya Lounge" autocomplete="off">'
      + '<div class="two2"><div><label class="f">Contact name</label><input type="text" name="person" value="' + esc(o.person) + '" autocomplete="off"></div><div><label class="f">WhatsApp</label><input type="tel" name="phone" value="' + esc(o.phone) + '" placeholder="07…"></div></div>'
      + '<label class="f">Email (optional, for the sign-off receipt)</label><input type="email" name="email" value="' + esc(o.email) + '" autocomplete="off">'
      + '<label class="f">What is it? (they see this)</label><input type="text" name="title" value="' + esc(o.title) + '" placeholder="e.g. Shop sign + menu boards" autocomplete="off">'
      + '<label class="f">Logo on their page</label><div class="chips" data-chips="area">' + ['graphics', 'digital', 'marketing', 'plates'].map(function (a) { return '<button type="button" data-v="' + a + '" class="' + (o.area === a ? 'on' : '') + '">' + a.charAt(0).toUpperCase() + a.slice(1) + '</button>'; }).join('') + '</div>'
      + '<label class="f">Note for them (optional)</label><textarea name="note" placeholder="e.g. Please check the opening times and prices especially">' + esc(o.note) + '</textarea>'
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">' + (s ? 'Save' : 'Next: add the designs') + '</button></div></form>', function (box) {
      var f = box.querySelector('form'), area = o.area;
      box.addEventListener('click', function (e) { var b = e.target.closest('[data-chips] button'); if (!b) return; box.querySelectorAll('[data-chips] button').forEach(function (x) { x.classList.toggle('on', x === b); }); area = b.dataset.v; });
      f.job_id.addEventListener('change', function () { var x = P.jobs.filter(function (q) { return q.id === +f.job_id.value; })[0]; if (!x) return; ['client', 'person', 'phone', 'email', 'title'].forEach(function (k) { if (!f[k].value) f[k].value = x[k] || ''; }); });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        api('pf_save', { id: s ? s.id : 0, job_id: +f.job_id.value, client: f.client.value, person: f.person.value, phone: f.phone.value, email: f.email.value, title: f.title.value, note: f.note.value, area: area })
          .then(function (r) { render(); if (s) open(r.id); else addItem(r.id); }).catch(function (er) { A.toast(er.message, true); });
      });
    });
  };

  /* ---------- items + uploads ---------- */
  var addItem = function (setId) {
    A.openSheet('<form class="plf jbf" id="pfitem"><h2>Add an item</h2><p class="sub">One item = one thing they sign off (e.g. "Roller banner", "Business card"). Front and back go in the same item as pages.</p>'
      + '<label class="f">Name</label><input type="text" name="name" placeholder="e.g. Roller banner" autocomplete="off">'
      + '<label class="f">What is it? (lets them see it at true size)</label><div class="chips" data-chips="kind">' + KINDS.map(function (k) { return '<button type="button" data-v="' + esc(k) + '">' + esc(k) + '</button>'; }).join('') + '</div>'
      + filePick() + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">Upload</button></div></form>', function (box) {
      var f = box.querySelector('form'), kind = '';
      box.addEventListener('click', function (e) { var b = e.target.closest('[data-chips] button'); if (!b) return; box.querySelectorAll('[data-chips] button').forEach(function (x) { x.classList.toggle('on', x === b); }); kind = b.dataset.v; if (!f.name.value) f.name.value = kind === 'Other' ? '' : kind; });
      var files = bindPick(box, function () { return kind; });
      box.addEventListener('click', function (e) { if (e.target.closest('[data-chips] button')) files.refresh(); });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!f.name.value.trim()) { A.toast('Name it first', true); return; }
        if (!files.count()) { A.toast('Add the design (pictures or a PDF)', true); return; }
        api('pf_item', { id: setId, name: f.name.value, kind: kind }).then(function (r) { return files().then(function (pg) { return upload(setId, r.item, pg, '', box); }); }).catch(function (er) { A.toast(er.message, true); });
      });
    });
  };
  var newVersion = function (setId, itemId) {
    var s = byId(setId), it = s.items.filter(function (x) { return x.id === itemId; })[0], lv = it.vers[it.vers.length - 1];
    var ch = it.acts.filter(function (a) { return a.kind === 'changes'; }).pop();
    A.openSheet('<form class="plf jbf"><h2>' + (lv ? 'Version ' + (lv.v + 1) + ' of ' : '') + esc(it.name) + '</h2>'
      + (it.status === 'changes' && ch ? '<div class="jbwarn">They asked: “' + esc(ch.text) + '”</div>' : '')
      + (it.status === 'approved' ? '<div class="jbwarn amb">This is signed off. A new version means they\'ll have to sign it off again.</div>' : '')
      + (lv ? '<label class="f">What changed? (they see this)</label><input type="text" name="note" placeholder="e.g. Phone number fixed, logo bigger" autocomplete="off">' : '<input type="hidden" name="note" value="">')
      + filePick() + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">Upload</button></div></form>', function (box) {
      var f = box.querySelector('form'), files = bindPick(box, function () { return it.kind; });
      f.addEventListener('submit', function (e) { e.preventDefault(); if (!files.count()) { A.toast('Add the design first', true); return; } files().then(function (pg) { upload(setId, itemId, pg, f.note.value, box); }); });
    });
  };
  var filePick = function () {
    return '<label class="f">Design (pictures or PDF; several pictures = pages, e.g. front + back)</label><input type="file" accept="image/*,application/pdf" multiple hidden id="pffile">'
      + '<div class="pfdrop" data-pfpick><b>Choose files</b>or drop them here · JPG, PNG, WebP or PDF</div><div class="pfthumbs" id="pfthumbs"></div><div class="pfpre" id="pfpre" hidden></div><div class="pfprog" id="pfprog" hidden><i></i></div><div class="sub" id="pfstat"></div>';
  };
  /* Files are turned into pages straight away, so you see them and the quick checks before uploading. */
  var bindPick = function (box, kindOf) {
    var pages = [], busy = null, inp = box.querySelector('#pffile'), th = box.querySelector('#pfthumbs'), pre = box.querySelector('#pfpre'), st = box.querySelector('#pfstat');
    var show = function () {
      th.innerHTML = pages.map(function (p) { return '<img src="' + (p.url || (p.url = URL.createObjectURL(p.b))) + '" alt="">'; }).join('');
      var ch = pages.length ? autoChecks(kindOf ? kindOf() : '', pages) : [];
      pre.hidden = !ch.length; pre.innerHTML = '<b style="display:block;margin-bottom:2px">Quick checks</b>' + ch.map(function (x) { return '<div>' + esc(x) + '</div>'; }).join('');
      pages.auto = ch;
    };
    var add = function (fs) {
      var list = [].filter.call(fs, function (f) { return /^image\/|pdf/.test(f.type) || /\.pdf$/i.test(f.name); }); if (!list.length) return;
      busy = toPages(list, function (t) { st.textContent = t; }).then(function (ps) { st.textContent = ''; ps.forEach(function (p) { pages.push(p); }); show(); }).catch(function (e) { st.textContent = ''; A.toast(e.message || 'That file couldn\'t be opened', true); });
    };
    box.querySelector('[data-pfpick]').addEventListener('click', function () { inp.click(); });
    inp.addEventListener('change', function () { add(inp.files); inp.value = ''; });
    var dz = box.querySelector('[data-pfpick]');
    dz.addEventListener('dragover', function (e) { e.preventDefault(); }); dz.addEventListener('drop', function (e) { e.preventDefault(); add(e.dataTransfer.files); });
    var get = function () { return (busy || Promise.resolve()).then(function () { return pages; }); };
    get.count = function () { return pages.length || (busy ? 1 : 0); }; get.refresh = show;
    return get;
  };
  /* Every page becomes a JPEG (max 3000 px; PDFs rendered at ~2400 px), uploaded one by one. */
  var toPages = function (files, stat) {
    var out = [];
    var one = function (f) {
      if (/pdf/.test(f.type) || /\.pdf$/i.test(f.name)) {
        return A.loadPdf().then(function (L) { return f.arrayBuffer().then(function (buf) { return L.getDocument({ data: buf }).promise; }); }).then(function (doc) {
          var ch = Promise.resolve();
          for (var i = 1; i <= Math.min(doc.numPages, 40); i++) (function (i) { ch = ch.then(function () { stat('Reading PDF page ' + i + ' of ' + doc.numPages + '…'); return doc.getPage(i).then(function (pg) {
            var vp0 = pg.getViewport({ scale: 1 }), sc = Math.min(4, 2400 / Math.max(vp0.width, vp0.height)), vp = pg.getViewport({ scale: sc });
            var c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height); var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
            return pg.render({ canvasContext: x, viewport: vp }).promise.then(function () { return blob(c).then(function (b) { out.push({ b: b, w: c.width, h: c.height }); }); });
          }); }); })(i);
          return ch;
        });
      }
      return createImageBitmap(f).then(function (bm) {
        var k = Math.min(1, 3000 / Math.max(bm.width, bm.height)), c = document.createElement('canvas'); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k);
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bm, 0, 0, c.width, c.height);
        return blob(c).then(function (b) { out.push({ b: b, w: c.width, h: c.height }); });
      });
    };
    var blob = function (c) { return new Promise(function (res) { c.toBlob(res, 'image/jpeg', 0.92); }); };
    var ch = Promise.resolve(); files.forEach(function (f) { ch = ch.then(function () { return one(f); }); });
    return ch.then(function () { return out; });
  };
  var upload = function (setId, itemId, pages, note, box) {
    var prog = box.querySelector('#pfprog'), bar = prog.querySelector('i'), st = box.querySelector('#pfstat'), btn = box.querySelector('[type=submit]');
    var stat = function (t) { st.textContent = t; };
    btn.disabled = true; prog.hidden = false;
    if (!pages.length) { btn.disabled = false; A.toast('Nothing to upload', true); return Promise.resolve(); }
    return api('pf_ver_start', { id: setId, item: itemId, note: note }).then(function (r) {
      var ch = Promise.resolve();
      pages.forEach(function (p, i) { ch = ch.then(function () {
        stat('Uploading page ' + (i + 1) + ' of ' + pages.length + '…');
        var fd = new FormData(); fd.append('id', setId); fd.append('ver', r.ver); fd.append('i', i); fd.append('w', p.w); fd.append('h', p.h); fd.append('file', p.b, 'p' + i + '.jpg');
        return A.api('pf_ver_up', null, fd).then(function () { bar.style.width = Math.round((i + 1) / pages.length * 100) + '%'; });
      }); });
      return ch.then(function () { return api('pf_ver_done', { id: setId, ver: r.ver, auto: pages.auto || [] }); });
    }).then(function (j) { render(); A.toast(j && j.checking ? 'Uploaded. Proof-reading it now…' : 'Uploaded'); open(setId); if (j && j.checking) setTimeout(function () { load().then(function () { var sh = document.querySelector('#sheetin .pfd'); if (sh) open(setId); }); }, 12000); })
      .catch(function (er) { btn.disabled = false; stat(''); A.toast(er.message, true); });
  };

  /* ---------- before you send: only shows when there's something worth a second look ---------- */
  var beforeSend = function (s, go) {
    var lines = [];
    s.items.forEach(function (it) {
      if (it.status === 'approved') return;
      var lv = it.vers[it.vers.length - 1]; if (!lv) { lines.push({ t: it.name + ': no design uploaded yet', ck: false }); return; }
      var c = lv.checks || {};
      (c.auto || []).filter(function (x) { return x.charAt(0) === '⚠'; }).forEach(function (x) { lines.push({ t: it.name + ': ' + x.slice(2), ck: true }); });
      ((c.ai && c.ai.issues) || []).forEach(function (x) { lines.push({ t: it.name + ': ' + x.what, ck: true }); });
      var ch = it.acts.filter(function (a) { return a.kind === 'changes'; }).pop();
      if (ch && lv.v > 1 && ch.ver !== lv.id) lines.push({ t: 'Did you do what they asked on ' + it.name + '? “' + ch.text + '”', ck: true });
    });
    if (!lines.length) return go();
    A.openSheet('<h2>Before you send</h2><p class="sub">A quick look at these, then send. Tick each one you\'ve checked.</p><div class="jbaud" style="margin-top:8px">'
      + lines.map(function (l) { return '<label>' + (l.ck ? '<input type="checkbox">' : '<span style="width:20px">•</span>') + '<span>' + esc(l.t) + '</span></label>'; }).join('')
      + '</div><div class="row" style="margin-top:14px;gap:8px"><button class="btn" style="flex:1" data-bsno>Fix it first</button><button class="btn pri" style="flex:1.4" data-bsgo>Send it</button></div>', function (box) {
      box.querySelector('[data-bsno]').addEventListener('click', function () { open(s.id); });
      box.querySelector('[data-bsgo]').addEventListener('click', function () {
        var left = [].filter.call(box.querySelectorAll('input[type=checkbox]'), function (c) { return !c.checked; }).length;
        if (left && !confirm(left + ' not ticked yet. Send anyway?')) return;
        go();
      });
    });
  };
  var aiCfg = function () {
    var a = P.ai || {};
    A.openSheet('<form class="plf jbf"><h2>Proof settings</h2><label class="f">AI spell check (Claude)</label>'
      + (a.on ? '<div class="jbok" style="margin-top:0">✓ On · ' + esc(a.hint) + ' · $' + (a.spent || 0).toFixed(2) + ' used this month of $' + a.cap + '</div><button type="button" class="btn sm bad" style="margin-top:8px" data-aioff>Turn off</button>'
        : '<p class="sub">Paste your Anthropic API key (from platform.claude.com, starts with sk-ant-). Every new proof gets proof-read for spelling and odd details, about a penny or less each. It\'s stored encrypted on your server.</p><input type="password" name="key" placeholder="sk-ant-…" autocomplete="off" style="margin-top:8px">')
      + '<label class="f">Monthly limit ($)</label><input type="number" name="cap" min="1" max="100" step="1" value="' + (a.cap || 5) + '">'
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">Save</button></div></form>', function (box) {
      var f = box.querySelector('form'), off = box.querySelector('[data-aioff]');
      if (off) off.addEventListener('click', function () { api('pf_ai', { key: '' }).then(function () { A.closeSheet(); render(); A.toast('AI spell check off'); }); });
      f.addEventListener('submit', function (e) { e.preventDefault(); var b = { cap: +f.cap.value || 5 }; if (f.key && f.key.value.trim()) b.key = f.key.value.trim();
        api('pf_ai', b).then(function () { A.closeSheet(); render(); A.toast(b.key ? 'AI spell check is on' : 'Saved'); }).catch(function (er) { A.toast(er.message, true); }); });
    });
  };

  /* ---------- clicks ---------- */
  document.addEventListener('click', function (e) {
    var b, inPf = e.target.closest('#pf'), inSheet = e.target.closest('#sheetin');
    if (!inPf && !inSheet && !e.target.closest('[data-pfgo]')) return;
    var pair = function (v) { var p = v.split(':'); return [+p[0], +p[1]]; };
    if ((b = e.target.closest('[data-pfo]'))) return open(+b.dataset.pfo);
    if ((b = e.target.closest('[data-pff]'))) { filt = b.dataset.pff; render(); return; }
    if ((b = e.target.closest('[data-pfnew]'))) return edit(0, +b.dataset.pfnew);
    if ((b = e.target.closest('[data-pfe]'))) return edit(+b.dataset.pfe);
    if ((b = e.target.closest('[data-pfadd]'))) return addItem(+b.dataset.pfadd);
    if ((b = e.target.closest('[data-pfup]'))) { var q = pair(b.dataset.pfup); return newVersion(q[0], q[1]); }
    if ((b = e.target.closest('[data-pfren]'))) { var r = pair(b.dataset.pfren), s = byId(r[0]), it = s.items.filter(function (x) { return x.id === r[1]; })[0]; var n = prompt('New name', it.name); if (!n) return; api('pf_item', { id: s.id, item: it.id, name: n, kind: it.kind }).then(function () { render(); open(s.id); }); return; }
    if ((b = e.target.closest('[data-pfdel]'))) { var d = pair(b.dataset.pfdel); if (!confirm('Remove this item and all its versions?')) return; api('pf_item_del', { id: d[0], item: d[1] }).then(function () { render(); open(d[0]); }); return; }
    if ((b = e.target.closest('[data-pfsend]'))) { var s1 = byId(+b.dataset.pfsend); beforeSend(s1, function () { window.open(A.waUrl(s1.msg, s1.phone), '_blank'); api('pf_sent', { id: s1.id }).then(function () { render(); open(s1.id); }); }); return; }
    if ((b = e.target.closest('[data-pfcopy]'))) { var s2 = byId(+b.dataset.pfcopy); beforeSend(s2, function () { A.copy(s2.msg, 'Message copied'); api('pf_sent', { id: s2.id }).then(function () { render(); open(s2.id); }); }); return; }
    if ((b = e.target.closest('[data-pfmail]'))) { var s3 = byId(+b.dataset.pfmail); beforeSend(s3, function () { api('pf_sent', { id: s3.id, email: 1 }).then(function () { A.toast('Emailed to ' + s3.email); render(); open(s3.id); }).catch(function (er) { A.toast(er.message, true); }); }); return; }
    if (e.target.closest('[data-pfcfg]')) return aiCfg();
    if ((b = e.target.closest('[data-pfrecheck]'))) { var rc = pair(b.dataset.pfrecheck); b.textContent = 'Checking…'; api('pf_check', { id: rc[0], item: rc[1] }).then(function () { open(rc[0]); }).catch(function (er) { A.toast(er.message, true); }); return; }
    if ((b = e.target.closest('[data-pfarch]'))) { var s4 = byId(+b.dataset.pfarch); api('pf_archive', { id: s4.id, undo: s4.archived ? 1 : 0 }).then(function () { A.closeSheet(); render(); }); return; }
    if ((b = e.target.closest('[data-pfkill]'))) { if (!confirm('Delete this proof and its sign-off record for good? Keep it (Archive) if you might need the proof of sign-off later.')) return; api('pf_delete', { id: +b.dataset.pfkill }).then(function () { A.closeSheet(); render(); }); return; }
  });

  var fab = document.createElement('button'); fab.className = 'pffab hidden'; fab.setAttribute('aria-label', 'New proof'); fab.textContent = '+';
  fab.addEventListener('click', function () { edit(0); });
  document.body.appendChild(fab);

  window.SMRProofs = {
    show: function () { fab.classList.remove('hidden'); if (!loaded) load(); else { render(); load(); } },
    hide: function () { fab.classList.add('hidden'); },
    load: load, newFor: function (jobId) { location.hash = '#proofs'; setTimeout(function () { edit(0, jobId); }, 300); },
    forJob: function (jobId) { return P.sets.filter(function (s) { return s.job_id === jobId && !s.archived; }); },
    sum: function () { return P.sum; }
  };
  var tp = $('tab-proofs'); if (tp && !tp.classList.contains('hidden')) window.SMRProofs.show(); else load();
  setInterval(function () { if (!document.hidden) load(); }, 120000);
})();
