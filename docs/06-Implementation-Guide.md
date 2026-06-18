# Implementation Guide
## XDevFlow CRM — Start to Finish (72-Hour Sprint)
**Version:** 1.0.0

---

## Overview

This guide walks you through building the XDevFlow CRM from zero to deployed. Follow the phases in order. Each phase is self-contained and leaves you with a working, testable checkpoint.

---

## Phase 0 — Project Bootstrap (Hours 0–2)

### Step 1: Initialize Repository

```bash
mkdir xdevflow-crm-assessment && cd xdevflow-crm-assessment
git init
git checkout -b main

# Create workspace structure
mkdir client server
touch README.md .gitignore docker-compose.yml .env.example
```

### Step 2: .gitignore
```
node_modules/
.env
.env.local
dist/
.next/
*.log
```

### Step 3: Initialize Backend
```bash
cd server
npm init -y
npm install express cors helmet morgan express-rate-limit \
  jsonwebtoken bcryptjs zod @supabase/supabase-js \
  dotenv cookie-parser
npm install -D nodemon
# Update package.json: "type": "module", "scripts": { "dev": "nodemon server.js" }
```

### Step 4: Initialize Frontend
```bash
cd ../client
npx create-next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install @tanstack/react-query @tanstack/react-query-devtools \
  zustand react-hook-form zod @hookform/resolvers \
  recharts lucide-react next-themes axios \
  class-variance-authority clsx tailwind-merge
npx shadcn@latest init
npx shadcn@latest add button input label dialog select badge \
  table dropdown-menu toast avatar card separator
```

### Step 5: Supabase Setup
1. Go to [supabase.com](https://supabase.com) → New Project.
2. Copy `Project URL` and `anon key` to `client/.env.local`.
3. Copy `service_role key` to `server/.env`.
4. Open SQL Editor and run the schema from `04-Backend-Schema.md` (sections 1.1, 1.2, 1.3 and the RLS policies).
5. Go to Authentication → Settings → disable "Email confirmations" for development.

### Git Checkpoint
```bash
git add . && git commit -m "chore: project scaffold and dependencies"
```

---

## Phase 1 — Backend Auth (Hours 2–6)

### Step 1: Supabase config
```javascript
// server/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### Step 2: Auth Service
```javascript
// server/services/auth.service.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const registerUser = async ({ full_name, email, password, role = 'user' }) => {
  const hash = await bcrypt.hash(password, 12);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email, password: hash, email_confirm: true
  });
  if (authError) throw new Error(authError.message);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({ id: authData.user.id, full_name, email, role })
    .select().single();

  if (profileError) throw new Error(profileError.message);
  return profile;
};

export const loginUser = async ({ email, password }) => {
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('email', email).single();
  if (!profile) throw new Error('Invalid credentials');

  const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
  const valid = await bcrypt.compare(password, user.encrypted_password ?? password);
  // NOTE: For simplicity use Supabase's own signInWithPassword instead:
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { id: profile.id, role: profile.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  return { token, profile };
};
```

### Step 3: Auth Routes
```javascript
// server/routes/auth.routes.js
import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';

const router = Router();
router.post('/register', register);
router.post('/login',    login);
router.post('/logout',   logout);
export default router;
```

### Step 4: Auth Controller
```javascript
// server/controllers/auth.controller.js
import { registerUser, loginUser } from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const profile = await registerUser(req.body);
    res.status(201).json({ success: true, data: profile });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { token, profile } = await loginUser(req.body);
    res.cookie('token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000
    });
    res.json({ success: true, data: { profile } });
  } catch (err) { next(err); }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, data: null });
};
```

### Git Checkpoint
```bash
git add . && git commit -m "feat(auth): register, login, logout endpoints"
```

---

## Phase 2 — Lead CRUD API (Hours 6–12)

Implement `lead.controller.js` exactly as shown in `04-Backend-Schema.md` section 4.4.
Add routes:

```javascript
// server/routes/lead.routes.js
import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { getLeads, getLead, createLead, updateLead, deleteLead } from '../controllers/lead.controller.js';

const router = Router();
router.use(protect);

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLead)
  .put(authorize('manager', 'admin'), updateLead)
  .delete(authorize('admin'), deleteLead);

export default router;
```

### Test with curl
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Admin User","email":"admin@test.com","password":"Admin1234!","role":"admin"}'

# Login
curl -c cookies.txt -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin1234!"}'

# Create lead
curl -b cookies.txt -X POST http://localhost:5000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"j@acme.com","phone":"555-1234","company":"Acme"}'
```

### Git Checkpoint
```bash
git add . && git commit -m "feat(leads): CRUD endpoints with RBAC and activity logging"
```

---

## Phase 3 — Frontend Auth (Hours 12–18)

### Step 1: API client
```typescript
// client/src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) window.location.href = '/login';
    return Promise.reject(err);
  }
);

export default api;
```

### Step 2: Auth Store (Zustand)
```typescript
// client/src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({ user: null, setUser: user => set({ user }) }),
    { name: 'auth-storage' }
  )
);
```

### Step 3: Route Protection Middleware
```typescript
// client/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const isAuth = request.nextUrl.pathname.startsWith('/login') ||
                 request.nextUrl.pathname.startsWith('/register');

  if (!token && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (token && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };
```

### Git Checkpoint
```bash
git add . && git commit -m "feat(frontend): auth flow, route protection, Zustand store"
```

---

## Phase 4 — Frontend Leads + Dashboard (Hours 18–36)

