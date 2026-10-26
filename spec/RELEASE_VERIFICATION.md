<!-- SPDX-License-Identifier: MPL-2.0 -->
# Redesign implementation verification

Date: 26 October 2026. App version 0.1.1. Checked against the Phosphor design and [APP_SPEC.md](APP_SPEC.md) / [DESIGN_SPEC.md](DESIGN_SPEC.md).

## Automated checks

- `npm run build`: passed with Hugo 0.167.0 Extended; English and Spanish generated successfully, no template/deprecation warnings.
- `npm test`: passed all 12 test files.
- `node --test --test-isolation=none`: **71 tests passed, 0 failures**.
- JavaScript syntax checks: app, Pay UI, website interactions, dialog accessibility, and service worker.
- `git diff --check`: passed.
- Original `kontana-logo3.svg` and `favicon-kontana3.png`: unchanged. Currency ISO catalogue and denomination/strategy constants remain unchanged.

The history regression tests preserve transactions spanning 1990–2026 and linked check-ins through storage reload at a simulated year 2100, legacy migration, and JSON backup/import. No application retention/pruning rule is introduced. Existing service-worker tests had contradictory activation expectations; they now consistently require explicit user-requested activation/reload.

## Integrated Chromium checks

Repeatable command: `python3 scripts/smoke-ui.py --base-url http://127.0.0.1:1327 --driver-url http://127.0.0.1:9515` against an isolated Hugo preview and ChromeDriver 153. The script creates its own fresh browser profile and fixture data; it does not access the user's browser data. All checks passed.

| Area | Result |
| --- | --- |
| Website localization | English/Spanish headings, localized app links, corresponding translation routes |
| Website appearance | Both themes at 320px, 390px, and 1440px; no page-wide horizontal overflow |
| First use | Empty state and actual wallet creation through the UI |
| Exact payment | EUR 24.50 from EUR 324.50 → EUR 300.00; correct note/coin tender |
| Non-exact payment | EUR 6.50 tendered with EUR 10.00; EUR 3.50 change confirmation; preview/cancel leave balance untouched; commit produces EUR 293.50 |
| Reversal | Latest transaction reversal restores EUR 300.00 |
| Full history | Opening cash from 1990 remains visible; all-time totals and chronological running balances remain correct |
| Details | Ledger row expands as a full-width table row |
| Export/import | JSON contains full old history; PDF binary generated; confirmed JSON Replace restores the saved state |
| Cash editing | Multi-digit input retains focus; mismatch disables Finish; Cancel restores original counts/balance |
| Budget | Real EUR 25.00 linked spend against EUR 100.00 envelope → 25% recorded-spending bar / EUR 75.00 remaining; check-in saves successfully |
| Settings | Section switching, shared theme preference, Spanish app labels, 320/390px app width |
| Offline | Both app routes, fonts, helper scripts, and new styles cached; Spanish app reload succeeds with Chromium network disabled and retains EUR 300.00 |
| Runtime errors | No severe browser console errors during the online integrated run |

Screenshots from the verification run are written to `/tmp/kontana-ui-smoke/`. The script can regenerate them at any time; these contain illustrative fixture data only. Desktop marketing, wallet, payment, backup and Budget screenshots and Spanish light mobile screens were visually inspected. The editable design remains in `design/new-kontana-design.pen`.

## Changes found during verification

Fixed the removed-newsletter handler still trying to bind to a nonexistent form, old wallet-wrapper double borders, boxed read-only count styling, keyboard focus loss during denomination editing, and Escape handling after typing. PDF reports now use unchanged currency ISO codes for unambiguous amounts and derive tender from the recorded breakdown when no legacy paid-amount field exists. The redesigned app no longer relies on a third-party PDF fallback.

## Device-specific follow-up

Desktop Chromium validation is complete. Native PWA installation, iOS download/share behavior, and the existing mobile platform-authenticator control need physical-device checks; they were not claimed as validated here. The browser's storage quota and device loss remain relevant, so the app explains JSON backups without promising infinite physical storage.

The pre-release verification did not deploy. Its isolated test server/browser processes were stopped, leaving any pre-existing development server running. Production release follows [DEPLOYMENT.md](../DEPLOYMENT.md).

## MPL-2.0 and free-core update

Approved model: free MPL-2.0 core with separate exploratory paid extras. GitHub repository visibility was checked through the connector and is public. The working tree was not yet pushed or deployed at the time of those checks. The subsequent commit/deployment is a separate authorized release step.

Updated the root licence, package/lock metadata, source SPDX headers and JSON/design sidecar/REUSE annotations. Preserved the prior MIT notice, original brand/PDF/font bytes and third-party licences; shipped local copies of the notices. Added contributor/licensing/branding guidance and [OPEN_CORE_SPEC.md](OPEN_CORE_SPEC.md).

English/Spanish website hero, FAQ, supporting pages, metadata and footer now scope the forever-free promise to the core, identify MPL-2.0 and link to source/licensing. General settings and the desktop sidebar identify the same model. MCP/camera/Premium are explicitly exploratory and unavailable. The live Pencil canvas and exported design previews use the new copy.

The extended browser smoke check passed both languages/themes at 320/390/1440px, public source/local licence links, future-feature disclosures, and offline Spanish licensing pages, while retaining payment, change/reversal, backup restore, Budget and history checks. Screenshots: `/tmp/kontana-open-core-ui/`. The service worker is now `kontana-v21` and caches core licensing and third-party notices.

The licensing audit passed: root and served MPL text match, package/lock metadata agree, the original MIT notice is preserved byte-for-byte, original logo/isotype/PDF bundle bytes are unchanged, 66 application/test/template source files carry SPDX notices, and every precached path exists in the production build. Rendered design FAQ, footer and sidebar sections were visually checked; the canvas inspector reports false clipping flags for newly inserted text even though exports render it correctly.

At verification time the native `.pen` editor still held unsaved changes. The Pencil connector exposes canvas mutation/export but no Save operation, and no computer-use surface is available. Updated PNG previews are persisted; saving the open native design tab with Ctrl+S is the remaining editor action. No encrypted `.pen` content was read or rewritten through filesystem tools.
