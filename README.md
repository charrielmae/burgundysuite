# Burgundy Suite & Resort

An opulent luxury hotel & resort booking web application and property management system (PMS) engineered as a modern **Monorepo** with **Nuxt 3** (Vue 3 + Tailwind CSS v4), **Nest.js 10** REST API, **Cloudflare D1** (Serverless SQLite), and **Cloudflare R2** (Object Storage), deployed via **Vercel Multi-Services**.

---

## Quick Navigation

- **Guest Luxury Portal**: [http://localhost:3000](http://localhost:3000) — Curated luxury suite showcase, interactive multi-step reservation flow, and passwordless guest stay verification.
- **Admin Command Center**: [http://localhost:3000/admin](http://localhost:3000/admin) — Executive dashboard for real-time room occupancy, aggregate revenue KPIs, floor inventory status switcher, staff directory management, and 1-click Cloudflare D1 synchronization.
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api) — Modular NestJS API controllers and services.
- **Full System Documentation**: See [PROJECT_DOCUMENTATION.md](file:///c:/Users/Ian/OneDrive/Desktop/cha/burgundysuite/PROJECT_DOCUMENTATION.md) for deep-dive technical documentation covering architecture, Vercel services deployment, the 7-table ERD database schema, and complete REST API specifications.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure Environment
Create `.env.local` based on `.env.example`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
- **Nuxt 3 Frontend**: [http://localhost:3000](http://localhost:3000)
- **Nest.js API**: [http://localhost:4000/api](http://localhost:4000/api)

### 4. Admin Access
Navigate to [http://localhost:3000/admin](http://localhost:3000/admin):
- **Email / Username**: `admin@burgundysuite.com` (or `admin_clara`)
- **Password**: `admin123password` (or `admin123`)

---

## Better Auth & Better Auth Infra (Dash + Sentinel)

The application integrates **Better Auth** with `@better-auth/infra`:
- **Server Plugin**: `dash()` for telemetry, audit logs, and dashboard management APIs.
- **Client Plugin**: `sentinelClient()` for device fingerprinting, Proof-of-Work (PoW) auto-solving, and bot protection.
- **Server Handler**: `frontend/server/api/auth/[...all].ts` (routed at `/api/auth/*`).
- **Client Instance**: `frontend/lib/auth-client.ts` (`authClient`).

### Exposing to Better Auth Dash via Ngrok
To connect your local instance to the Better Auth Infra cloud dashboard:
```bash
npx ngrok http 3000
```
Then configure your public ngrok URL as the application URL in your Better Auth project dashboard.

---

## Deployment (Vercel Multi-Services)

This repository is configured to deploy as a unified **Vercel Multi-Services Project** using [vercel.json](file:///c:/Users/Ian/OneDrive/Desktop/cha/burgundysuite/vercel.json):
- `/api/(.*)` routes directly to the **`backend`** service (NestJS).
- `/(.*)` routes to the **`frontend`** service (Nuxt 3).
- Inter-service binding automatically injects `BACKEND_URL` into the frontend service.
