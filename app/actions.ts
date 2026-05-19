'use server';

import { getDb } from '@/lib/db/index';
import { applyGrade } from '@/lib/srs';
import { translateSentences, extractVocab, type VocabItem } from '@/lib/ai';
import { randomUUID } from 'crypto';

export async function translateAction(
  sentences: string[],
): Promise<{ native: string; translated: string }[]> {
  return translateSentences(sentences, 'English', 'Spanish');
}

export async function extractVocabAction(text: string): Promise<VocabItem[]> {
  return extractVocab(text, 'Spanish');
}

export async function addSentencesAction(
  pairs: { native: string; translated: string }[],
  islandId: string,
  source: 'user_typed' | 'user_voice' | 'pre_input',
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  for (const pair of pairs) {
    if (!pair.native.trim() || !pair.translated.trim()) continue;
    await db.execute({
      sql: `INSERT INTO sentences (id, island_id, native, target, source, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [randomUUID(), islandId, pair.native.trim(), pair.translated.trim(), source, now, now],
    });
  }
}

export async function gradeCardAction(id: string, grade: 0 | 1 | 2 | 3): Promise<void> {
  const db = getDb();
  const { rows } = await db.execute({
    sql: 'SELECT interval, ease_factor, reps FROM sentences WHERE id = ?',
    args: [id],
  });
  if (rows.length === 0) return;
  const row = rows[0];

  const updated = applyGrade(
    { interval: row.interval as number, easeFactor: row.ease_factor as number, reps: row.reps as number },
    grade,
  );

  await db.execute({
    sql: `UPDATE sentences
          SET interval = ?, ease_factor = ?, reps = ?, next_review = ?, last_reviewed = ?, mastered = ?, updated_at = ?
          WHERE id = ?`,
    args: [
      updated.interval,
      updated.easeFactor,
      updated.reps,
      updated.nextReview,
      updated.lastReviewed,
      updated.mastered ? 1 : 0,
      updated.lastReviewed,
      id,
    ],
  });
}
