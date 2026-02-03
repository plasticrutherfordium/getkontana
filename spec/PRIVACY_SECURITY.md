# Privacy and Security

## Principles
- Data stays on the device; no server usage by default.
- No third-party analytics in MVP.
- If analytics are added later, they must be privacy-friendly and strictly opt-in.

## Error Logging
- If error logging exists, it must not include denominations, payment amounts, or identifiers.
- Logs must only contain generic error codes and app version metadata.

## Export and Import
- Export/import is user-initiated via explicit file download/upload.
- No background uploads or silent sync.

## Threat Model
- Out of scope: device compromise, malware, or physical theft.
- In scope: accidental data leakage via logs, diagnostics, or export/import mishandling.
