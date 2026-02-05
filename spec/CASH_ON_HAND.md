# Cash

## Naming
- Sidebar label: `Cash`.
- Screen header: `Cash`.

## Empty State
If there are no wallets:
- Show one prominent message: `No wallets yet. Create your first wallet to start tracking cash.`
- Show create-wallet control prominently.
- Do not show duplicate headings.

## Wallet Selector
- Wallet selector is horizontal wallet cards (not dropdown).
- Card fields: flag, currency code, wallet name, wallet total.
- Selecting a card switches active wallet immediately.
- Selector lists existing wallets.
- Wallet cards can be dragged to reorder. The order persists and is shared with Transactions.
- On mobile, the wallet cards row scrolls horizontally; cards do not shrink and the rest of the page remains full-width.
- Wallet row should never cause the page content to shrink; only the wallet row scrolls horizontally.

## Cash Layout and Actions
- Remove Cash header top-right wallet CTA button.
- Wallet creation is triggered from a dedicated `+` wallet card shown as the last card in the wallet selector row.
- Clicking the `+` wallet card opens an in-app modal to create a wallet (no inline panel).
- If wallet count is already 4, keep the `+` wallet card visible; clicking it shows an in-app modal that maximum wallets are reached.
- Create-wallet currency selector ordering:
  - Priority first: `EUR`, then `USD`.
  - Remaining currencies listed alphabetically after a clear visual separation.
- Under wallet cards, show one primary money-movement CTA (label can be `Add/Spend money`) that opens the payment modal.
- Do not show separate `New payment` and `Add money` buttons in Cash.
- Money-movement CTA preselects the active wallet and opens the payment modal in Outgoing by default.
- If the active wallet total is 0, the modal opens in Incoming instead.
- Secondary actions: `Edit wallet`, `Delete wallet`.
- `Edit wallet` opens a modal with clear actions to either edit the wallet name or edit denominations.

## Totals
- No oversized standalone total hero.
- Wallet card displays wallet total.
- Denomination section has bottom total row labeled `Bills total` or `Coins total` depending on the active tab, and shows the total count for that tab.

## Denominations View
- Split by Bills/Coins toggle; only one category shown at a time.
- If currency only has one category, hide the toggle.
- Row semantics must be explicit: `Denomination × Count = Subtotal`.
- Denomination rows use equal column widths for Denomination, Count, and Subtotal to avoid cramped labels.
- Row presentation must clearly distinguish denominations the user has vs missing denominations.
- Zero-count denominations are always visually de-emphasized by default.
- Default (not in Edit Mode): denomination rows are static/read-only.
- Default (not in Edit Mode): do not show editable count controls (`- input +`) inline.
- Denominations come from canonical per-currency mapping only.
- Cash includes a minimal inline toggle in the denominations section to hide zero-count rows (show only denominations you have). No Settings control.

## Edit Mode
### Entry
- Entry requires in-app modal (not browser confirm).
- `Edit wallet` modal offers:
  - `Edit name` which opens an in-modal name prompt.
  - `Edit denominations` which leads to a confirmation prompt.
- Confirmation copy:
  - Title/body prompt: `Edit denominations instead of entering a transaction?`
  - Buttons: `Cancel`, `Enter edit mode`

### Active UI
- Show clear `Edit mode active` status.
- Show what is blocked (all except Settings).
- Show reconciliation line: `Allocated: X / Expected: Y`.
- Show a full-width reconciliation status pill directly tied to reconciliation state:
  - unreconciled state uses a strong danger treatment (red container/pill)
  - reconciled state uses a strong success treatment (green container/pill)
- Show one clear mismatch message:
  - `You're short by X`, or
  - `You're over by X`.
- In Edit Mode only, denomination rows expose stable controls `[-] [count input] [+]`.
- In Edit Mode, count input supports normal editing behaviour: multi-digit typing, selection, replace, paste.
- Show `Reason (optional)` input at start of edit mode.
- Show `Finish edit` and `Cancel edit` next to each other.

### Behaviour
- While active, navigation/actions are gated except Settings; Cash money-movement CTA is disabled.
- Finish enabled only when `Allocated == Expected`.
- Cancel discards edits and restores pre-edit counts.
- Finishing records transaction:
  - `type: denominations_edited`
  - `amount: 0`
  - optional note from reason.
- Non-zero adjustment from edit mode is disallowed; user must use a proper transaction flow instead.
