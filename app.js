
(function(){
'use strict';

/* ═══════════════════════════════════════════════════════════
   1. CONSTANTS
   ═══════════════════════════════════════════════════════════ */
var KEY         = 'daftary_v5';
var THEME_KEY   = 'daftary_theme';
var UNLOCK_KEY  = 'daftary_unlocked';
var OPEN_KEY    = 'daftary_last_open';
var GREET_KEY   = 'daftary_today_greet';
var TOAST_MS    = 2400;
var UNDO_MS     = 7000;
var LOG_LIMIT   = 60;
var RECUR_GUARD = 500;

var KINDS = {
  mine:    { label:'مصروفاتي',   icon:'wallet',    tone:'mine',    type:'normal',  sub:'حسابك الشخصي' },
  custody: { label:'فلوس مع حد', icon:'handshake', tone:'custody', type:'custody', sub:'عهدة بيصرفها ويجيبلك فواتير' },
  other:   { label:'حاجة تانية', icon:'book',      tone:'other',   type:'normal',  sub:'أي حساب تاني' }
};

var KLABEL = { add:'مصروف', give:'فلوس اتدفعت', spend:'صرف' };

var REP = {
  none:    'مرة واحدة',
  weekly:  'كل أسبوع',
  monthly: 'كل شهر',
  yearly:  'كل سنة'
};

var DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
var MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

/* ═══════════════════════════════════════════════════════════
   2. GREETINGS — تحيات + صلاة + أذكار + آيات
   ═══════════════════════════════════════════════════════════ */

/* ─── تحيات الصباح ─── */
var GREET_MORNING = [
  'صباح الخير يا حاج محمد 🌟',
  'صباح الخير يا حمايا العزيز 💚',
  'صباح الخير يا الغالي ❤️',
  'صباح الخير يا حاج محمد القمر ✨',
  'صباح الخير يا أغلى حاج 🌹',
  'صباح الفل يا حاجنا 😄',
  'صباح الخير يا راجل يا طيب 🤲',
  'صباح السكر يا حمايا العزيز 🍯',
  'يا هلا بالحاج! صباح الخير 😎',
  'صباح الخير يا أحلى حاج في الدنيا 🌟'
];

/* ─── تحيات الظهر ─── */
var GREET_NOON = [
  'نهارك جميل يا حاج محمد 🌟',
  'نهارك سعيد يا حمايا العزيز 💚',
  'نهارك فل يا غالي ❤️',
  'نهارك جميل يا حاجنا ✨',
  'على خير يا حاج محمد 😄',
  'نهارك سكر يا حمايا 🍯'
];

/* ─── تحيات المسا ─── */
var GREET_EVENING = [
  'مسا الخير يا حاج محمد 🌙',
  'مسا الخير يا حمايا العزيز 💚',
  'مسا الخير يا غالي ❤️',
  'مسا الخير يا حاجنا ✨',
  'مسا الفل يا حاج محمد 🌹',
  'ليلة سعيدة يا حاجنا 🌟'
];

/* ─── الصلاة على النبي ﷺ ─── */
var GREET_SALAT = [
  'اللهم صلِّ وسلم على سيدنا محمد ﷺ',
  'صلوا على الحبيب ﷺ ❤️',
  'اللهم صلِّ على محمد وعلى آل محمد 🌟',
  'صلِّ على النبي يا حاج ﷺ 💚',
  'اللهم صلِّ وسلم وبارك على نبينا محمد ﷺ',
  'صلاة على الحبيب تفرج الهموم ﷺ 🌹',
  'اللهم صلِّ على سيدنا محمد عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته'
];

/* ─── أذكار ─── */
var GREET_ATHKAR = [
  'سبحان الله وبحمده، سبحان الله العظيم 🌟',
  'لا إله إلا الله وحده لا شريك له 🤲',
  'الحمد لله على كل حال 💚',
  'سبحان الله والحمد لله ولا إله إلا الله والله أكبر',
  'لا حول ولا قوة إلا بالله 🌹',
  'أستغفر الله العظيم وأتوب إليه',
  'اللهم إني أسألك الجنة وأعوذ بك من النار',
  'حسبي الله ونعم الوكيل 🤲',
  'اللهم اغفر لي ولوالديّ وللمؤمنين يوم يقوم الحساب',
  'لا إله إلا أنت سبحانك إني كنت من الظالمين'
];

/* ─── آيات قرآنية ─── */
var GREET_AYAT = [
  '﴿وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ﴾ — الكهف',
  '﴿فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ﴾ — البقرة',
  '﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾ — الرعد',
  '﴿وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ﴾ — البقرة',
  '﴿إِنَّ اللَّهَ مَعَ الصَّابِرِينَ﴾ — البقرة',
  '﴿وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ﴾ — الطلاق',
  '﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾ — الشرح',
  '﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾ — طه',
  '﴿رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً﴾ — البقرة',
  '﴿وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ﴾ — الحديد',
  '﴿إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ﴾ — الأحزاب'
];

function pickRandom(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

/* الرسالة تتغير كل شوية */
function getGreeting(){
  var now = new Date();
  var h = now.getHours();

  /* اختار التحية حسب الوقت */
  var greetPool;
  if (h < 12) greetPool = GREET_MORNING;
  else if (h < 17) greetPool = GREET_NOON;
  else greetPool = GREET_EVENING;

  var greeting = pickRandom(greetPool);

  /* كل 3 فتحات، ضيف ذكر/صلاة/آية */
  var count = 0;
  try {
    count = parseInt(localStorage.getItem('daftary_greet_count') || '0', 10) || 0;
  } catch(e){}
  count++;
  try { localStorage.setItem('daftary_greet_count', String(count)); } catch(e){}

  /* 60% تحية بس، 40% تحية + إضافة */
  if (count % 3 === 0 || Math.random() < 0.4){
    var extras = GREET_SALAT.concat(GREET_ATHKAR, GREET_AYAT);
    var extra = pickRandom(extras);
    greeting = greeting + '\n' + extra;
  }

  return greeting;
}

/* ═══════════════════════════════════════════════════════════
   3. UTILITIES
   ═══════════════════════════════════════════════════════════ */
function $(id){ return document.getElementById(id); }

function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function escAttr(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/`/g,'&#96;');
}

function money(n){
  n = Number(n) || 0;
  return (Math.round(n * 100) / 100).toLocaleString('en-US');
}

function parseNum(s){
  if (typeof s === 'number') return isFinite(s) ? s : NaN;
  s = String(s == null ? '' : s)
    .replace(/[٠-٩]/g, function(d){ return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); })
    .replace(/[,\u060C\u066C]/g, '')
    .replace(/\u066B/g, '.')
    .replace(/[^\d.-]/g, '');
  var n = parseFloat(s);
  return isFinite(n) ? n : NaN;
}

function pad(n){ return String(n).padStart(2, '0'); }
function r2(n){ return Math.round(n * 100) / 100; }

function fmtTime(ts){
  var d = new Date(ts), h = d.getHours();
  return (h % 12 || 12) + ':' + pad(d.getMinutes()) + ' ' + (h >= 12 ? 'م' : 'ص');
}

function fmtDate(ts){
  var d = new Date(ts);
  return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
}

function fmtShort(ts){
  var d = new Date(ts);
  return d.getDate() + '/' + (d.getMonth() + 1);
}

function dayKey(ts){
  var d = new Date(ts);
  return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
}

function dayLabel(d){
  var t = dayKey(Date.now());
  var y = dayKey(Date.now() - 86400000);
  var k = dayKey(d.getTime());
  var base = DAYS[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
  if (k === t) return base + ' · النهاردة';
  if (k === y) return base + ' · امبارح';
  return base;
}

function ymd(d){
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function fromYMD(s){
  var p = String(s || '').split('-');
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

function today0(){
  var d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysTo(s){
  return Math.round((fromYMD(s) - today0()) / 86400000);
}

function dayWord(n){
  if (n === 1) return 'يوم';
  if (n === 2) return 'يومين';
  if (n <= 10) return n + ' أيام';
  return n + ' يوم';
}

function dueLabel(n){
  if (n < 0) return 'متأخر ' + dayWord(-n);
  if (n === 0) return 'النهاردة';
  if (n === 1) return 'بكرة';
  return 'بعد ' + dayWord(n);
}

function fmtDue(s){
  var d = fromYMD(s);
  return DAYS[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
}

function nextDate(due){
  var d = fromYMD(due.date);
  var dom = due.dom || d.getDate();
  var y, m, last;
  if (due.repeat === 'weekly'){ d.setDate(d.getDate() + 7); }
  else if (due.repeat === 'monthly'){
    y = d.getFullYear(); m = d.getMonth() + 1;
    last = new Date(y, m + 1, 0).getDate();
    d = new Date(y, m, Math.min(dom, last));
  } else if (due.repeat === 'yearly'){
    y = d.getFullYear() + 1; m = d.getMonth();
    last = new Date(y, m + 1, 0).getDate();
    d = new Date(y, m, Math.min(dom, last));
  }
  return ymd(d);
}

function debounce(fn, ms){
  var t;
  return function(){
    var ctx = this, args = arguments;
    clearTimeout(t);
    t = setTimeout(function(){ fn.apply(ctx, args); }, ms);
  };
}

function safeParse(s){
  try { return JSON.parse(s); } catch(e){ return null; }
}

function svg(name, extra){
  return '<svg' + (extra || '') + ' aria-hidden="true"><use href="#i-' + name + '"/></svg>';
}

/* اهتزاز خفيف على الموبايل */
function haptic(type){
  if (!navigator.vibrate) return;
  var map = {
    tap:    [8],
    light:  [10],
    medium: [18],
    success:[12, 40, 12],
    error:  [30, 60, 30],
    warn:   [50, 30, 50]
  };
  var pattern = map[type] || map.tap;
  try { navigator.vibrate(pattern); } catch(e){}
}
function daysInMonth(year, month){
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year, month){
  return new Date(year, month, 1).getDay();
}

/* ═══════════════════════════════════════════════════════════
   4. DATA LAYER
   ═══════════════════════════════════════════════════════════ */
var mem = null;

function blankDB(){
  return {
    accounts: [],
    people:   [],
    dues:     [],
    duesLog:  [],
    budgets:  {},
    settings: {}
  };
}

function norm(d){
  d = d || {};
  if (!Array.isArray(d.accounts)) d.accounts = [];
  if (!Array.isArray(d.people))   d.people   = [];
  if (!Array.isArray(d.dues))     d.dues     = [];
  if (!Array.isArray(d.duesLog))  d.duesLog  = [];
  if (!d.budgets || typeof d.budgets !== 'object' || Array.isArray(d.budgets)) d.budgets = {};
  if (!d.settings || typeof d.settings !== 'object' || Array.isArray(d.settings)) d.settings = {};

  d.accounts.forEach(function(a){
    if (!Array.isArray(a.entries)) a.entries = [];
    if (!Array.isArray(a.rounds))  a.rounds  = [];
    if (!a.rounds.length) a.rounds.push({ id: uid(), start: Date.now(), end: null });

    var cur = null;
    for (var i = 0; i < a.rounds.length; i++){
      if (!a.rounds[i].end){ cur = a.rounds[i]; break; }
    }
    if (!cur) cur = a.rounds[0];

    a.entries.forEach(function(e){
      if (!e.roundId) e.roundId = cur.id;
      if (!e.id) e.id = uid();
    });

    if (!a.id)   a.id   = uid();
    if (!a.kind) a.kind = 'other';
    if (!a.name) a.name = 'حساب';
    if (!a.type) a.type = KINDS[a.kind] ? KINDS[a.kind].type : 'normal';
    if (a.colorIdx == null && a.kind === 'other'){
      a.colorIdx = d.accounts.indexOf(a) % 5;
    }
  });

  return d;
}

function load(){
  var raw = null;
  try { raw = localStorage.getItem(KEY); } catch(e){ raw = null; }
  if (raw){
    var p = safeParse(raw);
    if (p) return norm(p);
  }
  if (mem){
    var p2 = safeParse(mem);
    if (p2) return norm(p2);
  }
  return blankDB();
}

var db = load();

function save(){
  var s;
  try { s = JSON.stringify(db); } catch(e){ return false; }
  mem = s;
  try {
    localStorage.setItem(KEY, s);
    document.documentElement.removeAttribute('data-storage-error');
    return true;
  } catch(e){
    document.documentElement.setAttribute('data-storage-error', '1');
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════
   5. STATE
   ═══════════════════════════════════════════════════════════ */
var ui = {
  tab: 'home',
  screen: 'home',
  accId: null,
  roundId: null,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  moreSub: null
};

var editId = null;
var sheetBack = null;
var stmtCache = '';
var undoSnapshot = null;
var undoTimer = null;
var toastTimer = null;
var deferredInstall = null;
var searchQuery = '';
var searchFilter = 'all';
var theme = 'light';

/* ═══════════════════════════════════════════════════════════
   6. THEME
   ═══════════════════════════════════════════════════════════ */
function detectTheme(){
  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch(e){}
  if (saved === 'light' || saved === 'dark') return saved;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function applyTheme(t){
  theme = t;
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(THEME_KEY, t); } catch(e){}
  var meta = $('themeColor');
  if (meta) meta.setAttribute('content', t === 'dark' ? '#1B222C' : '#EAF4F2');
  var btn = $('themeToggle');
  if (btn){
    btn.innerHTML = svg(t === 'dark' ? 'sun' : 'moon', ' width="22" height="22"');
    btn.setAttribute('aria-label', t === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي');
  }
}

function toggleTheme(){
  haptic('light');
  applyTheme(theme === 'dark' ? 'light' : 'dark');
}

/* ═══════════════════════════════════════════════════════════
   7. HELPERS
   ═══════════════════════════════════════════════════════════ */
function acc(){
  for (var i = 0; i < db.accounts.length; i++){
    if (db.accounts[i].id === ui.accId) return db.accounts[i];
  }
  return null;
}

function curRound(a){
  if (!a || !a.rounds) return null;
  for (var i = 0; i < a.rounds.length; i++){
    if (!a.rounds[i].end) return a.rounds[i];
  }
  return a.rounds[0] || null;
}

function findE(a, id){
  if (!a || !a.entries) return null;
  for (var i = 0; i < a.entries.length; i++){
    if (a.entries[i].id === id) return a.entries[i];
  }
  return null;
}

function kindOf(a){ return KINDS[a.kind] || KINDS.other; }

function accountColors(a){
  var k = kindOf(a);
  if (k.tone === 'mine')    return { l:'var(--acc-mine-l)',    d:'var(--acc-mine)' };
  if (k.tone === 'custody') return { l:'var(--acc-custody-l)', d:'var(--acc-custody)' };
  var colors = [
    { l:'var(--acc-other-1-l)', d:'var(--acc-other-1)' },
    { l:'var(--acc-other-2-l)', d:'var(--acc-other-2)' },
    { l:'var(--acc-other-3-l)', d:'var(--acc-other-3)' },
    { l:'var(--acc-other-4-l)', d:'var(--acc-other-4)' },
    { l:'var(--acc-other-5-l)', d:'var(--acc-other-5)' }
  ];
  var idx = (a.colorIdx != null ? a.colorIdx : 0) % colors.length;
  return colors[idx];
}

function stats(a, rid){
  var s = { total:0, given:0, spent:0, n:0, noRec:0, left:0 };
  if (!a || !a.entries) return s;
  for (var i = 0; i < a.entries.length; i++){
    var e = a.entries[i];
    if (e.roundId !== rid) continue;
    s.n++;
    var amt = Number(e.amount) || 0;
    if (e.kind === 'add' && e.counted) s.total += amt;
    if (e.kind === 'give') s.given += amt;
    if (e.kind === 'spend'){
      s.spent += amt;
      if (e.hasReceipt === false) s.noRec++;
    }
  }
  s.total = r2(s.total);
  s.given = r2(s.given);
  s.spent = r2(s.spent);
  s.left  = r2(s.given - s.spent);
  return s;
}

function todayTotal(a, rid){
  var k = dayKey(Date.now());
  var t = 0;
  if (!a || !a.entries) return 0;
  for (var i = 0; i < a.entries.length; i++){
    var e = a.entries[i];
    if (e.roundId !== rid) continue;
    if (e.kind !== 'add' || !e.counted) continue;
    if (dayKey(e.ts) !== k) continue;
    t += Number(e.amount) || 0;
  }
  return t;
}

function todayTotalAll(){
  var k = dayKey(Date.now());
  var t = 0;
  for (var i = 0; i < db.accounts.length; i++){
    var a = db.accounts[i];
    var r = curRound(a);
    if (!r) continue;
    for (var j = 0; j < a.entries.length; j++){
      var e = a.entries[j];
      if (e.roundId !== r.id) continue;
      if (e.kind !== 'add' || !e.counted) continue;
      if (dayKey(e.ts) !== k) continue;
      t += Number(e.amount) || 0;
    }
  }
  return t;
}

function monthStats(){
  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth();
  var total = 0, count = 0;
  for (var i = 0; i < db.accounts.length; i++){
    var a = db.accounts[i];
    var r = curRound(a);
    if (!r) continue;
    for (var j = 0; j < a.entries.length; j++){
      var e = a.entries[j];
      if (e.roundId !== r.id) continue;
      if (e.kind !== 'add' || !e.counted) continue;
      var d = new Date(e.ts);
      if (d.getFullYear() !== y || d.getMonth() !== m) continue;
      total += Number(e.amount) || 0;
      count++;
    }
  }
  return { total: total, count: count };
}

function last7Days(){
  var now = new Date();
  var arr = [];
  for (var i = 6; i >= 0; i--){
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    arr.push({
      date: d, key: ymd(d), day: d.getDay(),
      label: DAYS[d.getDay()].slice(0, 3), total: 0
    });
  }
  for (var a = 0; a < db.accounts.length; a++){
    var account = db.accounts[a];
    var r = curRound(account);
    if (!r) continue;
    for (var e = 0; e < account.entries.length; e++){
      var entry = account.entries[e];
      if (entry.roundId !== r.id) continue;
      if (entry.kind !== 'add' || !entry.counted) continue;
      var ek = ymd(new Date(entry.ts));
      for (var k = 0; k < arr.length; k++){
        if (arr[k].key === ek){ arr[k].total += Number(entry.amount) || 0; break; }
      }
    }
  }
  return arr;
}

function duesInfo(){
  var over = 0, cnt = 0, sum = 0;
  for (var i = 0; i < db.dues.length; i++){
    var d = db.dues[i];
    var n = daysTo(d.date);
    if (n < 0) over++;
    if (n <= 7){ cnt++; sum += Number(d.amount) || 0; }
  }
  return { over: over, cnt: cnt, sum: sum };
}

function addPerson(n){
  n = String(n || '').trim();
  if (n && db.people.indexOf(n) < 0) db.people.push(n);
}

/* ═══════════════════════════════════════════════════════════
   8. SMART PARSE — الكتابة السريعة الذكية
   ═══════════════════════════════════════════════════════════ */
function smartParse(input){
  if (!input) return { amount: NaN, note: '' };

  input = String(input).trim();
  if (!input) return { amount: NaN, note: '' };

  var numMatch = input.match(/\d+(\.\d+)?/g);
  var amount = NaN;
  var note = input;

  if (numMatch && numMatch.length){
    var lastNum = numMatch[numMatch.length - 1];
    amount = parseFloat(lastNum);
    note = input.replace(lastNum, '').replace(/\s+/g, ' ').trim();
  }

  return { amount: amount, note: note };
}

/* ═══════════════════════════════════════════════════════════
   9. TOAST + UNDO
   ═══════════════════════════════════════════════════════════ */
function toast(t){
  var el = $('toast');
  if (!el) return;
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ el.classList.remove('show'); }, TOAST_MS);
}

function snapshot(){ return JSON.stringify(db); }

function offerUndo(before, label){
  undoSnapshot = before;
  var el = $('undo');
  if (!el) return;
  el.innerHTML = '<span>' + esc(label) + '</span>' +
    '<button type="button" onclick="Daftary.undoLastAction()">تراجع</button>';
  el.removeAttribute('hidden');
  clearTimeout(undoTimer);
  undoTimer = setTimeout(function(){
    el.setAttribute('hidden', '');
    undoSnapshot = null;
  }, UNDO_MS);
}

function undoLastAction(){
  if (!undoSnapshot) return;
  try {
    db = norm(JSON.parse(undoSnapshot));
    save();
    undoSnapshot = null;
    clearTimeout(undoTimer);
    var el = $('undo');
    if (el) el.setAttribute('hidden', '');
    render();
    toast('تم التراجع بنجاح ✓');
    if (window.Sound) Sound.undo();
  } catch(e){
    toast('مقدرناش نرجّع التغيير');
  }
}

/* ═══════════════════════════════════════════════════════════
   10. NAVIGATION
   ═══════════════════════════════════════════════════════════ */
function nav(tab){
  if (tab === 'add'){ haptic('medium'); openAddSheet(); return; }
  haptic('light');
  if (window.Sound) Sound.tab();
  ui.tab = tab;
  if (tab === 'home') ui.screen = 'home';
  else if (tab === 'search'){ ui.screen = 'search'; searchQuery = ''; searchFilter = 'all'; }
  else if (tab === 'calendar') ui.screen = 'calendar';
  else if (tab === 'more'){ ui.screen = 'more'; ui.moreSub = null; }
  render();
  window.scrollTo(0, 0);
}

function goScreen(screen, accId, roundId){
  ui.screen = screen;
  if (accId !== undefined) ui.accId = accId;
  if (roundId !== undefined) ui.roundId = roundId;
  render();
  window.scrollTo(0, 0);
}

function back(){
  if (ui.moreSub){ ui.moreSub = null; render(); return; }
  if (ui.screen === 'dues'){ ui.tab = 'home'; ui.screen = 'home'; }
  else if (ui.screen === 'round') ui.screen = 'archive';
  else if (ui.screen === 'archive' || ui.screen === 'account' || ui.screen === 'stats'){
    ui.tab = 'home';
    ui.screen = 'home';
  } else { ui.tab = 'home'; ui.screen = 'home'; }
  render();
  window.scrollTo(0, 0);
}

/* ═══════════════════════════════════════════════════════════
   11. RENDER CORE
   ═══════════════════════════════════════════════════════════ */
function render(){
  var header = $('header');
  var view = $('view');
  if (!header || !view) return;

  header.innerHTML = renderHeader();
  view.innerHTML = renderView();
  renderNav();
  applyTheme(theme);

  var onScroll = function(){
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.onscroll = onScroll;
  onScroll();
}

function renderHeader(){
  var isSub = (ui.screen === 'account' || ui.screen === 'archive' ||
               ui.screen === 'round' || ui.screen === 'dues' ||
               ui.screen === 'stats' || ui.moreSub);

  if (isSub){
    var a = acc();
    var title = '';
    if (ui.screen === 'account' && a) title = a.name;
    else if (ui.screen === 'archive' && a) title = 'أرشيف ' + a.name;
    else if (ui.screen === 'round') title = 'جولة خلصت';
    else if (ui.screen === 'dues') title = 'المستحقات';
    else if (ui.screen === 'stats') title = 'التقارير';
    else if (ui.moreSub === 'budget') title = 'الميزانية';
    else if (ui.moreSub === 'security') title = 'الأمان';
    else if (ui.moreSub === 'backup') title = 'النسخ الاحتياطي';
    else if (ui.moreSub === 'stats') title = 'التقارير';
    else if (ui.moreSub === 'help') title = 'المساعدة';
    else if (ui.moreSub === 'about') title = 'عن دفتري';
    else title = 'المزيد';

    return '<button type="button" class="h-btn" onclick="Daftary.back()" aria-label="رجوع">' +
        svg('back', ' width="22" height="22"') +
      '</button>' +
      '<div class="h-greet" style="text-align:center;align-items:center;flex:1">' +
        '<span class="sub" style="font-size:20px">' + esc(title) + '</span>' +
      '</div>' +
      '<button type="button" class="h-btn theme-btn" id="themeToggle" onclick="Daftary.toggleTheme()" aria-label="تبديل الوضع"></button>';
  }

  return '<div class="h-greet">' +
      '<span class="hi">' + esc(getGreeting()) + '</span>' +
      '<span class="sub">دفتري</span>' +
    '</div>' +
    '<div class="h-actions">' +
      '<button type="button" class="h-btn theme-btn" id="themeToggle" onclick="Daftary.toggleTheme()" aria-label="تبديل الوضع"></button>' +
    '</div>';
}

function renderView(){
  if (ui.screen === 'account')  return accountHTML();
  if (ui.screen === 'archive')  return archiveHTML();
  if (ui.screen === 'round')    return roundHTML();
  if (ui.screen === 'dues')     return duesHTML();
  if (ui.screen === 'search')   return searchHTML();
  if (ui.screen === 'calendar') return calendarHTML();
  if (ui.screen === 'more')     return moreHTML();
  return homeHTML();
}

function renderNav(){
  var el = $('nav');
  if (!el) return;
  var tabs = [
    { id:'home',     icon:'home',     label:'الرئيسية' },
    { id:'search',   icon:'search',   label:'بحث' },
    { id:'add',      icon:'plus',     label:'' },
    { id:'calendar', icon:'calendar', label:'تقويم' },
    { id:'more',     icon:'more',     label:'مزيد' }
  ];
  var html = '';
  for (var i = 0; i < tabs.length; i++){
    var t = tabs[i];
    var active = (t.id !== 'add' && ui.tab === t.id && ui.screen === t.id) ? ' active' : '';
    var addClass = t.id === 'add' ? ' nav-add' : '';
    html += '<button type="button" class="nav-btn' + active + addClass + '" onclick="Daftary.nav(\'' + t.id + '\')" aria-label="' + esc(t.label || 'إضافة') + '">' +
      svg(t.icon, ' width="24" height="24"') +
      (t.label ? '<span>' + t.label + '</span>' : '') +
    '</button>';
  }
  el.innerHTML = html;
}

/* ═══════════════════════════════════════════════════════════
   12. HOME SCREEN
   ═══════════════════════════════════════════════════════════ */
function homeHTML(){
  var ms = monthStats();
  var budget = Number(db.budgets.__overall__) || 0;
  var pct = budget > 0 ? Math.min(100, Math.round(ms.total / budget * 100)) : 0;
  var over = budget > 0 && ms.total > budget;

  var hero =
    '<section class="hero">' +
      '<div class="hero-label">' + svg('target', ' width="16" height="16"') + ' صرفك الشهر ده</div>' +
      '<div class="hero-big">' + money(ms.total) + '<small>ج</small></div>' +
      '<div class="hero-hint">' + ms.count + ' حركة' +
        (budget > 0 ? ' · ميزانية ' + money(budget) + ' ج' : '') +
      '</div>' +
      (budget > 0
        ? '<div class="hero-prog"><i class="' + (over ? 'over' : '') + '" style="width:' + pct + '%"></i></div>'
        : '') +
    '</section>';

  var accountsHtml = '';
  if (db.accounts.length){
    for (var i = 0; i < db.accounts.length; i++){
      accountsHtml += accountCard(db.accounts[i]);
    }
  } else {
    accountsHtml =
      '<div class="empty">' +
        '<div class="empty-icon">' + svg('wallet', ' width="28" height="28"') + '</div>' +
        '<b>لسه مفيش حسابات</b>' +
        'دوس على ➕ تحت وابدأ بأول حساب' +
      '</div>';
  }

  var recent = recentEntries(5);
  var recentHtml = '';
  if (recent.length){
    for (var j = 0; j < recent.length; j++){
      recentHtml += recentRow(recent[j]);
    }
  } else {
    recentHtml = '<div class="empty">' +
      '<div class="empty-icon">' + svg('book', ' width="28" height="28"') + '</div>' +
      '<b>مفيش حركات لسه</b>' +
      'أول ما تسجّل هتظهر هنا' +
    '</div>';
  }

  var todayCard = todayHTML();
  var duesLink = db.dues.length
    ? '<button type="button" class="btn ghost small" style="margin-bottom:10px" onclick="Daftary.goScreen(\'dues\')">' +
        svg('calendar', ' width="18" height="18"') + ' كل المستحقات (' + db.dues.length + ')' +
      '</button>'
    : '';

  return hero +
    (todayCard ? '<div class="section">' + todayCard + '</div>' : '') +
    '<div class="section">' +
      '<div class="section-h">' +
        '<h2>حساباتك <small>(' + db.accounts.length + ')</small></h2>' +
      '</div>' + accountsHtml +
    '</div>' +
    '<div class="section">' +
      '<div class="section-h"><h2>آخر الحركات</h2></div>' + recentHtml +
    '</div>' +
    duesLink;
}

function recentRow(r){
  var e = r.entry;
  var a = r.acc;
  return '<button type="button" class="entry" style="border-radius:18px;border:1.5px solid var(--line);margin-bottom:10px;padding:14px 16px" onclick="Daftary.openEntryPublic(\'' + a.id + '\',\'' + e.id + '\')">' +
    '<div class="entry-mid">' +
      '<div class="entry-name">' + esc(e.note || KLABEL[e.kind] || 'حركة') + '</div>' +
      '<div class="entry-meta">' +
        '<span>' + esc(a.name) + '</span>' +
        '<span class="dot"></span>' +
        '<span>' + fmtDate(e.ts) + '</span>' +
        '<span class="dot"></span>' +
        '<span>' + fmtTime(e.ts) + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="entry-amt' + (e.kind === 'give' ? ' plus' : '') + '">' +
      (e.kind === 'give' ? '+' : '') + money(e.amount) +
    '</div>' +
  '</button>';
}

function todayHTML(){
  var spent = 0, withPeople = 0;
  for (var i = 0; i < db.accounts.length; i++){
    var a = db.accounts[i];
    var r = curRound(a);
    if (!r) continue;
    var s = stats(a, r.id);
    if (a.type === 'custody') withPeople += s.left;
    else spent += todayTotal(a, r.id);
  }
  var di = duesInfo();
  var rows = '';

  if (spent > 0){
    rows += '<div class="t-row">' +
      '<div class="t-i">' + svg('wallet', ' width="20" height="20"') + '</div>' +
      '<div class="t-m"><b>صرفك النهارده</b><span>' + fmtDate(Date.now()) + '</span></div>' +
      '<div class="t-v">' + money(spent) + ' ج</div>' +
    '</div>';
  }

  if (di.cnt > 0){
    rows += '<button type="button" class="t-row" onclick="Daftary.goScreen(\'dues\')">' +
      '<div class="t-i">' + svg('calendar', ' width="20" height="20"') + '</div>' +
      '<div class="t-m"><b>مستحقات قريبة</b><span>' + (di.over ? di.over + ' متأخر' : 'خلال 7 أيام') + '</span></div>' +
      '<div class="t-v ' + (di.over ? 'danger' : 'warn') + '">' + (di.sum > 0 ? money(di.sum) + ' ج' : di.cnt) + '</div>' +
    '</button>';
  }

  if (withPeople > 0){
    rows += '<div class="t-row">' +
      '<div class="t-i">' + svg('handshake', ' width="20" height="20"') + '</div>' +
      '<div class="t-m"><b>فلوس لسه مع حد</b><span>الباقي عندهم</span></div>' +
      '<div class="t-v">' + money(withPeople) + ' ج</div>' +
    '</div>';
  }

  if (!rows) return '';
  return '<div class="section-h"><h2>النهاردة</h2></div><div class="today">' + rows + '</div>';
}

function accountCard(a){
  var r = curRound(a);
  var s = stats(a, r ? r.id : null);
  var k = kindOf(a);
  var colors = accountColors(a);
  var val, cap, cls = '';

  if (a.type === 'custody'){ val = s.left; cap = 'الباقي معاه'; }
  else { val = s.total; cap = 'الإجمالي'; }
  if (!val) cls = 'zero';

  return '<button type="button" class="account-card" style="--ac:' + colors.d + ';--ic-l:' + colors.l + ';--ic-d:' + colors.d + '" onclick="Daftary.goScreen(\'account\',\'' + a.id + '\')">' +
    '<div class="account-icon">' + svg(k.icon, ' width="24" height="24"') + '</div>' +
    '<div class="account-mid">' +
      '<div class="account-name">' + esc(a.name) + '</div>' +
      '<div class="account-tag">' + esc(a.title || k.label) + '</div>' +
    '</div>' +
    '<div class="account-num">' +
      '<b class="' + cls + '">' + money(val) + ' ج</b>' +
      '<span>' + cap + '</span>' +
    '</div>' +
  '</button>';
}

function recentEntries(n){
  var all = [];
  for (var i = 0; i < db.accounts.length; i++){
    var a = db.accounts[i];
    for (var j = 0; j < a.entries.length; j++){
      all.push({ entry: a.entries[j], acc: a });
    }
  }
  all.sort(function(x, y){ return y.entry.ts - x.entry.ts; });
  return all.slice(0, n);
}

/* ═══════════════════════════════════════════════════════════
   13. ACCOUNT SCREEN
   ═══════════════════════════════════════════════════════════ */
function recTag(e){
  if (e.kind !== 'spend') return '';
  if (e.hasReceipt === true)  return '<span class="tag g">فاتورة ✓</span>';
  if (e.hasReceipt === false) return '<span class="tag a">من غير فاتورة</span>';
  return '';
}

function titleOf(e){
  if (e.note) return esc(e.note);
  if (e.kind === 'add') return 'من غير ملاحظة';
  return KLABEL[e.kind] || '';
}

function tagOf(e){
  if (e.kind === 'give') return '<span class="tag g">دفعتله</span>';
  if (e.kind === 'spend') return recTag(e);
  if (e.kind === 'add' && !e.counted) return '<span class="tag n">مش بيتجمع</span>';
  return '';
}

function entryRow(e, ro){
  var cls = (e.kind === 'add' && !e.counted) ? 'off' : '';
  var from = (e.kind === 'spend' && e.from) ? esc(e.from) : '';

  return '<button type="button" class="entry ' + cls + '" onclick="Daftary.openEntry(\'' + e.id + '\',' + (ro ? 'true' : 'false') + ')">' +
    '<div class="entry-mid">' +
      '<div class="entry-name">' + titleOf(e) + '</div>' +
      '<div class="entry-meta">' +
        '<span>' + fmtTime(e.ts) + '</span>' +
        (from ? '<span class="dot"></span><span>' + from + '</span>' : '') +
        tagOf(e) +
      '</div>' +
    '</div>' +
    '<div class="entry-amt' + (e.kind === 'give' ? ' plus' : '') + '">' +
      (e.kind === 'give' ? '+' : '') + money(e.amount) +
    '</div>' +
  '</button>';
}

function dayTheme(d){
  var vars = [
    { t:'var(--day-sun-bg)', d:'var(--day-sun-fg)' },
    { t:'var(--day-mon-bg)', d:'var(--day-mon-fg)' },
    { t:'var(--day-tue-bg)', d:'var(--day-tue-fg)' },
    { t:'var(--day-wed-bg)', d:'var(--day-wed-fg)' },
    { t:'var(--day-thu-bg)', d:'var(--day-thu-fg)' },
    { t:'var(--day-fri-bg)', d:'var(--day-fri-fg)' },
    { t:'var(--day-sat-bg)', d:'var(--day-sat-fg)' }
  ];
  return vars[d.getDay()];
}

function entriesHTML(a, rid, ro){
  if (!a || !a.entries) return '<div class="empty">لسه مفيش حركات.</div>';

  var list = [];
  for (var i = 0; i < a.entries.length; i++){
    if (a.entries[i].roundId === rid) list.push(a.entries[i]);
  }
  list.sort(function(x, y){ return y.ts - x.ts; });

  if (!list.length) return '<div class="empty">' +
    '<div class="empty-icon">' + svg('book', ' width="28" height="28"') + '</div>' +
    '<b>لسه مفيش حركات</b>ابدأ سجّل أول حركة' +
  '</div>';

  var groups = {}, order = [];
  for (var j = 0; j < list.length; j++){
    var k = dayKey(list[j].ts);
    if (!groups[k]){ groups[k] = []; order.push(k); }
    groups[k].push(list[j]);
  }

  var isCustody = a.type === 'custody';
  var out = '';

  for (var m = 0; m < order.length; m++){
    var key = order[m];
    var es = groups[key];
    var d = new Date(es[0].ts);
    var themeDay = dayTheme(d);
    var sum = 0;

    for (var n = 0; n < es.length; n++){
      if (isCustody){ if (es[n].kind === 'spend') sum += Number(es[n].amount) || 0; }
      else { if (es[n].counted) sum += Number(es[n].amount) || 0; }
    }

    var sumTxt = sum > 0 ? '<b>' + (isCustody ? 'اتصرف ' : '') + money(sum) + ' ج</b>' : '';

    var rowsHtml = '';
    for (var p = 0; p < es.length; p++) rowsHtml += entryRow(es[p], ro);

    out += '<section class="day" style="--t:' + themeDay.t + ';--d:' + themeDay.d + '">' +
      '<div class="day-h">' +
        '<span>' + dayLabel(d) + '</span>' + sumTxt +
      '</div>' + rowsHtml +
    '</section>';
  }
  return out;
}

function heroAccountHTML(a, s, r, ro){
  var k = kindOf(a);
  var range = ro ? '<div class="hero-hint">من ' + fmtDate(r.start) + ' لحد ' + fmtDate(r.end) + '</div>' : '';

  if (a.type === 'custody'){
    var pct = s.given > 0 ? Math.min(100, Math.round(s.spent / s.given * 100)) : 0;
    var neg = s.left < 0;
    var tg = ro ? 'div' : 'button';

    return '<div class="hero">' +
      '<div class="hero-label">' + svg(k.icon, ' width="16" height="16"') + ' ' + esc(a.name) + '</div>' +
      (a.title ? '<div class="hero-hint" style="margin-top:4px">📍 ' + esc(a.title) + '</div>' : '') +
      range +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:16px;position:relative;z-index:1">' +
        '<' + tg + (ro ? '' : ' onclick="Daftary.openBreak(\'give\')"') + ' style="background:rgba(255,255,255,.18);border-radius:16px;padding:12px 4px;text-align:center;color:#fff;border:0;cursor:pointer">' +
          '<div style="font-size:17px;font-weight:900;font-variant-numeric:tabular-nums">' + money(s.given) + '</div>' +
          '<div style="font-size:11px;opacity:.9;margin-top:3px">اتدفعله</div>' +
        '</' + tg + '>' +
        '<' + tg + (ro ? '' : ' onclick="Daftary.openBreak(\'spend\')"') + ' style="background:rgba(255,255,255,.18);border-radius:16px;padding:12px 4px;text-align:center;color:#fff;border:0;cursor:pointer">' +
          '<div style="font-size:17px;font-weight:900;font-variant-numeric:tabular-nums">' + money(s.spent) + '</div>' +
          '<div style="font-size:11px;opacity:.9;margin-top:3px">اتصرف</div>' +
        '</' + tg + '>' +
        '<div style="background:' + (neg ? 'rgba(255,180,180,.35)' : 'rgba(255,255,255,.25)') + ';border-radius:16px;padding:12px 4px;text-align:center;color:#fff">' +
          '<div style="font-size:17px;font-weight:900;font-variant-numeric:tabular-nums">' + money(Math.abs(s.left)) + '</div>' +
          '<div style="font-size:11px;opacity:.9;margin-top:3px">' + (neg ? 'صرف زيادة' : 'الباقي') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="hero-prog"><i class="' + (neg ? 'over' : '') + '" style="width:' + (neg ? 100 : pct) + '%"></i></div>' +
      (s.noRec ? '<div class="hero-hint" style="margin-top:12px;background:rgba(255,220,150,.3);padding:6px 10px;border-radius:12px;display:inline-block">⚠ ' + s.noRec + ' صرف من غير فاتورة</div>' : '') +
    '</div>';
  }

  var td = ro ? 0 : todayTotal(a, r ? r.id : null);
  var big = ro
    ? '<div class="hero-big">' + money(s.total) + '<small>ج</small></div>'
    : '<button type="button" class="hero-big" onclick="Daftary.openBreak(\'total\')" style="background:none;border:0;color:#fff;text-align:start;cursor:pointer;padding:0;font-family:inherit">' + money(s.total) + '<small>ج</small></button>';

  return `<div class="hero"><div class="hero-label">${svg(k.icon, ' width="16" height="16"')} ${esc(a.name)}</div>${range}${big}<div class="hero-hint" style="margin-top:4px">${ro ? 'الإجمالي' : 'الإجمالي · دوس على الرقم تشوف جه منين'}</div>${td ? '<div class="hero-hint" style="margin-top:10px;background:rgba(255,255,255,.18);padding:6px 10px;border-radius:12px;display:inline-block">النهاردة: ' + money(td) + ' ج</div>' : ''}</div>`;
}

function accountHTML(){
  var a = acc();
  if (!a){ ui.screen = 'home'; ui.tab = 'home'; return homeHTML(); }

  var r = curRound(a);
  var s = stats(a, r ? r.id : null);
  var closed = 0;
  for (var i = 0; i < a.rounds.length; i++) if (a.rounds[i].end) closed++;

  var barAction;
  if (a.type === 'custody'){
    barAction = '<div class="btns-2">' +
      '<button type="button" class="btn" onclick="Daftary.openGive()">' + svg('plus', ' width="18" height="18"') + ' دفعتله</button>' +
      '<button type="button" class="btn ghost" onclick="Daftary.openSpend()">سجّل صرف</button>' +
    '</div>';
  } else {
    barAction = '<button type="button" class="btn" onclick="Daftary.openAdd()">' + svg('plus', ' width="18" height="18"') + ' سجّل مصروف</button>';
  }

  return heroAccountHTML(a, s, r, false) +
    '<div class="section-h"><h2>الحركات <small>(' + s.n + ')</small></h2></div>' +
    entriesHTML(a, r ? r.id : null, false) +
    '<div class="settings-group" style="margin-top:20px">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px">' +
        '<button type="button" class="btn ghost small" onclick="Daftary.openStatement()">' + svg('share', ' width="16" height="16"') + ' كشف حساب</button>' +
        '<button type="button" class="btn soft small" onclick="Daftary.openSettle()">' + svg('check', ' width="16" height="16"') + ' خالص</button>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 14px 14px">' +
        '<button type="button" class="btn ghost small" onclick="Daftary.goScreen(\'archive\')">الأرشيف (' + closed + ')</button>' +
        '<button type="button" class="btn ghost small" onclick="Daftary.openEditAcc()">تعديل</button>' +
      '</div>' +
      '<button type="button" class="settings-row danger" onclick="Daftary.openDelAcc()">' +
        '<div class="sr-i">' + svg('trash', ' width="20" height="20"') + '</div>' +
        '<div class="sr-m"><b>مسح الحساب</b><span>هيتم مسح كل الحركات والأرشيف</span></div>' +
        '<div class="sr-chev">' + svg('chevron', ' width="18" height="18"') + '</div>' +
      '</button>' +
    '</div>' +
    '<div style="padding:20px 0 0">' + barAction + '</div>';
}

/* ═══════════════════════════════════════════════════════════
   14. ARCHIVE
   ═══════════════════════════════════════════════════════════ */
function archiveHTML(){
  var a = acc();
  if (!a){ ui.screen = 'home'; ui.tab = 'home'; return homeHTML(); }
  var k = kindOf(a);
  var colors = accountColors(a);
  var rs = [];
  for (var i = 0; i < a.rounds.length; i++) if (a.rounds[i].end) rs.push(a.rounds[i]);
  rs.sort(function(x, y){ return y.end - x.end; });

  var body = '';
  if (rs.length){
    for (var j = 0; j < rs.length; j++){
      var r = rs[j];
      var s = stats(a, r.id);
      var line;
      if (a.type === 'custody') line = 'اتدفع ' + money(s.given) + '<br>اتصرف ' + money(s.spent) + '<br>الباقي ' + money(s.left);
      else line = 'الإجمالي<br><b style="font-size:20px">' + money(s.total) + ' ج</b>';
      body += '<button type="button" class="account-card" style="--ac:' + colors.d + ';--ic-l:' + colors.l + ';--ic-d:' + colors.d + '" onclick="Daftary.goScreen(\'round\',undefined,\'' + r.id + '\')">' +
        '<div class="account-icon">' + svg(k.icon, ' width="24" height="24"') + '</div>' +
        '<div class="account-mid">' +
          '<div class="account-name" style="font-size:15px">' + fmtDate(r.start) + ' → ' + fmtDate(r.end) + '</div>' +
          '<div class="account-tag">' + s.n + ' حركة</div>' +
        '</div>' +
        '<div style="text-align:end;font-size:13px;color:var(--ink-soft);line-height:1.5">' + line + '</div>' +
      '</button>';
    }
  } else {
    body = '<div class="empty">' +
      '<div class="empty-icon">' + svg('book', ' width="28" height="28"') + '</div>' +
      '<b>مفيش أرشيف</b>لما تدوس "خالص" هتلاقي الجولات هنا' +
    '</div>';
  }

  return '<div class="section-h"><h2>أرشيف ' + esc(a.name) + '</h2></div>' + body;
}

function roundHTML(){
  var a = acc();
  if (!a){ ui.screen = 'home'; ui.tab = 'home'; return homeHTML(); }
  var r = null;
  for (var i = 0; i < a.rounds.length; i++) if (a.rounds[i].id === ui.roundId){ r = a.rounds[i]; break; }
  if (!r){ ui.screen = 'archive'; return archiveHTML(); }
  var s = stats(a, r.id);
  return heroAccountHTML(a, s, r, true) + entriesHTML(a, r.id, true);
}

/* ═══════════════════════════════════════════════════════════
   15. CALENDAR — التقويم الذكي
   ═══════════════════════════════════════════════════════════ */
function getMonthData(year, month){
  var map = {};

  for (var i = 0; i < db.accounts.length; i++){
    var a = db.accounts[i];
    var r = curRound(a);
    if (!r) continue;
    for (var j = 0; j < a.entries.length; j++){
      var e = a.entries[j];
      if (e.roundId !== r.id) continue;
      if (e.kind !== 'add' || !e.counted) continue;
      var d = new Date(e.ts);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      var k = ymd(d);
      if (!map[k]) map[k] = { count:0, total:0, due:false };
      map[k].count++;
      map[k].total += Number(e.amount) || 0;
    }
  }

  for (var m = 0; m < db.dues.length; m++){
    var due = db.dues[m];
    var dd = fromYMD(due.date);
    if (dd.getFullYear() !== year || dd.getMonth() !== month) continue;
    var kk = due.date;
    if (!map[kk]) map[kk] = { count:0, total:0, due:false };
    map[kk].due = true;
  }

  return map;
}

function calendarHTML(){
  var year = ui.calYear;
  var month = ui.calMonth;
  var map = getMonthData(year, month);

  var days = daysInMonth(year, month);
  var firstDay = firstDayOfMonth(year, month);
  var todayKey = ymd(new Date());

  var weekdaysHtml = '';
  for (var w = 0; w < 7; w++){
    weekdaysHtml += '<div class="cal-weekday">' + DAYS[w].slice(0, 3) + '</div>';
  }

  var daysHtml = '';
  for (var f = 0; f < firstDay; f++){
    daysHtml += '<div class="cal-day empty-day"></div>';
  }

  var monthTotal = 0, monthCount = 0, bestDay = null, bestDayTotal = 0;

  for (var d = 1; d <= days; d++){
    var date = new Date(year, month, d);
    var k = ymd(date);
    var info = map[k] || { count: 0, total: 0, due: false };
    var isToday = k === todayKey;

    monthTotal += info.total;
    monthCount += info.count;
    if (info.total > bestDayTotal){ bestDayTotal = info.total; bestDay = d; }

    var cls = 'cal-day';
    if (info.count > 0) cls += ' has-entries';
    if (isToday) cls += ' today';

    var dotsHtml = '';
    if (info.count > 0){
      var dotCount = Math.min(info.count, 3);
      dotsHtml = '<div class="cd-dots">';
      for (var dd = 0; dd < dotCount; dd++) dotsHtml += '<span class="cd-dot"></span>';
      dotsHtml += '</div>';
    }

    var dueHtml = info.due ? '<span class="cd-due"></span>' : '';

    daysHtml += '<button type="button" class="' + cls + '" onclick="Daftary.openDay(\'' + k + '\')">' +
      dueHtml +
      '<span class="cd-num">' + d + '</span>' +
      dotsHtml +
    '</button>';
  }

  var title = MONTHS[month] + ' ' + year;
  var bestDayHtml = bestDay ? bestDay + ' ' + MONTHS[month] : '—';

  return '<div class="cal-header">' +
      '<button type="button" class="cal-nav" onclick="Daftary.calPrev()" aria-label="الشهر السابق">' + svg('chev-left', ' width="20" height="20"') + '</button>' +
      '<div class="cal-title">' + title + '</div>' +
      '<button type="button" class="cal-nav" onclick="Daftary.calNext()" aria-label="الشهر القادم">' + svg('chev-right', ' width="20" height="20"') + '</button>' +
    '</div>' +
    '<button type="button" class="cal-today-btn" style="margin-bottom:12px;width:100%" onclick="Daftary.calToday()">' +
      svg('calendar', ' width="16" height="16"') + ' ارجع للنهاردة' +
    '</button>' +
    '<div class="cal-grid">' +
      '<div class="cal-weekdays">' + weekdaysHtml + '</div>' +
      '<div class="cal-days">' + daysHtml + '</div>' +
    '</div>' +
    '<div class="cal-stats">' +
      '<div class="section-h" style="margin:0 0 8px"><h2>إحصائيات الشهر</h2></div>' +
      '<div class="kv"><span>إجمالي الصرف</span><b style="color:var(--brand-d)">' + money(monthTotal) + ' ج</b></div>' +
      '<div class="kv"><span>عدد الحركات</span><b>' + monthCount + '</b></div>' +
      '<div class="kv"><span>أعلى يوم صرف</span><b>' + bestDayHtml + '</b></div>' +
    '</div>';
}

function openDay(dateKey){
  var date = fromYMD(dateKey);
  var d = date;

  var entries = [];
  for (var i = 0; i < db.accounts.length; i++){
    var a = db.accounts[i];
    var r = curRound(a);
    if (!r) continue;
    for (var j = 0; j < a.entries.length; j++){
      var e = a.entries[j];
      if (e.roundId !== r.id) continue;
      if (e.kind !== 'add' || !e.counted) continue;
      if (ymd(new Date(e.ts)) !== dateKey) continue;
      entries.push({ entry: e, acc: a });
    }
  }

  entries.sort(function(x, y){ return y.entry.ts - x.entry.ts; });

  var total = 0;
  for (var k = 0; k < entries.length; k++) total += Number(entries[k].entry.amount) || 0;

  var themeDay = dayTheme(d);

  var dayAccent = '<div class="day-accent" style="background:' + themeDay.t + ';color:' + themeDay.d + '">' +
      '<div>' +
        '<div class="da-day">' + DAYS[d.getDay()] + '</div>' +
        '<div class="da-date">' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + '</div>' +
      '</div>' +
      '<div class="da-time">' + money(total) + ' ج</div>' +
    '</div>';

  var rowsHtml = '';
  if (entries.length){
    for (var m = 0; m < entries.length; m++){
      var r2 = entries[m];
      var e2 = r2.entry;
      var a2 = r2.acc;
      var colors = accountColors(a2);
      var k2 = kindOf(a2);

      rowsHtml += '<button type="button" class="entry" style="border-radius:16px;border:1.5px solid var(--line);margin-bottom:8px;padding:14px 16px" onclick="Daftary.openEntryPublic(\'' + a2.id + '\',\'' + e2.id + '\')">' +
        '<div style="width:36px;height:36px;border-radius:12px;background:' + colors.l + ';color:' + colors.d + ';display:flex;align-items:center;justify-content:center;flex:none;margin-inline-end:10px">' +
          svg(k2.icon, ' width="20" height="20"') +
        '</div>' +
        '<div class="entry-mid">' +
          '<div class="entry-name">' + esc(e2.note || KLABEL[e2.kind] || 'حركة') + '</div>' +
          '<div class="entry-meta">' +
            '<span>' + esc(a2.name) + '</span>' +
            '<span class="dot"></span>' +
            '<span>' + fmtTime(e2.ts) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="entry-amt">' + money(e2.amount) + '</div>' +
      '</button>';
    }
  } else {
    rowsHtml = '<div class="empty">' +
      '<div class="empty-icon">' + svg('book', ' width="28" height="28"') + '</div>' +
      '<b>مفيش حركات اليوم ده</b>يوم فاضي يعني راحة' +
    '</div>';
  }

  openSheet(
    '<h2>' + DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + '</h2>' +
    dayAccent +
    (entries.length ? '<div class="section-h"><h2>الحركات (' + entries.length + ')</h2></div>' : '') +
    rowsHtml +
    '<button type="button" class="btn ghost" style="margin-top:12px" onclick="Daftary.closeSheet()">قفل</button>'
  );
}

/* ═══════════════════════════════════════════════════════════
   16. DUES
   ═══════════════════════════════════════════════════════════ */
function dueCard(d){
  var n = daysTo(d.date);
  var color = n < 0 ? 'var(--danger)' : (n <= 7 ? 'var(--warn)' : 'var(--info)');
  var cls = n < 0 ? 'danger' : (n <= 2 ? 'warn' : '');
  var repeatTag = d.repeat !== 'none' ? '<span class="tag n">' + REP[d.repeat] + '</span>' : '';

  return '<div class="due" style="--dc:' + color + '">' +
    '<button type="button" class="due-top" onclick="Daftary.openDue(\'' + d.id + '\')">' +
      '<div class="due-mid">' +
        '<div class="due-name">' + esc(d.title) + '</div>' +
        '<div class="due-meta">' +
          '<b style="color:' + color + '">' + dueLabel(n) + '</b>' +
          '<span class="dot" style="width:3px;height:3px;border-radius:50%;background:var(--muted)"></span>' +
          '<span>' + fmtDue(d.date) + '</span>' + repeatTag +
        '</div>' +
      '</div>' +
      '<div class="due-amt">' + (d.amount ? money(d.amount) + ' ج' : '') + '</div>' +
    '</button>' +
    '<button type="button" class="due-pay" onclick="Daftary.openPay(\'' + d.id + '\')">' +
      svg('check', ' width="18" height="18"') + ' اتدفع' +
    '</button>' +
  '</div>';
}

function duesHTML(){
  var list = db.dues.slice();
  list.sort(function(a, b){ return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });

  var over = [], week = [], later = [];
  for (var i = 0; i < list.length; i++){
    var n = daysTo(list[i].date);
    if (n < 0) over.push(list[i]);
    else if (n <= 7) week.push(list[i]);
    else later.push(list[i]);
  }

  function sec(title, arr, color){
    if (!arr.length) return '';
    var html = '';
    for (var j = 0; j < arr.length; j++) html += dueCard(arr[j]);
    return '<div class="section-h"><h2 style="color:' + (color || 'var(--ink)') + '">' + title + ' <small>(' + arr.length + ')</small></h2></div>' + html;
  }

  var body = list.length
    ? sec('متأخرة', over, 'var(--danger)') + sec('الأسبوع ده', week) + sec('بعد كده', later)
    : '<div class="empty">' +
      '<div class="empty-icon">' + svg('calendar', ' width="28" height="28"') + '</div>' +
      '<b>مفيش مستحقات</b>ضيف فاتورة أو قسط وهتلاقيها هنا' +
    '</div>';

  var logsHtml = '';
  var logs = db.duesLog.slice(-6).reverse();
  if (logs.length){
    logsHtml = '<div class="section-h" style="margin-top:24px"><h2>اتدفعت قبل كده</h2></div>';
    for (var k = 0; k < logs.length; k++){
      var l = logs[k];
      logsHtml += '<div class="log-row">' +
        '<span>' + esc(l.title) + ' · ' + fmtShort(l.paidAt) + '</span>' +
        '<span>' + (l.amount ? money(l.amount) + ' ج' : '') + '</span>' +
      '</div>';
    }
  }

  return body + logsHtml +
    '<div style="padding:20px 0 0">' +
      '<button type="button" class="btn" onclick="Daftary.openDueForm()">' + svg('plus', ' width="18" height="18"') + ' مستحق جديد</button>' +
    '</div>';
}

/* ═══════════════════════════════════════════════════════════
   SEARCH BY VOICE — بحث بالصوت
   ═══════════════════════════════════════════════════════════ */
var speechRecognition = null;
var isListening = false;

function isVoiceSupported(){
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function startVoiceSearch(){
  if (!isVoiceSupported()){
    toast('البحث بالصوت مش مدعوم في المتصفح ده');
    return;
  }

  if (isListening){
    stopVoiceSearch();
    return;
  }

  try {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition = new SR();
    speechRecognition.lang = 'ar-EG';
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onstart = function(){
      isListening = true;
      updateVoiceButton();
    };

    speechRecognition.onresult = function(event){
      var transcript = '';
      if (event.results && event.results[0] && event.results[0][0]){
        transcript = event.results[0][0].transcript || '';
      }
      transcript = transcript.trim();

      if (transcript){
        searchQuery = transcript;
        searchFilter = 'all';
        toast('دوّرت على: ' + transcript);
        render();
      } else {
        toast('مسمعتش حاجة، جرّب تاني');
      }
    };

    speechRecognition.onerror = function(event){
      isListening = false;
      updateVoiceButton();
      if (event.error === 'no-speech'){
        toast('مسمعتش حاجة، جرّب تاني');
      } else if (event.error === 'not-allowed'){
        toast('الميكروفون مرفوض');
      } else if (event.error === 'network'){
        toast('محتاج إنترنت للبحث الصوتي');
      } else {
        toast('مقدرتش أسمع، جرّب تاني');
      }
    };

    speechRecognition.onend = function(){
      isListening = false;
      updateVoiceButton();
    };

    speechRecognition.start();
  } catch(e){
    toast('مقدرتش أفتح الميكروفون');
    isListening = false;
    updateVoiceButton();
  }
}

function stopVoiceSearch(){
  if (speechRecognition){
    try { speechRecognition.stop(); } catch(e){}
  }
  isListening = false;
  updateVoiceButton();
}

function updateVoiceButton(){
  var btn = $('voiceBtn');
  if (!btn) return;
  if (isListening){
    btn.classList.add('listening');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor"/></svg>';
    btn.setAttribute('aria-label', 'إيقاف الاستماع');
  } else {
    btn.classList.remove('listening');
    btn.innerHTML = svg('mic', ' width="20" height="20"');
    btn.setAttribute('aria-label', 'بحث بالصوت');
  }
}

/* ═══════════════════════════════════════════════════════════
   17. SEARCH
   ═══════════════════════════════════════════════════════════ */
function searchHTML(){
  var q = searchQuery.trim().toLowerCase();
  var filter = searchFilter;

  var accounts = [], entries = [], dues = [];

  if (q){
    for (var i = 0; i < db.accounts.length; i++){
      var a = db.accounts[i];
      if (String(a.name).toLowerCase().indexOf(q) >= 0 || String(a.title || '').toLowerCase().indexOf(q) >= 0){
        accounts.push(a);
      }
      for (var j = 0; j < a.entries.length; j++){
        var e = a.entries[j];
        var hay = String(e.note || '') + ' ' + String(e.from || '') + ' ' + money(e.amount);
        if (hay.toLowerCase().indexOf(q) >= 0) entries.push({ entry: e, acc: a });
      }
    }
    for (var k = 0; k < db.dues.length; k++){
      if (String(db.dues[k].title).toLowerCase().indexOf(q) >= 0) dues.push(db.dues[k]);
    }
  } else {
    for (var m = 0; m < db.accounts.length; m++) accounts.push(db.accounts[m]);
    var all = recentEntries(20);
    for (var n = 0; n < all.length; n++) entries.push({ entry: all[n].entry, acc: all[n].acc });
    for (var p = 0; p < db.dues.length; p++) dues.push(db.dues[p]);
  }

  var showA = filter === 'all' || filter === 'accounts';
  var showE = filter === 'all' || filter === 'entries';
  var showD = filter === 'all' || filter === 'dues';
  var total = (showA ? accounts.length : 0) + (showE ? entries.length : 0) + (showD ? dues.length : 0);

  var body = '';

  if (showA && accounts.length){
    body += '<div class="section-h"><h2>حسابات</h2></div>';
    for (var x = 0; x < accounts.length; x++) body += accountCard(accounts[x]);
  }

  if (showE && entries.length){
    body += '<div class="section-h" style="margin-top:20px"><h2>حركات</h2></div>';
    for (var y = 0; y < entries.length; y++){
      var ent = entries[y].entry;
      var ac = entries[y].acc;
      body += '<button type="button" class="entry" style="border-radius:16px;border:1.5px solid var(--line);margin-bottom:8px;padding:14px 16px" onclick="Daftary.openEntryPublic(\'' + ac.id + '\',\'' + ent.id + '\')">' +
        '<div class="entry-mid">' +
          '<div class="entry-name">' + esc(ent.note || KLABEL[ent.kind] || 'حركة') + '</div>' +
          '<div class="entry-meta">' +
            '<span>' + esc(ac.name) + '</span>' +
            '<span class="dot"></span>' +
            '<span>' + fmtDate(ent.ts) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="entry-amt' + (ent.kind === 'give' ? ' plus' : '') + '">' +
          (ent.kind === 'give' ? '+' : '') + money(ent.amount) +
        '</div>' +
      '</button>';
    }
  }

  if (showD && dues.length){
    body += '<div class="section-h" style="margin-top:20px"><h2>مستحقات</h2></div>';
    for (var z = 0; z < dues.length; z++) body += dueCard(dues[z]);
  }

  if (!total){
    body = '<div class="empty">' +
      '<div class="empty-icon">' + svg('search', ' width="28" height="28"') + '</div>' +
      '<b>' + (q ? 'مفيش نتائج' : 'ابدأ الكتابة للبحث') + '</b>' +
      (q ? 'جرّب كلمة تانية أو غيّر الفلتر' : 'اكتب اسم حساب أو ملاحظة أو مبلغ') +
    '</div>';
  }

  var filterChips = '';
  var filters = [
    { id:'all', label:'الكل' },
    { id:'accounts', label:'حسابات' },
    { id:'entries', label:'حركات' },
    { id:'dues', label:'مستحقات' }
  ];
  for (var f = 0; f < filters.length; f++){
    var chip = filters[f];
    filterChips += '<button type="button" class="filter-chip' + (filter === chip.id ? ' active' : '') + '" onclick="Daftary.setFilter(\'' + chip.id + '\')">' + chip.label + '</button>';
  }

  var voiceBtn = isVoiceSupported()
    ? '<button type="button" class="voice-btn" id="voiceBtn" onclick="Daftary.startVoiceSearch()" aria-label="بحث بالصوت">' +
        svg('mic', ' width="20" height="20"') +
      '</button>'
    : '';

  return '<div class="search-bar">' +
      '<div class="search-input' + (voiceBtn ? ' has-voice' : '') + '">' +
        svg('search', ' width="20" height="20"') +
        '<input type="text" id="searchInput" placeholder="دوّر على أي حاجة..." value="' + escAttr(searchQuery) + '" autocomplete="off" oninput="Daftary.searchInput(this.value)">' +
        voiceBtn +
      '</div>' +
      '<div class="filter-row">' + filterChips + '</div>' +
    '</div>' +
    (q ? '<div class="section-h"><h2>النتائج (' + total + ')</h2></div>' : '') +
    body;
}

var searchDebounce = debounce(function(){ render(); }, 220);

function searchInput(v){
  searchQuery = v;
  searchDebounce();
}

function setFilter(f){
  searchFilter = f;
  render();
}
/* ═══════════════════════════════════════════════════════════
   18. STATS
   ═══════════════════════════════════════════════════════════ */
function statsHTML(){
  var days = last7Days();
  var max = 1;
  for (var i = 0; i < days.length; i++) if (days[i].total > max) max = days[i].total;

  var todayKey = ymd(new Date());
  var barsHtml = '';
  for (var j = 0; j < days.length; j++){
    var d = days[j];
    var h = Math.max(6, Math.round(d.total / max * 100));
    var isToday = d.key === todayKey;
    barsHtml += '<div class="chart-bar' + (isToday ? ' today' : '') + '" style="height:' + h + '%">' +
      '<span class="cb-label">' + d.label + '</span>' +
      '<span class="cb-val">' + money(d.total) + '</span>' +
    '</div>';
  }

  var weekTotal = 0;
  for (var k = 0; k < days.length; k++) weekTotal += days[k].total;

  var ms = monthStats();
  var avgDaily = Math.round(ms.total / 30);

  var accountsList = '';
  for (var m = 0; m < db.accounts.length; m++){
    var a = db.accounts[m];
    var r = curRound(a);
    var s = stats(a, r ? r.id : null);
    var val = a.type === 'custody' ? s.left : s.total;
    var colors = accountColors(a);

    accountsList += '<div class="kv">' +
      '<span style="display:flex;align-items:center;gap:8px">' +
        '<span style="width:10px;height:10px;border-radius:4px;background:' + colors.d + '"></span>' +
        esc(a.name) +
      '</span>' +
      '<b>' + money(val) + ' ج</b>' +
    '</div>';
  }

  if (!accountsList) accountsList = '<div class="empty" style="padding:20px">مفيش حسابات لسه</div>';

  return '<section class="settings-group" style="margin-bottom:16px">' +
      '<div style="padding:16px">' +
        '<div class="section-h" style="margin:0 0 6px"><h2>آخر 7 أيام</h2></div>' +
        '<div style="font-size:30px;font-weight:900;color:var(--brand-d);letter-spacing:-.6px;font-variant-numeric:tabular-nums">' + money(weekTotal) + ' ج</div>' +
        '<div style="font-size:13.5px;color:var(--muted);margin-bottom:6px">مجموع صرفك الأسبوع ده</div>' +
        '<div class="chart">' + barsHtml + '</div>' +
      '</div>' +
    '</section>' +
    '<section class="settings-group" style="margin-bottom:16px">' +
      '<div style="padding:16px">' +
        '<div class="section-h" style="margin:0 0 6px"><h2>الشهر ده</h2></div>' +
        '<div class="kv"><span>إجمالي الشهر</span><b>' + money(ms.total) + ' ج</b></div>' +
        '<div class="kv"><span>عدد الحركات</span><b>' + ms.count + '</b></div>' +
        '<div class="kv"><span>متوسط اليوم</span><b>' + money(avgDaily) + ' ج</b></div>' +
      '</div>' +
    '</section>' +
    '<section class="settings-group">' +
      '<div style="padding:16px">' +
        '<div class="section-h" style="margin:0 0 6px"><h2>حساباتك</h2></div>' +
        accountsList +
      '</div>' +
    '</section>';
}

/* ═══════════════════════════════════════════════════════════
   19. MORE
   ═══════════════════════════════════════════════════════════ */
function moreHTML(){
  if (ui.moreSub === 'stats') return statsHTML();
  if (ui.moreSub === 'budget') return budgetHTML();
  if (ui.moreSub === 'security') return securityHTML();
  if (ui.moreSub === 'backup') return backupHTML();
  if (ui.moreSub === 'help') return helpHTML();
  if (ui.moreSub === 'about') return aboutHTML();

  var isPin = !!db.settings.pinHash;
  var isDark = theme === 'dark';

  function row(icon, title, sub, action, cls){
    return '<button type="button" class="settings-row' + (cls ? ' ' + cls : '') + '" onclick="' + action + '">' +
      '<div class="sr-i">' + svg(icon, ' width="20" height="20"') + '</div>' +
      '<div class="sr-m">' +
        '<b>' + title + '</b>' +
        (sub ? '<span>' + sub + '</span>' : '') +
      '</div>' +
      '<div class="sr-chev">' + svg('chevron', ' width="18" height="18"') + '</div>' +
    '</button>';
  }

  return '<div class="settings-group">' +
      '<div class="settings-title">التخصيص</div>' +
      '<div class="settings-row" style="cursor:default">' +
        '<div class="sr-i">' + svg(isDark ? 'moon' : 'sun', ' width="20" height="20"') + '</div>' +
        '<div class="sr-m">' +
          '<b>الوضع</b>' +
          '<span>' + (isDark ? 'ليلي' : 'نهاري') + '</span>' +
        '</div>' +
        '<div class="theme-switch">' +
          '<button type="button" class="' + (!isDark ? 'active' : '') + '" onclick="Daftary.setTheme(\'light\')" aria-label="نهاري">' + svg('sun', ' width="18" height="18"') + '</button>' +
          '<button type="button" class="' + (isDark ? 'active' : '') + '" onclick="Daftary.setTheme(\'dark\')" aria-label="ليلي">' + svg('moon', ' width="18" height="18"') + '</button>' +
        '</div>' +
      '</div>' +
      row('target', 'الميزانية الشهرية', db.budgets.__overall__ ? 'الحالية: ' + money(db.budgets.__overall__) + ' ج' : 'لسه مفيش حد', 'Daftary.openMoreSub(\'budget\')') +
      row('bell', 'المستحقات', db.dues.length ? db.dues.length + ' مستحق' : 'مفيش مستحقات', 'Daftary.goScreen(\'dues\')') +
      row('bell', 'الإشعارات', notifEnabled ? 'مفعّلة ✓' : 'متوقفة', 'Daftary.openNotifications()') +
    '</div>' +
    '<div class="settings-group">' +
      '<div class="settings-title">الأمان</div>' +
      row('lock', isPin ? 'قفل التطبيق مفعّل' : 'قفل التطبيق', isPin ? 'اضغط لإدارة القفل' : 'حماية سريعة برمز PIN', 'Daftary.openMoreSub(\'security\')') +
    '</div>' +
    '<div class="settings-group">' +
      '<div class="settings-title">البيانات</div>' +
      row('stats', 'التقارير', 'إحصائيات أسبوعية وشهرية', 'Daftary.openMoreSub(\'stats\')') +
      row('backup', 'النسخ الاحتياطي', 'حفظ أو استرجاع نسخة كاملة', 'Daftary.openMoreSub(\'backup\')') +
      row('share', 'تصدير CSV', 'ملف لكل الحركات', 'Daftary.exportCSV()') +
    '</div>' +
    '<div class="settings-group">' +
      '<div class="settings-title">التطبيق</div>' +
      row('install', 'تثبيت دفتري', 'ضيفه على شاشتك الرئيسية', 'Daftary.installApp()') +
      row('help', 'المساعدة', 'إجابات سريعة', 'Daftary.openMoreSub(\'help\')') +
      row('info', 'عن دفتري', 'v5.1 · نسخة كاملة', 'Daftary.openMoreSub(\'about\')') +
    '</div>' +
    '<div style="text-align:center;color:var(--muted);font-size:13px;margin:24px 0 8px">' +
      'دفتري v5.1 — كل بياناتك على جهازك فقط' +
    '</div>';
}

function openMoreSub(s){
  ui.moreSub = s;
  render();
  window.scrollTo(0, 0);
}

/* ═══════════════════════════════════════════════════════════
   20. SUB-SCREENS
   ═══════════════════════════════════════════════════════════ */
function budgetHTML(){
  var current = db.budgets.__overall__ || '';
  var ms = monthStats();
  var budget = Number(current) || 0;
  var pct = budget > 0 ? Math.min(100, Math.round(ms.total / budget * 100)) : 0;
  var over = budget > 0 && ms.total > budget;

  return '<div class="settings-group">' +
      '<div style="padding:16px">' +
        '<div class="msg">حط حد للصرف الشهري، وهنحذّرك لما تقرب توصله.</div>' +
        '<label for="b_amt">الحد الشهري (جنيه)</label>' +
        '<input type="text" id="b_amt" inputmode="decimal" value="' + escAttr(current) + '" placeholder="مثلاً 6000" ' +
          'style="width:100%;min-height:56px;border:1.5px solid var(--line);border-radius:16px;padding:8px 16px;background:var(--card-soft);font-size:16px">' +
        '<button type="button" class="btn" style="margin-top:12px" onclick="Daftary.saveBudgetInline()">حفظ</button>' +
        (budget > 0
          ? '<div style="margin-top:20px">' +
              '<div class="kv"><span>صرفت لحد دلوقتي</span><b>' + money(ms.total) + ' ج</b></div>' +
              '<div class="kv"><span>من</span><b>' + money(budget) + ' ج</b></div>' +
              '<div class="kv"><span>الفاضي</span><b>' + money(Math.max(0, budget - ms.total)) + ' ج</b></div>' +
              '<div class="prog" style="height:10px;border-radius:6px;background:var(--card-soft);margin-top:14px;overflow:hidden">' +
                '<i style="display:block;height:100%;background:' + (over ? 'var(--danger)' : 'var(--brand)') + ';width:' + pct + '%"></i>' +
              '</div>' +
            '</div>'
          : '') +
      '</div>' +
    '</div>';
}

function securityHTML(){
  var isPin = !!db.settings.pinHash;
  return '<div class="settings-group">' +
      '<div style="padding:16px">' +
        '<div class="msg">' + (isPin ? 'القفل مفعّل على هذا المتصفح.' : 'حماية سريعة برمز PIN.') + '<br>القفل يحمي الواجهة فقط، وليس تشفيرًا لملف البيانات.</div>' +
        '<div class="btns-stack">' +
          '<button type="button" class="btn" onclick="Daftary.setPin()">' + (isPin ? 'تغيير الرمز' : 'إنشاء رمز') + '</button>' +
          (isPin ? '<button type="button" class="btn ghost" onclick="Daftary.lockNow()">قفل الآن</button>' : '') +
          (isPin ? '<button type="button" class="btn danger" onclick="Daftary.removePin()">إلغاء القفل</button>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
}

function backupHTML(){
  return '<div class="settings-group">' +
      '<div style="padding:16px">' +
        '<div class="msg">ملف واحد فيه كل بياناتك. احفظه أو استرجعه في أي وقت.</div>' +
        '<div class="btns-stack">' +
          '<button type="button" class="btn" onclick="Daftary.exportData()">' + svg('backup', ' width="18" height="18"') + ' احفظ نسخة كاملة</button>' +
          '<label class="btn ghost" style="cursor:pointer">استرجع نسخة (يستبدل البيانات)<input type="file" accept=".json,application/json" style="display:none" onchange="Daftary.importData(this,\'replace\')"></label>' +
          '<label class="btn ghost" style="cursor:pointer">ادمج نسخة من جهاز تاني<input type="file" accept=".json,application/json" style="display:none" onchange="Daftary.importData(this,\'merge\')"></label>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function helpHTML(){
  return '<div class="settings-group">' +
      '<div style="padding:16px">' +
        '<div class="kv"><span>➕</span><b>إضافة سريعة</b></div>' +
        '<div class="kv"><span>👛</span><b>مصروفاتي</b></div>' +
        '<div class="kv"><span>🤝</span><b>فلوس مع حد</b></div>' +
        '<div class="kv"><span>📒</span><b>حاجة تانية</b></div>' +
        '<div class="kv"><span>📅</span><b>التقويم</b></div>' +
        '<div class="kv"><span>💾</span><b>نسخ احتياطي</b></div>' +
        '<div class="msg" style="margin-top:14px">كل بياناتك محفوظة على جهازك فقط. اعمل نسخة احتياطية بشكل دوري.</div>' +
      '</div>' +
    '</div>';
}

function aboutHTML(){
  return '<div class="settings-group">' +
      '<div style="padding:24px;text-align:center">' +
        '<div style="width:72px;height:72px;margin:0 auto 12px;border-radius:20px;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center">' +
          svg('wallet', ' width="36" height="36"') +
        '</div>' +
        '<div style="font-size:22px;font-weight:900;color:var(--ink)">دفتري</div>' +
        '<div style="color:var(--muted);font-size:14px;margin-top:4px">v5.1 · 2026</div>' +
        '<div class="msg" style="margin-top:16px;text-align:start">تطبيق بسيط لإدارة حساباتك. يعمل بدون إنترنت، وكل بياناتك على جهازك.</div>' +
      '</div>' +
    '</div>';
}

/* ═══════════════════════════════════════════════════════════
   21. SHEET
   ═══════════════════════════════════════════════════════════ */
function openSheet(html, focusId){
  var sh = $('sh');
  var ov = $('ov');
  if (!sh || !ov) return;
  if (window.Sound) Sound.sheetOpen();
  sh.innerHTML = html;
  sh.removeAttribute('hidden');
  ov.classList.add('open');
  requestAnimationFrame(function(){
    sh.classList.add('open');
    sh.scrollTop = 0;
  });
  if (focusId){
    setTimeout(function(){
      var el = $(focusId);
      if (el){
        el.focus();
        if (el.setSelectionRange && el.value){
          try { el.setSelectionRange(el.value.length, el.value.length); } catch(e){}
        }
      }
    }, 260);
  }
}

function closeSheet(){
  var sh = $('sh');
  var ov = $('ov');
  if (!sh || !ov) return;
  if (window.Sound) Sound.sheetClose();
  sh.classList.remove('open');
  ov.classList.remove('open');
  setTimeout(function(){
    if (!sh.classList.contains('open')){
      sh.setAttribute('hidden', '');
      sh.innerHTML = '';
    }
  }, 300);
  sheetBack = null;
}

function fld(id, label, val, mode){
  var inputmode = mode ? ' inputmode="decimal"' : '';
  var cls = mode === 'big' ? ' class="big"' : '';
  return '<label for="' + id + '">' + label + '</label>' +
    '<input type="text" id="' + id + '"' + inputmode + cls +
    ' autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"' +
    ' value="' + escAttr(val) + '">';
}

function btns(saveFn, saveLabel){
  return '<div class="btns-stack" style="margin-top:18px">' +
    '<button type="button" class="btn" onclick="Daftary.' + saveFn + '">' + saveLabel + '</button>' +
    '<button type="button" class="btn ghost" onclick="Daftary.closeSheet()">إلغاء</button>' +
  '</div>';
}

/* ═══════════════════════════════════════════════════════════
   22. ADD SHEET
   ═══════════════════════════════════════════════════════════ */
function openAddSheet(){
  var html =
    '<h2>إضافة</h2>' +
    '<div class="kind-grid">' +
      '<button type="button" class="kind accent" onclick="Daftary.closeSheet();Daftary.openNewAccount()">' +
        '<div class="kind-icon">' + svg('plus', ' width="22" height="22"') + '</div>' +
        '<b>حساب جديد</b>' +
        '<span>مصروفاتي أو عهدة أو أي حساب</span>' +
      '</button>' +
      '<button type="button" class="kind" onclick="Daftary.closeSheet();Daftary.openExistingAccounts()">' +
        '<div class="kind-icon">' + svg('book', ' width="22" height="22"') + '</div>' +
        '<b>حساب موجود</b>' +
        '<span>افتح حساب وسجّل فيه حركة</span>' +
      '</button>' +
    '</div>' +
    '<button type="button" class="btn ghost" style="margin-top:16px" onclick="Daftary.closeSheet();Daftary.openDueForm()">' +
      svg('calendar', ' width="18" height="18"') + ' مستحق جديد' +
    '</button>';
  openSheet(html);
}

function openExistingAccounts(){
  if (!db.accounts.length){
    toast('مفيش حسابات لسه — اعمل واحد جديد');
    openNewAccount();
    return;
  }
  var html = '<h2>اختار حساب</h2>';
  for (var i = 0; i < db.accounts.length; i++) html += accountCard(db.accounts[i]);
  openSheet(html);
}

/* ═══════════════════════════════════════════════════════════
   23. NEW ACCOUNT
   ═══════════════════════════════════════════════════════════ */
var nk = null;

function openNewAccount(){
  var html = '<h2>نوع الحساب</h2><div class="kind-grid">' +
    '<button type="button" class="kind accent" onclick="Daftary.closeSheet();Daftary.startKind(\'mine\')">' +
      '<div class="kind-icon">' + svg('wallet', ' width="22" height="22"') + '</div>' +
      '<b>مصروفاتي</b><span>حسابك الشخصي الرئيسي</span>' +
    '</button>' +
    '<button type="button" class="kind" onclick="Daftary.closeSheet();Daftary.startKind(\'custody\')">' +
      '<div class="kind-icon">' + svg('handshake', ' width="22" height="22"') + '</div>' +
      '<b>فلوس مع حد</b><span>عهدة بيصرفها ويجيبلك فواتير</span>' +
    '</button>' +
    '<button type="button" class="kind" onclick="Daftary.closeSheet();Daftary.startKind(\'other\')" style="grid-column:1/-1">' +
      '<div class="kind-icon">' + svg('book', ' width="22" height="22"') + '</div>' +
      '<b>حاجة تانية</b><span>أي حساب تاني</span>' +
    '</button>' +
  '</div>';
  openSheet(html);
}

function startKind(k){
  nk = k;

  if (k === 'mine'){
    var ex = null;
    for (var i = 0; i < db.accounts.length; i++){
      if (db.accounts[i].kind === 'mine'){ ex = db.accounts[i]; break; }
    }
    if (ex){ closeSheet(); toast('عندك حساب مصروفاتي بالفعل'); goScreen('account', ex.id); return; }
    createAcc('مصروفاتي', '', 'mine');
    return;
  }

  var K = KINDS[k];
  var label = k === 'custody' ? 'إديت الفلوس دي لمين؟' : 'اسم الحساب';
  var extra = k === 'custody' ? fld('f_title', 'العنوان أو المكان (اختياري)', '') : '';
  var chips = '';

  if (db.people.length){
    chips = '<label>أو اختار من الأسماء السابقة</label><div class="chips">';
    for (var j = 0; j < db.people.length; j++){
      chips += '<button type="button" class="chip" onclick="Daftary.fillName(this)">' + esc(db.people[j]) + '</button>';
    }
    chips += '</div>';
  }

  openSheet(
    '<h2>' + esc(K.label) + '</h2>' +
    fld('f_name', label, '') + chips + extra +
    '<div class="btns-stack" style="margin-top:18px">' +
      '<button type="button" class="btn" onclick="Daftary.saveAcc()">إنشاء الحساب</button>' +
      '<button type="button" class="btn ghost" onclick="Daftary.closeSheet();Daftary.openNewAccount()">رجوع</button>' +
    '</div>',
    'f_name'
  );
}

function fillName(btn){
  var el = $('f_name');
  if (el) el.value = btn.textContent.trim();
}

function saveAcc(){
  var nameEl = $('f_name');
  if (!nameEl) return;
  var name = nameEl.value.trim();
  if (!name) return toast('اكتب الاسم الأول');
  var titleEl = $('f_title');
  var title = titleEl ? titleEl.value.trim() : '';
  createAcc(name, title, nk);
}

function createAcc(name, title, k){
  var otherCount = 0;
  for (var i = 0; i < db.accounts.length; i++) if (db.accounts[i].kind === 'other') otherCount++;

  var a = {
    id: uid(), name: name, title: title, kind: k,
    type: KINDS[k] ? KINDS[k].type : 'normal',
    colorIdx: k === 'other' ? otherCount % 5 : 0,
    rounds: [{ id: uid(), start: Date.now(), end: null }],
    entries: []
  };
  if (k === 'custody') addPerson(name);
  db.accounts.push(a);
  save();
  closeSheet();
  haptic('success');
  toast('اتعمل الحساب ✓');
  if (window.Sound) Sound.success();
  goScreen('account', a.id);
}

function openEditAcc(){
  var a = acc();
  if (!a) return;
  var label = a.type === 'custody' ? 'إديت الفلوس دي لمين؟' : 'اسم الحساب';
  var extra = a.type === 'custody' ? fld('f_title', 'العنوان أو المكان', a.title || '') : '';
  openSheet(
    '<h2>تعديل الحساب</h2>' + fld('f_name', label, a.name) + extra +
    btns('saveEditAcc()', 'حفظ'),
    'f_name'
  );
}

function saveEditAcc(){
  var a = acc();
  if (!a) return;
  var nameEl = $('f_name');
  if (!nameEl) return;
  var name = nameEl.value.trim();
  if (!name) return toast('اكتب الاسم الأول');
  a.name = name;
  var titleEl = $('f_title');
  if (titleEl) a.title = titleEl.value.trim();
  if (a.type === 'custody') addPerson(name);
  save();
  closeSheet();
  toast('اتعدّل ✓');
  render();
}

function openDelAcc(){
  openSheet(
    '<h2>مسح الحساب</h2>' +
    '<div class="msg danger">هيتم مسح الحساب بكل حركاته. مفيش رجوع.</div>' +
    '<div class="btns-stack">' +
      '<button type="button" class="btn danger" onclick="Daftary.doDelAcc()">أيوه، امسحه</button>' +
      '<button type="button" class="btn ghost" onclick="Daftary.closeSheet()">إلغاء</button>' +
    '</div>'
  );
}

function doDelAcc(){
  var before = snapshot();
  var id = ui.accId;
  var filtered = [];
  for (var i = 0; i < db.accounts.length; i++) if (db.accounts[i].id !== id) filtered.push(db.accounts[i]);
  db.accounts = filtered;
  save();
  closeSheet();
  haptic('error');
  toast('اتمسح');
  ui.screen = 'home';
  ui.tab = 'home';
  render();
  offerUndo(before, 'اتمسح الحساب');
}

/* ═══════════════════════════════════════════════════════════
   24. COMMIT
   ═══════════════════════════════════════════════════════════ */
function commit(o){
  var a = acc();
  if (!a) return;

  if (editId){
    var e = findE(a, editId);
    if (e) for (var k in o) if (o.hasOwnProperty(k)) e[k] = o[k];
    if (window.Sound) Sound.success();
    editId = null;
    save();
    closeSheet();
    render();
    haptic('success');
    toast('اتعدّل ✓');
    return;
  }

  var r = curRound(a);
  var entry = { id: uid(), roundId: r ? r.id : null, ts: Date.now(), counted: true };
  for (var k2 in o) if (o.hasOwnProperty(k2)) entry[k2] = o[k2];
  a.entries.push(entry);
  save();
  closeSheet();
  render();
  haptic('success');
  toast('اتسجل ✓');
}

/* ═══════════════════════════════════════════════════════════
   25. ADD EXPENSE (with smart parse)
   ═══════════════════════════════════════════════════════════ */
var fCnt = true;
function setCnt(){
  var b = $('f_cnt');
  if (!b) return;
  b.className = 'tog ' + (fCnt ? 'on' : 'off');
  var txt = b.querySelector('span:first-child');
  if (txt) txt.textContent = fCnt ? '✓ هيتجمع في الإجمالي' : '✕ مش هيتجمع';
}
function togCnt(){ fCnt = !fCnt; setCnt(); }

function openAdd(id){
  editId = id || null;
  var a = acc();
  var e = id && a ? findE(a, id) : null;
  fCnt = e ? e.counted : true;

  openSheet(
    '<h2>' + (e ? 'تعديل المصروف' : 'سجّل مصروف') + '</h2>' +
    '<label for="f_quick">اكتب بسرعة</label>' +
    '<input type="text" id="f_quick" class="big" inputmode="text" autocomplete="off" value="" oninput="Daftary.smartInput(this.value)">' +
    fld('f_amt', 'أو المبلغ يدويًا', e ? e.amount : '', 'big') +
    fld('f_note', 'الملاحظة', e ? e.note : '') +
    '<button type="button" class="tog on" id="f_cnt" onclick="Daftary.togCnt()">' +
      '<span>✓ هيتجمع في الإجمالي</span><span class="tog-switch"></span>' +
    '</button>' +
    btns('saveAdd()', 'حفظ'),
    'f_quick'
  );
  setCnt();
}

function smartInput(v){
  var parsed = smartParse(v);
  var fAmt = $('f_amt');
  var fNote = $('f_note');

  if (!v) return;

  if (fAmt && parsed.amount > 0) fAmt.value = parsed.amount;
  if (fNote && parsed.note) fNote.value = parsed.note;
}

function saveAdd(){
  var amtEl = $('f_amt');
  if (!amtEl) return;
  var amt = parseNum(amtEl.value);
  if (!(amt > 0)) return toast('اكتب المبلغ');
  var noteEl = $('f_note');
  var note = noteEl ? noteEl.value.trim() : '';
  commit({ kind:'add', amount:amt, note:note, counted:fCnt });
}

/* ═══════════════════════════════════════════════════════════
   26. GIVE / SPEND
   ═══════════════════════════════════════════════════════════ */
function openGive(id){
  editId = id || null;
  var a = acc();
  var e = id && a ? findE(a, id) : null;
  openSheet(
    '<h2>' + (e ? 'تعديل الدفعة' : 'دفعتله فلوس') + '</h2>' +
    fld('f_amt', 'كام دفعتله؟', e ? e.amount : '', 'big') +
    fld('f_note', 'ملاحظة (اختياري)', e ? e.note : '') +
    btns('saveGive()', 'حفظ'),
    'f_amt'
  );
}

function saveGive(){
  var amtEl = $('f_amt');
  if (!amtEl) return;
  var amt = parseNum(amtEl.value);
  if (!(amt > 0)) return toast('اكتب المبلغ');
  var noteEl = $('f_note');
  var note = noteEl ? noteEl.value.trim() : '';
  commit({ kind:'give', amount:amt, note:note });
}

var fRec = true;
function setRec(){
  var b = $('f_rec');
  if (!b) return;
  b.className = 'tog ' + (fRec ? 'on' : 'warn');
  var txt = b.querySelector('span:first-child');
  if (txt) txt.textContent = fRec ? '✓ جاب الفاتورة' : '⚠ مجابش فاتورة';
}
function togRec(){ fRec = !fRec; setRec(); }

function openSpend(id){
  editId = id || null;
  var a = acc();
  var e = id && a ? findE(a, id) : null;
  fRec = e ? e.hasReceipt !== false : true;
  openSheet(
    '<h2>' + (e ? 'تعديل الصرف' : 'سجّل صرف') + '</h2>' +
    fld('f_note', 'صرفْت في إيه؟', e ? e.note : '') +
    fld('f_amt', 'المبلغ بالجنيه', e ? e.amount : '', 'big') +
    fld('f_from', 'اشتريت منين؟ (اختياري)', e ? e.from : '') +
    '<button type="button" class="tog on" id="f_rec" onclick="Daftary.togRec()">' +
      '<span>✓ جاب الفاتورة</span><span class="tog-switch"></span>' +
    '</button>' +
    btns('saveSpend()', 'حفظ الصرف'),
    'f_note'
  );
  setRec();
}

function saveSpend(){
  var noteEl = $('f_note');
  var amtEl = $('f_amt');
  if (!noteEl || !amtEl) return;
  var note = noteEl.value.trim();
  var amt = parseNum(amtEl.value);
  if (!note) return toast('اكتب اتصرف على إيه');
  if (!(amt > 0)) return toast('اكتب المبلغ');
  var fromEl = $('f_from');
  var from = fromEl ? fromEl.value.trim() : '';
  commit({ kind:'spend', amount:amt, note:note, from:from, hasReceipt:fRec });
}

/* ═══════════════════════════════════════════════════════════
   27. ENTRY DETAILS
   ═══════════════════════════════════════════════════════════ */
function openEntry(id, ro){
  var a = acc();
  if (!a) return;
  var e = findE(a, id);
  if (!e) return;
  openEntrySheet(a, e, ro);
}

function openEntryPublic(accId, entryId){
  var a = null;
  for (var i = 0; i < db.accounts.length; i++){
    if (db.accounts[i].id === accId){ a = db.accounts[i]; break; }
  }
  if (!a) return;
  var e = findE(a, entryId);
  if (!e) return;
  openEntrySheet(a, e, false);
}

function openEntrySheet(a, e, ro){
  var d = new Date(e.ts);
  var themeDay = dayTheme(d);
  var k = kindOf(a);
  var colors = accountColors(a);

  var rows = '';
  rows += '<div class="kv"><span>الحساب</span><b>' + esc(a.name) + '</b></div>';
  rows += '<div class="kv"><span>النوع</span><b>' + (KLABEL[e.kind] || 'حركة') + '</b></div>';
  if (e.note) rows += '<div class="kv"><span>الملاحظة</span><b>' + esc(e.note) + '</b></div>';
  if (e.kind === 'spend' && e.from) rows += '<div class="kv"><span>من</span><b>' + esc(e.from) + '</b></div>';
  if (e.kind === 'spend' && e.hasReceipt !== undefined){
    rows += '<div class="kv"><span>الفاتورة</span><b>' + (e.hasReceipt ? 'جاب ✓' : 'مجابش') + '</b></div>';
  }
  if (e.kind === 'add'){
    rows += '<div class="kv"><span>في الإجمالي</span><b>' + (e.counted ? 'بيتجمع' : 'مش بيتجمع') + '</b></div>';
  }

  var dayCard =
    '<div class="day-accent" style="background:' + themeDay.t + ';color:' + themeDay.d + '">' +
      '<div>' +
        '<div class="da-day">' + DAYS[d.getDay()] + '</div>' +
        '<div class="da-date">' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + '</div>' +
      '</div>' +
      '<div class="da-time">' + fmtTime(e.ts) + '</div>' +
    '</div>';

    var actions = '';
  if (!ro){
    actions = '<div class="btns-2">' +
      '<button type="button" class="btn soft small" onclick="Daftary.editEntry(\'' + e.id + '\')">' + svg('edit', ' width="16" height="16"') + ' تعديل</button>' +
      '<button type="button" class="btn danger small" id="delb" onclick="Daftary.askDel(\'' + e.id + '\')">' + svg('trash', ' width="16" height="16"') + ' مسح</button>' +
    '</div>' +
    '<button type="button" class="btn ghost small" style="margin-top:10px;width:100%" onclick="Daftary.shareEntry(\'' + a.id + '\',\'' + e.id + '\')">' +
      svg('share', ' width="16" height="16"') + ' شارك الحركة' +
    '</button>';
  } else {
    actions = '<button type="button" class="btn ghost small" style="width:100%" onclick="Daftary.shareEntry(\'' + a.id + '\',\'' + e.id + '\')">' +
      svg('share', ' width="16" height="16"') + ' شارك الحركة' +
    '</button>';
  }

  openSheet(
    '<div style="text-align:center;padding:8px 0 4px">' +
      '<div style="width:56px;height:56px;margin:0 auto 12px;border-radius:18px;background:' + colors.l + ';color:' + colors.d + ';display:flex;align-items:center;justify-content:center">' +
        svg(k.icon, ' width="28" height="28"') +
      '</div>' +
      '<div style="font-size:34px;font-weight:900;letter-spacing:-1px;color:' + colors.d + ';font-variant-numeric:tabular-nums">' +
        money(e.amount) +
        '<span style="font-size:17px;color:var(--muted);font-weight:700;margin-inline-start:6px">ج</span>' +
      '</div>' +
    '</div>' +
    dayCard + rows + actions +
    '<button type="button" class="btn ghost" style="margin-top:10px" onclick="Daftary.closeSheet()">قفل</button>'
  );
}
/* ═══════════════════════════════════════════════════════════
   مشاركة الحركة كصورة / نص
   ═══════════════════════════════════════════════════════════ */
function shareEntry(accId, entryId){
  var a = null;
  for (var i = 0; i < db.accounts.length; i++){
    if (db.accounts[i].id === accId){ a = db.accounts[i]; break; }
  }
  if (!a) return;
  var e = findEntry(a, entryId);
  if (!e) return;

  var d = new Date(e.ts);
  var k = kindOf(a);
  var colors = accountColors(a);

  var lines = [];
  lines.push('📒 من دفتري');
  lines.push('━━━━━━━━━━━━━━');
  lines.push('📁 الحساب: ' + a.name);
  lines.push('📅 التاريخ: ' + DAYS[d.getDay()] + ' ' + fmtDate(e.ts));
  lines.push('🕐 الوقت: ' + fmtTime(e.ts));
  lines.push('🏷️ النوع: ' + (KLABEL[e.kind] || 'حركة'));
  if (e.note) lines.push('📝 ' + e.note);
  if (e.from) lines.push('📍 من: ' + e.from);
  if (e.kind === 'spend' && e.hasReceipt !== undefined){
    lines.push('🧾 الفاتورة: ' + (e.hasReceipt ? 'جاب ✓' : 'مجابش'));
  }
  lines.push('━━━━━━━━━━━━━━');
  lines.push('💰 المبلغ: ' + money(e.amount) + ' ج');

  var txt = lines.join('\n');

  openSheet(
    '<h2>مشاركة الحركة</h2>' +
    '<div class="msg pre" style="max-height:200px;overflow:auto;font-size:13.5px">' + esc(txt) + '</div>' +
    '<div class="btns-stack" style="margin-top:16px">' +
      '<button type="button" class="btn" onclick="Daftary.shareEntryAsImage(\'' + accId + '\',\'' + entryId + '\')">' +
        '📸 شارك كصورة' +
      '</button>' +
      '<button type="button" class="btn soft" onclick="Daftary.shareWA(\'' + accId + '\',\'' + entryId + '\')">' +
        svg('share', ' width="18" height="18"') + ' ابعته واتساب' +
      '</button>' +
      '<button type="button" class="btn ghost" onclick="Daftary.shareCopy(\'' + accId + '\',\'' + entryId + '\')">' +
        'انسخ الكلام' +
      '</button>' +
      '<button type="button" class="btn ghost" onclick="Daftary.closeSheet()">قفل</button>' +
    '</div>'
  );
}

function buildEntryText(accId, entryId){
  var a = null;
  for (var i = 0; i < db.accounts.length; i++){
    if (db.accounts[i].id === accId){ a = db.accounts[i]; break; }
  }
  if (!a) return '';
  var e = findEntry(a, entryId);
  if (!e) return '';

  var d = new Date(e.ts);
  var lines = [];
  lines.push('📒 من دفتري');
  lines.push('━━━━━━━━━━━━━━');
  lines.push('📁 الحساب: ' + a.name);
  lines.push('📅 التاريخ: ' + DAYS[d.getDay()] + ' ' + fmtDate(e.ts));
  lines.push('🕐 الوقت: ' + fmtTime(e.ts));
  lines.push('🏷️ النوع: ' + (KLABEL[e.kind] || 'حركة'));
  if (e.note) lines.push('📝 ' + e.note);
  if (e.from) lines.push('📍 من: ' + e.from);
  if (e.kind === 'spend' && e.hasReceipt !== undefined){
    lines.push('🧾 الفاتورة: ' + (e.hasReceipt ? 'جاب ✓' : 'مجابش'));
  }
  lines.push('━━━━━━━━━━━━━━');
  lines.push('💰 المبلغ: ' + money(e.amount) + ' ج');
  return lines.join('\n');
}

function shareWA(accId, entryId){
  var txt = buildEntryText(accId, entryId);
  if (!txt) return;
  window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
}

function shareCopy(accId, entryId){
  var txt = buildEntryText(accId, entryId);
  if (!txt) return;
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(
      function(){ toast('اتنسخ ✓'); },
      function(){ fallbackCopy(txt); }
    );
  } else fallbackCopy(txt);
}

function editEntry(id){
  var a = acc();
  if (!a) return;
  var e = findE(a, id);
  if (!e) return;
  if (e.kind === 'give') openGive(id);
  else if (e.kind === 'spend') openSpend(id);
  else openAdd(id);
}

function askDel(id){
  var b = $('delb');
  if (!b) return;
  b.textContent = 'دوس تاني للمسح';
  b.onclick = function(){ Daftary.doDel(id); };
}

function doDel(id){
  var a = acc();
  if (!a) return;
  if (window.Sound) Sound.delete();
  var before = snapshot();
  var filtered = [];
  for (var i = 0; i < a.entries.length; i++) if (a.entries[i].id !== id) filtered.push(a.entries[i]);
  a.entries = filtered;
  save();
  closeSheet();
  render();
  haptic('error');
  toast('اتمسحت');
  offerUndo(before, 'اتمسحت الحركة');
}

/* ═══════════════════════════════════════════════════════════
   28. BREAK DOWN
   ═══════════════════════════════════════════════════════════ */
function openBreak(which){
  var a = acc();
  if (!a) return;
  var r = curRound(a);
  if (!r) return;

  var list = [];
  for (var i = 0; i < a.entries.length; i++){
    var e = a.entries[i];
    if (e.roundId !== r.id) continue;
    if (which === 'total'){ if (e.kind === 'add' && e.counted) list.push(e); }
    else if (e.kind === which) list.push(e);
  }
  list.sort(function(x, y){ return y.ts - x.ts; });

  var sum = 0;
  for (var j = 0; j < list.length; j++) sum += Number(list[j].amount) || 0;

  var title = which === 'total' ? 'الإجمالي جه منين' : (which === 'give' ? 'اللي اتدفعله' : 'اللي اتصرف');

  var rowsHtml = '';
  if (list.length){
    for (var k = 0; k < list.length; k++){
      var en = list[k];
      rowsHtml += '<button type="button" class="entry" style="border-radius:16px;border:1.5px solid var(--line);margin-bottom:8px;padding:12px 14px" onclick="Daftary.openEntry(\'' + en.id + '\',false)">' +
        '<div class="entry-mid">' +
          '<div class="entry-name">' + titleOf(en) + '</div>' +
          '<div class="entry-meta">' +
            '<span>' + fmtDate(en.ts) + '</span>' +
            '<span class="dot"></span>' +
            '<span>' + fmtTime(en.ts) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="entry-amt">' + money(en.amount) + '</div>' +
      '</button>';
    }
  } else {
    rowsHtml = '<div class="empty">مفيش حاجة هنا</div>';
  }

  openSheet(
    '<h2>' + title + '</h2>' +
    '<div class="msg">المجموع: <b>' + money(sum) + ' ج</b> (' + list.length + ' حركة)</div>' +
    rowsHtml +
    '<button type="button" class="btn ghost" style="margin-top:12px" onclick="Daftary.closeSheet()">قفل</button>'
  );
}

/* ═══════════════════════════════════════════════════════════
   29. STATEMENT
   ═══════════════════════════════════════════════════════════ */
function stmtText(a){
  var r = curRound(a);
  if (!r) return '';
  var s = stats(a, r.id);
  var L = [];
  L.push('كشف حساب: ' + a.name + (a.title ? ' — ' + a.title : ''));
  L.push('من ' + fmtDate(r.start) + ' لحد ' + fmtDate(Date.now()));
  L.push('――――――――');

  var es = [];
  for (var i = 0; i < a.entries.length; i++) if (a.entries[i].roundId === r.id) es.push(a.entries[i]);
  es.sort(function(x, y){ return x.ts - y.ts; });

  if (a.type === 'custody'){
    L.push('اتدفعله: ' + money(s.given) + ' ج');
    L.push('اتصرف: ' + money(s.spent) + ' ج');
    L.push((s.left < 0 ? 'صرف زيادة: ' : 'الباقي: ') + money(Math.abs(s.left)) + ' ج');

    var gv = [], sp = [];
    for (var j = 0; j < es.length; j++){
      if (es[j].kind === 'give') gv.push(es[j]);
      if (es[j].kind === 'spend') sp.push(es[j]);
    }
    if (gv.length){
      L.push('');
      L.push('الدفعات:');
      for (var k = 0; k < gv.length; k++){
        L.push('• ' + fmtShort(gv[k].ts) + ' — ' + money(gv[k].amount) + ' ج' + (gv[k].note ? ' — ' + gv[k].note : ''));
      }
    }
    if (sp.length){
      L.push('');
      L.push('الصرفيات:');
      for (var m = 0; m < sp.length; m++){
        var e = sp[m];
        var line = (m + 1) + ') ' + fmtShort(e.ts) + ' — ' + e.note + ' — ' + money(e.amount) + ' ج';
        if (e.from) line += ' — من: ' + e.from;
        if (e.hasReceipt === true) line += ' — فاتورة ✓';
        if (e.hasReceipt === false) line += ' — ⚠ من غير فاتورة';
        L.push(line);
      }
    }
  } else {
    L.push('الإجمالي: ' + money(s.total) + ' ج');
    var ad = [];
    for (var n = 0; n < es.length; n++) if (es[n].kind === 'add' && es[n].counted) ad.push(es[n]);
    if (ad.length){
      L.push('');
      L.push('التفاصيل:');
      for (var p = 0; p < ad.length; p++){
        L.push((p + 1) + ') ' + fmtShort(ad[p].ts) + ' — ' + money(ad[p].amount) + ' ج' + (ad[p].note ? ' — ' + ad[p].note : ''));
      }
    }
  }
  return L.join('\n');
}

function openStatement(){
  var a = acc();
  if (!a) return;
  stmtCache = stmtText(a);
  openSheet(
    '<h2>كشف الحساب</h2>' +
    '<div class="msg pre">' + esc(stmtCache) + '</div>' +
    '<div class="btns-stack">' +
      '<button type="button" class="btn" onclick="Daftary.shareStatementAsImage()">' +
        svg('share', ' width="18" height="18"') + ' شارك كصورة' +
      '</button>' +
      '<button type="button" class="btn soft" onclick="Daftary.sendWA()">' +
        svg('share', ' width="18" height="18"') + ' ابعته واتساب' +
      '</button>' +
      '<button type="button" class="btn ghost" onclick="Daftary.copyStmt()">' +
        'انسخ الكلام' +
      '</button>' +
      '<button type="button" class="btn ghost" onclick="Daftary.closeSheet()">' +
        'قفل' +
      '</button>' +
    '</div>'
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARE AS IMAGE — مشاركة كصورة
   ═══════════════════════════════════════════════════════════ */
function isHtml2CanvasReady(){
  return typeof window.html2canvas === 'function';
}

function buildStatementHTML(a){
  var r = curRound(a);
  if (!r) return '';
  var s = stats(a, r.id);
  var k = kindOf(a);
  var colors = accountColors(a);
  var isDark = theme === 'dark';

  /* نبني HTML مخصص للصورة */
  var bg = isDark ? '#1B222C' : '#FFFFFF';
  var ink = isDark ? '#F0F5FA' : '#0A1814';
  var inkSoft = isDark ? '#CAD6E2' : '#1E3A33';
  var muted = isDark ? '#98A6B5' : '#45605A';
  var line = isDark ? '#384454' : '#BCD1CB';
  var brand = isDark ? '#6FD9C1' : '#15655A';
  var brandBg = isDark ? '#234248' : '#C5E2DB';

  var entries = [];
  for (var i = 0; i < a.entries.length; i++){
    if (a.entries[i].roundId === r.id) entries.push(a.entries[i]);
  }
  entries.sort(function(x, y){ return x.ts - y.ts; });

  var rowsHtml = '';
  for (var j = 0; j < entries.length; j++){
    var e = entries[j];
    var d = new Date(e.ts);
    var label = e.note || KLABEL[e.kind] || 'حركة';
    rowsHtml +=
      '<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid ' + line + ';font-size:13px">' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-weight:700;color:' + ink + '">' + esc(label) + '</div>' +
          '<div style="font-size:11px;color:' + muted + ';margin-top:2px">' + DAYS[d.getDay()] + ' · ' + fmtDate(e.ts) + ' · ' + fmtTime(e.ts) + '</div>' +
        '</div>' +
        '<div style="font-weight:800;color:' + ink + ';white-space:nowrap;font-variant-numeric:tabular-nums">' + money(e.amount) + ' ج</div>' +
      '</div>';
  }

  /* الأرقام الرئيسية */
  var statsHtml = '';
  if (a.type === 'custody'){
    statsHtml =
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">' +
        '<div style="background:rgba(255,255,255,.15);border-radius:12px;padding:12px 6px;text-align:center">' +
          '<div style="font-size:18px;font-weight:900;color:#fff;font-variant-numeric:tabular-nums">' + money(s.given) + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,.85);margin-top:3px">اتدفعله</div>' +
        '</div>' +
        '<div style="background:rgba(255,255,255,.15);border-radius:12px;padding:12px 6px;text-align:center">' +
          '<div style="font-size:18px;font-weight:900;color:#fff;font-variant-numeric:tabular-nums">' + money(s.spent) + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,.85);margin-top:3px">اتصرف</div>' +
        '</div>' +
        '<div style="background:rgba(255,255,255,.25);border-radius:12px;padding:12px 6px;text-align:center">' +
          '<div style="font-size:18px;font-weight:900;color:#fff;font-variant-numeric:tabular-nums">' + money(Math.abs(s.left)) + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,.85);margin-top:3px">' + (s.left < 0 ? 'صرف زيادة' : 'الباقي') + '</div>' +
        '</div>' +
      '</div>';
  } else {
    statsHtml =
      '<div style="background:rgba(255,255,255,.15);border-radius:12px;padding:14px;text-align:center;margin-bottom:16px">' +
        '<div style="font-size:34px;font-weight:900;color:#fff;font-variant-numeric:tabular-nums;letter-spacing:-1px">' + money(s.total) + ' <span style="font-size:16px;opacity:.85">ج</span></div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,.85);margin-top:4px">الإجمالي · ' + s.n + ' حركة</div>' +
      '</div>';
  }

  /* الشعار */
  var logo =
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">' +
      '<div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px">📒</div>' +
      '<div style="color:#fff">' +
        '<div style="font-size:14px;font-weight:800">دفتري</div>' +
        '<div style="font-size:10px;opacity:.85">كل حساباتك في مكان واحد</div>' +
      '</div>' +
    '</div>';

  /* نبني الكارت كامل */
  return '<div id="share-target" style="' +
      'width:400px;padding:0;background:' + bg + ';' +
      'font-family:\'Segoe UI\',\'Noto Sans Arabic\',Tahoma,sans-serif;' +
      'direction:rtl;text-align:start;' +
      '">' +
      /* الهيدر الملون */
      '<div style="background:linear-gradient(140deg,' + colors.d + ' 0%,' + colors.d + ' 100%);padding:20px 18px;color:#fff">' +
        logo +
        '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:4px">' + esc(a.name) + '</div>' +
        (a.title ? '<div style="font-size:12px;color:rgba(255,255,255,.85);margin-bottom:6px">📍 ' + esc(a.title) + '</div>' : '') +
        '<div style="font-size:11px;color:rgba(255,255,255,.8);margin-bottom:12px">من ' + fmtDate(r.start) + ' لحد ' + fmtDate(Date.now()) + '</div>' +
        statsHtml +
      '</div>' +
      /* التفاصيل */
      '<div style="padding:16px 18px 20px">' +
        '<div style="font-size:13px;font-weight:800;color:' + ink + ';margin-bottom:8px">التفاصيل (' + entries.length + ')</div>' +
        (rowsHtml || '<div style="padding:20px;text-align:center;color:' + muted + ';font-size:13px">مفيش حركات لسه</div>') +
        '<div style="margin-top:16px;padding-top:12px;border-top:2px solid ' + line + ';text-align:center">' +
          '<div style="font-size:10px;color:' + muted + '">اتعملت بواسطة</div>' +
          '<div style="font-size:12px;font-weight:800;color:' + brand + ';margin-top:3px">📒 دفتري</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function shareStatementAsImage(){
  var a = acc();
  if (!a) return;

  if (!isHtml2CanvasReady()){
    toast('جاري تجهيز المكتبة... جرّب تاني');
    return;
  }

  var r = curRound(a);
  if (!r) return;
  var s = stats(a, r.id);

  toast('جاري تجهيز الصورة...');

  /* نبني الـ HTML في مكان مخفي */
  var holder = document.createElement('div');
  holder.style.position = 'fixed';
  holder.style.left = '-9999px';
  holder.style.top = '0';
  holder.style.zIndex = '-1';
  holder.innerHTML = buildStatementHTML(a);
  document.body.appendChild(holder);

  var target = holder.querySelector('#share-target');

  setTimeout(function(){
    html2canvas(target, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      logging: false,
      windowWidth: 400,
      windowHeight: target.offsetHeight
    }).then(function(canvas){
      document.body.removeChild(holder);

      /* حوّل لـ blob */
      canvas.toBlob(function(blob){
        if (!blob){
          toast('مقدرتش أجهّز الصورة');
          return;
        }

        var fileName = 'daftary-' + a.name.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '-') + '-' + ymd(new Date()) + '.png';
        var url = URL.createObjectURL(blob);

        /* لو Web Share API متاح */
        var file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })){
          navigator.share({
            files: [file],
            title: 'كشف حساب ' + a.name,
            text: 'من دفتري'
          }).then(function(){
            toast('اتشاركت ✓');
          }).catch(function(){
            /* المستخدم ألغى — نعمل download */
            downloadImage(url, fileName);
          });
        } else {
          /* fallback: نعمل download */
          downloadImage(url, fileName);
        }
      }, 'image/png', 0.95);
    }).catch(function(err){
      if (holder.parentNode) holder.parentNode.removeChild(holder);
      toast('حصلت مشكلة — جرّب تاني');
    });
  }, 100);
}

function downloadImage(url, fileName){
  var a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
  toast('اتحفظت الصورة ✓');
}

/* مشاركة الحركة الواحدة كصورة */
function buildEntryImageHTML(a, e){
  var d = new Date(e.ts);
  var k = kindOf(a);
  var colors = accountColors(a);
  var themeDay = dayTheme(d);
  var isDark = theme === 'dark';

  var bg = isDark ? '#1B222C' : '#FFFFFF';
  var ink = isDark ? '#F0F5FA' : '#0A1814';
  var muted = isDark ? '#98A6B5' : '#45605A';
  var line = isDark ? '#384454' : '#BCD1CB';

  var rows = '';
  rows += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid ' + line + '"><span style="color:' + muted + ';font-size:13px">الحساب</span><b style="color:' + ink + ';font-size:13px">' + esc(a.name) + '</b></div>';
  rows += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid ' + line + '"><span style="color:' + muted + ';font-size:13px">النوع</span><b style="color:' + ink + ';font-size:13px">' + (KLABEL[e.kind] || 'حركة') + '</b></div>';
  if (e.note) rows += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid ' + line + '"><span style="color:' + muted + ';font-size:13px">الملاحظة</span><b style="color:' + ink + ';font-size:13px">' + esc(e.note) + '</b></div>';
  if (e.from) rows += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid ' + line + '"><span style="color:' + muted + ';font-size:13px">من</span><b style="color:' + ink + ';font-size:13px">' + esc(e.from) + '</b></div>';
  rows += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid ' + line + '"><span style="color:' + muted + ';font-size:13px">اليوم</span><b style="color:' + ink + ';font-size:13px">' + DAYS[d.getDay()] + ' · ' + fmtDate(e.ts) + '</b></div>';
  rows += '<div style="display:flex;justify-content:space-between;padding:10px 0"><span style="color:' + muted + ';font-size:13px">الوقت</span><b style="color:' + ink + ';font-size:13px">' + fmtTime(e.ts) + '</b></div>';

  return '<div id="share-entry-target" style="' +
      'width:360px;padding:0;background:' + bg + ';' +
      'font-family:\'Segoe UI\',\'Noto Sans Arabic\',Tahoma,sans-serif;' +
      'direction:rtl;text-align:start;' +
      '">' +
      '<div style="background:linear-gradient(140deg,' + colors.d + ' 0%,' + colors.d + ' 100%);padding:22px 18px;color:#fff;text-align:center">' +
        '<div style="width:52px;height:52px;border-radius:16px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:26px">' +
          svg(k.icon, ' width="28" height="28" style="color:#fff"') +
        '</div>' +
        '<div style="font-size:36px;font-weight:900;letter-spacing:-1.4px;font-variant-numeric:tabular-nums">' +
          money(e.amount) +
          '<span style="font-size:17px;opacity:.85;font-weight:700;margin-inline-start:4px">ج</span>' +
        '</div>' +
        '<div style="font-size:12px;opacity:.85;margin-top:6px">' + esc(a.name) + '</div>' +
      '</div>' +
      '<div style="padding:14px 18px 18px">' +
        rows +
        '<div style="margin-top:14px;padding-top:12px;border-top:2px solid ' + line + ';text-align:center">' +
          '<div style="font-size:10px;color:' + muted + '">من</div>' +
          '<div style="font-size:12px;font-weight:800;color:' + colors.d + ';margin-top:3px">📒 دفتري</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function shareEntryAsImage(accId, entryId){
  var a = null;
  for (var i = 0; i < db.accounts.length; i++){
    if (db.accounts[i].id === accId){ a = db.accounts[i]; break; }
  }
  if (!a) return;
  var e = findEntry(a, entryId);
  if (!e) return;

  if (!isHtml2CanvasReady()){
    toast('جاري تجهيز المكتبة... جرّب تاني');
    return;
  }

  toast('جاري تجهيز الصورة...');

  var holder = document.createElement('div');
  holder.style.position = 'fixed';
  holder.style.left = '-9999px';
  holder.style.top = '0';
  holder.style.zIndex = '-1';
  holder.innerHTML = buildEntryImageHTML(a, e);
  document.body.appendChild(holder);

  var target = holder.querySelector('#share-entry-target');

  setTimeout(function(){
    html2canvas(target, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      logging: false
    }).then(function(canvas){
      document.body.removeChild(holder);

      canvas.toBlob(function(blob){
        if (!blob){
          toast('مقدرتش أجهّز الصورة');
          return;
        }

        var fileName = 'daftary-entry-' + ymd(new Date()) + '.png';
        var url = URL.createObjectURL(blob);

        var file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })){
          navigator.share({
            files: [file],
            title: 'حركة من دفتري',
            text: e.note || 'حركة من دفتري'
          }).then(function(){
            toast('اتشاركت ✓');
          }).catch(function(){
            downloadImage(url, fileName);
          });
        } else {
          downloadImage(url, fileName);
        }
      }, 'image/png', 0.95);
    }).catch(function(err){
      if (holder.parentNode) holder.parentNode.removeChild(holder);
      toast('حصلت مشكلة — جرّب تاني');
    });
  }, 100);
}

function sendWA(){
  window.open('https://wa.me/?text=' + encodeURIComponent(stmtCache), '_blank');
}

function fallbackCopy(t){
  var ta = document.createElement('textarea');
  ta.value = t;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); toast('اتنسخ ✓'); } catch(e){ toast('معرفتش أنسخ'); }
  document.body.removeChild(ta);
}

function copyStmt(){
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(stmtCache).then(
      function(){ toast('اتنسخ ✓'); },
      function(){ fallbackCopy(stmtCache); }
    );
  } else fallbackCopy(stmtCache);
}

/* ═══════════════════════════════════════════════════════════
   30. SETTLE
   ═══════════════════════════════════════════════════════════ */
function openSettle(){
  var a = acc();
  if (!a) return;
  var r = curRound(a);
  if (!r) return;
  var s = stats(a, r.id);
  if (!s.n) return toast('مفيش حركات تتقفل');

  var txt, w = '';
  if (a.type === 'custody'){
    txt = 'اتدفع <b>' + money(s.given) + '</b> ج، اتصرف <b>' + money(s.spent) + '</b> ج، الباقي <b>' + money(s.left) + '</b> ج.';
    if (s.left !== 0) w += '<div class="msg warn">لسه باقي ' + money(s.left) + ' ج</div>';
    if (s.noRec) w += '<div class="msg warn">' + s.noRec + ' صرف من غير فاتورة</div>';
  } else {
    txt = 'الإجمالي <b>' + money(s.total) + '</b> ج.';
  }

  openSheet(
    '<h2>تقفل الحساب؟</h2>' +
    '<div class="msg">' + txt + '<br>الحركات هتتحفظ في الأرشيف، والحساب هيبدأ من صفر.</div>' +
    w +
    '<div class="btns-stack">' +
      '<button type="button" class="btn" onclick="Daftary.doSettle()">أيوه، خالص</button>' +
      '<button type="button" class="btn ghost" onclick="Daftary.closeSheet()">رجوع</button>' +
    '</div>'
  );
}

function doSettle(){
  var a = acc();
  if (!a) return;
  var r = curRound(a);
  if (!r) return;
  var now = Date.now();
  r.end = now;
  a.rounds.push({ id: uid(), start: now, end: null });
  save();
  closeSheet();
  haptic('success');
  toast('الحساب خلص ✓');
  render();
}

/* ═══════════════════════════════════════════════════════════
   31. DUES FORMS
   ═══════════════════════════════════════════════════════════ */
var editDue = null;
var dueRep = 'none';

function openDueForm(id){
  var d = null;
  if (id){
    for (var i = 0; i < db.dues.length; i++){
      if (db.dues[i].id === id){ d = db.dues[i]; break; }
    }
  }
  editDue = id || null;
  dueRep = d ? d.repeat : 'none';

  var reps = '';
  var keys = ['none','weekly','monthly','yearly'];
  for (var j = 0; j < keys.length; j++){
    var k = keys[j];
    reps += '<button type="button" class="opt" id="rp_' + k + '" onclick="Daftary.pickRep(\'' + k + '\')"><b>' + REP[k] + '</b></button>';
  }

  openSheet(
    '<h2>' + (d ? 'تعديل المستحق' : 'مستحق جديد') + '</h2>' +
    fld('d_title', 'إيه المستحق؟', d ? d.title : '') +
    fld('d_amt', 'المبلغ (اختياري)', d && d.amount ? d.amount : '', 'num') +
    '<label for="d_date">الميعاد</label>' +
    '<input type="date" id="d_date" value="' + (d ? d.date : ymd(today0())) + '">' +
    '<div class="chips" style="margin-top:10px">' +
      '<button type="button" class="chip" onclick="Daftary.setDue(0)">النهاردة</button>' +
      '<button type="button" class="chip" onclick="Daftary.setDue(1)">بكرة</button>' +
      '<button type="button" class="chip" onclick="Daftary.setDue(7)">أسبوع</button>' +
      '<button type="button" class="chip" onclick="Daftary.setDue(30)">شهر</button>' +
    '</div>' +
    '<label>التكرار</label>' +
    '<div class="grid2">' + reps + '</div>' +
    btns('saveDue()', 'حفظ'),
    'd_title'
  );
  pickRep(dueRep);
}

function setDue(n){
  var el = $('d_date');
  if (!el) return;
  var d = today0();
  d.setDate(d.getDate() + n);
  el.value = ymd(d);
}

function pickRep(k){
  dueRep = k;
  var keys = ['none','weekly','monthly','yearly'];
  for (var i = 0; i < keys.length; i++){
    var el = $('rp_' + keys[i]);
    if (el) el.className = 'opt' + (keys[i] === k ? ' sel' : '');
  }
}

function saveDue(){
  var titleEl = $('d_title');
  var amtEl = $('d_amt');
  var dateEl = $('d_date');
  if (!titleEl || !dateEl) return;
  var title = titleEl.value.trim();
  var amt = amtEl ? parseNum(amtEl.value) : NaN;
  var date = dateEl.value;
  if (!title) return toast('اكتب إيه المستحق');
  if (!date) return toast('اختار الميعاد');

  var o = { title: title, amount: isNaN(amt) ? 0 : amt, date: date, repeat: dueRep, dom: fromYMD(date).getDate() };

  if (editDue){
    for (var i = 0; i < db.dues.length; i++){
      if (db.dues[i].id === editDue){
        for (var k in o) if (o.hasOwnProperty(k)) db.dues[i][k] = o[k];
        break;
      }
    }
    toast('اتعدّل ✓');
  } else {
    o.id = uid();
    db.dues.push(o);
    toast('اتسجل ✓');
  }
  editDue = null;
  save();
  closeSheet();
  render();
}

function openDue(id){
  var d = null;
  for (var i = 0; i < db.dues.length; i++){
    if (db.dues[i].id === id){ d = db.dues[i]; break; }
  }
  if (!d) return;
  var n = daysTo(d.date);
  var kv = '<div class="kv"><span>الميعاد</span><b>' + fmtDue(d.date) + '</b></div>' +
    '<div class="kv"><span>فاضل</span><b>' + dueLabel(n) + '</b></div>' +
    (d.amount ? '<div class="kv"><span>المبلغ</span><b>' + money(d.amount) + ' ج</b></div>' : '') +
    '<div class="kv"><span>التكرار</span><b>' + REP[d.repeat] + '</b></div>';

  openSheet(
    '<h2>' + esc(d.title) + '</h2>' + kv +
    '<div class="btns-stack" style="margin-top:18px">' +
      '<button type="button" class="btn" onclick="Daftary.openPay(\'' + d.id + '\')">' + svg('check', ' width="18" height="18"') + ' اتدفع</button>' +
      '<button type="button" class="btn ghost" onclick="Daftary.openDueForm(\'' + d.id + '\')">' + svg('edit', ' width="18" height="18"') + ' تعديل</button>' +
      '<button type="button" class="btn danger" id="delb" onclick="Daftary.askDelDue(\'' + d.id + '\')">' + svg('trash', ' width="18" height="18"') + ' مسح</button>' +
      '<button type="button" class="btn ghost" onclick="Daftary.closeSheet()">قفل</button>' +
    '</div>'
  );
}

function askDelDue(id){
  var b = $('delb');
  if (!b) return;
  b.textContent = 'دوس تاني للمسح';
  b.onclick = function(){
    var filtered = [];
    for (var i = 0; i < db.dues.length; i++) if (db.dues[i].id !== id) filtered.push(db.dues[i]);
    db.dues = filtered;
    save();
    closeSheet();
    render();
    toast('اتمسح');
  };
}

var payId = null;
var payMine = true;

function setPayMine(){
  var b = $('p_mine');
  if (!b) return;
  b.className = 'tog ' + (payMine ? 'on' : 'off');
  var txt = b.querySelector('span:first-child');
  if (txt) txt.textContent = payMine ? '✓ هسجّله في مصروفاتي' : '✕ مش هسجّله';
}
function togPayMine(){ payMine = !payMine; setPayMine(); }

function openPay(id){
  var d = null;
  for (var i = 0; i < db.dues.length; i++) if (db.dues[i].id === id){ d = db.dues[i]; break; }
  if (!d) return;
  payId = id;
  var mine = null;
  for (var j = 0; j < db.accounts.length; j++) if (db.accounts[j].kind === 'mine'){ mine = db.accounts[j]; break; }
  payMine = !!mine;

  openSheet(
    '<h2>✓ اتدفع</h2>' +
    '<div class="msg"><b>' + esc(d.title) + '</b></div>' +
    fld('p_amt', 'دفعت كام؟', d.amount || '', 'big') +
    (mine ? '<button type="button" class="tog on" id="p_mine" onclick="Daftary.togPayMine()"><span>✓ هسجّله في مصروفاتي</span><span class="tog-switch"></span></button>' : '') +
    '<div class="btns-stack" style="margin-top:18px">' +
      '<button type="button" class="btn" onclick="Daftary.doPay()">تمام</button>' +
      '<button type="button" class="btn ghost" onclick="Daftary.closeSheet()">إلغاء</button>' +
    '</div>',
    'p_amt'
  );
  setPayMine();
}

function doPay(){
  var d = null;
  for (var i = 0; i < db.dues.length; i++) if (db.dues[i].id === payId){ d = db.dues[i]; break; }
  if (!d) return;
  var amtEl = $('p_amt');
  var amt = amtEl ? parseNum(amtEl.value) : 0;
  if (isNaN(amt)) amt = 0;

  db.duesLog.push({ title: d.title, amount: amt, paidAt: Date.now() });
  if (db.duesLog.length > LOG_LIMIT) db.duesLog = db.duesLog.slice(-LOG_LIMIT);

  var mine = null;
  for (var j = 0; j < db.accounts.length; j++) if (db.accounts[j].kind === 'mine'){ mine = db.accounts[j]; break; }

  if (payMine && mine && amt > 0){
    var r = curRound(mine);
    mine.entries.push({
      id: uid(),
      roundId: r ? r.id : null,
      ts: Date.now(),
      counted: true,
      kind: 'add',
      amount: amt,
      note: d.title
    });
  }

  var msg = 'اتدفع ✓';
  if (d.repeat === 'none'){
    var filtered = [];
    for (var k = 0; k < db.dues.length; k++) if (db.dues[k].id !== d.id) filtered.push(db.dues[k]);
    db.dues = filtered;
  } else {
    var guard = 0;
    do {
      d.date = nextDate(d);
      guard++;
    } while (daysTo(d.date) < 0 && guard < RECUR_GUARD);
    msg = 'اتدفع ✓ — الجاي ' + fmtShort(fromYMD(d.date).getTime());
  }

  save();
  closeSheet();
  render();
  haptic('success');
  toast(msg);
}

/* ═══════════════════════════════════════════════════════════
   32. BUDGET
   ═══════════════════════════════════════════════════════════ */
function openBudget(){
  ui.moreSub = 'budget';
  render();
}

function saveBudgetInline(){
  var el = $('b_amt');
  if (!el) return;
  var n = parseNum(el.value);
  if (!(n > 0)){
    delete db.budgets.__overall__;
    save();
    toast('اتمسحت الميزانية');
    render();
    return;
  }
  db.budgets.__overall__ = n;
  save();
  toast('اتحفظت ✓');
  render();
}

function saveBudget(){ saveBudgetInline(); }

/* ═══════════════════════════════════════════════════════════
   33. SECURITY
   ═══════════════════════════════════════════════════════════ */
var pinBusy = false;

function hashPin(s){
  return Promise.resolve().then(function(){
    if (window.crypto && crypto.subtle && window.TextEncoder){
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function(b){
        return Array.from(new Uint8Array(b)).map(function(x){ return x.toString(16).padStart(2, '0'); }).join('');
      });
    }
    var h = 0;
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return 'fb-' + Math.abs(h).toString(16);
  });
}

function setPin(){
  var p = prompt('اكتب رمز PIN من 4 إلى 12 رقمًا');
  if (p === null) return;
  if (!/^\d{4,12}$/.test(p)) return toast('الرمز من 4 إلى 12 رقم');
  var p2 = prompt('أعد كتابة الرمز للتأكيد');
  if (p !== p2) return toast('الرمزان مش متطابقين');
  hashPin(p).then(function(h){
    db.settings.pinHash = h;
    sessionStorage.setItem(UNLOCK_KEY, '1');
    save();
    toast('اتفعّل القفل ✓');
    render();
  });
}

function removePin(){
  if (!confirm('إلغاء قفل التطبيق؟')) return;
  delete db.settings.pinHash;
  sessionStorage.removeItem(UNLOCK_KEY);
  save();
  toast('اتلغى القفل');
  render();
}

function lockNow(){
  sessionStorage.removeItem(UNLOCK_KEY);
  checkLock();
}

function checkLock(){
  if (!db.settings.pinHash) return;
  if (sessionStorage.getItem(UNLOCK_KEY) === '1') return;
  var el = $('lock');
  if (!el || !el.hasAttribute('hidden')) return;

  el.innerHTML =
    '<div class="lock-card">' +
      '<div class="lock-icon">' + svg('lock', ' width="32" height="32"') + '</div>' +
      '<h2>دفتري مقفول</h2>' +
      '<p>اكتب الرمز للمتابعة</p>' +
      '<input id="pin_entry" type="password" inputmode="numeric" autocomplete="current-password" maxlength="12">' +
      '<div id="pin_error" class="lock-error"></div>' +
      '<button type="button" class="btn" id="pin_unlock" onclick="Daftary.tryUnlock()">فتح التطبيق</button>' +
    '</div>';

  el.removeAttribute('hidden');
  var inp = $('pin_entry');
  if (inp){
    setTimeout(function(){ inp.focus(); }, 150);
    inp.addEventListener('keydown', function(ev){ if (ev.key === 'Enter') tryUnlock(); });
  }
}

function tryUnlock(){
  if (pinBusy) return;
  var inp = $('pin_entry');
  var err = $('pin_error');
  if (!inp) return;
  var v = inp.value;
  if (!v){ if (err) err.textContent = 'اكتب الرمز'; return; }
  pinBusy = true;
  if (err) err.textContent = '';
  hashPin(v).then(function(h){
    pinBusy = false;
    if (h === db.settings.pinHash){
      sessionStorage.setItem(UNLOCK_KEY, '1');
      var el = $('lock');
      if (el){ el.setAttribute('hidden', ''); el.innerHTML = ''; }
      toast('أهلاً بيك 👋');
    } else {
      if (err) err.textContent = 'الرمز غير صحيح';
      inp.value = '';
      inp.focus();
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   34. BACKUP
   ═══════════════════════════════════════════════════════════ */
function openBackup(){ ui.moreSub = 'backup'; render(); }

function exportData(){
  var json;
  try { json = JSON.stringify(db, null, 2); } catch(e){ return toast('معرفتش أجهّز الملف'); }
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'daftary-backup-' + ymd(new Date()) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
  toast('اتحفظت النسخة ✓');
}

function exportCSV(){
  var rows = [['التاريخ','الوقت','الحساب','النوع','المبلغ','ملاحظة']];
  for (var i = 0; i < db.accounts.length; i++){
    var a = db.accounts[i];
    for (var j = 0; j < a.entries.length; j++){
      var e = a.entries[j];
      rows.push([fmtDate(e.ts), fmtTime(e.ts), a.name, KLABEL[e.kind] || e.kind, e.amount, e.note || '']);
    }
  }
  var csv = '\ufeff' + rows.map(function(row){
    return row.map(function(v){ return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\r\n');
  var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  var a2 = document.createElement('a');
  a2.href = url;
  a2.download = 'daftary-' + ymd(new Date()) + '.csv';
  document.body.appendChild(a2);
  a2.click();
  document.body.removeChild(a2);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
  toast('اتصدّر CSV ✓');
}

function mergeById(cur, inc){
  var map = {}, i;
  for (i = 0; i < (cur || []).length; i++) if (cur[i] && cur[i].id) map[cur[i].id] = cur[i];
  for (i = 0; i < (inc || []).length; i++){
    var x = inc[i];
    if (!x || !x.id) continue;
    if (!map[x.id]){ map[x.id] = x; continue; }
    var ex = map[x.id];
    if (Array.isArray(ex.entries) && Array.isArray(x.entries)){
      var em = {}, j;
      for (j = 0; j < ex.entries.length; j++) if (ex.entries[j].id) em[ex.entries[j].id] = ex.entries[j];
      for (j = 0; j < x.entries.length; j++) if (x.entries[j].id && !em[x.entries[j].id]) em[x.entries[j].id] = x.entries[j];
      var me = [];
      for (var k in em) if (em.hasOwnProperty(k)) me.push(em[k]);
      ex.entries = me;
    }
    if (Array.isArray(ex.rounds) && Array.isArray(x.rounds)){
      var rm = {}, m;
      for (m = 0; m < ex.rounds.length; m++) if (ex.rounds[m].id) rm[ex.rounds[m].id] = ex.rounds[m];
      for (m = 0; m < x.rounds.length; m++) if (x.rounds[m].id && !rm[x.rounds[m].id]) rm[x.rounds[m].id] = x.rounds[m];
      var mr = [];
      for (var kk in rm) if (rm.hasOwnProperty(kk)) mr.push(rm[kk]);
      ex.rounds = mr;
    }
  }
  var out = [];
  for (var id in map) if (map.hasOwnProperty(id)) out.push(map[id]);
  return out;
}

function importData(inp, mode){
  var f = inp && inp.files && inp.files[0];
  if (!f) return;
  var rd = new FileReader();
  rd.onload = function(){
    var oldDb = db;
    try {
      var cand = JSON.parse(rd.result);
      if (!cand || typeof cand !== 'object') throw new Error('invalid');
      if (!Array.isArray(cand.accounts)) throw new Error('missing');
      cand = norm(cand);
      for (var i = 0; i < cand.accounts.length; i++){
        var a = cand.accounts[i];
        if (!a || typeof a.id !== 'string' || !Array.isArray(a.entries) || !Array.isArray(a.rounds)) throw new Error('invalid-account');
      }
      if (mode === 'merge'){
        var merged = norm(JSON.parse(JSON.stringify(oldDb)));
        merged.accounts = mergeById(merged.accounts, cand.accounts);
        merged.dues     = mergeById(merged.dues, cand.dues);
        merged.duesLog  = mergeById(merged.duesLog, cand.duesLog);
        var pm = {}, j;
        for (j = 0; j < merged.people.length; j++) pm[merged.people[j]] = 1;
        for (j = 0; j < cand.people.length; j++) pm[cand.people[j]] = 1;
        merged.people = [];
        for (var p in pm) if (pm.hasOwnProperty(p)) merged.people.push(p);
        merged.budgets = Object.assign({}, cand.budgets || {}, merged.budgets || {});
        db = merged;
      } else {
        db = cand;
      }
      save();
      closeSheet();
      toast(mode === 'merge' ? 'اتدمجت ✓' : 'اتسترجعت ✓');
      ui.screen = 'home';
      ui.tab = 'home';
      ui.moreSub = null;
      render();
    } catch(e){
      db = oldDb;
      toast('الملف ده مش نسخة صالحة');
    }
    inp.value = '';
  };
  rd.onerror = function(){ toast('معرفتش أقرا الملف'); inp.value = ''; };
  rd.readAsText(f);
}
/* ═══════════════════════════════════════════════════════════
   34.5. NOTIFICATIONS — إشعارات ذكية
   ═══════════════════════════════════════════════════════════ */
var NOTIF_KEY = 'daftary_notif_enabled';
var NOTIF_LAST_CHECK = 'daftary_notif_last_check';
var notifEnabled = false;

function loadNotifSetting(){
  try {
    notifEnabled = localStorage.getItem(NOTIF_KEY) === '1';
  } catch(e){ notifEnabled = false; }
}

function saveNotifSetting(){
  try {
    localStorage.setItem(NOTIF_KEY, notifEnabled ? '1' : '0');
  } catch(e){}
}

function isNotifSupported(){
  return 'Notification' in window;
}

function requestNotifPermission(){
  if (!isNotifSupported()){
    toast('الإشعارات مش مدعومة في المتصفح ده');
    return Promise.resolve(false);
  }

  if (Notification.permission === 'granted'){
    notifEnabled = true;
    saveNotifSetting();
    return Promise.resolve(true);
  }

  if (Notification.permission === 'denied'){
    toast('الإشعارات مرفوضة — فعّلها من إعدادات المتصفح');
    return Promise.resolve(false);
  }

  return Notification.requestPermission().then(function(result){
    if (result === 'granted'){
      notifEnabled = true;
      saveNotifSetting();
      toast('الإشعارات اتفعّلت ✓');
      return true;
    } else {
      toast('الإشعارات مرفوضة');
      return false;
    }
  });
}

function sendNotification(title, body, tag){
  if (!notifEnabled) return;
  if (!isNotifSupported()) return;
  if (Notification.permission !== 'granted') return;

  try {
    var n = new Notification(title, {
      body: body,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: tag || 'daftary',
      dir: 'rtl',
      lang: 'ar',
      requireInteraction: false,
      silent: false
    });

    n.onclick = function(){
      window.focus();
      n.close();
    };

    setTimeout(function(){ try { n.close(); } catch(e){} }, 8000);
  } catch(e){}
}

function checkNotifications(){
  if (!notifEnabled) return;
  if (!isNotifSupported() || Notification.permission !== 'granted') return;

  /* مرة كل 6 ساعات */
  var now = Date.now();
  var last = 0;
  try { last = parseInt(localStorage.getItem(NOTIF_LAST_CHECK) || '0', 10) || 0; } catch(e){}
  if (now - last < 6 * 60 * 60 * 1000) return;

  try { localStorage.setItem(NOTIF_LAST_CHECK, String(now)); } catch(e){}

  /* 1) مستحقات متأخرة */
  var overdue = [];
  for (var i = 0; i < db.dues.length; i++){
    var d = db.dues[i];
    var n = daysTo(d.date);
    if (n < 0 && n >= -7) overdue.push(d);
  }
  if (overdue.length > 0){
    var first = overdue[0];
    sendNotification(
      '💳 فيه مستحق متأخر',
      first.title + ' — متأخر ' + dayWord(-daysTo(first.date)),
      'due-overdue'
    );
    return;
  }

  /* 2) مستحقات بكرة */
  var tomorrow = [];
  for (var j = 0; j < db.dues.length; j++){
    var d2 = db.dues[j];
    if (daysTo(d2.date) === 1) tomorrow.push(d2);
  }
  if (tomorrow.length > 0){
    sendNotification(
      '📅 مستحق بكرة',
      tomorrow[0].title + (tomorrow[0].amount ? ' — ' + money(tomorrow[0].amount) + ' ج' : ''),
      'due-tomorrow'
    );
    return;
  }

  /* 3) تذكير يومي */
  var hasToday = false;
  var k = dayKey(Date.now());
  for (var a = 0; a < db.accounts.length; a++){
    var acc = db.accounts[a];
    for (var e = 0; e < acc.entries.length; e++){
      if (dayKey(acc.entries[e].ts) === k){ hasToday = true; break; }
    }
    if (hasToday) break;
  }
  if (!hasToday && db.accounts.length > 0){
    var h = new Date().getHours();
    if (h >= 20){
      sendNotification(
        '💡 لسه مسجلتش النهاردة',
        'ما تنساش تسجل مصاريف النهاردة قبل ما تنام',
        'daily-reminder'
      );
      return;
    }
  }

  /* 4) تنبيه الميزانية */
  var budget = Number(db.budgets.__overall__) || 0;
  if (budget > 0){
    var ms = monthStats();
    var pct = ms.total / budget * 100;
    if (pct >= 80 && pct < 100){
      sendNotification(
        '⚠️ قربت من الميزانية',
        'صرفت ' + Math.round(pct) + '% من ميزانية الشهر',
        'budget-warn'
      );
    } else if (pct >= 100){
      sendNotification(
        '🚨 تعديت الميزانية',
        'صرفت ' + money(ms.total) + ' ج من ' + money(budget) + ' ج',
        'budget-over'
      );
    }
  }
}

function openNotifications(){
  var supported = isNotifSupported();
  var permission = supported ? Notification.permission : 'unsupported';
  var status = '';
  var statusColor = 'var(--muted)';

  if (!supported){
    status = 'مش مدعومة في المتصفح ده';
    statusColor = 'var(--danger)';
  } else if (permission === 'granted' && notifEnabled){
    status = 'الإشعارات مفعّلة ✓';
    statusColor = 'var(--brand-d)';
  } else if (permission === 'denied'){
    status = 'الإشعارات مرفوضة';
    statusColor = 'var(--danger)';
  } else if (notifEnabled){
    status = 'الإشعارات مستعدة';
    statusColor = 'var(--brand-d)';
  } else {
    status = 'الإشعارات متوقفة';
  }

  openSheet(
    '<h2>الإشعارات</h2>' +
    '<div class="msg">' +
      'هنبعتلك تنبيهات لطيفة لما:' +
      '<br>• يكون فيه مستحق متأخر أو بكرة' +
      '<br>• تنسى تسجل مصاريف اليوم' +
      '<br>• تقرب من الميزانية' +
      '<br><br><b>ملاحظة:</b> الإشعارات بتشتغل بس لما التطبيق مفتوح (بدون سيرفر).' +
    '</div>' +
    '<div class="kv">' +
      '<span>الحالة</span>' +
      '<b style="color:' + statusColor + '">' + status + '</b>' +
    '</div>' +
    '<div class="btns-stack" style="margin-top:16px">' +
      (supported && permission !== 'denied'
        ? '<button type="button" class="btn" onclick="Daftary.toggleNotifs()">' +
            (notifEnabled ? '🔕 وقف الإشعارات' : '🔔 فعّل الإشعارات') +
          '</button>'
        : '') +
      (notifEnabled
        ? '<button type="button" class="btn soft" onclick="Daftary.testNotif()">' +
            '🔔 جرّب إشعار تجريبي' +
          '</button>'
        : '') +
      '<button type="button" class="btn ghost" onclick="Daftary.closeSheet()">قفل</button>' +
    '</div>'
  );
}

function toggleNotifs(){
  if (!notifEnabled){
    requestNotifPermission().then(function(ok){
      if (ok){
        closeSheet();
        render();
        setTimeout(function(){ checkNotifications(); }, 1000);
      }
    });
  } else {
    notifEnabled = false;
    saveNotifSetting();
    toast('الإشعارات اتوقفت');
    closeSheet();
    render();
  }
}

function testNotif(){
  if (!notifEnabled){
    toast('فعّل الإشعارات الأول');
    return;
  }
  sendNotification(
    '🔔 إشعار تجريبي',
    'لو شايف الرسالة دي، يبقى الإشعارات شغالة تمام!',
    'test'
  );
  toast('اتبعت الإشعار ✓');
}

/* ═══════════════════════════════════════════════════════════
   SEARCH BY VOICE — بحث بالصوت
   ═══════════════════════════════════════════════════════════ */
var speechRecognition = null;
var isListening = false;

function isVoiceSupported(){
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function startVoiceSearch(){
  if (!isVoiceSupported()){
    toast('البحث بالصوت مش مدعوم في المتصفح ده');
    return;
  }

  if (isListening){
    stopVoiceSearch();
    return;
  }

  try {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition = new SR();
    speechRecognition.lang = 'ar-EG';
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onstart = function(){
      isListening = true;
      updateVoiceButton();
    };

    speechRecognition.onresult = function(event){
      var transcript = '';
      if (event.results && event.results[0] && event.results[0][0]){
        transcript = event.results[0][0].transcript || '';
      }
      transcript = transcript.trim();

      if (transcript){
        searchQuery = transcript;
        searchFilter = 'all';
        toast('دوّرت على: ' + transcript);
        render();
      } else {
        toast('مسمعتش حاجة، جرّب تاني');
      }
    };

    speechRecognition.onerror = function(event){
      isListening = false;
      updateVoiceButton();
      if (event.error === 'no-speech'){
        toast('مسمعتش حاجة، جرّب تاني');
      } else if (event.error === 'not-allowed'){
        toast('الميكروفون مرفوض');
      } else if (event.error === 'network'){
        toast('محتاج إنترنت للبحث الصوتي');
      } else {
        toast('مقدرتش أسمع، جرّب تاني');
      }
    };

    speechRecognition.onend = function(){
      isListening = false;
      updateVoiceButton();
    };

    speechRecognition.start();
  } catch(e){
    toast('مقدرتش أفتح الميكروفون');
    isListening = false;
    updateVoiceButton();
  }
}

function stopVoiceSearch(){
  if (speechRecognition){
    try { speechRecognition.stop(); } catch(e){}
  }
  isListening = false;
  updateVoiceButton();
}

function updateVoiceButton(){
  var btn = $('voiceBtn');
  if (!btn) return;
  if (isListening){
    btn.classList.add('listening');
    btn.setAttribute('aria-label', 'جاري الاستماع...');
  } else {
    btn.classList.remove('listening');
    btn.setAttribute('aria-label', 'بحث بالصوت');
  }
}
/* ═══════════════════════════════════════════════════════════
   35. INSTALL
   ═══════════════════════════════════════════════════════════ */
function installApp(){
  if (deferredInstall){
    deferredInstall.prompt();
    deferredInstall.userChoice.then(function(){ deferredInstall = null; });
  } else {
    toast('من المتصفح: القائمة → إضافة إلى الشاشة الرئيسية');
  }
}

/* ═══════════════════════════════════════════════════════════
   36. CALENDAR NAV
   ═══════════════════════════════════════════════════════════ */
function calPrev(){
  ui.calMonth--;
  if (ui.calMonth < 0){ ui.calMonth = 11; ui.calYear--; }
  render();
}

function calNext(){
  ui.calMonth++;
  if (ui.calMonth > 11){ ui.calMonth = 0; ui.calYear++; }
  render();
}

function calToday(){
  var now = new Date();
  ui.calYear = now.getFullYear();
  ui.calMonth = now.getMonth();
  render();
}

/* ═══════════════════════════════════════════════════════════
   37. PUBLIC API
   ═══════════════════════════════════════════════════════════ */
var Daftary = {
  nav: nav,
  back: back,
  goScreen: goScreen,
  closeSheet: closeSheet,
  toggleTheme: toggleTheme,
  setTheme: applyTheme,
  toggleSound: function(){
  if (!window.SoundControl) return;
  var on = SoundControl.toggle();
  if (window.Sound) Sound.toggle(on);
  toast(on ? 'الأصوات اتفعّلت 🔊' : 'الأصوات اتوقفت 🔇');
  render();
  },

  openAddSheet: openAddSheet,
  openExistingAccounts: openExistingAccounts,
  openNewAccount: openNewAccount,
  startKind: startKind,
  fillName: fillName,
  saveAcc: saveAcc,
  openEditAcc: openEditAcc,
  saveEditAcc: saveEditAcc,
  openDelAcc: openDelAcc,
  doDelAcc: doDelAcc,

  openAdd: openAdd,
  saveAdd: saveAdd,
  togCnt: togCnt,
  smartInput: smartInput,
  openGive: openGive,
  saveGive: saveGive,
  openSpend: openSpend,
  saveSpend: saveSpend,
  togRec: togRec,
  openEntry: openEntry,
  openEntryPublic: openEntryPublic,
  editEntry: editEntry,
  askDel: askDel,
  doDel: doDel,
  openBreak: openBreak,

  openStatement: openStatement,
  sendWA: sendWA,
  copyStmt: copyStmt,
  openSettle: openSettle,
  doSettle: doSettle,

  openDueForm: openDueForm,
  setDue: setDue,
  pickRep: pickRep,
  saveDue: saveDue,
  openDue: openDue,
  askDelDue: askDelDue,
  openPay: openPay,
  togPayMine: togPayMine,
  doPay: doPay,

  openBudget: openBudget,
  saveBudget: saveBudget,
  saveBudgetInline: saveBudgetInline,

  openMoreSub: openMoreSub,

  setPin: setPin,
  removePin: removePin,
  lockNow: lockNow,
  tryUnlock: tryUnlock,

  openBackup: openBackup,
  exportData: exportData,
  exportCSV: exportCSV,
  importData: importData,

  installApp: installApp,
  undoLastAction: undoLastAction,
  searchInput: searchInput,
  setFilter: setFilter,

  calPrev: calPrev,
  calNext: calNext,
  calToday: calToday,
  openDay: openDay,

  shareEntry: shareEntry,
  shareWA: shareWA,
  shareCopy: shareCopy,
  buildEntryText: buildEntryText,
  shareStatementAsImage: shareStatementAsImage,
  shareEntryAsImage: shareEntryAsImage,

  openNotifications: openNotifications,
  toggleNotifs: toggleNotifs,
  testNotif: testNotif,

  startVoiceSearch: startVoiceSearch,
  stopVoiceSearch: stopVoiceSearch
};

window.Daftary = Daftary;

/* ═══════════════════════════════════════════════════════════
   38. BOOTSTRAP
   ═══════════════════════════════════════════════════════════ */
function bootstrap(){
  applyTheme(detectTheme());

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferredInstall = e;
  });

  if ('serviceWorker' in navigator &&
      (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')){
    navigator.serviceWorker.register('./sw.js').catch(function(){});
  }

  if (navigator.storage && navigator.storage.persist){
    navigator.storage.persist().catch(function(){});
  }

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){
      var sh = $('sh');
      if (sh && sh.classList.contains('open')) closeSheet();
    }
  });

  /* ─── شاشة أول استخدام ─── */
var FIRST_KEY = 'daftary_first_use_done';

function showWelcomeIfNeeded(){
  var isDone = false;
  try { isDone = localStorage.getItem(FIRST_KEY) === '1'; } catch(e){}
  if (isDone) return false;
  if (db.accounts.length) return false;

  var el = document.createElement('div');
  el.id = 'welcome-screen';
  el.innerHTML =
    '<div class="welcome-card">' +
      '<div class="welcome-icon">📒</div>' +
      '<h1 class="welcome-title">أهلاً بيك في دفتري</h1>' +
      '<p class="welcome-sub">تطبيق بسيط لإدارة حساباتك</p>' +
      '<div class="welcome-features">' +
        '<div class="wf-item"><span>👛</span><b>حسابات منفصلة</b></div>' +
        '<div class="wf-item"><span>📅</span><b>تقويم ذكي</b></div>' +
        '<div class="wf-item"><span>🔒</span><b>آمن ومحلي</b></div>' +
      '</div>' +
      '<button type="button" class="btn" id="welcome-btn" style="margin-top:24px">يلا نبدأ</button>' +
      '<p class="welcome-hint">💡 كل بياناتك على جهازك فقط</p>' +
    '</div>';
  document.body.appendChild(el);

  setTimeout(function(){
    el.classList.add('show');
  }, 100);

  el.querySelector('#welcome-btn').addEventListener('click', function(){
    el.classList.remove('show');
    try { localStorage.setItem(FIRST_KEY, '1'); } catch(e){}
    setTimeout(function(){
      if (el.parentNode) el.parentNode.removeChild(el);
      /* افتح شيت إنشاء حساب تلقائيًا */
      openNewAccount();
    }, 350);
  });

  return true;
}

  render();
  checkLock();

  var app = $('app');
  if (app) app.removeAttribute('hidden');

   setTimeout(function(){
    showWelcomeIfNeeded();
  }, 600);

  loadNotifSetting();
  setTimeout(function(){
    checkNotifications();
  }, 3000);

  /* فحص كل 30 دقيقة */
  setInterval(function(){
    checkNotifications();
  }, 30 * 60 * 1000);

  var boot = $('boot');
  if (boot){
    setTimeout(function(){
      boot.classList.add('hide');
      setTimeout(function(){ if (boot.parentNode) boot.parentNode.removeChild(boot); }, 450);
    }, 300);
  }
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

})();
