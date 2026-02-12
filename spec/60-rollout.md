# /spec/60-rollout.md

## Rollout (staged, PR-sized)
Phase 1: Foundations
- `schema_version:2`
- migration runner + backup key
- money minor-unit helpers
- import/export safety (v1+v2)

Phase 2: Budget mode surface area
- Settings mode toggle + header pill
- Budget settings (cadence, week_start, drift thresholds, tracking defaults)
- Budget onboarding wizard (envelopes + tracking level)

Phase 3: Reconciliation loop
- Weekly check-in (all branches)
- Quick reconcile (total-only)
- Adjustments linked to check-ins

Phase 4: Budgeter essentials
- Transfer UI (paired tx)
- Loss/Adjustment UI
- Quick spend (big-only)
- Period summaries (“This period”, “Last period”)

Phase 5: Hardening + optional upgrades
- Refactor: extract modules + dedupe strategies
- Debug log gating/removal
- Optional retention controls (off by default)
- Optional service worker improvements for offline resilience

## Backwards compatibility rules
- Keep storage key `kontana_state_v1`.
- Schema version determines migrations.
- Never mutate legacy ledger semantics; only add new tx types.

## Safety and failure modes
- Migration failure:
  - do not overwrite existing state
  - show: “We couldn’t upgrade your data safely.”
  - actions: export / reset
- Import failure:
  - validate first; no partial writes
  - preview + explicit replace/merge choice

## Privacy posture
- No accounts.
- No external analytics by default.
- Drift alerts are in-app/local only (no push required).
- Exports are sensitive; warn users and keep local-first.
