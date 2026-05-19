import Link from 'next/link';
import { getDashboardStats, getIslandsWithStats, getSessionCap, type IslandStat } from '@/lib/db/queries';
import DailyCapWidget from './DailyCapWidget';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [stats, islands, sessionCap] = await Promise.all([
    getDashboardStats(),
    getIslandsWithStats(),
    getSessionCap(),
  ]);

  return (
    <main className="min-h-dvh px-4 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl select-none">🌊</span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1C1917]">
            Polyglot Islands
          </h1>
        </div>
        <p className="text-[#78716C] text-sm">Your personal Spanish sentence bank</p>
        <div className="divider mt-4" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Sentences" value={stats.totalSentences} />
        <StatCard label="Due today" value={stats.dueToday} highlight={stats.dueToday > 0} />
        <StatCard label="Mastered" value={stats.mastered} teal />
      </div>

      {/* Primary CTA */}
      {stats.dueToday > 0 && (
        <Link
          href="/recall"
          className="flex items-center justify-between w-full px-5 py-4 mb-6 rounded-2xl text-white transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #C85A3A 0%, #A84830 100%)', boxShadow: '0 4px 16px rgba(200,90,58,0.30)' }}
        >
          <div>
            <p className="font-semibold text-base leading-tight">
              {stats.dueToday} card{stats.dueToday !== 1 ? 's' : ''} due for review
            </p>
            <p className="text-white/60 text-xs mt-0.5">Start your session now</p>
          </div>
          <ArrowRightIcon />
        </Link>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <QuickAction href="/add"        icon={<PencilIcon />}     label="Add sentences" sub="Type or speak"         color="#C85A3A" />
        <QuickAction href="/recall"     icon={<CardsIcon />}      label="Review"        sub={`${stats.dueToday} due`} color="#D97706" />
        <QuickAction href="/listen"     icon={<HeadphonesIcon />} label="Listen"        sub="Shadow mode"           color="#0D9488" />
        <QuickAction href="/pre-input"  icon={<ClipboardIcon />}  label="Pre-input"     sub="Extract vocab"         color="#7C3AED" />
      </div>

      {/* Daily cap setting */}
      <div className="mb-8">
        <DailyCapWidget initialCap={sessionCap} />
      </div>

      {/* Islands */}
      <h2 className="text-xs font-semibold text-[#78716C] uppercase tracking-widest mb-3">
        Islands
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {islands.map(island => (
          <Link key={island.slug} href={`/islands/${island.slug}`}>
            <IslandCard island={island} />
          </Link>
        ))}
      </div>
    </main>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function StatCard({ label, value, highlight, teal }: {
  label: string; value: number; highlight?: boolean; teal?: boolean;
}) {
  const accent = highlight ? '#C85A3A' : teal ? '#0D9488' : null;
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background: accent ? `${accent}0F` : '#FFFFFF',
        borderColor: accent ? `${accent}30` : '#E7E0D5',
        boxShadow: '0 1px 3px rgba(100,60,20,0.05)',
      }}
    >
      <div className="text-2xl font-bold tabular-nums font-display" style={{ color: accent ?? '#1C1917' }}>
        {value.toLocaleString()}
      </div>
      <div className="text-xs mt-1 text-[#78716C]">{label}</div>
    </div>
  );
}

function QuickAction({ href, icon, label, sub, color }: {
  href: string; icon: React.ReactNode; label: string; sub: string; color: string;
}) {
  return (
    <Link
      href={href}
      className="card flex items-center gap-3 px-4 py-3.5 hover:shadow-md transition-all duration-200 group"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-[#1C1917]">{label}</div>
        <div className="text-xs text-[#78716C]">{sub}</div>
      </div>
    </Link>
  );
}

function IslandCard({ island }: { island: IslandStat }) {
  const masteryPct = island.sentenceCount > 0
    ? Math.round((island.masteredCount / island.sentenceCount) * 100)
    : 0;

  return (
    <div className="card p-4 h-full cursor-pointer">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl leading-none mt-0.5 select-none">{island.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[#1C1917] text-sm leading-tight truncate">
            {island.displayName}
          </div>
          <div className="text-xs text-[#78716C] mt-0.5">{island.sentenceCount} sentences</div>
        </div>
        {island.dueCount > 0 && (
          <span className="badge shrink-0" style={{ background: '#FEF3C7', borderColor: '#FDE68A', color: '#92400E' }}>
            {island.dueCount} due
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-[#F0EBE3]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${masteryPct}%`, backgroundColor: island.color }}
        />
      </div>
      <div className="text-xs text-[#A8A29E] mt-1.5">{masteryPct}% mastered</div>
    </div>
  );
}

/* ── Icons ───────────────────────────────────────────────────── */

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function CardsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}
function HeadphonesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70 shrink-0">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
