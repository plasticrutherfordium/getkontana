# Kontana Terminal Design Spec

## 0. North Star
Kontana must feel like a retro terminal UI across the marketing website and the app. The marketing site uses the Hugo theme **Terminal** by panr (hugo-theme-terminal) as the baseline layout, typography, and vibe. Keep the default green terminal look and only fine-tune within the same green family via Terminal.css color schemes.

All new UI is implemented with:
- Tailwind CSS utility classes for all elements.
- shadcn/ui component conventions and Lucide icons.

## 1. Brand Vibe + UX Principles
### Visual tone
- CRT / terminal vibe: monospace, high contrast, grid-like, duotone accents.
- "Typed" or "printed" surfaces over glossy UI.
- Prefer borders, outlines, ASCII dividers. Avoid shadows and gradients except for subtle modal lift.

### Interaction tone
- Short CLI-like copy; use prompt cues (`>`) only for emphasis.
- Crisp interactions. Minimal motion.

### Consistency rule
Anything added to the Hugo theme must visually match it; anything in-app must look like it could be a Terminal theme page.

## 2. Design Tokens (Single Source of Truth)
Tokens live as CSS variables (`--kt-*`) in `src/styles/terminal.css` and are mapped into `tailwind.config.mjs`.

### 2.1 Color (exact values)
| Token              | Dark (default)   | Light            | Usage                              |
|--------------------|------------------|------------------|------------------------------------|
| `--kt-bg`          | `#0b1112`        | `#f6faf8`        | Page background                    |
| `--kt-surface`     | `#12191b`        | `#ffffff`        | Cards, panels, inputs              |
| `--kt-surface-2`   | `#161f22`        | `#eef3f1`        | Nested panels, alternating rows    |
| `--kt-text`        | `#e6efe9`        | `#0a1211`        | Primary text                       |
| `--kt-text-muted`  | `#b0beb7`        | `#4c5b56`        | Secondary text                     |
| `--kt-text-muted-2`| `#8a9891`        | `#66736f`        | Hints, metadata                    |
| `--kt-border`      | `#1f2b2f`        | `#cfd9d4`        | Default borders                    |
| `--kt-accent`      | `#19c36b`        | `#0f9a55`        | Links, focus rings, active states  |
| `--kt-accent-2`    | `#0f9a55`        | `#0b7d44`        | Hover, subtle borders              |
| `--kt-danger`      | `#ef4444`        | `#dc2626`        | Destructive actions                |
| `--kt-warning`     | `#f59e0b`        | `#d97706`        | Warnings                           |
| `--kt-success`     | `#19c36b`        | `#0f9a55`        | Success states (same as accent)    |

**Rules**
- No blue primary buttons.
- Avoid large filled green blocks; prefer outline + text, except for one primary CTA per screen.

### 2.2 Typography
- Font: `"Fira Code"` (loaded via Google Fonts).
- Fallback: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
- Weight: 400 body, 600 headings.
- Same font for headings. No display font.
- `font-variant-numeric: tabular-nums` everywhere.
- Sizes: `text-xs` 0.75rem, `text-sm` 0.875rem, `text-base` 1rem, `text-lg` 1.125rem, `text-xl` 1.25rem.

### 2.3 Spacing, radius, borders
- Radius: `--kt-radius-sm: 4px`, `--kt-radius-md: 6px`, `--kt-radius-lg: 8px`.
- Borders: 1px `var(--kt-border)` default; 2px for emphasis/focus.
- Shadows: none by default; `0 18px 40px rgba(0,0,0,0.45)` for modals only.
- Spacing scale: Tailwind defaults (4px base).

### 2.4 Focus + accessibility
- Focus ring: `ring-2 ring-accent ring-offset-2 ring-offset-bg`.
- Keyboard-first; every control is tabbable.
- Minimum contrast ratio: 4.5:1 for text, 3:1 for large text.

