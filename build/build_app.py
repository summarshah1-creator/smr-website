"""MySirat build v2: latest Inspire FM engine (inspire2) minus radio and Inspire branding,
plus the NGS Pathfinder and Skills & Training Finder. Run: python3 build/build_app.py"""
import shutil, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = ROOT + '/sources/inspire-engine'; OUT = ROOT + '/app'; MT = ROOT + '/sources/mysirat-skin'; NGS = ROOT + '/sources/ngs'
if os.path.exists(OUT): shutil.rmtree(OUT)
shutil.copytree(SRC, OUT, ignore=shutil.ignore_patterns('sw.js', 'audio', 'full', 'winter', 'vid', 'presenters.js', 'liveroom.js', 'studio.js'))
os.makedirs(OUT + '/winter', exist_ok=True); shutil.copy(SRC + '/winter/live-data.js', OUT + '/winter/live-data.js')
os.makedirs(OUT + '/mt', exist_ok=True)
for f in os.listdir(MT): shutil.copy(f'{MT}/{f}', f'{OUT}/mt/{f}')
os.makedirs(OUT + '/ngs', exist_ok=True)
for f in ('pathfinder.js', 'skills.js', 'skills.css'): shutil.copy(f'{NGS}/{f}', f'{OUT}/ngs/{f}')
shutil.move(OUT + '/mt/manifest.webmanifest', OUT + '/manifest.webmanifest')
for n in ('icon-192.png', 'apple-touch-icon.png', 'badge-96.png'): shutil.copy(MT + '/icon-192.png', f'{OUT}/icons/{n}')
for n in ('icon-512.png', 'maskable-512.png'): shutil.copy(MT + '/icon-512.png', f'{OUT}/icons/{n}')

def sub(path, pairs, rx=()):
    p = f'{OUT}/{path}'; s = open(p, encoding='utf-8').read(); o = s
    for a, b in pairs:
        if a not in s: print('  !! not found in', path, ':', a[:70])
        s = s.replace(a, b)
    for a, b in rx:
        s2 = re.sub(a, b, s, flags=re.S)
        if s2 == s: print('  !! regex no match in', path, ':', a[:70])
        s = s2
    open(p, 'w', encoding='utf-8').write(s)

# ---------- index.html ----------
TAB_PRAYER = '<a href="#prayer" data-t="prayer" class="mid" aria-label="Prayer times"><b class="av"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg></b><span>Prayer</span></a>'
PF_TILE = '''      <a class="tbt" href="#tb-pathfinder" data-kw="pathfinder career careers job gcse a level college sixth form university apprenticeship options school"><span class="ai"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="gpathf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e4f7a"/><stop offset="1" stop-color="#0c2238"/></linearGradient></defs><rect width="64" height="64" rx="15" fill="url(#gpathf)"/><circle cx="32" cy="32" r="18" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><path d="M32 10v6M32 48v6M10 32h6M48 32h6" stroke="#f8c62b" stroke-width="3" stroke-linecap="round"/><path d="M40 24l-5 12-11 4 5-12z" fill="#f8c62b"/><circle cx="32" cy="32" r="2.6" fill="#0c2238"/></svg></span><b>Pathfinder</b><small>School to a career</small></a>
      <a class="tbt" href="#tb-skills" data-kw="skills training course courses jobs apprenticeship employment free funded adult learning work"><span class="ai"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="gskillf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16a34a"/><stop offset="1" stop-color="#0e5a3c"/></linearGradient></defs><rect width="64" height="64" rx="15" fill="url(#gskillf)"/><path d="M14 26l18-9 18 9-18 9z" fill="#fff"/><path d="M22 30v9c0 3 5 6 10 6s10-3 10-6v-9" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M50 26v12" stroke="#f8c62b" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="40" r="3" fill="#f8c62b"/></svg></span><b>Skills &amp; training</b><small>Courses &amp; jobs near you</small></a>
'''
FOOT = '''<footer>
  <div class="wrap">
    <div class="fgrid">
      <div><img class="flogo" src="mt/icon-192.png" alt="MySirat" style="width:56px;height:56px;border-radius:15px"><p style="color:#9da59a;font-size:.9rem;max-width:34ch">MySirat: prayer, Quran, your masjid and your town in one app. No adverts. No data sold.</p></div>
      <div><h5>Faith</h5><a href="#prayer">Prayer times</a><a href="#toolbox">The toolkit</a><a href="#jummah">Jummah finder</a><a href="#duas">Duas</a><a href="#quran">Quran</a><a href="#seasons">Seasons</a></div>
      <div><h5>Local</h5><a href="#local">Discover</a><a href="#community">Events</a><a href="#news">News</a><a href="#help">Find help</a><a href="#give">Give</a></div>
      <div><h5>Watch</h5><a href="#watch">Watch free</a><a href="#tb-pathfinder">Pathfinder</a><a href="#tb-skills">Skills &amp; training</a><a href="#privacy">Privacy</a></div>
    </div>
    <div class="ftools"><button type="button" id="darkBtn"><svg><use href="#i-moon"/></svg><span>Dark mode</span></button><button type="button" id="ttsBtn" class="tts"><svg><use href="#i-speak"/></svg><span>Listen to this page</span></button>'''
