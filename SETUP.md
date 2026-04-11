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

- The current scaffold runs without real ElevenLabs, Solana, or database wiring.
- Those keys are included so the backend and integration work can plug in cleanly later.

## Run The App

```bash
npm run dev
```

Open `http://localhost:3000`

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
