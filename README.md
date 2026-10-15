# Burgundy Suite & Resort

An opulent luxury hotel & resort booking web application and property management system built with Next.js 16, TypeScript, Tailwind CSS, Cloudflare D1 (Serverless SQLite), and Cloudflare R2 (Object Storage).

---

## Quick Navigation

- **Guest Portal**: [http://localhost:3000](http://localhost:3000) — Curated luxury suite showcase, interactive reservation flow, and passwordless guest booking verification.
- **Admin Command Center**: [http://localhost:3000/admin](http://localhost:3000/admin) — Executive dashboard for real-time room occupancy, revenue KPIs, staff directory management, and Cloudflare D1 synchronization.
- **Full Architecture Documentation**: See [PROJECT_DOCUMENTATION.md](file:///c:/Users/Ian/OneDrive/Desktop/cha/burgundysuite/PROJECT_DOCUMENTATION.md) for deep-dive technical documentation covering frontend components, backend API routes, 7-table DBMS schema, and Cloudflare edge integrations.

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create `.env.local` based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Initialize / Sync Cloudflare D1 Database:**
   Navigate to the Admin Command Center (`/admin`), open the **Cloudflare D1** modal, and trigger the 1-click schema & seed migration.

