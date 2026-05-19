import { getDb } from './index';

export type IslandStat = {
  id: string;
  slug: string;
  displayName: string;
  emoji: string;
  color: string;
  sentenceCount: number;
  masteredCount: number;
  dueCount: number;
};

export type DashboardStats = {
  totalSentences: number;
  dueToday: number;
  mastered: number;
};

export type SentenceRow = {
  id: string;
  native: string;
  target: string;
  speaker: string | null;
  interval: number;
  reps: number;
  mastered: boolean;
  nextReview: string | null;
};

export type IslandRow = {
  id: string;
  slug: string;
  display_name: string;
  icon_emoji: string;
  color: string;
};

export function getDashboardStats(): DashboardStats {
  const db = getDb();
  const now = new Date().toISOString();
  const total = (db.prepare('SELECT COUNT(*) as c FROM sentences').get() as { c: number }).c;
  const due = (db.prepare(
    'SELECT COUNT(*) as c FROM sentences WHERE mastered = 0 AND (next_review IS NULL OR next_review <= ?)'
  ).get(now) as { c: number }).c;
  const mastered = (db.prepare('SELECT COUNT(*) as c FROM sentences WHERE mastered = 1').get() as { c: number }).c;
  return { totalSentences: total, dueToday: due, mastered };
}

export function getIslandsWithStats(): IslandStat[] {
  const db = getDb();
  const now = new Date().toISOString();
  const rows = db.prepare(`
    SELECT
      i.id, i.slug, i.display_name, i.icon_emoji, i.color,
      COUNT(s.id) as sentence_count,
      SUM(CASE WHEN s.mastered = 1 THEN 1 ELSE 0 END) as mastered_count,
      SUM(CASE WHEN s.mastered = 0 AND (s.next_review IS NULL OR s.next_review <= ?) THEN 1 ELSE 0 END) as due_count
    FROM islands i
    LEFT JOIN sentences s ON s.island_id = i.id
    GROUP BY i.id
    ORDER BY i.sort_order
  `).all(now) as Array<{
    id: string; slug: string; display_name: string; icon_emoji: string; color: string;
    sentence_count: number; mastered_count: number | null; due_count: number | null;
  }>;

  return rows.map(r => ({
    id: r.id,
    slug: r.slug,
    displayName: r.display_name,
    emoji: r.icon_emoji,
    color: r.color,
    sentenceCount: r.sentence_count,
    masteredCount: r.mastered_count ?? 0,
    dueCount: r.due_count ?? 0,
  }));
}

export type QueueCard = {
  id: string;
  native: string;
  target: string;
  speaker: string | null;
  interval: number;
  easeFactor: number;
  reps: number;
  islandName: string;
  islandEmoji: string;
  islandColor: string;
};

export function getDueQueue(limit = 30): QueueCard[] {
  const db = getDb();
  const now = new Date().toISOString();
  return (db.prepare(`
    SELECT s.id, s.native, s.target, s.speaker, s.interval, s.ease_factor, s.reps,
           i.display_name as island_name, i.icon_emoji as island_emoji, i.color as island_color
    FROM sentences s
    JOIN islands i ON i.id = s.island_id
    WHERE s.mastered = 0 AND (s.next_review IS NULL OR s.next_review <= ?)
    ORDER BY RANDOM()
    LIMIT ?
  `).all(now, limit) as Array<{
    id: string; native: string; target: string; speaker: string | null;
    interval: number; ease_factor: number; reps: number;
    island_name: string; island_emoji: string; island_color: string;
  }>).map(r => ({
    id: r.id,
    native: r.native,
    target: r.target,
    speaker: r.speaker,
    interval: r.interval,
    easeFactor: r.ease_factor,
    reps: r.reps,
    islandName: r.island_name,
    islandEmoji: r.island_emoji,
    islandColor: r.island_color,
  }));
}

export function getTotalDueCount(): number {
  const db = getDb();
  const now = new Date().toISOString();
  return (db.prepare(
    'SELECT COUNT(*) as c FROM sentences WHERE mastered = 0 AND (next_review IS NULL OR next_review <= ?)'
  ).get(now) as { c: number }).c;
}

export function getIsland(slug: string): IslandRow | null {
  const db = getDb();
  return (db.prepare('SELECT id, slug, display_name, icon_emoji, color FROM islands WHERE slug = ?').get(slug) as IslandRow) ?? null;
}

export type ListenSentence = {
  id: string;
  native: string;
  target: string;
  speaker: string | null;
  islandId: string;
  islandName: string;
  islandEmoji: string;
  islandColor: string;
};

export function getAllListenSentences(): ListenSentence[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT s.id, s.native, s.target, s.speaker, s.island_id,
           i.display_name, i.icon_emoji, i.color
    FROM sentences s
    JOIN islands i ON i.id = s.island_id
    ORDER BY i.sort_order, s.rowid
  `).all() as Array<{
    id: string; native: string; target: string; speaker: string | null; island_id: string;
    display_name: string; icon_emoji: string; color: string;
  }>;
  return rows.map(r => ({
    id: r.id, native: r.native, target: r.target, speaker: r.speaker,
    islandId: r.island_id, islandName: r.display_name,
    islandEmoji: r.icon_emoji, islandColor: r.color,
  }));
}

export function getIslandSentences(islandId: string): SentenceRow[] {
  const db = getDb();
  return (db.prepare(`
    SELECT id, native, target, speaker, interval, reps, mastered, next_review
    FROM sentences
    WHERE island_id = ?
    ORDER BY source_dialogue, rowid
  `).all(islandId) as Array<{
    id: string; native: string; target: string; speaker: string | null;
    interval: number; reps: number; mastered: number; next_review: string | null;
  }>).map(r => ({
    id: r.id,
    native: r.native,
    target: r.target,
    speaker: r.speaker,
    interval: r.interval,
    reps: r.reps,
    mastered: r.mastered === 1,
    nextReview: r.next_review,
  }));
}
