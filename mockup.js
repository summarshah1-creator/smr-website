/* SMR Graphics: Mock-up Studio
   Upload a design, pick a product + size, see it in a realistic scene at true scale,
   download the mock-up or ask for a quote on WhatsApp. Everything runs in the browser;
   nothing is uploaded. Opened by any element with [data-mockup] (optional value = product key). */
(function(){
'use strict';
const WA = (window.CONTACT && CONTACT.whatsapp) || '447931814538';
const FT = 30.48, A = {A0:[84.1,118.9],A1:[59.4,84.1],A2:[42,59.4],A3:[29.7,42],A4:[21,29.7],A5:[14.8,21],A6:[10.5,14.8]};
const aSize = k => ({l:k+' · '+(A[k][0]*10|0)+' × '+(A[k][1]*10|0)+' mm', s:k, w:A[k][0], h:A[k][1]});
const cm = (w,h,l) => ({l:l||(w+' × '+h+' cm'), w, h});
const ft = (w,h) => ({l:w+' × '+h+' ft', w:w*FT, h:h*FT});
const mm = (w,h,l) => ({l:l||(w+' × '+h+' mm'), w:w/10, h:h/10});
const P = {
  roller:{n:'Roller banner', scene:'wall', dpi:[100,60], sizes:[cm(85,200,'85 × 200 cm (standard)'),cm(100,200,'100 × 200 cm (wide)'),cm(120,200),cm(80,200)]},
  vinyl:{n:'Vinyl banner', scene:'wall', dpi:[72,45], orient:'l', custom:true, sizes:[ft(6,2),ft(6,3),ft(8,3),ft(8,4),ft(10,3),cm(200,100,'2 × 1 m'),cm(300,100,'3 × 1 m'),cm(400,200,'4 × 2 m')]},
  poster:{n:'Poster', scene:'wall', dpi:[150,100], orient:'p', frame:true, sizes:['A0','A1','A2','A3','A4','A5','A6'].map(aSize), d:2},
  flyer:{n:'Flyer / leaflet', scene:'table', dpi:[250,120], orient:'p', stack:true, sizes:[aSize('A5'),aSize('A6'),aSize('A4'),mm(99,210,'DL · 99 × 210 mm')]},
  menu:{n:'Menu', scene:'table', dpi:[250,120], orient:'p', sizes:[aSize('A4'),aSize('A3'),aSize('A5'),mm(99,210,'DL · 99 × 210 mm')]},
  card:{n:'Business card', scene:'table', dpi:[300,200], orient:'l', corners:true, stack:true, sizes:[mm(85,55,'Standard · 85 × 55 mm'),mm(55,55,'Square · 55 × 55 mm'),mm(90,50,'Slim · 90 × 50 mm')]},
  sticker:{n:'Sticker', scene:'table', dpi:[300,150], surface:'kraft', sizes:[mm(50,50,'Round · 50 mm'),mm(75,75,'Round · 75 mm'),mm(100,100,'Round · 100 mm'),mm(51,51,'Square · 50 mm'),mm(76,76,'Square · 75 mm'),mm(100,50,'Rectangle · 100 × 50 mm')]},
  sign:{n:'Sign board', scene:'wall', dpi:[150,72], orient:'l', sizes:[cm(60,40,'60 × 40 cm'),{l:'A2 · 594 × 420 mm',w:59.4,h:42},{l:'A1 · 841 × 594 mm',w:84.1,h:59.4},cm(120,60,'120 × 60 cm'),ft(8,4)]},
  aboard:{n:'A-board', scene:'wall', dpi:[150,100], sizes:[{l:'A1 poster · 594 × 841 mm',w:59.4,h:84.1},{l:'A0 poster · 841 × 1189 mm',w:84.1,h:118.9}]}
};
const ORDER = ['roller','vinyl','poster','flyer','menu','card','sticker','sign','aboard'];
const IC = {
  roller:'<rect x="8" y="2.5" width="8" height="15.5" rx="1"/><path d="M6 21h12M12 18v3"/>',
  vinyl:'<rect x="2.5" y="6" width="19" height="12" rx="1.2"/><circle cx="5" cy="8.5" r=".6"/><circle cx="19" cy="8.5" r=".6"/><circle cx="5" cy="15.5" r=".6"/><circle cx="19" cy="15.5" r=".6"/>',
  poster:'<rect x="5" y="2.5" width="14" height="19" rx="1"/><path d="M8 15l3-3 2 2 3-3"/>',
  flyer:'<rect x="4" y="4" width="11" height="15" rx="1" transform="rotate(-8 9 11)"/><rect x="9" y="5" width="11" height="15" rx="1"/>',
  menu:'<path d="M4 4h7v16H4zM13 4h7v16h-7z"/><path d="M6 8h3M6 11h3M15 8h3M15 11h3"/>',
  card:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h6M6 13h4"/>',
  sticker:'<path d="M20 12a8 8 0 1 1-8-8"/><path d="M20 12h-5a3 3 0 0 1-3-3V4"/>',
  sign:'<rect x="3" y="5" width="18" height="11" rx="1"/><circle cx="5.5" cy="7.5" r=".6"/><circle cx="18.5" cy="7.5" r=".6"/><path d="M8 20h8"/>',
  aboard:'<path d="M8 3h8l3 18M8 3 5 21"/><rect x="8.5" y="6" width="7" height="9"/>'
};
const st = {p:'roller', si:0, orient:null, fit:'fill', bg:'#ffffff', corners:'square', frame:'black', surface:'wood', person:true, cw:200, ch:100, qty:1, img:null, imgW:0, imgH:0, vector:false, name:''};
let root, cv, ctx, tex = {}, built = false;

/* ---------- helpers ---------- */
const $ = s => root.querySelector(s);
function rr(c,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function rng(seed){let s=seed>>>0;return()=>((s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0,((s^s>>>14)>>>0)/4294967296))}
function size(){const pr=P[st.p];let z=pr.custom&&st.si===pr.sizes.length?{l:'Custom · '+st.cw+' × '+st.ch+' cm',w:+st.cw||100,h:+st.ch||50}:pr.sizes[st.si];
  let w=z.w,h=z.h;const o=orient();if(o==='p'&&w>h||o==='l'&&h>w){[w,h]=[h,w]}return {l:z.l,w,h,s:z.s}}
function orient(){const pr=P[st.p];if(!pr.orient&&!['poster','flyer','menu','card','sign','vinyl'].includes(st.p))return null;return st.orient||pr.orient}
function shapeOf(){if(st.p!=='sticker')return 'rect';const l=P.sticker.sizes[st.si].l;return l.startsWith('Round')?'circle':'rect'}

/* ---------- textures ---------- */
function mkTex(name,w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);tex[name]=c;return c}
function noise(c,w,h,amt,seed){const r=rng(seed),d=c.getImageData(0,0,w,h),a=d.data;for(let i=0;i<a.length;i+=4){const n=(r()-.5)*amt;a[i]+=n;a[i+1]+=n;a[i+2]+=n}c.putImageData(d,0,0)}
function buildTex(){
  mkTex('wood',1200,1000,(c,w,h)=>{const r=rng(7);const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#b9875a');g.addColorStop(1,'#a3734a');c.fillStyle=g;c.fillRect(0,0,w,h);
    const pl=[0,190,410,600,820,1000];for(let p=0;p<pl.length-1;p++){const y0=pl[p],y1=pl[p+1],tone=(r()-.5)*26;c.fillStyle=`rgba(${tone>0?255:60},${tone>0?220:35},${tone>0?180:15},${Math.abs(tone)/140})`;c.fillRect(0,y0,w,y1-y0);
      for(let k=0;k<26;k++){const yy=y0+r()*(y1-y0),amp=2+r()*7,f=.002+r()*.006,ph=r()*9;c.beginPath();for(let x=0;x<=w;x+=12){const y=yy+Math.sin(x*f+ph)*amp+Math.sin(x*f*3.1+ph)*amp*.3;x?c.lineTo(x,y):c.moveTo(x,y)}c.strokeStyle=`rgba(70,38,14,${.05+r()*.13})`;c.lineWidth=.6+r()*1.6;c.stroke()}
      c.fillStyle='rgba(50,26,10,.45)';c.fillRect(0,y1-1.5,w,3)}
    noise(c,w,h,16,3)});
  mkTex('marble',1200,1000,(c,w,h)=>{const r=rng(11);c.fillStyle='#f1efec';c.fillRect(0,0,w,h);c.filter='blur(1.2px)';
    for(let k=0;k<26;k++){let x=r()*w,y=r()*h,a=r()*6.28;c.beginPath();c.moveTo(x,y);for(let s=0;s<60;s++){a+=(r()-.5)*.7;x+=Math.cos(a)*24;y+=Math.sin(a)*24;c.lineTo(x,y)}c.strokeStyle=`rgba(120,118,124,${.05+r()*.14})`;c.lineWidth=.5+r()*2.4;c.stroke()}
    c.filter='none';noise(c,w,h,8,5)});
  mkTex('dark',1200,1000,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#33353c');g.addColorStop(1,'#24252b');c.fillStyle=g;c.fillRect(0,0,w,h);noise(c,w,h,18,9)});
  mkTex('kraft',1200,1000,(c,w,h)=>{const r=rng(13);c.fillStyle='#c49a68';c.fillRect(0,0,w,h);for(let k=0;k<2600;k++){c.fillStyle=`rgba(${r()<.5?90:250},${r()<.5?60:225},30,${r()*.12})`;c.fillRect(r()*w,r()*h,1+r()*3,1+r()*2)}noise(c,w,h,22,4)});
  mkTex('plaster',600,600,(c,w,h)=>{c.fillStyle='#808080';c.fillRect(0,0,w,h);noise(c,w,h,26,21)});
}

/* ---------- placeholder art ---------- */
function placeholder(){if(tex.ph)return tex.ph;return mkTex('ph',1000,1000,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#2f6bff');g.addColorStop(1,'#a43bff');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<7;i++){c.beginPath();c.arc(w*.85,h*.15,120+i*110,0,7);c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.08)';c.stroke()}
  c.fillStyle='#fff';c.textAlign='center';c.font='800 112px Sora,system-ui,sans-serif';c.fillText('YOUR',w/2,h*.46);c.fillText('DESIGN',w/2,h*.58);
  c.font='600 40px Manrope,system-ui,sans-serif';c.fillStyle='rgba(255,255,255,.8)';c.fillText('Upload it to see it here',w/2,h*.7)})}

/* draw the artwork into a box (with clipping) */
function art(c,x,y,w,h,rad,shape){
  c.save();if(shape==='circle'){c.beginPath();c.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,7)}else rr(c,x,y,w,h,rad||0);c.clip();
  c.fillStyle=st.img?st.bg:'#fff';c.fillRect(x,y,w,h);
  const im=st.img||placeholder(),iw=st.img?st.imgW:1000,ih=st.img?st.imgH:1000;
  const s=(st.fit==='fill'||!st.img)?Math.max(w/iw,h/ih):Math.min(w/iw,h/ih),dw=iw*s,dh=ih*s;
  c.imageSmoothingQuality='high';c.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
  // soft light falloff for realism
  const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'rgba(255,255,255,.10)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.06)');c.fillStyle=g;c.fillRect(x,y,w,h);
  c.restore()}

