import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ORDER_LARGEST_FIRST,
  computeOutgoingPlan,
  computeIncomingPlan,
} from '../src/lib/strategies.js';
import { getCurrencyDenominations } from '../src/lib/currency.js';

function mapBreakdown(breakdown) {
  const map = new Map();
  breakdown.forEach((row) => {
    map.set(row.value_minor, row.count);
  });
  return map;
}

function makeDenoms(values, counts) {
  return values.map((value, idx) => ({ value_minor: value, count: counts[idx] }));
}

function makeTypedDenoms(values, counts, types) {
  return values.map((value, idx) => ({ value_minor: value, count: counts[idx], type: types[idx] }));
}

test('Greedy uses largest denominations first', () => {
  const denoms = makeDenoms([10, 5, 1], [1, 2, 10]);
  const greedy = computeOutgoingPlan(denoms, 16, 'greedy', ORDER_LARGEST_FIRST, false);
  assert.equal(greedy.status, 'exact');
  assert.deepEqual(mapBreakdown(greedy.breakdown), new Map([[10, 1], [5, 1], [1, 1]]));
});

test('Lex prefers higher denominations when item count ties', () => {
  const denoms = makeDenoms([4, 3, 2], [1, 2, 1]);
  const target = 6;
  const lex = computeOutgoingPlan(denoms, target, 'lex', ORDER_LARGEST_FIRST, false);
  assert.equal(lex.status, 'exact');
  assert.deepEqual(mapBreakdown(lex.breakdown), new Map([[4, 1], [2, 1]]));
});

test('Equalisation chooses the most balanced remaining counts', () => {
  const denoms = makeDenoms([10, 5, 2, 1], [2, 4, 4, 4]);
  const target = 8;
  const plan = computeOutgoingPlan(denoms, target, 'equalisation', ORDER_LARGEST_FIRST, true);

  assert.equal(plan.status, 'exact');
  assert.deepEqual(mapBreakdown(plan.breakdown), new Map([[5, 1], [2, 1], [1, 1]]));
});

test('Outgoing status: exact vs insufficient', () => {
  const exact = computeOutgoingPlan(makeDenoms([5, 2, 1], [1, 1, 2]), 8, 'lex', ORDER_LARGEST_FIRST, true);
  assert.equal(exact.status, 'exact');

  const insufficient = computeOutgoingPlan(makeDenoms([5, 2], [1, 1]), 10, 'lex', ORDER_LARGEST_FIRST, true);
  assert.equal(insufficient.status, 'insufficient');
});

test('Incoming allocation uses strategy for exact plan', () => {
  const denoms = makeDenoms([5, 2, 1], [0, 0, 0]);
  const incoming = computeIncomingPlan(denoms, 8, 'lex', ORDER_LARGEST_FIRST);
  assert.equal(incoming.ok, true);
  assert.deepEqual(mapBreakdown(incoming.breakdown), new Map([[5, 1], [2, 1], [1, 1]]));
});

test('Avoid coins prefers notes when exact is possible without coins', () => {
  const denoms = makeTypedDenoms([10, 5, 1], [1, 1, 5], ['note', 'note', 'coin']);
  const plan = computeOutgoingPlan(denoms, 15, 'lex', ORDER_LARGEST_FIRST, true, 'prefer');
  assert.equal(plan.status, 'exact');
  assert.deepEqual(mapBreakdown(plan.breakdown), new Map([[10, 1], [5, 1]]));
});

test('Avoid coins allows coins when notes cannot pay exactly', () => {
  const denoms = makeTypedDenoms([10, 2], [1, 4], ['note', 'coin']);
  const plan = computeOutgoingPlan(denoms, 12, 'lex', ORDER_LARGEST_FIRST, true, 'prefer');
  assert.equal(plan.status, 'exact');
  assert.deepEqual(mapBreakdown(plan.breakdown), new Map([[10, 1], [2, 1]]));
});

test('Avoid coins overpay minimizes coin usage before overpay', () => {
  const denoms = makeTypedDenoms([10, 4], [1, 2], ['note', 'coin']);
  const plan = computeOutgoingPlan(denoms, 6, 'lex', ORDER_LARGEST_FIRST, true, 'prefer');
  assert.equal(plan.status, 'sufficient_not_exact');
  assert.deepEqual(mapBreakdown(plan.breakdown), new Map([[10, 1]]));
});

test('Avoid coins entirely refuses coin usage', () => {
  const denoms = makeTypedDenoms([10, 2], [1, 5], ['note', 'coin']);
  const plan = computeOutgoingPlan(denoms, 12, 'lex', ORDER_LARGEST_FIRST, true, 'avoid');
  assert.equal(plan.status, 'insufficient');
});

test('CLP denomination catalogue maxes at 20,000', () => {
  const clp = getCurrencyDenominations('CLP');
  const values = clp.map((d) => d.value_minor);
  assert.ok(values.includes(20000));
  assert.ok(!values.includes(50000));
  assert.ok(!values.includes(100000));
});
