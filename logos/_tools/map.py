import json
# slug: (category, name, aliases, [(raw file, variant), ...], note)
# Variants: logo = full colour main logo · logo-white = version for dark backgrounds · icon = symbol only
#           crest/lockup/wordmark/tagline = other official arrangements · two-tone etc. as named
M = {
# ---------- mosques & Islamic centres (latest set: Jummah Winter Campaign) ----------
'akbaria':        ('mosques','Akbaria Mosque',[],[('winter/akbaria.svg','logo')]),
'al-bilal':       ('mosques','Al-Bilal Mosque',[],[('winter/al-bilal.svg','logo')]),
'al-furqan':      ('mosques','Al-Furqan Mosque',[],[('winter/al-furqan.svg','logo')]),
'al-hira':        ('mosques','Al-Hira Educational & Cultural Centre',[],[('winter/al-hira.svg','logo')]),
'al-huda':        ('mosques','Al-Huda Mosque',[],[('winter/al-huda.svg','logo')]),
'al-jalal':       ('mosques','Al-Jalal Mosque',[],[('winter/al-jalal.svg','logo')]),
'as-sunnah':      ('mosques','As-Sunnah Mosque',[],[('winter/as-sunnah.svg','logo')]),
'bait-ul-abraar': ('mosques','Jamiatul Uloom Al Islamia (Bait-ul-Abraar)',['Jamiatul Uloom'],[('winter/bait-ul-abraar.png','logo')]),
'bpjm':           ('mosques','Bury Park Jamia Masjid (BPJM)',['BPJM'],[('winter/bpjm.svg','logo'),('winter/bpjm-hd.png','logo')]),
'bury-park-jamia':('mosques','Bury Park Jamia Masjid (Arabic lockup)',[],[('winter/bury-park-jamia.png','logo')]),
'bushmead':       ('mosques','Bushmead Masjid',[],[('winter/bushmead.svg','logo')]),
'dallow-centre':  ('mosques','Dallow Centre',[],[('winter/dallow-centre.svg','logo')]),
'dunstable-masjid':('mosques','Dunstable Masjid',[],[('winter/dunstable-masjid.png','logo')]),
'faizan-e-mushkil-kusha':('mosques','Faizan-e-Mushkil Kusha',[],[('winter/faizan-e-mushkil-kusha.png','logo')]),
'farley-hill-cc': ('mosques','Farley Hill Community Centre',[],[('winter/farley-hill-cc.svg','logo')]),
'farley-hill-masjid':('mosques','Farley Hill Masjid',[],[('winter/farley-hill-masjid.svg','logo')]),
'ghosia-trust':   ('mosques','Ghosia Trust',[],[('winter/ghosia-trust.svg','logo')]),
'hockwell-ring':  ('mosques','Hockwell Ring Masjid (HRM)',['HRM'],[('winter/hockwell-ring.png','logo')]),
'ibrahim':        ('mosques','Masjid Ibrahim',[],[('winter/ibrahim.png','logo')]),
'irshad':         ('mosques','Irshad Trust',[],[('winter/irshad.svg','logo')]),
'jalalabad':      ('mosques','Jalalabad Masjid & Islamic Centre',[],[('winter/jalalabad.png','logo')]),
'keech-hospice':  ('mosques','Keech Hospice (Jummah venue)',[],[('winter/keech-hospice.svg','logo')]),
'kokni':          ('mosques','Kokni Muslim Welfare',[],[('winter/kokni.svg','logo')]),
'leagrave-hall':  ('mosques','Leagrave Hall Masjid',[],[('winter/leagrave-hall.png','logo')]),
'lewsey-cc':      ('mosques','Lewsey Community Centre',[],[('winter/lewsey-cc.svg','logo')]),
'lucas-gardens':  ('mosques','Lucas Gardens',[],[('winter/lucas-gardens.svg','logo')]),
'luton-central':  ('mosques','Luton Central Mosque',[],[('winter/luton-central.svg','logo')]),
'luton-islamic-centre':('mosques','Luton Islamic Centre',[],[('winter/luton-islamic-centre.svg','logo')]),
'madinah':        ('mosques','Madinah Masjid',[],[('winter/madinah.svg','logo'),('let/madinah-mark.png','icon'),('let/madinah-mark-white.png','icon-white')]),
'masjid-e-ali':   ('mosques','Masjid-e-Ali',[],[('winter/masjid-e-ali.svg','logo')]),
'masjid-e-noor':  ('mosques','Masjid Noor',[],[('winter/masjid-e-noor.png','logo')]),
'raynham-way-cc': ('mosques','Raynham Way Community Centre',[],[('winter/raynham-way-cc.svg','logo')]),
'saints-area':    ('mosques','Saints Area Masjid',[],[('winter/saints-area.svg','logo')]),
'shah-jalal':     ('mosques','Shah Jalal Islamic Foundation',[],[('winter/shah-jalal.png','logo')]),
'suffa-tul-islam':('mosques','Suffa Tul Islam Luton',[],[('winter/suffa-tul-islam.png','logo')]),
'turkish-ca':     ('mosques','Luton Turkish Cultural Association (LTCA)',['LTCA'],[('winter/turkish-ca.png','logo')]),
'venue-central':  ('mosques','Venue Central',[],[('winter/venue-central.svg','logo')]),
'yusuf-hall':     ('mosques','Yusuf Hall, Sundon Park',[],[('winter/yusuf-hall.png','logo')]),
'zakariya':       ('mosques','Zakariya Masjid',[],[('winter/zakariya.svg','logo')]),
'zuhri-academy':  ('mosques','Zuhri Academy',[],[('winter/zuhri-academy.svg','logo')]),
# ---------- schools & colleges ----------
'icknield':       ('schools','Icknield High School',['Icknield'],[('inline/icknield.svg','logo'),('let/icknield.png','icon')]),
'chiltern-academy':('schools','Chiltern Academy',[],[('chiltern/chiltern-lockup.svg','logo'),('chiltern/chiltern-lockup-2400.png','logo'),('chiltern/chiltern-lockup-white.svg','logo-white'),('chiltern/chiltern-crest.svg','crest'),('chiltern/chiltern-crest-1600.png','crest')]),
'chiltern-learning-trust':('schools','Chiltern Learning Trust',['CLT'],[('ngs/chiltern-trust.webp','logo'),('ngs/chiltern-trust-light.webp','logo-white'),('let/chiltern-tree.png','icon')]),
'farley-junior':  ('schools','Farley Junior Academy',['Farley'],[('inline/farley-badge.png','logo'),('inline/farley-tagline.png','tagline')]),
'norton-road':    ('schools','Norton Road Primary School',[],[('inline/norton-road-mark.webp','logo-compact'),('inline/norton-road-wordmark.webp','wordmark'),('inline/norton-road-intro.webp','logo')]),
'luton-sixth-form':('schools','Luton Sixth Form College',['LSFC'],[('inline/lsfc-logo.webp','logo'),('inline/lsfc-logo-dark.webp','logo-white'),('let/luton-sixth-form.png','icon')]),
'barnfield-college':('schools','Barnfield College',[],[('ngs/barnfield-college.webp','logo'),('ngs/barnfield-college-light.webp','logo-white'),('let/barnfield.png','icon')]),
'cardinal-newman':('schools','Cardinal Newman Catholic School',[],[('let/cardinal-newman.png','icon')]),
'chalk-hills':    ('schools','Chalk Hills Academy',[],[('let/chalk-hills.png','icon')]),
'challney-boys':  ('schools','Challney High School for Boys',[],[('let/challney-boys.png','icon')]),
'challney-girls': ('schools','Challney High School for Girls',[],[('let/challney-girls.png','icon')]),
'chantry':        ('schools','Chantry Primary Academy',[],[('let/chantry.png','icon')]),
'dallow':         ('schools','Dallow Primary School',[],[('let/dallow.png','icon')]),
'denbigh':        ('schools','Denbigh High School',[],[('let/denbigh.png','icon')]),
'downside':       ('schools','Downside Primary School (DPS)',['DPS'],[('let/downside.png','icon')]),
'hillborough':    ('schools','Hillborough Junior School',[],[('let/hillborough.png','icon')]),
'lea-manor':      ('schools','Lea Manor High School',[],[('let/lea-manor.png','icon')]),
'lealands':       ('schools','Lealands High School',[],[('let/lealands.png','icon')]),
'putteridge':     ('schools','Putteridge High School',[],[('let/putteridge.png','icon')]),
'qes':            ('schools',"Queen Elizabeth School (QES)",['QES'],[('let/qes.png','icon')]),
'stockwood-park': ('schools','The Stockwood Park Academy',[],[('let/stockwood-park.png','icon')]),
'stopsley':       ('schools','Stopsley High School (SHS)',['SHS'],[('let/stopsley.png','icon')]),
'wigmore':        ('schools','Wigmore Primary School',[],[('let/wigmore.png','icon')]),
'woodlands':      ('schools','Woodlands Secondary School',[],[('let/woodlands.png','icon')]),
'active-support': ('schools','Active Support Education Centre',['ASEC'],[('asec/asec-mark.svg','logo'),('asec/asec-mark-on-dark.svg','logo-white'),('asec/asec-mark-white.svg','mono-white')]),
# ---------- charities & community organisations ----------
'ngs':            ('charities','NGS Youth & Community (Next Generation Scheme)',['NGS','Next Generation Scheme'],[('ngs/ngs.svg','logo'),('ngs/ngs-light.webp','logo-white')]),
'raise-up':       ('charities','The Raise Up Foundation',['Raise Up'],[('raiseup/raise-up.svg','logo'),('raiseup/raise-up-white.svg','logo-white'),('raiseup/raise-up-mark.webp','icon')]),
'courtney-foundation':('charities','The Courtney Foundation',['Courtney Foundation','cf'],[('courtney/courtney-mark.webp','app-icon')]),
'luton-foodbank': ('charities','Luton Foodbank',['foodbank'],[('winter/foodbank.svg','logo'),('winter/foodbank.png','logo'),('winter/foodbank-white.svg','logo-white'),('winter/foodbank-white.png','logo-white'),('ngs/luton-foodbank.webp','logo-tagline')]),
'human-appeal':   ('charities','Human Appeal',[],[('winter/human-appeal.svg','logo'),('winter/human-appeal.png','logo'),('winter/human-appeal-white.svg','logo-white'),('winter/human-appeal-white.png','logo-white')]),
'sunnah-charity': ('charities','Sunnah (charity that never ends)',['Sunnah'],[('let/sunnah-charity.png','logo')]),
'blcf':           ('charities','Bedfordshire & Luton Community Foundation',['BLCF'],[('courtney/blcf.webp','logo')]),
'comic-relief':   ('charities','Comic Relief',[],[('courtney/comic-relief.webp','logo')]),
'discover-islam': ('charities','Discover Islam',[],[('courtney/discover-islam.webp','logo'),('let/discover-islam.png','icon')]),
'faces':          ('charities','FACES (Faiths Against Child Sexual Exploitation)',['FACES'],[('courtney/faces.webp','logo')]),
'groundwork':     ('charities','Groundwork',[],[('courtney/groundwork.webp','logo')]),
'grow-your-potential':('charities','Grow Your Potential',['GYP'],[('courtney/gyp.svg','logo')]),
'hilden':         ('charities','Hilden',[],[('courtney/hilden.svg','logo')]),
'hygiene-bank':   ('charities','The Hygiene Bank',[],[('courtney/hygiene-bank.svg','logo')]),
'noah':           ('charities','NOAH Enterprise',['NOAH'],[('courtney/noah.svg','logo')]),
'nijjor-manush':  ('charities','Nijjor Manush',[],[('courtney/nijjormanush.webp','logo')]),
'lets-hub':       ('charities','LETS Hub (Luton Employment Training Skills)',['letshub'],[('courtney/lets-hub.webp','logo')]),
'utilita-giving': ('charities','Utilita Giving',[],[('courtney/utilita-giving.webp','logo')]),
'hightown-baptist':('charities','Hightown Baptist Church',['HBC'],[('courtney/hightown-baptist.webp','logo')]),
'kdf':            ('charities','Kashmir Development Foundation',['KDF'],[('ngs/kdf.webp','logo')]),
'level-trust':    ('charities','Level Trust',[],[('ngs/level-trust.webp','logo'),('ngs/level-trust-light.webp','logo-white')]),
'community-fund': ('charities','The National Lottery Community Fund',['TNLCF','National Lottery'],[('ngs/community-fund.webp','logo'),('ngs/community-fund-light.webp','logo-white')]),
'empowering':     ('charities','Empowering Education',[],[('ngs/empowering.webp','logo'),('ngs/empowering-light.webp','logo-white')]),
'mary-seacole':   ('charities','Mary Seacole Housing Association',[],[('ngs/mary-seacole.webp','logo'),('ngs/mary-seacole-light.webp','logo-white')]),
'ctp':            ('charities','CTP',['CTP'],[('ngs/ctp.webp','logo')]),
'fcg':            ('charities','Farley Community Group',['FCG'],[('ngs/fcg.webp','logo')]),
'luton-point':    ('charities','Luton Point',[],[('let/luton-point.png','logo')]),
'lantern':        ('charities','Lantern (Let\'s Eat Together partner)',[],[('let/lantern.png','icon')]),
# ---------- council, public & youth ----------
'active-luton':   ('community','Active Luton',[],[('ngs/active-luton.webp','logo')]),
'luton-rising':   ('community','Luton Rising',[],[('ngs/luton-rising.webp','logo')]),
'luton-energise': ('community','Luton Energise Holiday Camps (HAF)',['Energise'],[('ngs/luton-energise.webp','logo')]),
'tokko':          ('community','Tokko Youth Hub',['Tokko'],[('ngs/tokko.webp','logo'),('ngs/tokko-light.webp','logo-white'),('ngs/tokko-stack.webp','lockup'),('ngs/tokko-wide.webp','wide')]),
'luton-allstars': ('community','Luton Allstars Football Club (MTAC)',['Allstars'],[('ngs/allstars.webp','logo')]),
'suez':           ('community','SUEZ',[],[('ngs/suez.webp','logo')]),
# ---------- campaigns & events ----------
'jummah-winter-campaign':('campaigns','Jummah Winter Campaign',['JWA','Jummah Winter Appeal'],[('winter/jummah-winter-appeal.svg','logo'),('winter/jummah-winter-campaign.png','logo'),('winter/jummah-winter-campaign-light.png','logo-white'),('winter/jwa.png','logo-compact'),('winter/jwa-light.png','logo-compact-white'),('winter/jwa-icon.png','icon')]),
'lets-eat-together':('campaigns',"Let's Eat Together",[],[('let/lets-eat-together.png','wordmark')]),
'big-iftar-luton':('campaigns','The Big Iftar Luton',['Big Iftar'],[('let/big-iftar.png','logo')]),
'wellness-walk':  ('campaigns','Wellness Walk',[],[('let/wellness-walk.png','icon')]),
# ---------- media ----------
'inspire-fm':     ('media','Inspire FM 105.1',['Inspire','Inspire FM'],[('winter/inspire-fm.svg','logo'),('winter/inspire-fm.png','logo'),('winter/inspire-fm-white.svg','logo-white'),('winter/inspire-fm-white.png','logo-white')]),
# ---------- businesses & sponsors ----------
'aa-carpets':     ('businesses','AA Carpets and Furniture',[],[('ngs/aa-carpets.webp','logo')]),
'aegis':          ('businesses','Aegis Support Services',[],[('ngs/aegis.webp','logo')]),
'aghaz':          ('businesses','Aghaz by AN',[],[('ngs/aghaz.webp','logo')]),
'al-nikah':       ('businesses','Al Nikah Wedding Services',[],[('ngs/al-nikah.webp','logo')]),
'ambala':         ('businesses','Ambala',[],[('ngs/ambala.webp','logo')]),
'amee-jee':       ('businesses','Amee Jee',[],[('ngs/amee-jee.webp','logo')]),
'bhajis-kitchen': ('businesses',"Bhaji's Kitchen",[],[('ngs/bhajis.webp','logo')]),
'bliss-boutique': ('businesses','Bliss Boutique',[],[('ngs/bliss.webp','logo')]),
'gao-express':    ('businesses','Gao Express',[],[('ngs/gao-express.webp','logo')]),
'global-groceries':('businesses','Global Groceries Luton',[],[('ngs/global-groceries.webp','logo')]),
'grand-royale':   ('businesses','Grand Royale',[],[('ngs/grand-royale.webp','logo')]),
'hannah-solicitors':('businesses','Hannah Solicitors',[],[('ngs/hannah-solicitors.webp','logo')]),
'house-of-elegance':('businesses','House of Elegance',[],[('ngs/house-of-elegance.webp','logo')]),
'kashmir-catering':('businesses','Kashmir Catering Services',[],[('ngs/kashmir-catering.webp','logo')]),
'luton-halal':    ('businesses','Luton Halal Meat Centre',[],[('ngs/luton-halal.webp','logo')]),
'maliks-khan':    ('businesses','Maliks & Khan Solicitors',[],[('ngs/maliks-khan.webp','logo')]),
'memsaab':        ('businesses','Memsaab',[],[('ngs/memsaab.webp','logo')]),
'niralla':        ('businesses','Niralla International Sweets',[],[('ngs/niralla.webp','logo')]),
'noreen':         ('businesses','Noreen Make Up Studio',[],[('ngs/noreen.webp','logo')]),
'nur-collection': ('businesses','Nur Collection',[],[('ngs/nur-collection.webp','logo')]),
'pulse-av':       ('businesses','Pulse AV',[],[('ngs/pulse-av.webp','logo'),('ngs/pulse-av-light.webp','logo-white')]),
'rainstone':      ('businesses','Rainstone Money Group',[],[('ngs/rainstone.webp','logo')]),
'shamzy':         ('businesses','Shamzy Hair & Makeup',[],[('ngs/shamzy.webp','logo')]),
'tops-pizza':     ('businesses',"Tops Pizza",[],[('ngs/tops-pizza.webp','logo')]),
'two-side':       ('businesses','Two Side Studios',[],[('ngs/two-side.webp','logo')]),
# ---------- own brand ----------
'smr-digital':    ('smr','SMR Digital',['SMR'],[('ngs/smr-digital.webp','logo'),('let/smr-digital-dark.png','logo'),('winter/smr-digital-light.png','logo-white'),('ngs/smr-mark-white.png','icon-white')]),
}

