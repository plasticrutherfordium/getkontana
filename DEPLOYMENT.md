# Deployment Guide for GetKontana.com

## Prerequisites
- [Hugo](https://gohugo.io/installation/) (extended edition)

## Build
```bash
hugo -s site
```
Output is written to `site/public/`.

## Quick Deploy Options:

### Cloudflare (recommended)
Static site deploy:
```bash
npx wrangler deploy --assets=site/public
```

Cloudflare Functions API routes (in `functions/`):
```bash
npx wrangler deploy
```

### Manual Upload
Upload the `site/public/` folder to your web server.

## Local Development
```bash
hugo server -s site -p 1313 --disableFastRender
```

## Domain Setup:
1. Point getkontana.com DNS to your hosting provider
2. Add custom domain in hosting dashboard
3. SSL certificate will be configured automatically
