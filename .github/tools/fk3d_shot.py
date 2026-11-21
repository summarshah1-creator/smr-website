#!/usr/bin/env python3
"""Screenshot checker for the 3D game (flappy/3d). Any chat can run it after editing its file.
   python3 .github/tools/fk3d_shot.py [road|pipes] [out.jpg] ['[[px,py,pz,lx,ly,lz],...]']
   Camera positions are relative to the pigeon's z. Prints any JavaScript errors (fix them before pushing).
   Needs: pip install playwright --break-system-packages && playwright install chromium (or Chrome at /usr/bin/google-chrome)."""
import asyncio, json, os, subprocess, sys, time
from playwright.async_api import async_playwright
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'flappy', '3d')
mode = sys.argv[1] if len(sys.argv) > 1 else 'road'
out = sys.argv[2] if len(sys.argv) > 2 else '/tmp/fk3d.jpg'
views = json.loads(sys.argv[3]) if len(sys.argv) > 3 else [[-3, 1.7, -8, -12, 3, -30], [3, 1.7, -8, 14, 3, -30], [-3.6, 1.4, -2, -3.6, .9, -14], [0, 25, 30, 0, 0, -60]]
async def main():
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8897'], cwd=D, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1); errs = []
    try:
        async with async_playwright() as p:
            exe = '/usr/bin/google-chrome' if os.path.exists('/usr/bin/google-chrome') else None
            b = await p.chromium.launch(executable_path=exe, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
            pg = await b.new_page(viewport={'width': 720, 'height': 480}, device_scale_factor=1.5)
            pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and '404' not in m.text else None)
            await pg.goto('http://localhost:8897/index.html?manual=1' + ('&road=1' if mode == 'road' else '')); await pg.wait_for_timeout(2500)
            await pg.evaluate('__fk3.start()')
            for i in range(6): await pg.evaluate('__step(33,20)')
            shots = []
            for i, v in enumerate(views):
                await pg.evaluate('__shot(%s)' % ','.join(map(str, v))); f = '/tmp/fk3d_%d.png' % i; await pg.screenshot(path=f); shots.append(Image.open(f))
            fps = await pg.evaluate("(() => { const t = performance.now(); for (let i = 0; i < 30; i++) __step(16); return Math.round(30000 / (performance.now() - t)); })()")
            await b.close()
        W, H = shots[0].size; cols = 2; rows = (len(shots) + 1) // 2; o = Image.new('RGB', (W * cols, H * rows), 'white')
        for i, im in enumerate(shots): o.paste(im, ((i % cols) * W, (i // cols) * H))
        o.resize((W, H * rows // cols)).convert('RGB').save(out, quality=85)
        print('saved', out, '| steps/s in software rendering (compare before/after your change, not with phones):', fps)
    finally: srv.terminate()
    print('JS errors:', errs or 'none')
asyncio.run(main())
