import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appJs = readFileSync(new URL('../site/static/app.js', import.meta.url), 'utf8');
const swJs = readFileSync(new URL('../site/static/sw.js', import.meta.url), 'utf8');

test('App has in-app service worker update notice wiring', () => {
  assert.equal(/serviceWorker\.register\('\/sw\.js'\)/.test(appJs), true);
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
