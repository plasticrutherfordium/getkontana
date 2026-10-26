<!-- SPDX-License-Identifier: MPL-2.0 -->
# Kontana — application specification

Status: implemented, version 0.1.3 (26 October 2026). This is the product behavior reference. [DESIGN_SPEC.md](DESIGN_SPEC.md) defines presentation. The numbered Budget documents describe the original workflow decisions; this document takes precedence where an earlier proposal conflicts with the shipped interface.

## Product promise

Kontana tracks physical cash on the user's device. **The core is free, forever, and open source under MPL-2.0.** Wallets, payments, budgets, complete local history, backups/import and reports do not require an account, subscription or purchase. The same core features work in both themes and languages, with no bank connections or advertisements.

Optional paid extras may be offered separately. MCP connections, managed AI services and camera-assisted note/coin counting are exploratory, not shipped functionality. There is no active Premium entitlement, billing, checkout or availability date. Separate future components may have other explicit terms while covered core files remain MPL-2.0. See [OPEN_CORE_SPEC.md](OPEN_CORE_SPEC.md) and [LICENSING.md](../LICENSING.md).

The application imposes no age or record-count limit on transaction or check-in history. There is no 30-day purge, expiry message, or retention countdown. Browser storage capacity still applies. Clearing browser storage, removing the browser profile, or losing the device can remove local data; JSON backups are the recovery mechanism. Kontana never deletes old entries to make room for a new one.

## Entry, language, and appearance

| Surface | English | Spanish |
| --- | --- | --- |
| Website | `/` | `/es/` |
| App | `/app/` | `/es/app/` |
| Supporting pages | `/about/`, `/faq/`, `/privacy/`, `/terms/`, `/open-source/` | Corresponding `/es/…/` routes |

The website language selector opens the equivalent translated page. A fresh app follows the page language, or an explicitly saved language preference. Existing app language settings are preserved unless the user selects another language on the website or in Settings. `kt-language` stores an explicit shared preference; the app also stores `settings.language` in its state.

Dark is the first-visit default. Light and dark are complete themes, available through the website header or app Settings. Theme selection applies before first paint and persists across website/app navigation and reloads. `kt-theme` and the legacy `theme` key stay aligned with `settings.appearance`. Neither preference changes financial data.

## Application structure

Three sections: Cash / Pay / Transactions, translated as Efectivo / Pagar / Movimientos. Desktop uses a left sidebar; screens at or below 768px use a floating bottom navigation. A persistent top bar contains the original Kontana logo, local-storage indicator, and Settings button. The mode pill opens General settings at the mode selector.

App sections share the selected wallet. Navigation normally preserves wallet context. Controlled denomination editing gates navigation until finished or cancelled. Payment drafts are temporary; only confirmed transactions persist. Settings is an overlay, with General, Payment assistance, and Data & backup sections. Dialogs support keyboard focus containment, close controls, Escape, and clicking the backdrop; a foreground confirmation takes precedence over Settings.

## Wallets and currency

- Up to four wallets, each with a trimmed name of 1–18 characters and a fixed currency.
- The supported catalogue remains `EUR USD GBP CLP SEK CHF HUF DKK NOK PLN CAD ARS PEN BRL MXN CZK RON CNY JPY INR SGD KRW EGP ZAR NGN XOF AUD NZD`. Currency ISO codes, existing denomination mappings, logo, and isotype are unchanged.
- New wallets start at zero. Record an incoming payment to add cash.
- Wallet cards show flag, ISO code, name, and actual balance. Selection works with pointer or keyboard. Reordering by drag persists in `wallet_order` and applies across all sections.
- The final “New wallet” card opens creation. Attempting a fifth wallet explains the limit in a dialog.
- The active wallet's ellipsis opens rename, edit denominations, and delete actions. Destructive operations require confirmation. Wallet deletion removes that wallet and its associated ledger entries.
- Currency totals are never added across wallets with different currencies. Amounts are integer minor units; presentation follows the selected language and existing currency scaling rules.

## Cash in Precise mode

Cash displays wallet cards, inventory, and a wallet-check/latest-activity panel. On smaller screens the supporting panels follow the inventory.

