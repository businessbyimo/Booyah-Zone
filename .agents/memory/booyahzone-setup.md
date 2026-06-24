---
name: BooyahZone project setup
description: Key architecture decisions and gotchas for the BooyahZone Free Fire tournament platform.
---

**Project:** BooyahZone — Free Fire tournament platform for Bangladesh (Bangla UI).

**Architecture:**
- Frontend: React 18 + Vite 5 + Tailwind CSS v3 (port 5000, workflow "Start application")
- Backend: Express 5 + PostgreSQL + Socket.io (port 3001, workflow "Backend API")
- DB: Replit built-in PostgreSQL (DATABASE_URL env var auto-set)

**Env vars (shared):** JWT_SECRET, REFRESH_SECRET, NODE_ENV — set via setEnvVars().

**Known gotchas:**
- Three.js WebGL doesn't work in Replit sandbox preview (no GPU) — handle gracefully with try/catch.
- react-icons GiSword doesn't exist — use GiCrossedSwords instead.
- Frontend node_modules has Tailwind v3, root has v4 — Vite uses frontend's v3 (correct).
- DB schema must be created manually via inline Node script (no schema.sql file, seed.js only inserts data).

**Admin credentials:** admin / Admin@123 (created by seed.js).

**Site branding:** BooyahZone, logo at /public/logo-nobg.png, dark theme (#050510 bg), cyan+fuchsia colors.
