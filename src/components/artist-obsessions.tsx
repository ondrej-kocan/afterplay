import type { ArtistObsession } from "@/lib/analytics/artist-obsessions";

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const numberFormatter = new Intl.NumberFormat("en-GB");

export function ArtistObsessions({ obsessions }: { obsessions: ArtistObsession[] }) {
  if (obsessions.length === 0) return null;

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <p className="text-sm font-medium text-fuchsia-300">Obsessions</p>
      <h3 className="mt-1 text-xl font-semibold text-white">When one artist took over.</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
        These are unusually concentrated months — artists you played far more than their normal share of your history.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {obsessions.map((item, index) => (
          <article key={`${item.artist}-${item.year}-${item.month}`} className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">#{index + 1} obsession</p>
                <h4 className="mt-2 truncate text-lg font-semibold text-white">{item.artist}</h4>
                <p className="mt-1 text-sm text-zinc-400">{monthFormatter.format(new Date(item.year, item.month, 1))}</p>
              </div>
              <div className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1.5 text-sm font-semibold text-fuchsia-300">
                {Math.round(item.share * 100)}%
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-fuchsia-400" style={{ width: `${Math.min(item.share * 100, 100)}%` }} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-zinc-500">Plays that month</p>
                <p className="mt-1 font-semibold text-zinc-100">{numberFormatter.format(item.plays)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Above normal</p>
                <p className="mt-1 font-semibold text-zinc-100">{item.lift.toFixed(1)}×</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
