# Technical Requirements Document (TRD)
## XDevFlow CRM — Lead Management Platform
**Version:** 1.0.0 | **Stack:** Next.js + Node.js/Express + Supabase (PostgreSQL)

---

## 1. Technology Stack Decisions

### 1.1 Why Supabase over MongoDB?

The assessment specifies MongoDB, but Supabase is a superior choice for this use case and is architecturally aligned with the requirements. Here is the justification:

| Concern | MongoDB (Atlas) | Supabase (PostgreSQL) |
|---|---|---|
| Relational data (users → leads → activity) | Manual refs | Native foreign keys |
| Auth system | Requires custom build | Built-in Auth with JWT |
| Real-time updates | Requires extra setup | Built-in Realtime |
| Row-Level Security (RBAC) | Application-level only | Database-level RLS policies |
| Dashboard queries (COUNT, GROUP BY) | Aggregation pipeline | Native SQL |
| Free tier availability | Atlas M0 | Supabase Free Plan |
| Type safety | Mongoose types | Generated TypeScript types |

**Decision:** Use Supabase. It satisfies all MongoDB requirements (NoSQL-style document flexibility is not needed here) while adding security, RBAC, and relational integrity that MongoDB cannot provide natively.

> If the evaluator insists on MongoDB: swap Supabase client calls for Mongoose models. Schema design remains identical.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────┐
│           Next.js (Frontend)        │
│  pages/ + app/ + components/        │
│  React Query for server state       │
│  Zustand for client state           │
│  TailwindCSS + shadcn/ui            │
└──────────────┬──────────────────────┘
               │ HTTP / REST
┌──────────────▼──────────────────────┐
│      Node.js + Express (Backend)    │
│  /api/auth  /api/leads  /api/users  │
│  JWT Middleware + RBAC Middleware   │
│  Zod validation on all inputs       │
└──────────────┬──────────────────────┘
               │ Supabase JS Client / SQL
┌──────────────▼──────────────────────┐
│         Supabase (PostgreSQL)       │
│  Tables: users, leads, activity_log │
│  RLS Policies per role              │
│  Auth: supabase.auth.*              │
└─────────────────────────────────────┘
```

---

## 3. Frontend Technical Requirements

### 3.1 Framework
- **Next.js 14** (App Router) — for SSR capability, file-based routing, API routes.
- React 18 with hooks only (no class components).

### 3.2 State Management
- **React Query (TanStack Query v5):** Server state — leads list, dashboard stats, activity log.
- **Zustand:** Client state — auth user, theme preference, UI toggles.

### 3.3 UI Library
- **TailwindCSS v3** — utility-first styling.
- **shadcn/ui** — headless accessible components (Dialog, Select, Table, Badge, etc.).
- **Recharts** — dashboard analytics charts.
- **Lucide React** — icon set.

### 3.4 Form Handling
- **React Hook Form v7** + **Zod** — schema-validated forms, no manual error state.

### 3.5 Routing & Auth Guards
- Next.js middleware (`middleware.ts`) reads JWT cookie to protect all `/dashboard/*` routes.
- Redirect unauthenticated users to `/login`.

### 3.6 Key Dependencies (package.json)
```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "@tanstack/react-query": "^5.40.0",
  "zustand": "^4.5.4",
  "react-hook-form": "^7.52.0",
  "zod": "^3.23.8",
  "@hookform/resolvers": "^3.6.0",
  "recharts": "^2.12.7",
  "lucide-react": "^0.395.0",
  "tailwindcss": "^3.4.4",
  "@radix-ui/react-dialog": "^1.1.0",
  "@radix-ui/react-select": "^2.1.0",
  "clsx": "^2.1.1",
  "class-variance-authority": "^0.7.0",
  "next-themes": "^0.3.0"
}
```

---

## 4. Backend Technical Requirements

### 4.1 Framework
- **Node.js 20 LTS** + **Express 4.x**
- Runs as a standalone REST API; Next.js frontend calls it via `NEXT_PUBLIC_API_URL`.

### 4.2 Middleware Stack (in order)
```
Request → cors → helmet → express.json → rateLimiter → router → errorHandler → Response
```

| Middleware | Package | Purpose |
|---|---|---|
| CORS | `cors` | Allow Next.js origin |
| Security headers | `helmet` | XSS, clickjacking protection |
| Rate limiting | `express-rate-limit` | 100 req/15min per IP |
| JWT Auth | Custom middleware | Verify Bearer token |
| RBAC | Custom middleware | Check user role per route |
| Validation | `zod` | Parse + validate request body |
| Error handler | Custom middleware | Unified error response shape |

### 4.3 API Structure
```
/api/v1/
├── auth/
│   ├── POST /register
│   ├── POST /login
│   └── POST /logout
├── leads/
│   ├── GET    /           (paginated, search, filter)
│   ├── POST   /           (create)
│   ├── GET    /:id        (single lead)
│   ├── PUT    /:id        (update)
│   └── DELETE /:id        (delete)
├── dashboard/
│   └── GET /stats         (analytics counts)
├── users/                 (Admin only)
│   ├── GET    /
│   └── PATCH  /:id/role
└── activity/
    └── GET /:leadId       (timeline for a lead)
```

### 4.4 Key Dependencies (package.json)
```json
{
  "express": "^4.19.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.3.1",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "zod": "^3.23.8",
  "@supabase/supabase-js": "^2.44.1",
  "dotenv": "^16.4.5",
  "morgan": "^1.10.0"
}
```

### 4.5 Error Response Contract
All errors return this shape:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": []
  }
}
```

### 4.6 Success Response Contract
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

## 5. Database Technical Requirements

See `04-Backend-Schema.md` for full schema. Summary:

- **Platform:** Supabase (PostgreSQL 15)
- **Tables:** `profiles`, `leads`, `activity_log`
- **Auth:** Supabase Auth handles `users` table; `profiles` extends it.
- **Indexes:** `leads(status)`, `leads(email)`, `leads(full_name text_search)`, `activity_log(lead_id)`
- **RLS:** Enabled on all tables; policies per role.

---

## 6. Security Requirements

| Requirement | Implementation |
|---|---|
| Password hashing | bcryptjs, 12 rounds |
| Token signing | JWT HS256, `JWT_SECRET` env var, 24h expiry |
| Token storage | HttpOnly cookie (not localStorage) |
| SQL injection | Parameterized queries via Supabase client |
| XSS | `helmet` CSP headers + React escaping |
| CSRF | SameSite=Strict cookie flag |
| Brute force | `express-rate-limit` on `/auth/*` routes |
| Secrets | All in `.env`; never committed |

---

## 7. Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_32_char_minimum_secret
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:3000
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 8. Performance Requirements

| Metric | Target | Implementation |
|---|---|---|
| API response time | < 300ms p95 | DB indexes, connection pooling |
| Dashboard load | < 1s | Aggregated stats endpoint, React Query cache |
| Search latency | < 200ms | Debounced input (300ms), indexed full-text search |
| Bundle size | < 200KB initial JS | Next.js code splitting, dynamic imports |
| Image/asset | Optimized | Next.js `<Image>` component |

---

## 9. Testing Strategy

| Layer | Tool | Coverage Target |
|---|---|---|
| Unit (utils, validators) | Jest | 80% |
| Integration (API routes) | Supertest | All endpoints |
| E2E (critical flows) | Playwright | Auth, Lead CRUD |
| Manual QA | Browser | Mobile + Desktop |
