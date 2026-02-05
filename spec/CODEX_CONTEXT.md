# Codex Context Snapshot

Date: 2026-02-05

## Current State (What Was Changed)
- Settings redesigned:
  - No default wallet, no currency catalogue, no global behavior section.
  - Strategy selection is done via clickable strategy cards (Greedy / Lex / Equalisation) with explanations.
  - Appearance remains as Light/Dark toggle in Settings.
  - Export section contains only export actions (no “No import in MVP.” copy).
- Cash:
  - Create wallet CTA moved to a `+` wallet card at the end of the wallet row.
  - Clicking `+` opens inline create wallet form; if already 4 wallets, shows modal.
  - Denomination rows show “Have” vs “Missing” badges; zero-count rows are always de-emphasized.
- Payments:
  - Suggestion warning/danger cards in dark mode use improved amber/red treatments.
- Dark mode visual polish:
  - Improved button, status pill, and table zebra colors.
  - Edit mode reconciliation colors adjusted for dark mode readability.

## Currency Catalogue (Expanded)
Added currencies: `CZK RON CNY JPY INR SGD KRW EGP ZAR NGN XOF AUD NZD`

Rules implemented:
- Currency picker ordering: `EUR`, then `USD`, then all others in alphabetical order, separated by an `optgroup` label.

Files updated for currencies:
- `src/pages/app.astro` (SUPPORTED_CURRENCIES, flags, denominations, bill/coin splits, zero-decimal list, currency option rendering)
- `spec/APP_SPEC.md`, `spec/DATA_MODEL.md`

## Important Logic Changes
- Removed `default_wallet_id`, `enabled_currencies`, `denomination_order`, and `deemphasise_zero_denominations` from settings.
- Active wallet is now derived from current Cash selection (fallback to first wallet).
- Denomination ordering is fixed to largest-first in UI and logic.

## Files Most Recently Touched
- `src/pages/app.astro`
- `src/styles/app.css`
- `spec/SETTINGS.md`
- `spec/CASH_ON_HAND.md`
- `spec/NEW_PAYMENT.md`
- `spec/ACCEPTANCE_TESTS.md`
- `spec/DATA_MODEL.md`
- `spec/APP_SPEC.md`

## Build Status
- `npm run build` passes.

## Known UX TODOs / Pending Review
- User requested spacing cleanup across the app (done globally, but validate visually).
- Dark mode still may need additional tweaks if new screenshots show issues.

## How To Resume
1. Start from latest screenshot in `/home/javier/Pictures/Screenshots`.
2. Check `spec/CODEX_CONTEXT.md` plus specs for alignment.
3. Ensure any new UI requests are updated in `spec/**` first, then applied in `src/**`.
