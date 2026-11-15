"""Hand-fixed one-colour versions that override the automatic ones. Run after every build."""
import numpy as np, glob
from PIL import Image
from scipy import ndimage
import importlib.util
spec=importlib.util.spec_from_file_location('b','build2.py')
src=open('build2.py').read(); ns={}
exec("import numpy as np, potrace\n"+src[src.find('def trace_svg'):src.find('def sig(im)')].split('def knock')[0],ns)
def ukim():
    im=Image.open('raw/new/ukim.png').convert('RGBA'); s=1600/max(im.size); im=im.resize((int(im.width*s),int(im.height*s)),Image.LANCZOS)
    a=np.asarray(im).astype(float); lum=a[...,:3]@[.2126,.7152,.0722]
    lab,n=ndimage.label(lum>235); edge=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
    m=(~np.isin(lab,list(edge)))&(lum>80); m=ndimage.binary_opening(ndimage.binary_closing(m,iterations=2),iterations=2)
    ys,xs=np.where(m); m=m[ys.min():ys.max()+1,xs.min():xs.max()+1]
    d=glob.glob('out/logos/*/ukim-luton/')[0]
    for name,rgb,fill in [('white',(255,255,255),'#ffffff'),('black',(17,17,17),'#111111')]:
        o=np.zeros(m.shape+(4,),np.uint8); o[m]=rgb+(255,); Image.fromarray(o).save(f'{d}ukim-luton-icon-{name}.png')
        ns['trace_svg'](m,fill,f'{d}ukim-luton-icon-{name}.svg')
ukim()
def ukim_lockups():
    import json, lockup
    d=glob.glob('out/logos/*/ukim-luton/')[0]; sp=json.load(open('lockups.json'))['ukim-luton']
    jobs=[]
    for name,col in [('white','#ffffff'),('black','#111111')]:
        icon=Image.open(f'{d}ukim-luton-icon-{name}.png').convert('RGBA'); s=dict(sp,c1=col,c2=col)
        jobs+= [(icon,s,'h',f'{d}ukim-luton-lockup-{name}.png'),(icon,s,'v',f'{d}ukim-luton-lockup-stacked-{name}.png')]
    lockup.make(jobs)
    for f in glob.glob(f'{d}ukim-luton-lockup*-{{white,black}}.svg'): pass
    import os
    for v in ('lockup','lockup-stacked'):
        for c in ('white','black'):
            sv=f'{d}ukim-luton-{v}-{c}.svg'
            if os.path.exists(sv):
                im=Image.open(f'{d}ukim-luton-{v}-{c}.png'); m=np.asarray(im.getchannel('A'))>110
                ns['trace_svg'](m,'#ffffff' if c=='white' else '#111111',sv)
ukim_lockups()
def putteridge():
    import json, lockup, os
    d=glob.glob('out/logos/*/putteridge/')[0]
    im=Image.open(d+'putteridge-icon.png').convert('RGBA'); a=np.asarray(im).astype(float)
    al=a[...,3]>100; rgb=a[...,:3]/255; lum=rgb@[.2126,.7152,.0722]; sat=(rgb.max(-1)-rgb.min(-1))/(rgb.max(-1)+1e-6)
    holes=al&(lum>.55)&(sat<.25); holes=ndimage.binary_closing(ndimage.binary_opening(holes,iterations=1),iterations=2)
    m=al&~holes; m=ndimage.binary_opening(m,iterations=1)
    for name,rgbc,fill in [('white',(255,255,255),'#ffffff'),('black',(17,17,17),'#111111')]:
        o=np.zeros(m.shape+(4,),np.uint8); o[m]=rgbc+(255,); Image.fromarray(o).save(f'{d}putteridge-icon-{name}.png'); ns['trace_svg'](m,fill,f'{d}putteridge-icon-{name}.svg')
    sp=json.load(open('lockups.json'))['putteridge']; jobs=[]
    for name,col in [('white','#ffffff'),('black','#111111')]:
        ic=Image.open(f'{d}putteridge-icon-{name}.png'); s=dict(sp,c1=col,c2=col)
        jobs+=[(ic,s,'h',f'{d}putteridge-lockup-{name}.png'),(ic,s,'v',f'{d}putteridge-lockup-stacked-{name}.png')]
    lockup.make(jobs)
    for v in ('lockup','lockup-stacked'):
        for c in ('white','black'):
            if os.path.exists(f'{d}putteridge-{v}-{c}.svg'):
                ns['trace_svg'](np.asarray(Image.open(f'{d}putteridge-{v}-{c}.png').getchannel('A'))>110,'#ffffff' if c=='white' else '#111111',f'{d}putteridge-{v}-{c}.svg')
putteridge(); print('post fixes applied')
