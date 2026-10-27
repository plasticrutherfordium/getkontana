<!-- SPDX-License-Identifier: MPL-2.0 -->
# Deployment for getkontana.com

## Existing production target

Cloudflare Pages project: `getkontana`. Production branch: `main`. Domains: `getkontana.com`, `www.getkontana.com`, and `getkontana.pages.dev`. The project is connected to `plasticrutherfordium/getkontana` on GitHub. Reuse this project; do not create a separate Worker or Pages project for a release.

## Build and validate

Use Node.js/npm and Hugo Extended (validated with Hugo 0.167.0):

```bash
npm ci
npm test
npm run build
git diff --check
```

Production assets are in `site/public/`, which is ignored by Git. The build vendors the local PDF library and includes both languages, fonts, licence text and third-party notices. Keep `HUGO_VERSION=0.167.0` or a compatible newer version in the Cloudflare build environment when using automatic Git builds, with build command `npm run build` and output directory `site/public`.

## Release

Commit the reviewed source and push `main`. Git integration may start a Cloudflare build automatically. Inspect production deployment status before starting another deployment:

```bash
npx wrangler pages deployment list --project-name getkontana --environment production
```

If deploying the validated local build directly, use the existing Pages project:

```bash
npx wrangler pages deploy site/public --project-name getkontana --branch main
```

Wrangler attaches the current Git commit metadata; `--commit-hash` can be provided explicitly. A production deployment updates the custom domains. The root `functions/` directory contains the legacy waitlist API and is compiled by Pages; preserve the existing project bindings/secrets. No database migration or secret rotation is needed for this redesign. Do not use `wrangler deploy --assets` to replace the Pages project with a Worker.

Verify `/`, `/es/`, `/app/`, `/es/app/`, `/open-source/`, `/licenses/MPL-2.0.txt`, and `/sw.js` over HTTPS after deployment. Check app version 0.1.9, free-core/MPL wording, current assets and source links. Browser smoke checks can use the production URL in a fresh test profile without accessing user data; see `scripts/smoke-ui.py`.

Also test an existing installation: fresh profiles cannot expose stale browser HTTP caches. Build the previous release into a separate directory and run `python scripts/smoke-upgrade.py --old-build /path/to/previous/public --new-build site/public --expect-version 0.1.9` with ChromeDriver running. This switches a local server between releases while keeping its browser profile, four-hour HTTP cache, service worker, wallet, and old history. It verifies the explicit update/reload flow, actual JavaScript version, decimal typing, layout, inventory, and offline reload. Never clear site storage to test upgrades.

Release version must agree in `package.json`, `package-lock.json`, `site/hugo.toml`, `app.js`, and `sw.js`; bump the worker cache name too. HTML, dynamic imports, and precache URLs must all request the same release. Preserve `site/static/_headers` in the build and verify live JS/CSS headers; custom-domain cache rules can differ from `pages.dev` defaults. Cloudflare documents this under [Pages caching](https://developers.cloudflare.com/pages/configuration/serving-pages/#caching-and-performance) and [custom headers](https://developers.cloudflare.com/pages/configuration/headers/).

## Product and licence

The core is free forever and MPL-2.0 open source. Source availability and `/licenses/` notices are part of the release. Optional paid extras are exploratory; there is no active Premium billing or AI/MCP availability. See [LICENSING.md](LICENSING.md) and [OPEN_CORE_SPEC.md](spec/OPEN_CORE_SPEC.md). Earlier MIT permissions and third-party licences remain intact.

## Local development

```bash
PORT=1314 npm run dev
```

Open `http://localhost:1314/` or `/app/`; Spanish routes use `/es/`. Use another free port when 1314 is occupied.
