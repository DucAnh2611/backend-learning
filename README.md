# SecureVault

Backend learning project — Node.js + Express + TypeScript + TypeORM (PostgreSQL).
See [`requirement.md`](./requirement.md) for the full 15-checkpoint curriculum.

## Stack

| Concern        | Library                          |
| -------------- | -------------------------------- |
| Runtime        | Node.js **20.19.6** (LTS Iron) — pinned in `.nvmrc` / `.node-version` / `package.json` engines |
| Framework      | Express 4                        |
| Language       | TypeScript 5                     |
| ORM            | TypeORM + `pg`                   |
| Auth           | `jsonwebtoken` + `bcryptjs`      |
| Validation     | `zod`                            |
| Queue          | BullMQ + ioredis                 |
| HTTP client    | axios                            |
| Logger         | pino + pino-http                 |
| Security       | helmet, cors, express-rate-limit |
| Tests          | jest + ts-jest + supertest       |
| CLI            | commander                        |
| Dev runner     | tsx (watch mode)                 |
| Lint / Format  | ESLint 9 (flat) + Prettier 3     |

## Getting started

```bash
nvm use                  # picks Node 20.19.6 from .nvmrc (optional)
npm install
npm run docker:setup     # one-shot: checks docker, copies .env, pulls images, boots postgres + redis, waits for health
npm run dev              # starts SecureVault on http://localhost:3000
```

> The HTTP server boots even without `.env` or Postgres — every env var in `src/config/env.ts` has a sensible dev default and DB failures are logged as warnings (the `/health` route still works). Endpoints that touch DB will return 500 until `npm run db:up` is running.

> Node version is pinned three ways: `.nvmrc` (for nvm), `.node-version` (for fnm / asdf / Volta auto-switch), and `engines` in `package.json` (npm will warn on mismatch).

## Local infra (docker)

Requires Docker Desktop (Windows / macOS) or Docker Engine (Linux).

### Compose-wide (`docker:*`) — operate on **all** services at once