function person(c,cx,floor,ppc){ // 175 cm silhouette, feet at floor
  const R=[[4.5,-151],[8,-148.5],[18,-145.5],[21.5,-142],[23.5,-132],[25,-112],[25.5,-92],[24,-84],[21,-83],[20.5,-92],[19.5,-112],[17.5,-124],[16.5,-104],[17.5,-90],[16.5,-60],[14.5,-20],[15.5,-3],[17,0],[5,0],[5.5,-6],[3.5,-50],[1.2,-78],[0,-79]];
  const pts=R.concat(R.slice(0,-1).reverse().map(([x,y])=>[-x,y]));
  c.save();c.translate(cx,floor);c.scale(ppc,ppc);
  const g=c.createLinearGradient(0,-175,0,0);g.addColorStop(0,'#b7b0a8');g.addColorStop(1,'#a49d95');c.fillStyle=g;
  c.beginPath();pts.forEach(([x,y],k)=>{const n=pts[(k+1)%pts.length],mx=(x+n[0])/2,my=(y+n[1])/2;k?c.quadraticCurveTo(x,y,mx,my):c.moveTo(mx,my)});c.closePath();c.fill();
  c.beginPath();c.ellipse(0,-163.5,9.3,11.2,0,0,7);c.fill();
  c.restore();c.save();c.filter=`blur(${ppc*3}px)`;c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(cx,floor,ppc*22,ppc*3,0,0,7);c.fill();c.restore()}

/* ---------- scenes ---------- */
function wall(c,W,H,floor,outdoor){
  const g=c.createLinearGradient(0,0,0,floor);if(outdoor){g.addColorStop(0,'#d9dde2');g.addColorStop(1,'#c4cad1')}else{g.addColorStop(0,'#f1ede8');g.addColorStop(1,'#ddd6ce')}
  c.fillStyle=g;c.fillRect(0,0,W,floor);
  c.globalAlpha=.05;c.drawImage(tex.plaster,0,0,W,floor);c.globalAlpha=1;
  const l=c.createRadialGradient(W*.42,floor*.35,10,W*.42,floor*.35,W*.75);l.addColorStop(0,'rgba(255,255,255,.55)');l.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=l;c.fillRect(0,0,W,floor);
  const fg=c.createLinearGradient(0,floor,0,H);if(outdoor){fg.addColorStop(0,'#a9adb2');fg.addColorStop(1,'#8d9196')}else{fg.addColorStop(0,'#c8b9a7');fg.addColorStop(1,'#ad9b86')}
  c.fillStyle=fg;c.fillRect(0,floor,W,H-floor);
  if(outdoor){c.strokeStyle='rgba(0,0,0,.10)';c.lineWidth=2;for(let x=-200;x<W+200;x+=160){c.beginPath();c.moveTo(x,floor);c.lineTo(x+(x-W/2)*.6,H);c.stroke()}}
  c.fillStyle=outdoor?'rgba(0,0,0,.18)':'#f7f4f0';c.fillRect(0,floor-(outdoor?3:14),W,outdoor?3:14);
  c.fillStyle='rgba(0,0,0,.10)';c.fillRect(0,floor,W,3);
  const v=c.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,H*.95);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.18)');c.fillStyle=v;c.fillRect(0,0,W,H)}

