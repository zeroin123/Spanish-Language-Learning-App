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

export async function getSessionCap(): Promise<number> {
  try {
    const db = getDb();
    const { rows } = await db.execute('SELECT session_card_cap FROM settings WHERE id = 1');
    return rows.length > 0 ? ((rows[0].session_card_cap as number) ?? 30) : 30;
  } catch {
    return 30;
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getDb();
  const now = new Date().toISOString();
  const [r1, r2, r3] = await Promise.all([
    db.execute('SELECT COUNT(*) as c FROM sentences'),
    db.execute({ sql: 'SELECT COUNT(*) as c FROM sentences WHERE mastered = 0 AND (next_review IS NULL OR next_review <= ?)', args: [now] }),
    db.execute('SELECT COUNT(*) as c FROM sentences WHERE mastered = 1'),
  ]);
  return {
    totalSentences: r1.rows[0].c as number,
    dueToday: r2.rows[0].c as number,
    mastered: r3.rows[0].c as number,
  };
}

export async function getIslandsWithStats(): Promise<IslandStat[]> {
  const db = getDb();
  const now = new Date().toISOString();
  const { rows } = await db.execute({
    sql: `
      SELECT
        i.id, i.slug, i.display_name, i.icon_emoji, i.color,
        COUNT(s.id) as sentence_count,
        SUM(CASE WHEN s.mastered = 1 THEN 1 ELSE 0 END) as mastered_count,
        SUM(CASE WHEN s.mastered = 0 AND (s.next_review IS NULL OR s.next_review <= ?) THEN 1 ELSE 0 END) as due_count
      FROM islands i
      LEFT JOIN sentences s ON s.island_id = i.id
      GROUP BY i.id
      ORDER BY i.sort_order
    `,
    args: [now],
  });

  return rows.map(r => ({
    id: r.id as string,
    slug: r.slug as string,
    displayName: r.display_name as string,
    emoji: r.icon_emoji as string,
    color: r.color as string,
    sentenceCount: r.sentence_count as number,
    masteredCount: (r.mastered_count as number) ?? 0,
    dueCount: (r.due_count as number) ?? 0,
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

export async function getDueQueue(limit = 30): Promise<QueueCard[]> {
  const db = getDb();
  const now = new Date().toISOString();
  const { rows } = await db.execute({
    sql: `
      SELECT s.id, s.native, s.target, s.speaker, s.interval, s.ease_factor, s.reps,
             i.display_name as island_name, i.icon_emoji as island_emoji, i.color as island_color
      FROM sentences s
      JOIN islands i ON i.id = s.island_id
      WHERE s.mastered = 0 AND (s.next_review IS NULL OR s.next_review <= ?)
      ORDER BY RANDOM()
      LIMIT ?
    `,
    args: [now, limit],
  });
  return rows.map(r => ({
    id: r.id as string,
    native: r.native as string,
    target: r.target as string,
    speaker: r.speaker as string | null,
    interval: r.interval as number,
    easeFactor: r.ease_factor as number,
    reps: r.reps as number,
    islandName: r.island_name as string,
    islandEmoji: r.island_emoji as string,
    islandColor: r.island_color as string,
  }));
}

export async function getTotalDueCount(): Promise<number> {
  const db = getDb();
  const now = new Date().toISOString();
  const { rows } = await db.execute({
    sql: 'SELECT COUNT(*) as c FROM sentences WHERE mastered = 0 AND (next_review IS NULL OR next_review <= ?)',
    args: [now],
  });
  return rows[0].c as number;
}

export async function getIsland(slug: string): Promise<IslandRow | null> {
  const db = getDb();
  const { rows } = await db.execute({
    sql: 'SELECT id, slug, display_name, icon_emoji, color FROM islands WHERE slug = ?',
    args: [slug],
  });
  return rows.length > 0 ? (rows[0] as unknown as IslandRow) : null;
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

export async function getAllListenSentences(): Promise<ListenSentence[]> {
  const db = getDb();
  const { rows } = await db.execute(`
    SELECT s.id, s.native, s.target, s.speaker, s.island_id,
           i.display_name, i.icon_emoji, i.color
    FROM sentences s
    JOIN islands i ON i.id = s.island_id
    ORDER BY i.sort_order, s.rowid
  `);
  return rows.map(r => ({
    id: r.id as string,
    native: r.native as string,
    target: r.target as string,
    speaker: r.speaker as string | null,
    islandId: r.island_id as string,
    islandName: r.display_name as string,
    islandEmoji: r.icon_emoji as string,
    islandColor: r.color as string,
  }));
}

export async function getIslandSentences(islandId: string): Promise<SentenceRow[]> {
  const db = getDb();
  const { rows } = await db.execute({
    sql: `
      SELECT id, native, target, speaker, interval, reps, mastered, next_review
      FROM sentences
      WHERE island_id = ?
      ORDER BY source_dialogue, rowid
    `,
    args: [islandId],
  });
  return rows.map(r => ({
    id: r.id as string,
    native: r.native as string,
    target: r.target as string,
    speaker: r.speaker as string | null,
    interval: r.interval as number,
    reps: r.reps as number,
    mastered: (r.mastered as number) === 1,
    nextReview: r.next_review as string | null,
  }));
}
