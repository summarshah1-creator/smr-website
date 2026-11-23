import json
R = "/mnt/user-data/outputs/artifacts/577d069f-3f56-4a0c-83d9-129dd1c06dc4/project"

def mark(px, uid):
    return (f'<svg class="mark" aria-label="Muslim Toolkit icon" width="{px}" height="{px}" viewBox="0 0 512 512">'
            f'<defs><linearGradient id="g{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17936A"/><stop offset="1" stop-color="#0B5A41"/></linearGradient></defs>'
            f'<rect width="512" height="512" rx="116" fill="url(#g{uid})"/>'
            '<g transform="translate(256 256)" fill="none" stroke="#F2C35B" stroke-width="22" stroke-linejoin="round"><rect x="-130" y="-130" width="260" height="260" rx="34"/><rect x="-130" y="-130" width="260" height="260" rx="34" transform="rotate(45)"/></g>'
            '<g fill="#FBF6EC"><rect x="206" y="206" width="42" height="42" rx="12"/><rect x="264" y="206" width="42" height="42" rx="21"/><rect x="206" y="264" width="42" height="42" rx="21"/><rect x="264" y="264" width="42" height="42" rx="12"/></g></svg>')

def brand(uid, dark=True):
    return f'<div class="brand">{mark(52, uid)}<span>Muslim <b>Toolkit</b></span></div>'

def ic(d, label, size=44, color="currentColor", sw=1.8):
    return f'<svg class="ic" aria-label="{label}" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{d}</svg>'

D = {
 "ad": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15l2.2-6h.6L12 15M7.8 13h3.4M14.5 9h1.8a2.5 3 0 0 1 0 6h-1.8z"/>',
 "star": '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
 "play": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9.5v5l4.5-2.5z"/>',
 "kaaba": '<path d="M4 8l8-4 8 4v10l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v10M4 11.5l8 4 8-4"/>',
 "mega": '<path d="M3 10v4h3l7 4V6L6 10z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
 "data": '<ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6M5 11.5v6c0 1.4 3.1 2.5 7 2.5"/><path d="M19 15.5a2.5 2.5 0 0 0-5 0c0 2 2.5 4.5 2.5 4.5s2.5-2.5 2.5-4.5z"/>',
 "pin": '<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
 "missile": '<path d="M14.5 3.5c2.5-.6 5-.5 6 0 .5 1 .6 3.5 0 6l-8.5 8.5-6-6z"/><path d="M6 12l-3 1 2.5 2.5M12 18l-1 3-2.5-2.5M5.5 18.5l-2 2"/><circle cx="16" cy="8" r="1.3"/>',
 "jet": '<path d="M12 2.5c1 0 1.5 1.5 1.5 3.5v4l7.5 4.5v2l-7.5-2v4l2.5 2v1.5L12 21l-4 1v-1.5l2.5-2v-4L3 16.5v-2L10.5 10V6c0-2 .5-3.5 1.5-3.5z"/>',
 "drone": '<circle cx="5.5" cy="5.5" r="2.5"/><circle cx="18.5" cy="5.5" r="2.5"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M7.3 7.3l2.7 2.7M16.7 7.3L14 10M7.3 16.7l2.7-2.7M16.7 16.7L14 14"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>',
 "bank": '<path d="M3 9l9-5 9 5z"/><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20.5h18"/>',
 "houses": '<path d="M2 20h20M3 20v-6l4-3.5 4 3.5v6M13 20v-8l4.5-4 4.5 4v8"/><path d="M6 20v-3h2v3M16 13h3M16 16h3"/><path d="M2 20l5-11 4 4 4-8 7 15" opacity=".35"/>',
 "phone": '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
 "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 "lock": '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 "compass": '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
 "book": '<path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6zM12 6v14.5"/>',
 "people": '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M10.5 20a5.5 5.5 0 0 1 11 0"/>',
 "mosque": '<path d="M4 21V12a8 5 0 0 1 16 0v9M2 21h20M12 3v3M9 21v-4a3 3 0 0 1 6 0v4"/>',
 "radio": '<rect x="3" y="9" width="18" height="11" rx="2"/><circle cx="15.5" cy="14.5" r="2.5"/><path d="M6 13h4M6 16h4M7 9l10-5"/>',
 "heart": '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>',
 "cal": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M15.5 13.5a2.5 2.5 0 1 0 0 4 3 3 0 0 1 0-4z"/>',
 "calc": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h3.5"/>',
}

