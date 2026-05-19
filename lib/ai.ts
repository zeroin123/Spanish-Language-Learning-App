// AI provider abstraction. Set AI_PROVIDER=ollama|openai|claude in .env.local

const PROVIDER = process.env.AI_PROVIDER ?? 'openai';
const OLLAMA_BASE = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

export type TranslationPair = { native: string; translated: string };
export type VocabItem = { word: string; partOfSpeech: string; meaning: string; example: string };

async function callOllama(prompt: string, jsonMode = true): Promise<string> {
  const body: Record<string, unknown> = {
    model: OLLAMA_MODEL,
    messages: [{ role: 'user', content: prompt }],
    stream: false,
  };
  if (jsonMode) body.format = 'json';
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.message?.content ?? '';
}

async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OpenAI_API}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callClaude(prompt: string): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = msg.content[0];
  return block.type === 'text' ? block.text : '';
}

async function callAI(prompt: string): Promise<string> {
  let raw: string;
  if (PROVIDER === 'claude') raw = await callClaude(prompt);
  else if (PROVIDER === 'openai') raw = await callOpenAI(prompt);
  else raw = await callOllama(prompt);
  return raw.trim();
}

export function parseJSON<T>(raw: string): T | null {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    const parsed = JSON.parse(cleaned) as T;
    // Wrap single object in array if caller expects an array
    if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
      return [parsed] as unknown as T;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function extractPairsFromRaw(raw: string): TranslationPair[] {
  // Regex fallback: pull out all {native:..., translated:...} pairs even from malformed JSON
  const pairs: TranslationPair[] = [];
  const re = /"native"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"translated"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    pairs.push({ native: m[1], translated: m[2] });
  }
  return pairs;
}

async function translateOne(sentence: string, fromLang: string, toLang: string): Promise<string> {
  const prompt = `Translate this ${fromLang} sentence to ${toLang}. Use natural, conversational language (Iberian Spanish conventions if applicable). Reply with ONLY the translation, nothing else.\n\n${sentence}`;
  if (PROVIDER === 'ollama') return callOllama(prompt, false);
  return callAI(prompt);
}

export async function translateSentences(
  sentences: string[],
  fromLang: string,
  toLang: string,
): Promise<TranslationPair[]> {
  const numbered = sentences.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const prompt = `Translate each ${fromLang} sentence to ${toLang}. Rules: natural and conversational, Iberian (Spain) Spanish conventions.

Return ONLY a JSON array, one object per sentence, no markdown:
[{"native":"original sentence","translated":"translation"}]

Sentences:
${numbered}`;

  const raw = await callAI(prompt);
  const parsed = parseJSON<TranslationPair[]>(raw);
  if (parsed && Array.isArray(parsed) && parsed.length === sentences.length) return parsed;

  // Try regex extraction from malformed response
  const extracted = extractPairsFromRaw(raw);
  if (extracted.length === sentences.length) return extracted;

  // Last resort: translate one sentence at a time
  console.log(`  Batch translation failed (got ${extracted.length}/${sentences.length}), falling back to one-at-a-time...`);
  const results: TranslationPair[] = [];
  for (const sentence of sentences) {
    try {
      const translation = await translateOne(sentence, fromLang, toLang);
      results.push({ native: sentence, translated: translation.trim() });
    } catch {
      results.push({ native: sentence, translated: sentence });
    }
  }
  return results;
}

export async function extractVocab(
  text: string,
  targetLang: string,
  n: number = 15,
): Promise<VocabItem[]> {
  const prompt = `Analyze this ${targetLang} text and extract the ${n} most important vocabulary items a learner needs before reading or watching this content.

Pick a mix of:
- High-frequency words used multiple times in the text
- Topic-specific terms central to understanding
- Idiomatic phrases or expressions

Return ONLY a JSON array, no markdown, no explanation:
[{"word":"...", "partOfSpeech":"...", "meaning":"...", "example":"..."}]

Text:
${text.slice(0, 3000)}`;

  const raw = await callAI(prompt);
  const parsed = parseJSON<VocabItem[]>(raw);
  if (parsed && Array.isArray(parsed)) return parsed;

  const raw2 = await callAI(prompt);
  const parsed2 = parseJSON<VocabItem[]>(raw2);
  if (parsed2 && Array.isArray(parsed2)) return parsed2;

  throw new Error(`AI vocab extraction failed. Raw: ${raw.slice(0, 200)}`);
}
