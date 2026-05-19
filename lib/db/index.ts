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
