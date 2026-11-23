/* Inspire FM · Live room: radio you can take part in.
   Optional per show (the show's team switches it on in Studio → Live room). While that show is on air, listeners get
   a Live room inside the player: polls, quiz with a leaderboard, topic requests with upvotes, questions for the
   presenter, requests to speak on air, shout-outs, business spotlight nominations, live reactions and a pinned note.
   Sync: this device (all tabs) via BroadcastChannel + localStorage, so studio and listener can be demoed side by side.
   A real-time server plugs in through window.IFM_LIVE_API = { load(), save(state), subscribe(cb) }. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc, store, toast, TOOLS, D } = X;

const FEATURES = [['poll', 'Polls', 'Listeners vote, results update live'], ['quiz', 'Quiz', 'Questions with a right answer and a leaderboard'], ['topics', 'Topic requests', 'Listeners suggest and upvote what you talk about'],
  ['ask', 'Questions', 'Listeners send questions for the presenter or guest'], ['speak', 'Request to speak', 'Listeners ask to come on air; you call them back'],
  ['shout', 'Shout-outs', 'Messages for you to read out'], ['spot', 'Business spotlight', 'Listeners nominate a local business to feature'], ['react', 'Reactions', 'Live reactions float across the player']];
const ALL = FEATURES.map(f => f[0]);
const DEF_SHOWS = { biz: { on: true, f: ALL.slice() } };
const KEY = 'live_room', ch = 'BroadcastChannel' in window ? new BroadcastChannel('ifm-live') : null;
const blank = () => ({ act: null, votes: {}, feed: [], topics: [], reacts: { heart: 0, clap: 0, star: 0, mash: 0, ameen: 0 }, pin: '', board: {}, preview: '', v: 0 });
let S = Object.assign(blank(), store.get(KEY, {}));
const shows = () => Object.assign({}, DEF_SHOWS, store.get('live_shows', {}));
const uid = () => Math.random().toString(36).slice(2, 9);
const me = () => store.get('live_me', null) || (() => { const m = { id: uid(), name: '' }; store.set('live_me', m); return m; })();
const mine = () => store.get('live_mine', {}); /* what this listener has voted/answered */
const setMine = (k, v) => { const m = mine(); m[k] = v; store.set('live_mine', m); };

function save(push = true) { S.v = Date.now(); store.set(KEY, S); if (push) { try { ch && ch.postMessage(S); } catch (e) {} if (window.IFM_LIVE_API) try { window.IFM_LIVE_API.save(S); } catch (e) {} } paint(); }
function take(n) { if (!n || (n.v || 0) <= (S.v || 0)) return; S = Object.assign(blank(), n); store.set(KEY, S); paint(); }
if (ch) ch.onmessage = e => take(e.data);
addEventListener('storage', e => { if (e.key === 'ifm_' + KEY && e.newValue) try { take(JSON.parse(e.newValue)); } catch (er) {} });
if (window.IFM_LIVE_API && window.IFM_LIVE_API.subscribe) window.IFM_LIVE_API.subscribe(take);

/* which show is on air, and is its live room open? */
function onAir() { const c = X.showAt(), key = c.s[2]; return { key, sh: D.shows[key], start: c.start, end: c.end }; }
function roomFor() { const p = S.preview, k = p || onAir().key, cfg = shows()[k]; return cfg && cfg.on ? { key: k, sh: D.shows[k], cfg, preview: !!p } : null; }
const has = (r, f) => r && r.cfg.f.includes(f);

/* ---------- icons (no emoji) ---------- */
const RX = { heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="#ff5a7a"/>',
  clap: '<path d="M7 13l5-8a1.6 1.6 0 0 1 2.7 1.6L12 11l4-5a1.6 1.6 0 0 1 2.6 1.9L15 13l2-2a1.5 1.5 0 0 1 2.2 2L14 19a5 5 0 0 1-7-6z" fill="#ffc83d"/><path d="M4 7l2 1M6 3l1 2M3 11h2" stroke="#ffc83d" stroke-width="1.6" stroke-linecap="round"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.5 2.9 1-6.1-4.3-4.3 6-.9z" fill="#8cc63f"/>' };
const rxBtn = k => k === 'mash' ? '<b class="lr-word">MashaAllah</b>' : k === 'ameen' ? '<b class="lr-word">Ameen</b>' : `<svg viewBox="0 0 24 24" width="24" height="24">${RX[k]}</svg>`;
const I = n => `<svg class="ico"><use href="#i-${n}"/></svg>`;