function framed(c,bx,by,bw,bh,ppc){const u=v=>v*ppc;
  if(st.frame!=='none'){const f=Math.max(6,u(Math.min(2.6,Math.max(bw,bh)/ppc*.055))),cols={black:['#2b2b2e','#0d0d0f'],white:['#ffffff','#d9d9dc'],oak:['#c89a63','#8f6236']}[st.frame];
    c.save();c.shadowColor='rgba(0,0,0,.32)';c.shadowBlur=Math.max(8,u(6));c.shadowOffsetX=Math.max(2,u(1.5));c.shadowOffsetY=Math.max(4,u(2.5));const fg=c.createLinearGradient(bx,by,bx+bw,by+bh);fg.addColorStop(0,cols[0]);fg.addColorStop(1,cols[1]);c.fillStyle=fg;c.fillRect(bx-f,by-f,bw+2*f,bh+2*f);c.restore();
    c.fillStyle='rgba(0,0,0,.25)';c.fillRect(bx-1,by-1,bw+2,bh+2);art(c,bx,by,bw,bh,0);
    const gl=c.createLinearGradient(bx,by,bx+bw*.7,by+bh*.7);gl.addColorStop(0,'rgba(255,255,255,.18)');gl.addColorStop(.35,'rgba(255,255,255,.02)');gl.addColorStop(.36,'rgba(255,255,255,0)');c.fillStyle=gl;c.fillRect(bx,by,bw,bh);return}
  c.save();c.shadowColor='rgba(0,0,0,.30)';c.shadowBlur=Math.max(6,u(4));c.shadowOffsetX=Math.max(2,u(1.2));c.shadowOffsetY=Math.max(3,u(2));c.fillStyle='#ddd';c.fillRect(bx,by,bw,bh);c.restore();art(c,bx,by,bw,bh,0);
  c.fillStyle='rgba(255,255,250,.55)';const tw=Math.max(18,u(5)),tt=Math.max(8,u(1.8));[[bx,by,-.7],[bx+bw,by,.7]].forEach(([tx,ty,a])=>{c.save();c.translate(tx,ty);c.rotate(a);c.fillRect(-tw/2,-tt/2,tw,tt);c.restore()})}

