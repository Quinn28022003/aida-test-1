import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "../../../supabase/migrations/20260509064221_aida_mvp_core_schema.sql"
);

const migrationSql = readFileSync(migrationPath, "utf8");

const requiredTables = [
  "profiles",
  "organizations",
  "projects",
  "project_members",
  "jobs",
  "job_members",
  "job_invitations",
  "agents",
  "agent_members",
  "agent_invitations",
  "conversations",
  "background_jobs",
  "conversation_memory",
  "documents",
  "document_chunks"
];

const tenantOwnedTables = [
  "projects",
  "project_members",
  "jobs",
  "job_members",
  "job_invitations",
  "agent_members",
  "agent_invitations",
  "conversation_memory"
];

describe("AIDA MVP core schema migration", () => {
  it("declares required MVP tables", () => {
    for (const table of requiredTables) {
      expect(migrationSql).toMatch(new RegExp(`create table ${table}\\b`, "i"));
    }
  });

  it("uses background_jobs for the worker queue with background_job_status", () => {
    const backgroundJobsBlock = migrationSql.match(
      /create table background_jobs\b([\s\S]*?);/i
    );
    expect(backgroundJobsBlock).not.toBeNull();
    expect(backgroundJobsBlock![0]).toMatch(/\bstatus background_job_status\b/i);
    expect(backgroundJobsBlock![0]).toMatch(/\bcustomer_job_id uuid\b/i);

    const customerJobsBlock = migrationSql.match(/create table jobs\b([\s\S]*?);/i);
    expect(customerJobsBlock).not.toBeNull();
    expect(customerJobsBlock![0]).toMatch(/\bstatus customer_job_status\b/i);
    expect(customerJobsBlock![0]).toMatch(/\bcustomer_profile_id uuid not null\b/i);
  });

  it("does not declare removed queue or grant tables", () => {
    expect(migrationSql).not.toMatch(/\bcreate type job_status\b/i);
    expect(migrationSql).not.toMatch(/\bcreate type work_item_status\b/i);
    expect(migrationSql).not.toMatch(/\bcreate table agent_access_grants\b/i);
  });

  it("scopes conversations to project and customer job", () => {
    const conversationsBlock = migrationSql.match(
      /create table conversations\b([\s\S]*?);/i
    );
    expect(conversationsBlock).not.toBeNull();
    expect(conversationsBlock![0]).toMatch(/\bproject_id uuid not null\b/i);
    expect(conversationsBlock![0]).toMatch(/\bjob_id uuid not null\b/i);
  });

  it("indexes document_chunks embeddings with HNSW excluding deleted rows", () => {
    expect(migrationSql).toMatch(
      /create index document_chunks_embedding_idx[\s\S]*using hnsw/i
    );
    expect(migrationSql).toMatch(
      /where embedding is not null and deleted_at is null/i
    );
  });

  it("scopes tenant-owned tables with org_id", () => {
    for (const table of tenantOwnedTables) {
      const tableBlock = migrationSql.match(
        new RegExp(`create table ${table}\\b([\\s\\S]*?);`, "i")
      );
      expect(tableBlock, `missing create table for ${table}`).not.toBeNull();
      expect(tableBlock![0]).toMatch(/\borg_id uuid not null\b/i);
    }
  });
});