# ---------- added from the latest NGS build (venues, days out, council, faith & community) ----------
CATX={'venues':'Venues & days out'}
for s,c,n,al,f in [
 ('luton-council','community','Luton Council',['LBC','Luton Borough Council'],'luton-council.svg'),
 ('luton-bid','community','Luton BID (Step Forward Luton)',[],'luton-bid.svg'),
 ('luton-libraries','community','Luton Libraries',[],'luton-libraries.webp'),
 ('dunstable-tc','community','Dunstable Town Council',[],'dunstable-tc.svg'),
 ('ltfc','community','Luton Town Football Club',['LTFC','Hatters'],'ltfc.webp'),
 ('ltfc-trust','charities','Luton Town FC Community Trust',[],'ltfc-trust.webp'),
 ('youthscape','community','Youthscape',[],'youthscape.svg'),
 ('hangout-luton','community','Hangout Luton',[],'hangout-luton.svg'),
 ('st-marys','community',"St Mary's Church Luton",[],'st-marys.svg'),
 ('uni-beds','schools','University of Bedfordshire',['UoB'],'uni-beds.svg'),
 ('wildlife-trust','charities','Wildlife Trust BCN',[],'wildlife-trust.svg'),
 ('woodland-trust','charities','Woodland Trust',[],'woodland-trust.svg'),
 ('national-trust','charities','National Trust',[],'national-trust.svg'),
 ('keech-hospice-care','charities','Keech Hospice Care',['Keech'],'keech.svg'),
 ('skt-welfare','charities','SKT Welfare',[],'skt-welfare.svg'),
 ('muslim-undertaker','community','Muslim Undertaker',[],'muslim-undertaker.svg'),
 ('rosebuds','community','Rosebuds Luton Sisters',[],'rosebuds.webp'),
 ('muslim-panto','campaigns','Muslim Panto (Abdullah Afzal Productions)',[],'muslim-panto.webp'),
 ('venue-360','venues','Venue 360',[],'venue-360.svg'),
 ('cineworld','venues','Cineworld Luton',[],'cineworld.svg'),
 ('tenpin','venues','Tenpin Luton',[],'tenpin.svg'),
 ('funtura','venues','Funtura',[],'funtura.svg'),
 ('orbital','venues','Orbital Trampoline Park',[],'orbital.webp'),
 ('the-giggles','venues','The Giggles (Active Luton)',[],'the-giggles.webp'),
 ('padel-pass','venues','Padel Pass',[],'padel-pass.svg'),
 ('stockwood-golf','venues','Stockwood Park Golf Centre',[],'stockwood-golf.webp'),
 ('stockwood-discovery','venues','Stockwood Discovery Centre (The Culture Trust)',['Culture Trust'],'stockwood.svg'),
 ('hat-factory','venues','Hat Factory Arts Centre',[],'hat-factory.svg'),
 ('grove-theatre','venues','Grove Theatre, Dunstable',[],'grove-theatre.svg'),
 ('wardown-golf','venues','Wardown Adventure Golf',[],'wardown-golf.webp'),
 ('parkrun','venues','parkrun',[],'parkrun.svg'),
 ('everyone-active','venues','Everyone Active (The Dunstable Centre)',[],'everyone-active.svg'),
 ('teamsport','venues','TeamSport Dunstable',[],'teamsport.svg'),
 ('snakes-ladders','venues','Snakes & Ladders',[],'snakes-ladders.svg'),
 ('woodside-farm','venues','Woodside Farm',[],'woodside-farm.webp'),
 ('whipsnade','venues','ZSL Whipsnade Zoo',[],'whipsnade.svg'),
 ('woburn','venues','Woburn Safari Park',[],'woburn.webp'),
 ('dunstable-downs','venues','Dunstable Downs',[],'dunstable-downs.webp'),
 ('houghton-hall','venues','Houghton Hall Park',[],'houghton-hall.webp'),
 ('bennetts-splash','venues',"Bennett's Splash Park",[],'bennetts-splash.svg'),
 ('paintball-herts','venues','Paintball Hertfordshire',[],'paintball-herts.webp'),
 ('agent-brains','venues','Agent Brains',[],'agent-brains.svg'),
 ('luton-hoo','venues','Luton Hoo Estate',[],'luton-hoo.svg'),
 ('frasers-plus','venues','Frasers Plus Luton',[],'frasers-plus.webp'),
 ('happy-shark','venues','Happy Shark Comedy Club',[],'happy-shark.webp'),
 ('upfront-comedy','venues','Upfront Comedy',[],'upfront-comedy.webp'),
 ('luventertainment','venues','LUV Entertainment',[],'luventertainment.svg'),
 ('full-house','venues','Full House',[],'full-house.webp'),
 ('rayners','venues','Rayners Deja Vu Dance Studio',[],'rayners.svg')]:
    M[s]=(c,n,al,[('ngs2/'+f,'logo')])