/* ================= LISTENER: inside the player ================= */
function listener() {
  const np = $('#np'); if (!np) return; let box = $('#lrBox');
  const live = !$('#npLive') || !$('#npLive').hidden, r = live ? roomFor() : null;
  if (!r) { if (box) box.remove(); return; }
  if (!box) { box = document.createElement('section'); box.id = 'lrBox'; box.className = 'lr'; const acts = $('.np-acts', np); (acts || $('.np-list', np)).after(box); box.addEventListener('click', onTap); box.addEventListener('submit', onSubmit); }
  const host = (r.sh.p || []).join(' & '), a = S.act, m = mine();
  let card = '';
  if (a && has(r, a.type)) {
    if (a.type === 'poll') { const v = S.votes[a.id] || {}, tot = Object.values(v).reduce((x, y) => x + y, 0), my = m['p' + a.id];
      card = `<div class="lr-k">Poll</div><h4>${esc(a.q)}</h4><div class="lr-opts">${a.opts.map((o, i) => { const pc = tot ? Math.round((v[i] || 0) / tot * 100) : 0; return my != null ? `<div class="lr-res${my === i ? ' me' : ''}"><i style="width:${pc}%"></i><span>${esc(o)}</span><b>${pc}%</b></div>` : `<button type="button" class="lr-opt" data-vote="${i}">${esc(o)}</button>`; }).join('')}</div><small class="lr-note">${my != null ? `${tot} ${tot === 1 ? 'vote' : 'votes'} so far · results update live` : 'Tap to vote'}</small>`; }
    else if (a.type === 'quiz') { const my = m['q' + a.id];
      card = `<div class="lr-k">Quiz</div><h4>${esc(a.q)}</h4><div class="lr-opts">${a.opts.map((o, i) => { const cls = a.reveal ? (i === a.ans ? ' ok' : my === i ? ' no' : '') : my === i ? ' sel' : ''; return `<button type="button" class="lr-opt${cls}" ${my != null || a.reveal ? 'disabled' : ''} data-ans="${i}">${esc(o)}</button>`; }).join('')}</div>
        <small class="lr-note">${a.reveal ? (my === a.ans ? 'You got it right. +1 point' : my != null ? 'Not this time. Next question soon.' : 'Answer revealed.') : my != null ? 'Locked in. Wait for the reveal on air.' : 'Pick your answer before the reveal'}</small>${board()}`; }
    else if (a.type === 'topics') { const voted = m.tv || [];
      card = `<div class="lr-k">Topic requests</div><h4>${esc(a.q)}</h4><form class="lr-f" data-f="topic"><input name="t" maxlength="90" placeholder="Suggest a topic" required><button class="lr-send" type="submit">Add</button></form>
        <div class="lr-tops">${S.topics.slice().sort((x, y) => y.votes - x.votes).slice(0, 8).map(t => `<button type="button" class="lr-top${voted.includes(t.id) ? ' on' : ''}" data-up="${t.id}"><span>${esc(t.text)}</span><b>${I('arrow')}${t.votes}</b></button>`).join('') || '<small class="lr-note">Be the first to suggest one.</small>'}</div>`; }
    else if (a.type === 'ask') card = `<div class="lr-k">Questions</div><h4>${esc(a.q)}</h4>${form('ask', 'Your question', 'Send question')}`;
    else if (a.type === 'speak') card = `<div class="lr-k">Request to speak</div><h4>${esc(a.q)}</h4><form class="lr-f lr-col" data-f="speak">${nameIn()}<input name="t" maxlength="90" placeholder="What would you like to talk about?" required><input name="ph" type="tel" inputmode="tel" maxlength="20" placeholder="Phone number (only the studio sees it)" required><button class="lr-send" type="submit">Ask to come on air</button></form><small class="lr-note">The team will call you if there's time on air.</small>`;
    else if (a.type === 'shout') card = `<div class="lr-k">Shout-outs</div><h4>${esc(a.q)}</h4>${form('shout', 'Your shout-out', 'Send shout-out')}`;
    else if (a.type === 'spot') card = `<div class="lr-k">Business spotlight</div><h4>${esc(a.q)}</h4><form class="lr-f lr-col" data-f="spot">${nameIn()}<input name="b" maxlength="60" placeholder="Business name" required><input name="t" maxlength="140" placeholder="Why should we feature them?" required><button class="lr-send" type="submit">Nominate</button></form>`;
  } else {
    const quick = ['shout', 'ask'].filter(f => has(r, f));
    card = `<div class="lr-k">Live room</div><h4>Nothing running right now</h4><p class="lr-p">Polls, quizzes and topic requests pop up here during the show.${quick.length ? ' In the meantime:' : ''}</p>${quick.length ? `<div class="lr-quick">${quick.map(f => `<button type="button" class="lr-qb" data-quick="${f}">${f === 'shout' ? 'Send a shout-out' : 'Ask a question'}</button>`).join('')}</div><div id="lrQuick"></div>` : ''}`;
  }
  const feed = S.feed.filter(x => x.status === 'live' || x.status === 'onair').slice(-6).reverse();
  box.innerHTML = `<div class="lr-h"><span class="lr-dot"></span><b>Live room</b><small>${esc(r.sh.n)}${host ? ' · with ' + esc(host) : ''}${r.preview ? ' · preview' : ''}</small></div>
    ${S.pin ? `<div class="lr-pin">${I('star')}<span>${esc(S.pin)}</span></div>` : ''}
    <div class="lr-card">${card}</div>
    ${has(r, 'react') ? `<div class="lr-rx">${Object.keys(S.reacts).map(k => `<button type="button" data-rx="${k}" aria-label="React ${k}">${rxBtn(k)}<small>${S.reacts[k] || ''}</small></button>`).join('')}</div>` : ''}
    ${feed.length ? `<div class="lr-feed"><div class="lr-k">From listeners</div>${feed.map(x => `<div class="lr-fi${x.status === 'onair' ? ' air' : ''}"><b>${esc(x.name || 'A listener')}</b>${x.status === 'onair' ? '<em>On air now</em>' : ''}<p>${esc(x.text)}</p></div>`).join('')}</div>` : ''}`;
  function form(f, ph, btn) { return `<form class="lr-f lr-col" data-f="${f}">${nameIn()}<textarea name="t" rows="2" maxlength="240" placeholder="${ph}" required></textarea><button class="lr-send" type="submit">${btn}</button></form>`; }
}
const nameIn = () => `<input name="n" maxlength="30" placeholder="Your first name" value="${esc(me().name)}" autocomplete="given-name">`;
function board() { const e = Object.entries(S.board).sort((a, b) => b[1] - a[1]).slice(0, 5); if (!e.length) return ''; return `<div class="lr-board"><div class="lr-k">Leaderboard</div>${e.map(([n, s], i) => `<div><i>${i + 1}</i><span>${esc(n)}</span><b>${s}</b></div>`).join('')}</div>`; }
function onTap(e) {
  const a = S.act, t = e.target;
  const v = t.closest('[data-vote]'); if (v && a) { const i = +v.dataset.vote; S.votes[a.id] = S.votes[a.id] || {}; S.votes[a.id][i] = (S.votes[a.id][i] || 0) + 1; setMine('p' + a.id, i); vib(); save(); return; }
  const an = t.closest('[data-ans]'); if (an && a && !a.reveal) { const i = +an.dataset.ans; setMine('q' + a.id, i); a.answers = a.answers || {}; a.answers[me().id] = { i, n: me().name || 'A listener' }; vib(); save(); return; }
  const up = t.closest('[data-up]'); if (up) { const id = up.dataset.up, m = mine(), tv = m.tv || []; if (tv.includes(id)) return; const tp = S.topics.find(x => x.id === id); if (tp) { tp.votes++; setMine('tv', tv.concat(id)); vib(); save(); } return; }
  const rx = t.closest('[data-rx]'); if (rx) { const k = rx.dataset.rx; S.reacts[k] = (S.reacts[k] || 0) + 1; float(rx, k); vib(); save(); return; }
  const q = t.closest('[data-quick]'); if (q) { const f = q.dataset.quick; $('#lrQuick').innerHTML = `<form class="lr-f lr-col" data-f="${f}">${nameIn()}<textarea name="t" rows="2" maxlength="240" placeholder="${f === 'shout' ? 'Your shout-out' : 'Your question'}" required></textarea><button class="lr-send" type="submit">Send</button></form>`; return; }
}
function onSubmit(e) {
  e.preventDefault(); const f = e.target.closest('form'), k = f.dataset.f, v = Object.fromEntries(new FormData(f)); const name = (v.n || '').trim();
  if (name) { const m = me(); m.name = name; store.set('live_me', m); }
  if (k === 'topic') { const text = (v.t || '').trim(); if (!text) return; const id = uid(); S.topics.push({ id, text, votes: 1, by: name }); setMine('tv', (mine().tv || []).concat(id)); save(); toast('Topic added'); return; }
  const text = k === 'spot' ? `${(v.b || '').trim()}: ${(v.t || '').trim()}` : (v.t || '').trim(); if (!text) return;
  S.feed.push({ id: uid(), type: k, name: name || 'A listener', text, ph: v.ph || '', at: Date.now(), status: 'pending' }); save();
  toast({ ask: 'Question sent to the studio', speak: 'Request sent. The team may call you', shout: 'Shout-out sent. Listen out for it', spot: 'Nomination sent' }[k] || 'Sent');
}
const vib = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} };
function float(btn, k) { const r = btn.getBoundingClientRect(), el = document.createElement('div'); el.className = 'lr-fly'; el.innerHTML = rxBtn(k); el.style.left = (r.left + r.width / 2 - 14 + (Math.random() * 30 - 15)) + 'px'; el.style.top = (r.top - 10) + 'px'; document.body.appendChild(el); setTimeout(() => el.remove(), 1700); }

