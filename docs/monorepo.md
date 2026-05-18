# AIDA Monorepo

## Purpose

This document explains how the AIDA monorepo is structured and how to run shared workspace tasks.

## Package Manager

The repository uses `pnpm` workspaces. Workspace packages are defined in `pnpm-workspace.yaml`:

- `apps/*`
- `packages/*`

Install dependencies from the repo root:

```sh
pnpm install
```

## Workspace scripts

Run these from the **repository root**. Turborepo (`turbo run …`) orchestrates app and package scripts for `dev`, `build`, `lint`, `typecheck`, `test`, etc.

**Database and Supabase commands are root-only** — they call the Supabase CLI directly (see `package.json`), not Turbo tasks.

### Apps and packages (Turbo)

```sh
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:watch
pnpm test:chat
pnpm test:vault
pnpm test:api-gateway
pnpm test:background-service
pnpm test:packages
pnpm test:coverage
pnpm format
```

### Database (Supabase CLI, root `package.json`)

Full workflow and semantics: **[Database schema workflow](db-schema.md)**.

```sh
pnpm db:migration:new <name>
pnpm migrate:up
pnpm migrate:up:force
pnpm migrate:down
pnpm migrate:status
pnpm migrate:up:prod
pnpm migrate:up:force:prod
pnpm migrate:down:prod
pnpm migrate:status:prod
pnpm db:types
pnpm db:types:local
pnpm db:validate
pnpm db:validate:local
pnpm db:reset
```

| Script                                       | Purpose (short)                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `db:migration:new`                           | New migration file under `supabase/migrations/`.                                          |
| `migrate:up` / `migrate:up:prod`             | Push migrations to the **linked** Supabase project (`db push`).                           |
| `migrate:up:force` / `migrate:up:force:prod` | `db push --include-all` — use rarely, with team agreement.                                |
| `migrate:down` / `migrate:down:prod`         | Roll back last migration record on linked remote (`migration down --linked`).             |
| `migrate:status` / `migrate:status:prod`     | List local vs remote migration versions.                                                  |
| `db:types`                                   | Regenerate `packages/db/src/database-generated.types.ts` from the cloud Supabase project. |
| `db:types:local`                             | Regenerate `packages/db/src/database-generated.types.ts` from local Supabase.             |
| `db:validate`                                | Regenerate cloud types and fail if git diff shows uncommitted changes to that file.       |
| `db:validate:local`                          | Regenerate local types and fail if git diff shows uncommitted changes to that file.       |
| `db:reset`                                   | Intentionally disabled for cloud workflow (prints message and exits non-zero).            |

Scripts with `:prod` set `NODE_ENV=production` for parity with older repos; **they do not automatically switch Supabase projects** — use `supabase link` (or the right CLI profile) for the target you intend.

## Build and check flow

- `pnpm build` — Turbo runs `build` across workspaces.
- `pnpm lint` — ESLint across workspaces.
- `pnpm typecheck` — TypeScript checks across workspaces.
- `pnpm test` — tests per workspace via Turbo.
- `pnpm test:<app>` — Turbo filter for one app.
- `pnpm test:packages` — Turbo filter for `packages/*`.
- `pnpm test:coverage` — coverage per workspace, then merged coverage for CI.
- `pnpm format` — Prettier on supported extensions.

## Quality gates

- **Git hooks (Husky):**
  - `pre-commit` → `pnpm lint` and `pnpm typecheck` (fast checks on every commit).
  - `pre-push` → `pnpm test` (full Turbo-cached test run before code leaves your machine).
- **Schema / types:** after changing migrations, run `pnpm db:validate` before pushing (see [db-schema.md](db-schema.md)). This is **not** wired into `pre-push` because it requires `supabase login` / `supabase link` and network access.
- **CI:** pull requests run `lint`, `typecheck`, and `test` in parallel; `build` runs after those succeed. The **database dry run** job (PRs and `develop` / `rewrite` pushes) runs after build, runs `supabase db push --debug`, and smoke-generates types against a temporary Postgres using `--db-url`; it does not diff those types against the committed Supabase-generated file.

Build outputs for packages typically go to `dist/` per package `tsconfig`.

### Git hooks setup

[Husky](https://typicode.github.io/husky/) is the chosen hook tool and is wired through the root `prepare` script. Hooks live in `.husky/` and are committed to the repo.

```sh
pnpm install   # runs `prepare` → `husky` and registers the hooks
```

| Hook         | File                | Runs                             |
| ------------ | ------------------- | -------------------------------- |
| `pre-commit` | `.husky/pre-commit` | `pnpm lint` and `pnpm typecheck` |
| `pre-push`   | `.husky/pre-push`   | `pnpm test`                      |

To add or change a hook, edit the file directly, keep it executable (`chmod +x .husky/<hook>`), and commit it.

### Skipping hooks (escape hatch)

Hooks block by design. Skip them only when you have a justified reason (for example, urgent docs-only revert):

```sh
git commit --no-verify -m "…"
git push   --no-verify
HUSKY=0 git commit -m "…"   # disable Husky for one command
```

If CI is the source of truth for a check, do not silently bypass the local hook for the same check — fix the failure or open the PR with the failure visible so reviewers can see it.

## Workspace tests

Turbo runs each workspace’s Vitest script. Root `vitest.workspace.ts` is for root-level watch mode. Tests use `vitest.config.ts` per workspace and colocate `*.test.ts` / `*.test.tsx` next to source.

## Adding apps or packages

- Apps under `apps/<name>`, packages under `packages/<name>`.
- Add `package.json`, `tsconfig.json`, `src/index.ts`, and standard `build`, `lint`, `typecheck`, `test` scripts.
- Shared packages: add a README (purpose, exports, boundaries, owner).

Match existing layout before inventing new patterns.

## Dependency boundaries

Frontend apps must not import backend-only packages. ESLint `no-restricted-imports` in `eslint.config.mjs` enforces this. Keep dependencies explicit per package when adding imports.
