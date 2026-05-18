# @aida/config

Environment variable parsing and validation using Zod. This package separates public (browser-safe) configuration from backend secrets, and uses **different** validated shapes for API Gateway, Background Service, Vault, and Chat where their `.env` requirements differ.

## Import Paths

### Allowed Imports

| Path                   | Purpose                        | Use In                      |
| ---------------------- | ------------------------------ | --------------------------- |
| `@aida/config/public`  | Public env vars (browser-safe) | Frontend apps, shared code |
| `@aida/config/server`  | API Gateway secrets            | API gateway only            |
| `@aida/config/worker`  | Background worker secrets      | Background service only     |

### Forbidden Imports (ESLint Enforced)

| Path                   | Forbidden In              | Reason                      |
| ---------------------- | ------------------------- | --------------------------- |
| `@aida/config/server`  | `apps/chat`, `apps/vault` | Contains secrets            |
| `@aida/config/worker`  | `apps/chat`, `apps/vault` | Contains secrets            |
| `@aida/config` (root)  | Any app                   | Does not export env helpers |

## Usage

### Frontend — Vault (`apps/vault`)

```typescript
import { getVaultPublicEnv } from '@aida/config/public';

const env = getVaultPublicEnv();
// env.NEXT_PUBLIC_SUPABASE_URL
// env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// env.NEXT_PUBLIC_POSTHOG_KEY (optional)
// env.NEXT_PUBLIC_POSTHOG_HOST (optional)
```

### Frontend — Chat (`apps/chat`)

```typescript
import { getChatPublicEnv } from '@aida/config/public';

const env = getChatPublicEnv();
// Same as vault, plus:
// env.NEXT_PUBLIC_VAULT_DOMAIN
```

`getPublicEnv()` is an alias for `getVaultPublicEnv()`. Prefer the explicit helpers above.

### Backend Server (API Gateway)

```typescript
import { getServerEnv } from '@aida/config/server';

const env = getServerEnv();
// env.PORT — positive integer
// Core: SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, AWS_*, LOG_LEVEL, DEBUG, AIDA_DEBUG_TRACE
// Gateway-only: APP_ENCRYPTION_KEY, RESEND_API_KEY, SUPPORT_EMAIL_FROM, BEDROCK_MODEL_SUMMARIZER
```

### Backend Worker (Background Service)

```typescript
import { getWorkerEnv } from '@aida/config/worker';

const env = getWorkerEnv();
// env.PORT — positive integer
// Core: same as server (Supabase, DB, AWS, logging)
// Worker-only: BEDROCK_MODEL_SUMMARIZER, BEDROCK_MODEL_EMBEDDING
```

## Environment Variables

### Public — shared (`vaultPublicEnvSchema` / base for both frontends)

| Variable                        | Required | Default | Description            |
| ------------------------------- | -------- | ------- | ---------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | -       | Supabase project URL   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | -       | Supabase anonymous key |
| `NEXT_PUBLIC_POSTHOG_KEY`       | No       | -       | PostHog API key        |
| `NEXT_PUBLIC_POSTHOG_HOST`      | No       | -       | PostHog host URL       |

### Public — Chat only (`chatPublicEnvSchema`)

| Variable                   | Required | Default | Description                          |
| -------------------------- | -------- | ------- | ------------------------------------ |
| `NEXT_PUBLIC_VAULT_DOMAIN` | Yes      | -       | Origin of the Vault app (e.g. URL) |

### Backend — core (included in both `serverEnvSchema` and `workerEnvSchema`)

| Variable                    | Required | Default | Description                         |
| --------------------------- | -------- | ------- | ----------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes      | -       | Supabase service role key           |
| `DATABASE_URL`              | Yes      | -       | PostgreSQL connection string        |
| `AWS_REGION`                | Yes      | -       | AWS region                          |
| `AWS_ACCESS_KEY_ID`         | Yes      | -       | AWS access key                      |
| `AWS_SECRET_ACCESS_KEY`     | Yes      | -       | AWS secret key                      |
| `LOG_LEVEL`                 | No       | `info`  | Log level: debug, info, warn, error |
| `DEBUG`                     | No       | `false` | Debug mode flag                     |
| `AIDA_DEBUG_TRACE`          | No       | `false` | Debug trace flag                    |

### Backend — API Gateway only (`serverEnvSchema`)

| Variable                   | Required | Description                              |
| -------------------------- | -------- | ---------------------------------------- |
| `PORT`                     | Yes      | Server port (parsed as positive integer) |
| `APP_ENCRYPTION_KEY`       | Yes      | Encryption key for sensitive data        |
| `RESEND_API_KEY`           | Yes      | Resend API key for email                 |
| `SUPPORT_EMAIL_FROM`       | Yes      | Support email sender                     |
| `BEDROCK_MODEL_SUMMARIZER` | Yes      | Bedrock summariser model or profile      |

### Backend — Background Service only (`workerEnvSchema`)

| Variable                    | Required | Description                         |
| --------------------------- | -------- | ----------------------------------- |
| `PORT`                      | Yes      | Worker port (parsed as positive integer) |
| `BEDROCK_MODEL_SUMMARIZER`  | Yes      | Bedrock summariser model or profile |
| `BEDROCK_MODEL_EMBEDDING`   | Yes      | Bedrock embedding model             |

### Bedrock Model Notes

- `BEDROCK_MODEL_SUMMARIZER` must be set to the Bedrock summariser model or inference profile (API Gateway and Background Service).
- `BEDROCK_MODEL_EMBEDDING` must be set on the Background Service only.

## Error Messages

Validation errors are formatted to be readable and never expose secret values:

```
Invalid environment variables:

✖ Too small: expected string to have >=1 characters
  → at DATABASE_URL
✖ Invalid option: expected one of "debug"|"info"|"warn"|"error"
  → at LOG_LEVEL
✖ Invalid input: expected number, received NaN
  → at PORT
```

## Caching

Parsed environment variables are cached per helper:

- `getVaultPublicEnv()` / `getChatPublicEnv()` / `getPublicEnv()` — cached after first call (vault and chat caches are independent; `resetPublicEnvCache()` clears both)
- `getServerEnv()` — cached after first call
- `getWorkerEnv()` — cached after first call

Env values are read once from `process.env` on first access and are not reactive to `.env` file changes. Restart the process to apply updates.

Use the reset functions in tests:

```typescript
import { resetPublicEnvCache } from '@aida/config/public';
import { resetServerEnvCache } from '@aida/config/server';
import { resetWorkerEnvCache } from '@aida/config/worker';
```

## Schema Extension

For gateway-only or worker-only variables, extend the exported schema for that app:

```typescript
import { serverEnvSchema } from '@aida/config/server';
import { z } from 'zod';

const myGatewaySchema = serverEnvSchema.extend({
    MY_GATEWAY_FLAG: z.string().min(1),
});
```

This package only exports `./public`, `./server`, and `./worker`. Variables required in **both** API Gateway and Background Service belong in `coreBackendEnvSchema` inside `packages/config/src/schemas/env.ts` (then extend `serverEnvSchema` / `workerEnvSchema` there with any per-app fields).

## Startup Behaviour

Backend apps should validate env before starting the server:

```typescript
import 'dotenv/config';
import { getServerEnv } from '@aida/config/server';

// Throws if required env vars are missing
const env = getServerEnv();

// Start server with validated env
serve({ port: env.PORT, ... });
```
