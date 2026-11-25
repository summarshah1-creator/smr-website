#!/usr/bin/env python3
"""Activities & clubs + events card art for the Community Hub (owner 25 Nov 2026).

Brings across what the NGS app shows on its activity/event cards: a coloured band with the
listing's drawn motif (ART, 200x100 SVG scenes, copied from the NGS app into ngs-art.json)
and the organisation's logo in a white chip at the top left.

Logos come from the logo library (branch logo-library), are trimmed and saved as small
transparent WebPs in hub/wol/<key>.webp (live site). Writes:
  hub/woart.js            live copy (logos as wol/ files, loaded lazily by the browser)
  /tmp/woart-draft.js     same data with the logos inlined as data URIs (the draft artifact
                          is at its 512-file limit, so it gets one file instead of ~100)
Run: python3 .github/tools/hub_woart.py   (needs node, rsvg-convert, Pillow)
"""
import base64, io, json, os, re, subprocess, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HUB = os.path.join(ROOT, 'hub')
OUT = os.path.join(HUB, 'wol')
ART = json.load(open(os.path.join(os.path.dirname(__file__), 'ngs-art.json')))

# hub listing lg key -> logo library slug, where they differ
MAP = {
    'anne-gale': 'anne-gale-school-of-dance', 'baylands': 'baylands-equestrian-centre',
    'blackout-escape': 'blackout-escape-rooms', 'delta-force': 'delta-force-paintball',
    'golden-arrow': 'golden-arrow-archery', 'gravity': 'gravity-active', 'gymfinity': 'gymfinity-kids',
    'higashi-karate': 'higashi-karate-luton', 'hockwell-abc': 'hockwell-ring-abc',
    'luton-grappling': 'luton-grappling-club', 'luton-gymnastics': 'luton-gymnastics-club',
    'luton-judo': 'luton-school-of-judo', 'luton-rugby': 'luton-rfc', 'stockwood': 'culture-trust',
    'stockwood-rfc': 'stockwood-park-rfc', 'sunnah-archery': 'sunnah-archery-club',
    'sunshine-riding': 'sunshine-riding-school', 'voyager': 'voyager-flight-sim', 'wicketz': 'luton-wicketz',
    'keech': 'keech-hospice-care',
}


def git(*a, binary=False):
    r = subprocess.run(['git', '-C', ROOT, *a], capture_output=True)
    if r.returncode:
        raise RuntimeError(r.stderr.decode())
    return r.stdout if binary else r.stdout.decode()


def hub_keys():
    js = ("global.window=global;const fs=require('fs');eval(fs.readFileSync('%s','utf8'));"
          "const s=new Set();HUB.WO.forEach(o=>o.lg&&s.add(o.lg));HUB.EV.forEach(o=>o.lg&&s.add(o.lg));"
          "console.log(JSON.stringify([...s]))") % os.path.join(HUB, 'data.js').replace('\\', '/')
    return json.loads(subprocess.check_output(['node', '-e', js]))


def library():
    git('fetch', '-q', 'origin', 'logo-library')
    return {l['slug']: l for l in json.loads(git('show', 'origin/logo-library:logos/logos.json'))['logos']}


def pick_file(l):
    files = l['files'] if isinstance(l['files'], list) else list(l['files'].values())
    files = [f if isinstance(f, dict) else {'file': f} for f in files]
    def score(f):
        n = f['file']
        if any(x in n for x in ('white', 'black', 'mono', 'on-dark', 'icon')):
            return -1
        s = 0
        if n.endswith('.png'):
            s += 2 + (f.get('w') or 0) / 10000
        if n.endswith('.svg'):
            s += 1
        if 'logo' in n or 'lockup' in n:
            s += 1
        return s
    best = max(files, key=score)
    return best['file'] if score(best) >= 0 else files[0]['file']


def load(l):
    fn = pick_file(l)
    raw = git('show', 'origin/logo-library:logos/%s%s' % (l['path'], fn), binary=True)
    if fn.endswith('.svg'):
        raw = subprocess.run(['rsvg-convert', '-w', '900', '-a'], input=raw, capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(raw)).convert('RGBA')


def save(im, key):
    bb = im.getchannel('A').getbbox()
    if bb:
        im = im.crop(bb)
    im.thumbnail((300, 100), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, 'WEBP', quality=82, method=6)
    open(os.path.join(OUT, key + '.webp'), 'wb').write(b.getvalue())
    return b.getvalue(), im.size


def main():
    os.makedirs(OUT, exist_ok=True)
    lib = library()
    keys = hub_keys()
    logos, data, missing = {}, {}, []
    for k in sorted(keys):
        l = lib.get(MAP.get(k, k))
        if not l:
            missing.append(k)
            continue
        raw, size = save(load(l), k)
        logos[k] = 'wol/%s.webp' % k
        data[k] = 'data:image/webp;base64,' + base64.b64encode(raw).decode()
    meta = {'ART': ART['ART'], 'ARTDEF': ART['ARTDEF'], 'SQ': ART.get('SQ') or {}, 'SM': ART.get('SM') or {}}
    head = '/* Activity & event card art from the NGS app + organisation logos (built by .github/tools/hub_woart.py). */\n'
    js = lambda L: head + 'window.WOART=' + json.dumps(dict(meta, LOGO=L), separators=(',', ':')) + ';\n' + ENHANCE
    open(os.path.join(HUB, 'woart.js'), 'w').write(js(logos))
    open('/tmp/woart-draft.js', 'w').write(js(data))
    print('logos', len(logos), 'of', len(keys), 'missing', missing)


