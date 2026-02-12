import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appJs = readFileSync(new URL('../site/static/app.js', import.meta.url), 'utf8');
const headPartial = readFileSync(new URL('../site/layouts/partials/extended_head.html', import.meta.url), 'utf8');
const footerPartial = readFileSync(new URL('../site/layouts/partials/extended_footer.html', import.meta.url), 'utf8');

test('Retention purge logic is not present', () => {
  assert.equal(/RETENTION_DAYS/.test(appJs), false);
  assert.equal(/function\s+purgeRetention\s*\(/.test(appJs), false);
});

test('App registers service worker and manifest wiring is present', () => {
  assert.equal(/serviceWorker\.register\('\/sw\.js'\)/.test(appJs), true);
  assert.equal(/manifest\.webmanifest/.test(headPartial), true);
});

test('PDF export uses pdf-lib and binary download path', () => {
  assert.equal(/window\.PDFLib/.test(appJs), true);
  assert.equal(/downloadBinaryFile\(/.test(appJs), true);
  assert.equal(/application\/pdf/.test(appJs), true);
  assert.equal(/lib\/pdf-lib\.min\.js/.test(footerPartial), true);
});

test('Category support is wired in pay flow and transaction details', () => {
  assert.equal(/id="payment-category"/.test(appJs), true);
  assert.equal(/tx\.detail\.category/.test(appJs), true);
});

test('No runtime console logging of sensitive app flow', () => {
  assert.equal(/console\.log\(/.test(appJs), false);
  assert.equal(/console\.error\(/.test(appJs), false);
});
