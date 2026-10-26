// SPDX-License-Identifier: MPL-2.0
export const ORDER_LARGEST_FIRST = 'largest_first';
export const ORDER_SMALLEST_FIRST = 'smallest_first';

function orderDenoms(denoms, order) {
  const sorted = [...denoms].map((d, idx) => ({ ...d, _idx: idx }));
  sorted.sort((a, b) => {
    if (order === ORDER_SMALLEST_FIRST) return a.value_minor - b.value_minor || a._idx - b._idx;
    return b.value_minor - a.value_minor || a._idx - b._idx;
  });
  return sorted;
}

function lexPrefers(aCounts, bCounts) {
  for (let i = 0; i < aCounts.length; i += 1) {
    if (aCounts[i] !== bCounts[i]) {
      return aCounts[i] > bCounts[i];
    }
  }
  return false;
}

function varianceCost(counts) {
  // Compared only after item counts tie, so the mean is identical. Comparing
  // squared counts gives the same variance ordering without fractional rounding.
  return counts.reduce((sum, count) => sum + count * count, 0);
}

function remainingCounts(originalCounts, planCounts, direction) {
  if (direction === 'incoming') {
    return originalCounts.map((c, i) => c + planCounts[i]);
  }
  return originalCounts.map((c, i) => c - planCounts[i]);
}

function betterPlanSameSum(a, b, strategy, originalCounts, direction, coinMask = null) {
  if (coinMask) {
    if (a.coins !== b.coins) return a.coins < b.coins;
  }
  if (a.items !== b.items) return a.items < b.items;
  if (strategy === 'equalisation') {
    const costA = varianceCost(remainingCounts(originalCounts, a.counts, direction));
    const costB = varianceCost(remainingCounts(originalCounts, b.counts, direction));
    if (costA !== costB) return costA < costB;
  }
  return lexPrefers(a.counts, b.counts);
}

function buildBestPlansBySum(denomsOrdered, strategy, originalCounts, direction, coinMask, maxSum, budget = null) {
  const n = denomsOrdered.length;
  let map = new Map([[0, { counts: Array(n).fill(0), items: 0, coins: 0 }]]);

  denomsOrdered.forEach((denom, idx) => {
    const next = new Map(map);
    for (const [sum, plan] of map.entries()) {
      const limit = Math.min(denom.count, Math.floor((maxSum - sum) / denom.value_minor), budget?.items ?? Infinity);
      for (let k = 1; k <= limit; k += 1) {
        const newSum = sum + k * denom.value_minor;
        const newCounts = plan.counts.slice();
        newCounts[idx] += k;
        const coinAdd = coinMask ? (coinMask[idx] ? k : 0) : 0;
        const newPlan = { counts: newCounts, items: plan.items + k, coins: plan.coins + coinAdd };
        if (budget && (newPlan.items > budget.items || (coinMask && newPlan.coins > budget.coins))) continue;
        const existing = next.get(newSum);
        if (!existing || betterPlanSameSum(newPlan, existing, strategy, originalCounts, direction, coinMask)) {
          next.set(newSum, newPlan);
        }
      }
    }
    map = next;
  });
  return map;
}

function selectBestOverpayPlan(map, target, strategy, originalCounts, direction, allowOverpay, coinMask = null, coinFirstOverpay = false) {
  let best = null;
  for (const [sum, plan] of map.entries()) {
    if (sum < target) continue;
    const overpay = sum - target;
    if (!allowOverpay && overpay > 0) continue;
    if (!best) {
      best = { sum, plan };
      continue;
    }
    const bestOverpay = best.sum - target;
    if (coinMask && coinFirstOverpay) {
      if (plan.coins !== best.plan.coins) {
        if (plan.coins < best.plan.coins) best = { sum, plan };
        continue;
      }
    }
    if (overpay !== bestOverpay) {
      if (overpay < bestOverpay) best = { sum, plan };
      continue;
    }
    if (plan.items !== best.plan.items) {
      if (plan.items < best.plan.items) best = { sum, plan };
      continue;
    }
    if (strategy === 'equalisation') {
      const costA = varianceCost(remainingCounts(originalCounts, plan.counts, direction));
      const costB = varianceCost(remainingCounts(originalCounts, best.plan.counts, direction));
      if (costA !== costB) {
        if (costA < costB) best = { sum, plan };
        continue;
      }
    }
    if (lexPrefers(plan.counts, best.plan.counts)) best = { sum, plan };
  }
  return best;
}

