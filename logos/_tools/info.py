# Addresses + websites. Sources: Inspire FM app mosque data (mosques.js), Luton Council school finder,
# Charity Commission, Ofsted/GIAS, Ofcom, NGS "things to do" listings, NGS help directory.
import json,re
I={}
def add(slug,address=None,postcode=None,web=None,**kw):
    d={k:v for k,v in dict(address=address,postcode=postcode,website=web,**kw).items() if v}
    I[slug]=d
# mosques from the app
s=open('/home/claude/site/mosques.js').read()
ms=json.loads(re.search(r'IFM_MOSQUES=(\[.*?\]);',s).group(1))
links=json.loads(re.search(r'IFM_MOSQUE_LINKS = (\{.*?\});',s).group(1))
for m in ms:
    slug='bury-park-jami-masjid' if m['id']=='bury-park-jamia' else m['id']
    l=links.get(m['id'],{})
    add(slug,m['a'].rsplit(',',1)[0]+', Luton',m['pc'],l.get('web'),phone=l.get('tel'),lat=m['ll'][0],lng=m['ll'][1],jummah=', '.join(m['j']),source='Inspire FM app')
# schools & colleges
for slug,a,pc,w in [
 ('icknield','Riddy Lane, Luton','LU3 2AH','https://www.icknield.beds.sch.uk'),
 ('cardinal-newman','Warden Hill Road, Luton','LU2 7AE','https://www.cardinalnewmanschool.net'),
 ('chalk-hills','Leagrave High Street, Luton','LU4 0NE','https://www.thechalkhillsacademy.co.uk'),
 ('challney-boys','Stoneygate Road, Luton','LU4 9TJ','http://www.challneyboys.co.uk'),
 ('challney-girls','Addington Way, Luton','LU4 9FJ','https://www.challneygirls.luton.sch.uk'),
 ('chantry','Tomlinson Avenue, Luton','LU4 0QP','https://www.chantryprimaryacademy.com'),
 ('dallow','Dallow Road, Luton','LU1 1LZ','https://www.dallowprimary.net'),
 ('denbigh','Alexandra Avenue, Luton','LU3 1HE','https://www.denbighhigh.co.uk'),
 ('downside','Chaul End Lane, Luton','LU4 8EZ',None),
 ('farley-junior','Northdrift Way, Luton','LU1 5JF',None),
 ('hillborough','Hillborough Road, Luton','LU1 5EZ',None),
 ('lea-manor','Northwell Drive, Luton','LU3 3TL',None),
 ('lealands','Sundon Park Road, Luton','LU3 3AL',None),
 ('norton-road','Norton Road, Luton','LU3 2NX',None),
 ('putteridge','Putteridge Road, Luton','LU2 8HJ',None),
 ('qes','Crawley Green Road, Luton','LU2 9AG',None),
 ('stockwood-park','Rotheram Avenue, Luton','LU1 5PP',None),
 ('stopsley',"St Thomas' Road, Luton",'LU2 7UX',None),
 ('wigmore','Twyford Drive, Luton','LU2 9TB',None),
 ('woodlands','Northwell Drive, Luton','LU3 3SP','http://www.woodlands.luton.sch.uk'),
 ('chiltern-academy','Gipsy Lane, Luton','LU1 3GF',None),
 ('luton-sixth-form','Bradgers Hill Road, Luton','LU2 7EW','https://www.lutonsfc.ac.uk'),
 ('active-support','Unit 1 Britannia Estates, Leagrave Road, Luton','LU3 1RJ','https://www.activesupporteducation.co.uk'),
 ('chiltern-learning-trust','Denbigh High School, Alexandra Avenue, Luton (registered office)','LU3 1HE','https://www.chilternlearningtrust.org'),
 ('barnfield-college','Luton','LU2 7BF',None),
 ('uni-beds','University of Bedfordshire, Luton campus','LU1 3JU',None)]:
    add(slug,a,pc,w)
