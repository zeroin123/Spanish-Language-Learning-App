// Book ingestion script. Run: pnpm seed
// Parses Colloquial_Spanish.md → populates SQLite with islands, sentences, vocab
// Uses Node 24's built-in node:sqlite (no native compilation required)

import { DatabaseSync } from 'node:sqlite';
import { translateSentences } from '../lib/ai';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// ─── Island definitions (PRD §5, F2) ─────────────────────────────────────────

const ISLAND_DEFS = [
  { lesson: 1,  slug: 'greetings',        name: 'Meeting People',            emoji: '👋', color: '#4F86C6' },
  { lesson: 2,  slug: 'origins',          name: "Where You're From",          emoji: '🌍', color: '#5DAE8B' },
  { lesson: 3,  slug: 'transport-taxi',   name: 'Taking a Cab',              emoji: '🚕', color: '#F5A623' },
  { lesson: 4,  slug: 'directions',       name: 'Directions',                emoji: '🗺️', color: '#9B59B6' },
  { lesson: 5,  slug: 'travel',           name: 'Travelling Around',         emoji: '✈️', color: '#E74C3C' },
  { lesson: 6,  slug: 'food-restaurants', name: 'Eating Out',                emoji: '🍽️', color: '#E67E22' },
  { lesson: 7,  slug: 'health',           name: 'At the Doctor',             emoji: '🏥', color: '#1ABC9C' },
  { lesson: 8,  slug: 'housing',          name: 'Flat-Hunting',              emoji: '🏠', color: '#3498DB' },
  { lesson: 9,  slug: 'phone',            name: 'On the Phone',              emoji: '📞', color: '#2ECC71' },
  { lesson: 10, slug: 'work',             name: 'At the Office',             emoji: '💼', color: '#95A5A6' },
  { lesson: 11, slug: 'family-problems',  name: 'Family Issues',             emoji: '👨‍👩‍👧', color: '#F39C12' },
  { lesson: 12, slug: 'correspondence',   name: 'Writing Home',              emoji: '✉️', color: '#8E44AD' },
  { lesson: 13, slug: 'emergencies',      name: 'Emergencies',               emoji: '🚨', color: '#C0392B' },
  { lesson: 14, slug: 'future',           name: 'Hopes for the Future',      emoji: '🌟', color: '#16A085' },
  { lesson: 15, slug: 'social',           name: 'Invitations & Socializing', emoji: '🥂', color: '#D35400' },
] as const;

const LESSON_NUMBER_MAP: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
};

// ─── Language detection ───────────────────────────────────────────────────────

const SPANISH_CHARS = /[¿¡áéíóúüñÁÉÍÓÚÜÑ]/;
function isSpanish(text: string): boolean {
  return SPANISH_CHARS.test(text);
}

// ─── Parse dialogues ──────────────────────────────────────────────────────────

