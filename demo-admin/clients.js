/* SMR Admin → Clients (one page per client: monthly plan, invoices, care & renewals, jobs, proofs, designs, demos, ideas)
   and Leads (quick add from a line of text, follow-ups). Talks to api.php?a=cl_* (demo-lib/clients.php).
   Uses the Jobs styles (.jb*, .st) from jobs.js. Nothing here sends anything by itself: every message is ready for the owner to send. */
(function () {
  var A = window.SMRA, $ = function (id) { return document.getElementById(id); }, esc = A.esc;
  var C = { clients: [], plans: [], care: [], invoices: [], leads: [], sum: null, cfg: {}, ai: {}, types: {}, lstatus: {}, lsources: {}, areas: {}, care_tpl: {} };
  var loaded = false, filt = 'all', lfilt = 'follow', q = '', openCid = 0;
  var DAY = 86400, now = function () { return Math.floor(Date.now() / 1000); };
  var money = function (p) { p = +p || 0; return '£' + (p / 100).toLocaleString('en-GB', { minimumFractionDigits: p % 100 ? 2 : 0, maximumFractionDigits: 2 }); };
  var pounds = function (p) { return p ? (p / 100).toFixed(2).replace(/\.00$/, '') : ''; };
  var ymd = function (t) { if (!t) return ''; var d = new Date(t * 1000); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var fromYmd = function (s, h) { if (!s) return 0; var p = s.split('-'); return Math.floor(new Date(+p[0], +p[1] - 1, +p[2], h || 10, 0, 0) / 1000); };
  var dShort = function (t) { return t ? new Date(t * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: new Date(t * 1000).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined }) : ''; };
  var when = function (t) { if (!t) return ''; var d0 = new Date(); d0.setHours(0, 0, 0, 0); var d = Math.floor((t * 1000 - d0) / 864e5); return d < -1 ? Math.abs(d) + ' days ago' : d === -1 ? 'yesterday' : d === 0 ? 'today' : d === 1 ? 'tomorrow' : d < 7 ? new Date(t * 1000).toLocaleDateString('en-GB', { weekday: 'long' }) : dShort(t); };
  var first = function (n) { return String(n || '').split(/[\s,(]/)[0] || 'there'; };
  var api = function (a, b) {
    b = b || {}; if (openCid && !b.cid && a !== 'cl_list') b.cid = openCid;
    return A.api(a, b).then(function (j) { if (j.clients) { ['clients', 'plans', 'care', 'invoices', 'leads', 'sum', 'cfg', 'ai', 'types', 'lstatus', 'lsources', 'areas', 'care_tpl'].forEach(function (k) { C[k] = j[k]; }); badge(); } return j; });
  };
  var ICO = {
    wa: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>'
  };

  var css = document.createElement('style');
  css.textContent = [
    '#cl .jbh,#ld .jbh{display:flex;align-items:center;gap:10px;margin-bottom:14px}#cl .jbh h1,#ld .jbh h1{flex:1;margin:0}#cl .jbh small,#ld .jbh small{display:block;color:var(--muted);font:600 13px Manrope,sans-serif;margin-top:2px}',
    '.clsrch{width:100%;height:44px;border-radius:13px;border:1px solid var(--line);background:rgba(255,255,255,.03);color:var(--ink);padding:0 14px;font-size:15px;outline:0;margin-bottom:10px}',
    '.clc{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:13px 14px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.03);margin-bottom:8px}',
    '.clc .av{width:40px;height:40px;border-radius:12px;flex:none;display:grid;place-items:center;font:800 16px Sora,sans-serif;color:#fff;background:linear-gradient(135deg,#5b5bff,#d63bff)}',
    '.clc .tx{flex:1;min-width:0}.clc b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.clc span{font-size:12.5px;color:var(--muted)}.clc em{font-style:normal;font:800 14px Sora,sans-serif;color:#cfb4ff;white-space:nowrap}',
    '.clc .dots{display:flex;gap:4px;margin-top:4px;flex-wrap:wrap}.clc .dots i{font-style:normal;font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:999px}.clc .dots .r{background:rgba(255,84,112,.18);color:#ff9db0}.clc .dots .a{background:rgba(255,181,71,.16);color:#ffd08a}.clc .dots .g{background:rgba(61,220,151,.14);color:#7ff0bd}',
    '.clbox{border-radius:18px;padding:12px 14px;margin-bottom:12px;border:1px solid var(--line);background:rgba(255,255,255,.025)}.clbox h3{font:800 11px Manrope,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0 0 4px;display:flex;align-items:center;gap:8px}.clbox h3 i{flex:1}',
    '.clbox.red{border-color:rgba(255,84,112,.5);background:linear-gradient(160deg,rgba(255,84,112,.14),rgba(255,140,60,.07))}.clbox.red h3{color:#ffc2cc}.clbox.amb{border-color:rgba(255,181,71,.45);background:rgba(255,181,71,.07)}.clbox.amb h3{color:#ffe0a8}.clbox.grn{border-color:rgba(61,220,151,.35);background:rgba(61,220,151,.06)}',
    '.clr{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line)}.clbox h3+.clr,.clr:first-child{border-top:0}.clr .tx{flex:1;min-width:0}.clr b{display:block;font-size:14px}.clr span{font-size:12.5px;color:var(--muted)}.clr .am{font:800 14.5px Sora,sans-serif;white-space:nowrap}',
    '.clr .bt{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.clr .btn.sm{height:34px;padding:0 11px;font-size:12.5px}.clr .btn svg{width:15px;height:15px}',
    '.clr.bad span{color:#ff9db0;font-weight:700}.clr.due span{color:#ffd08a;font-weight:700}.clr.ok span{color:#7ff0bd}.clr.off{opacity:.55}',
    '.clhd{display:flex;gap:12px;align-items:flex-start}.clhd .av{width:52px;height:52px;border-radius:15px;display:grid;place-items:center;font:800 20px Sora,sans-serif;color:#fff;background:linear-gradient(135deg,#5b5bff,#d63bff);flex:none}.clhd h2{margin:0;font-size:20px}.clhd .who{color:var(--muted);font-size:13.5px}',
    '.clact{display:flex;gap:6px;margin:12px 0 4px;flex-wrap:wrap}.clact .btn{height:38px;font-size:13px;padding:0 12px}.clact .btn svg{width:16px;height:16px}',
    '.clstat{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}.clstat div{padding:10px 6px;border-radius:13px;border:1px solid var(--line);text-align:center;background:rgba(255,255,255,.02)}.clstat b{display:block;font:800 16px Sora,sans-serif}.clstat span{font-size:11px;color:var(--muted);font-weight:700}',
    '.clidea{display:flex;gap:9px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--line);font-size:13.5px}.clidea:first-of-type{border-top:0}.clidea:before{content:"✦";color:#d9a6ff;font-weight:800}',
    '.clsec{display:flex;align-items:center;gap:8px;margin:18px 2px 8px;font:800 12px Manrope,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}.clsec i{flex:1;height:1px;background:var(--line)}.clsec .btn{height:30px;font-size:12px;padding:0 10px;letter-spacing:0;text-transform:none}',
    '.clplan{border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin-bottom:10px}.clplan .t{display:flex;align-items:baseline;gap:8px}.clplan .t b{flex:1;font-size:15px}.clplan .t em{font-style:normal;font:800 16px Sora,sans-serif}',
    '.clgrey{opacity:.5;pointer-events:none;filter:grayscale(1)}.clsoon{font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:999px;background:rgba(255,255,255,.1);margin-left:6px}',
    '.clmini{font-size:13px;padding:8px 0;border-top:1px solid var(--line);display:flex;gap:8px;align-items:center}.clmini:first-of-type{border-top:0}.clmini .tx{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.clmini small{color:var(--muted)}',
    '.cltpl label{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--line);font-size:14px}.cltpl label:first-child{border-top:0}.cltpl input[type=checkbox]{width:20px;height:20px;flex:none;margin-top:1px}.cltpl small{display:block;color:var(--muted);font-size:12px}',
    '.ldadd{border-radius:18px;padding:14px;margin-bottom:12px;background:linear-gradient(140deg,rgba(91,91,255,.16),rgba(214,59,255,.12));border:1px solid rgba(214,59,255,.4)}.ldadd textarea{width:100%;min-height:74px;border-radius:13px;border:1px solid var(--line);background:#0c0c16;color:var(--ink);padding:12px;font:15px Manrope,sans-serif;outline:0;resize:vertical}.ldadd .k{font:800 11px Manrope,sans-serif;letter-spacing:.12em;color:#e3c8ff;margin-bottom:8px}.ldadd small{display:block;color:var(--muted);font-size:12px;margin-top:8px}',
    '.ldc{border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin-bottom:8px;background:rgba(255,255,255,.03)}.ldc.due{border-color:rgba(255,181,71,.55)}.ldc .l1{display:flex;gap:8px;align-items:baseline}.ldc .l1 b{flex:1;font-size:15px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ldc .l1 em{font-style:normal;font:800 14px Sora,sans-serif;color:#cfb4ff}',
    '.ldc .wh{font-size:13px;color:var(--muted);margin-top:2px}.ldc .nx{font-size:12.5px;font-weight:700;margin-top:6px;color:var(--muted)}.ldc.due .nx{color:#ffd08a}.ldc .bt{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}.ldc .bt .btn{height:34px;font-size:12.5px;padding:0 11px}.ldc .bt svg{width:15px;height:15px}',
    '.st.new{background:rgba(155,108,255,.2);color:#dcc8ff}.st.talking{background:rgba(37,166,255,.18);color:#a9dcff}.st.quoted{background:rgba(255,181,71,.16);color:#ffd08a}.st.won{background:rgba(61,220,151,.16);color:#7ff0bd}.st.lost,.st.later{color:var(--muted)}',
    '.ldq{margin-top:12px;padding:12px;border-radius:14px;background:rgba(255,181,71,.08);border:1px solid rgba(255,181,71,.35)}.ldq b{font-size:12px;letter-spacing:.08em;color:#ffe0a8}.ldq div{font-size:13.5px;margin-top:4px}'
  ].join('\n');
  document.head.appendChild(css);

  var badge = function () {
    var S = C.sum; if (!S) return;
    var c = $('clcnt'); if (c) c.textContent = (S.bills.length + S.inv_unsent + S.care_bad + S.care_due) || '';
    var l = $('ldcnt'); if (l) l.textContent = S.leads_due || '';
  };
  var byId = function (arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; };
  var initials = function (n) { return String(n || '?').replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase() || '?'; };
  var chips = function (name, opts, val) { return '<div class="chips" data-chips="' + name + '">' + Object.keys(opts).map(function (k) { return '<button type="button" data-v="' + esc(k) + '" class="' + (String(val) === String(k) ? 'on' : '') + '">' + esc(opts[k]) + '</button>'; }).join('') + '</div>'; };
  var bindChips = function (box, val) { box.querySelectorAll('[data-chips]').forEach(function (g) { g.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; g.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); val[g.dataset.chips] = b.dataset.v; if (val._on) val._on(g.dataset.chips); }); }); };
  var wa = function (text, phone) { window.open(A.waUrl(text, phone), '_blank'); };

  /* ---------- shared rows (used on the list and on a client page) ---------- */
  var billRow = function (p, b, showClient) {
    var cls = b.state === 'grace' || b.state === 'late' ? 'bad' : b.state === 'paid' ? 'ok' : b.state === 'soon' ? 'due' : '';
    var bt = '';
    if (b.state === 'late' || b.state === 'grace' || b.state === 'soon') {
      bt += '<button class="btn sm wa" data-bwa="' + p.id + ':' + b.id + '">' + ICO.wa + (b.wa_due ? 'Send reminder' : 'Remind') + '</button>';
      bt += '<button class="btn sm" data-bpaid="' + b.id + '">Paid</button>';
      if (b.state === 'grace') bt += '<button class="btn sm" data-bmore="' + b.id + '">+7 days</button>' + (p.status !== 'paused' ? '<button class="btn sm bad" data-ppause="' + p.id + '">Pause service</button>' : '');
      else bt += '<button class="btn sm" data-bmenu="' + b.id + '">⋯</button>';
    }
    return '<div class="clr ' + cls + '"><div class="tx"><b>' + (showClient ? esc(p.client) + ' · ' : '') + esc(b.month) + '</b><span>' + esc(b.label) + (b.state === 'grace' ? '. Your call: more time or pause.' : '') + '</span></div><div class="am">' + money(b.amount) + '</div></div>'
      + (bt ? '<div class="clr" style="border-top:0;padding-top:0"><div class="bt" style="flex:1">' + bt + '</div></div>' : '');
  };
  var invRow = function (i, showClient) {
    return '<div class="clr"><div class="tx"><b>' + esc(i.no) + ' · ' + (showClient ? esc(i.client) : esc(i.title || '')) + '</b><span>' + (i.sent_at ? (i.sent_via === 'skipped' ? 'Not sent (marked done)' : 'Sent ' + dShort(i.sent_at) + ' by ' + i.sent_via) + (i.views ? ' · opened ' + i.views + '×' : '') : 'Paid ' + dShort(i.paid_at) + ' · not sent yet') + '</span></div><div class="am">' + money(i.total) + '</div></div>'
      + '<div class="clr" style="border-top:0;padding-top:0"><div class="bt" style="flex:1"><button class="btn sm wa" data-iwa="' + i.id + '">' + ICO.wa + 'WhatsApp</button>' + (i.email ? '<button class="btn sm" data-imail="' + i.id + '">' + ICO.mail + 'Email</button>' : '') + '<button class="btn sm" data-icopy="' + i.id + '">Copy link</button><a class="btn sm" href="' + esc(i.url) + '" target="_blank" rel="noopener">View</a>' + (!i.sent_at ? '<button class="btn sm" data-iskip="' + i.id + '" title="Mark as done without sending">✓</button>' : '') + '</div></div>';
  };
  var careRow = function (k, showClient) {
    var bt = '';
    if (k.kind === 'auto') bt += '<button class="btn sm" data-krun="' + k.id + '">Check now</button>';
    if (k.kind !== 'auto' || k.tpl === 'domain') bt += '<button class="btn sm pri" data-kdone="' + k.id + '">' + (k.kind === 'renew' || k.tpl === 'domain' ? 'Renewed' : 'Done') + '</button>';
    if (k.msg) bt += '<button class="btn sm wa" data-kwa="' + k.id + '">' + ICO.wa + (k.tpl === 'content' || k.tpl === 'holiday' ? 'Ask them' : 'Tell them') + '</button>';
    if (k.state === 'due' || k.state === 'bad') bt += '<button class="btn sm" data-ksnz="' + k.id + '">Later</button>';
    bt += '<button class="btn sm" data-kedit="' + k.id + '">⋯</button>';
    return '<div class="clr ' + k.state + '"><div class="tx"><b>' + (showClient ? esc(k.client) + ' · ' : '') + esc(k.title) + '</b><span>' + esc(k.label) + (k.kind === 'auto' ? ' · automatic' : '') + '</span>' + (k.tip && !showClient ? '<small style="display:block;color:var(--muted);font-size:11.5px;margin-top:2px">' + esc(k.tip) + '</small>' : '') + '</div></div>'
      + '<div class="clr" style="border-top:0;padding-top:0"><div class="bt" style="flex:1">' + bt + '</div></div>';
  };

  /* ---------- Clients list ---------- */
  var render = function () {
    var el = $('cl'); if (!el || !C.sum) return;
    var S = C.sum, t = now();
    var h = '<div class="jbh"><h1>Clients<small>' + (S.monthly ? money(S.monthly) + ' a month from ' + S.plans + ' plan' + (S.plans > 1 ? 's' : '') : C.clients.length + ' clients') + '</small></h1><button class="btn sm icon" data-clcfg aria-label="Invoice & billing settings">' + ICO.gear + '</button></div>';
    h += '<div class="jbstat"><button class="p" data-clf="monthly"><b>' + money(S.monthly) + '</b><span>A month</span></button><button class="r" data-clf="owe"><b>' + S.bills.length + '</b><span>Unpaid months</span></button>'
      + '<button class="a" data-goinv><b>' + S.inv_unsent + '</b><span>Invoices to send</span></button><button class="g" data-clf="care"><b>' + (S.care_due + S.care_bad) + '</b><span>Care due</span></button></div>';
    // 1) monthly payments to chase
    var late = [];
    C.plans.forEach(function (p) { p.bills.forEach(function (b) { if (b.state === 'late' || b.state === 'grace') late.push([p, b]); }); });
    if (late.length) h += '<div class="clbox red"><h3>Monthly payments to chase<i></i></h3>' + late.map(function (x) { return billRow(x[0], x[1], true); }).join('') + '</div>';
    // 2) invoices to send
    var inv = C.invoices.filter(function (i) { return !i.sent_at; });
    if (inv.length) h += '<div class="clbox amb" id="clinv"><h3>Invoices ready to send<i></i></h3>' + inv.slice(0, 8).map(function (i) { return invRow(i, true); }).join('') + '</div>';
    // 3) care due
    var care = C.care.filter(function (k) { return k.state === 'due' || k.state === 'bad'; });
    if (care.length) h += '<div class="clbox amb"><h3>Care & renewals due<i></i></h3>' + care.map(function (k) { return careRow(k, true); }).join('') + '</div>';
    if (!C.cfg.stripe) h += '<button class="jbtoday amb" data-gojobcfg><div class="tx"><b>Card payments are off</b><span>Monthly plans by card need your Stripe key (Jobs ⚙). Cash plans work now.</span></div></button>';
    h += '<input class="clsrch" type="search" placeholder="Search clients" value="' + esc(q) + '" id="clq">';
    h += '<div class="jbseg">' + [['all', 'All'], ['monthly', 'Monthly'], ['owe', 'Owe'], ['care', 'Care due'], ['past', 'Past']].map(function (b) { return '<button data-clf="' + b[0] + '" class="' + (filt === b[0] ? 'on' : '') + '">' + b[1] + '</button>'; }).join('') + '</div>';
    var list = C.clients.filter(function (c) {
      if (q && (c.name + ' ' + c.person + ' ' + c.phone).toLowerCase().indexOf(q.toLowerCase()) < 0) return false;
      if (filt === 'past') return c.status !== 'active';
      if (c.status !== 'active' && !q) return false;
      if (filt === 'monthly') return c.monthly > 0;
      if (filt === 'owe') return c.problem > 0;
      if (filt === 'care') return c.care_due > 0;
      return true;
    });
    h += list.length ? list.map(function (c) {
      var dots = (c.problem ? '<i class="r">£ unpaid</i>' : '') + (c.care_due ? '<i class="a">' + c.care_due + ' care due</i>' : '') + (c.monthly ? '<i class="g">monthly</i>' : '');
      return '<button class="clc" data-cl="' + c.id + '"><div class="av">' + esc(initials(c.name)) + '</div><div class="tx"><b>' + esc(c.name) + '</b><span>' + esc([c.person, C.types[c.type] && c.type !== 'other' ? C.types[c.type] : ''].filter(Boolean).join(' · ') || c.phone || 'No details yet') + '</span>' + (dots ? '<div class="dots">' + dots + '</div>' : '') + '</div>' + (c.monthly ? '<em>' + money(c.monthly) + '/mo</em>' : '') + '</button>';
    }).join('') : '<div class="plempty">' + (q ? 'No client matches "' + esc(q) + '".' : 'Nobody here yet.') + '</div>';
    h += '<p class="sub" style="text-align:center;margin:14px 0 80px">Everyone from Jobs, Proofs and Designs is added here by themselves.</p>';
    el.innerHTML = h;
    var qi = $('clq'); if (qi) qi.addEventListener('input', function () { q = qi.value; var pos = qi.selectionStart; render(); var n = $('clq'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} });
  };

  /* ---------- one client ---------- */
  var page = function (cid) {
    openCid = cid;
    return api('cl_list', { cid: cid }).then(function (j) { if (j.page) showPage(j.page); });
  };
  var showPage = function (P) {
    var c = P.client, s = P.stats, t = now();
    var h = '<div class="clp"><div class="clhd"><div class="av">' + esc(initials(c.name)) + '</div><div style="flex:1;min-width:0"><h2>' + esc(c.name) + '</h2><div class="who">' + esc([c.person, C.types[c.type] && c.type !== 'other' ? C.types[c.type] : '', c.status !== 'active' ? (c.status === 'past' ? 'Past client' : 'Archived') : ''].filter(Boolean).join(' · ')) + '</div></div><button class="btn sm" data-cedit>Edit</button></div>';
    h += '<div class="clact">' + (c.phone ? '<button class="btn sm wa" data-cwa>' + ICO.wa + 'WhatsApp</button><a class="btn sm" href="tel:' + esc(c.phone.replace(/\s/g, '')) + '">' + ICO.phone + 'Call</a>' : '<button class="btn sm" data-cedit>+ Add their number</button>')
      + (c.email ? '<a class="btn sm" href="mailto:' + esc(c.email) + '">' + ICO.mail + 'Email</a>' : '') + (c.website ? '<a class="btn sm" href="' + esc(/^https?:/.test(c.website) ? c.website : 'https://' + c.website) + '" target="_blank" rel="noopener">' + ICO.globe + 'Site</a>' : '') + '</div>';
    h += '<div class="clstat"><div><b>' + money(s.spent) + '</b><span>Paid you</span></div><div><b style="' + (s.owed ? 'color:#ff9db0' : '') + '">' + money(s.owed) + '</b><span>Owes</span></div><div><b>' + (s.monthly ? money(s.monthly) : '–') + '</b><span>A month</span></div>'
      + '<div><b>' + s.jobs + '</b><span>Jobs</span></div><div><b>' + (s.on_time === null ? '–' : s.on_time + '%') + '</b><span>Paid on time</span></div><div><b>' + (s.first ? dShort(s.first) : '–') + '</b><span>Client since</span></div></div>';
    if (P.ideas.length) h += '<div class="clbox"><h3>What to offer them next<i></i></h3>' + P.ideas.map(function (x) { return '<div class="clidea">' + esc(x.t) + '</div>'; }).join('') + '</div>';
    if (c.notes) h += '<div class="clbox"><h3>Notes<i></i></h3><div style="font-size:13.5px;white-space:pre-wrap">' + esc(c.notes) + '</div></div>';

    // Monthly plan
    h += '<div class="clsec">Monthly plan<i></i><button class="btn sm" data-padd>+ Plan</button></div>';
    h += P.plans.length ? P.plans.map(function (p) {
      var stc = p.status === 'active' ? 'done' : p.status === 'paused' ? 'bad' : p.status === 'ended' ? 'cancelled' : 'agree';
      var stl = { active: 'Active', paused: 'Paused (unpaid)', ended: 'Ended', draft: 'Not sent yet', sent: 'Waiting for them to set up' }[p.status] || p.status;
      var x = '<div class="clplan"><div class="t"><b>' + esc(p.title) + '</b><em>' + money(p.amount) + '/mo</em></div><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><span class="st ' + stc + '">' + stl + '</span><span class="st">' + (p.method === 'card' ? (p.card_set ? 'Card · Stripe' : 'Card') : 'Cash · around the ' + p.day + (['th', 'st', 'nd', 'rd'][(p.day % 100 > 10 && p.day % 100 < 14) ? 0 : (p.day % 10 < 4 ? p.day % 10 : 0)]) ) + '</span><span class="st">' + p.grace + '-day grace</span></div>';
      if (p.method === 'card' && !p.card_set && p.status !== 'ended') x += '<div class="clr" style="border-top:0"><div class="tx"><span>' + (p.status === 'draft' ? 'Send them the link to set up their card.' : 'Link sent. It turns Active once they\'ve set it up.') + '</span></div></div><div class="bt clact" style="margin-top:0"><button class="btn sm wa" data-psend="' + p.id + '">' + ICO.wa + 'Send set-up link</button><button class="btn sm" data-pcopy="' + p.id + '">Copy link</button><a class="btn sm" href="' + esc(p.url) + '" target="_blank" rel="noopener">See it</a></div>';
      if (p.bills.length) x += p.bills.slice(0, 6).map(function (b) { return billRow(p, b, false); }).join('');
      else if (p.status === 'active') x += '<div class="clr" style="border-top:0"><div class="tx"><span>' + (p.method === 'cash' ? 'The first month shows up 3 days before the ' + p.day + 'th. ' : 'Stripe takes the money each month; it shows here once it has.') + '</span></div>' + (p.method === 'cash' ? '<button class="btn sm" data-badd="' + p.id + '">Add this month</button>' : '') + '</div>';
      x += '<div class="clact">' + (p.status === 'active' ? '<button class="btn sm" data-ppause="' + p.id + '">Pause</button>' : p.status === 'paused' ? '<button class="btn sm pri" data-presume="' + p.id + '">Resume</button>' : '') + (p.status !== 'ended' ? '<button class="btn sm" data-pedit="' + p.id + '">Edit</button><button class="btn sm bad" data-pend="' + p.id + '">End plan</button>' : '') + (p.method === 'card' && p.card_set ? '<button class="btn sm" data-psync="' + p.id + '">Check Stripe</button>' : '') + '</div>';
      return x + '</div>';
    }).join('') : '<div class="clbox"><div style="font-size:13.5px;color:var(--muted)">No monthly plan. Apps, websites and social media clients usually go on one.</div></div>';
    h += '<div class="clbox clgrey"><div style="font-size:13.5px">Commission deals<span class="clsoon">Coming soon</span></div><div style="font-size:12px;color:var(--muted);margin-top:2px">For apps and sites you take a % on. Track these separately for now.</div></div>';

    // Care & renewals
    h += '<div class="clsec">Care &amp; renewals<i></i><button class="btn sm" data-kadd>+ Checks</button></div>';
    h += P.care.length ? '<div class="clbox">' + P.care.map(function (k) { return careRow(k, false); }).join('') + '</div>' : '<div class="clbox"><div style="font-size:13.5px;color:var(--muted)">No checks yet. Add domain, SSL and up-time (automatic) plus monthly security and spot checks for anyone with a site or app.</div></div>';

    // Invoices
    h += '<div class="clsec">Invoices<i></i><button class="btn sm" data-inew>+ Invoice</button></div>';
    h += P.invoices.length ? '<div class="clbox">' + P.invoices.slice(0, 12).map(function (i) { return invRow(i, false); }).join('') + '</div>' : '<div class="clbox"><div style="font-size:13.5px;color:var(--muted)">Invoices are made by themselves when they pay. Nothing yet.</div></div>';

    // Jobs, proofs, designs, demos
    h += '<div class="clsec">Jobs<i></i><button class="btn sm" data-jnew>+ Job</button></div>';
    h += P.jobs.length ? '<div class="clbox">' + P.jobs.map(function (j) { return '<div class="clmini"><div class="tx"><b style="font-size:13.5px">' + esc(j.title) + '</b><br><small>' + dShort(j.created) + ' · ' + esc(j.label) + '</small></div><b>' + money(j.total) + '</b></div>'; }).join('') + '<button class="btn sm" style="margin-top:8px" data-gojobs>Open Jobs</button></div>' : '<div class="clbox"><div style="font-size:13.5px;color:var(--muted)">No jobs yet.</div></div>';
    if (P.proofs.length) h += '<div class="clsec">Proofs<i></i></div><div class="clbox">' + P.proofs.map(function (x) { return '<div class="clmini"><div class="tx">' + esc(x.title) + ' <small>· ' + dShort(x.created) + '</small></div><span class="st ' + (x.state === 'done' ? 'done' : x.state === 'changes' ? 'bad' : 'agree') + '">' + esc({ done: 'Signed off', changes: 'Changes asked', waiting: 'Waiting', ready: 'To send', draft: 'Draft' }[x.state] || x.state) + '</span></div>'; }).join('') + '</div>';
    if (P.designs.length) h += '<div class="clsec">Design links<i></i></div><div class="clbox">' + P.designs.map(function (x) { return '<div class="clmini"><div class="tx">' + esc(x.title || 'Designs') + ' <small>· ' + dShort(x.created) + (x.archived ? ' · ended' : '') + '</small></div><small>opened ' + x.views + '×</small></div>'; }).join('') + '</div>';
    if (P.demos.length) h += '<div class="clsec">Demo links<i></i></div><div class="clbox">' + P.demos.map(function (x) { return '<div class="clmini"><div class="tx">' + esc(x.label) + ' <small>· ' + dShort(x.created) + '</small></div><small>' + (x.views ? 'opened ' + x.views + '×' : 'not opened') + '</small></div>'; }).join('') + '</div>';
    if (P.leads.length) h += '<div class="clsec">From leads<i></i></div><div class="clbox">' + P.leads.map(function (l) { return '<div class="clmini"><div class="tx">' + esc(l.what || l.business || l.name) + '</div><small>' + dShort(l.created) + '</small></div>'; }).join('') + '</div>';
    // Activity
    if (P.log.length) h += '<div class="clsec">Activity<i></i></div><div class="clbox">' + P.log.slice(0, 15).map(function (e) { return '<div class="jbev"><b>' + dShort(e.at) + '</b> · ' + esc(e.what) + '</div>'; }).join('') + '</div>';
    h += '<div class="clact" style="margin:16px 0 6px">' + (c.status === 'active' ? '<button class="btn sm" data-cst="past">Mark as past client</button>' : '<button class="btn sm" data-cst="active">Make active again</button>') + '<button class="btn sm bad" data-cdel>Delete</button></div></div>';
    A.openSheet(h, function (box) { box.__page = P; });
    PAGE = P;
  };
  var PAGE = null;

  /* ---------- forms ---------- */
  var editClient = function (c) {
    c = c || { name: '', person: '', phone: '', email: '', type: 'food', address: '', website: '', instagram: '', notes: '' };
    var val = { type: c.type || 'other' };
    A.openSheet('<form class="plf jbf"><h2>' + (c.id ? 'Edit client' : 'New client') + '</h2>'
      + '<label class="f">Business / charity / person</label><input type="text" name="name" value="' + esc(c.name) + '" placeholder="e.g. Kaya Lounge" autocomplete="off">'
      + '<div class="two2"><div><label class="f">Contact name</label><input type="text" name="person" value="' + esc(c.person) + '" autocomplete="off"></div><div><label class="f">WhatsApp</label><input type="tel" name="phone" value="' + esc(c.phone) + '" placeholder="07…"></div></div>'
      + '<label class="f">Email</label><input type="email" name="email" value="' + esc(c.email) + '" placeholder="for invoices" autocomplete="off">'
      + '<label class="f">Type of business</label>' + chips('type', C.types, val.type)
      + '<label class="f">Website or app address</label><input type="text" name="website" value="' + esc(c.website) + '" placeholder="e.g. kayalounge.co.uk" autocomplete="off">'
      + '<label class="f">Instagram</label><input type="text" name="instagram" value="' + esc(c.instagram) + '" placeholder="@…" autocomplete="off">'
      + '<label class="f">Address (shows on invoices)</label><textarea name="address" placeholder="optional">' + esc(c.address) + '</textarea>'
      + '<label class="f">Notes (only you)</label><textarea name="notes">' + esc(c.notes) + '</textarea>'
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">Save</button></div></form>', function (box) {
      bindChips(box, val);
      var f = box.querySelector('form');
      f.addEventListener('submit', function (e) { e.preventDefault();
        var b = { id: c.id || 0, name: f.name.value, person: f.person.value, phone: f.phone.value, email: f.email.value, type: val.type, website: f.website.value, instagram: f.instagram.value, address: f.address.value, notes: f.notes.value };
        api('cl_save', b).then(function (j) { A.toast('Saved'); render(); page(j.id); }).catch(function (er) { A.toast(er.message, true); });
      });
    });
  };
  var editPlan = function (cid, p) {
    var c = byId(C.clients, cid) || {};
    p = p || { title: '', incl: '', amount: 0, day: new Date().getDate() > 28 ? 1 : new Date().getDate(), method: C.cfg.stripe ? 'card' : 'cash', grace: C.cfg.grace || 14, notes: '' };
    var val = { method: p.method };
    var SUG = [['Ordering app · hosting, updates & support', 'Your own ordering app & website\nHosting, security & updates\nMenu and price changes any time\nSupport on WhatsApp'], ['Website care · hosting & updates', 'Hosting & security updates\nSmall changes each month\nSupport on WhatsApp'], ['Social media · monthly', 'Posts and stories every week\nOne reel a month\nMonthly report']];
    A.openSheet('<form class="plf jbf"><h2>' + (p.id ? 'Edit monthly plan' : 'Monthly plan for ' + esc(c.name || '')) + '</h2>'
      + (p.id ? '' : '<div class="sug">' + SUG.map(function (s, i) { return '<button type="button" data-sg="' + i + '">' + esc(s[0]) + '</button>'; }).join('') + '</div>')
      + '<label class="f">Plan name (they see this)</label><input type="text" name="title" value="' + esc(p.title) + '" placeholder="e.g. Ordering app · hosting, updates & support">'
      + '<label class="f">What\'s included (one per line)</label><textarea name="incl">' + esc(p.incl) + '</textarea>'
      + '<div class="two2"><div><label class="f">Price a month (£)</label><input type="number" name="amount" inputmode="decimal" step="0.01" min="1" value="' + pounds(p.amount) + '"' + (p.card_set ? ' disabled' : '') + '></div><div><label class="f">Grace before you decide (days)</label><input type="number" name="grace" min="3" max="60" value="' + p.grace + '"></div></div>'
      + '<label class="f">How they pay</label>' + chips('method', { card: 'Card every month (Stripe)', cash: 'Cash / I\'ll mark it' }, val.method)
      + '<div id="pday"><label class="f">Day of the month it\'s due</label><input type="number" name="day" min="1" max="28" value="' + p.day + '"></div>'
      + '<p class="sub" id="pnote" style="margin-top:8px"></p>'
      + '<label class="f">Private notes</label><textarea name="notes">' + esc(p.notes) + '</textarea>'
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">Save plan</button></div></form>', function (box) {
      var f = box.querySelector('form');
      var vis = function () { $('pday').style.display = val.method === 'cash' ? '' : 'none'; $('pnote').textContent = val.method === 'card' ? (C.cfg.stripe ? 'You\'ll get a link to send them. They set up their card once; Stripe charges it every month and emails them a receipt. Failed payments show here for you to chase.' : 'Add your Stripe key first (Jobs ⚙), or choose cash for now.') : 'Each month a payment appears here on that day for you to mark as paid. Unpaid ones show up to chase.'; };
      val._on = vis; bindChips(box, val); vis();
      box.querySelectorAll('[data-sg]').forEach(function (b) { b.addEventListener('click', function () { var s = SUG[+b.dataset.sg]; f.title.value = s[0]; f.incl.value = s[1]; }); });
      f.addEventListener('submit', function (e) { e.preventDefault();
        api('cl_plan_save', { cid: cid, plan: p.id || 0, title: f.title.value, incl: f.incl.value, amount: f.amount.value || pounds(p.amount), grace: f.grace.value, method: val.method, day: f.day.value, notes: f.notes.value })
          .then(function (j) { A.toast('Plan saved'); render(); if (j.page) showPage(j.page); }).catch(function (er) { A.toast(er.message, true); });
      });
    });
  };
  var addCare = function (cid) {
    var c = byId(C.clients, cid) || {};
    var hasSite = !!c.website, T = C.care_tpl, keys = Object.keys(T);
    var pre = { up: 1, ssl: 1, domain: 1, security: 1, test: 1, content: 1 };
    A.openSheet('<form class="plf jbf"><h2>Care checks for ' + esc(c.name || '') + '</h2><p class="sub">Automatic ones run by themselves and only tell you if something\'s wrong. The rest come up when they\'re due.</p>'
      + '<label class="f">Website / app address</label><input type="text" name="target" value="' + esc(c.website || '') + '" placeholder="e.g. kayalounge.co.uk" autocomplete="off">'
      + '<div class="cltpl" style="margin-top:12px">' + keys.map(function (k) { var t = T[k]; return '<label><input type="checkbox" data-t="' + k + '"' + (pre[k] ? ' checked' : '') + '><span><b>' + esc(t.title) + '</b><small>' + (t.kind === 'auto' ? 'Automatic' : t.kind === 'renew' ? 'Renewal · yearly' : 'Every ' + t.every) + (t.tip ? ' · ' + esc(t.tip) : '') + '</small>'
        + (t.kind === 'renew' ? '<span class="two2" style="margin-top:6px;display:grid"><input type="date" data-due="' + k + '"><input type="number" data-price="' + k + '" placeholder="They pay £ (optional)" step="0.01"></span>' : '') + '</span></label>'; }).join('') + '</div>'
      + '<label class="f">Something else</label><input type="text" name="other" placeholder="e.g. Check the loyalty points emails go out" autocomplete="off">'
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">Add checks</button></div></form>', function (box) {
      var f = box.querySelector('form');
      f.addEventListener('submit', function (e) { e.preventDefault();
        var items = [];
        box.querySelectorAll('[data-t]').forEach(function (ch) { if (!ch.checked) return; var k = ch.dataset.t, d = box.querySelector('[data-due="' + k + '"]'), pr = box.querySelector('[data-price="' + k + '"]');
          items.push({ tpl: k, due: d && d.value ? fromYmd(d.value) : 0, price: pr ? pr.value : 0, client_pays: pr && +pr.value > 0 ? 1 : 0 }); });
        if (f.other.value.trim()) items.push({ title: f.other.value.trim(), kind: 'check', every: 'month' });
        if (!items.length) { A.toast('Tick at least one', true); return; }
        if (!f.target.value.trim() && items.some(function (x) { return x.tpl && T[x.tpl].kind === 'auto'; })) { A.toast('Add the website address for the automatic checks', true); return; }
        api('cl_care_add', { cid: cid, target: f.target.value, items: items }).then(function (j) { A.toast(j.added + ' added'); render(); if (j.page) showPage(j.page); }).catch(function (er) { A.toast(er.message, true); });
      });
    });
  };
  var careDone = function (k) {
    var renew = k.kind === 'renew' || k.tpl === 'domain';
    A.openSheet('<form class="plf jbf"><h2>' + esc(k.title) + '</h2><p class="sub">' + esc(k.client) + (k.tip ? ' · ' + esc(k.tip) : '') + '</p>'
      + (renew ? '<label class="f">Renewed until</label><input type="date" name="next" value="' + ymd((k.due || now()) + 365 * DAY) + '">' : '')
      + '<label class="f">' + (renew ? 'Note' : 'What did you find? (optional)') + '</label><input type="text" name="note" placeholder="' + (renew ? 'e.g. Renewed for 1 year, £12' : 'e.g. All fine, 2 plugins updated') + '" autocomplete="off">'
      + (renew ? '' : '<label class="tg" style="margin-top:12px"><span>Found a problem</span><input type="checkbox" name="bad"></label>')
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">' + (renew ? 'Save' : 'Done · next one ' + (k.every === 'month' ? 'in a month' : k.every === 'quarter' ? 'in 3 months' : k.every === 'week' ? 'in a week' : 'next year')) + '</button></div></form>', function (box) {
      var f = box.querySelector('form');
      f.addEventListener('submit', function (e) { e.preventDefault();
        api('cl_care_done', { care: k.id, note: f.note.value, ok: f.bad && f.bad.checked ? 0 : 1, next: f.next ? fromYmd(f.next.value) : 0 }).then(function (j) { A.toast('Ticked off'); render(); if (j.page) showPage(j.page); else A.closeSheet(); }).catch(function (er) { A.toast(er.message, true); });
      });
    });
  };
  var careEdit = function (k) {
    A.openSheet('<form class="plf jbf"><h2>' + esc(k.title) + '</h2>' + (k.log.length ? '<div class="clbox">' + k.log.map(function (x) { return '<div class="jbev"><b>' + dShort(x.at) + '</b> · ' + (x.ok ? '✓ ' : '⚠ ') + esc(x.text) + '</div>'; }).join('') + '</div>' : '')
      + '<label class="f">Name</label><input type="text" name="title" value="' + esc(k.title) + '">'
      + '<label class="f">Website address</label><input type="text" name="target" value="' + esc(k.target) + '">'
      + '<label class="f">' + (k.kind === 'check' ? 'Next due' : 'Renewal date') + '</label><input type="date" name="due" value="' + ymd(k.due) + '">'
      + '<label class="f">How often</label>' + chips('every', { week: 'Weekly', month: 'Monthly', quarter: 'Every 3 months', year: 'Yearly', once: 'Once' }, k.every)
      + '<div class="two2"><div><label class="f">They pay (£, optional)</label><input type="number" name="price" step="0.01" value="' + pounds(k.price) + '"></div><div><label class="f">Status</label>' + chips('status', { on: 'On', off: 'Paused' }, k.status) + '</div></div>'
      + '<label class="f">Notes</label><textarea name="notes">' + esc(k.notes) + '</textarea>'
      + '<div class="row" style="margin-top:16px;gap:8px"><button class="btn bad" type="button" data-kdel>Delete</button><button class="btn pri" style="flex:1" type="submit">Save</button></div></form>', function (box) {
      var val = { every: k.every, status: k.status }; bindChips(box, val);
      var f = box.querySelector('form');
      box.querySelector('[data-kdel]').addEventListener('click', function () { if (!confirm('Delete this check?')) return; api('cl_care_del', { care: k.id }).then(function () { A.toast('Deleted'); render(); if (openCid) page(openCid); else A.closeSheet(); }); });
      f.addEventListener('submit', function (e) { e.preventDefault();
        api('cl_care_save', { care: k.id, cid: k.client_id, title: f.title.value, target: f.target.value, due: fromYmd(f.due.value), every: val.every, price: f.price.value, client_pays: +f.price.value > 0 ? 1 : 0, status: val.status, notes: f.notes.value })
          .then(function (j) { A.toast('Saved'); render(); if (j.page) showPage(j.page); }).catch(function (er) { A.toast(er.message, true); });
      });
    });
  };
  var newInvoice = function (cid) {
    var c = byId(C.clients, cid) || {}, val = { method: 'cash' };
    var row = function () { return '<div class="it3"><input type="text" data-k="d" placeholder="e.g. 500 A5 leaflets"><input type="number" data-k="q" min="1" value="1"><input type="number" data-k="p" step="0.01" placeholder="£ each"><button type="button" data-xrow>×</button></div>'; };
    A.openSheet('<form class="plf jbf"><h2>Invoice for ' + esc(c.name || '') + '</h2><p class="sub">For work that wasn\'t in Jobs. Paid jobs and monthly payments get their invoice by themselves.</p>'
      + '<label class="f">What for</label><input type="text" name="title" placeholder="e.g. Shop window vinyl" autocomplete="off"><label class="f">Lines (qty · price each)</label><div id="inlines">' + row() + '</div><button type="button" class="btn sm" style="margin-top:8px" data-addrow>+ Line</button>'
      + '<label class="tg" style="margin-top:14px"><span><b>Already paid</b></span><input type="checkbox" name="paid" checked></label><div id="inmeth"><label class="f">Paid by</label>' + chips('method', { cash: 'Cash', card: 'Card', other: 'Other' }, 'cash') + '</div>'
      + '<label class="f">Note on the invoice (optional)</label><input type="text" name="note" autocomplete="off">'
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">Make invoice</button></div></form>', function (box) {
      bindChips(box, val); var f = box.querySelector('form');
      box.querySelector('[data-addrow]').addEventListener('click', function () { $('inlines').insertAdjacentHTML('beforeend', row()); });
      box.addEventListener('click', function (e) { if (e.target.closest('[data-xrow]') && box.querySelectorAll('.it3').length > 1) e.target.closest('.it3').remove(); });
      f.paid.addEventListener('change', function () { $('inmeth').style.display = f.paid.checked ? '' : 'none'; });
      f.addEventListener('submit', function (e) { e.preventDefault();
        var items = [].map.call(box.querySelectorAll('.it3'), function (r) { return { d: r.querySelector('[data-k=d]').value, q: r.querySelector('[data-k=q]').value, p: r.querySelector('[data-k=p]').value }; });
        api('cl_inv_new', { cid: cid, title: f.title.value, items: items, paid: f.paid.checked ? 1 : 0, method: val.method, note: f.note.value }).then(function (j) { A.toast('Invoice made'); render(); if (j.page) showPage(j.page); }).catch(function (er) { A.toast(er.message, true); });
      });
    });
  };
  var settings = function () {
    var c = C.cfg;
    A.openSheet('<form class="plf jbf"><h2>Invoices &amp; billing</h2><p class="sub">These details go on every invoice.</p>'
      + '<label class="f">Business name</label><input type="text" name="biz" value="' + esc(c.biz) + '"><label class="f">Address</label><textarea name="addr">' + esc(c.addr) + '</textarea>'
      + '<div class="two2"><div><label class="f">Email</label><input type="email" name="email" value="' + esc(c.email) + '"></div><div><label class="f">Phone</label><input type="tel" name="phone" value="' + esc(c.phone) + '"></div></div>'
      + '<div class="two2"><div><label class="f">Website</label><input type="text" name="web" value="' + esc(c.web) + '"></div><div><label class="f">VAT number (if registered)</label><input type="text" name="vat" value="' + esc(c.vat) + '" placeholder="leave empty if not"></div></div>'
      + '<label class="f">Line at the bottom</label><input type="text" name="footer" value="' + esc(c.footer) + '">'
      + '<div class="two2"><div><label class="f">Next invoice number</label><input type="number" name="next_no" value="' + (c.next_no || 1001) + '"></div><div><label class="f">Default grace (days)</label><input type="number" name="grace" min="3" max="60" value="' + (c.grace || 14) + '"></div></div>'
      + '<p class="sub" style="margin-top:10px">Grace = how long a monthly client can go unpaid before SMR Admin asks you to decide (more time or pause). Nothing is ever switched off by itself.</p>'
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">Save</button></div></form>', function (box) {
      var f = box.querySelector('form');
      f.addEventListener('submit', function (e) { e.preventDefault(); var b = {}; ['biz', 'addr', 'email', 'phone', 'web', 'vat', 'footer', 'next_no', 'grace'].forEach(function (k) { b[k] = f[k].value; });
        api('cl_cfg', b).then(function () { A.toast('Saved'); A.closeSheet(); render(); }).catch(function (er) { A.toast(er.message, true); }); });
    });
  };

  /* ---------- Leads ---------- */
  var lgroups = { follow: function (l) { return l.due; }, open: function (l) { return l.status !== 'won' && l.status !== 'lost'; }, won: function (l) { return l.status === 'won'; }, lost: function (l) { return l.status === 'lost' || l.status === 'later'; }, all: function () { return true; } };
  var renderLeads = function () {
    var el = $('ld'); if (!el || !C.sum) return;
    var S = C.sum;
    if (lfilt === 'follow' && !C.leads.some(lgroups.follow)) lfilt = 'open';
    var h = '<div class="jbh"><h1>Leads<small>' + S.leads_open + ' open' + (S.pipeline ? ' · about ' + money(S.pipeline) + ' if they all came in' : '') + '</small></h1></div>';
    h += '<div class="ldadd"><div class="k">NEW LEAD</div><textarea id="ldtext" placeholder="Just tell me about it, e.g. &quot;Bilal from Spice Hut in Dunstable wants an ordering app, 07123 456789, met him at the expo, chase Friday&quot;"></textarea>'
      + '<div class="row" style="margin-top:8px;gap:8px"><button class="btn pri" style="flex:1" data-ldgo>Add lead</button><button class="btn" data-ldform>Fill in a form</button></div>'
      + '<small>' + (C.ai.on ? 'Claude reads it and fills in the details, then asks you anything important that\'s missing.' : 'Tip: turn on the AI check in Proofs ⚙ and it\'ll fill everything in from your note.') + ' You can also tell any Claude chat "add a lead: …".</small></div>';
    h += '<div class="jbseg">' + [['follow', 'To chase (' + C.leads.filter(lgroups.follow).length + ')'], ['open', 'Open'], ['won', 'Won'], ['lost', 'Lost / later'], ['all', 'All']].map(function (b) { return '<button data-lf="' + b[0] + '" class="' + (lfilt === b[0] ? 'on' : '') + '">' + b[1] + '</button>'; }).join('') + '</div>';
    var list = C.leads.filter(lgroups[lfilt] || lgroups.open);
    h += list.length ? list.map(function (l) {
      var nm = l.business || l.name, sub = l.business && l.name ? l.name : '';
      return '<div class="ldc' + (l.due ? ' due' : '') + '"><div class="l1"><b>' + esc(nm) + '</b>' + (l.value ? '<em>' + money(l.value) + '</em>' : '') + '</div>'
        + '<div class="wh">' + esc([sub, l.what, C.lsources[l.source]].filter(Boolean).join(' · ')) + '</div>'
        + '<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap"><span class="st ' + l.status + '">' + esc(C.lstatus[l.status] || l.status) + '</span>' + (l.area ? '<span class="st">' + esc(C.areas[l.area] || l.area) + '</span>' : '') + '</div>'
        + (l.next_at && l.status !== 'won' && l.status !== 'lost' ? '<div class="nx">' + (l.due ? '⏰ ' : '') + 'Follow up ' + when(l.next_at) + (l.next_what ? ': ' + esc(l.next_what) : '') + '</div>' : '')
        + '<div class="bt">' + (l.phone ? '<button class="btn sm wa" data-lwa="' + l.id + '">' + ICO.wa + 'WhatsApp</button>' : '') + (l.status !== 'won' && l.status !== 'lost' ? '<button class="btn sm pri" data-lnext="' + l.id + '">Chased</button>' : '') + '<button class="btn sm" data-ledit="' + l.id + '">Open</button></div></div>';
    }).join('') : '<div class="plempty">' + (lfilt === 'open' ? 'No open leads. Add one above.' : 'Nothing here.') + '</div>';
    h += '<div style="height:70px"></div>';
    el.innerHTML = h;
  };
  var leadForm = function (l, fromParse) {
    l = l || {};
    var val = { status: l.status || 'new', area: l.area || '', source: l.source || '', nx: '' };
    var Q = fromParse && fromParse.length ? fromParse : [];
    if (!l.id) { if (!l.phone) Q.push('Their number?'); if (!l.next_at) Q.push('When should you follow up?'); if (!l.value) Q.push('Roughly how much is it worth?'); }
    var qs = Q.filter(function (x, i) { return Q.indexOf(x) === i; }).slice(0, 4);
    A.openSheet('<form class="plf jbf"><h2>' + (l.id ? esc(l.business || l.name) : 'New lead') + '</h2>'
      + (qs.length ? '<div class="ldq"><b>QUICK QUESTIONS</b>' + qs.map(function (x) { return '<div>• ' + esc(x) + '</div>'; }).join('') + '</div>' : '')
      + '<div class="two2"><div><label class="f">Name</label><input type="text" name="name" value="' + esc(l.name || '') + '" autocomplete="off"></div><div><label class="f">Business</label><input type="text" name="business" value="' + esc(l.business || '') + '" autocomplete="off"></div></div>'
      + '<div class="two2"><div><label class="f">WhatsApp</label><input type="tel" name="phone" value="' + esc(l.phone || '') + '"></div><div><label class="f">Worth about (£)</label><input type="number" name="value" step="1" value="' + pounds(l.value) + '"></div></div>'
      + '<label class="f">What they want</label><input type="text" name="what" value="' + esc(l.what || '') + '" placeholder="e.g. Ordering app" autocomplete="off">'
      + '<label class="f">Where it stands</label>' + chips('status', C.lstatus, val.status)
      + '<label class="f">Follow up</label>' + chips('nx', { 0: 'Today', 1: 'Tomorrow', 3: 'In 3 days', 7: 'Next week', 14: 'In 2 weeks', x: 'No date' }, '') + '<input type="date" name="next_at" value="' + ymd(l.next_at) + '" style="margin-top:8px">'
      + '<input type="text" name="next_what" value="' + esc(l.next_what || '') + '" placeholder="Next step, e.g. send the demo link" style="margin-top:8px" autocomplete="off">'
      + '<label class="f">Part of the business</label>' + chips('area', C.areas, val.area)
      + '<label class="f">Where they came from</label>' + chips('source', C.lsources, val.source)
      + '<label class="f">Email</label><input type="email" name="email" value="' + esc(l.email || '') + '" autocomplete="off">'
      + '<label class="f">Notes</label><textarea name="notes">' + esc(l.notes || '') + '</textarea>'
      + (l.status === 'lost' || val.status === 'lost' ? '<label class="f">Why lost</label><input type="text" name="lost_why" value="' + esc(l.lost_why || '') + '">' : '<input type="hidden" name="lost_why" value="">')
      + '<div class="row" style="margin-top:16px;gap:8px">' + (l.id ? '<button class="btn bad" type="button" data-ldel>Delete</button>' : '') + '<button class="btn pri" style="flex:1" type="submit">Save</button></div>'
      + (l.id && l.status !== 'won' ? '<div class="row" style="margin-top:8px"><button class="btn" style="flex:1" type="button" data-lwin>🎉 Won it: make them a client</button></div>' : '')
      + (l.client_id ? '<div class="row" style="margin-top:8px"><button class="btn" style="flex:1" type="button" data-lcl="' + l.client_id + '">Open their client page</button></div>' : '') + '</form>', function (box) {
      var f = box.querySelector('form');
      val._on = function (k) { if (k === 'nx') { if (val.nx === 'x') f.next_at.value = ''; else { var d = new Date(); d.setDate(d.getDate() + +val.nx); f.next_at.value = ymd(Math.floor(d / 1000)); } } };
      bindChips(box, val);
      var dl = box.querySelector('[data-ldel]'); if (dl) dl.addEventListener('click', function () { if (!confirm('Delete this lead?')) return; api('cl_lead_del', { lead: l.id }).then(function () { A.closeSheet(); renderLeads(); }); });
      var wn = box.querySelector('[data-lwin]'); if (wn) wn.addEventListener('click', function () { api('cl_lead_win', { lead: l.id }).then(function (j) { A.toast('Added to clients'); renderLeads(); render(); if (j.page) showPage(j.page); }); });
      var lc = box.querySelector('[data-lcl]'); if (lc) lc.addEventListener('click', function () { page(+lc.dataset.lcl); });
      f.addEventListener('submit', function (e) { e.preventDefault();
        var b = { lead: l.id || 0, name: f.name.value, business: f.business.value, phone: f.phone.value, value: f.value.value, what: f.what.value, status: val.status, next_at: f.next_at.value ? fromYmd(f.next_at.value) : 0, next_what: f.next_what.value, area: val.area, source: val.source, email: f.email.value, notes: f.notes.value, lost_why: f.lost_why.value };
        api('cl_lead_save', b).then(function () { A.toast('Lead saved'); A.closeSheet(); renderLeads(); }).catch(function (er) { A.toast(er.message, true); });
      });
    });
  };
  var chased = function (l) {
    A.openSheet('<div class="plf"><h2>Chased ' + esc(l.business || l.name) + '</h2><p class="sub">When should you chase next?</p>'
      + '<div class="chips" style="margin-top:10px">' + [[1, 'Tomorrow'], [3, 'In 3 days'], [7, 'Next week'], [14, 'In 2 weeks'], [0, 'No more chasing']].map(function (x) { return '<button type="button" data-d="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>'
      + '<label class="f">Where it stands now</label>' + chips('status', C.lstatus, l.status === 'new' ? 'talking' : l.status)
      + '<label class="f">What happened (optional)</label><input type="text" id="ldnote" placeholder="e.g. Liked the demo, wants a price" autocomplete="off"></div>', function (box) {
      var val = { status: l.status === 'new' ? 'talking' : l.status }; bindChips(box, val);
      box.querySelectorAll('[data-d]').forEach(function (b) { b.addEventListener('click', function () { var d = +b.dataset.d, t = 0; if (d) { var x = new Date(); x.setDate(x.getDate() + d); x.setHours(10, 0, 0, 0); t = Math.floor(x / 1000); }
        api('cl_lead_move', { lead: l.id, status: val.status, next_at: t, add_note: $('ldnote').value }).then(function () { A.toast(t ? 'Next chase ' + when(t) : 'Saved'); A.closeSheet(); renderLeads(); }); }); });
    });
  };

  /* ---------- clicks ---------- */
  var planOf = function (id) { return byId(C.plans, id) || (PAGE && byId(PAGE.plans, id)); };
  var billOf = function (id) { var r = null; C.plans.concat(PAGE ? PAGE.plans : []).forEach(function (p) { p.bills.forEach(function (b) { if (b.id === id) r = [p, b]; }); }); return r; };
  var invOf = function (id) { return byId(C.invoices, id) || (PAGE && byId(PAGE.invoices, id)); };
  var careOf = function (id) { return byId(C.care, id) || (PAGE && byId(PAGE.care, id)); };
  var after = function (j) { render(); renderLeads(); var sh = document.querySelector('#sheetin .clp'); if (sh && j && j.page) showPage(j.page); };
  document.addEventListener('click', function (e) {
    var t = e.target, b;
    var inCl = t.closest('#cl') || t.closest('#ld') || t.closest('#sheetin');
    if (!inCl) return;
    if ((b = t.closest('[data-cl]'))) return page(+b.dataset.cl);
    if ((b = t.closest('[data-clf]'))) { filt = b.dataset.clf; render(); return; }
    if (t.closest('[data-goinv]')) { var ib = $('clinv'); if (ib) ib.scrollIntoView({ behavior: 'smooth' }); else A.toast('No invoices waiting'); return; }
    if (t.closest('[data-clcfg]')) return settings();
    if (t.closest('[data-gojobcfg]')) { location.hash = '#jobs'; return; }
    // client page
    if (PAGE && t.closest('#sheetin .clp')) {
      var c = PAGE.client;
      if (t.closest('[data-cedit]')) return editClient(c);
      if (t.closest('[data-cwa]')) return wa('Hi ' + first(c.person || c.name) + ', ', c.phone);
      if (t.closest('[data-padd]')) return editPlan(c.id);
      if ((b = t.closest('[data-pedit]'))) return editPlan(c.id, planOf(+b.dataset.pedit));
      if (t.closest('[data-kadd]')) return addCare(c.id);
      if (t.closest('[data-inew]')) return newInvoice(c.id);
      if (t.closest('[data-jnew]')) { A.closeSheet(); location.hash = '#jobs'; setTimeout(function () { if (window.SMRJobs && SMRJobs.newJob) SMRJobs.newJob({ client: c.name, person: c.person, phone: c.phone, email: c.email }); }, 350); return; }
      if (t.closest('[data-gojobs]')) { A.closeSheet(); location.hash = '#jobs'; return; }
      if ((b = t.closest('[data-cst]'))) return api('cl_status', { cid: c.id, status: b.dataset.cst }).then(after);
      if (t.closest('[data-cdel]')) { if (!confirm('Delete ' + c.name + '? Their plans, care checks and notes go too. Jobs and invoices stay.')) return; return api('cl_delete', { cid: c.id }).then(function () { openCid = 0; PAGE = null; A.closeSheet(); render(); }); }
      if ((b = t.closest('[data-psend]'))) { var p1 = planOf(+b.dataset.psend); wa(p1.msg_setup, c.phone); return api('cl_plan_sent', { plan: p1.id }).then(after); }
      if ((b = t.closest('[data-pcopy]'))) { var p2 = planOf(+b.dataset.pcopy); A.copy(p2.msg_setup, 'Message copied'); return api('cl_plan_sent', { plan: p2.id }).then(after); }
      if ((b = t.closest('[data-presume]'))) return api('cl_plan_status', { plan: +b.dataset.presume, to: 'active' }).then(after);
      if ((b = t.closest('[data-pend]'))) { var p3 = planOf(+b.dataset.pend); if (!confirm('End ' + p3.title + '?' + (p3.card_set ? ' This also cancels their card subscription in Stripe.' : ''))) return; return api('cl_plan_status', { plan: p3.id, to: 'ended' }).then(after).catch(function (er) { A.toast(er.message, true); }); }
      if ((b = t.closest('[data-psync]'))) { b.textContent = 'Checking…'; return api('cl_plan_sync', { plan: +b.dataset.psync }).then(function (j) { A.toast('Up to date'); after(j); }); }
      if ((b = t.closest('[data-badd]'))) return api('cl_bill_add', { plan: +b.dataset.badd }).then(after);
    }
    // shared rows
    if ((b = t.closest('[data-bwa]'))) { var pb = b.dataset.bwa.split(':'), x = billOf(+pb[1]); if (!x) return; var cc = byId(C.clients, x[0].client_id) || {}; wa(x[1].msg, x[0].phone || cc.phone); return api('cl_bill_reminded', { bill: x[1].id, cid: openCid }).then(after); }
    if ((b = t.closest('[data-bpaid]'))) { var bp = billOf(+b.dataset.bpaid); if (!bp || !confirm('Mark ' + money(bp[1].amount) + ' for ' + bp[1].month + ' as paid?')) return; return api('cl_bill_paid', { bill: bp[1].id, method: bp[0].method === 'card' ? 'card' : 'cash', cid: openCid }).then(function (j) { A.toast('Paid · invoice ready to send'); after(j); }); }
    if ((b = t.closest('[data-bmore]'))) return api('cl_bill_more', { bill: +b.dataset.bmore, days: 7, cid: openCid }).then(function (j) { A.toast('7 more days'); after(j); });
    if ((b = t.closest('[data-bmenu]'))) { var bm = billOf(+b.dataset.bmenu); if (!bm) return; if (confirm('Write off ' + money(bm[1].amount) + ' for ' + bm[1].month + '? (Cancel = give them 7 more days instead)')) return api('cl_bill_void', { bill: bm[1].id, cid: openCid }).then(after); return api('cl_bill_more', { bill: bm[1].id, days: 7, cid: openCid }).then(after); }
    if ((b = t.closest('[data-ppause]'))) { var pp = planOf(+b.dataset.ppause); if (!pp || !confirm('Pause ' + pp.client + '\'s service? This only records it here: switch their app/site off yourself if you decide to. You can resume any time.')) return; return api('cl_plan_status', { plan: pp.id, to: 'paused', cid: openCid }).then(after); }
    if ((b = t.closest('[data-iwa]'))) { var i1 = invOf(+b.dataset.iwa); wa(i1.msg, i1.phone); return api('cl_inv_sent', { inv: i1.id, via: 'whatsapp', cid: openCid }).then(after); }
    if ((b = t.closest('[data-icopy]'))) { var i2 = invOf(+b.dataset.icopy); A.copy(i2.msg, 'Invoice message copied'); return api('cl_inv_sent', { inv: i2.id, via: 'copy', cid: openCid }).then(after); }
    if ((b = t.closest('[data-imail]'))) { var i3 = invOf(+b.dataset.imail); if (!confirm('Email invoice ' + i3.no + ' to ' + i3.email + '?')) return; b.disabled = true; return api('cl_inv_sent', { inv: i3.id, via: 'email', cid: openCid }).then(function (j) { A.toast('Emailed'); after(j); }).catch(function (er) { b.disabled = false; A.toast(er.message, true); }); }
    if ((b = t.closest('[data-iskip]'))) return api('cl_inv_skip', { inv: +b.dataset.iskip, cid: openCid }).then(after);
    if ((b = t.closest('[data-kdone]'))) return careDone(careOf(+b.dataset.kdone));
    if ((b = t.closest('[data-kedit]'))) return careEdit(careOf(+b.dataset.kedit));
    if ((b = t.closest('[data-kwa]'))) { var k1 = careOf(+b.dataset.kwa); return wa(k1.msg, k1.phone); }
    if ((b = t.closest('[data-ksnz]'))) return api('cl_care_snooze', { care: +b.dataset.ksnz, days: 3, cid: openCid }).then(function (j) { A.toast('Back in 3 days'); after(j); });
    if ((b = t.closest('[data-krun]'))) { b.textContent = 'Checking…'; return api('cl_care_run', { care: +b.dataset.krun, cid: openCid }).then(function (j) { A.toast((j.good ? '✓ ' : '⚠ ') + j.result, !j.good); after(j); }); }
    // leads
    if ((b = t.closest('[data-lf]'))) { lfilt = b.dataset.lf; renderLeads(); return; }
    if (t.closest('[data-ldform]')) return leadForm({});
    if (t.closest('[data-ldgo]')) {
      var tx = $('ldtext').value.trim(); if (!tx) { A.toast('Write a line about the lead first', true); return; }
      var gb = t.closest('[data-ldgo]'); gb.disabled = true; gb.textContent = C.ai.on ? 'Reading it…' : 'Adding…';
      return api('cl_lead_parse', { text: tx }).then(function (j) { gb.disabled = false; gb.textContent = 'Add lead'; $('ldtext').value = ''; var f = j.fields; leadForm({ name: f.name, business: f.business, phone: f.phone, email: f.email, area: f.area, what: f.what, value: f.value, source: f.source, status: f.status, next_at: f.next_at, next_what: f.next_what, notes: f.notes }, f.missing || []); })
        .catch(function (er) { gb.disabled = false; gb.textContent = 'Add lead'; A.toast(er.message, true); });
    }
    if ((b = t.closest('[data-lwa]'))) { var l1 = byId(C.leads, +b.dataset.lwa); return wa('Hi ' + first(l1.name || l1.business) + ', ', l1.phone); }
    if ((b = t.closest('[data-lnext]'))) return chased(byId(C.leads, +b.dataset.lnext));
    if ((b = t.closest('[data-ledit]'))) return leadForm(byId(C.leads, +b.dataset.ledit));
  });
  // the client page sheet closing = no client open
  var sc = $('scrim'); if (sc) sc.addEventListener('click', function () { openCid = 0; PAGE = null; });
  var load = function () { return api('cl_list').then(function () { loaded = true; render(); renderLeads(); if (window.SMRPlanner && SMRPlanner.repaint) SMRPlanner.repaint(); }).catch(function (e) { var el = $('cl'); if (el) el.innerHTML = '<div class="plempty">' + esc(e.message) + '</div>'; }); };

  /* Today: one calm line */
  var todayHtml = function () {
    var S = C.sum; if (!S) return '';
    var bits = [];
    if (S.bills.length) bits.push(S.bills.length + ' monthly payment' + (S.bills.length > 1 ? 's' : '') + ' to chase');
    if (S.grace) bits.push(S.grace + ' past the grace period');
    if (S.inv_unsent) bits.push(S.inv_unsent + ' invoice' + (S.inv_unsent > 1 ? 's' : '') + ' to send');
    if (S.care_bad) bits.push(S.care_bad + ' site problem' + (S.care_bad > 1 ? 's' : ''));
    if (S.care_due) bits.push(S.care_due + ' care check' + (S.care_due > 1 ? 's' : '') + ' due');
    if (S.leads_due) bits.push(S.leads_due + ' lead' + (S.leads_due > 1 ? 's' : '') + ' to chase');
    if (!bits.length) return '';
    var hot = S.bills.length || S.care_bad;
    return '<button class="jbtoday' + (hot ? '' : ' amb') + '" data-cltoday><div class="tx"><b>Clients &amp; leads</b><span>' + esc(bits.join(' · ')) + '</span></div><em>›</em></button>';
  };
  document.addEventListener('click', function (e) { if (e.target.closest('[data-cltoday]')) { var S = C.sum; location.hash = (!S.bills.length && !S.inv_unsent && !S.care_due && !S.care_bad && S.leads_due) ? '#leads' : '#clients'; } });

  window.SMRClients = {
    show: function () { openCid = 0; if (!loaded) load(); else { render(); load(); } },
    showLeads: function () { if (!loaded) load(); else { renderLeads(); load(); } },
    hide: function () {}, load: load, todayHtml: todayHtml, open: page, sum: function () { return C.sum; }
  };
  load();
  setInterval(function () { if (!document.hidden && !document.querySelector('#sheet.on')) load(); }, 180000);
})();
