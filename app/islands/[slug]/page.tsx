import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getIsland, getIslandSentences, type SentenceRow } from '@/lib/db/queries';
import TtsButton from '@/components/tts-button';

export const dynamic = 'force-dynamic';

export default async function IslandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const island = await getIsland(slug);
  if (!island) notFound();

  const sentences = await getIslandSentences(island.id);
  const masteredCount = sentences.filter(s => s.mastered).length;
  const masteryPct = sentences.length > 0 ? Math.round((masteredCount / sentences.length) * 100) : 0;

  return (
    <main className="min-h-dvh px-4 py-8 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-[#78716C] hover:text-[#1C1917] transition-colors mb-8 group"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Dashboard
      </Link>

      {/* Island header */}
      <div className="flex items-center gap-4 mb-3">
        <span className="text-4xl select-none">{island.icon_emoji}</span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1C1917]">{island.display_name}</h1>
          <p className="text-[#78716C] text-sm mt-0.5">
            {sentences.length} sentences · {masteredCount} mastered
          </p>
        </div>
      </div>

      {/* Mastery bar */}
      <div className="mb-8">
        <div className="h-2 bg-[#F0EBE3] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${masteryPct}%`, backgroundColor: island.color }}
          />
        </div>
        <div className="text-xs text-[#A8A29E] mt-1.5">{masteryPct}% mastered</div>
      </div>

      <div className="divider mb-8" />

      {/* Sentences */}
      {sentences.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#78716C] mb-3">No sentences in this island yet.</p>
          <Link href="/add" className="text-sm text-[#C85A3A] hover:text-[#A84830] font-medium transition-colors">
            Add some sentences →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sentences.map(s => <SentenceCard key={s.id} sentence={s} islandColor={island.color} />)}
        </div>
      )}
    </main>
  );
}

function SentenceCard({ sentence, islandColor }: { sentence: SentenceRow; islandColor: string }) {
  const status = sentence.mastered ? 'mastered' : sentence.reps > 0 ? 'learning' : 'new';

  const badge = {
    mastered: { bg: '#CCFBF1', border: '#99F6E4', text: '#0F766E', label: 'mastered' },
    learning: { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E', label: 'learning' },
    new:      { bg: '#F5F5F4', border: '#E7E5E4', text: '#78716C', label: 'new'      },
  }[status];

  return (
    <div className="card px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ backgroundColor: islandColor }} />
        <div className="flex-1 min-w-0">
          <p className="text-[#1C1917] text-sm leading-relaxed font-medium">{sentence.target}</p>
          <p className="text-[#78716C] text-xs leading-relaxed mt-0.5">{sentence.native}</p>
          {sentence.speaker && (
            <p className="text-xs text-[#A8A29E] mt-1 font-display italic">— {sentence.speaker}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          <span className="badge" style={{ background: badge.bg, borderColor: badge.border, color: badge.text }}>
            {badge.label}
          </span>
          <TtsButton text={sentence.target} />
        </div>
      </div>
    </div>
  );
}
