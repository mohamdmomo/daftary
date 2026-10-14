(function(){
'use strict';

var SOUND_KEY = 'daftary_sound_enabled';
var VOLUME_KEY = 'daftary_sound_volume';
var enabled = true;
var volume = 0.15;
var audioCtx = null;

/* ─── تحميل الإعدادات ─── */
function loadSettings(){
  try {
    var e = localStorage.getItem(SOUND_KEY);
    enabled = e !== '0';
    var v = parseFloat(localStorage.getItem(VOLUME_KEY));
    if (isFinite(v) && v >= 0 && v <= 1) volume = v;
  } catch(err){}
}

function saveSettings(){
  try {
    localStorage.setItem(SOUND_KEY, enabled ? '1' : '0');
    localStorage.setItem(VOLUME_KEY, String(volume));
  } catch(err){}
}

/* ─── AudioContext (lazy) ─── */
function getCtx(){
  if (!audioCtx){
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended'){
    audioCtx.resume().catch(function(){});
  }
  return audioCtx;
}

/* ─── دالة أساسية لتشغيل صوت ─── */
function play(freqStart, freqEnd, duration, type, vol){
  if (!enabled) return;
  var ctx = getCtx();
  if (!ctx) return;

  try {
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd && freqEnd !== freqStart){
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);
    }

    var v = (vol || 1) * volume;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(v, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch(err){}
}

/* ─── الأصوات ─── */
var Sound = {
  /* نقرة خفيفة على زر */
  tap: function(){
    play(1800, 1200, 0.05, 'sine', 0.4);
  },

  /* تبويب جديد */
  tab: function(){
    play(900, 1300, 0.07, 'sine', 0.5);
  },

  /* فتح شيت */
  sheetOpen: function(){
    play(400, 900, 0.18, 'sine', 0.35);
  },

  /* قفل شيت */
  sheetClose: function(){
    play(900, 400, 0.16, 'sine', 0.3);
  },

  /* حفظ نجح */
  success: function(){
    play(660, 990, 0.14, 'sine', 0.5);
    setTimeout(function(){ play(990, 1320, 0.14, 'sine', 0.4); }, 90);
  },

  /* حذف */
  delete: function(){
    play(400, 200, 0.14, 'triangle', 0.4);
  },

  /* حساب جديد */
  celebrate: function(){
    play(523, 659, 0.12, 'sine', 0.5);
    setTimeout(function(){ play(659, 784, 0.12, 'sine', 0.5); }, 100);
    setTimeout(function(){ play(784, 1047, 0.18, 'sine', 0.5); }, 200);
  },

  /* تحذير (ميزانية 80%) */
  warn: function(){
    play(880, 880, 0.15, 'triangle', 0.5);
    setTimeout(function(){ play(880, 880, 0.15, 'triangle', 0.5); }, 180);
  },

  /* خطأ */
  error: function(){
    play(220, 160, 0.2, 'triangle', 0.5);
  },

  /* رسالة toast */
  toast: function(){
    play(1400, 1400, 0.04, 'sine', 0.3);
  },

  /* تفعيل/إيقاف */
  toggle: function(on){
    if (on) play(600, 1200, 0.12, 'sine', 0.5);
    else play(1200, 600, 0.12, 'sine', 0.5);
  }
};

/* ─── API عام ─── */
window.Sound = Sound;
window.SoundControl = {
  isEnabled: function(){ return enabled; },
  getVolume: function(){ return volume; },
  setEnabled: function(v){
    enabled = !!v;
    saveSettings();
  },
  toggle: function(){
    enabled = !enabled;
    saveSettings();
    return enabled;
  },
  setVolume: function(v){
    volume = Math.max(0, Math.min(1, Number(v) || 0));
    saveSettings();
  }
};

/* ─── تحميل الإعدادات + أول تفاعل ─── */
loadSettings();

document.addEventListener('touchstart', function unlock(){
  getCtx();
  document.removeEventListener('touchstart', unlock);
}, { once:true, passive:true });

document.addEventListener('click', function unlock2(){
  getCtx();
  document.removeEventListener('click', unlock2);
}, { once:true });

})();