## 3. Core Layout Patterns
### 3.1 Page frame
- Single central column (Terminal theme default). Full-width sections only when essential.
- Header: simple logo on left, minimal nav.
- Footer: small, low-contrast, terminal-like.

### 3.2 Content rhythm
- Use thin border blocks and ASCII dividers (e.g., `────────────────────────────────`).

### 3.3 Lists + tables
- Terminal output look: row separators, monospaced columns, aligned numbers.
- Avoid card-heavy UI. Prefer framed panels.

## 4. Component Spec (Tailwind + shadcn/ui)
### 4.1 Buttons
**Primary** (1 per screen)
- Strong outline or filled green.
- Short verb label.

**Secondary**
- Outline, muted border, light text.

**Destructive**
- Red outline. Confirmation required.

### 4.2 Inputs
- Dark background, 1px border, green focus ring.
- Muted placeholder.
- Inline help in muted text.
- Errors: `ERR: ...` in red, single line.
- Success: `OK` in green.

### 4.3 Links
- Green, underlined.
- Hover: brighter green or subtle glow.

### 4.4 Badges / tags
- Outline only, small text, uppercase optional.
- Green for active, gray for inactive, red for error.

### 4.5 Panels / frames
- Main container: 1px border frame.
- Sub-panels: inset border or slightly different background.

### 4.6 Modals
- Overlay terminal window: framed box, title row, close button.
- Dark translucent backdrop; no heavy blur.
- ESC closes, click outside closes (unless destructive confirm).

### 4.7 Toasts
- Top-right or bottom-right.
- Copy: `Saved.`, `Deleted.`, `ERR: Network unavailable`.

### 4.8 Icons
- Lucide icons via shadcn conventions.
- Stroke-only, 16–20px.
- Color follows text unless stateful.

## 5. App-Specific UI Patterns
### 5.1 Navigation
- Left sidebar or minimal top nav.
- Active item is green and/or has a `>` marker.

### 5.2 Wallet UI
- Terminal row list, no modern cards.
- Selected wallet: subtle background + green marker.
- Actions: framed menu with edit/delete items.

### 5.3 Transaction list (terminal ledger)
- Monospace-aligned columns: Date/Time, Description, Amount, Balance.
- Amount color: inflow green; outflow muted/red (consistent).
- Compact filters: Search, Date range, Type.
- Summary strip: `Balance`, `In (30d)`, `Out (30d)`.

### 5.4 Forms
- “Add transaction” as framed panel with clear CTA.
- Keyboard flow: Amount → Type → Note → Date → Save.
- Toast on save: `Saved.`

### 5.5 Settings
- Modal/popup in desktop, full-page on mobile.
- Outside click + ESC closes.
- App version row at bottom.

## 6. Website Implementation (Hugo Terminal Theme)
- Use `panr/hugo-theme-terminal` with default layout and green scheme.
- Only minimal overrides for Kontana-specific content.
- Use theme params for content type names, menu item counts, full-width toggles, and cover behavior.

### Landing page structure
- Hero: 1 sentence value prop, 3 bullets, waitlist email CTA.
- How it works: 3 steps.
- Privacy note: 1–2 lines.
- FAQ: 5 items.
- Final CTA.

### Waitlist form
- Single email field + primary button.
- Microcopy: “Email only. No tracking. Unsubscribe anytime.”
- Error: `ERR: Please enter a valid email`
- Success: `OK: You’re on the list.`

## 7. Dark Mode Policy
- Default is dark terminal mode.
- Tailwind uses class/selector strategy for dark mode; control via `data-theme` or class.

## 8. Copy Rules
- Short, concrete, CLI-like language.
- Use `OK:`, `ERR:`, `WARN:` sparingly.
- Buttons are verbs.
- Section titles can be bracketed.

## 9. Engineering Constraints
- Tailwind for all new UI.
- Lucide icons via shadcn conventions.
- Minimal dependencies.
- Privacy-first analytics policy.

