# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

SecureVault is a **backend learning project for a senior frontend engineer**, structured around the 15-checkpoint curriculum in [`requirement.md`](./requirement.md). The stack — Express + TypeORM + PostgreSQL + JWT + BullMQ — is intentionally chosen so the user can practice real backend patterns. When explaining backend concepts, prefer analogies to frontend equivalents the user already knows (middleware ≈ axios interceptors, repository ≈ react-query, etc.).

## Critical: scaffolding vs. wired code

**The running app intentionally exposes only `GET /health`.** Almost everything under `src/` is empty placeholders the user will fill in as they work through checkpoints. Do not "improve" by wiring things up unless asked.

| Path                                                                                 | State                                                                                          |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `src/index.ts`, `src/app.ts`                                                         | Implemented — bootstrap pattern + minimal Express factory                                      |
| `src/config/env.ts`                                                                  | Implemented — zod-validated env with **dev defaults for every var** (app boots without `.env`) |
| `src/db/data-source.ts`                                                              | Implemented — TypeORM `DataSource` configured but **`initialize()` is never called yet**       |
| `src/modules/example/`                                                               | **Reference implementation, NOT wired into routes** — copy this pattern for new modules        |
| `src/modules/<other>/`                                                               | Empty `index.ts` per checkpoint (auth, users, rbac, apikeys, encryption, configs, ...)         |
| `src/middlewares/`, `src/common/errors/`, `src/common/utils/`, `src/routes/index.ts` | Empty — user implements per checkpoint                                                         |

To make the example module actually serve requests, the user would need to (a) `app.use('/api/v1/examples', exampleRouter)` in `app.ts` and (b) `await AppDataSource.initialize()` in `bootstrap()`. Don't do this unless asked.

## Common commands

```bash
npm run dev              # tsx watch — primary dev loop
npm run typecheck        # tsc --noEmit
npm run lint             # eslint (flat config in eslint.config.mjs)
npm run lint:fix         # eslint --fix
npm run format           # prettier --write (tolerates empty test/ glob via --no-error-on-unmatched-pattern)
npm test                 # jest via cross-env NODE_ENV=test, --passWithNoTests
npm test -- path/to/file # run a single test file
npm run build            # rimraf + tsc + tsc-alias (the second step rewrites @/* to relative paths in dist/)
```

### Docker (postgres + redis)

Two tiers of control — **compose-wide** (`docker:*`) and **per-service** (`db:*` / `redis:*`):

```bash
npm run docker:setup       # one-shot first-time bootstrap (checks daemon, .env, pulls, starts, waits for health)
npm run docker:start       # daily start of postgres + redis
npm run db:reset           # wipe ONLY postgres volume + restart (per-service surgical)
npm run redis:reinstall    # pull newer redis image, recreate container, data kept
```

Per-service ops route through `scripts/docker-service.mjs <service> <action>`. The named volumes are pinned in `docker-compose.yml` (`securevault-postgres-data`, `securevault-redis-data`) so `docker volume rm` is deterministic regardless of cwd.

## Module pattern (mirrored from `src/modules/example/`)

Every feature module follows this six-file layout. The pattern is intentionally repetitive so the user sees the same shape across all checkpoints.

```
modules/<name>/
  <name>.entity.ts      TypeORM @Entity — DB schema
  <name>.dto.ts         zod schemas + z.infer types (CreateXDto, UpdateXDto)
  <name>.service.ts     const repo = () => AppDataSource.getRepository(Entity); CRUD methods
  <name>.controller.ts  Express handlers — inline zod.safeParse for validation (no middleware dep)
  <name>.routes.ts      Router + a LOCAL asyncRoute wrapper; binds controller methods to paths
  index.ts              public re-exports
```

The example deliberately does **not** depend on `@/common`, `@/middlewares`, or `@/routes` — each module is self-contained until the user extracts shared infrastructure (validation middleware, error handler, async wrapper) in later checkpoints. Preserve this isolation when filling in new modules.

## Architectural gotchas

- **Path alias `@/*` → `src/*`** is wired in three places: `tsconfig.json` (tsx + IDE), `tsc-alias` (build), `jest.moduleNameMapper`. If a new tool can't resolve `@/`, check all three.
- **`synchronize: false` everywhere** — the user opted into the migrations workflow (`npm run migration:gen -- <Name>` → `migration:run`). Do NOT turn `synchronize` back on, even in development; it silently drifts the DB out from under generated migrations and produces empty diffs.
- **Data-source entity glob is Windows-safe** — paths go through `toPosix()` because TypeORM's glob library trips on backslashes.
- **Express 4, not 5** — `Promise` rejections in route handlers don't propagate automatically. Each module defines its own `asyncRoute` helper (see `example.routes.ts`). Don't expect a global async error handler unless the user has built one.
- **No `AppDataSource.initialize()` in bootstrap.** If a change calls into `AppDataSource.getRepository(...)`, that code path will throw at runtime until the user wires initialization in. Mention this when relevant.
- **`reflect-metadata` is imported in `data-source.ts`**, not in `index.ts`. Anything that uses TypeORM decorators depends on `data-source.ts` being imported first.
- **TWO TypeScript runners on purpose** — `tsx` for everything fast (dev server, jest, scripts) and **`ts-node` only for the typeorm CLI**. tsx is built on esbuild, which silently ignores `emitDecoratorMetadata`; without metadata, TypeORM throws `ColumnTypeUndefinedError` on any `@Column()` that doesn't pass an explicit `type`. ts-node DOES emit metadata, so it stays in the loop for migrations.
- **`@Column()` MUST have an explicit `type`** — `@Column({ type: 'varchar', length: 255 })`, not bare `@Column()` with a TS-inferred type. The dev server (tsx) crashes on under-typed columns. This applies to every entity in `src/modules/*/`. `@PrimaryGeneratedColumn`, `@CreateDateColumn`, `@UpdateDateColumn` are exempt — they don't read metadata.
- **The `typeorm` npm script** is `node --require ts-node/register --require tsconfig-paths/register ./node_modules/typeorm/cli.js`. `tsconfig-paths/register` is required so entity imports like `@/modules/users` resolve.
- **Migration workflow**: edit entity → `npm run migration:gen -- <PascalCaseName>` → review the generated file in `src/db/migrations/` → `npm run migration:run`. The `migration:gen` wrapper enforces PascalCase and prepends `src/db/migrations/` so the user types only the descriptive part.
- **All env vars have dev defaults**, including `JWT_*` and `MASTER_ENCRYPTION_KEY` set to placeholder strings like `replace-me-*`. These exist so the dev server boots cleanly; production must override.

## Tooling discipline

- **Pre-commit hook (husky + lint-staged)** runs `eslint --fix` then `prettier --write` on staged files only. Don't disable hooks (`--no-verify`) without explicit user permission.
- **ESLint 9 flat config** in `eslint.config.mjs`. Custom rules: `@typescript-eslint/consistent-type-imports` is on (use `import type {...}`), `no-console` allows only `warn/error/info`.
- **Node pinned to 20.19.6** via `.nvmrc` + `.node-version` + `package.json` engines + `volta` block. Don't suggest features requiring newer Node.
- **Cross-platform scripts** — all npm scripts work on Windows / macOS / Linux. Helpers under `scripts/*.mjs` are pure Node. Don't introduce shell-specific syntax (`source`, `$()`, etc.) in package.json scripts.
