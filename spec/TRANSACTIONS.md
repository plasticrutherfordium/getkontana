# Transactions

## Scope
- Shows retained transaction history (last 30 days).
- Transactions are shown per wallet via a wallet-card selector (no "all wallets" view).
- Mobile navigation uses the `Trx` tab label (Pay is a separate tab).

## Default Row View (Collapsed)
Transactions use a bank-like ledger table.
Columns (only):
- Description (title + optional note + time)
- Amount (right-aligned, signed)
- Balance (right-aligned, running balance after each transaction)

Row content:
- Title is always present:
  - Incoming: `Cash in`
  - Outgoing: `Payment`
  - Other types: `Adjustment`
- If note is short, it may be used as the title and the note line can be omitted.
- Time is shown in 24h format under the title.
- Note is shown as a secondary muted line when present (truncate to 30 chars; note input enforces max 30).
- Amount uses `+` for incoming, `-` for outgoing, and includes the currency symbol inline.

Row styling:
- Entire row is subtly tinted green for incoming and red for outgoing.
- Balance remains neutral.

## Filters
- Default view is the first wallet in the wallet order.
- Clicking a wallet card filters to that wallet only.
- Ordering is `created_at` descending within the selected wallet.

## Day Grouping
- Group rows by day with a header row:
  - `Today`
  - `Yesterday`
  - `5 Feb 2026` (short day+month+year)
- Sorting remains newest-first in the rendered list.

## Wallet Header (Sticky)
- Show a sticky header directly above the transactions table.
- Header shows selected wallet name + currency and the current wallet balance (same as wallet card).
- Optional secondary line can include `Based on N transactions` or be omitted.
- Header updates immediately when:
  - a different wallet is selected
  - a transaction is added/edited/deleted for that wallet

## Wallet Row Behaviour
- Wallet cards row scrolls horizontally and never shrinks the rest of the page.

## Running Balance
- Display a Balance column.
- Balance for each row is the wallet balance after applying that transaction.
- Compute balances in chronological order, then display them on the newest-first list.

## Type Visibility
- Must surface transaction types including: `incoming`, `outgoing`, `transfer`, `loss`, `adjustment`, `denominations_edited`.
- `denominations_edited` rows are audit-style (`amount = 0`) and may include edit reason note.

## Details View (Expanded)
- Each row is clickable to expand (no separate Details column).
- Expanded view appears as a full-width row under the transaction (within the table).
- Expanded view shows a calm label → value list (not a table).
- Fields shown:
  - Full timestamp (DD/MM/YYYY 24h)
  - Direction (incoming / outgoing)
  - Strategy used
  - Full denomination breakdown
  - Change given/received
  - Note (full, even if truncated in row)

## Revert Rule
- Only the latest transaction **per wallet** (by created_at) may be reverted.
- Revert action appears at the bottom of the expanded details.
- Applies to all transaction types including:
  - incoming
  - outgoing
  - denominations_edited adjustments

## Retention Banner
Must explicitly show:
- `Transactions older than 30 days are deleted automatically.`
- How many transactions are deleted next.
- Days remaining until next deletion window.
- Prompt to back up/export from Settings (no buttons in the banner).
- Appears above the wallet cards.
- Has a close (×) button.
- When closed, remains hidden for 5 days (persisted locally).
  - Close control is a pill button with red-hover treatment (matches negative buttons).

## Retention Enforcement
- Auto-delete transactions older than 30 days.
- Export is user-initiated.
- No import in MVP.