# ---------------- CSS ----------------
css = """:root{--night:#0E1C17;--night2:#16291F;--cream:#F7F2E8;--ink:#13201B;--muted:#4F5A54;--gold:#F2C35B;--emerald:#12805C;--emeraldD:#0B5A41;--red:#F0604A;--redD:#4A1A13;--soft:#A9B8AF}
section{font-family:Inter,sans-serif;background:var(--night);color:var(--cream);padding:136px 128px 150px;box-sizing:border-box;display:flex;flex-direction:column;gap:28px}
section.cream{background:var(--cream);color:var(--ink)}
.brand{position:absolute;left:128px;top:48px;display:flex;align-items:center;gap:14px;font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:30px;font-weight:500;letter-spacing:-.01em}
.brand b{font-weight:800;color:var(--gold)}
section.cream .brand b{color:var(--emerald)}
.pg{position:absolute;right:128px;top:62px;margin:0;font-size:24px;font-weight:700;letter-spacing:.14em;color:var(--soft)}
section.cream .pg{color:var(--muted)}
.disp{margin:0;font-family:"Bricolage Grotesque",Inter,sans-serif;font-weight:800;letter-spacing:-.03em;line-height:.95}
.gold{color:var(--gold)}
.red{color:var(--red)}
.em{color:var(--emerald)}
.foot{position:absolute;left:128px;bottom:56px;width:1664px;margin:0;font-size:24px;line-height:1.3;color:var(--soft)}
section.cream .foot{color:var(--muted)}
/* slide 1 */
.s1-left{width:930px;display:flex;flex-direction:column;gap:26px}
.s1-h{font-size:104px}
.s1-sub{font-size:58px;font-weight:700;margin-top:-6px}
.stat{display:flex;align-items:baseline;gap:20px;margin-top:6px}
.stat .num{font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:110px;font-weight:800;letter-spacing:-.04em;color:var(--gold);line-height:1}
.stat p{margin:0;font-size:30px;line-height:1.3;max-width:520px}
.pains{display:flex;flex-direction:column;gap:14px;margin-top:4px}
.pains p{margin:0;display:flex;align-items:center;gap:18px;font-size:30px;line-height:1.25}
.pains .ic{flex:none;color:var(--red)}
.phone{position:absolute;width:280px;height:600px;object-fit:cover;object-position:top;border-radius:40px;border:8px solid #2B3B33;background:#000;box-shadow:0 30px 60px rgba(0,0,0,.45)}
.ph1{left:1100px;top:240px;transform:rotate(-8deg)}
.ph2{left:1310px;top:200px;transform:rotate(1deg);z-index:2}
.ph3{left:1520px;top:250px;transform:rotate(9deg)}
.tag{position:absolute;left:1170px;top:900px;width:640px;margin:0;font-size:24px;color:var(--soft);text-align:center}
.burst{position:absolute;left:1600px;top:150px;z-index:3;width:210px;padding:16px 10px;background:var(--red);color:#fff;border-radius:999px;transform:rotate(10deg);text-align:center;font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:30px;font-weight:800;line-height:1}
/* slide 2 */
.s2-h{font-size:80px}
.flow{display:flex;gap:28px;align-items:stretch}
.col{display:flex;flex-direction:column;gap:12px}
.lab{margin:0;font-size:24px;font-weight:800;letter-spacing:.14em;color:var(--soft)}
.give{width:430px}
.give p{margin:0;display:flex;align-items:center;gap:14px;font-size:27px;line-height:1.15}
.give .ic{flex:none;color:var(--gold)}
.give small{display:block;font-size:24px;color:var(--soft);margin-top:2px}
.go{align-self:center;font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:72px;font-weight:800;color:var(--gold);line-height:1}
.chain{width:430px;gap:8px}
.lk{display:flex;align-items:center;gap:16px;font-size:24px;line-height:1.2;color:var(--soft)}
.lk .pl{flex:none;width:170px;height:58px;box-sizing:border-box;padding:8px 12px;background:#FBF8F1;border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:"Bricolage Grotesque",Inter,sans-serif;font-weight:800;font-size:26px;color:var(--ink)}
.lk .pl img{max-width:146px;height:40px;object-fit:contain}
.lk b{color:var(--cream);font-weight:700}
.dn{margin:0 0 0 72px;font-size:24px;line-height:1;color:var(--gold)}
.backs{flex:1;gap:18px}
.hit{padding:16px 22px;border-radius:20px;display:flex;flex-direction:column;gap:10px}
.hit.w{background:var(--redD);border:3px solid var(--red)}
.hit.s{background:#3B2F12;border:3px solid var(--gold)}
.hit .row{display:flex;align-items:center;gap:12px}
.hit.w .ic{color:var(--red)}
.hit.s .ic{color:var(--gold)}
.hit h3{margin:0;font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:36px;font-weight:800;line-height:1.05}
.hit p{margin:0;font-size:24px;line-height:1.3;color:#EDE3D6}
.flag{margin-left:auto}
.datastrip{display:flex;align-items:center;gap:26px;padding:18px 28px;background:var(--gold);color:var(--ink);border-radius:20px}
.datastrip .ic{flex:none;color:var(--ink)}
.datastrip h3{margin:0;font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:40px;font-weight:800;white-space:nowrap}
.datastrip p{margin:0;font-size:26px;line-height:1.3}
/* slide 3 */
.s3{display:flex;gap:72px;flex:1}
.hero3{width:560px;display:flex;flex-direction:column;gap:36px;justify-content:center}
.hero3 .mark{filter:drop-shadow(0 18px 30px rgba(11,90,65,.3))}
.s3-h{font-size:104px;color:var(--ink)}
.s3-h b{color:var(--emerald)}
.s3-sub{margin:0;font-size:42px;line-height:1.25;font-weight:500}
.groups{flex:1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:48px;row-gap:28px;align-content:start}
.grp{display:flex;gap:18px;align-items:flex-start}
.dot{flex:none;width:64px;height:64px;border-radius:20px;display:flex;align-items:center;justify-content:center;background:var(--emerald);color:#fff}
.dot.g{background:var(--gold);color:var(--ink)}
.grp h3{margin:0 0 4px;font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:34px;font-weight:800;line-height:1.05}
.grp p{margin:0;font-size:24px;line-height:1.35;color:var(--muted)}
.promise{display:flex;gap:40px;align-items:center;justify-content:space-between;padding:22px 32px;background:var(--emeraldD);color:#fff;border-radius:22px;font-family:"Bricolage Grotesque",Inter,sans-serif;font-size:36px;font-weight:700}
.promise span{display:flex;align-items:center;gap:12px}
.promise .ic{color:var(--gold)}
@keyframes rise{from{opacity:0;transform:translateY(26px)}}
@keyframes pop{from{opacity:0;transform:scale(.6) rotate(10deg)}}
.pains p,.give p,.lk,.hit,.grp,.datastrip{animation:rise .5s ease-out both}
.pains p:nth-child(2),.give p:nth-child(3),.grp:nth-child(2){animation-delay:.1s}
.pains p:nth-child(3),.give p:nth-child(4),.grp:nth-child(3){animation-delay:.2s}
.give p:nth-child(5),.grp:nth-child(4){animation-delay:.3s}
.give p:nth-child(6),.grp:nth-child(5),.hit{animation-delay:.4s}
.grp:nth-child(6){animation-delay:.5s}
.datastrip{animation-delay:.7s}
.burst{animation:pop .45s .5s ease-out both}
"""
open(f"{R}/deck.css", "w").write(css)

