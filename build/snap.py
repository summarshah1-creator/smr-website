import asyncio, sys, os, subprocess, time
from playwright.async_api import async_playwright
APP, OUT, PORT = sys.argv[1], sys.argv[2], sys.argv[3]
HASHES = sys.argv[4:]
os.makedirs(OUT, exist_ok=True)
async def main():
  srv = subprocess.Popen([sys.executable, '-m', 'http.server', PORT], cwd=APP, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
  try:
    async with async_playwright() as p:
      b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
      c = await b.new_context(viewport={'width': int(os.environ.get('VW','390')), 'height': int(os.environ.get('VH','844'))}, device_scale_factor=float(os.environ.get('DSF','1')), has_touch=os.environ.get('VW','390')=='390', is_mobile=os.environ.get('VW','390')=='390', service_workers='block')
      await c.add_init_script("try{localStorage.setItem('mtSeen','1')}catch(e){}")
      pg = await c.new_page()
      errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
      await pg.goto(f'http://localhost:{PORT}/'); await pg.wait_for_timeout(2500)
      for h in HASHES:
        scroll = 0
        if '@' in h: h, scroll = h.split('@'); scroll=int(scroll)
        await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(1500)
        if scroll: await pg.evaluate(f"(document.getElementById('scrWrap')&&!document.getElementById('scrWrap').hidden)?document.getElementById('scrBody').scrollTop={scroll}:window.scrollTo(0,{scroll})"); await pg.wait_for_timeout(600)
        name = (h.strip('#') or 'home') + (f'_{scroll}' if scroll else '')
        await pg.screenshot(path=os.path.join(OUT, name + '.png'))
      print('errors:', errs[:5])
      await b.close()
  finally:
    srv.terminate()
asyncio.run(main())
