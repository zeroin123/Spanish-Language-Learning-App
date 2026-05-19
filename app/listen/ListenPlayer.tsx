'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { ListenSentence } from '@/lib/db/queries';
import { speakSpanish } from '@/lib/tts';

type Island = { id: string; displayName: string; emoji: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ListenPlayer({ sentences, islands }: {
  sentences: ListenSentence[]; islands: Island[];
}) {
  const [islandFilter, setIslandFilter] = useState('all');
  const [queue, setQueue] = useState<ListenSentence[]>(() => shuffle(sentences));
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [shadowMode, setShadowMode] = useState(false);
  const [looping, setLooping] = useState(false);
  const [playToken, setPlayToken] = useState(0);
  const loopingRef = useRef(looping);
  useEffect(() => { loopingRef.current = looping; }, [looping]);

  const current = queue[index];

  function changeFilter(id: string) {
    window.speechSynthesis?.cancel();
    const filtered = id === 'all' ? [...sentences] : sentences.filter(s => s.islandId === id);
    setQueue(shuffle(filtered));
    setIndex(0);
    setPlaying(false);
    setIslandFilter(id);
  }

  useEffect(() => {
    if (!playing || !current) {
      if (!playing) window.speechSynthesis?.cancel();
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const cancel = speakSpanish(current.target, 0.85, {
      onend: () => {
        timer = setTimeout(() => {
          if (loopingRef.current) {
            setPlayToken(t => t + 1);
          } else {
            setIndex(i => {
              if (i + 1 < queue.length) return i + 1;
              setPlaying(false);
              return i;
            });
          }
        }, 2000);
      },
      onerror: () => setPlaying(false),
    });
    return () => { cancel(); clearTimeout(timer); };
  }, [index, playing, current, queue.length, playToken]);

  const prev = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIndex(i => Math.max(0, i - 1));
  }, []);

  const next = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIndex(i => {
      if (i + 1 < queue.length) return i + 1;
      setPlaying(false);
      return i;
    });
  }, [queue.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); setPlaying(p => !p); }
      if (e.key === 'j' || e.key === 'ArrowLeft') prev();
      if (e.key === 'k' || e.key === 'ArrowRight') next();
      if (e.key === 's') setShadowMode(m => !m);
      if (e.key === 'l') setLooping(l => !l);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-4 text-center">
        <p className="text-[#78716C] text-lg mb-3">No sentences in this island yet.</p>
        <Link href="/add" className="text-[#C85A3A] text-sm hover:text-[#A84830] font-medium transition-colors">
          Add some sentences →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh max-w-2xl mx-auto bg-[#FDFCF8]">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#E7E0D5] bg-white">
        <Link href="/" className="text-[#78716C] hover:text-[#1C1917] transition-colors p-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Link>
        <span className="text-[#78716C] text-sm tabular-nums">
          {index + 1} <span className="text-[#D0C5B8]">/</span> {queue.length}
        </span>
        <div className="w-6" />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#F0EBE3]">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${((index + 1) / queue.length) * 100}%`, background: 'linear-gradient(to right, #0D9488, #D97706)' }}
        />
      </div>

      {/* Island filter */}
      <div className="px-4 pt-4 pb-2">
        <select
          value={islandFilter}
          onChange={e => changeFilter(e.target.value)}
          className="w-full rounded-xl px-4 py-2.5 text-sm text-[#44403C] border border-[#E7E0D5] bg-white focus:outline-none focus:border-[#D97706] transition-colors"
        >
          <option value="all">All islands ({sentences.length})</option>
          {islands.map(i => {
            const count = sentences.filter(s => s.islandId === i.id).length;
            return <option key={i.id} value={i.id}>{i.emoji} {i.displayName} ({count})</option>;
          })}
        </select>
      </div>

      {/* Sentence display */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-4">
        <div className="flex items-center gap-1.5 mb-10 text-[#78716C] text-xs">
          <span>{current.islandEmoji}</span>
          <span>{current.islandName}</span>
        </div>

        <p className="font-display text-[#1C1917] text-2xl sm:text-3xl font-medium text-center leading-relaxed mb-2">
          {current.target}
        </p>
        {current.speaker && (
          <p className="font-display italic text-[#A8A29E] text-sm mb-4">— {current.speaker}</p>
        )}

        {shadowMode && (
          <div className="mt-8 pt-6 w-full text-center border-t border-[#E7E0D5]">
            <p className="text-[#44403C] text-lg leading-relaxed">{current.native}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 pb-10">
        {/* Toggles */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { label: 'Shadow', key: 'S', active: shadowMode, toggle: () => setShadowMode(m => !m), activeColor: '#2563EB', activeBg: '#EFF6FF', activeBorder: '#BFDBFE' },
            { label: 'Loop',   key: 'L', active: looping,    toggle: () => setLooping(l => !l),    activeColor: '#D97706', activeBg: '#FFFBEB', activeBorder: '#FDE68A' },
          ].map(({ label, key, active, toggle, activeColor, activeBg, activeBorder }) => (
            <button
              key={label}
              onClick={toggle}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border"
              style={{
                background:   active ? activeBg     : '#FFFFFF',
                borderColor:  active ? activeBorder : '#E7E0D5',
                color:        active ? activeColor  : '#78716C',
              }}
            >
              {label} <span className="opacity-40 text-xs ml-1">{key}</span>
            </button>
          ))}
        </div>

        {/* Playback */}
        <div className="flex items-center justify-center gap-8">
          <button onClick={prev} disabled={index === 0} className="p-3 text-[#A8A29E] hover:text-[#44403C] disabled:opacity-20 transition-colors" aria-label="Previous">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={() => setPlaying(p => !p)}
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 text-white"
            style={{ background: 'linear-gradient(135deg, #C85A3A 0%, #A84830 100%)', boxShadow: '0 4px 20px rgba(200,90,58,0.35)' }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button onClick={next} disabled={index + 1 >= queue.length} className="p-3 text-[#A8A29E] hover:text-[#44403C] disabled:opacity-20 transition-colors" aria-label="Next">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18 14.5 12 6 6v12zm2.5-6 6-4.25v8.5L8.5 12zM16 6h2v12h-2z" />
            </svg>
          </button>
        </div>

        <p className="text-center text-[#D0C5B8] text-xs mt-5">Space · J/K · S · L</p>
      </div>
    </div>
  );
}
