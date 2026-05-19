// Inserts pre-translated sentences for lessons 6-15 directly from static data.
// No API key needed.
// Run: npx tsx --no-warnings=ExperimentalWarning scripts/insert-translations.ts

import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'crypto';
import path from 'path';
import { TRANSLATIONS } from './data/translations';

const dbPath = path.join(process.cwd(), 'data', 'polyglot.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');

// Clear lessons 6-15 sentences
const deleted = db.prepare(`DELETE FROM sentences WHERE source_lesson_id >= 6`).run();
console.log(`Cleared ${deleted.changes} existing sentences for lessons 6-15.`);

// Also clear any remaining grammar examples (speaker = single letter)
const grammarDeleted = db.prepare(
  `DELETE FROM sentences WHERE speaker IS NOT NULL AND length(speaker) = 1 AND speaker GLOB '[A-Z]'`
).run();
if (grammarDeleted.changes > 0) console.log(`Cleared ${grammarDeleted.changes} grammar-example sentences.`);

const islandByLesson = new Map<number, string>();
const rows = db.prepare('SELECT id, source_lesson FROM islands WHERE source_lesson IS NOT NULL').all() as Array<{ id: string; source_lesson: number }>;
for (const row of rows) islandByLesson.set(row.source_lesson, row.id);

const insertStmt = db.prepare(`
  INSERT INTO sentences
    (id, island_id, native, target, speaker, source, source_lesson_id, source_dialogue, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, 'book', ?, ?, ?, ?)
`);

const now = new Date().toISOString();
let inserted = 0;

for (const pair of TRANSLATIONS) {
  const islandId = islandByLesson.get(pair.lesson);
  if (!islandId) { console.warn(`No island for lesson ${pair.lesson}`); continue; }
  insertStmt.run(randomUUID(), islandId, pair.english, pair.spanish, pair.speaker, pair.lesson, pair.dialogue, now, now);
  inserted++;
}

console.log(`\n✓ Inserted ${inserted} sentences.`);

const byIsland = db.prepare(`
  SELECT i.display_name, COUNT(s.id) as cnt
  FROM islands i LEFT JOIN sentences s ON s.island_id = i.id
  GROUP BY i.id ORDER BY i.sort_order
`).all() as Array<{ display_name: string; cnt: number }>;

console.log('\nSentences per island:');
for (const row of byIsland) {
  const flag = row.cnt < 5 ? ' ⚠' : '';
  console.log(`  ${row.display_name}: ${row.cnt}${flag}`);
}
