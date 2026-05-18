/**
 * Helpers for ephemeral RLS Supabase migrations.
 */

import { readdirSync } from 'fs';
import { join, resolve } from 'path';

export const MIGRATIONS_DIR = 'supabase/migrations';
export const RLS_SYNC_SUFFIX = '_rls_sync.sql';

/** @param {string} filename */
export function migrationVersionFromFilename(filename) {
  const match = filename.match(/^(\d+)_/);
  if (!match) {
    throw new Error(`Invalid migration filename: ${filename}`);
  }
  return match[1];
}

/** @returns {string | null} */
export function findLatestRlsSyncMigration(migrationsDir = MIGRATIONS_DIR) {
  const absoluteDir = resolve(migrationsDir);
  const files = readdirSync(absoluteDir)
    .filter((name) => name.endsWith(RLS_SYNC_SUFFIX))
    .sort();

  if (files.length === 0) {
    return null;
  }

  return join(absoluteDir, files[files.length - 1]);
}