/* ================= STUDIO: the show team's controls ================= */
const TPL = {
  poll: [['What\'s the biggest challenge for your business right now?', ['Finding customers', 'Rising costs', 'Hiring staff', 'Cash flow']], ['Would you use a halal business directory in the Inspire app?', ['Yes, every week', 'Sometimes', 'Not yet']], ['How did you fund your first business idea?', ['Savings', 'Family', 'Islamic finance', 'Still saving']]],
  quiz: [['What does "riba" mean?', ['Interest', 'Profit share', 'Charity', 'Rent'], 0], ['A "murabaha" is…', ['A cost-plus sale', 'A loan with interest', 'A type of zakat', 'A business licence'], 0], ['Which is the halal way to grow savings?', ['A Shariah-screened ethical fund', 'A payday loan', 'A credit card balance', 'An interest savings account'], 0]],
  topics: ['What should we talk about in the next half hour?', 'Which business question do you want answered today?'],
  ask: ['Ask Summar anything about starting a business', 'Questions for today\'s guest'],
  speak: ['Want to come on air? Tell us your topic', 'Running a local business? Pitch it live in 30 seconds'],
  shout: ['Send a shout-out to someone listening', 'Shout out a local business you love'],
  spot: ['Nominate a Luton business for next week\'s spotlight']
};
function studio(node) {
  const en = Object.keys(shows()).filter(k => shows()[k].on && D.shows[k]);
  let showK = roomFor() ? roomFor().key : en.includes(onAir().key) ? onAir().key : (en[0] || onAir().key), mode = 'poll';
  const draw = () => {
    const cfg = shows()[showK] || { on: false, f: ALL.slice() }, sh = D.shows[showK], a = S.act, pend = S.feed.filter(x => x.status === 'pending' || x.status === 'live' || x.status === 'onair');
    const opts = Object.entries(D.shows).map(([k, s]) => `<option value="${k}" ${k === showK ? 'selected' : ''}>${esc(s.n)}</option>`).join('');
    const air = onAir(), isAir = air.key === showK;
    node.innerHTML = `<div class="lrs">
      <div class="lrs-c"><label class="lrs-l">Show<select id="lsShow">${opts}</select></label>
        <label class="lrs-sw"><input type="checkbox" id="lsOn" ${cfg.on ? 'checked' : ''}><span><b>Live room for this show</b><small>${cfg.on ? (isAir ? 'On air now: listeners can see it' : 'Opens for listeners when the show goes live') : 'Off: listeners won\'t see a live room'}</small></span></label>
        ${cfg.on ? `<details class="lrs-fe"><summary>Features listeners get (${cfg.f.length} of ${FEATURES.length})</summary>${FEATURES.map(([k, n, d]) => `<label><input type="checkbox" data-fe="${k}" ${cfg.f.includes(k) ? 'checked' : ''}><span><b>${n}</b><small>${d}</small></span></label>`).join('')}</details>
        <label class="lrs-sw"><input type="checkbox" id="lsPrev" ${S.preview === showK ? 'checked' : ''}><span><b>Open it now for testing</b><small>Shows this live room in the player even when the show isn't on air</small></span></label>` : ''}</div>
      ${cfg.on ? `
      <div class="lrs-c"><h4>Live now</h4>${a ? liveNow(a) : '<p class="lrs-m">Nothing running. Start something below.</p>'}</div>
      <div class="lrs-c"><h4>Start something</h4><div class="lrs-modes" data-nodd>${FEATURES.filter(([k]) => k !== 'react' && cfg.f.includes(k)).map(([k, n]) => `<button type="button" data-mode="${k}" aria-pressed="${k === mode}">${n}</button>`).join('')}</div><div id="lsForm"></div></div>
      <div class="lrs-c"><h4>Inbox <small>${S.feed.filter(x => x.status === 'pending').length} new</small></h4>${pend.length ? pend.slice().reverse().map(x => `<div class="lrs-i ${x.status}"><div><span class="lrs-t">${({ ask: 'Question', speak: 'Wants to speak', shout: 'Shout-out', spot: 'Spotlight' })[x.type] || 'Message'}</span><b>${esc(x.name)}</b><p>${esc(x.text)}</p>${x.ph ? `<a class="lrs-ph" href="tel:${esc(x.ph.replace(/\s/g, ''))}">${I('phone')} Call ${esc(x.ph)}</a>` : ''}</div><div class="lrs-ia">${x.status === 'pending' ? `<button type="button" data-it="live:${x.id}">Show to listeners</button>` : ''}${x.status !== 'onair' ? `<button type="button" data-it="onair:${x.id}">On air now</button>` : ''}<button type="button" data-it="done:${x.id}">Done</button></div></div>`).join('') : '<p class="lrs-m">Questions, shout-outs and requests to speak arrive here.</p>'}</div>
      <div class="lrs-c"><h4>Pinned note</h4><form id="lsPin" class="lrs-row"><input name="p" maxlength="120" placeholder="e.g. Text the studio on 07779 481822" value="${esc(S.pin)}"><button type="submit" class="lrs-go">Pin</button></form>${S.pin ? '<button type="button" class="lrs-lnk" id="lsUnpin">Remove pinned note</button>' : ''}</div>
      <div class="lrs-c lrs-stats"><div><b>${Object.values(S.reacts).reduce((x, y) => x + y, 0)}</b><small>reactions</small></div><div><b>${S.topics.length}</b><small>topics</small></div><div><b>${S.feed.length}</b><small>messages</small></div><button type="button" class="lrs-lnk" id="lsClear">Clear the room</button></div>` : ''}
      <p class="lrs-m">On this preview, listeners and studio sync on the same device (open the player in another tab to see it live). Connected to a server, it works across everyone's phones.</p></div>`;
    $('#lsShow', node).onchange = e => { showK = e.target.value; draw(); };
    $('#lsOn', node).onchange = e => { const all = Object.assign({}, store.get('live_shows', {})); all[showK] = Object.assign({ f: ALL.slice() }, shows()[showK], { on: e.target.checked }); store.set('live_shows', all); if (!e.target.checked && S.preview === showK) S.preview = ''; save(); draw(); };
    $$('[data-fe]', node).forEach(c => c.onchange = () => { const all = Object.assign({}, store.get('live_shows', {})); const f = $$('[data-fe]', node).filter(x => x.checked).map(x => x.dataset.fe); all[showK] = Object.assign({}, shows()[showK], { f }); store.set('live_shows', all); save(); draw(); });
    const pv = $('#lsPrev', node); if (pv) pv.onchange = e => { S.preview = e.target.checked ? showK : ''; save(); draw(); };
    $$('[data-mode]', node).forEach(b => b.onclick = () => { mode = b.dataset.mode; draw(); });
    $$('[data-it]', node).forEach(b => b.onclick = () => { const [st, id] = b.dataset.it.split(':'), x = S.feed.find(y => y.id === id); if (!x) return; if (st === 'onair') S.feed.forEach(y => { if (y.status === 'onair') y.status = 'live'; }); x.status = st; save(); draw(); });
    const pin = $('#lsPin', node); if (pin) pin.onsubmit = e => { e.preventDefault(); S.pin = new FormData(pin).get('p').trim(); save(); draw(); toast(S.pin ? 'Pinned for listeners' : 'Pinned note removed'); };
    const up = $('#lsUnpin', node); if (up) up.onclick = () => { S.pin = ''; save(); draw(); };
    const cl = $('#lsClear', node); if (cl) cl.onclick = () => { if (!confirm('Clear votes, topics, messages and reactions for a fresh show?')) return; const keep = { preview: S.preview, pin: S.pin }; S = Object.assign(blank(), keep); save(); draw(); };
    $$('[data-end]', node).forEach(b => b.onclick = () => { S.act = null; save(); draw(); });
    const rv = $('[data-reveal]', node); if (rv) rv.onclick = () => { const a2 = S.act; a2.reveal = true; Object.values(a2.answers || {}).forEach(x => { if (x.i === a2.ans) S.board[x.n] = (S.board[x.n] || 0) + 1; }); save(); draw(); };
    if (cfg.on) formFor(mode);
  };
  function liveNow(a) {
    let res = '';
    if (a.type === 'poll') { const v = S.votes[a.id] || {}, tot = Object.values(v).reduce((x, y) => x + y, 0); res = a.opts.map((o, i) => { const pc = tot ? Math.round((v[i] || 0) / tot * 100) : 0; return `<div class="lr-res"><i style="width:${pc}%"></i><span>${esc(o)}</span><b>${v[i] || 0}</b></div>`; }).join('') + `<small class="lrs-m">${tot} votes</small>`; }
    else if (a.type === 'quiz') { const ans = Object.values(a.answers || {}); res = a.opts.map((o, i) => `<div class="lr-res${i === a.ans ? ' me' : ''}"><i style="width:${ans.length ? Math.round(ans.filter(x => x.i === i).length / ans.length * 100) : 0}%"></i><span>${esc(o)}${i === a.ans ? ' (answer)' : ''}</span><b>${ans.filter(x => x.i === i).length}</b></div>`).join('') + (a.reveal ? '<small class="lrs-m">Answer revealed. Leaderboard updated.</small>' : `<button type="button" class="lrs-go" data-reveal>Reveal the answer</button>`) + board(); }
    else if (a.type === 'topics') res = S.topics.slice().sort((x, y) => y.votes - x.votes).slice(0, 8).map(t => `<div class="lr-res"><span>${esc(t.text)}</span><b>${t.votes}</b></div>`).join('') || '<small class="lrs-m">No topics yet.</small>';
    else res = `<small class="lrs-m">Replies arrive in the Inbox below.</small>`;
    return `<div class="lrs-now"><span class="lr-k">${FEATURES.find(f => f[0] === a.type)[1]}</span><b>${esc(a.q)}</b>${res}<button type="button" class="lrs-end" data-end>End</button></div>`;
  }
  function formFor(k) {
    const box = $('#lsForm', node), t = TPL[k] || [];
    const chips = t.length ? `<div class="lrs-tpl"><small>Ready-made for ${esc(D.shows[showK].n)}</small>${t.map((x, i) => `<button type="button" data-tpl="${i}">${esc(Array.isArray(x) ? x[0] : x)}</button>`).join('')}</div>` : '';
    if (k === 'poll' || k === 'quiz') box.innerHTML = `${chips}<form id="lsF" class="lrs-col"><input name="q" maxlength="120" placeholder="${k === 'poll' ? 'Ask listeners a question' : 'Quiz question'}" required>${[0, 1, 2, 3].map(i => `<div class="lrs-row">${k === 'quiz' ? `<input type="radio" name="a" value="${i}" ${i === 0 ? 'checked' : ''} aria-label="Correct answer">` : ''}<input name="o${i}" maxlength="60" placeholder="Option ${i + 1}${i > 1 ? ' (optional)' : ''}" ${i < 2 ? 'required' : ''}></div>`).join('')}${k === 'quiz' ? '<small class="lrs-m">Tick the right answer. Listeners see it when you reveal.</small>' : ''}<button type="submit" class="lrs-go">${k === 'poll' ? 'Start poll' : 'Ask quiz question'}</button></form>`;
    else box.innerHTML = `${chips}<form id="lsF" class="lrs-col"><input name="q" maxlength="120" placeholder="What listeners see" value="${esc(t[0] || '')}" required><button type="submit" class="lrs-go">Open ${esc(FEATURES.find(f => f[0] === k)[1].toLowerCase())}</button></form>`;
    const f = $('#lsF', node);
    $$('[data-tpl]', box).forEach(b => b.onclick = () => { const x = t[+b.dataset.tpl]; if (Array.isArray(x)) { f.q.value = x[0]; x[1].forEach((o, i) => { if (f['o' + i]) f['o' + i].value = o; }); [0, 1, 2, 3].forEach(i => { if (i >= x[1].length && f['o' + i]) f['o' + i].value = ''; }); if (k === 'quiz') $$('[name=a]', f)[x[2]].checked = true; } else f.q.value = x; });
    f.onsubmit = e => { e.preventDefault(); const v = Object.fromEntries(new FormData(f)), id = uid();
      if (k === 'poll' || k === 'quiz') { const o = [0, 1, 2, 3].map(i => (v['o' + i] || '').trim()).filter(Boolean); if (o.length < 2) { toast('Add at least two options'); return; } S.act = { id, type: k, q: v.q.trim(), opts: o, ans: k === 'quiz' ? Math.min(+v.a || 0, o.length - 1) : null, reveal: false, answers: {}, at: Date.now() }; }
      else S.act = { id, type: k, q: v.q.trim(), at: Date.now() };
      save(); draw(); toast('Live for listeners'); };
  }
  draw();
  const re = () => { if (node.isConnected && !node.contains(document.activeElement)) draw(); };
  studioRedraw = re;
}
let studioRedraw = null;
function paint() { listener(); if (studioRedraw) studioRedraw(); }