| Command                    | What it does                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run docker:setup`     | **One-shot bootstrap**: verify Docker is running, create `.env`, pull images, start postgres + redis, wait for healthchecks |
| `npm run docker:start`     | Start postgres + redis in detached mode                                                   |
| `npm run docker:stop`      | Stop & remove containers (named volumes **kept**)                                         |
| `npm run docker:reset`     | Stop + remove **all** volumes + restart (data wiped for every service)                    |
| `npm run docker:reinstall` | Stop + pull latest images + restart (data **kept**)                                       |
| `npm run docker:logs`      | Tail logs from both services                                                              |
| `npm run docker:tools`     | Start **adminer** at <http://localhost:8080> (DB browser)                                 |

### Per-service — operate on **one** service only

Each accepts an action: `start` · `stop` · `reset` (wipe just this service's volume) · `reinstall` (pull just this image, no data loss).

| Postgres                      | Redis                            |
| ----------------------------- | -------------------------------- |
| `npm run db:start`            | `npm run redis:start`            |
| `npm run db:stop`             | `npm run redis:stop`             |
| `npm run db:reset`            | `npm run redis:reset`            |
| `npm run db:reinstall`        | `npm run redis:reinstall`        |

Under the hood, the per-service scripts call `scripts/docker-service.mjs <service> <action>` which runs the right `docker compose` sequence and removes the right named volume (`securevault-postgres-data` / `securevault-redis-data`) — no project-name guessing.

**When to use what**
- First clone or after a major upgrade → `npm run docker:setup`
- Daily start of services → `npm run docker:start` (or just `db:start` if you don't need redis yet)
- Wipe one service's data only → `npm run db:reset` / `npm run redis:reset`
- Bump to a newer image without losing data → `npm run db:reinstall` / `npm run redis:reinstall`
- Nuke everything and start over → `npm run docker:reset`

Service config (see `docker-compose.yml`):

- `postgres:16-alpine` on `${DB_PORT:-5432}` — credentials follow `.env` / `.env.example`
- `redis:7-alpine` on `${REDIS_PORT:-6379}` — used by BullMQ in checkpoint 11
- `adminer:4` on `${ADMINER_PORT:-8080}` — only when you run `db:tools` (hidden behind a compose profile)

Data persists across restarts in named volumes (`postgres-data`, `redis-data`). `db:reset` is the nuke button.

## Scripts

All scripts use cross-platform tools (`rimraf`, `cross-env`, node-based env init) — they work the same on Windows / macOS / Linux.

| Command                     | Purpose                                                |
| --------------------------- | ------------------------------------------------------ |
| `npm run dev`               | Start with watch (`tsx watch`)                         |
| `npm run build`             | Clean + `tsc` + `tsc-alias` (rewrites `@/*` in dist)   |
| `npm start`                 | Run compiled output                                    |
| `npm run clean`             | Remove `dist/` and `coverage/`                         |
| `npm run typecheck`         | `tsc --noEmit`                                         |
| `npm run lint` / `lint:fix` | ESLint                                                 |
| `npm run format`            | Prettier write                                         |
| `npm run format:check`      | Prettier check (CI)                                    |
| `npm test`                  | Jest (`NODE_ENV=test` via cross-env)                   |
| `npm run env:init`          | Copy `.env.example → .env` (cross-platform, idempotent)|
| `npm run migration:run`     | TypeORM migrations                                     |
| `npm run cli`               | Run the `vault` CLI (checkpoint 14)                    |

### Pre-commit

`husky` + `lint-staged` are wired up. On every `git commit`, staged files are auto-fixed:

- `*.ts` → `eslint --fix` then `prettier --write`
- `*.{json,md,yml,yaml}` → `prettier --write`

The hook is installed automatically by `npm install` (`prepare` script runs `husky`). If you cloned into a non-git folder, `husky` no-ops and the rest of install continues.

## Folder layout

```
src/
  index.ts            # entry: load env, init DB, start server, graceful shutdown
  app.ts              # express app factory (helmet, cors, rate limit, logger, routes, error handler)
  config/             # env schema (zod-validated, with dev defaults)
  db/                 # TypeORM data-source + migrations
  entities/           # shared/global entities (optional)
  modules/            # feature modules — one per checkpoint
    example/          # 👈 template: entity / dto / service / controller / routes / index
    auth/   users/   rbac/   apps/   apikeys/
    encryption/   configs/   audit/   export/
    security/   webhooks/   relationship/
  middlewares/        # validate, error, notFound, ...
  common/
    errors/           # AppError
    utils/            # logger (pino), asyncHandler
    types/
  routes/             # composes module routers under /api/v1
  jobs/               # BullMQ workers (checkpoint 11)
  cli/                # `vault` CLI entry (checkpoint 14)
tests/                # jest tests
scripts/              # node helper scripts (init-env, ...)
```

## Module pattern (see `src/modules/example/`)

Every feature module in this codebase will follow the same six-file layout. The `example/` folder ships **empty** — copy it and rename to start a new checkpoint, then fill in each file.

```
modules/<name>/
  <name>.entity.ts      # TypeORM @Entity — DB schema
  <name>.dto.ts         # zod input schemas + inferred TS types
  <name>.service.ts     # business logic + DB calls
  <name>.controller.ts  # thin request → service → response
  <name>.routes.ts      # express Router: routes + middlewares + handlers
  index.ts              # public re-exports
```

The running app only exposes `GET /health` out of the box. Everything else — middlewares (validation, error handling, auth), data-source, routes — is left empty for you to wire up as you reach each checkpoint.

## Path alias

`@/*` resolves to `src/*` in **tsx** (dev), **tsc-alias** (build output), and **jest** (`moduleNameMapper`).
Use `import { foo } from '@/common/utils'` everywhere instead of `../../common/utils`.