export function countsToBreakdown(denomsOrdered, counts) {
  return counts
    .map((count, idx) => ({
      value_minor: denomsOrdered[idx].value_minor,
      count,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.value_minor - a.value_minor);
}

export function greedyExact(denoms, target, order = ORDER_LARGEST_FIRST) {
  const ordered = orderDenoms(denoms, order);
  let remaining = target;
  const counts = Array(ordered.length).fill(0);
  ordered.forEach((row, idx) => {
    const take = Math.min(row.count, Math.floor(remaining / row.value_minor));
    if (take > 0) {
      counts[idx] = take;
      remaining -= take * row.value_minor;
    }
  });
  return {
    ok: remaining === 0,
    counts,
    sum: target - remaining,
    ordered,
    remaining,
  };
}

function minimumItemsToCover(denoms, target) {
  let remaining = target;
  let items = 0;
  for (const row of [...denoms].sort((a, b) => b.value_minor - a.value_minor)) {
    const count = Math.min(row.count, Math.ceil(remaining / row.value_minor));
    items += count;
    remaining -= count * row.value_minor;
    if (remaining <= 0) return items;
  }
  return Infinity;
}

function validProblem(denoms, target, strategy, order, coinsRule) {
  if (!Number.isSafeInteger(target) || target <= 0 || !Array.isArray(denoms)) return false;
  if (!['greedy', 'lex', 'equalisation'].includes(strategy)
      || ![ORDER_LARGEST_FIRST, ORDER_SMALLEST_FIRST].includes(order)
      || !['off', 'avoid', 'prefer'].includes(coinsRule)) return false;
  const seen = new Set();
  let total = 0;
  return denoms.every((row) => {
    if (!row || !Number.isSafeInteger(row.value_minor) || row.value_minor <= 0
        || !Number.isSafeInteger(row.count) || row.count < 0 || seen.has(row.value_minor)) return false;
    seen.add(row.value_minor);
    total += row.value_minor * row.count;
    return Number.isSafeInteger(total);
  });
}

function optimalPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST, allowOverpay = true, direction = 'outgoing', originalCountsOverride = null, preferNotes = false, coinFirstOverpay = false, budget = null) {
  const ordered = orderDenoms(denoms, order);
  const originalCounts = originalCountsOverride || ordered.map((d) => d.count);
  // The mask must follow the sorted denominations, not the caller's order.
  const coinMask = preferNotes ? ordered.map((d) => d.type === 'coin') : null;
  const maxValue = ordered.reduce((max, d) => d.count > 0 ? Math.max(max, d.value_minor) : max, 0);
  // An optimal cover cannot contain a removable item. No sum at or above
  // target + largest available denomination can beat a smaller valid cover.
  const maxSum = allowOverpay ? target + Math.min(Math.max(0, maxValue - 1), Number.MAX_SAFE_INTEGER - target) : target;
  const map = buildBestPlansBySum(ordered, strategy, originalCounts, direction, coinMask, maxSum, budget);
  const best = selectBestOverpayPlan(map, target, strategy, originalCounts, direction, allowOverpay, coinMask, coinFirstOverpay);
  return best ? { sum: best.sum, counts: best.plan.counts, ordered } : null;
}

function computeOutgoingPlanBase(denoms, target, strategy, order = ORDER_LARGEST_FIRST, allowOverpay = true, preferNotes = false, coinFirstOverpay = false) {
  const failed = { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
  const total = denoms.reduce((sum, d) => sum + d.value_minor * d.count, 0);
  if (total < target) return failed;

  if (strategy === 'greedy' && !preferNotes) {
    const exact = greedyExact(denoms, target, order);
    const eligible = denoms.filter((d) => d.value_minor <= target);
    // Keep the quick greedy result only when a separate lower bound proves it
    // uses the fewest items. Its successful count vector already wins lex ties.
    if (exact.ok && exact.counts.reduce((sum, n) => sum + n, 0) === minimumItemsToCover(eligible, target)) {
      return { status: 'exact', breakdown: countsToBreakdown(exact.ordered, exact.counts), paidMinor: target, overpay: 0 };
    }
  }

  // Reconsider the entire wallet. Never keep a failed partial payment and add
  // a covering note: that produced EUR 23 instead of EUR 20 for EUR 12.50.
  const method = strategy === 'greedy' ? 'lex' : strategy;
  const exact = optimalPlan(denoms, target, method, order, false, 'outgoing', null, preferNotes);
  const plan = exact || (allowOverpay ? optimalPlan(denoms, target, method, order, true, 'outgoing', null, preferNotes, coinFirstOverpay) : null);
  if (!plan) return failed;
  const overpay = plan.sum - target;
  return { status: overpay === 0 ? 'exact' : 'sufficient_not_exact', breakdown: countsToBreakdown(plan.ordered, plan.counts), paidMinor: plan.sum, overpay };
}

export function computeOutgoingPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST, allowOverpay = true, coinsRule = 'off') {
  if (!validProblem(denoms, target, strategy, order, coinsRule)) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
  if (coinsRule === 'off') return computeOutgoingPlanBase(denoms, target, strategy, order, allowOverpay);

  const notesOnly = denoms.filter((d) => d.type !== 'coin');

  if (coinsRule === 'avoid') {
    return computeOutgoingPlanBase(notesOnly, target, strategy, order, allowOverpay);
  }

  const exactNotes = computeOutgoingPlanBase(notesOnly, target, strategy, order, false);
  if (exactNotes.status === 'exact') return exactNotes;

  const exactAny = computeOutgoingPlanBase(denoms, target, strategy, order, false, true);
  if (exactAny.status === 'exact') return exactAny;

  if (!allowOverpay) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
  return computeOutgoingPlanBase(denoms, target, strategy, order, true, true, true);
}

export function computeIncomingPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST, coinsRule = 'off') {
  if (!validProblem(denoms, target, strategy, order, coinsRule)) return { ok: false, breakdown: [] };
  const ordered = orderDenoms(denoms, order);
  const n = ordered.length;
  const originalCounts = ordered.map((d) => d.count);

  if (coinsRule !== 'off') {
    const notesOnly = ordered.filter((d) => d.type !== 'coin');
    const notesPlan = computeIncomingPlan(notesOnly, target, strategy, order, 'off');
    if (notesPlan.ok || coinsRule === 'avoid') return notesPlan;
  }

  const single = ordered.find((d) => d.value_minor === target);
  if (single) return { ok: true, breakdown: [{ value_minor: single.value_minor, count: 1 }] };

  const preferNotes = coinsRule === 'prefer';
  const coinMask = preferNotes ? ordered.map((d) => d.type === 'coin') : null;
  if (strategy === 'greedy' && !preferNotes) {
    const unlimited = ordered.map((d) => ({ ...d, count: Math.floor(target / d.value_minor) }));
    const exact = greedyExact(unlimited, target, order);
    if (exact.ok && exact.counts.reduce((sum, n) => sum + n, 0) === minimumItemsToCover(unlimited.filter((d) => d.value_minor <= target), target)) {
      return { ok: true, breakdown: countsToBreakdown(exact.ordered, exact.counts) };
    }
  }

  // Work in the smallest reachable step, rather than allocating an entry for
  // every minor unit when all denominations are large or share a cash increment.
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const unit = ordered.filter((d) => d.value_minor <= target).reduce((step, d) => gcd(step, d.value_minor), 0);
  if (!unit || target % unit !== 0) return { ok: false, breakdown: [] };
  const steps = target / unit;
  const dp = Array(steps + 1).fill(null);
  dp[0] = { items: 0, coins: 0, counts: Array(n).fill(0) };

  for (let sum = 0; sum <= steps; sum += 1) {
    const plan = dp[sum];
    if (!plan) continue;
    for (let i = 0; i < n; i += 1) {
      if (ordered[i].value_minor > target) continue;
      const value = ordered[i].value_minor / unit;
      const nextSum = sum + value;
      if (nextSum > steps) continue;
      const counts = plan.counts.slice();
      counts[i] += 1;
      const coinAdd = coinMask ? (coinMask[i] ? 1 : 0) : 0;
      const candidate = { items: plan.items + 1, counts, coins: (plan.coins || 0) + coinAdd };
      const existing = dp[nextSum];
      if (!existing) {
        dp[nextSum] = candidate;
        continue;
      }
      if (betterPlanSameSum(candidate, existing, 'lex', originalCounts, 'incoming', coinMask)) {
        dp[nextSum] = candidate;
      }
    }
  }

  const best = dp[steps];
  if (!best) return { ok: false, breakdown: [] };
  if (strategy !== 'equalisation') return { ok: true, breakdown: countsToBreakdown(ordered, best.counts) };

  // Balance is a final-state property: a locally balanced unbounded DP prefix
  // can become worse when another item of the same denomination is added.
  // First find the optimal coin/item budgets, then process each denomination
  // once to select the globally best final distribution within those budgets.
  const limited = ordered.map((d) => ({ ...d, count: Math.min(best.items, Math.floor(target / d.value_minor)) }));
  const balanced = optimalPlan(limited, target, 'equalisation', order, false, 'incoming', originalCounts, preferNotes, false, best);
  return balanced ? { ok: true, breakdown: countsToBreakdown(balanced.ordered, balanced.counts) } : { ok: false, breakdown: [] };
}

const STRATEGIES_API = {
  ORDER_LARGEST_FIRST,
  ORDER_SMALLEST_FIRST,
  countsToBreakdown,
  greedyExact,
  computeOutgoingPlan,
  computeIncomingPlan,
};

if (typeof window !== 'undefined') {
  window.KontanaStrategies = STRATEGIES_API;
}

export default STRATEGIES_API;
