# Marina Pearl Dental Clinic

Full-stack booking website for a fictional Dubai dental clinic. Public marketing site + guest booking + staff admin.

> Fictional demo — do not use with real patient data.

## Stack

- **Frontend:** React 18 + Vite, plain CSS (no Tailwind), lucide-react, date-fns, Zod
- **Backend:** Express.js (ES modules) + Supabase JS (service role)
- **DB / Auth:** Supabase (Postgres + Auth email/password + Google OAuth)
- **Contact:** Web3Forms proxy
- **Deploy:** Vercel — deployed as **two separate projects** (one per workspace)

## Repo layout

```
marina-pearl-dental/
├── backend/
│   ├── api/
│   │   └── index.js       one-line re-export of ../server.js
│   ├── lib/               supabase, availability, email
│   ├── middleware/        auth, role, error handler
│   ├── routes/            public.js, staff.js
│   ├── migrations/        SQL: schema + RLS
│   ├── seeds/             seed.js
│   ├── server.js          Express app
│   ├── package.json
│   └── vercel.json        rewrites /(.*) → /api
├── frontend/
│   ├── src/               React + CSS per component
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── vercel.json        SPA fallback
├── .env.example
└── package.json           npm workspaces (frontend, backend)
```

## Local setup

### 1. Prerequisites

- Node.js 20.6+
- A Supabase project (free tier is fine)

### 2. Install

```bash
npm install
```

### 3. Environment variables

Copy the template and fill in values at the repo root:

```bash
cp .env.example .env
```

Fill:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from Supabase → Project Settings → API
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — same values, browser copy
- `WEB3FORMS_ACCESS_KEY` from https://web3forms.com (optional; contact form logs to console without it)
- `RESEND_API_KEY` (optional; confirmation email logs to console without it)

### 4. Database schema

In Supabase → SQL editor, run each file in `backend/migrations/` in order:

1. `001_schema.sql`
2. `002_rls.sql`

### 5. Seed

Creates 3 doctors, 7 services, 1 staff user, sample appointments.

```bash
npm run seed
```

Staff login credentials come from `SEED_STAFF_EMAIL` / `SEED_STAFF_PASSWORD` in `.env`.

### 6. Run

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API:      http://localhost:5174

Public routes:

- `/` — home
- `/services`, `/doctors`, `/about`, `/contact`
- `/book` — guest booking flow (no account needed)
- `/manage/:token` — guest reschedule/cancel via emailed link
- `/admin` — staff panel

## Deploy (Vercel — two projects)

Deploy `backend/` and `frontend/` as **separate Vercel projects** (both pointing to the same GitHub repo, different **Root Directory** settings).

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create marina-pearl-dental --private --source=. --push
```

### 2. Deploy the backend

- vercel.com → **Add New → Project → Import** your repo
- **Root Directory: `backend`**
- Framework Preset: **Other**
- Add these environment variables (Settings → Environment Variables):

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → service_role secret |
| `CORS_ALLOWED_ORIGIN` | Your **frontend** Vercel URL (fill after step 3) |
| `PUBLIC_SITE_URL` | Same as `CORS_ALLOWED_ORIGIN` |
| `WEB3FORMS_ACCESS_KEY` | From web3forms.com (optional) |
| `RESEND_API_KEY` | From resend.com (optional) |
| `EMAIL_FROM` | Verified sender email (optional) |

Deploy. Note the backend URL — e.g. `https://marina-pearl-backend.vercel.app`.

**Do not set** `PORT` or `API_PORT` — Vercel injects them.

### 3. Deploy the frontend

- vercel.com → **Add New → Project → Import** the *same* repo
- **Root Directory: `frontend`**
- Framework Preset: **Vite** (auto-detected)
- Environment variables:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Same as backend's `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Same as backend's `SUPABASE_ANON_KEY` |
| `VITE_API_BASE_URL` | **Your backend Vercel URL** from step 2 |

Deploy. Note the frontend URL.

### 4. Wire the CORS origin

Go back to the backend project's env vars and set `CORS_ALLOWED_ORIGIN` and `PUBLIC_SITE_URL` to the frontend URL. Redeploy the backend.

### How it works

- **Frontend** is a static Vite build. Its `vercel.json` rewrites any unknown path to `/` so React Router handles client-side navigation (`/about`, `/admin/dashboard`, etc.).
- **Backend** deploys `api/index.js` as a serverless function. Its `vercel.json` rewrites every incoming request to `/api`, so the same Express handler serves every endpoint (`/api/health`, `/api/public/services`, `/api/staff/*`, …). Express reads `req.url` and routes internally.
- The frontend calls the backend via `VITE_API_BASE_URL` — a full cross-origin URL in production. CORS is enforced by `helmet` + `cors` in Express.
- `app.listen()` in `backend/server.js` only fires when the file is the direct entry point (`npm run dev`). Vercel imports the app and skips the listen call.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Runs frontend (:5173) and backend (:5174) in parallel |
| `npm run build` | Production build of frontend |
| `npm run start` | Starts backend without the frontend |
| `npm run seed` | Seeds Supabase with fixtures |

## Notes

- Prices displayed as AED ranges; not integrated with any payment provider.
- Timezone: all appointment logic uses `Asia/Dubai`.
- The Arabic locale file is scaffolded but placeholder text — real translation is out of scope for v1.
- No real patient data. All names, phones, and addresses are fictional.
