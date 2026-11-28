# SMR Studio, bars version (owner 28 Nov): white "Studio" beside the SMR mark with the three brand
# gradient bars under it. The top of the S sits level with the top of the SMR mark and the bars'
# bottom edge sits level with the bottom of the mark, so word + bars together fill the mark's height.
# Writes assets/brand/smr-studio-bars(.svg|-dark.svg). Usage: python3 .github/tools/brand_studio_bars.py [d]
#   (pass "d" to line up the tallest letter, the d, with the mark top instead of the S)
import re,sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
R='/home/claude/smr-website/'
F=TTFont('/usr/share/fonts/truetype/google-fonts/Poppins-Light.ttf'); gs=F.getGlyphSet(); cmap=F.getBestCmap(); hm=F['hmtx']
md=re.search(r' d="([^"]+)"',open(R+'assets/smr-mark.svg').read()).group(1)
MH=256.4; BH=19.0; BGAP=52.0; GAP=100.0; SEP=14.0
def bounds(ch):
    bp=BoundsPen(gs); gs[cmap[ord(ch)]].draw(bp); return bp.bounds
top_ref='d' if 'd' in sys.argv[1:] else 'S'
yMax=bounds(top_ref)[3]
base=MH-BH-BGAP                       # baseline in mark units
sc=base/yMax                          # font units -> mark units
x=0; d=''; xmin=1e9; xmax=-1e9; ytop=1e9
for ch in 'Studio':
    g=gs[cmap[ord(ch)]]; sp=SVGPathPen(gs); g.draw(TransformPen(sp,(sc,0,0,-sc,x,0))); d+=sp.getCommands()
    bp=BoundsPen(gs); g.draw(TransformPen(bp,(sc,0,0,-sc,x,0)))
    a,b,c,e=bp.bounds; xmin=min(xmin,a); xmax=max(xmax,c); ytop=min(ytop,b)
    x+=hm[cmap[ord(ch)]][0]*sc
ox=1000+GAP-xmin
W=xmax-xmin; bw=(W-2*SEP)/3
G=[('#8b5cf6','#ec4899'),('#7bdc3c','#10b981'),('#ff9a1f','#ffd23f')]
defs=''.join(f'<linearGradient id="b{i}" x1="0" x2="1"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>' for i,(a,b) in enumerate(G))
bars=''.join(f'<rect x="{1000+GAP+i*(bw+SEP):.1f}" y="{MH-BH:.1f}" width="{bw:.1f}" height="{BH}" rx="{BH/2}" fill="url(#b{i})"/>' for i in range(3))
top=min(0,base+ytop); pad=48; right=1000+GAP+W
vb=f"{-pad} {top-pad:.1f} {right+2*pad:.1f} {MH-top+2*pad:.1f}"
for v,fill in (('','#fff'),('-dark','#0b0b12')):
    open(R+f'assets/brand/smr-studio-bars{v}.svg','w').write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="SMR Studio">
<!-- SMR Studio, bars version: S top level with the mark top, bars' bottom level with the mark bottom. Built by .github/tools/brand_studio_bars.py -->
<defs>{defs}</defs>
<path fill="{fill}" fill-rule="evenodd" d="{md}"/>
<path fill="{fill}" transform="translate({ox:.2f} {base:.2f})" d="{d}"/>
{bars}
</svg>''')
print('top of tallest letter (mark units, 0 = mark top):', round(base+ytop,1))
