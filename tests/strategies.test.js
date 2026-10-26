// SPDX-License-Identifier: MPL-2.0
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

test('Single cover suggests lowest overpay when exact is unavailable', () => {
  const denoms = makeDenoms([10, 4], [1, 2]);
  const plan = computeOutgoingPlan(denoms, 6, 'lex', ORDER_LARGEST_FIRST, true, 'off');
  assert.equal(plan.status, 'sufficient_not_exact');
  assert.equal(plan.paidMinor, 8);
  assert.equal(plan.overpay, 2);
  assert.deepEqual(mapBreakdown(plan.breakdown), new Map([[4, 2]]));
});

test('Single cover can be disabled to return insufficient for non-exact', () => {
  const denoms = makeDenoms([10, 4], [1, 2]);
  const plan = computeOutgoingPlan(denoms, 6, 'lex', ORDER_LARGEST_FIRST, false, 'off');
  assert.equal(plan.status, 'insufficient');
});

test('CLP denomination catalogue maxes at 20,000', () => {
  const clp = getCurrencyDenominations('CLP');
  const values = clp.map((d) => d.value_minor);
  assert.ok(values.includes(20000));
  assert.ok(!values.includes(50000));
  assert.ok(!values.includes(100000));
});

test('EUR 143 wallet covers EUR 12.50 with one EUR 20 note in every strategy and ordering', () => {
  const held = { 10000: 1, 2000: 2, 200: 1, 100: 1 };
  const denoms = getCurrencyDenominations('EUR').map((d) => ({ ...d, count: held[d.value_minor] || 0 }));
  const before = JSON.stringify(denoms);
  for (const strategy of ['greedy', 'lex', 'equalisation']) {
    for (const order of ['largest_first', 'smallest_first']) {
      for (const rule of ['off', 'avoid', 'prefer']) {
        const plan = computeOutgoingPlan(denoms, 1250, strategy, order, true, rule);
        assert.equal(plan.paidMinor, 2000);
        assert.equal(plan.overpay, 750);
        assert.deepEqual(plan.breakdown, [{ value_minor: 2000, count: 1 }]);
      }
    }
  }
  assert.equal(JSON.stringify(denoms), before, 'Suggestions must never mutate wallet counts');
});

test('Minimise finds an exact payment even when the initial greedy attempt gets stuck', () => {
  const denoms = makeDenoms([4, 3], [1, 2]);
  for (const cover of [false, true]) {
    const plan = computeOutgoingPlan(denoms, 6, 'greedy', ORDER_LARGEST_FIRST, cover);
    assert.equal(plan.status, 'exact');
    assert.deepEqual(plan.breakdown, [{ value_minor: 3, count: 2 }]);
  }
});

test('Calculation methods reject invalid amounts, counts, denominations and settings', () => {
  for (const strategy of ['greedy', 'lex', 'equalisation']) {
    for (const target of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      assert.equal(computeOutgoingPlan(makeDenoms([2, 1], [1, 1]), target, strategy).status, 'insufficient');
      assert.equal(computeIncomingPlan(makeDenoms([2, 1], [1, 1]), target, strategy).ok, false);
    }
    for (const denoms of [null, [], makeDenoms([0], [1]), makeDenoms([1], [-1]), makeDenoms([1], [1.5]), makeDenoms([1, 1], [1, 1])]) {
      assert.equal(computeOutgoingPlan(denoms, 1, strategy).status, 'insufficient');
      assert.equal(computeIncomingPlan(denoms, 1, strategy).ok, false);
    }
  }
  for (const [strategy, order, rule] of [['unknown', 'largest_first', 'off'], ['lex', 'unknown', 'off'], ['lex', 'largest_first', 'unknown']]) {
    assert.equal(computeOutgoingPlan(makeDenoms([1], [1]), 1, strategy, order, true, rule).status, 'insufficient');
    assert.equal(computeIncomingPlan(makeDenoms([1], [1]), 1, strategy, order, rule).ok, false);
  }
});

test('Large denomination values use a scaled exact search and stock-heavy wallets stay bounded', () => {
  for (const strategy of ['greedy', 'lex', 'equalisation']) {
    const incoming = computeIncomingPlan(makeDenoms([100000000, 30000000], [0, 0]), 260000000, strategy);
    assert.equal(incoming.ok, true);
    assert.deepEqual(incoming.breakdown, [{ value_minor: 100000000, count: 2 }, { value_minor: 30000000, count: 2 }]);
    const plan = computeOutgoingPlan(makeDenoms([5000, 1], [20, 1000000]), 13, strategy);
    assert.equal(plan.paidMinor, 13);
    assert.deepEqual(plan.breakdown, [{ value_minor: 1, count: 13 }]);
  }
});

test('Prefer notes follows denomination types after reversing the order', () => {
  const denoms = makeTypedDenoms([500, 200], [1, 1], ['note', 'coin']);
  for (const strategy of ['greedy', 'lex', 'equalisation']) {
    const plan = computeOutgoingPlan(denoms, 100, strategy, 'smallest_first', true, 'prefer');
    assert.deepEqual(plan.breakdown, [{ value_minor: 500, count: 1 }]);
  }
});

test('Balance differs from Preserve only after equally short payments tie', () => {
  const denoms = makeTypedDenoms([5000, 2000, 500], [1, 3, 2], ['note', 'note', 'note']);
  assert.deepEqual(computeOutgoingPlan(denoms, 6000, 'lex').breakdown, [{ value_minor: 5000, count: 1 }, { value_minor: 500, count: 2 }]);
  assert.deepEqual(computeOutgoingPlan(denoms, 6000, 'equalisation').breakdown, [{ value_minor: 2000, count: 3 }]);
  assert.deepEqual(computeOutgoingPlan(denoms, 6000, 'equalisation', ORDER_LARGEST_FIRST, true, 'prefer').breakdown, [{ value_minor: 2000, count: 3 }]);
});
