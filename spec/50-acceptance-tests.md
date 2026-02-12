# /spec/50-acceptance-tests.md

## Migration + state (v1 -> v2, same storage key)
- Existing `kontana_state_v1` loads, migrates to `schema_version:2`, and preserves:
  - wallet totals
  - denoms
  - ledger history
- Migration derives `wallet.balance_minor` equal to denom sum.
- Backup key `kontana_state_v1_backup` is created once (first successful migration).
- Corrupt JSON never gets overwritten; user sees calm blocking screen with:
  - “Export data”
  - “Reset app”

## Mode switching
- Settings toggle persists.
- Switching modes does not delete/transform/hide data.
- Precise workflows remain reachable in Budget mode (under “Advanced” where appropriate).

## Budget onboarding
- Budget mode with no envelopes shows “Set up envelopes (2 minutes)”.
- Wizard creates:
  - `wallet.budget.enabled=true`
  - envelopes with stable IDs and targets
  - cadence persisted
  - tracking level persisted

## Check-ins
- “Yes” creates `method="confirm"` check-in and does not change balances.
- “More/Less”:
  - records actual, drift, category
  - creates linked `adjustment` tx with `{ checkin_id, drift_category }`
  - sets `wallet.balance_minor` to actual
- “Skip” stores `method="skip"` and does not change balances.

## Quick reconcile
- Budget mode: total-only reconcile updates `wallet.count_mode="total"` and creates adjustment + check-in `method="quick_reconcile"`.
- Denoms remain untouched; UI shows “Denoms not counted”.
- Guardrail confirmation appears for large changes (>= abs threshold).

## Transfers and adjustments
- Transfer creates paired txs and updates both wallets’ balances correctly.
- Cannot transfer to same wallet.
- Loss/Adjustment creates `adjustment` tx and updates balance.

## Quick spend (big-only logging)
- Can log spend in <10 seconds on mobile.
- Spend decreases `wallet.balance_minor`.
- Envelope link stored but optional (`unknown` allowed).

## Insights (local-only)
- Budget mode Transactions shows:
  - “This period” summary
  - check-ins completed vs planned
  - net drift
  - drift by category (top 3)
  - biggest logged spends (top 3 if available)

## Export/import
- v2 export re-imports into a clean install with identical budgets/check-ins/balances.
- v1 export imports and migrates to v2.
- Import offers explicit:
  - Replace all data
  - Merge (no duplicates; dedupe by IDs)

## Automated tests (minimum)
- Unit tests for:
  - v1 -> v2 migration (balance derivation)
  - drift calculations and threshold logic
  - transfer pairing and balance updates
  - adjustment creation and category persistence
