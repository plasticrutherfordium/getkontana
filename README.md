<!-- SPDX-License-Identifier: MPL-2.0 -->
# Kontana

**Free core. Forever. Open source under MPL-2.0.** A private, local-first cash tracker and bilingual website built with Hugo and browser JavaScript. Original Kontana branding, a restrained retro design, complete dark/light themes, and English/Spanish interfaces.

[Source code](https://github.com/plasticrutherfordium/getkontana) · [Licence](LICENSE) · [Contributing](CONTRIBUTING.md) · [Licensing model](LICENSING.md)

## Free core and optional extras

Wallets, payments, budgets, full local history, JSON backup/import and PDF reports stay free. No account or subscription is required for the core. Optional paid extras may follow; MCP connections and camera-assisted counting are exploratory and are not shipped. There is no active Premium plan or checkout.

MPL-2.0 covers current first-party core source and distributed modifications to covered files. Separate future components containing no MPL-covered code may use other terms. See [LICENSING.md](LICENSING.md) for boundaries, third-party exceptions and earlier MIT permissions. [NOTICE](NOTICE) preserves third-party notices; fonts, PDF code and the theme retain their original licences.

## Run locally

Install Node.js, npm, and a current Hugo Extended release (validated with Hugo 0.167.0). From this directory:

```bash
npm ci
PORT=1314 npm run dev
```

Open `http://localhost:1314/` for the website or `http://localhost:1314/app/` for the app. Spanish routes are `/es/` and `/es/app/`. Port 1314 avoids the usual 1313 conflict with another Hugo project; choose another free `PORT` if necessary. Without `PORT`, Hugo uses 1313.

## Build and check

```bash
npm run build
npm test
```

Build output is `site/public/`. The build vendors `pdf-lib` locally before running Hugo. Fonts and original brand assets are also served locally. The unit suite uses Node's built-in test runner. For individual test counts, use `node --test --test-isolation=none`.

An optional integrated browser check uses Python 3, Chromium and ChromeDriver with no Python packages:

```bash
# In separate terminals, keep the Hugo server and ChromeDriver running.
chromedriver --port=9515 --allowed-ips=127.0.0.1
python3 scripts/smoke-ui.py --base-url http://localhost:1314
python3 scripts/smoke-wallet-drag.py --base-url http://localhost:1314
```

The check creates a fresh temporary browser profile and fixture data, exercises payments/backup/offline use, then closes its browser. Screenshots go to `/tmp/kontana-ui-smoke/`; override with `--artifacts`.

The wallet interaction check creates an isolated 20-wallet fixture and checks mouse/touch/keyboard sorting, cancellation, scrolling, persistence and offline behavior. Its screenshots go to `/tmp/kontana-wallet-drag-qa/`.

## Application behavior and design

Start with [the specification index](spec/README.md), [APP_SPEC](spec/APP_SPEC.md), and [DESIGN_SPEC](spec/DESIGN_SPEC.md). The editable design is [design/new-kontana-design.pen](design/new-kontana-design.pen). [Release verification](spec/RELEASE_VERIFICATION.md) records implementation checks and remaining device-specific validation.

- Website templates/content: `site/layouts/`, `site/content/`, `site/data/website.json`.
- Shared design tokens: `site/static/kt-terminal.css`; website styling: `landing.css`; app styling: `app-phosphor.css` above layered legacy mechanics in `app.css`.
- App rendering: `site/static/app.js`, `site/static/app/ui/pay.js`; state/money/Budget/ledger helpers: `site/static/app/`.
- PWA shell: `site/static/sw.js`, `manifest.webmanifest`.
- Mathematical strategy modules: `src/lib/` and their browser counterparts in `site/static/lib/`.

Cash data stays in this browser under `kontana_state_v1` (schema 2). There is no time-based or record-count history limit. Browser/device storage limits still apply. Export JSON from Settings → Data & backup before clearing browser data or moving devices. Import JSON restores/merges backups; PDF is a readable report.

After a successful first app load and service-worker installation, the app works offline. Updates wait for the user's reload action. Production PWA installation requires HTTPS. No deployment or publishing is performed by the local build.

The retired waitlist API files remain in the checkout for compatibility; the redesigned website and app do not offer a waitlist form. No cloud sync, login, payment or bank connection is required for the core.
