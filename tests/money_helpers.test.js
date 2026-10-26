// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function loadMoneyHelpers() {
  const src = readFileSync(new URL('../site/static/app/money.js', import.meta.url), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.KontanaMoney;
}

const money = loadMoneyHelpers();

test('toMinor parses major inputs into integer minor units', () => {
  assert.equal(money.toMinor('12.34'), 1234);
  assert.equal(money.toMinor('1,234.50'), 123450);
  assert.equal(money.toMinor(12.34), 1234);
  assert.equal(money.toMinor('1200', { currency: 'JPY' }), 1200);
});

test('toMinor rejects invalid numeric inputs', () => {
  assert.throws(() => money.toMinor(Number.NaN));
  assert.throws(() => money.toMinor('abc'));
  assert.throws(() => money.toMinor('12.345'));
  assert.throws(() => money.toMinor('12.5', { currency: 'JPY' }));
});

test('editable amounts preserve a trailing separator and fractional zeros', () => {
  for (const [locale, separator] of [['en-US', '.'], ['es-ES', ',']]) {
    for (const typedSeparator of ['.', ',']) {
      let display = '';
      const states = ['€2', '€24', `€24${separator}`, `€24${separator}5`, `€24${separator}50`];
      [...`24${typedSeparator}50`].forEach((key, i) => {
        display = money.formatInput(display + key, { currency: 'EUR', locale, symbol: '€' });
        assert.equal(display, states[i]);
      });
      assert.equal(money.toMinor(display, { currency: 'EUR' }), 2450);
    }
  }
  assert.equal(money.formatInput('.', { currency: 'EUR', locale: 'en-US' }), '0.');
  assert.equal(money.formatInput('0.01', { currency: 'EUR', locale: 'en-US' }), '0.01');
  assert.equal(money.formatInput('1,234.50', { currency: 'EUR', locale: 'es-ES' }), '1234,50');
});

test('editable amounts reject unsupported precision instead of changing the amount', () => {
  assert.throws(() => money.formatInput('24.501', { currency: 'EUR' }));
  assert.throws(() => money.formatInput('24.5.', { currency: 'EUR' }));
  assert.throws(() => money.formatInput('24,50.', { currency: 'EUR' }));
  for (const currency of ['JPY', 'CLP', 'KRW', 'XOF']) {
    assert.equal(money.formatInput('1200', { currency }), '1200');
    assert.throws(() => money.formatInput('1200.', { currency }));
    assert.throws(() => money.formatInput('1200.5', { currency }));
  }
});

test('fromMinor formats with cents preference and zero-decimal currencies', () => {
  assert.equal(money.fromMinor(1200, { currency: 'USD', symbol: '$', showCents: false, locale: 'en-US' }), '$12');
  assert.equal(money.fromMinor(1200, { currency: 'USD', symbol: '$', showCents: true, locale: 'en-US' }), '$12.00');
  assert.equal(money.fromMinor(1234, { currency: 'USD', symbol: '$', showCents: false, locale: 'en-US' }), '$12.34');
  assert.equal(money.fromMinor(1200, { currency: 'JPY', symbol: '¥', showCents: true, locale: 'en-US' }), '¥1,200');
});

test('sumDenomsToMinor supports denomination arrays and maps', () => {
  const arrayTotal = money.sumDenomsToMinor([
    { value_minor: 1000, count: 1 },
    { value_minor: 25, count: 3 },
    { value_minor: 10, count: 4 },
    { value_minor: 1, count: 5 },
  ], 'USD');
  assert.equal(arrayTotal, 1120);

  const mapTotal = money.sumDenomsToMinor({
    '10.00': 1,
    '0.25': 3,
    '0.10': 4,
    '0.01': 5,
  }, 'USD');
  assert.equal(mapTotal, 1120);

  const zeroDecimalTotal = money.sumDenomsToMinor({
    '1000': 2,
    '500': 1,
  }, 'CLP');
  assert.equal(zeroDecimalTotal, 2500);
});

test('sumDenomsToMinor handles mixed cents map keys exactly', () => {
  const centsMapTotal = money.sumDenomsToMinor({
    '5.00': 2,
    '0.10': 3,
    '0.01': 4,
  }, 'USD');
  assert.equal(centsMapTotal, 1034);
});
