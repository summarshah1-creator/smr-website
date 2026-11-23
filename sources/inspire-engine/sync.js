/* Inspire FM · Your progress: saved on this phone straight away, and (once someone makes an account with an emailed code)
   synced to their account automatically. Nothing is guaranteed safe until an account is made, and the app says so plainly.
   Server: api/account.php on the live site (PHP + SQLite). In the preview, where there is no server, account saving says it isn't live yet. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, store, toast, esc } = X;
const API = (window.IFM_API_BASE || 'api/') + 'account.php';
const LOCAL = /^(acct|_ts|_sync|usedays|savePrompt|dgRemLast|tsx)/;

/* ---------- local data ---------- */
const keys = () => Object.keys(localStorage).filter(k => k.startsWith('ifm_') && !LOCAL.test(k.slice(4))).map(k => k.slice(4));
const tsMap = () => { try { return JSON.parse(localStorage.getItem('ifm__ts') || '{}'); } catch (e) { return {}; } };
function snapshot() { const ts = tsMap(), out = {}; keys().forEach(k => { let v; try { v = JSON.parse(localStorage.getItem('ifm_' + k)); } catch (e) { return; } out[k] = { v, t: ts[k] || 0 }; }); return out; }
function summary() {
  const ks = keys(), pk = ks.filter(k => k.startsWith('pr_')); let prayed = 0;
  pk.forEach(k => { const d = store.get(k, {}); if (d && typeof d === 'object') prayed += Object.values(d).filter(Boolean).length; });
  return { n: ks.length, prayed, days: pk.length };
}
/* merge: newest wins per item; lists of days/ids are combined so nothing tracked is lost */
function mergeVal(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return [...new Set([...a, ...b].map(x => JSON.stringify(x)))].map(x => JSON.parse(x));
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) { const o = Object.assign({}, a); Object.keys(b).forEach(k => { o[k] = k in a ? mergeVal(a[k], b[k]) : b[k]; }); return o; }
  return b;
}
function applyRemote(remote) {
  const ts = tsMap(); let changed = 0;
  Object.entries(remote || {}).forEach(([k, r]) => { if (LOCAL.test(k)) return; const cur = localStorage.getItem('ifm_' + k); const lt = ts[k] || 0;
    let v = r.v; if (cur != null) { let lv; try { lv = JSON.parse(cur); } catch (e) {} if (/^(pr_|dgDays|duaBm|dgFav|dgMine|ayah|ts_)/i.test(k)) v = mergeVal(lv, r.v); else if (lt > r.t) return; }
    localStorage.setItem('ifm_' + k, JSON.stringify(v)); ts[k] = Math.max(lt, r.t || 0); changed++; });
  localStorage.setItem('ifm__ts', JSON.stringify(ts)); return changed;
}

/* ---------- quietly ask the phone to keep our data ---------- */
let asked = false;
function persist() { if (asked || !navigator.storage || !navigator.storage.persist) return; asked = true; navigator.storage.persisted().then(p => p || navigator.storage.persist()).catch(() => {}); }
addEventListener('pointerdown', persist, { once: true, passive: true });

/* ---------- server ---------- */
const acct = () => store.get('acct', null);
let live = null; // null = unknown, true/false after the first check
async function call(a, body) {
  const opt = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {};
  const r = await fetch(`${API}?a=${a}`, Object.assign({ cache: 'no-store' }, opt)); const ct = r.headers.get('content-type') || '';
  if (!ct.includes('json')) { live = false; throw new Error('offline'); } live = true; const j = await r.json(); if (!r.ok || j.error) throw new Error(j.error || 'failed'); return j;
}
async function checkLive() { if (live !== null) return live; try { await call('ping'); } catch (e) {} return live; }
let pushT = null, busy = false;
async function sync(quiet = true) {
  const A = acct(); if (!A || busy) return; busy = true;
  try { const r = await call('pull', { token: A.token }); applyRemote(r.data || {}); await call('push', { token: A.token, data: snapshot() });
    store.set('_sync', Date.now()); if (!quiet) toast && toast('Progress saved to your account'); }
  catch (e) { if (/token|auth/i.test(e.message)) { store.set('acct', null); if (!quiet) toast && toast('Please sign in again'); } }
  finally { busy = false; }
}
document.addEventListener('ifm:saved', () => { if (!acct()) return; clearTimeout(pushT); pushT = setTimeout(() => sync(true), 5000); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync(true); });
setTimeout(() => sync(true), 3000);

