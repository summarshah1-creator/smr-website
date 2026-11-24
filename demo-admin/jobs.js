/* SMR Admin → Jobs & payments: job cards, client agreement links, payment plans, hand-over lock,
   ready-to-send WhatsApp reminders, free "on the house" extras. Talks to api.php?a=j_* (demo-lib/jobs.php). */
(function () {
  var A = window.SMRA, $ = function (id) { return document.getElementById(id); }, esc = A.esc;
  var J = { jobs: [], sum: null, cfg: {}, terms: {}, handover: {}, areas: {}, extras: {}, audit: [] }, filt = 'live', loaded = false;
  var DAY = 86400, now = function () { return Math.floor(Date.now() / 1000); };
  var money = function (p) { p = +p || 0; return '£' + (p / 100).toLocaleString('en-GB', { minimumFractionDigits: p % 100 ? 2 : 0, maximumFractionDigits: 2 }); };
  var ymd = function (t) { var d = new Date(t * 1000); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var fromYmd = function (s, h) { if (!s) return 0; var p = s.split('-'); return Math.floor(new Date(+p[0], +p[1] - 1, +p[2], h || 17, 0, 0) / 1000); };
  var dShort = function (t) { return t ? new Date(t * 1000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : ''; };
  var ago = function (t) { var s = now() - t; if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago'; if (s < DAY) return Math.round(s / 3600) + ' h ago'; return Math.round(s / DAY) + ' days ago'; };
  var first = function (j) { return String(j.person || j.client || '').split(/[\s,(]/)[0] || 'there'; };
  var ICON = {
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
  };

  var css = document.createElement('style');
  css.textContent = [
    '#jb .jbh{display:flex;align-items:center;gap:10px;margin-bottom:14px}#jb .jbh h1{flex:1;margin:0}#jb .jbh small{display:block;color:var(--muted);font:600 13px Manrope,sans-serif;margin-top:2px}',
    '.jbstat{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}.jbstat button{padding:10px 4px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.03);text-align:center}.jbstat b{display:block;font:800 19px Sora,sans-serif}.jbstat span{font-size:11px;color:var(--muted);font-weight:700}.jbstat .r b{color:#ff7a90}.jbstat .a b{color:#ffc061}.jbstat .p b{color:#cfb4ff}.jbstat .g b{color:#7ff0bd}',
    '.jbrem{border-radius:18px;padding:14px;margin-bottom:14px;background:linear-gradient(160deg,rgba(255,84,112,.2),rgba(255,140,60,.12));border:1px solid rgba(255,84,112,.55);box-shadow:0 0 0 0 rgba(255,84,112,.5);animation:jbglow 2.4s ease-in-out infinite}',
    '@keyframes jbglow{0%,100%{box-shadow:0 0 0 0 rgba(255,84,112,0)}50%{box-shadow:0 0 22px 2px rgba(255,84,112,.35)}}',
    '.jbrem .k{font-size:11px;font-weight:800;letter-spacing:.12em;color:#ffc2cc}.jbrem .rr{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid rgba(255,255,255,.08)}.jbrem .rr:first-of-type{border-top:0}.jbrem .rr .tx{flex:1;min-width:0}.jbrem .rr b{display:block;font-size:14.5px}.jbrem .rr span{font-size:12.5px;color:#ffd6dd}',
    '.jbseg{display:flex;gap:4px;padding:4px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.03);margin:4px 0 12px;overflow:auto}.jbseg button{flex:1;padding:8px 6px;border-radius:9px;font-weight:700;font-size:13px;color:var(--muted);white-space:nowrap}.jbseg button.on{background:rgba(214,59,255,.16);color:#fff}',
    '.jbc{display:block;width:100%;text-align:left;padding:14px;border-radius:18px;border:1px solid var(--line);background:rgba(255,255,255,.03);margin-bottom:10px}.jbc .l1{display:flex;align-items:baseline;gap:8px}.jbc .l1 b{flex:1;min-width:0;font-size:15.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.jbc .l1 em{font-style:normal;font:800 15px Sora,sans-serif}',
    '.jbc .who{font-size:13px;color:var(--muted);margin-top:2px}.jbc .l3{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
    '.st{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:800;padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.08);color:#d9d9ea}.st svg{width:12px;height:12px}.st.agree,.st.reagree{background:rgba(255,181,71,.16);color:#ffd08a}.st.deposit{background:rgba(155,108,255,.2);color:#dcc8ff}.st.active{background:rgba(37,166,255,.18);color:#a9dcff}.st.owed,.st.bad{background:rgba(255,84,112,.2);color:#ff9db0}.st.done{background:rgba(61,220,151,.16);color:#7ff0bd}.st.draft,.st.cancelled{color:var(--muted)}',
    '.jbc.hot{border-color:rgba(255,84,112,.6)}',
    '.jbd .hd2{display:flex;align-items:flex-start;gap:10px}.jbd .hd2 .tx{flex:1;min-width:0}.jbd h2{margin:0 0 2px;font-size:19px}.jbd .who{color:var(--muted);font-size:13.5px}',
    '.jbbox{border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin-top:12px;background:rgba(255,255,255,.02)}.jbbox h3{font:800 11.5px Manrope,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}',
    '.jbpay{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--line)}.jbpay:first-of-type{border-top:0}.jbpay .tx{flex:1;min-width:0}.jbpay b{display:block;font-size:14px}.jbpay span{font-size:12px;color:var(--muted)}.jbpay .am{font:800 15px Sora,sans-serif}.jbpay.paid .am{color:#7ff0bd}.jbpay.late span{color:#ff9db0;font-weight:700}',
    '.jblock{display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:14px;background:rgba(255,84,112,.12);border:1px solid rgba(255,84,112,.4);color:#ffc2cc;font-size:13.5px;font-weight:700;margin-top:12px}.jblock svg{width:22px;height:22px;flex:none}',
    '.jbok{display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:14px;background:rgba(61,220,151,.1);border:1px solid rgba(61,220,151,.35);color:#9ff3cc;font-size:13.5px;font-weight:700;margin-top:12px}',
    '.jbgift{display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,rgba(91,91,255,.16),rgba(214,59,255,.14));border:1px solid rgba(214,59,255,.4);margin-top:12px;font-size:13.5px}.jbgift svg{width:22px;height:22px;flex:none;color:#e9c8ff}.jbgift small{display:block;font-size:10.5px;font-weight:800;letter-spacing:.1em;color:#e3c8ff}',
    '.jbev{font-size:12.5px;color:var(--muted);padding:5px 0;border-top:1px solid var(--line)}.jbev:first-of-type{border-top:0}.jbev b{color:#d9d9ea;font-weight:700}',
    '.jbf .it3{display:grid;grid-template-columns:1fr 58px 86px 30px;gap:6px;margin-top:6px}.jbf .it3 input{height:42px;padding:0 10px;font-size:14px}.jbf .it3 button{border:0;background:none;color:var(--muted);font-size:20px}',
    '.jbf .tot{display:flex;justify-content:space-between;align-items:baseline;margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04)}.jbf .tot b{font:800 20px Sora,sans-serif}',
    '.jbf .two2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.jbf .tg{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;padding:12px 14px;border-radius:13px;border:1px solid var(--line)}.jbf .tg input{width:22px;height:22px;flex:none}',
    '.jbf input[type=date]{width:100%;height:46px;padding:0 12px;border-radius:13px;border:1px solid var(--line);background:#0c0c16;color:var(--ink);color-scheme:dark;font-size:15px;outline:0}',
    '.jbf .sug{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.jbf .sug button{padding:8px 10px;border-radius:10px;border:1px solid rgba(214,59,255,.35);background:rgba(214,59,255,.08);font-size:12.5px;font-weight:700;text-align:left}',
    '.jbtoday.amb{border-color:rgba(255,181,71,.5);background:rgba(255,181,71,.08)}.jbtoday.amb span{color:#ffe0a8}.jbwarn.amb{background:rgba(255,181,71,.12);border-color:rgba(255,181,71,.45);color:#ffe0a8}.jbf .sug button.star{border-color:rgba(255,181,71,.6);background:rgba(255,181,71,.12)}',
    '.jbwarn{padding:11px 13px;border-radius:13px;background:rgba(255,84,112,.12);border:1px solid rgba(255,84,112,.45);color:#ffc2cc;font-size:13px;font-weight:700;margin-top:10px}',
    '.jbaud label{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--line);font-size:14px}.jbaud label:first-child{border-top:0}.jbaud input{width:20px;height:20px;flex:none;margin-top:1px}',
    '.jbtoday{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:13px 14px;border-radius:16px;margin-bottom:14px;border:1px solid rgba(255,84,112,.5);background:linear-gradient(160deg,rgba(255,84,112,.16),rgba(214,59,255,.08))}.jbtoday b{display:block;font-size:15px}.jbtoday span{font-size:12.5px;color:#ffd6dd}.jbtoday .tx{flex:1;min-width:0}.jbtoday em{font-style:normal;font:800 18px Sora,sans-serif;color:#ff9db0}',
    '.jbfab{position:fixed;right:18px;bottom:calc(22px + env(safe-area-inset-bottom));z-index:40;width:58px;height:58px;border-radius:50%;background:var(--grad);color:#fff;font-size:30px;font-weight:300;box-shadow:0 14px 30px -10px rgba(214,59,255,.9);display:grid;place-items:center}.jbfab.hidden{display:none}'
  ].join('\n');
  document.head.appendChild(css);

  var api = function (a, b) { return A.api(a, b).then(function (j) { if (j.jobs) { J.jobs = j.jobs; J.sum = j.sum; J.cfg = j.cfg; J.terms = j.terms; J.handover = j.handover; J.areas = j.areas; J.extras = j.extras; J.audit = j.audit; badge(); } return j; }); };
  var load = function () { return api('j_list').then(function () { loaded = true; render(); if (window.SMRPlanner && SMRPlanner.repaint) SMRPlanner.repaint(); }).catch(function (e) { var el = $('jb'); if (el) el.innerHTML = '<div class="plempty">' + esc(e.message) + '</div>'; }); };
  var badge = function () { var c = $('jbcnt'); if (!c || !J.sum) return; var n = J.sum.remind + (J.sum.overdue ? 1 : 0); c.textContent = n || ''; };
  var byId = function (id) { for (var i = 0; i < J.jobs.length; i++) if (J.jobs[i].id === id) return J.jobs[i]; };
  var stTag = function (j) { return '<span class="st ' + j.stage + '">' + (j.lock && j.agreed_at && j.stage !== 'done' ? ICON.lock : '') + esc(j.label) + '</span>'; };

  /* ---------- list ---------- */
  var groups = { live: function (j) { return ['agree', 'reagree', 'deposit', 'active', 'owed', 'draft'].indexOf(j.stage) >= 0; }, agree: function (j) { return j.stage === 'agree' || j.stage === 'reagree' || j.stage === 'draft'; },
    owed: function (j) { return j.agreed_at && j.owed > 0 && j.stage !== 'cancelled'; }, done: function (j) { return j.stage === 'done' || j.stage === 'cancelled'; }, all: function () { return true; } };
  var render = function () {
    var el = $('jb'); if (!el || !J.sum) return;
    var S = J.sum, rem = [];
    J.jobs.forEach(function (j) { j.remind.forEach(function (r) { rem.push({ j: j, r: r }); }); });
    var html = '<div class="jbh"><h1>Jobs &amp; payments<small>' + (S.owed ? money(S.owed) + ' owed to you' + (S.overdue ? ', ' + money(S.overdue) + ' overdue' : '') : 'Nobody owes you anything right now') + '</small></h1>'
      + '<button class="btn sm icon" data-jb="cfg" aria-label="Jobs settings">' + ICON.gear + '</button></div>';
    html += '<div class="jbstat"><button class="r" data-jf="owed"><b>' + money(S.overdue) + '</b><span>Overdue</span></button><button class="p" data-jf="owed"><b>' + money(S.owed) + '</b><span>Owed in total</span></button>'
      + '<button class="a" data-jf="agree"><b>' + S.agree + '</b><span>To agree</span></button><button class="g" data-jf="live"><b>' + S.active + '</b><span>In progress</span></button></div>';
    if (!J.cfg.stripe) html += '<button class="jbtoday amb" data-jb="cfg"><div class="tx"><b>Card payments are off</b><span>Clients can only pay cash for now. Tap to add your Stripe key.</span></div></button>';
    if (rem.length) {
      html += '<div class="jbrem"><div class="k">SEND THESE PAYMENT REMINDERS</div>' + rem.map(function (x) {
        var t = ['', 'Reminder', 'Due today', 'Overdue', 'Final reminder'][x.r.stage] || 'Reminder', p = x.j.pays.filter(function (p) { return p.id === x.r.pay; })[0] || {};
        return '<div class="rr"><div class="tx"><b>' + esc(x.j.client) + ' · ' + money(p.amount) + '</b><span>' + t + ' · ' + esc(x.j.title) + '</span></div><button class="btn sm wa" data-rem="' + x.j.id + ':' + x.r.pay + '">' + ICON.wa + 'Send</button></div>';
      }).join('') + '</div>';
    }
    html += '<div class="jbseg">' + [['live', 'Live'], ['agree', 'To agree'], ['owed', 'Owed'], ['done', 'Done'], ['all', 'All']].map(function (b) { return '<button data-jf="' + b[0] + '" class="' + (filt === b[0] ? 'on' : '') + '">' + b[1] + '</button>'; }).join('') + '</div>';
    var list = J.jobs.filter(groups[filt] || groups.live);
    list.sort(function (a, b) { return (b.overdue - a.overdue) || ((a.deadline || 9e9) - (b.deadline || 9e9)); });
    html += list.length ? list.map(function (j) {
      var tags = [stTag(j)];
      if (j.deadline && j.stage !== 'done') tags.push('<span class="st' + (j.deadline < now() && !j.delivered_at ? ' bad' : '') + '">Ready by ' + dShort(j.deadline) + '</span>');
      if (j.overdue) tags.push('<span class="st bad">' + money(j.overdue) + ' overdue</span>');
      if (j.prev.sum) tags.push('<span class="st bad">Old balance ' + money(j.prev.sum) + '</span>');
      if (j.extra) tags.push('<span class="st">' + ICON.gift.replace('<svg', '<svg style="width:12px;height:12px"') + ' Free extra</span>');
      return '<button class="jbc' + (j.overdue ? ' hot' : '') + '" data-jo="' + j.id + '"><div class="l1"><b>' + esc(j.title) + '</b><em>' + money(j.total) + '</em></div><div class="who">' + esc(j.client) + (j.person && j.person !== j.client ? ' · ' + esc(j.person) : '') + '</div><div class="l3">' + tags.join('') + '</div></button>';
    }).join('') : '<div class="plempty">' + (filt === 'live' ? 'No live jobs. Tap + to add one.' : 'Nothing here.') + '</div>';
    el.innerHTML = html;
  };

  /* ---------- one job ---------- */
  var payWhen = function (j, p) {
    if (p.status === 'paid') return 'Paid ' + dShort(p.paid_at) + (p.method ? ' · ' + p.method : '');
    if (p.due_type === 'agree') return j.agreed_at ? (p.due && p.due < now() - DAY ? 'Due since ' + dShort(p.due) : 'Due now (to start)') : 'Due when they agree';
    if (p.due && p.due < now()) return 'Overdue since ' + dShort(p.due);
    return (p.due_type === 'handover' ? 'Before hand-over · ' : 'By ') + dShort(p.due);
  };
  var open = function (id) {
    var j = byId(id); if (!j) return;
    var html = '<div class="jbd"><div class="hd2"><div class="tx"><h2>' + esc(j.title) + '</h2><div class="who">' + esc(j.client) + (j.person && j.person !== j.client ? ' · ' + esc(j.person) : '') + (j.phone ? ' · ' + esc(j.phone) : '') + '</div></div><button class="btn sm" data-je="' + j.id + '">Edit</button></div>'
      + '<div style="margin-top:8px">' + stTag(j) + '</div>';
    if (j.prev.sum) html += '<div class="jbwarn">Old balance: ' + money(j.prev.sum) + ' still owed on ' + j.prev.jobs.map(function (o) { return esc(o.title); }).join(', ') + '. Get this paid before you start.</div>';
    // Link + agreement
    html += '<div class="jbbox"><h3>Client link</h3>';
    if (!j.agreed_at) {
      html += '<div style="font-size:13.5px;color:var(--muted);margin-bottom:10px">' + (j.sent_at ? 'Sent ' + ago(j.sent_at) + (j.views ? ' · opened ' + j.views + '×, last ' + ago(j.last_view) : ' · not opened yet') : 'Send this so they can check everything and tap "I agree". Don\'t start until they have.') + '</div>'
        + '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm wa" data-jsend="' + j.id + '">' + ICON.wa + 'Send on WhatsApp</button><button class="btn sm" data-jcopy="' + j.id + '">Copy message</button>'
        + (j.email ? '<button class="btn sm" data-jmail="' + j.id + '">Email it</button>' : '') + '<a class="btn sm" href="' + esc(j.url) + '" target="_blank" rel="noopener">See what they see</a></div>'
        + '<button class="btn sm" style="margin-top:8px" data-jagree="' + j.id + '">They agreed in person / on WhatsApp</button>';
    } else {
      html += '<div class="jbok" style="margin-top:0">✓ Agreed ' + dShort(j.agreed_at) + (j.agreed_name ? ' · ' + esc(j.agreed_name) : '') + '</div><div class="row" style="gap:8px;margin-top:8px"><a class="btn sm" href="' + esc(j.url) + '" target="_blank" rel="noopener">Open their page</a><button class="btn sm" data-jcopy="' + j.id + '">Copy link message</button></div>';
    }
    html += '</div>';
    // Payments
    html += '<div class="jbbox"><h3>Payments · ' + money(j.total) + (j.owed ? ' · ' + money(j.owed) + ' to come' : ' · all paid') + '</h3>' + j.pays.map(function (p) {
      var late = p.status !== 'paid' && p.due && p.due < now();
      return '<div class="jbpay' + (p.status === 'paid' ? ' paid' : '') + (late ? ' late' : '') + '"><div class="tx"><b>' + esc(p.label) + '</b><span>' + payWhen(j, p) + '</span></div><span class="am">' + money(p.amount) + '</span>'
        + (p.status === 'paid' ? '<button class="btn sm" data-jundo="' + j.id + ':' + p.id + '">Undo</button>' : '<button class="btn sm" data-jcash="' + j.id + ':' + p.id + '">Paid</button>') + '</div>';
    }).join('') + '<div style="font-size:12px;color:var(--muted);margin-top:8px">' + esc(J.terms[j.terms] || '') + ' · ' + [j.card_ok ? 'card' : '', j.cash_ok ? 'cash' : ''].filter(Boolean).join(' or ') + (j.email && j.auto_email ? ' · email reminders on' : ' · no email reminders') + '</div></div>';
    // Proof (graphics / marketing / plates work must be signed off before it's made or handed over)
    var pf = window.SMRProofs ? SMRProofs.forJob(j.id) : [], needsPf = ['graphics', 'marketing', 'plates'].indexOf(j.area) >= 0;
    if (pf.length) html += '<div class="jbbox"><h3>Proof</h3>' + pf.map(function (s) { return '<div class="jbpay"><div class="tx"><b>' + esc(s.title) + '</b><span>' + s.n.ok + ' of ' + s.n.total + ' signed off' + (s.state === 'changes' ? ' · changes asked' : s.sent_at ? '' : ' · not sent yet') + '</span></div><button class="btn sm" data-jproof="' + s.id + '">Open</button></div>'; }).join('') + '</div>';
    else if (needsPf && j.agreed_at && !j.delivered_at) html += '<div class="jblock" style="background:rgba(255,181,71,.12);border-color:rgba(255,181,71,.45);color:#ffe0a8">' + ICON.lock + '<div>No proof yet. Send them a proof to sign off before you make it.</div></div><button class="btn sm pri" style="margin-top:8px" data-jnewproof="' + j.id + '">Start a proof</button>';
    // Hand-over
    if (j.stage === 'done' || j.delivered_at) html += '<div class="jbok">✓ Handed over ' + dShort(j.delivered_at) + (j.override ? ' (before full payment)' : '') + '</div><button class="btn sm" style="margin-top:8px" data-jundeliver="' + j.id + '">Undo hand-over</button>';
    else if (j.agreed_at && !j.proof.done) html += '<div class="jblock">' + ICON.lock + '<div>Hand-over locked: the proof isn\'t signed off yet (' + j.proof.open + ' item' + (j.proof.open > 1 ? 's' : '') + ' left).</div></div><button class="btn sm" style="margin-top:8px;opacity:.7" data-joverride="' + j.id + '">Hand over anyway…</button>';
    else if (j.agreed_at && j.lock) html += '<div class="jblock">' + ICON.lock + '<div>Hand-over locked: ' + money(j.lock) + ' still to pay. Mark it paid first.</div></div><button class="btn sm" style="margin-top:8px;opacity:.7" data-joverride="' + j.id + '">Hand over anyway…</button>';
    else if (j.agreed_at) html += '<button class="btn pri big" data-jdeliver="' + j.id + '">Mark as handed over</button>';
    if (j.extra) html += '<div class="jbgift">' + ICON.gift + '<div><small>ON THE HOUSE</small>' + esc(j.extra) + '</div></div>';
    if (j.notes) html += '<div class="jbbox"><h3>Your notes (private)</h3><div style="font-size:13.5px;white-space:pre-wrap">' + esc(j.notes) + '</div></div>';
    html += '<div class="jbbox"><h3>Activity</h3>' + (j.events.length ? j.events.map(function (e) { return '<div class="jbev"><b>' + dShort(e.at) + '</b> · ' + esc(e.what) + '</div>'; }).join('') : '<div class="jbev">Nothing yet</div>') + '</div>';
    html += '<div class="row" style="gap:8px;margin-top:14px"><button class="btn sm bad" data-jcancel="' + j.id + '">' + (j.stage === 'cancelled' ? 'Bring back' : 'Cancel job') + '</button><button class="btn sm bad" data-jdel="' + j.id + '">Delete</button></div></div>';
    A.openSheet(html);
  };
  var sendWa = function (j, text) { window.open(A.waUrl(text, j.phone), '_blank'); };

  /* ---------- add / edit ---------- */
  var chips = function (name, opts, val) { return '<div class="chips" data-chips="' + name + '">' + Object.keys(opts).map(function (k) { return '<button type="button" data-v="' + esc(k) + '" class="' + (String(val) === String(k) ? 'on' : '') + '">' + esc(opts[k]) + '</button>'; }).join('') + '</div>'; };
  var clients = function () { var s = {}; J.jobs.forEach(function (j) { s[j.client] = j; }); return s; };
  var edit = function (id, preset) {
    var r = id ? byId(id) : null;
    var o = r || Object.assign({ client: '', person: '', phone: '', email: '', area: 'graphics', title: '', items: [{ d: '', q: 1, p: 0 }], deadline: 0, handover: 'collection', terms: 'deposit', deposit_pct: 50, pay_by: 0, card_ok: 1, cash_ok: 1, auto_email: 1, extra: '', notes: '', public_note: '' }, preset || {});
    var C = clients();
    var itemRow = function (it) { return '<div class="it3"><input type="text" data-k="d" value="' + esc(it.d) + '" placeholder="e.g. A5 leaflets, double-sided"><input type="number" data-k="q" inputmode="numeric" min="1" value="' + (it.q || 1) + '"><input type="number" data-k="p" inputmode="decimal" step="0.01" min="0" value="' + (it.p ? (it.p / 100).toFixed(2).replace(/\.00$/, '') : '') + '" placeholder="£ each"><button type="button" data-xrow>×</button></div>'; };
    var html = '<form class="plf jbf" id="jbform"><h2>' + (r ? 'Edit job' : 'New job') + '</h2>'
      + (r && r.agreed_at ? '<div class="jbwarn amb">They\'ve agreed to this. Changing the price, items, deadline or payment terms means they\'ll have to agree again.</div>' : '')
      + '<datalist id="jbclients">' + Object.keys(C).map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist>'
      + '<label class="f">Business / charity / client</label><input type="text" name="client" list="jbclients" value="' + esc(o.client) + '" placeholder="e.g. Kaya Lounge" autocomplete="off"><div id="jbprev"></div>'
      + '<div class="two2"><div><label class="f">Contact name</label><input type="text" name="person" value="' + esc(o.person) + '" placeholder="e.g. Ali" autocomplete="off"></div><div><label class="f">WhatsApp</label><input type="tel" name="phone" value="' + esc(o.phone) + '" placeholder="07…"></div></div>'
      + '<label class="f">Email (for automatic reminders)</label><input type="email" name="email" value="' + esc(o.email) + '" placeholder="optional" autocomplete="off">'
      + '<label class="f">Part of the business</label>' + chips('area', J.areas, o.area)
      + '<label class="f">Job name (they see this)</label><input type="text" name="title" value="' + esc(o.title) + '" placeholder="e.g. Roller banner + 500 leaflets" autocomplete="off">'
      + '<label class="f">What\'s included (qty · price each)</label><div id="jbitems">' + (o.items.length ? o.items : [{ d: '', q: 1, p: 0 }]).map(itemRow).join('') + '</div>'
      + '<button type="button" class="btn sm" style="margin-top:8px" data-addrow>+ Add a line</button><div class="tot"><span>Total</span><b id="jbtot">£0</b></div>'
      + '<label class="f">Ready by</label><input type="date" name="deadline" value="' + (o.deadline ? ymd(o.deadline) : '') + '">'
      + '<label class="f">Hand-over</label>' + chips('handover', J.handover, o.handover)
      + '<label class="f">Payment terms</label>' + chips('terms', J.terms, o.terms)
      + '<div id="jbdep"><label class="f">Deposit</label>' + chips('deposit_pct', { 25: '25%', 30: '30%', 50: '50%', 75: '75%' }, o.deposit_pct) + '</div>'
      + '<div id="jbby"><label class="f">Pay by</label><input type="date" name="pay_by" value="' + (o.pay_by ? ymd(o.pay_by) : '') + '"></div>'
      + '<div class="tg"><span><b>Card (Stripe link)</b><br><small style="color:var(--muted)">Card, Apple Pay, Google Pay' + (J.cfg.stripe ? '' : ' · add your Stripe key first') + '</small></span><input type="checkbox" name="card_ok"' + (o.card_ok ? ' checked' : '') + '></div>'
      + '<div class="tg"><span><b>Cash</b><br><small style="color:var(--muted)">Still has to be paid by the due date</small></span><input type="checkbox" name="cash_ok"' + (o.cash_ok ? ' checked' : '') + '></div>'
      + '<div class="tg"><span><b>Email them reminders automatically</b><br><small style="color:var(--muted)">' + (J.cfg.mail ? 'From your summar@ mailbox' : 'Set up the Email tab first') + '</small></span><input type="checkbox" name="auto_email"' + (o.auto_email ? ' checked' : '') + '></div>'
      + '<label class="f">' + ICON.gift.replace('<svg', '<svg style="width:15px;height:15px;vertical-align:-3px;margin-right:4px"') + 'On the house (a free extra they\'ll see)</label><input type="text" name="extra" value="' + esc(o.extra) + '" placeholder="e.g. 5 social media posts to launch it" autocomplete="off">'
      + '<div class="sug" id="jbsug"></div><button type="button" class="btn sm" style="margin-top:8px" data-audit>Quick check of their brand…</button>'
      + '<label class="f">Extra note on their page (optional)</label><textarea name="public_note" placeholder="e.g. Price includes delivery to Luton">' + esc(o.public_note) + '</textarea>'
      + '<label class="f">Private notes (only you)</label><textarea name="notes" placeholder="Anything to remember">' + esc(o.notes) + '</textarea>'
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">' + (r ? 'Save' : 'Save job') + '</button></div></form>';
    A.openSheet(html, function (box) {
      var f = box.querySelector('form'), val = { area: o.area, handover: o.handover, terms: o.terms, deposit_pct: o.deposit_pct };
      var tot = function () { var t = 0; box.querySelectorAll('.it3').forEach(function (rw) { var q = +rw.querySelector('[data-k=q]').value || 1, p = Math.round((+rw.querySelector('[data-k=p]').value || 0) * 100); t += q * p; }); $('jbtot').textContent = money(t); };
      var vis = function () { $('jbdep').style.display = val.terms === 'deposit' ? '' : 'none'; $('jbby').style.display = val.terms === 'bydate' ? '' : 'none'; };
      var sug = function () { $('jbsug').innerHTML = (J.extras[val.area] || []).map(function (s) { return '<button type="button" data-sug="' + esc(s) + '">+ ' + esc(s) + '</button>'; }).join(''); };
      var prev = function () {
        var name = f.client.value.trim().toLowerCase(), phone = f.phone.value.replace(/\D/g, '').slice(-10), owed = 0, which = [];
        J.jobs.forEach(function (j) { if (r && j.id === r.id) return; var same = (phone.length >= 10 && String(j.phone).replace(/\D/g, '').slice(-10) === phone) || (name && j.client.toLowerCase() === name);
          if (same && j.agreed_at && j.stage !== 'cancelled') { var od = j.overdue + (j.stage === 'owed' ? j.owed - j.overdue : 0); if (od > 0) { owed += od; which.push(j.title); } } });
        $('jbprev').innerHTML = owed ? '<div class="jbwarn">⚠ They still owe ' + money(owed) + ' (' + esc(which.join(', ')) + '). It\'ll show on their new quote: get it paid before you start.</div>' : '';
      };
      box.addEventListener('click', function (e) {
        var b = e.target.closest('[data-chips] button');
        if (b) { var g = b.parentNode.dataset.chips; b.parentNode.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); val[g] = b.dataset.v; vis(); if (g === 'area') sug(); return; }
        if (e.target.closest('[data-addrow]')) { $('jbitems').insertAdjacentHTML('beforeend', itemRow({ d: '', q: 1, p: 0 })); $('jbitems').lastChild.querySelector('input').focus(); return; }
        if ((b = e.target.closest('[data-xrow]'))) { if (box.querySelectorAll('.it3').length > 1) b.parentNode.remove(); tot(); return; }
        if ((b = e.target.closest('[data-sug]'))) { var cur = f.extra.value.trim(); f.extra.value = cur ? cur + ' + ' + b.dataset.sug.charAt(0).toLowerCase() + b.dataset.sug.slice(1) : b.dataset.sug; return; }
        if (e.target.closest('[data-audit]')) { audit(f); return; }
      });
      box.addEventListener('input', function (e) { if (e.target.closest('.it3')) tot(); if (e.target.name === 'client' || e.target.name === 'phone') prev();
        if (e.target.name === 'client' && !r) { var c = C[e.target.value]; if (c) { if (!f.person.value) f.person.value = c.person; if (!f.phone.value) f.phone.value = c.phone; if (!f.email.value) f.email.value = c.email; prev(); } } });
      tot(); vis(); sug(); prev();
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var items = []; box.querySelectorAll('.it3').forEach(function (rw) { var d = rw.querySelector('[data-k=d]').value.trim(); if (d) items.push({ d: d, q: +rw.querySelector('[data-k=q]').value || 1, p: +rw.querySelector('[data-k=p]').value || 0 }); });
        if (!items.length) { A.toast('Add at least one thing that\'s included', true); return; }
        var body = { id: r ? r.id : 0, client: f.client.value, person: f.person.value, phone: f.phone.value, email: f.email.value, area: val.area, title: f.title.value, items: items,
          deadline: fromYmd(f.deadline.value, 17), handover: val.handover, terms: val.terms, deposit_pct: +val.deposit_pct, pay_by: fromYmd(f.pay_by.value, 17),
          card_ok: f.card_ok.checked ? 1 : 0, cash_ok: f.cash_ok.checked ? 1 : 0, auto_email: f.auto_email.checked ? 1 : 0, extra: f.extra.value, public_note: f.public_note.value, notes: f.notes.value };
        api('j_save', body).then(function (res) { render(); A.toast(r ? 'Saved' : 'Job saved. Now send them the link.'); open(res.id); }).catch(function (er) { A.toast(er.message, true); });
      });
    });
  };
  var audit = function (f) {
    var back = { client: f.client.value };
    A.openSheet('<h2>Quick brand check</h2><p class="sub" style="margin-bottom:10px">Look at their logo, Instagram, Google and website for two minutes. Tick what\'s missing: each one becomes a free extra you can knock out quickly with Claude.</p><div class="jbaud">'
      + J.audit.map(function (a, i) { return '<label><input type="checkbox" value="' + i + '"><span>' + esc(a) + '</span></label>'; }).join('') + '</div><div class="row" style="margin-top:14px"><button class="btn pri" style="flex:1" data-aud-ok>Use these</button></div>', function (box) {
      box.querySelector('[data-aud-ok]').addEventListener('click', function () {
        var fix = { 0: 'Your logo redrawn as vector files (SVG, PDF, PNG)', 1: 'Google Business profile set up / refreshed', 2: 'Instagram bio + highlight covers tidied up', 3: 'A quick mobile-friendly landing page', 4: 'Your menu / price list online with a QR code',
          5: 'A one-page brand guide (colours + fonts)', 6: 'A "leave us a review" QR card', 7: 'WhatsApp Business quick replies + catalogue set up', 8: 'A few photos edited and enhanced', 9: 'A QR code sign for your shop / print' };
        var picked = [].map.call(box.querySelectorAll('input:checked'), function (c) { return fix[c.value]; });
        A.toast(picked.length ? 'Tap one or two ★ ideas to use as the free extra' : 'Nothing ticked');
        A.closeSheet();
        setTimeout(function () { reopenWith(back, picked); }, 280);
      });
    });
  };
  var lastForm = null;
  var reopenWith = function (back, picked) {
    if (!lastForm) return;
    edit(lastForm.id, lastForm.data);
    setTimeout(function () { var s = $('jbsug'); if (s && picked.length) s.insertAdjacentHTML('afterbegin', picked.map(function (p) { return '<button type="button" class="star" data-sug="' + esc(p) + '">★ ' + esc(p) + '</button>'; }).join('')); }, 50);
  };
  // keep what was typed when the brand check sheet takes over
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-audit]')) return;
    var f = $('jbform'); if (!f) return;
    var items = []; f.querySelectorAll('.it3').forEach(function (rw) { var d = rw.querySelector('[data-k=d]').value.trim(); items.push({ d: d, q: +rw.querySelector('[data-k=q]').value || 1, p: Math.round((+rw.querySelector('[data-k=p]').value || 0) * 100) }); });
    var on = function (g) { var b = f.querySelector('[data-chips="' + g + '"] button.on'); return b ? b.dataset.v : ''; };
    lastForm = { id: 0, data: { client: f.client.value, person: f.person.value, phone: f.phone.value, email: f.email.value, area: on('area'), title: f.title.value, items: items, deadline: fromYmd(f.deadline.value, 17),
      handover: on('handover'), terms: on('terms'), deposit_pct: +on('deposit_pct') || 50, pay_by: fromYmd(f.pay_by.value, 17), card_ok: f.card_ok.checked ? 1 : 0, cash_ok: f.cash_ok.checked ? 1 : 0, auto_email: f.auto_email.checked ? 1 : 0,
      extra: f.extra.value, public_note: f.public_note.value, notes: f.notes.value } };
    var h = f.querySelector('h2'); if (h && /Edit/.test(h.textContent)) { var cur = J.jobs.filter(function (j) { return j.title === lastForm.data.title; })[0]; if (cur) { lastForm.id = cur.id; lastForm.data = Object.assign({}, cur, lastForm.data); } }
  }, true);

  /* ---------- settings ---------- */
  var settings = function () {
    var c = J.cfg;
    A.openSheet('<form class="plf jbf" id="jbcfg"><h2>Jobs settings</h2>'
      + '<label class="f">Card payments (Stripe)</label>' + (c.stripe ? '<div class="jbok" style="margin-top:0">✓ Connected ' + esc(c.stripe_hint) + (c.stripe_test ? ' · TEST key (no real money)' : '') + '</div><button type="button" class="btn sm bad" style="margin-top:8px" data-nostripe>Disconnect</button>'
        : '<p class="sub">Make a Stripe account (stripe.com) on your laptop, then Developers → API keys → copy the <b>Secret key</b> (starts with sk_live_). Paste it here. It\'s stored encrypted on your server.</p><input type="password" name="stripe" placeholder="sk_live_…" autocomplete="off" style="margin-top:8px">')
      + '<label class="f">Standard terms on every quote</label><textarea name="terms" style="min-height:150px">' + esc(c.terms) + '</textarea>'
      + '<div class="tg"><span><b>Push notifications for jobs</b><br><small style="color:var(--muted)">Agreed, paid, opened, overdue</small></span><input type="checkbox" name="push"' + (c.push ? ' checked' : '') + '></div>'
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">Save</button></div></form>', function (box) {
      var f = box.querySelector('form');
      var nb = box.querySelector('[data-nostripe]'); if (nb) nb.addEventListener('click', function () { if (confirm('Turn off card payments?')) api('j_cfg', { stripe: '' }).then(function () { A.closeSheet(); render(); A.toast('Card payments off'); }); });
      f.addEventListener('submit', function (e) { e.preventDefault(); var b = { terms: f.terms.value, push: f.push.checked ? 1 : 0 }; if (f.stripe && f.stripe.value.trim()) b.stripe = f.stripe.value.trim();
        api('j_cfg', b).then(function () { A.closeSheet(); render(); A.toast(b.stripe ? 'Stripe connected: card payments are on' : 'Saved'); }).catch(function (er) { A.toast(er.message, true); }); });
    });
  };

  /* ---------- clicks ---------- */
  document.addEventListener('click', function (e) {
    var b, inJb = e.target.closest('#jb'), inSheet = e.target.closest('#sheetin');
    if (!inJb && !inSheet && !e.target.closest('.jbtoday')) return;
    var pair = function (v) { var p = v.split(':'); return { j: byId(+p[0]), pay: +p[1] }; };
    if ((b = e.target.closest('[data-jo]'))) return open(+b.dataset.jo);
    if ((b = e.target.closest('[data-jf]'))) { filt = b.dataset.jf; render(); return; }
    if ((b = e.target.closest('[data-jb="cfg"]'))) return settings();
    if ((b = e.target.closest('[data-je]'))) return edit(+b.dataset.je);
    if ((b = e.target.closest('[data-rem]'))) { var x = pair(b.dataset.rem), r = x.j.remind.filter(function (q) { return q.pay === x.pay; })[0]; if (!x.j.phone) A.toast('No WhatsApp number on this job: add it with Edit', true); sendWa(x.j, r.text); api('j_reminded', { id: x.j.id, pay: x.pay }).then(render); return; }
    if ((b = e.target.closest('[data-jsend]'))) { var j = byId(+b.dataset.jsend); sendWa(j, j.msg_send); api('j_sent', { id: j.id }).then(function () { render(); open(j.id); }); return; }
    if ((b = e.target.closest('[data-jcopy]'))) { var j2 = byId(+b.dataset.jcopy); A.copy(j2.msg_send, 'Message copied'); api('j_sent', { id: j2.id }).then(function () { render(); }); return; }
    if ((b = e.target.closest('[data-jmail]'))) { var j3 = byId(+b.dataset.jmail); b.disabled = true; api('j_sent', { id: j3.id, email: 1 }).then(function () { A.toast('Emailed to ' + j3.email); render(); open(j3.id); }).catch(function (er) { b.disabled = false; A.toast(er.message, true); }); return; }
    if ((b = e.target.closest('[data-jagree]'))) { var how = prompt('How did they agree? (e.g. "On WhatsApp 24 Nov")', 'On WhatsApp'); if (how === null) return; api('j_agreed', { id: +b.dataset.jagree, how: how }).then(function () { render(); open(+b.dataset.jagree); }); return; }
    if ((b = e.target.closest('[data-jcash]'))) { var y = pair(b.dataset.jcash), p = y.j.pays.filter(function (q) { return q.id === y.pay; })[0];
      A.openSheet('<h2>' + money(p.amount) + ' paid?</h2><p class="sub">' + esc(y.j.client) + ' · ' + esc(p.label) + '</p><div class="grid4"><button class="btn" data-m="cash">Cash</button><button class="btn" data-m="card">Card / link</button></div><button class="btn sm" style="margin-top:10px;width:100%" data-m="other">Other</button>', function (box) {
        box.addEventListener('click', function (ev) { var m = ev.target.closest('[data-m]'); if (!m) return; api('j_paid', { id: y.j.id, pay: y.pay, method: m.dataset.m }).then(function () { render(); A.toast('Marked paid'); open(y.j.id); }); }); }); return; }
    if ((b = e.target.closest('[data-jundo]'))) { var z = pair(b.dataset.jundo); api('j_paid', { id: z.j.id, pay: z.pay, undo: 1 }).then(function () { render(); open(z.j.id); }); return; }
    if ((b = e.target.closest('[data-jdeliver]'))) { var id = +b.dataset.jdeliver; api('j_deliver', { id: id }).then(function () { render(); A.toast('Handed over ✓'); open(id); }).catch(function (er) { A.toast(er.message, true); }); return; }
    if ((b = e.target.closest('[data-joverride]'))) { var jo = byId(+b.dataset.joverride); if (!confirm(jo.lock ? first(jo) + ' still owes ' + money(jo.lock) + '. Are you sure you want to hand it over before you\'re paid? This is how people get away without paying.' : 'The proof isn\'t signed off. If anything is wrong, they can say it\'s not what they approved. Hand over anyway?')) return;
      api('j_deliver', { id: jo.id, override: 1 }).then(function () { render(); open(jo.id); }); return; }
    if ((b = e.target.closest('[data-jundeliver]'))) { api('j_deliver', { id: +b.dataset.jundeliver, undo: 1 }).then(function () { render(); open(+b.dataset.jundeliver); }); return; }
    if ((b = e.target.closest('[data-jcancel]'))) { var jc = byId(+b.dataset.jcancel), back = jc.stage === 'cancelled'; if (!back && !confirm('Cancel this job? The client link will stop working.')) return; api('j_cancel', { id: jc.id, undo: back ? 1 : 0 }).then(function () { render(); open(jc.id); }); return; }
    if ((b = e.target.closest('[data-jproof]'))) { A.closeSheet(); location.hash = '#proofs'; var pid = +b.dataset.jproof; setTimeout(function () { var x = document.querySelector('[data-pfo="' + pid + '"]'); if (x) x.click(); }, 500); return; }
    if ((b = e.target.closest('[data-jnewproof]'))) { A.closeSheet(); if (window.SMRProofs) SMRProofs.newFor(+b.dataset.jnewproof); return; }
    if ((b = e.target.closest('[data-jdel]'))) { if (!confirm('Delete this job and its payment history for good?')) return; api('j_delete', { id: +b.dataset.jdel }).then(function () { A.closeSheet(); render(); }); return; }
  });

  var fab = document.createElement('button'); fab.className = 'jbfab hidden'; fab.setAttribute('aria-label', 'New job'); fab.textContent = '+';
  fab.addEventListener('click', function () { lastForm = null; edit(0); });
  document.body.appendChild(fab);

  /* Today tab: one red line when money is overdue or reminders are waiting */
  var todayHtml = function () {
    if (!J.sum) return '';
    var S = J.sum, n = S.remind, bits = [];
    if (S.overdue) bits.push(money(S.overdue) + ' overdue: ' + Object.keys(S.debtors).join(', '));
    if (n) bits.push(n + ' payment reminder' + (n > 1 ? 's' : '') + ' to send');
    if (S.agree) bits.push(S.agree + ' quote' + (S.agree > 1 ? 's' : '') + ' not agreed yet');
    var PS = window.SMRProofs && SMRProofs.sum();
    if (PS && PS.changes) bits.push(PS.changes + ' proof' + (PS.changes > 1 ? 's' : '') + ' with changes asked');
    if (PS && PS.ready) bits.push(PS.ready + ' proof' + (PS.ready > 1 ? 's' : '') + ' to send');
    if (PS && PS.waiting) bits.push(PS.waiting + ' proof' + (PS.waiting > 1 ? 's' : '') + ' waiting for sign-off');
    var np = needProof(); if (np.length) bits.push(np.length + ' job' + (np.length > 1 ? 's' : '') + ' with no proof yet');
    if (!bits.length) return '';
    return '<button class="jbtoday" data-jtoday><div class="tx"><b>Money &amp; jobs</b><span>' + esc(bits.join(' · ')) + '</span></div><em>' + (S.overdue ? money(S.overdue) : '›') + '</em></button>';
  };
  document.addEventListener('click', function (e) { if (e.target.closest('[data-jtoday]')) { var PS = window.SMRProofs && SMRProofs.sum(); location.hash = (!J.sum.overdue && !J.sum.remind && PS && (PS.changes || PS.ready)) ? '#proofs' : '#jobs'; } });
  var needProof = function () { return J.jobs.filter(function (j) { return j.agreed_at && !j.delivered_at && j.stage !== 'cancelled' && ['graphics', 'marketing', 'plates'].indexOf(j.area) >= 0 && !j.proof.sets; }); };

  window.SMRJobs = {
    show: function () { fab.classList.remove('hidden'); if (!loaded) load(); else { render(); load(); } api('j_check').then(render).catch(function () {}); },
    hide: function () { fab.classList.add('hidden'); },
    todayHtml: todayHtml, load: load, newJob: function (preset) { edit(0, preset); }, needProof: function () { return J.sum ? needProof() : []; },
    repaint: function () { var t = $('tab-jobs'); if (loaded && t && !t.classList.contains('hidden')) render(); if (window.SMRPlanner && SMRPlanner.repaint) SMRPlanner.repaint(); }
  };
  var tj = $('tab-jobs'); if (tj && !tj.classList.contains('hidden')) window.SMRJobs.show(); else load();
  setInterval(function () { if (!document.hidden) load(); }, 120000);
})();
