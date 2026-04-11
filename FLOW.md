# Contribution Flow

This repo is structured so three people can ship in parallel without breaking each other.

## Ground Rules

1. Pull the latest `main` before starting work.
2. Create one branch per task.
3. Stay inside your lane unless you explicitly coordinate with the owner of another lane.
4. Run `npm run check` before every push.
5. Run `npm run build` before every merge to `main`.
6. Add a short completion log in `TASK.md` once your task is done.

## Branch Naming

- `feature/landing-hero-refresh`
- `feature/captain-accept-flow`
- `feature/api-task-create`
- `fix/recommendation-score-bug`

## Team Lanes

- Landing and brand: `src/app/(marketing)`, `src/features/landing`, `src/components/ui`
- Captain and user flows: `src/app/(workspace)/captain`, `src/app/(workspace)/user`, `src/features/dashboard`
- Backend and data: `src/app/api`, `src/server`, `src/types`, `prisma`

## Safe Merge Routine

1. `git checkout main`
2. `git pull origin main`
3. `git checkout -b feature/your-task-name`
4. Build only your task inside your lane.
5. Run `npm run check`
6. Run `npm run build`
7. Commit with a clear message.
8. Push the branch.
9. Merge only after the branch is healthy.

## Commit Style

- `feat: add captain dashboard starter cards`
- `feat: scaffold recommendation api route`
- `fix: align dashboard navigation spacing`
- `docs: add setup and contribution flow`

## Merge Rules

- Do not push broken code to `main`.
- Do not mix unrelated features in one branch.
- Do not rewrite someone else’s lane without talking to them first.
- If two tasks touch the same file, coordinate before merging.

## Definition Of Done

- The feature works locally.
- Linting passes.
- The project still builds.
- `TASK.md` has a completion entry.
- The code stays inside the correct folder boundary.
