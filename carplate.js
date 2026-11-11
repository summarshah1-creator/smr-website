/* SMR Plates: "See it on your car"
   Upload a photo of the front or back of a car. We find the plate, work out what kind it is
   (standard, short, oversized, hex, motorcycle/square), then put the customer's new plate on in
   perspective, matched to the photo's light. If the new plate is smaller than the old one, the old
   plate is painted out (or covered with a backing plate). Night view, before/after, close-up angle
   view and a side-by-side compare. Download, share a view-only link, or order on WhatsApp.
   Everything runs in the browser; a photo only leaves the device if the customer shares it.
   Needs PLATE (plate.js) and window.PB (the plate builder in index.html). */
(function(){
'use strict';
const WA=(window.CONTACT&&CONTACT.whatsapp)||'447931814538';
const PB=()=>window.PB;
const S={photo:null,pw:0,ph:0,quad:null,found:false,det:null,edit:false,hide:'auto',night:false,before:false,split:.5,cmp:null,busy:0,inpaintKey:'',inpaintCv:null,lastOut:null,shareUrl:''};
let root,stage,cv,ctx,hl,loupe,built=false;
const $=s=>root.querySelector(s);

/* ---------------- maths ---------------- */
function solve(A,b){const n=b.length;for(let i=0;i<n;i++){let m=i;for(let r=i+1;r<n;r++)if(Math.abs(A[r][i])>Math.abs(A[m][i]))m=r;[A[i],A[m]]=[A[m],A[i]];[b[i],b[m]]=[b[m],b[i]];
  for(let r=i+1;r<n;r++){const f=A[r][i]/A[i][i];for(let c=i;c<n;c++)A[r][c]-=f*A[i][c];b[r]-=f*b[i]}}
  const x=new Array(n);for(let i=n-1;i>=0;i--){let s=b[i];for(let c=i+1;c<n;c++)s-=A[i][c]*x[c];x[i]=s/A[i][i]}return x}
function homog(src,dst){const A=[],b=[];for(let i=0;i<4;i++){const [x,y]=src[i],[u,v]=dst[i];A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v)}
  const h=solve(A,b);return [h[0],h[1],h[2],h[3],h[4],h[5],h[6],h[7],1]}
function hp(H,x,y){const w=H[6]*x+H[7]*y+H[8];return [(H[0]*x+H[1]*y+H[2])/w,(H[3]*x+H[4]*y+H[5])/w]}
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function quadAspect(q){return ((dist(q[0],q[1])+dist(q[3],q[2]))/2)/((dist(q[0],q[3])+dist(q[1],q[2]))/2||1)}

/* draw an image region mapped by a homography (mesh of affine triangles) */
function warp(c,img,sw,sh,H,nx,ny){nx=nx||28;ny=ny||10;
  const P=[];for(let j=0;j<=ny;j++){P[j]=[];for(let i=0;i<=nx;i++)P[j][i]=hp(H,sw*i/nx,sh*j/ny)}
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const s0=[sw*i/nx,sh*j/ny],s1=[sw*(i+1)/nx,sh*j/ny],s2=[sw*i/nx,sh*(j+1)/ny],s3=[sw*(i+1)/nx,sh*(j+1)/ny];
    tri(c,img,s0,s1,s2,P[j][i],P[j][i+1],P[j+1][i]);tri(c,img,s1,s3,s2,P[j][i+1],P[j+1][i+1],P[j+1][i])}}
function tri(c,img,s0,s1,s2,d0,d1,d2){
  const cx=(d0[0]+d1[0]+d2[0])/3,cy=(d0[1]+d1[1]+d2[1])/3,e=p=>{const dx=p[0]-cx,dy=p[1]-cy,l=Math.hypot(dx,dy)||1;return [p[0]+dx/l*.7,p[1]+dy/l*.7]};
  const a=e(d0),b=e(d1),g=e(d2);c.save();c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(g[0],g[1]);c.closePath();c.clip();
  const den=(s1[0]-s0[0])*(s2[1]-s0[1])-(s2[0]-s0[0])*(s1[1]-s0[1]);
  const m11=((d1[0]-d0[0])*(s2[1]-s0[1])-(d2[0]-d0[0])*(s1[1]-s0[1]))/den,m12=((d2[0]-d0[0])*(s1[0]-s0[0])-(d1[0]-d0[0])*(s2[0]-s0[0]))/den;
  const m21=((d1[1]-d0[1])*(s2[1]-s0[1])-(d2[1]-d0[1])*(s1[1]-s0[1]))/den,m22=((d2[1]-d0[1])*(s1[0]-s0[0])-(d1[1]-d0[1])*(s2[0]-s0[0]))/den;
  c.transform(m11,m21,m12,m22,d0[0]-m11*s0[0]-m12*s0[1],d0[1]-m21*s0[0]-m22*s0[1]);c.drawImage(img,0,0);c.restore()}

/* ---------------- plate detection ---------------- */
function convexHull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
  for(const p of P){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
  for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}
  up.pop();lo.pop();return lo.concat(up)}
function simplify(H,eps){ // closed polygon Douglas-Peucker, then merge near-collinear corners
  if(H.length<4)return H;const n=H.length;let a=0,b=0,md=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const d=Math.hypot(H[i][0]-H[j][0],H[i][1]-H[j][1]);if(d>md){md=d;a=i;b=j}}
  const seg=(s,e)=>{const out=[],rec=(i,j)=>{let m=-1,di=0;const A=H[i%n],B=H[j%n],L=Math.hypot(B[0]-A[0],B[1]-A[1])||1;for(let k=i+1;k<j;k++){const P=H[k%n],d=Math.abs((B[0]-A[0])*(A[1]-P[1])-(A[0]-P[0])*(B[1]-A[1]))/L;if(d>di){di=d;m=k}}if(di>eps){rec(i,m);out.push(H[m%n]);rec(m,j)}};rec(s,e);return out};
  const r=[H[a],...seg(a,b),H[b],...seg(b,a+n)];
  // drop corners whose turn is tiny
  let changed=true,R=r;while(changed&&R.length>3){changed=false;for(let i=0;i<R.length;i++){const p=R[(i+R.length-1)%R.length],c=R[i],nx=R[(i+1)%R.length],a1=Math.atan2(c[1]-p[1],c[0]-p[0]),a2=Math.atan2(nx[1]-c[1],nx[0]-c[0]);let d=Math.abs(a2-a1);if(d>Math.PI)d=2*Math.PI-d;if(d<.22){R.splice(i,1);changed=true;break}}}
  return R}
function orderQuad(p){const c=[p.reduce((s,q)=>s+q[0],0)/4,p.reduce((s,q)=>s+q[1],0)/4];const s=p.slice().sort((a,b)=>Math.atan2(a[1]-c[1],a[0]-c[0])-Math.atan2(b[1]-c[1],b[0]-c[0]));
  // start at top-left (smallest x+y)
  let i0=0;s.forEach((q,i)=>{if(q[0]+q[1]<s[i0][0]+s[i0][1])i0=i});return [0,1,2,3].map(k=>s[(i0+k)%4])}
let PREP=null;
function prep(){if(PREP&&PREP.src===S.photo)return PREP;
  const k=Math.min(1,640/Math.max(S.pw,S.ph)),w=Math.round(S.pw*k),h=Math.round(S.ph*k);
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(S.photo,0,0,w,h);
  const d=x.getImageData(0,0,w,h).data,N=w*h,Hh=new Float32Array(N),Ss=new Float32Array(N),Vv=new Float32Array(N);
  for(let i=0;i<N;i++){const r=d[i*4]/255,g=d[i*4+1]/255,b=d[i*4+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),df=mx-mn;let hh=0;
    if(df>1e-6){hh=mx===r?((g-b)/df)%6:mx===g?(b-r)/df+2:(r-g)/df+4;hh*=60;if(hh<0)hh+=360}Hh[i]=hh;Ss[i]=mx?df/mx:0;Vv[i]=mx}
  return PREP={src:S.photo,k,w,h,N,d,Hh,Ss,Vv}}
/* flood a blob from seed s where ok(i) is true; returns its stats */
function grow(P,lab,id,s,ok,maxArea){const {w,h}=P,q=new Int32Array(P.N);let qh=0,qt=0;q[qt++]=s;lab[s]=id;let area=0,x0=w,x1=0,y0=h,y1=0;
  const ext=[[-1e9,0],[-1e9,0],[-1e9,0],[-1e9,0]];
  while(qh<qt){const p=q[qh++],px=p%w,py=(p/w)|0;area++;if(maxArea&&area>maxArea)return null;if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py;
    const sc=[-px-py,px-py,px+py,-px+py];for(let e=0;e<4;e++)if(sc[e]>ext[e][0])ext[e]=[sc[e],p];
    const nb=[px>0?p-1:-1,px<w-1?p+1:-1,py>0?p-w:-1,py<h-1?p+w:-1];for(const n of nb)if(n>=0&&lab[n]<0&&ok(n)){lab[n]=id;q[qt++]=n}}
  return {area,x0,x1,y0,y1,ext}}
