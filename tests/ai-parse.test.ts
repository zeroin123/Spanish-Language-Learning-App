import { describe, it, expect } from 'vitest';
import { parseJSON, extractPairsFromRaw } from '../lib/ai';

describe('parseJSON', () => {
  it('parses a clean JSON array', () => {
    const result = parseJSON<{ a: number }[]>('[{"a":1}]');
    expect(result).toEqual([{ a: 1 }]);
  });

  it('strips markdown code fences before parsing', () => {
    const raw = '```json\n[{"native":"hola","translated":"hello"}]\n```';
    const result = parseJSON<{ native: string; translated: string }[]>(raw);
    expect(result).not.toBeNull();
    expect(result![0].native).toBe('hola');
  });

  it('wraps a single object in an array', () => {
    const result = parseJSON<object[]>('{"native":"hola","translated":"hello"}');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });

  it('returns null for invalid JSON', () => {
    expect(parseJSON('not json at all')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseJSON('')).toBeNull();
  });

  it('handles extra whitespace around JSON', () => {
    const result = parseJSON<number[]>('  [1, 2, 3]  ');
    expect(result).toEqual([1, 2, 3]);
  });
});

describe('extractPairsFromRaw', () => {
  it('extracts pairs from a well-formed JSON string', () => {
    const raw = '[{"native":"hello","translated":"hola"},{"native":"bye","translated":"adiós"}]';
    const pairs = extractPairsFromRaw(raw);
    expect(pairs).toHaveLength(2);
    expect(pairs[0]).toEqual({ native: 'hello', translated: 'hola' });
  });

  it('extracts pairs from malformed JSON with extra text', () => {
    const raw = 'Sure! Here you go: [{"native":"yes","translated":"sí"}] Hope that helps!';
    const pairs = extractPairsFromRaw(raw);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].translated).toBe('sí');
  });

  it('handles escaped quotes inside strings', () => {
    const raw = '{"native":"He said \\"hello\\"","translated":"Dijo \\"hola\\""}';
    const pairs = extractPairsFromRaw(raw);
    expect(pairs).toHaveLength(1);
  });

  it('returns empty array when no pairs found', () => {
    expect(extractPairsFromRaw('nothing here')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(extractPairsFromRaw('')).toEqual([]);
  });
});
