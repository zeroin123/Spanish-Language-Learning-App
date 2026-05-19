'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { translateAction, addSentencesAction } from '@/app/actions';

type Island = { id: string; displayName: string; emoji: string };
type Pair = { native: string; translated: string };

export default function AddForm({ islands }: { islands: Island[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<'type' | 'voice'>('type');
  const [islandId, setIslandId] = useState(islands[0]?.id ?? '');
  const [text, setText] = useState('');
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [status, setStatus] = useState<'idle' | 'translating' | 'preview' | 'saving' | 'done'>('idle');
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  function startListening() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) { setError('Speech recognition not supported in this browser.'); return; }
    const rec = new SR();
    rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as unknown[])
        .slice(e.resultIndex)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript.trim()).filter(Boolean).join('\n');
      setText((prev: string) => prev ? prev + '\n' + transcript : transcript);
    };
    rec.onerror = () => setError('Microphone error. Check browser permissions.');
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true); setError('');
  }

  function stopListening() { recognitionRef.current?.stop(); setListening(false); }

  async function handleTranslate() {
    const sentences = text.split('\n').map(s => s.trim()).filter(Boolean);
    if (!sentences.length) { setError('Enter at least one sentence.'); return; }
    if (!islandId) { setError('Select an island.'); return; }
    setError(''); setStatus('translating');
    try {
      setPairs(await translateAction(sentences));
      setStatus('preview');
    } catch (e) { setError(String(e)); setStatus('idle'); }
  }

  async function handleSave() {
    setStatus('saving');
    try {
      await addSentencesAction(pairs, islandId, tab === 'voice' ? 'user_voice' : 'user_typed');
      setStatus('done');
      setTimeout(() => router.push('/'), 1200);
    } catch (e) { setError(String(e)); setStatus('preview'); }
  }

  const inputClass = "w-full rounded-xl px-4 py-3 text-[#1C1917] placeholder-[#C4B9AD] border border-[#E7E0D5] bg-white focus:outline-none focus:border-[#D97706] transition-colors resize-none";
  const selectClass = "w-full rounded-xl px-4 py-3 text-[#44403C] border border-[#E7E0D5] bg-white focus:outline-none focus:border-[#D97706] transition-colors";
  const primaryBtn = "w-full py-3.5 rounded-2xl font-semibold text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100";

  if (status === 'done') {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: '#CCFBF1', border: '1px solid #99F6E4' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-display text-[#0D9488] text-lg font-semibold">Sentences saved!</p>
        <p className="text-[#78716C] text-sm mt-1">Returning to dashboard…</p>
      </div>
    );
  }

  if (status === 'preview' || status === 'saving') {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-[#1C1917]">Review translations</h2>
          <button onClick={() => { setStatus('idle'); setPairs([]); }}
            className="text-xs text-[#78716C] hover:text-[#44403C] transition-colors">
            ← Back
          </button>
        </div>
        <div className="space-y-2.5 mb-6">
          {pairs.map((p, i) => (
            <div key={i} className="card p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#A8A29E] mb-1.5 font-semibold uppercase tracking-wide">English</div>
                <div className="text-sm text-[#44403C]">{p.native}</div>
              </div>
              <div>
                <div className="text-xs text-[#A8A29E] mb-1.5 font-semibold uppercase tracking-wide">Spanish</div>
                <div className="text-sm text-[#1C1917] font-medium">{p.translated}</div>
              </div>
            </div>
          ))}
        </div>
        {error && <p className="text-[#DC2626] text-sm mb-4">{error}</p>}
        <button onClick={handleSave} disabled={status === 'saving'} className={primaryBtn}
          style={{ background: 'linear-gradient(135deg, #C85A3A 0%, #A84830 100%)', boxShadow: '0 4px 16px rgba(200,90,58,0.25)' }}>
          {status === 'saving' ? 'Saving…' : `Save ${pairs.length} sentence${pairs.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Island selector */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-[#78716C] uppercase tracking-widest block mb-2">Island</label>
        <select value={islandId} onChange={e => setIslandId(e.target.value)} className={selectClass}>
          {islands.map(i => <option key={i.id} value={i.id}>{i.emoji} {i.displayName}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-[#F7F2EA] rounded-xl border border-[#E7E0D5]">
        {(['type', 'voice'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setError(''); }}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize flex items-center justify-center gap-2"
            style={{
              background:  tab === t ? '#FFFFFF' : 'transparent',
              color:       tab === t ? '#1C1917' : '#78716C',
              boxShadow:   tab === t ? '0 1px 3px rgba(100,60,20,0.08)' : 'none',
              border:      tab === t ? '1px solid #E7E0D5' : '1px solid transparent',
            }}
          >
            {t === 'type' ? <KeyboardIcon /> : <MicIcon />}
            {t === 'type' ? 'Type' : 'Voice'}
          </button>
        ))}
      </div>

      {/* Input */}
      {tab === 'type' ? (
        <div className="mb-4">
          <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
            placeholder={"Enter one sentence per line…\nI'd like a table for two.\nWhere is the train station?"}
            className={inputClass} />
        </div>
      ) : (
        <div className="mb-4">
          <div className="rounded-xl p-4 min-h-32 mb-3 border border-[#E7E0D5] bg-white">
            {text
              ? <p className="text-[#44403C] text-sm whitespace-pre-wrap">{text}</p>
              : <p className="text-[#C4B9AD] text-sm">Press record and speak in English…</p>
            }
          </div>
          <div className="flex gap-2">
            <button onClick={listening ? stopListening : startListening}
              className="flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 border"
              style={{
                background:  listening ? '#FEF2F2' : '#FFFFFF',
                borderColor: listening ? '#FECACA' : '#E7E0D5',
                color:       listening ? '#DC2626' : '#44403C',
              }}
            >
              <MicIcon />
              {listening ? 'Stop recording' : 'Start recording'}
              {listening && <span className="w-1.5 h-1.5 bg-[#DC2626] rounded-full animate-pulse" />}
            </button>
            {text && (
              <button onClick={() => setText('')}
                className="px-4 py-3 rounded-xl text-[#78716C] text-sm border border-[#E7E0D5] bg-white hover:border-[#D0C5B8] hover:text-[#44403C] transition-all">
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[#DC2626] text-sm mb-4">{error}</p>}

      <button onClick={handleTranslate} disabled={status === 'translating' || !text.trim()} className={primaryBtn}
        style={{ background: 'linear-gradient(135deg, #C85A3A 0%, #A84830 100%)', boxShadow: '0 4px 16px rgba(200,90,58,0.25)' }}>
        {status === 'translating' ? 'Translating…' : 'Translate →'}
      </button>
    </div>
  );
}

function KeyboardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
