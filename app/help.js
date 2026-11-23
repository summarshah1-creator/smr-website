/* Find help in Luton — shared directory (same data as the NGS and Courtney Foundation sites). */
/* Find help in Luton: needs picker, postcode / location distance, filters and listing cards.
   Listings come from help-data.js; changes made in the admin (Site content → Find help) are loaded on top. */
(function(){
  const $=id=>document.getElementById(id);
  if(!$('hfNeeds')||!window.NGSHELP)return;
  const D=window.NGSHELP,PC=window.NGSPC;
  const I=k=>`<svg class="ico" aria-hidden="true"><use href="#i-${k}"></use></svg>`;
  const NEEDS=[['food','bowl','Food & meals'],['clothes','shirt','Clothes & essentials'],['baby','bottle','Baby & kids'],['money','pound','Money & bills'],['refugee','globe','Asylum & refugee'],['housing','home','Housing & homelessness'],['talk','chat','Someone to talk to'],['skills','book','English, jobs & skills']];
  const COL={food:'#e0662f',clothes:'#7a3ee0',baby:'#e0457b',money:'#1f8a4c',refugee:'#c28a00',housing:'#1d72c2',talk:'#0e8a90',skills:'#5a4a8a'};
  const COST={all:['✓ Free for everyone','all'],elig:['✓ Free if you\'re eligible','elig'],contact:['Free, check with them first','contact'],part:['Free for some, others pay','part'],low:['Low cost','low']};
  const ACC={walk:['walk','Walk in'],book:['calendar','Book first'],phone:['phone','Phone'],online:['globe','Apply online'],email:['mail','Email'],referral:['clipboard','Needs a referral'],contact:['chat','Ask first']};
  const DAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],now=new Date().getDay();
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const BASE=D.S.map(x=>({...x,status:'live'}));
  let S=BASE.slice();
  /* admin edits (live / draft / hidden listings) */
  function applyOV(ov){const m=new Map(BASE.map(x=>[x.id,x]));Object.values(ov||{}).forEach(o=>m.set(o.id,{...(m.get(o.id)||{}),...o}));S=[...m.values()].filter(x=>(x.status||'live')==='live'&&x.n&&x.cat&&x.cat.length).map(x=>({acc:[],locs:[],...x}));}
  /* postcode lookup: offline Luton table first, then postcodes.io, then the district centre */
  const b36=s=>parseInt(s,36),cache={};
  function luTable(o){if(cache[o])return cache[o];const t={},raw=PC.lu[o];if(raw)raw.split(';').forEach(e=>{const inc=e.slice(0,3),[a,b]=e.slice(3).split(',');t[inc]=[51.7+b36(a)/1e4,-1+b36(b)/1e4];});return cache[o]=t;}
  const norm=v=>v.toUpperCase().replace(/[^A-Z0-9]/g,'');
  async function geocode(v){const p=norm(v);if(p.length<2)return null;
    const full=/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(p);
    if(full){const o=p.slice(0,-3),inc=p.slice(-3),hit=luTable(o)[inc];if(hit)return{ll:hit,label:o+' '+inc,exact:1};
      try{const ctl=new AbortController();setTimeout(()=>ctl.abort(),4000);const r=await fetch('https://api.postcodes.io/postcodes/'+p,{signal:ctl.signal});const j=await r.json();if(j.result)return{ll:[j.result.latitude,j.result.longitude],label:j.result.postcode,exact:1};}catch(e){}
      if(PC.oc[o])return{ll:PC.oc[o],label:o,exact:0};return null;}
    if(PC.oc[p])return{ll:PC.oc[p],label:p,exact:0};return null;}
  const miles=(a,b)=>{const R=3958.8,r=Math.PI/180,dl=(b[0]-a[0])*r,dg=(b[1]-a[1])*r,x=Math.sin(dl/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dg/2)**2;return 2*R*Math.asin(Math.sqrt(x));};
  const sel=new Set(),F=new Set();let me=null,meLabel='';
  $('hfNeeds').innerHTML=NEEDS.map(([k,ic,l])=>`<button type="button" data-k="${k}" aria-pressed="false"><span>${I(ic)}</span>${l}</button>`).join('');
  const isOpen=s=>!s.mo&&s.d&&s.d.includes(now);
  const near=s=>{if(!me||!s.locs.length)return null;let best=null;s.locs.forEach((l,i)=>{const m=miles(me,[l[2],l[3]]);if(!best||m<best.m)best={m,i};});return best;};
  function filtered(){return S.filter(s=>(!sel.size||s.cat.some(c=>sel.has(c)))&&(!F.has('today')||isOpen(s))&&(!F.has('walk')||s.acc.includes('walk'))&&(!F.has('all')||s.cost==='all')&&(!F.has('women')||s.women));}
  function sorted(L){return L.map(s=>({s,n:near(s)})).sort((a,b)=>{
    if(me){if(a.n&&b.n)return a.n.m-b.n.m;if(a.n)return -1;if(b.n)return 1;}
    return (isOpen(b.s)-isOpen(a.s))||((b.s.locs.length>0)-(a.s.locs.length>0));});}
  const fmtMi=m=>m<0.1?'Under 0.1 miles':m<10?m.toFixed(1)+' miles':Math.round(m)+' miles';
  const tel=p=>'tel:'+p.replace(/\s/g,'');
  function card(o,i){const s=o.s,n=o.n,c=COST[s.cost]||COST.contact,loc=n?s.locs[n.i]:s.locs[0];
    const when=s.mo?esc(s.h):s.d?`${isOpen(s)?'<span class="open y">Open today</span> ':''}${s.d.map(d=>DAY[d]).join(', ')}${s.h?' · '+esc(s.h):''}`:esc(s.h||'Contact them for times');
    const where=s.locs.length?s.locs.map(l=>esc(l[0])+', '+l[1]).join('<br>'):esc(s.area||'');
    const dest=loc?encodeURIComponent(loc[0]+' '+loc[1]):'';
    const dir=loc?(me?`https://www.google.com/maps/dir/?api=1&origin=${me[0]},${me[1]}&destination=${dest}&travelmode=walking`:`https://www.google.com/maps/search/?api=1&query=${dest}`):'';
    return `<article class="hx" id="hf-${esc(s.id)}" style="--c:${COL[s.cat[0]]||'#12324f'}">
      <div class="hx-h">${loc?`<span class="hx-n">${i+1}</span>`:`<span class="hx-n rm" aria-hidden="true">${I(s.acc.includes('phone')?'phone':'globe')}</span>`}<div class="hx-t"><h4>${esc(s.n)}</h4>${s.org&&s.org!==s.n?`<small>${esc(s.org)}</small>`:''}</div>${n?`<span class="hx-d">${fmtMi(n.m)}</span>`:(!s.locs.length?'<span class="hx-d rm">Phone / online</span>':'')}</div>
      <div class="hx-b"><span class="cost ${c[1]}">${c[0]}</span>${s.acc.filter(a=>ACC[a]).map(a=>`<span class="acc">${I(ACC[a][0])} ${ACC[a][1]}</span>`).join('')}</div>
      <p class="hx-help">${esc(s.help)}</p>
      <dl><div><dt>Who it's for</dt><dd>${esc(s.who)}</dd></div><div><dt>How to get it</dt><dd>${esc(s.how)}</dd></div><div><dt>When</dt><dd>${when}</dd></div><div><dt>Where</dt><dd>${where}</dd></div></dl>
      <div class="hx-a">${s.ph?`<a class="p" href="${tel(s.ph)}">${I('phone')} Call ${esc(s.ph)}</a>`:''}${s.ph2?`<a href="${tel(s.ph2)}">${I('phone')} ${esc(s.ph2)}</a>`:''}${s.wa?`<a class="wa" href="https://wa.me/${esc(s.wa)}" target="_blank" rel="noopener">${I('whatsapp')} WhatsApp</a>`:''}${s.em?`<a href="mailto:${esc(s.em)}">${I('mail')} Email</a>`:''}${dir?`<a href="${dir}" target="_blank" rel="noopener">${I('compass')} Directions</a>`:''}${s.web?`<a href="${esc(s.web)}" target="_blank" rel="noopener">Website ↗</a>`:''}</div>
    </article>`;}
  function render(){const L=sorted(filtered());const lbl=[...sel].map(k=>NEEDS.find(n=>n[0]===k)[2].toLowerCase());
    $('hxCrisis').hidden=!sel.has('talk');
    $('hfSum').innerHTML=`${L.length} ${L.length===1?'service':'services'}${lbl.length?' for '+esc(lbl.join(', ')):''}${me?' · closest to '+esc(meLabel)+' first':''}<small>${me?'Distances are in a straight line. Phone and online services are at the end.':sel.size?'Add your postcode to see the closest first.':'Choose what you need above to narrow it down.'}</small>`;
    $('hfList').innerHTML=L.length?L.map(card).join(''):`<div class="hf-empty">Nothing matches all of those. Try removing a filter, or <a href="#contact">message us</a> and we'll help you find the right place.</div>`;}
  $('hxChk').innerHTML=`Information checked ${esc(D.checked)}. Times and rules can change, so check with the service before you travel. <a href="mailto:info@inspirefm.org?subject=${encodeURIComponent('Find help in Luton: update')}">Something wrong or missing? Tell us</a>`;
  $('hfList').addEventListener('click',e=>{if(e.target.closest('a'))return;const c=e.target.closest('.hx');if(c)c.classList.toggle('open');});
  const scrollRes=()=>$('help-map').scrollIntoView({behavior:'smooth',block:'start'});
  $('hfNeeds').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k;sel.has(k)?sel.delete(k):sel.add(k);b.setAttribute('aria-pressed',sel.has(k));render();});
  $('hxFilt').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.f;F.has(k)?F.delete(k):F.add(k);b.setAttribute('aria-pressed',F.has(k));render();});
  const msg=(t,err)=>{const m=$('hxPcMsg');m.textContent=t;m.classList.toggle('err',!!err);};
  $('hxPc').addEventListener('submit',async e=>{e.preventDefault();const v=$('hxPcIn').value;if(!v.trim()){me=null;msg('');render();return;}
    msg('Finding your postcode…');const r=await geocode(v);
    if(!r){msg('We couldn\'t find that postcode. Check it, or try just the first part, like LU2.',1);return;}
    me=r.ll;meLabel=r.label;msg(r.exact?'Showing services closest to '+r.label+'.':'Showing services closest to the '+r.label+' area (approximate).');
    try{sessionStorage.setItem('ifmPc',v);}catch(e){}render();scrollRes();});
  $('hxLoc').addEventListener('click',()=>{if(!navigator.geolocation){msg('Location isn\'t available here. Type your postcode instead.',1);return;}
    msg('Finding your location…');navigator.geolocation.getCurrentPosition(p=>{me=[p.coords.latitude,p.coords.longitude];meLabel='you';msg('Showing services closest to you.');render();scrollRes();},()=>msg('We couldn\'t get your location. Type your postcode instead.',1),{timeout:8000,maximumAge:600000});});
  try{const v=sessionStorage.getItem('ifmPc');if(v){$('hxPcIn').value=v;geocode(v).then(r=>{if(r){me=r.ll;meLabel=r.label;render();}});}}catch(e){}
  applyOV(null);render();
  (window.IFM_HELP_API?fetch(window.IFM_HELP_API):Promise.reject()).then(r=>r.ok?r.json():null).then(j=>{if(j&&j.items&&Object.keys(j.items).length){applyOV(j.items);if(j.checked)D.checked=j.checked;render();}}).catch(()=>{});
  window.NGSHelp={geocode,NEEDS,COST,ACC,DAY};
})();
