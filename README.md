# Muvance

Marketing website, call booking and a CRM for the Muvance agency, in one TypeScript monorepo.

| App               | URL (local)           | What it is                                                        |
| ----------------- | --------------------- | ----------------------------------------------------------------- |
| `apps/web`        | http://localhost:5173 | Public landing page + `/book` call booking + `/thank-you`         |
| `apps/admin`      | http://localhost:5174 | CRM: leads, pipeline, meetings, team & roles, booking settings    |
| `apps/api`        | http://localhost:4000 | Express API: bookings, auth, CRM (MongoDB)                        |
| `packages/shared` | –                     | Zod schemas, roles/permissions and types shared by all three apps |

## Tech stack

| Area     | Tools                                                                       |
| -------- | --------------------------------------------------------------------------- |
| Frontend | React 19, Vite, React Router, TanStack Query, Tailwind CSS, Motion, dnd-kit |
| Backend  | Node.js, Express 5, MongoDB, Zod, Pino, Helmet, bcrypt, rate limiting       |
| Infra    | Docker, Caddy (automatic HTTPS), GitHub Actions → GHCR → VPS, MongoDB Atlas |
| Tooling  | npm workspaces, Turborepo, TypeScript, ESLint, Prettier, Vitest, Supertest  |

## Getting started

Requires Node.js 22+ (see `.nvmrc`).

```bash
npm install
npm run dev
```

The API starts with a throwaway **in-memory MongoDB** (no install needed) and creates a dev account:

> **owner@muvance.local** / **muvance-dev-password** → sign in at http://localhost:5174

To keep data between restarts, run a local MongoDB (`docker compose up -d mongo`) and set
`MONGODB_URI=mongodb://localhost:27018` in `apps/api/.env`, then create your account with
`npm run create-user -- --username you --role owner` (it asks for a password), or
`npm run create-owner -- --email you@example.com` and open the printed link.

### Run the production stack locally (Docker)

```bash
npm run docker:up        # builds and starts mongo, api, web, admin and caddy
docker compose exec api node dist/create-owner.js --email you@example.com
```

Website: http://localhost:8180 · Admin: http://localhost:8181 · Stop with `npm run docker:down`.

## Scripts (run from the root)

| Command                  | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `npm run dev`            | Start web, admin and API in watch mode          |
| `npm run build`          | Production build of all apps                    |
| `npm run test`           | Run all tests (API tests use MongoDB)           |
| `npm run lint`           | Lint all packages                               |
| `npm run typecheck`      | Type-check all packages                         |
| `npm run format`         | Format with Prettier                            |
| `npm run create-owner`   | Print a one-time sign-up link for an Owner      |
| `npm run create-user`    | Create a username account (asks for a password) |
| `npm run docker:up/down` | Start/stop the Docker stack                     |

## The CRM

It follows Muvance's sales process: two meetings, then a yes or a no.

| Stage            | What happens                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| Discovery booked | They booked a call on the website (or you added them and scheduled one)                                         |
| Discovery done   | You held the call and fill in the **discovery form** (revenue, 6-month goal, margin, ad spend, ROAS, channels…) |
| Team review      | The team sets the **offer**: monthly sales target and Muvance's share (%)                                       |
| Proposal booked  | You schedule the proposal meeting yourself (any time, not limited to website hours)                             |
| Won / Lost       | They said yes, or no. Lost is final and needs a reason; there are no follow-ups                                 |

- Stages move automatically where they can: website bookings start at Discovery booked, marking the
  discovery call done moves to Discovery done, and scheduling a proposal moves to Proposal booked.
- Each lead page shows the **next step** with one-click actions ("Mark call done", "Send to team
  review", "They said yes / no").
- **No-shows** can rebook on the website; a lost lead re-opens automatically when they book again.
  Marking a lead lost cancels its upcoming meetings, freeing those times.
- The **dashboard** shows show-up rate, proposal rate, close rate, average agreed share and why
  leads are lost. The pipeline board supports drag and drop; lists support search, filters, bulk
  edits and CSV export (with all discovery and offer fields).

### Roles

| Role   | Can do                                                                    |
| ------ | ------------------------------------------------------------------------- |
| Owner  | Everything, including managing admins                                     |
| Admin  | Everything; manages members and viewers                                   |
| Member | View and work leads (notes, stages, calls). No delete, export or settings |
| Viewer | Read-only                                                                 |

Teammates join through **invite links** (Team → Invite). Password resets work the same way. The API
enforces every permission; the admin UI only hides what you can't use.

## Project structure

```
muvance/
├── apps/
│   ├── web/                  # Website (feature folders: landing, booking)
│   ├── admin/                # CRM (feature folders: auth, dashboard, leads, meetings, team, settings)
│   └── api/
│       ├── src/
│       │   ├── config/       # Env validation, default booking rules
│       │   ├── db/           # MongoDB client, indexes, document types
│       │   ├── middlewares/  # Auth & permissions, validation, rate limits, CSRF, errors
│       │   ├── modules/      # auth, team, leads, meetings, bookings, dashboard, settings, health
│       │   └── scripts/      # create-owner, create-user
│       ├── tests/            # Integration tests (Supertest + MongoDB)
│       └── Dockerfile
├── packages/shared/          # Zod schemas, roles & permissions, API types
├── docker/                   # Static-site Dockerfile + nginx config (web & admin)
├── deploy/                   # deploy.sh (health-checked deploy with rollback) + env examples
├── .github/workflows/        # ci.yml (checks + Docker builds), release.yml (build, push, deploy)
├── Caddyfile                 # HTTPS + routing for both domains
├── compose.production.yml    # Production stack (VPS)
├── docker-compose.yml        # Production-like stack on your machine
└── DEPLOY.md                 # How to set up the server and CI/CD
```

## Conventions

- **Feature-first.** Frontend code lives in `src/features/<name>`; API code in `src/modules/<name>`.
- **Shared contracts.** Request/response schemas and permissions live in `packages/shared`. The API
  validates with them and both frontends reuse the same types.
- **Path alias.** `@/` maps to `src/` in every app.
- **Errors.** Throw `HttpError` in the API; the error handler returns `{ error: { message, details } }`.

## Deploying

See **[DEPLOY.md](DEPLOY.md)**. In short: push to `main`, and CI tests everything, builds Docker images
and deploys them to the VPS, rolling back automatically if the new version isn't healthy.