ENHANCE = r'''(function(){
/* Replaces the plain coloured .art band on Activities & clubs and Events cards with the NGS-style
   band: drawn motif + the organisation's logo chip. Runs after every render (the hub re-renders
   views by replacing #main's HTML), so it never fights the page code. */
var A=window.WOART;if(!A)return;
var css='.woband{position:relative;height:104px;margin:-16px -16px 6px;border-radius:var(--r) var(--r) 0 0;display:flex;align-items:stretch;justify-content:flex-end;overflow:hidden}'+
'.woband svg{position:relative;height:100%;width:auto;max-width:78%;flex:none}'+
'.woband::before{content:"";position:absolute;left:-30px;bottom:-60px;width:170px;height:170px;border-radius:50%;background:rgba(255,255,255,.45)}'+
'.woband.dk::before{background:rgba(255,255,255,.06)}.woband.dk svg [stroke="#12324f"]{stroke:#e8eef5}'+
'.woband .alogo{position:absolute;left:12px;top:10px;max-width:52%;height:50px;padding:7px 12px;border-radius:12px;background:#fff;box-shadow:0 6px 14px -8px rgba(18,50,79,.5);display:flex;align-items:center;z-index:2}'+
'.woband .alogo img{max-height:36px;max-width:150px;width:auto;display:block}'+
'.woband .alogo.sq{padding:3px 5px}.woband .alogo.sq img{max-height:46px}.woband .alogo.sm img{max-height:26px;max-width:110px}'+
'.woband .wtag{position:absolute;left:12px;bottom:10px;z-index:2;font-weight:700;font-size:.72rem;line-height:1.15;max-width:calc(100% - 24px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:rgba(255,255,255,.92);color:#12324f;padding:4px 9px;border-radius:999px}'+
'.woband.dk .wtag{background:rgba(0,0,0,.35);color:#fff}'+
'.woband.big{height:clamp(130px,28vw,190px);margin:-16px -16px 16px}.woband.big::before{width:240px;height:240px;bottom:-90px}.woband.big .alogo{height:64px;left:16px;top:16px}.woband.big .alogo img{max-height:48px;max-width:190px}'+
'@media(max-width:700px){.woband{margin:-12px -12px 6px}.woband.big{margin:-12px -12px 14px}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
function band(x,label){var k=x.art||A.ARTDEF[x.c]||'park',a=A.ART[k]||A.ART.park,dark=/^#1/.test(a[0]);
  var lg=x.lg&&A.LOGO[x.lg]?'<span class="alogo'+(A.SQ[x.lg]?' sq':'')+(A.SM[x.lg]?' sm':'')+'"><img src="'+A.LOGO[x.lg]+'" alt="'+(x.org||'').replace(/"/g,'&quot;')+' logo" loading="lazy" decoding="async"></span>':'';
  return '<div class="woband'+(dark?' dk':'')+'" style="background:'+a[0]+'">'+lg+a[1]+(label?'<span class="wtag">'+label+'</span>':'')+'</div>';}
function esc(s){return String(s||'').replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function run(){var H=window.HUB;if(!H)return;var v=(location.hash||'#home').slice(1).split(/[?&]/)[0];
  var it=/^item-(act|event)-/.exec(v);
  if(it){var c=document.querySelector('article.itemc');if(c&&!c.dataset.wob){var h1=c.querySelector('h1'),L=it[1]==='act'?H.WO:H.EV,x=null;
    for(var i=0;i<L.length;i++)if(h1&&L[i].t===h1.textContent){x=L[i];break}
    if(x){var d=document.createElement('div');d.innerHTML=band(x,'');d.firstChild.classList.add('big');c.insertBefore(d.firstChild,c.firstChild);c.dataset.wob=1}}return;}
  var list=v==='activities'?H.WO:v==='events'?H.EV:null;if(!list)return;
  var by={};list.forEach(function(x){by[x.t]=x});
  document.querySelectorAll('.grid article.card').forEach(function(c){if(c.dataset.wob)return;var h=c.querySelector('h3'),x=h&&by[h.textContent];if(!x)return;
    var old=c.querySelector(':scope>.art');var lab=old&&old.textContent.trim();var d=document.createElement('div');d.innerHTML=band(x,esc(lab));
    if(old)old.replaceWith(d.firstChild);else c.insertBefore(d.firstChild,c.firstChild);c.dataset.wob=1;});}
var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(run,30)}).observe(document.documentElement,{childList:true,subtree:true});
addEventListener('hashchange',function(){setTimeout(run,60)});document.readyState!=='loading'?run():addEventListener('DOMContentLoaded',run);
})();
'''

if __name__ == '__main__':
    main()
