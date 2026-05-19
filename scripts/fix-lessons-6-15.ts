// Definitive fix for lessons 6-15: proper line-continuation joining + Claude translation.
// Also removes grammar-example sentences (speaker "A", "V", etc.) from ALL lessons.
// Run: npx tsx --no-warnings=ExperimentalWarning --env-file=.env.local scripts/fix-lessons-6-15.ts

import { DatabaseSync } from 'node:sqlite';
import { translateSentences } from '../lib/ai';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const SPANISH_CHARS = /[¿¡áéíóúüñÁÉÍÓÚÜÑ]/;
function isSpanish(text: string) { return SPANISH_CHARS.test(text); }

// Matches one or more ALL-CAPS words as speaker name, then 1-3 spaces, then speech.
// Handles: EMPLEADO, MR HAMPSON, SEÑORA, LESLEY Y MIKE, etc.
const SPEAKER_RE = /^([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\.]{0,15}(?:\s[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\.]{0,15})*)\s{1,3}([¿¡A-ZÁÉÍÓÚÜÑa-záéíóúüñ"'(].+)$/;

// Single-letter speakers ("A", "V") are grammar examples, not dialogue.
function isGrammarExample(speaker: string) {
  return /^[A-Z]$/.test(speaker.trim());
}

function extractSpeakerLines(rawText: string): Array<{ speaker: string; line: string }> {
  const results: Array<{ speaker: string; line: string }> = [];

  for (const raw of rawText.split('\n')) {
    // Strip markdown italic markers and leading/trailing whitespace
    const line = raw.replace(/[_*]+/g, '').trim();
    if (!line) continue;
    // Skip markdown headers, footnotes, stage directions
    if (line.startsWith('#') || line.startsWith('*') || line.startsWith('(')) continue;

    const m = SPEAKER_RE.exec(line);
    if (m) {
      const speaker = m[1].trim();
      const speech = m[2].trim();
      if (speech.length > 2) {
        results.push({ speaker, line: speech });
      }
    } else if (results.length > 0) {
      // Continuation line — append to previous speaker's text
      const last = results[results.length - 1];
      // Only append if it looks like actual speech, not metadata
      if (line.length > 1 && !/^In this lesson|^Note that|^The verb|^\d+\s+Lesson|^Vocabulary|^Exercise/.test(line)) {
        last.line = last.line + ' ' + line;
      }
    }
  }

  return results;
}

const LESSON_NUMBER_MAP: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
};

async function main() {
  const bookPath = path.join(process.cwd(), '..', 'Colloquial_Spansih.md');
  if (!fs.existsSync(bookPath)) { console.error('Book not found'); process.exit(1); }
  const bookText = fs.readFileSync(bookPath, 'utf-8');

  const dbPath = path.join(process.cwd(), 'data', 'polyglot.db');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');

  // 1. Remove grammar examples from ALL lessons
  const grammarDeleted = db.prepare(
    `DELETE FROM sentences WHERE speaker IN ('A', 'V') OR (speaker IS NOT NULL AND length(speaker) = 1 AND speaker GLOB '[A-Z]')`
  ).run();
  console.log(`Deleted ${grammarDeleted.changes} grammar-example sentences.`);

  // 2. Delete ALL sentences for lessons 6-15 (will re-insert fresh)
  const lessonDeleted = db.prepare(`DELETE FROM sentences WHERE source_lesson_id >= 6`).run();
  console.log(`Deleted ${lessonDeleted.changes} sentences for lessons 6-15.`);

  // 3. Parse lesson chunks
  const lessonHeaderRe = /^### Lesson (One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen)\s*$/im;
  const glossaryStart = bookText.indexOf('### Spanish–English glossary');
  const lessonMatches: Array<{ num: number; start: number }> = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(lessonHeaderRe.source, 'gim');
  while ((m = re.exec(bookText)) !== null) {
    const num = LESSON_NUMBER_MAP[m[1].toLowerCase()];
    if (num) lessonMatches.push({ num, start: m.index });
  }
  const lessonChunks = lessonMatches
    .map((lm, i) => ({
      num: lm.num,
      text: bookText.slice(lm.start, lessonMatches[i + 1]?.start ?? glossaryStart),
    }))
    .filter(c => c.num >= 6);

  const islandByLesson = new Map<number, string>();
  const islandRows = db.prepare('SELECT id, source_lesson FROM islands WHERE source_lesson IS NOT NULL').all() as Array<{ id: string; source_lesson: number }>;
  for (const row of islandRows) islandByLesson.set(row.source_lesson, row.id);

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO sentences
      (id, island_id, native, target, speaker, source, source_lesson_id, source_dialogue, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'book', ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  let totalInserted = 0;

  for (const { num, text } of lessonChunks) {
    const islandId = islandByLesson.get(num);
    if (!islandId) { console.warn(`No island for lesson ${num}`); continue; }

    const dialogueRe = /#### Dialogue (\d+)([\s\S]*?)(?=#### Dialogue \d+|##### Vocabulary|### Lesson|### Spanish|$)/gi;
    let dm: RegExpExecArray | null;

    while ((dm = dialogueRe.exec(text)) !== null) {
      const dialogueNum = parseInt(dm[1]);
      const allLines = extractSpeakerLines(dm[2]);

      // Filter Spanish lines, skip grammar examples
      const spanishLines = allLines.filter(l => isSpanish(l.line) && !isGrammarExample(l.speaker));
      if (spanishLines.length === 0) continue;

      console.log(`  Lesson ${num} D${dialogueNum}: Translating ${spanishLines.length} lines...`);
      try {
        const translated = await translateSentences(spanishLines.map(l => l.line), 'Spanish', 'English');
        for (let i = 0; i < spanishLines.length; i++) {
          const sp = spanishLines[i];
          const en = translated[i]?.translated ?? '';
          if (!sp.line.trim() || !en.trim()) continue;
          insertStmt.run(randomUUID(), islandId, en, sp.line, sp.speaker, num, dialogueNum, now, now);
          totalInserted++;
        }
      } catch (e) {
        console.warn(`  Translation failed for L${num}D${dialogueNum}: ${e}`);
      }
    }
  }

  const counts = db.prepare('SELECT COUNT(*) as c FROM sentences').get() as { c: number };
  console.log(`\n✓ Done. Inserted ${totalInserted} new sentences. Total in DB: ${counts.c}`);

  // Sanity check
  const byLesson = db.prepare(`
    SELECT i.display_name, COUNT(s.id) as cnt
    FROM islands i LEFT JOIN sentences s ON s.island_id = i.id
    GROUP BY i.id ORDER BY i.sort_order
  `).all() as Array<{ display_name: string; cnt: number }>;
  console.log('\nSentences per island:');
  for (const row of byLesson) {
    const flag = row.cnt < 5 ? ' ⚠' : '';
    console.log(`  ${row.display_name}: ${row.cnt}${flag}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
