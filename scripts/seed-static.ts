/**
 * Static seed for Vercel (and local fresh installs).
 * No API calls, no external file dependencies.
 * Creates the DB schema and inserts all 246 sentence pairs from static data.
 * Run: npx tsx scripts/seed-static.ts
 */

import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { TRANSLATIONS } from './data/translations';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'polyglot.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');

// ── Schema ───────────────────────────────────────────────────────────────────

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
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  INSERT OR IGNORE INTO settings (id) VALUES (1);

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

// ── Island definitions ───────────────────────────────────────────────────────

const ISLANDS = [
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

const insertIsland = db.prepare(`
  INSERT OR IGNORE INTO islands (id, slug, display_name, color, icon_emoji, source_lesson, sort_order, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const islandIdByLesson: Record<number, string> = {};

for (const [i, isl] of ISLANDS.entries()) {
  const id = randomUUID();
  islandIdByLesson[isl.lesson] = id;
  insertIsland.run(id, isl.slug, isl.name, isl.color, isl.emoji, isl.lesson, i + 1, new Date().toISOString());
}

// Re-read actual island IDs (in case rows already existed from a previous seed)
const existingIslands = db.prepare('SELECT id, source_lesson FROM islands').all() as Array<{ id: string; source_lesson: number }>;
for (const row of existingIslands) {
  islandIdByLesson[row.source_lesson] = row.id;
}

// ── Lessons 1–5 (extracted from Colloquial Spanish textbook) ─────────────────

const LESSONS_1_5: Array<{ target: string; native: string; speaker: string | null; lesson: number }> = [
  { target: '¡Hola! Buenos días. Soy Laura.', native: "Hello! Good morning. I'm Laura.", speaker: 'LAURA', lesson: 1 },
  { target: '¡Claro! Hola Laura, yo soy Teresa, la hermana de Carmen. Pero pasa, por favor. ¿Cómo estás? ¿Qué tal el viaje?', native: "Of course! Hello Laura, I'm Teresa, Carmen's sister. Come in. How are you? How was the journey?", speaker: 'TERESA', lesson: 1 },
  { target: 'Muy bien, gracias.', native: 'Very good, thank you.', speaker: 'LAURA', lesson: 1 },
  { target: '¿Estás cansada?', native: 'Are you tired?', speaker: 'TERESA', lesson: 1 },
  { target: 'Un poco.', native: 'A little bit.', speaker: 'LAURA', lesson: 1 },
  { target: '¡Hola, Andrés! ¡Mira!, ésta es Laura, la amiga inglesa de John.', native: "Hello Andrés. Look, this is Laura, John's English friend.", speaker: 'TERESA', lesson: 1 },
  { target: 'Encantado, Laura.', native: 'Pleased to meet you, Laura.', speaker: 'ANDRÉS', lesson: 1 },
  { target: 'Mucho gusto.', native: 'Pleased to meet you.', speaker: 'LAURA', lesson: 1 },
  { target: 'Y ésta es mamá.', native: 'And this is (our) mum.', speaker: 'TERESA', lesson: 1 },
  { target: 'Encantada, bienvenida a nuestra casa.', native: 'Pleased to meet you, welcome to our house.', speaker: 'MADRE', lesson: 1 },
  { target: 'Muchas gracias.', native: 'Thank you very much.', speaker: 'LAURA', lesson: 1 },
  { target: 'Y yo soy Pedro, el hermano de estas dos.', native: 'And I am Pedro, the brother of these two.', speaker: 'PEDRO', lesson: 1 },
  { target: 'Encantada.', native: 'Pleased to meet you.', speaker: 'LAURA', lesson: 1 },
  { target: '¡Hola Carmen! ¿Qué tal?', native: 'Hello Carmen! How are things?', speaker: 'MANOLO', lesson: 2 },
  { target: 'Muy bien. Mira Manolo, ésta es Laura Torres.', native: 'Very good. Look Manolo, this is Laura Torres.', speaker: 'CARMEN', lesson: 2 },
  { target: 'Encantado.', native: 'Pleased to meet you.', speaker: 'MANOLO', lesson: 2 },
  { target: 'Hola Manolo.', native: 'Hello Manolo.', speaker: 'LAURA', lesson: 2 },
  { target: '¿De dónde eres? No eres española ¿verdad?', native: "Where are you from? You aren't Spanish, are you?", speaker: 'MANOLO', lesson: 2 },
  { target: 'No, soy inglesa, de Londres.', native: 'No, I am English, from London.', speaker: 'LAURA', lesson: 2 },
  { target: 'Pero tu apellido es español, ¿no?', native: "But your surname is Spanish, isn't it?", speaker: 'MANOLO', lesson: 2 },
  { target: 'Sí, es que mi abuelo es español. Y tú, ¿de dónde eres?', native: 'It is; my grandfather is Spanish. And you, where are you from?', speaker: 'LAURA', lesson: 2 },
  { target: 'De Huelva.', native: 'From Huelva.', speaker: 'MANOLO', lesson: 2 },
  { target: '¿Huelva? ¿Dónde está?', native: 'Huelva? Where is that?', speaker: 'LAURA', lesson: 2 },
  { target: 'En el sur de España.', native: 'In the south of Spain.', speaker: 'MANOLO', lesson: 2 },
  { target: '¡Ah! Por eso el acento.', native: "Ah! That's why you have an accent!", speaker: 'LAURA', lesson: 2 },
  { target: '¿Llevas mucho tiempo en España?', native: 'Have you been in Spain for long?', speaker: 'MANOLO', lesson: 2 },
  { target: 'No, sólo una semana.', native: 'No, only a week.', speaker: 'LAURA', lesson: 2 },
  { target: 'Pues hablas muy bien el español.', native: 'Well, you speak Spanish really well.', speaker: 'MANOLO', lesson: 2 },
  { target: 'Gracias, es que hablo en español con mi abuelo.', native: 'Thanks. I speak Spanish with my granddad.', speaker: 'LAURA', lesson: 2 },
  { target: '¿Y tu padre habla español?', native: 'And does your father speak Spanish?', speaker: 'MANOLO', lesson: 2 },
  { target: 'La verdad es que no habla español, sólo unas palabras.', native: "In fact he doesn't speak Spanish, only a few words.", speaker: 'LAURA', lesson: 2 },
  { target: '¡Taxi!', native: 'Taxi!', speaker: 'MICHAEL', lesson: 3 },
  { target: '¿Adónde va, señor?', native: 'Where are you going, sir?', speaker: 'TAXISTA', lesson: 3 },
  { target: 'Al Hotel Excelsior, por favor.', native: 'To the Excelsior Hotel, please.', speaker: 'MICHAEL', lesson: 3 },
  { target: 'Bien, ¿es ésa su maleta?', native: 'Fine. Is that your suitcase?', speaker: 'TAXISTA', lesson: 3 },
  { target: 'Sí y ésta también.', native: 'Yes, and this one too.', speaker: 'MICHAEL', lesson: 3 },
  { target: '¿De dónde viene? Está muy moreno.', native: 'Where have you come from? You are very tanned.', speaker: 'TAXISTA', lesson: 3 },
  { target: 'De Australia.', native: 'From Australia.', speaker: 'MICHAEL', lesson: 3 },
  { target: '¿Es australiano?', native: 'Are you Australian?', speaker: 'TAXISTA', lesson: 3 },
  { target: 'Sí.', native: 'Yes.', speaker: 'MICHAEL', lesson: 3 },
  { target: '¿Vive por casualidad en Sydney?', native: 'Do you by any chance live in Sydney?', speaker: 'TAXISTA', lesson: 3 },
  { target: 'Sí, ¿lo conoce?', native: 'Yes, do you know it?', speaker: 'MICHAEL', lesson: 3 },
  { target: 'Sí, mi hermano vive allí.', native: 'Yes, my brother lives there.', speaker: 'TAXISTA', lesson: 3 },
  { target: 'Buenas tardes, señor.', native: 'Good afternoon, sir.', speaker: 'RECEPCIONISTA', lesson: 3 },
  { target: 'Hola, buenas tardes. ¿Tiene una habitación individual por favor?', native: 'Good afternoon. Do you have a single room please?', speaker: 'MICHAEL', lesson: 3 },
  { target: 'Tiene suerte. Queda una en el primer piso. ¿Para cuántas noches?', native: 'You are lucky. There is one left on the first floor. For how many nights?', speaker: 'RECEPCIONISTA', lesson: 3 },
  { target: 'Tres o cuatro, no estoy seguro.', native: 'Three or four, I am not sure.', speaker: 'MICHAEL', lesson: 3 },
  { target: 'Está bien.', native: "That's all right.", speaker: 'RECEPCIONISTA', lesson: 3 },
  { target: '¿Tiene cuarto de baño?', native: 'Does it have a bathroom?', speaker: 'MICHAEL', lesson: 3 },
  { target: 'Sí señor, todas las habitaciones tienen cuarto de baño.', native: 'Yes, all the rooms have private bathrooms.', speaker: 'RECEPCIONISTA', lesson: 3 },
  { target: '¿Cuánto cuesta?', native: 'How much does it cost?', speaker: 'MICHAEL', lesson: 3 },
  { target: 'Setenta y cinco euros por noche con el desayuno incluído.', native: 'Seventy five euros per night with breakfast included.', speaker: 'RECEPCIONISTA', lesson: 3 },
  { target: 'Muy bien, gracias.', native: "That's fine, thanks.", speaker: 'MICHAEL', lesson: 3 },
  { target: 'Oiga, perdone señora, ¿sabe si hay una farmacia cerca de aquí?', native: 'Excuse me, madam, do you know if there is a chemist near by?', speaker: 'MICHAEL', lesson: 4 },
  { target: 'Lo siento señor, pero no soy de aquí.', native: 'I am sorry, sir, but I am not from here.', speaker: 'SEÑORA', lesson: 4 },
  { target: 'No importa, gracias.', native: 'It does not matter, thank you.', speaker: 'MICHAEL', lesson: 4 },
  { target: 'Oiga, perdone señor, ¿sabe si hay una farmacia cerca de aquí?', native: 'Excuse me, sir, do you know if there is a chemist near by?', speaker: 'MICHAEL', lesson: 4 },
  { target: '¡Sí claro! Mire, hay una al final de Las Ramblas. Siga todo recto, al final de Las Ramblas gire a la izquierda; la farmacia está a la derecha, al lado de una librería.', native: "Of course! Look, there is one at the end of Las Ramblas. Carry straight on, at the end of Las Ramblas turn left, the chemist is on the right, next to a bookshop.", speaker: 'SEÑOR', lesson: 4 },
  { target: 'Todo recto, a la izquierda y la farmacia está a la derecha, ¿no?', native: 'Straight on, turn left and the chemist is on the right, correct?', speaker: 'MICHAEL', lesson: 4 },
  { target: 'Correcto, a unos tres minutos.', native: 'Correct, about three minutes away.', speaker: 'SEÑOR', lesson: 4 },
  { target: 'Muchas gracias, señor.', native: 'Thank you very much, sir.', speaker: 'MICHAEL', lesson: 4 },
  { target: 'De nada, joven.', native: 'Not at all, young man.', speaker: 'SEÑOR', lesson: 4 },
  { target: 'Perdone señor, quisiera ir al Museo de Picasso. ¿Sabe si se puede ir en metro?', native: 'Excuse me sir, I would like to go to the Picasso Museum. Do you know if it is possible to go on the underground?', speaker: 'MICHAEL', lesson: 4 },
  { target: 'Sí, puede ir a la estación Jaume I y desde allí está a unos cinco minutos andando.', native: "Yes, you have to go to Jaume I station, and from there it is about five minutes' walk.", speaker: 'SEÑOR', lesson: 4 },
  { target: '¿Qué línea es?', native: 'Which line is it?', speaker: 'MICHAEL', lesson: 4 },
  { target: 'Mire, no es directo, tiene que cambiar. Coja la línea cinco, dirección a Horta, baje en la estación Verdaguer, creo que es la cuarta parada, y de allí coja la cuarta, dirección a Pep Ventura.', native: 'It is not direct, you have to change. Take Line V in the direction of Horta. Get off at the Verdaguer station, I think it is the fourth stop, and from there take Line IV in the direction of Pep Ventura.', speaker: 'SEÑOR', lesson: 4 },
  { target: 'Vale, muchas gracias.', native: 'OK, thanks a lot.', speaker: 'MICHAEL', lesson: 4 },
  { target: 'De nada.', native: 'Not at all.', speaker: 'SEÑOR', lesson: 4 },
  { target: '¿A qué hora sale el Talgo para Burgos?', native: 'What time does the Talgo for Burgos leave?', speaker: 'VIRGINIA', lesson: 5 },
  { target: 'A las ocho de la mañana todos los días.', native: 'At eight a.m. every day.', speaker: 'EMPLEADO', lesson: 5 },
  { target: 'Bien, un billete para mañana, por favor.', native: 'OK. A ticket for tomorrow, please.', speaker: 'VIRGINIA', lesson: 5 },
  { target: '¿De ida y vuelta o ida sólo?', native: 'A return or a single?', speaker: 'EMPLEADO', lesson: 5 },
  { target: "De ida sólo, no sé cuando voy a volver, martes o miércoles.", native: "A single, I don't know when I'm coming back, Tuesday or Wednesday.", speaker: 'VIRGINIA', lesson: 5 },
  { target: 'Está bien, un billete de ida. Son 20 euros.', native: 'OK. A single ticket. It is twenty euros.', speaker: 'EMPLEADO', lesson: 5 },
  { target: 'Bien, aquí tiene. Muchas gracias. ¡Ah! perdone, ¿de qué vía sale?', native: 'Here you are. Oh! Excuse me, which platform does it leave from?', speaker: 'VIRGINIA', lesson: 5 },
  { target: 'De la vía 2, andén 1.', native: 'From track 2, platform 1.', speaker: 'EMPLEADO', lesson: 5 },
  { target: 'Virginia, ¿qué haces por aquí?', native: 'Virginia, what are you doing here?', speaker: 'SARA', lesson: 5 },
  { target: 'Me voy a pasar unos días a Burgos.', native: 'I am going to spend a few days in Burgos.', speaker: 'VIRGINIA', lesson: 5 },
  { target: '¡Ah, estupendo! ¿Vas a estar allí mucho tiempo?', native: 'Brilliant! Are you going to stay long?', speaker: 'SARA', lesson: 5 },
  { target: "Sólo unos días, tengo que volver antes del día ocho ya que tengo una entrevista en la empresa 'CASAS'. Mira, perdona Sara, tengo que irme, el tren sale en cinco minutos.", native: "Only a few days. I have to come back before the eighth as I have an interview with the firm 'CASAS'. Look, excuse me Sara but I have to go. The train leaves in five minutes.", speaker: 'VIRGINIA', lesson: 5 },
  { target: 'Tranquila, buena suerte en la entrevista y que te lo pases bien en Burgos.', native: "Don't worry! Good luck with the interview and have a good time in Burgos.", speaker: 'SARA', lesson: 5 },
  { target: 'Gracias, hasta pronto.', native: 'Thank you, see you soon.', speaker: 'VIRGINIA', lesson: 5 },
];

// ── Insert sentences ─────────────────────────────────────────────────────────

const insertSentence = db.prepare(`
  INSERT OR IGNORE INTO sentences
    (id, island_id, native, target, speaker, source, source_lesson_id, source_dialogue, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, 'book', ?, ?, ?, ?)
`);

let count = 0;
const now = new Date().toISOString();

for (const s of LESSONS_1_5) {
  const islandId = islandIdByLesson[s.lesson];
  if (!islandId) continue;
  insertSentence.run(randomUUID(), islandId, s.native, s.target, s.speaker ?? null, s.lesson, null, now, now);
  count++;
}

for (const s of TRANSLATIONS) {
  const islandId = islandIdByLesson[s.lesson];
  if (!islandId) continue;
  insertSentence.run(randomUUID(), islandId, s.english, s.spanish, s.speaker, s.lesson, s.dialogue, now, now);
  count++;
}

console.log(`✓ Seeded ${ISLANDS.length} islands and ${count} sentences.`);
