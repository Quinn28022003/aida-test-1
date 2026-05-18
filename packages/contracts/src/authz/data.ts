import type { TableName } from './tables.js';
import { TABLES } from './tables.js';

export enum ERole {
  Owner = 'owner',
  Admin = 'admin',
  BillingManager = 'billing_manager',
  Auditor = 'auditor',
  AgentManager = 'agent_manager',
  Support = 'support',
  InternalDeveloper = 'internal_developer',
  PluginDeveloper = 'plugin_developer',
  Tester = 'tester',
  Member = 'member',
  Viewer = 'viewer',
}

export enum ERoleScope {
  Organization = 'organization',
  Internal = 'internal',
}

export enum ERlsCheckType {
  OrgPermission = 'org_permission',
  ProjectJobAccess = 'project_job_access',
  ConversationAccess = 'conversation_access',
  DocumentAccess = 'document_access',
  AgentAccess = 'agent_access',
  ReferenceRead = 'reference_read',
  ServiceOnly = 'service_only',
  ProfileAccess = 'profile_access',
}

/** One catalogue entry: key is always `Resource.action` (first dot separates resource from action). */
type PermissionEntry<K extends string = string> = {
  key: K;
  description: string;
};

function perm<const R extends string, const A extends string>(
  resource: R,
  action: A,
  description: string,
): PermissionEntry<`${R}.${A}`> {
  return { key: `${resource}.${action}`, description };
}

/**
 * Permission catalogue: each resource owns its own action set (not forced CRUD).
 * Keys stay `Resource.action` for `has_org_permission` and RLS policy generation.
 * Add new actions on a resource by adding properties here; extend roles and `TABLE_RLS_POLICY_CONFIG` as needed.
 */
