# /spec/20-workflows.md

## Mode switching and clarity
- Settings includes:
  - “Mode” selector with two options:
    - “Precise (log everything)”
    - “Budget (weekly check-ins)”
- In-app indicator (always visible):
  - Small pill in header: “Precise” or “Budget”
- Switching rules:
  - Switching to Budget does not delete ledger.
  - Switching back to Precise restores full Pay-first behaviour with no loss.

Microcopy:
- Precise mode description:
  - “Track every payment. Best if you want a detailed ledger.”
- Budget mode description:
  - “Check in weekly. Stay near targets without logging everything.”

## Budget onboarding (Budget mode only)
Entry points:
- First time user selects Budget mode.
- Or user taps “Set budgets” on Cash tab.

Flow:
1) Choose wallet to budget (if multiple).
2) Set cadence:
   - Weekly / Fortnightly / Monthly
   - Microcopy: “Pick how often you want to check in. You can change this later.”
3) Create envelopes:
   - Add envelope name + target amount
   - Quick templates (optional): Groceries, Transport, Eating out, Misc
4) Choose tracking level:
   - “No logging”
   - “Big spends only”
   - “Log everything”
   - If “Big spends only”: set threshold (default from settings)
5) Done:
   - Show summary: total targets vs wallet total (if known)
   - Microcopy: “Targets are guides. You can adjust them any time.”

## Weekly check-in flow
Trigger:
- In Budget mode, if `next_checkin_at` is due (or user taps “Check in”).

Screen copy:
- Title: “Weekly check-in”
- Line: “You should have about £X in cash. Do you?”
Buttons:
- “Yes” (no counting)
- “I have more”
- “I have less”
- “I don’t want to count”

Behaviour:
- “Yes”
  - creates check-in type `confirm`
  - drift = 0
  - next_checkin_at updated
- “I have more / less”
  - asks for actual total amount (single input)
  - calculates drift
  - if abs(drift) <= ignore threshold:
    - show: “Small drift. Ignore it?” with options:
      - “Ignore”
      - “Record anyway”
  - drift categorisation step (if recording):
    - “What best explains the difference?”
      - Fees / Food / Misc / Transfer / Loss / Unknown
    - optional note: “Add a note (optional)”
  - apply drift:
    - default suggestion based on category:
      - Transfer -> offer transfer flow
      - Fees -> record fee (optional)
      - Loss/Unknown -> record adjustment
      - Food/Misc -> offer “Budget it next time” (adjust envelope target) + optional quick log
- “I don’t want to count”
  - creates check-in type `skip`
  - next_checkin_at updated
  - show tip: “No worries. A quick check-in later keeps drift small.”

## Quick reconcile (Cash tab)
Goal:
- Allow “adjust total” without denomination precision, while keeping precise reconcile intact.

Entry:
- Cash tab button: “Quick reconcile”
- Only shown in Budget mode (or as optional advanced tool in Precise mode).

Flow:
- Shows expected total and asks:
  - “What’s your total cash right now?”
  - Input: total amount
- After input:
  - drift calculated
  - If drift within ignore threshold: offer ignore.
  - Else: choose classification (same list)
  - Creates:
    - check-in record
    - and/or a ledger adjustment transaction (depending on allocation method)
  - Any balance-only mutation (`quick_reconcile`, `transfer`, `adjustment`) sets `wallet.count_mode = "total"` and should show denominations as stale until Edit denominations is completed.

Guardrails:
- If user is in Precise mode:
  - show warning: “This will reduce denomination accuracy.”
  - require confirm: “Continue”
- If user recently edited denominations:
  - suggest: “You recently reconciled denominations. Quick reconcile may be unnecessary.”

## Lightweight logging (Big spends only)
In Budget mode:
- Pay tab remains available.
- Add “Quick add spend” button in Budget mode:
  - single amount input + optional envelope selection
  - one tap classification (Food/Misc/etc.)
- Rule:
  - if spend amount >= threshold:
    - prompt: “Log this spend?” with Yes/No
  - if < threshold:
    - do nothing (unless user manually logs)

Microcopy:
- Prompt: “Big spend detected. Logging it keeps your envelopes honest.”

## Drift alerts (local-only)
When to alert:
- At app open or Cash tab open, if:
  - abs(drift) > threshold_abs OR abs(drift)/expected_total > threshold_pct
  - and last check-in older than cadence

Alert copy:
- “Your cash may be drifting by about £X.”
Actions:
- “Check in now”
- “Later”

## Pay / Transactions integration in Budget mode
- Pay tab:
  - stays functional
  - emphasise quick add and big-spend prompts (no nagging)
- Transactions tab:
  - add filters:
    - All / Budget adjustments / Transfers / Denomination edits
  - show check-ins as special entries (non-transaction events) or as grouped summaries.

## Assumptions
- Assumption: Cadence is per wallet but defaults from app settings.
