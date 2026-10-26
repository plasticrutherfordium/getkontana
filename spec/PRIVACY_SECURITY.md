<!-- SPDX-License-Identifier: MPL-2.0 -->
# Privacy and Security

## Principles
- Local-first by default.
- No background sync in MVP.
- No third-party analytics in MVP.

## Optional Future Services
- MCP and camera AI are exploratory and not active data-processing services.
- Any future cloud feature requires explicit opt-in and a feature-specific privacy disclosure before data/images leave the device. Core operation must remain available without that service.
- A local MCP bridge does not guarantee on-device AI processing; the chosen assistant may send selected data to its model provider.

## Data Handling
- Wallets, denominations, transactions, and settings are stored locally.
- No newsletter/waitlist form is offered in the redesigned UI. Legacy local signup fields remain compatible with old backups.
- Fonts and PDF library are served locally. No third-party analytics or cash-data upload requests are used.
- Exports are user-initiated only (JSON/PDF).

## Retention and Deletion
- Transactions and check-ins have no time-based retention limit.
- Kontana never automatically prunes history by age or record count.
- History stays on the device until the user explicitly removes the corresponding data. Clearing browser storage also removes local data.
- Storage capacity is determined by the browser. If a write fails, preserve existing data and offer export/recovery instead of deleting old entries to make room.

## Logging
- Error logs must not include denomination counts, payment notes, transaction breakdowns, or personal identifiers.
- Logs may contain only generic error codes and app version metadata.

## Threat Model
- In scope: accidental leakage through logs, exports, and UI state.
- Out of scope: compromised device, malware, physical theft.
