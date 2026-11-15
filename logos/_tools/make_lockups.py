import json,glob,os,numpy as np
from PIL import Image
import lockup
specs=json.load(open('lockups.json'))
os.makedirs('raw/lockups',exist_ok=True)
def two_colours(icon):
    a=np.asarray(icon.convert('RGBA')).astype(float); px=a[a[...,3]>150][:,:3]
    mx,mn=px.max(1),px.min(1); sat=(mx-mn)/(mx+1e-6); lum=px@[.2126,.7152,.0722]/255
    cand=px[(sat>.25)&(lum<.7)&(lum>.08)]
    if len(cand)<80: cand=px[lum<.5]
    if len(cand)<80: return '#222222','#5b616d'
    q=(cand//32).astype(int); k,c=np.unique(q,axis=0,return_counts=True); o=c.argsort()[::-1]
    cols=[cand[(q==k[i]).all(1)].mean(0) for i in o[:6]]
    # line 1: the darkest of the two biggest colours; line 2: the other (or grey)
    cols=sorted(cols[:2],key=lambda v:v@[.2126,.7152,.0722])
    h=lambda v:'#%02x%02x%02x'%tuple(int(x) for x in v)
    return h(cols[0]), (h(cols[1]) if len(cols)>1 and np.abs(cols[0]-cols[1]).max()>40 else '#5b616d')
jobs=[]
ONLY=set(filter(None,os.environ.get('ONLY','').split(',')))
for slug,sp in specs.items():
    if ONLY and slug not in ONLY: continue
    d=glob.glob(f'out/logos/*/{slug}/')
    if not d: print('missing',slug); continue
    d=d[0]
    cand=[f'{d}{slug}-{sp["src"]}.png',f'{d}{slug}-icon.png',f'{d}{slug}-logo.png',f'{d}{slug}-crest.png']
    p=next((c for c in cand if os.path.exists(c)),None)
    if not p: print('no icon',slug); continue
    icon=Image.open(p).convert('RGBA')
    c1,c2=two_colours(icon); sp=dict(sp); sp.setdefault('c1',c1); sp.setdefault('c2',c2)
    jobs+= [(icon,sp,'h',f'raw/lockups/{slug}-h.png'),(icon,sp,'v',f'raw/lockups/{slug}-v.png')]
lockup.make(jobs); print(len(jobs),'lockups')
