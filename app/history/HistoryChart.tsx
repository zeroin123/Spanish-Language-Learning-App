'use client';

import { useState } from 'react';
import type { ReviewHistoryData } from '@/lib/db/queries';

type HistoryPeriod = 'daily' | 'weekly' | 'monthly';

type Props = {
  daily: ReviewHistoryData;
  weekly: ReviewHistoryData;
  monthly: ReviewHistoryData;
};

export default function HistoryChart({ daily, weekly, monthly }: Props) {
  const [period, setPeriod] = useState<HistoryPeriod>('daily');
  const active = period === 'daily' ? daily : period === 'weekly' ? weekly : monthly;
  const { buckets, bestBucketCount } = active;

  const BAR_HEIGHT = 120;

  return (
    <div className="card p-5">
      {/* Period tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-[#F7F2EA] rounded-xl border border-[#E7E0D5]">
        {(['daily', 'weekly', 'monthly'] as HistoryPeriod[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
            style={{
              background:  period === p ? '#FFFFFF' : 'transparent',
              color:       period === p ? '#1C1917' : '#78716C',
              boxShadow:   period === p ? '0 1px 3px rgba(100,60,20,0.08)' : 'none',
              border:      period === p ? '1px solid #E7E0D5' : '1px solid transparent',
            }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Bar chart */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div
          className="flex items-end gap-1 min-w-0"
          style={{ minWidth: buckets.length * 28 }}
        >
          {buckets.map((bucket, i) => {
            const isLast = i === buckets.length - 1;
            const pct = bestBucketCount > 0 ? bucket.count / bestBucketCount : 0;
            const barPx = Math.max(pct * BAR_HEIGHT, bucket.count > 0 ? 4 : 2);

            // Colour: last bucket = coral gradient, past with reviews = muted coral, zero = grey tick
            let barBg: string;
            if (isLast && bucket.count > 0) {
              barBg = 'linear-gradient(180deg, #C85A3A 0%, #A84830 100%)';
            } else if (bucket.count > 0) {
              barBg = '#EAB8A8';
            } else {
              barBg = '#E7E0D5';
            }

            // On daily view (14 bars), hide every other label on small containers
            const showLabel = period !== 'daily' || i % 2 === 0 || i === buckets.length - 1;

            return (
              <div
                key={bucket.date}
                className="flex flex-col items-center flex-1"
                title={`${bucket.label}: ${bucket.count} card${bucket.count !== 1 ? 's' : ''} reviewed`}
              >
                {/* Bar wrapper — fixed height so bars grow from bottom */}
                <div className="flex items-end w-full" style={{ height: BAR_HEIGHT }}>
                  <div
                    className="w-full rounded-t-sm transition-all duration-500"
                    style={{
                      height: barPx,
                      background: barBg,
                      minHeight: 2,
                    }}
                  />
                </div>
                {/* Label */}
                <div
                  className="text-[10px] text-[#A8A29E] mt-1.5 leading-none truncate w-full text-center"
                  style={{ visibility: showLabel ? 'visible' : 'hidden' }}
                >
                  {bucket.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Y-axis hint */}
      {bestBucketCount > 0 && (
        <div className="flex justify-between mt-3 px-0.5">
          <span className="text-[10px] text-[#C4B9AD]">0</span>
          <span className="text-[10px] text-[#C4B9AD]">{bestBucketCount} cards</span>
        </div>
      )}

      {bestBucketCount === 0 && (
        <p className="text-center text-sm text-[#A8A29E] mt-4">
          No reviews yet in this period. Start a session to see your progress!
        </p>
      )}
    </div>
  );
}