function sceneWall(c,W,H){
  const z=size(),p=st.p,small=p==='poster'&&Math.max(z.w,z.h)<45,showP=st.person&&!small;let w=z.w,h=z.h;
  const floor=H*.86, top=H*.07;
  // vertical extent (cm above floor) the camera must show
  let itemTop, itemBottom=0, footW=w;
  if(p==='roller'){itemTop=h+9}
  else if(p==='aboard'){const bh=h+30;itemTop=bh+4;footW=w+18}
  else{const cy=Math.max(h/2+45,Math.min(155,h/2+60));itemBottom=cy-h/2;itemTop=cy+h/2;if(st.frame!=='none'&&p==='poster')itemTop+=3}
  const needH=Math.max(itemTop+6, showP?182:0), needW=footW+(showP?70:0)+20;
  let ppc=Math.min((floor-top)/needH,(W*.9)/needW);
  if(!showP){ppc=Math.min((floor-top)/(itemTop+8)*.92,(W*.8)/footW)}
  if(small){ // close-up: just the wall, poster big in frame
    wall(c,W,H,H*1.6,false);ppc=Math.min(H*.62/h,W*.62/w);const bw=w*ppc,bh=h*ppc,bx=(W-bw)/2,by=(H-bh)/2-H*.02;framed(c,bx,by,bw,bh,ppc);return}
  wall(c,W,H,floor,p==='aboard');
  const u=v=>v*ppc, totalW=u(footW)+(showP?u(70):0), x0=(W-totalW)/2+u(footW/2), px=x0+u(footW/2)+u(42);
  if(showP)person(c,px,floor,ppc);
  if(p==='roller'){
    const bx=x0-u(w/2), by=floor-u(9)-u(h);
    c.save();c.filter=`blur(${u(6)}px)`;c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(x0+u(6),floor-u(1),u(w/2+8),u(4),0,0,7);c.fill();c.restore();
    c.save();c.shadowColor='rgba(0,0,0,.28)';c.shadowBlur=u(10);c.shadowOffsetX=u(4);art(c,bx,by,u(w),u(h),0);c.restore();
    art(c,bx,by,u(w),u(h),0);
    const rail=c.createLinearGradient(0,by-u(2.2),0,by+u(.6));rail.addColorStop(0,'#5b5e66');rail.addColorStop(.5,'#c5c8cf');rail.addColorStop(1,'#3d4046');c.fillStyle=rail;rr(c,bx-u(1),by-u(2.2),u(w+2),u(2.8),u(1));c.fill();
    const bb=c.createLinearGradient(0,floor-u(9),0,floor);bb.addColorStop(0,'#e3e5ea');bb.addColorStop(.45,'#a9adb6');bb.addColorStop(1,'#62666e');c.fillStyle=bb;rr(c,bx-u(3),floor-u(9.5),u(w+6),u(8.5),u(3));c.fill();
    c.fillStyle='rgba(0,0,0,.25)';rr(c,bx-u(3),floor-u(1.6),u(w+6),u(1.6),u(.8));c.fill();
    c.fillStyle='#3a3d44';rr(c,bx+u(2),floor-u(1.2),u(10),u(1.4),u(.6));c.fill();rr(c,bx+u(w-12),floor-u(1.2),u(10),u(1.4),u(.6));c.fill();
  }else if(p==='aboard'){
    const ph=h+30, fx=x0-u(w/2+9), fy=floor-u(ph), fw=u(w+18);
    c.save();c.filter=`blur(${u(5)}px)`;c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(x0,floor,u(w/2+16),u(4.5),0,0,7);c.fill();c.restore();
    const fr=c.createLinearGradient(fx,0,fx+fw,0);fr.addColorStop(0,'#8f949c');fr.addColorStop(.5,'#eef0f3');fr.addColorStop(1,'#8b9098');
    c.fillStyle='#4a4e55';rr(c,fx+u(2),floor-u(20),u(3.2),u(20),u(1));c.fill();rr(c,fx+fw-u(5.2),floor-u(20),u(3.2),u(20),u(1));c.fill();
    c.save();c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=u(8);c.shadowOffsetY=u(2);c.fillStyle=fr;rr(c,fx,fy,fw,u(h+18),u(2.5));c.fill();c.restore();
    c.fillStyle='#2f3238';rr(c,fx+fw/2-u(9),fy-u(4),u(18),u(5),u(2.4));c.fill();
    art(c,x0-u(w/2),fy+u(9),u(w),u(h),0);
    c.fillStyle='rgba(255,255,255,.06)';c.beginPath();c.moveTo(x0-u(w/2),fy+u(9));c.lineTo(x0+u(w*.1),fy+u(9));c.lineTo(x0-u(w/2),fy+u(9+h*.55));c.fill();
  }else{
    const cy=Math.max(h/2+45,Math.min(155,h/2+60)), bx=x0-u(w/2), by=floor-u(cy+h/2), bw=u(w), bh=u(h);
    if(p==='poster'){framed(c,bx,by,bw,bh,ppc)}
    else if(false){
      const f=u(2.6),cols={black:['#2b2b2e','#0d0d0f'],white:['#ffffff','#d9d9dc'],oak:['#c89a63','#8f6236']}[st.frame];
      c.save();c.shadowColor='rgba(0,0,0,.32)';c.shadowBlur=u(6);c.shadowOffsetX=u(1.5);c.shadowOffsetY=u(2.5);const fg=c.createLinearGradient(bx,by,bx+bw,by+bh);fg.addColorStop(0,cols[0]);fg.addColorStop(1,cols[1]);c.fillStyle=fg;c.fillRect(bx-f,by-f,bw+2*f,bh+2*f);c.restore();
      c.fillStyle='rgba(0,0,0,.25)';c.fillRect(bx-1,by-1,bw+2,bh+2);art(c,bx,by,bw,bh,0);
      const gl=c.createLinearGradient(bx,by,bx+bw*.7,by+bh*.7);gl.addColorStop(0,'rgba(255,255,255,.18)');gl.addColorStop(.35,'rgba(255,255,255,.02)');gl.addColorStop(.36,'rgba(255,255,255,0)');c.fillStyle=gl;c.fillRect(bx,by,bw,bh);
    }else{
      const th=p==='sign'?u(.5):0;
      c.save();c.shadowColor='rgba(0,0,0,.30)';c.shadowBlur=u(p==='vinyl'?5:4);c.shadowOffsetX=u(1.2);c.shadowOffsetY=u(2);c.fillStyle='#ddd';c.fillRect(bx,by,bw+th,bh+th);c.restore();
      if(th){c.fillStyle='#bcbcbc';c.fillRect(bx+th,by+bh,bw,th);c.fillRect(bx+bw,by+th,th,bh)}
      art(c,bx,by,bw,bh,p==='sign'?u(.4):0);
      if(p==='vinyl'){ // gentle fabric waves + eyelets
        c.save();c.beginPath();c.rect(bx,by,bw,bh);c.clip();for(let i=0;i<6;i++){const gx=bx+bw*(i/6),g=c.createLinearGradient(gx,0,gx+bw/6,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,i%2?'rgba(255,255,255,.035)':'rgba(0,0,0,.025)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(gx,by,bw/6,bh)}c.restore();
        const r=Math.max(2.5,u(1.1)),ins=Math.max(r*2.2,u(3));const pts=[];const nx=Math.max(1,Math.round(w/60)),ny=Math.max(1,Math.round(h/60));
        for(let i=0;i<=nx;i++){pts.push([bx+ins+(bw-2*ins)*i/nx,by+ins],[bx+ins+(bw-2*ins)*i/nx,by+bh-ins])}for(let j=1;j<ny;j++){pts.push([bx+ins,by+ins+(bh-2*ins)*j/ny],[bx+bw-ins,by+ins+(bh-2*ins)*j/ny])}
        pts.forEach(([ex,ey])=>{const g=c.createRadialGradient(ex-r*.3,ey-r*.3,r*.1,ex,ey,r*1.3);g.addColorStop(0,'#ffffff');g.addColorStop(.6,'#b8bcc4');g.addColorStop(1,'#6b7078');c.fillStyle=g;c.beginPath();c.arc(ex,ey,r*1.3,0,7);c.fill();c.fillStyle='#2b2d31';c.beginPath();c.arc(ex,ey,r*.55,0,7);c.fill()});
      }
      if(p==='sign'){const r=Math.max(2.5,u(1.2)),ins=u(3.5);[[bx+ins,by+ins],[bx+bw-ins,by+ins],[bx+ins,by+bh-ins],[bx+bw-ins,by+bh-ins]].forEach(([ex,ey])=>{c.save();c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=r;c.shadowOffsetY=r*.4;const g=c.createRadialGradient(ex-r*.4,ey-r*.4,r*.1,ex,ey,r*1.4);g.addColorStop(0,'#fff');g.addColorStop(.5,'#c9ccd2');g.addColorStop(1,'#7c818a');c.fillStyle=g;c.beginPath();c.arc(ex,ey,r*1.4,0,7);c.fill();c.restore()})}
      if(p==='poster'){ // tape corners on unframed posters
        c.fillStyle='rgba(255,255,250,.55)';const tw=Math.max(14,u(5)),tt=Math.max(6,u(1.8));[[bx,by,-.7],[bx+bw,by,.7]].forEach(([tx,ty,a])=>{c.save();c.translate(tx,ty);c.rotate(a);c.fillRect(-tw/2,-tt/2,tw,tt);c.restore()})}
    }
  }
}

function cup(c,x,y,ppc){const u=v=>v*ppc;c.save();c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=u(2.5);c.shadowOffsetX=u(.8);c.shadowOffsetY=u(1.2);c.fillStyle='#f6f6f4';c.beginPath();c.arc(x,y,u(7.5),0,7);c.fill();c.restore();
  c.fillStyle='#e9e8e4';c.beginPath();c.arc(x,y,u(6.8),0,7);c.fill();
  c.save();c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=u(1.5);c.fillStyle='#fbfbfa';c.beginPath();c.arc(x,y,u(4.6),0,7);c.fill();c.restore();
  const g=c.createRadialGradient(x-u(.8),y-u(.8),u(.3),x,y,u(3.9));g.addColorStop(0,'#8a5a36');g.addColorStop(1,'#4b2a14');c.fillStyle=g;c.beginPath();c.arc(x,y,u(3.9),0,7);c.fill();
  c.strokeStyle='rgba(255,236,210,.55)';c.lineWidth=u(.25);c.beginPath();c.arc(x+u(.4),y-u(.3),u(1.6),.4,2.6);c.stroke();
  c.fillStyle='#f3f2ef';rr(c,x+u(4.3),y-u(.9),u(2.8),u(1.8),u(.8));c.fill()}

function paper(c,cx,cy,w,h,rot,rad,shape,front,ppc){
  c.save();c.translate(cx,cy);c.rotate(rot);
  c.save();c.shadowColor='rgba(0,0,0,.30)';c.shadowBlur=Math.max(4,ppc*.9);c.shadowOffsetX=Math.max(2,ppc*.25);c.shadowOffsetY=Math.max(3,ppc*.45);c.fillStyle='#fff';
  if(shape==='circle'){c.beginPath();c.ellipse(0,0,w/2,h/2,0,0,7)}else rr(c,-w/2,-h/2,w,h,rad);c.fill();c.restore();
  if(front){if(st.p==='sticker'){const b=Math.max(2,ppc*.22);art(c,-w/2+b,-h/2+b,w-2*b,h-2*b,Math.max(0,rad-b),shape);
      const g=c.createLinearGradient(-w/2,-h/2,w/2,h/2);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(.4,'rgba(255,255,255,0)');c.fillStyle=g;if(shape==='circle'){c.beginPath();c.ellipse(0,0,w/2,h/2,0,0,7)}else rr(c,-w/2,-h/2,w,h,rad);c.fill()}
    else art(c,-w/2,-h/2,w,h,rad,shape)}
  else{c.fillStyle='#f4f4f2';if(shape==='circle'){c.beginPath();c.ellipse(0,0,w/2,h/2,0,0,7)}else rr(c,-w/2,-h/2,w,h,rad);c.fill()}
  c.strokeStyle='rgba(0,0,0,.08)';c.lineWidth=1;if(shape==='circle'){c.beginPath();c.ellipse(0,0,w/2,h/2,0,0,7)}else rr(c,-w/2,-h/2,w,h,rad);c.stroke();
  c.restore()}

function sceneTable(c,W,H){
  const z=size(),p=st.p,surf=P[p].surface||st.surface,w=z.w,h=z.h;
  c.drawImage(tex[surf],0,0,W,H);
  const l=c.createRadialGradient(W*.4,H*.35,10,W*.5,H*.5,W*.85);l.addColorStop(0,'rgba(255,255,255,.18)');l.addColorStop(1,'rgba(0,0,0,.28)');c.fillStyle=l;c.fillRect(0,0,W,H);
  const big=Math.max(w,h);let ppc=Math.min(W,H)*(p==='sticker'?.5:p==='card'?.52:.66)/big;
  const u=v=>v*ppc, shape=shapeOf(), rad=p==='card'&&st.corners==='round'?u(.35):p==='sticker'&&shape!=='circle'?u(.4):0;
  const cx=W*.5,cy=H*.53;
  if(p!=='sticker')cup(c,W*.86,H*.13,Math.min(ppc,W*.0095));
  if(p==='card'){paper(c,cx+u(w*.42),cy-u(h*.34),u(w),u(h),.16,rad,'rect',true,ppc);paper(c,cx-u(w*.38),cy-u(h*.18),u(w),u(h),-.22,rad,'rect',false,ppc);paper(c,cx,cy+u(h*.18),u(w),u(h),-.05,rad,'rect',true,ppc)}
  else if(p==='flyer'){paper(c,cx+u(w*.12),cy-u(h*.05),u(w),u(h),.07,0,'rect',true,ppc);paper(c,cx-u(w*.04),cy+u(h*.02),u(w),u(h),-.05,0,'rect',true,ppc)}
  else if(p==='sticker'){paper(c,cx+u(w*.62),cy-u(h*.42),u(w),u(h),.3,rad,shape,true,ppc);paper(c,cx-u(w*.12),cy+u(h*.1),u(w),u(h),-.12,rad,shape,true,ppc)}
  else{paper(c,cx,cy,u(w),u(h),-.04,0,'rect',true,ppc)}
}

function draw(W,H,c){c=c||ctx;const sc=P[st.p].scene;c.save();c.clearRect(0,0,W,H);if(sc==='wall')sceneWall(c,W,H);else sceneTable(c,W,H);
  // credit pill
  const t='Mock-up by SMR Graphics · smrgraphics.co.uk',fs=Math.round(W*.0145);c.font=`700 ${fs}px Manrope,system-ui,sans-serif`;const tw=c.measureText(t).width,ph=fs*2,pw=tw+fs*1.6,x=W-pw-fs,y=H-ph-fs;
  c.fillStyle='rgba(10,10,18,.55)';rr(c,x,y,pw,ph,ph/2);c.fill();c.fillStyle='#fff';c.textBaseline='middle';c.fillText(t,x+fs*.8,y+ph/2+1);c.restore()}

/* ---------- UI ---------- */
const CSS=`
.mk{position:fixed;inset:0;z-index:9999;background:#0b0b12;color:#f2f2f7;display:none;flex-direction:column;font-family:Manrope,system-ui,sans-serif;overscroll-behavior:contain}
.mk.on{display:flex}
.mk *{box-sizing:border-box}
.mk-top{flex:none;display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);background:#0b0b12}
.mk-top b{font:700 17px/1.1 Sora,system-ui,sans-serif}.mk-top small{display:block;font-size:11.5px;font-weight:700;color:#9a9ab0;letter-spacing:.03em}
.mk-top .mk-g{background:linear-gradient(110deg,#2f6bff,#a43bff);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:2px}
.mk-x{margin-left:auto;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#fff;font-size:22px;line-height:1;cursor:pointer}
.mk-body{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.mk-stage{flex:none;position:relative;background:#14141e;display:flex;align-items:center;justify-content:center;padding:10px}
.mk-stage canvas{display:block;width:100%;height:auto;max-height:42vh;object-fit:contain;border-radius:14px;box-shadow:0 18px 40px -18px rgba(0,0,0,.8)}
.mk-tag{position:absolute;left:18px;top:18px;padding:5px 10px;border-radius:999px;background:rgba(10,10,18,.7);font-size:12px;font-weight:800;backdrop-filter:blur(6px)}
.mk-drop{position:absolute;inset:10px;border-radius:14px;border:2px dashed #8f7bff;background:rgba(20,16,40,.82);display:none;align-items:center;justify-content:center;font:700 18px Sora,system-ui,sans-serif}
.mk.drag .mk-drop{display:flex}
.mk-busy{position:absolute;inset:10px;border-radius:14px;background:rgba(11,11,18,.6);display:none;align-items:center;justify-content:center;font:700 15px Sora,system-ui,sans-serif}.mk.busy .mk-busy{display:flex}
.mk-panel{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 14px 28px}
.mk-step{margin-bottom:18px}.mk-step>h4{margin:0 0 9px;font:700 13px/1 Sora,system-ui,sans-serif;letter-spacing:.02em;color:#c9c9dc;display:flex;align-items:center;gap:8px}
.mk-step>h4 i{font-style:normal;width:21px;height:21px;border-radius:50%;display:grid;place-items:center;font-size:11px;background:linear-gradient(110deg,#2f6bff,#a43bff);color:#fff}
.mk-up{display:flex;align-items:center;gap:12px;width:100%;padding:14px;border-radius:16px;border:1.5px dashed rgba(160,140,255,.55);background:rgba(120,100,255,.08);color:#fff;cursor:pointer;text-align:left}
.mk-up svg{flex:none;width:30px;height:30px}
.mk-up b{display:block;font:700 15px Sora,system-ui,sans-serif}.mk-up span{display:block;font-size:12.5px;color:#a8a8c0;margin-top:2px}
.mk-paste{width:100%;margin-top:8px;padding:11px;border-radius:12px;border:1.5px dashed rgba(255,255,255,.18);background:transparent;color:#d8d8e6;font:700 13.5px Manrope,system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}.mk-paste svg{width:17px;height:17px}
.mk-tip{font-size:12px;color:#c9b8ff;margin:6px 0 0;text-align:center}.mk-tip:empty{display:none}
.mk-file{display:none;align-items:center;gap:10px;margin-top:9px;font-size:13px}.mk-file.on{display:flex}
.mk-file em{font-style:normal;min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#c9c9dc}
.mk-q{flex:none;padding:4px 9px;border-radius:999px;font-size:11.5px;font-weight:800}
.mk-q.ok{background:rgba(52,199,89,.16);color:#5be37f}.mk-q.mid{background:rgba(255,190,40,.16);color:#ffc84a}.mk-q.low{background:rgba(255,80,80,.16);color:#ff7a7a}
.mk-prods{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.mk-pr{display:flex;flex-direction:column;align-items:center;gap:6px;padding:11px 4px 9px;border-radius:14px;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);color:#e8e8f2;cursor:pointer;font:700 12px/1.15 Manrope,system-ui,sans-serif;text-align:center}
.mk-pr svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.mk-pr.on{border-color:transparent;background:linear-gradient(#17142b,#17142b) padding-box,linear-gradient(110deg,#2f6bff,#a43bff) border-box;color:#fff}
.mk-chips{display:flex;flex-wrap:wrap;gap:7px}
.mk-c{padding:9px 13px;border-radius:999px;border:1.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:#e8e8f2;font:700 13px Manrope,system-ui,sans-serif;cursor:pointer}
.mk-c.on{background:#fff;color:#111;border-color:#fff}
.mk-cust{display:none;gap:8px;align-items:center;margin-top:9px;font-size:13px;color:#a8a8c0}.mk-cust.on{display:flex}
.mk-cust input{width:84px;padding:9px 10px;border-radius:12px;border:1.5px solid rgba(255,255,255,.14);background:#14141e;color:#fff;font:700 14px Manrope,system-ui,sans-serif}
.mk-opt{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:11px}.mk-opt>span{width:94px;font-size:12.5px;font-weight:700;color:#a8a8c0}
.mk-sw{width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,255,255,.25);cursor:pointer;padding:0}.mk-sw.on{outline:2.5px solid #a48bff;outline-offset:2px}
.mk-note{font-size:12.5px;line-height:1.45;color:#a8a8c0;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04);margin-top:4px}.mk-note:empty{display:none}
.mk-note b{color:#fff}
.mk-act{display:grid;gap:9px}
.mk-btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:15px;border-radius:16px;border:0;font:700 15px Sora,system-ui,sans-serif;cursor:pointer;color:#fff;text-decoration:none}
.mk-btn svg{width:19px;height:19px}
.mk-dl{background:linear-gradient(110deg,#2f6bff,#a43bff)}
.mk-wa{background:#25d366;color:#06351a}
.mk-sh{background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.16)}
.mk-share{display:none;padding:12px;border-radius:14px;background:rgba(255,255,255,.05);font-size:13px}.mk-share.on{display:block}
.mk-share input{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:#14141e;color:#fff;font:600 13px Manrope,system-ui;margin:8px 0}
.mk-share .r{display:flex;gap:7px;flex-wrap:wrap}
.mk-qty{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:700;color:#c9c9dc}
.mk-qty button{width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:#fff;font-size:18px;cursor:pointer}
.mk-qty input{width:70px;text-align:center;padding:8px;border-radius:12px;border:1.5px solid rgba(255,255,255,.14);background:#14141e;color:#fff;font:700 15px Manrope,system-ui,sans-serif}
.mk-priv{font-size:11.5px;color:#7d7d95;text-align:center;margin-top:6px}
@media(min-width:900px){
 .mk-body{flex-direction:row}
 .mk-stage{flex:1.45;padding:26px}
 .mk-stage canvas{max-height:calc(100vh - 120px);width:auto;max-width:100%}
 .mk-tag{left:40px;top:40px}
 .mk-panel{flex:1;max-width:440px;border-left:1px solid rgba(255,255,255,.08);padding:20px 22px 32px}
 .mk-prods{grid-template-columns:repeat(3,1fr)}
}
`;
const UP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>';
const DL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 20h14"/></svg>';
const SH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.8 7.4-4.4M8.3 13.2l7.4 4.4"/></svg>';
const PASTE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9.5 10h5M9.5 14h5"/></svg>';
const WAI='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>';

function build(){
  if(built)return;built=true;
  const s=document.createElement('style');s.textContent=CSS;document.head.appendChild(s);
  root=document.createElement('div');root.className='mk';root.setAttribute('role','dialog');root.setAttribute('aria-label','Mock-up Studio');
  root.innerHTML=`<div class="mk-top"><div><b>Mock-up <span class="mk-g">Studio</span></b><small>See your design printed, before you order</small></div><button class="mk-x" type="button" aria-label="Close">×</button></div>
  <div class="mk-body"><div class="mk-stage"><canvas width="1200" height="1000"></canvas><span class="mk-tag" id="mkTag"></span><div class="mk-drop">Drop your design here</div><div class="mk-busy">Opening your design…</div></div>
  <div class="mk-panel">
   <div class="mk-step"><h4><i>1</i>Your design</h4>
    <button class="mk-up" type="button" id="mkUp">${UP}<div><b>Upload your design</b><span>JPG, PNG or PDF · drag it in or paste it</span></div></button>
    <input type="file" id="mkFile" accept="image/*,application/pdf" hidden>
    <button class="mk-paste" type="button" id="mkPaste">${PASTE}<span>Paste an image</span></button><p class="mk-tip" id="mkTip"></p>
    <div class="mk-file" id="mkFileRow"><em id="mkName"></em><span class="mk-q" id="mkQ"></span></div></div>
   <div class="mk-step"><h4><i>2</i>Pick a product</h4><div class="mk-prods" id="mkProds"></div></div>
   <div class="mk-step"><h4><i>3</i>Choose a size</h4><div class="mk-chips" id="mkSizes"></div>
    <div class="mk-cust" id="mkCust">W <input type="number" id="mkCw" min="20" max="1000" inputmode="numeric"> × H <input type="number" id="mkCh" min="20" max="500" inputmode="numeric"> cm</div></div>
   <div class="mk-step"><h4><i>4</i>Fine-tune</h4><div id="mkOpts"></div><div class="mk-note" id="mkNote"></div></div>
   <div class="mk-step"><h4><i>5</i>Love it?</h4><div class="mk-act">
    <div style="display:flex;gap:9px"><button class="mk-btn mk-dl" type="button" id="mkDl">${DL}Download</button><button class="mk-btn mk-sh" type="button" id="mkSh">${SH}Share link</button></div>
    <div class="mk-share" id="mkShareBox"></div>
    <div class="mk-qty">Quantity <button type="button" data-q="-1" aria-label="Less">−</button><input id="mkQty" type="number" min="1" value="1" inputmode="numeric"><button type="button" data-q="1" aria-label="More">+</button></div>
    <a class="mk-btn mk-wa" href="#" id="mkWa">${WAI}Get a quote on WhatsApp</a>
    <p class="mk-priv">Your design stays on your device. It's only uploaded if you tap Share link (then it's deleted after 30 days).</p></div></div>
  </div></div>`;
  document.body.appendChild(root);
  cv=root.querySelector('canvas');ctx=cv.getContext('2d');buildTex();
  $('#mkProds').innerHTML=ORDER.map(k=>`<button type="button" class="mk-pr" data-p="${k}"><svg viewBox="0 0 24 24">${IC[k]}</svg>${P[k].n}</button>`).join('');
  root.addEventListener('click',onClick);
  $('.mk-x').onclick=close;
  $('#mkUp').onclick=()=>$('#mkFile').click();
  $('#mkFile').onchange=e=>{const f=e.target.files[0];if(f)load(f);e.target.value=''};
  $('#mkCw').oninput=$('#mkCh').oninput=()=>{st.cw=+$('#mkCw').value||0;st.ch=+$('#mkCh').value||0;if(st.cw>=20&&st.ch>=20)refresh(true)};
  $('#mkQty').oninput=()=>{st.qty=Math.max(1,+$('#mkQty').value||1)};
  $('#mkPaste').onclick=pasteBtn;
  $('#mkDl').onclick=download;$('#mkSh').onclick=shareLink;$('#mkWa').onclick=e=>{e.preventDefault();quote()};
  ['dragenter','dragover'].forEach(t=>root.addEventListener(t,e=>{e.preventDefault();root.classList.add('drag')}));
  ['dragleave','drop'].forEach(t=>root.addEventListener(t,e=>{e.preventDefault();if(t==='dragleave'&&e.relatedTarget&&root.contains(e.relatedTarget))return;root.classList.remove('drag')}));
  root.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f)load(f)});
  document.addEventListener('paste',e=>{if(!root.classList.contains('on'))return;const it=[...(e.clipboardData||{}).items||[]].find(i=>i.type.startsWith('image/'));if(it)load(it.getAsFile())});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('on'))close()});
}

