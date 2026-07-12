# Marina Pearl Dental Clinic

Full-stack booking website for a fictional Dubai dental clinic. Public marketing site + guest booking + staff admin.

> Fictional demo — do not use with real patient data.

## Stack

- **Client:** React 18 + Vite, plain CSS (no Tailwind), lucide-react, date-fns, Zod
- **Server:** Express.js (ES modules) + Supabase JS (service role)
- **DB / Auth:** Supabase (Postgres + Auth email/password + Google OAuth)
- **Contact:** Web3Forms proxy
- **Deploy:** Vercel (client static, server as serverless functions)

## Repo layout

```
marina-pearl-dental/
├── client/        React + Vite
├── server/        Express + migrations + seeds
├── .env.example
├── vercel.json
└── package.json   npm workspaces
```

## Setup

### 1. Prerequisites

- Node.js 18.17+
- A Supabase project (free tier is fine)

### 2. Install

```bash
npm install
```

### 3. Environment variables

Copy the template and fill in Supabase values:

```bash
cp .env.example .env
```

Fill:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from Supabase → Project Settings → API
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — same values, client copy
- `WEB3FORMS_ACCESS_KEY` from https://web3forms.com (optional; contact form falls back to a no-op)
- `RESEND_API_KEY` (optional; confirmation email is logged to console if unset)

### 4. Database schema

In Supabase → SQL editor, run each file in `server/migrations/` in order:

1. `001_schema.sql`
2. `002_rls.sql`

Or via psql:

```bash
psql "$SUPABASE_DB_URL" -f server/migrations/001_schema.sql
psql "$SUPABASE_DB_URL" -f server/migrations/002_rls.sql
```

### 5. Seed

Creates 3 doctors, 7 services, 1 staff user, sample appointments.

```bash
npm run seed
```

Staff login is printed at the end (email + password from `.env`).

### 6. Run

```bash
npm run dev
```

- Client: http://localhost:5173
- API:    http://localhost:5174

Public routes:

- `/` — home
- `/services`, `/doctors`, `/about`, `/contact`
- `/book` — guest booking flow (no account needed)
- `/manage/:token` — guest reschedule/cancel via emailed link
- `/admin` — staff panel

## Deploy (Vercel)

The repo is set up as a Vercel monorepo: the client builds to a static site, the Express app runs as a single serverless function (`api/[[...path]].js` re-exports it).

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create marina-pearl-dental --private --source=. --push
```

### 2. Import to Vercel

- vercel.com → **Add New… → Project → Import** your repo
- Framework preset: **Other** (Vercel will read `vercel.json`)
- Root directory: **`.`** (repo root)
- Do **not** override the build/output settings — `vercel.json` handles them.

### 3. Set environment variables

In **Project → Settings → Environment Variables**, add every value below **before your first deploy** (Vite bakes `VITE_*` variables at build time — if they aren't set, the built client won't be able to reach Supabase):

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` secret |
| `VITE_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY` |
| `VITE_API_BASE_URL` | **Leave blank** — client and API share the same origin |
| `CORS_ALLOWED_ORIGIN` | Your Vercel URL, e.g. `https://marina-pearl.vercel.app` |
| `PUBLIC_SITE_URL` | Same as `CORS_ALLOWED_ORIGIN` |
| `WEB3FORMS_ACCESS_KEY` | From web3forms.com (optional; contact form logs to console without it) |
| `RESEND_API_KEY` | From resend.com (optional; email logs to console without it) |
| `EMAIL_FROM` | `hello@yourdomain.example` (or your verified Resend sender) |

**Do not set** `API_PORT` or `PORT` — Vercel injects them into serverless functions automatically.

### 4. Deploy

Click **Deploy**. First build ~2 min. Once live:

- **Marketing site + booking:** `https://your-project.vercel.app/`
- **API health check:** `https://your-project.vercel.app/api/health`
- **Staff admin:** `https://your-project.vercel.app/admin/login`

### 5. Run migrations against production Supabase

If you haven't already, run the two SQL migrations in Supabase → SQL editor (they're idempotent — safe to re-run):

- `server/migrations/001_schema.sql`
- `server/migrations/002_rls.sql`

Then seed (locally, pointed at the same Supabase):

```bash
npm run seed
```

### How the routing works

- Files in `api/` are auto-detected as Vercel serverless functions.
- `server/api/api.js` is a thin re-export of the Express app from `server/src/server.js`. `vercel.json` registers it under `functions` and rewrites every `/api/*` request to it, so all API traffic hits the same function.
- The catch-all rewrite (`/((?!api/).*)` → `/index.html`) sends everything else to the SPA (React Router handles the rest).
- `app.listen()` in `server/src/server.js` is guarded by an entry-point check — it only binds a port in local `npm run dev`, never in serverless.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Runs client (:5173) and server (:5174) in parallel |
| `npm run build` | Production build of client |
| `npm run start` | Starts server without the client |
| `npm run seed` | Seeds Supabase with fixtures |

## Notes

- Prices displayed as AED ranges; not integrated with any payment provider.
- Timezone: all appointment logic uses `Asia/Dubai`.
- The Arabic locale file is scaffolded but placeholder text — real translation is out of scope for v1.
- No real patient data. All names, phones, and addresses are fictional.
