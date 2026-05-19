import { getIslandsWithStats } from '@/lib/db/queries';
import AddForm from './AddForm';

export const dynamic = 'force-dynamic';

export default async function AddPage() {
  let islands: Awaited<ReturnType<typeof getIslandsWithStats>> = [];
  try {
    islands = await getIslandsWithStats();
  } catch (err) {
    console.error('AddPage: failed to load islands', err);
  }
  return (
    <main className="min-h-dvh px-4 py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-[#1C1917]">Add Sentences</h1>
        <p className="text-[#78716C] text-sm mt-1">
          Type or speak in English — we'll translate to Spanish.
        </p>
        <div className="divider mt-4" />
      </div>
      <AddForm islands={islands.map(i => ({ id: i.id, displayName: i.displayName, emoji: i.emoji }))} />
    </main>
  );
}
