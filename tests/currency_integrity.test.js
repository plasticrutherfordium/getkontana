import test from 'node:test';
import assert from 'node:assert/strict';
import { getCurrencyDenominations } from '../src/lib/currency.js';

const MVP_CURRENCIES = [
  'EUR', 'USD', 'GBP', 'CLP',
  'SEK', 'CHF', 'HUF', 'DKK', 'NOK', 'PLN', 'CAD',
  'ARS', 'PEN', 'BRL', 'MXN',
  'CZK', 'RON', 'CNY', 'JPY', 'INR', 'SGD', 'KRW',
  'EGP', 'ZAR', 'NGN', 'XOF', 'AUD', 'NZD',
];

test('MVP currency denominations are unique, positive, and descending', () => {
  MVP_CURRENCIES.forEach((currency) => {
    const denoms = getCurrencyDenominations(currency);
    assert.ok(denoms.length > 0, `${currency} should have at least one denomination`);

    const values = denoms.map((d) => d.value_minor);
    values.forEach((value) => {
      assert.ok(Number.isFinite(value) && value > 0, `${currency} has invalid denomination ${value}`);
    });

    const uniqueCount = new Set(values).size;
    assert.equal(uniqueCount, values.length, `${currency} should not contain duplicate denomination values`);

    for (let i = 1; i < values.length; i += 1) {
      assert.ok(values[i - 1] > values[i], `${currency} should be strictly descending`);
    }
  });
});
