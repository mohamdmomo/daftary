/* ============================================================
   دفتري v5.0 — Service Worker
   Offline-first · Cache-first for app shell
   ============================================================ */

var CACHE_NAME    = 'daftary-v5-shell';
var RUNTIME_CACHE = 'daftary-v5-runtime';
var VERSION       = '5.0.0';

var PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

/* ---------- INSTALL ---------- */
self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache){
        return cache.addAll(PRECACHE).catch(function(err){
          console.warn('[SW] Precache partial:', err);
        });
      })
      .then(function(){
        return self.skipWaiting();
      })
  );
});

/* ---------- ACTIVATE ---------- */
self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys()
      .then(function(keys){
        return Promise.all(
          keys.map(function(key){
            if (key !== CACHE_NAME && key !== RUNTIME_CACHE){
              return caches.delete(key);
            }
          })
        );
      })
      .then(function(){
        return self.clients.claim();
      })
  );
});

/* ---------- FETCH ---------- */
self.addEventListener('fetch', function(event){
  var req = event.request;

  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  /* SPA navigation → index.html fallback */
  if (req.mode === 'navigate'){
    event.respondWith(
      caches.match('./index.html').then(function(cached){
        return cached || fetch(req).catch(function(){
          return caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* Pre-cached → cache-first */
  if (isPrecache(req.url)){
    event.respondWith(
      caches.match(req).then(function(cached){
        if (cached) return cached;
        return fetch(req).then(function(res){
          if (res && res.status === 200 && res.type === 'basic'){
            var copy = res.clone();
            caches.open(CACHE_NAME).then(function(c){ c.put(req, copy); });
          }
          return res;
        });
      })
    );
    return;
  }

  /* Other → network-first with cache fallback */
  event.respondWith(
    fetch(req).then(function(res){
      if (res && res.status === 200 && res.type === 'basic'){
        var copy = res.clone();
        caches.open(RUNTIME_CACHE).then(function(c){ c.put(req, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(req).then(function(cached){
        if (cached) return cached;
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});

function isPrecache(url){
  for (var i = 0; i < PRECACHE.length; i++){
    if (url.indexOf(PRECACHE[i].replace('./', '')) >= 0) return true;
  }
  return false;
}

/* ---------- MESSAGE ---------- */
self.addEventListener('message', function(event){
  if (event.data === 'SKIP_WAITING'){
    self.skipWaiting();
  }
  if (event.data === 'VERSION'){
    event.ports[0].postMessage(VERSION);
  }
});
