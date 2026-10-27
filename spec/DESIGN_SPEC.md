<!-- SPDX-License-Identifier: MPL-2.0 -->
# Kontana — design specification

Status: implemented Phosphor design, updated 27 October 2026. The shipped layout and theme corrections below take precedence over the original canvas composition. The editable visual reference is [new-kontana-design.pen](../design/new-kontana-design.pen). This document supersedes `design-terminal.md` and the old screen-layout instructions. Product behavior belongs to [APP_SPEC.md](APP_SPEC.md).

## Direction and brand

A calm, modern cash tool with an 80s cyberpunk undertone: phosphor green, warm off-white, precise mono numerals, fine borders, a restrained grid, and the original pixel identity. Use generous space and a clear hierarchy. Retro character comes from the palette, original mark, small terminal-like metadata, and the marketing demo grid. Avoid scanline overlays, heavy glow, animated noise, pixel body text, ASCII separators, and decorative effects over financial information.

Preserve `site/static/kontana-logo3.svg` and `site/static/favicon-kontana3.png` without redrawing, recoloring, cropping, or replacing them. The original wordmark remains a green rectangle with black pixel lettering in both themes. Preserve currency ISO codes and the existing flag assets.

## Color system

Source of truth: `site/static/kt-terminal.css`. Use semantic tokens rather than component-specific hard-coded colors.

| Role / token | Dark | Light |
| --- | --- | --- |
| Page `--kt-bg` | `#0A100D` | `#F3F5EC` |
| Surface `--kt-surface` | `#111A15` | `#FCFDF8` |
| Quiet section `--kt-surface-soft` | `#111A15` | `#EDF1E7` |
| Raised/selected `--kt-surface-2` | `#18251C` | `#E6EDD9` |
| Primary text `--kt-text` | `#EFF5EC` | `#15231A` |
| Secondary text `--kt-text-muted` | `#A4B1A6` | `#51634F` |
| Border `--kt-border` | `#293A2E` | `#CAD3C1` |
| Accent/success `--kt-accent` | `#A1EF9C` | `#276B35` |
| Accent hover `--kt-accent-2` | `#B9F7B5` | `#1B5426` |
| Accent border `--kt-accent-border` | `#507653` | `#8AA57A` |
| Warning `--kt-warning` | `#EDBD78` | `#805215` |
| Danger `--kt-danger` | `#F29F96` | `#A13B31` |

The marketing privacy band uses `--kt-surface-soft`: a quiet forest surface in dark mode and a faint sage tint in light mode. Keep the transition from the surrounding page subtle in both themes. Headings, secondary copy, checkmarks, section labels and dividers follow their semantic theme tokens; never keep a pale band or dark ink fixed across themes. Both themes are fully designed, not simple inversions. Filled primary actions use the accent with page-background text. Secondary actions use a surface and quiet border. Destructive actions use danger text/border with a subdued danger surface. Status includes text or a symbol as well as color.

## Typography and spacing

Self-hosted fonts in `site/static/fonts/`, with SIL Open Font License files included:

- Space Grotesk for display headings, weight 500. Website hero 88px maximum / 60px mobile, line-height about 1.02. Section headings 36–64px depending on hierarchy. App heading 36px desktop / 30px mobile.
- Inter for body, labels, navigation, and actions, weights 400–700. Website lead 18px desktop / 16px mobile; regular content 13–16px. App body 14px, labels 11–13px.
- IBM Plex Mono for balances, denomination values, table amounts, counts, and small metadata. Use tabular numerals and restrained uppercase tracking for metadata. Main wallet total about 23px; payment amount 40–42px.

Use a base spacing unit of 4px, with most layout gaps on an 8px rhythm. Buttons have 4px radii, panels 6px, dialogs and floating navigation 8px. Borders are normally 1px. Focus rings are 2px. Primary touch actions are at least 44px high; larger amount fields create a clear payment entry point. Avoid pill-shaped containers for ordinary sections. Reserve shadows for the product demo, floating mobile navigation, and modal lift.

