/* Inspire FM · listener voice: a suggestion box (Discover + menu), star ratings and comments on podcasts and shows
   (in the player), and short feedback prompts the team can send out (shown as a card on home when one is running).
   Until the back end is live, answers are kept on the phone and sent on with the usual email / WhatsApp step. */
(function () {
'use strict';
const X = window.IFMX; if (!X) return;
const { $, $$, esc, store, toast, modal, closeModal, D } = X;
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
const send = (subject, body) => `<div class="fb-send"><a class="btn sm g" href="mailto:${D.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Email it</a><a class="btn sm" href="https://wa.me/${D.whatsapp}?text=${encodeURIComponent(body)}" target="_blank" rel="noopener">WhatsApp</a></div><small class="fb-note">On the live app this goes straight to the Inspire team's inbox.</small>`;

/* ---------- suggestion box ---------- */
const KINDS = ['An idea for a show or topic', 'Something for the app or website', 'An event or campaign', 'Something our community needs', 'Something we could do better', 'Other'];
function suggest(kind) {
  modal(`<div class="fb"><span class="fb-k">Suggestion box</span><h3>What would make Inspire FM better for you?</h3><p>Every idea is read by the team. The best ones shape what we do next.</p>
    <form id="fbForm" class="fb-f"><label>It's about<select name="k">${KINDS.map(k => `<option ${k === kind ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
    <label>Your suggestion<textarea name="m" rows="4" required placeholder="Tell us your idea"></textarea></label>
    <div class="fb-2"><label>Name (optional)<input name="n" autocomplete="given-name"></label><label>Phone or email (optional)<input name="c" autocomplete="email"></label></div>
    <button class="btn g" type="submit">Send suggestion</button><div id="fbOut"></div></form></div>`);
  $('#fbForm').onsubmit = e => { e.preventDefault(); const v = Object.fromEntries(new FormData(e.target)); if (!v.m.trim()) return;
    const L = store.get('fbSugg', []); L.unshift({ ...v, at: Date.now() }); store.set('fbSugg', L.slice(0, 20));
    $('#fbOut').innerHTML = `<b class="fb-ok">Thank you. Your suggestion is in.</b>` + send(`Suggestion: ${v.k}`, `Suggestion for Inspire FM\n\nAbout: ${v.k}\n${v.m}\n\nFrom: ${v.n || '-'} ${v.c || ''}`);
    e.target.querySelector('button[type=submit]').hidden = true; };
}

/* ---------- ratings in the player ---------- */
function rateBox() {
  const np = $('#np'); if (!np) return; let box = $('#npRate');
  const title = ($('#npTitle') || {}).textContent || '', live = $('#npLive') && !$('#npLive').hidden, key = (live ? 'show:' : 'ep:') + title;
  if (!title || title === '–') { if (box) box.remove(); return; }
  if (!box) { box = document.createElement('section'); box.id = 'npRate'; box.className = 'np-rate'; const after = $('#lrBox') || $('.np-acts', np); after && after.after(box);
    box.addEventListener('click', e => { const s = e.target.closest('[data-star]'); if (s) { const R = store.get('ratings', {}); R[box.dataset.key] = Object.assign(R[box.dataset.key] || {}, { s: +s.dataset.star, at: Date.now() }); store.set('ratings', R); paint(); toast('Thanks for rating'); }
      if (e.target.closest('[data-rmore]')) { const R = store.get('ratings', {}), r = R[box.dataset.key] || {}; modal(`<div class="fb"><span class="fb-k">Your feedback</span><h3>${esc(box.dataset.title)}</h3><form id="rtF" class="fb-f"><label>What did you think?<textarea name="m" rows="4" placeholder="What did you enjoy? What could be better?">${esc(r.m || '')}</textarea></label><button class="btn g" type="submit">Send feedback</button><div id="rtOut"></div></form></div>`);
        $('#rtF').onsubmit = ev => { ev.preventDefault(); const m = new FormData(ev.target).get('m'); const R2 = store.get('ratings', {}); R2[box.dataset.key] = Object.assign(R2[box.dataset.key] || {}, { m }); store.set('ratings', R2); $('#rtOut').innerHTML = '<b class="fb-ok">Thank you. The presenter will see this.</b>' + send(`Feedback: ${box.dataset.title}`, `Feedback on ${box.dataset.title}\nRating: ${(R2[box.dataset.key].s || '-')}/5\n\n${m}`); ev.target.querySelector('button[type=submit]').hidden = true; }; } }); }
  box.dataset.key = key; box.dataset.title = title;
  const paint = () => { const r = store.get('ratings', {})[key] || {}; box.innerHTML = `<div class="np-rate-h"><b>${live ? 'Rate this show' : 'Rate this episode'}</b><small>${r.s ? 'Thanks. Tap to change.' : 'Your rating helps the team'}</small></div><div class="np-stars" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-star="${i}" class="${r.s >= i ? 'on' : ''}" aria-label="${i} star${i > 1 ? 's' : ''}">${STAR}</button>`).join('')}</div><button type="button" class="np-rmore" data-rmore>${r.m ? 'Edit your feedback' : 'Tell us more'}</button>`; };
  paint();
}
const obs = new MutationObserver(() => { clearTimeout(obs.t); obs.t = setTimeout(rateBox, 80); });
const t0 = $('#npTitle'); if (t0) obs.observe(t0, { childList: true, characterData: true, subtree: true });
const np0 = $('#np'); if (np0) obs.observe(np0, { attributes: true, attributeFilter: ['hidden', 'class'] });

/* ---------- feedback prompts (sent by the team from the back end; one example is set up for the preview) ---------- */
const PROMPTS = window.IFM_PROMPTS || [{ id: 'app-nov', q: 'How are you finding the new Inspire FM app?', sub: 'Two taps. It helps us decide what to improve next.', opts: ['Love it', 'It\'s good', 'It\'s okay', 'Needs work'], ask: 'What should we add or change?' }];
function promptCard() {
  const p = PROMPTS.find(x => !store.get('fbDone', {})[x.id]); const home = $('.page[data-page=home]'); let card = $('#fbPrompt');
  if (!p || !home) { if (card) card.remove(); return; }
  if (!card) { const anchor = $('#ahDay') || $('.ah-day', home); if (!anchor) return; card = document.createElement('div'); card.id = 'fbPrompt'; card.className = 'fb-pr'; anchor.after(card); }
  card.innerHTML = `<div class="fb-pr-h"><span class="fb-k">Quick question from the Inspire team</span><button type="button" data-fbx aria-label="Not now"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button></div><h4>${esc(p.q)}</h4><small>${esc(p.sub)}</small><div class="fb-opts">${p.opts.map((o, i) => `<button type="button" data-fbo="${i}">${esc(o)}</button>`).join('')}</div>`;
  card.onclick = e => { if (e.target.closest('[data-fbx]')) { const d = store.get('fbDone', {}); d[p.id] = 'later'; store.set('fbDone', d); card.remove(); return; }
    const o = e.target.closest('[data-fbo]'); if (!o) return; const ans = p.opts[+o.dataset.fbo];
    card.innerHTML = `<span class="fb-k">Thank you</span><h4>${esc(p.ask)}</h4><form class="fb-f" id="fbPF"><textarea name="m" rows="2" placeholder="Optional"></textarea><button class="btn sm g" type="submit">Send</button></form>`;
    $('#fbPF').onsubmit = ev => { ev.preventDefault(); const d = store.get('fbDone', {}); d[p.id] = { ans, m: new FormData(ev.target).get('m'), at: Date.now() }; store.set('fbDone', d); card.innerHTML = '<span class="fb-k">Thank you</span><h4>Your answer helps us decide what to work on next.</h4>'; setTimeout(() => card.remove(), 2600); }; };
}
document.addEventListener('ifm:page', e => { if (e.detail === 'home') setTimeout(promptCard, 60); });
setTimeout(promptCard, 400);

/* ---------- entry points: Discover card, footer/menu link, [data-suggest] anywhere ---------- */
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-suggest]'); if (!b) return; e.preventDefault(); suggest(b.dataset.suggest || ''); });
function discoverCard() { const hub = $('#localHub'); if (!hub || $('#fbDisc')) return; const c = document.createElement('button'); c.type = 'button'; c.id = 'fbDisc'; c.className = 'fb-disc'; c.dataset.suggest = '';
  c.innerHTML = `<span class="fb-disc-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/></svg></span><span><b>Got an idea?</b><small>Suggest a show, a feature or something our community needs</small></span><i aria-hidden="true">›</i>`;
  hub.appendChild(c); }
document.addEventListener('ifm:page', e => { if (e.detail === 'local') setTimeout(discoverCard, 80); });
setTimeout(discoverCard, 600);
window.IFM_FEEDBACK = { suggest, promptCard };

const css = document.createElement('style'); css.textContent = `
.fb{display:grid;gap:10px}.fb h3{margin:0;font-family:var(--display);font-size:1.35rem;line-height:1.2}.fb p{margin:0;color:var(--mut)}
.fb-k{font-size:.72rem;font-weight:800;letter-spacing:.06em;color:#4c7d16}
.fb-f{display:grid;gap:10px}.fb-f label{display:grid;gap:6px;font-weight:700;font-size:.88rem}
.fb-f select,.fb-f textarea,.fb-f input{width:100%;min-height:46px;border-radius:14px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:inherit;padding:10px 12px}
.fb-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fb-ok{display:block;color:#2f7d32}.fb-send{display:flex;gap:8px;margin-top:8px}.fb-note{color:var(--mut)}
.np-rate{display:grid;gap:8px;padding:14px;border-radius:20px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#fff}
.np-rate-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.np-rate-h small{color:rgba(255,255,255,.65);font-size:.78rem}
.np-stars{display:flex;gap:6px}.np-stars button{width:44px;height:44px;border:0;border-radius:12px;background:rgba(255,255,255,.08);display:grid;place-items:center;cursor:pointer}
.np-stars svg{width:24px;height:24px;fill:rgba(255,255,255,.28);transition:fill .15s,transform .15s}.np-stars button.on svg{fill:#f5c542}.np-stars button:active svg{transform:scale(.85)}
.np-rmore{justify-self:start;min-height:40px;border:0;background:none;color:#cfe9a8;font:inherit;font-weight:800;padding:0;cursor:pointer}
.fb-pr{position:relative;display:grid;gap:8px;padding:16px;border-radius:22px;background:linear-gradient(150deg,#1f2a14,#2f4a18);color:#fff;margin:12px 0}
.fb-pr h4{margin:0;font-family:var(--display);font-size:1.1rem;color:#fff}.fb-pr small{color:rgba(255,255,255,.75)}.fb-pr .fb-k{color:#bfe3a0}
.fb-pr-h{display:flex;justify-content:space-between;align-items:center}.fb-pr-h button{width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:#fff;display:grid;place-items:center}.fb-pr-h svg{width:16px;height:16px}
.fb-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fb-opts button{min-height:46px;border-radius:14px;border:1.5px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;font:inherit;font-weight:700;cursor:pointer}
.fb-pr .fb-f textarea{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.25)}
.fb-disc{display:flex;align-items:center;gap:12px;width:100%;margin-top:16px;padding:14px 16px;border-radius:20px;border:1.5px dashed #8cc63f;background:color-mix(in srgb,#8cc63f 10%,var(--card));color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.fb-disc b{display:block;font-family:var(--display);font-size:1.05rem}.fb-disc small{color:var(--mut)}.fb-disc>i{margin-left:auto;font-style:normal;font-size:1.5rem;color:#4c7d16}
.fb-disc-i{width:44px;height:44px;flex:none;border-radius:14px;background:#8cc63f;color:#13240a;display:grid;place-items:center}.fb-disc-i svg{width:24px;height:24px}`;
document.head.appendChild(css);
})();