/* ---------- the save-your-progress flow ---------- */
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const ua = navigator.userAgent, ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), sam = /SamsungBrowser/i.test(ua);
let sheet, step = 'home', email = '', pending = '', pollT = null;
function frame(inner) { return `<div class="sv-head"><b>Save your progress</b><button type="button" class="sv-x" data-svclose aria-label="Close">Close</button></div><div class="sv-body">${inner}</div>`; }
function view() {
  if (step === 'home') return frame(standalone() ? `<p class="sv-lead">Your prayer tracker, streaks, saved duas and notes are saved on this phone. Make a free account and they're backed up automatically, so you never lose them, even on a new phone.</p>
      <button type="button" class="btn g" data-sv="email">Continue with my email</button><p class="sv-sm">No password. We email you a 6-digit code.</p>`
    : `<div class="sv-app"><img src="icons/icon-192.png" alt=""><div><b>Get the Inspire FM app on your phone</b><small>It's free, takes 10 seconds, and needs no app store.</small></div></div>
      <ul class="sv-why">${[['Prayer time alerts', 'with the adhan, before every salah'], ['Events and activities', 'what\'s on in Luton, as it\'s announced'], ['News and announcements', 'appeals, janazah notices and updates'], ['Opens in one tap', 'full screen, like any other app'], ['Your progress kept safer', 'tracker, streaks and saved duas']].map(([b, s]) => `<li><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span><b>${b}</b> ${s}</span></li>`).join('')}</ul>
      <button type="button" class="btn g" data-sv="install">Show me how</button><div class="sv-row"><button type="button" class="btn ghost sm" data-sv="email">It's already on my Home Screen</button></div>`);
  if (step === 'install') return frame(`<p class="sv-lead">Three quick steps. Then open Inspire FM from your Home Screen and turn on the alerts you want.</p>
    ${ios ? `<ol class="sv-ol"><li>Open this page in <b>Safari</b> and tap <b>Share</b>.</li><li>Tap <b>Add to Home Screen</b>, then <b>Add</b>.</li><li>Open <b>Inspire FM</b> from your Home Screen.</li></ol>` : sam ? `<ol class="sv-ol"><li>Easiest: open this page in <b>Chrome</b>, tap the menu (three dots) and <b>Add to Home screen</b>.</li><li>Or in Samsung Internet: menu at the bottom right › <b>Add page to</b> › <b>Home screen</b>.</li><li>If you see a "Play Protect" or "not safe" message, tap <b>Install anyway</b>. It's safe.</li></ol>` : `<ol class="sv-ol"><li>In <b>Chrome</b>, tap the menu (three dots) at the top right.</li><li>Tap <b>Add to Home screen</b> or <b>Install app</b>.</li><li>Open <b>Inspire FM</b> from your Home Screen.</li></ol>`}
    <div class="sv-row"><button type="button" class="btn g sm" data-sv="email">Done, save my progress</button><button type="button" class="btn ghost sm" data-svclose>Later</button></div>`);
  if (step === 'email') return frame(`<p class="sv-lead">Enter your email. We'll send you a 6-digit code. No password needed.</p>
    <label class="sv-f">Your email<input id="svEmail" type="email" inputmode="email" autocomplete="email" value="${esc(email)}" placeholder="name@example.com"></label><p class="sv-err" id="svErr"></p>
    <button type="button" class="btn g" data-sv="send">Send my code</button><p class="sv-sm">We only use your email to save your progress. You can delete your account at any time.</p>`);
  if (step === 'code') return frame(`<p class="sv-lead">We've sent a code to <b>${esc(email)}</b>. Type it below, or tap the link in the email. This screen will update on its own.</p>
    <label class="sv-f">6-digit code<input id="svCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" placeholder="123456"></label><p class="sv-err" id="svErr"></p>
    <button type="button" class="btn g" data-sv="verify">Confirm</button><div class="sv-row"><button type="button" class="btn ghost sm" data-sv="send">Send a new code</button><button type="button" class="btn ghost sm" data-sv="email">Change email</button></div><p class="sv-sm">Can't see it? Check your spam folder. Codes last 15 minutes.</p>`);
  if (step === 'done') { const s = summary(); return frame(`<div class="sv-ok"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><b>Your progress is saved</b><small>Signed in as ${esc((acct() || {}).email || email)}. From now on it saves to your account automatically.</small></div><button type="button" class="btn g" data-svclose>Done</button>`); }
  if (step === 'offline') return frame(`<p class="sv-lead">Saving to an account switches on when the app goes live on inspirefm.org. For now, your progress is saved on this phone.</p><button type="button" class="btn g" data-svclose>OK</button>`);
  return '';
}
function draw() { $('.sv-sheet', sheet).innerHTML = view(); const i = $('#svEmail', sheet) || $('#svCode', sheet); if (i) setTimeout(() => i.focus(), 250); }
function open(s) { if (!sheet) { sheet = document.createElement('div'); sheet.className = 'sv-wrap'; sheet.hidden = true; sheet.innerHTML = '<div class="sv-dim" data-svclose></div><div class="sv-sheet" role="dialog" aria-modal="true" aria-label="Save your progress"></div>'; document.body.appendChild(sheet); bind(); }
  step = s || (acct() ? 'done' : 'home'); draw(); sheet.hidden = false; requestAnimationFrame(() => sheet.classList.add('on')); }
function close() { if (!sheet) return; sheet.classList.remove('on'); clearInterval(pollT); setTimeout(() => { sheet.hidden = true; }, 280); document.dispatchEvent(new CustomEvent('ifm:acct')); }
const err = t => { const e = $('#svErr', sheet); if (e) e.textContent = t; };
async function finish(r) { store.set('acct', { email: r.email || email, token: r.token }); clearInterval(pollT); step = 'done'; draw(); await sync(true); document.dispatchEvent(new CustomEvent('ifm:acct')); }
function bind() {
  sheet.addEventListener('click', async e => {
    const t = e.target.closest('[data-sv],[data-svclose]'); if (!t) return;
    if (t.hasAttribute('data-svclose')) { close(); return; }
    const go = t.dataset.sv;
    if (go === 'install' || go === 'email') { if (go === 'email' && !(await checkLive())) { step = 'offline'; draw(); return; } step = go; draw(); return; }
    if (go === 'send') { const v = ($('#svEmail', sheet) || {}).value; if (v !== undefined) email = v.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) { step = 'email'; draw(); err('Enter a valid email address.'); return; }
      t.disabled = true; try { const r = await call('start', { email }); pending = r.pending; step = 'code'; draw();
        clearInterval(pollT); pollT = setInterval(async () => { try { const s = await call('status', { pending }); if (s.token) finish(s); } catch (x) {} }, 3000); }
      catch (x) { t.disabled = false; err(x.message === 'offline' ? 'Account saving isn\'t live yet.' : x.message === 'rate' ? 'Too many codes sent. Try again in a little while.' : 'Couldn\'t send the code. Check your internet and try again.'); } return; }
    if (go === 'verify') { const c = ($('#svCode', sheet).value || '').replace(/\D/g, ''); if (c.length !== 6) { err('Enter the 6-digit code from your email.'); return; }
      t.disabled = true; try { finish(await call('verify', { pending, code: c })); } catch (x) { t.disabled = false; err(x.message === 'expired' ? 'That code has expired. Send a new one.' : x.message === 'tries' ? 'Too many tries. Send a new code.' : 'That code isn\'t right. Try again.'); } }
  });
  sheet.addEventListener('input', e => { if (e.target.id === 'svCode' && e.target.value.replace(/\D/g, '').length === 6) $('[data-sv=verify]', sheet).click(); });
}

