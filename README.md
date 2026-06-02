# PWRRC — Palawan Wildlife Rescue & Reporting

Web application for the Palawan Wildlife Rescue and Rehabilitation Center (PWRRC). The public site lets residents browse wildlife information, report domestic and wildlife incidents, and manage a personal account. The admin panel supports staff workflows for reports, users, content, and administrators.

Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Convex** as the backend.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [npm scripts](#npm-scripts)
- [Routing](#routing)
- [Authentication](#authentication)
- [Backend (Convex)](#backend-convex)
- [Testing](#testing)
- [Building for production](#building-for-production)
- [Security](#security)

---

## Features

### Public site

| Area | Description |
|------|-------------|
| **Home** | Landing dashboard with venue hours, domestic reports feed, news/events, and about content |
| **Wildlife guide** | Searchable species catalog with filters and detail modals |
| **Report** | Submit domestic (missing, found, stray, injured) or wildlife sighting reports (login required) |
| **My reports** | View and manage the signed-in user’s submissions |
| **Account** | View-first profile with edit mode (name only; email is sign-in identity) |

### Admin panel (`/pwrcc/admin`)

| Area | Description |
|------|-------------|
| **Dashboard** | Overview stats |
| **Reports** | Review, update status, and manage user reports |
| **Users** | View and manage registered users |
| **Wildlife guide** | CRUD for species content |
| **News & events** | CRUD for news and event items |
| **Admins** | Add, view, edit, and remove admin accounts |
| **My profile** | View-first admin profile with edit icon |

### Cross-cutting

- Email OTP sign-in / sign-up for users and admins (dev: Vite API middleware + SMTP; production: configure Convex + server appropriately)
- Real-time data via Convex subscriptions
- Venue open/closed status for PWRCC hours (Asia/Manila, Mon–Sun 8 AM–5 PM)

---

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 19, React Router 7, Tailwind CSS 4, shadcn/ui |
| Build | Vite 8, TypeScript |
| Backend | [Convex](https://convex.dev) (queries, mutations, schema) |
| Auth | OTP codes (email), client session in `localStorage` |
| Email (dev) | Nodemailer via `vite-api-plugin` |
| Tests | Jest, ts-jest, React Testing Library, jsdom |

---

## Project structure

```
pwrrc/
├── convex/                 # Convex backend
│   ├── schema.ts           # Database tables
│   ├── admin.ts            # Admin queries/mutations
│   ├── users.ts            # User profile & registration
│   ├── reports.ts          # Report CRUD
│   ├── content.ts          # Wildlife & news site content
│   ├── otp.ts              # Verification code storage
│   └── lib/                # Shared backend helpers
├── src/
│   ├── pages/              # Route-level pages (public + admin/)
│   ├── components/         # UI (layout/, sections/, report/, admin/, ui/)
│   ├── context/            # Auth providers (user + admin)
│   ├── hooks/              # Shared React hooks
│   ├── lib/                # Client utilities (dates, reports, venue hours, env)
│   └── App.tsx             # Router root
├── tests/                  # Jest test suites (see Testing)
├── vite.config.ts          # Vite + API plugin
├── vite-api-plugin.ts      # Dev/preview OTP email API
├── jest.config.cjs         # Jest configuration
└── tsconfig.jest.json      # TypeScript config for tests
```

Path alias: `@/` → `src/` (configured in Vite and Jest).

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- A [Convex](https://convex.dev) account and deployment
- For local OTP email: Gmail App Password or compatible SMTP (see `.env.example`)

---

## Getting started

### 1. Clone and install

```bash
git clone <repository-url>
cd pwrrc
npm install
```

### 2. Environment

Copy the example env file and fill in values:

```bash
cp .env.example .env
# or use .env.local (also gitignored)
```

See [Environment variables](#environment-variables) below.

Set the same OTP secret in Convex:

```bash
npx convex dev
# In another terminal, once linked to your deployment:
npx convex env set OTP_INTERNAL_SECRET "<same-value-as-.env>"
```

### 3. Run Convex

```bash
npx convex dev
```

Keep this running during development so schema and functions stay in sync.

### 4. Run the frontend

```bash
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

- Public site: `/`
- Admin login: `/pwrcc/admin/login`

On startup, watch the terminal for `[pwrrc-api] SMTP verified` if email OTP is configured.

---

## Environment variables

Variables follow a strict **client vs server** split. Never prefix secrets with `VITE_`.

| Variable | Scope | Purpose |
|----------|--------|---------|
| `VITE_CONVEX_URL` | Client | Convex deployment URL (public by design) |
| `OTP_INTERNAL_SECRET` | Server + Convex | Shared secret between Vite OTP API and Convex OTP mutations |
| `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, … | Server only | SMTP for dev/preview OTP mail (`vite-api-plugin`) |

Optional SMTP overrides: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_FROM_NAME`, `EMAIL_FORCE_IPV4`.

Full comments and examples: **`.env.example`**.

The build fails fast if a `VITE_*` key looks like a secret (see `src/lib/server-email-env.ts`).

---

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR and OTP API middleware |
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run all Jest tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests (React + Convex helpers) |
| `npm run test:security` | Security-focused tests |
| `npm run test:sanity` | Smoke / project sanity checks |
| `npm run test:features` | Feature-level UI tests |
| `npm run test:coverage` | Tests with coverage report in `coverage/` |

---

## Routing

### Public routes

| Path | Page |
|------|------|
| `/` | Dashboard (home) |
| `/wildlife` | Wildlife guide |
| `/report` | Submit a report |
| `/my-reports` | User’s reports |
| `/account` | User profile |
| `/report/success` | Post-submit confirmation |

### Admin routes (under `/pwrcc/admin`)

| Path | Page |
|------|------|
| `/pwrcc/admin/login` | Admin OTP login |
| `/pwrcc/admin` | Dashboard |
| `/pwrcc/admin/reports` | Reports management |
| `/pwrcc/admin/users` | Users |
| `/pwrcc/admin/wildlife` | Wildlife content |
| `/pwrcc/admin/news` | News & events |
| `/pwrcc/admin/admins` | Admin accounts |
| `/pwrcc/admin/profile` | Signed-in admin profile |

`AdminGuard` verifies the session against `api.admin.isAdmin` before rendering protected admin UI.

---

## Authentication

### Users

1. Sign up or sign in via email OTP (`AuthModal` on the public site).
2. OTP is sent through the dev API plugin (SMTP) and validated via Convex `otp` mutations when `VITE_CONVEX_URL` and `OTP_INTERNAL_SECRET` are set.
3. On success, profile is stored in `localStorage` under `pwrrc_user` (`UserAuthContext`).

### Admins

1. OTP flow at `/pwrcc/admin/login`.
2. Session in `localStorage` (`AdminAuthContext`); server checks admin row in Convex `admins` table.
3. Default admin is seeded via `bootstrapAdmins` / `seedDefaultAdmin` (see `convex/lib/admins.ts`).

---

## Backend (Convex)

### Tables (`convex/schema.ts`)

| Table | Purpose |
|-------|---------|
| `admins` | Admin accounts (email index) |
| `users` | Registered public users |
| `reports` | Wildlife and domestic reports |
| `siteContent` | JSON blobs for wildlife list and news |
| `verificationCodes` | OTP codes (email + scope index) |

### Main modules

- **`admin.ts`** — Admin auth, profile, stats, report/user/admin management
- **`users.ts`** — Registration, profile read/update
- **`reports.ts`** — Create/list/update/delete reports
- **`content.ts`** — Wildlife and news content seeding and CRUD
- **`otp.ts`** — Internal-secret-gated verification code storage

When changing Convex code, read `convex/_generated/ai/guidelines.md` for project-specific API rules.

---

## Testing

Tests use **Jest** with **ts-jest** and **React Testing Library**. Suites live under `tests/` and are grouped by intent.

### Test layout

```
tests/
├── unit/                    # Pure functions & small modules
│   ├── lib/                 # admin, dates, venueHours, reports, utils, server-email-env
│   └── convex/              # convex/lib/admins
├── integration/             # Multi-module behavior
│   ├── user-auth-context.test.tsx
│   ├── pagination-hook.test.tsx
│   └── convex/              # adminAccess (mock DB), otpInternal
├── security/                # Secret leakage & OTP error messaging
├── sanity/                  # Schema, constants, import smoke tests
├── features/                # UI feature tests (e.g. venue hours badge)
├── helpers/                 # mockConvexCtx and shared utilities
├── __mocks__/               # Convex API/browser stubs for Jest
└── setup.ts                 # @testing-library/jest-dom, localStorage mocks
```

### What each suite covers

| Suite | Command | Focus |
|-------|---------|--------|
| **Unit** | `npm run test:unit` | `src/lib/*`, date/venue/report helpers, env pickers |
| **Integration** | `npm run test:integration` | Auth context persistence, pagination hook, Convex `adminAccess` with mock context |
| **Security** | `npm run test:security` | Blocks `VITE_*` secret patterns; OTP errors do not expose secrets |
| **Sanity** | `npm run test:sanity` | Schema tables exist, core modules import cleanly |
| **Features** | `npm run test:features` | Component behavior (e.g. `VenueHoursStatusBadge`) |
| **Coverage** | `npm run test:coverage` | HTML/LCOV report in `coverage/` |

### Coverage scope

Coverage is collected for:

- `src/lib/**`
- `src/hooks/**`
- `convex/lib/**`
- `vite-otp-store.ts`

Global thresholds (see `jest.config.cjs`): **50%+** lines/functions, **45%+** branches. Open `coverage/index.html` after `npm run test:coverage` for a detailed breakdown.

### Convex integration note

Full Convex runtime tests via `convex-test` require **Vitest** (`import.meta.glob`). This project uses **Jest**, so backend integration tests use a **mock Convex database context** (`tests/helpers/mockConvexCtx.ts`) for `adminAccess` and unit tests for `otpInternal`. For deeper Convex E2E testing, consider a separate Vitest + `convex-test` setup or deployed staging checks.

### Configuration files

| File | Role |
|------|------|
| `jest.config.cjs` | Preset, paths, coverage, mocks |
| `tsconfig.jest.json` | TypeScript for test compilation |

### Writing new tests

1. Place files next to related suites: `tests/unit/...`, `tests/integration/...`, etc.
2. Name files `*.test.ts` or `*.test.tsx`.
3. Use `@/` imports for `src/` code.
4. For React components, import `screen` from `@testing-library/dom` and `render` from `@testing-library/react`.
5. Run `npm test` before opening a PR.

---

## Building for production

```bash
npm run build
npm run preview   # optional local check of dist/
```

Output is in `dist/`. Only `VITE_*` variables are embedded in the client bundle.

**Email OTP in production:** Sign-in and sign-up call Convex HTTP routes on your deployment’s `.convex.site` URL (derived from `VITE_CONVEX_URL`). Configure these on your Convex deployment (same values as local `.env`):

```bash
npx convex env set OTP_INTERNAL_SECRET "<same-as-local>"
npx convex env set EMAIL_USER "you@gmail.com"
npx convex env set EMAIL_PASS "your-app-password"
# optional: EMAIL_HOST, EMAIL_PORT, EMAIL_FROM, EMAIL_FROM_NAME
```

Then deploy Convex (`npx convex deploy`) and redeploy the frontend. Optional override: `VITE_AUTH_API_URL=https://your-deployment.convex.site`.

---

## Security

- **Never** put passwords, API keys, or SMTP credentials in `VITE_*` variables.
- `assertClientEnvHasNoSecrets` runs at build/config load to catch accidental `VITE_` secret names.
- OTP mutations require `OTP_INTERNAL_SECRET` matching Convex env.
- Admin mutations call `assertAdmin` against the `admins` table.
- User sessions are client-side; sensitive operations are always validated on Convex.

Report security issues to project maintainers privately.

---

## License

Private project — see repository owner for terms.
