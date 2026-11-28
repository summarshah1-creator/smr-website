from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
import re
F=TTFont('/usr/share/fonts/truetype/google-fonts/Poppins-Light.ttf'); gs=F.getGlyphSet(); cmap=F.getBestCmap(); upm=F['head'].unitsPerEm
mark=open('/home/claude/smr-website/assets/smr-mark.svg').read()
md=re.search(r' d="([^"]+)"',mark).group(1)
WORDS={'digital':('Digital','#5b5bff','#d63bff'),'graphics':('Graphics','#7bdc3c','#10b981'),'marketing':('Marketing','#ff3d8b','#ff8a3d'),'plates':('Plates','#ffd23f','#ff7a2f'),'player':('Player','#5b5bff','#d63bff'),'studio':('Studio','SPECTRUM',''),'admin':('Admin','#5b5bff','#d63bff'),'printing':('Printing','#7bdc3c','#10b981')}
EM=240.0   # word size in mark units (mark is 1000 x 256.4 = 76 x 19.5 px at 24 px text)
s=EM/upm*(19.5/ (EM/24*19.5/ (1000*19.5/76/ (EM/24))) ) if False else None
# mark px->units: 76px = 1000 units -> 1px = 13.158 units; text 24px = 315.8 units
k=1000/76; size=24*k; sc=size/upm
gap=8*k; baseline_from_top_px=23.4-6.69  # baseline below mark top in px
capH=F['OS/2'].sCapHeight*sc
base=256.4/2+capH/2   # owner 22 Nov: the capital letter's centre lines up exactly with the centre of the SMR mark
print('capH',capH)
def word(txt):
    x=0; d=''; xmin=ymin=1e9; xmax=ymax=-1e9
    hm=F['hmtx']
    for ch in txt:
        gn=cmap[ord(ch)]; g=gs[gn]
        sp=SVGPathPen(gs); tp=TransformPen(sp,(sc,0,0,-sc,x,0)); g.draw(tp); d+=sp.getCommands()
        bp=BoundsPen(gs); g.draw(TransformPen(bp,(sc,0,0,-sc,x,0)))
        if bp.bounds: a,b,c,e=bp.bounds; xmin=min(xmin,a);ymin=min(ymin,b);xmax=max(xmax,c);ymax=max(ymax,e)
        x+=hm[gn][0]*sc
    return d,(xmin,ymin,xmax,ymax)
# SPECTRUM = all three brand gradients in one smooth diagonal fade (owner 28 Nov): Digital purple→pink, Graphics lime→emerald, Marketing orange→yellow, mixed in OKLab so the joins stay clean
def spec(n=24):
  import math
  C=['#8b5cf6','#ec4899','#7bdc3c','#10b981','#ff9a1f','#ffd23f']
  def lin(c): c/=255; return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
  def dl(c): return 255*(12.92*c if c<=.0031308 else 1.055*c**(1/2.4)-.055)
  def tolab(h):
    r,g,b=[lin(int(h[i:i+2],16)) for i in (1,3,5)]
    l=.4122214708*r+.5363325363*g+.0514459929*b; m=.2119034982*r+.6806995451*g+.1073969566*b; s_=.0883024619*r+.2817188376*g+.6299787005*b
    l,m,s_=[x**(1/3) for x in (l,m,s_)]
    return (.2104542553*l+.7936177850*m-.0040720468*s_,1.9779984951*l-2.4285922050*m+.4505937099*s_,.0259040371*l+.7827717662*m-.8086757660*s_)
  def tohex(L,a,b):
    l=(L+.3963377774*a+.2158037573*b)**3; m=(L-.1055613458*a-.0638541728*b)**3; s_=(L-.0894841775*a-1.2914855480*b)**3
    r=4.0767416621*l-3.3077115913*m+.2309699292*s_; g=-1.2684380046*l+2.6097574011*m-.3413193965*s_; bb=-.0041960863*l-.7034186147*m+1.7076147010*s_
    return '#'+''.join('%02x'%max(0,min(255,round(dl(max(0,min(1,v)))))) for v in (r,g,bb))
  P=[tolab(c) for c in C]; out=''
  for i in range(n+1):
    t=i/n*(len(C)-1); k=min(int(t),len(C)-2); f=t-k
    L,a,b=[P[k][j]+(P[k+1][j]-P[k][j])*f for j in range(3)]
    out+=f'<stop offset="{i/n:.3f}" stop-color="{tohex(L,a,b)}"/>'
  return out
for key,(txt,c1,c2) in WORDS.items():
    d,(x0,y0,x1,y1)=word(txt)
    ox=1000+gap-x0; oy=base   # text baseline at y=base (mark spans 0..256.4)
    top=min(0,oy+y0); bot=max(256.4,oy+y1); right=ox+x1
    pad=48
    vb=f"{-pad:.1f} {top-pad:.1f} {right+2*pad:.1f} {bot-top+2*pad:.1f}"
    for variant,mfill in (('',' fill="#fff"'),('-dark',' fill="#0b0b12"')):
        svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="SMR {txt}">
<!-- SMR {txt} wordmark: mark + Poppins Light outlined, descender included (the g is never clipped). Do not retype the word as live text. -->
<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="{x0:.0f}" y1="{y0:.0f}" x2="{x1:.0f}" y2="{y1*0.35:.0f}">{spec() if c1=="SPECTRUM" else f'<stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/>'}</linearGradient></defs>
<path{mfill} fill-rule="evenodd" d="{md}"/>
<path fill="url(#g)" transform="translate({ox:.2f} {oy:.2f})" d="{d}"/>
</svg>'''
        open(f'/home/claude/smr-website/assets/brand/smr-{key}{variant}.svg','w').write(svg)
    print(key, vb)
