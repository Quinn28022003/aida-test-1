# Operations guide

Runtime configuration, environment validation, and how database operations relate to deployed services.

**Database migration workflow (authoring SQL, push, generated types):** [Database schema workflow](db-schema.md)  
**Monorepo commands:** [Monorepo guide](monorepo.md)

Environment variables are validated at startup where an app calls `@aida/config` (`getServerEnv`, `getWorkerEnv`, `getVaultPublicEnv`, or `getChatPublicEnv`). Missing or invalid variables cause a fast failure with a readable error message.

## Environment variables

All environment variables are validated at startup using `@aida/config`. Missing or invalid values cause a fast failure with a readable message.

### Variable reference

#### Public (browser-safe, `@aida/config/public`)

Shared by `apps/chat` and `apps/vault` (see each app’s `.env.example`):

| Variable                        | Required | Default | Used By   |
| ------------------------------- | -------- | ------- | --------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | -       | Chat, Vault |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | -       | Chat, Vault |
| `NEXT_PUBLIC_POSTHOG_KEY`       | No       | -       | Chat, Vault |
| `NEXT_PUBLIC_POSTHOG_HOST`      | No       | -       | Chat, Vault |

Chat only:

| Variable                     | Required | Default | Used By |
| ---------------------------- | -------- | ------- | ------- |
| `NEXT_PUBLIC_VAULT_DOMAIN`   | Yes      | -       | Chat    |

`apps/chat` and `apps/vault` may also set `PORT` for the Next.js server; that value is **not** validated by `@aida/config/public` (it is not a `NEXT_PUBLIC_*` variable).

#### Backend — shared core (`apps/api-gateway`, `apps/background-service`)

Validated via `coreBackendEnvSchema` (included in both server and worker schemas):

| Variable                    | Required | Default | Used By                         |
| --------------------------- | -------- | ------- | ------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes      | -       | API Gateway, Background Service |
| `DATABASE_URL`              | Yes      | -       | API Gateway, Background Service |
| `AWS_REGION`                | Yes      | -       | API Gateway, Background Service |
| `AWS_ACCESS_KEY_ID`         | Yes      | -       | API Gateway, Background Service |
| `AWS_SECRET_ACCESS_KEY`     | Yes      | -       | API Gateway, Background Service |
| `LOG_LEVEL`                 | No       | `info`  | API Gateway, Background Service |
| `DEBUG`                     | No       | `false` | API Gateway, Background Service |
| `AIDA_DEBUG_TRACE`          | No       | `false` | API Gateway, Background Service |

#### Backend — API Gateway only (`@aida/config/server`)

| Variable                   | Required | Default | Description |
| -------------------------- | -------- | ------- | ----------- |
| `PORT`                     | Yes      | -       | HTTP port (positive integer) |
| `APP_ENCRYPTION_KEY`       | Yes      | -       | Application encryption key |
| `RESEND_API_KEY`           | Yes      | -       | Resend API key for email |
| `SUPPORT_EMAIL_FROM`       | Yes      | -       | Support email sender address |
| `BEDROCK_MODEL_SUMMARIZER` | Yes      | -       | Bedrock summariser model or inference profile |

#### Backend — Background Service only (`@aida/config/worker`)

| Variable                    | Required | Default | Description |
| --------------------------- | -------- | ------- | ----------- |
| `PORT`                      | Yes      | -       | HTTP port (positive integer) |
| `BEDROCK_MODEL_SUMMARIZER`  | Yes      | -       | Bedrock summariser model or inference profile |
| `BEDROCK_MODEL_EMBEDDING`   | Yes      | -       | Bedrock embedding model |

### Environment variable caching

`@aida/config` caches parsed environment variables after the first access to avoid repeated Zod parsing. Env values are loaded once at process start (for example via `dotenv`) and are not reactive to `.env` file changes. To apply changes, restart the process. Tests can call `reset*EnvCache()` to force a re-parse.

### Bedrock model configuration

The platform uses AWS Bedrock for AI model inference. Example values from local `.env.example` files:

- **Summariser**: Claude Haiku inference profile (for example `arn:aws:bedrock:ap-southeast-2:182399702812:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0`) — required on API Gateway and Background Service.
- **Embeddings**: Amazon Titan Text Embeddings V2 (`amazon.titan-embed-text-v2:0`) — required on Background Service only.

Valid `LOG_LEVEL` values: `debug`, `info`, `warn`, `error`.

---

- `debug` — Verbose logging for development
- `info` — Standard operational logging (default)
- `warn` — Warnings and errors only
- `error` — Errors only

API Gateway and Background Service validate environment variables before accepting traffic. On failure, the process exits with a list of missing or invalid variables.

API Gateway and Background Service validate environment variables before starting the HTTP server. If validation fails, the process exits with a readable error message listing missing or invalid variables.

Example error output:

```
Invalid environment variables:

✖ Too small: expected string to have >=1 characters
  → at DATABASE_URL
✖ Invalid option: expected one of "debug"|"info"|"warn"|"error"
  → at LOG_LEVEL
✖ Invalid input: expected number, received NaN
  → at PORT
```

---

## Security boundaries

### Frontend applications

Apps `apps/chat` and `apps/vault` must only import `@aida/config/public`. ESLint blocks `@aida/config/server` and `@aida/config/worker`.

### Backend applications

- API Gateway: `@aida/config/server` (`getServerEnv`)
- Background Service: `@aida/config/worker` (`getWorkerEnv`)