/* the plate's four corners from its blob (handles hex plates' pointed ends) */
function blobQuad(P,lab,id,b){const {w,k}=P,{x0,x1,y0,y1,ext}=b,bw=x1-x0+1,bh=y1-y0+1;
  const pts=[];for(let yy=y0;yy<=y1;yy++){let a=-1,bb=-1;for(let xx=x0;xx<=x1;xx++)if(lab[yy*w+xx]===id){if(a<0)a=xx;bb=xx}if(a>=0){pts.push([a,yy],[bb+1,yy])}}
  const poly=simplify(convexHull(pts),Math.max(1.5,bh*.09));
  let q=ext.map(e=>[(e[1]%w+.5)/k,(((e[1]/w)|0)+.5)/k]),hex=false;
  const ext2=yy=>{let a=-1,bb=-1;for(let xx=x0;xx<=x1;xx++)if(lab[yy*w+xx]===id){if(a<0)a=xx;bb=xx}return [a,bb]};
  const rT=ext2(Math.round(y0+bh*.12)),rM=ext2(Math.round(y0+bh*.5)),rB=ext2(Math.round(y0+bh*.88)),wM=rM[1]-rM[0]||1;
  if(bw>40&&(rT[1]-rT[0])/wM<.955&&(rB[1]-rB[0])/wM<.955&&rT[0]>rM[0]&&rB[0]>rM[0]&&rT[1]<rM[1]&&rB[1]<rM[1]){hex=true;
    const tb=xx=>{let t=-1,bo=-1;for(let yy=y0;yy<=y1;yy++)if(lab[yy*w+xx]===id){if(t<0)t=yy;bo=yy}return [t,bo]};
    const xa=Math.round(x0+bw*.3),xb=Math.round(x0+bw*.7),A=tb(xa),B=tb(xb),line=(i,xx)=>A[i]+(B[i]-A[i])*(xx-xa)/(xb-xa||1);
    const L=rM[0]-bw*.012,R=rM[1]+1+bw*.012;q=[[L,line(0,L)],[R,line(0,R)],[R,line(1,R)+1],[L,line(1,L)+1]].map(([px,py])=>[px/k,py/k])}
  else if(poly.length===4)q=orderQuad(poly).map(([px,py])=>[px/k,py/k]);
  if(!(quadAspect(q)>1&&dist(q[0],q[1])>8)&&!hex)q=[[x0/k,y0/k],[(x1+1)/k,y0/k],[(x1+1)/k,(y1+1)/k],[x0/k,(y1+1)/k]];
  return {q,hex}}
function detect(){
  const P=prep(),{w,h,N,Hh,Ss,Vv}=P,best=[];
  const masks={rear:i=>Hh[i]>=36&&Hh[i]<=64&&Ss[i]>.38&&Vv[i]>.42, front:i=>Ss[i]<.17&&Vv[i]>.66};
  for(const side of ['rear','front']){const f=masks[side],lab=new Int32Array(N).fill(-1);let id=0;
    for(let s=0;s<N;s++){if(lab[s]>=0||!f(s))continue;const b=grow(P,lab,id,s,f);
      const bw=b.x1-b.x0+1,bh=b.y1-b.y0+1,asp=bw/bh,fill=b.area/(bw*bh);
      if(b.area>N*.0012&&bw<w*.92&&bh<h*.6&&asp>1.15&&asp<7&&fill>.38){
        let dark=0,tot=0;for(let yy=b.y0;yy<=b.y1;yy++)for(let xx=b.x0;xx<=b.x1;xx++){tot++;if(Vv[yy*w+xx]<.36)dark++}
        const dr=dark/tot;if(dr>=.025&&dr<=.5){
          const cxn=(b.x0+b.x1)/2/w,cyn=(b.y0+b.y1)/2/h,pos=1-Math.min(1,Math.abs(cxn-.5)*1.4)*.6-(cyn<.25?.5:0),shapeScore=1-Math.min(1,Math.abs(Math.log(asp/4.2))*.35);
          const score=Math.sqrt(b.area)*fill*pos*shapeScore*(side==='rear'?1.25:1)*(dr>.06&&dr<.35?1.2:.8);
          const r=blobQuad(P,lab,id,b);best.push({side,score,hex:r.hex,q:r.q})}}
      id++}}
  best.sort((a,b)=>b.score-a.score);
  return best.length?{side:best[0].side,quad:best[0].q,hex:best[0].hex}:null;
}
/* the customer tapped the plate: grow the plate from that spot */
function detectAt(ix,iy){
  const P=prep(),{w,h,N,d,Hh,Ss,Vv,k}=P,cx=Math.round(ix*k),cy=Math.round(iy*k);
  // the plate colour = the brighter half of the pixels around the tap (they may have tapped a letter)
  const rad=Math.max(6,Math.round(w*.025)),cand=[];
  for(let dy=-rad;dy<=rad;dy++)for(let dx=-rad;dx<=rad;dx++){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=w||y>=h)continue;const i=y*w+x;if(Vv[i]>.3)cand.push(i)}
  if(cand.length<6)return null;cand.sort((a,b)=>Vv[b]-Vv[a]);const top=cand.slice(0,Math.max(4,cand.length>>1));
  const med=c=>{const v=top.map(i=>d[i*4+c]).sort((a,b)=>a-b);return v[v.length>>1]};let R=med(0),G=med(1),B=med(2);
  let s=-1,sb=1e9;for(const i of top){const o=i*4,e=(d[o]-R)**2+(d[o+1]-G)**2+(d[o+2]-B)**2+((i%w-cx)**2+(((i/w)|0)-cy)**2)*4;if(e<sb){sb=e;s=i}}
  const yellow=Hh[s]>30&&Hh[s]<70&&Ss[s]>.3;
  // try a few seeds: one may sit inside a letter's hole (an island too small to be the plate)
  const seeds=[s];for(let t=0;t<top.length&&seeds.length<8;t+=Math.max(1,(top.length/8)|0))seeds.push(top[t]);
  for(const tol of [78,60,44,32]){let lab=null,b=null;
    const ok=i=>{const o=i*4,dr=d[o]-R,dg=d[o+1]-G,db=d[o+2]-B;return dr*dr+dg*dg+db*db<tol*tol};
    for(const sd of seeds){if(lab&&lab[sd]>=0)continue;if(!ok(sd))continue;lab=new Int32Array(N).fill(-1);b=grow(P,lab,0,sd,ok,N*.3);if(!b||b.area>=N*.0008)break}
    if(!b)continue;
    const bw=b.x1-b.x0+1,bh=b.y1-b.y0+1,asp=bw/bh;
    if(bw>=w*.95||bh>=h*.7||b.area<30)continue;
    if(asp<1.1||asp>8)continue;
    const r=blobQuad(P,lab,0,b);return {side:yellow?'rear':'front',quad:r.q,hex:r.hex}}
  return null}

/* rectify the found plate and work out what kind it is */
function classify(){
  const q=S.quad,RW=420,RH=140,H=homog([[0,0],[RW,0],[RW,RH],[0,RH]],q);
  const src=document.createElement('canvas');src.width=S.pw;src.height=S.ph;const sx=src.getContext('2d',{willReadFrequently:true});sx.drawImage(S.photo,0,0);
  const bb=bbox(q,4),img=sx.getImageData(bb[0],bb[1],bb[2]-bb[0],bb[3]-bb[1]),dd=img.data,iw=bb[2]-bb[0];
  const at=(u,v)=>{const [x,y]=hp(H,u,v),ix=Math.min(iw-1,Math.max(0,Math.round(x-bb[0]))),iy=Math.min(bb[3]-bb[1]-1,Math.max(0,Math.round(y-bb[1]))),o=(iy*iw+ix)*4;return [dd[o],dd[o+1],dd[o+2]]};
  // plate background colour = bright pixels median-ish
  const rows=new Float32Array(RH),samp=[];for(let v=2;v<RH-2;v+=3)for(let u=8;u<RW-8;u+=4){const p=at(u,v);samp.push([(p[0]+p[1]+p[2])/3,p])}
  samp.sort((x,y)=>x[0]-y[0]);const hi=samp.slice(Math.floor(samp.length*.6)),bgL=hi.reduce((s,x)=>s+x[0],0)/(hi.length||1);
  const bg=[0,1,2].map(k=>hi.reduce((s,x)=>s+x[1][k],0)/(hi.length||1)),darkT=bgL*.5;
  for(let v=0;v<RH;v++)for(let u=6;u<RW-6;u+=2){const p=at(u,v),l=(p[0]+p[1]+p[2])/3;if(l<darkT)rows[v]++}
  const thr=(RW/2)*.05;let bands=[],inB=false,s0=0;for(let v=0;v<RH;v++){const on=rows[v]>thr;if(on&&!inB){inB=true;s0=v}if(!on&&inB){inB=false;if(v-s0>RH*.08)bands.push([s0,v])}}if(inB&&RH-s0>RH*.08)bands.push([s0,RH]);
  const textH=bands.length?(bands[bands.length-1][1]-bands[0][0])/RH:.7;
  // hex: are the corner patches a different colour from the plate?
  let cut=0;[[3,8],[RW-4,8],[3,RH-9],[RW-4,RH-9]].forEach(([u,v])=>{const p=at(u,v),dl=Math.hypot(p[0]-bg[0],p[1]-bg[1],p[2]-bg[2]);if(dl>70)cut++});
  const a=quadAspect(q);let shape='standard';
  if(bands.length>=2&&a<2.4)shape='moto';
  else if(S.hexHint)shape='hex';
  else if(textH<.62&&a<4.3)shape='oversize';
  else if(a<4.15)shape='short';
  // light level of the plate in the photo vs a clean plate
  const ref=S.side==='rear'?[255,212,0]:[245,245,245],lum=v=>.3*v[0]+.59*v[1]+.11*v[2];
  const light=Math.max(.45,Math.min(1.12,lum(bg)/lum(ref)*1.04));
  return {shape,aspect:a,textH,light,bg};
}
function bbox(q,m){const xs=q.map(p=>p[0]),ys=q.map(p=>p[1]);return [Math.max(0,Math.floor(Math.min(...xs)-m)),Math.max(0,Math.floor(Math.min(...ys)-m)),Math.min(S.pw,Math.ceil(Math.max(...xs)+m)),Math.min(S.ph,Math.ceil(Math.max(...ys)+m))]}

/* physical size (mm) of the plate that is on the car now */
function oldSize(){const d=S.det||{shape:'standard',aspect:4.68};const a=d.aspect;
  if(d.shape==='oversize')return [520,Math.max(120,Math.min(210,520/a))];
  if(d.shape==='short')return [Math.max(200,Math.min(500,111*a)),111];
  if(d.shape==='moto')return [Math.max(200,Math.min(330,178*a)),178];
  return [520,111]}