p = f'{OUT}/index.html'; h = open(p, encoding='utf-8').read()
h = re.sub(r'<title>.*?</title>', '<title>MySirat</title>', h, 1, flags=re.S)
h = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="MySirat: prayer times, local jamaat, qibla, tasbih, duas, Quran, zakat, careers and more in one ad-free app. Designed & built by SMR Digital.">', h, 1)
h = re.sub(r'<meta name="theme-color" content="[^"]*">', '<meta name="theme-color" content="#0b3b3a">', h)
h = re.sub(r'<link rel="icon" href="[^"]*">', '<link rel="icon" href="mt/icon-192.png">', h, 1)
h = h.replace('content="Inspire FM"', 'content="MySirat"')
h = re.sub(r'<a href="#listen" data-t="listen" class="mid".*?</a>', TAB_PRAYER, h, 1, flags=re.S)
h = re.sub(r'<footer>.*?<div class="ftools">.*?(<select id="langSel")', lambda m: FOOT + m.group(1), h, 1, flags=re.S)
h = re.sub(r'<span>© <span id="yr">2026</span> Inspire FM[^<]*</span>', '<span>© <span id="yr">2026</span> MySirat</span>', h, 1)
h = re.sub(r'navigator\.serviceWorker\.register\([^)]*\)', 'Promise.resolve()', h)
# toolkit tiles: Pathfinder + Skills after the Learn tiles
k = h.find('<h3 class="tb-sec">Learn</h3>'); k2 = h.find('</div>', h.find('<div class="tb-grid">', k))
h = h[:k2] + PF_TILE + h[k2:]
# holder for the Pathfinder (moved into the tool screen when opened)
h = h.replace('<script src="pathfinder.js" defer></script>', '')
h = h.replace('</head>', '<link rel="stylesheet" href="mt/mt.css">\n</head>', 1)
h = h.replace('<script src="outings.js"></script>', '<script src="outings.js"></script>\n<div id="mtHold" hidden><div class="pth" id="pthRoot" hidden></div></div>\n<script src="ngs/pathfinder.js"></script>\n<script src="mt/mt.js"></script>', 1)
for s in ('presenters.js', 'liveroom.js', 'studio.js'): h = h.replace(f'<script src="{s}"></script>', '')
open(p, 'w', encoding='utf-8').write(h)
print('index ok', 'pthRoot' in h, 'tb-pathfinder' in h, 'data-t="prayer"' in h)

# ---------- desktop header: MySirat mark, no Listen menu, no Advertise ----------
h = re.sub(r'<img class="lt" src="img/logo\.webp"[^>]*><img class="dkl"[^>]*>', '<span class="mt-wm"><img src="mt/icon-192.png" alt="" width="40" height="40"><b>MySirat</b></span>', h, count=1)
h = re.sub(r'<div class="dd"><button type="button" aria-expanded="false">Listen<svg>.*?</div>\s*</div>', '', h, count=1, flags=re.S)
h = h.replace('<a href="#advertise">Advertise</a>', '', 1)
# ---------- desktop: same app home as phones, in a centred column ----------
def mob_rules(css):
    out = []; i = 0
    while True:
        k = css.find('@media (max-width:760px){', i)
        if k < 0: break
        j = k + len('@media (max-width:760px){'); d = 1; st = j
        while d:
            c = css[j]
            if c == '{': d += 1
            elif c == '}': d -= 1
            j += 1
        body = css[st:j - 1]; q = 0
        while q < len(body):
            o = body.find('{', q)
            if o < 0: break
            sel = body[q:o].strip(); dd = 1; e = o + 1
            while dd and e < len(body):
                if body[e] == '{': dd += 1
                elif body[e] == '}': dd -= 1
                e += 1
            if '@' not in sel and re.search(r'(\.ah\b|\.ah-|#ah[A-Z]|\.fbw)', sel) and not re.search(r'tabbar|pill2|\.hdr|hero', sel): out.append(sel + body[o:e])
            q = e
        i = j
    return out
