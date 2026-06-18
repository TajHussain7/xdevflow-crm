# Product Requirements Document (PRD)
## XDevFlow CRM — Lead Management Platform
**Version:** 1.0.0 | **Status:** Draft | **Owner:** Engineering Assessment

---

## 1. Executive Summary

XDevFlow CRM is a modern, web-based Customer Relationship Management platform designed to help small-to-mid-sized businesses manage leads, track conversion pipelines, and analyze sales performance. This document defines the product vision, functional requirements, user stories, and acceptance criteria for the initial release.

---

## 2. Problem Statement

Sales teams operating without a unified CRM lose leads due to disorganized tracking, duplicate entries, and lack of pipeline visibility. They need a lightweight, fast, and intuitive platform that centralizes all lead data, makes status progression clear, and surfaces analytics without friction.

---

## 3. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Centralize lead data | 100% of leads accessible from a single dashboard |
| Reduce lead drop-off | Pipeline stage visibility per lead |
| Enable team reporting | Dashboard analytics load in < 1s |
| Secure access | Zero unauthorized access incidents |
| Fast onboarding | User can create a lead within 60 seconds of login |

---

## 4. Target Users

| Persona | Role | Primary Need |
|---|---|---|
| Sales Rep | User | Create, view, edit leads |
| Sales Manager | Manager | Assign leads, view team metrics |
| Admin | Admin | Full CRUD, user management, RBAC |

---

## 5. Functional Requirements

### 5.1 Authentication
- FR-AUTH-01: Users must log in using email + password.
- FR-AUTH-02: JWT tokens must be used for session management.
- FR-AUTH-03: Protected routes must redirect unauthenticated users to login.
- FR-AUTH-04: Logout must invalidate the active session.
- FR-AUTH-05: Passwords must be hashed (bcrypt, min 10 rounds).

### 5.2 Lead Management
- FR-LEAD-01: Users can create a lead with: Full Name, Email, Phone, Company, Status.
- FR-LEAD-02: Users can view a paginated list of all leads.
- FR-LEAD-03: Users can view a single lead's full profile.
- FR-LEAD-04: Users can update any field on a lead.
- FR-LEAD-05: Users can delete a lead (with confirmation prompt).
- FR-LEAD-06: Lead status must be one of: `new`, `contacted`, `qualified`, `proposal`, `closed_won`, `closed_lost`.

### 5.3 Dashboard Analytics
- FR-DASH-01: Display total lead count.
- FR-DASH-02: Display new leads count (created in last 7 days).
- FR-DASH-03: Display qualified leads count.
- FR-DASH-04: Display closed leads count (won + lost).
- FR-DASH-05: Show a pipeline funnel/chart by status.

### 5.4 Search & Filter
- FR-SEARCH-01: Real-time search by lead full name.
- FR-SEARCH-02: Filter leads by status via dropdown.
- FR-SEARCH-03: Combined search + filter must work simultaneously.

### 5.5 Role-Based Access Control (Bonus)
- FR-RBAC-01: Admin can create/edit/delete any lead and manage users.
- FR-RBAC-02: Manager can create/edit leads; cannot delete.
- FR-RBAC-03: User can view and create leads; cannot edit or delete.
- FR-RBAC-04: Role is assigned at registration and editable by Admin only.

### 5.6 Activity Timeline (Bonus)
- FR-ACT-01: Every create, update, delete action on a lead is logged.
- FR-ACT-02: Log entries contain: user, action type, changed fields, timestamp.
- FR-ACT-03: Timeline is visible on each lead's profile page.

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | API responses < 300ms p95 |
| Security | HTTPS enforced; JWT expiry 24h; bcrypt passwords |
| Scalability | Stateless backend; DB indexed on status, email |
| Accessibility | WCAG 2.1 AA contrast ratios |
| Responsiveness | Mobile-first; works on 375px–1440px viewports |
| Reliability | 99.5% uptime target on deployment |

---

## 7. Out of Scope (v1.0)

- Email/SMS integration
- Calendar syncing
- Payment tracking
- Multi-tenant architecture
- AI-driven lead scoring

---

## 8. User Stories

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-01 | Sales Rep | log in securely | my data is protected |
| US-02 | Sales Rep | create a new lead | I can track new prospects |
| US-03 | Sales Rep | search leads by name | I find contacts fast |
| US-04 | Sales Rep | filter by status | I see where leads stand |
| US-05 | Manager | see analytics on dashboard | I track team performance |
| US-06 | Manager | update lead status | I reflect real pipeline changes |
| US-07 | Admin | delete stale leads | I keep the CRM clean |
| US-08 | Admin | assign roles to users | I control team access |
| US-09 | Any User | view activity timeline | I understand lead history |

---

## 9. Acceptance Criteria (Core)

- [ ] Login with valid credentials returns JWT and redirects to dashboard.
- [ ] Invalid credentials return 401 with error message.
- [ ] Creating a lead with missing required fields returns 400 validation error.
- [ ] Dashboard stats reflect accurate real-time counts.
- [ ] Search updates lead list without page reload.
- [ ] Deleting a lead shows confirmation dialog before permanent removal.
- [ ] All routes behind `/dashboard` redirect to `/login` if no valid token.

---

## 10. Timeline (72-Hour Sprint)

| Hour | Milestone |
|---|---|
| 0–6 | Project scaffold, DB setup, Auth backend |
| 6–14 | Lead CRUD APIs, Supabase schema finalized |
| 14–22 | Frontend: Auth flow, Dashboard shell, Lead list |
| 22–32 | Frontend: Lead forms, Search/Filter, Lead profile |
| 32–44 | Dashboard analytics, Charts, RBAC |
| 44–56 | Activity timeline, Dark mode, Responsive polish |
| 56–64 | Docker setup, Deployment (Render/Railway/Vercel) |
| 64–72 | Final QA, README, GitHub cleanup, submission |