FLAG = '<svg class="flag" aria-label="Israeli flag" width="46" height="32" viewBox="0 0 20 14"><rect width="20" height="14" fill="#fff"/><rect y="1.6" width="20" height="1.8" fill="#0038b8"/><rect y="10.6" width="20" height="1.8" fill="#0038b8"/><path d="M10 4.2 L12.4 8.4 L7.6 8.4 Z M10 9.8 L7.6 5.6 L12.4 5.6 Z" fill="none" stroke="#0038b8" stroke-width="0.8"/></svg>'

# ---------------- slide 1 ----------------
s1 = f'''<section id="problem" data-transition="fade">
{brand(1)}
<p class="pg">01 · THE PROBLEM</p>
<div class="s1-left">
<h1 class="disp s1-h">The prayer window is closing.</h1>
<p class="disp s1-sub gold">First, watch the adverts.</p>
<div class="stat"><span class="num">190M+</span><p>downloads of Muslim Pro. Unless you pay for Premium, you get the wall of ads.</p></div>
<div class="pains">
<p>{ic(D["ad"],"Advert icon",46)}Ads on opening, then ad after ad, often back-to-back</p>
<p>{ic(D["compass"],"Qibla icon",46)}Need the Qibla or a time? The adverts come first</p>
<p>{ic(D["lock"],"Paywall icon",46)}Pay for Premium just to make them stop</p>
</div>
</div>
<img class="phone ph1" src="/_blob/7e56b3914ca6eed4158f2edc54b20216" alt="Screenshot: Joybuy video advert">
<img class="phone ph2" src="/_blob/c9b45a457dcf0164bbaf4006e6ea0f3d" alt="Screenshot: LiberNovo advert, ad 1 of 2">
<img class="phone ph3" src="/_blob/94fc2d5a4ad9db0120ab52629aeba877" alt="Screenshot: Sihoo advert, ad 2 of 2">
<p class="burst">Ad 1 of 2…<br>Ad 2 of 2…</p>
<p class="tag">Real adverts, screenshotted back-to-back, Nov 2026</p>
<p class="foot">Downloads: Muslim Pro press release, Aug 2026.</p>
<aside>Open on the moment everyone knows: the prayer window is closing, you open the app for the time or the Qibla, and you get adverts first. Point to "Ad 1 of 2, Ad 2 of 2" on the screenshots.</aside>
</section>
'''

