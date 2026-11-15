import os,shutil,json,glob,numpy as np
from PIL import Image
exec(open('map.py').read())
APP='/home/claude/site/img/m/full/'
OLD_SVG={'bpjm','irshad','raynham-way-cc'}
NO_ICON={'yusuf-hall','leagrave-hall','al-nikah','grand-royale','as-sunnah','bushmead'}
# mosques: app's HD set is the master; campaign svg only where it matches
for s,(cat,name,al,src) in list(M.items()):
    if cat!='mosques': continue
    keep=[x for x in src if x[1]!='logo']
    new=[(APP+s+'.png','logo')] if os.path.exists(APP+s+'.png') else []
    if s not in OLD_SVG and os.path.exists(f'raw/winter/{s}.svg'): new.append((f'winter/{s}.svg','logo'))
    M[s]=(cat,name,al,new+keep)
# Bury Park: one mosque, two logos
bp=M.pop('bpjm'); bj=M.pop('bury-park-jamia')
M['bury-park-jami-masjid']=('mosques','Bury Park Jami Masjid',['BPJM','Bury Park Jamia Masjid'],bp[3]+[(bj[3][0][0],'logo-arabic')])
CAT={'mosques':'Mosques & Islamic centres','schools':'Schools & colleges','charities':'Charities','community':'Council, public & youth','campaigns':'Campaigns & events','media':'Media','venues':'Venues & days out','businesses':'Businesses & sponsors','smr':'SMR'}
OUT='out/logos'; shutil.rmtree('out',ignore_errors=True)
def trim(im):
    a=np.asarray(im.getchannel('A'))>12
    if not a.any(): return im
    ys,xs=np.where(a); p=2
    return im.crop((max(xs.min()-p,0),max(ys.min()-p,0),min(xs.max()+p+1,im.width),min(ys.max()+p+1,im.height)))
def transparent(im):
    a=np.asarray(im.getchannel('A')); return (a<20).mean()>0.04
def recolour(im,rgb):
    a=np.asarray(im).copy(); a[...,:3]=rgb; return Image.fromarray(a)
def ondark(im):
    a=np.asarray(im).astype(float)/255; rgb=a[...,:3]; al=a[...,3]
    mx=rgb.max(-1); mn=rgb.min(-1); lum=rgb@[.2126,.7152,.0722]; sat=(mx-mn)/(mx+1e-6)
    m=(al>.05)&(((lum<.38)&(sat<.35))|(lum<.16))
    if m.sum()<0.04*(al>.05).sum(): return None
    out=np.asarray(im).copy(); out[m,:3]=255; return Image.fromarray(out)
def icon(im):
    a=np.asarray(im.getchannel('A'))>40; H,W=a.shape
    cols=a.any(0); rows=a.any(1)
    def gaps(v,n):
        g=[];st=None
        for i,x in enumerate(v):
            if not x and st is None: st=i
            if x and st is not None: g.append((st,i)); st=None
        return [x for x in g if x[1]-x[0]>=max(4,n*.025) and x[0]>n*.08]
    for (g0,g1) in gaps(cols,W):           # icon left of text
        part=trim(im.crop((0,0,g0,H)))
        r=part.width/part.height
        if 0.55<r<1.8 and g0<0.5*W and part.height>0.6*H: return part
    for (g0,g1) in gaps(rows,H):           # icon above text
        part=trim(im.crop((0,0,W,g0)))
        r=part.width/part.height
        if 0.5<r<2.2 and g0<0.8*H and g0>0.4*H: return part
    return None
INFO=json.load(open('info.json'))
index=[]
for s,(cat,name,al,src) in sorted(M.items(),key=lambda x:(list(CAT).index(x[1][0]),x[1][1].lower())):
    d=f'{OUT}/{cat}/{s}'; os.makedirs(d,exist_ok=True); files=[]; have=set(); main=None; seen=set()
    for path,var in src:
        p=path if path.startswith('/') else 'raw/'+path
        key=(var,'svg' if p.endswith('.svg') else 'png')
        if key in seen: continue
        seen.add(key); have.add(var)
        if p.endswith('.svg'):
            fn=f'{s}-{var}.svg'; shutil.copy(p,f'{d}/{fn}')
            files.append({'file':fn,'variant':var,'vector':True}); continue
        im=trim(Image.open(p).convert('RGBA')); fn=f'{s}-{var}.png'; im.save(f'{d}/{fn}',optimize=True)
        files.append({'file':fn,'variant':var,'w':im.width,'h':im.height})
        if var=='logo' and main is None: main=im
    if main is None:
        f=[x for x in files if not x.get('vector')]
        main=Image.open(f'{d}/{f[0]["file"]}').convert('RGBA') if f else None
    gen=[]
    if main is not None and transparent(main):
        if 'logo-white' not in have and 'icon-white' not in have:
            od=ondark(main)
            if od is not None: gen.append(('two-tone-on-dark',od))
        a=np.asarray(main.getchannel('A'))>40
        if a.mean()<0.5:   # skip flat white/black for solid crests and badges: they turn into blank shapes
            gen.append(('mono-white',recolour(main,255))); gen.append(('mono-black',recolour(main,17)))
        if s not in NO_ICON and not any(v.startswith('icon') for v in have):
            ic=icon(main)
            if ic is not None: gen+= [('icon',ic),('icon-white',recolour(ic,255))]
    for var,im in gen:
        fn=f'{s}-{var}.png'; im.save(f'{d}/{fn}',optimize=True)
        files.append({'file':fn,'variant':var,'w':im.width,'h':im.height,'made':True})
    big=max([max(x.get('w',0),x.get('h',0)) for x in files if x['variant'] in('logo','crest','wordmark','logo-arabic')]+[0])
    vec=any(x.get('vector') for x in files)
    index.append({'slug':s,'name':name,'aliases':al,'category':cat,'category_name':CAT[cat],'path':f'{cat}/{s}/','vector':vec,'details':INFO.get(s,{}),
      'quality':'vector' if vec else ('hd' if big>=900 else 'ok' if big>=480 else 'low-res'),'files':files})
json.dump({'updated':'2026-11-15','categories':CAT,'logos':index},open(f'{OUT}/logos.json','w'),indent=1)
from collections import Counter
print(len(index),'orgs',sum(len(x['files']) for x in index),'files', Counter(x['quality'] for x in index))
print('low-res:',[x['slug'] for x in index if x['quality']=='low-res'])
print('icons made:',[x['slug'] for x in index if any(f['variant']=='icon' and f.get('made') for f in x['files'])])
