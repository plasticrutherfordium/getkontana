// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { computeIncomingPlan } from '../src/lib/strategies.js';

const source = readFileSync(new URL('../site/static/app.js', import.meta.url), 'utf8');
const body = source.match(/function computeChangeBreakdown\(denoms, changeMinor\) \{[\s\S]*?\n\}/)[0];
const change = vm.runInNewContext(`(${body})`, { computeIncomingPlan, ORDER_LARGEST_FIRST: 'largest_first' });
const plain = (value) => JSON.parse(JSON.stringify(value));

test('Actual app change helper finds exact change after a greedy dead end', () => {
  assert.deepEqual(plain(change([{ value_minor: 4, count: 0 }, { value_minor: 3, count: 0 }], 6)), [{ value_minor: 3, count: 2 }]);
});

test('Change comes from the merchant, so the wallet stock never limits the suggestion', () => {
  const denoms = [{ value_minor: 200, count: 0 }, { value_minor: 100, count: 0 }, { value_minor: 50, count: 0 }];
  const before = JSON.stringify(denoms);
  assert.deepEqual(plain(change(denoms, 750)), [{ value_minor: 200, count: 3 }, { value_minor: 100, count: 1 }, { value_minor: 50, count: 1 }]);
  assert.equal(JSON.stringify(denoms), before);
  assert.deepEqual(plain(change(denoms, 0)), []);
  assert.deepEqual(plain(change(denoms, 1)), []);
});
