# Deployment Guide for GetKontana.com

## Quick Deploy Options:

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Manual Upload
Upload the `dist/` folder to your web server

## Domain Setup:
1. Point getkontana.com DNS to your hosting provider
2. Add custom domain in hosting dashboard
3. SSL certificate will be configured automatically
