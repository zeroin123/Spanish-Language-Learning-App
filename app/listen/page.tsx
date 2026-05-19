import { getIslandsWithStats, getAllListenSentences } from '@/lib/db/queries';
import ListenPlayer from './ListenPlayer';

export default function ListenPage() {
  const sentences = getAllListenSentences();
  const islands = getIslandsWithStats();
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <ListenPlayer
        sentences={sentences}
        islands={islands.map(i => ({ id: i.id, displayName: i.displayName, emoji: i.emoji }))}
      />
    </main>
  );
}
