/* CHUNK data layer — shared by the website and the admin app.
   DEMO mode (no keys in config.js): everything is saved in this browser only, so you can try the admin
   app and see the website change on the same device.
   LIVE mode (Supabase keys in config.js): everything is saved online and shared across every phone. */
(function(){
const CFG=window.CHUNK_CONFIG||{};
const LIVE=!!(CFG.supabaseUrl&&CFG.supabaseKey&&window.supabase);
const KEY='chunk_db_v1', CACHE='chunk_cache_v1';
const SEED_PRODUCTS=[{"id":"milk","kind":"cookie","name":"Milk Chocolate Chunk","cat":"classic","desc":"A soft, buttery cookie layered with premium milk chocolate chunks and chips, finished with a molten Nutella centre.","allergens":["Hazelnut"],"img":"img/c_milk.webp","sort":0},{"id":"redvelvet","kind":"cookie","name":"Red Velvet","cat":"classic","desc":"A rich red velvet cookie studded with white chocolate chips, filled with a silky white-chocolate ganache.","allergens":[],"img":"img/c_redvelvet.webp","sort":1},{"id":"double","kind":"cookie","name":"Double Chocolate","cat":"classic","desc":"An indulgent chocolate cookie with dark and white chocolate chips, enveloping a smooth white-chocolate core.","allergens":[],"img":"img/c_double.webp","sort":2},{"id":"brookie","kind":"cookie","name":"Brookie","cat":"signature","desc":"A milk chocolate cookie stuffed with a thick brownie CHUNK, topped with hazelnut sauce and chopped brownies.","allergens":["Hazelnut"],"img":"img/c_brookie.webp","sort":3},{"id":"freddo","kind":"cookie","name":"Freddo","cat":"signature","desc":"A milk chocolate cookie centred with Nutella, topped with even more Nutella and a Freddo resting on top.","allergens":["Hazelnut"],"img":"img/c_freddo.webp","sort":4},{"id":"ferrero","kind":"cookie","name":"Ferrero Rocher","cat":"signature","desc":"A rich, gooey milk chocolate cookie stuffed with smooth Nutella, topped with a whole Ferrero Rocher and a sprinkle of chopped hazelnuts.","allergens":["Hazelnut"],"img":"img/c_ferrero.webp","sort":5},{"id":"kinder","kind":"cookie","name":"Kinder","cat":"signature","desc":"A rich, gooey cookie filled with velvety Kinder spread and crowned with a Kinder chocolate bar.","allergens":["Hazelnut"],"img":"img/c_kinder.webp","sort":6},{"id":"buenowhite","kind":"cookie","name":"Bueno White","cat":"signature","desc":"A soft, gooey cookie filled with creamy Kinder sauce, topped with smooth Kinder spread and a White Kinder Bueno.","allergens":["Hazelnut"],"img":"img/c_buenowhite.webp","sort":7},{"id":"lotus","kind":"cookie","name":"Lotus Biscoff","cat":"signature","desc":"A delicately spiced Biscoff cookie, generously filled with Biscoff spread, studded with white chocolate and topped with a crisp Biscoff biscuit.","allergens":[],"img":"img/c_lotus.webp","sort":8},{"id":"pistachio","kind":"cookie","name":"Pistachio","cat":"signature","desc":"A luxurious pistachio cookie with white chocolate chunks, a molten pistachio spread centre and a finishing touch of crushed pistachios.","allergens":["Pistachio"],"img":"img/c_pistachio.webp","sort":9},{"id":"terrys","kind":"cookie","name":"Terry's Orange","cat":"signature","desc":"Chocolate cookie with crushed Terry's Chocolate Orange, a hint of orange, and a chocolate orange segment on top.","allergens":[],"img":"img/c_terrys.webp","sort":10},{"id":"snickers","kind":"cookie","name":"Snickers","cat":"signature","desc":"Chocolate cookie with a gooey caramel centre, topped with caramel, nuts and chunks of Snickers.","allergens":["Peanut"],"img":"img/c_snickers.webp","sort":11},{"id":"monster","kind":"cookie","name":"Cookie Monster","cat":"signature","desc":"A fun, vibrant blue white-chocolate-chip cookie stuffed with melted white chocolate, topped with extra white chocolate and crushed cookies.","allergens":[],"img":"img/c_monster.webp","sort":12},{"id":"cookiescream","kind":"cookie","name":"Cookies & Cream","cat":"signature","desc":"A gooey cookie filled with cookies & cream spread, topped with white chocolate sauce and Oreo crumbs.","allergens":[],"img":"img/c_cookiescream.webp","sort":13},{"id":"jammie","kind":"cookie","name":"Jammie Dodger","cat":"signature","desc":"A soft, gooey white chocolate chunk cookie with a raspberry jam centre, topped with white chocolate sauce and a classic Jammie Dodger.","allergens":[],"img":"img/c_jammie.webp","sort":14},{"id":"maltesers","kind":"cookie","name":"Maltesers","cat":"signature","desc":"A rich, gooey milk chocolate cookie filled with smooth Malteser spread and topped with crunchy Maltesers.","allergens":[],"img":"img/c_maltesers.webp","sort":15},{"id":"cerealmilk","kind":"cookie","name":"Cereal Milk","cat":"signature","desc":"A dreamy cookie packed with Frosties infused throughout and white chocolate chunks.","allergens":[],"img":"img/c_cerealmilk.webp","sort":16},{"id":"cornflaketart","kind":"cookie","name":"Cornflake Tart","cat":"signature","desc":"A buttery cookie with a jam centre, white chunks and a caramel cornflake topping.","allergens":[],"img":"img/c_cornflaketart.webp","sort":17},{"id":"crispycoco","kind":"cookie","name":"Crispy Coco","cat":"signature","desc":"A chocolate lover's dream: a Nutella centre, double chocolate, covered with Coco Pops and topped with M&M's Crispy.","allergens":["Hazelnut"],"img":"img/c_crispycoco.webp","sort":18},{"id":"bourbon","kind":"cookie","name":"Bourbon","cat":"signature","desc":"A buttery milk chocolate chunk cookie with a molten chocolate centre, topped with smooth chocolate sauce and a classic Bourbon biscuit.","allergens":[],"img":"img/c_bourbon.webp","sort":19},{"id":"mini_milk","kind":"mini","name":"Milk Chocolate","cat":"mini","desc":"CHUNKers mini cookie","allergens":[],"img":"img/c_milk.webp","sort":100},{"id":"mini_double","kind":"mini","name":"Double Chocolate","cat":"mini","desc":"CHUNKers mini cookie","allergens":[],"img":"img/c_double.webp","sort":101},{"id":"mini_redvelvet","kind":"mini","name":"Red Velvet","cat":"mini","desc":"CHUNKers mini cookie","allergens":[],"img":"img/c_redvelvet.webp","sort":102},{"id":"dip_white","kind":"dip","name":"White Chocolate","cat":"dip","desc":"Dip pot","allergens":[],"img":"img/dip_white.webp","sort":200},{"id":"dip_nutella","kind":"dip","name":"Nutella","cat":"dip","desc":"Dip pot","allergens":[],"img":"img/dip_nutella.webp","sort":201},{"id":"dip_pistachio","kind":"dip","name":"Pistachio","cat":"dip","desc":"Dip pot","allergens":[],"img":"img/dip_pistachio.webp","sort":202},{"id":"dip_biscoff","kind":"dip","name":"Lotus Biscoff","cat":"dip","desc":"Dip pot","allergens":[],"img":"img/dip_biscoff.webp","sort":203},{"id":"dip_kinder","kind":"dip","name":"Kinder","cat":"dip","desc":"Dip pot","allergens":[],"img":"img/dip_kinder.webp","sort":204}];
const SEED_LOCS={
  luton:{id:'luton',name:'Luton',ig:'chunk_aholic',wa:'447700900123',num:'07700 900123',
    collect:'Collect in Luton. We send the exact address when we confirm your order.',deliver:'£5 delivery across Luton.',
    deliveryFee:5,cutoff:12,leadDays:1,notice:{on:false,text:'New flavour just dropped! 🍪'}},
  rotherham:{id:'rotherham',name:'Rotherham',ig:'chunk.aholic',wa:'447700900456',num:'07700 900456',
    collect:'Collect in Rotherham. We send the exact address when we confirm your order.',deliver:'£5 delivery across Rotherham.',
    deliveryFee:5,cutoff:12,leadDays:1,notice:{on:false,text:'New flavour just dropped! 🍪'}}
};
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const ref=()=>'CH'+Math.floor(1000+Math.random()*9000);
const listeners=[];
function emit(){listeners.forEach(f=>{try{f(snap)}catch(e){console.error(e)}});}
function ls(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v));}catch(e){return null}}

