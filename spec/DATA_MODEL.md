# Data Model

## Fixed Currency Catalogue
Allowed currencies only: `EUR USD GBP CLP SEK CHF HUF DKK NOK PLN CAD ARS PEN BRL MXN CZK RON CNY JPY INR SGD KRW EGP ZAR NGN XOF AUD NZD`.

## Wallet Ordering
- `wallet_order`: array of wallet IDs that defines the display order of wallet cards.
- Persisted globally and shared by Cash and Transactions.

## Canonical Denomination Mapping (Single Source of Truth)
All denomination rows come from one in-app mapping keyed by currency.

Rules:
- Wallet creation derives denominations from `canonicalMapping[wallet.currency]`.
- Rendering and persistence normalize against the same mapping.
- No secondary denomination source is allowed.

Canonical values (major units):
- `EUR`: 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01
- `USD`: 100, 50, 20, 10, 5, 2, 1, 0.50, 0.25, 0.10, 0.05, 0.01
- `GBP`: 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01
- `CLP`: 20000, 10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1
- `SEK`: 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1
- `CHF`: 1000, 200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10, 0.05
- `HUF`: 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5
- `DKK`: 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.50
- `NOK`: 1000, 500, 200, 100, 50, 20, 10, 5, 1
- `PLN`: 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01
- `CAD`: 100, 50, 20, 10, 5, 2, 1, 0.50, 0.25, 0.10, 0.05, 0.01
- `ARS`: 20000, 10000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1
- `PEN`: 200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10
- `BRL`: 200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.25, 0.10, 0.05
- `MXN`: 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.50
- `CZK`: 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1
- `RON`: 500, 200, 100, 50, 20, 10, 5, 1, 0.50, 0.10, 0.05, 0.01
- `CNY`: 100, 50, 20, 10, 5, 1, 0.50, 0.10
- `JPY`: 10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1
- `INR`: 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.50
- `SGD`: 1000, 100, 50, 10, 5, 2, 1, 0.50, 0.20, 0.10, 0.05
- `KRW`: 50000, 10000, 5000, 1000, 500, 100, 50, 10
- `EGP`: 200, 100, 50, 20, 10, 5, 1, 0.50, 0.25
- `ZAR`: 200, 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10
- `NGN`: 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.50
- `XOF`: 10000, 5000, 2000, 1000, 500, 200, 100, 50, 25, 10, 5, 1
- `AUD`: 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10, 0.05
- `NZD`: 100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10

Canonical bills/coins split (major units):
- `EUR` bills: 500, 200, 100, 50, 20, 10, 5
- `EUR` coins: 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01
- `USD` bills: 100, 50, 20, 10, 5, 2, 1
- `USD` coins: 0.50, 0.25, 0.10, 0.05, 0.01
- `GBP` bills: 50, 20, 10, 5
- `GBP` coins: 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01
- `CLP` bills: 20000, 10000, 5000, 2000, 1000
- `CLP` coins: 500, 100, 50, 10, 5, 1
- `SEK` bills: 1000, 500, 200, 100, 50, 20
- `SEK` coins: 10, 5, 2, 1
- `CHF` bills: 1000, 200, 100, 50, 20, 10
- `CHF` coins: 5, 2, 1, 0.50, 0.20, 0.10, 0.05
- `HUF` bills: 20000, 10000, 5000, 2000, 1000, 500
- `HUF` coins: 200, 100, 50, 20, 10, 5
- `DKK` bills: 1000, 500, 200, 100, 50
- `DKK` coins: 20, 10, 5, 2, 1, 0.50
- `NOK` bills: 1000, 500, 200, 100, 50
- `NOK` coins: 20, 10, 5, 1
- `PLN` bills: 500, 200, 100, 50, 20, 10
- `PLN` coins: 5, 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01
- `CAD` bills: 100, 50, 20, 10, 5
- `CAD` coins: 2, 1, 0.50, 0.25, 0.10, 0.05, 0.01
- `ARS` bills: 20000, 10000, 2000, 1000, 500, 200, 100, 50, 20
- `ARS` coins: 10, 5, 2, 1
- `PEN` bills: 200, 100, 50, 20, 10
- `PEN` coins: 5, 2, 1, 0.50, 0.20, 0.10
- `BRL` bills: 200, 100, 50, 20, 10, 5, 2
- `BRL` coins: 1, 0.50, 0.25, 0.10, 0.05
- `MXN` bills: 1000, 500, 200, 100, 50, 20
- `MXN` coins: 10, 5, 2, 1, 0.50
- `CZK` bills: 5000, 2000, 1000, 500, 200, 100
- `CZK` coins: 50, 20, 10, 5, 2, 1
- `RON` bills: 500, 200, 100, 50, 20, 10, 5, 1
- `RON` coins: 0.50, 0.10, 0.05, 0.01
- `CNY` bills: 100, 50, 20, 10, 5, 1
- `CNY` coins: 0.50, 0.10
- `JPY` bills: 10000, 5000, 2000, 1000
- `JPY` coins: 500, 100, 50, 10, 5, 1
- `INR` bills: 500, 200, 100, 50, 20, 10
- `INR` coins: 5, 2, 1, 0.50
- `SGD` bills: 1000, 100, 50, 10, 5, 2
- `SGD` coins: 1, 0.50, 0.20, 0.10, 0.05
- `KRW` bills: 50000, 10000, 5000, 1000
- `KRW` coins: 500, 100, 50, 10
- `EGP` bills: 200, 100, 50, 20, 10, 5, 1
- `EGP` coins: 0.50, 0.25
- `ZAR` bills: 200, 100, 50, 20, 10
- `ZAR` coins: 5, 2, 1, 0.50, 0.20, 0.10
- `NGN` bills: 1000, 500, 200, 100, 50, 20, 10, 5
- `NGN` coins: 2, 1, 0.50
- `XOF` bills: 10000, 5000, 2000, 1000, 500
- `XOF` coins: 200, 100, 50, 25, 10, 5, 1
- `AUD` bills: 100, 50, 20, 10, 5
- `AUD` coins: 2, 1, 0.50, 0.20, 0.10, 0.05
- `NZD` bills: 100, 50, 20, 10, 5
- `NZD` coins: 2, 1, 0.50, 0.20, 0.10

