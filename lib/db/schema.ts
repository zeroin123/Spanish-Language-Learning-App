import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey().default(1),
  targetLanguage: text('target_language').notNull().default('Spanish'),
  targetLanguageCode: text('target_language_code').notNull().default('es-ES'),
  nativeLanguage: text('native_language').notNull().default('English'),
  nativeLanguageCode: text('native_language_code').notNull().default('en-US'),
  ttsRate: real('tts_rate').notNull().default(0.85),
  ttsVoiceURI: text('tts_voice_uri'),
  sessionCardCap: integer('session_card_cap').notNull().default(30),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

export const islands = sqliteTable('islands', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  color: text('color').notNull(),
  iconEmoji: text('icon_emoji').notNull(),
  sourceLesson: integer('source_lesson'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const sentences = sqliteTable('sentences', {
  id: text('id').primaryKey(),
  islandId: text('island_id').notNull().references(() => islands.id),
  native: text('native').notNull(),
  target: text('target').notNull(),
  speaker: text('speaker'),
  source: text('source', { enum: ['book', 'user_voice', 'user_typed', 'pre_input'] }).notNull().default('book'),
  sourceLessonId: integer('source_lesson_id'),
  sourceDialogue: integer('source_dialogue'),
  interval: integer('interval').notNull().default(1),
  easeFactor: real('ease_factor').notNull().default(2.5),
  reps: integer('reps').notNull().default(0),
  nextReview: text('next_review'),
  lastReviewed: text('last_reviewed'),
  mastered: integer('mastered', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const vocabEntries = sqliteTable('vocab_entries', {
  id: text('id').primaryKey(),
  lessonId: integer('lesson_id'),
  spanish: text('spanish').notNull(),
  english: text('english').notNull(),
  partOfSpeech: text('part_of_speech'),
  source: text('source', { enum: ['lesson_vocab', 'glossary', 'pre_input', 'user'] }).notNull().default('lesson_vocab'),
  createdAt: text('created_at').notNull(),
});

export const practiceSessions = sqliteTable('practice_sessions', {
  id: text('id').primaryKey(),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  mode: text('mode', { enum: ['recall', 'listen', 'pre_input'] }).notNull(),
  cardsReviewed: integer('cards_reviewed').notNull().default(0),
  cardsCorrect: integer('cards_correct').notNull().default(0),
  islandFilter: text('island_filter'),
});
