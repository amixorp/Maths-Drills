/* ============================================================
   sw.js — offline support (service worker)
   ------------------------------------------------------------
   Lets the site work on patchy school wi-fi and when added to an
   iPad's Home Screen.

   - On install it saves every page linked from index.html and
     worksheets.html, plus the shared files they need.
   - Pages, core/ and banks.js: NETWORK FIRST. The newest version
     is used whenever the network answers within a few seconds, and
     the saved copy otherwise. So an updated drill reaches students
     without anyone changing a version number here.
   - katex/, vendor/, icons/: CACHE FIRST (they never change).

   Nothing needs editing when a drill is added: it is picked up
   from the links in index.html.
   ============================================================ */
'use strict';

const CACHE = 'maths-drills';
const NETWORK_TIMEOUT_MS = 3500;
const LIST_PAGES = ['index.html', 'worksheets.html'];
const SHARED = [
  './', 'index.html', 'worksheets.html',
  'core/drill.js', 'core/drill.css', 'banks.js',
  'katex/katex.min.js', 'katex/katex.min.css',
  'manifest.webmanifest', 'apple-touch-icon.png',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png', 'icons/favicon-32.png'
];
const KATEX_FONTS = [
  'AMS-Regular', 'Caligraphic-Bold', 'Caligraphic-Regular', 'Fraktur-Bold', 'Fraktur-Regular',
  'Main-Bold', 'Main-BoldItalic', 'Main-Italic', 'Main-Regular', 'Math-BoldItalic', 'Math-Italic',
  'SansSerif-Bold', 'SansSerif-Italic', 'SansSerif-Regular', 'Script-Regular',
  'Size1-Regular', 'Size2-Regular', 'Size3-Regular', 'Size4-Regular', 'Typewriter-Regular'
].map(f => 'katex/fonts/KaTeX_' + f + '.woff2');
const CACHE_FIRST = /\/(katex|vendor|icons)\//;

/* Every .html page linked from the list pages (relative links only). */
async function linkedPages() {
  const pages = new Set();
  for (const list of LIST_PAGES) {
    try {
      const res = await fetch(list, { cache: 'no-cache' });
      const html = await res.text();
      const base = new URL(list, self.registration.scope);
      for (const m of html.matchAll(/href="([^"#?:]+\.html)"/g)) {
        pages.add(new URL(m[1], base).href);
      }
    } catch (e) { /* offline during install: the shared files are enough */ }
  }
  return [...pages];
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const urls = [...SHARED, ...KATEX_FONTS, ...(await linkedPages())];
    // Add one by one so a single missing file doesn't stop the rest.
    await Promise.all(urls.map(u => cache.add(new Request(u, { cache: 'no-cache' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  // Save pages without their ?seed=… so each file is stored once.
  const url = new URL(request.url);
  const key = url.search ? url.origin + url.pathname : request;
  const fromNetwork = fetch(request).then(res => {
    if (res && res.ok) cache.put(key, res.clone());
    return res;
  });
  const timeout = new Promise(resolve => setTimeout(resolve, NETWORK_TIMEOUT_MS, null));
  try {
    const res = await Promise.race([fromNetwork, timeout]);
    if (res) return res;
  } catch (e) { /* offline: fall through to the saved copy */ }
  // Drill links carry ?seed=… — the saved page is the same file.
  const saved = await cache.match(request, { ignoreSearch: true });
  if (saved) return saved;
  return fromNetwork;          // nothing saved: wait for the network after all
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(request);
  if (saved) return saved;
  const res = await fetch(request);
  if (res && res.ok) cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!url.href.startsWith(self.registration.scope)) return;
  event.respondWith(CACHE_FIRST.test(url.pathname) ? cacheFirst(req) : networkFirst(req));
});
