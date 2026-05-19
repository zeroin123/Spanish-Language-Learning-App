// One-time fix: re-extracts vocabulary from the book and populates vocab_entries.
// Safe to run multiple times — uses INSERT OR IGNORE.
// Run: npx tsx --no-warnings=ExperimentalWarning --env-file=.env.local scripts/fix-vocab.ts

import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const SPANISH_CHARS = /[¿¡áéíóúüñÁÉÍÓÚÜÑ]/;

function isSpanish(text: string) { return SPANISH_CHARS.test(text); }

function extractVocabFromText(text: string): Array<{ spanish: string; english: string }> {
  const vocab: Array<{ spanish: string; english: string }> = [];
  const codeBlocks = text.match(/```[\s\S]*?```/g) ?? [];
  for (const block of codeBlocks) {
    const inner = block.replace(/^```|```$/g, '').trim();
    for (const line of inner.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length > 120) continue;
      if (/^In this lesson|^The following|^Note|^Unless/.test(trimmed)) continue;

      let sp: string, en: string;
      const multiParts = trimmed.split(/\s{2,}/);
      if (multiParts.length >= 2) {
        sp = multiParts[0];
        en = multiParts.slice(1).join(' ').trim();
      } else {
        const words = trimmed.split(/\s+/).filter(w => w.length > 0);
        if (words.length < 2) continue;
        let lastSpanishIdx = -1;
        for (let i = 0; i < words.length; i++) {
          if (SPANISH_CHARS.test(words[i])) lastSpanishIdx = i;
        }
        if (lastSpanishIdx >= 0 && lastSpanishIdx < words.length - 1) {
          sp = words.slice(0, lastSpanishIdx + 1).join(' ');
          en = words.slice(lastSpanishIdx + 1).join(' ');
        } else {
          sp = words[0];
          en = words.slice(1).join(' ');
        }
      }
      if (sp && en && sp.length < 40 && en.length < 80 && !isSpanish(en)) {
        vocab.push({ spanish: sp, english: en });
      }
    }
  }
  return vocab;
}

function extractGlossary(text: string) {
  const entries: Array<{ spanish: string; english: string; partOfSpeech: string | null }> = [];
  const re = /^\s*([^\n(]{1,50?}?)\s*(?:\(([mf])\))?\s{2,}(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    let sp = m[1].trim();
    const pos = m[2] ?? null;
    const en = m[3].trim();
    if (sp && en && isSpanish(sp) && !isSpanish(en) && sp.length < 60 && en.length < 120) {
      entries.push({ spanish: sp, english: en, partOfSpeech: pos });
    }
  }
  return entries;
}

async function main() {
  const bookPath = path.join(process.cwd(), '..', 'Colloquial_Spansih.md');
  if (!fs.existsSync(bookPath)) {
    console.error(`Book not found at: ${bookPath}`);
    process.exit(1);
  }
  const bookText = fs.readFileSync(bookPath, 'utf-8');

  const dbPath = path.join(process.cwd(), 'data', 'polyglot.db');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');

  const LESSON_NUMBER_MAP: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
    nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  };

  const lessonHeaderRe = /^### Lesson (One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen)\s*$/im;
  const glossaryStart = bookText.indexOf('### Spanish–English glossary');

  const lessonMatches: Array<{ num: number; start: number }> = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(lessonHeaderRe.source, 'gim');
  while ((m = re.exec(bookText)) !== null) {
    const num = LESSON_NUMBER_MAP[m[1].toLowerCase()];
    if (num) lessonMatches.push({ num, start: m.index });
  }

  const lessonChunks = lessonMatches.map((lm, i) => ({
    num: lm.num,
    text: bookText.slice(lm.start, lessonMatches[i + 1]?.start ?? glossaryStart),
  }));

  const now = new Date().toISOString();
  const vocabInsert = db.prepare(
    `INSERT OR IGNORE INTO vocab_entries (id, lesson_id, spanish, english, source, created_at) VALUES (?, ?, ?, ?, 'lesson_vocab', ?)`
  );
  const glossInsert = db.prepare(
    `INSERT OR IGNORE INTO vocab_entries (id, lesson_id, spanish, english, part_of_speech, source, created_at) VALUES (?, NULL, ?, ?, ?, 'glossary', ?)`
  );

  let totalVocab = 0;
  for (const { num, text } of lessonChunks) {
    const items = extractVocabFromText(text);
    for (const item of items) {
      vocabInsert.run(randomUUID(), num, item.spanish, item.english, now);
      totalVocab++;
    }
    if (items.length > 0) console.log(`  Lesson ${num}: ${items.length} vocab entries`);
  }

  const glossaryText = glossaryStart >= 0 ? bookText.slice(glossaryStart) : '';
  if (glossaryText) {
    const glossaryItems = extractGlossary(glossaryText);
    for (const item of glossaryItems) {
      glossInsert.run(randomUUID(), item.spanish, item.english, item.partOfSpeech, now);
    }
    console.log(`Glossary: ${glossaryItems.length} entries`);
    totalVocab += glossaryItems.length;
  }

  const vocabCount = (db.prepare('SELECT COUNT(*) as c FROM vocab_entries').get() as { c: number }).c;
  console.log(`\n✓ Done. Total vocab_entries in DB: ${vocabCount} (inserted ${totalVocab} this run)`);
}

main().catch(e => { console.error(e); process.exit(1); });