/* ---------------- painting out the old plate ---------------- */
function inpaint(base,q){
  const key=q.flat().map(v=>v.toFixed(1)).join(',');if(S.inpaintKey===key&&S.inpaintCv)return S.inpaintCv;
  const H0=homog([[0,0],[1,0],[1,1],[0,1]],q),grow=(u,v)=>hp(H0,u,v);
  const qq=[grow(-.035,-.13),grow(1.035,-.13),grow(1.035,1.13),grow(-.035,1.13)];
  const bb=bbox(qq,Math.max(12,dist(q[0],q[3])*.9)),bw=bb[2]-bb[0],bh=bb[3]-bb[1];
  const c=document.createElement('canvas');c.width=S.pw;c.height=S.ph;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(base,0,0);
  const id=x.getImageData(bb[0],bb[1],bw,bh),D=id.data;
  const mk=document.createElement('canvas');mk.width=bw;mk.height=bh;const mx=mk.getContext('2d');mx.fillStyle='#fff';mx.beginPath();qq.forEach((p,i)=>i?mx.lineTo(p[0]-bb[0],p[1]-bb[1]):mx.moveTo(p[0]-bb[0],p[1]-bb[1]));mx.closePath();mx.fill();
  const M=mx.getImageData(0,0,bw,bh).data;
  // pull-push fill
  let lv=[{w:bw,h:bh,c:new Float32Array(bw*bh*3),a:new Float32Array(bw*bh)}];
  for(let i=0;i<bw*bh;i++){const known=M[i*4]<128?1:0;lv[0].a[i]=known;for(let k=0;k<3;k++)lv[0].c[i*3+k]=D[i*4+k]*known}
  while(lv[lv.length-1].w>2||lv[lv.length-1].h>2){const p=lv[lv.length-1],w=Math.max(1,Math.ceil(p.w/2)),h=Math.max(1,Math.ceil(p.h/2)),n={w,h,c:new Float32Array(w*h*3),a:new Float32Array(w*h)};
    for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){let s=0,r=0,g=0,b=0;for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const X=Math.min(p.w-1,xx*2+dx),Y=Math.min(p.h-1,y*2+dy),j=Y*p.w+X,aw=p.a[j];s+=aw;r+=p.c[j*3];g+=p.c[j*3+1];b+=p.c[j*3+2]}
      const o=y*w+xx;n.a[o]=Math.min(1,s);if(s>0){n.c[o*3]=r/s*n.a[o];n.c[o*3+1]=g/s*n.a[o];n.c[o*3+2]=b/s*n.a[o]}}lv.push(n);if(lv.length>14)break}
  for(let L=lv.length-2;L>=0;L--){const p=lv[L],u=lv[L+1];for(let y=0;y<p.h;y++)for(let xx=0;xx<p.w;xx++){const o=y*p.w+xx,a=p.a[o];if(a>=1)continue;
      const fx=Math.min(u.w-1,(xx+.5)/2-.5),fy=Math.min(u.h-1,(y+.5)/2-.5),x0=Math.max(0,Math.floor(fx)),y0=Math.max(0,Math.floor(fy)),x1=Math.min(u.w-1,x0+1),y1=Math.min(u.h-1,y0+1),tx=Math.max(0,fx-x0),ty=Math.max(0,fy-y0);
      for(let k=0;k<3;k++){const v00=u.c[(y0*u.w+x0)*3+k]/(u.a[y0*u.w+x0]||1),v10=u.c[(y0*u.w+x1)*3+k]/(u.a[y0*u.w+x1]||1),v01=u.c[(y1*u.w+x0)*3+k]/(u.a[y1*u.w+x0]||1),v11=u.c[(y1*u.w+x1)*3+k]/(u.a[y1*u.w+x1]||1);
        const up=(v00*(1-tx)+v10*tx)*(1-ty)+(v01*(1-tx)+v11*tx)*ty;p.c[o*3+k]=p.c[o*3+k]+up*(1-a)}p.a[o]=1}}
  // texture: borrow grain from the rows just above and below the plate
  let seed=7;const rnd=()=>((seed=Math.imul(seed^seed>>>15,1|seed)+0x6D2B79F5|0,((seed^seed>>>14)>>>0)/4294967296));
  let nv=0,nn=0;for(let i=0;i<bw*bh;i++)if(M[i*4]<128&&i%7===0){const j=i+bw<bw*bh?i+bw:i;nv+=Math.abs(D[i*4]-D[j*4]);nn++}const amp=Math.min(14,(nv/(nn||1))*.8);
  for(let i=0;i<bw*bh;i++){const m=M[i*4]/255;if(m<=0)continue;const n=(rnd()-.5)*amp;for(let k=0;k<3;k++)D[i*4+k]=D[i*4+k]*(1-m)+(lv[0].c[i*3+k]+n)*m}
  x.putImageData(id,bb[0],bb[1]);
  S.inpaintKey=key;S.inpaintCv=c;return c}

function bodyColour(q){const c=document.createElement('canvas');c.width=S.pw;c.height=S.ph;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(S.photo,0,0);
  const H0=homog([[0,0],[1,0],[1,1],[0,1]],q);let r=0,g=0,b=0,n=0;
  for(let i=0;i<=20;i++)for(const v of [-.35,1.35]){const [px,py]=hp(H0,i/20,v);if(px<0||py<0||px>=S.pw||py>=S.ph)continue;const d=x.getImageData(px|0,py|0,1,1).data;r+=d[0];g+=d[1];b+=d[2];n++}
  return n?`rgb(${r/n|0},${g/n|0},${b/n|0})`:'#222'}

/* ---------------- plate artwork ---------------- */
let plateCache={key:'',img:null,W:0,H:0,vb:null};
function plateOpts(over){const P=PB().P;return Object.assign({text:(PB().regIn.value||'SMR 1'),letters:P.letters,shape:P.shape,side:S.side||P.side,tint:P.tint,border:P.border},over||{})}
function plateImg(o){const key=JSON.stringify(o);if(plateCache.key===key)return Promise.resolve(plateCache);
  let s=PLATE.render(o);const defs=(PLATE.DEFS.match(/<defs>[\s\S]*<\/defs>/)||[''])[0];
  s=s.replace(/<svg([^>]*)>/,(m,a)=>'<svg'+(a.includes('xmlns')?a:a+' xmlns="http://www.w3.org/2000/svg"')+'>'+defs);
  const vb=s.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number),sc=3;s=s.replace(/<svg/,`<svg width="${vb[2]*sc}" height="${vb[3]*sc}"`);
  const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
  return im.decode().then(()=>{plateCache={key,img:im,vb,sc,W:vb[2]+2*vb[0],H:vb[3]+2*vb[1]};return plateCache})}

/* ---------------- compose ---------------- */
function need(o){const [ow,oh]=oldSize(),pc=plateCache,W=pc.vb[2]+pc.vb[0]*2,Hh=pc.vb[3]+pc.vb[1]*2;
  return W<ow-6||Hh<oh-6||o.shape==='hex'||o.shape==='moto'||S.det&&S.det.shape==='hex'&&o.shape!=='hex'?true:false}
