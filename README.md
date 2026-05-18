# AIDA - AI Data Assistant

AIDA is a privacy-first AI assistant platform that helps users manage, query, and interact with their personal data through natural language conversations.

## Overview

AIDA consists of:

- **Chat App** (`apps/chat`): Next.js web application for user conversations with AI
- **Vault App** (`apps/vault`): Secure data management and storage interface
- **API Gateway** (`apps/api-gateway`): Central API routing and authentication
- **Background Service** (`apps/background-service`): Async task processing and RAG pipelines

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed system design.

## Monorepo Structure

This is a Turborepo monorepo with pnpm workspaces:

```
apps/
  api-gateway/        # API gateway service
  background-service/ # Background job processor
  chat/               # Next.js chat application
  vault/              # Next.js vault application

packages/
  agents/             # AI agent definitions and orchestration
  api-client/         # Shared API client utilities
  auth/               # Authentication and authorisation
  config/             # Shared configuration
  contracts/          # API contracts and types
  conversations/      # Conversation management
  db/                 # Database schemas and clients
  events/             # Event bus and messaging
  permissions/        # Permission system
  rag/                # Retrieval-Augmented Generation
  shared/             # Shared utilities and logging
  storage/            # File storage abstractions
  tasks/              # Background task definitions
  tools/              # AI tool definitions
  ui/                 # Shared UI components
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase cloud dev project access

### Install Dependencies

```sh
pnpm install
```

### Development

Run all apps in development mode:

```sh
pnpm dev
```

Or run specific apps:

```sh
pnpm dev --filter=chat
pnpm dev --filter=api-gateway
```

### Build

```sh
pnpm build
```

### Test

```sh
pnpm test
```

### Lint

```sh
pnpm lint
```

## Environment Setup

Copy `.env.example` files in each app/package and configure:

```sh
cp apps/chat/.env.example apps/chat/.env
cp apps/api-gateway/.env.example apps/api-gateway/.env
```

## Database Workflow (Cloud Dev)

Use SQL migrations in `supabase/migrations` as the source of truth. One-time setup: `pnpm exec supabase login` and `pnpm exec supabase link` (see [docs/db-schema.md](docs/db-schema.md)).

```sh
pnpm db:migration:new <name>
pnpm migrate:up
pnpm db:types
pnpm db:validate
```

`pnpm db:reset` is disabled for cloud workflow.

## Documentation

- [Architecture](docs/architecture.md)
- [Database Schema Workflow](docs/db-schema.md)
- [Monorepo Guide](docs/monorepo.md)
- [Foundation scope](docs/foundation-scope.md)

## License

Private - All rights reserved.
