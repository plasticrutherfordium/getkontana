# /spec/40-implementation-plan.md

## Refactor plan (no build-step assumptions)
Goal: modularise progressively while keeping `site/static/app.js` as entrypoint initially.

Proposed folderisation:
- `site/static/app/`
  - `state.js` (load/save/migrate/validate)
  - `money.js` (minor-unit helpers + formatting)
  - `budget/periods.js` (period IDs, cadence, week-start)
  - `budget/checkins.js` (expected vs actual, drift rules)
  - `budget/insights.js`
  - `ledger/tx.js` (tx constructors; transfer/adjustment)
  - `ui/` (render + event wiring by tab)

Keep existing:
- `site/static/lib/strategies.js` becomes the single source of truth.

## Strategy engine unification
- Make `site/static/lib/strategies.js` canonical.
- Remove/disable duplicated strategy code inside `site/static/app.js` once wiring is in place.
- Script-tag environment requirement:
  - expose a browser global API from strategies (for non-bundled pages),
  - and keep ESM exports for tests/tooling compatibility.

## Storage and migrations
- Add `schema_version` and deterministic migration runner.
- Always preserve a pre-migration backup in localStorage once:
  - `kontana_state_v1_backup`.
- localStorage is synchronous and quota-limited:
  - protect every write with try/catch
  - present a graceful error UI if quota exceeded (export + reset options).

## Budget-mode required transaction types
- Transfers:
  - paired `transfer_out` / `transfer_in` with shared `transfer_id`
- `adjustment` (drift + loss/unknown)
- Optional `fee` (only if needed; otherwise use drift category)

## Must-fix gaps before Budget mode ships
- Import flow (JSON):
  - accept v1 + v2
  - run migrations on import
  - preview + explicit choice: replace vs merge
- Remove debug logs in production (or gate behind DEBUG flag)
- Theme key mismatch: fix in migration or settings normalisation

## Optional (off by default)
Retention:
- “Keep full history” (default)
- Or “Keep last N months of transactions/check-ins; keep rolled-up monthly summaries”

## PWA service worker (optional improvement)
- Consider app-shell caching strategy improvements if offline experience is inconsistent, but not required for Budget mode.
