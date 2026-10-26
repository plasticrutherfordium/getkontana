<!-- SPDX-License-Identifier: MPL-2.0 -->
# Settings

See [APP_SPEC.md](APP_SPEC.md#settings-and-data-ownership) for the canonical behavior and [DESIGN_SPEC.md](DESIGN_SPEC.md#settings-and-dialogs) for layout.

Settings opens through the top-right gear on desktop/mobile. The mode pill opens General focused on mode selection. It is a centered desktop dialog and full-height mobile sheet with three section buttons. Close, backdrop click, and Escape dismiss it; keyboard focus is contained and returns to the trigger. A foreground confirmation has priority over Settings.

| Section | Controls |
| --- | --- |
| General | Precise/Budget mode, Light/Dark theme, English/Español, platform-dependent biometric lock; source/licence links and exploratory Premium disclosure |
| Payment assistance | Suggestions; strategy; single-cover overpayment; change suggestions; coin preference; denomination ordering; notes/coins split; cents display |
| Data & backup | No-expiry/full-local-history explanation; JSON export; PDF report; JSON import; Delete all data |

Suggestions are global. When disabled, dependent coin/change suggestions are disabled. Strategy choices retain the existing `greedy`, `lex`, and `equalisation` algorithms and plain-language descriptions. Preferences persist and apply across screens. Theme/language preferences are shared with the website.

JSON is the complete restorable backup, including old transactions and check-ins. Import validates, previews counts and collisions, and offers Merge or confirmed Replace. PDF is a readable report. Delete all data requires the explicit `DELETE ALL DATA` token and does not remove previously downloaded files. The danger area is separate from routine backup actions.

There is no history retention selector because there is no expiry. Browser capacity remains finite; a failed save offers recovery instead of pruning. The retired local email-capture form is no longer offered. General also identifies the free core, MPL-2.0 source and licence, and exploratory paid extras that are not available yet. Version/build information appears at the bottom. Existing biometric support is device dependent and does not encrypt browser storage.
