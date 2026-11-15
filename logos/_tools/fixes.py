import base64, io, asyncio, numpy as np
from PIL import Image
from playwright.async_api import async_playwright
F='/home/claude/fonts/node_modules/@fontsource'
def ff(fam,w): return f"@font-face{{font-family:'{fam}';font-weight:{w};src:url(data:font/woff2;base64,{base64.b64encode(open(f'{F}/{fam}/files/{fam}-latin-{w}-normal.woff2','rb').read()).decode()})}}"
def b64(im): b=io.BytesIO(); im.save(b,'PNG'); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
O='out/logos/'
jobs={}
# 1 Luton Council of Mosques: retype text in Marcellus, keep the tile
lcm=Image.open(O+'mosques/lcm/lcm-logo.png').convert('RGBA'); tile=lcm.crop((835,0,lcm.width,lcm.height))
jobs['lcm']=ff('marcellus',400)+f'''</style><div id=L style="display:inline-flex;align-items:center;gap:40px;padding:6px">
<div style="font-family:marcellus;color:#73743a;line-height:.95">
<div style="font-size:200px">LUTON</div><div style="font-size:92px;letter-spacing:8px;margin:6px 0 10px 4px">COUNCIL OF</div><div style="font-size:178px">MOSQUES</div></div>
<img src="{b64(tile)}" style="height:640px"></div>'''
# 2 LSCM: lockup + stacked, retyped
dots='<span style="color:#3cb54a;-webkit-text-stroke:0">.</span>'
lscm='L'+dots+'S'+dots+'C'+dots+'M'+dots
mark=f'<div style="font:700 230px oswald;letter-spacing:6px;color:#fff;-webkit-text-stroke:8px #3cb54a;paint-order:stroke fill;line-height:1;border-top:6px solid #3cb54a;border-bottom:6px solid #3cb54a;padding:10px 0">{lscm}</div>'
jobs['lscm-lockup']=ff('oswald',700)+ff('poppins',600)+f'''</style><div id=L style="display:inline-flex;align-items:center;gap:56px;padding:10px">{mark}
<div style="font:600 92px poppins;color:#111;line-height:1.08;white-space:nowrap">Luton Sunni<br>Council of<br>Mosques</div></div>'''
jobs['lscm-logo']=ff('oswald',700)+ff('poppins',600)+f'''</style><div id=L style="display:inline-flex;flex-direction:column;align-items:center;gap:18px;padding:10px">{mark}
<div style="font:700 92px oswald;color:#111;letter-spacing:1px">Luton Sunni Council of Mosques</div></div>'''
# 3 Al-Hikmah: keep mark + name, retype the tagline
ah=Image.open(O+'schools/al-hikmah/al-hikmah-logo.png').convert('RGBA'); top=ah.crop((0,0,ah.width,512))
jobs['al-hikmah']=ff('open-sans',400)+ff('open-sans',600)+f'''</style><div id=L style="display:inline-flex;flex-direction:column;padding:6px;width:{ah.width}px">
<img src="{b64(top)}" style="width:{ah.width}px;display:block">
<div style="font:400 58px 'open-sans';color:#555;letter-spacing:23px;white-space:nowrap;margin-top:14px">HOUSE OF KNOWLEDGE &amp; WISDOM</div>
<div style="font:600 64px 'open-sans';color:#4f5130;text-align:right;margin-top:8px;padding-right:20px">Bury Park Educational Institute</div></div>'''
# 4 Tops Pizza: keep hat + letters, retype Est. 1988
tp=Image.open(O+'businesses/tops-pizza/tops-pizza-logo.png').convert('RGBA'); s=3; tp=tp.crop((0,0,tp.width,380)).resize((tp.width*s,380*s),Image.LANCZOS)
jobs['tops-pizza']=ff('oswald',700)+f'''</style><div id=L style="display:inline-flex;flex-direction:column;align-items:flex-end;padding:6px">
<img src="{b64(tp)}" style="display:block"><div style="font:700 150px oswald;color:#e3262f;letter-spacing:10px;margin:-10px 40px 0 0">EST. 1988</div></div>'''
# 5 Kashmir Catering: clear the blurry SERVICES and set it on the arc
kc=Image.open(O+'businesses/kashmir-catering/kashmir-catering-logo.png').convert('RGBA'); a=np.asarray(kc).copy()
a[1040:1160,520:1090]=0; kc2=Image.fromarray(a); W,H=kc2.size
jobs['kashmir-catering']=ff('marcellus',400)+f'''</style><div id=L style="position:relative;width:{W}px;height:{H}px">
<img src="{b64(kc2)}" style="position:absolute;inset:0">
<svg style="position:absolute;inset:0" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><defs><path id="arc" d="M {798-430} 700 A 430 430 0 0 0 {798+430} 700"/></defs>
<text font-family="marcellus" font-size="78" fill="#11793d" letter-spacing="14"><textPath href="#arc" startOffset="50%" text-anchor="middle">SERVICES</textPath></text></svg></div>'''
async def run():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        for k,h in jobs.items():
            await pg.set_content('<html><head><style>body{margin:0;background:transparent}'+h+'</html>'); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(150)
            await pg.locator('#L').screenshot(path=f'raw/fixed/{k}.png',omit_background=True)
        await b.close()
asyncio.run(run())
# 6 Beds PCC: drop small stray specks
from scipy import ndimage
im=Image.open('raw/new/beds-pcc.png').convert('RGB'); a=np.asarray(im).astype(int)
ink=(a.min(-1)<200); lab,n=ndimage.label(ink); sz=ndimage.sum(ink,lab,range(1,n+1)); big=np.argmax(sz)+1
ok=[i+1 for i,v in enumerate(sz) if v>.01*sz.max()]; ys,xs=np.where(np.isin(lab,ok)&(np.isin(lab,ok))); out=np.asarray(im).copy(); keep=np.zeros(ink.shape,bool); keep[ys.min():ys.max()+1,xs.min():xs.max()+1]=True
out[~keep]=255; Image.fromarray(out).crop((xs.min()-4,ys.min()-4,xs.max()+5,ys.max()+5)).save('raw/fixed/beds-pcc.png')
print('ok')
