# Tyme

Tyme is a real-time local help platform that lets people create everyday assistance requests, match with nearby captains, and manage the full workflow from task creation to completion, feedback, and reward release.

The product is designed to feel fast and operational: users can create tasks manually or through voice input, captains receive live ranked opportunities, assignments move through clear states, and both sides close the loop with feedback and Wild Cash reward tracking.

## Live Links

- Live app: `https://www.tyme.website`
- Login: `https://www.tyme.website/login`
- Backend API: `https://api.tyme.website`
- Repository: `https://github.com/Aryan9Dwivedi/WildHack26`

## What Tyme Does

Tyme supports three product roles:

- `User`: creates tasks, tracks matching progress, watches assignment state, and submits feedback.
- `Captain`: receives ranked nearby opportunities, accepts or passes tasks, works active assignments, and earns Wild Cash rewards.
- `Admin`: monitors platform activity, captains, transactions, and operational signals.

Core product capabilities:

- Manual task creation
- Voice-assisted task creation with transcription
- AI-assisted structuring of task details, category, urgency, and skills
- Real-time-feeling captain matching through live polling and task offers
- Captain opportunity feed and assignment workflow
- Two-sided feedback after completion
- Demo wallet funding and Wild Cash payout tracking
- Heatmap-style captain demand intelligence

## Product Workflow

The main workflow is:

1. A user logs in and creates a task.
2. The task can be entered manually or with voice input.
3. Tyme structures the task, suggests category and skills, and saves it.
4. The recommendation engine ranks nearby captains and creates task offers.
5. Captains see live opportunities, then accept or pass.
6. Once a captain accepts, the task becomes an assignment.
7. The user sees live status updates as the captain starts and completes the task.
8. Both sides submit feedback.
9. Reward release and wallet records are updated.

## Diagrams

### System Architecture

![Tyme System Architecture](./architecture-diagram.png)

### End-to-End User Flow

![Tyme User Flow Diagram](./user-flow-diagram.png)

### Database ER Diagram

![Tyme Database ER Diagram](./er-diagram.png)

## Architecture Overview

Tyme is organized as a monorepo with:

- a `Next.js` backend/API at the repository root
- a `React + Vite` frontend in `frontend/`
- a `PostgreSQL` database on Neon
- deployment split across two Vercel projects

High-level architecture:

- Frontend app (`www.tyme.website`)
  - React
  - Vite
  - React Router
  - TanStack React Query
  - Tailwind CSS
  - Leaflet heatmap views
- Backend API (`api.tyme.website`)
  - Next.js route handlers
  - Prisma ORM
  - JOSE-based auth/session handling
  - business logic for tasks, offers, assignments, feedback, and rewards
- Data layer
  - Neon PostgreSQL
  - relational schema for users, captains, tasks, offers, assignments, wallets, transactions, and ratings
- External intelligence/services
  - Google Gemini API
  - ElevenLabs API
  - Browser Geolocation API

## Tech Stack

### Frontend

- React
- Vite
- React Router
- TanStack React Query
- Tailwind CSS
- Radix UI
- Framer Motion
- Lucide React
- React Leaflet
- Leaflet Heat

### Backend

- Next.js
- Node.js
- TypeScript
- Prisma ORM
- JOSE
- bcryptjs

### Data / Infra

- PostgreSQL
- Neon Serverless Postgres
- Vercel

### AI / Voice

- Google Gemini API
- ElevenLabs API
- Browser Geolocation API
- MediaRecorder API

## Repository Structure

```text
WildHack26/
  frontend/                       React + Vite product UI
    public/                       frontend assets
    src/
      components/                 shared UI and captain-specific components
      lib/                        auth, API client, helpers
      pages/                      user, captain, admin, auth pages
  prisma/
    migrations/                   database migrations
    schema.prisma                 production schema
    seed.ts                       demo/test data
  public/                         backend public assets
  scripts/                        repo scripts
  src/
    app/                          Next.js routes and API handlers
    components/                   backend status UI
    server/
      auth/                       auth/session/password helpers
      db/                         Prisma wiring
      http/                       CORS helpers
      services/                   task flow, matching, AI, heatmap, wallet logic
    types/                        shared backend types
  README.md
  package.json
```

