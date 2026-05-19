'use client';

import { useState, useTransition } from 'react';
import { updateSessionCapAction } from '@/app/actions';

export default function DailyCapWidget({ initialCap }: { initialCap: number }) {
  const [cap, setCap] = useState(initialCap);
  const [pending, startTransition] = useTransition();

  function update(next: number) {
    const value = Math.max(30, next);
    setCap(value);
    startTransition(() => updateSessionCapAction(value));
  }

  const btnClass =
    'w-8 h-8 rounded-lg flex items-center justify-center border text-lg font-medium transition-all ' +
    'border-[#E7E0D5] bg-white text-[#44403C] hover:border-[#C85A3A] hover:text-[#C85A3A] ' +
    'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#E7E0D5] disabled:hover:text-[#44403C]';

  return (
    <div className="card px-4 py-3 flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold text-[#1C1917]">Daily review cap</div>
        <div className="text-xs text-[#78716C] mt-0.5">Cards per session · min 30</div>
      </div>
      <div className="flex items-center gap-2.5">
        <button onClick={() => update(cap - 5)} disabled={cap <= 30 || pending} className={btnClass}>
          −
        </button>
        <span className="w-10 text-center font-display font-bold text-lg text-[#1C1917] tabular-nums">
          {cap}
        </span>
        <button onClick={() => update(cap + 5)} disabled={pending} className={btnClass}>
          +
        </button>
      </div>
    </div>
  );
}
