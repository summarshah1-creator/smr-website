#!/usr/bin/env python3
"""SMR round badge animation (spinning words ring + moving gradient light).

LOOP RULE: every moving part completes a whole number of cycles in --loop
seconds and the last frame is never a copy of the first, so the video loops
seamlessly forever on a screen. The words ring does exactly one full turn per
loop (the words differ, so anything less would jump). Change speed by changing
--loop, never by adding a motion that doesn't divide into it.

  python3 render.py                      # 48 s loop, 1440x2560, 60 fps, dark bg
  python3 render.py --loop 24            # faster spin
  python3 render.py --url smrdigital.co.uk --words "APPS,WEBSITES,MARKETING"
  python3 render.py --transparent        # ProRes 4444 .mov with alpha
Needs: playwright (chromium), ffmpeg.
"""
import argparse, os, shutil, subprocess, tempfile
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument('--loop', type=float, default=48)
ap.add_argument('--fps', type=int, default=60)
ap.add_argument('--size', default='1440x2560')
ap.add_argument('--badge', type=int, default=600, help='badge width in a 1080-wide frame')
ap.add_argument('--url', default='smrgraphics.co.uk', help='"" = none')
ap.add_argument('--words', default='APPS,WEBSITES,MARKETING,DESIGN,PRINTING')
ap.add_argument('--bg', default='#08080f')
ap.add_argument('--transparent', action='store_true')
ap.add_argument('--out', default='SMR-badge-spin')
a = ap.parse_args()
OW, OH = map(int, a.size.split('x')); VW = 1080; VH = round(VW * OH / OW)
mark = open(os.path.join(D, 'mark.txt')).read().strip()
words = [w.strip().upper() for w in a.words.split(',') if w.strip()]
tp = ''.join(f'<text class="r"><textPath href="#cc" startOffset="0" text-anchor="middle">{w}</textPath></text>' for w in words)
bg = 'transparent' if a.transparent else a.bg
url = f'<p>{a.url}</p>' if a.url else ''
html = f'''<html><head><style>
@font-face{{font-family:Sora;src:url(sora.woff2)}}@font-face{{font-family:Man;src:url(man.woff2)}}
html,body{{background:{bg}}}
body{{margin:0;width:{VW}px;height:{VH}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:46px;overflow:hidden}}
svg{{text-rendering:geometricPrecision;shape-rendering:geometricPrecision}}
.r{{font:700 15px Sora;letter-spacing:3.4px;fill:#ece6ff}}
p{{margin:0;font:600 30px Man;letter-spacing:.18em;color:#a3a3bd}}
</style></head><body>
<svg viewBox="0 0 300 300" style="width:{a.badge}px;height:{a.badge}px;overflow:visible">
<defs>
<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="10" y1="10" x2="290" y2="290"><stop offset="0" stop-color="#5b5bff"/><stop offset=".5" stop-color="#9a4bff"/><stop offset="1" stop-color="#d63bff"/></linearGradient>
<radialGradient id="hl" gradientUnits="userSpaceOnUse" cx="110" cy="100" r="95"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".55" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
<path id="cc" d="M150 150 m-112 0{' a112 112 0 1 1 224 0 a112 112 0 1 1 -224 0'*3}"/>
</defs>
<circle id="glow" cx="150" cy="150" r="86" fill="url(#g)" opacity=".38" filter="url(#gl)"/>
<circle cx="150" cy="150" r="140" fill="none" stroke="url(#g)" stroke-width="5"/>
<circle cx="150" cy="150" r="86" fill="url(#g)"/>
<circle cx="150" cy="150" r="86" fill="url(#hl)"/>
<g id="ring">{tp}</g>
<g transform="translate(150 150) scale(.13) translate(-500 -128.2)"><path fill="#fff" fill-rule="evenodd" d="{mark}"/></g>
</svg>{url}
<script>
var LOOP={a.loop}, TAU=Math.PI*2;
// whole cycles per loop (LOOP RULE): ring 1 turn, gradient light 4 turns, glow 8 pulses
function setT(t){{
 var u=t/LOOP;
 document.getElementById('ring').setAttribute('transform','rotate('+(360*u)+' 150 150)');
 var b=TAU*4*u, x1=150-140*Math.cos(b+Math.PI*.75), y1=150-140*Math.sin(b+Math.PI*.75), g=document.getElementById('g');
 g.setAttribute('x1',x1);g.setAttribute('y1',y1);g.setAttribute('x2',300-x1);g.setAttribute('y2',300-y1);
 var h=document.getElementById('hl'), hb=b+Math.PI*1.25;
 h.setAttribute('cx',150+48*Math.cos(hb));h.setAttribute('cy',150+48*Math.sin(hb));
 document.getElementById('glow').setAttribute('opacity',.32+.1*Math.sin(TAU*8*u));
}}
// equal gaps between words, a drawn round dot in the middle of each gap
document.fonts.ready.then(function(){{
 var R=112,C=TAU*R,w=[...document.querySelectorAll('#ring text')],ring=document.getElementById('ring'),LS=3.4;
 var L=w.map(e=>e.getComputedTextLength()),gap=(C-L.reduce((x,y)=>x+y,0))/w.length,pos=C-L[0]/2;
 w.forEach(function(e,i){{e.firstChild.setAttribute('startOffset',pos+L[i]/2);
  var o=pos+L[i]+gap/2-LS/2,th=Math.PI+o/R,c=document.createElementNS('http://www.w3.org/2000/svg','circle');
  c.setAttribute('cx',150+(R+5.4)*Math.cos(th));c.setAttribute('cy',150+(R+5.4)*Math.sin(th));c.setAttribute('r',2.3);c.setAttribute('fill','#c9b8ff');ring.appendChild(c);
  pos+=L[i]+gap}});
 setT(0);window.ready=1}});
</script></body></html>'''
tmp = tempfile.mkdtemp()
for f in ('sora.woff2', 'man.woff2'): shutil.copy(os.path.join(D, f), tmp)
open(os.path.join(tmp, 'index.html'), 'w').write(html)
N = round(a.loop * a.fps)
ext = 'png' if a.transparent else 'jpg'
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(viewport={'width': VW, 'height': VH}, device_scale_factor=2)
    pg.goto('file://' + tmp + '/index.html'); pg.wait_for_function('window.ready'); pg.wait_for_timeout(200)
    for i in range(N):  # i/N never reaches 1, so frame N (= frame 0) isn't repeated
        pg.evaluate(f'setT({i / a.fps})')
        kw = {'omit_background': True} if a.transparent else {'quality': 95}
        pg.screenshot(path=f'{tmp}/f{i:05d}.{ext}', **kw)
    br.close()
vf = f'scale={OW}:{OH}:flags=lanczos'
if a.transparent:
    out = a.out + '.mov'
    enc = ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le']
else:
    out = a.out + '.mp4'
    enc = ['-c:v', 'libx264', '-crf', '14', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
part = out + '.part' + os.path.splitext(out)[1]
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(a.fps), '-i', f'{tmp}/f%05d.{ext}', '-vf', vf, *enc, part], check=True)
os.replace(part, out); shutil.rmtree(tmp); print(out)
