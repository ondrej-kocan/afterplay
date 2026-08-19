import type { ArtistComeback } from "@/lib/analytics/artist-comebacks";

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const numberFormatter = new Intl.NumberFormat("en-GB");

function formatGap(months: number) {
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (years === 0) return `${months} months`;
  if (remaining === 0) return `${years} ${years === 1 ? "year" : "years"}`;
  return `${years}y ${remaining}m`;
}

export function ArtistComebacks({ comebacks }: { comebacks: ArtistComeback[] }) {
  if (comebacks.length === 0) return null;

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <p className="text-sm font-medium text-fuchsia-300">Comebacks</p>
      <h3 className="mt-1 text-xl font-semibold text-white">Gone for ages. Then suddenly back.</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
        Artists you had a real history with, barely touched for at least a year, then returned to in force.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {comebacks.map((item) => (
          <article key={`${item.artist}-${item.returnYear}-${item.returnMonth}`} className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h4 className="truncate text-lg font-semibold text-white">{item.artist}</h4>
                <p className="mt-1 text-sm text-zinc-400">
                  Returned {monthFormatter.format(new Date(item.returnYear, item.returnMonth, 1))}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1.5 text-sm font-semibold text-fuchsia-300">
                {formatGap(item.gapMonths)} away
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-zinc-500">Previous sighting</p>
                <p className="mt-1 font-semibold text-zinc-100">
                  {monthFormatter.format(new Date(item.previousYear, item.previousMonth, 1))}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Return month</p>
                <p className="mt-1 font-semibold text-zinc-100">
                  {numberFormatter.format(item.returnPlays)} plays · {Math.round(item.returnShare * 100)}%
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
