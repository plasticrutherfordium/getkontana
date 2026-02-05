# Settings

## Required Controls
- Suggestions (global On/Off).
  - This is the top-level toggle for all suggestion features.
  - Helper: Suggestions show recommended denominations; you still confirm or edit manually.
  - When OFF, no denomination suggestions are shown in the payment modal (manual entry only).
  - When OFF, coin usage and change suggestions are disabled.
- Payment strategy selector (`greedy`, `lex`, or `equalisation`) shown as selectable strategy pills/cards when Suggestions are ON.
  - Helper: Defines how suggestions are calculated.
  - Strategy selection must include a clear plain-language explanation card for each option.
  - `greedy`: fast heuristic that takes as many units as possible in the current ordering.
  - `lex`: optimal bounded change (min overpay, then min items, then ordering tie-break).
  - `equalisation`: optimal bounded change with a balance tie-break on remaining counts.
- Coins rules (global, only when Suggestions are ON):
  - Toggle: `Avoid coins` (default OFF).
  - When enabled, user must choose one of:
    - `Avoid coins entirely`
    - `Prefer notes where possible. Coins used only if needed to pay exactly (or to make change).`
- Change suggestions for overpay (global, only when Suggestions are ON):
  - Helper: Suggests a change breakdown when overpaying; when OFF, change is manual-only.
  - Toggle: `Change suggestions` On/Off.
  - When OFF, change is always entered manually in the confirmation step.
  - When ON, suggested change is offered with an option to enter manually.
- Theme selector: Light / Dark (configured only in Settings within the app).
  - Match the app theme to the website (`light` / `dark`).
  - Persist to local theme preference so website/app stay visually aligned.

## Data and Recovery
- Export JSON.
- Export PDF.
- No import for now.
- Delete all local data.

## Launch-news Signup
- Collected directly in-app.
- No external redirect.
- Local capture required; optional endpoint sync if configured.

## Cross-page Effects
- Strategy initializes Payments suggestions globally.
- Zero-count denominations are always de-emphasized on Cash by default (no Settings toggle).
