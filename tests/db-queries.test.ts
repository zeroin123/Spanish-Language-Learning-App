/**
 * DB query tests — uses an in-memory SQLite database so they never touch the real data file.
 * The schema is inlined here to keep tests self-contained.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'crypto';

// ── In-memory DB setup ────────────────────────────────────────────────────────

function makeDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE islands (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon_emoji TEXT NOT NULL,
      source_lesson INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE sentences (
      id TEXT PRIMARY KEY,
      island_id TEXT NOT NULL,
      native TEXT NOT NULL,
      target TEXT NOT NULL,
      speaker TEXT,
      source TEXT NOT NULL DEFAULT 'book',
      source_lesson_id INTEGER,
      source_dialogue INTEGER,
      interval INTEGER NOT NULL DEFAULT 1,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      reps INTEGER NOT NULL DEFAULT 0,
      next_review TEXT,
      last_reviewed TEXT,
      mastered INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return db;
}

// ── Mock getDb to return our in-memory instance ───────────────────────────────

let testDb: ReturnType<typeof makeDb>;

vi.mock('../lib/db/index', () => ({
  getDb: () => testDb,
}));

// Import queries AFTER mocking
const { getDashboardStats, getIslandsWithStats, getDueQueue, getAllListenSentences } =
  await import('../lib/db/queries');

// ── Helpers ───────────────────────────────────────────────────────────────────

const NOW = new Date().toISOString();
const PAST = new Date(Date.now() - 86_400_000).toISOString(); // yesterday

function insertIsland(db: ReturnType<typeof makeDb>, overrides: Partial<{
  id: string; slug: string; displayName: string; sortOrder: number;
}> = {}) {
  const id = overrides.id ?? randomUUID();
  db.prepare(`
    INSERT INTO islands (id, slug, display_name, color, icon_emoji, sort_order, created_at)
    VALUES (?, ?, ?, '#fff', '🏝', ?, ?)
  `).run(id, overrides.slug ?? id, overrides.displayName ?? 'Test Island', overrides.sortOrder ?? 0, NOW);
  return id;
}

function insertSentence(db: ReturnType<typeof makeDb>, islandId: string, overrides: Partial<{
  mastered: number; nextReview: string | null; reps: number; interval: number;
}> = {}) {
  const id = randomUUID();
  db.prepare(`
    INSERT INTO sentences (id, island_id, native, target, interval, reps, mastered, next_review, created_at, updated_at)
    VALUES (?, ?, 'Hello', 'Hola', ?, ?, ?, ?, ?, ?)
  `).run(
    id, islandId,
    overrides.interval ?? 1,
    overrides.reps ?? 0,
    overrides.mastered ?? 0,
    overrides.nextReview ?? null,
    NOW, NOW,
  );
  return id;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  testDb = makeDb();
});

describe('getDashboardStats', () => {
  it('returns zeros for an empty DB', () => {
    const stats = getDashboardStats();
    expect(stats.totalSentences).toBe(0);
    expect(stats.dueToday).toBe(0);
    expect(stats.mastered).toBe(0);
  });

  it('counts total sentences correctly', () => {
    const islandId = insertIsland(testDb);
    insertSentence(testDb, islandId);
    insertSentence(testDb, islandId);
    expect(getDashboardStats().totalSentences).toBe(2);
  });

  it('counts sentences due now (null nextReview = due immediately)', () => {
    const islandId = insertIsland(testDb);
    insertSentence(testDb, islandId, { nextReview: null });       // due
    insertSentence(testDb, islandId, { nextReview: PAST });       // due (past)
    insertSentence(testDb, islandId, { nextReview: new Date(Date.now() + 86_400_000).toISOString() }); // future
    expect(getDashboardStats().dueToday).toBe(2);
  });

  it('counts mastered sentences', () => {
    const islandId = insertIsland(testDb);
    insertSentence(testDb, islandId, { mastered: 1 });
    insertSentence(testDb, islandId, { mastered: 0 });
    expect(getDashboardStats().mastered).toBe(1);
  });

  it('mastered sentences are not counted as due', () => {
    const islandId = insertIsland(testDb);
    insertSentence(testDb, islandId, { mastered: 1, nextReview: null });
    expect(getDashboardStats().dueToday).toBe(0);
  });
});

describe('getIslandsWithStats', () => {
  it('returns all islands ordered by sort_order', () => {
    insertIsland(testDb, { slug: 'b', sortOrder: 2 });
    insertIsland(testDb, { slug: 'a', sortOrder: 1 });
    const result = getIslandsWithStats();
    expect(result[0].slug).toBe('a');
    expect(result[1].slug).toBe('b');
  });

  it('includes sentence counts per island', () => {
    const id1 = insertIsland(testDb, { slug: 'one' });
    const id2 = insertIsland(testDb, { slug: 'two' });
    insertSentence(testDb, id1);
    insertSentence(testDb, id1);
    insertSentence(testDb, id2);
    const result = getIslandsWithStats();
    const one = result.find(i => i.slug === 'one')!;
    const two = result.find(i => i.slug === 'two')!;
    expect(one.sentenceCount).toBe(2);
    expect(two.sentenceCount).toBe(1);
  });

  it('returns masteredCount and dueCount of 0 for island with no sentences', () => {
    insertIsland(testDb);
    const [island] = getIslandsWithStats();
    expect(island.masteredCount).toBe(0);
    expect(island.dueCount).toBe(0);
  });
});

describe('getDueQueue', () => {
  it('returns only unmastered sentences that are due', () => {
    const islandId = insertIsland(testDb);
    insertSentence(testDb, islandId, { nextReview: null });        // due
    insertSentence(testDb, islandId, { nextReview: PAST });        // due
    insertSentence(testDb, islandId, { mastered: 1 });             // not due (mastered)
    insertSentence(testDb, islandId, {
      nextReview: new Date(Date.now() + 86_400_000).toISOString() // not due (future)
    });
    const queue = getDueQueue(30);
    expect(queue).toHaveLength(2);
  });

  it('respects the limit parameter', () => {
    const islandId = insertIsland(testDb);
    for (let i = 0; i < 10; i++) insertSentence(testDb, islandId);
    expect(getDueQueue(5)).toHaveLength(5);
  });

  it('returned cards have the required fields', () => {
    const islandId = insertIsland(testDb);
    insertSentence(testDb, islandId);
    const [card] = getDueQueue(1);
    expect(card).toHaveProperty('id');
    expect(card).toHaveProperty('native');
    expect(card).toHaveProperty('target');
    expect(card).toHaveProperty('interval');
    expect(card).toHaveProperty('easeFactor');
    expect(card).toHaveProperty('islandName');
  });
});

describe('getAllListenSentences', () => {
  it('returns all sentences across all islands', () => {
    const id1 = insertIsland(testDb, { slug: 'x' });
    const id2 = insertIsland(testDb, { slug: 'y' });
    insertSentence(testDb, id1);
    insertSentence(testDb, id2);
    insertSentence(testDb, id2);
    expect(getAllListenSentences()).toHaveLength(3);
  });

  it('includes islandName and islandEmoji on each sentence', () => {
    const islandId = insertIsland(testDb);
    insertSentence(testDb, islandId);
    const [s] = getAllListenSentences();
    expect(s.islandName).toBe('Test Island');
    expect(s.islandEmoji).toBe('🏝');
  });

  it('returns empty array when no sentences exist', () => {
    expect(getAllListenSentences()).toEqual([]);
  });
});
