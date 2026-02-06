# Deployment Guide for GetKontana.com

## Prerequisites
- [Hugo](https://gohugo.io/installation/) (extended edition)

## Build
```bash
hugo -s site
```
Output is written to `site/public/`.

## Quick Deploy Options:

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=site/public
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```
Set the build command to `hugo -s site` and the output directory to `site/public`.

### Manual Upload
Upload the `site/public/` folder to your web server.

## Local Development
```bash
hugo server -s site -p 1313 --disableFastRender
```

## Cloudflare Functions
The `functions/` directory contains Cloudflare Workers API routes (e.g. waitlist). Deploy with:
```bash
npx wrangler deploy
```

## Domain Setup:
1. Point getkontana.com DNS to your hosting provider
2. Add custom domain in hosting dashboard
3. SSL certificate will be configured automatically