export const PERMISSIONS_OBJECT = {
  Profile: {
    read: perm('Profile', 'read', 'Read profile rows within tenant visibility rules.'),
    update: perm('Profile', 'update', 'Update profile rows (typically own profile).'),
  },
  Organization: {
    read: perm('Organization', 'read', 'Read organisation rows for members.'),
    update: perm('Organization', 'update', 'Update organisation settings.'),
  },
  OrganizationMember: {
    create: perm('OrganizationMember', 'create', 'Add organisation members.'),
    read: perm('OrganizationMember', 'read', 'Read organisation membership.'),
    update: perm('OrganizationMember', 'update', 'Update organisation membership.'),
    delete: perm('OrganizationMember', 'delete', 'Remove organisation members.'),
  },
  OrganizationInvitation: {
    create: perm('OrganizationInvitation', 'create', 'Create organisation invitations.'),
    read: perm('OrganizationInvitation', 'read', 'Read organisation invitations.'),
    update: perm('OrganizationInvitation', 'update', 'Update organisation invitations.'),
    delete: perm('OrganizationInvitation', 'delete', 'Revoke or delete organisation invitations.'),
  },
  Permission: {
    read: perm('Permission', 'read', 'Read the global permission key catalogue.'),
  },
  Role: {
    create: perm('Role', 'create', 'Create roles for the organisation.'),
    read: perm('Role', 'read', 'Read role definitions.'),
    update: perm('Role', 'update', 'Update role definitions.'),
    delete: perm('Role', 'delete', 'Delete roles.'),
  },
  RolePermission: {
    create: perm('RolePermission', 'create', 'Link permissions to roles.'),
    read: perm('RolePermission', 'read', 'Read role–permission assignments.'),
    update: perm('RolePermission', 'update', 'Update role–permission assignments.'),
    delete: perm('RolePermission', 'delete', 'Remove permissions from roles.'),
  },
  Group: {
    create: perm('Group', 'create', 'Create groups.'),
    read: perm('Group', 'read', 'Read groups.'),
    update: perm('Group', 'update', 'Update groups.'),
    delete: perm('Group', 'delete', 'Delete groups.'),
  },
  GroupMember: {
    create: perm('GroupMember', 'create', 'Add group members.'),
    read: perm('GroupMember', 'read', 'Read group membership.'),
    delete: perm('GroupMember', 'delete', 'Remove group members.'),
  },
  GroupRole: {
    create: perm('GroupRole', 'create', 'Assign roles to groups.'),
    read: perm('GroupRole', 'read', 'Read group role assignments.'),
    delete: perm('GroupRole', 'delete', 'Remove roles from groups.'),
  },
  Project: {
    create: perm('Project', 'create', 'Create projects.'),
    read: perm('Project', 'read', 'Read projects.'),
    update: perm('Project', 'update', 'Update projects.'),
    delete: perm('Project', 'delete', 'Archive or delete projects.'),
  },
  ProjectMember: {
    create: perm('ProjectMember', 'create', 'Add project members.'),
    read: perm('ProjectMember', 'read', 'Read project membership.'),
    update: perm('ProjectMember', 'update', 'Update project membership.'),
    delete: perm('ProjectMember', 'delete', 'Remove project members.'),
  },
  Job: {
    create: perm('Job', 'create', 'Create customer jobs.'),
    read: perm('Job', 'read', 'Read customer jobs.'),
    update: perm('Job', 'update', 'Update customer jobs.'),
    delete: perm('Job', 'delete', 'Archive or delete customer jobs.'),
  },
  JobMember: {
    create: perm('JobMember', 'create', 'Add job members.'),
    read: perm('JobMember', 'read', 'Read job membership.'),
    update: perm('JobMember', 'update', 'Update job membership.'),
    delete: perm('JobMember', 'delete', 'Remove job members.'),
  },
  JobInvitation: {
    create: perm('JobInvitation', 'create', 'Create job invitations.'),
    read: perm('JobInvitation', 'read', 'Read job invitations.'),
    update: perm('JobInvitation', 'update', 'Update job invitations.'),
    delete: perm('JobInvitation', 'delete', 'Revoke job invitations.'),
  },
  Conversation: {
    create: perm('Conversation', 'create', 'Create conversations.'),
    read: perm('Conversation', 'read', 'Read conversations.'),
    update: perm('Conversation', 'update', 'Update conversations.'),
    delete: perm('Conversation', 'delete', 'Delete conversations.'),
  },
  ConversationMember: {
    create: perm('ConversationMember', 'create', 'Add conversation participants.'),
    read: perm('ConversationMember', 'read', 'Read conversation membership.'),
    update: perm('ConversationMember', 'update', 'Update conversation membership.'),
    delete: perm('ConversationMember', 'delete', 'Remove conversation participants.'),
  },
  ConversationInvitation: {
    create: perm('ConversationInvitation', 'create', 'Create conversation invitations.'),
    read: perm('ConversationInvitation', 'read', 'Read conversation invitations.'),
    update: perm('ConversationInvitation', 'update', 'Update conversation invitations.'),
    delete: perm('ConversationInvitation', 'delete', 'Revoke conversation invitations.'),
  },
  Agent: {
    create: perm('Agent', 'create', 'Create agents.'),
    read: perm('Agent', 'read', 'Read agents.'),
    update: perm('Agent', 'update', 'Update agents.'),
    delete: perm('Agent', 'delete', 'Delete agents.'),
  },
  AgentMember: {
    create: perm('AgentMember', 'create', 'Grant agent access.'),
    read: perm('AgentMember', 'read', 'Read agent access grants.'),
    update: perm('AgentMember', 'update', 'Update agent access grants.'),
    delete: perm('AgentMember', 'delete', 'Revoke agent access grants.'),
  },
  AgentInvocation: {
    create: perm('AgentInvocation', 'create', 'Queue agent invocations.'),
    read: perm('AgentInvocation', 'read', 'Read agent invocation history.'),
    update: perm('AgentInvocation', 'update', 'Update agent invocation status.'),
  },
  ConversationMessage: {
    create: perm('ConversationMessage', 'create', 'Create messages (including sends).'),
    read: perm('ConversationMessage', 'read', 'Read messages.'),
    update: perm('ConversationMessage', 'update', 'Update messages.'),
    delete: perm('ConversationMessage', 'delete', 'Delete messages.'),
  },
  ConversationUserState: {
    create: perm('ConversationUserState', 'create', 'Create per-user conversation state rows.'),
    read: perm('ConversationUserState', 'read', 'Read per-user conversation state.'),
    update: perm('ConversationUserState', 'update', 'Update per-user conversation state.'),
  },
  MessageMention: {
    create: perm('MessageMention', 'create', 'Create message mentions.'),
    read: perm('MessageMention', 'read', 'Read message mentions.'),
    delete: perm('MessageMention', 'delete', 'Delete message mentions.'),
  },
  VaultFolder: {
    create: perm('VaultFolder', 'create', 'Create vault folders.'),
    read: perm('VaultFolder', 'read', 'Read vault folders.'),
    update: perm('VaultFolder', 'update', 'Update vault folders.'),
    delete: perm('VaultFolder', 'delete', 'Delete vault folders.'),
  },
  Document: {
    create: perm('Document', 'create', 'Create documents (uploads and metadata).'),
    read: perm('Document', 'read', 'Read document metadata.'),
    update: perm('Document', 'update', 'Update document metadata.'),
    delete: perm('Document', 'delete', 'Delete documents.'),
  },
  DocumentChunk: {
    create: perm('DocumentChunk', 'create', 'Create document chunks (indexing).'),
    read: perm('DocumentChunk', 'read', 'Read document chunks for retrieval.'),
    update: perm('DocumentChunk', 'update', 'Update document chunks.'),
    delete: perm('DocumentChunk', 'delete', 'Delete document chunks.'),
  },
  DocumentAcl: {
    create: perm('DocumentAcl', 'create', 'Create document ACL rows.'),
    read: perm('DocumentAcl', 'read', 'Read document ACL rows.'),
    delete: perm('DocumentAcl', 'delete', 'Delete document ACL rows.'),
  },
  DocumentChunkSource: {
    read: perm('DocumentChunkSource', 'read', 'Read document chunk provenance.'),
    create: perm('DocumentChunkSource', 'create', 'Create document chunk provenance.'),
  },
  RetrievalEvent: {
    create: perm('RetrievalEvent', 'create', 'Record retrieval audit events.'),
    read: perm('RetrievalEvent', 'read', 'Read retrieval audit events.'),
  },
  MessageAttachment: {
    create: perm('MessageAttachment', 'create', 'Link documents to messages.'),
    read: perm('MessageAttachment', 'read', 'Read message attachments.'),
    delete: perm('MessageAttachment', 'delete', 'Remove message attachments.'),
  },
} as const;

