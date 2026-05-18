import { describe, expect, it } from 'vitest';
import { PERMISSIONS, ROLES, TABLE_RLS_POLICY_CONFIG, TABLES, parsePermissionKey } from './index.js';

const TABLES_WITH_RLS_POLICIES_SORTED = [
  TABLES.AGENTS,
  TABLES.AGENT_INVOCATIONS,
  TABLES.AGENT_MEMBERS,
  TABLES.CONVERSATION_INVITATIONS,
  TABLES.CONVERSATION_MEMBERS,
  TABLES.CONVERSATION_USER_STATE,
  TABLES.CONVERSATIONS,
  TABLES.DOCUMENT_ACL,
  TABLES.DOCUMENT_CHUNKS,
  TABLES.DOCUMENT_CHUNK_SOURCES,
  TABLES.DOCUMENTS,
  TABLES.GROUP_MEMBERS,
  TABLES.GROUP_ROLES,
  TABLES.GROUPS,
  TABLES.JOB_INVITATIONS,
  TABLES.JOB_MEMBERS,
  TABLES.JOBS,
  TABLES.MESSAGE_ATTACHMENTS,
  TABLES.MESSAGE_MENTIONS,
  TABLES.MESSAGES,
  TABLES.ORGANIZATION_INVITATIONS,
  TABLES.ORGANIZATION_MEMBERS,
  TABLES.ORGANIZATIONS,
  TABLES.PERMISSIONS,
  TABLES.PROFILES,
  TABLES.PROJECT_MEMBERS,
  TABLES.PROJECTS,
  TABLES.RETRIEVAL_EVENTS,
  TABLES.ROLE_PERMISSIONS,
  TABLES.ROLES,
  TABLES.VAULT_FOLDERS,
]
  .slice()
  .sort();

describe('authz contracts', () => {
  it('has unique permission keys', () => {
    const keys = PERMISSIONS.map((permission) => permission.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('maps every role permission to existing permission key', () => {
    const permissions = new Set(PERMISSIONS.map((permission) => permission.key));
    for (const role of ROLES) {
      for (const permission of role.permissions) {
        expect(permissions.has(permission)).toBe(true);
      }
    }
  });

  it('maps RLS policy config only to known tables', () => {
    const known = new Set<string>(Object.values(TABLES));
    for (const entry of TABLE_RLS_POLICY_CONFIG) {
      expect(known.has(entry.table)).toBe(true);
    }
  });

  it('keeps the RLS policy table list aligned with contracts', () => {
    const configured = TABLE_RLS_POLICY_CONFIG.map((entry) => entry.table).sort();
    expect(configured).toEqual(TABLES_WITH_RLS_POLICIES_SORTED);
  });

  it('parses Resource.action permission keys (first dot only)', () => {
    expect(parsePermissionKey('Conversation.read')).toEqual({ resource: 'Conversation', action: 'read' });
    expect(parsePermissionKey('DocumentChunk.read')).toEqual({ resource: 'DocumentChunk', action: 'read' });
    expect(parsePermissionKey('Compliance.read_all')).toEqual({ resource: 'Compliance', action: 'read_all' });
    expect(parsePermissionKey('ApiKey.manage_org')).toEqual({ resource: 'ApiKey', action: 'manage_org' });
  });

  it('rejects invalid permission key shapes for parsePermissionKey', () => {
    expect(parsePermissionKey('')).toBeNull();
    expect(parsePermissionKey('noseparator')).toBeNull();
    expect(parsePermissionKey('.noResource')).toBeNull();
    expect(parsePermissionKey('onlydot.')).toBeNull();
    expect(parsePermissionKey('Nested.bad.action')).toBeNull();
  });
});
