'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { gradeCardAction } from '@/app/actions';
import type { QueueCard } from '@/lib/db/queries';
import { speakSpanish } from '@/lib/tts';

type Props = { cards: QueueCard[]; totalDue: number; sessionCap: number };

export default function RecallSession({ cards, totalDue, sessionCap }: Props) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [grades, setGrades] = useState<number[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [startTime] = useState(Date.now());
  const [, startTransition] = useTransition();

  const card = cards[index];
  const remaining = totalDue - sessionCap;
  const progress = index / cards.length;

  useEffect(() => {
    if (!revealed || !card) return;
    const cancel = speakSpanish(card.target);
    return cancel;
  }, [revealed, card]);

  const handleGrade = useCallback((grade: 0 | 1 | 2 | 3) => {
    if (!revealed || !card) return;
    startTransition(() => { gradeCardAction(card.id, grade); });
    setGrades(prev => [...prev, grade]);
    setRevealed(false);
    if (index + 1 >= cards.length) setSessionDone(true);
    else setIndex(i => i + 1);
  }, [revealed, card, index, cards.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && !revealed) { e.preventDefault(); setRevealed(true); }
      if (revealed) {
        if (e.key === '1') handleGrade(0);
        if (e.key === '2') handleGrade(1);
        if (e.key === '3') handleGrade(2);
        if (e.key === '4') handleGrade(3);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [revealed, handleGrade]);

  if (sessionDone) {
    return <SessionSummary grades={grades} startTime={startTime} remaining={remaining} />;
  }

  return (
    <main className="min-h-dvh flex flex-col bg-[#FDFCF8]">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#E7E0D5] bg-white">
        <Link href="/" className="text-[#78716C] hover:text-[#1C1917] transition-colors p-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Link>
        <span className="text-[#78716C] text-sm tabular-nums font-medium">
          {index + 1} <span className="text-[#D0C5B8]">/</span> {cards.length}
        </span>
        <div className="w-6" />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#F0EBE3]">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress * 100}%`, background: 'linear-gradient(to right, #C85A3A, #D97706)' }}
        />
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-2xl mx-auto w-full">
        {/* Island label */}
        <div className="flex items-center gap-1.5 mb-8">
          <span className="text-base">{card.islandEmoji}</span>
          <span className="text-[#78716C] text-xs">{card.islandName}</span>
        </div>

        {/* English prompt */}
        <p className="font-display text-[#1C1917] text-2xl sm:text-3xl font-medium text-center leading-relaxed mb-2 max-w-lg">
          {card.native}
        </p>
        {card.speaker && (
          <p className="font-display italic text-[#A8A29E] text-sm mb-6">— {card.speaker}</p>
        )}

        {!revealed ? (
          <>
            <p className="text-[#A8A29E] text-sm mt-4 mb-10">Say it in Spanish…</p>
            <button
              onClick={() => setRevealed(true)}
              className="px-10 py-3.5 rounded-2xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #C85A3A 0%, #A84830 100%)', boxShadow: '0 4px 16px rgba(200,90,58,0.30)' }}
            >
              Reveal
              <span className="ml-2 text-white/40 text-xs font-normal hidden sm:inline">Space</span>
            </button>
          </>
        ) : (
          <>
            <div className="divider w-full max-w-md my-7" />

            {/* Spanish answer */}
            <div className="flex items-center gap-3 mb-10">
              <p className="font-display text-[#0D9488] text-2xl sm:text-3xl font-medium text-center leading-relaxed">
                {card.target}
              </p>
              <button
                onClick={() => speakSpanish(card.target)}
                className="text-[#A8A29E] hover:text-[#0D9488] transition-colors shrink-0 p-1"
                aria-label="Replay audio"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
            </div>

            {/* Grade buttons */}
            <div className="grid grid-cols-4 gap-2 w-full max-w-md">
              <GradeButton label="Forgot" hint="1" onClick={() => handleGrade(0)}
                bg="#FEF2F2" border="#FECACA" text="#DC2626" />
              <GradeButton label="Hard"   hint="2" onClick={() => handleGrade(1)}
                bg="#FFFBEB" border="#FDE68A" text="#B45309" />
              <GradeButton label="Good"   hint="3" onClick={() => handleGrade(2)}
                bg="#F0FDF9" border="#99F6E4" text="#0D9488" />
              <GradeButton label="Easy"   hint="4" onClick={() => handleGrade(3)}
                bg="#EFF6FF" border="#BFDBFE" text="#2563EB" />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function GradeButton({ label, hint, onClick, bg, border, text }: {
  label: string; hint: string; onClick: () => void;
  bg: string; border: string; text: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center py-3 px-2 rounded-xl border transition-all duration-150 hover:scale-[1.04] active:scale-[0.97]"
      style={{ background: bg, borderColor: border }}
    >
      <span className="font-semibold text-sm" style={{ color: text }}>{label}</span>
      <span className="text-xs opacity-50 mt-0.5 hidden sm:block" style={{ color: text }}>{hint}</span>
    </button>
  );
}

function SessionSummary({ grades, startTime, remaining }: {
  grades: number[]; startTime: number; remaining: number;
}) {
  const correct = grades.filter(g => g >= 2).length;
  const pct = grades.length > 0 ? Math.round((correct / grades.length) * 100) : 0;
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-4 bg-[#FDFCF8]">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: '#CCFBF1', border: '1px solid #99F6E4' }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="font-display text-3xl font-semibold text-[#1C1917] mb-1">Session complete</h1>
      <p className="text-[#78716C] text-sm mb-10">Keep the momentum going.</p>

      <div className="grid grid-cols-3 gap-4 mb-10 w-full max-w-sm">
        <SummaryBox label="Reviewed" value={String(grades.length)} />
        <SummaryBox label="Correct"  value={`${pct}%`} highlight />
        <SummaryBox label="Time"     value={timeStr} />
      </div>

      <div className="flex flex-col items-center gap-3">
        {remaining > 0 && (
          <Link
            href="/recall"
            className="px-8 py-3 rounded-2xl font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #C85A3A 0%, #A84830 100%)', boxShadow: '0 4px 16px rgba(200,90,58,0.25)' }}
          >
            Continue — {remaining} more due
          </Link>
        )}
        <Link href="/" className="text-sm text-[#78716C] hover:text-[#1C1917] transition-colors">
          ← Back to dashboard
        </Link>
      </div>
    </main>
  );
}

function SummaryBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-2xl p-4 text-center border"
      style={{
        background: highlight ? '#F0FDF9' : '#FFFFFF',
        borderColor: highlight ? '#99F6E4' : '#E7E0D5',
        boxShadow: '0 1px 3px rgba(100,60,20,0.05)',
      }}
    >
      <div className="font-display text-xl font-bold" style={{ color: highlight ? '#0D9488' : '#1C1917' }}>
        {value}
      </div>
      <div className="text-xs text-[#78716C] mt-1">{label}</div>
    </div>
  );
}
