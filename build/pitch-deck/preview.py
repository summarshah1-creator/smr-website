import re,sys
R="/mnt/user-data/outputs/artifacts/577d069f-3f56-4a0c-83d9-129dd1c06dc4/project"
css=open(f'{R}/deck.css').read()
blob={'/_blob/7e56b3914ca6eed4158f2edc54b20216':'/mnt/user-data/uploads/4f7602a6-image.png','/_blob/c9b45a457dcf0164bbaf4006e6ea0f3d':'/mnt/user-data/uploads/a5dd50a1-image.png','/_blob/94fc2d5a4ad9db0120ab52629aeba877':'/mnt/user-data/uploads/add77ea6-image.png','/_blob/b32e3e7ca4aef92d9d22110aeea0663b':'/mnt/user-data/outputs/artifacts/bbb7a284-45c0-4c34-ae4f-a35d54b7406d/project/logos/bintang.png','/_blob/901bba8dd2e68b2a51569d4d0520a3f9':'/mnt/user-data/outputs/artifacts/bbb7a284-45c0-4c34-ae4f-a35d54b7406d/project/logos/aham.png','/_blob/9bb5e0cbb58c4090f114019fba81ee69':'/mnt/user-data/outputs/artifacts/bbb7a284-45c0-4c34-ae4f-a35d54b7406d/project/logos/amova.png'}
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--allow-file-access-from-files"])
    pg=b.new_page(viewport={"width":1920,"height":1080})
    for i,s in enumerate(['problem','money','need'],1):
        h=re.sub(r'<aside>.*?</aside>','',open(f'{R}/slides/{s}.html').read(),flags=re.S)
        for k,v in blob.items(): h=h.replace(k,'file://'+v)
        open(f'/tmp/d_{s}.html','w').write(f'<html><head><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Inter:wght@400..800&display=swap" rel="stylesheet"><style>body{{margin:0}}section{{width:1920px;height:1080px;position:relative;overflow:hidden}}*{{animation:none!important}}{css}</style></head><body>{h}</body></html>')
        pg.goto(f"file:///tmp/d_{s}.html"); pg.wait_for_timeout(1500)
        pg.screenshot(path=f"/mnt/user-data/outputs/MuslimToolkit_{i}_{s}.png")
        print(s, pg.evaluate("(()=>{let m=0;document.querySelectorAll('section > *').forEach(e=>{if(!e.classList.contains('foot')&&getComputedStyle(e).position!='absolute')m=Math.max(m,e.getBoundingClientRect().bottom)});return m})()"), pg.evaluate("document.fonts.check('40px \"Bricolage Grotesque\"')"))
    b.close()
