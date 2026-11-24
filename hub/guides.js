/* Luton Community Hub: guides.js
   Puts the researched step-by-step guides (guides-data.js) into the sections and tools they belong to:
   steps, tips, mistakes, legal requirement vs good practice, official tools and templates,
   where SMR can help, where else to get help, and sources. Loaded after tools3.js. */
(window.LCH_EXT = window.LCH_EXT || []).push(L => {
const G = window.LCH_GUIDES || {}, { store, esc } = L, $ = (s, r = document) => r.querySelector(s);
const si = n => ({ chev: '<svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>', ext: '<svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/></svg>' })[n] || '';
// which guides show on which pages
const MAP = { evplan: ['run-event', 'promote-event'], evpromo: ['promote-event'], events: ['run-event', 'promote-event'], planner: ['social-media', 'local-press'], appealkit: ['fundraising-appeal'], appeals: ['fundraising-appeal'], donate: ['fundraising-appeal'],
  bidcheck: ['funding-bid'], funding: ['funding-bid', 'partnerships'], partners: ['partnerships'], volrole: ['volunteers'], volunteering: ['volunteers'], dbshelp: ['safeguarding-dbs'], giftaid: ['gift-aid'],
  riskbuild: ['venue-risk'], venues: ['venue-risk'], dpcheck: ['gdpr-data', 'photo-consent'], impact: ['impact-reporting'], toc: ['impact-reporting'], freekit: ['free-kit-software'], policies: ['legal-overview', 'start-a-group'],
  training: ['training'], careers: ['careers'], sponsor: ['sponsorship'], help: ['winter-support'], studio: ['social-media', 'local-press'], seasonal: ['social-media'] };
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (_) { return u; } };
const isLaw = t => /legal|statutory|offence|required|contractual/i.test(t || '') && !/good practice|recommended/i.test(t || '');
const card = (id, open) => { const g = G[id]; if (!g) return ''; const li = l => (l || []).map(x => `<li>${esc(x)}</li>`).join('');
  return `<details class="gd" data-gd="${id}"${open ? ' open' : ''}><summary><span class="gdk">Step-by-step guide</span><b>${esc(g.title)}</b>${si('chev')}</summary><div class="gdb">
  ${g.why ? `<p class="gdwhy">${esc(g.why)}</p>` : ''}
  ${(g.steps || []).length ? `<h4>Steps</h4><ol class="gdst">${li(g.steps)}</ol>` : ''}
  ${(g.legal || []).length ? `<h4>Legal requirement or good practice?</h4><ul class="gdlg">${g.legal.map(x => `<li><span class="lgtag ${isLaw(x.type) ? 'law' : 'gp'}">${isLaw(x.type) ? 'Legal requirement' : 'Good practice'}</span><span>${esc(x.item)}${x.type && !/^legal requirement$|^good practice$/i.test(x.type) ? ` <small class="note">(${esc(x.type)})</small>` : ''}</span></li>`).join('')}</ul>` : ''}
  ${(g.tips || []).length ? `<h4>Tips</h4><ul class="trl">${li(g.tips)}</ul>` : ''}
  ${(g.mistakes || []).length ? `<h4>Common mistakes</h4><ul class="trl gdmis">${li(g.mistakes)}</ul>` : ''}
  ${(g.tools || []).length ? `<h4>Official tools and templates</h4><div class="row">${g.tools.map(t => `<a class="btn s sm" href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.name)} ${si('ext')}</a>`).join('')}</div>` : ''}
  ${(g.smr || []).length ? `<div class="dlbox gdsmr"><b>Where SMR can help</b><ul class="trl">${li(g.smr)}</ul><a class="btn p sm" href="#brief">Talk to us</a></div>` : ''}
  ${(g.elsewhere || []).length ? `<h4>Where else to get help</h4><ul class="trl">${li(g.elsewhere)}</ul>` : ''}
  ${(g.sources || []).length ? `<div class="t3src"><div><b>Last checked ${esc(g.sources[0].checked || '24 Nov 2026')}</b><span>${g.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(host(s.url))}</a>`).join(' · ')}</span></div></div>` : ''}
  </div></details>`; };
document.head.insertAdjacentHTML('beforeend', `<style id="gdcss">
.gdwrap{margin:16px 0}.gdwrap>h2{font-size:18px;margin:0 0 8px}
.gd{border:1.5px solid var(--line,#D9D8E6);border-radius:16px;background:#fff;margin:0 0 10px;overflow:hidden}
.gd summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:14px 16px;align-items:center}.gd summary::-webkit-details-marker{display:none}
.gd summary .gdk{grid-column:1;font-size:12px;font-weight:700;color:#16865F;text-transform:uppercase;letter-spacing:.04em}.gd summary b{grid-column:1;font-size:16px}.gd summary .si{grid-row:1/3;grid-column:2;width:20px;height:20px;transition:transform .25s}.gd[open] summary .si{transform:rotate(90deg)}
.gdb{padding:0 16px 14px}.gdb h4{margin:14px 0 6px;font-size:15px}.gdwhy{margin:0 0 4px;font-size:15px}
.gdst{padding-left:22px;margin:0}.gdst li{margin:0 0 8px;line-height:1.5}
.gdlg{list-style:none;padding:0;margin:0}.gdlg li{display:flex;gap:8px;align-items:flex-start;margin:0 0 8px;line-height:1.45}.gdlg .lgtag{flex:none}
.lgtag.gp{background:#E9F6F0;color:#0E5C40}
.gdmis li::marker{color:#D23F5C}.gdsmr{margin-top:12px}
</style>`);
L.after.push(r => { const ids = MAP[r.v]; if (!ids || r.id) return; const w = $('#main > .wrap'); if (!w || $('.gdwrap', w) || $('.landing', w)) return;
  const html = `<section class="gdwrap"><h2>How to do it well</h2>${ids.map(id => card(id, false)).join('')}</section>`;
  const after = $('.secTools', w) ? w.lastElementChild : null; (after || w).insertAdjacentHTML(after ? 'afterend' : 'beforeend', html); });
});
