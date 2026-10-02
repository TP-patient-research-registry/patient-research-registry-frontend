# Patient Research Registry — Frontend

Web app connecting patients and volunteers with clinical research studies in Slovakia.
This repository contains the frontend only; the backend is a separate Django REST API.

> Status: scaffold. Routes, layouts, config and tooling are in place; pages are placeholders
> listing what each one should do (see the TODO list rendered on every page).

## Stack

| Concern         | Choice                                                                       |
| --------------- | ---------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, `src/`, TypeScript strict), React 19                 |
| Package manager | pnpm (version pinned in `package.json#packageManager`, enabled via corepack) |
| UI              | Tailwind CSS 4, shadcn/ui (Radix), lucide icons, sonner toasts               |
| Forms           | React Hook Form + Zod                                                        |
| Data fetching   | TanStack Query + `openapi-fetch` typed by `openapi-typescript`               |
| i18n            | next-intl — `sk` (default), `en`                                             |
| Quality         | ESLint, Prettier, Vitest + Testing Library, Playwright                       |
| Delivery        | Docker (standalone output), GitHub Actions → `ghcr.io`                       |

### Authentication

No auth library is used. Authentication is Django **session cookies**:

- Browser requests go to the same origin under `/api/*`; `src/proxy.ts` forwards them to Django
  (`API_INTERNAL_URL`), so the `sessionid` and `csrftoken` cookies work without CORS.
- `apiClient` (`src/lib/api/client.ts`) sends `credentials: "include"` and adds the
  `X-CSRFToken` header (read from the `csrftoken` cookie) to every unsafe request.
- Route guard: `src/proxy.ts` calls `GET /api/auth/session` for `/participant/*` (role
  `participant`) and `/researcher/*` (roles `researcher`, `organization`). Anonymous users are
  redirected to `/login?next=…`, users with the wrong role to `/403`.

> Next.js 16 renamed `middleware.ts` to `proxy.ts` (same API, `middleware` is deprecated) —
> that's why the guard lives in `src/proxy.ts`.

## Getting started

Requirements: Node.js 22+, corepack (bundled with Node 22).

```bash
corepack enable          # provides the pinned pnpm version
pnpm install
cp .env.example .env.local   # set API_INTERNAL_URL=http://localhost:8000 for local dev
pnpm dev                 # http://localhost:3000 → redirects to /sk
```

### Environment variables

| Variable              | Where   | Description                                                              |
| --------------------- | ------- | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | browser | API base path, default `/api` (inlined at build time)                    |
| `API_INTERNAL_URL`    | server  | Django URL reachable from the Next.js server, e.g. `http://backend:8000` |
| `API_URL`             | scripts | Backend URL used by `pnpm gen:api` (default `http://localhost:8000`)     |

### API types

```bash
API_URL=http://localhost:8000 pnpm gen:api
```

Downloads `${API_URL}/api/schema/` and regenerates `src/lib/api/schema.d.ts` (a committed
placeholder exists so the project compiles without a running backend). `apiClient` uses
`NEXT_PUBLIC_API_URL` (`/api`) as its base URL, so schema paths are expected to be relative to
`/api` — in drf-spectacular set `SCHEMA_PATH_PREFIX_TRIM = True` (or adjust `baseUrl`).

## Scripts

| Script           | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `pnpm dev`       | Dev server                                           |
| `pnpm build`     | Production build (`.next/standalone`)                |
| `pnpm start`     | Start the production build                           |
| `pnpm lint`      | ESLint (`lint:fix` to autofix)                       |
| `pnpm format`    | Prettier write (`format:check` in CI)                |
| `pnpm typecheck` | Generate route types + `tsc --noEmit`                |
| `pnpm test`      | Vitest unit/component tests (`test:watch`)           |
| `pnpm test:e2e`  | Playwright (run `pnpm exec playwright install` once) |
| `pnpm gen:api`   | Regenerate API types from the OpenAPI schema         |

## Folder structure

```
messages/                 sk.json, en.json (UI strings, incl. placeholder page texts)
src/
  app/[locale]/
    layout.tsx            <html lang>, providers, skip link
    (public)/             landing, studies, studies/[id], login, register, verify-email, 403
    (participant)/        sidebar layout + /participant/* pages
    (researcher)/         sidebar layout + /researcher/* pages
  components/
    ui/                   shadcn/ui components
    layout/               header, footer, sidebar, app shell, placeholder page
    providers.tsx         TanStack Query + toaster
  features/               auth, consent, studies, questionnaires, profile
    <feature>/            components/, hooks/, schemas.ts (Zod), api.ts
  lib/
    api/                  client.ts (openapi-fetch), schema.d.ts (generated), query-keys.ts
    utils.ts              cn()
  i18n/                   routing.ts, navigation.ts, request.ts
  proxy.ts                /api forwarding, role guard, locale routing
tests/e2e/                Playwright specs
```

## Accessibility

- `<html lang>` follows the active locale.
- Each page renders exactly one `<main id="main-content">`; a skip-to-content link is the first
  focusable element.
- Visible `:focus-visible` outline globally; navigation uses `aria-current`.
- All form inputs are labelled (shadcn `FormLabel` / `Label`).

## Docker

```bash
docker build -t prr-frontend .
docker run -p 3000:3000 -e API_INTERNAL_URL=http://backend:8000 prr-frontend
```

Multi-stage build on `node:22-alpine`, runs as a non-root user on port 3000.

## CI

`.github/workflows/ci.yml`: install → lint → format check → typecheck → test → build on every
push and PR; on `main` it also builds and pushes `ghcr.io/<owner>/<repo>` (`latest` + `sha-…` tags).
