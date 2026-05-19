/**
 * DB query tests — uses an in-memory LibSQL database so they never touch the real data file.
 * The schema is inlined here to keep tests self-contained.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClient, type Client } from '@libsql/client';
import { randomUUID } from 'crypto';

// ── In-memory DB setup ────────────────────────────────────────────────────────

async function makeDb(): Promise<Client> {
  const db = createClient({ url: ':memory:' });
  await db.executeMultiple(`
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

let testDb: Client;

vi.mock('../lib/db/index', () => ({
  getDb: () => testDb,
}));

// Import queries AFTER mocking
const { getDashboardStats, getIslandsWithStats, getDueQueue, getAllListenSentences } =
  await import('../lib/db/queries');

// ── Helpers ───────────────────────────────────────────────────────────────────

const NOW = new Date().toISOString();
const PAST = new Date(Date.now() - 86_400_000).toISOString(); // yesterday

async function insertIsland(db: Client, overrides: Partial<{
  id: string; slug: string; displayName: string; sortOrder: number;
}> = {}) {
  const id = overrides.id ?? randomUUID();
  await db.execute({
    sql: `INSERT INTO islands (id, slug, display_name, color, icon_emoji, sort_order, created_at)
          VALUES (?, ?, ?, '#fff', '🏝', ?, ?)`,
    args: [id, overrides.slug ?? id, overrides.displayName ?? 'Test Island', overrides.sortOrder ?? 0, NOW],
  });
  return id;
}

async function insertSentence(db: Client, islandId: string, overrides: Partial<{
  mastered: number; nextReview: string | null; reps: number; interval: number;
}> = {}) {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO sentences (id, island_id, native, target, interval, reps, mastered, next_review, created_at, updated_at)
          VALUES (?, ?, 'Hello', 'Hola', ?, ?, ?, ?, ?, ?)`,
    args: [
      id, islandId,
      overrides.interval ?? 1,
      overrides.reps ?? 0,
      overrides.mastered ?? 0,
      overrides.nextReview ?? null,
      NOW, NOW,
    ],
  });
  return id;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  testDb = await makeDb();
});

describe('getDashboardStats', () => {
  it('returns zeros for an empty DB', async () => {
    const stats = await getDashboardStats();
    expect(stats.totalSentences).toBe(0);
    expect(stats.dueToday).toBe(0);
    expect(stats.mastered).toBe(0);
  });

  it('counts total sentences correctly', async () => {
    const islandId = await insertIsland(testDb);
    await insertSentence(testDb, islandId);
    await insertSentence(testDb, islandId);
    expect((await getDashboardStats()).totalSentences).toBe(2);
  });

  it('counts sentences due now (null nextReview = due immediately)', async () => {
    const islandId = await insertIsland(testDb);
    await insertSentence(testDb, islandId, { nextReview: null });
    await insertSentence(testDb, islandId, { nextReview: PAST });
    await insertSentence(testDb, islandId, { nextReview: new Date(Date.now() + 86_400_000).toISOString() });
    expect((await getDashboardStats()).dueToday).toBe(2);
  });

  it('counts mastered sentences', async () => {
    const islandId = await insertIsland(testDb);
    await insertSentence(testDb, islandId, { mastered: 1 });
    await insertSentence(testDb, islandId, { mastered: 0 });
    expect((await getDashboardStats()).mastered).toBe(1);
  });

  it('mastered sentences are not counted as due', async () => {
    const islandId = await insertIsland(testDb);
    await insertSentence(testDb, islandId, { mastered: 1, nextReview: null });
    expect((await getDashboardStats()).dueToday).toBe(0);
  });
});

describe('getIslandsWithStats', () => {
  it('returns all islands ordered by sort_order', async () => {
    await insertIsland(testDb, { slug: 'b', sortOrder: 2 });
    await insertIsland(testDb, { slug: 'a', sortOrder: 1 });
    const result = await getIslandsWithStats();
    expect(result[0].slug).toBe('a');
    expect(result[1].slug).toBe('b');
  });

  it('includes sentence counts per island', async () => {
    const id1 = await insertIsland(testDb, { slug: 'one' });
    const id2 = await insertIsland(testDb, { slug: 'two' });
    await insertSentence(testDb, id1);
    await insertSentence(testDb, id1);
    await insertSentence(testDb, id2);
    const result = await getIslandsWithStats();
    const one = result.find(i => i.slug === 'one')!;
    const two = result.find(i => i.slug === 'two')!;
    expect(one.sentenceCount).toBe(2);
    expect(two.sentenceCount).toBe(1);
  });

  it('returns masteredCount and dueCount of 0 for island with no sentences', async () => {
    await insertIsland(testDb);
    const [island] = await getIslandsWithStats();
    expect(island.masteredCount).toBe(0);
    expect(island.dueCount).toBe(0);
  });
});

describe('getDueQueue', () => {
  it('returns only unmastered sentences that are due', async () => {
    const islandId = await insertIsland(testDb);
    await insertSentence(testDb, islandId, { nextReview: null });
    await insertSentence(testDb, islandId, { nextReview: PAST });
    await insertSentence(testDb, islandId, { mastered: 1 });
    await insertSentence(testDb, islandId, { nextReview: new Date(Date.now() + 86_400_000).toISOString() });
    const queue = await getDueQueue(30);
    expect(queue).toHaveLength(2);
  });

  it('respects the limit parameter', async () => {
    const islandId = await insertIsland(testDb);
    for (let i = 0; i < 10; i++) await insertSentence(testDb, islandId);
    expect(await getDueQueue(5)).toHaveLength(5);
  });

  it('returned cards have the required fields', async () => {
    const islandId = await insertIsland(testDb);
    await insertSentence(testDb, islandId);
    const [card] = await getDueQueue(1);
    expect(card).toHaveProperty('id');
    expect(card).toHaveProperty('native');
    expect(card).toHaveProperty('target');
    expect(card).toHaveProperty('interval');
    expect(card).toHaveProperty('easeFactor');
    expect(card).toHaveProperty('islandName');
  });
});

describe('getAllListenSentences', () => {
  it('returns all sentences across all islands', async () => {
    const id1 = await insertIsland(testDb, { slug: 'x' });
    const id2 = await insertIsland(testDb, { slug: 'y' });
    await insertSentence(testDb, id1);
    await insertSentence(testDb, id2);
    await insertSentence(testDb, id2);
    expect(await getAllListenSentences()).toHaveLength(3);
  });

  it('includes islandName and islandEmoji on each sentence', async () => {
    const islandId = await insertIsland(testDb);
    await insertSentence(testDb, islandId);
    const [s] = await getAllListenSentences();
    expect(s.islandName).toBe('Test Island');
    expect(s.islandEmoji).toBe('🏝');
  });

  it('returns empty array when no sentences exist', async () => {
    expect(await getAllListenSentences()).toEqual([]);
  });
});