# charities & community
add('raise-up','Solway Community Centre, 5 All Saints Close, Luton','LU3 1FA','https://raiseupluton.co.uk',charity='1188653')
add('courtney-foundation','145a High Street, Luton','LU4 9LE','https://thecourtneyfoundation.org',charity='1187689')
add('inspire-fm','234 Dallow Road, Luton','LU1 1TB','https://www.inspirefm.org')
add('luton-foodbank',None,None,'https://lutonfoodbank.org.uk',note='Parcels from collection points across Luton, given after assessment; no public walk-in address')
add('discover-islam','37C Upper George Street, Luton','LU1 2RD',None)
add('noah','141 Park Street, Luton (Welfare Centre)','LU1 3HG','https://noahenterprise.org')
add('hygiene-bank',None,None,'https://www.thehygienebank.com')
add('sunnah-charity',None,None,'https://sunnah.org.uk',charity='1203441')
add('tokko','7 Gordon Street, Luton','LU1 2QP','https://tokko.co.uk')
add('lets-eat-together',None,None,'https://lutonfoodbank.org.uk/letseattogether')
add('smr-digital','Luton',None,'https://smrgraphics.co.uk',email='summar@smrgraphics.co.uk',instagram='@smrdigitaluk')
add('wigmore-valley-park','Wigmore Valley Park, Wigmore, Luton','LU2 9TN',None)
# venues from the NGS listings: only keep a website when the link is the organisation's own domain
OWN={'woburn':'https://woburnsafari.co.uk','everyone-active':'https://everyoneactive.com','orbital':'https://www.orbitaltrampolinepark.co.uk','the-giggles':'https://thegiggles.co.uk','funtura':'https://funturauk.com','tenpin':'https://www.tenpin.co.uk','cineworld':'https://www.cineworld.co.uk','padel-pass':'https://padelpass.co.uk','stockwood-golf':'https://stockwoodparkgolf.co.uk','venue-360':'https://www.venue360.co.uk','woodland-trust':'https://www.woodlandtrust.org.uk','parkrun':'https://www.parkrun.org.uk','wardown-golf':'https://www.wardownadventuregolf.co.uk','stockwood':'https://www.culturetrust.com','hat-factory':'https://www.culturetrust.com','luton-libraries':'https://www.lutonlibraries.co.uk','youthscape':'https://www.youthscape.co.uk','hangout-luton':'https://hangoutluton.co.uk','teamsport':'https://www.team-sport.co.uk','snakes-ladders':'https://www.snakes-and-ladders.co.uk','woodside-farm':'https://www.woodsidefarm.co.uk','whipsnade':'https://www.whipsnadezoo.org','dunstable-downs':'https://www.nationaltrust.org.uk','houghton-hall':'https://www.houghtonhallpark.org','dunstable-tc':'https://www.dunstable.gov.uk','paintball-herts':'https://paintballhertfordshire.com','agent-brains':'https://www.agentbrains.co.uk','bennetts-splash':'https://www.dunstable.gov.uk','ltfc':'https://www.lutontown.co.uk','grove-theatre':'https://everyonetheatres.com','st-marys':'https://www.stmarysluton.org','luton-council':'https://www.luton.gov.uk','active-luton':'https://activeluton.co.uk','luton-bid':'https://place.stepforwardluton.co.uk','national-trust':'https://www.nationaltrust.org.uk'}
REN={'stockwood':'stockwood-discovery','keech':'keech-hospice-care','wigmore':'wigmore-valley-park'}
V=json.load(open('ngs-venues.json'))
for lg,recs in V.items():
    r=recs[0]; slug=REN.get(lg,lg)
    if slug in I and slug!='wigmore-valley-park': continue
    pc=r['pc'] if r['pc'] and r['pc']!='Luton' else None
    addr=r['where'] if r['where'] and not r['where'].lower().startswith(('venues','nature','luton lib')) else None
    if lg in ('keech','muslim-undertaker','skt-welfare','muslim-panto','rosebuds','uni-beds','happy-shark','rayners','luventertainment','full-house','upfront-comedy','frasers-plus','luton-hoo','luton-bid'):
        add(slug,None,None,OWN.get(lg),last_event_at=(r['where'] or '')+(' '+pc if pc else ''))
    else:
        add(slug,addr,pc,OWN.get(lg))
