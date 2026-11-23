#!/usr/bin/env python3
"""Turn MySirat into (or update) an SMR Digital demo in one go.

Usage:  python3 tools/make_smr_demo.py <path to smr-website clone> [--ver 1.2] [--hidden]

What it does:
  1. copies app/ into a temporary work folder as <work>/mysirat/
  2. makes the icon (<work>/_icons/mysirat.webp) from app/icons/icon-512.png
  3. adds or updates the "mysirat" entry in smr-website/.github/tools/seeds.json
     (new version stamp, so SMR unpacks the new copy on the next page load)
  4. runs smr-website/.github/tools/pack_demos.py <work> mysirat
Then commit and push smr-website (pushing to main deploys it). The demo appears in
SMR Admin -> My demos, ready to send from the Send tab.
"""
import json, os, shutil, subprocess, sys, tempfile, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
if not args: sys.exit(__doc__)
SITE = os.path.abspath(args[0]); VER = None; HIDDEN = '--hidden' in args
if '--ver' in args: VER = args[args.index('--ver') + 1]
TOOLS = os.path.join(SITE, '.github', 'tools')
assert os.path.isfile(os.path.join(TOOLS, 'pack_demos.py')), 'not an smr-website clone: ' + SITE

ENTRY = {
  "slug": "mysirat", "name": "MySirat", "accent": "#c9a86a",
  "tagline": "Your Muslim toolkit · prayer, Qur'an, local masjids · Luton",
  "description": "MySirat: an ad-free Muslim toolkit app for Luton. Prayer times with adhan alerts and qibla, local masjid jamaat times and a Jummah finder, Ayah a day, duas, Hajj & Umrah guide, zakat and inheritance calculators, Islamic videos, local news and a halal directory, plus the NGS Pathfinder and Skills & Training Finder.",
  "tips": [
    "Prayer times for your area to the second, adhan alerts and a qibla compass, with no adverts anywhere.",
    "Local masjids built in: jamaat times and a Jummah finder that shows the nearest Jummah first.",
    "A full toolkit: Ayah a day, duas, tasbih, Hijri calendar, Ramadan timetable, zakat and inheritance calculators.",
    "Watch: only Islam and dawah videos, safe for the whole family.",
    "Local life: Luton news, what's on and a halal directory, with room for one main sponsor per area.",
    "Pathfinder and Skills & Training Finder help young people find courses, jobs and training nearby."
  ]
}

work = tempfile.mkdtemp(prefix='mysirat-demo-')
shutil.copytree(os.path.join(ROOT, 'app'), os.path.join(work, 'mysirat'), ignore=shutil.ignore_patterns('sw.js', '*.map', '.DS_Store'))
os.makedirs(os.path.join(work, '_icons'))
from PIL import Image
Image.open(os.path.join(ROOT, 'app', 'icons', 'icon-512.png')).convert('RGBA').save(os.path.join(work, '_icons', 'mysirat.webp'), 'WEBP', quality=92)

sp = os.path.join(TOOLS, 'seeds.json'); seeds = json.load(open(sp, encoding='utf-8'))
cur = next((s for s in seeds if s['slug'] == 'mysirat'), None)
if cur is None: cur = dict(ENTRY); seeds.append(cur); print('added mysirat to seeds.json')
else:
    for k in ('name', 'accent', 'tagline', 'description', 'tips'): cur.setdefault(k, ENTRY[k])
cur['version'] = time.strftime('%Y-%m-%d-%H%M')
if VER: cur['ver'] = VER
if HIDDEN: cur['hidden'] = True
json.dump(seeds, open(sp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False); open(sp, 'a').write('\n')

subprocess.check_call([sys.executable, os.path.join(TOOLS, 'pack_demos.py'), work, 'mysirat'])
shutil.rmtree(work)
print('\nDone. Now in', SITE, ':\n  git add .github/tools/seeds.json demo-data/seed && git commit -m "Update MySirat demo" && git push')
