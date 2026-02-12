# /spec/10-data-model.md

## Storage key and schema versioning
- Keep localStorage key: `kontana_state_v1` (backwards compatibility).
- Add `schema_version` field inside the stored object.
- Latest schema: `2`.

## V2 state shape (additive; preserve legacy fields)
Top-level minimum additions:
- `schema_version: 2`
- `settings.app_mode: "precise" | "budget"`
- `settings.budget` subtree (defaults)
- `checkins: []` top-level (not nested in wallet)
- Wallet additions: `balance_minor`, `count_mode`, `budget` subtree

Canonical example:
```json
{
  "schema_version": 2,
  "settings": {
    "app_mode": "precise",
    "budget": {
      "default_cadence": "weekly",
      "week_start": "mon",
      "drift_alerts": { "enabled": true, "abs_minor": 2000, "pct": 0.1 },
      "default_tracking_level": "big_only",
      "default_big_spend_threshold_minor": 2000
    }
  },
  "wallets": [
    {
      "id": "w1",
      "name": "Wallet",
      "currency": "GBP",
      "balance_minor": 0,
      "count_mode": "denoms",
      "denoms": { "10.00": 0, "5.00": 0 },
      "budget": {
        "enabled": false,
        "cadence": "weekly",
        "period_anchor": { "week_start": "mon" },
        "drift_alert_snooze_until_ts": 0,
        "envelopes": [
          {
            "id": "e_food",
            "name": "Food",
            "target_minor": 8000,
            "tracking_level": "big_only",
            "big_spend_threshold_minor": 2000
          }
        ]
      }
    }
  ],
  "checkins": []
}
```

## Money representation
- Standardize new logic on minor units using integer `*_minor` fields.
- If legacy amounts are not already in minor units, add a conversion layer in migration/runtime boundaries.

## Drift categories (minimal)
- `fees`, `food`, `misc`, `transfer`, `loss`, `unknown`
- Default to `unknown` for speed and non-judgmental UX.

## Tracking levels
- `none` (check-ins only)
- `big_only`
- `all` (Precise-style)

## Check-in schema (canonical fields)
Top-level `checkins[]` entries:
- `id`
- `wallet_id`
- `ts` (epoch seconds)
- `period_id` (e.g. `2026-W07`)
- `method`: `"confirm" | "count_total" | "skip" | "quick_reconcile"`
- `expected_minor`
- `actual_minor` (omit or null if skip)
- `drift_minor`
- `drift_breakdown`: array of `{ category, minor }` (single row by default; split optional)
- `note` (optional)

## Wallet budgeting schema
`wallet.budget`:
- `enabled`: boolean
- `cadence`: `"weekly" | "fortnightly" | "monthly"`
- `period_anchor.week_start`: weekday token such as `"mon"`
- `drift_alert_snooze_until_ts` (optional): epoch seconds; local-only snooze horizon for in-app drift alerts
- `envelopes[]`: user-shaped list (no fixed taxonomy)

`count_mode` rule:
- Any balance-only mutation (`quick_reconcile`, `transfer`, `adjustment`) sets `wallet.count_mode = "total"` and marks denomination counts stale until the user re-syncs in Edit denominations.

Envelope:
- `id`
- `name`
- `target_minor`
- `tracking_level`
- `big_spend_threshold_minor`

## Ledger transaction types (add; do not mutate old)
Add minimal new types budgeters need:
- `transfer_out` (source wallet)
- `transfer_in` (destination wallet)
- shared `transfer_id` for transfer pairs
- `adjustment` (drift/loss/unknown, categorized)
- optional `fee` (only if it reduces confusion; otherwise use drift category)

## Migration v1 -> v2 (deterministic)
- Add `schema_version = 2`.
- Derive each wallet `balance_minor` from denomination totals.
- Set `wallet.count_mode = "denoms"`.
- Initialize `wallet.budget.enabled = false` and `wallet.budget.envelopes = []`.
- Add `settings.app_mode = "precise"`.
- Add `checkins = []`.
- Preserve existing ledger semantics unchanged.

## Backups
- On first successful migration, store a one-time backup blob in localStorage:
  - `kontana_state_v1_backup` (local only).
