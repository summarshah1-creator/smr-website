from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
import re
F=TTFont('/usr/share/fonts/truetype/google-fonts/Poppins-Light.ttf'); gs=F.getGlyphSet(); cmap=F.getBestCmap(); upm=F['head'].unitsPerEm
mark=open('/home/claude/smr-website/assets/smr-mark.svg').read()
md=re.search(r' d="([^"]+)"',mark).group(1)
WORDS={'digital':('Digital','#5b5bff','#d63bff'),'graphics':('Graphics','#2f6bff','#a43bff'),'marketing':('Marketing','#ff3d8b','#ff8a3d'),'plates':('Plates','#ffd23f','#ff7a2f'),'player':('Player','#5b5bff','#d63bff'),'studio':('Studio','#5b5bff','#d63bff')}
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
for key,(txt,c1,c2) in WORDS.items():
    d,(x0,y0,x1,y1)=word(txt)
    ox=1000+gap-x0; oy=base   # text baseline at y=base (mark spans 0..256.4)
    top=min(0,oy+y0); bot=max(256.4,oy+y1); right=ox+x1
    pad=48
    vb=f"{-pad:.1f} {top-pad:.1f} {right+2*pad:.1f} {bot-top+2*pad:.1f}"
    for variant,mfill in (('',' fill="#fff"'),('-dark',' fill="#0b0b12"')):
        svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="SMR {txt}">
<!-- SMR {txt} wordmark: mark + Poppins Light outlined, descender included (the g is never clipped). Do not retype the word as live text. -->
<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="{x0:.0f}" y1="{y0:.0f}" x2="{x1:.0f}" y2="{y1*0.35:.0f}"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient></defs>
<path{mfill} fill-rule="evenodd" d="{md}"/>
<path fill="url(#g)" transform="translate({ox:.2f} {oy:.2f})" d="{d}"/>
</svg>'''
        open(f'/home/claude/smr-website/assets/brand/smr-{key}{variant}.svg','w').write(svg)
    print(key, vb)