/* ---------- a gentle reminder after real use (never blocks anything) ---------- */
(function remind() {
  const d = new Date().toISOString().slice(0, 10), u = store.get('usedays', []); if (!u.includes(d)) { u.push(d); store.set('usedays', u.slice(-60)); }
  if (acct()) return; const p = store.get('savePrompt', { n: 0, at: 0 }); if (p.n >= 2 || Date.now() - p.at < 30 * 864e5) return;
  const s = summary(); if (u.length < 7 && s.prayed < 20) return;
  setTimeout(() => { if (document.querySelector('.scr-wrap.on, .st-wrap.on, .sv-wrap.on')) return;
    const c = document.createElement('div'); c.className = 'sv-nudge'; c.innerHTML = `<div><b>Keep your progress safe</b><small>Back it up so you never lose your tracker and streaks, even on a new phone.</small></div><div class="sv-row"><button type="button" class="btn g sm" data-n="yes">Save my progress</button><button type="button" class="btn ghost sm" data-n="no">Not now</button></div>`;
    document.body.appendChild(c); requestAnimationFrame(() => c.classList.add('on'));
    c.addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (!b) return; store.set('savePrompt', { n: p.n + 1, at: Date.now() }); c.classList.remove('on'); setTimeout(() => c.remove(), 300); if (b.dataset.n === 'yes') open(); }); }, 6000);
})();