# ---------------- slide 2 ----------------
s2 = f'''<section id="money" data-transition="fade">
{brand(2)}
<p class="pg">02 · WHERE IT GOES</p>
<h2 class="disp s2-h">Our money builds value <span class="gold">up this chain.</span></h2>
<div class="flow">
<div class="col give">
<p class="lab">WHAT WE GIVE</p>
<p>{ic(D["ad"],"Ads icon",40)}<span>Ad views<small>back-to-back, every day</small></span></p>
<p>{ic(D["star"],"Premium icon",40)}<span>Premium subscriptions</span></p>
<p>{ic(D["play"],"Qalbox icon",40)}<span>Qalbox streaming</span></p>
<p>{ic(D["kaaba"],"Umrah icon",40)}<span>Umrah packages &amp; financing<small>partner terms undisclosed</small></span></p>
<p>{ic(D["mega"],"Promotions icon",40)}<span>Sponsored &amp; promoted offers</span></p>
</div>
<p class="go">→</p>
<div class="col chain">
<p class="lab">WHO IT BUILDS VALUE FOR</p>
<div class="lk"><span class="pl">Muslim Pro</span><span><b>The app</b><br>run by Bitsmedia</span></div>
<p class="dn">▼ investor since 2017</p>
<div class="lk"><span class="pl"><img src="/_blob/b32e3e7ca4aef92d9d22110aeea0663b" alt="Bintang logo"></span><span><b>Bintang</b></span></div>
<p class="dn">▼ controlled by</p>
<div class="lk"><span class="pl"><img src="/_blob/901bba8dd2e68b2a51569d4d0520a3f9" alt="AHAM Capital logo"></span><span><b>AHAM Capital</b></span></div>
<p class="dn">▼ 97.7% owned by</p>
<div class="lk"><span class="pl"><img src="/_blob/9bb5e0cbb58c4090f114019fba81ee69" alt="Amova logo"></span><span><b>Amova</b><br>part of SuMi Trust</span></div>
</div>
<p class="go">→</p>
<div class="col backs">
<p class="lab">WHAT THE GROUP ALSO BACKS</p>
<div class="hit w"><div class="row">{ic(D["missile"],"Missile icon",56)}{ic(D["jet"],"Fighter jet icon",56)}{ic(D["drone"],"Drone icon",56)}{FLAG}</div><h3>Elbit Systems</h3><p>Israeli weapons maker. Amova&#39;s US arm and parent group report holding its shares.</p></div>
<div class="hit s"><div class="row">{ic(D["bank"],"Bank icon",56)}{ic(D["houses"],"Settlement housing icon",56)}{FLAG}</div><h3>Settlement-listed firms</h3><p>Leumi · Hapoalim · Bezeq · Ashtrom. On the UN settlements list, in a fund Amova sells.</p></div>
</div>
</div>
<div class="datastrip">{ic(D["data"],"Data icon",64,sw=1.7)}<h3>Our data, too.</h3><p>In 2020 Muslim Pro sent users&#39; location data to X-Mode, a broker selling data on to US military contractors. It cut ties once Vice exposed it.</p></div>
<p class="foot">Documented links (Bursa Malaysia, SEC, UN OHCHR, Vice 2020). Not a claim that app revenue is paid directly to these companies.</p>
<aside>Walk left to right: what we give, who it builds value for, what that same group also backs. Then the data story: historical, but it shows how users were treated as a product.</aside>
</section>
'''

