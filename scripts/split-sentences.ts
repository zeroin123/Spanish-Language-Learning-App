/**
 * Splits multi-sentence cards in the DB into individual cards.
 *
 * Rules:
 *  - Split at sentence boundaries: [.!?]+ followed by a space + capital letter / ¿ / ¡
 *  - Only split if every resulting fragment is >= MIN_CHARS (protects short follow-ups
 *    like "Tranquilo.", "Bien, dígame.", "A mí sí.", "¿Y a ti, Susana?")
 *  - Only split if Spanish and English produce the same fragment count (keeps pairs aligned)
 *  - SRS state resets to defaults on the new fragments (fresh cards)
 *
 * Run: npm run split-sentences
 */

import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';
import path from 'path';

// A fragment must be at least this many characters to be worth its own card.
// This is the key guard against splitting "Bien, ¿y tú?"-style short follow-ups.
const MIN_CHARS = 20;

function splitText(text: string): string[] {
  const parts: string[] = [];
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    if (/[.!?]/.test(text[i])) {
      // Consume the full punctuation run (e.g. "...!" or "?!")
      let j = i;
      while (j < text.length && /[.!?]/.test(text[j])) j++;

      // Boundary only if followed by a space then a capital / ¿ / ¡ / "
      if (
        j < text.length - 1 &&
        text[j] === ' ' &&
        /[¿¡A-ZÁÉÍÓÚÜÑA-Z"]/.test(text[j + 1])
      ) {
        parts.push(text.slice(start, j).trim());
        start = j + 1; // skip the space, next fragment starts at j+1
        i = j;
      }
    }
  }
  parts.push(text.slice(start).trim());
  return parts.filter(Boolean);
}

function canSplit(esParts: string[], enParts: string[]): boolean {
  if (esParts.length < 2) return false;
  if (esParts.length !== enParts.length) return false;
  if (esParts.some(p => p.length < MIN_CHARS)) return false;
  if (enParts.some(p => p.length < MIN_CHARS)) return false;
  return true;
}

async function main() {
  const dbUrl =
    process.env.TURSO_DATABASE_URL ??
    `file:${path.join(process.cwd(), 'data', 'polyglot.db')}`;
  const db = createClient({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN });

  const { rows } = await db.execute(`
    SELECT id, island_id, native, target, speaker, source,
           source_lesson_id, source_dialogue, ease_factor, created_at
    FROM sentences
    ORDER BY source_lesson_id, source_dialogue, rowid
  `);

  let splitCount = 0;
  let keptCount = 0;

  for (const row of rows) {
    const esParts = splitText(row.target as string);  // target = Spanish
    const enParts = splitText(row.native as string);  // native = English

    if (!canSplit(esParts, enParts)) {
      keptCount++;
      continue;
    }

    // Delete the original multi-sentence card
    await db.execute({ sql: 'DELETE FROM sentences WHERE id = ?', args: [row.id as string] });

    // Insert one card per fragment
    const now = new Date().toISOString();
    for (let i = 0; i < esParts.length; i++) {
      await db.execute({
        sql: `INSERT INTO sentences
                (id, island_id, native, target, speaker, source,
                 source_lesson_id, source_dialogue, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          randomUUID(),
          row.island_id as string,
          enParts[i],
          esParts[i],
          row.speaker as string | null,
          row.source as string,
          row.source_lesson_id as number | null,
          row.source_dialogue as number | null,
          row.created_at as string,
          now,
        ],
      });
    }

    console.log(`  ✂  Split into ${esParts.length}: "${row.target}"`);
    esParts.forEach((p, i) => console.log(`      [${i + 1}] ${p}`));
    splitCount++;
  }

  // Summary
  const { rows: after } = await db.execute('SELECT COUNT(*) as c FROM sentences');
  console.log(`\n✓ Split ${splitCount} cards → now ${after[0].c as number} total sentences (was ${rows.length}).`);
  console.log(`  ${keptCount} cards were already single-sentence and kept as-is.`);
}

main().catch(e => { console.error(e); process.exit(1); });
