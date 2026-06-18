# Backend Schema & Implementation Document
## XDevFlow CRM — Supabase (PostgreSQL) + Express API
**Version:** 1.0.0

---

## 1. Database Schema (Supabase / PostgreSQL)

### 1.1 `profiles` Table
Extends Supabase Auth `auth.users`. One row per user.

```sql
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'user'
                CHECK (role IN ('admin', 'manager', 'user')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 1.2 `leads` Table

```sql
CREATE TABLE public.leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  company     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN (
                  'new', 'contacted', 'qualified',
                  'proposal', 'closed_won', 'closed_lost'
                )),
  notes       TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by  UUID NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX idx_leads_status     ON leads(status);
CREATE INDEX idx_leads_email      ON leads(email);
CREATE INDEX idx_leads_created_by ON leads(created_by);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_fulltext   ON leads USING gin(to_tsvector('english', full_name || ' ' || company));
```

### 1.3 `activity_log` Table

```sql
CREATE TABLE public.activity_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id        UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES profiles(id),
  action         TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  changed_fields JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_lead_id   ON activity_log(lead_id);
CREATE INDEX idx_activity_created_at ON activity_log(created_at DESC);
```

---

## 2. Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update only own
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Leads: all authenticated users can read
CREATE POLICY "leads_select_authenticated" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Leads: all authenticated can insert
CREATE POLICY "leads_insert_authenticated" ON leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Leads: managers and admins can update
CREATE POLICY "leads_update_manager_admin" ON leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('manager', 'admin')
    )
  );

-- Leads: only admins can delete
CREATE POLICY "leads_delete_admin" ON leads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 3. Dashboard Stats Query

```sql
SELECT
  COUNT(*)                                           AS total_leads,
  COUNT(*) FILTER (WHERE status = 'new'
    AND created_at > NOW() - INTERVAL '7 days')      AS new_leads,
  COUNT(*) FILTER (WHERE status = 'qualified')        AS qualified_leads,
  COUNT(*) FILTER (WHERE status IN ('closed_won', 'closed_lost')) AS closed_leads,
  COUNT(*) FILTER (WHERE status = 'closed_won')       AS won_leads,
  COUNT(*) FILTER (WHERE status = 'closed_lost')      AS lost_leads,
  jsonb_agg(jsonb_build_object('status', status, 'count', cnt))
    AS pipeline_breakdown
FROM (
  SELECT status, COUNT(*) as cnt FROM leads GROUP BY status
) sub, leads;
```

---

## 4. Express Server Structure

### 4.1 `server/server.js`
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import leadRoutes from './routes/lead.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import userRoutes from './routes/user.routes.js';
import activityRoutes from './routes/activity.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/v1/auth/', authLimiter);

app.use('/api/v1/auth',      authRoutes);
app.use('/api/v1/leads',     leadRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users',     userRoutes);
app.use('/api/v1/activity',  activityRoutes);

app.use(errorHandler);

export default app;
```

### 4.2 `server/middleware/auth.middleware.js`
```javascript
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const protect = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', decoded.id)
      .single();

    if (!profile) return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND' } });
    req.user = profile;
    next();
  } catch {
    return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN' } });
  }
};
```

### 4.3 `server/middleware/rbac.middleware.js`
```javascript
const ROLE_HIERARCHY = { user: 1, manager: 2, admin: 3 };

export const authorize = (...roles) => (req, res, next) => {
  const userLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
  const requiredLevel = Math.min(...roles.map(r => ROLE_HIERARCHY[r] ?? 99));

  if (userLevel < requiredLevel) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
    });
  }
  next();
};
```

### 4.4 `server/controllers/lead.controller.js`
```javascript
import { supabase } from '../config/supabase.js';
import { logActivity } from '../services/activity.service.js';
import { leadSchema } from '../validators/lead.validator.js';

export const getLeads = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase.from('leads').select('*', { count: 'exact' });

    if (search) query = query.ilike('full_name', `%${search}%`);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data,
      meta: { page: Number(page), limit: Number(limit), total: count }
    });
  } catch (err) { next(err); }
};

export const createLead = async (req, res, next) => {
  try {
    const parsed = leadSchema.parse(req.body);
    const { data, error } = await supabase
      .from('leads')
      .insert({ ...parsed, created_by: req.user.id })
      .select()
      .single();

    if (error) throw error;
    await logActivity(data.id, req.user.id, 'created', null);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = leadSchema.partial().parse(req.body);

    const { data: before } = await supabase.from('leads').select('*').eq('id', id).single();
    const { data, error } = await supabase.from('leads').update(parsed).eq('id', id).select().single();

    if (error) throw error;

    const changed = Object.keys(parsed).reduce((acc, key) => {
      if (before[key] !== data[key]) acc[key] = { from: before[key], to: data[key] };
      return acc;
    }, {});

    await logActivity(id, req.user.id, 'updated', changed);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
    await logActivity(id, req.user.id, 'deleted', null);
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
};
```

### 4.5 `server/services/activity.service.js`
```javascript
import { supabase } from '../config/supabase.js';

export const logActivity = async (leadId, userId, action, changedFields) => {
  await supabase.from('activity_log').insert({
    lead_id: leadId,
    user_id: userId,
    action,
    changed_fields: changedFields
  });
};
```

### 4.6 `server/validators/lead.validator.js`
```javascript
import { z } from 'zod';

export const leadSchema = z.object({
  full_name: z.string().min(2).max(100),
  email:     z.string().email(),
  phone:     z.string().min(7).max(20),
  company:   z.string().min(1).max(100),
  status:    z.enum(['new','contacted','qualified','proposal','closed_won','closed_lost']).default('new'),
  notes:     z.string().max(1000).optional()
});
```

---

## 5. Folder Structure (Full)

```
xdevflow-crm-assessment/
├── client/                         # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx      # Sidebar + nav layout
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── leads/
│   │   │   │   │   ├── page.tsx    # Lead list
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── edit/page.tsx
│   │   │   │   └── admin/
│   │   │   │       └── users/page.tsx
│   │   │   ├── layout.tsx          # Root layout (providers)
│   │   │   └── page.tsx            # Redirect
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── leads/
│   │   │   │   ├── LeadCard.tsx
│   │   │   │   ├── LeadForm.tsx
│   │   │   │   ├── LeadTable.tsx
│   │   │   │   ├── LeadStatusBadge.tsx
│   │   │   │   └── ActivityTimeline.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── PipelineChart.tsx
│   │   │   └── layout/
│   │   │       ├── Sidebar.tsx
│   │   │       ├── Header.tsx
│   │   │       └── ThemeToggle.tsx
│   │   ├── hooks/
│   │   │   ├── useLeads.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useDashboard.ts
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios instance
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── store/
│   │   │   └── authStore.ts        # Zustand
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── middleware.ts           # Route protection
│   ├── tailwind.config.ts
│   └── package.json
│
├── server/                         # Node.js + Express
│   ├── config/
│   │   └── supabase.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── lead.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── user.controller.js
│   │   └── activity.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   ├── models/                     # Supabase query helpers
│   │   ├── lead.model.js
│   │   └── profile.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── lead.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── user.routes.js
│   │   └── activity.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   └── activity.service.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   └── lead.validator.js
│   └── server.js
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```