// Speaker-tagged line: ALL-CAPS name (possibly hyphenated), space, then speech
const SPEAKER_RE = /^([A-Z][A-Z\-\s]{0,20}?)\s{1,3}([¿¡A-ZÁÉÍÓÚÜÑa-z_"'(].*)$/;

function extractSpeakerLines(text: string): Array<{ speaker: string; line: string }> {
  const results: Array<{ speaker: string; line: string }> = [];
  for (const raw of text.split('\n')) {
    const line = raw.replace(/^_|_$/g, '').trim();
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

function splitSpanishEnglish(lines: Array<{ speaker: string; line: string }>) {
  return {
    spanish: lines.filter(l => isSpanish(l.line)),
    english: lines.filter(l => !isSpanish(l.line)),
  };
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+(?=[¿¡A-ZÁÉÍÓÚÜÑ"']|[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 3);
}

interface SentencePair { spanish: string; english: string; speaker: string | null }

function buildPairs(
  spanish: Array<{ speaker: string; line: string }>,
  english: Array<{ speaker: string; line: string }>,
): SentencePair[] {
  const pairs: SentencePair[] = [];
  const len = Math.min(spanish.length, english.length);
  for (let i = 0; i < len; i++) {
    const spSentences = splitSentences(spanish[i].line);
    const enSentences = splitSentences(english[i].line);
    const pairLen = Math.min(spSentences.length, enSentences.length);
    for (let j = 0; j < pairLen; j++) {
      pairs.push({ spanish: spSentences[j], english: enSentences[j], speaker: spanish[i].speaker });
    }
  }
  return pairs;
}

// ─── Parse vocabulary ─────────────────────────────────────────────────────────

function extractVocabFromText(text: string): Array<{ spanish: string; english: string }> {
  const vocab: Array<{ spanish: string; english: string }> = [];
  const codeBlocks = text.match(/```[\s\S]*?```/g) ?? [];
  for (const block of codeBlocks) {
    const inner = block.replace(/^```|```$/g, '').trim();
    for (const line of inner.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length > 120) continue;
      if (/^In this lesson|^The following|^Note|^Unless/.test(trimmed)) continue;
      // Try multi-space split first, fall back to single-space with Spanish char detection
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
          if (/[¿¡áéíóúüñÁÉÍÓÚÜÑ]/.test(words[i])) lastSpanishIdx = i;
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

// ─── Parse glossary ───────────────────────────────────────────────────────────

function extractGlossary(text: string) {
  const entries: Array<{ spanish: string; english: string; partOfSpeech: string | null }> = [];
  const codeBlocks = text.match(/```[\s\S]*?```/g) ?? [];
  for (const block of codeBlocks) {
    const inner = block.replace(/^```|```$/g, '').trim();
    for (const line of inner.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || /^Unless|^\d+\s+Spanish/.test(trimmed)) continue;
      const m = trimmed.match(/^(.+?)\s{2,}(.+)$/);
      if (m) {
        let sp = m[1].trim();
        const en = m[2].trim();
        let pos: string | null = null;
        const posMatch = sp.match(/\s*\(\s*([mf])\s*\)\s*/i);
        if (posMatch) {
          pos = posMatch[1];
          sp = sp.replace(posMatch[0], '').trim();
        }
        if (sp && en && sp.length < 60 && en.length < 120) {
          entries.push({ spanish: sp, english: en, partOfSpeech: pos });
        }
      }
    }
  }
  return entries;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const bookPath = path.join(process.cwd(), '..', 'Colloquial_Spansih.md');
  if (!fs.existsSync(bookPath)) {
    console.error(`Book not found at: ${bookPath}`);
    console.error('Make sure you run this from the polyglot-islands directory.');
    process.exit(1);
  }

  const bookText = fs.readFileSync(bookPath, 'utf-8');

  // Set up DB (uses Node 24 built-in sqlite)
  const dbPath = path.join(process.cwd(), 'data', 'polyglot.db');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      target_language TEXT NOT NULL DEFAULT 'Spanish',
      target_language_code TEXT NOT NULL DEFAULT 'es-ES',
      native_language TEXT NOT NULL DEFAULT 'English',
      native_language_code TEXT NOT NULL DEFAULT 'en-US',
      tts_rate REAL NOT NULL DEFAULT 0.85,
      tts_voice_uri TEXT,
      session_card_cap INTEGER NOT NULL DEFAULT 30,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS islands (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon_emoji TEXT NOT NULL,
      source_lesson INTEGER,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sentences (
      id TEXT PRIMARY KEY,
      island_id TEXT NOT NULL REFERENCES islands(id),
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
    CREATE TABLE IF NOT EXISTS vocab_entries (
      id TEXT PRIMARY KEY,
      lesson_id INTEGER,
      spanish TEXT NOT NULL,
      english TEXT NOT NULL,
      part_of_speech TEXT,
      source TEXT NOT NULL DEFAULT 'lesson_vocab',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS practice_sessions (
      id TEXT PRIMARY KEY,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      mode TEXT NOT NULL,
      cards_reviewed INTEGER NOT NULL DEFAULT 0,
      cards_correct INTEGER NOT NULL DEFAULT 0,
      island_filter TEXT
    );
  `);

  const now = new Date().toISOString();
  db.prepare(`INSERT OR IGNORE INTO settings (id, created_at) VALUES (1, ?)`).run(now);

  // ─── Split book into lesson chunks ────────────────────────────────────────

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

  const glossaryText = glossaryStart >= 0 ? bookText.slice(glossaryStart) : '';
  console.log(`Found ${lessonChunks.length} lesson chunks.`);

  // ─── Seed islands ─────────────────────────────────────────────────────────

  for (const def of ISLAND_DEFS) {
    db.prepare(`
      INSERT OR IGNORE INTO islands (id, slug, display_name, color, icon_emoji, source_lesson, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(randomUUID(), def.slug, def.name, def.color, def.emoji, def.lesson, def.lesson, now);
  }

  const islandByLesson = new Map<number, string>();
  for (const def of ISLAND_DEFS) {
    const row = db.prepare('SELECT id FROM islands WHERE slug = ?').get(def.slug) as { id: string };
    islandByLesson.set(def.lesson, row.id);
  }

  // ─── Process each lesson ──────────────────────────────────────────────────

  let totalSentences = 0;
  let unmatchedPairs = 0;
  let totalVocab = 0;

  for (const chunk of lessonChunks) {
    const { num, text } = chunk;
    const islandId = islandByLesson.get(num)!;
    const hasTranslation = num <= 5;

    const dialogueRe = /#### Dialogue (\d+)([\s\S]*?)(?=#### Dialogue \d+|##### Vocabulary building|### Lesson|### Spanish|$)/gi;
    let dm: RegExpExecArray | null;

    while ((dm = dialogueRe.exec(text)) !== null) {
      const dialogueNum = parseInt(dm[1]);
      const dialogueText = dm[2];
      const allLines = extractSpeakerLines(dialogueText);
      let pairs: SentencePair[] = [];

      if (hasTranslation) {
        const { spanish, english } = splitSpanishEnglish(allLines);
        if (english.length === 0 && spanish.length > 0) {
          console.log(`  Lesson ${num} D${dialogueNum}: No English found, translating ${spanish.length} lines via AI...`);
          try {
            const translated = await translateSentences(spanish.map(l => l.line), 'Spanish', 'English');
            pairs = spanish.map((sp, i) => ({ spanish: sp.line, english: translated[i]?.translated ?? '', speaker: sp.speaker }));
          } catch (e) { console.warn(`  AI translation failed: ${e}`); }
        } else {
          pairs = buildPairs(spanish, english);
          const diff = Math.abs(spanish.length - english.length);
          if (diff > 2) unmatchedPairs += diff;
        }
      } else {
        const spanishLines = allLines.filter(l => isSpanish(l.line));
        if (spanishLines.length > 0) {
          console.log(`  Lesson ${num} D${dialogueNum}: Translating ${spanishLines.length} lines via AI...`);
          try {
            const translated = await translateSentences(spanishLines.map(l => l.line), 'Spanish', 'English');
            pairs = spanishLines.map((sp, i) => ({ spanish: sp.line, english: translated[i]?.translated ?? '', speaker: sp.speaker }));
          } catch (e) {
            console.warn(`  AI translation failed: ${e}`);
            pairs = spanishLines.map(sp => ({ spanish: sp.line, english: '', speaker: sp.speaker }));
          }
        }
      }

      const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO sentences
          (id, island_id, native, target, speaker, source, source_lesson_id, source_dialogue, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'book', ?, ?, ?, ?)
      `);
      for (const pair of pairs) {
        if (!pair.spanish.trim()) continue;
        insertStmt.run(randomUUID(), islandId, pair.english || pair.spanish, pair.spanish, pair.speaker, num, dialogueNum, now, now);
        totalSentences++;
      }
    }

    // Vocabulary
    const vocabItems = extractVocabFromText(text);
    const vocabInsert = db.prepare(`INSERT OR IGNORE INTO vocab_entries (id, lesson_id, spanish, english, source, created_at) VALUES (?, ?, ?, ?, 'lesson_vocab', ?)`);
    for (const item of vocabItems) {
      vocabInsert.run(randomUUID(), num, item.spanish, item.english, now);
      totalVocab++;
    }
  }

  // Glossary
  if (glossaryText) {
    const glossaryItems = extractGlossary(glossaryText);
    const glossInsert = db.prepare(`INSERT OR IGNORE INTO vocab_entries (id, lesson_id, spanish, english, part_of_speech, source, created_at) VALUES (?, NULL, ?, ?, ?, 'glossary', ?)`);
    let glossaryCount = 0;
    for (const item of glossaryItems) {
      glossInsert.run(randomUUID(), item.spanish, item.english, item.partOfSpeech, now);
      glossaryCount++;
    }
    console.log(`Glossary: ${glossaryCount} entries`);
    totalVocab += glossaryCount;
  }

  // Summary
  const islandCount = (db.prepare('SELECT COUNT(*) as c FROM islands').get() as { c: number }).c;
  const sentenceCount = (db.prepare('SELECT COUNT(*) as c FROM sentences').get() as { c: number }).c;
  const vocabCount = (db.prepare('SELECT COUNT(*) as c FROM vocab_entries').get() as { c: number }).c;

  console.log(`\n✓ Ingested ${islandCount} islands, ${sentenceCount} sentence pairs, ${vocabCount} vocabulary entries.`);
  if (unmatchedPairs > 0) {
    const pct = ((unmatchedPairs / Math.max(sentenceCount, 1)) * 100).toFixed(1);
    if (parseFloat(pct) > 5) {
      console.warn(`⚠ ${unmatchedPairs} unmatched pairs (${pct}%). Parser may have issues.`);
    }
  } else {
    console.log('✓ 0 unmatched pairs.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
