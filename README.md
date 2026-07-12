# ResQBridge

Animal rescue incident reporting and management platform.

## Stack

| Layer  | Technology |
|--------|------------|
| **Frontend** | React 19 + Vite 8 + Tailwind 4 + Recharts |
| **Backend** | Express 5 + Convex (database + functions) |
| **Auth** | JWT in HttpOnly cookies, OTP email verification, Google OAuth (SSO) |
| **Cache** | Redis 7 (optional, falls back to in-memory) |
| **Infrastructure** | Docker Compose + Nginx (reverse proxy, load balancer, SSL termination) |
| **Testing** | Vitest + Supertest + Playwright |

## Project structure

```
ResQBridge/
├── backend/
│   ├── convex/          # Convex schema, queries, mutations
│   │   ├── schema.ts    # 14 tables: otps, users, admins, rescuers, reports,
│   │   │                 #   rescuerLocations, config, shifts, activityLogs,
│   │   │                 #   logs, adminNotifications, equipmentChecklists,
│   │   │                 #   expenses, reportNotes, voiceNotes
│   │   ├── users.ts     # CRUD + role management
│   │   ├── otp.ts       # OTP create/validate/expire
│   │   ├── logs.ts      # Audit logging + dashboard analytics
│   │   ├── config.ts    # Key-value config storage
│   │   └── reports.ts   # Incident report CRUD
│   ├── src/
│   │   ├── controllers/ # Express route handlers
│   │   ├── middleware/   # Auth, rate limiter, error handler, CSRF, honeypot
│   │   ├── routes/       # Express route definitions
│   │   ├── services/     # Email, notifications, cache, Redis
│   │   └── config/       # Redis, Convex, email, Passport (Google OAuth)
│   └── tests/           # Vitest unit/integration/e2e tests
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level page components
│   │   │   └── landing/ # Landing page with 14 editable sections
│   │   ├── context/     # AuthContext (cookie-based)
│   │   ├── services/    # API client
│   │   └── test/        # Component + integration tests
│   └── index.html
├── database/
│   └── schema-history.sql  # SQL schema reference (14 tables)
├── docker-compose.yml      # Redis + backend x3 + frontend-builder + nginx
├── nginx.conf               # Load balancer, rate limiting, SSL, HSTS
├── nginx-entrypoint.sh      # Auto-generates SSL certs, waits for frontend build
└── .github/workflows/ci.yml
```

## Quick start

### Prerequisites

- Node.js 20+
- Convex account (free at https://convex.dev)
- SMTP credentials for email (OTP, password reset)

### Backend

```bash
cd backend
cp .env.example .env        # Fill in CONVEX_URL, JWT_SECRET, SMTP_PASS, etc.
npm install
npx convex dev              # Start Convex dev server
npm run dev                 # Start Express on :3000
```

### Frontend

```bash
cd frontend
cp .env.example .env        # Fill in VITE_GOOGLE_MAPS_API_KEY
npm install
npm run dev                 # Vite dev server on :5173
```

### Docker (production-like)

```bash
# Start all services (auto-builds frontend)
docker compose up -d
```

## API overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/auth/register` | POST | No | Register with email OTP |
| `/api/v1/auth/send-otp` | POST | No | Send OTP to email |
| `/api/v1/auth/login` | POST | No | Login, returns HttpOnly cookie |
| `/api/v1/auth/forgot-password` | POST | No | Request password reset |
| `/api/v1/auth/reset-password` | POST | No | Reset password with token |
| `/api/v1/auth/google` | GET | No | Google OAuth SSO |
| `/api/v1/auth/me` | GET | Yes | Current user info |
| `/api/v1/landing-config` | GET | No | Public landing page config |
| `/api/v1/contact` | POST | No | Submit contact form |
| `/api/v1/volunteer` | POST | No | Submit volunteer application |
| `/api/v1/newsletter` | POST | No | Subscribe to newsletter |
| `/api/v1/report` | POST | No | Submit incident report (CSRF + honeypot protected) |
| `/api/v1/admin/config` | GET/PUT | Admin | Read/write system config |
| `/api/v1/admin/landing-config` | GET/PUT | Admin | Read/write landing page content |
| `/api/v1/admin/reports` | GET | Admin | List all reports |
| `/api/v1/admin/reports/:id` | PATCH | Admin | Update report status/assignment |
| `/api/v1/admin/stats` | GET | Admin | System statistics |
| `/api/v1/admin/logs` | GET | Admin | Audit logs with filtering |
| `/api/v1/admin/dashboard` | GET | Admin | Dashboard analytics |
| `/api/v1/admin/users` | GET | Admin | List all users |
| `/api/v1/admin/permissions` | GET/PUT | Admin | Read/write admin permissions |
| `/api/v1/rescuer/reports` | GET | Rescuer | Assigned reports |
| `/api/v1/rescuer/profile` | PATCH | Rescuer | Update profile (validated) |
| `/api/v1/rescuer/stats` | GET | Rescuer | Personal statistics |
| `/api/v1/rescuer/activity` | GET | Rescuer | Activity log |
| `/api/v1/rescuer/shifts` | GET/POST | Rescuer | Shift schedules |
| `/api/v1/health` | GET | No | Health check (Redis status) |

## Security

- **JWT in HttpOnly cookies** — not accessible to JavaScript (prevents XSS token theft)
- **CSP** via Helmet — restricts script/style/image/form sources
- **CORS** — restricted to configured `FRONTEND_URL`
- **CSRF** — origin/referer validation on all state-changing routes (auth, report)
- **Honeypot** — hidden form field traps automated bots on public forms
- **HSTS** — `Strict-Transport-Security` header enforced at nginx level
- **Rate limiting** — layered (nginx + Express): global 100/s, auth 10/2min, report 5/min, admin 30/min, OTP 3/min (Redis-backed in production)
- **Account lockout** — 5 failed login attempts triggers 15-minute cooldown
- **OTP brute-force protection** — 3 failed OTP verifications blocks further attempts
- **File upload** — extension allowlist + Sharp content validation + 15MB limit
- **Input validation** — `express-validator` on all user-facing inputs; length limits enforced
- **Config whitelist** — only predefined keys accepted by `updateConfig`
- **User enumeration protection** — forgot-password and send-otp return generic messages
- **SSO cookie** — `sameSite: "strict"` (matches all other auth cookies)
- **Password reset token** — stripped from browser URL immediately on page load

## Landing page sections

The landing page has 14 editable sections managed via the admin panel:

1. **Hero** — Main banner with headline/CTA
2. **Stats** — Impact statistics counters
3. **How It Works** — Step-by-step explanation
4. **Success Stories** — Testimonials with modal
5. **Gallery** — Image masonry with upload
6. **Partner Logos** — Organization showcase
7. **Donate** — Donation CTA
8. **Volunteer** — Roles/requirements/CTA
9. **Contact** — Form + social links
10. **FAQ** — Accordion Q&A
11. **Carousel** — Image carousel
12. **Community Board** — Announcements
13. **Location** — OpenStreetMap embed
14. **News & Events** — Event cards

## Testing

```bash
# Backend — all tests
cd backend && npm test

# Backend — specific suites
npm run test:unit     # Unit tests
npm run test:int      # Integration tests
npm run test:e2e      # End-to-end tests

# Frontend
cd frontend && npm test
npx playwright test   # E2E (requires browsers installed)
```
