// Fixes lessons 1-5 sentence pairs which are mismatched because:
//   1. The Spanish dialogue starts in PLAIN TEXT (not a code block)
//   2. The English dialogue is in a CODE BLOCK
//   3. The old parser mixed them up via character-based language detection
//
// New approach: identify the English dialogue code block explicitly (≥70% non-Spanish
// speaker lines), then collect Spanish lines from everything else.
//
// Run: npx tsx --no-warnings=ExperimentalWarning --env-file=.env.local scripts/fix-lesson-pairs.ts

import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const SPANISH_CHARS = /[¿¡áéíóúüñÁÉÍÓÚÜÑ]/;
const SPEAKER_RE = /^([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\-\s]{0,20}?)\s{1,3}([¿¡A-ZÁÉÍÓÚÜÑa-z_"'(].*)$/;

function isSpanish(text: string) { return SPANISH_CHARS.test(text); }

function joinWrappedLines(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];
  for (const raw of lines) {
    const t = raw.trim();
    const isBoundary = !t
      || /^#+/.test(t)
      || t.startsWith('```')
      || t.startsWith('-')
      || /^\d+\s+Lesson/.test(t)
      || SPEAKER_RE.test(t)
      || /^[A-Z][A-Z\-]{1,20}\s+_/.test(t); // italic speaker line
    if (!isBoundary && out.length > 0 && out[out.length - 1].trim()) {
      out[out.length - 1] = out[out.length - 1].trimEnd() + ' ' + t;
    } else {
      out.push(raw);
    }
  }
  return out.join('\n');
}

function extractSpeakerLines(text: string, italicOnly = false): Array<{ speaker: string; line: string }> {
  const joined = joinWrappedLines(text);
  const results: Array<{ speaker: string; line: string }> = [];
  for (const raw of joined.split('\n')) {
    const isItalic = /^[A-Z][A-Z\-\s]{0,20}\s+_/.test(raw.trim());
    if (italicOnly && !isItalic) continue;
    const line = raw.replace(/_/g, '').trim();
    if (!line) continue;
    if (/^In this lesson|^Note that|^The verb|^You |^There |^This |^\d+\s+Lesson/.test(line)) continue;
    const m = line.match(SPEAKER_RE);
    if (m) {
      const speaker = m[1].trim();
      const speech = m[2].trim();
      if (speaker.length <= 20 && speech.length > 2) {
        results.push({ speaker, line: speech });
      }
    }
  }
  return results;
}

// Italic speaker line: SPEAKER _speech_ (English translation format in lessons 1-5)
const ITALIC_SPEAKER_RE = /^([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\-\s]{0,20}?)\s+_(.+?)_?\s*$/;

function splitDialogueSections(dialogueText: string): {
  spanishLines: Array<{ speaker: string; line: string }>;
  englishLines: Array<{ speaker: string; line: string }>;
} {
  const spanishLines: Array<{ speaker: string; line: string }> = [];
  const englishLines: Array<{ speaker: string; line: string }> = [];

  const parts = dialogueText.split(/(```[\s\S]*?```)/);

  for (const part of parts) {
    if (part.startsWith('```')) {
      // Code block: classify by Spanish character density of speaker lines
      const inner = part.replace(/^```|```$/g, '').trim();
      const joined = joinWrappedLines(inner);
      const speakerLines: Array<{ speaker: string; line: string }> = [];
      for (const raw of joined.split('\n')) {
        const t = raw.trim();
        const m = t.match(SPEAKER_RE);
        if (m && m[1].length <= 20 && m[2].length > 2) {
          speakerLines.push({ speaker: m[1].trim(), line: m[2].trim() });
        }
      }
      if (speakerLines.length < 2) continue;
      const spanishCount = speakerLines.filter(l => isSpanish(l.line)).length;
      if (spanishCount / speakerLines.length >= 0.3) {
        spanishLines.push(...speakerLines);
      } else {
        englishLines.push(...speakerLines);
      }
    } else {
      // Plain text: join wrapped lines first, then classify each speaker line
      const joined = joinWrappedLines(part);
      for (const raw of joined.split('\n')) {
        const t = raw.trim();
        if (!t || /^In this lesson|^Note that|^\d+\s+Lesson/.test(t)) continue;

        // Check italic first (English translation format)
        const italicM = t.match(ITALIC_SPEAKER_RE);
        if (italicM && italicM[1].length <= 20 && italicM[2].length > 2) {
          englishLines.push({ speaker: italicM[1].trim(), line: italicM[2].trim() });
          continue;
        }

        // Regular speaker line (Spanish)
        const m = t.match(SPEAKER_RE);
        if (m && m[1].length <= 20 && m[2].length > 2) {
          spanishLines.push({ speaker: m[1].trim(), line: m[2].trim() });
        }
      }
    }
  }

  return { spanishLines, englishLines };
}

function buildPairs(
  spanish: Array<{ speaker: string; line: string }>,
  english: Array<{ speaker: string; line: string }>,
): Array<{ spanish: string; english: string; speaker: string | null }> {
  const pairs: Array<{ spanish: string; english: string; speaker: string | null }> = [];
  const len = Math.min(spanish.length, english.length);
  for (let i = 0; i < len; i++) {
    pairs.push({ spanish: spanish[i].line, english: english[i].line, speaker: spanish[i].speaker });
  }
  return pairs;
}

const LESSON_NUMBER_MAP: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
};