## Database Model

The core relational model includes:

- `User`
- `CaptainProfile`
- `Skill`
- `CaptainSkill`
- `Task`
- `TaskSkill`
- `TaskOffer`
- `Assignment`
- `Rating`
- `Wallet`
- `Transaction`

This schema powers:

- role-based access
- captain matching
- assignment state transitions
- feedback loops
- reward and wallet tracking

## Local Development

### Prerequisites

- Node.js `22.x`
- npm
- a Neon PostgreSQL database

### Install

```bash
npm install
npm run frontend:install
```

### Environment Variables

Create a root `.env` for the backend.

Important backend envs:

- `DATABASE_URL`
- `DIRECT_URL` (optional for local tooling)
- `AUTH_SECRET`
- `CORS_ALLOW_ORIGIN`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_SPEECH_MODEL`

Frontend env in `frontend/.env`:

- `VITE_API_BASE_URL`

Example values are already documented in [.env.example](./.env.example) and [frontend/.env.example](./frontend/.env.example).

### Database Setup

```bash
npm run db:generate
npm run db:apply
npm run db:seed
```

### Run Locally

Backend:

```bash
npm run dev
```

Frontend:

```bash
npm run frontend:dev
```

Local URLs:

- Backend: `http://127.0.0.1:3000`
- Frontend: `http://127.0.0.1:4173`

## Deployment

Tyme is deployed as two Vercel projects from the same repository:

### Backend project

- Root directory: `/`
- Domain: `api.tyme.website`

Required backend envs:

- `DATABASE_URL`
- `AUTH_SECRET`
- `CORS_ALLOW_ORIGIN`
- `GEMINI_API_KEY`
- `ELEVENLABS_API_KEY`

### Frontend project

- Root directory: `frontend`
- Domain: `www.tyme.website`

Required frontend env:

- `VITE_API_BASE_URL=https://api.tyme.website`

## Key API Areas

The backend currently exposes route groups for:

- auth
  - login
  - signup
  - session lookup
- tasks
  - create
  - update
  - detail
  - feedback
  - AI assist
  - voice assist
- captain
  - opportunities
  - assignments
  - accept / decline flows
  - availability
  - heatmap
- dashboards
  - user
  - captain
- wallet
- health

## Matching and Real-Time Feel

Tyme currently delivers a live product feel through fast polling and API refresh rather than sockets. That approach keeps the experience responsive while staying simpler to ship under hackathon constraints.

The recommendation engine is responsible for:

- ranking captains against a task
- creating and rolling task offers
- surfacing opportunities on captain dashboards
- feeding task state visibility back to the user

## Quality Checks

Useful project commands:

```bash
npm run check
npm run frontend:build
npm run frontend:check
npm run build
npm run build:all
```

## Why This Repo Looks This Way

This repository is the single source of truth for Tyme.

- Backend/API lives at the repository root
- Product frontend lives in `frontend/`
- Database schema and seed data live in `prisma/`

The earlier split frontend repo is no longer the main development source.

## Current Scope

This project is optimized for a strong hackathon MVP:

- working role-based product flows
- deployed frontend and backend
- voice + AI-assisted task creation
- captain dispatch flow
- assignment lifecycle
- feedback and reward logic

Some parts are intentionally demo-oriented:

- Wild Cash wallet funding includes demo funding behavior
- real-time updates use live polling instead of sockets
- production-grade compliance, payments, and trust/safety systems would be the next layer

## License

This repository is currently shared as a hackathon project codebase. Add a formal license if you plan to open-source or commercialize it further.
