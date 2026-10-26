<!-- SPDX-License-Identifier: MPL-2.0 -->
# Transactions

Canonical behavior: [APP_SPEC.md](APP_SPEC.md#transactions-and-retention). Presentation: [DESIGN_SPEC.md](DESIGN_SPEC.md#transactions).

Transactions / Movimientos displays the selected wallet's complete saved ledger. Cards select wallet context, preserve order, and scroll horizontally on mobile. There is no combined multi-currency total.

## Summary and rows

Three summary panels display all-time money in, all-time money out, and the current wallet balance. Inflow/outflow sum signed ledger deltas, including opening adjustments and transfers. A full-history/on-device caption replaces expiry messaging.

The ledger has Description, Amount, and Balance columns, grouped by day and sorted newest first. A short note can be the title; otherwise the type supplies a title. Time and a short note form secondary text. Amount direction is signed and colored; the entire row has a quiet neutral surface. Balances are computed over the complete ledger in chronological order before reverse sorting.

Pointer, Enter, or Space expands a row to reveal timestamp, direction, strategy, paid denomination breakdown, change, note/category, and relevant check-in/transfer links. Zero-delta denomination-edit records expose before/after compositions. Only the latest transaction in the wallet offers Revert; confirmation restores its effects and removes that record.

## Budget summaries

Budget mode can show the current cadence period, check-in completion/drift, a small recent-check-in list, and top logged spends. View full ledger opens every saved transaction; a summary control returns to the period dashboard. These presentation limits never trim stored history.

## Retention and backups

There is no 30-day limit, age-based deletion, record-count cap, expiry warning, or deletion countdown. All transactions/check-ins remain on this device until explicitly removed. Reverting an entry, deleting its wallet, or resetting local data removes the corresponding records; clearing browser storage removes local state. JSON backup/import preserves all history. PDF includes the full transaction ledger. Browser storage capacity is finite; storage failures trigger recovery rather than deletion of old entries.