/* ---------- snapshot used by the website (synchronous) ---------- */
let snap=null;
function blank(){return {products:clone(SEED_PRODUCTS),availability:{luton:{},rotherham:{}},locations:clone(SEED_LOCS),orders:[],chats:[]};}
function demoDB(){let d=ls(KEY);if(!d){d=blank();ls(KEY,d);}d.locations=Object.assign(clone(SEED_LOCS),d.locations||{});d.availability=d.availability||{luton:{},rotherham:{}};return d;}
function saveDemo(d){ls(KEY,d);snap=d;emit();}
snap=LIVE?(ls(CACHE)||blank()):demoDB();

function statusOf(loc,id){const a=(snap.availability[loc]||{})[id];if(!a)return 'ok';if(a.status&&a.status!=='ok')return a.status;if(a.stock!=null&&a.stock!==''&&+a.stock<=0)return 'unavailable';return 'ok';}

/* ---------- LIVE (Supabase) ---------- */
let sb=null;
if(LIVE){sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey);}
async function fetchLive(){
  const [p,a,l]=await Promise.all([sb.from('products').select('*').order('sort'),sb.from('availability').select('*'),sb.from('locations').select('*')]);
  if(p.error)throw p.error;
  const s={products:p.data.map(r=>({id:r.id,kind:r.kind,name:r.name,cat:r.cat,desc:r.description||'',allergens:r.allergens||[],img:r.img,sort:r.sort})),availability:{luton:{},rotherham:{}},locations:clone(SEED_LOCS)};
  (a.data||[]).forEach(r=>{(s.availability[r.location]=s.availability[r.location]||{})[r.product_id]={status:r.status,stock:r.stock};});
  (l.data||[]).forEach(r=>{s.locations[r.id]=Object.assign(s.locations[r.id]||{},r.data,{id:r.id});});
  if(!s.products.length)s.products=clone(SEED_PRODUCTS);
  snap=s;ls(CACHE,{products:s.products,availability:s.availability,locations:s.locations});emit();return s;}
