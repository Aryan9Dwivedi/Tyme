## Stack

- Backend: Next.js App Router, TypeScript, Prisma, Neon Postgres
- Frontend: React + Vite app in `frontend/`
- Tailwind CSS
- Route handlers for auth, health, and recommendations

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

## Deployment Notes

- Backend Vercel project: set the root directory to `/`
- Frontend Vercel project: set the root directory to `frontend`
- Backend envs: `DATABASE_URL`, `AUTH_SECRET`, `CORS_ALLOW_ORIGIN`, `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`
- Frontend env: `VITE_API_BASE_URL`
