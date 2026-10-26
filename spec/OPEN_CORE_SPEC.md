<!-- SPDX-License-Identifier: MPL-2.0 -->
# Open-source core and optional paid extras

Decision approved 26 October 2026; current app version 0.1.1. This document updates earlier blanket no-paid-tier promises. It defines the commercial/licensing direction, not a shipped Premium implementation.

## Current release

The core is free forever and open source under Mozilla Public License 2.0 (`MPL-2.0`). All currently implemented core features stay free: wallets, incoming/outgoing payments, denomination strategies, Precise/Budget modes, local transaction/check-in history without expiry, JSON export/import, PDF reports, local settings and recovery. Existing wallet/currency constraints are product behavior, not paid upsells. No account, subscription, network AI or Premium entitlement is required to use the core.

There is no active Premium plan, checkout, billing system, MCP endpoint, camera capture pipeline or AI service in this release. Never make a disabled/unimplemented purchase button look functional. Free-core/source/licence information is visible in both website languages, website metadata/footer, app sidebar and General settings. The source repository is public: <https://github.com/plasticrutherfordium/getkontana>.

## Licence boundaries

MPL-2.0 applies to current first-party source files and their distributed modifications. The full official text is `LICENSE` and the web-served `/licenses/MPL-2.0.txt`; source headers/sidecars and `REUSE.toml` identify coverage. Accompanying first-party docs/design source use the same licence, subject to the explicit exceptions in [LICENSING.md](../LICENSING.md).

New separate components containing no MPL-covered code may use their own licence, including proprietary terms. A future private module must not copy covered code and label it proprietary. Shared core changes remain MPL. When distributing a combined app, preserve access to the covered source and its notices. Browser-delivered code is distributed code; a private repository alone does not change those obligations. Pure server use does not create an MPL network-source obligation. The policy is based on [Mozilla's MPL FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/), especially questions 11, 16 and 17.

Earlier MIT releases keep their existing permissions and the original notice is preserved in `LICENSES/MIT-legacy.txt`. Fonts, PDF libraries, theme and legacy artwork/icons retain their own terms. Branding does not imply endorsement of forks. Contributors retain copyright and contribute covered core changes under MPL; no proprietary relicensing rights are assumed. There is no CLA or copyright-assignment requirement.

## Exploratory Premium services

| Candidate | Proposed behavior | Current status |
| --- | --- | --- |
| MCP connection | Let a compatible assistant query selected wallets/history and prepare proposed entries; commit changes only after user confirmation | Exploratory; not implemented |
| Managed AI | Optional hosted inference/convenience with its own disclosed terms, pricing and privacy behavior | Exploratory; no provider or billing chosen |
| Camera-assisted counting | Detect visible notes/coins and propose denominations/counts for user review; start with a limited evaluated currency set | Exploratory; no trained/evaluated model or accuracy claim |

A remote MCP server cannot directly read browser-local storage: implementation needs an explicit local bridge or opt-in authenticated connection. A local bridge does not prevent a cloud assistant from receiving selected data. Camera access needs permission; image upload requires an explicit choice and disclosure. Prefer on-device inference where feasible; do not promise offline AI until supported devices/models are validated. Confirmed results must pass the existing denomination, ledger and reconciliation rules; preview/cancellation must never mutate cash records. Counting visible cash is not a banknote-authenticity guarantee.

Future service activation requires its own implementation/spec review, data flow and retention disclosure, authorization, pricing and cancellation terms. Payment-processor/provider secrets belong on the server. Client-delivered proprietary code can be inspected by users; a UI-only entitlement check is not a secure paid-service boundary. Do not add a proprietary empty module or paywall to this core release as a substitute for the missing services.

## Copy contract

English: **Free core. Forever. Open source.** Spanish: **App principal gratis. Para siempre. Código abierto.** Always identify MPL-2.0 near source/licence information. Optional paid extras may follow; MCP and camera counting are exploratory and unavailable.

Scope no-account/no-subscription/on-device claims to the current core. Remove unqualified promises that there will never be paid tiers or that all future features will be free. Keep unlimited local history and backup access explicit. Update the editable `.pen`, exported previews, live templates, app translations, metadata, README, supporting pages and specs together when these promises change.

## Release checks

Confirm canonical licence text matches the web-served copy, package/lock metadata agree, first-party code has SPDX notices, and vendored fonts/PDF/brand assets retain their bytes/notices. Build both website languages. Check source/licence links, planned-feature wording, responsive layout and settings without losing the existing payment/offline/history behavior. Cache local licence pages for offline app access.
