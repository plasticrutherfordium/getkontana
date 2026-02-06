# Algorithms

## Context & Shared Rules
- Wallet = currency + name + denominations (counts) + transactions.
- Denomination counts are bounded for outgoing payments: never use more units than are available.
- Strategies are used for both Outgoing and Incoming flows, with different semantics:
  - Outgoing: choose a set of denominations to **remove** from wallet.
  - Incoming: choose a set of denominations to **add** to wallet (allocation must match amount exactly).
- Avoid coins toggle (when present):
  - When ON, attempt a notes-only exact plan first.
  - If exact notes-only is impossible, allow coins.
  - If exact is still impossible, fail gracefully with clear UI feedback.

## Outgoing Status Classification
Given wallet denominations and target amount:
1. `exact`: an exact breakdown exists using available counts.
2. `insufficient`: exact breakdown does not exist using available counts.

## Change Prompt (Outgoing)
When the user overpays manually (allocated > entered amount):
- Change suggestion must be computed with a greedy “make change” algorithm **ignoring wallet counts** (assume infinite availability).
- If user accepts suggested change, that change is added to the wallet automatically.
- If user enters change manually, validate that `receivedChangeTotal == amountPaid - purchaseAmount` exactly.
- If payment strategies are OFF or change suggestions are OFF, skip suggested change and go directly to manual change entry.

## Strategy Definitions

### 1) Greedy Strategy (fast heuristic)
**Goal:** build an exact payment breakdown by taking as many units as possible of each denomination in descending value order, without exceeding the target. This implicitly minimizes the number of items when greedy is optimal for the currency.

**Outgoing (exact attempt):**
- Iterate denominations in chosen ordering.
- For each denom `d` with available count `c`:
  - `take = min(c, floor(remaining / d))`
  - subtract `take * d` from remaining.
- If remaining reaches `0` → exact.

**Outgoing (overpay extension, pay-with-change ON):**
- Start from the greedy-exact attempt. If `remaining > 0`, try to reach at least target by adding the **smallest possible extra amount** using remaining available denominations (still bounded by wallet counts).
- Choose the plan with:
  1. smallest overpay
  2. fewer total items
  3. ordering-toggle lex tie-break (deterministic)
- If cannot reach at least target → insufficient.

**Incoming:**
- Greedy exact attempt only (exact must be reached; if it fails, no suggestion is shown).

**Examples where Greedy fails but exact exists:**
- Denoms: `4 (x1), 3 (x2)` Target `6` (largest-first).
  - Greedy takes `4`, remaining `2` → fails exact.
  - Exact exists: `3 + 3`.
- Denoms: `8 (x1), 6 (x1), 4 (x1)` Target `10` (largest-first).
  - Greedy takes `8`, remaining `2` → fails exact.
  - Exact exists: `6 + 4`.

### 2) Lex Strategy
**Goal:** choose a deterministic, largest-to-smallest preference among exact solutions.

**Outgoing (exact attempt):**
1. Find any exact solution.
2. Minimise total items used.
3. Tie-break by lexicographically **maximizing** the denomination counts vector in the current ordering (largest-first by default).  
   - This means prefer using more of higher denominations first, then the next, and so on.

**Implementation expectation:**
- Use bounded coin change (DP/backtracking) to guarantee optimality by the objectives above.
- Must return:
  - exact plan if any exists
  - otherwise (if pay-with-change ON) the smallest-overpay plan
  - otherwise insufficient
- Deterministic for same wallet state + amount + ordering toggle.

### 3) Equalisation Strategy
**Goal:** balance remaining denominations evenly and avoid extreme depletion of any single denomination.

**Outgoing (exact attempt):**
1. Find any exact solution.
2. Minimise total items used.
3. Choose the plan that leaves the remaining counts as even as possible:
   - `cost = sum((remainingCount_i - meanRemainingCount)^2)`
4. Final tie-break: lexicographically maximize the counts vector in the current ordering (same as Lex).

**Worked example (Equalisation tie-break):**
- Denoms (value × count): `10×2, 5×4, 2×4, 1×4`
- Target `8`, both exact with 4 items:
  - Plan A: `2+2+2+2` → remaining counts = `10×2, 5×4, 2×0, 1×4`
  - Plan B: `5+1+1+1` → remaining counts = `10×2, 5×3, 2×4, 1×1`
- Both have exact total and same item count, but Plan B leaves counts more balanced (lower variance), so Equalisation selects Plan B.

## Coins Rules Behaviour (applies to all strategies)
When `Avoid coins = OFF`: current behaviour (no coin preference).

When `Avoid coins = ON` with mode `Avoid coins entirely`:
- Payments are restricted to notes only (coins never used in the payment set).
- If no valid notes-only plan exists → `insufficient` (even if coins would make it possible).
- Incoming allocation uses notes only; if no exact allocation exists, no suggestion is shown.

When `Avoid coins = ON` with mode `Prefer notes`:
1. **Exact with notes only:** attempt an exact plan using notes only with the selected base strategy.
   - If exact is found → use it (coins not used).
2. **Exact with coins allowed:** if notes-only exact fails, allow coins and run the base strategy normally.
   - If multiple exact plans exist, prefer **fewer coins** as the first tie-breaker.
3. **Overpay (only when pay-with-change = ON):**
   - If no exact plan exists, allow overpay and choose the plan with:
     1. fewest coins
     2. smallest overpay
     3. fewest total items
     4. ordering-toggle lexicographic tie-break (deterministic)

## Allocation Completion Rules
Incoming:
- `allocatedTotal == enteredAmount` before finalize.
Outgoing:
- `allocatedTotal >= enteredAmount`, `changeExpected = allocatedTotal - enteredAmount`.
- If `changeExpected > 0`, change confirmation required and must reconcile exactly.

## Wallet Reconciliation Rules
- `expectedBalance = sum(deltaMinor across retained wallet transactions)`
- `denominationsTotal = sum(valueMinor * count)`
- Invariant: `denominationsTotal == expectedBalance`

## Retention Countdown
- Transactions older than 30 days are auto-deleted.
- Banner values:
  - `daysRemaining = max(0, 30 - ageInDays(oldestRetainedTransaction))`
  - `nextDeletionCount = number of transactions scheduled in next deletion window`
