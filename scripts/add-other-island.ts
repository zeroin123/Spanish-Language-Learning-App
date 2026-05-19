import { createClient } from '@libsql/client';
import { randomUUID } from 'crypto';
import path from 'path';

async function main() {
  const dbUrl = process.env.TURSO_DATABASE_URL ?? `file:${path.join(process.cwd(), 'data', 'polyglot.db')}`;
  const db = createClient({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN });

  const { rows } = await db.execute("SELECT id FROM islands WHERE slug = 'other'");
  if (rows.length > 0) {
    console.log('Other island already exists, nothing to do.');
    return;
  }

  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO islands (id, slug, display_name, color, icon_emoji, source_lesson, sort_order, created_at)
          VALUES (?, 'other', 'Other', '#6B7280', '📝', NULL, 16, ?)`,
    args: [randomUUID(), now],
  });
  console.log('✓ Added "Other" island.');
}

main().catch(e => { console.error(e); process.exit(1); });