M['groundwork'][3].insert(0,('ngs2/groundwork.svg','logo'))
M['grow-your-potential']=('charities','Grow Your Potential',['GYP'],[('ngs2/grow-your-potential.svg','logo')])
M['wigmore-valley-park']=('venues','Wigmore Valley Park',[],[('ngs2/wigmore.webp','logo')])
M['smr-digital'][3].append(('ngs2/smr-digital-white.webp','logo-white'))

# ---------- added 15 Nov (owner uploads) ----------
M['faces']=('charities','FACES (Faiths Against Child Sexual Exploitation)',['FACES'],[('new/faces.png','logo')])
M['lady-zia-wernher']=('schools','Lady Zia Wernher School',[],[('new/lady-zia-wernher.png','logo')])
M['avenue-centre']=('schools','Avenue Centre for Education',['Avenue'],[('new/avenue.png','logo')])
M['rabia']=('schools','Rabia Education Trust',["Rabia Girls' School","Rabia Boys' School",'Madrasa Islamia Primary','Rabia'],[('new/rabia.png','logo')])
M['mehria']=('schools','Mehria Primary School',['Mehria'],[('new/mehria.png','logo')])
M['al-falah']=('mosques','Al Falah Community Centre',['Al Falah'],[('new/al-falah.png','logo')])
M['ukim-luton']=('mosques','Madina Masjid (UKIM Luton)',['UKIM','UK Islamic Mission','Madina Masjid Oak Road'],[('new/ukim.png','icon')])
M['beds-chamber']=('community','Bedfordshire Chamber of Commerce',['Beds Chamber'],[('new/beds-chamber.png','logo'),('new/beds-chamber-small.png','logo-alt')])
M['beds-police']=('community','Bedfordshire Police',[],[('new/beds-police-crii.png','crest')])
M['beds-pcc']=('community','Bedfordshire Police & Crime Commissioner',['PCC'],[('new/beds-pcc.png','logo')])
M['luton-council'][3].append(('new/luton-wordmark.png','wordmark'))
M['lscm']=('mosques','Luton Sunni Council of Mosques',['LSCM'],[('new/lscm.png','logo'),('new/lscm-lockup.png','lockup')])
M['lcm']=('mosques','Luton Council of Mosques',['LCM'],[('new/lcm.png','logo'),('new/lcm-strip.png','logo-alt')])
# ---------- added 15 Nov, batch 2 ----------
M['higher-ground']=('community','Higher Ground',[],[('new/higher-ground.png','logo'),('new/higher-ground-alt.png','logo-alt')])
M['aegis']=('businesses','Aegis Support Services',['Aegis'],[('new/aegis.png','logo'),('new/aegis-training.png','training')])
M['community-interest-luton']=('charities','Community Interest Luton',['CIL'],[('new/cil.png','logo')])
M['one-eid']=('campaigns','1 Eid',['One Eid'],[('new/one-eid.png','logo')])
M['luton-mela']=('campaigns','Luton Mela',[],[('new/luton-mela.png','logo-tile')])
M['diverse-fm']=('media','Diverse FM',['Diverse'],[('new/diverse.png','logo')])
M['sunnah-charity'][3].insert(0,('new/sunnah.png','logo'))
M['ummah-welfare-trust']=('charities','Ummah Welfare Trust',['UWT'],[('new/ummah-welfare.png','logo')])
M['one-ummah']=('charities','One Ummah',[],[('new/one-ummah.png','logo-tile')])
M['islamic-relief']=('charities','Islamic Relief UK',['Islamic Relief','IRUK'],[('new/islamic-relief-uk.png','lockup-tile'),('new/islamic-relief.png','emblem-tile')])
M['human-appeal'][3].append(('new/human-appeal-stacked.png','logo-stacked'))
# ---------- added 15 Nov, batch 3 ----------
for s,c,n,al,f,v in [
 ('muslim-hands','charities','Muslim Hands',[],'muslim-hands','logo'),
 ('beds-hospitals','community','Bedfordshire Hospitals NHS Foundation Trust',['Bedfordshire Hospitals','NHS'],'beds-hospitals','logo'),
 ('beds-rcc','charities','Bedfordshire Rural Communities Charity',['Beds RCC','BRCC'],'beds-rcc','logo'),
 ('bedford-hospital-charity','charities','Bedford Hospital Charity & Friends',[],'bedford-hospital-charity','logo'),
 ('l-and-d-hospital','community','Luton & Dunstable University Hospital',['L&D','L and D Hospital'],'l-and-d-hospital','logo'),
 ('penrose-roots','charities','Penrose Roots',[],'penrose-roots','logo'),
 ('luton-irish-forum','community','Luton Irish Forum',[],'luton-irish-forum','logo'),
 ('luton-all-womens-centre','charities',"Luton All Women's Centre",['LAWC'],'luton-all-womens-centre','logo'),
 ('signposts','charities','SignPosts Luton',['Signposts'],'signposts','logo'),
 ('home-start','charities','Home-Start Luton',['Home Start'],'home-start','logo'),
 ('mind-blmk','charities','Mind BLMK',['Mind'],'mind-blmk','logo'),
 ('jobcentre-plus','community','Jobcentre Plus',['DWP'],'jobcentre-plus','logo-tile'),
 ('citizens-advice','charities','Citizens Advice Luton',['CAB','Citizens Advice'],'citizens-advice','logo'),
 ('age-concern-luton','charities','Age Concern Luton',[],'age-concern-luton','logo'),
 ('age-uk-beds','charities','Age UK Bedfordshire',['Age UK'],'age-uk-beds','logo'),
 ('kings-trust','charities',"The King's Trust",["Prince's Trust"],'kings-trust','logo'),
 ('youth-partnership-service','community','Luton Youth Partnership Service',['YPS'],'youth-partnership-service','logo'),
 ('sea-cadets','community','Sea Cadets (Luton Unit 226, TS Keyes)',['TS Keyes'],'sea-cadets','logo'),
 ('nxt-gen-pathways','community','NXT GEN Pathways',[],'nxt-gen-pathways','logo'),
 ('ngyt','community','Next Generation Youth Theatre',['NGYT'],'ngyt','logo-white'),
 ('luton-youth-council','community','Luton Youth Council',['LYC'],'luton-youth-council','logo')]:
    M[s]=(c,n,al,[('new/'+f+'.png',v)])
