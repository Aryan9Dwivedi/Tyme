# Task Log

Use this file after a task is completed and merged or ready to merge. Keep entries short and factual.

## Log Template

```md
### YYYY-MM-DD - Short task name
- Owner:
- Branch:
- Area:
- Files touched:
- Validation:
- Notes:
```

## Ownership Board

- Landing and brand: `src/app/(marketing)`, `src/features/landing`, `src/components/ui`
- Captain and user flows: `src/app/(workspace)/captain`, `src/app/(workspace)/user`, `src/features/dashboard`
- Backend and data: `src/app/api`, `src/server`, `src/types`, `prisma`

## Completed Entries

| Task name | Task info | By | Status |
| --- | --- | --- | --- |
| Initial hackathon starter scaffold | 2026-04-11. Bootstrapped the project structure, starter routes, shared docs, recommendation mock, Prisma starter schema, and initial GitHub setup. Validation: `npm run check`, `npm run build`. | Codex | Completed |
| Starter task log and completion docs | 2026-04-11. Added and updated contribution flow and task tracking so work can be recorded and shared across the team. | Codex | Completed |
| Neon Postgres DB migration and schema redesign | 2026-04-11. Replaced the starter SQLite setup with Neon/Postgres, redesigned the schema for users, captain profiles, skills, tasks, offers, assignments, wallets, transactions, and ratings, added Prisma config, migration SQL, seed script, and shared Prisma client wiring. Validation: `npx prisma validate`, `npm run db:setup`, `npm run check`. | Codex | Completed |
| Neon database population and remote push | 2026-04-11. Applied the schema to Neon, seeded test data, verified live table counts, synced with the latest remote `main`, and pushed the DB updates to GitHub. | Codex | Completed |
| DB-backed auth and role-based frontend access | 2026-04-11. Added secure signup/login APIs backed by Neon/Postgres, password hashing, signed auth tokens, seeded demo passwords, frontend login and signup screens, token-based session handling, and route protection so users only reach their own role workspace. Validation: `npm run db:apply`, `npm run db:seed`, `npm run check`, `npm run build`, `npm run typecheck`, frontend `npm run build`, and live API smoke tests for user signup, captain signup, admin login, `/api/auth/me`, and direct DB verification. | Codex | Completed |
| Base44 removal and Vercel deployment readiness | 2026-04-11. Removed the remaining Base44 SDK/plugin/config references from the frontend repo, replaced them with native Vite config, added frontend SPA routing for Vercel, added backend CORS/preflight handling for cross-origin auth/API requests, added Vercel environment templates, and updated setup docs for separate frontend/backend deployment. Validation: backend `npm run check`, `npm run build`, frontend `npm run lint`, `npm run typecheck`, `npm run build`, and live CORS preflight checks against `/api/auth/login` and `/api/auth/me`. | Codex | Completed |
| Vercel Prisma generation build fix | 2026-04-11. Fixed the backend Vercel build so Prisma client generation always happens during install/build in fresh environments, and pinned the Node engine to `22.x` for more stable Vercel deployments. Validation: backend `npm run check`, backend `npm run build`, and a clean rebuild after deleting `node_modules/.prisma`. | Codex | Completed |
| Tyme rename and Vercel env fallback | 2026-04-11. Renamed the product branding from TimeBridge to Tyme across backend and frontend, reseeded the demo auth accounts, and updated Prisma config so Vercel install/build falls back to `DATABASE_URL` when `DIRECT_URL` is not set. Validation: `npm run db:seed`, backend `npm run check`, backend `npm run build`, frontend `npm run lint`, frontend `npm run typecheck`, and frontend `npm run build`. | Codex | Completed |
| Vercel import-time env hardening | 2026-04-11. Made Prisma and auth secret resolution lazy so Next/Vercel can evaluate API route modules during build without crashing when runtime envs are checked at import time. Validation: backend `npm run build` with `DATABASE_URL` and `AUTH_SECRET` unset in-shell for the build process. | Codex | Completed |
