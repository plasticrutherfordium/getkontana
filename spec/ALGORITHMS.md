# Algorithms

## Inputs and Outputs
- Inputs: `amount` (minor units), list of denominations `{ value, count }`.
- Output: exact breakdown `{ value, count }[]` or a failure reason.

## Greedy Strategy
- Sort denominations by `value` descending.
- For each value, use the maximum possible count without exceeding `amount` or available `count`.
- Continue until the remaining amount is zero or no more denominations are available.

## Lex Strategy
- Sort denominations by `value` ascending.
- For each value, use the maximum possible count without exceeding `amount` or available `count`.
- Continue until the remaining amount is zero or no more denominations are available.

## Exact Payment Only
- If total funds are less than `amount`, return: `insufficient total funds`.
- If total funds are sufficient but the remaining amount cannot be reduced to zero, return: `cannot make exact amount with available denominations`.

## Deterministic Ordering and Tie-breakers
- Denominations are sorted by `value` only; if values are equal, preserve input order.
- When two breakdowns are mathematically equivalent, the first produced by the selected strategy is used.

## Complexity
- Sorting: `O(n log n)` for `n` denominations.
- Breakdown calculation: `O(n)`.
- Space: `O(n)` for the breakdown.
