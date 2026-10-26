<!-- SPDX-License-Identifier: MPL-2.0 -->
# Payments

Canonical behavior: [APP_SPEC.md](APP_SPEC.md#pay). Presentation: [DESIGN_SPEC.md](DESIGN_SPEC.md#pay). Algorithm details remain in [ALGORITHMS.md](ALGORITHMS.md).

Pay / Pagar is the single entry point for precise incoming/outgoing cash. It preserves the active wallet, provides wallet cards and an Outgoing/Incoming selector, and defaults a zero wallet to Incoming. Amount, optional note (30 characters), category, and denomination allocation form one workspace. The breakdown always follows the fields vertically, including count-first incoming payments. The form is at most 880px wide. On desktop, the note and category share one row; on mobile they stack.

Amount accepts a dot or comma without browser spinners. Editable values keep a trailing separator and zeros (`24.` → `24.5` → `24.50`) and omit grouping separators to avoid editing ambiguity. EUR accepts up to two decimal places; configured whole-unit currencies such as JPY reject decimal separators. Extra fractional digits and malformed separators are rejected without changing the draft. A precision hint and decimal/numeric keyboard match the selected currency. The display-cents preference never disables fractional input. Input and money formatting follow the selected app language (English or Spanish). The prominent amount field and normal-size note/category controls use the shared visual system. Until the amount is valid, the breakdown provides guidance. Direction changes clear the allocation while retaining amount/note. Cancel resets the draft. Drafts do not alter cash or history.

## Outgoing

Suggestions use actual wallet denominations, global strategy (`greedy`, `lex`, `equalisation`), denomination order, overpayment, and coin settings. Exact suggestions offer Use and finalize. Edit manually reveals count controls. Outgoing counts cannot exceed actual availability. Insufficient cash blocks confirmation.

Tender may exceed the purchase amount only through the change flow. Use suggested opens a dialog showing expected and suggested change, with Confirm suggested, Enter manually, and Cancel. Manual received change must equal the expected amount. Nothing is deducted before confirmation. Commit deducts tender, adds change received, and records one outgoing transaction with the net negative purchase delta and both breakdowns. Cancelling leaves the wallet untouched.

## Incoming

Incoming allocation must sum exactly to the amount before recording. Suggested/manual denomination counting is supported. In the existing count-first manual entry mode, the incoming amount is derived from the allocation. A retained outgoing amount is ignored in this mode and never caps the incoming count. Incoming counts are not limited by previous holdings. Manual rows label denomination, quantity, and subtotal; outgoing availability is written explicitly. Count inputs retain focus and caret through multi-digit typing. Confirmation adds the allocation and one incoming transaction.

## Completion

The completion view replaces entry controls with actual saved date, wallet, signed amount, category, optional note, and expected/received change where applicable. Actions are New transaction and Revert transaction. Revert is allowed only for that wallet's latest transaction and restores cash effects.

The algorithms, integer minor-unit math, cash constraints, and existing change-confirmation rules remain unchanged by the redesign. Zero-count inventory and saved history are never automatically removed.