type PermissionObject = typeof PERMISSIONS_OBJECT;
type PermissionResource = keyof PermissionObject;

type KeysOfGroup<G> = G extends Record<string, PermissionEntry> ? G[keyof G]['key'] : never;

export type PermissionKeys = {
  [R in PermissionResource]: KeysOfGroup<PermissionObject[R]>;
}[PermissionResource];

export type PermissionDefinition = {
  key: PermissionKeys;
  description: string;
};

export const PERMISSIONS: PermissionDefinition[] = (
  Object.values(PERMISSIONS_OBJECT) as Array<Record<string, PermissionDefinition>>
).flatMap((group) => Object.values(group));

const P = PERMISSIONS_OBJECT;

/** Keys whose action is exactly `read` (catalogue convention for RLS SELECT–aligned reads). */
export const READ_PERMISSION_KEYS: PermissionKeys[] = PERMISSIONS.filter((entry) => entry.key.endsWith('.read')).map(
  (entry) => entry.key,
);

/**
 * Parse `Resource.action` using the first dot only (action may contain underscores, e.g. `read_all`).
 */
export function parsePermissionKey(permissionKey: string): { resource: string; action: string } | null {
  const dot = permissionKey.indexOf('.');
  if (dot <= 0 || dot === permissionKey.length - 1) {
    return null;
  }

  const resource = permissionKey.slice(0, dot);
  const action = permissionKey.slice(dot + 1);
  if (!resource || !action || action.includes('.')) {
    return null;
  }

  return { resource, action };
}

export type RoleDefinition = {
  key: ERole;
  label: string;
  description: string;
  scope: ERoleScope;
  permissions: PermissionKeys[];
};

