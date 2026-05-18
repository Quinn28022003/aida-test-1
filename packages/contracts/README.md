# @aida/contracts

## Purpose

Shared cross-runtime contracts for AIDA.

The `authz` module is the source of truth for:

- permission catalogue (`Resource.action` keys; each resource declares its own action set via `perm()` / nested objects in `PERMISSIONS_OBJECT`)
- system role definitions (bundles of those keys)
- table-level RLS policy config metadata (`TABLE_RLS_POLICY_CONFIG`)
- permission key parsing helpers (`parsePermissionKey`, `READ_PERMISSION_KEYS` for all `*.read` entries)

## Public exports

- `.` -> `src/index.ts`
- `authz` constants from `src/authz/data.ts`:
  - `PERMISSIONS_OBJECT`
  - `PERMISSIONS`
  - `ROLES`
  - `ERole`, `ERoleScope`
  - `ERlsCheckType`
  - `TABLE_RLS_POLICY_CONFIG`
  - `parsePermissionKey`
  - `READ_PERMISSION_KEYS`
  - `PermissionKeys`

## Forbidden imports

- Keep this package dependency-light and runtime-agnostic.
- Do not import app packages from `apps/*`.
- Do not import `@aida/db` or environment-specific modules.

## Owner

- Platform / Contracts maintainers.
