# Rollout & Validation Plan

## Local setup
- Copy `.env.example` to `.env` for the frontend and `apps/bff/.env.example` to `apps/bff/.env`.
- Start Postgres (e.g., Docker) and update `DATABASE_URL`; run the BFF once to auto-create tables (`users`, `usage_stats`).
- Install deps with `pnpm install` at repo root (workspace will pull backend deps). Start services: `pnpm dev` (frontend) and `pnpm dev:bff` (backend).

## Auth integration checks
- Verify Clerk keys are loaded in both apps; sign up/sign in flows via `/signup` and `/login` should redirect to dashboard on success.
- Hitting protected routes (`/dashboard`, `/create`, `/execution/:id`, `/review/:id`, `/results/:id`) while signed out should redirect to `/login` (middleware + Clerk enforcement).
- Confirm frontend API calls send Clerk JWT via `getToken` and BFF responds with 200; invalid/missing token should return 401.

## Functional smoke tests
- Create campaign: upload sample CSV (<100 rows), enter prompt/tone, submit. Expect execution id and navigation to `/execution/:id`; usage increments in UI.
- Polling pages: `/execution/:id`, `/review/:id`, `/results/:id` should render stubbed data from BFF with no auth errors.
- Usage limits: exceed row/campaign limits to trigger limit dialog on create page; verify messaging.

## Data validation
- BFF tables auto-create on boot; verify `users` row created/updated on first authed request and `usage_stats` increments with campaign start.
- Ensure CORS `ALLOWED_ORIGINS` covers frontend origin; adjust as needed.

## CI/CD updates
- Add workspace install/build/test steps for both packages in CI (frontend Next build/test, backend `tsc`/lint once deps installed).
- Provision env vars in deployment targets: Clerk keys, `NEXT_PUBLIC_BFF_URL`, `DATABASE_URL`, `ALLOWED_ORIGINS`, `PORT`.

## Feature flags & migration safety
- Keep existing mock store unused but available; toggle to new BFF paths is already wired. If needed, gate the new API calls behind a flag/env to allow fallback during rollout.
- Add synthetic Playwright flows for auth redirect and create flow using Clerk test users.
