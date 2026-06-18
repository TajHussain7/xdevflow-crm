# XDevFlow CRM — Enterprise Client Management Portal

XDevFlow CRM is a professional, high-performance, and secure enterprise Customer Relationship Management (CRM) portal. It is engineered to aggregate leads, visualize pipeline health, enforce strict Role-Based Access Control (RBAC), and maintain a detailed, tamper-evident audit history of all lead updates and modifications.

Built with **Next.js 16 (App Router)**, **Node.js Express REST API**, and **Supabase (PostgreSQL)**, it adheres to modern performance, security, and scalability standards.

---

## 🏗️ Project Architecture & Subsystems

This codebase is structured as a monorepo consisting of two primary subsystems:

```
xdevflow-crm-assessment/
├── .github/workflows/    # CI/CD pipeline specifications (PR and Push validation)
├── client/               # Next.js 16 frontend application (React, Tailwind CSS v4, TanStack Query)
├── server/               # Node.js & Express REST API backend (JWT auth, RBAC, Supabase SDK)
├── docs/                 # Documentation directory (PRD, TRD, UI/UX, Schemas)
├── schema.sql            # PostgreSQL DDL for Supabase (tables, triggers, policies)
└── docker-compose.yml    # Multi-container local orchestration
```

### 1. Next.js Web Client (`/client`)
- **Framework**: Next.js 16 with App Router.
- **Styling**: Tailwind CSS v4 utilizing local `@theme` design tokens and CSS variables.
- **Icons**: Google Material Symbols Outlined loaded asynchronously for performance.
- **State & Data Fetching**: TanStack React Query (v5) for cache validation and query state, combined with Zustand for client-side auth state.
- **Packaging**: Containerized via a multi-stage `Dockerfile` with standard standalone optimization.

### 2. Express API Server (`/server`)
- **Runtime**: Node.js 20+ executing ECMAScript Modules (ESM).
- **Core Framework**: Express with security middlewares (`helmet`, `cors` configuration, `express-rate-limit`).
- **Database Access**: Direct query capability via the Supabase Node.js SDK using `service_role` privileges where needed.
- **Input Validation**: Zod-based JSON schema validation middlewares intercepting request bodies.

### 3. Database Layer (`/schema.sql`)
- **Engine**: Supabase PostgreSQL.
- **Structure**:
  - `profiles`: Organizational users mapped via Supabase Auth.
  - `leads`: Lead contacts tracking sales stage, values, and assignees.
  - `activity_log`: Historical record of differential state changes.
- **Automation**: SQL triggers that autoprovision user profiles on auth signup and write lead change differentials to the log table.

---

## 🔒 Security Architecture

1. **Authentication**: Handled via secure, cryptographically signed JSON Web Tokens (JWT) stored in a secure, `HttpOnly`, `SameSite=Lax` cookie to protect against Cross-Site Scripting (XSS).
2. **Role-Based Access Control (RBAC)**: Enforced via Express server middleware validating a strict role hierarchy:
   - `user`: Read-only lead access, ability to create new leads.
   - `manager`: Edit lead properties, assign leads to team members, update pipeline stages.
   - `admin`: Full administrative control, including deleting leads and changing user roles (`user` ↔ `manager` ↔ `admin`).
3. **Database Security & RLS**: PostgreSQL Row-Level Security (RLS) is applied to ensure that direct client connections cannot bypass schema checks.
4. **Environment Isolation**: Secrets are entirely extracted to environment variables, with `.gitignore` and `.dockerignore` configured to prevent leakages to VCS or container images.

---

## 🚀 Local Development Setup