blk = mob_rules(h)
desk = '@media (min-width:761px){\n' + '\n'.join(blk) + '\n.ah{max-width:560px;margin:24px auto 40px;border-radius:28px!important}\n}\n'
h = h.replace('<link rel="stylesheet" href="mt/mt.css">', '<style id="mtDeskHome">' + desk + '</style>\n<link rel="stylesheet" href="mt/mt.css">', 1)
open(p_idx := f'{OUT}/index.html', 'w', encoding='utf-8').write(h)
print('desk rules', len(blk))
# ---------- watch.js: no Inspire FM channel, playlists or wording ----------
sub('watch.js', [
  ("['inspire', 'Inspire FM podcast'], ", "['dawah', 'Dawah'], "),
  ("['inspire', 'Inspire FM podcast', 'Shows, interviews & appeals'], ", ''),
  ("Put together by the Inspire FM team", 'Put together by the MySirat team'),
  ("on the Inspire FM app", 'on MySirat'),
  ("['kids', 'Kids learning', 'Cartoons, songs and stories'],", "['dawah', 'Dawah & good watches', 'Islam explained, revert stories, reminders'], ['kids', 'Kids learning', 'Cartoons, songs and stories'],"),
], rx=[
  (r"\n  \{ k: 'inspire'.*?(?=\n  \{ k: 'omarhana')", ''),
  (r"\n  \{ n: 'Best of Inspire FM'[^\n]*", ''),
  (r"'EBFIUf8ZmdU'\]\.map", "'XCN6O7QibMM'].map"),
  (r"return `<a class=\"wc-card\"", 'return ""; `<a class="wc-card"'),
])
DAWAH = '''
  { k: 'eternity', n: 'Towards Eternity', by: 'Towards Eternity', c: 'dawah', yt: '', handle: '@TowardsEternity', age: 'Teens & adults', d: 'Revert stories and Islam explained clearly, in more than 10 languages.', g: ['#38bdf8', '#0c4a6e'], m: 'moon',
    v: [['XCN6O7QibMM', 'Portuguese church student becomes Muslim'], ['3W0973c6Z_s', '"I cried when the adhan was called": a revert story']] },
  { k: 'yqrem', n: 'Daily Reminders', by: 'Yaqeen Institute', c: 'dawah', yt: '', handle: '@YaqeenInstitute', age: 'Teens & adults', d: 'Short, sincere reminders and lectures on faith, worship and doubt.', g: ['#fcd34d', '#78350f'], m: 'heart',
    v: [['dXyKSnpzz8E', 'The Days of Allah'], ['d-jT7hkoHtM', 'Loving the world too much'], ['JH-9I4aiDgk', 'Allah provides for you'], ['fObB8rOAKN0', 'The scholar who pretended he could not hear'], ['aet-5Qurdog', 'To kill or be killed by a prophet'], ['_C5ox2zZl0U', 'Atheism: doubting your doubts'], ['5OpWnUeYTy4', 'Freeing yourself from other than Allah'], ['Tn0cK99H50Y', 'Khatm al-Quran du\\'a 2026']] },
  { k: 'hijab', n: 'Mohammed Hijab', by: 'Mohammed Hijab', c: 'dawah', yt: '', handle: '@MohammedHijab', age: 'Adults', d: 'Debates and talks making the case for Islam.', g: ['#a3a3a3', '#171717'], m: 'mic',
    v: [['3k6MBedWTww', 'Full debate: Tawheed vs Trinity']] },'''
p2 = f'{OUT}/watch.js'; w = open(p2, encoding='utf-8').read(); k = w.find("\n  { k: 'omarhana'"); w = w[:k] + DAWAH + w[k:]; open(p2, 'w', encoding='utf-8').write(w)
# ---------- app.js: Prayer tab ----------
sub('app.js', [("prayer: 'toolbox'", "prayer: 'prayer', adhan: 'prayer'")])
# ---------- desk.js: toolkit groups ----------
sub('desk.js', [("['learn', 'Learn', '#1d4ed8', '#93c5fd', ['salah', 'dress', 'kids', 'watch']],",
                 "['learn', 'Learn', '#1d4ed8', '#93c5fd', ['salah', 'dress', 'kids', 'watch']], ['future', 'Future and careers', '#12324f', '#f8c62b', ['pathfinder', 'skills']],"),
                ("'Masjid and Luton'", "'Masjid and local'")])
