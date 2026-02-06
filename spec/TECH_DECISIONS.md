# Technical Decisions

## Product Rules Enforced in Architecture
- Single canonical denomination mapping keyed by currency is the only denomination source.
- Transaction-led accounting drives wallet expected balances.
- Denomination totals must reconcile to expected balances.
- Max 4 wallets globally.

## Storage
- Local-first persistence (IndexedDB preferred; localStorage acceptable for early MVP).
- No backend required for core flows.
- Export remains explicit and user-triggered.

## UI Decisions
- Wallet selection uses horizontal cards.
- Mobile UI:
  - Bottom nav replaces sidebar.
  - Wallet row is horizontally scrollable; no global scaling or shrinking of content.
- PWA:
  - Use a web manifest and service worker for installability.
  - Reuse the site favicon as the PWA icon.
- Cash prioritizes wallet cards, in-context create wallet, a Bills/Coins totals row, and explicit denomination math rows.
- Edit denomination actions are isolated behind explicit Edit Mode with reconciliation gating.
- Cash denomination rows are read-only by default and become editable only inside Edit Mode.
- Cash exposes one money-movement CTA to enter Payments (instead of separate New payment/Add money buttons).

## Payment Decisions
- Payments supports both outgoing and incoming in one screen.
- Cash-to-Payments navigation always lands in Payments with active wallet preselected; mode is chosen on Payments.
- Payments entry controls (Amount/Strategy/Note) intentionally reuse Cash form sizing and spacing conventions; no oversized hero-style amount field.
- Payments denomination breakdown mirrors Cash bills/coins tab and row-control layout for consistency.
- Outgoing assistance supports `greedy`, `lex`, and `equalisation` strategies.
- Strategy is configured globally in Settings and applied in Payments (no per-payment strategy picker).
- For sufficient-but-not-exact outgoing cases, Payments provides strategy-based tender suggestion and expected change instead of showing no suggestion.
- Outgoing suggestion is the default interaction; manual denomination editing is revealed only after explicit "Edit manually".
- Outgoing tender-above-amount uses an explicit popup confirmation for suggested change, with optional manual fallback before finalizing transaction.
- Suggested tender/change breakdowns are accelerators; user can accept or override before final confirmation.
- Revert safety rule: only the most recent transaction per wallet is reversible to avoid non-linear ledger edits.
- Final payment completion requires user allocation confirmation:
  - incoming must be exact
  - outgoing can be exact or tender-above-amount with change

## Testing Priorities
- Unit tests for strategy outputs, status classification, and retention countdown.
- Integration tests for edit/allocation gating, transaction recording, and column-toggle constraints.
