/* Inspire FM · Halal Money: principles, an A-Z "Is it halal?" checker, home finance, investing, debt, business, calculators. */
(function () {
'use strict';
const X = window.IFMX, F = window.IFM_FIN, SR = window.IFM_SEARCH; if (!X || !F) return;
const { $, $$, esc, store, toast, copy, TOOLS } = X;
const IC = window.IFM_IC, TL = window.IFM_TILE;
const badge = v => `<span class="hm-v" style="--c:${F.V[v][1]}">${F.V[v][0]}</span>`;
const TABS = [['basics', 'Basics', 'star'], ['check', 'Is it halal?', 'quiz'], ['home', 'Home', 'home'], ['invest', 'Invest', 'pulse'], ['debt', 'Debt', 'card'], ['biz', 'Business', 'shop'], ['tools', 'Calculators', 'gauge']];
const IDX = SR ? F.CHECK.map(c => SR.idx(c[0] + ' ' + c[4] + ' ' + c[2])) : [];
const gbp = n => '£' + (Math.round(n * 100) / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

TOOLS.money = ['Halal Money', null, node => {
  let tab = store.get('hmTab', 'basics'), vf = 'all';
  node.innerHTML = `<div class="hm"><div class="dk-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg><input type="search" class="hmQ" placeholder="Is it halal? Try: Klarna, ISA, crypto, mortgage…" autocomplete="off"></div>
    <div class="hm-tabs">${TABS.map(([k, n, i]) => `<button type="button" data-t="${k}" aria-pressed="${k === tab}">${IC(i)}<span>${n}</span></button>`).join('')}</div>
    <div class="hm-body"></div>
    <p class="dk-credit">Guidance drawn from the Qur'an, authentic hadith, AAOIFI standards and UK Islamic finance scholars. Not a fatwa or regulated financial advice: for your own situation, ask a qualified scholar and an FCA-regulated adviser. UK products checked November 2026.</p></div>`;
  const body = $('.hm-body', node), Q = $('.hmQ', node);
  const checkCard = (c) => `<details class="hm-q"><summary><div><b>${esc(c[0])}</b></div>${badge(c[1])}</summary><div class="hm-a"><p>${esc(c[2])}</p><p class="hm-do"><span>What to do</span>${esc(c[3])}</p></div></details>`;
  const R = {
    basics() {
      body.innerHTML = `<h3 class="tb-sec">The six rules of halal money</h3><div class="hm-pr">${F.PRINCIPLES.map(p => `<div>${TL(p[3], '#0f766e')}<div><b>${esc(p[0])}</b><p>${esc(p[1])}</p><small>${esc(p[2])}</small></div></div>`).join('')}</div>
        <h3 class="tb-sec">Islamic finance words, simply explained</h3><div class="hm-gl">${F.CONTRACTS.map(c => `<div><b>${esc(c[0])}</b><em>${esc(c[1])}</em><p>${esc(c[2])}</p></div>`).join('')}</div>`;
    },
    check(q) {
      let L = F.CHECK.map((c, i) => ({ c, s: q && SR ? SR.score(q, IDX[i]) : 1 })).filter(x => !q || x.s > 1.2);
      if (q) L.sort((a, b) => b.s - a.s);
      if (vf !== 'all') L = L.filter(x => x.c[1] === vf);
      body.innerHTML = `<div class="dk-sugg">${[['all', 'All']].concat(Object.entries(F.V).map(([k, v]) => [k, v[0]])).map(([k, n]) => `<button type="button" class="${vf === k ? 'ch' : ''}" data-vf="${k}">${n}</button>`).join('')}</div>
        ${L.length ? `<div class="hm-list">${L.map(x => checkCard(x.c)).join('')}</div>` : `<div class="tk-empty">Nothing on that yet. Ask your imam, or message the studio and we may cover it on air.</div>`}`;
      if (q && L.length) $('.hm-q', body).open = true;
    },
    home() { body.innerHTML = `<div class="hm-cards">${F.HOME.map(h => `<div><b>${esc(h[0])}</b><p>${esc(h[1])}</p>${h[2] ? `<small>${esc(h[2])}</small>` : ''}</div>`).join('')}</div><div class="hm-list">${F.CHECK.filter(c => /mortgage|Home Purchase|Lifetime/.test(c[0])).map(checkCard).join('')}</div>`; },
    invest() { body.innerHTML = `<div class="hm-cards">${F.INVEST.map(h => `<div><b>${esc(h[0])}</b><p>${esc(h[1])}</p>${h[2] ? `<small>${esc(h[2])}</small>` : ''}</div>`).join('')}</div><button type="button" class="btn g hm-go" data-t="tools">${IC('gauge')} Open the screening calculator</button>`; },
    debt() { body.innerHTML = `<div class="hm-cards">${F.DEBT.map(h => `<div><b>${esc(h[0])}</b><p>${esc(h[1])}</p>${h[2] ? `<small>${esc(h[2])}</small>` : ''}</div>`).join('')}</div><a class="dk-feel" href="#tb-feel" data-feel="money">${TL('pound', '#047857', 'sm')}<div><b>Worried about money?</b><small>Duas, practical steps and free advice in Luton</small></div><svg viewBox="0 0 24 24" width="20"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></a><div class="hm-list">${F.CHECK.filter(c => /credit|Klarna|Overdraft|Car|Student|loan|Qard/i.test(c[0])).map(checkCard).join('')}</div>`; },
    biz() { body.innerHTML = `<h3 class="tb-sec">Running a halal business</h3><div class="hm-pr">${F.BIZ.map(p => `<div>${TL(p[2], '#b45309')}<div><b>${esc(p[0])}</b><p>${esc(p[1])}</p></div></div>`).join('')}</div>
        <h3 class="tb-sec">Before you start a partnership</h3><ul class="fl-ul">${['How much capital each partner puts in, and in what form', 'Who does what, and how decisions are made', 'Profit split (any agreed ratio) and how losses are shared (by capital, in a musharakah)', 'Salaries vs profit share, and drawings', 'What happens if someone wants to leave, falls ill or dies', 'How disputes are resolved (an agreed arbiter or imam)', 'Zakat: who calculates it and when'].map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="hm-list">${F.CHECK.filter(c => /Dropship|Affiliate|credit at|Late payment|alcohol|bank/i.test(c[0])).map(checkCard).join('')}</div>
        <a class="dk-feel" href="#tb-business">${TL('shop', '#b45309', 'sm')}<div><b>List your business</b><small>Get found in the Inspire FM halal directory</small></div><svg viewBox="0 0 24 24" width="20"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></a>`; },
    tools() {
      const s = store.get('hmScr', { mc: '', debt: '', cash: '', rev: '', bad: '' });
      body.innerHTML = `<div class="hm-tool"><b>Halal share screen (AAOIFI 30 / 30 / 5)</b><p>Enter figures from a company's latest accounts (any currency, same units).</p>
          <div class="hm-f">${[['mc', 'Market value (market cap)'], ['debt', 'Interest-based debt'], ['cash', 'Cash & interest-bearing securities'], ['rev', 'Total revenue'], ['bad', 'Revenue from haram sources (incl. interest income)']].map(([k, n]) => `<label><span>${n}</span><input type="number" inputmode="decimal" data-s="${k}" value="${esc(s[k])}"></label>`).join('')}</div>
          <label class="hm-ck"><input type="checkbox" class="hmBiz" ${s.biz ? 'checked' : ''}> The core business is halal (not alcohol, gambling, conventional banking, pork, adult content, etc.)</label>
          <div class="hm-res hmScrR"></div></div>
        <div class="hm-tool"><b>Purification calculator</b><p>Give away the haram share of your dividends.</p><div class="hm-f"><label><span>Dividends received (£)</span><input type="number" inputmode="decimal" class="hmDiv"></label><label><span>Haram income % of the company</span><input type="number" inputmode="decimal" class="hmPct" placeholder="e.g. 2.4"></label></div><div class="hm-res hmPurR"></div></div>
        <div class="hm-tool"><b>Interest to give away</b><p>Add up interest your bank paid you (it's on your statements) and give it to the poor, without intending reward.</p><div class="hm-f"><label><span>Interest received (£)</span><input type="number" inputmode="decimal" class="hmInt"></label></div><div class="hm-res hmIntR"></div></div>
        <div class="hm-tool"><b>Ask HR for a Sharia pension fund</b><p>Copy this email and send it to your HR or payroll team.</p><button type="button" class="btn ghost hmMail">${IC('mail')} Copy the email</button></div>
        <a class="dk-feel" href="#tb-zakat">${TL('pound', '#0f766e', 'sm')}<div><b>Zakat calculator</b><small>Savings, gold, shares and business stock</small></div><svg viewBox="0 0 24 24" width="20"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></a>`;
      const scr = () => {
        const v = {}; $$('[data-s]', body).forEach(i => v[i.dataset.s] = i.value); v.biz = $('.hmBiz', body).checked; store.set('hmScr', v);
        const n = k => parseFloat(v[k]); const out = $('.hmScrR', body);
        if (!(n('mc') > 0)) { out.innerHTML = '<small>Fill in the market value to see the result.</small>'; return; }
        const rows = [['Interest-based debt', n('debt') / n('mc') * 100, 30], ['Cash & interest-bearing securities', n('cash') / n('mc') * 100, 30], ['Haram income', n('rev') > 0 ? n('bad') / n('rev') * 100 : NaN, 5]];
        const ok = v.biz && rows.every(r => isFinite(r[1]) && r[1] < r[2]);
        out.innerHTML = `${rows.map(r => `<div class="hm-row"><span>${r[0]}</span><b class="${isFinite(r[1]) && r[1] < r[2] ? 'ok' : 'no'}">${isFinite(r[1]) ? r[1].toFixed(1) + '%' : '—'}</b><small>limit ${r[2]}%</small></div>`).join('')}<div class="hm-out ${ok ? 'ok' : 'no'}">${ok ? 'Passes the AAOIFI screen' : v.biz ? 'Does not pass' : 'Fails: the business itself must be halal'}</div>${ok && isFinite(rows[2][1]) && rows[2][1] > 0 ? `<small>Purify ${rows[2][1].toFixed(1)}% of any dividends.</small>` : ''}`;
      };
      $$('[data-s], .hmBiz', body).forEach(i => i.oninput = scr); scr();
      const pur = () => { const d = parseFloat($('.hmDiv', body).value), p = parseFloat($('.hmPct', body).value); $('.hmPurR', body).innerHTML = d > 0 && p >= 0 ? `<div class="hm-out ok">Give away ${gbp(d * p / 100)}</div>` : ''; };
      $('.hmDiv', body).oninput = pur; $('.hmPct', body).oninput = pur;
      $('.hmInt', body).oninput = e => { const v = parseFloat(e.target.value); $('.hmIntR', body).innerHTML = v > 0 ? `<div class="hm-out ok">Give ${gbp(v)} to charity</div><a class="more" href="#give">Give through an Inspire FM appeal</a>` : ''; };
      $('.hmMail', body).onclick = () => copy(`Subject: Request for a Sharia-compliant pension fund option\n\nDear HR / Payroll team,\n\nI would like to stay in our workplace pension, but for religious reasons I need my contributions invested in a Sharia-compliant (Islamic) fund.\n\nCould you please confirm whether our pension provider offers a Sharia fund option (many do, including Nest, Aviva, Legal & General and Royal London), and how I can switch my pot and future contributions into it? If no option is available, could you ask the provider to add one?\n\nThank you for your help.\n\nKind regards,\n[Your name]\n[Employee number]`, 'Email copied');
    }
  };
  function render(q) { store.set('hmTab', tab); $$('.hm-tabs button', node).forEach(b => b.setAttribute('aria-pressed', b.dataset.t === tab)); R[tab](q); }
  Q.addEventListener('input', () => { const q = Q.value.trim(); if (q.length > 1) { tab = 'check'; vf = 'all'; render(q); } else if (!q) render(); });
  node.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'); if (t) { tab = t.dataset.t; Q.value = ''; render(); (node.closest('#scrBody') || document.scrollingElement).scrollTo({ top: 0, behavior: 'instant' }); return; }
    const f = e.target.closest('[data-vf]'); if (f) { vf = f.dataset.vf; render(Q.value.trim()); return; }
    const fe = e.target.closest('[data-feel]'); if (fe) sessionStorage.setItem('feelOpen', fe.dataset.feel);
  });
  render();
}];
})();
