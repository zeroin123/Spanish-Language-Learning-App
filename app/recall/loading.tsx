export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <div className="h-4 bg-slate-800 rounded-full mb-8 animate-pulse" />
        <div className="h-12 w-2/3 mx-auto bg-slate-800/60 rounded-xl animate-pulse mb-4" />
        <div className="h-6 w-1/2 mx-auto bg-slate-800/40 rounded animate-pulse mb-12" />
        <div className="h-14 w-40 mx-auto bg-slate-700/60 rounded-xl animate-pulse" />
      </div>
    </main>
  );
}
