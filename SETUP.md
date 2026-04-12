# Setup Guide

## Prerequisites

- Node.js `22.x`
- npm `10.x`
- Git

## Clone The Repo

```bash
git clone https://github.com/Aryan9Dwivedi/WildHack26.git
cd WildHack26
```

## Install Dependencies

```bash
npm install
```

If Windows PowerShell blocks `npm`, run `npm.cmd install` instead.

## Configure Environment

1. Copy `.env.example` to `.env.local`
2. Fill only the keys you need for your task

Notes:

- Neon/Postgres and auth routes now require `DATABASE_URL` and `AUTH_SECRET`.
- `DIRECT_URL` is optional and only helpful for local Prisma migration/debug tooling.
- `CORS_ALLOW_ORIGIN` can stay as `*` for hackathon testing or be set to your frontend Vercel URL.

## Run The App

```bash
npm run dev
```

Open `http://localhost:3000`

## Vercel Deployment

Deploy this backend repo as its own Vercel project.

Required environment variables:

```bash
DATABASE_URL=...
AUTH_SECRET=...
CORS_ALLOW_ORIGIN=https://your-frontend-project.vercel.app
```

Notes:

- The API routes are CORS-enabled for cross-origin frontend calls.
- Vercel install/build works with `DATABASE_URL`; `DIRECT_URL` is not required there.
- Run `npm run db:apply` locally before deploying schema changes.
- If your frontend is a separate Vercel project, set its `VITE_API_BASE_URL` to this backend URL.

## Quality Checks

```bash
npm run check
npm run build
```

## Current Starter Routes

- `/`
- `/admin`
- `/captain`
- `/user`
- `/api/health`
- `/api/recommendations`

## Suggested Work Split

- Person 1: landing page polish and shared UI
- Person 2: user and captain workflows
- Person 3: backend, API contracts, wallet, database
