# Application Flow Document
## XDevFlow CRM — User & System Flows
**Version:** 1.0.0

---

## 1. Authentication Flow

```
User visits /dashboard
        │
        ▼
[Next.js Middleware]
  Check JWT cookie
        │
   ┌────┴────┐
   │ Valid?  │
   └────┬────┘
     No │               Yes
        ▼                ▼
  Redirect to      Allow access
   /login          to /dashboard
        │
        ▼
   [Login Page]
   Enter email
   + password
        │
        ▼
  POST /api/v1/auth/login
        │
   ┌────┴────────────────┐
   │ Credentials valid?  │
   └────┬────────────────┘
   No   │             Yes
        ▼              ▼
  Show error     Set HttpOnly JWT cookie
  message        Redirect to /dashboard
```

---

## 2. Lead CRUD Flow

### 2.1 Create Lead
```
User clicks "New Lead"
        │
        ▼
  [Lead Create Modal / Page]
  Fill form fields:
  - Full Name (required)
  - Email (required, valid format)
  - Phone (required)
  - Company (required)
  - Status (default: "new")
        │
        ▼
  Client-side Zod validation
   ┌────┴────┐
   │ Valid?  │
   └────┬────┘
   No   │        Yes
        ▼          ▼
  Show field   POST /api/v1/leads
  errors       + JWT in cookie
                    │
               ┌────┴────────────────┐
               │ Server validation   │
               │ RBAC check (role)   │
               └────┬────────────────┘
               Fail │        Pass
                    ▼          ▼
               Return 400  Insert into DB
               / 403        Log activity
               error        Return 201
                                │
                                ▼
                        Invalidate React Query
                        cache, update list
```

### 2.2 Update Lead Status (Pipeline Flow)
```
Lead Status Pipeline:

  [new] → [contacted] → [qualified] → [proposal]
                                           │
                              ┌────────────┴────────────┐
                              ▼                          ▼
                        [closed_won]             [closed_lost]
```

### 2.3 Delete Lead
```
User clicks Delete icon
        │
        ▼
  [Confirmation Dialog]
  "Are you sure? This cannot be undone."
        │
   ┌────┴─────┐
   │ Confirm? │
   └────┬─────┘
   No   │          Yes
        ▼           ▼
   Close dialog  DELETE /api/v1/leads/:id
                 + RBAC check (admin only)
                      │
                      ▼
                 Soft delete or hard delete
                 Log activity
                 Return 200
                      │
                      ▼
                 Redirect to /leads
                 Show success toast
```

---

## 3. Dashboard Analytics Flow

```
User navigates to /dashboard
        │
        ▼
  React Query fetches GET /api/v1/dashboard/stats
        │
        ▼
  Server queries Supabase:
  - COUNT(*) as total_leads
  - COUNT(*) WHERE status = 'new' AND created_at > NOW()-7days
  - COUNT(*) WHERE status = 'qualified'
  - COUNT(*) WHERE status IN ('closed_won','closed_lost')
        │
        ▼
  Returns JSON stats object
        │
        ▼
  Render stat cards + Recharts pipeline funnel
```

---

## 4. Search & Filter Flow

```
User types in search box
        │
        ▼
  [Debounce 300ms]
        │
        ▼
  GET /api/v1/leads?search=john&status=qualified&page=1
        │
        ▼
  Server: WHERE full_name ILIKE '%john%'
          AND status = 'qualified'
          LIMIT 20 OFFSET 0
        │
        ▼
  Return paginated results
        │
        ▼
  React Query updates leads list
  URL params updated (shareable filter state)
```

---

## 5. Role-Based Access Flow (RBAC)

```
Every protected API request:
        │
        ▼
  [authMiddleware]
  Decode JWT → extract { userId, role }
        │
        ▼
  [rbacMiddleware(requiredRole)]
  Compare user.role vs requiredRole
        │
   ┌────┴──────────────────┐
   │ Has permission?       │
   └────┬──────────────────┘
   No   │           Yes
        ▼            ▼
   Return 403    Next() → controller
   "Forbidden"

Role Hierarchy:
  admin > manager > user

Route Permissions:
  GET  /leads       → user, manager, admin
  POST /leads       → user, manager, admin
  PUT  /leads/:id   → manager, admin
  DELETE /leads/:id → admin only
  GET  /users       → admin only
  PATCH /users/:id/role → admin only
```

---

## 6. Activity Timeline Flow

```
Lead action occurs (create / update / delete)
        │
        ▼
  activityService.log({
    lead_id,
    user_id,
    action: 'updated',
    changed_fields: { status: { from: 'new', to: 'qualified' } },
    timestamp: now()
  })
        │
        ▼
  INSERT INTO activity_log
        │
        ▼
  On lead profile page:
  GET /api/v1/activity/:leadId
  → Returns ordered timeline
  → Rendered as vertical timeline UI
```

---

## 7. Frontend Page Map

```
/                    → Redirect to /login or /dashboard
/login               → Auth page (public)
/register            → Register page (public)
/dashboard           → Analytics + stats (protected)
/leads               → Lead list + search/filter (protected)
/leads/new           → Create lead form (protected)
/leads/:id           → Lead profile + activity timeline (protected)
/leads/:id/edit      → Edit lead form (protected)
/admin/users         → User management (admin only)
```

---

## 8. API Request/Response Lifecycle

```
Client                    Express Server                  Supabase
  │                            │                              │
  │──── HTTP Request ─────────▶│                              │
  │                       cors()                              │
  │                       helmet()                            │
  │                       rateLimiter()                       │
  │                       authMiddleware()                    │
  │                       rbacMiddleware()                    │
  │                       zodValidator()                      │
  │                            │── Supabase query ──────────▶│
  │                            │◀─ Result / Error ───────────│
  │                       errorHandler()                      │
  │◀──── JSON Response ────────│                              │
```
