import { HistoryUpload } from "@/components/history-upload";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.2),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(124,58,237,0.18),transparent_36%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight text-white">Afterplay</div>
          <div className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400">Local-first · v0.1</div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16 sm:py-24">
          <div className="mb-12 max-w-3xl sm:mb-16">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-fuchsia-300">Your listening, after the play</p>
            <h1 className="text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">
              See the shape of your music history.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
              Import your listening history and explore the eras, obsessions, comebacks and patterns hidden inside it.
            </p>
          </div>

          <HistoryUpload />
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Built for listening history from multiple sources.</span>
          <span>No account. No upload. Your data stays with you.</span>
        </footer>
      </div>
    </main>
  );
}