const ready=LIVE?fetchLive().catch(e=>{console.warn('CHUNK live data failed, using cached',e);return snap;}):Promise.resolve(snap);
if(LIVE){sb.channel('public-data').on('postgres_changes',{event:'*',schema:'public',table:'availability'},()=>fetchLive())
  .on('postgres_changes',{event:'*',schema:'public',table:'products'},()=>fetchLive())
  .on('postgres_changes',{event:'*',schema:'public',table:'locations'},()=>fetchLive()).subscribe();}
else{addEventListener('storage',e=>{if(e.key===KEY){snap=demoDB();emit();}});}

/* ---------- public API ---------- */
const API={
  mode:LIVE?'live':'demo', ready, get snap(){return snap},
  onChange(f){listeners.push(f);},
  status:statusOf,
  cookies(){return snap.products.filter(p=>p.kind==='cookie').sort((a,b)=>a.sort-b.sort);},
  location(id){return snap.locations[id];},
  /* orders */
  async placeOrder(o){const r=o.ref||ref();const row={id:uid(),ref:r,location:o.location,data:o,status:'new',created_at:new Date().toISOString()};
    if(LIVE){const {error}=await sb.from('orders').insert({ref:r,location:o.location,data:o,status:'new'});if(error)console.warn(error);}
    else{const d=demoDB();d.orders.unshift(row);saveDemo(d);}return r;},
  /* customer chat */
  async chatStart(loc,name){if(LIVE){const {data,error}=await sb.rpc('chat_start',{p_location:loc,p_name:name});if(error)throw error;return data;}
    const d=demoDB(),c={id:uid(),token:uid(),location:loc,name,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),staff_unread:0,msgs:[]};d.chats.unshift(c);saveDemo(d);return {id:c.id,token:c.token};},
  async chatSend(id,token,body){if(LIVE){const {error}=await sb.rpc('chat_send',{p_chat:id,p_token:token,p_body:body});if(error)throw error;return;}
    const d=demoDB(),c=d.chats.find(x=>x.id===id&&x.token===token);if(!c)return;c.msgs.push({from:'customer',body,at:new Date().toISOString()});c.updated_at=new Date().toISOString();c.staff_unread=(c.staff_unread||0)+1;saveDemo(d);},
  async chatFetch(id,token){if(LIVE){const {data,error}=await sb.rpc('chat_fetch',{p_chat:id,p_token:token});if(error)throw error;return (data||[]).map(m=>({from:m.sender,body:m.body,at:m.created_at}));}
    const c=demoDB().chats.find(x=>x.id===id&&x.token===token);return c?c.msgs:[];},
  /* ---------- admin ---------- */
  admin:{
    async signIn(user,pass){if(LIVE){const {error}=await sb.auth.signInWithPassword({email:user,password:pass});if(error)throw error;return true;}
      if(String(pass)===String(CFG.demoPin||'1234')){sessionStorage.setItem('chunk_admin','1');return true;}throw new Error('Wrong PIN');},
    async isSignedIn(){if(LIVE){const {data}=await sb.auth.getSession();return !!data.session;}return sessionStorage.getItem('chunk_admin')==='1';},
    async signOut(){if(LIVE)await sb.auth.signOut();sessionStorage.removeItem('chunk_admin');},
    async load(){if(LIVE){await fetchLive();}else snap=demoDB();return snap;},
    async saveProduct(p){if(LIVE){const {error}=await sb.from('products').upsert({id:p.id,kind:p.kind,name:p.name,cat:p.cat,description:p.desc,allergens:p.allergens,img:p.img,sort:p.sort});if(error)throw error;return fetchLive();}
      const d=demoDB(),i=d.products.findIndex(x=>x.id===p.id);if(i>-1)d.products[i]=p;else d.products.push(p);saveDemo(d);},
    async deleteProduct(id){if(LIVE){await sb.from('availability').delete().eq('product_id',id);const {error}=await sb.from('products').delete().eq('id',id);if(error)throw error;return fetchLive();}
      const d=demoDB();d.products=d.products.filter(x=>x.id!==id);Object.values(d.availability).forEach(a=>delete a[id]);saveDemo(d);},
    async setAvail(loc,id,val){if(LIVE){const {error}=await sb.from('availability').upsert({location:loc,product_id:id,status:val.status||'ok',stock:val.stock===''||val.stock==null?null:+val.stock});if(error)throw error;return fetchLive();}
      const d=demoDB();(d.availability[loc]=d.availability[loc]||{})[id]={status:val.status||'ok',stock:val.stock===''||val.stock==null?null:+val.stock};saveDemo(d);},
    async saveLocation(id,data){if(LIVE){const {error}=await sb.from('locations').upsert({id,data});if(error)throw error;return fetchLive();}
      const d=demoDB();d.locations[id]=Object.assign({},d.locations[id],data);saveDemo(d);},
    async orders(loc){if(LIVE){const {data,error}=await sb.from('orders').select('*').eq('location',loc).order('created_at',{ascending:false}).limit(200);if(error)throw error;return data;}
      return demoDB().orders.filter(o=>o.location===loc);},
    async setOrderStatus(id,status){if(LIVE){const {error}=await sb.from('orders').update({status}).eq('id',id);if(error)throw error;return;}
      const d=demoDB(),o=d.orders.find(x=>x.id===id);if(o)o.status=status;saveDemo(d);},
    async chats(loc){if(LIVE){const {data,error}=await sb.from('chats').select('*').eq('location',loc).order('updated_at',{ascending:false}).limit(100);if(error)throw error;return data;}
      return demoDB().chats.filter(c=>c.location===loc);},
    async messages(chatId){if(LIVE){const {data,error}=await sb.from('messages').select('*').eq('chat_id',chatId).order('created_at');if(error)throw error;await sb.from('chats').update({staff_unread:0}).eq('id',chatId);return data.map(m=>({from:m.sender,body:m.body,at:m.created_at}));}
      const d=demoDB(),c=d.chats.find(x=>x.id===chatId);if(!c)return [];if(c.staff_unread){c.staff_unread=0;saveDemo(d);}return c.msgs;},
    async reply(chatId,body){if(LIVE){const {error}=await sb.from('messages').insert({chat_id:chatId,sender:'staff',body});if(error)throw error;await sb.from('chats').update({updated_at:new Date().toISOString()}).eq('id',chatId);return;}
      const d=demoDB(),c=d.chats.find(x=>x.id===chatId);if(!c)return;c.msgs.push({from:'staff',body,at:new Date().toISOString()});c.updated_at=new Date().toISOString();saveDemo(d);},
    watch(cb){if(LIVE){sb.channel('admin').on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>cb('orders')).on('postgres_changes',{event:'*',schema:'public',table:'messages'},()=>cb('chats')).on('postgres_changes',{event:'*',schema:'public',table:'chats'},()=>cb('chats')).subscribe();}
      else addEventListener('storage',e=>{if(e.key===KEY)cb('all');});},
    async uploadImage(blob,id){if(LIVE){const path=`${id}-${Date.now()}.webp`;const {error}=await sb.storage.from('products').upload(path,blob,{contentType:'image/webp',upsert:true});if(error)throw error;return sb.storage.from('products').getPublicUrl(path).data.publicUrl;}
      return await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(blob);});},
    resetDemo(){if(!LIVE){localStorage.removeItem(KEY);snap=demoDB();emit();}}
  }
};
window.CHUNK=API;
})();
