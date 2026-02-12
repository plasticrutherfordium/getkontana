import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appJs = readFileSync(new URL('../site/static/app.js', import.meta.url), 'utf8');
const payUiJs = readFileSync(new URL('../site/static/app/ui/pay.js', import.meta.url), 'utf8');
const headPartial = readFileSync(new URL('../site/layouts/partials/extended_head.html', import.meta.url), 'utf8');
const footerPartial = readFileSync(new URL('../site/layouts/partials/extended_footer.html', import.meta.url), 'utf8');
const swJs = readFileSync(new URL('../site/static/sw.js', import.meta.url), 'utf8');
const appSurfaceJs = `${appJs}\n${payUiJs}`;

test('Retention purge logic is not present', () => {
  assert.equal(/RETENTION_DAYS/.test(appJs), false);
  assert.equal(/function\s+purgeRetention\s*\(/.test(appJs), false);
});

test('App registers service worker and manifest wiring is present', () => {
  assert.equal(/serviceWorker\.register\('\/sw\.js'\)/.test(appJs), true);
  assert.equal(/controllerchange/.test(appJs), true);
  assert.equal(/updatefound/.test(appJs), true);
  assert.equal(/registration\.waiting/.test(appJs), true);
  assert.equal(/sw\.update_available/.test(appJs), true);
  assert.equal(/postMessage\(\{ type: 'SKIP_WAITING' \}\)/.test(appJs), true);
  assert.equal(/manifest\.webmanifest/.test(headPartial), true);
});

test('PDF export uses pdf-lib and binary download path', () => {
  assert.equal(/window\.PDFLib/.test(appJs), true);
  assert.equal(/downloadBinaryFile\(/.test(appJs), true);
  assert.equal(/application\/pdf/.test(appJs), true);
  assert.equal(/lib\/pdf-lib\.min\.js/.test(footerPartial), true);
  assert.equal(/app\/money\.js/.test(footerPartial), true);
  assert.equal(/app\/import_export\.js/.test(footerPartial), true);
  assert.equal(/app\/budget_onboarding\.js/.test(footerPartial), true);
  assert.equal(/app\/budget\/checkins\.js/.test(footerPartial), true);
  assert.equal(/app\/budget\/insights\.js/.test(footerPartial), true);
  assert.equal(/app\/ledger\/tx\.js/.test(footerPartial), true);
  assert.equal(/app\/ui\/pay\.js/.test(footerPartial), true);
});

test('Service worker caches app money helper script', () => {
  assert.equal(/\/app\/money\.js/.test(swJs), true);
  assert.equal(/\/app\/import_export\.js/.test(swJs), true);
  assert.equal(/\/app\/budget_onboarding\.js/.test(swJs), true);
  assert.equal(/\/app\/budget\/checkins\.js/.test(swJs), true);
  assert.equal(/\/app\/budget\/insights\.js/.test(swJs), true);
  assert.equal(/\/app\/ledger\/tx\.js/.test(swJs), true);
  assert.equal(/\/app\/ui\/pay\.js/.test(swJs), true);
  assert.equal(/\/lib\/strategies\.js/.test(swJs), true);
  assert.equal(/SKIP_WAITING/.test(swJs), true);
  const installMatch = swJs.match(/self\.addEventListener\('install'[\s\S]*?\n\}\);/);
  assert.equal(Boolean(installMatch), true);
  assert.equal(/skipWaiting\(\)/.test(installMatch ? installMatch[0] : ''), false);
  assert.equal(/self\.addEventListener\('message'[\s\S]*?skipWaiting\(\)/.test(swJs), true);
});

test('Category support is wired in pay flow and transaction details', () => {
  assert.equal(/id="payment-category"/.test(appSurfaceJs), true);
  assert.equal(/tx\.detail\.category/.test(appSurfaceJs), true);
});

test('Quick reconcile wiring is present for Budget mode flows', () => {
  assert.equal(/budget-quick-reconcile/.test(appJs), true);
  assert.equal(/startQuickReconcileFlow/.test(appJs), true);
  assert.equal(/wallet\.count_mode = artifacts\.next_count_mode/.test(appJs), true);
  assert.equal(/cash\.denoms_not_counted/.test(appJs), true);
});

test('Budget pay actions wire transfer and loss/adjustment flows', () => {
  assert.equal(/budget-pay-quick-spend/.test(appSurfaceJs), true);
  assert.equal(/budget-pay-transfer/.test(appSurfaceJs), true);
  assert.equal(/budget-pay-adjustment/.test(appSurfaceJs), true);
  assert.equal(/startBudgetQuickSpendFlow/.test(appSurfaceJs), true);
  assert.equal(/buildQuickSpendTx/.test(appSurfaceJs), true);
  assert.equal(/wallet\.count_mode = 'total'/.test(appSurfaceJs), true);
  assert.equal(/startBudgetTransferFlow/.test(appSurfaceJs), true);
  assert.equal(/startBudgetAdjustmentFlow/.test(appSurfaceJs), true);
});

test('Budget transactions dashboard wiring is present', () => {
  assert.equal(/tx-view-full-ledger/.test(appJs), true);
  assert.equal(/tx-view-summary/.test(appJs), true);
  assert.equal(/summarizeWalletPeriod/.test(appJs), true);
  assert.equal(/budget\.tx\.this_period/.test(appJs), true);
});

test('Budget drift alert wiring is present on cash cards', () => {
  assert.equal(/computeDriftAlert/.test(appJs), true);
  assert.equal(/budget-drift-alert-checkin/.test(appJs), true);
  assert.equal(/budget-drift-alert-tracking/.test(appJs), true);
  assert.equal(/budget-drift-alert-targets/.test(appJs), true);
  assert.equal(/budget-drift-alert-snooze/.test(appJs), true);
});

test('No runtime console logging of sensitive app flow', () => {
  assert.equal(/console\.log\(/.test(appJs), false);
  assert.equal(/console\.error\(/.test(appJs), false);
});
