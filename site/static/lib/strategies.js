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
  const mean = counts.reduce((sum, c) => sum + c, 0) / (counts.length || 1);
  return counts.reduce((sum, c) => {
    const diff = c - mean;
    return sum + diff * diff;
  }, 0);
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

function buildBestPlansBySum(denomsOrdered, strategy, originalCounts, direction, coinMask = null) {
  const n = denomsOrdered.length;
  let map = new Map([[0, { counts: Array(n).fill(0), items: 0, coins: 0 }]]);

  denomsOrdered.forEach((denom, idx) => {
    const next = new Map(map);
    for (const [sum, plan] of map.entries()) {
      for (let k = 1; k <= denom.count; k += 1) {
        const newSum = sum + k * denom.value_minor;
        const newCounts = plan.counts.slice();
        newCounts[idx] += k;
        const coinAdd = coinMask ? (coinMask[idx] ? k : 0) : 0;
        const newPlan = { counts: newCounts, items: plan.items + k, coins: plan.coins + coinAdd };
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

function selectBestOverpayPlan(map, target, strategy, orderCounts, originalCounts, direction, allowOverpay, coinMask = null, coinFirstOverpay = false) {
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

function greedyOverpay(denoms, target, order = ORDER_LARGEST_FIRST) {
  const base = greedyExact(denoms, target, order);
  if (base.ok) {
    return { ok: true, counts: base.counts, sum: target, ordered: base.ordered };
  }
  const ordered = base.ordered;
  const remaining = base.remaining;
  const available = ordered.map((d, idx) => ({ ...d, count: d.count - base.counts[idx] }));
  const originalCounts = available.map((d) => d.count);
  const map = buildBestPlansBySum(available, 'lex', originalCounts, 'outgoing');
  const bestExtra = selectBestOverpayPlan(map, remaining, 'lex', order, originalCounts, 'outgoing', true);
  if (!bestExtra) return { ok: false };
  const totalCounts = base.counts.map((c, idx) => c + bestExtra.plan.counts[idx]);
  const sum = target - remaining + bestExtra.sum;
  return { ok: true, counts: totalCounts, sum, ordered };
}

function optimalPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST, allowOverpay = true, direction = 'outgoing', originalCountsOverride = null, coinMask = null, coinFirstOverpay = false) {
  const ordered = orderDenoms(denoms, order);
  const originalCounts = originalCountsOverride || ordered.map((d) => d.count);
  const map = buildBestPlansBySum(ordered, strategy, originalCounts, direction, coinMask);
  const best = selectBestOverpayPlan(map, target, strategy, order, originalCounts, direction, allowOverpay, coinMask, coinFirstOverpay);
  if (!best) return null;
  return {
    sum: best.sum,
    counts: best.plan.counts,
    ordered,
  };
}

function computeOutgoingPlanBase(denoms, target, strategy, order = ORDER_LARGEST_FIRST, allowOverpay = true, coinMask = null, coinFirstOverpay = false) {
  const effectiveOrder = order;
  const total = denoms.reduce((sum, d) => sum + d.value_minor * d.count, 0);
  if (total < target) {
    return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
  }

  if (strategy === 'greedy') {
    const exact = greedyExact(denoms, target, effectiveOrder);
    if (exact.ok) {
      return {
        status: 'exact',
        breakdown: countsToBreakdown(exact.ordered, exact.counts),
        paidMinor: target,
        overpay: 0,
      };
    }
    if (!allowOverpay) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
    const over = greedyOverpay(denoms, target, effectiveOrder);
    if (!over.ok) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
    return {
      status: 'sufficient_not_exact',
      breakdown: countsToBreakdown(over.ordered, over.counts),
      paidMinor: over.sum,
      overpay: Math.max(0, over.sum - target),
    };
  }

  if (strategy === 'lex' || strategy === 'equalisation') {
    const plan = optimalPlan(denoms, target, strategy, effectiveOrder, allowOverpay, 'outgoing', null, coinMask, coinFirstOverpay);
    if (!plan) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
    const overpay = Math.max(0, plan.sum - target);
    return {
      status: overpay === 0 ? 'exact' : 'sufficient_not_exact',
      breakdown: countsToBreakdown(plan.ordered, plan.counts),
      paidMinor: plan.sum,
      overpay,
    };
  }

  return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
}

export function computeOutgoingPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST, allowOverpay = true, coinsRule = 'off') {
  if (coinsRule === 'off') return computeOutgoingPlanBase(denoms, target, strategy, order, allowOverpay);

  const notesOnly = denoms.filter((d) => d.type !== 'coin');

  if (coinsRule === 'avoid') {
    return computeOutgoingPlanBase(notesOnly, target, strategy, order, allowOverpay);
  }

  const exactNotes = computeOutgoingPlanBase(notesOnly, target, strategy, order, false);
  if (exactNotes.status === 'exact') return exactNotes;

  const coinMask = denoms.map((d) => d.type === 'coin');
  const exactAny = computeOutgoingPlanBase(denoms, target, strategy, order, false, coinMask);
  if (exactAny.status === 'exact') return exactAny;

  if (!allowOverpay) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
  return computeOutgoingPlanBase(denoms, target, 'lex', order, true, coinMask, true);
}

export function computeIncomingPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST, coinsRule = 'off') {
  if (target <= 0) return { ok: false, breakdown: [] };
  const ordered = orderDenoms(denoms, order);
  const n = ordered.length;
  const originalCounts = ordered.map((d) => d.count);

  if (coinsRule !== 'off') {
    const notesOnly = ordered.filter((d) => d.type !== 'coin');
    const notesPlan = computeIncomingPlan(notesOnly, target, strategy, order, 'off');
    if (notesPlan.ok || coinsRule === 'avoid') return notesPlan;
  }

  if (strategy === 'greedy') {
    const unlimited = ordered.map((d) => ({
      ...d,
      count: Math.floor(target / d.value_minor),
    }));
    const exact = greedyExact(unlimited, target, order);
    return exact.ok
      ? { ok: true, breakdown: countsToBreakdown(exact.ordered, exact.counts) }
      : { ok: false, breakdown: [] };
  }

  const dp = Array(target + 1).fill(null);
  dp[0] = { items: 0, counts: Array(n).fill(0) };
  const coinMask = coinsRule === 'prefer' ? ordered.map((d) => d.type === 'coin') : null;

  for (let sum = 0; sum <= target; sum += 1) {
    const plan = dp[sum];
    if (!plan) continue;
    for (let i = 0; i < n; i += 1) {
      const value = ordered[i].value_minor;
      const nextSum = sum + value;
      if (nextSum > target) continue;
      const counts = plan.counts.slice();
      counts[i] += 1;
      const coinAdd = coinMask ? (coinMask[i] ? 1 : 0) : 0;
      const candidate = { items: plan.items + 1, counts, coins: (plan.coins || 0) + coinAdd };
      const existing = dp[nextSum];
      if (!existing) {
        dp[nextSum] = candidate;
        continue;
      }
      if (coinMask && candidate.coins !== existing.coins) {
        if (candidate.coins < existing.coins) dp[nextSum] = candidate;
        continue;
      }
      if (candidate.items !== existing.items) {
        if (candidate.items < existing.items) dp[nextSum] = candidate;
        continue;
      }
      if (strategy === 'equalisation') {
        const costA = varianceCost(remainingCounts(originalCounts, candidate.counts, 'incoming'));
        const costB = varianceCost(remainingCounts(originalCounts, existing.counts, 'incoming'));
        if (costA !== costB) {
          if (costA < costB) dp[nextSum] = candidate;
          continue;
        }
      }
      if (lexPrefers(candidate.counts, existing.counts)) {
        dp[nextSum] = candidate;
      }
    }
  }

  const best = dp[target];
  if (!best) return { ok: false, breakdown: [] };
  return { ok: true, breakdown: countsToBreakdown(ordered, best.counts) };
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
