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

/* ── Review History ──────────────────────────────────────────── */

export type HistoryBucket = { label: string; date: string; count: number };

export type ReviewHistoryData = {
  buckets: HistoryBucket[];
  currentStreak: number;
  thisWeekReviews: number;
  bestBucketCount: number;
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shiftDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function computeStreak(daily: HistoryBucket[]): number {
  // daily is oldest-first; walk backward from today
  const reversed = [...daily].reverse();
  let streak = 0;
  for (const bucket of reversed) {
    if (bucket.count > 0) streak++;
    else break;
  }
  return streak;
}

function buildDailyBuckets(
  dbMap: Map<string, number>,
  today: Date,
): HistoryBucket[] {
  const buckets: HistoryBucket[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = shiftDays(today, -i);
    const date = isoDate(d);
    const label = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
    buckets.push({ label, date, count: dbMap.get(date) ?? 0 });
  }
  return buckets;
}

function buildWeeklyBuckets(
  dbMap: Map<string, number>,
  today: Date,
): HistoryBucket[] {
  const buckets: HistoryBucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = shiftDays(today, -i * 7 - today.getDay());
    const yearStr = weekStart.getFullYear().toString();
    // Compute ISO week number
    const jan1 = new Date(weekStart.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((weekStart.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    const key = `${yearStr}-${String(weekStart.getMonth() + 1).padStart(2, '0')}`; // fallback
    // Use strftime-style key: YYYY-WW
    const wKey = `${yearStr}-${String(weekNum).padStart(2, '0')}`;
    const label = `W${weekNum}`;
    buckets.push({ label, date: isoDate(weekStart), count: dbMap.get(wKey) ?? 0 });
  }
  return buckets;
}

function buildMonthlyBuckets(
  dbMap: Map<string, number>,
  today: Date,
): HistoryBucket[] {
  const buckets: HistoryBucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    buckets.push({ label, date: isoDate(d), count: dbMap.get(key) ?? 0 });
  }
  return buckets;
}

export async function getReviewHistory(): Promise<{
  daily: ReviewHistoryData;
  weekly: ReviewHistoryData;
  monthly: ReviewHistoryData;
}> {
  try {
    const db = getDb();
    const today = new Date();

    const dailyStart  = isoDate(shiftDays(today, -13));
    const weeklyStart = isoDate(shiftDays(today, -83));
    const monthlyStart = isoDate(new Date(today.getFullYear(), today.getMonth() - 11, 1));
    const weekAgo = shiftDays(today, -7).toISOString();

    const [dailyRows, weeklyRows, monthlyRows, weekRow] = await Promise.all([
      db.execute({
        sql: `SELECT DATE(last_reviewed) AS bucket, COUNT(*) AS cnt
              FROM sentences
              WHERE last_reviewed IS NOT NULL AND DATE(last_reviewed) >= ?
              GROUP BY DATE(last_reviewed) ORDER BY bucket ASC`,
        args: [dailyStart],
      }),
      db.execute({
        sql: `SELECT strftime('%Y-%W', last_reviewed) AS bucket, COUNT(*) AS cnt
              FROM sentences
              WHERE last_reviewed IS NOT NULL AND DATE(last_reviewed) >= ?
              GROUP BY strftime('%Y-%W', last_reviewed) ORDER BY bucket ASC`,
        args: [weeklyStart],
      }),
      db.execute({
        sql: `SELECT strftime('%Y-%m', last_reviewed) AS bucket, COUNT(*) AS cnt
              FROM sentences
              WHERE last_reviewed IS NOT NULL AND DATE(last_reviewed) >= ?
              GROUP BY strftime('%Y-%m', last_reviewed) ORDER BY bucket ASC`,
        args: [monthlyStart],
      }),
      db.execute({
        sql: `SELECT COUNT(*) AS cnt FROM sentences WHERE last_reviewed >= ?`,
        args: [weekAgo],
      }),
    ]);

    const toMap = (rows: typeof dailyRows.rows) =>
      new Map(rows.map(r => [r.bucket as string, r.cnt as number]));

    const dailyBuckets   = buildDailyBuckets(toMap(dailyRows.rows), today);
    const weeklyBuckets  = buildWeeklyBuckets(toMap(weeklyRows.rows), today);
    const monthlyBuckets = buildMonthlyBuckets(toMap(monthlyRows.rows), today);

    const currentStreak   = computeStreak(dailyBuckets);
    const thisWeekReviews = (weekRow.rows[0].cnt as number) ?? 0;

    const makeData = (buckets: HistoryBucket[]): ReviewHistoryData => ({
      buckets,
      currentStreak,
      thisWeekReviews,
      bestBucketCount: Math.max(...buckets.map(b => b.count), 0),
    });

    return {
      daily:   makeData(dailyBuckets),
      weekly:  makeData(weeklyBuckets),
      monthly: makeData(monthlyBuckets),
    };
  } catch {
    const empty: ReviewHistoryData = {
      buckets: [], currentStreak: 0, thisWeekReviews: 0, bestBucketCount: 0,
    };
    return { daily: empty, weekly: empty, monthly: empty };
  }
}
