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
npm run frontend:install
```

If Windows PowerShell blocks `npm`, run `npm.cmd install` instead.

## Configure Environment

1. Copy `.env.example` to `.env` in the repo root
2. Copy `frontend/.env.example` to `frontend/.env` only if you need a custom frontend API base URL locally
3. Fill only the keys you need for your task

Notes:

- Neon/Postgres and auth routes now require `DATABASE_URL` and `AUTH_SECRET`.
- Voice assist uses `ELEVENLABS_API_KEY` for transcription and `GEMINI_API_KEY` for task cleanup.
- `DIRECT_URL` is optional and only helpful for local Prisma migration/debug tooling.
- `CORS_ALLOW_ORIGIN` can stay as `*` for hackathon testing or be set to your frontend Vercel URL.
- `GEMINI_MODEL` and `ELEVENLABS_SPEECH_MODEL` are optional overrides; the defaults are already set in `.env.example`.
- Prisma scripts in this repo load from the root `.env`, so using `.env` keeps local app runs and CLI scripts aligned.
- Next/Vercel builds no longer crash during import-time env checks, but the API still needs the real env values at runtime.

## Run The App

```bash
npm run dev
npm run frontend:dev
```

Open:

- Backend/API: `http://127.0.0.1:3000`
- Frontend/UI: `http://127.0.0.1:4173`

The premium frontend now lives in `frontend/` inside this same repo.

## Vercel Deployment

This single GitHub repo now contains both apps:

- backend at the repo root
- frontend in `frontend/`

You can deploy them from the same repo using different Vercel project root directories.

Backend Vercel project:
- Root Directory: repo root

Frontend Vercel project:
- Root Directory: `frontend`

Required environment variables:

```bash
DATABASE_URL=...
AUTH_SECRET=...
CORS_ALLOW_ORIGIN=https://your-frontend-project.vercel.app
GEMINI_API_KEY=...
ELEVENLABS_API_KEY=...
```

Notes:

- The API routes are CORS-enabled for cross-origin frontend calls.
- Vercel install/build works with `DATABASE_URL`; `DIRECT_URL` is not required there.
- Run `npm run db:apply` locally before deploying schema changes.
- In the backend Vercel project, you can optionally set `GEMINI_MODEL` and `ELEVENLABS_SPEECH_MODEL` if you want to override the defaults.
- In the frontend Vercel project, set `VITE_API_BASE_URL` to the backend Vercel URL. Do not put provider API keys in the frontend project.

## Quality Checks

```bash
npm run check
npm run build
npm run frontend:check
npm run frontend:build
```

## Current Backend Routes

- `/`
- `/admin`
- `/captain`
- `/user`
- `/api/health`
- `/api/recommendations`