function chip(label,on,attr){return `<button type="button" class="mk-c${on?' on':''}" ${attr}>${label}</button>`}
function refresh(sizeOnly){
  const pr=P[st.p];
  root.querySelectorAll('.mk-pr').forEach(b=>b.classList.toggle('on',b.dataset.p===st.p));
  if(!sizeOnly){$('#mkSizes').innerHTML=pr.sizes.map((z,i)=>chip(z.l,i===st.si,`data-s="${i}"`)).join('')+(pr.custom?chip('Custom size',st.si===pr.sizes.length,`data-s="${pr.sizes.length}"`):'');
    $('#mkCust').classList.toggle('on',!!pr.custom&&st.si===pr.sizes.length);$('#mkCw').value=st.cw;$('#mkCh').value=st.ch;
    let o='';
    if(orient()&&!(st.p==='card'&&size().w===size().h))o+=`<div class="mk-opt"><span>Orientation</span>${chip('Portrait',orient()==='p','data-o="p"')}${chip('Landscape',orient()==='l','data-o="l"')}</div>`;
    if(st.img)o+=`<div class="mk-opt"><span>Design</span>${chip('Fill',st.fit==='fill','data-f="fill"')}${chip('Fit inside',st.fit==='fit','data-f="fit"')}</div>`;
    if(st.img&&st.fit==='fit')o+=`<div class="mk-opt"><span>Background</span>${['#ffffff','#000000','#f4efe6','#1b2a4a','#c8102e',edge()].filter((v,i,a)=>a.indexOf(v)===i).map(c=>`<button type="button" class="mk-sw${st.bg===c?' on':''}" data-bg="${c}" style="background:${c}" aria-label="Background ${c}"></button>`).join('')}</div>`;
    if(pr.corners)o+=`<div class="mk-opt"><span>Corners</span>${chip('Square',st.corners==='square','data-k="square"')}${chip('Rounded',st.corners==='round','data-k="round"')}</div>`;
    if(pr.frame)o+=`<div class="mk-opt"><span>Frame</span>${['black','white','oak','none'].map(f=>chip(f==='none'?'No frame':f[0].toUpperCase()+f.slice(1),st.frame===f,`data-fr="${f}"`)).join('')}</div>`;
    if(pr.scene==='table'&&!pr.surface)o+=`<div class="mk-opt"><span>Surface</span>${[['wood','Wood'],['marble','Marble'],['dark','Slate']].map(([k,l])=>chip(l,st.surface===k,`data-su="${k}"`)).join('')}</div>`;
    if(pr.scene==='wall'&&!(st.p==='poster'&&Math.max(size().w,size().h)<45))o+=`<div class="mk-opt"><span>Size guide</span>${chip('Show person',st.person,'data-pe="1"')}${chip('Hide',!st.person,'data-pe="0"')}</div>`;
    $('#mkOpts').innerHTML=o}
  else{root.querySelectorAll('[data-s]').forEach(b=>b.classList.toggle('on',+b.dataset.s===st.si))}
  const z=size();$('#mkTag').textContent=pr.n+' · '+(st.si===pr.sizes.length&&pr.custom?st.cw+' × '+st.ch+' cm':z.l);
  note();draw(cv.width,cv.height);
}
function edge(){if(!st.img)return '#ffffff';try{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');x.drawImage(st.img,0,0,8,8);const d=x.getImageData(0,0,1,1).data;return '#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('')}catch(e){return '#ffffff'}}
function note(){
  const z=size(),pr=P[st.p];let t=[];
  if(!st.img){$('#mkNote').innerHTML='Upload your logo, poster or artwork to see it on any product. No design yet? <b>We can design it for you.</b>';$('#mkQ').textContent='';return}
  const ar=z.w/z.h,ia=st.imgW/st.imgH,diff=Math.abs(Math.log(ar/ia));
  if(diff>.06)t.push(st.fit==='fill'?'Your design is a different shape to this size, so <b>the edges are trimmed</b>. Try “Fit inside”, or we can adjust it for you.':'Your design is a different shape to this size, so <b>there is space around it</b>. We can resize it to fit perfectly.');
  const q=quality();const qb=$('#mkQ');qb.className='mk-q '+q.c;qb.textContent=q.t;
  if(q.c==='low')t.push('Your file is <b>too small for this size</b> and may print blurry. Send us a bigger file or a PDF, or we can rebuild it.');
  else if(q.c==='mid')t.push('Quality is <b>OK</b> for this size. A bigger file or PDF would be sharper.');
  if(['flyer','menu','card','sticker','poster'].includes(st.p))t.push('Tip: keep text 3 mm inside the edges. We check every file before printing.');
  $('#mkNote').innerHTML=t.join('<br><br>');
}
function quality(){if(st.vector)return {c:'ok',t:'✓ Print ready (PDF)'};const z=size(),pr=P[st.p],wi=z.w/2.54,hi=z.h/2.54;
  const dpi=st.fit==='fill'?Math.min(st.imgW/wi,st.imgH/hi):Math.max(st.imgW/wi,st.imgH/hi);
  const [good,ok]=(st.p==='poster'&&Math.max(z.w,z.h)<45)?[250,120]:pr.dpi;
  return dpi>=good*.85?{c:'ok',t:'✓ Great quality'}:dpi>=ok?{c:'mid',t:'OK quality'}:{c:'low',t:'Low quality'}}

function onClick(e){
  const b=e.target.closest('button,[data-q]');if(!b||!root.contains(b))return;const d=b.dataset;
  if(d.p){if(st.p!==d.p){st.p=d.p;st.si=0;st.orient=null}refresh();return}
  if(d.s!=null){st.si=+d.s;refresh()}
  else if(d.o){st.orient=d.o;refresh()}
  else if(d.f){st.fit=d.f;if(d.f==='fit'&&st.bg==='#ffffff')st.bg=edge();refresh()}
  else if(d.bg){st.bg=d.bg;refresh()}
  else if(d.k){st.corners=d.k;refresh()}
  else if(d.fr){st.frame=d.fr;refresh()}
  else if(d.su){st.surface=d.su;refresh()}
  else if(d.pe){st.person=d.pe==='1';refresh()}
  else if(d.q){st.qty=Math.max(1,st.qty+ +d.q);$('#mkQty').value=st.qty}
}

/* ---------- loading files ---------- */
/* fast photo opening: decode + shrink in one step where the browser can, so big phone photos open quickly */
function openPhoto(f,max){
  const viaImg=()=>new Promise((res,rej)=>{const u=URL.createObjectURL(f),im=new Image();im.decoding='async';im.onload=()=>{const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res({c,w:im.naturalWidth,h:im.naturalHeight})};im.onerror=()=>{URL.revokeObjectURL(u);rej()};im.src=u});
  if(!window.createImageBitmap)return viaImg();
  return createImageBitmap(f,{imageOrientation:'from-image'}).then(bm=>{const W=bm.width,H=bm.height,k=Math.min(1,max/Math.max(W,H));
      const go=src=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(W*k));c.height=Math.max(1,Math.round(H*k));const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(src,0,0,c.width,c.height);return {c,w:W,h:H}};
      if(k>=1){const r=go(bm);bm.close&&bm.close();return r}
      return createImageBitmap(f,{imageOrientation:'from-image',resizeWidth:Math.round(W*k),resizeHeight:Math.round(H*k),resizeQuality:'high'}).then(b2=>{const ok=b2.width===Math.round(W*k);const r=go(ok?b2:bm);b2.close&&b2.close();bm.close&&bm.close();return r}).catch(()=>{const r=go(bm);bm.close&&bm.close();return r})})
    .catch(viaImg)}