Server and worker schemas share a **core** backend shape (Supabase, database URL, AWS credentials, logging flags) but **differ** on Bedrock and other variables: see the variable tables above.

---

## Database operations (runtime vs migrations)

| Concern                        | Where it lives                                                                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Schema changes**             | Manual SQL in `supabase/migrations/`, applied with Supabase CLI via root scripts (`pnpm migrate:up`, etc.). Full procedure: [db-schema.md](db-schema.md). |
| **Runtime connectivity**       | Apps use `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL` from env — validated by `@aida/config`.                                |
| **Generated TypeScript types** | `pnpm db:types` writes `packages/db/src/database-generated.types.ts`; `pnpm db:validate` checks it matches the repo.                                      |

Operational rules:

- **Cloud dev** Supabase is the intended environment for schema iteration; migrations in Git remain the source of truth.
- **Dashboard** SQL is not a substitute for committed migrations.
- **`pnpm db:reset`** is disabled in this repo’s scripts for cloud workflow (do not rely on it for shared dev).
- **`migrate:*:prod` scripts** still target whichever project is **`supabase link`**’d unless you change link/profile. They do not pick a master database purely from the script name — coordinate access before running destructive commands (`migrate:down`) on any shared or master-like project.

Backend `DATABASE_URL` should point at PostgreSQL compatible with your deployment (often the same Supabase project’s database using the appropriate connection string for pooled or direct sessions). Align values with the Supabase project you use for app traffic.

### RLS testing

Row Level Security policies are generated from scripts in `scripts/rls/` and applied via `rls:sync` (ephemeral Supabase migration + `db push`). Authz keys/roles come from `@aida/contracts` and are reused for seeds, RLS generation, and application checks. Local testing commands:

CI runs migrations plus RLS sync and `pnpm rls:test` on **ephemeral** Postgres (`database-dry-run` job). Cloud deploy (`deploy-database-staging` / `deploy-database-master`) runs `pnpm migrate:up` then `pnpm rls:sync` on the linked Supabase project.

| Command             | Purpose                                                         |
| ------------------- | --------------------------------------------------------------- |
| `pnpm rls:generate` | Preview deterministic SQL at `scripts/rls/generated/aida-rls-sync.sql` |
| `pnpm rls:sync`     | Generate, apply via `supabase db push`, then remove ephemeral migration file |
| `pnpm rls:test`     | Run RLS integration tests (see env vars below)                  |

**RLS test connections:** the `postgres` superuser **always bypasses RLS** in PostgreSQL, so `pnpm rls:test` must use a non‑superuser harness URL. CI applies `supabase/ci/mock_supabase_minimal.sql` (creates role `rls_ci` / password `rls_ci`) and sets `RLS_TEST_DATABASE_URL` to that user while fixtures still use `DATABASE_URL` as `postgres`. Override `RLS_FIXTURE_DATABASE_URL` only if you need a different superuser URL for fixture load/cleanup.

**Running RLS tests locally:**

```sh
# Ensure migrations are applied to your local database
pnpm migrate:up

# Generate and apply RLS policies plus authz seeds (uses DATABASE_URL)
pnpm rls:sync

# Apply CI stubs if you use plain Postgres (creates rls_ci + auth stub)
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/ci/mock_supabase_minimal.sql

# Run RLS tests: harness must not be superuser (rls_ci); fixtures may stay on postgres
export DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
export RLS_TEST_DATABASE_URL=postgresql://rls_ci:rls_ci@localhost:54322/postgres
pnpm rls:test
```

The RLS tests create two test orgs, two internal users, and one external user, then verify:

- Internal users can access org conversations, messages, and Vault documents
- External users can only access their conversation-scoped resources
- Cross-org access is denied
- Document visibility rules are enforced

### CI/CD database validation

- **Raw Postgres dry-run** (`database-dry-run` job): runs after normal CI and build on PRs and pushes to `develop` / `rewrite`. Uses ephemeral Postgres with minimal Supabase stubs. Validates migrations apply cleanly and types can be generated — but does **not** compare against committed generated types.
- **Deploy database** (`deploy-database-staging` / `deploy-database-master` jobs): runs only on push to `staging` or `master`. The `staging` branch uses the `staging` GitHub Environment; the `master` branch uses the `master` GitHub Environment. Each environment must define `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, and `SUPABASE_PROJECT_REF`. Links that environment's Supabase project, pushes migrations, then reports migration status.
- **DB type validate** (`database-type-validate-staging` / `database-type-validate-master` jobs): runs only on **push** to `staging` or `master` after the matching deployment succeeds, so generated schema types are checked against the updated cloud schema. The comparison ignores `PostgrestVersion` metadata because it is runtime-specific. Requires the matching GitHub Environment secrets.

---

## Health checks

The API Gateway exposes a health endpoint suitable for load balancers and monitoring.

---

## Troubleshooting

### Missing environment variables

1. Ensure `.env` exists in the app directory (see each app’s `.env.example`).
2. Required keys must be non-empty.
3. Names are case-sensitive.

### Port conflicts

1. Check nothing else is bound to the configured port.
2. `PORT` must be a positive integer.
3. Avoid two AIDA services using the same port.

### AWS Bedrock errors

1. Check if another process is using the port
2. For API Gateway and Background Service, verify `PORT` is a valid positive integer (validated by `@aida/config`)
3. Ensure `PORT` is not in use by another AIDA service

### AWS Bedrock Errors

If Bedrock model calls fail:

1. Verify AWS credentials are valid
2. Check the model ID is available in your AWS region
3. Ensure your AWS account has access to the requested models