function compose(o,night,opts){opts=opts||{};
  const out=document.createElement('canvas');out.width=S.pw;out.height=S.ph;const c=out.getContext('2d');
  if(!S.quad){c.drawImage(S.photo,0,0);return out}
  const pc=plateCache,[ow,oh]=oldSize(),Wn=pc.vb[2]+pc.vb[0]*2,Hn=pc.vb[3]+pc.vb[1]*2;
  const Hm=homog([[0,0],[ow,0],[ow,oh],[0,oh]],S.quad);
  // 1) base photo, with the old plate hidden if the new one won't cover it
  let base=S.photo;const mode=S.hide==='auto'?(need(o)?'fill':'none'):S.hide;
  if(mode==='fill')base=inpaint(S.photo,S.quad);
  c.drawImage(base,0,0);
  if(mode==='black'||mode==='body'){const g=8,q=[hp(Hm,-g,-g),hp(Hm,ow+g,-g),hp(Hm,ow+g,oh+g),hp(Hm,-g,oh+g)];
    c.save();c.beginPath();q.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=mode==='black'?'#121214':bodyColour(S.quad);c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=dist(S.quad[0],S.quad[3])*.08;c.fill();
    const gr=c.createLinearGradient(q[0][0],q[0][1],q[3][0],q[3][1]);gr.addColorStop(0,'rgba(255,255,255,.10)');gr.addColorStop(1,'rgba(0,0,0,.18)');c.fillStyle=gr;c.fill();c.restore()}
  // 2) the new plate on its own layer, then lit to match the photo
  const lay=document.createElement('canvas');lay.width=S.pw;lay.height=S.ph;const l=lay.getContext('2d');
  const offX=(ow-Wn)/2,offY=(oh-Hn)/2,sc=pc.sc;
  // map plate artwork pixels -> old-plate mm frame -> photo
  const Hp=homog([[0,0],[pc.img.width,0],[pc.img.width,pc.img.height],[0,pc.img.height]],[0,0,0,0].map((_,i)=>{const mmx=offX+pc.vb[0]+(i===1||i===2?pc.vb[2]:0),mmy=offY+pc.vb[1]+(i>=2?pc.vb[3]:0);return hp(Hm,mmx,mmy)}));
  warp(l,pc.img,pc.img.width,pc.img.height,Hp,Math.max(12,Math.min(40,Math.round(dist(S.quad[0],S.quad[1])/14))),Math.max(4,Math.min(14,Math.round(dist(S.quad[0],S.quad[3])/10))));
  // keep only the plate itself (drops the preview's baked-in shadow, which would double up along mesh seams)
  {const bq=[hp(Hm,offX,offY),hp(Hm,offX+Wn,offY),hp(Hm,offX+Wn,offY+Hn),hp(Hm,offX,offY+Hn)];l.globalCompositeOperation='destination-in';l.beginPath();bq.forEach((p,i)=>i?l.lineTo(p[0],p[1]):l.moveTo(p[0],p[1]));l.closePath();l.fillStyle='#000';l.fill();l.globalCompositeOperation='source-over'}
  const det=S.det||{light:1};let lightK=det.light;
  if(night)lightK=S.side==='rear'?.82:.38;
  // match the photo's colour tone (white balance) and brightness, per channel
  const ref=S.side==='rear'?[255,212,0]:[245,245,245],bgc=det.bg||ref;
  let tone=[0,1].map(k=>bgc[k]/ref[k]);tone.push(S.side==='rear'?(tone[0]+tone[1])/2*(bgc[2]>40?Math.min(1.2,.8+bgc[2]/255):1):bgc[2]/ref[2]);
  const tl=(tone[0]+tone[1]+tone[2])/3||1;tone=tone.map(t=>Math.max(.35,Math.min(1.25,(lightK/tl)*(tl+(t-tl)*.7))));
  if(night)tone=S.side==='rear'?[.86,.82,.74]:[.36,.38,.46];
  const msk=document.createElement('canvas');msk.width=S.pw;msk.height=S.ph;msk.getContext('2d').drawImage(lay,0,0);
  l.globalCompositeOperation='multiply';l.fillStyle=`rgb(${tone.map(t=>Math.round(Math.min(1,t)*255)).join(',')})`;l.fillRect(0,0,S.pw,S.ph);
  l.globalCompositeOperation='source-atop';
  const over=tone.map(t=>Math.max(0,t-1));if(over.some(v=>v>0)){l.fillStyle=`rgba(${over.map(v=>Math.round(v*4*255)).join(',')},.25)`;l.globalCompositeOperation='screen';l.fillRect(0,0,S.pw,S.ph);l.globalCompositeOperation='source-atop'}
  // film grain to match the photo
  if(!S.grain){const g=document.createElement('canvas');g.width=g.height=128;const gx=g.getContext('2d'),id=gx.createImageData(128,128);let sd=3;for(let i=0;i<id.data.length;i+=4){sd=Math.imul(sd^sd>>>15,1|sd)+0x6D2B79F5|0;const v=((sd>>>0)%255);id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}gx.putImageData(id,0,0);S.grain=g}
  l.globalAlpha=Math.min(.09,.03+(S.noise||0)*.006);l.globalCompositeOperation='overlay';l.fillStyle=l.createPattern(S.grain,'repeat');l.fillRect(0,0,S.pw,S.ph);l.globalAlpha=1;
  l.globalCompositeOperation='destination-in';l.drawImage(msk,0,0);// keep only the plate (blend modes paint the empty area too)
  l.globalCompositeOperation='source-atop';
  // subtle top-light gradient across the plate
  const t0=hp(Hm,ow/2,-10),t1=hp(Hm,ow/2,oh+10),gg=l.createLinearGradient(t0[0],t0[1],t1[0],t1[1]);
  if(night&&S.side==='rear'){gg.addColorStop(0,'rgba(255,244,214,.30)');gg.addColorStop(.55,'rgba(255,244,214,0)');gg.addColorStop(1,'rgba(0,0,0,.18)')}
  else{gg.addColorStop(0,'rgba(255,255,255,.10)');gg.addColorStop(1,'rgba(0,0,0,.10)')}
  l.fillStyle=gg;l.fillRect(0,0,S.pw,S.ph);l.globalCompositeOperation='source-over';
  // tiny soft shadow under the plate so it sits on the car
  c.save();c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=dist(S.quad[0],S.quad[3])*.06;c.shadowOffsetY=dist(S.quad[0],S.quad[3])*.025;c.drawImage(lay,0,0);c.restore();
  // 3) night: darken the scene, keep the plate lit by its lamps
  if(night){
    const nc=document.createElement('canvas');nc.width=S.pw;nc.height=S.ph;const n=nc.getContext('2d');
    n.filter='brightness(.34) saturate(.75) contrast(1.05)';n.drawImage(out,0,0);n.filter='none';
    n.fillStyle='rgba(18,28,70,.28)';n.globalCompositeOperation='source-over';n.fillRect(0,0,S.pw,S.ph);
    if(S.side==='rear'){
      n.drawImage(lay,0,0);
      const pq=[hp(Hm,offX,offY),hp(Hm,offX+Wn,offY),hp(Hm,offX+Wn,offY+Hn),hp(Hm,offX,offY+Hn)],cx=(pq[0][0]+pq[2][0])/2,cy=(pq[0][1]+pq[2][1])/2,r=dist(pq[0],pq[1])*.75;
      const gl=n.createRadialGradient(cx,cy-dist(pq[0],pq[3])*.6,1,cx,cy,r);gl.addColorStop(0,'rgba(255,240,205,.22)');gl.addColorStop(1,'rgba(255,240,205,0)');n.globalCompositeOperation='screen';n.fillStyle=gl;n.fillRect(cx-r,cy-r*1.2,r*2,r*2.2);n.globalCompositeOperation='source-over';
      // plate lamps
      [.3,.7].forEach(f=>{const p=hp(Hm,offX+Wn*f,offY-6),lg=n.createRadialGradient(p[0],p[1],0,p[0],p[1],dist(pq[0],pq[3])*.5);lg.addColorStop(0,'rgba(255,250,235,.9)');lg.addColorStop(.25,'rgba(255,245,220,.25)');lg.addColorStop(1,'rgba(255,245,220,0)');n.globalCompositeOperation='screen';n.fillStyle=lg;n.fillRect(p[0]-200,p[1]-200,400,400)});
      n.globalCompositeOperation='source-over';
    }else{n.globalAlpha=.55;n.drawImage(lay,0,0);n.globalAlpha=1}
    c.clearRect(0,0,S.pw,S.ph);c.drawImage(nc,0,0);
  }
  if(!opts.noLabel)labels(c,o);
  return out}

function labels(c,o){const show=PB().isShow(o),W=S.pw,H=S.ph,fs=Math.max(14,Math.round(Math.min(W,H)*.026)),pad=fs*.8;
  c.save();c.font=`800 ${fs}px Manrope,system-ui,sans-serif`;c.textBaseline='middle';
  const t=show?'SHOW PLATE · Not for road use':'ROAD LEGAL style · BS AU 145e',tw=c.measureText(t).width,ph=fs*2.1,pw=tw+pad*2+fs*1.1,x=fs,y=H-ph-fs;
  c.fillStyle=show?'rgba(255,170,30,.95)':'rgba(40,190,100,.95)';rrect(c,x,y,pw,ph,ph/2);c.fill();
  c.fillStyle=show?'#2a1600':'#04240f';c.beginPath();c.arc(x+pad+fs*.35,y+ph/2,fs*.32,0,7);c.fill();c.fillText(t,x+pad+fs*.95,y+ph/2+1);
  const w2='SMR Plates · smrgraphics.co.uk/plates',fs2=Math.round(fs*.78);c.font=`700 ${fs2}px Manrope,system-ui,sans-serif`;const tw2=c.measureText(w2).width,ph2=fs2*1.9;
  c.fillStyle='rgba(10,10,18,.6)';rrect(c,W-tw2-fs2*1.6-fs,H-ph2-fs-(ph-ph2)/2,tw2+fs2*1.6,ph2,ph2/2);c.fill();c.fillStyle='#fff';c.fillText(w2,W-tw2-fs2*.8-fs,H-fs-ph/2+1);c.restore()}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}

