# ResQBridge

Animal rescue incident reporting and management platform.

## Stack

| Layer  | Technology |
|--------|------------|
| **Frontend** | React 19 + Vite 8 + Tailwind 4 + Recharts |
| **Backend** | Express 5 + Convex (database + functions) |
| **Auth** | JWT in HttpOnly cookies, OTP email verification |
| **Cache** | Redis 7 (optional, falls back to in-memory) |
| **Infrastructure** | Docker Compose + Nginx (reverse proxy, load balancer, SSL termination) |
| **Testing** | Vitest + Supertest + Playwright |

## Project structure

```
ResQBridge/
├── backend/
│   ├── convex/          # Convex schema, queries, mutations
│   │   ├── schema.ts    # 5 tables: otps, users, logs, config, reports
│   │   ├── users.ts     # CRUD + role management
│   │   ├── otp.ts       # OTP create/validate/expire
│   │   ├── logs.ts      # Audit logging + dashboard analytics
│   │   ├── config.ts    # Key-value config storage
│   │   └── reports.ts   # Incident report CRUD
│   ├── src/
│   │   ├── controllers/ # Express route handlers
│   │   ├── middleware/   # Auth, rate limiter, error handler
│   │   ├── routes/       # Express route definitions
│   │   ├── services/     # Email, external integrations
│   │   └── config/       # Redis connection
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
│   └── schema-history.sql  # SQL schema reference
├── docker-compose.yml      # Redis + backend + nginx
├── nginx.conf               # Load balancer, rate limiting, SSL
└── .github/workflows/ci.yml
```

## Quick start

### Prerequisites

- Node.js 20+
- Convex account (free at https://convex.dev)

### Backend

```bash
cd backend
cp .env.example .env        # Fill in CONVEX_URL, JWT_SECRET, etc.
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
# Build frontend first
cd frontend && npm run build && cd ..

# Start all services
docker compose up -d
```

## API overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/auth/register` | POST | No | Register with email OTP |
| `/api/v1/auth/login` | POST | No | Login, returns HttpOnly cookie |
| `/api/v1/auth/logout` | POST | No | Clears session |
| `/api/v1/auth/me` | GET | Yes | Current user info |
| `/api/v1/auth/admin/register` | POST | Admin | Create admin/rescuer users |
| `/api/v1/landing-config` | GET | No | Public landing page config |
| `/api/v1/admin/config` | GET/PUT | Admin | Read/write landing config |
| `/api/v1/report` | POST | No | Submit incident report (CSRF protected) |
| `/api/v1/admin/reports` | GET | Admin | List all reports |
| `/api/v1/admin/reports/:id` | PATCH | Admin | Update report status/assignment |
| `/api/v1/admin/logs` | GET | Admin | Audit logs with filtering |
| `/api/v1/admin/dashboard` | GET | Admin | Dashboard analytics |
| `/api/v1/admin/upload` | POST | Admin | File upload (images) |
| `/api/v1/rescuer/reports` | GET | Rescuer | Assigned reports |

## Security

- **JWT in HttpOnly cookies** — not accessible to JavaScript (prevents XSS token theft)
- **CSP** via Helmet — restricts script/style/image/form sources
- **CORS** — restricted to configured `FRONTEND_URL`
- **CSRF** — origin/referer validation on report submission
- **File upload** — extension allowlist + Sharp content validation
- **Rate limiting** — 100 req/s global, 10 req/s auth (Redis-backed in production)
- **Input validation** — `express-validator` + allowlist-based section key validation for config

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
13. **Location** — Google Maps embed
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