export const ROLES: RoleDefinition[] = [
  {
    key: ERole.Owner,
    label: 'Owner',
    description: 'Full organisation control across all catalogue permissions.',
    scope: ERoleScope.Organization,
    permissions: PERMISSIONS.map((permission) => permission.key),
  },
  {
    key: ERole.Admin,
    label: 'Admin',
    description: 'Organisation administration: all permissions in this catalogue.',
    scope: ERoleScope.Organization,
    permissions: PERMISSIONS.map((permission) => permission.key),
  },
  {
    key: ERole.BillingManager,
    label: 'Billing manager',
    description: 'Billing-focused access; RLS catalogue limited until billing resources are modelled.',
    scope: ERoleScope.Organization,
    permissions: [P.Organization.read.key, P.Permission.read.key],
  },
  {
    key: ERole.Auditor,
    label: 'Auditor',
    description: 'Read-only access across catalogue reads for review and compliance.',
    scope: ERoleScope.Organization,
    permissions: READ_PERMISSION_KEYS.slice(),
  },
  {
    key: ERole.AgentManager,
    label: 'Agent manager',
    description: 'Operational access to conversations, vault content, and catalogue reads for runtime coordination.',
    scope: ERoleScope.Organization,
    permissions: [
      P.Organization.read.key,
      P.Permission.read.key,
      P.Role.read.key,
      P.RolePermission.read.key,
      P.Profile.read.key,
      P.Group.read.key,
      P.GroupMember.read.key,
      P.GroupRole.read.key,
      P.Project.read.key,
      P.ProjectMember.read.key,
      P.Job.read.key,
      P.JobMember.read.key,
      P.Agent.read.key,
      P.AgentMember.read.key,
      P.AgentInvocation.read.key,
      P.Conversation.read.key,
      P.ConversationMember.read.key,
      P.ConversationMessage.read.key,
      P.ConversationUserState.read.key,
      P.MessageMention.read.key,
      P.MessageAttachment.read.key,
      P.VaultFolder.read.key,
      P.Document.read.key,
      P.DocumentChunk.read.key,
      P.RetrievalEvent.read.key,
    ],
  },
  {
    key: ERole.Support,
    label: 'Support',
    description:
      'Internal support diagnostics: read org and conversation context and send messages where policy allows.',
    scope: ERoleScope.Internal,
    permissions: [
      P.Organization.read.key,
      P.Permission.read.key,
      P.Profile.read.key,
      P.Conversation.read.key,
      P.ConversationMessage.read.key,
      P.ConversationMessage.create.key,
    ],
  },
  {
    key: ERole.InternalDeveloper,
    label: 'Internal developer',
    description: 'Developer sandbox: conversations, messages, documents, and vault reads for draft flows.',
    scope: ERoleScope.Organization,
    permissions: [
      P.Organization.read.key,
      P.Permission.read.key,
      P.Profile.read.key,
      P.Profile.update.key,
      P.Project.read.key,
      P.Job.read.key,
      P.Conversation.read.key,
      P.Conversation.create.key,
      P.Conversation.update.key,
      P.ConversationMember.read.key,
      P.ConversationMessage.read.key,
      P.ConversationMessage.create.key,
      P.ConversationMessage.update.key,
      P.ConversationUserState.read.key,
      P.ConversationUserState.create.key,
      P.ConversationUserState.update.key,
      P.MessageMention.read.key,
      P.MessageMention.create.key,
      P.MessageAttachment.read.key,
      P.MessageAttachment.create.key,
      P.VaultFolder.read.key,
      P.Document.read.key,
      P.Document.create.key,
      P.DocumentChunk.read.key,
    ],
  },
  {
    key: ERole.PluginDeveloper,
    label: 'Plugin developer',
    description: 'Integration-oriented read access to catalogue, vault, and roles for package development.',
    scope: ERoleScope.Organization,
    permissions: [
      P.Organization.read.key,
      P.Permission.read.key,
      P.Role.read.key,
      P.RolePermission.read.key,
      P.VaultFolder.read.key,
      P.Document.read.key,
      P.DocumentChunk.read.key,
    ],
  },
  {
    key: ERole.Tester,
    label: 'Tester',
    description: 'Test-scope access to conversations, messages, documents, and attachments.',
    scope: ERoleScope.Organization,
    permissions: [
      P.Organization.read.key,
      P.Permission.read.key,
      P.Profile.read.key,
      P.Project.read.key,
      P.Job.read.key,
      P.Conversation.read.key,
      P.Conversation.create.key,
      P.ConversationMember.read.key,
      P.ConversationMessage.read.key,
      P.ConversationMessage.create.key,
      P.ConversationMessage.update.key,
      P.ConversationUserState.read.key,
      P.MessageMention.read.key,
      P.MessageMention.create.key,
      P.MessageAttachment.read.key,
      P.MessageAttachment.create.key,
      P.VaultFolder.read.key,
      P.Document.read.key,
      P.Document.create.key,
      P.DocumentChunk.read.key,
    ],
  },
  {
    key: ERole.Member,
    label: 'Member',
    description: 'Standard internal member: org directory, conversations, vault upload/read, and related messaging.',
    scope: ERoleScope.Organization,
    permissions: [
      P.Profile.read.key,
      P.Profile.update.key,
      P.Organization.read.key,
      P.OrganizationMember.read.key,
      P.OrganizationInvitation.read.key,
      P.Permission.read.key,
      P.Role.read.key,
      P.RolePermission.read.key,
      P.Group.read.key,
      P.GroupMember.read.key,
      P.GroupRole.read.key,
      P.Project.read.key,
      P.ProjectMember.read.key,
      P.Job.read.key,
      P.JobMember.read.key,
      P.JobInvitation.read.key,
      P.Conversation.read.key,
      P.Conversation.create.key,
      P.Conversation.update.key,
      P.ConversationMember.read.key,
      P.ConversationInvitation.read.key,
      P.ConversationMessage.read.key,
      P.ConversationMessage.create.key,
      P.ConversationMessage.update.key,
      P.ConversationUserState.read.key,
      P.ConversationUserState.create.key,
      P.ConversationUserState.update.key,
      P.MessageMention.read.key,
      P.MessageMention.create.key,
      P.MessageAttachment.read.key,
      P.MessageAttachment.create.key,
      P.VaultFolder.read.key,
      P.Document.read.key,
      P.Document.create.key,
      P.Document.update.key,
      P.DocumentChunk.read.key,
      P.Agent.read.key,
      P.AgentMember.read.key,
      P.AgentInvocation.create.key,
    ],
  },
  {
    key: ERole.Viewer,
    label: 'Viewer',
    description: 'Read-only access to rows already visible under RLS.',
    scope: ERoleScope.Organization,
    permissions: READ_PERMISSION_KEYS.slice(),
  },
];

