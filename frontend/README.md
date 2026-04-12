# Tyme Frontend

Premium React/Vite frontend for the Tyme app.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the frontend:

```bash
npm run dev -- --host 127.0.0.1 --port 4173
```

3. Make sure the backend is running at `http://127.0.0.1:3000`.

The frontend proxies `/api/*` requests to the local backend by default.

## Vercel Deployment

Deploy this repo as a separate Vercel project.

Set this environment variable in Vercel:

```bash
VITE_API_BASE_URL=https://your-backend-project.vercel.app
```

Do not place `GEMINI_API_KEY` or `ELEVENLABS_API_KEY` in the frontend Vercel project. Those stay in the backend/API project only.

`vercel.json` is included so React Router routes like `/login`, `/dashboard`, and `/captain/dashboard` resolve correctly in production.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run preview`
