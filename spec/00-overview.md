# /spec/00-overview.md

## Purpose
- Upgrade Kontana into a **dual-mode** cash app:
  - **Precise mode (existing):** denomination-accurate tracking, Pay flows, ledger strategies, forced reconciliation where it exists today.
  - **Budget mode (new):** envelope targets + periodic check-ins + drift classification + “reset to reality” reconciliation, with optional lightweight logging. :contentReference[oaicite:1]{index=1}
- Non-negotiable: **do not remove** existing precise workflows; budget mode must be additive and reversible. :contentReference[oaicite:2]{index=2}

## Ground truth (current app)
- Hugo + static JS PWA; main logic: `site/static/app.js` (~5,196 lines).
- Local-first; state in localStorage `kontana_state_v1`.
- Max 4 wallets.
- Tabs: Cash / Pay / Transactions / Settings.
- Strategy engine duplicated: in app + `site/static/lib/strategies.js`.
- Cash tab: edit denominations forces reconciliation; records `denominations_edited` tx.
- Pay tab: out/in, change flow, revert latest tx only.
- Transactions: per-wallet ledger.
- Settings: behaviour toggles + export JSON/PDF + delete all data + language/appearance + mobile-only biometric toggle.
- PWA service worker: network-first.
- Known gaps: no retention purge, no import flow, no transfer/loss UI, theme key mismatch, stubs/debug logs, currency/denoms inconsistencies. :contentReference[oaicite:3]{index=3}

## Product model
### Two modes, one dataset
- **Same underlying dataset**; mode changes emphasis and defaults, not data. :contentReference[oaicite:4]{index=4}

### What changes by mode
- **Cash tab**
  - Precise: unchanged.
  - Budget: wallet cards add envelopes (targets + remaining), check-in CTA, and “Quick reconcile (total-only)” with guardrails. :contentReference[oaicite:5]{index=5}
- **Pay tab**
  - Precise: unchanged.
  - Budget: primary actions become “Quick spend” (big-only logging), “Transfer”, “Loss/Adjustment”. Existing Pay tools remain under an “Advanced” divider. :contentReference[oaicite:6]{index=6}
- **Transactions tab**
  - Precise: unchanged ledger.
  - Budget: default view is “This period” summary + check-ins + drift breakdown, with one-tap access to full ledger. :contentReference[oaicite:7]{index=7}
- **Settings**
  - Add mode toggle + budget settings: cadence, week start, drift alerts thresholds, tracking defaults. :contentReference[oaicite:8]{index=8}

## Switching modes safely
- Single Settings toggle (“App mode”) + persistent in-app pill (“Precise mode” / “Budget mode”).
- Switching:
  - must not delete, transform, or hide data
  - must keep precise tools reachable in both modes
  - should reduce fear of “doing it wrong”. :contentReference[oaicite:9]{index=9}

## Principles
- “Budgets drift” is normal; UX must be **forgiving** and **non-judgemental**.
- Reconciliation-first: “reset to reality” beats perfect itemisation.
- Local-first and data minimisation.

## Out of scope (explicit)
- AI/camera counting (v2+).
- Accounts/sync.
- External analytics by default.
