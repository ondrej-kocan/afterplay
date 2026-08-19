import type { MonthDetail as MonthDetailData } from "@/lib/analytics/month-detail";

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const numberFormatter = new Intl.NumberFormat("en-GB");

export function MonthDetail({ detail }: { detail: MonthDetailData }) {
  const label = monthFormatter.format(new Date(detail.year, detail.month, 1));

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fuchsia-300">What defined this month</p>
          <h4 className="mt-1 text-lg font-semibold text-white">{label}</h4>
        </div>
        <p className="text-sm text-zinc-400">{numberFormatter.format(detail.totalPlays)} plays</p>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <Ranking title="Top artists">
          {detail.topArtists.map((item, index) => (
            <li key={item.artist} className="flex items-baseline justify-between gap-4 py-2">
              <span className="min-w-0 truncate text-sm text-zinc-100">
                <span className="mr-2 text-zinc-500">{index + 1}.</span>
                {item.artist}
              </span>
              <span className="shrink-0 text-xs text-zinc-500">{numberFormatter.format(item.plays)}</span>
            </li>
          ))}
        </Ranking>

        <Ranking title="Top tracks">
          {detail.topTracks.map((item, index) => (
            <li key={`${item.artist}\u0000${item.track}`} className="flex items-baseline justify-between gap-4 py-2">
              <span className="min-w-0 text-sm text-zinc-100">
                <span className="mr-2 text-zinc-500">{index + 1}.</span>
                <span className="font-medium">{item.track}</span>
                <span className="text-zinc-500"> · {item.artist}</span>
              </span>
              <span className="shrink-0 text-xs text-zinc-500">{numberFormatter.format(item.plays)}</span>
            </li>
          ))}
        </Ranking>
      </div>
    </div>
  );
}

function Ranking({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="text-sm font-semibold text-zinc-300">{title}</h5>
      <ol className="mt-2 divide-y divide-white/5">{children}</ol>
    </div>
  );
}
