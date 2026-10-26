<!-- SPDX-License-Identifier: MPL-2.0 -->
# Contributing to Kontana

Kontana's core is free forever and open source under [MPL-2.0](LICENSE). Contributions to covered files use that licence; you retain your copyright. Only submit work you can license, identify any third-party source, and keep its notices. Contributions do not grant a blanket right to relicense your work as proprietary software.

Read [APP_SPEC](spec/APP_SPEC.md), [DESIGN_SPEC](spec/DESIGN_SPEC.md), and [LICENSING](LICENSING.md) before changing behavior. Discuss substantial changes in a GitHub issue or pull request: <https://github.com/plasticrutherfordium/getkontana>.

## Development

Use a current Hugo Extended release, Node.js and npm. Run `npm ci`, then `PORT=1314 npm run dev`. English routes are `/` and `/app/`; Spanish routes are `/es/` and `/es/app/`.

Before submitting, run `npm test`, `npm run build`, and `git diff --check`. For relevant interface changes, follow the optional Chromium smoke check in [README](README.md). Include a concise description and the validation you performed.

## Product and source rules

- Keep the core usable without payment, an account, cloud access or a Premium entitlement. Do not restrict history, backup/export or recovery to paid users.
- Preserve existing storage/migration compatibility and cash arithmetic. Never trim history to make a save succeed.
- Update English and Spanish copy together, including supporting pages, app strings, specs and the editable design when relevant.
- Describe potential Premium/MCP/camera functionality as exploratory until implemented. No checkout or upgrade action for an unavailable service.
- Add `SPDX-License-Identifier: MPL-2.0` to new first-party covered source files. For JSON or binary design source, use an adjacent `.license` file (or `REUSE.toml` for Hugo data files); package metadata also declares the licence.
- Preserve original branding, currency ISO codes and third-party licensing. Separate future paid files need explicit terms and may not silently absorb MPL-covered code.