/* ---------------- render to screen ---------------- */
let rq=0;
function render(){if(!S.photo)return;const my=++rq;
  if(S.edit||S.crop||!S.quad){paintEdit();return}
  const o=plateOpts();plateImg(o).then(()=>{if(my!==rq)return;const out=compose(o,S.night);S.lastOut=out;S.lastKey=JSON.stringify([o,S.night,S.hide,S.quad,PB().isShow(o)]);
    cv.width=S.pw;cv.height=S.ph;ctx.drawImage(out,0,0);
    if(S.before){const x=S.pw*S.split;ctx.save();ctx.beginPath();ctx.rect(0,0,x,S.ph);ctx.clip();ctx.drawImage(S.photo,0,0);ctx.restore();
      ctx.fillStyle='#fff';ctx.fillRect(x-2,0,4,S.ph);const r=Math.max(16,S.ph*.035);ctx.beginPath();ctx.arc(x,S.ph/2,r,0,7);ctx.fill();ctx.fillStyle='#111';ctx.font=`800 ${r*.9}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('⇆',x,S.ph/2+1);
      ctx.font=`800 ${r*.8}px Manrope,system-ui`;ctx.fillStyle='rgba(0,0,0,.6)';[['BEFORE',x/2],['AFTER',x+(S.pw-x)/2]].forEach(([t,xx])=>{ctx.fillStyle='rgba(0,0,0,.55)';const w=ctx.measureText(t).width+r*1.4;rrect(ctx,xx-w/2,r*.6,w,r*1.5,r*.75);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(t,xx,r*1.35)})}
    if(S.cmp)renderCompare();
    if($('#cpZoom').classList.contains('on'))renderZoom();
    updInfo()})}
function paintEdit(){cv.width=S.pw;cv.height=S.ph;ctx.drawImage(S.photo,0,0);placeHandles()}
function placeHandles(){
  hl.innerHTML='';if(!S.photo)return;const r=cv.getBoundingClientRect(),sr=stage.getBoundingClientRect(),k=r.width/S.pw,ox=r.left-sr.left,oy=r.top-sr.top;
  if(S.crop){const c=S.crop,L=ox+c[0]*k,T=oy+c[1]*k,W=(c[2]-c[0])*k,H=(c[3]-c[1])*k;
    hl.innerHTML=`<div class="cp-crop" data-cm="1" style="left:${L}px;top:${T}px;width:${W}px;height:${H}px"><i></i><i></i></div>`+[[L,T],[L+W,T],[L+W,T+H],[L,T+H]].map((p,i)=>`<b class="cp-k" data-c="${i}" style="left:${p[0]}px;top:${p[1]}px"></b>`).join('');return}
  if(S.edit&&S.tapAt){const p=S.tapAt;hl.innerHTML=`<b class="cp-ping" style="left:${ox+p[0]*k}px;top:${oy+p[1]*k}px"></b>`}}
/* tap on the plate: find it from that spot */
function tapFind(p){S.tapAt=p;placeHandles();let d=null;
  const hit=(S.ai||[]).find(b=>{const [x0,y0,x1,y1]=b.box,mw=(x1-x0)*.1,mh=(y1-y0)*.3;return p[0]>x0-mw&&p[0]<x1+mw&&p[1]>y0-mh&&p[1]<y1+mh});
  if(hit){try{d=aiRefine(hit)}catch(e){}}
  if(!d)try{d=detectAt(p[0],p[1])}catch(e){}
  if(!d){tip('Couldn’t find a plate there. Tap the middle of the plate, or tap Crop to zoom in closer.');return}
  tip('');S.tapAt=null;S.quad=d.quad;S.side=d.side;S.hexHint=!!d.hex;S.found=true;S.edit=false;S.inpaintKey='';
  if(PB().P.shape==='moto'&&S.side==='front')PB().choose('shape','standard');PB().P.side=S.side;PB().drawPlate();S.det=classify();hl.innerHTML='';render();updInfo()}
function startCrop(){const m=Math.min(S.pw,S.ph)*.12;S.crop=[m,m,S.pw-m,S.ph-m];S.wasEdit=S.edit;render();updInfo();requestAnimationFrame(placeHandles)}
function applyCrop(){const c=S.crop.map(Math.round),w=c[2]-c[0],h=c[3]-c[1];S.crop=null;
  if(w>40&&h>40){const n=document.createElement('canvas');n.width=w;n.height=h;n.getContext('2d').drawImage(S.photo,c[0],c[1],w,h,0,0,w,h);setPhoto(n);findPlate()}else{render();updInfo()}}

/* ---------------- UI ---------------- */
const CSS=`
.cp{position:fixed;inset:0;z-index:9999;background:#0b0b12;color:#f2f2f7;display:none;flex-direction:column;font-family:Manrope,system-ui,sans-serif}
.cp.on{display:flex}.cp *{box-sizing:border-box}
.cp-top{flex:none;display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
.cp-top b{font:700 17px/1.1 Sora,system-ui,sans-serif}.cp-top small{display:block;font-size:11.5px;font-weight:700;color:#9a9ab0}
.cp-top .g{background:linear-gradient(110deg,#ffd23f,#ff7a2f);-webkit-background-clip:text;background-clip:text;color:transparent;padding-bottom:2px}
.cp-x{margin-left:auto;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#fff;font-size:22px;cursor:pointer}
.cp-body{flex:1;min-height:0;display:flex;flex-direction:column}
.cp-stage{flex:none;position:relative;background:#14141e;display:flex;align-items:center;justify-content:center;padding:10px;min-height:200px;touch-action:none;user-select:none;-webkit-user-select:none}
.cp-stage canvas{display:block;max-width:100%;max-height:44vh;border-radius:12px;box-shadow:0 18px 40px -18px rgba(0,0,0,.8)}
.cp-empty[hidden],.cp-stage canvas[hidden]{display:none!important}
.cp-empty{display:flex;flex-direction:column;align-items:center;gap:12px;padding:26px 16px;text-align:center}
.cp-empty .pic{width:220px;max-width:70%;aspect-ratio:16/9;border-radius:14px;background:linear-gradient(160deg,#20202e,#15151f);display:grid;place-items:center;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.08)}
.cp-empty .pic i{width:46%;height:13%;background:#ffd400;border-radius:3px;box-shadow:0 0 0 2px #111,0 8px 18px rgba(0,0,0,.5)}
.cp-empty p{margin:0;color:#a8a8c0;font-size:13.5px;max-width:300px;line-height:1.45}
.cp-hl{position:absolute;inset:0;pointer-events:none}
.cp-poly{position:absolute;left:0;top:0;pointer-events:none}.cp-poly polygon{fill:rgba(255,210,63,.12);stroke:#ffd23f;stroke-width:2;stroke-dasharray:6 4}
.cp-crop{position:absolute;border:2px solid #fff;box-shadow:0 0 0 9999px rgba(0,0,0,.55);pointer-events:auto;touch-action:none;cursor:move}
.cp-crop i{position:absolute;inset:33.3% 0;border-top:1px solid rgba(255,255,255,.35);border-bottom:1px solid rgba(255,255,255,.35)}.cp-crop i+i{inset:0 33.3%;border:0;border-left:1px solid rgba(255,255,255,.35);border-right:1px solid rgba(255,255,255,.35)}
.cp-hl{overflow:hidden}
.cp-k{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.5);pointer-events:auto;touch-action:none;cursor:nwse-resize}
.cp-ping{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid #ffd23f;animation:cpPing .9s ease-out infinite}
@keyframes cpPing{from{transform:scale(.4);opacity:1}to{transform:scale(1.4);opacity:0}}
.cp-tapme{cursor:crosshair}
.cp-h{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:rgba(255,210,63,.25);border:2.5px solid #ffd23f;box-shadow:0 0 0 2px rgba(0,0,0,.45);pointer-events:auto;touch-action:none;cursor:grab}
.cp-h::after{content:"";position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px;border-radius:50%;background:#fff}
.cp-loupe{position:absolute;width:118px;height:118px;border-radius:50%;border:3px solid #ffd23f;box-shadow:0 10px 30px rgba(0,0,0,.6);display:none;pointer-events:none;overflow:hidden;background:#000}
.cp-loupe.on{display:block}.cp-loupe canvas{width:100%;height:100%}
.cp-loupe::after{content:"";position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px;border:1.5px solid #fff;border-radius:50%;box-shadow:0 0 0 1px #000}
.cp-msg{position:absolute;left:50%;top:16px;transform:translateX(-50%);max-width:calc(100% - 32px);padding:8px 13px;border-radius:999px;background:rgba(10,10,18,.8);font-size:12.5px;font-weight:800;backdrop-filter:blur(8px);text-align:center;pointer-events:none}
.cp-msg:empty{display:none}
.cp-panel{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 14px 30px}
.cp-st{margin-bottom:18px}.cp-st>h4{margin:0 0 9px;font:700 13px/1 Sora,system-ui,sans-serif;color:#c9c9dc;display:flex;align-items:center;gap:8px}
.cp-st>h4 i{font-style:normal;width:21px;height:21px;border-radius:50%;display:grid;place-items:center;font-size:11px;background:linear-gradient(110deg,#ffd23f,#ff7a2f);color:#1a0f00}
.cp-row{display:flex;gap:8px;flex-wrap:wrap}
.cp-b{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px 14px;border-radius:14px;border:1.5px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#fff;font:700 14px Sora,system-ui,sans-serif;cursor:pointer;flex:1;text-decoration:none}
.cp-b svg{width:18px;height:18px}
.cp-b.pri{background:linear-gradient(110deg,#ffd23f,#ff7a2f);color:#1a0f00;border:0}
.cp-b.wa{background:#25d366;color:#06351a;border:0}
.cp-c{padding:9px 12px;border-radius:999px;border:1.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);color:#e8e8f2;font:700 12.5px Manrope,system-ui,sans-serif;cursor:pointer;white-space:nowrap}
.cp-c.on{background:#fff;color:#111;border-color:#fff}.cp-c:disabled{opacity:.35;cursor:not-allowed}
.cp-opt{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}.cp-opt>span{flex:none;width:72px;padding-top:9px;font-size:12px;font-weight:700;color:#a8a8c0}.cp-opt .cp-row{flex:1}
.cp-reg{width:100%;padding:12px 14px;border-radius:12px;border:0;background:#ffd400;color:#111;font:800 26px/1 "Arial Narrow",Arial,sans-serif;letter-spacing:.08em;text-align:center;text-transform:uppercase;margin-bottom:12px}
.cp-reg.front{background:#fff}
.cp-card{display:flex;gap:12px;align-items:flex-start;padding:12px 13px;border-radius:14px;background:rgba(255,190,40,.1);border:1px solid rgba(255,190,40,.35);margin-bottom:14px;font-size:13px;line-height:1.45}
.cp-card b{color:#fff}.cp-card .cp-row{margin-top:9px}.cp-card .cp-c{padding:8px 12px}
.cp-card.ok{background:rgba(52,199,89,.1);border-color:rgba(52,199,89,.35)}
.cp-use{display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:14px;margin:6px 0 12px;font-size:13px;font-weight:700;line-height:1.35}
.cp-use.show{background:rgba(255,170,30,.14);color:#ffc56b;border:1px solid rgba(255,170,30,.4)}.cp-use.road{background:rgba(52,199,89,.12);color:#6be38c;border:1px solid rgba(52,199,89,.35)}
.cp-use i{flex:none;width:10px;height:10px;border-radius:50%;background:currentColor}
.cp-note{font-size:12px;color:#8d8da5;line-height:1.45;margin-top:6px}
.cp-zoom{display:none;margin-top:10px;border-radius:14px;overflow:hidden;background:#000;perspective:700px}
.cp-zoom.on{display:block}
.cp-zoom .tilt{position:relative;animation:cpTilt 5s ease-in-out infinite;transform-style:preserve-3d}
.cp-zoom canvas{display:block;width:100%}
.cp-zoom .tilt::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.28) 47%,transparent 58%);background-size:250% 100%;animation:cpShine 2.8s ease-in-out infinite;mix-blend-mode:screen}
@keyframes cpTilt{0%,100%{transform:rotateY(-9deg) rotateX(3deg)}50%{transform:rotateY(9deg) rotateX(-2deg)}}
@keyframes cpShine{0%{background-position:120% 0}100%{background-position:-120% 0}}
.cp-cmp{display:none;margin-top:10px;gap:8px;grid-template-columns:1fr 1fr}.cp-cmp.on{display:grid}
.cp-cmp figure{margin:0;border-radius:12px;overflow:hidden;background:#000;position:relative}.cp-cmp canvas{display:block;width:100%}
.cp-cmp figcaption{position:absolute;left:8px;top:8px;padding:4px 9px;border-radius:999px;background:rgba(0,0,0,.65);font-size:11.5px;font-weight:800}
.cp-share{display:none;margin-top:10px;padding:12px;border-radius:14px;background:rgba(255,255,255,.05);font-size:13px}.cp-share.on{display:block}
.cp-share input{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.15);background:#14141e;color:#fff;font:600 13px Manrope,system-ui;margin:8px 0}
.cp-priv{font-size:11.5px;color:#7d7d95;text-align:center;margin-top:8px}
.cp-drop{position:absolute;inset:10px;border-radius:14px;border:2px dashed #ffd23f;background:rgba(30,22,0,.85);display:none;align-items:center;justify-content:center;font:700 18px Sora,system-ui,sans-serif;color:#ffd23f;z-index:5;pointer-events:none}
.cp.drag .cp-drop{display:flex}
.cp-paste{width:100%;margin-top:8px;padding:11px;border-radius:12px;border:1.5px dashed rgba(255,255,255,.18);background:transparent;color:#d8d8e6;font:700 13.5px Manrope,system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}
.cp-paste svg{width:17px;height:17px}
.cp-tip{font-size:12px;color:#ffc56b;margin-top:6px;text-align:center}.cp-tip:empty{display:none}
.cp-spin{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(11,11,18,.55);font-weight:800;font-size:14px}.cp.busy .cp-spin{display:flex}
@media(min-width:900px){.cp-body{flex-direction:row}.cp-stage{flex:1.5;padding:24px}.cp-stage canvas{max-height:calc(100vh - 130px)}.cp-panel{flex:1;max-width:450px;border-left:1px solid rgba(255,255,255,.08);padding:20px 22px 32px}}
`;
const IC={cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.6"/></svg>',
 img:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="8.5" r="1.5"/></svg>',
 dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/></svg>',
 share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.8 7.4-4.4M8.3 13.2l7.4 4.4"/></svg>',
 paste:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9.5 10h5M9.5 14h5"/></svg>',
 wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>'};
const SHAPE_TXT={standard:'a standard plate',short:'a short plate',oversize:'an oversized plate',hex:'a hex plate',moto:'a square / two-line plate'};
function build(){if(built)return;built=true;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  root=document.createElement('div');root.className='cp';root.setAttribute('role','dialog');root.setAttribute('aria-label','See your plate on your car');
  root.innerHTML=`<div class="cp-top"><div><b>See it on <span class="g">your car</span></b><small>Your new plate on a photo of your car</small></div><button class="cp-x" type="button" aria-label="Close">×</button></div>
  <div class="cp-body"><div class="cp-stage" id="cpStage">
    <div class="cp-empty" id="cpEmpty"><div class="pic"><i></i></div><p><b style="color:#fff">Take a photo of the front or back of your car</b>, straight on, with the whole plate in shot. We'll put your new plate on it.<br><span style="font-size:12.5px">You can also drag a photo in, or paste one (JPEG or PNG).</span></p></div>
    <canvas id="cpCv" hidden></canvas><div class="cp-hl" id="cpHl"></div><div class="cp-msg" id="cpMsg"></div><div class="cp-spin">Working on it…</div><div class="cp-drop">Drop your photo here</div></div>
  <div class="cp-panel">
   <div class="cp-st"><h4><i>1</i>Your car</h4><div class="cp-row">
     <label class="cp-b pri">${IC.cam}Take a photo<input type="file" accept="image/*" capture="environment" hidden id="cpCam"></label>
     <label class="cp-b">${IC.img}Choose photo<input type="file" accept="image/*" hidden id="cpPick"></label></div>
     <button class="cp-paste" type="button" id="cpPaste">${IC.paste}<span>Paste a photo</span></button><p class="cp-tip" id="cpTip"></p>
     <div id="cpFound"></div></div>
   <div class="cp-st" id="cpS2" hidden><h4><i>2</i>Your plate</h4>
     <input class="cp-reg" id="cpReg" maxlength="8" autocomplete="off" spellcheck="false" aria-label="Registration">
     <div class="cp-opt"><span>Letters</span><div class="cp-row" data-k="letters"></div></div>
     <div class="cp-opt"><span>Plate</span><div class="cp-row" data-k="shape"></div></div>
     <div class="cp-opt"><span>Extras</span><div class="cp-row" data-k="extras"></div></div>
     <div class="cp-opt"><span>Type</span><div class="cp-row" data-k="use"></div></div>
     <div class="cp-use" id="cpUse"></div></div>
   <div class="cp-st" id="cpS3" hidden><h4><i>3</i>Old plate</h4><div class="cp-row" data-k="hide"></div><p class="cp-note" id="cpHideNote"></p></div>
   <div class="cp-st" id="cpS4" hidden><h4><i>4</i>Have a look</h4><div class="cp-row" style="flex-wrap:wrap">
     <button class="cp-c" data-v="night" type="button">🌙 Night</button><button class="cp-c" data-v="before" type="button">⇆ Before / after</button><button class="cp-c" data-v="zoom" type="button">✦ Close-up</button><button class="cp-c" data-v="cmp" type="button">◫ Compare</button></div>
     <div class="cp-zoom" id="cpZoom"><div class="tilt"><canvas></canvas></div></div>
     <div id="cpCmpPick" class="cp-row" style="margin-top:10px" hidden></div>
     <div class="cp-cmp" id="cpCmp"><figure><canvas></canvas><figcaption>Yours</figcaption></figure><figure><canvas></canvas><figcaption id="cpCmpB"></figcaption></figure></div></div>
   <div class="cp-st" id="cpS5" hidden><h4><i>5</i>Love it?</h4><div class="cp-row">
     <button class="cp-b" type="button" id="cpDl">${IC.dl}Download</button><button class="cp-b" type="button" id="cpShare">${IC.share}Share link</button></div>
     <div class="cp-share" id="cpShareBox"></div>
     <div class="cp-row" style="margin-top:9px"><a class="cp-b wa" href="#" id="cpOrder">${IC.wa}Order this plate on WhatsApp</a></div>
     <p class="cp-priv">Your photo stays on your phone. It's only uploaded if you tap Share link (then it's deleted after 30 days).</p></div>
  </div></div>`;
  document.body.appendChild(root);
  stage=$('#cpStage');cv=$('#cpCv');ctx=cv.getContext('2d');hl=$('#cpHl');
  $('.cp-x').onclick=close;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('on'))close()});
  ['#cpCam','#cpPick'].forEach(s=>$(s).onchange=e=>{const f=e.target.files[0];if(f)load(f);e.target.value=''});
  $('#cpReg').oninput=e=>{const v=e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g,'');e.target.value=v;PB().regIn.value=v;PB().drawPlate();clearTimeout(S.rt);S.rt=setTimeout(render,160)};
  root.addEventListener('click',onClick);
  stage.addEventListener('pointerdown',down);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
  window.addEventListener('resize',()=>{if(root.classList.contains('on'))placeHandles()});
  // drag & drop, paste (keyboard) and a Paste button for phones
  ['dragenter','dragover'].forEach(t=>root.addEventListener(t,e=>{if(![...(e.dataTransfer||{}).types||[]].includes('Files'))return;e.preventDefault();root.classList.add('drag')}));
  root.addEventListener('dragleave',e=>{if(e.relatedTarget&&root.contains(e.relatedTarget))return;root.classList.remove('drag')});
  root.addEventListener('drop',e=>{e.preventDefault();root.classList.remove('drag');const f=[...(e.dataTransfer||{}).files||[]].find(f=>/^image\//.test(f.type));f?take(f):tip('That isn’t a photo. Please use a JPEG or PNG.')});
  document.addEventListener('paste',e=>{if(!root.classList.contains('on'))return;const it=[...((e.clipboardData||{}).items||[])].find(i=>/^image\//.test(i.type));if(it){e.preventDefault();take(it.getAsFile())}});
  $('#cpPaste').onclick=pasteBtn;
  $('#cpDl').onclick=download;$('#cpShare').onclick=share;$('#cpOrder').onclick=e=>{e.preventDefault();order()};
}

function chips(){const pb=PB(),P=pb.P,o=pb.OPTS;
  const row=(k,list,on,dis)=>{$(`[data-k="${k}"]`).innerHTML=list.map(([v,t])=>`<button type="button" class="cp-c${on(v)?' on':''}" data-k2="${k}" data-v2="${v}"${dis&&dis(v)?' disabled':''}>${t}</button>`).join('')};
  row('letters',o.letters,v=>P.letters===v,v=>!pb.allowed('letters',v));
  row('shape',o.shape.filter(s=>s[0]!=='moto'||S.det&&S.det.shape==='moto'),v=>P.shape===v);
  row('extras',o.extras,v=>!!P[v],v=>!pb.allowed('extras',v));
  const forced=pb.forcedShow();row('use',[['road','Road legal'],['show','Show plate']],v=>pb.isShow()?v==='show':v==='road',v=>v==='road'&&!!forced);
  const show=pb.isShow(),u=$('#cpUse');u.className='cp-use '+(show?'show':'road');
  u.innerHTML=`<i></i><span>${show?`You're buying <b>show plates</b>: for display and off-road use only, not for driving on UK roads.${forced?' ('+forced+' is show-only.)':''}`:`You're buying <b>road-legal plates</b> (BS AU 145e).`}</span>`;
  const hide=[['auto','Smart'],['fill','Paint out'],['black','Black backing'],['body','Car-colour backing'],['none','Leave']];
  $('[data-k="hide"]').innerHTML=hide.map(([v,t])=>`<button type="button" class="cp-c${S.hide===v?' on':''}" data-k2="hide" data-v2="${v}">${t}</button>`).join('');
  $('#cpHideNote').textContent=S.hide==='auto'?'Smart: if your new plate is smaller than the one on the car, we paint the old one out so you can’t see it behind.':S.hide==='fill'?'We fill the old plate area with the colour and texture around it.':S.hide==='black'||S.hide==='body'?'A backing plate the size of your old plate, behind the new one. This is what most people fit.':'';
  $('#cpReg').value=pb.regIn.value||'SMR 1';$('#cpReg').classList.toggle('front',S.side==='front');
  ['night','before','zoom','cmp'].forEach(v=>{const b=$(`[data-v="${v}"]`);if(b)b.classList.toggle('on',v==='night'?S.night:v==='before'?S.before:v==='zoom'?$('#cpZoom').classList.contains('on'):!!S.cmp)});
}
function updInfo(){
  const d=S.det,P=PB().P;let h='';
  if(S.crop)h=`<div class="cp-card ok"><span><b>Crop your photo.</b> Drag the white corners (or the box) to frame your car, then tap Crop.<div class="cp-row"><button class="cp-c on" type="button" data-act="crop-ok">Crop ✓</button><button class="cp-c" type="button" data-act="crop-no">Cancel</button></div></span></div>`;
  else if(S.edit)h=`<div class="cp-card"><span>${S.found?'<b>Tap your number plate</b> on the photo and we’ll frame it for you.':'We couldn’t spot the plate by itself. <b>Tap your number plate</b> on the photo and we’ll find it.'}<div class="cp-row"><button class="cp-c" type="button" data-act="crop">Crop photo</button>${S.found?'<button class="cp-c" type="button" data-act="tap-no">Cancel</button>':''}</div></span></div>`;
  else if(d){const want=P.shape;h=`<div class="cp-card ok"><span>Found your <b>${S.side==='rear'?'rear':'front'}</b> plate. Your car has <b>${SHAPE_TXT[d.shape]}</b>.<div class="cp-row"><button class="cp-c" type="button" data-act="edit">Wrong spot? Tap your plate</button><button class="cp-c" type="button" data-act="crop">Crop photo</button><button class="cp-c" type="button" data-act="flip">It's the ${S.side==='rear'?'front':'rear'}</button></div></span></div>`;
    if(d.shape==='oversize'&&want!=='oversize')h+=`<div class="cp-card"><span>This car comes with an <b>oversized plate</b> (common on Range Rovers and other 4x4s). A standard plate will look small and leave a gap. We recommend <b>Oversized</b>.<div class="cp-row"><button class="cp-c on" type="button" data-act="use-over">Switch to Oversized</button><button class="cp-c" type="button" data-act="keep">Keep ${PB().lbl('shape',want)}</button></div></span></div>`;
    else if(d.shape==='hex'&&want!=='hex')h+=`<div class="cp-card"><span>This car has a <b>hex plate</b> now. Want to keep that look?<div class="cp-row"><button class="cp-c on" type="button" data-act="use-hex">Switch to Hex</button><button class="cp-c" type="button" data-act="keep">Keep ${PB().lbl('shape',want)}</button></div></span></div>`;
    else if(d.shape==='moto'&&want!=='moto')h+=`<div class="cp-card"><span>This car has a <b>square, two-line plate</b> recess.<div class="cp-row"><button class="cp-c on" type="button" data-act="use-moto">Use two-line plate</button><button class="cp-c" type="button" data-act="keep">Keep ${PB().lbl('shape',want)}</button></div></span></div>`;
    else if(d.shape==='standard'&&want==='oversize')h+=`<div class="cp-card"><span>This car takes a <b>standard-size plate</b>. An oversized one will stick out above and below the plate area.</span></div>`}
  if(S.keep)h=h.replace(/<div class="cp-card"><span>This car (comes|has)[\s\S]*?<\/span><\/div>$/,'');
  $('#cpFound').innerHTML=h;
  $('#cpMsg').textContent=S.crop?'':S.edit?'👆 Tap your number plate':'';stage.classList.toggle('cp-tapme',!!S.edit&&!S.crop);
  ['#cpS2','#cpS3','#cpS4','#cpS5'].forEach(s=>$(s).hidden=!S.photo||S.edit||!!S.crop);
  chips()}

function onClick(e){const b=e.target.closest('button');if(!b||!root.contains(b))return;const pb=PB();
  if(b.dataset.act){const a=b.dataset.act;
    if(a==='edit'){S.edit=true;S.tapAt=null;render();updInfo()}
    if(a==='tap-no'){S.edit=false;S.tapAt=null;hl.innerHTML='';render();updInfo()}
    if(a==='crop'){startCrop()}
    if(a==='crop-ok'){applyCrop()}
    if(a==='crop-no'){S.crop=null;hl.innerHTML='';render();updInfo()}
    if(a==='flip'){S.side=S.side==='rear'?'front':'rear';pb.P.side=S.side;pb.drawPlate();S.det=classify();render()}
    if(a==='use-over'){pb.choose('shape','oversize');render()}
    if(a==='use-hex'){pb.choose('shape','hex');render()}
    if(a==='use-moto'){pb.choose('shape','moto');S.side='rear';render()}
    if(a==='keep'){S.keep=true;updInfo()}
    return}
  const k=b.dataset.k2,v=b.dataset.v2;
  if(k){if(k==='hide'){S.hide=v}else if(k==='use'){pb.setUse(v)}else{pb.choose(k,v);if(pb.P.shape==='moto')S.side='rear';pb.P.side=S.side}render();if(k==='hide'||k==='use')chips();return}
  const t=b.dataset.v;
  if(t==='night'){S.night=!S.night;render()}
  if(t==='before'){S.before=!S.before;S.split=.5;render()}
  if(t==='zoom'){const z=$('#cpZoom');z.classList.toggle('on');if(z.classList.contains('on'))renderZoom();chips()}
  if(t==='cmp'){if(S.cmp){S.cmp=null;$('#cpCmp').classList.remove('on');$('#cpCmpPick').hidden=true;chips()}else{const alt=pb.P.letters==='4dgel'?'4d':'4dgel';S.cmp={letters:alt};cmpPick();renderCompare();chips()}}
  if(b.dataset.cmp){S.cmp={letters:b.dataset.cmp};cmpPick();renderCompare()}
}
function cmpPick(){const o=PB().OPTS.letters,cur=PB().P.letters;const el=$('#cpCmpPick');el.hidden=false;
  el.innerHTML='<span style="font-size:12px;font-weight:700;color:#a8a8c0;padding-top:9px">Compare with:</span>'+o.filter(x=>x[0]!==cur&&PB().allowed('letters',x[0])).map(([v,t])=>`<button type="button" class="cp-c${S.cmp&&S.cmp.letters===v?' on':''}" data-cmp="${v}">${t}</button>`).join('')}
function renderCompare(){const box=$('#cpCmp');box.classList.add('on');const cs=box.querySelectorAll('canvas'),o=plateOpts(),o2=plateOpts({letters:S.cmp.letters});
  const crop=(src,dst)=>{const b=bbox(S.quad,0),w=b[2]-b[0],h=b[3]-b[1],m=Math.max(w*.35,h*1.4),x0=Math.max(0,b[0]-m),y0=Math.max(0,b[1]-m*.9),x1=Math.min(S.pw,b[2]+m),y1=Math.min(S.ph,b[3]+m*.9);dst.width=Math.round(x1-x0);dst.height=Math.round(y1-y0);dst.getContext('2d').drawImage(src,x0,y0,x1-x0,y1-y0,0,0,dst.width,dst.height)};
  plateImg(o).then(()=>{crop(compose(o,S.night,{noLabel:true}),cs[0]);return plateImg(o2)}).then(()=>{crop(compose(o2,S.night,{noLabel:true}),cs[1]);$('#cpCmpB').textContent=PB().lbl('letters',S.cmp.letters);plateImg(o)})}
function renderZoom(){if(!S.lastOut||!S.quad)return;const c=$('#cpZoom canvas'),b=bbox(S.quad,0),w=b[2]-b[0],h=b[3]-b[1],m=w*.22,x0=Math.max(0,b[0]-m),y0=Math.max(0,b[1]-h*1.1),x1=Math.min(S.pw,b[2]+m),y1=Math.min(S.ph,b[3]+h*1.1);
  c.width=Math.min(1400,Math.round((x1-x0)*2));c.height=Math.round(c.width*(y1-y0)/(x1-x0));const z=c.getContext('2d');z.imageSmoothingQuality='high';z.drawImage(S.lastOut,x0,y0,x1-x0,y1-y0,0,0,c.width,c.height)}

/* ---------------- dragging (corners + before/after) ---------------- */
let drag=null;
function toImg(e){const r=cv.getBoundingClientRect(),k=S.pw/r.width;return [(e.clientX-r.left)*k,(e.clientY-r.top)*k]}
function down(e){if(!S.photo)return;
  if(S.crop){const k=e.target.closest('.cp-k'),m=e.target.closest('.cp-crop');if(!k&&!m)return;drag=k?{c:+k.dataset.c}:{mv:toImg(e),c0:S.crop.slice()};e.target.setPointerCapture&&e.target.setPointerCapture(e.pointerId);e.preventDefault();return}
  if(S.edit){if(e.target===cv||e.target.closest('.cp-hl')){e.preventDefault();tapFind(toImg(e))}return}
  if(S.before){drag={split:true};move(e)}}
function move(e){if(!drag)return;e.preventDefault&&e.preventDefault();
  if(drag.split){const r=cv.getBoundingClientRect();S.split=Math.max(.02,Math.min(.98,(e.clientX-r.left)/r.width));render();return}
  const p=toImg(e),c=S.crop,mn=Math.min(S.pw,S.ph)*.12,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  if(drag.mv){const w=drag.c0[2]-drag.c0[0],h=drag.c0[3]-drag.c0[1],x=cl(drag.c0[0]+p[0]-drag.mv[0],0,S.pw-w),y=cl(drag.c0[1]+p[1]-drag.mv[1],0,S.ph-h);S.crop=[x,y,x+w,y+h]}
  else{const i=drag.c;if(i===0||i===3)c[0]=cl(p[0],0,c[2]-mn);else c[2]=cl(p[0],c[0]+mn,S.pw);if(i<2)c[1]=cl(p[1],0,c[3]-mn);else c[3]=cl(p[1],c[1]+mn,S.ph)}
  placeHandles()}
function up(){if(!drag)return;drag=null}
/* ---------------- AI plate finder ----------------
   open-image-models YOLOv9-tiny plate detector (MIT, assets/ai/), run on the phone with ONNX Runtime Web.
   Nothing is uploaded. Falls back to the colour detector if it can't load. */
const AI={base:'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.1/dist/',model:'/assets/ai/plate-finder-512.onnx',size:512,p:null,sess:null};
function aiLoad(){if(AI.p)return AI.p;
  AI.p=new Promise((res,rej)=>{if(window.ort)return res();const sc=document.createElement('script');sc.src=AI.base+'ort.wasm.min.js';sc.async=true;sc.onload=res;sc.onerror=rej;document.head.appendChild(sc)})
    .then(()=>{const o=window.ort;o.env.wasm.wasmPaths=AI.base;o.env.wasm.numThreads=1;return o.InferenceSession.create(AI.model,{executionProviders:['wasm'],graphOptimizationLevel:'all'})})
    .then(s=>{AI.sess=s;return s}).catch(e=>{AI.fail=true;throw e});
  return AI.p}
function aiDetect(){const n=AI.size,s=AI.sess,o=window.ort;if(!s)return Promise.resolve(null);
  const r=n/Math.max(S.pw,S.ph),nw=Math.round(S.pw*r),nh=Math.round(S.ph*r),dw=(n-nw)/2,dh=(n-nh)/2;
  const c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle='rgb(114,114,114)';x.fillRect(0,0,n,n);x.imageSmoothingQuality='high';x.drawImage(S.photo,Math.round(dw),Math.round(dh),nw,nh);
  const d=x.getImageData(0,0,n,n).data,N=n*n,t=new Float32Array(3*N);for(let i=0;i<N;i++){t[i]=d[i*4]/255;t[N+i]=d[i*4+1]/255;t[2*N+i]=d[i*4+2]/255}
  return s.run({[s.inputNames[0]]:new o.Tensor('float32',t,[1,3,n,n])}).then(out=>{const v=out[s.outputNames[0]],a=v.data,k=v.dims[1]||7,res=[];
    for(let i=0;i+k<=a.length;i+=k){const sc=a[i+6];if(sc<.1)continue;res.push({score:sc,box:[(a[i+1]-dw)/r,(a[i+2]-dh)/r,(a[i+3]-dw)/r,(a[i+4]-dh)/r]})}
    return res.sort((p,q)=>q.score-p.score)})}
/* AI box -> exact corners: grow the plate colour from the middle of the box, keep it if it fits the box */
function aiRefine(b){const [x0,y0,x1,y1]=b.box,w=x1-x0,h=y1-y0,cx=(x0+x1)/2,cy=(y0+y1)/2;let best=null;
  for(const [fx,fy] of [[0,0],[-.28,0],[.28,0],[0,-.22],[0,.22]]){let d=null;try{d=detectAt(cx+fx*w,cy+fy*h)}catch(e){}if(!d)continue;
    const bb=bbox(d.quad,0),ix=Math.max(0,Math.min(bb[2],x1+w*.08)-Math.max(bb[0],x0-w*.08)),iy=Math.max(0,Math.min(bb[3],y1+h*.15)-Math.max(bb[1],y0-h*.15)),ia=ix*iy,ba=(bb[2]-bb[0])*(bb[3]-bb[1]);
    if(ba>0&&ia/ba>.85&&ba>w*h*.35){best=d;break}}
  if(best)return best;
  // no clean colour edge: use the AI box itself, trimmed a little (boxes include a small margin)
  const mx=w*.012,my=h*.08,q=[[x0+mx,y0+my],[x1-mx,y0+my],[x1-mx,y1-my],[x0+mx,y1-my]];
  const P=prep(),i=Math.round(cy*P.k)*P.w+Math.round(cx*P.k);let yel=0,n=0;for(let yy=-3;yy<=3;yy++)for(let xx=-Math.round(w*P.k*.4);xx<=Math.round(w*P.k*.4);xx+=2){const j=i+yy*P.w+xx;if(j<0||j>=P.N||P.Vv[j]<.4)continue;n++;if(P.Hh[j]>30&&P.Hh[j]<70&&P.Ss[j]>.3)yel++}
  return {quad:q,side:n&&yel/n>.3?'rear':'front',hex:false}}

/* ---------------- loading ---------------- */
/* fast photo opening: decode + shrink in one step where the browser can, so big phone photos open quickly */
function openPhoto(f,max){
  const viaImg=()=>new Promise((res,rej)=>{const u=URL.createObjectURL(f),im=new Image();im.decoding='async';im.onload=()=>{const k=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res({c,w:im.naturalWidth,h:im.naturalHeight})};im.onerror=()=>{URL.revokeObjectURL(u);rej()};im.src=u});
  if(!window.createImageBitmap)return viaImg();
  return createImageBitmap(f,{imageOrientation:'from-image'}).then(bm=>{const W=bm.width,H=bm.height,k=Math.min(1,max/Math.max(W,H));
      const go=src=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(W*k));c.height=Math.max(1,Math.round(H*k));const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(src,0,0,c.width,c.height);return {c,w:W,h:H}};
      if(k>=1){const r=go(bm);bm.close&&bm.close();return r}
      return createImageBitmap(f,{imageOrientation:'from-image',resizeWidth:Math.round(W*k),resizeHeight:Math.round(H*k),resizeQuality:'high'}).then(b2=>{const ok=b2.width===Math.round(W*k);const r=go(ok?b2:bm);b2.close&&b2.close();bm.close&&bm.close();return r}).catch(()=>{const r=go(bm);bm.close&&bm.close();return r})})
    .catch(viaImg)}

function tip(t){const el=$('#cpTip');el.textContent=t||'';clearTimeout(tip.t);if(t)tip.t=setTimeout(()=>el.textContent='',6000)}
function take(f){if(!f)return;if(!/^image\/(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(f.type||'image/jpeg')){tip('Please use a JPEG or PNG photo.');return}tip('');load(f)}
function pasteBtn(){
  if(!navigator.clipboard||!navigator.clipboard.read){tip(/Mac|Win|Linux/.test(navigator.platform)&&!/Mobi/.test(navigator.userAgent)?'Press Ctrl+V (or ⌘+V) to paste your photo.':'Your browser can’t paste photos here. Save the photo, then tap Choose photo.');return}
  navigator.clipboard.read().then(items=>{for(const it of items){const t=it.types.find(x=>/^image\//.test(x));if(t)return it.getType(t).then(b=>take(new File([b],'pasted.'+(t.split('/')[1]||'png'),{type:t})))}
    tip('There’s no photo copied. Copy a photo first (long-press it → Copy), then tap Paste.')}).catch(()=>tip('Paste was blocked. Allow paste when asked, or use Choose photo.'))}
function busy(on){root.classList.toggle('busy',!!on)}
function setPhoto(c){S.photo=c;S.pw=c.width;S.ph=c.height;PREP=null;S.noise=(()=>{try{const d=c.getContext('2d').getImageData(0,0,Math.min(400,c.width),Math.min(300,c.height)).data;let t=0,n=0;for(let i=4;i<d.length;i+=16){t+=Math.abs(d[i]-d[i-4]);n++}return Math.min(10,t/n)}catch(e){return 2}})();
  S.inpaintKey='';S.keep=false;S.before=false;S.cmp=null;S.crop=null;S.tapAt=null;S.shareUrl='';$('#cpShareBox').classList.remove('on');$('#cpCmp').classList.remove('on');$('#cpZoom').classList.remove('on')}
function findPlate(){busy(1);S.ai=null;$('.cp-spin').textContent=AI.sess||AI.fail?'Finding your plate…':'Loading the plate finder…';
  const wait=AI.sess||AI.fail?Promise.resolve():Promise.race([aiLoad().catch(()=>{}),new Promise(r=>setTimeout(r,15000))]);
  wait.then(()=>{$('.cp-spin').textContent='Finding your plate…';return new Promise(r=>setTimeout(r,30))}).then(()=>aiDetect().catch(()=>null)).then(list=>{let d=null;
    if(list&&list.length&&list[0].score>=.1){try{d=aiRefine(list[0])}catch(e){}S.ai=list}
    if(!d){try{d=detect()}catch(err){d=null}}
    if(d){S.quad=d.quad;S.side=d.side;S.found=true;S.edit=false;S.hexHint=!!d.hex}
    else{S.found=false;S.edit=true;S.quad=null;S.side=PB().P.side||'rear'}
    if(PB().P.shape==='moto'&&S.side==='front')PB().choose('shape','standard');
    PB().P.side=S.side;PB().drawPlate();
    S.det=S.found?classify():null;busy(0);hl.innerHTML='';render();updInfo()})}
function load(f){busy(1);$('.cp-spin').textContent='Opening your photo…';
  openPhoto(f,1800).then(({c})=>{setPhoto(c);$('#cpEmpty').hidden=true;cv.hidden=false;findPlate()})
  .catch(()=>{busy(0);tip('Sorry, that photo couldn’t be opened. Please try a JPEG or PNG.')})}

/* ---------------- output ---------------- */
function finalCanvas(){return S.lastOut}
function download(){const c=finalCanvas();if(!c)return;c.toBlob(b=>{const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='smr-plate-'+(PB().regIn.value||'plate').replace(/\s+/g,'').toLowerCase()+'.jpg';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)},'image/jpeg',.92)}
function share(){const c=finalCanvas();if(!c)return;const box=$('#cpShareBox');
  const show=url=>{box.classList.add('on');box.innerHTML=`<b>Your view-only link</b> (lasts 30 days)<input readonly value="${url}" onclick="this.select()"><div class="cp-row"><button class="cp-c on" type="button" id="cpCopy">Copy link</button><a class="cp-c" href="https://wa.me/?text=${encodeURIComponent('Look at my new plates 👀 '+url)}" target="_blank" rel="noopener">Send on WhatsApp</a>${navigator.share?'<button class="cp-c" type="button" id="cpNative">More…</button>':''}</div>`;
    $('#cpCopy').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(url);$('#cpCopy').textContent='Copied ✓'};const n=$('#cpNative');if(n)n.onclick=()=>navigator.share({title:'My new plates',url}).catch(()=>{})};
  if(S.shareUrl&&S.shareKey===S.lastKey)return show(S.shareUrl);
  box.classList.add('on');box.textContent='Making your link…';
  SMRShare.upload(c,'plate',(PB().regIn.value||'').toUpperCase()+' plates').then(url=>{S.shareUrl=url;S.shareKey=S.lastKey;show(url)}).catch(m=>{box.textContent=m||'Sorry, the link couldn’t be made. Please try again.'})}
function order(){const pb=PB(),P=pb.P,ex=['tint','border'].filter(x=>P[x]).map(x=>pb.lbl('extras',x));
  const need=P.shape==='moto'?'Rear plate (motorcycle / square)':P.need==='set'?'Full set (front + rear)':P.need==='front'?'Front plate only':'Rear plate only';
  const msg=`Hi SMR Plates! I tried my plate on my car on your website and I'd like to order:\n\nReg: ${(pb.regIn.value||'').toUpperCase()}\nType: ${pb.isShow()?'SHOW PLATES (not road legal)':'Road-legal plates'}\nLetters: ${pb.lbl('letters',P.letters)}\nPlate: ${pb.lbl('shape',P.shape)}\nExtras: ${ex.join(', ')||'None'}\nI need: ${need}${S.det?'\nMy car currently has: '+SHAPE_TXT[S.det.shape]:''}${S.shareUrl?'\n\nMy mock-up: '+S.shareUrl:''}`;
  const u='https://wa.me/'+WA+'?text='+encodeURIComponent(msg);window.open(u,'_blank','noopener')||(location.href=u)}

function open(){build();aiLoad().catch(()=>{});root.classList.add('on');document.documentElement.style.overflow='hidden';if(S.photo){render();updInfo()}else chips()}
function close(){root.classList.remove('on');document.documentElement.style.overflow='';PB().drawPlate()}
document.addEventListener('click',e=>{const t=e.target.closest('[data-carplate]');if(!t)return;e.preventDefault();e.stopPropagation();open()},true);
window.SMRCarPlate={open,close,_S:S,_detect:()=>detect(),_detectAt:(x,y)=>detectAt(x,y),_classify:()=>classify()};
})();
