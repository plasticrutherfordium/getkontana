# Transactions

## Scope
- Shows retained transaction history (last 30 days).
- Transactions are shown per wallet via a wallet-card selector (no "all wallets" view).

## Default Row View (Collapsed)
Transactions are presented as a bank-style ledger list (table-like layout, calm and readable).
Columns:
- Description (left, wide)
- Amount (right-aligned)
- Balance (right-aligned)

Description cell content:
- Primary label (human readable)
  - Incoming default: `Cash in`
  - Outgoing default: `Payment`
  - If note exists and is short, the note may be used as the title and the secondary line omitted.
- Secondary line (muted): note text when not used as the title.
- Compact time only (24h) shown next to or under the title.

Amount column:
- `+` for incoming (green)
- `-` for outgoing (red)
- Currency shown inline (e.g., `+€120.00`)

Balance column:
- Shows wallet balance after the transaction
- Neutral styling (no green/red)

Row styling:
- Subtle row tint for incoming (greenish) and outgoing (reddish)
- Subtle hover and selected states (no heavy fills)

## Filters
- Default view is the first wallet in the wallet order.
- Clicking a wallet card filters to that wallet only.
- Ordering is `created_at` descending within the selected wallet.

## Day Grouping
- Transactions are grouped by day with a header:
  - `Today`
  - `Yesterday`
  - Long date like `5 Feb 2026`
- Sorting remains newest-first visually.
- Full timestamp remains available in expanded details.

## Wallet Header (Sticky)
- Show a sticky header directly above the transactions table.
- Header shows selected wallet name + currency and the current wallet balance (same as wallet card).
- Optional secondary line can include `Based on N transactions` or be omitted.
- Header updates immediately when:
  - a different wallet is selected
  - a transaction is added/edited/deleted for that wallet

## Running Balance
- Running balance is computed per wallet and shown in the right-most `Balance` column.
- Balance is neutral (not green/red).
- Computation:
  - Use the wallet’s transactions in chronological order (oldest → newest).
  - Apply each transaction’s delta to compute the balance after that transaction.
  - Display those “after” balances in the current (newest-first) list order.
  - If two transactions share the same timestamp, use a stable tie-break (e.g., id).

## Type Visibility
- Must surface transaction types including: `incoming`, `outgoing`, `transfer`, `loss`, `adjustment`, `denominations_edited`.
- `denominations_edited` rows are audit-style (`amount = 0`) and may include edit reason note.

## Details View (Expanded)
- Row is clickable to expand (no separate Details button).
- Expanded view appears as a full-width row under the transaction.
- Expanded view shows a calm label → value list (not a table).
- Fields shown:
  - Full timestamp (DD/MM/YYYY 24h)
  - Direction (incoming / outgoing)
  - Strategy used
  - Full denomination breakdown
  - Change given/received
  - Note only if not already shown in the row

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
