# getkontana
Kontana landing page (static site) for getkontana.com

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## ✅ Waitlist API smoke tests

Replace `BASE_URL` with your deployed site (for example `https://getkontana.com`).

Missing token (expect 400):

```bash
BASE_URL="https://getkontana.com"
curl -i -X POST "$BASE_URL/api/waitlist" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","turnstileToken":""}'
```

Invalid token (expect 403):

```bash
BASE_URL="https://getkontana.com"
curl -i -X POST "$BASE_URL/api/waitlist" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","turnstileToken":"invalid-token"}'
```

Valid token (expect 200):

```bash
BASE_URL="https://getkontana.com"
TURNSTILE_TOKEN="paste-a-real-token-from-a-browser-session"
curl -i -X POST "$BASE_URL/api/waitlist" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"turnstileToken\":\"$TURNSTILE_TOKEN\"}"
```