## Website

The website is a progressive, single-page story with separate translated supporting pages. Desktop maximum width is 1440px including 88px side padding. At mobile widths use 20px padding; at 320–360px reduce to 16px when needed.

1. Header: original logo, How it works / Privacy / FAQ anchors, theme toggle, EN/ES selector, and Open free app. Mobile keeps logo, theme, language, and a compact app action while hiding the anchor links.
2. Hero: “Free core. Forever.” and a linked “OPEN SOURCE / MPL-2.0” badge above “Your cash. Your rules.”; primary Start tracking for free; secondary See how it works; no-account/free-core assurance. Spanish uses “App principal gratis. Para siempre.”, “CÓDIGO ABIERTO / MPL-2.0” and “Tu efectivo. Tus reglas.”
3. Product preview: a clearly labeled illustrative Everyday wallet, `EUR 324.50`, with note/coin arithmetic that actually totals 324.50. Display local/offline indicators and a Record a payment link to the real app. The caption identifies it as example data; it is never presented as the visitor's wallet.
4. Trust strip: no bank connections, no account, no tracking, on-device storage.
5. Three open steps: Count it / Spend it / Stay in control, using simple stroke icons and thin rules rather than a grid of boxed feature cards.
6. Privacy band: Offline / On purpose, with three concrete commitments about local data, no bank access, and user-controlled exports.
7. FAQ: native disclosure controls covering accounts, offline use, reconciliation, free-core pricing, exploratory Premium/MCP/camera extras, source/licence and history with no expiry.
8. Final “Free core. Open future.” action, optional-future-extras wording and a compact footer with source/licensing links.

The hero is two columns on desktop, stacked on mobile. The preview uses a faint 32px grid, tiny corner registration marks, and one framed app panel. Other page sections remain quiet. Desktop FAQ/privacy are two columns; mobile uses one. No waitlist, active pricing table, checkout or unavailable-feature upgrade action appears. Future paid extras are explicitly exploratory; the core remains free.

All visible marketing/supporting copy is available in English and Spanish. Language menus link to the corresponding translated route, including privacy and terms. Localized text may wrap naturally; do not shrink whole layouts to force English line lengths.

## App shell and components

Desktop: an 80px full-width top bar, 216px sidebar (184px at intermediate widths), and content with 40px side padding. The original logo stays in the top bar on all screen sizes. A local-only badge and Settings icon sit at the right. The sidebar has three clear icon/text rows and a quiet privacy/free-core reminder with a source link.

At 768px and below, hide the sidebar and use a floating bottom bar inset 16px from the sides and 12px plus the safe area from the bottom. It contains Cash / Pay / Transactions with icons and full localized labels. Content bottom padding keeps fields/actions above this navigation. The top bar becomes 72px; content uses 20px sides. Only the wallet-card strip scrolls horizontally, never the whole page.

### Cash

Wallet cards are approximately 240×132px on desktop and 200×124px on mobile, with currency/flag, wallet name, then a mono balance. The active card has an accent border and raised surface; its ellipsis action occupies a separate accessible target. New wallet uses a dashed outline and plus/label. The strip supports up to 20 wallets through contained horizontal scrolling; cards never shrink into illegibility or force the whole page to scroll sideways.

During dragging, keep the cursor/finger at its original point on the card. Lift the card with a restrained shadow and 1.02 scale around that point; a dashed phosphor slot reserves its place. Neighboring cards slide into their new positions over 200ms using an ease-out curve. Pointer tracking uses animation frames directly, without easing lag. The released card settles into the slot over 180ms. Edge scrolling accommodates a long strip and must not jump back to the start after dropping. Keep the card uncluttered: use its body as the drag target, with no grip icon. A mouse drags directly; touch lifts after a 240ms hold, leaving immediate swipes available for native scrolling. Reduced motion uses direct positioning with no layout/drop tween. Preserve the existing card colors, logo and currency marks.