Build in this order:
1. `DashboardLayout` with Sidebar + Header.
2. `Dashboard` page with StatCard + PipelineChart.
3. `LeadsPage` with LeadTable + search + filter.
4. `LeadForm` modal (create + edit).
5. `LeadProfilePage` with ActivityTimeline.

Use React Query for all server state:
```typescript
// client/src/hooks/useLeads.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useLeads = (params: LeadQueryParams) =>
  useQuery({
    queryKey: ['leads', params],
    queryFn: () => api.get('/leads', { params }).then(r => r.data),
    staleTime: 30_000,
  });

export const useCreateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeadInput) => api.post('/leads', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
};
```

### Git Checkpoint
```bash
git add . && git commit -m "feat(frontend): dashboard, leads list, CRUD forms, activity timeline"
```

---

## Phase 5 — Bonus Features (Hours 36–52)

### Dark Mode
```typescript
// client/src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### RBAC on Frontend
```typescript
// client/src/hooks/usePermissions.ts
export const usePermissions = () => {
  const { user } = useAuthStore();
  return {
    canCreate: ['user','manager','admin'].includes(user?.role),
    canEdit:   ['manager','admin'].includes(user?.role),
    canDelete: user?.role === 'admin',
    isAdmin:   user?.role === 'admin',
  };
};
```

### Git Checkpoint
```bash
git add . && git commit -m "feat: dark mode, RBAC UI gates, activity timeline"
```

---

## Phase 6 — Docker Setup (Hours 52–56)

```yaml
# docker-compose.yml
version: '3.8'

services:
  server:
    build: ./server
    ports:
      - "5000:5000"
    env_file:
      - ./server/.env
    volumes:
      - ./server:/app
      - /app/node_modules
    command: node server.js

  client:
    build: ./client
    ports:
      - "3000:3000"
    env_file:
      - ./client/.env.local
    depends_on:
      - server
```

```dockerfile
# server/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```dockerfile
# client/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker-compose up --build
```

### Git Checkpoint
```bash
git add . && git commit -m "feat(devops): Docker + docker-compose setup"
```

---

## Phase 7 — Deployment (Hours 56–64)

### Backend → Railway

1. Push `server/` to a separate branch or monorepo.
2. Connect Railway to GitHub repo.
3. Set root directory to `server/`.
4. Add all environment variables from `server/.env`.
5. Railway auto-detects Node.js and deploys.
6. Copy the Railway URL (e.g. `https://crm-api.up.railway.app`).

### Frontend → Vercel

1. Import GitHub repo into Vercel.
2. Set framework to Next.js, root directory to `client/`.
3. Add env vars:
   - `NEXT_PUBLIC_API_URL=https://crm-api.up.railway.app/api/v1`
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
4. Deploy.

### Update CORS on backend
```javascript
// server/server.js
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-vercel-app.vercel.app'],
  credentials: true
}));
```

### Git Checkpoint
```bash
git add . && git commit -m "feat(deployment): Vercel + Railway config, updated CORS"
git tag v1.0.0
git push origin main --tags
```

---

## Phase 8 — README + Final QA (Hours 64–72)

### README Structure
```markdown
# XDevFlow CRM

## Live Demo
https://your-vercel-app.vercel.app

## Tech Stack
- Frontend: Next.js 14, TailwindCSS, shadcn/ui, React Query
- Backend: Node.js, Express, JWT, Zod
- Database: Supabase (PostgreSQL)
- DevOps: Docker, Vercel, Railway

## Quick Start
### Prerequisites: Node 20+, Docker (optional)

### Local Setup
1. Clone the repo
2. Copy .env.example to server/.env and client/.env.local
3. Fill in Supabase credentials
4. cd server && npm install && npm run dev
5. cd client && npm install && npm run dev

### Docker
docker-compose up --build

## Architecture
[Brief description linking to /docs]

## API Documentation
[Key endpoints listed]
```

### Final QA Checklist
- [ ] Login/logout works
- [ ] Create, edit, delete leads work
- [ ] Dashboard stats are accurate
- [ ] Search + filter works together
- [ ] Responsive on mobile (375px)
- [ ] Dark mode toggle works
- [ ] Protected routes redirect correctly
- [ ] RBAC prevents unauthorized actions
- [ ] Activity timeline shows correct history
- [ ] Docker builds without errors
- [ ] Live URL is accessible

---

## DevOps Workflow

### Branch Strategy (Git Flow)
```
main          → production-ready; auto-deploys to Vercel/Railway
develop       → integration branch
feature/*     → individual features (e.g. feature/lead-crud)
fix/*         → bug fixes
```

### Commit Standards (Conventional Commits)
```
feat(scope):     New feature
fix(scope):      Bug fix
chore(scope):    Config, dependencies, tooling
refactor(scope): Code restructure (no behavior change)
docs(scope):     Documentation only
test(scope):     Tests only

Examples:
feat(leads): add search and filter to GET /leads
fix(auth): correct JWT cookie SameSite flag
chore(deps): update @supabase/supabase-js to 2.44
```

### CI Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd server && npm ci && npm test
      - run: cd client && npm ci && npm run build
```

### CD Pipeline
- **Vercel:** Auto-deploys `main` branch on push (Next.js frontend).
- **Railway:** Auto-deploys `main` branch on push (Express backend).
- PR previews: Vercel creates preview URL for every pull request.

### Environment Strategy
| Environment | Backend | Frontend | DB |
|---|---|---|---|
| Local | localhost:5000 | localhost:3000 | Supabase dev project |
| Preview | Railway preview | Vercel preview | Supabase dev project |
| Production | Railway main | Vercel main | Supabase prod project |