Constraint note:
- CLP has no 50,000 or 100,000 note. Maximum note is 20,000.
- Some real-world denominations can exist in both formats over time (e.g., 1-unit/2-unit or 20-unit in some currencies). For MVP, each face value is mapped to exactly one canonical type to avoid duplicate rows.

## Wallet
`Wallet = { id, name, currency, enabled, denominations, transactions, createdAt, updatedAt }`

Constraints:
- Maximum 4 wallets globally.
- `currency` is from fixed catalogue.
- `name` is user-defined.

Visibility:
- Selector shows only visible wallets.
- `visible = wallet exists in local state`.

## Denomination Row
`DenominationRow = { valueMinor, type, count }`

Rules:
- `type`: `bill` | `coin`.
- `type` is defined explicitly by the canonical currency mapping (no generic value-threshold heuristic).
- `count` is integer `>= 0`.
- Direct edits are allowed only in Edit Mode draft.

## Transaction
`Transaction = { id, walletId, currency, createdAt, type, amountMinor, deltaMinor, note?, breakdown?, strategy?, changeAmountMinor?, changeBreakdown?, tag? }`

`type` allowed values:
- `incoming`
- `outgoing`
- `transfer`
- `loss`
- `adjustment`
- `denominations_edited`

Rules:
- Every cash movement must be a transaction.
- For outgoing non-exact payments:
  - `amountMinor` is requested amount.
  - `breakdown` is paid/tendered denominations.
  - `changeAmountMinor` records expected/received change.
  - `deltaMinor` remains net wallet change (requested amount impact).
- `expectedBalance(wallet) = sum(deltaMinor of retained wallet transactions)`.
- `denominationsTotal(wallet) = sum(valueMinor * count)`.
- Reconciliation invariant: `denominationsTotal == expectedBalance`.

## Edit Session (Ephemeral)
`EditSession = { walletId, startedAt, snapshot, draft, reason?, expectedBalanceMinor }`

Rules:
- Entered only after explicit in-app modal confirmation.
- `snapshot` is immutable pre-edit counts.
- `draft` holds temporary counts while editing.
- Finish allowed only when draft total equals expected balance.
- Cancel discards draft and restores snapshot.
- On finish, always record audit transaction:
  - `type = denominations_edited`
  - `amountMinor = 0`
  - `deltaMinor = 0`
  - optional `note` uses reason.
- Non-zero reconciliation adjustment is not allowed in Edit Mode.

## Payments Allocation Session (Ephemeral)
`AllocationSession = { walletId, mode, amountMinor, note, allocatedBreakdown, allocatedTotalMinor }`

Rules:
- Applies to both outgoing and incoming.
- Incoming completion requires `allocatedTotalMinor == amountMinor`.
- Outgoing completion requires `allocatedTotalMinor >= amountMinor`.
- While incomplete, navigation is gated except Settings.

## Outgoing Change Confirmation Session (Ephemeral)
`OutgoingChangeSession = { walletId, requestedAmountMinor, paidBreakdown, expectedChangeMinor, receivedChangeBreakdown, strategy, note }`

Rules:
- Created only when outgoing allocation implies `expectedChangeMinor > 0`.
- Transaction is not finalized until change session is confirmed.
- `receivedChangeBreakdown` is editable and constrained to denominations `<= expectedChangeMinor`.
- Finalization requires `sum(receivedChangeBreakdown) == expectedChangeMinor`.

## Settings
`Settings = { defaultStrategy, theme, txColumns, launchUpdatesQueue? }`

## Retention
- Keep transactions for 30 days.
- Auto-delete transactions older than 30 days.
