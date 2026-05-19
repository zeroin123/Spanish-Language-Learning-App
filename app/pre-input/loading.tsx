export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 max-w-2xl mx-auto">
      <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-72 bg-slate-800/60 rounded animate-pulse mb-8" />
      <div className="h-40 bg-slate-800/60 rounded-xl animate-pulse mb-4" />
      <div className="h-12 bg-slate-800/60 rounded-xl animate-pulse" />
    </main>
  );
}