M['lantern']=('charities',"Lantern · Muslim Women's Voices",['Lantern'],[('new/lantern.png','logo'),('let/lantern.png','icon')])
M['girlguiding']=('community','Girlguiding (Bedfordshire · Luton South)',['Girlguiding Luton'],[('new/girlguiding-beds.png','logo-white'),('new/girlguiding-luton-south.png','luton-south-tile')])
# ---------- added 15 Nov, batch 4 ----------
M['al-madani']=('mosques','Masjid al-Madani',['Al Madani','Masjid al Madani'],[('new/al-madani.png','logo')])
M['penny-appeal']=('charities','Penny Appeal',[],[('new/penny-appeal.png','logo-tile')])
M['al-khair']=('charities','Al-Khair Foundation',['Al Khair'],[('new/al-khair.png','logo-tile')])
M['islamic-help']=('charities','Islamic Help',[],[('new/islamic-help.png','logo'),('new/islamic-help-tile.png','logo-stacked-tile')])
M['salam-charity']=('charities','Salam Charity',[],[('new/salam-charity.png','logo')])
M['muslim-aid']=('charities','Muslim Aid',[],[('new/muslim-aid.png','logo')])
M['luton-council-of-faiths']=('community','Luton Council of Faiths',['LCF'],[('new/luton-council-of-faiths.png','logo-tile')])
M['scouts-luton']=('community','Falkes (Luton) Scout District',['Scouts','Luton Scouts'],[('new/scouts-luton.png','logo')])
# ---------- added 15 Nov, batch 5 (charities) ----------
for _s,_n,_al,_f in [('one-nation','One Nation',[],[('one-nation','logo')]),('aghosh','Aghosh UK',['Aghosh'],[('aghosh','logo')]),
 ('muslim-charity','Muslim Charity',[],[('muslim-charity','logo')]),('nzf','National Zakat Foundation',['NZF'],[('nzf','logo')]),
 ('read-foundation','READ Foundation',['READ'],[('read-foundation','logo')]),('lady-fatemah','The Lady Fatemah Trust',['Lady Fatemah'],[('lady-fatemah','logo')]),
 ('african-relief','African Relief Fund',[],[('african-relief','logo')]),('ethar-relief','Ethar Relief',[],[('ethar-relief','logo-tile')]),
 ('kassars','Kassar\'s Foundation',[],[('kassars','logo')]),('grt','Global Relief Trust',['GRT'],[('grt','logo')]),
 ('matw','MATW Project (Muslims Around The World)',['MATW'],[('matw','logo'),('matw-tile','logo-tile')]),
 ('action-for-humanity','Action For Humanity',[],[('action-for-humanity','logo')]),('orphans-in-need','Orphans in Need',['OIN'],[('orphans-in-need','logo-tile')]),
 ('emaan-relief','Emaan Relief',[],[('emaan-relief','logo')]),('amanah','Amanah Project',[],[('amanah','logo')]),
 ('global-helping-hands','Global Helping Hands',['GHH'],[('global-helping-hands','logo-tile')]),('forgotten-women','Forgotten Women',[],[('forgotten-women','logo')]),
 ('islamic-aid','Islamic Aid',[],[('islamic-aid','logo')]),('mgr','Muslim Global Relief',['MGR'],[('mgr','logo')])]:
    M[_s]=('charities',_n,_al,[('new/'+f+'.png',v) for f,v in _f])
