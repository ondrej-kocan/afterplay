"use client";

import { useMemo, useState } from "react";

import type { ArtistEras, ArtistEraMonth } from "@/lib/analytics/artist-eras";
import { summarizeMonth } from "@/lib/analytics/month-detail";
import type { Play } from "@/lib/listening/play";

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const numberFormatter = new Intl.NumberFormat("en-GB");
const palette = ["#d946ef", "#a78bfa", "#3b82f6", "#06b6d4", "#10b981", "#facc15", "#f97316", "#fb7185"];
const otherColor = "#52525b";
const ranges = [
  ["All", null],
  ["10Y", 120],
  ["5Y", 60],
  ["3Y", 36],
  ["1Y", 12],
] as const;

export function ArtistErasView({ data, plays }: { data: ArtistEras; plays: Play[] }) {
  const [rangeMonths, setRangeMonths] = useState<number | null>(null);
  const visibleMonths = useMemo(
    () => (rangeMonths === null ? data.months : data.months.slice(-rangeMonths)),
    [data.months, rangeMonths],
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selectedIndex = useMemo(() => {
    if (visibleMonths.length === 0) return null;
    if (!selectedKey) return visibleMonths.length - 1;
    const index = visibleMonths.findIndex((month) => monthKey(month) === selectedKey);
    return index >= 0 ? index : visibleMonths.length - 1;
  }, [selectedKey, visibleMonths]);

  const selected = selectedIndex === null ? null : visibleMonths[selectedIndex];
  const detail = useMemo(
    () => (selected ? summarizeMonth(plays, selected.year, selected.month) : null),
    [plays, selected],
  );

  const chart = useMemo(() => buildChart(visibleMonths, data.artists.length), [visibleMonths, data.artists.length]);

  if (data.months.length === 0 || data.artists.length === 0) return null;

  const inspect = (event: React.PointerEvent<SVGSVGElement>) => {
    if (visibleMonths.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const index = Math.min(visibleMonths.length - 1, Math.round(ratio * (visibleMonths.length - 1)));
    setSelectedKey(monthKey(visibleMonths[index]));
  };

  const start = (event: React.PointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    inspect(event);
  };

  const end = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const selectedCounts = selected
    ? data.artists
        .map((artist, index) => ({
          artist,
          plays: selected.counts[index],
          share: selected.totalPlays ? selected.counts[index] / selected.totalPlays : 0,
          color: palette[index],
        }))
        .filter((row) => row.plays > 0)
        .sort((a, b) => b.plays - a.plays)
    : [];

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <div>
        <p className="text-sm font-medium text-fuchsia-300">Artist eras</p>
        <h3 className="mt-1 max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl">
          Who owned each part of your listening life?
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
          Each month is split by listening share for your all-time top artists. Everything else is grouped as Other.
        </p>
      </div>

      <div className="mt-5 flex max-w-lg rounded-full border border-white/10 bg-black/20 p-1">
        {ranges.map(([label, months]) => (
          <button
            key={label}
            type="button"
            onClick={() => setRangeMonths(months)}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition ${rangeMonths === months ? "bg-fuchsia-400/25 text-fuchsia-100" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-300 sm:text-sm">
        {data.artists.map((artist, index) => (
          <span key={artist} className="inline-flex min-w-0 items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: palette[index] }} />
            <span className="max-w-36 truncate">{artist}</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: otherColor }} />Other
        </span>
      </div>

      <div className="mt-5 select-none overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
        <div className="flex gap-2">
          <div className="flex h-56 shrink-0 flex-col justify-between py-1 text-[10px] text-zinc-500 sm:h-72 sm:text-xs">
            <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
          </div>
          <svg
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            preserveAspectRatio="none"
            className="block h-56 min-w-0 flex-1 cursor-crosshair select-none touch-none sm:h-72"
            role="img"
            aria-label="Monthly listening share of top artists"
            onPointerDown={start}
            onPointerMove={(event) => event.buttons > 0 && inspect(event)}
            onPointerUp={end}
            onPointerCancel={end}
          >
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line key={ratio} x1="0" x2={chart.width} y1={chart.height * ratio} y2={chart.height * ratio} stroke="white" opacity="0.08" strokeDasharray="5 6" />
            ))}
            {chart.paths.map((path, index) => (
              <path key={index} d={path} fill={index < data.artists.length ? palette[index] : otherColor} opacity={index === data.artists.length ? 0.55 : 0.88} />
            ))}
            {selectedIndex !== null ? (
              <line
                x1={xForIndex(selectedIndex, visibleMonths.length, chart.width)}
                x2={xForIndex(selectedIndex, visibleMonths.length, chart.width)}
                y1="0"
                y2={chart.height}
                stroke="white"
                strokeWidth="2"
                opacity="0.75"
              />
            ) : null}
          </svg>
        </div>
        <div className="mt-2 ml-9 flex justify-between text-xs text-zinc-500">
          <span>{monthFormatter.format(new Date(visibleMonths[0].year, visibleMonths[0].month, 1))}</span>
          <span>{monthFormatter.format(new Date(visibleMonths[visibleMonths.length - 1].year, visibleMonths[visibleMonths.length - 1].month, 1))}</span>
        </div>
      </div>

      {selected && detail ? (
        <>
          <div className="mt-4 grid grid-cols-2 divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="pr-4">
              <p className="text-xs text-zinc-500">Selected month</p>
              <p className="mt-1 text-xl font-semibold text-white">{monthFormatter.format(new Date(selected.year, selected.month, 1))}</p>
              <p className="mt-3 text-xs text-zinc-500">Total plays</p>
              <p className="mt-1 font-semibold text-zinc-100">{numberFormatter.format(selected.totalPlays)}</p>
            </div>
            <div className="pl-4">
              <p className="text-xs text-fuchsia-300">Top tracked artist</p>
              <p className="mt-1 truncate text-lg font-semibold text-white">{selectedCounts[0]?.artist ?? "Other"}</p>
              <p className="mt-2 text-sm text-fuchsia-300">{selectedCounts[0] ? `${Math.round(selectedCounts[0].share * 100)}% of plays` : ""}</p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <RankCard title="Top artists">
              {selectedCounts.slice(0, 5).map((row, index) => (
                <div key={row.artist} className="grid grid-cols-[1.25rem_1fr_auto] items-center gap-2 text-sm">
                  <span className="font-medium text-zinc-500">{index + 1}</span>
                  <span className="flex min-w-0 items-center gap-2 text-zinc-200">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="truncate">{row.artist}</span>
                  </span>
                  <span className="font-medium" style={{ color: row.color }}>{Math.round(row.share * 100)}%</span>
                </div>
              ))}
            </RankCard>

            <RankCard title="Top tracks">
              {detail.topTracks.slice(0, 5).map((row, index) => (
                <div key={`${row.artist}-${row.track}`} className="grid grid-cols-[1.25rem_1fr_auto] items-start gap-2 text-sm">
                  <span className="font-medium text-zinc-500">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-zinc-200">{row.track}</span>
                    <span className="block truncate text-xs text-zinc-500">{row.artist}</span>
                  </span>
                  <span className="whitespace-nowrap text-fuchsia-300">{numberFormatter.format(row.plays)}</span>
                </div>
              ))}
            </RankCard>
          </div>
        </>
      ) : null}

      <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-5 text-zinc-400">
        Drag across the chart to explore any month. Tap a month to lock it in and see the details.
      </div>
    </section>
  );
}

function RankCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="mb-3 text-sm font-medium text-fuchsia-300">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function monthKey(month: ArtistEraMonth) {
  return `${month.year}-${month.month}`;
}

function xForIndex(index: number, count: number, width: number) {
  return count <= 1 ? width / 2 : (index / (count - 1)) * width;
}

function buildChart(months: ArtistEraMonth[], artistCount: number) {
  const width = 1000;
  const height = 360;
  const layerCount = artistCount + 1;
  const lower = Array.from({ length: layerCount }, () => Array<number>(months.length).fill(0));
  const upper = Array.from({ length: layerCount }, () => Array<number>(months.length).fill(0));

  months.forEach((month, monthIndex) => {
    const total = Math.max(month.totalPlays, 1);
    const values = [...month.counts, month.other];
    let cumulative = 0;
    values.forEach((value, layerIndex) => {
      lower[layerIndex][monthIndex] = cumulative / total;
      cumulative += value;
      upper[layerIndex][monthIndex] = cumulative / total;
    });
  });

  const paths = Array.from({ length: layerCount }, (_, layerIndex) => {
    const top = months.map((_, index) => `${xForIndex(index, months.length, width)},${height - upper[layerIndex][index] * height}`);
    const bottom = months
      .map((_, index) => `${xForIndex(index, months.length, width)},${height - lower[layerIndex][index] * height}`)
      .reverse();
    return `M ${top.join(" L ")} L ${bottom.join(" L ")} Z`;
  });

  return { width, height, paths };
}
