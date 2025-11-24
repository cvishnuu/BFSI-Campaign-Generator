# Agent Notes

## High-level Overview
- This is the **BFSI Campaign Generator (BCG)** frontend monorepo (Next.js App Router). It now lives alongside a BFF skeleton (`apps/bff`), but the active campaign workflows call the **Workflow Automation MVP (WAM)** backend via the public API URLs set in `.env.local` (`NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_API_KEY` / `NEXT_PUBLIC_WORKFLOW_ID`).
- Clerk provides UI auth and route protection. WAM also uses Clerk and requires either a valid Clerk token or the correct API key for its guarded endpoints.

## Current Auth/Route Behavior
- Protected routes: `/dashboard` and `/create` (plus `/execution/[id]`, `/review/[id]`, `/results/[id]` are dynamic and assume an authenticated user in practice).
- Auth pages are catch-all: `app/login/[[...rest]]/page.tsx`, `app/signup/[[...rest]]/page.tsx` configured with `routing="path"` and `path` pointing to `/login`/`/signup`; middleware marks `/login(.*)` and `/signup(.*)` as public.
- Middleware: `middleware.ts` uses Clerk to protect app routes but skips `/login(.*)`/`/signup(.*)` and other public paths.

## API Client Behavior
- `lib/api.ts` targets WAM public API URL at `NEXT_PUBLIC_API_URL` (default `http://localhost:3001/api/v1`) with `NEXT_PUBLIC_API_KEY` and `NEXT_PUBLIC_WORKFLOW_ID`.
- Campaign calls (start/status/results/pending-approval/approve/reject) currently **send only the API key** via Authorization header; Clerk tokens are **not** sent for these calls.
- Frontend flows for execution/review/results no longer depend on Clerk tokens for API calls.

## WAM Backend Expectations (important for avoiding 401s)
- WAM backend uses `ClerkAuthGuard` on these public endpoints. It now **accepts an API key** if it matches `PUBLIC_API_KEY` in WAM backend env, or a valid Clerk token.
- To avoid 401/“invalid API key”, ensure WAM backend `.env` has `PUBLIC_API_KEY` set to the same value as BCG’s `NEXT_PUBLIC_API_KEY`, then restart the WAM backend.

## Project Structure Highlights
- **Frontend surface (App Router)**
  - `app/page.tsx`: marketing landing page.
  - `app/dashboard/page.tsx`: user dashboard showing usage stats (currently uses mock usage info; ensures user is signed in via Clerk).
  - `app/create/page.tsx`: CSV upload, prompt/tone input, usage limit checks, submission to WAM.
  - Dynamic flows: `app/execution/[executionId]`, `app/review/[executionId]`, `app/results/[executionId]`.
  - Auth pages: `app/login/[[...rest]]`, `app/signup/[[...rest]]` (Clerk `<SignIn>` / `<SignUp>` components).
  - Global styles: `app/globals.css`.
- **Components & libs**
  - `components/csv-upload.tsx`, `components/column-preview.tsx` handle CSV ingestion/validation.
  - `components/ui/*`: shadcn UI primitives (button, input, textarea, card, etc.).
  - `stores/auth-store.ts`, `stores/execution-store.ts`: legacy Zustand stores (largely unused since Clerk adoption but still present).
  - `lib/api.ts`: Axios client pointing to WAM public API with API key headers.
  - `lib/utils.ts`: utility helpers (cn, etc.).
- **Testing configs**
  - Unit tests under `__tests__/`.
  - `vitest.config.ts`, `playwright.config.ts`, `vitest.setup.ts`.
  - Sample data: `sample-customers-new.csv`, `test-customers.csv`.
- **Configs**: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `tailwind` config.

## Dev Scripts
- Root `package.json`:
  - `dev`: runs backend BFF (ts-node-dev) and Next frontend. BFF is optional; it isn’t used by the current workflow calls.
  - `dev:frontend`: Next dev server only.
  - `dev:bff`: Launches the ESM BFF (`apps/bff`); safe to ignore failures since workflow calls hit WAM directly.
  - Testing scripts: `pnpm test`, `pnpm test:coverage`, `pnpm test:e2e`.
- WAM (separate repo `workflow-automation-mvp`): `npm run dev` spins up both backend + frontend via Turborepo; ensure DB/Clerk/API key envs are present.

## Key Files
- `lib/api.ts`: API client to WAM using API key.
- `app/create/page.tsx`: Create campaign; calls `campaignApi.startCampaign` with API key only; checks are client-side for CSV/prompt.
- `app/execution/[executionId]/page.tsx`: Execution polling (API key only).
- `app/review/[executionId]/page.tsx`: Pending approval (API key only).
- `app/results/[executionId]/page.tsx`: Results polling (API key only).
- `middleware.ts`: Clerk route protection (public: login/signup/contact/pricing/uploadthing).
- Auth pages: `app/login/[[...rest]]/page.tsx`, `app/signup/[[...rest]]/page.tsx`.

## Known Caveats / History
- Earlier, Clerk tokens were sent to WAM and caused 401s because WAM middleware required cookies; reverted to API key.
- WAM backend now allows API key in `Authorization`/`x-api-key` and Clerk token; must set `PUBLIC_API_KEY` to match BCG.
- BFF exists but is unused for workflow calls; main dependency is WAM public API.
- EPERM errors when binding dev ports may occur in sandbox; run locally as needed.

## How to Get Running Quickly
1) In BCG `.env.local`, set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_API_KEY`, `NEXT_PUBLIC_WORKFLOW_ID`, and Clerk keys (already present).
2) In WAM backend env, set `PUBLIC_API_KEY` to the same value as BCG’s `NEXT_PUBLIC_API_KEY`; restart WAM backend.
3) Start BCG frontend (`npm run dev` or `pnpm run dev:frontend`), sign in via Clerk, and create a campaign; calls go to WAM with API key.

## If 401/Invalid API Key Happens Again
- Verify WAM `PUBLIC_API_KEY` matches BCG `NEXT_PUBLIC_API_KEY` and WAM backend restarted.
- Ensure BCG calls aren’t using Clerk tokens for WAM endpoints (lib/api.ts handles this by API key only).
- Check WAM backend logs; the guard falls back to API key if provided.