Below the cards, use a two-column workspace: inventory plus a 288px status/activity column. Stack below 1020px. Inventory has a small heading/ISO code, note/coin segmented control, Hide empty action, aligned denomination rows, and the visible-group total. Counts are read-only text until editing. Values, counts, and subtotals keep stable alignment. Use explicit Denomination / Quantity / Subtotal headers and quantities such as “2 bills”. Separate holdings from “Not in your wallet”, with the configured order inside each group. Empty rows retain readable contrast; presence is communicated with text and grouping. The tabs count physical items and the footer names the selected group. The wallet-check panel presents real reconciliation state; latest activity is real saved data.

Budget mode adds named envelope targets, current-period recorded spending progress, remaining values, and existing check-in/reconciliation actions. The remaining amount is an amount of recorded budget, not a claim to know unlogged spending. Over-budget amounts stay visible with warning text/color.

### Pay

Wallet selection and direction remain above a single focused payment workspace. At every width, place the breakdown below the entry fields in a workspace capped at 880px. The amount spans the width. Note/category share a row above 768px and stack on phones. Count-first incoming payments use this same vertical flow; no empty left-hand column is reserved. Give the amount field a clear visual hierarchy; notes and categories use regular controls.

Breakdowns are clean denomination × count / subtotal rows. Exact payment uses success text and a clear primary action; non-exact tender shows expected change and opens a separate confirmation. Manual controls reuse inventory geometry, with column headers and explicit available counts. Amounts preserve the separator while typing; a small localized precision hint accompanies the input. An unfilled form shows useful guidance. Confirmation shows actual saved transaction details, never fabricated examples.

### Transactions

Three summary panels: all-time inflow, all-time outflow, current balance. On mobile the first two share a row and the balance spans the next row. Below, show full-history/local-storage wording and a three-column ledger grouped by date. Use understated surfaces rather than red/green row fills. Signed amount text communicates direction; mono running balances remain aligned. Expanded details work with pointer, Enter, or Space. No 30-day bar or expiry warning appears.

### Settings and dialogs

Settings is a centered, scrollable 760px maximum dialog on desktop and a full-height sheet on mobile. The header includes the free-core reminder, Settings title, and Close. Three plain section tabs: General, Payment assistance, Data & backup. Only the chosen section is visible. Mode, theme, language, strategy, and dependent controls retain their real behavior.

General settings includes the MPL-2.0/source links and explains the free core and exploratory paid extras. The backup section prominently explains no history expiry and the need for a JSON backup. Exports/import are secondary actions; reset sits in a separate subdued danger area. Do not advertise local-only email capture as a functioning newsletter signup.

Other dialogs use a 560px maximum width, 8px corners, blurred darkened backdrop, normal-size controls, clear primary action, and neutral Cancel. Never commit money movement merely by previewing a suggestion. Keyboard focus stays in the foreground dialog and returns to its trigger on close. Respect `prefers-reduced-motion`; essential information never depends on animation.

## Implementation map

| Responsibility | Files |
| --- | --- |
| Shared palette, type and primitives | `site/static/kt-terminal.css`, `site/static/fonts/fonts.css` |
| Website layout | `site/layouts/_default/`, `site/layouts/partials/site-header.html`, `site-footer.html` |
| Website text / interactions | `site/data/website.json`, `site/content/*.es.md`, `site/static/site.js` |
| Website responsive styling | `site/static/landing.css` |
| App shell and icons | `site/layouts/app/`, `site/layouts/partials/icon.html` |
| App presentation | `site/static/app-phosphor.css`; `app.css` contains layered legacy control mechanics |
| App screen rendering | `site/static/app.js`, `site/static/app/ui/pay.js` |
| Dialog focus and keyboard behavior | `site/static/app/accessibility.js` plus app dialog handlers |
| Offline assets | `site/static/sw.js`, `manifest.webmanifest` |

The `.pen` contains desktop/mobile, light/dark, English/Spanish marketing and app examples. These are reference examples; real app numbers always come from the user's state. Existing supported dialogs and Budget details extend the same component rules even when a particular form is not pictured in the reference.
