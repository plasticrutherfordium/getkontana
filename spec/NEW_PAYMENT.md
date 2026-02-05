# Payments (Cash Modal)

## Role
- Single entry point for both outgoing and incoming cash transactions.
- Replaces separate add-money flows.

## Defaults
- Default mode: `Outgoing` (unless the selected wallet has 0 total, then default to `Incoming`).
- Mode control: segmented toggle `Outgoing | Incoming`.
- Default wallet from active Cash wallet context (fallback to first wallet).
- Strategy is global-only from `Settings.defaultStrategy` (not selectable per payment).
- Outgoing strategy options: `greedy`, `lex`, `equalisation`.

## Entry Points
- Cash has one money-movement CTA (`Add/Spend money`) that opens an in-app modal.
- The modal contains the full Payments flow (no separate Payments tab).
- Entry from Cash preselects the active wallet and shows a wallet summary (no wallet selector in the modal).
- Mode is selected in the modal via `Outgoing | Incoming` toggle.
- Switching between Incoming and Outgoing preserves the entered Amount and Note/Reference, but clears any denomination allocation or suggestion state.

## Inputs
- Required: amount, denomination allocation.
- Note/reference is optional for both Incoming and Outgoing (max 30 characters).
- Amount and Note/Reference controls follow Cash input styling:
  - rounded control style consistent with app inputs
  - control height aligned with standard inputs (no oversized hero field)
  - label style matches other form labels
- Amount field width is constrained to avoid full-width stretching on desktop (target max-width around 420-520px).
- Amount input must behave like a normal editable field (multi-digit typing, select/replace, paste).
- Amount input must not use browser spinner UI.
- Amount + Note live at the top of a single pill; the breakdown and allocation UI sits below inside the same pill, separated by a divider.
- Cancel only appears after any entry has started, and sits at the bottom of the pill.
- After a transaction is recorded, show only a success banner in mode color (green incoming, red outgoing) plus a compact summary (Date, Wallet, Amount, Note) matching the default Transactions view. Also show the selected wallet summary (flag/name/currency/total) without the mode toggle. Hide the payment mode toggle and the amount/note inputs on this success screen. If change was received, include a `Change` line in the summary showing expected/received. Provide `Go to Transactions` and `New transaction` actions.
- `Go to Transactions` must open the Transactions view filtered to the wallet used for the recorded transaction.

## Allocation Requirement (Both Modes)
- Flow order is fixed:
  1) wallet selection + outgoing/incoming mode
  2) amount first
  3) note/reference
  4) denomination allocation/breakdown
- After amount + note are entered, user allocates denominations.
- Denominations are shown only after amount is entered.
- Suggestions ON: show only denominations `<= amount` and available (count > 0).
- Suggestions OFF (manual mode): show all available denominations (count > 0), even if `> amount`.
- Manual allocation shows `Allocated` vs `Expected` (expected = entered amount).
- The `Allocated / Expected` summary must be prominent and clearly communicate the need to reconcile.
- In manual allocation, denomination availability labels must reflect remaining availability (available minus allocated count).
- When Suggestions are OFF, show the `Allocated / Expected` summary in the breakdown area (no “Suggestions disabled” banner).
- Suggestions ON: denominations that exceed the remaining amount are visually de-emphasized and disabled.
- Suggestions OFF: denominations are never disabled by amount (overpay is allowed; change flow handles it).
- When allocated > expected, show a warning message stating that change will be received.
- If outgoing amount exceeds total wallet cash, show a danger notice and hide denomination allocation (regardless of Suggestions setting).
- Incoming allocation must sum exactly to entered amount.
- Outgoing allocation must be at least entered amount (`allocated >= entered`) to allow non-exact tender with change.
- No partial save.
- Allocation requires exact completion before finalize; navigation is not gated.

## Outgoing Flow
- Keep existing strategy logic (`greedy` / `lex`) and include `equalisation` for assistance.
- Suggestions are computed using global Settings strategy only when Suggestions are ON.
- When Suggestions are OFF, no suggested denominations are shown (manual entry only).
- If exact composition is unavailable, no suggested breakdown is shown (manual entry only).
- In non-exact outgoing, UI must show expected change (`allocated - entered`).
- Suggestion severity surfaces keep semantic colors in both themes:
  - warning (sufficient but not exact) uses amber treatment that remains readable in dark mode
  - danger (insufficient funds) uses red treatment that remains readable in dark mode
- If suggestion is exact, primary action label is `Use and finalize`.
- If suggestion is non-exact, primary action label is `Use suggested`.
- Suggested paid breakdown can be accepted as a one-click starting point and finalized through the outgoing flow.
- When suggestion is active, manual denomination editor remains hidden by default.
- Manual denomination editor becomes available only after explicit user action to reject suggestion (`Edit manually`).
- Bills/Coins toggle and denomination editor are shown only in manual-edit mode.
- Payments form includes explicit pre-submit cancellation action (`Cancel`) to abandon in-progress entry.
- If outgoing is tender-above-amount (change expected), Apply transitions to a required change-confirmation step before transaction is finalized.
- Change-confirmation step requirements:
  - Trigger as a popup/dialog first (expected change + suggested received-change breakdown).
  - User can confirm suggested received change directly in popup.
  - User can reject suggested change and continue to manual received-change entry.
  - Show expected change amount clearly.
  - Provide default suggested change breakdown.
  - Allow override/edit of received change denominations only after choosing manual path.
  - Editable change denomination list must be constrained to denominations `<= expectedChange`.
  - Manual received-change popup starts with zero counts (no prefilled suggestion).
  - Manual received-change popup supports Bills/Coins switching where applicable.
  - Final confirmation requires `receivedChangeTotal == expectedChange`.
  - If Payment strategies are OFF or Change suggestions are OFF, skip suggested change and go directly to manual received-change entry.
- Outgoing final confirmation records one `outgoing` transaction and updates counts.
## Revert Safety
- Only the most recent transaction in the app can be reverted.
- Revert action lives in Transactions (not inside the payment modal).
- Reverting removes that transaction and restores wallet denominations to pre-transaction state.

## Incoming Flow
- Incoming defaults to suggestion-first flow (no change logic).
- If a valid incoming suggestion exists, primary action label is `Use and finalize`.
- Incoming manual denomination editor is hidden by default and shown only after explicit `Edit manually`.
- Incoming manual mode starts with zero counts.
- User allocates incoming denominations exactly to amount.
- Incoming final confirmation records one `incoming` transaction and updates counts.

## Blocking Rules
- Payments is blocked if Cash Edit Mode is active.
- Cash actions are blocked while allocation modal/step is incomplete.

## Denomination UI Parity With Cash
- Breakdown card uses the same Bills/Coins tab pattern as Cash.
- Denomination rows keep explicit `Denomination × Count = Subtotal` semantics.
- Row control structure mirrors Cash: stable count controls with `- input +` and matching spacing/alignment.
- Manual allocation count inputs must be visually prominent and easy to read.
- Payments does not show last outgoing/incoming summaries.