async function main() {
  const bookPath = path.join(process.cwd(), '..', 'Colloquial_Spansih.md');
  if (!fs.existsSync(bookPath)) { console.error('Book not found'); process.exit(1); }
  const bookText = fs.readFileSync(bookPath, 'utf-8');

  const dbPath = path.join(process.cwd(), 'data', 'polyglot.db');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');

  // Delete all lessons 1-5 sentences
  const deleted = db.prepare('DELETE FROM sentences WHERE source_lesson_id <= 5').run();
  console.log(`Deleted ${deleted.changes} old lesson 1-5 sentences.`);

  // Parse lesson chunks for lessons 1-5
  const lessonHeaderRe = /^### Lesson (One|Two|Three|Four|Five)\s*$/im;
  const allLessonHeaderRe = /^### Lesson (One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen)\s*$/im;
  const lessonMatches: Array<{ num: number; start: number }> = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(allLessonHeaderRe.source, 'gim');
  while ((m = re.exec(bookText)) !== null) {
    const numStr = m[1].toLowerCase();
    const num = LESSON_NUMBER_MAP[numStr] ?? ([
      'one','two','three','four','five','six','seven','eight','nine','ten',
      'eleven','twelve','thirteen','fourteen','fifteen'
    ].indexOf(numStr) + 1);
    if (num) lessonMatches.push({ num, start: m.index });
  }

  const glossaryStart = bookText.indexOf('### Spanish–English glossary');
  const lessonChunks = lessonMatches
    .map((lm, i) => ({
      num: lm.num,
      text: bookText.slice(lm.start, lessonMatches[i + 1]?.start ?? glossaryStart),
    }))
    .filter(c => c.num <= 5);

  const islandByLesson = new Map<number, string>();
  const rows = db.prepare('SELECT id, source_lesson FROM islands WHERE source_lesson IS NOT NULL').all() as Array<{ id: string; source_lesson: number }>;
  for (const row of rows) islandByLesson.set(row.source_lesson, row.id);

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO sentences
      (id, island_id, native, target, speaker, source, source_lesson_id, source_dialogue, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'book', ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  let totalInserted = 0;
  let totalUnmatched = 0;

  for (const { num, text } of lessonChunks) {
    const islandId = islandByLesson.get(num);
    if (!islandId) { console.warn(`No island for lesson ${num}`); continue; }

    const dialogueRe = /#### Dialogue (\d+)([\s\S]*?)(?=#### Dialogue \d+|#{5}|### Lesson|### Spanish|$)/gi;
    let dm: RegExpExecArray | null;

    while ((dm = dialogueRe.exec(text)) !== null) {
      const dialogueNum = parseInt(dm[1]);
      const dialogueText = dm[2];

      const { spanishLines, englishLines } = splitDialogueSections(dialogueText);

      if (spanishLines.length === 0) {
        console.log(`  Lesson ${num} D${dialogueNum}: no Spanish lines found, skipping`);
        continue;
      }

      if (englishLines.length === 0) {
        console.log(`  Lesson ${num} D${dialogueNum}: no English block found (${spanishLines.length} Spanish lines)`);
        // Store with Spanish as both (will be visible but not ideal)
        for (const sp of spanishLines) {
          insertStmt.run(randomUUID(), islandId, sp.line, sp.line, sp.speaker, num, dialogueNum, now, now);
          totalInserted++;
        }
        continue;
      }

      const diff = Math.abs(spanishLines.length - englishLines.length);
      if (diff > 0) {
        console.log(`  Lesson ${num} D${dialogueNum}: ${spanishLines.length} ES, ${englishLines.length} EN (diff=${diff})`);
        totalUnmatched += diff;
      }

      const pairs = buildPairs(spanishLines, englishLines);
      for (const pair of pairs) {
        insertStmt.run(randomUUID(), islandId, pair.english, pair.spanish, pair.speaker, num, dialogueNum, now, now);
        totalInserted++;
      }
    }
  }

  const total = (db.prepare('SELECT COUNT(*) as c FROM sentences').get() as { c: number }).c;
  console.log(`\n✓ Done. Inserted ${totalInserted} sentence pairs for lessons 1-5.`);
  console.log(`  Total sentences in DB: ${total}`);
  if (totalUnmatched > 0) console.log(`  ⚠ ${totalUnmatched} unmatched lines (some pairs may still be off).`);

  // Show sample for verification
  console.log('\nSample pairs (lesson 3):');
  (db.prepare('SELECT native, target FROM sentences WHERE source_lesson_id = 3 LIMIT 6').all() as Array<{native: string; target: string}>)
    .forEach(r => console.log(`  ES: ${r.target}\n  EN: ${r.native}\n`));
}

main().catch(e => { console.error(e); process.exit(1); });