/* keep the player's live room in step with what's playing */
const npObs = new MutationObserver(() => { clearTimeout(npObs.t); npObs.t = setTimeout(listener, 60); });
const watchNP = () => { const np = $('#np'); if (!np) return; npObs.observe(np, { attributes: true, attributeFilter: ['class', 'hidden'] }); const t = $('#npTitle'); if (t) npObs.observe(t, { childList: true, characterData: true, subtree: true }); const lv = $('#npLive'); if (lv) npObs.observe(lv, { attributes: true }); };
watchNP(); setInterval(listener, 60e3); listener();

/* studio entry points: Studio → Live room tab, and #tb-liveroom */
TOOLS.liveroom = ['Live room', null, node => studio(node)];
window.IFM_LIVE = { studio, state: () => S };
document.addEventListener('click', e => { const b = e.target.closest('#stTabs [data-t="live"]'); if (!b) return; e.stopImmediatePropagation(); $$('#stTabs button').forEach(x => x.setAttribute('aria-pressed', x === b)); const body = $('#stBody'); if (body) studio(body); }, true);
const addTab = () => { const t = $('#stTabs'); if (t && !$('[data-t="live"]', t)) t.insertAdjacentHTML('beforeend', '<button type="button" data-t="live" aria-pressed="false">Live room</button>'); };
new MutationObserver(addTab).observe(document.body, { childList: true, subtree: true });

