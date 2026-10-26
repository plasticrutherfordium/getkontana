// SPDX-License-Identifier: MPL-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import { computeOutgoingPlan, computeIncomingPlan } from '../src/lib/strategies.js';
import { getCurrencyDenominations } from '../src/lib/currency.js';

const strategies = ['greedy', 'lex', 'equalisation'];
const orders = ['largest_first', 'smallest_first'];
const coinRules = ['off', 'avoid', 'prefer'];

// Independent exhaustive reference: enumerate complete combinations, then rank
// them. It deliberately uses no production search or comparison helpers.
function combinations(denoms, limits = denoms.map((d) => d.count), maxPaid = Infinity) {
  const result = [];
  function visit(index, counts, paid, items, coins) {
    if (paid > maxPaid) return;
    if (index === denoms.length) {
      result.push({ counts, paid, items, coins });
      return;
    }
    for (let count = 0; count <= limits[index]; count += 1) {
      visit(index + 1, [...counts, count], paid + count * denoms[index].value_minor,
        items + count, coins + (denoms[index].type === 'coin' ? count : 0));
    }
  }
  visit(0, [], 0, 0, 0);
  return result;
}

function compare(a, b) {
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function reference(denoms, candidates, target, strategy, order, coinsRule, allowOverpay, incoming = false) {
  const indices = denoms.map((_, i) => i).sort((a, b) => (order === 'largest_first' ? -1 : 1)
    * (denoms[a].value_minor - denoms[b].value_minor));
  let best = null;
  let bestScore;
  for (const candidate of candidates) {
    if (candidate.paid < target || ((!allowOverpay || incoming) && candidate.paid !== target)) continue;
    if (coinsRule === 'avoid' && candidate.coins) continue;
    const remaining = denoms.map((d, i) => d.count + (incoming ? 1 : -1) * candidate.counts[i]);
    // n * sum(x²) - sum(x)² is proportional to variance, without rounding.
    const balance = remaining.length * remaining.reduce((sum, n) => sum + n * n, 0)
      - remaining.reduce((sum, n) => sum + n, 0) ** 2;
    const score = [candidate.paid === target ? 0 : 1, coinsRule === 'prefer' ? candidate.coins : 0,
      candidate.paid - target, candidate.items, strategy === 'equalisation' ? balance : 0,
      ...indices.map((i) => -candidate.counts[i])];
    if (!best || compare(score, bestScore) < 0) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

function assertPlan(actual, expected, denoms, target, context, incoming = false) {
  if (!expected) {
    assert.equal(incoming ? actual.ok : actual.status === 'exact' || actual.status === 'sufficient_not_exact', false, context);
    return;
  }
  assert.equal(incoming ? actual.ok : actual.status, incoming ? true : expected.paid === target ? 'exact' : 'sufficient_not_exact', context);
  const counts = denoms.map((d) => actual.breakdown.find((row) => row.value_minor === d.value_minor)?.count || 0);
  assert.deepEqual(counts, expected.counts, context);
  const total = actual.breakdown.reduce((sum, d) => sum + d.value_minor * d.count, 0);
  assert.equal(total, expected.paid, context);
  if (!incoming) {
    assert.equal(actual.paidMinor, total, context);
    assert.equal(actual.overpay, total - target, context);
  }
}

const fixtures = [
  [7, 5, 2, 1], [9, 6, 4, 1], [8, 6, 4, 3], [10, 4, 3, 2],
];
let outgoingChecks = 0;
let incomingChecks = 0;
let catalogueChecks = 0;
let catalogueIncomingChecks = 0;

for (const strategy of strategies) {
  test(`${strategy}: outgoing matches complete enumeration across wallets, orders, coin rules and change settings`, () => {
    for (const values of fixtures) {
      const maxCount = values === fixtures[0] ? 2 : 1;
      for (const wallet of combinations(values.map((value) => ({ value_minor: value, count: maxCount })))) {
        const denoms = values.map((value, i) => ({ value_minor: value, count: wallet.counts[i], type: i < 2 ? 'note' : 'coin' }));
        const candidates = combinations(denoms);
        for (let target = 1; target <= wallet.paid + 1; target += 1) {
          for (const order of orders) for (const rule of coinRules) for (const cover of [false, true]) {
            const expected = reference(denoms, candidates, target, strategy, order, rule, cover);
            const actual = computeOutgoingPlan(denoms, target, strategy, order, cover, rule);
            assertPlan(actual, expected, denoms, target, JSON.stringify({ strategy, values, counts: wallet.counts, target, order, rule, cover }));
            outgoingChecks += 1;
          }
        }
      }
    }
  });

  test(`${strategy}: incoming matches complete enumeration with existing counts and note preferences`, () => {
    for (const values of fixtures) {
      for (const starting of [[0, 0, 0, 0], [1, 3, 0, 2], [4, 0, 3, 1], [3, 2, 1, 4]]) {
        const denoms = values.map((value, i) => ({ value_minor: value, count: starting[i], type: i < 2 ? 'note' : 'coin' }));
        for (let target = 1; target <= 30; target += 1) {
          const candidates = combinations(denoms, values.map((value) => Math.floor(target / value)), target);
          for (const order of orders) for (const rule of coinRules) {
            const expected = reference(denoms, candidates, target, strategy, order, rule, false, true);
            const actual = computeIncomingPlan(denoms, target, strategy, order, rule);
            assertPlan(actual, expected, denoms, target, JSON.stringify({ strategy, values, starting, target, order, rule }), true);
            incomingChecks += 1;
          }
        }
      }
    }
  });
}

test('Balance incoming: seeded denomination and existing-count combinations match full enumeration', () => {
  let seed = 7262026;
  const random = (n) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (let fixture = 0; fixture < 2000; fixture += 1) {
    const values = [];
    while (values.length < 5) { const value = random(12) + 1; if (!values.includes(value)) values.push(value); }
    const denoms = values.map((value, i) => ({ value_minor: value, count: random(9), type: i < 2 ? 'note' : 'coin' }));
    const target = random(30) + 1;
    const candidates = combinations(denoms, values.map((value) => Math.floor(target / value)), target);
    for (const order of orders) for (const rule of coinRules) {
      const expected = reference(denoms, candidates, target, 'equalisation', order, rule, false, true);
      const actual = computeIncomingPlan(denoms, target, 'equalisation', order, rule);
      assertPlan(actual, expected, denoms, target, JSON.stringify({ denoms, target, order, rule }), true);
      incomingChecks += 1;
    }
  }
});

test('All 28 supported currency catalogues match complete outgoing enumeration', () => {
  const currencies = 'EUR USD GBP CLP SEK CHF HUF DKK NOK PLN CAD ARS PEN BRL MXN CZK RON CNY JPY INR SGD KRW EGP ZAR NGN XOF AUD NZD'.split(' ');
  for (const currency of currencies) {
    const catalogue = getCurrencyDenominations(currency);
    for (let fixture = 0; fixture < 3; fixture += 1) {
      const denoms = catalogue.map((d, i) => ({ ...d, count: (i + fixture) % 3 === 0 ? (i % 2) + 1 : 0 }));
      const candidates = combinations(denoms);
      const total = denoms.reduce((sum, d) => sum + d.value_minor * d.count, 0);
      const targets = new Set([1, Math.floor(total / 7) || 1, Math.floor(total / 2) || 1, total, total + 1]);
      for (const target of targets) for (const strategy of strategies) for (const order of orders) {
        for (const rule of coinRules) for (const cover of [false, true]) {
          const expected = reference(denoms, candidates, target, strategy, order, rule, cover);
          const actual = computeOutgoingPlan(denoms, target, strategy, order, cover, rule);
          assertPlan(actual, expected, denoms, target, JSON.stringify({ currency, fixture, target, strategy, order, rule, cover }));
          catalogueChecks += 1;
        }
      }
    }
  }
});

test('Incoming exact allocations match enumeration for all 28 supported currency catalogues', () => {
  const currencies = 'EUR USD GBP CLP SEK CHF HUF DKK NOK PLN CAD ARS PEN BRL MXN CZK RON CNY JPY INR SGD KRW EGP ZAR NGN XOF AUD NZD'.split(' ');
  for (const currency of currencies) {
    const denoms = getCurrencyDenominations(currency).map((d, i) => ({ ...d, count: i % 4 }));
    const small = denoms.slice(-4);
    const targets = [small.at(-1).value_minor * 3, small.at(-2).value_minor + small.at(-1).value_minor,
      small.reduce((sum, d) => sum + d.value_minor, 0)];
    for (const target of targets) {
      const candidates = combinations(denoms, denoms.map((d) => Math.floor(target / d.value_minor)), target);
      for (const strategy of strategies) for (const order of orders) for (const rule of coinRules) {
        const expected = reference(denoms, candidates, target, strategy, order, rule, false, true);
        const actual = computeIncomingPlan(denoms, target, strategy, order, rule);
        assertPlan(actual, expected, denoms, target, JSON.stringify({ currency, target, strategy, order, rule }), true);
        catalogueIncomingChecks += 1;
      }
    }
  }
});

test.after(() => console.info(`Reference comparisons: ${outgoingChecks} synthetic outgoing, ${incomingChecks} incoming, ${catalogueChecks} currency-catalogue outgoing, ${catalogueIncomingChecks} currency-catalogue incoming`));
