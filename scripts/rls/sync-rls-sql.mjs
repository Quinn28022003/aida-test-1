#!/usr/bin/env node
/* eslint-disable preserve-caught-error */
/* eslint-disable no-undef */
/**
 * Generate and apply RLS SQL via an ephemeral Supabase migration:
 * migration new → write SQL → db push → repair reverted → delete file.
 */

import { execFileSync } from 'child_process';
import dotenv from 'dotenv';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { generateRlsSql } from './generate-rls-sql.mjs';
import { findLatestRlsSyncMigration, migrationVersionFromFilename } from './migration-path.mjs';

const API_GATEWAY_ENV_FILES = ['apps/api-gateway/.env.local', 'apps/api-gateway/.env'];

function loadApiGatewayEnv() {
  for (const relativePath of API_GATEWAY_ENV_FILES) {
    const path = resolve(relativePath);
    if (!existsSync(path)) {
      continue;
    }

    dotenv.config({ path });
    return relativePath;
  }
  return null;
}

const loadedFrom = loadApiGatewayEnv();

if (loadedFrom) {
  console.log(`Loaded environment from ${loadedFrom}`);
}

const DATABASE_URL = process.env.DATABASE_URL;

function runSupabase(args) {
  const dbUrlArgs = DATABASE_URL ? ['--db-url', DATABASE_URL] : [];
  execFileSync('pnpm', ['exec', 'supabase', ...args, ...dbUrlArgs], {
    stdio: 'inherit',
    env: process.env,
  });
}

function createRlsSyncMigration() {
  const before = findLatestRlsSyncMigration();
  runSupabase(['migration', 'new', 'rls_sync']);

  const migrationPath = findLatestRlsSyncMigration();
  if (!migrationPath || migrationPath === before) {
    throw new Error('Failed to create ephemeral RLS migration file under supabase/migrations/');
  }

  return migrationPath;
}

function cleanupEphemeralMigration(migrationPath) {
  const filename = migrationPath.split('/').pop();
  const version = migrationVersionFromFilename(filename);

  runSupabase(['migration', 'repair', version, '--status', 'reverted']);
  unlinkSync(migrationPath);
}

async function main() {
  const { sql, summary } = await generateRlsSql();
  const migrationPath = createRlsSyncMigration();

  const ephemeralNotice =
    '-- Ephemeral Supabase migration — applied by pnpm rls:sync; do not commit.\n\n';
  writeFileSync(migrationPath, ephemeralNotice + sql);

  console.log(`Applying ephemeral RLS migration: ${migrationPath}`);

  try {
    runSupabase(['db', 'push', '--yes']);
  } catch (error) {
    console.error(
      `Error: RLS migration apply failed. Ephemeral file kept for debugging: ${migrationPath}`,
    );
    throw error;
  }

  cleanupEphemeralMigration(migrationPath);

  console.log(
    `RLS sync applied via Supabase migration: helpers=${summary.helperFunctions}, permissions=${summary.permissions}, roles=${summary.roles}, role_permissions=${summary.rolePermissions}, tables=${summary.rlsTables}, policies=${summary.policies}`,
  );
}

main().catch((error) => {
  console.error(`Error syncing RLS: ${error.message}`);
  process.exit(1);
});
