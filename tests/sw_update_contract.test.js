// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const appJs = readFileSync(new URL('../site/static/app.js', import.meta.url), 'utf8');
const swJs = readFileSync(new URL('../site/static/sw.js', import.meta.url), 'utf8');

test('App has in-app service worker update notice wiring', () => {
  assert.equal(/serviceWorker\.register\('\/sw\.js', \{ updateViaCache: 'none' \}\)/.test(appJs), true);
  assert.equal(/updatefound/.test(appJs), true);
  assert.equal(/registration\.waiting/.test(appJs), true);
  assert.equal(/sw\.update_available/.test(appJs), true);
  assert.equal(/postMessage\(\{ type: 'SKIP_WAITING' \}\)/.test(appJs), true);
  assert.equal(/controllerchange/.test(appJs), true);
});

test('SW waits for explicit SKIP_WAITING and cleans old caches on activate', () => {
  const installMatch = swJs.match(/self\.addEventListener\('install'[\s\S]*?\n\}\);/);
  assert.equal(Boolean(installMatch), true);
  assert.equal(/skipWaiting\(\)/.test(installMatch ? installMatch[0] : ''), false);

  assert.equal(/self\.addEventListener\('message'[\s\S]*?SKIP_WAITING[\s\S]*?skipWaiting\(\)/.test(swJs), true);
  assert.equal(/keys\.filter\(\(key\) => key !== CACHE_NAME\)\.map\(\(key\) => caches\.delete\(key\)\)/.test(swJs), true);
});

test('SW precaches release-specific scripts/styles while bypassing stale HTTP entries', async () => {
  const handlers = {};
  let requests;
  class LocalRequest extends Request {
    constructor(path, options) { super(new URL(path, 'https://kontana.test'), options); }
  }
  vm.runInNewContext(swJs, {
    Request: LocalRequest,
    self: { addEventListener: (name, handler) => { handlers[name] = handler; } },
    caches: { open: async () => ({ addAll: async (items) => { requests = items; } }) },
  });
  let installation;
  handlers.install({ waitUntil: (promise) => { installation = promise; } });
  await installation;
  const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url))).version;
  for (const request of requests) {
    const url = new URL(request.url);
    assert.equal(request.cache, 'reload');
    if (/\.(js|css)$/.test(url.pathname)) assert.equal(url.searchParams.get('v'), version, url.pathname);
  }
  for (const path of ['/app.js', '/app/ui/pay.js', '/app/money.js', '/app-phosphor.css']) {
    assert.ok(requests.some((request) => new URL(request.url).pathname === path), path);
  }
});

test('Build info reports the running script version even if the HTML is newer', () => {
  const body = appJs.match(/function getBuildInfo\(\) \{([\s\S]*?)\n    \}/)[1];
  const result = vm.runInNewContext(`(function () { ${body} })()`, {
    APP_VERSION: 'old-runtime',
    getMetaContent: () => 'new-html',
  });
  assert.equal(result.version, 'old-runtime');
});