/* ---------- styles ---------- */
const css = document.createElement('style'); css.textContent = `
.lr{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:14px;display:grid;gap:12px;color:#fff}
.lr-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.lr-h b{font-family:var(--display);font-size:1.05rem}.lr-h small{color:rgba(255,255,255,.7);font-size:.8rem}
.lr-dot{width:9px;height:9px;border-radius:50%;background:#ff4d5e;box-shadow:0 0 0 0 rgba(255,77,94,.7);animation:lrPulse 1.6s infinite}@keyframes lrPulse{70%{box-shadow:0 0 0 9px rgba(255,77,94,0)}100%{box-shadow:0 0 0 0 rgba(255,77,94,0)}}
.lr-pin{display:flex;gap:8px;align-items:center;padding:10px 12px;border-radius:14px;background:color-mix(in srgb,var(--np1,#8cc63f) 35%,transparent);font-weight:700;font-size:.9rem}.lr-pin .ico{width:16px;height:16px;flex:none}
.lr-card{background:rgba(0,0,0,.25);border-radius:18px;padding:14px;display:grid;gap:10px}
.lr-k{font-size:.7rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.65)}
.lr-card h4{margin:0;font-family:var(--display);font-size:1.12rem;line-height:1.25}.lr-p{margin:0;color:rgba(255,255,255,.75);font-size:.9rem}
.lr-opts{display:grid;gap:8px}
.lr-opt{min-height:48px;border-radius:14px;border:1.5px solid rgba(255,255,255,.22);background:rgba(255,255,255,.06);color:#fff;font:inherit;font-weight:700;text-align:left;padding:10px 14px;cursor:pointer}
.lr-opt:active{transform:scale(.98)}.lr-opt.sel{border-color:#fff;background:rgba(255,255,255,.18)}.lr-opt.ok{border-color:#8cc63f;background:rgba(140,198,63,.3)}.lr-opt.no{border-color:#ff6b6b;background:rgba(255,107,107,.22)}.lr-opt:disabled{cursor:default;opacity:1}
.lr-res{position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px;padding:0 14px;border-radius:14px;background:rgba(255,255,255,.07);overflow:hidden;font-weight:700}
.lr-res i{position:absolute;left:0;top:0;bottom:0;background:color-mix(in srgb,var(--np1,#8cc63f) 55%,rgba(255,255,255,.15));border-radius:14px;transition:width .6s cubic-bezier(.2,.8,.2,1)}
.lr-res span,.lr-res b{position:relative}.lr-res.me{box-shadow:0 0 0 2px #fff inset}
.lr-note{color:rgba(255,255,255,.65);font-size:.8rem}
.lr-f{display:flex;gap:8px}.lr-f.lr-col{flex-direction:column}
.lr-f input,.lr-f textarea{flex:1;min-height:46px;border-radius:14px;border:1.5px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:inherit;padding:10px 12px;resize:none}
.lr-f input::placeholder,.lr-f textarea::placeholder{color:rgba(255,255,255,.55)}
.lr-send{min-height:46px;border-radius:14px;border:0;background:#fff;color:#111;font:inherit;font-weight:800;padding:0 16px;cursor:pointer}
.lr-tops{display:grid;gap:6px}.lr-top{display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:46px;padding:0 12px 0 14px;border-radius:14px;border:0;background:rgba(255,255,255,.07);color:#fff;font:inherit;font-weight:700;text-align:left;cursor:pointer}
.lr-top b{display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.12)}.lr-top b .ico{width:13px;height:13px;transform:rotate(-90deg)}.lr-top.on b{background:#8cc63f;color:#111}
.lr-rx{display:flex;justify-content:space-between;gap:6px}
.lr-rx button{flex:1;min-height:52px;border-radius:16px;border:0;background:rgba(255,255,255,.08);color:#fff;display:grid;place-items:center;gap:0;padding:6px 2px;cursor:pointer;font:inherit}
.lr-rx button:active{transform:scale(.92)}.lr-rx small{font-size:.68rem;color:rgba(255,255,255,.65);min-height:1em}.lr-word{font-size:.72rem;font-weight:800;letter-spacing:.02em}
.lr-fly{position:fixed;z-index:400;pointer-events:none;width:28px;height:28px;display:grid;place-items:center;color:#fff;animation:lrFly 1.7s ease-out forwards}.lr-fly .lr-word{white-space:nowrap;background:rgba(140,198,63,.9);color:#111;padding:3px 8px;border-radius:999px}
@keyframes lrFly{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:1;transform:translateY(-20px) scale(1.1)}100%{transform:translateY(-220px) translateX(18px) scale(1);opacity:0}}
.lr-quick{display:flex;gap:8px;flex-wrap:wrap}.lr-qb{min-height:44px;border-radius:999px;border:1.5px solid rgba(255,255,255,.3);background:none;color:#fff;font:inherit;font-weight:800;padding:0 16px;cursor:pointer}
.lr-feed{display:grid;gap:8px}.lr-fi{padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.06)}.lr-fi b{font-size:.86rem}.lr-fi p{margin:2px 0 0;font-size:.9rem;color:rgba(255,255,255,.85)}
.lr-fi.air{background:color-mix(in srgb,var(--np1,#8cc63f) 40%,transparent)}.lr-fi em{font-style:normal;font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-left:8px;padding:2px 7px;border-radius:999px;background:#ff4d5e}
.lr-board{display:grid;gap:4px;margin-top:4px}.lr-board>div:not(.lr-k){display:grid;grid-template-columns:22px 1fr auto;gap:8px;align-items:center;font-weight:700;font-size:.9rem}.lr-board i{font-style:normal;color:rgba(255,255,255,.6)}
@media (prefers-reduced-motion:reduce){.lr-dot,.lr-fly{animation:none!important}.lr-fly{display:none}}
/* studio */
.lrs{display:grid;gap:12px}.lrs-c{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px;display:grid;gap:10px}
.lrs-c h4{margin:0;font-family:var(--display);display:flex;justify-content:space-between;align-items:center}.lrs-c h4 small{font-family:var(--body);font-size:.78rem;color:#fff;background:#ff4d5e;padding:3px 9px;border-radius:999px}
.lrs-l{display:grid;gap:6px;font-weight:800;font-size:.85rem}.lrs-l select{min-height:46px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:inherit;padding:0 12px}
.lrs .lrs-sw,.lrs .lrs-fe label{display:grid!important;grid-template-columns:24px minmax(0,1fr);gap:12px;align-items:start;cursor:pointer;margin:0}.lrs .lrs-sw input,.lrs .lrs-fe input{width:22px!important;height:22px!important;min-height:0!important;margin:2px 0 0!important;padding:0!important;accent-color:#2f7d32;appearance:auto;-webkit-appearance:checkbox}
.lrs-sw b,.lrs-fe b{display:block}.lrs-sw small,.lrs-fe small{color:var(--mut);font-size:.82rem}
.lrs-fe summary{font-weight:800;min-height:40px;display:flex;align-items:center;cursor:pointer}.lrs-fe[open]{display:grid;gap:10px}
.lrs-m{margin:0;color:var(--mut);font-size:.84rem}
.lrs-modes{display:flex;gap:6px;flex-wrap:wrap}.lrs-modes button{min-height:40px;border-radius:999px;border:1.5px solid var(--line);background:none;color:var(--ink);font:inherit;font-weight:800;font-size:.85rem;padding:0 14px;cursor:pointer}.lrs-modes button[aria-pressed=true]{background:var(--ink);color:var(--card);border-color:var(--ink)}
.lrs-tpl{display:grid;gap:6px}.lrs-tpl small{color:var(--mut);font-weight:800;font-size:.75rem;letter-spacing:.06em;text-transform:uppercase}.lrs-tpl button{text-align:left;min-height:44px;border-radius:12px;border:1px dashed var(--line);background:none;color:var(--ink);font:inherit;font-size:.88rem;padding:8px 12px;cursor:pointer}
.lrs-col{display:grid;gap:8px}.lrs-row{display:flex;gap:8px;align-items:center}
.lrs input:not([type=checkbox]):not([type=radio]){flex:1;min-height:46px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:inherit;padding:0 12px;width:100%}
.lrs input[type=radio]{width:22px;height:22px;accent-color:#2f7d32;flex:none}
.lrs-go{min-height:46px;border-radius:14px;border:0;background:#2f7d32;color:#fff;font:inherit;font-weight:800;padding:0 18px;cursor:pointer}
.lrs-now{display:grid;gap:8px;padding:12px;border-radius:16px;background:#0f3b2e;color:#fff}.lrs-now .lr-k{color:#bfe3a0}.lrs-now .lr-res{background:rgba(255,255,255,.08)}.lrs-now .lrs-m{color:rgba(255,255,255,.7)}
.lrs-end{min-height:42px;border-radius:12px;border:1.5px solid rgba(255,255,255,.35);background:none;color:#fff;font:inherit;font-weight:800;cursor:pointer}
.lrs-i{display:grid;gap:8px;padding:12px;border-radius:14px;border:1px solid var(--line)}.lrs-i.pending{border-color:#ff4d5e}.lrs-i.onair{background:color-mix(in srgb,#2f7d32 12%,transparent);border-color:#2f7d32}
.lrs-i p{margin:2px 0 0}.lrs-t{display:inline-block;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-right:8px}
.lrs-ph{display:inline-flex;gap:6px;align-items:center;margin-top:6px;font-weight:800;color:#2f7d32;text-decoration:none}.lrs-ph .ico{width:15px;height:15px}
.lrs-ia{display:flex;gap:6px;flex-wrap:wrap}.lrs-ia button{min-height:40px;border-radius:12px;border:1.5px solid var(--line);background:none;color:var(--ink);font:inherit;font-weight:800;font-size:.84rem;padding:0 12px;cursor:pointer}
.lrs-stats{grid-template-columns:repeat(3,1fr)}.lrs-stats div{text-align:center}.lrs-stats b{display:block;font-family:var(--display);font-size:1.4rem}.lrs-stats small{color:var(--mut)}.lrs-stats .lrs-lnk{grid-column:1/-1}
.lrs-lnk{background:none;border:0;color:#c62828;font:inherit;font-weight:800;min-height:40px;cursor:pointer;justify-self:start}
.lrs-now .lr-board>div:not(.lr-k){color:#fff}
`; document.head.appendChild(css);
})();
