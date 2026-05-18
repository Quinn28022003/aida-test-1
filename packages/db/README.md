# @aida/db

## Purpose

Database types and schema helpers shared across AIDA services.

## Public exports

- `Json` and `Database` (Supabase shape) from `database-generated.types.ts`; `DatabaseGenerated` in the public API is the same type under that alias.
- `Tables`, `TablesInsert`, `TablesUpdate` generic table helpers for row and mutation shapes.
- `Database` from `database.types.ts` is the app-level entry point for overrides later.
- `ProfileRow`, `ProfileInsert`, `ProfileUpdate` readable table aliases kept for compatibility.
- `jsonbSchemas` and related JSONB schema helper types.

## Type usage standard

- Prefer helper-first imports in new code:
  - `type Profile = Tables<"profiles">`
  - `type NewProfile = TablesInsert<"profiles">`
  - `type PatchProfile = TablesUpdate<"profiles">`
- Prefer helper aliases over long direct access like `Database["public"]["Tables"]["profiles"]["Row"]`.
- Use per-table named aliases only when they add clear domain readability in a specific module.

## Migration guidance

- Existing `ProfileRow`, `ProfileInsert`, `ProfileUpdate` exports remain valid and are not breaking.
- New features should default to `Tables<...>`, `TablesInsert<...>`, and `TablesUpdate<...>`.

## Forbidden imports

- Avoid importing app-layer modules. Keep this package pure schema/types.

## Service role bypass discipline

Service role (`SUPABASE_SERVICE_ROLE_KEY`) bypasses RLS entirely. This is powerful and dangerous — follow these rules:

Authz constants and permission keys come from `@aida/contracts` (granular `Resource.action` strings such as `Document.read` or `ConversationMessage.create`); backend bypass logic should reuse those keys and match the same access model as RLS helpers.

### Backend-only

- Service role is **backend-only**. Never expose service keys to frontend code, browser extensions, mobile apps, or client-side JavaScript.
- Frontend must use the anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) and go through RLS policies.

### Narrow and audited

- Service role bypass must be **narrow** — use it only when RLS cannot handle the access pattern.
- All service role queries must be **audited** — log the operation, the reason for bypass, and the affected rows.
- Prefer RLS for user-scoped reads. Do not use service role to fetch data that RLS policies could handle.

### Retrieval jobs

Retrieval jobs using service role must still enforce access controls:

1. **Call access helpers** — use the same `can_access_document()` and `can_access_conversation()` helpers that RLS uses when running with a user context.
2. **Apply equivalent filters** — if not using the helpers directly, apply the same logic: tenant match, active internal membership for org/private scope, parent conversation tenant match plus `can_access_conversation` and direct conversation membership or valid job membership for conversation scope, owner checks for private scope, document status, and chunk `deleted_at`.
3. **Document the bypass** — comment why service role is needed and what filters replace RLS.

Example:

```typescript
// Service role bypass: retrieval runs outside the user's RLS session.
// Keep these predicates equivalent to can_access_document().
const accessibleChunks = await db
  .from('document_chunks')
  .select('*, documents!inner(id, org_id, scope, owner_id, conversation_id, status, deleted_at)')
  .eq('org_id', targetOrgId)
  .eq('documents.org_id', targetOrgId)
  .neq('documents.status', 'deleted')
  .is('documents.deleted_at', null)
  .is('deleted_at', null);

// Then filter candidates by requesterProfileId:
// - org scope: requester is an active internal member of targetOrgId
// - private scope: requester owns the document and is an active internal member
// - conversation scope: requester passes `can_access_conversation` and is a direct conversation member or job member on the document job (matches `can_access_document` for conversation scope; external customers only see job-owned threads they created unless explicitly joined)
```

### When to use service role

| Use case                                        | Approach                             |
| ----------------------------------------------- | ------------------------------------ |
| Background jobs (indexing, cleanup)             | Service role with explicit filters   |
| Admin operations (user deletion, org migration) | Service role with audit logging      |
| User-scoped reads                               | **Use RLS** — do not bypass          |
| Cross-user data aggregation                     | Service role with org-scoped filters |

### When NOT to use service role

- Fetching a user's own data — RLS handles this
- Any frontend-initiated request — use anon key
- Operations that could leak data between tenants — use RLS or explicit tenant filters

## Owner

- TODO: Assign owner.
