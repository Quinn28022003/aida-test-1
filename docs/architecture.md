# AIDA Architecture

## Purpose

This document records the baseline architecture for this repository. It defines the workspace shape and package responsibilities. Product UI and runtime business logic are outside the scope of the foundation ticket; the current database schema workflow is documented separately in [Database schema workflow](db-schema.md).

## System Shape

AIDA is organised as a Turborepo monorepo with two top-level workspace groups:

- `apps/*` contains runnable applications and services.
- `packages/*` contains shared libraries used by apps or other packages.

The root workspace owns shared tooling:

- `pnpm-workspace.yaml` defines workspace membership.
- `turbo.json` defines shared task orchestration.
- `tsconfig.base.json` defines shared TypeScript defaults.
- `eslint.config.mjs` defines lint rules and package-boundary checks.
- `.prettierrc.json` defines formatting defaults.
- `.github/workflows/ci.yml` defines CI/CD checks, including database dry-run validation and staging / master migration deployment.
- `supabase/migrations/` contains canonical SQL schema history.
- `supabase/ci/` contains CI-only database stubs for running migrations against temporary Postgres.
- `supabase/rollback/down/` contains local-only rollback helpers for specific migrations.

## Applications

- `apps/chat` is the chat frontend shell.
- `apps/vault` is the vault frontend shell.
- `apps/api-gateway` is the backend API gateway shell.
- `apps/background-service` is the background worker shell.

The foundation keeps these apps intentionally empty beyond a TypeScript entrypoint and workspace scripts.

## Shared Packages

- `packages/ui` contains shared frontend UI primitives.
- `packages/contracts` contains shared API and domain contracts.
- `packages/api-client` contains client-side API access helpers.
- `packages/db` contains database access code.
- `packages/auth` contains authentication helpers.
- `packages/permissions` contains authorisation and permission helpers.
- `packages/storage` contains storage access helpers.
- `packages/conversations` contains conversation-domain helpers.
- `packages/agents` contains agent-domain helpers.
- `packages/rag` contains retrieval-augmented generation helpers.
- `packages/tools` contains tool integration helpers.
- `packages/tasks` contains task-domain helpers.
- `packages/events` contains event types and helpers.
- `packages/observability` contains logging, metrics, and tracing helpers.
- `packages/config` contains shared configuration helpers.

Each shared package exports from `src/index.ts` and documents its purpose, public exports, forbidden imports, and owner placeholder in its package README.

## Dependency Direction

Frontend apps must not import backend-only packages. The current frontend apps are:

- `apps/chat`
- `apps/vault`

Backend-only packages are guarded in ESLint with `no-restricted-imports` for frontend app source files. Package-boundary rules should remain simple and explicit until the repo has enough real dependencies to justify a stronger boundary tool.

## Architecture Change Rules

Architecture changes must update this document or an ADR when they alter:

- workspace layout
- package ownership or responsibility
- dependency direction
- public contracts between apps and packages
- runtime boundaries between frontend and backend code