### 1. Database Provisioning
1. Log in to your **Supabase Dashboard** and create a new project.
2. Navigate to the **SQL Editor** tab.
3. Open the file [schema.sql](file:///c:/Users/DAR%20LAPTOPS/Desktop/xdevflow-crm-assessment/schema.sql), copy its contents, paste them into the SQL Editor, and click **Run**.
4. This script will provision all required tables, triggers, indexes, and initial constraints.

### 2. Environment Variables Configuration
Copy the template file [.env.example](file:///c:/Users/DAR%20LAPTOPS/Desktop/xdevflow-crm-assessment/.env.example) to create the environment configs:

- **For local dev servers / Docker Compose**: Create a `.env` file in the **root** folder.
- **For standalone server**: Create `server/.env`.
- **For standalone client**: Create `client/.env.local`.

Fill in the variables:
```env
# SERVER CONFIG
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=<min-32-char-random-string>
JWT_EXPIRES_IN=24h
CLIENT_URL=http://localhost:3000

# CLIENT CONFIG
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

### 3. Run with Docker Compose
Ensure Docker Desktop is running, then execute:
```bash
docker-compose up --build
```
- Web Client: `http://localhost:3000`
- API Server: `http://localhost:5000`

### 4. Running Subsystems Separately (Manual Setup)

#### API Server Setup:
```bash
cd server
npm install
npm run dev
```

#### Client Setup:
```bash
cd client
npm install
npx next dev --webpack
```
> **Note**: On some Windows machines with file mapping issues, running Next.js dev server with `--webpack` is recommended to bypass Turbopack persistent cache file errors.

---

## 🧪 Testing and CI/CD Workflows

CI/CD pipelines are defined in `.github/workflows/` using GitHub Actions:

1. **Continuous Integration (`ci.yml`)**:
   - Triggers on: Pull Requests and pushes to `main` and `develop`.
   - Actions: 
     - Installs dependencies.
     - Runs ESLint checking for the client.
     - Compiles and builds the Next.js production build.
     - Performs backend syntax verification.
2. **Continuous Deployment (`deploy.yml`)**:
   - Triggers on: Pushes to `main` and `develop`.
   - Actions:
     - Log in to GitHub Container Registry (GHCR).
     - Builds the Server Docker image using Docker Buildx.
     - Tags the image dynamically with tags (`prod`, `dev`, and the short Git commit SHA).
     - Pushes the image to GHCR.
     - Optionally triggers a Render Deploy webhook.

---

## 🚢 Production Deployment Guide

### Frontend Deployment: Vercel
1. Log into [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Configure the Root Directory to **`client`**.
4. Select **Next.js** as the Framework Preset.
5. In **Environment Variables**, configure:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g. `https://your-api.onrender.com/api/v1`).
   - `NEXT_PUBLIC_SUPABASE_URL`: Your production Supabase URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your production Supabase Anon Key.
6. Click **Deploy**. Vercel will build the static client and publish it.

### Backend Deployment: Render (Web Service via Docker)
1. Log into [Render](https://render.com) and click **New → Web Service**.
2. Select **Deploy an existing image from a registry** (recommended) OR link your repository and choose **Docker** as the environment.
3. If deploying via registry:
   - Add your image URL (e.g., `ghcr.io/<your-github-username>/xdevflow-crm-assessment/server:prod`).
   - Set up registry credentials under Render Account Settings to allow pulling from GHCR.
4. If deploying directly from repository:
   - Set the root directory to **`server`**.
   - Select **Docker** as the Runtime.
5. In the **Environment Variables** panel, add:
   - `PORT`: `5000` (Render will automatically route requests to this port).
   - `NODE_ENV`: `production`.
   - `SUPABASE_URL`: Your production Supabase URL.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your production Supabase Service Role Key.
   - `JWT_SECRET`: A secure, random string (minimum 32 characters).
   - `JWT_EXPIRES_IN`: `24h`.
   - `CLIENT_URL`: The URL of your deployed Vercel frontend (e.g. `https://your-app.vercel.app`).
6. Click **Deploy Web Service**.

---

## 🌿 Git Branching & Security Guidelines

To maintain production integrity, implement the following branching model:

1. **Branch Definitions**:
   - `main`: Reflects the stable, production-ready codebase.
   - `develop`: The main integration branch for staging and testing.
   - `feature/name-of-feature`: Branch for individual feature developments, merged into `develop` via PRs.
2. **Branch Protection Rules (GitHub)**:
   - Go to **Settings → Branches** in your GitHub repository.
   - Add rules for `main` and `develop` branches:
     - Check **Require a pull request before merging**.
     - Check **Require status checks to pass before merging** (select `Continuous Integration` jobs).
     - Check **Restrict who can push to matching branches** (allowing only authorized administrators to merge after CI approval).
3. **Commit Restrictions**:
   - Never commit `.env` or `.env.local` files.
   - Ensure changes are linted and built locally using `npm run build` in the client before submitting PRs.