# ---------- Pathfinder share line ----------
sub('ngs/pathfinder.js', [("<small><b>NGS</b> Student</small>", "<small>Student</small>"), ('<h1 class="pth-vh">NGS Student Pathfinder</h1>', '<h1 class="pth-vh">Student Pathfinder</h1>'), ("Made with Pathfinder on the NGS app: https://nextgenerationscheme.co.uk/pathfinder", 'Made with Pathfinder on MySirat')])
# ---------- service worker off everywhere ----------
for f in os.listdir(OUT):
    if f.endswith('.js'):
        s = open(f'{OUT}/{f}', encoding='utf-8').read(); s2 = re.sub(r'navigator\.serviceWorker\.register\([^)]*\)', 'Promise.resolve()', s)
        if s2 != s: open(f'{OUT}/{f}', 'w', encoding='utf-8').write(s2)
# ---------- MySirat palette: black, charcoal and the stone grey of the logo ----------
PAL = [('#8cc63f', '#a8a49d'), ('#6fa82a', '#7f7b75'), ('#4c7d16', '#55524e'), ('#eef7e1', '#efeeeb'), ('#9fd36a', '#cfccc6'), ('#0d1a05', '#0b0b0c'), ('#1c2a10', '#1a1918'), ('#0f1c18', '#121212'), ('#1b2f28', '#252422'), ('#0c1714', '#0b0b0b'), ('140,198,63', '168,164,157'), ('140, 198, 63', '168, 164, 157'), ('#5aa02c', '#82807b'), ('#a6dc55', '#c0beb9'), ('#5c9a1f', '#7d7b76'), ('#a6d65a', '#bdbbb6'), ('#2f8a1e', '#66645f'), ('#6fae26', '#908e89'), ('#3d6a12', '#56544f'), ('#9be15d', '#c1bfba'), ('#9fdc4f', '#bebcb7'), ('#b6e57a', '#cfcdc8'), ('#b9e27f', '#ceccc7'), ('#5e9b1f', '#7f7d78'), ('#4d8a17', '#6f6d68'), ('#a8d95c', '#c0beb9'), ('#3f7a14', '#615f5a'), ('#2f5a10', '#484641'), ('#2d5a12', '#484641'), ('#3f7d1f', '#64625d'), ('#2f7d1a', '#5e5c57'), ('#2f5f12', '#4c4a45'), ('#0e1a02', '#171510'), ('111,174,38', '127,123,117')]
for root, _, fs in os.walk(OUT):
    rel = os.path.relpath(root, OUT)
    if rel.split(os.sep)[0] in ('ngs', 'mt'): continue
    for f in fs:
        if not f.endswith(('.js', '.html', '.css')): continue
        q = os.path.join(root, f); t = open(q, encoding='utf-8').read(); o = t
        for a, b in PAL: t = t.replace(a, b).replace(a.upper(), b)
        if t != o: open(q, 'w', encoding='utf-8').write(t)
# ---------- sleeker type: Manrope + Inter, no heavy weights ----------
FONT_OLD = 'https://fonts.googleapis.com/css2?family=Saira:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Amiri:wght@400;700&display=swap'
FONT_NEW = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Amiri:wght@400;700&display=swap'
for root, _, fs in os.walk(OUT):
    if os.path.relpath(root, OUT).split(os.sep)[0] in ('ngs', 'mt'): continue
    for f in fs:
        if not f.endswith(('.js', '.html', '.css')): continue
        q = os.path.join(root, f); t = open(q, encoding='utf-8').read(); o = t
        t = t.replace(FONT_OLD, FONT_NEW).replace('"Saira",system-ui', '"Manrope",system-ui').replace('"DM Sans",system-ui', '"Inter",system-ui')
        t = re.sub(r'font-weight:\s*(800|900)', 'font-weight:600', t); t = re.sub(r'font-weight:\s*700', 'font-weight:600', t)
        t = re.sub(r'font:\s*(700|800|900) ', 'font:600 ', t)
        if t != o: open(q, 'w', encoding='utf-8').write(t)
print('done')