function mtip(t){const el=$('#mkTip');el.textContent=t||'';clearTimeout(mtip.t);if(t)mtip.t=setTimeout(()=>el.textContent='',6000)}
function pasteBtn(){
  if(!navigator.clipboard||!navigator.clipboard.read){mtip(!/Mobi/.test(navigator.userAgent)?'Press Ctrl+V (or ⌘+V) to paste your image.':'Your browser can’t paste images here. Save it, then tap Upload.');return}
  navigator.clipboard.read().then(items=>{for(const it of items){const t=it.types.find(x=>/^image\//.test(x));if(t)return it.getType(t).then(b=>{mtip('');load(new File([b],'pasted image.'+(t.split('/')[1]||'png'),{type:t}))})}
    mtip('There’s no image copied. Copy one first (long-press it → Copy), then tap Paste.')}).catch(()=>mtip('Paste was blocked. Allow paste when asked, or use Upload.'))}
function setImg(src,w,h,vector,name){st.img=src;st.imgW=w;st.imgH=h;st.vector=vector;st.name=name;st.bg='#ffffff';
  $('#mkName').textContent=name;$('#mkFileRow').classList.add('on');$('#mkUp').querySelector('b').textContent='Change design';
  // auto-pick a matching orientation for the chosen product
  const pr=P[st.p];if(orient()&&!st.orient)st.orient=w>h*1.05?'l':h>w*1.05?'p':pr.orient;refresh()}
function load(f){
  if(f.type==='application/pdf'||/\.pdf$/i.test(f.name||''))return loadPdf(f);
  busyM(1);openPhoto(f,3200).then(({c,w,h})=>{busyM(0);setImg(c,w,h,false,f.name||'Your design')}).catch(()=>{busyM(0);alert('Sorry, that file couldn’t be opened. Please save it as a JPG, PNG or PDF and try again.')})}
function busyM(on){root.classList.toggle('busy',!!on)}
function loadPdf(f){
  busyM(1);const go=()=>{f.arrayBuffer().then(b=>pdfjsLib.getDocument({data:b}).promise).then(doc=>doc.getPage(1)).then(pg=>{const v0=pg.getViewport({scale:1}),k=Math.min(4,3600/Math.max(v0.width,v0.height)),v=pg.getViewport({scale:k}),c=document.createElement('canvas');c.width=Math.round(v.width);c.height=Math.round(v.height);
    return pg.render({canvasContext:c.getContext('2d'),viewport:v}).promise.then(()=>{busyM(0);setImg(c,c.width,c.height,true,f.name)})}).catch(()=>{busyM(0);alert('Sorry, that PDF couldn’t be opened here. Please save the first page as a JPG or PNG and try again.')})};
  if(window.pdfjsLib)return go();
  const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  s.onload=()=>{pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';go()};
  s.onerror=()=>{busyM(0);alert('PDF preview needs an internet connection. Please try again, or upload a JPG or PNG.')};document.head.appendChild(s)}

/* ---------- output ---------- */
function download(){
  const c=document.createElement('canvas');c.width=2400;c.height=2000;const x=c.getContext('2d');x.scale(2,2);draw(1200,1000,x);
  const name='smr-mockup-'+P[st.p].n.toLowerCase().replace(/[^a-z]+/g,'-').replace(/-$/,'')+'.png';
  c.toBlob(b=>{const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)},'image/png')}
let shared={key:'',url:''};
function shareLink(){const box=$('#mkShareBox'),key=JSON.stringify([st.p,st.si,st.orient,st.fit,st.bg,st.corners,st.frame,st.surface,st.person,st.cw,st.ch,st.name,st.imgW]);
  const show=url=>{box.classList.add('on');box.innerHTML=`<b>Your view-only link</b> (lasts 30 days)<input readonly value="${url}" onclick="this.select()"><div class="r"><button class="mk-c on" type="button" id="mkCopy">Copy link</button><a class="mk-c" href="https://wa.me/?text=${encodeURIComponent('Have a look at this 👀 '+url)}" target="_blank" rel="noopener">Send on WhatsApp</a>${navigator.share?'<button class="mk-c" type="button" id="mkNat">More…</button>':''}</div>`;
    $('#mkCopy').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(url);$('#mkCopy').textContent='Copied ✓'};const n=$('#mkNat');if(n)n.onclick=()=>navigator.share({title:'My mock-up',url}).catch(()=>{})};
  if(shared.key===key&&shared.url)return show(shared.url);
  box.classList.add('on');box.textContent='Making your link…';
  const c=document.createElement('canvas');c.width=2400;c.height=2000;const x=c.getContext('2d');x.scale(2,2);draw(1200,1000,x);
  if(!window.SMRShare){box.textContent='Sharing isn’t available here.';return}
  SMRShare.upload(c,'mockup',P[st.p].n+' mock-up').then(url=>{shared={key,url};show(url)}).catch(m=>{box.textContent=m||'Sorry, the link couldn’t be made. Please try again.'})}
function quote(){
  const pr=P[st.p],z=size(),ex=[];
  if(orient())ex.push(orient()==='p'?'portrait':'landscape');
  if(pr.corners)ex.push(st.corners==='round'?'rounded corners':'square corners');
  if(pr.frame)ex.push(st.frame==='none'?'no frame':st.frame+' frame');
  const sz=pr.custom&&st.si===pr.sizes.length?st.cw+' × '+st.ch+' cm':z.l;
  const msg=`Hi SMR Graphics! I'd like a quote please.\n\nProduct: ${pr.n}\nSize: ${sz}${ex.length?'\nOptions: '+ex.join(', '):''}\nQuantity: ${st.qty}${shared.url?'\nMy mock-up: '+shared.url:''}\n\n${st.img?'I made a mock-up on your website and I’ll send my design over.':'I need a design too, please.'}`;
  const url='https://wa.me/'+WA+'?text='+encodeURIComponent(msg);window.open(url,'_blank','noopener')||(location.href=url)}

/* ---------- open / close ---------- */
let lastScroll=0;
function open(p){build();if(p&&P[p]&&st.p!==p){st.p=p;st.si=0;st.orient=null}lastScroll=scrollY;root.classList.add('on');document.documentElement.style.overflow='hidden';
  (document.fonts&&document.fonts.ready||Promise.resolve()).then(()=>{tex.ph=null;refresh()});refresh()}
function close(){root.classList.remove('on');document.documentElement.style.overflow=''}
document.addEventListener('click',e=>{const t=e.target.closest('[data-mockup]');if(!t)return;e.preventDefault();e.stopPropagation();open(t.dataset.mockup)},true);
window.SMRMockup={open,close};
})();
