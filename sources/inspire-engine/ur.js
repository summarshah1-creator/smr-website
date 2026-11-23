/* Inspire FM · built-in Urdu for the app's main screens (home, menu bar, Toolbox, settings), so Urdu works straight away
   and offline. Other languages still use Google Translate on the live site. Words are matched exactly; names of shows,
   people and places stay as they are. Translations to be checked by an Urdu speaker before launch. */
(function () {
'use strict';
const H = document.documentElement;
const T = {
  'Assalamu alaikum': 'السلام علیکم', 'Next': 'اگلی نماز', 'Luton, United Kingdom': 'لوٹن، برطانیہ',
  'Fajr': 'فجر', 'Sunrise': 'طلوعِ آفتاب', 'Zuhr': 'ظہر', 'Asr': 'عصر', 'Maghrib': 'مغرب', 'Isha': 'عشاء', 'Jumu\'ah': 'جمعہ',
  'View all prayer times': 'نماز کے تمام اوقات دیکھیں', 'Jummah Winter Campaign': 'جمعہ سرمائی مہم', 'Give': 'عطیہ دیں',
  'Ayah a day': 'روزانہ ایک آیت', 'Learn it before midnight to keep your streak': 'سلسلہ جاری رکھنے کے لیے آدھی رات سے پہلے یاد کریں',
  'On air now': 'ابھی نشر ہو رہا ہے', 'Partly cloudy': 'جزوی ابر آلود', 'Example': 'مثال', 'Our partner': 'ہمارے شراکت دار',
  'Luton Foodbank': 'لوٹن فوڈ بینک', 'Get food help, find out how you can help out, and tips to get through this winter': 'کھانے کی مدد حاصل کریں، جانیں آپ کیسے مدد کر سکتے ہیں، اور اس سردی کے لیے مفید مشورے',
  'Dua of the day': 'آج کی دعا', 'The dua of Yunus (AS) in distress': 'مشکل میں حضرت یونس علیہ السلام کی دعا',
  'There is no god but You. Glory be to You. Truly, I have been among the wrongdoers.': 'تیرے سوا کوئی معبود نہیں، تو پاک ہے، بے شک میں ہی ظالموں میں سے تھا۔',
  'Toolbox': 'ٹول باکس', 'More': 'مزید', 'Qibla': 'قبلہ', 'Tasbih': 'تسبیح', 'Duas': 'دعائیں', 'Jummah': 'جمعہ', 'Prayer tracker': 'نماز ٹریکر',
  'Quran': 'قرآن', 'Hijri calendar': 'ہجری کیلنڈر', 'Zakat': 'زکوٰۃ', 'Kids\' corner': 'بچوں کا گوشہ', 'Hajj & Umrah': 'حج و عمرہ',
  'Watch free': 'مفت دیکھیں', 'View all': 'سب دیکھیں', 'Missed it? Catch up.': 'رہ گیا؟ ابھی سنیں۔', 'All': 'سب',
  'Latest reels': 'تازہ ریلز', 'Watch our latest reels': 'ہماری تازہ ریلز دیکھیں', 'Open Instagram': 'انسٹاگرام کھولیں',
  'Advertise with Inspire': 'انسپائر پر تشہیر کریں', 'Reach Luton\'s Muslim community, every day.': 'روزانہ لوٹن کی مسلم کمیونٹی تک پہنچیں۔', 'See packages': 'پیکجز دیکھیں',
  'Talk': 'گفتگو', 'Family': 'خاندان', 'Youth': 'نوجوان', 'Business': 'کاروبار', 'Community': 'کمیونٹی', 'Episode': 'قسط',
  /* Toolbox */
  'Search the Islamic toolbox': 'اسلامی ٹول باکس میں تلاش کریں', 'Every day': 'روزانہ', 'Masjid & community': 'مسجد اور کمیونٹی', 'Calendar': 'کیلنڈر', 'Money': 'مالیات', 'Learn': 'سیکھیں',
  'Prayer times': 'نماز کے اوقات', 'Today in Luton': 'آج لوٹن میں', 'Start a streak': 'سلسلہ شروع کریں', 'Tap to count': 'گننے کے لیے ٹیپ کریں', 'Weather': 'موسم', 'Luton forecast': 'لوٹن کا موسم',
  'Read & listen': 'پڑھیں اور سنیں', 'How I feel': 'میں کیسا محسوس کرتا ہوں', 'Guidance & help': 'رہنمائی اور مدد', 'Saved & all': 'محفوظ اور سب', 'Adhan alerts': 'اذان الرٹس', 'Off': 'بند', 'On': 'آن',
  'Live jamaat': 'جماعت کے اوقات', 'My masjid': 'میری مسجد', 'Nearest first': 'قریب ترین پہلے', 'Janazah': 'جنازہ', 'Notices': 'اعلانات', 'Noticeboard': 'نوٹس بورڈ',
  'Halal directory': 'حلال ڈائریکٹری', 'Local businesses': 'مقامی کاروبار', 'Report hate': 'نفرت کی رپورٹ', 'Get support': 'مدد حاصل کریں', 'This month': 'اس مہینے',
  'Ramadan': 'رمضان', 'Suhur & iftar': 'سحری و افطار', 'Islamic dates': 'اسلامی تاریخیں', 'Halal Money': 'حلال مالیات', 'Invest, home, business': 'سرمایہ کاری، گھر، کاروبار',
  'Calculator': 'کیلکولیٹر', 'Inheritance': 'وراثت', 'Learn to pray': 'نماز سیکھیں', 'Step by step': 'مرحلہ وار', 'How to dress': 'لباس کیسا ہو', 'Every school': 'ہر مکتبِ فکر',
  'Quran Stories': 'قرآنی قصے', '24 stories': '24 قصے', 'Watch': 'دیکھیں', 'Kids & Islamic videos': 'بچوں اور اسلامی ویڈیوز', 'Stories & learning': 'کہانیاں اور سیکھنا',
  /* menu bar and common */
  'Home': 'ہوم', 'Discover': 'دریافت', 'Listen': 'سنیں', 'Close': 'بند کریں', 'Settings': 'ترتیبات', 'Back': 'واپس'
};
const DAYS = { Monday: 'پیر', Tuesday: 'منگل', Wednesday: 'بدھ', Thursday: 'جمعرات', Friday: 'جمعہ', Saturday: 'ہفتہ', Sunday: 'اتوار' };
const MONTHS = { January: 'جنوری', February: 'فروری', March: 'مارچ', April: 'اپریل', May: 'مئی', June: 'جون', July: 'جولائی', August: 'اگست', September: 'ستمبر', October: 'اکتوبر', November: 'نومبر', December: 'دسمبر' };
const PR = { Fajr: 'فجر', Zuhr: 'ظہر', Asr: 'عصر', Maghrib: 'مغرب', Isha: 'عشاء' };
const RX = [
  [/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d+) (\w+)$/, (m, d, n, mo) => `${DAYS[d]}، ${n} ${MONTHS[mo] || mo}`],
  [/^(\d+)h (\d+)m to (\w+)$/, (m, h, mi, p) => `${PR[p] || p} میں ${h} گھنٹے ${mi} منٹ`],
  [/^(\d+)m (\d+)s to (\w+)$/, (m, mi, s, p) => `${PR[p] || p} میں ${mi} منٹ ${s} سیکنڈ`],
  [/^Today's ayah: (.+)$/, (m, a) => `آج کی آیت: ${a}`],
  [/^Next collection (.+)$/, (m, a) => `اگلا چندہ: ${a}`]
];
const tr = v => { const k = v.trim(); if (!k) return null; if (T[k]) return v.replace(k, T[k]); for (const [re, f] of RX) if (re.test(k)) return v.replace(k, k.replace(re, f)); return null; };
const done = new WeakMap();
function walk(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement && !n.parentElement.closest('script,style,svg,input,textarea,[data-noxl]') ? 1 : 2 }); let n;
  while ((n = w.nextNode())) { const t = tr(n.nodeValue); if (t && t !== n.nodeValue) { done.set(n, n.nodeValue); n.nodeValue = t; const p = n.parentElement; p.classList.add('ur-t'); p.setAttribute('lang', 'ur'); } }
  root.querySelectorAll && root.querySelectorAll('[aria-label],[placeholder]').forEach(el => { ['aria-label', 'placeholder'].forEach(a => { const v = el.getAttribute(a); const t = v && tr(v); if (t && t !== v) { el.dataset['ur' + a.replace('-', '')] = v; el.setAttribute(a, t); } }); });
}
let mo = null, on = false;
function enable() {
  on = true; H.classList.add('lang-ur'); H.setAttribute('lang', 'ur');
  if (!document.getElementById('urFont')) { const l = document.createElement('link'); l.id = 'urFont'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap'; document.head.appendChild(l); }
  walk(document.body);
  if (!mo) mo = new MutationObserver(ms => { if (!on) return; ms.forEach(m => { if (m.type === 'characterData') { const t = tr(m.target.nodeValue); if (t && t !== m.target.nodeValue) m.target.nodeValue = t; } else m.addedNodes.forEach(x => x.nodeType === 1 ? walk(x) : x.nodeType === 3 && x.parentNode && walk(x.parentNode)); }); });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
}
function disable() { on = false; store('en'); location.reload(); }
const store = v => { try { localStorage.setItem('ifm_lang', JSON.stringify(v)); } catch (e) {} };
const saved = (() => { try { return JSON.parse(localStorage.getItem('ifm_lang')); } catch (e) { return null; } })();
/* the language menus: Urdu is built in, everything else goes to the app's Google Translate handler */
document.addEventListener('change', e => { const s = e.target; if (!s || (s.id !== 'langSel' && s.id !== 'stLang')) return;
  if (s.value === 'ur') { e.stopImmediatePropagation(); store('ur'); const ls = document.getElementById('langSel'); if (ls) ls.value = 'ur'; enable(); return; }
  if (on && s.value === 'en') { e.stopImmediatePropagation(); disable(); } else if (on) store(s.value); }, true);
const css = document.createElement('style'); css.textContent = `
html.lang-ur .ur-t{font-family:"Noto Nastaliq Urdu","Amiri",serif!important;letter-spacing:0!important;line-height:1.9;direction:rtl;unicode-bidi:plaintext}
html.lang-ur h1.ur-t,html.lang-ur h2.ur-t,html.lang-ur h3.ur-t,html.lang-ur h4.ur-t,html.lang-ur b.ur-t{line-height:1.7}
html.lang-ur small.ur-t{line-height:1.8}`;
document.head.appendChild(css);
const start = () => { const ls = document.getElementById('langSel'); if (saved === 'ur') { if (ls) ls.value = 'ur'; enable(); } };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
window.IFM_UR = { enable, tr };
})();
