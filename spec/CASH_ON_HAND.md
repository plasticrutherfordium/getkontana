<!-- SPDX-License-Identifier: MPL-2.0 -->
# Cash

Current implementation: [APP_SPEC.md](APP_SPEC.md#cash-in-precise-mode). Presentation: [DESIGN_SPEC.md](DESIGN_SPEC.md#cash).

## Wallet context

Cash / Efectivo opens on the active wallet, falling back to the first saved wallet. Cards display the original currency flag, unchanged ISO code, name, and full balance. The selected card has an accent border/surface and an ellipsis menu. Pointer and keyboard selection change context across Cash, Pay, and Transactions. Drag reordering persists. The final plus/label card opens wallet creation; maximum 20 wallets, name maximum 18 characters. Empty app state has one welcome message and a prominent creation button.

Wallet actions are Rename, Edit denominations, and Delete wallet. Creation/rename/delete use in-app dialogs. Deletion requires confirmation. Cash money movement is handled through Pay rather than separate inline Add/Spend forms.

## Inventory

Inventory uses labelled Denomination / Quantity / Subtotal columns. Quantity is explicit (for example, “1 bill”, “2 bills”, “3 coins”), without ambiguous glyphs or multiplication markers. Read-only rows are grouped into “In your wallet” followed by “Not in your wallet”. Each group follows the configured denomination order; a caption explains the order. Zero rows show a readable zero quantity and zero subtotal rather than low-opacity text.

Notes/coins can be split or combined according to Settings. Tabs show the number of physical bills/coins held, not the number of denomination types. Hide empty removes the unavailable group from the view without deleting counts. An empty group explains that no bills/coins are held, and an empty wallet still shows the inventory. The footer is labelled Bills total / Coins total (or Total for the combined view); it totals that complete group. The wallet card totals the complete wallet. Editing shows all denominations in the selected tab, including zero rows, regardless of Hide empty.

Desktop places real wallet-check and latest-activity panels beside inventory. Smaller screens stack them. Total-only Budget wallets warn that denomination counts need a real count. Reconciliation status is calculated, never an unconditional decorative success message. Latest activity has no age cutoff.

## Controlled editing

Editing requires confirmation. Counts become minus/input/plus controls and the draft shows allocated amount versus ledger-expected amount. Finish remains disabled while these differ. Keyboard editing retains focus and caret after count changes. Cancel discards the draft. Finish saves counts and appends a zero-delta `denominations_edited` record with before/after breakdowns. This flow changes composition only; incoming/outgoing/adjustment flows change the amount owned. Navigation is gated during editing, with Settings still accessible.

## Budget presentation

Budget mode preserves wallet data and adds setup, check-in, quick reconciliation, and existing drift actions. Envelope targets show current-period remaining values and recorded-spending bars. Only explicitly envelope-linked outgoing/spend records in that cadence period count toward a target. Unlogged spending is not estimated. A period change changes the summary without deleting old entries.
