# Privacy and Security

## Principles
- Local-first by default.
- No background sync in MVP.
- No third-party analytics in MVP.

## Data Handling
- Wallets, denominations, transactions, and settings are stored locally.
- Launch updates signup data is captured locally in MVP.
- Exports are user-initiated only (JSON/PDF).

## Retention and Deletion
- Transaction retention window is 30 days.
- Automatic local cleanup deletes transactions older than 30 days.
- UI must clearly warn users before scheduled cleanup and encourage export.

## Logging
- Error logs must not include denomination counts, payment notes, transaction breakdowns, or personal identifiers.
- Logs may contain only generic error codes and app version metadata.

## Threat Model
- In scope: accidental leakage through logs, exports, and UI state.
- Out of scope: compromised device, malware, physical theft.
