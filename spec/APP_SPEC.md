# Kontana App Specification (MVP)

## Table of Contents
- [Scope](#scope)
- [Global Rules](#global-rules)
- [Screens](#screens)
- [Supporting Specs](#supporting-specs)
- [Non-goals](#non-goals)

## Scope
Kontana is a local-first cash wallet tracker for physical cash, denomination counts, and transactions.

## Global Rules
- Maximum wallets: 4 total across the whole app.
- Wallet shape: `{ id, name, currency, denominations, transactions }`.
- Currency catalogue is fixed to: `EUR USD GBP CLP SEK CHF HUF DKK NOK PLN CAD ARS PEN BRL MXN CZK RON CNY JPY INR SGD KRW EGP ZAR NGN XOF AUD NZD`.
- Denominations come from one canonical mapping keyed by currency.
- Wallet expected balance is transaction-derived.
- Denominations total must always reconcile to expected balance.
- All cash movement must be represented by transactions (`incoming`, `outgoing`, `transfer`, `loss`, `adjustment`, `denominations_edited`).
- Direct denomination editing is allowed only in controlled Edit Mode.
- Edit Mode and payment allocation enforce exact reconciliation; no partial save.
- Edit Mode and allocation enforce exact reconciliation; no partial save.
- All confirmations use in-app modals (no browser `confirm`/`prompt`/`alert`).
- In-app modals close on outside click and on Escape (desktop).
- Cancel actions are neutral (not red). Red is reserved for destructive actions (Delete/Revert/etc.).
- Transactions older than 30 days are auto-deleted.
- Transactions are viewed per wallet (no "all wallets" view).
- Retention banner is dismissible for 5 days (persisted locally).
- Revert is allowed only for the latest transaction per wallet.
- App sidebar brand uses logo only (no surrounding pill/callout copy).
- Mobile layout (<= 768px):
  - Sidebar is hidden.
  - Bottom navigation bar is fixed to the bottom with tabs: Cash | Pay | Trx (Pay centered).
  - Settings is accessed via a top-right gear icon in the header.
  - Settings gear icon is a large tap target.
  - Settings opens as an overlay (popup) and closes on outside click and Escape; includes a Close (X) control.
  - Pay is visually emphasized in the mobile bottom nav.
  - Content has bottom padding to avoid overlap with the bottom nav.
  - Wallet cards row scrolls horizontally; page content does not shrink or scale.
  - No global horizontal scrolling; only the wallet cards row can scroll horizontally.
  - Wallet cards row is clipped inside its container (no overflow into other sections).
- PWA support:
  - Provide `manifest.webmanifest` with app name, icons, theme color, and `display: standalone`.
  - Register a service worker for basic offline caching of app shell/assets.
  - Use the site favicon as the app icon.
  - App page header shows the logo on mobile only; desktop relies on the sidebar brand.

## Screens
- Cash: `spec/CASH_ON_HAND.md`
- Pay: `spec/NEW_PAYMENT.md`
- Transactions: `spec/TRANSACTIONS.md`
- Settings: `spec/SETTINGS.md`

## Supporting Specs
- Data model: `spec/DATA_MODEL.md`
- Algorithms: `spec/ALGORITHMS.md`
- Privacy and security: `spec/PRIVACY_SECURITY.md`
- Technical decisions: `spec/TECH_DECISIONS.md`
- Acceptance tests: `spec/ACCEPTANCE_TESTS.md`

## Non-goals
- User accounts or multi-user support.
- Device sync in MVP.
- Bank/open-banking connections.
- Import in MVP.
