const ORDER_LARGEST_FIRST = 'largest_first';
const ORDER_SMALLEST_FIRST = 'smallest_first';

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
    if (aCounts[i] !== bCounts[i]) return aCounts[i] > bCounts[i];
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

function betterPlanSameSum(a, b, strategy, originalCounts, direction) {
  if (a.items !== b.items) return a.items < b.items;
  if (strategy === 'equalisation') {
    const costA = varianceCost(remainingCounts(originalCounts, a.counts, direction));
    const costB = varianceCost(remainingCounts(originalCounts, b.counts, direction));
    if (costA !== costB) return costA < costB;
  }
  return lexPrefers(a.counts, b.counts);
}

function buildBestPlansBySum(denomsOrdered, strategy, originalCounts, direction) {
  const n = denomsOrdered.length;
  let map = new Map([[0, { counts: Array(n).fill(0), items: 0 }]]);

  denomsOrdered.forEach((denom, idx) => {
    const next = new Map(map);
    for (const [sum, plan] of map.entries()) {
      for (let k = 1; k <= denom.count; k += 1) {
        const newSum = sum + k * denom.value_minor;
        const newCounts = plan.counts.slice();
        newCounts[idx] += k;
        const newPlan = { counts: newCounts, items: plan.items + k };
        const existing = next.get(newSum);
        if (!existing || betterPlanSameSum(newPlan, existing, strategy, originalCounts, direction)) {
          next.set(newSum, newPlan);
        }
      }
    }
    map = next;
  });
  return map;
}

function selectBestOverpayPlan(map, target, strategy, orderCounts, originalCounts, direction, allowOverpay) {
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

function countsToBreakdown(denomsOrdered, counts) {
  return counts
    .map((count, idx) => ({
      value_minor: denomsOrdered[idx].value_minor,
      count,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.value_minor - a.value_minor);
}

function greedyExact(denoms, target, order = ORDER_LARGEST_FIRST) {
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

function optimalPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST, allowOverpay = true, direction = 'outgoing', originalCountsOverride = null) {
  const ordered = orderDenoms(denoms, order);
  const originalCounts = originalCountsOverride || ordered.map((d) => d.count);
  const map = buildBestPlansBySum(ordered, strategy, originalCounts, direction);
  const best = selectBestOverpayPlan(map, target, strategy, order, originalCounts, direction, allowOverpay);
  if (!best) return null;
  return {
    sum: best.sum,
    counts: best.plan.counts,
    ordered,
  };
}

function computeOutgoingPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST, allowOverpay = true) {
  const total = denoms.reduce((sum, d) => sum + d.value_minor * d.count, 0);
  if (total < target) {
    return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
  }

  if (strategy === 'greedy') {
    const exact = greedyExact(denoms, target, order);
    if (exact.ok) {
      return {
        status: 'exact',
        breakdown: countsToBreakdown(exact.ordered, exact.counts),
        paidMinor: target,
        overpay: 0,
      };
    }
    if (!allowOverpay) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
    const over = greedyOverpay(denoms, target, order);
    if (!over.ok) return { status: 'insufficient', breakdown: null, paidMinor: null, overpay: null };
    return {
      status: 'sufficient_not_exact',
      breakdown: countsToBreakdown(over.ordered, over.counts),
      paidMinor: over.sum,
      overpay: Math.max(0, over.sum - target),
    };
  }

  if (strategy === 'lex' || strategy === 'equalisation') {
    const plan = optimalPlan(denoms, target, strategy, order, allowOverpay, 'outgoing');
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

function computeIncomingPlan(denoms, target, strategy, order = ORDER_LARGEST_FIRST) {
  if (target <= 0) return { ok: false, breakdown: [] };
  const ordered = orderDenoms(denoms, order);
  const unlimited = ordered.map((d) => ({
    ...d,
    count: Math.floor(target / d.value_minor),
  }));
  const originalCounts = ordered.map((d) => d.count);

  if (strategy === 'greedy') {
    const exact = greedyExact(unlimited, target, order);
    return exact.ok
      ? { ok: true, breakdown: countsToBreakdown(exact.ordered, exact.counts) }
      : { ok: false, breakdown: [] };
  }

  const plan = optimalPlan(unlimited, target, strategy, order, false, 'incoming', originalCounts);
  if (!plan) return { ok: false, breakdown: [] };
  return { ok: true, breakdown: countsToBreakdown(plan.ordered, plan.counts) };
}

function computeChangeBreakdown(denoms, changeMinor) {
  if (!changeMinor || changeMinor <= 0) return [];
  const unlimited = denoms.map((d) => ({ ...d, count: Math.floor(changeMinor / d.value_minor) + 1 }));
  const exact = greedyExact(unlimited, changeMinor, ORDER_LARGEST_FIRST);
  return exact.ok ? countsToBreakdown(exact.ordered, exact.counts) : [];
}

export {
  ORDER_LARGEST_FIRST,
  ORDER_SMALLEST_FIRST,
  greedyExact,
  greedyOverpay,
  computeOutgoingPlan,
  computeIncomingPlan,
  computeChangeBreakdown,
};