# ---------------- slide 3 ----------------
groups = [
 ("compass", "Every day", "Prayer times and adhan alerts, Qibla, prayer tracker, tasbih, Quran, and Ayah a Day with streaks and friend challenges", ""),
 ("heart", "Guidance &amp; help", "&ldquo;How I feel&rdquo;: ayat, duas and sunnah for any feeling, plus help in Luton. All 267 Hisn al-Muslim duas, really recited", "g"),
 ("mosque", "Masjid &amp; community", "Live jamaat for Luton masjids, Jummah finder, janazah notices, noticeboard, halal business directory", ""),
 ("cal", "Calendar", "Hijri dates with white days, Ramadan suhur and iftar countdown, the blessed months", "g"),
 ("calc", "Money", "&ldquo;Is it halal?&rdquo; checker, halal share screen, zakat, purification and inheritance calculators", ""),
 ("book", "Learn &amp; watch", "Learn to pray with hands-free Pray Along, Quran stories, Hajj &amp; Umrah guide, kids&#39; corner, Islamic videos", "g"),
]
g_html = "".join(f'<div class="grp"><span class="dot {c}">{ic(D[k], t + " icon", 36, sw=2)}</span><div><h3>{t}</h3><p>{d}</p></div></div>' for k, t, d, c in groups)
s3 = f'''<section id="need" class="cream">
{brand(3)}
<p class="pg">03 · THE ALTERNATIVE</p>
<div class="s3">
<div class="hero3">
{mark(176, 9)}
<p class="s3-sub"><b class="em">25+ tools</b> for everyday deen, all in one app. Built in Luton, owned by the community, with nothing standing between you and your salah.</p>
</div>
<div class="groups">{g_html}</div>
</div>
<div class="promise"><span>{ic(D["lock"],"Free icon",40,sw=2)}Essentials free forever</span><span>{ic(D["people"],"Community icon",40,sw=2)}Community-owned</span><span>{ic(D["radio"],"Radio icon",40,sw=2)}With Inspire FM radio</span></div>
<aside>Close on the alternative: everything Muslim Pro does, plus the daily support and the local layer it can't offer, with essentials always free and ownership the community can trust.</aside>
</section>
'''
for n, s in [("problem", s1), ("money", s2), ("need", s3)]:
    open(f"{R}/slides/{n}.html", "w").write(s)

d = json.load(open(f"{R}/deck.json"))
d["title"] = "Muslim Toolkit: why we need it"
d["faces"] = {"bricolage-grotesque": {"family": "Bricolage Grotesque", "href": "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap"},
              "inter": {"family": "Inter", "href": "https://fonts.googleapis.com/css2?family=Inter:wght@400..800&display=swap"}}
json.dump(d, open(f"{R}/deck.json", "w"))
print("ok")
