// Fixes lessons 6-15 sentences that have native = target (translation failed).
// Deletes the bad rows and re-inserts with proper English translations.
// Run: npx tsx --no-warnings=ExperimentalWarning --env-file=.env.local scripts/fix-translations.ts

import { DatabaseSync } from 'node:sqlite';
import { translateSentences } from '../lib/ai';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const SPEAKER_RE = /^([A-Z][A-Z\-\s]{0,20}?)\s{1,3}([¿¡A-ZÁÉÍÓÚÜÑa-z_"'(].*)$/;
const SPANISH_CHARS = /[¿¡áéíóúüñÁÉÍÓÚÜÑ]/;
const LESSON_NUMBER_MAP: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
};

function isSpanish(text: string) { return SPANISH_CHARS.test(text); }

function extractSpeakerLines(text: string): Array<{ speaker: string; line: string }> {
  const results: Array<{ speaker: string; line: string }> = [];
  const codeBlocks = text.match(/```[\s\S]*?```/g) ?? [];
  for (const block of codeBlocks) {
    const inner = block.replace(/^```|```$/g, '').trim();
    for (const rawLine of inner.split('\n')) {
      const line = rawLine.replace(/^[_*]+|[_*]+$/g, '').trim();
      if (!line) continue;
      const m = SPEAKER_RE.exec(line);
      if (m) {
        results.push({ speaker: m[1].trim(), line: m[2].trim() });
      }
    }
  }
  return results;
}

async function main() {
  const bookPath = path.join(process.cwd(), '..', 'Colloquial_Spansih.md');
  if (!fs.existsSync(bookPath)) { console.error('Book not found'); process.exit(1); }
  const bookText = fs.readFileSync(bookPath, 'utf-8');

  const dbPath = path.join(process.cwd(), 'data', 'polyglot.db');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');

  // Delete failed/malformed translations for lessons 6-15
  // Catches: native=target (untranslated) and native starting with { (JSON bleed-through)
  const deleted = db.prepare(
    `DELETE FROM sentences WHERE source_lesson_id >= 6 AND (native = target OR native LIKE '{%')`
  ).run();
  console.log(`Deleted ${deleted.changes} failed translation rows.`);

  // Parse lesson chunks
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
  const rows = db.prepare('SELECT id, source_lesson FROM islands WHERE source_lesson IS NOT NULL').all() as Array<{ id: string; source_lesson: number }>;
  for (const row of rows) islandByLesson.set(row.source_lesson, row.id);

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

    const dialogueRe = /#### Dialogue (\d+)([\s\S]*?)(?=#### Dialogue \d+|##### Vocabulary building|### Lesson|### Spanish|$)/gi;
    let dm: RegExpExecArray | null;

    while ((dm = dialogueRe.exec(text)) !== null) {
      const dialogueNum = parseInt(dm[1]);
      const allLines = extractSpeakerLines(dm[2]);
      const spanishLines = allLines.filter(l => isSpanish(l.line));
      if (spanishLines.length === 0) continue;

      console.log(`  Lesson ${num} D${dialogueNum}: Translating ${spanishLines.length} lines...`);
      try {
        const translated = await translateSentences(spanishLines.map(l => l.line), 'Spanish', 'English');
        for (let i = 0; i < spanishLines.length; i++) {
          const sp = spanishLines[i];
          const en = translated[i]?.translated ?? '';
          if (!sp.line.trim()) continue;
          insertStmt.run(randomUUID(), islandId, en || sp.line, sp.line, sp.speaker, num, dialogueNum, now, now);
          totalInserted++;
        }
      } catch (e) {
        console.warn(`  Translation failed for L${num}D${dialogueNum}: ${e}`);
        for (const sp of spanishLines) {
          insertStmt.run(randomUUID(), islandId, sp.line, sp.line, sp.speaker, num, dialogueNum, now, now);
          totalInserted++;
        }
      }
    }
  }

  const counts = db.prepare('SELECT COUNT(*) as c FROM sentences').get() as { c: number };
  const bad = db.prepare('SELECT COUNT(*) as c FROM sentences WHERE source_lesson_id >= 6 AND native = target').get() as { c: number };
  console.log(`\n✓ Done. Total sentences: ${counts.c}. Still untranslated: ${bad.c}`);
}

main().catch(e => { console.error(e); process.exit(1); });
