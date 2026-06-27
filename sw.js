// ============================================================
// StackUp Nest — Service Worker  (sw.js)
// Strategy: cache-first for the app shell (HTML, fonts, icons),
// network-only for all google.script.run RPC calls (they go
// through Apps Script's own fetch layer, not through the SW).
//
// Bump CACHE_VERSION whenever you deploy a new Index.html so
// old cached shells are evicted on the next visit.
// ============================================================

var CACHE_VERSION = 'sn-shell-v1';

// Resources that make up the app shell — cached on install.
// The GAS deployment URL for Index.html is the start_url, so
// it's listed here as '/' (relative). Fonts are cross-origin
// so they're fetched and cached at install time rather than
// intercepted on the fly.
var SHELL_URLS = [
  '/',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'icons/favicon-16.png',
  // Google Fonts — pre-cache so the portal looks right offline
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0'
];

// ── Install: pre-cache shell ───────────────────────────────
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      // addAll fails if any resource 404s, so we cache
      // each one individually so a missing icon doesn't
      // block the whole install.
      return Promise.allSettled(
        SHELL_URLS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('[SW] Failed to cache:', url, err);
          });
        })
      );
    }).then(function() {
      // Take control immediately — don't wait for old SW to die.
      return self.skipWaiting();
    })
  );
});

// ── Activate: evict old caches ─────────────────────────────
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_VERSION; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── Fetch: cache-first for shell, network-only for RPC ─────
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Never intercept Apps Script RPC calls or POST requests —
  // these must always go to the network.
  if (event.request.method !== 'GET') return;
  if (url.indexOf('script.google.com') !== -1)  return;
  if (url.indexOf('script.googleusercontent.com') !== -1) return;
  if (url.indexOf('googleapis.com/') !== -1 && url.indexOf('fonts') === -1) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;

      // Not in cache — fetch from network and cache for next time.
      return fetch(event.request).then(function(response) {
        // Only cache valid, same-origin or CORS responses.
        if (!response || response.status !== 200 ||
            (response.type !== 'basic' && response.type !== 'cors')) {
          return response;
        }
        var toCache = response.clone();
        caches.open(CACHE_VERSION).then(function(cache) {
          cache.put(event.request, toCache);
        });
        return response;
      }).catch(function() {
        // Offline and not in cache — return a minimal offline notice
        // so the member at least knows what happened.
        return new Response(
          '<html><body style="font-family:sans-serif;text-align:center;padding:60px 20px;background:#0b0b16;color:#fff;">' +
          '<h2 style="color:#34c77b;">StackUp Nest</h2>' +
          '<p style="color:#8993a4;margin-top:12px;">You\'re offline. Open the app when you\'re connected to the internet.</p>' +
          '</body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      });
    })
  );
});