M['luton-council-of-faiths'][3].append(('new/lcf-white.png','logo-white'))
M['near-neighbours']=('community','Near Neighbours',[],[('new/near-neighbours.png','logo')])
M['grassroots']=('charities','Grassroots',[],[('new/grassroots.png','logo-tile')])
M['norton-road']=('schools','Norton Road Primary School',[],[('new/norton-road-colour.png','logo'),('new/norton-road-white.png','logo-white'),('new/norton-road-crest.svg','crest')])
M['tutorbook']=('businesses','TutorBook',[],[('new/tutorbook.png','logo')])
M['oakwood']=('schools','Oakwood Primary School',[],[('new/oakwood.png','logo')])
M['al-hikmah']=('schools','Al-Hikmah (Bury Park Educational Institute)',['Al Hikmah','Bury Park Educational Institute'],[('new/al-hikmah.png','logo')])
M['culture-trust']=('community','The Culture Trust Luton',['Culture Trust'],[('new/culture-trust.png','logo')])
# ---------- retyped / cleaned versions (fixes.py) ----------
M['lcm']=('mosques','Luton Council of Mosques',['LCM'],[('fixed/lcm.png','logo')])
M['lscm']=('mosques','Luton Sunni Council of Mosques',['LSCM'],[('fixed/lscm-logo.png','logo'),('fixed/lscm-lockup.png','lockup')])
M['al-hikmah'][3][:]=[('fixed/al-hikmah.png','logo')]
M['tops-pizza'][3][:]=[('fixed/tops-pizza.png','logo')]
M['kashmir-catering'][3][:]=[('fixed/kashmir-catering.png','logo')]
M['beds-pcc'][3][:]=[('fixed/beds-pcc.png','logo')]
M['girlguiding']=('community','Girlguiding (Bedfordshire · Luton South)',['Girlguiding Luton'],[('new/girlguiding-beds.png','logo-white'),('fixed/girlguiding-luton-south.png','luton-south'),('fixed/girlguiding-luton-south-tile.png','luton-south-tile')])
# ---------- hand-made versions (15 Nov review) ----------
M['denbigh'][3][:]=[('hand/denbigh-crest.svg','icon'),('hand/denbigh-crest-white.svg','icon-white'),('hand/denbigh-crest-black.svg','icon-black')]
M['global-helping-hands']=('charities','Global Helping Hands',['GHH'],[('hand/ghh-logo.png','logo'),('hand/ghh-logo-white.png','logo-white'),('hand/ghh-logo-black.png','logo-black'),('hand/ghh-logo-tile.png','logo-tile-full')])
M['matw']=('charities','MATW Project (Muslims Around The World)',['MATW'],[('hand/matw-logo.svg','logo'),('hand/matw-logo-white.svg','logo-white'),('hand/matw-logo-black.svg','logo-black'),('hand/matw-logo-tile.svg','logo-tile-full')])
M['aegis'][3][:]=[('hand/aegis-logo.svg','logo'),('hand/aegis-logo-white.svg','logo-white'),('hand/aegis-logo-black.svg','logo-black'),('new/aegis-training.png','training')]
M['amanah']=('charities','Amanah Project',[],[('hand/amanah-logo.png','logo'),('hand/amanah-logo-white.png','logo-white'),('hand/amanah-logo-black.png','logo-black'),('hand/amanah-mark.svg','icon')])
M['luton-mela']=('campaigns','Luton Mela',[],[('hand/mela.png','logo')])
M['british-red-cross']=('charities','British Red Cross',['Red Cross'],[('hand/british-red-cross.svg','logo'),('hand/british-red-cross-white.svg','logo-white'),('hand/british-red-cross-black.svg','logo-black')])
# ---------- 15 Nov: NHS, DRC, Samaritans, St John, Beds Fire ----------
M['eechc']=('community','East of England Community Health and Care NHS Trust',['EEC','EECHC','NHS','Cambridgeshire Community Services','CCS'],[('hand/eechc.png','logo'),('hand/eechc-white.png','logo-white'),('hand/eechc-black.png','logo-black'),('hand/nhs.svg','nhs'),('hand/nhs-white.svg','nhs-white'),('hand/nhs-black.svg','nhs-black')])
M['elft']=('community','East London NHS Foundation Trust',['ELFT','NHS'],[('hand/elft.png','logo'),('hand/elft-white.png','logo-white'),('hand/elft-black.png','logo-black'),('hand/nhs.svg','nhs'),('hand/nhs-white.svg','nhs-white'),('hand/nhs-black.svg','nhs-black')])
M['beds-hospitals'][3].extend([('hand/nhs.svg','nhs'),('hand/nhs-white.svg','nhs-white'),('hand/nhs-black.svg','nhs-black')])
M['disability-resource-centre']=('charities','The Disability Resource Centre',['DRC','DRC Beds','Disability Resource Centre'],[('hand/drc.png','logo'),('hand/drc-white.png','logo-white'),('hand/drc-black.png','logo-black'),('hand/drc-icon.svg','icon'),('hand/drc-icon-white.svg','icon-white'),('hand/drc-icon-black.svg','icon-black')])
M['samaritans-luton']=('charities','Luton, South Beds & Harpenden Samaritans',['Samaritans','Luton Samaritans','Samaritans of Luton, South Beds and Harpenden'],[('hand/samaritans.svg','logo'),('hand/samaritans-white.svg','logo-white'),('hand/samaritans-black.svg','logo-black')])
M['st-john-ambulance']=('charities','St John Ambulance',['St John','SJA'],[('hand/st-john.svg','logo'),('hand/st-john-white.svg','logo-white'),('hand/st-john-tile.svg','logo-tile-full')])
M['beds-fire']=('community','Bedfordshire Fire & Rescue Service',['Beds Fire','BFRS','Bedfordshire Fire and Rescue'],[('new/beds-fire-crest.jpg','crest')])
M['ukcca']=('community','UK Centre for Carnival Arts',['UKCCA','Luton Carnival','Carnival Arts Centre'],[('new/ukcca.webp','logo')])
M['stepping-stones']=('charities','Stepping Stones',[],[('hand/stepping-stones.png','logo'),('hand/stepping-stones-white.png','logo-white'),('hand/stepping-stones-black.png','logo-black'),('hand/stepping-stones-foot.png','icon'),('hand/stepping-stones-foot-white.png','icon-white'),('hand/stepping-stones-foot-black.png','icon-black')])
M['fobe']=('charities','Friends of Bright Eyes',['FOBE','fobe','Bright Eyes'],[('new/fobe.webp','logo')])
M['lfpgs']=('community','Luton Friends of Parks and Green Spaces',['LFPGS','Friends of Parks'],[('hand/lfpgs.png','logo'),('hand/lfpgs-white.png','logo-white'),('hand/lfpgs-black.png','logo-black'),('hand/lfpgs-full.png','lockup'),('hand/lfpgs-full-white.png','lockup-white'),('hand/lfpgs-full-black.png','lockup-black'),('hand/lfpgs-name.png','name'),('hand/lfpgs-name-white.png','name-white'),('hand/lfpgs-name-black.png','name-black'),('hand/lfpgs-tree.svg','icon'),('hand/lfpgs-tree-white.svg','icon-white'),('hand/lfpgs-tree-black.svg','icon-black')])
M['guide-dogs']=('charities','Guide Dogs',['Guide Dogs for the Blind','Guide Dogs UK'],[('hand/guide-dogs.png','logo'),('hand/guide-dogs-white.png','logo-white'),('hand/guide-dogs-black.png','logo-black'),('hand/guide-dogs-paw.svg','icon'),('hand/guide-dogs-paw-white.svg','icon-white'),('hand/guide-dogs-paw-black.svg','icon-black')])
M['goodgym']=('charities','GoodGym Luton',['GoodGym','Good Gym'],[('hand/goodgym.svg','logo'),('hand/goodgym-white.svg','logo-white'),('hand/goodgym-black.svg','logo-black'),('hand/goodgym-luton.png','luton'),('hand/goodgym-luton-white.png','luton-white'),('hand/goodgym-luton-black.png','luton-black'),('hand/goodgym-luton-tile.png','luton-tile-full')])
# ---------- name lockups (icon + full name), made by make_lockups.py ----------
for _s in json.load(open('lockups.json')):
    if _s in M: M[_s][3].extend([('lockups/'+_s+'-h.png','lockup'),('lockups/'+_s+'-v.png','lockup-stacked')])
