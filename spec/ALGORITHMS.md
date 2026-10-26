<!-- SPDX-License-Identifier: MPL-2.0 -->
# Cash calculation rules

Implemented in `site/static/lib/strategies.js`; Node tests import the same module through `src/lib/strategies.js`. These rules supersede the earlier heuristic-only description. Product behavior: [APP_SPEC.md](APP_SPEC.md). Regression evidence: [RELEASE_VERIFICATION.md](RELEASE_VERIFICATION.md).

## Inputs and guarantees

All calculations use positive integer minor-unit denomination values and positive integer purchase amounts, within JavaScript's safe integer range. Counts are nonnegative integers and denomination values are unique. Invalid inputs return no plan. Suggestions never mutate supplied denominations, wallet balances, or history.

Outgoing payments use only recorded available counts. Incoming allocation and merchant change can use repeated denominations regardless of the wallet's current stock. A valid outgoing plan totals exactly `paidMinor`, with `overpay = paidMinor - target`; a valid incoming plan totals exactly its target.

## Outgoing selection

1. Apply the selected coin rule.
2. Find an exact payment if any permitted combination exists.
3. If no exact payment exists and payment with change is disabled, return no plan.
4. Otherwise find the smallest permitted tender that covers the price, subject to the explicit Prefer notes rule below.
5. Minimize item count within that amount, then apply the strategy's final tie-breaks.

API statuses are `exact`, `sufficient_not_exact`, or `insufficient`. The last means no plan under the selected constraints; it does not by itself mean the complete wallet balance is below the price. The app distinguishes an insufficient balance from a failure to pay exactly under the settings.

A failed partial exact attempt is discarded before searching for a cover. For a wallet containing EUR 100 × 1, EUR 20 × 2, EUR 2 × 1 and EUR 1 × 1, buying EUR 12.50 must suggest **EUR 20**, with **EUR 7.50 change**. It must not keep EUR 2 + EUR 1 and add EUR 20. The final balance after confirming actual change is EUR 130.50.

## Strategy choices

### Minimise (`greedy`)

The retained setting ID is `greedy`. It may use a quick greedy exact result only when a separate minimum-item lower bound proves that result optimal. If that proof fails, or the greedy attempt gets stuck, a complete bounded search reconsiders the wallet. It never reports failure or accepts avoidable overpayment merely because the greedy prefix failed.

For example, denominations 4 × 1 and 3 × 2 can pay 6 exactly as 3 + 3, even though a first attempt picks 4. This must work with payment with change both enabled and disabled. Inverting the ordering must not make a feasible exact payment disappear.

### Preserve (`lex`)

Use complete search. After amount and item-count objectives, lexicographically prefer more denominations in the selected ordering (larger first by default; smaller first when inverted).

Minimise and Preserve now share the same payment-quality objectives and deterministic tie-break. They can produce identical results; the distinction is the proved fast path, not permission for Minimise to make worse payments. Existing saved IDs remain compatible.

### Balance (`equalisation`)

After the same amount/item-count objectives, minimize variance in the final counts: remaining counts for outgoing, increased counts for incoming. Finally apply the selected-order lexicographic tie-break. Compare squared counts after item counts tie, when their mean is identical, avoiding fractional rounding in the variance comparison.

For a wallet with EUR 50 × 1, EUR 20 × 3 and EUR 5 × 2, paying EUR 60 has two three-note exact options: EUR 50 + EUR 5 + EUR 5, or three EUR 20 notes. Preserve chooses the first in descending order; Balance chooses three EUR 20 notes, leaving the counts more even. Coin preferences take priority over the balance tie-break when coins are involved.

For incoming Balance, first establish the optimal coin/item budgets, then search the final distribution while processing each denomination once. Keeping only a locally balanced prefix in an unbounded search is insufficient to guarantee the correct final result or tie-break.

## Coin rules

- **Off:** notes and coins compete without a coin-count preference.
- **Avoid coins entirely:** restrict the search to notes. If those cannot satisfy the exact/cover setting, return no plan.
- **Prefer notes:** use an exact notes-only payment if possible; otherwise an exact payment allowing coins, preferring fewer coins before item count. If no exact payment exists and change is enabled, minimize coins first, then overpayment, then item count, then Balance (when selected), then the ordering tie-break. This explicit preference may choose a larger note over a smaller coin-based cover.

Coin classification always follows the reordered denomination rows. Reversing the order must never apply a coin flag to a note or vice versa. Incoming uses the same notes-only/fewer-coins priorities and requires an exact total.

## Search bounds and scale

Bound outgoing search by the target for exact payment. For cover, an optimal tender is below `target + largest available denomination`: any larger tender has a removable item and cannot improve the objectives. Cap each denomination count by the search amount rather than expanding the full wallet stock.

Incoming exact search uses the greatest common divisor of usable denomination values to scale its amount states. Balance's second search is bounded by the already established optimal item/coin budgets. This avoids allocating states for every tiny minor unit when only large cash increments can be used.

## Change, commitment and reversal

Merchant change uses the exact incoming allocator with Minimise, ignoring wallet stock. It also recovers from a greedy dead end. A suggested breakdown is an option to review; confirmation or manual entry must reconcile to `tender - purchase`.

Preview and cancellation do not change cash. Confirmation deducts tender, adds the actual confirmed change, and records one outgoing transaction with net delta equal to the negative purchase amount. Reversing the latest transaction restores both tender and received-change effects.

## History preservation

Do not expire transactions or check-ins based on age or record count. Compute balances from the complete ledger. Budget period filtering affects summaries only and never deletes saved history.
