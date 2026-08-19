import type { TrackObsession } from "@/lib/analytics/track-obsessions";

const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const numberFormatter = new Intl.NumberFormat("en-GB");

export function TrackObsessions({ obsessions }: { obsessions: TrackObsession[] }) {
  if (obsessions.length === 0) return null;

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <p className="text-sm font-medium text-fuchsia-300">Track obsessions</p>
      <h3 className="mt-1 text-xl font-semibold text-white">The songs you put on repeat.</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
        Rolling 7, 14 and 30-day windows find short bursts that monthly totals can hide.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {obsessions.map((item, index) => (
          <article key={`${item.artist}-${item.track}`} className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">#{index + 1} track binge</p>
                <h4 className="mt-2 text-lg font-semibold leading-snug text-white">{item.track}</h4>
                <p className="mt-1 truncate text-sm text-zinc-400">{item.artist}</p>
              </div>
              <div className="shrink-0 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1.5 text-sm font-semibold text-fuchsia-300">
                {item.days} days
              </div>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              {dateFormatter.format(item.start)} → {dateFormatter.format(item.end)}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-zinc-500">Plays</p>
                <p className="mt-1 font-semibold text-zinc-100">{numberFormatter.format(item.plays)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Of listening</p>
                <p className="mt-1 font-semibold text-zinc-100">{Math.round(item.share * 100)}%</p>
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
