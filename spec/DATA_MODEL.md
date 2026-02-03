# Data Model

## Entities

### Denomination
- `value` (number, required): face value in minor units (e.g. cents).
- `label` (string, required): display label (e.g. “€5”).
- `count` (integer, required): non-negative quantity on hand.

### Transaction
- `id` (string, required): unique identifier.
- `created_at` (string, required): ISO 8601 timestamp.
- `amount` (number, required): payment amount in minor units.
- `strategy` (string, required): `greedy` or `lex`.
- `paid_breakdown` (array, required): list of `{ value, count }` used for payment.

### Settings
- `currency` (string, required): default `EUR`.
- `denom_set_id` (string, required): identifier for the selected set.
- `lex_mode` (boolean, optional): whether to prefer `lex` by default.

## Storage
- Preferred: IndexedDB for structured records and larger data.
- Acceptable for v0: localStorage due to simplicity and tiny dataset.
- Rationale: the MVP dataset is small (dozens of denominations and a 30-day transaction window).

## Retention and Purge Job
- Purge transactions older than 30 days on app load.
- Purge transactions older than 30 days after each successful payment.
- Deletion is based on `created_at` compared to “now” in local time.
