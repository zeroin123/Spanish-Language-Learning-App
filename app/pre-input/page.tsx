import { getIslandsWithStats } from '@/lib/db/queries';
import PreInputTool from './PreInputTool';

export const dynamic = 'force-dynamic';

export default async function PreInputPage() {
  const islands = await getIslandsWithStats();
  return (
    <main className="min-h-dvh px-4 py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-[#1C1917]">Pre-Input Tool</h1>
        <p className="text-[#78716C] text-sm mt-1">
          Paste a Spanish transcript — extract the key vocabulary before diving in.
        </p>
        <div className="divider mt-4" />
      </div>
      <PreInputTool islands={islands.map(i => ({ id: i.id, displayName: i.displayName, emoji: i.emoji }))} />
    </main>
  );
}
