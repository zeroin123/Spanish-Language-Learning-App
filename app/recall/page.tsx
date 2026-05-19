import Link from 'next/link';
import { getDueQueue, getTotalDueCount } from '@/lib/db/queries';
import RecallSession from './RecallSession';

export default function RecallPage() {
  const SESSION_CAP = 30;
  const cards = getDueQueue(SESSION_CAP);
  const totalDue = getTotalDueCount();

  if (cards.length === 0) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-4 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ background: '#CCFBF1', border: '1px solid #99F6E4' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-[#1C1917] mb-2">All caught up!</h1>
        <p className="text-[#78716C] text-sm mb-8">No cards due for review right now.</p>
        <Link href="/" className="text-sm text-[#C85A3A] hover:text-[#A84830] font-medium transition-colors">
          ← Back to dashboard
        </Link>
      </main>
    );
  }

  return <RecallSession cards={cards} totalDue={totalDue} sessionCap={SESSION_CAP} />;
}
