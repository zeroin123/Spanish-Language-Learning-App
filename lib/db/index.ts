// Phase 1: DB access is via node:sqlite directly in scripts/seed.ts
// Phase 2: This will be replaced with drizzle + @libsql/client (no native compilation needed)
// To use drizzle in app routes: install @libsql/client and use drizzle-orm/libsql adapter

import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'polyglot.db');

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(dbPath);
    _db.exec('PRAGMA journal_mode = WAL');
  }
  return _db;
}
