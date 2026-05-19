'use client';

import { useState } from 'react';
import { extractVocabAction, addSentencesAction } from '@/app/actions';
import type { VocabItem } from '@/lib/ai';
import { speakSpanish } from '@/lib/tts';

type Island = { id: string; displayName: string; emoji: string };

export default function PreInputTool({ islands }: { islands: Island[] }) {
  const [text, setText] = useState('');
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [islandId, setIslandId] = useState(islands[0]?.id ?? '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState('');

  async function handleExtract() {
    if (!text.trim()) { setError('Paste some Spanish text first.'); return; }
    setError('');
    setStatus('loading');
    setVocab([]);
    setKnown(new Set());
    setAdded(new Set());
    try {
      const items = await extractVocabAction(text);
      setVocab(items);
      setStatus('done');
    } catch (e) {
      setError(String(e));
      setStatus('idle');
    }
  }

  async function handleAddToBank(item: VocabItem, i: number) {
    if (!islandId) return;
    await addSentencesAction(
      [{ native: item.meaning, translated: item.example || item.word }],
      islandId,
      'pre_input',
    );
    setAdded(prev => new Set(prev).add(i));
  }

  const visibleCount = vocab.filter((_, i) => !known.has(i)).length;

  const inputClass = "w-full rounded-xl px-4 py-3 text-[#1C1917] placeholder-[#C4B9AD] border border-[#E7E0D5] bg-white focus:outline-none focus:border-[#D97706] transition-colors resize-none";
  const selectClass = "w-full rounded-xl px-4 py-3 text-[#44403C] border border-[#E7E0D5] bg-white focus:outline-none focus:border-[#D97706] transition-colors";
  const primaryBtn = "w-full py-3.5 rounded-2xl font-semibold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100";

  return (
    <div>
      {/* Island selector */}
      {vocab.length > 0 && (
        <div className="mb-6">
          <label className="text-xs font-semibold text-[#78716C] uppercase tracking-widest block mb-2">
            Save to island
          </label>
          <select value={islandId} onChange={e => setIslandId(e.target.value)} className={selectClass}>
            {islands.map(i => (
              <option key={i.id} value={i.id}>{i.emoji} {i.displayName}</option>
            ))}
          </select>
        </div>
      )}

      {/* Input area */}
      {status !== 'done' && (
        <div className="mb-4">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste Spanish text here — a YouTube transcript, article paragraph, podcast description…"
            rows={8}
            className={inputClass}
          />
        </div>
      )}

      {error && <p className="text-[#DC2626] text-sm mb-4">{error}</p>}

      {status !== 'done' && (
        <button
          onClick={handleExtract}
          disabled={status === 'loading' || !text.trim()}
          className={primaryBtn}
          style={{ background: 'linear-gradient(135deg, #C85A3A 0%, #A84830 100%)', boxShadow: '0 4px 16px rgba(200,90,58,0.25)' }}
        >
          {status === 'loading' ? 'Extracting vocabulary…' : 'Extract key vocabulary →'}
        </button>
      )}

      {/* Vocab cards */}
      {vocab.length > 0 && (
        <div className="mt-8">
          {/* Progress header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-[#1C1917]">
              {visibleCount} <span className="text-[#78716C] font-normal">/ {vocab.length} items</span>
            </h2>
            <div className="w-28 h-1.5 bg-[#F0EBE3] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((vocab.length - visibleCount) / vocab.length) * 100}%`,
                  background: 'linear-gradient(to right, #0D9488, #D97706)',
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {vocab.map((item, i) => {
              if (known.has(i)) return null;
              return (
                <div key={i} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-[#1C1917] font-semibold text-lg">{item.word}</span>
                      {item.partOfSpeech && (
                        <span className="badge" style={{ background: '#F5F5F4', borderColor: '#E7E5E4', color: '#78716C' }}>
                          {item.partOfSpeech}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => speakSpanish(item.word)}
                      className="text-[#A8A29E] hover:text-[#0D9488] transition-colors shrink-0 p-1"
                      aria-label="Hear pronunciation"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[#44403C] text-sm mb-1">{item.meaning}</p>
                  {item.example && (
                    <p className="font-display italic text-[#A8A29E] text-xs mb-3">{item.example}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setKnown(prev => new Set(prev).add(i))}
                      className="flex-1 py-2 text-xs text-[#78716C] border border-[#E7E0D5] bg-white hover:border-[#D0C5B8] hover:text-[#44403C] rounded-lg transition-all"
                    >
                      Known
                    </button>
                    <button
                      onClick={() => handleAddToBank(item, i)}
                      disabled={added.has(i)}
                      className="flex-1 py-2 text-xs rounded-lg transition-all font-medium border"
                      style={added.has(i)
                        ? { background: '#CCFBF1', borderColor: '#99F6E4', color: '#0F766E', cursor: 'default' }
                        : { background: '#F0FDF9', borderColor: '#99F6E4', color: '#0D9488' }
                      }
                    >
                      {added.has(i) ? '✓ Added' : '+ Add to bank'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCount === 0 && (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#CCFBF1', border: '1px solid #99F6E4' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="font-display text-[#0D9488] font-semibold mb-1">All items reviewed!</p>
              <button
                onClick={() => { setStatus('idle'); setText(''); setVocab([]); }}
                className="mt-2 text-sm text-[#C85A3A] hover:text-[#A84830] font-medium transition-colors"
              >
                Analyse another text →
              </button>
            </div>
          )}

          {status === 'done' && visibleCount > 0 && (
            <button
              onClick={() => { setStatus('idle'); setText(''); setVocab([]); }}
              className="w-full mt-6 py-3 rounded-xl text-sm text-[#78716C] border border-[#E7E0D5] bg-white hover:border-[#D0C5B8] hover:text-[#44403C] transition-all"
            >
              Analyse another text
            </button>
          )}
        </div>
      )}
    </div>
  );
}
