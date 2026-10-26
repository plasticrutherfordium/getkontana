<!-- SPDX-License-Identifier: MPL-2.0 -->
# Technical decisions

Current architecture: Hugo templates/content with vanilla browser JavaScript; no React, Tailwind, or hosted app service is required. Canonical references are [APP_SPEC.md](APP_SPEC.md) and [DESIGN_SPEC.md](DESIGN_SPEC.md).

- Core code uses MPL-2.0 file-level copyleft. Preserve third-party notices and earlier MIT permissions. Independent future paid code needs its own explicit terms; no Premium functionality or billing is active. See [OPEN_CORE_SPEC.md](OPEN_CORE_SPEC.md).
- Local state remains `localStorage` under `kontana_state_v1`, schema 2. No redesign migration is needed. Recovery backup remains `kontana_state_v1_backup`.
- Complete transaction/check-in history persists without age/count pruning. Browser quota is handled as a storage error, not as permission to discard history.
- Existing integer minor-unit math, canonical currency mappings, ledger/check-in helpers, and strategy algorithms remain in place.
- Website translations are Hugo language siblings, with marketing strings in `site/data/website.json`; the app retains its existing translation dictionary. `kt-language` shares explicit preferences across surfaces.
- Shared head applies theme before paint. `kt-theme` and legacy `theme` remain aligned with app appearance. Dark is default; Light is a complete alternative.
- `kt-terminal.css` owns shared tokens/primitives. `landing.css` owns marketing layout. `app-phosphor.css` owns the redesign above an `app-base` cascade layer containing legacy control mechanics.
- Fonts and PDF library are local assets. Core flows do not require third-party font/library requests or financial-data uploads.
- Service worker uses network-first/cached fallback and precaches both app locales, fonts, styles, helpers, and original brand assets. Updates wait for explicit reload; activation cleans old shell caches without touching local application state.
- Dialog keyboard/focus support is shared in `app/accessibility.js`; money movement is still committed by existing confirmation handlers.
- Only latest-per-wallet reversal is offered, avoiding inconsistent historical cash edits. Incoming allocations must match exactly; outgoing overpayment must reconcile through explicit change confirmation.
- Retired waitlist backend files remain for compatibility; the redesigned website/app offer immediate use and no signup form.

Automated coverage exercises the financial/state helpers and history persistence. Browser release checks exercise the integrated Hugo output and rendered desktop/mobile screens; see [RELEASE_VERIFICATION.md](RELEASE_VERIFICATION.md).
