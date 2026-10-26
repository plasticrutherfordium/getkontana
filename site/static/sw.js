// SPDX-License-Identifier: MPL-2.0
const CACHE_NAME = 'kontana-v22';
const CORE_ASSETS = [
  '/app/',
  '/app',
  '/es/app/',
  '/es/',
  '/open-source/',
  '/es/open-source/',
  '/licenses/MPL-2.0.txt',
  '/licenses/THIRD_PARTY_NOTICES.txt',
  '/licenses/Apache-2.0.txt',
  '/licenses/MIT-legacy.txt',
  '/licenses/pdf-lib-MIT.txt',
  '/licenses/pdf-lib-standard-fonts-MIT.txt',
  '/licenses/upng-MIT.txt',
  '/licenses/pako-MIT.txt',
  '/licenses/terminal-MIT.txt',
  '/fonts/Inter-OFL.txt',
  '/fonts/Space-Grotesk-OFL.txt',
  '/fonts/IBM-Plex-Mono-OFL.txt',
  '/app-phosphor.css',
  '/landing.css',
  '/site.js',
  '/app/accessibility.js',
  '/fonts/fonts.css',
  '/fonts/ibm-plex-mono-400.ttf',
  '/fonts/ibm-plex-mono-500.ttf',
  '/fonts/ibm-plex-mono-600.ttf',
  '/fonts/inter-400.ttf',
  '/fonts/inter-500.ttf',
  '/fonts/inter-600.ttf',
  '/fonts/inter-700.ttf',
  '/fonts/space-grotesk-400.ttf',
  '/fonts/space-grotesk-500.ttf',
  '/fonts/space-grotesk-600.ttf',
  '/fonts/space-grotesk-700.ttf',
  '/',
  '/favicon-kontana3.png',
  '/kontana-logo3.svg',
  '/app.css',
  '/app.js',
  '/app/state.js',
  '/app/migrate.js',
  '/app/money.js',
  '/app/import_export.js',
  '/app/budget_onboarding.js',
  '/app/budget/checkins.js',
  '/app/budget/insights.js',
  '/app/ledger/tx.js',
  '/app/ui/pay.js',
  '/lib/strategies.js',
  '/lib/pdf-lib.min.js',
  '/kt-terminal.css',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const reqUrl = new URL(event.request.url);
  if (reqUrl.origin !== self.location.origin) return;
  if (reqUrl.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
