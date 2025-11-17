# BFSI Campaign Generator BFF

Node/Express backend that fronts Clerk authentication and Postgres storage for the BFSI Campaign Generator frontend.

## Scripts
- `pnpm --filter @apps/bff dev` — run dev server with ts-node-dev
- `pnpm --filter @apps/bff build` — compile to `dist`
- `pnpm --filter @apps/bff start` — run compiled server

## Environment
Copy `.env.example` to `.env` and fill in values:
- `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY`
- `DATABASE_URL` — Postgres connection string
- `ALLOWED_ORIGINS` — comma-separated list of allowed origins (e.g., `http://localhost:3000`)
- `PORT` — optional, defaults to 4000

## API
Base path: `/api/v1`
- `GET /health` — liveness
- `GET /me` — upserts and returns the current user (auth required)
- `GET /usage` — returns usage stats (auth required)
- `POST /campaigns/execute` — start a campaign, tracks usage, returns execution id (auth required)
- `GET /campaigns/:id/status|results|pending-approval` — stubs for workflow visibility (auth required)
- `POST /campaigns/:id/approve|reject` — approve/reject stub (auth required)
