## Stack

- Next.js App Router
- TypeScript with strict mode
- Tailwind CSS v4
- Route handlers for starter APIs
- Prisma schema placeholder for the database model

## Project Links

- [SETUP.md](./SETUP.md)
- [FLOW.md](./FLOW.md)
- [TASK.md](./TASK.md)

## Team-Safe Structure

```text
src/
  app/
    (marketing)/        -> landing page
    (workspace)/        -> admin, captain, user dashboards
    api/                -> route handlers and backend entry points
  components/
    layout/             -> shared shells and navigation
    ui/                 -> reusable interface pieces
  features/
    dashboard/          -> role-based dashboard configs and screens
    landing/            -> homepage content and sections
    recommendations/    -> recommendation previews and related UI
  lib/
    constants/          -> app name, navigation, ownership lanes
    mocks/              -> demo data for local development
  server/
    services/           -> scoring and recommendation logic
  types/                -> shared TypeScript contracts
prisma/
  schema.prisma         -> starter relational data model
```

## Ownership Suggestion

- Teammate 1: `src/app/(marketing)`, `src/features/landing`, `src/components/ui`
- Teammate 2: `src/app/(workspace)/captain`, `src/app/(workspace)/user`, `src/features/dashboard`
- Teammate 3: `src/app/api`, `src/server`, `src/types`, `prisma`

## Useful Commands

```bash
npm install
npm run dev
npm run check
npm run build
```

## Rename Point

If you want to rename the product later, change the core constants in `src/lib/constants/project.ts`.
