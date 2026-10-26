<!-- SPDX-License-Identifier: MPL-2.0 -->
# Settings

See [APP_SPEC.md](APP_SPEC.md#settings-and-data-ownership) for the canonical behavior and [DESIGN_SPEC.md](DESIGN_SPEC.md#settings-and-dialogs) for layout.

Settings opens through the top-right gear on desktop/mobile. The mode pill opens General focused on mode selection. It is a centered desktop dialog and full-height mobile sheet with three section buttons. Close, backdrop click, and Escape dismiss it; keyboard focus is contained and returns to the trigger. A foreground confirmation has priority over Settings.

| Section | Controls |
| --- | --- |
| General | Precise/Budget mode, Light/Dark theme, English/Español, platform-dependent biometric lock; source/licence links and exploratory Premium disclosure |
| Payment assistance | Suggestions; strategy; single-cover overpayment; change suggestions; coin preference; denomination ordering; notes/coins split; cents display |
| Data & backup | No-expiry/full-local-history explanation; JSON export; PDF report; JSON import; Delete all data |

Suggestions are global. When disabled, dependent coin/change suggestions are disabled. Strategy setting IDs remain `greedy`, `lex`, and `equalisation`. Their validated exact/cover selection and tie-break rules are specified in [ALGORITHMS.md](ALGORITHMS.md). Minimise and Preserve share payment-quality objectives; Minimise can use a proved greedy fast path. Balance changes the final distribution only after higher-priority objectives tie. Coin preference remains attached to the correct denomination when ordering is reversed. Closing Settings by button, backdrop, or Escape recalculates an already-entered payment without changing the draft or committing it. Preferences persist and apply across screens. Theme/language preferences are shared with the website.

JSON is the complete restorable backup, including old transactions and check-ins. Import validates, previews counts and collisions, and offers Merge or confirmed Replace. PDF is a readable report. Delete all data requires the explicit `DELETE ALL DATA` token and does not remove previously downloaded files. The danger area is separate from routine backup actions.

There is no history retention selector because there is no expiry. Browser capacity remains finite; a failed save offers recovery instead of pruning. The retired local email-capture form is no longer offered. General also identifies the free core, MPL-2.0 source and licence, and exploratory paid extras that are not available yet. Version/build information appears at the bottom. Existing biometric support is device dependent and does not encrypt browser storage.
