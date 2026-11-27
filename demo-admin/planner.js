/* SMR Admin → Today: "do this next", meetings + prep, waiting-on-me / chasing / money owed, calendar, settings.
   Talks to api.php?a=pl_* (demo-lib/planner.php). Uses the helpers index.php puts on window.SMRA. */
(function () {
  var A = window.SMRA, $ = function (id) { return document.getElementById(id); }, esc = A.esc;
  var P = { items: [], sum: null, cfg: {}, what: {}, areas: {}, feed: '' }, view = 'list', filt = 'all', calM = null, calSel = null, loaded = false;
  var DAY = 86400;
  var now = function () { return Math.floor(Date.now() / 1000); };
  var d0 = function (t) { var d = new Date(t * 1000); d.setHours(0, 0, 0, 0); return Math.floor(d / 1000); };
  var at = function (dayT, hm) { var d = new Date(dayT * 1000); var p = (hm || '09:00').split(':'); d.setHours(+p[0], +p[1], 0, 0); return Math.floor(d / 1000); };
  var hm = function (t) { return new Date(t * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };
  var dayName = function (t) { var x = d0(t), t0 = d0(now()); if (x === t0) return 'Today'; if (x === t0 + DAY) return 'Tomorrow'; if (x === t0 - DAY) return 'Yesterday'; return new Date(t * 1000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); };
  var ymd = function (t) { var d = new Date(t * 1000); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  var fromYmd = function (s, time) { if (!s) return 0; var p = s.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]); var q = (time || '00:00').split(':'); d.setHours(+q[0], +q[1], 0, 0); return Math.floor(d / 1000); };
  var first = function (p) { return String(p || '').split(/[\s(]/)[0] || 'there'; };
  var owesName = function (p) { return p && P.sum && P.sum.owing && Object.prototype.hasOwnProperty.call(P.sum.owing, p); };

  var css = document.createElement('style');
  css.textContent = [
    '#pl .plh{display:flex;align-items:center;gap:10px;margin-bottom:14px}#pl .plh h1{flex:1;margin:0}#pl .plh small{display:block;color:var(--muted);font:600 13px Manrope,sans-serif;letter-spacing:0;margin-top:2px}',
    '.plstat{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}.plstat button{padding:10px 6px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.03);text-align:center}.plstat b{display:block;font:800 22px Sora,sans-serif}.plstat span{font-size:11.5px;color:var(--muted);font-weight:700}.plstat .r b{color:#ff7a90}.plstat .a b{color:#ffc061}.plstat .g b{color:#7ff0bd}',
    '.plfines{padding:14px;border-radius:20px;margin-bottom:14px;background:rgba(255,84,112,.08);border:1px solid rgba(255,84,112,.35)}.plfines .k{font-size:11px;font-weight:800;letter-spacing:.12em;color:#ff9db0;margin-bottom:8px}.plfine{display:flex;gap:10px;align-items:center;width:100%;color:inherit;font:inherit;text-align:left;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid var(--line);margin-top:6px}.plfine .tx{flex:1;min-width:0}.plfine b{display:block;font:700 15px Sora,sans-serif}.plfine .tx span{display:block;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.plfine .dd{text-align:right;flex:none}.plfine .dd b{font-size:14px}.plfine .dd span{font-size:11.5px;font-weight:800;color:var(--muted)}.plfine.r .dd span{color:#ff9db0}.plfine.a .dd span{color:#ffd08a}.plfine.r{border-color:rgba(255,84,112,.55)}',
    '.plnext{position:relative;padding:16px;border-radius:20px;margin-bottom:16px;background:linear-gradient(160deg,rgba(91,91,255,.2),rgba(214,59,255,.14));border:1px solid rgba(214,59,255,.45);box-shadow:0 20px 40px -24px rgba(214,59,255,.7)}',
    '.plnext .k{font-size:11px;font-weight:800;letter-spacing:.12em;color:#e3c8ff}.plnext h2{font:700 20px/1.25 Sora,sans-serif;margin:6px 0 4px}.plnext .who{color:#d9d9ea;font-size:14px;font-weight:600}.plnext .nt{color:var(--muted);font-size:13px;margin-top:6px}',
    '.plnext .bt{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:14px}.plnext .bt .btn{height:44px}.plnext .bt .done{background:#3ddc97;color:#062b14;border:0}',
    '.why{display:inline-block;font-size:11.5px;font-weight:800;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.08);color:#d9d9ea;margin-left:6px;vertical-align:1px}.why.r{background:rgba(255,84,112,.18);color:#ff9db0}.why.a{background:rgba(255,181,71,.16);color:#ffd08a}',
    '.owe{display:inline-block;font-size:11px;font-weight:800;padding:3px 8px;border-radius:999px;background:#ff5470;color:#fff;margin-left:6px;vertical-align:1px}',
    '.plwg{display:flex;gap:12px;align-items:flex-start;padding:12px;border:1px solid var(--line);border-radius:18px;margin-top:10px;background:rgba(255,255,255,.03)}.plwg img{width:112px;flex:none;border-radius:16px;box-shadow:0 8px 20px -10px rgba(0,0,0,.6)}.plwg .tx{flex:1;min-width:0}.plwg b{display:block;font-size:15px}.plwg span{display:block;font-size:13px;color:var(--muted);margin-top:2px}.plwg small{display:block;font-size:12px;color:var(--muted);margin:6px 0 8px}.plwg small b{display:inline;font-size:12px}',
    '.plsec{font:700 13px Manrope,sans-serif;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin:18px 2px 8px;display:flex;align-items:center;gap:8px}.plsec i{flex:1;height:1px;background:var(--line)}',
    '.plev{display:flex;gap:12px;align-items:center;padding:12px 14px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.03);margin-bottom:8px;width:100%;text-align:left}.plev .tm{width:52px;flex:none;font:800 15px Sora,sans-serif;color:#cfc4ff}.plev .tm small{display:block;font:700 11px Manrope,sans-serif;color:var(--muted)}.plev .tx{flex:1;min-width:0}.plev b{display:block;font-size:15px}.plev span{font-size:12.5px;color:var(--muted)}',
    '.prep{display:inline-block;margin-top:4px;font-size:11.5px;font-weight:800;padding:3px 8px;border-radius:999px}.prep.todo{background:rgba(255,181,71,.16);color:#ffd08a}.prep.ok{background:rgba(61,220,151,.14);color:#7ff0bd}',
    '.plseg{display:flex;gap:4px;padding:4px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.03);margin:16px 0 10px}.plseg button{flex:1;padding:8px;border-radius:9px;font-weight:700;font-size:13.5px;color:var(--muted)}.plseg button.on{background:rgba(214,59,255,.16);color:#fff}',
    '.pltk{display:flex;gap:10px;align-items:flex-start;padding:12px 12px 12px 10px;border-top:1px solid var(--line)}.pltk:first-child{border-top:0}.pltk .ck{width:26px;height:26px;flex:none;border-radius:50%;border:2px solid rgba(255,255,255,.3);margin-top:1px;display:grid;place-items:center}.pltk.p1 .ck{border-color:#ff7a90}.pltk.done .ck{background:#3ddc97;border-color:#3ddc97;color:#062b14}.pltk.done .tx b{text-decoration:line-through;color:var(--muted)}',
    '.pltk .tx{flex:1;min-width:0;text-align:left}.pltk .tx b{display:block;font-size:14.5px;font-weight:700;line-height:1.3}.pltk .tx span{font-size:12.5px;color:var(--muted)}.pltk .tx .grp{color:#b9a8ff}.pltk .wt{font-size:10.5px;font-weight:800;padding:2px 6px;border-radius:6px;margin-right:5px;vertical-align:1px}.wt.me{background:rgba(214,59,255,.18);color:#efc2ff}.wt.them{background:rgba(37,166,255,.18);color:#a9dcff}',
    '.plcal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.plcal .h{font-size:11px;font-weight:800;color:var(--muted);text-align:center;padding:4px 0}.plcal button{aspect-ratio:1/1;border-radius:11px;border:1px solid var(--line);background:rgba(255,255,255,.02);font-weight:700;font-size:13.5px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}.plcal button.out{opacity:.35}.plcal button.td{border-color:rgba(214,59,255,.7)}.plcal button.sel{background:var(--grad);color:#fff;border-color:transparent}.plcal .dt{display:flex;gap:3px;height:6px}.plcal .dt i{width:6px;height:6px;border-radius:50%;background:#b18cff}.plcal .dt i.t{background:#ffc061}.plcal .dt i.o{background:#ff5470}',
    '.plcalh{display:flex;align-items:center;gap:8px;margin-bottom:8px}.plcalh b{flex:1;text-align:center;font:700 16px Sora,sans-serif}',
    '.plf .chips button{height:34px;font-size:13px;padding:0 11px}.plf .two2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.plf textarea{height:auto;min-height:84px;padding:12px 14px}.plf .tg{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;padding:12px 14px;border-radius:13px;border:1px solid var(--line)}.plf .tg input{width:22px;height:22px}',
    '.plfab{position:fixed;right:18px;bottom:calc(22px + env(safe-area-inset-bottom));z-index:40;width:58px;height:58px;border-radius:50%;background:var(--grad);color:#fff;font-size:30px;font-weight:300;box-shadow:0 14px 30px -10px rgba(214,59,255,.9);display:grid;place-items:center}.plfab.hidden{display:none}',
    '.plempty{padding:18px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:16px}',
    '.plprep{display:flex;flex-wrap:wrap;gap:8px}.plprep button{padding:10px 12px;border-radius:12px;border:1px solid var(--line);font-weight:700;font-size:13.5px;background:rgba(255,255,255,.03)}.plprep button.on{background:rgba(255,181,71,.2);border-color:rgba(255,181,71,.6);color:#ffe0a8}',
    '.plcode{font:12px/1.4 ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-all;max-height:120px;overflow:auto;padding:10px;border-radius:12px;background:#0c0c16;border:1px solid var(--line);color:#cfc4ff}',
    '.plf input[type=date],.plf input[type=time]{width:100%;height:46px;padding:0 12px;border-radius:13px;border:1px solid var(--line);background:#0c0c16;color:var(--ink);color-scheme:dark;font-size:15px;outline:0}',
    '.plsteps{margin:8px 0 0 18px;font-size:13.5px;color:#d9d9ea}.plsteps li{margin:4px 0}'
  ].join('\n');
  document.head.appendChild(css);

  var api = function (a, b) { return A.api(a, b).then(function (j) { if (j.items) { P.items = j.items; P.sum = j.sum; P.cfg = j.cfg; P.what = j.what; P.areas = j.areas; P.feed = j.feed; badge(); } return j; }); };
  var load = function () { return api('pl_list').then(function () { loaded = true; render(); }).catch(function (e) { $('pl').innerHTML = '<div class="plempty">' + esc(e.message) + '</div>'; }); };
  var badge = function () { var c = $('plcnt'); if (c && P.sum) c.textContent = (P.sum.overdue + P.sum.due_today) || ''; };
  var byId = function (id) { for (var i = 0; i < P.items.length; i++) if (P.items[i].id === id) return P.items[i]; };
  var prepOf = function (eid) { return P.items.filter(function (t) { return t.kind === 'task' && t.event_id === eid; }); };

  var whyCls = function (t) { return /^Overdue/.test(t.why) ? 'r' : /^Due today/.test(t.why) ? 'a' : ''; };
  var oweTag = function (t) { return (t.owes || owesName(t.person)) ? '<span class="owe">£ Payment due' + (t.owes_amt ? ' · ' + esc(t.owes_amt) : '') + '</span>' : ''; };

  /* Fines due: open fine tasks grouped per fine, final deadline + next step, shown at the very top of Today. */
  var finesBox = function () {
    var now = Date.now() / 1000, g = {}, order = [];
    P.items.forEach(function (t) {
      if (t.kind !== 'task' || t.what !== 'fine' || t.status === 'done') return;
      var k = t.grp || ('#' + t.id); if (!g[k]) { g[k] = []; order.push(k); } g[k].push(t);
    });
    if (!order.length) return '';
    var rows = order.map(function (k) {
      var ts = g[k].filter(function (t) { return t.due; }).sort(function (a, b) { return a.due - b.due; });
      var last = ts.length ? ts[ts.length - 1] : g[k][0], next = ts.filter(function (t) { return t.due >= now - 86400; })[0] || last;
      var dl = last.due ? Math.ceil((last.due - now) / 86400) : null;
      var cls = dl === null ? '' : dl <= 3 ? 'r' : dl <= 10 ? 'a' : '';
      var when = last.due ? new Date(last.due * 1000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'No date';
      var left = dl === null ? '' : dl < 0 ? 'Overdue' : dl === 0 ? 'Last day today' : dl + ' day' + (dl === 1 ? '' : 's') + ' left';
      return '<button class="plfine ' + cls + '" data-ed="' + next.id + '"><div class="tx"><b>' + esc(k.charAt(0) === '#' ? last.title : k) + '</b><span>Next: ' + esc(next.title) + '</span></div><div class="dd"><b>' + esc(when) + '</b><span>' + esc(left) + '</span></div></button>';
    });
    return '<div class="plfines"><div class="k">FINES DUE</div>' + rows.join('') + '</div>';
  };
  /* ---------- render ---------- */
  var render = function () {
    var S = P.sum, el = $('pl'); if (!S) return;
    var d = new Date(), h = d.getHours();
    var html = '<div class="plh"><h1>' + (h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening') + ', Summar<small>' + d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + '</small></h1>'
      + '<button class="btn sm" data-pl="wid" style="margin-right:6px">Widgets</button><button class="btn sm icon" data-pl="cfg" aria-label="Today settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button></div>';
    html += finesBox();
    html += '<div class="plstat"><button class="r" data-f="over"><b>' + S.overdue + '</b><span>Overdue</span></button><button class="a" data-f="today"><b>' + S.due_today + '</b><span>Due today</span></button>'
      + '<button class="r" data-f="money"><b>' + Object.keys(S.owing).length + '</b><span>Owe you</span></button><button class="g" data-f="done"><b>' + S.done_today + '</b><span>Cleared</span></button></div>';
    if (window.SMRJobs) html += SMRJobs.todayHtml();
    if (window.SMRClients) html += SMRClients.todayHtml();
    var n = S.next;
    if (n) {
      html += '<div class="plnext"><div class="k">DO THIS NEXT</div><h2>' + esc(n.title) + '</h2><div class="who">' + esc(n.person || '') + (n.platform ? ' · ' + esc(n.platform) : '') + '<span class="why ' + whyCls(n) + '">' + esc(n.why) + '</span>' + oweTag(n) + '</div>'
        + (n.notes ? '<div class="nt">' + esc(n.notes.length > 140 ? n.notes.slice(0, 140) + '…' : n.notes) + '</div>' : '')
        + '<div class="bt"><button class="btn done" data-done="' + n.id + '">✓ Done</button><button class="btn" data-snz="' + n.id + '">Snooze</button><button class="btn" data-msg="' + n.id + '">Message</button></div></div>';
    } else html += '<div class="plempty">Nothing waiting on you. Nice one. Tap + to add something.</div>';
    // Meetings today + tomorrow
    var evRow = function (e) {
      var pr = prepOf(e.id), left = pr.filter(function (t) { return t.status === 'open'; }).length;
      return '<button class="plev" data-ed="' + e.id + '"><div class="tm">' + (e.all_day ? 'All<small>day</small>' : hm(e.start) + '<small>' + (e.end > e.start ? hm(e.end) : '') + '</small>') + '</div><div class="tx"><b>' + esc(e.title) + '</b><span>' + esc([e.person, e.location].filter(Boolean).join(' · ')) + '</span>'
        + (pr.length ? '<div><span class="prep ' + (left ? 'todo' : 'ok') + '">' + (left ? left + ' prep left' : 'Prep done ✓') + '</span></div>' : '') + '</div></button>';
    };
    var evs = P.items.filter(function (i) { return i.kind === 'event' && i.status === 'open'; }).sort(function (a, b) { return a.start - b.start; });
    var t0 = d0(now()), tdy = evs.filter(function (e) { return e.start >= t0 && e.start < t0 + DAY; }), tmr = evs.filter(function (e) { return e.start >= t0 + DAY && e.start < t0 + 2 * DAY; });
    html += '<div class="plsec">Meetings today<i></i></div>' + (tdy.length ? tdy.map(evRow).join('') : '<div class="plempty" style="padding:12px">No meetings today.</div>');
    if (tmr.length) html += '<div class="plsec">Tomorrow<i></i></div>' + tmr.map(evRow).join('');
    html += '<div class="plseg"><button data-v="list" class="' + (view === 'list' ? 'on' : '') + '">To do</button><button data-v="cal" class="' + (view === 'cal' ? 'on' : '') + '">Calendar</button></div>';
    html += view === 'list' ? listHtml() : calHtml();
    el.innerHTML = html;
  };

  var taskRow = function (t) {
    var due = t.status === 'done' ? 'Done ' + dayName(t.done_at) : t.why;
    return '<div class="pltk p' + t.pri + (t.status === 'done' ? ' done' : '') + '"><button class="ck" data-' + (t.status === 'done' ? 'undo' : 'done') + '="' + t.id + '" aria-label="Done">' + (t.status === 'done' ? '✓' : '') + '</button>'
      + '<button class="tx" data-ed="' + t.id + '"><b>' + (t.wait === 'them' ? '<span class="wt them">CHASE</span>' : '') + esc(t.title) + '</b><span>' + esc(t.person || '') + (t.person ? ' · ' : '') + '<span class="why ' + whyCls(t) + '" style="margin:0">' + esc(due) + '</span>' + oweTag(t) + (t.grp ? ' <span class="grp">🔗 ' + esc(t.grp) + '</span>' : '') + '</span></button></div>';
  };
  var listHtml = function () {
    var N = now(), t0 = d0(N);
    var F = { all: 'All', me: 'Waiting on me', them: 'Chasing', money: 'Money owed', personal: 'Personal', done: 'Done' };
    var h = '<div class="filt">' + Object.keys(F).map(function (k) { return '<button data-f="' + k + '" class="' + (filt === k ? 'on' : '') + '">' + F[k] + '</button>'; }).join('') + '</div>';
    var tasks = P.items.filter(function (t) {
      if (t.kind !== 'task') return false;
      if (filt === 'done') return t.status === 'done';
      if (t.status !== 'open') return false;
      if (filt === 'me') return t.wait === 'me' && t.area !== 'personal';
      if (filt === 'them') return t.wait === 'them';
      if (filt === 'money') return t.owes || owesName(t.person);
      if (filt === 'personal') return t.area === 'personal';
      if (filt === 'over') return t.due && t.due < N;
      if (filt === 'today') return t.due && t.due < t0 + DAY;
      return true;
    });
    if (filt === 'done') { tasks.sort(function (a, b) { return b.done_at - a.done_at; }); return h + (tasks.length ? '<div class="rows">' + tasks.map(taskRow).join('') + '</div>' : '<div class="plempty">Nothing ticked off in the last 2 weeks.</div>'); }
    tasks.sort(function (a, b) { return b.score - a.score; });
    var g = { o: [], s: [], t: [], w: [], l: [], n: [] };
    tasks.forEach(function (t) {
      if (t.snooze > N) g.s.push(t); else if (!t.due) g.n.push(t); else if (t.due < N && d0(t.due) < t0) g.o.push(t); else if (t.due < t0 + DAY) g.t.push(t); else if (t.due < t0 + 7 * DAY) g.w.push(t); else g.l.push(t);
    });
    var names = { o: 'Overdue', t: 'Today', w: 'This week', l: 'Later', n: 'No date', s: 'Snoozed' };
    var out = '';
    ['o', 't', 'w', 'l', 'n', 's'].forEach(function (k) { if (g[k].length) out += '<div class="plsec">' + names[k] + ' · ' + g[k].length + '<i></i></div><div class="rows">' + g[k].map(taskRow).join('') + '</div>'; });
    return h + (out || '<div class="plempty">Nothing here.</div>');
  };
  var calHtml = function () {
    var N = now(); if (!calM) { var c = new Date(); calM = new Date(c.getFullYear(), c.getMonth(), 1); }
    if (!calSel) calSel = d0(N);
    var y = calM.getFullYear(), m = calM.getMonth(), startDow = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    var marks = {};
    P.items.forEach(function (i) {
      if (i.status !== 'open') return; var t = i.kind === 'event' ? i.start : i.due; if (!t) return; var k = ymd(t);
      marks[k] = marks[k] || { e: 0, t: 0, o: 0 }; if (i.kind === 'event') marks[k].e++; else if (t < N) marks[k].o++; else marks[k].t++;
    });
    var h = '<div class="plcalh"><button class="btn sm icon" data-cm="-1">‹</button><b>' + calM.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) + '</b><button class="btn sm icon" data-cm="1">›</button></div><div class="plcal">';
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(function (x) { h += '<div class="h">' + x + '</div>'; });
    for (var i = 0; i < startDow; i++) h += '<span></span>';
    var td = ymd(N);
    for (var dd = 1; dd <= days; dd++) {
      var t = Math.floor(new Date(y, m, dd) / 1000), k = ymd(t), mk = marks[k];
      h += '<button data-day="' + t + '" class="' + (k === td ? 'td ' : '') + (d0(calSel) === t ? 'sel' : '') + '">' + dd + '<span class="dt">' + (mk ? (mk.e ? '<i></i>' : '') + (mk.t ? '<i class="t"></i>' : '') + (mk.o ? '<i class="o"></i>' : '') : '') + '</span></button>';
    }
    h += '</div>';
    var s0 = d0(calSel), items = P.items.filter(function (i) { if (i.status !== 'open') return false; var t = i.kind === 'event' ? i.start : i.due; return t >= s0 && t < s0 + DAY; });
    var evs = items.filter(function (i) { return i.kind === 'event'; }).sort(function (a, b) { return a.start - b.start; }), tks = items.filter(function (i) { return i.kind === 'task'; });
    h += '<div class="plsec">' + dayName(s0) + '<i></i><button class="btn sm" data-addev="' + s0 + '">+ Meeting</button></div>';
    h += evs.map(function (e) { return '<button class="plev" data-ed="' + e.id + '"><div class="tm">' + (e.all_day ? 'All<small>day</small>' : hm(e.start)) + '</div><div class="tx"><b>' + esc(e.title) + '</b><span>' + esc([e.person, e.location].filter(Boolean).join(' · ')) + '</span></div></button>'; }).join('');
    h += tks.length ? '<div class="rows">' + tks.map(taskRow).join('') + '</div>' : (evs.length ? '' : '<div class="plempty" style="padding:12px">Nothing on this day.</div>');
    return h;
  };

  /* ---------- editor ---------- */
  var chips = function (name, opts, val) { return '<div class="chips" data-chip="' + name + '">' + Object.keys(opts).map(function (k) { return '<button type="button" data-v="' + esc(k) + '" class="' + (String(val) === String(k) ? 'on' : '') + '">' + esc(opts[k]) + '</button>'; }).join('') + '</div>'; };
  var people = function () { var s = {}; P.items.forEach(function (i) { if (i.person) s[i.person] = 1; }); return Object.keys(s).sort(); };
  var groups = function () { var s = {}; P.items.forEach(function (i) { if (i.grp) s[i.grp] = 1; }); return Object.keys(s).sort(); };
  var edit = function (id, preset) {
    var r = id ? byId(id) : null, o = r || Object.assign({ kind: 'task', title: '', person: '', phone: '', platform: '', area: 'digital', wait: 'me', what: 'other', pri: 2, due: 0, due_t: 0, start: 0, end: 0, all_day: 0, location: '', notes: '', owes: 0, owes_amt: '', grp: '' }, preset || {});
    var ev = o.kind === 'event', N = now(), t0 = d0(N);
    var dueDay = o.due ? ymd(o.due) : '', dueTime = o.due && o.due_t ? hm(o.due) : '';
    var fri = t0 + ((5 - new Date().getDay() + 7) % 7 || 7) * DAY, mon = t0 + ((8 - new Date().getDay()) % 7 || 7) * DAY;
    var quick = { '': 'No date' }; quick[ymd(N)] = 'Today'; quick[ymd(t0 + DAY)] = 'Tomorrow'; quick[ymd(fri)] = 'Friday'; quick[ymd(mon)] = 'Next week';
    var plats = { WhatsApp: 'WhatsApp', Instagram: 'Instagram', 'Personal Instagram': 'Personal IG', Email: 'Email', Phone: 'Phone', 'In person': 'In person' };
    var html = '<form class="plf" id="plform"><h2>' + (r ? (ev ? 'Meeting' : 'Task') : 'Add') + '</h2>'
      + (r ? '' : chips('kind', { task: 'Something to do', event: 'Meeting / plan' }, o.kind))
      + '<datalist id="plpeople">' + people().map(function (p) { return '<option value="' + esc(p) + '">'; }).join('') + '</datalist><datalist id="plgroups">' + groups().map(function (p) { return '<option value="' + esc(p) + '">'; }).join('') + '</datalist>';
    if (!ev) {
      html += '<label class="f">What needs doing?</label><input type="text" name="title" value="' + esc(o.title) + '" placeholder="e.g. Send the quote for 20 A2 posters" autocomplete="off">'
        + '<label class="f">Who for?</label><input type="text" name="person" list="plpeople" value="' + esc(o.person) + '" placeholder="Name (Business)" autocomplete="off">'
        + '<label class="f">Who\'s waiting?</label>' + chips('wait', { me: 'They\'re waiting on me', them: 'I\'m chasing them' }, o.wait)
        + '<label class="f">For what?</label>' + chips('what', P.what, o.what)
        + '<label class="f">When by?</label>' + chips('dq', quick, quick[dueDay] ? dueDay : '__')
        + '<div class="two2" style="margin-top:8px"><input type="date" name="due_day" value="' + dueDay + '"><input type="time" name="due_time" value="' + dueTime + '" placeholder="Time (optional)"></div>'
        + '<label class="f">How important?</label>' + chips('pri', { 1: 'High', 2: 'Normal', 3: 'Low' }, o.pri)
        + '<label class="f">Where are you talking?</label>' + chips('platform', plats, o.platform)
        + '<div class="tg"><span><b>They owe me money</b><br><small style="color:var(--muted)">Shows red under their name everywhere</small></span><input type="checkbox" name="owes"' + (o.owes ? ' checked' : '') + '></div>'
        + '<input type="text" name="owes_amt" value="' + esc(o.owes_amt) + '" placeholder="Amount (optional), e.g. £180" style="margin-top:8px' + (o.owes ? '' : ';display:none') + '">';
    } else {
      var sd = o.start ? ymd(o.start) : (preset && preset.day ? ymd(preset.day) : ymd(N)), st = o.start && !o.all_day ? hm(o.start) : '', et = o.end && !o.all_day && o.end > o.start ? hm(o.end) : '';
      html += '<label class="f">What is it?</label><input type="text" name="title" value="' + esc(o.title) + '" placeholder="e.g. Meeting with Cam (Pulse AV)" autocomplete="off">'
        + '<label class="f">Who with?</label><input type="text" name="person" list="plpeople" value="' + esc(o.person) + '" placeholder="Name (Business)" autocomplete="off">'
        + '<label class="f">Day</label><input type="date" name="day" value="' + sd + '">'
        + '<div class="tg"><span><b>All day / time not set yet</b></span><input type="checkbox" name="all_day"' + (o.all_day ? ' checked' : '') + '></div>'
        + '<div class="two2" id="pltimes" style="margin-top:8px' + (o.all_day ? ';display:none' : '') + '"><input type="time" name="st" value="' + st + '"><input type="time" name="et" value="' + et + '"></div>'
        + '<label class="f">Where?</label><input type="text" name="location" value="' + esc(o.location) + '" placeholder="Place or address" autocomplete="off">';
      if (r) {
        var pr = prepOf(r.id);
        html += '<label class="f">Prep for this</label>' + (pr.length ? '<div class="rows">' + pr.map(taskRow).join('') + '</div>' : '<div class="plempty" style="padding:10px">No prep yet.</div>') + '<button type="button" class="btn sm" style="margin-top:8px" data-prepask="' + r.id + '">+ Add prep</button>';
      }
    }
    html += '<label class="f">Phone (for WhatsApp, optional)</label><input type="tel" name="phone" value="' + esc(o.phone) + '" placeholder="07…">'
      + '<label class="f">Part of the business</label>' + chips('area', P.areas, o.area)
      + '<label class="f">Linked with (same person / group)</label><input type="text" name="grp" list="plgroups" value="' + esc(o.grp) + '" placeholder="e.g. Foodbank, Adam" autocomplete="off">'
      + '<label class="f">Notes</label><textarea name="notes" placeholder="Anything to remember">' + esc(o.notes) + '</textarea>'
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" type="submit">Save</button>' + (r ? '<button type="button" class="btn bad" data-del="' + r.id + '">Delete</button>' : '') + '</div></form>';
    A.openSheet(html, function (box) {
      var f = box.querySelector('form');
      var val = {}; box.querySelectorAll('[data-chip]').forEach(function (c) { var on = c.querySelector('.on'); val[c.dataset.chip] = on ? on.dataset.v : ''; });
      box.addEventListener('click', function (e) {
        var b = e.target.closest('[data-chip] button'); if (b) {
          var c = b.parentNode, k = c.dataset.chip;
          if (k === 'platform' && b.classList.contains('on')) { b.classList.remove('on'); val[k] = ''; return; }
          c.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); val[k] = b.dataset.v;
          if (k === 'kind') { var tl = f.title.value, pp = f.person.value; A.closeSheet(); setTimeout(function () { edit(0, { kind: b.dataset.v, title: tl, person: pp }); }, 230); }
          if (k === 'dq') { f.due_day.value = b.dataset.v; }
          return;
        }
        var d = e.target.closest('[data-del]'); if (d) { if (!confirm('Delete this?')) return; api('pl_del', { id: +d.dataset.del }).then(function () { A.closeSheet(); render(); A.toast('Deleted'); }).catch(function (er) { A.toast(er.message, true); }); return; }
        var pa = e.target.closest('[data-prepask]'); if (pa) { A.closeSheet(); setTimeout(function () { prepAsk(+pa.dataset.prepask); }, 230); return; }
        var dn = e.target.closest('[data-done],[data-undo]'); if (dn) { var did = +(dn.dataset.done || dn.dataset.undo); api('pl_done', { id: did, undo: dn.dataset.undo ? 1 : 0 }).then(function () { A.closeSheet(); render(); setTimeout(function () { edit(id); }, 240); }); }
      });
      f.addEventListener('change', function (e) {
        if (e.target.name === 'owes') f.owes_amt.style.display = e.target.checked ? '' : 'none';
        if (e.target.name === 'all_day') $('pltimes').style.display = e.target.checked ? 'none' : '';
        if (e.target.name === 'due_day') box.querySelectorAll('[data-chip="dq"] button').forEach(function (x) { x.classList.toggle('on', x.dataset.v === f.due_day.value); });
      });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var b = { id: r ? r.id : 0, kind: o.kind, title: f.title.value, person: f.person.value, phone: f.phone.value, area: val.area || o.area, grp: f.grp.value, notes: f.notes.value, event_id: o.event_id || 0 };
        if (!ev) {
          var t = f.due_time.value;
          Object.assign(b, { wait: val.wait || 'me', what: val.what || 'other', pri: +(val.pri || 2), platform: val.platform || '', owes: f.owes.checked ? 1 : 0, owes_amt: f.owes_amt.value,
            due: f.due_day.value ? fromYmd(f.due_day.value, t || '17:00') : 0, due_t: f.due_day.value && t ? 1 : 0 });
        } else {
          var ad = f.all_day.checked || !f.st.value;
          Object.assign(b, { all_day: ad ? 1 : 0, location: f.location.value, start: fromYmd(f.day.value, ad ? '00:00' : f.st.value), end: fromYmd(f.day.value, ad ? '00:00' : (f.et.value || f.st.value)) });
          if (!ad && !f.et.value) b.end = b.start + 3600;
        }
        api('pl_save', b).then(function (j) { A.closeSheet(); render(); A.toast('Saved'); if (j.ask_prep) setTimeout(function () { prepAsk(j.id); }, 300); }).catch(function (er) { A.toast(er.message, true); });
      });
      if (!r) setTimeout(function () { f.title.focus(); }, 280);
    });
  };

  /* ---------- prep question after a meeting is added ---------- */
  var PREP = [['Come up with ideas', 'other'], ['Deck / slides', 'deck'], ['Demo', 'demo'], ['Mock-up', 'mockup'], ['Quote / pricing', 'pricing'], ['Research them', 'info'], ['Polish / enhance the work', 'work'], ['Print / bring materials', 'order'], ['Questions to ask', 'other']];
  var prepAsk = function (eid) {
    var e = byId(eid); if (!e) return;
    var html = '<h2>Anything to prepare?</h2><p class="sub">For <b>' + esc(e.title) + '</b>, ' + dayName(e.start).toLowerCase() + (e.all_day ? '' : ' at ' + hm(e.start)) + '. Pick what you need ready. I\'ll remind you the day before.</p>'
      + '<div class="plprep" style="margin-top:14px">' + PREP.map(function (p, i) { return '<button type="button" data-pi="' + i + '">' + p[0] + '</button>'; }).join('') + '</div>'
      + '<label class="f">Something else?</label><input type="text" id="plpx" placeholder="e.g. Print 3 sample menus" autocomplete="off">'
      + '<div class="row" style="margin-top:16px"><button class="btn pri" style="flex:1" id="plpadd">Add prep</button><button class="btn" id="plpno">Nothing needed</button></div>';
    A.openSheet(html, function (box) {
      box.querySelector('.plprep').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) b.classList.toggle('on'); });
      var send = function (items) { api('pl_prep', { event_id: eid, items: items }).then(function (j) { A.closeSheet(); render(); A.toast(j.prep_added ? j.prep_added + ' prep thing' + (j.prep_added > 1 ? 's' : '') + ' added' : 'Got it, no prep'); }).catch(function (er) { A.toast(er.message, true); }); };
      $('plpadd').addEventListener('click', function () {
        var who = ' for ' + (e.person || e.title);
        var items = [].map.call(box.querySelectorAll('.plprep .on'), function (b) { var p = PREP[+b.dataset.pi]; return { title: p[0] + who, what: p[1] }; });
        var x = $('plpx').value.trim(); if (x) items.push({ title: x, what: 'other' });
        send(items);
      });
      $('plpno').addEventListener('click', function () { send([]); });
    });
  };

  /* ---------- done / snooze / message ---------- */
  var CHASE = { quote: 1, pricing: 1, demo: 1, mockup: 1, deck: 1, info: 1, reply: 1, work: 1 };
  var doneTap = function (b) {
    var id = +(b.dataset.done || b.dataset.undo), t = byId(id); if (!t) return;
    if (b.dataset.undo) { api('pl_done', { id: id, undo: 1 }).then(render); return; }
    if (t.wait === 'me' && CHASE[t.what] && !t.event_id) {
      var N = now(), t0 = d0(N);
      A.openSheet('<h2>Nice one ✓</h2><p class="sub">Sent it to ' + esc(t.person || 'them') + '? When should I remind you to chase if they go quiet?</p><div class="chips" style="margin-top:14px">'
        + [[2, 'In 2 days'], [3, 'In 3 days'], [7, 'In a week'], [0, 'No chase']].map(function (c) { return '<button type="button" data-ch="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>', function (box) {
        box.addEventListener('click', function (e) { var c = e.target.closest('[data-ch]'); if (!c) return; var n = +c.dataset.ch; api('pl_done', { id: id, chase: n ? at(t0 + n * DAY, '10:00') : 0 }).then(function () { A.closeSheet(); render(); A.toast(n ? 'Done. I\'ll remind you to chase' : 'Done'); }); });
      });
      return;
    }
    api('pl_done', { id: id }).then(function () { render(); A.toast('Done ✓'); });
  };
  var snooze = function (id) {
    var N = now(), t0 = d0(N), mon = t0 + ((8 - new Date().getDay()) % 7 || 7) * DAY;
    var opts = [[N + 3600, 'In 1 hour'], [N + 3 * 3600, 'In 3 hours'], [at(t0, '18:00') > N ? at(t0, '18:00') : at(t0 + DAY, '09:00'), at(t0, '18:00') > N ? 'This evening' : 'Tomorrow morning'], [at(t0 + DAY, '09:00'), 'Tomorrow 9am'], [at(mon, '09:00'), 'Monday 9am']];
    A.openSheet('<h2>Snooze until…</h2><div class="chips" style="margin-top:12px">' + opts.map(function (o) { return '<button type="button" data-u="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>', function (box) {
      box.addEventListener('click', function (e) { var c = e.target.closest('[data-u]'); if (!c) return; api('pl_snooze', { id: id, until: +c.dataset.u }).then(function () { A.closeSheet(); render(); A.toast('Snoozed'); }); });
    });
  };
  var msgText = function (t) {
    var f = first(t.person), w = (P.what[t.what] || '').toLowerCase();
    if (t.owes || t.what === 'payment') return 'Hi ' + f + ', hope you\'re good. Just a quick reminder about the payment. Let me know when you can sort it.';
    if (t.wait === 'them') return 'Hi ' + f + ', hope you\'re well. Just checking in on what I sent over. Have you had a chance to look? Any questions, just shout.';
    if (t.what === 'quote' || t.what === 'pricing') return 'Hi ' + f + ', sorry for the wait. Here\'s the ' + (t.what === 'quote' ? 'quote' : 'pricing') + ' we spoke about: ';
    if (t.what === 'demo' || t.what === 'mockup' || t.what === 'deck') return 'Hi ' + f + ', here\'s the ' + w + ' I put together for you: ';
    if (t.what === 'meeting' || t.what === 'call') return 'Hi ' + f + ', when are you free this week? Would be good to sit down and go through it properly.';
    return 'Hi ' + f + ', just a quick update: ';
  };
  var message = function (id) {
    var t = byId(id); if (!t) return;
    var txt = msgText(t), wa = /whats/i.test(t.platform || '') || t.phone || !t.platform;
    A.openSheet('<h2>Message ' + esc(first(t.person)) + '</h2><textarea id="plmt" style="height:auto;min-height:120px;padding:12px 14px;margin-top:10px">' + esc(txt) + '</textarea>'
      + '<div class="row" style="margin-top:12px">' + (wa ? '<button class="btn wa" style="flex:1" id="plwa">Open WhatsApp</button>' : '') + '<button class="btn' + (wa ? '' : ' pri" style="flex:1') + '" id="plcp">Copy</button></div>'
      + (t.platform && !wa ? '<p class="sub" style="margin-top:8px">Copy it, then paste it in ' + esc(t.platform) + '.</p>' : ''), function () {
      if ($('plwa')) $('plwa').addEventListener('click', function () { window.open(A.waUrl($('plmt').value, t.phone), '_blank'); });
      $('plcp').addEventListener('click', function () { A.copy($('plmt').value, 'Copied'); });
    });
  };

  /* The script the owner pastes into Scriptable once. It fetches the latest widget design (widget.js) on every refresh,
     so widget changes reach the phone by themselves. */
  var LOADER = [
    '// SMR Admin widget for Scriptable. Paste this once; it fetches the latest design every time it refreshes.',
    '// Your private link is below: don\'t share this script.',
    'const FEED = "__FEED__";',
    'const VIEW = "__VIEW__";   // today, money, leads or care',
    'const fm = FileManager.local(), path = fm.joinPath(fm.cacheDirectory(), "smr-studio-widget.js");',
    'let code = null;',
    'try { const r = new Request(FEED + "&f=js"); r.timeoutInterval = 10; const c = await r.loadString(); if (c.indexOf("SMR_WIDGET_V") >= 0) { code = c; fm.writeString(path, c); } } catch (e) {}',
    'if (!code && fm.fileExists(path)) code = fm.readString(path);',
    'if (!code) { const w = new ListWidget(); w.addText("SMR Studio: no connection yet"); Script.setWidget(w); }',
    'else { const m = { exports: null }; new Function("module", code)(m); await m.exports(FEED, VIEW); }',
    'Script.complete();'
  ].join('\n');
  /* ---------- phone widgets: three ready-made, each with its own copy button (owner 24 Nov) ---------- */
  var WIDGETS = [
    { v: 'today', name: 'SMR Today', size: 'Large', title: 'Your day', sub: 'Next job, your next meeting, what\'s overdue and what else is on your list.' },
    { v: 'money', name: 'SMR Money', size: 'Large or Medium', title: 'Owed to you', sub: 'Who owes you and how much, your monthly income, invoices to send.' },
    { v: 'care', name: 'SMR Sites', size: 'Large or Medium', title: 'Client sites', sub: 'Any client website that\'s down, a padlock running out, renewals due.' },
    { v: 'today', id: 'lock', img: 'lock', name: 'SMR Lock', size: 'Lock Screen · Rectangular (the wide one)', title: 'Lock Screen', sub: 'Your next job and what\'s overdue, right on the Lock Screen. Also works as the small round one (number of things to do) or the line above the clock.' }
  ];
  var widgets = function () {
    A.openSheet('<div class="plf"><h2>Phone widgets</h2><p class="sub">Ready-made widgets for your iPhone Home Screen and Lock Screen. Each one updates itself; you only set it up once.</p>'
      + WIDGETS.map(function (w) { return '<div class="plwg"><img src="wprev/' + (w.img || w.v) + '.png?v=2" alt=""><div class="tx"><b>' + w.title + '</b><span>' + w.sub + '</span><small>' + w.size + ' widget · name it <b>' + w.name + '</b></small><button class="btn pri sm" type="button" data-wcopy="' + (w.id || w.v) + '">Copy ' + w.name + ' script</button></div></div>'; }).join('')
      + '<div class="plsec">How to add one<i></i></div><ol class="plsteps"><li>Install <b>Scriptable</b> (free) from the App Store.</li><li>Tap <b>Copy</b> on the widget you want above.</li><li>Open Scriptable, tap <b>+</b>, paste, tap the title at the top and call it the name shown (e.g. <b>SMR Today</b>), then <b>Done</b>.</li>'
      + '<li>On your Home Screen: hold an empty spot → <b>Edit</b> (top left) → <b>Add Widget</b> → Scriptable → swipe to the size shown → <b>Add Widget</b>.</li><li>Tap the new widget while it wiggles → <b>Script</b> → pick the one you named. Done.</li><li>Want them in one spot? Drag one widget on top of another of the same size and swipe up and down between them.</li></ol>'
      + '<div class="plsec">Lock Screen<i></i></div><ol class="plsteps"><li>Copy <b>SMR Lock</b> above and paste it into Scriptable the same way, named <b>SMR Lock</b>.</li><li>Lock your phone, then hold the Lock Screen → <b>Customize</b> → <b>Lock Screen</b>.</li><li>Tap the widget row under the clock → scroll to <b>Scriptable</b> → tap the <b>wide one</b> (it takes 2 of the 4 spaces).</li><li>Tap the new widget → <b>Script</b> → <b>SMR Lock</b>. Tap outside, then <b>Done</b>.</li><li>Room left? Add the small round one next to it the same way (number of things to do). Want money instead? In <b>Parameter</b> type <b>money</b> (or <b>care</b> for client sites).</li></ol>'
      + '<p class="sub" style="margin-top:8px">The scripts carry your private link. Keep them to yourself; if one gets shared, use New secret link in ⚙ and copy them again.</p></div>', function (box) {
      box.querySelectorAll('[data-wcopy]').forEach(function (b) { b.addEventListener('click', function () {
        var w = WIDGETS.filter(function (x) { return (x.id || x.v) === b.dataset.wcopy; })[0];
        A.copy(LOADER.replace('__FEED__', P.feed).replace('__VIEW__', w.v), w.name + ' script copied. Now paste it in Scriptable.');
        b.textContent = '✓ Copied'; setTimeout(function () { b.textContent = 'Copy ' + w.name + ' script'; }, 2500);
      }); });
    });
  };
  /* ---------- settings: notification times, calendar, widget ---------- */
  var settings = function () {
    var c = P.cfg, ics = P.feed + '&f=ics', web = ics.replace(/^https?:/, 'webcal:');
    A.openSheet('<form class="plf" id="plcfg"><h2>Today settings</h2>'
      + '<label class="f">Morning briefing</label><input type="time" name="brief" value="' + esc(c.brief) + '">'
      + '<label class="f">End of day check (also tomorrow\'s meetings + prep)</label><input type="time" name="evening" value="' + esc(c.evening) + '">'
      + '<label class="f">Quiet hours (no notifications)</label><div class="two2"><input type="time" name="quiet_from" value="' + esc(c.quiet_from) + '"><input type="time" name="quiet_to" value="' + esc(c.quiet_to) + '"></div>'
      + '<div class="tg"><span><b>Sunday review</b></span><input type="checkbox" name="sunday"' + (+c.sunday ? ' checked' : '') + '></div>'
      + '<div class="tg"><span><b>Reminder notifications</b></span><input type="checkbox" name="push"' + (+c.push ? ' checked' : '') + '></div>'
      + '<button class="btn sm" type="button" id="plpush" style="margin-top:10px">Turn on notifications on this phone</button>'
      + '<button class="btn pri" type="submit" style="width:100%;margin-top:14px">Save times</button></form>'
      + '<div class="plsec">iPhone Calendar<i></i></div><p class="sub">Meetings and hard deadlines show in your phone\'s Calendar and its widgets, and update by themselves.</p>'
      + '<div class="row" style="margin-top:10px"><a class="btn pri" href="' + esc(web) + '">Add to iPhone Calendar</a><button class="btn" type="button" id="plics">Copy link</button></div>'
      + '<div class="plsec">Home Screen &amp; Lock Screen widget<i></i></div><ol class="plsteps"><li>Install <b>Scriptable</b> (free) from the App Store.</li><li>Tap <b>Copy widget script</b> below.</li><li>Open Scriptable, tap <b>+</b>, paste, and name it <b>SMR Studio</b>. Tap ▶ once to preview. You only do this once: it picks up new designs by itself.</li>'
      + '<li>Home Screen: hold an empty spot → <b>Edit → Add Widget</b> → Scriptable → pick a size → tap the widget → Script: <b>SMR Studio</b>, Parameter: <b>today</b>, <b>money</b>, <b>leads</b>, <b>care</b> or leave it empty. Add a few and drag them on top of each other to make a stack you can swipe through.</li><li>Lock Screen: hold the Lock Screen → <b>Customise</b> → Lock Screen → tap the widget row → Scriptable → tap it → Script: <b>SMR Studio</b>.</li></ol>'
      + '<div class="row" style="margin-top:10px"><button class="btn pri" type="button" id="plwid">Phone widgets</button><button class="btn sm bad" type="button" id="plkey">New secret link</button></div>'
      + '<p class="sub" style="margin-top:8px">The calendar link and widget use a private key. If you ever share it by mistake, tap New secret link, then re-copy both.</p>', function (box) {
      var f = $('plcfg');
      f.addEventListener('submit', function (e) { e.preventDefault(); api('pl_cfg', { brief: f.brief.value, evening: f.evening.value, quiet_from: f.quiet_from.value, quiet_to: f.quiet_to.value, sunday: f.sunday.checked ? 1 : 0, push: f.push.checked ? 1 : 0 }).then(function () { A.toast('Saved'); A.closeSheet(); }); });
      $('plpush').addEventListener('click', function () { A.enablePush && A.enablePush(); });
      $('plics').addEventListener('click', function () { A.copy(ics, 'Calendar link copied'); });
      $('plwid').addEventListener('click', function () { widgets(); });
      $('plkey').addEventListener('click', function () { if (!confirm('Make a new secret link? The old calendar link and widget stop working until you add the new ones.')) return; api('pl_newkey').then(function () { A.closeSheet(); A.toast('New link made. Re-add the calendar and widget.'); }); });
    });
  };

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var root = $('tab-today'); if (!root || root.classList.contains('hidden')) return;
    if (!root.contains(e.target)) return;
    var b;
    if ((b = e.target.closest('[data-done],[data-undo]'))) return doneTap(b);
    if ((b = e.target.closest('[data-snz]'))) return snooze(+b.dataset.snz);
    if ((b = e.target.closest('[data-msg]'))) return message(+b.dataset.msg);
    if ((b = e.target.closest('[data-ed]'))) return edit(+b.dataset.ed);
    if ((b = e.target.closest('[data-v]'))) { view = b.dataset.v; render(); return; }
    if ((b = e.target.closest('[data-f]'))) { filt = b.dataset.f; view = 'list'; render(); if (b.closest('.plstat')) { var s = document.querySelector('#pl .filt'); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }
    if ((b = e.target.closest('[data-cm]'))) { calM = new Date(calM.getFullYear(), calM.getMonth() + +b.dataset.cm, 1); render(); return; }
    if ((b = e.target.closest('[data-day]'))) { calSel = +b.dataset.day; render(); return; }
    if ((b = e.target.closest('[data-addev]'))) return edit(0, { kind: 'event', day: +b.dataset.addev });
    if ((b = e.target.closest('[data-pl="cfg"]'))) return settings();
    if (e.target.closest('[data-pl="wid"]')) return widgets();
  });
  var fab = document.createElement('button'); fab.className = 'plfab hidden'; fab.id = 'plfab'; fab.setAttribute('aria-label', 'Add'); fab.textContent = '+';
  fab.addEventListener('click', function () { edit(0, view === 'cal' && calSel ? { kind: 'task' } : null); });
  document.body.appendChild(fab);

  window.SMRPlanner = {
    show: function () { fab.classList.remove('hidden'); if (!loaded) load(); else { render(); load(); } },
    hide: function () { fab.classList.add('hidden'); },
    repaint: function () { var t = $('tab-today'); if (loaded && t && !t.classList.contains('hidden')) render(); },
    load: load
  };
  // Keep the Today badge fresh even on other tabs
  var tt = $('tab-today'); if (tt && !tt.classList.contains('hidden')) window.SMRPlanner.show(); else load();
  setInterval(function () { if (!document.hidden) load(); }, 120000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden && loaded) load(); });
})();