Inventory has Denomination / Quantity / Subtotal column labels, explicit quantities (“2 bills”, “3 coins”), and separate “In your wallet” / “Not in your wallet” groups. Both groups follow the configured order, explained above the list. Zero quantities remain readable. Notes/coins tabs show physical item counts, and their footer explicitly labels Bills total / Coins total. “Hide empty” filters the unavailable group without deleting data. Empty groups and wallets explain the absence of cash. The wallet card always shows the complete wallet balance. Editing exposes zero denominations regardless of the visibility filter.

Ordinary inventory is read-only. Editing requires choosing Edit denominations and confirming entry. The edit draft exposes minus/count/plus controls, allocated total, ledger-expected total, and difference. Finish is enabled only when denomination total equals the expected balance. Finish records a zero-value `denominations_edited` event with before/after counts; Cancel discards the draft. This flow changes composition, never the amount of money owned.

The wallet check uses real ledger/count state. It shows a stale-count warning for total-only wallets, and never presents estimated denomination counts as a confirmed count. Latest activity comes from the selected wallet's actual newest record, with no age cutoff. Empty wallets explain how to add cash.

## Pay

Pay handles incoming and outgoing cash. It starts from the active wallet; a zero-balance wallet defaults to Incoming. Wallet cards remain available above the mode selector. Switching direction clears allocation while retaining useful amount/note input.

Entry contains amount, optional note (maximum 30 characters), and category. Amount uses decimal input without browser spinners, accepts dot/comma entry, and preserves separators, fractional zeros, editing order and caret. EUR allows up to two decimal places; configured whole-unit currencies such as JPY reject fractions. Extra precision is rejected rather than reinterpreted as a larger amount. The precision hint and keyboard follow the selected currency; Show cents controls presentation only. Numbers follow the app language. The breakdown always sits below the fields in a maximum 880px workspace; note and category share a row on desktop and stack on mobile. Invalid/empty amounts show guidance; no transaction can be recorded from an incomplete allocation.

### Outgoing

1. Enter amount, optional note, and category.
2. If assistance is enabled, compute tender from actual available denominations using the global strategy and coin preferences.
3. An exact suggestion offers “Use and finalize”. Manual editing is always available.
4. Tender above the purchase amount offers “Use suggested” and opens a change confirmation. Suggested or manually entered change must equal the expected change before anything is committed.
5. Deduct tender, add received change, and append one outgoing record whose net delta is the purchase amount negated.

Insufficient cash produces a clear error and prevents finalization. Manual outgoing counts cannot exceed availability. A cancelled change dialog leaves wallet balances and history untouched.

### Incoming

Allocate the notes/coins received, using a suggestion or manual counts. The allocation must equal the entered amount before confirmation. Manual counting may derive the incoming amount from the count when that existing entry mode is selected. Confirmation adds denominations and one incoming record.

### Completion and reversal

Completion shows actual date, wallet, signed amount, note, category, and expected/received change where relevant. Offer New transaction and Revert transaction. Reversal is limited to the latest transaction in the affected wallet and restores its cash effects. Historical records cannot be independently edited in ways that break the ledger.

## Budget mode

Budget mode reduces routine counting while keeping the same local wallets and ledger. Switching modes does not discard data.

The onboarding wizard chooses a wallet, check-in cadence, envelope targets, and tracking coverage. The starting balance is the existing wallet balance; use an incoming payment or reconciliation to set cash. Supported cadences are weekly, fortnightly, and monthly. Envelopes contain named targets in the wallet's currency. Cash shows target, remaining amount, and a progress bar for the current period. Only outgoing/spend records explicitly assigned to that envelope reduce its remaining amount; the UI states this basis. Unlogged spending is not inferred. An overspent envelope keeps the negative remaining amount and a warning treatment.

Budget actions include quick spend, same-currency wallet transfer, adjustment, scheduled check-in, and quick reconciliation. Quick spend records the amount/category/note and optional envelope. Transfers create paired ledger entries; adjustments record a signed delta. Total-only changes mark denomination counts stale until a real count reconciles them.

Check-in choices are confirm the expected total, enter an actual total, or skip counting. A mismatch records the actual/expected amounts, drift and explanation when confirmed, with a linked ledger adjustment where needed. Small drift can be ignored explicitly. Reminders and drift alerts follow cadence/threshold/snooze preferences; they do not imply a background cloud service.