export type TableRlsPolicyConfig = {
  table: TableName;
  checkType: ERlsCheckType;
  description: string;
  classification?: 'domain' | 'reference' | 'deny';
  permissions: Partial<Record<'select' | 'insert' | 'update' | 'delete', PermissionKeys>>;
};

export const TABLE_RLS_POLICY_CONFIG: TableRlsPolicyConfig[] = [
  {
    table: TABLES.PROFILES,
    checkType: ERlsCheckType.ProfileAccess,
    description: 'Profile self and org-scoped profile access.',
    classification: 'domain',
    permissions: {
      select: P.Profile.read.key,
      update: P.Profile.update.key,
    },
  },
  {
    table: TABLES.ORGANIZATIONS,
    checkType: ERlsCheckType.OrgPermission,
    description: 'Organisation root data.',
    classification: 'domain',
    permissions: {
      select: P.Organization.read.key,
      update: P.Organization.update.key,
    },
  },
  {
    table: TABLES.ORGANIZATION_MEMBERS,
    checkType: ERlsCheckType.OrgPermission,
    description: 'Organisation members.',
    classification: 'domain',
    permissions: {
      select: P.OrganizationMember.read.key,
      insert: P.OrganizationMember.create.key,
      update: P.OrganizationMember.update.key,
      delete: P.OrganizationMember.delete.key,
    },
  },
  {
    table: TABLES.ORGANIZATION_INVITATIONS,
    checkType: ERlsCheckType.OrgPermission,
    description: 'Organisation invitations.',
    classification: 'domain',
    permissions: {
      select: P.OrganizationInvitation.read.key,
      insert: P.OrganizationInvitation.create.key,
      update: P.OrganizationInvitation.update.key,
      delete: P.OrganizationInvitation.delete.key,
    },
  },
  {
    table: TABLES.ROLES,
    checkType: ERlsCheckType.OrgPermission,
    description: 'Role catalogue (system roles and per-organisation roles).',
    classification: 'domain',
    permissions: {
      select: P.Role.read.key,
      insert: P.Role.create.key,
      update: P.Role.update.key,
      delete: P.Role.delete.key,
    },
  },
  {
    table: TABLES.ROLE_PERMISSIONS,
    checkType: ERlsCheckType.OrgPermission,
    description: 'Role-permission linkage.',
    classification: 'domain',
    permissions: {
      select: P.RolePermission.read.key,
      insert: P.RolePermission.create.key,
      update: P.RolePermission.update.key,
      delete: P.RolePermission.delete.key,
    },
  },
  {
    table: TABLES.PERMISSIONS,
    checkType: ERlsCheckType.ReferenceRead,
    description: 'Global permission key catalogue.',
    classification: 'reference',
    permissions: { select: P.Permission.read.key },
  },
  {
    table: TABLES.GROUPS,
    checkType: ERlsCheckType.OrgPermission,
    description: 'Groups.',
    classification: 'domain',
    permissions: {
      select: P.Group.read.key,
      insert: P.Group.create.key,
      update: P.Group.update.key,
      delete: P.Group.delete.key,
    },
  },
  {
    table: TABLES.GROUP_MEMBERS,
    checkType: ERlsCheckType.OrgPermission,
    description: 'Group membership.',
    classification: 'domain',
    permissions: {
      select: P.GroupMember.read.key,
      insert: P.GroupMember.create.key,
      delete: P.GroupMember.delete.key,
    },
  },
  {
    table: TABLES.GROUP_ROLES,
    checkType: ERlsCheckType.OrgPermission,
    description: 'Group role assignments.',
    classification: 'domain',
    permissions: {
      select: P.GroupRole.read.key,
      insert: P.GroupRole.create.key,
      delete: P.GroupRole.delete.key,
    },
  },
  {
    table: TABLES.PROJECTS,
    checkType: ERlsCheckType.ProjectJobAccess,
    description: 'Projects.',
    classification: 'domain',
    permissions: {
      select: P.Project.read.key,
      insert: P.Project.create.key,
      update: P.Project.update.key,
      delete: P.Project.delete.key,
    },
  },
  {
    table: TABLES.PROJECT_MEMBERS,
    checkType: ERlsCheckType.ProjectJobAccess,
    description: 'Project membership.',
    classification: 'domain',
    permissions: {
      select: P.ProjectMember.read.key,
      insert: P.ProjectMember.create.key,
      update: P.ProjectMember.update.key,
      delete: P.ProjectMember.delete.key,
    },
  },
  {
    table: TABLES.JOBS,
    checkType: ERlsCheckType.ProjectJobAccess,
    description: 'Customer jobs.',
    classification: 'domain',
    permissions: {
      select: P.Job.read.key,
      insert: P.Job.create.key,
      update: P.Job.update.key,
      delete: P.Job.delete.key,
    },
  },
  {
    table: TABLES.JOB_MEMBERS,
    checkType: ERlsCheckType.ProjectJobAccess,
    description: 'Job membership.',
    classification: 'domain',
    permissions: {
      select: P.JobMember.read.key,
      insert: P.JobMember.create.key,
      update: P.JobMember.update.key,
      delete: P.JobMember.delete.key,
    },
  },
  {
    table: TABLES.JOB_INVITATIONS,
    checkType: ERlsCheckType.ProjectJobAccess,
    description: 'Job invitations.',
    classification: 'domain',
    permissions: {
      select: P.JobInvitation.read.key,
      insert: P.JobInvitation.create.key,
      update: P.JobInvitation.update.key,
      delete: P.JobInvitation.delete.key,
    },
  },
  {
    table: TABLES.AGENTS,
    checkType: ERlsCheckType.AgentAccess,
    description: 'Agents.',
    classification: 'domain',
    permissions: {
      select: P.Agent.read.key,
      insert: P.Agent.create.key,
      update: P.Agent.update.key,
      delete: P.Agent.delete.key,
    },
  },
  {
    table: TABLES.AGENT_MEMBERS,
    checkType: ERlsCheckType.AgentAccess,
    description: 'Agent access grants.',
    classification: 'domain',
    permissions: {
      select: P.AgentMember.read.key,
      insert: P.AgentMember.create.key,
      update: P.AgentMember.update.key,
      delete: P.AgentMember.delete.key,
    },
  },
  {
    table: TABLES.AGENT_INVOCATIONS,
    checkType: ERlsCheckType.AgentAccess,
    description: 'Agent invocation audit rows.',
    classification: 'domain',
    permissions: {
      select: P.AgentInvocation.read.key,
      insert: P.AgentInvocation.create.key,
      update: P.AgentInvocation.update.key,
    },
  },
  {
    table: TABLES.CONVERSATIONS,
    checkType: ERlsCheckType.ConversationAccess,
    description: 'Conversations.',
    classification: 'domain',
    permissions: {
      select: P.Conversation.read.key,
      insert: P.Conversation.create.key,
      update: P.Conversation.update.key,
      delete: P.Conversation.delete.key,
    },
  },
  {
    table: TABLES.CONVERSATION_MEMBERS,
    checkType: ERlsCheckType.ConversationAccess,
    description: 'Conversation membership.',
    classification: 'domain',
    permissions: {
      select: P.ConversationMember.read.key,
      insert: P.ConversationMember.create.key,
      update: P.ConversationMember.update.key,
      delete: P.ConversationMember.delete.key,
    },
  },
  {
    table: TABLES.CONVERSATION_INVITATIONS,
    checkType: ERlsCheckType.ConversationAccess,
    description: 'Conversation invitations.',
    classification: 'domain',
    permissions: {
      select: P.ConversationInvitation.read.key,
      insert: P.ConversationInvitation.create.key,
      update: P.ConversationInvitation.update.key,
      delete: P.ConversationInvitation.delete.key,
    },
  },
  {
    table: TABLES.MESSAGES,
    checkType: ERlsCheckType.ConversationAccess,
    description: 'Messages.',
    classification: 'domain',
    permissions: {
      select: P.ConversationMessage.read.key,
      insert: P.ConversationMessage.create.key,
      update: P.ConversationMessage.update.key,
      delete: P.ConversationMessage.delete.key,
    },
  },
  {
    table: TABLES.MESSAGE_MENTIONS,
    checkType: ERlsCheckType.ConversationAccess,
    description: 'Mentions linked to messages.',
    classification: 'domain',
    permissions: {
      select: P.MessageMention.read.key,
      insert: P.MessageMention.create.key,
      delete: P.MessageMention.delete.key,
    },
  },
  {
    table: TABLES.CONVERSATION_USER_STATE,
    checkType: ERlsCheckType.ConversationAccess,
    description: 'Per-user conversation state.',
    classification: 'domain',
    permissions: {
      select: P.ConversationUserState.read.key,
      insert: P.ConversationUserState.create.key,
      update: P.ConversationUserState.update.key,
    },
  },
  {
    table: TABLES.VAULT_FOLDERS,
    checkType: ERlsCheckType.OrgPermission,
    description: 'Vault folder tree.',
    classification: 'domain',
    permissions: {
      select: P.VaultFolder.read.key,
      insert: P.VaultFolder.create.key,
      update: P.VaultFolder.update.key,
      delete: P.VaultFolder.delete.key,
    },
  },
  {
    table: TABLES.DOCUMENTS,
    checkType: ERlsCheckType.DocumentAccess,
    description: 'Document metadata and lifecycle.',
    classification: 'domain',
    permissions: {
      select: P.Document.read.key,
      insert: P.Document.create.key,
      update: P.Document.update.key,
      delete: P.Document.delete.key,
    },
  },
  {
    table: TABLES.DOCUMENT_CHUNKS,
    checkType: ERlsCheckType.DocumentAccess,
    description: 'RAG chunks.',
    classification: 'domain',
    permissions: {
      select: P.DocumentChunk.read.key,
      insert: P.DocumentChunk.create.key,
      update: P.DocumentChunk.update.key,
      delete: P.DocumentChunk.delete.key,
    },
  },
  {
    table: TABLES.DOCUMENT_ACL,
    checkType: ERlsCheckType.DocumentAccess,
    description: 'Document ACL rows.',
    classification: 'domain',
    permissions: {
      select: P.DocumentAcl.read.key,
      insert: P.DocumentAcl.create.key,
      delete: P.DocumentAcl.delete.key,
    },
  },
  {
    table: TABLES.DOCUMENT_CHUNK_SOURCES,
    checkType: ERlsCheckType.DocumentAccess,
    description: 'Document chunk provenance.',
    classification: 'domain',
    permissions: {
      select: P.DocumentChunkSource.read.key,
      insert: P.DocumentChunkSource.create.key,
    },
  },
  {
    table: TABLES.RETRIEVAL_EVENTS,
    checkType: ERlsCheckType.DocumentAccess,
    description: 'Retrieval audit events.',
    classification: 'domain',
    permissions: {
      select: P.RetrievalEvent.read.key,
      insert: P.RetrievalEvent.create.key,
    },
  },
  {
    table: TABLES.MESSAGE_ATTACHMENTS,
    checkType: ERlsCheckType.ConversationAccess,
    description: 'Message to document attachment.',
    classification: 'domain',
    permissions: {
      select: P.MessageAttachment.read.key,
      insert: P.MessageAttachment.create.key,
      delete: P.MessageAttachment.delete.key,
    },
  },
];
