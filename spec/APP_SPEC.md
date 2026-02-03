# Kontana App Specification (MVP)

## Scope
The MVP is a local-first cash-on-hand tracker that manages denominations and suggests exact-payment breakdowns.

## Screens
A) Cash On Hand
- Shows a denomination table with value, label, and count.
- Shows subtotal per denomination and a grand total.
- Allows editing counts in-place.

B) New Payment
- Input: amount.
- Strategy selector: `greedy` or `lex`.
- Shows suggested breakdown (value × count) if exact payment is possible.
- “Apply payment” deducts counts and records a transaction.

C) Transactions
- Shows transactions from the last 30 days only.
- Each row shows date/time, amount, strategy, and breakdown summary.

D) Settings
- Currency (default `EUR`).
- Denomination set (select from presets or custom values).
- Export/Import JSON (user-initiated).
- Delete all data.

## Non-goals
- User accounts or multi-user support.
- Syncing between devices.
- Bank connections or open banking.
- “Make change” or exchange calculation.
- Analytics by default.

## Retention
- Transactions are auto-deleted if older than 30 days.