The Transactions summary may show the current period and a small set of recent check-ins/top spends. “View full ledger” opens complete history. These summaries never trim stored records. See [20-workflows.md](20-workflows.md) and the tested Budget helper modules for detailed calculations.

## Transactions and retention

Transactions are scoped to the selected wallet, newest first, grouped by calendar day. Every saved entry remains reachable, including opening balances and entries older than 30 days. Rows show description, signed amount, and running balance; expansion reveals the underlying details and any allowed latest-record reversal.

Three summary values use the full wallet ledger: money in (sum of positive deltas), money out (absolute sum of negative deltas), and current wallet balance. They are explicitly labeled all time. Opening adjustments and transfers are included in the direction of their delta. Running balances accumulate the complete ledger chronologically before display sorting. Check-in summaries and period filters do not redefine retention.

## Settings and data ownership

| Section | Controls |
| --- | --- |
| General | Precise/Budget mode; complete Light/Dark themes; English/Español; existing device-dependent biometric lock control; free-core/Premium availability wording, source link and MPL-2.0 licensing link |
| Payment assistance | Suggestions on/off; Minimise (`greedy`), Preserve (`lex`), Balance (`equalisation`); single-cover overpayment; change suggestions; coin rules; denomination ordering; notes/coins grouping; cents display |
| Data & backup | Full-history explanation; Export JSON; Export PDF; Import JSON; confirmed Delete all data |

Disabling suggestions also disables dependent coin/change suggestions. The three strategy implementations and their cash math remain unchanged. Red indicates destructive actions or errors; cancelling is neutral.

JSON export contains the complete application state, including settings, wallets, transactions, check-ins, and budgets. It is the restorable backup. PDF is a human-readable wallet/transaction report, not a restore file. Import validates JSON, recognizes legacy state, previews counts, and offers Merge or Replace. Merge reports wallet-ID collisions; Replace requires an additional confirmation. Existing raw state is backed up before migration/import. Unsupported schemas or failed storage writes show recovery/export controls rather than overwriting usable data.

Delete all data requires the explicit confirmation token `DELETE ALL DATA` and resets local app state. It does not delete previously exported files. No launch/waitlist signup form is offered by the redesigned site or app; previous locally saved signup fields remain compatible with old backups.

The existing biometric control depends on browser/platform authenticator support and is not storage encryption. Physical-device/WebAuthn validation is separate from the desktop browser checks for this release.

## Persistence, offline behavior, and updates

State remains under `kontana_state_v1`, schema version 2, with `kontana_state_v1_backup` for recovery. No redesign migration or new account is required. Denomination math, migration, import/export, check-in calculations, and ledger helpers retain their existing module boundaries.

The service worker precaches both app-language routes, shared/site/app CSS, original brand assets, all local fonts, PDF library, and app helper scripts. It uses network-first retrieval with cached fallback. After a successful initial load/cache install, the app works offline on the same origin/device. Production installation requires HTTPS (localhost is supported during development). A newly installed worker waits; an update notice offers explicit reload or dismissal. Refreshing does not clear local financial state.

Scripts and styles use release-specific `?v=` URLs in HTML, dynamic imports, and the offline precache. Worker installation bypasses the browser HTTP cache so a new cache cannot be seeded with stale release files. Static JS/CSS responses request revalidation (`Cache-Control: no-cache`), and worker update checks bypass HTTP cache. Returning to a visible tab or reconnecting also checks for an update. Settings reports the version of the running JavaScript, rather than trusting the HTML metadata. No update clears localStorage or automatically reloads an active draft.

The app makes no cash-data upload requests. Fonts and PDF dependencies are served locally. Export only creates a user-requested file. Browser cache and local application state are distinct; service-worker cache replacement never purges history.

## Verification

Automated checks cover money parsing, denomination integrity, strategies, ledger operations, Budget onboarding/check-ins/insights, migration, import/export, worker contracts, and history preservation through save/reload, migration, and backup/import across decades. UI release checks cover both languages/themes, responsive navigation, wallet creation, exact/non-exact payment, cancellation/reversal, full old history, exports, settings, and offline reload. See [RELEASE_VERIFICATION.md](RELEASE_VERIFICATION.md) for the recorded implementation checks.
