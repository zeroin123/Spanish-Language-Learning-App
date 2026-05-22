import Link from 'next/link';
import { getReviewHistory } from '@/lib/db/queries';
import HistoryChart from './HistoryChart';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const data = await getReviewHistory();

  return (
    <main className="min-h-dvh px-4 py-8 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[#78716C] hover:text-[#44403C] transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Dashboard
      </Link>

      <h1 className="font-display text-2xl font-semibold text-[#1C1917] mb-6">
        Review History
      </h1>

      {/* Stats row — always derived from daily data */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Day streak"  value={data.daily.currentStreak}   accent="#C85A3A" unit="🔥" />
        <StatCard label="This week"   value={data.daily.thisWeekReviews}  accent="#D97706" unit="cards" />
        <StatCard label="Best day"    value={data.daily.bestBucketCount}  accent="#0D9488" unit="cards" />
      </div>

      {/* Chart — client component owns period toggle */}
      <HistoryChart
        daily={data.daily}
        weekly={data.weekly}
        monthly={data.monthly}
      />
    </main>
  );
}

function StatCard({ label, value, accent, unit }: {
  label: string;
  value: number;
  accent: string;
  unit: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background: `${accent}0F`,
        borderColor: `${accent}30`,
        boxShadow: '0 1px 3px rgba(100,60,20,0.05)',
      }}
    >
      <div
        className="text-2xl font-bold tabular-nums font-display"
        style={{ color: accent }}
      >
        {value.toLocaleString()}
      </div>
      <div className="text-xs mt-0.5 text-[#78716C]">{label}</div>
      <div className="text-[10px] text-[#A8A29E] mt-0.5">{unit}</div>
    </div>
  );
}
