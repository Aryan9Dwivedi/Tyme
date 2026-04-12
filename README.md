## Stack

- Backend: Next.js App Router, TypeScript, Prisma, Neon Postgres
- Frontend: React + Vite app in `frontend/`
- Tailwind CSS
- Route handlers for auth, health, and recommendations

## Project Links

- [SETUP.md](./SETUP.md)
- [FLOW.md](./FLOW.md)
- [TASK.md](./TASK.md)

## Repo Structure

```text
frontend/               -> premium React/Vite frontend app
  src/                  -> user, captain, admin UI and auth flows
  vercel.json           -> frontend SPA routing for Vercel
src/
  app/
    (marketing)/        -> backend status page
    (workspace)/        -> backend placeholder/status routes
    api/                -> route handlers and backend entry points
  components/
    backend/            -> backend deployment status UI
    layout/             -> backend shells and navigation
    ui/                 -> reusable interface pieces
  lib/
    constants/          -> app name and shared config
  server/
    auth/               -> token/session helpers
    db/                 -> Prisma client wiring
    services/           -> scoring and recommendation logic
prisma/
  schema.prisma         -> production Postgres data model
```

## One Repo Rule

This repository is now the single source of truth for the project:

- backend/API lives at the repo root
- premium frontend lives in `frontend/`
- do not treat `Wildhack26Frontend` as the main repo anymore

## Useful Commands

```bash
npm install
npm run dev
npm run frontend:install
npm run frontend:dev
npm run check
npm run build
npm run frontend:check
npm run frontend:build
```

## Vercel Env Split

- Backend Vercel project: `DATABASE_URL`, `DIRECT_URL` (optional), `AUTH_SECRET`, `CORS_ALLOW_ORIGIN`, `GEMINI_API_KEY`, `GEMINI_MODEL` (optional), `ELEVENLABS_API_KEY`, `ELEVENLABS_SPEECH_MODEL` (optional)
- Frontend Vercel project: `VITE_API_BASE_URL` only

## Local URLs

- Backend: `http://127.0.0.1:3000`
- Frontend: `http://127.0.0.1:4173`

## Rename Point

If you want to rename the product later, change the core constants in `src/lib/constants/project.ts`.