json.dump(I,open('info.json','w'),indent=1)
print(len(I),'with details;',sum(1 for v in I.values() if v.get('address')),'addresses;',sum(1 for v in I.values() if v.get('website')),'websites')
# NGS partner directory (websites the NGS site links to)
KEY={'chiltern':'chiltern-learning-trust','allstars':'luton-allstars','barnfield':'barnfield-college','hannah':'hannah-solicitors','bliss':'bliss-boutique','nur':'nur-collection','bhajis':'bhajis-kitchen'}
P2=json.load(open('ngs-partners.json'))
for k,v in P2.items():
    slug=KEY.get(k,k); u=v['url']
    if not u or 'google.com/maps' in u: continue
    d=I.setdefault(slug,{})
    if 'instagram.com' in u: d.setdefault('instagram',u)
    else: d.setdefault('website',u)
I.setdefault('luton-halal',{}).update(address='189 Dunstable Road, Luton')
I.setdefault('grand-royale',{}).update(postcode='LU2 0AH')
I.setdefault('ngs',{}).update(email='info@nextgenerationscheme.co.uk',phone='07594 107633',website='https://nextgenerationscheme.co.uk',note='Website taken from the email domain; no public street address listed on the NGS site')
I.setdefault('youthscape',{}).update(address='74 Bute Street, Luton',postcode='LU1 2EY')
for slug,w in {'human-appeal':'https://humanappeal.org.uk','comic-relief':'https://www.comicrelief.com','wildlife-trust':'https://www.wildlifebcn.org','groundwork':'https://www.groundwork.org.uk'}.items():
    I.setdefault(slug,{}).setdefault('website',w)
json.dump(I,open('info.json','w'),indent=1)
print(len(I),'with details;',sum(1 for v in I.values() if v.get('address') or v.get('postcode')),'with address/postcode;',sum(1 for v in I.values() if v.get('website')),'websites')
I.setdefault('national-trust',{})['website']='https://www.nationaltrust.org.uk'
I.setdefault('keech-hospice-care',{})['website']='https://www.keech.org.uk'
I.setdefault('big-iftar-luton',{}).update(address='Crescent Hall, 50 Dunstable Road, Luton',postcode='LU1 1EF',note='Hosted by Inspire FM each Ramadan')
json.dump(I,open('info.json','w'),indent=1)
I['lady-zia-wernher']={'address':'Ashcroft Road, Stopsley, Luton','postcode':'LU2 9AY'}
I['avenue-centre']={'address':'Cutenhoe Road, Luton','postcode':'LU1 3NJ'}
I['rabia']={'address':'12–16 Portland Road, Luton','postcode':'LU4 8AX','note':"Covers Rabia Girls' School, Rabia Boys' School and Madrasa Islamia Primary"}
I['ukim-luton']={'address':'126–130 Oak Road, Luton','postcode':'LU4 8AD','note':'UKIM logo is national; the lockups add the local name'}
I['al-falah']={'address':'Leagrave, Luton'}
json.dump(I,open('info.json','w'),indent=1)
I['higher-ground']={'address':'63 Inkerman Street, Luton','postcode':'LU1 1JD'}
I['diverse-fm']={'note':'Luton community radio, 102.8 FM'}
json.dump(I,open('info.json','w'),indent=1)
I['ngyt']={'address':'The Hat Factory Arts Centre, 65–67 Bute Street, Luton','postcode':'LU1 2EY'}
json.dump(I,open('info.json','w'),indent=1)
I['al-madani']={'address':'12–16 Portland Road, Luton','postcode':'LU4 8AX'}
json.dump(I,open('info.json','w'),indent=1)
I['culture-trust']={'website':'https://www.culturetrust.com'}
json.dump(I,open('info.json','w'),indent=1)
