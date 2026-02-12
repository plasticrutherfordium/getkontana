# /spec/30-ui-changes.md

## Mode switch pattern
- Settings: “App mode” selector
  - “Precise (log everything)”
  - “Budget (check-ins + envelopes)”
  - Help text: “You can switch any time. Your data stays on this device.”
- Persistent header pill:
  - “Precise mode” / “Budget mode”
  - Tap -> opens Settings mode section.

## Cash tab
Precise mode:
- Unchanged.

Budget mode additions:
- Wallet card shows:
  - Envelope list summary (target + remaining this period)
  - Card: “Check-in due” (or “Next check-in: <date>”)
  - Buttons:
    - “Set up envelopes” (if none)
    - “Check in now”
    - “Quick reconcile”
- Badge when `count_mode="total"`:
  - “Denoms not counted” (denoms stale).

## Pay tab
Budget mode:
- Primary block:
  - “Quick spend”
  - “Transfer”
  - “Loss / Adjustment”
- “Advanced” divider:
  - existing Pay out/in + change flow + strategy-based suggestions (unchanged).

Precise mode:
- Unchanged.

## Transactions tab
Budget mode:
- Default: “This period” summary + check-ins list + drift-by-category chips.
- One-tap access to full ledger (existing UI).

Precise mode:
- Unchanged.

## Budget onboarding UI (wizard)
- Lightweight multi-step modal/screen:
  1) Wallet selection
  2) Cadence
  3) Envelope templates + editable list
  4) Tracking level + threshold (if big-only)

## Microcopy rules
- Avoid shame framing.
- Defaults:
  - “No judgement.”
  - “Reset and carry on.”
  - “Budgets drift.”