/* ---------- for Settings ---------- */
function section() {
  const A = acct(), s = summary(), last = store.get('_sync', 0);
  return `<section class="st-sec"><h3><svg class="st-i" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a5 5 0 0 1-.6-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/><path d="M12 11v6M9.5 13.5 12 11l2.5 2.5"/></g></svg>Your progress</h3>
    ${A ? `<div class="st-row"><div><b>Saved to your account</b><small>${esc(A.email)}${last ? ' · last synced ' + new Date(last).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</small></div><span class="sv-pill">Synced</span></div>
      <button type="button" class="st-row st-link" data-acct="sync"><div><b>Sync now</b></div><span>›</span></button>`
      : `<div class="st-row"><div><b>Saved on this phone only</b><small>${s.prayed ? s.prayed + ' prayers tracked · ' : ''}Not backed up. Clearing browser data or deleting the app would lose it.</small></div><span class="sv-pill warn">Not backed up</span></div>
      <button type="button" class="st-row st-link" data-acct="save"><div><b>Save my progress</b><small>Free account with an emailed code. Restores on any phone.</small></div><span>›</span></button>`}
    <button type="button" class="st-row st-link" data-acct="reset"><div><b>Reset the app on this phone</b><small>${A ? 'Clears this phone. Your account keeps everything, and you can restore it.' : 'Clears your tracker, streaks, notes and settings on this phone.'}</small></div><span>›</span></button>
    ${A ? `<button type="button" class="st-row st-link" data-acct="restore"><div><b>Restore from my account</b></div><span>›</span></button>
      <button type="button" class="st-row st-link" data-acct="out"><div><b>Sign out</b><small>Your progress stays saved in your account.</small></div><span>›</span></button>
      <button type="button" class="st-row st-link sv-danger" data-acct="delete"><div><b>Delete my account and saved progress</b></div><span>›</span></button>` : ''}</section>`;
}
async function action(k) {
  const A = acct();
  if (k === 'save') { open(); return; }
  if (k === 'sync') { await sync(false); return; }
  if (k === 'reset') { if (!confirm(A ? 'Clear the app on this phone? Your account keeps your progress.' : 'Reset the app? Your tracker, streaks, notes and settings on this phone will be deleted.')) return;
    keys().concat(['_ts', '_sync']).forEach(x => localStorage.removeItem('ifm_' + x)); toast && toast('App reset on this phone'); setTimeout(() => location.reload(), 600); return; }
  if (k === 'restore' && A) { try { const r = await call('pull', { token: A.token }); Object.entries(r.data || {}).forEach(([x, o]) => localStorage.setItem('ifm_' + x, JSON.stringify(o.v))); toast && toast('Progress restored'); setTimeout(() => location.reload(), 600); } catch (e) { toast && toast('Couldn\'t reach your account. Try again.'); } return; }
  if (k === 'out') { if (!confirm('Sign out on this phone? Your progress stays saved in your account.')) return; try { await call('logout', { token: A.token }); } catch (e) {} store.set('acct', null); return; }
  if (k === 'delete' && A) { if (!confirm('Delete your account and all saved progress on our server? Your progress on this phone stays until you reset the app.')) return; try { await call('delete', { token: A.token }); } catch (e) {} store.set('acct', null); toast && toast('Account deleted'); }
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-acct]'); if (!b) return; e.preventDefault(); action(b.dataset.acct).then(() => document.dispatchEvent(new CustomEvent('ifm:acct'))); });
window.IFM_SYNC = { open, section, sync, snapshot };
})();
