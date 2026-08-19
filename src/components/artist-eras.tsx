"use client";

import { useMemo, useState } from "react";

import type { ArtistEras } from "@/lib/analytics/artist-eras";

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const numberFormatter = new Intl.NumberFormat("en-GB");
const palette = ["#e879f9", "#a78bfa", "#60a5fa", "#22d3ee", "#34d399", "#facc15", "#fb923c", "#fb7185"];

export function ArtistErasView({ data }: { data: ArtistEras }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : data.months[activeIndex];

  const chart = useMemo(() => {
    const width = 1000;
    const height = 360;
    const columnWidth = data.months.length > 0 ? width / data.months.length : width;
    return { width, height, columnWidth };
  }, [data.months.length]);

  if (data.months.length === 0 || data.artists.length === 0) return null;

  const move = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(0.999999, (event.clientX - rect.left) / rect.width));
    setActiveIndex(Math.floor(ratio * data.months.length));
  };

  const start = (event: React.PointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    move(event);
  };

  const end = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const activeRows = active
    ? data.artists
        .map((artist, index) => ({ artist, plays: active.counts[index], color: palette[index] }))
        .filter((row) => row.plays > 0)
        .sort((a, b) => b.plays - a.plays)
    : [];

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fuchsia-300">Artist eras</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Who owned each part of your listening life?</h3>
        </div>
        <p className="max-w-md text-sm text-zinc-400 sm:text-right">
          Each month is split by listening share for your all-time top artists. Everything else is grouped as Other.
        </p>
      </div>

      <div className="mt-6 select-none overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="block h-auto w-full cursor-crosshair select-none touch-none"
          role="img"
          aria-label="Monthly listening share of top artists"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={() => setActiveIndex(null)}
        >
          {data.months.map((month, monthIndex) => {
            const x = monthIndex * chart.columnWidth;
            const total = Math.max(month.totalPlays, 1);
            let y = chart.height;

            const segments = month.counts.map((count, artistIndex) => ({
              key: `${monthIndex}-${artistIndex}`,
              count,
              color: palette[artistIndex],
            }));
            segments.push({ key: `${monthIndex}-other`, count: month.other, color: "#3f3f46" });

            return segments.map((segment) => {
              const segmentHeight = (segment.count / total) * chart.height;
              y -= segmentHeight;
              return (
                <rect
                  key={segment.key}
                  x={x}
                  y={y}
                  width={Math.max(chart.columnWidth + 0.25, 0.5)}
                  height={segmentHeight}
                  fill={segment.color}
                />
              );
            });
          })}
          {activeIndex !== null ? (
            <rect
              x={activeIndex * chart.columnWidth}
              y="0"
              width={Math.max(chart.columnWidth, 2)}
              height={chart.height}
              fill="none"
              stroke="white"
              strokeWidth="3"
              opacity="0.8"
            />
          ) : null}
        </svg>

        <div className="mt-3 flex justify-between text-xs text-zinc-500">
          <span>{monthFormatter.format(new Date(data.months[0].year, data.months[0].month, 1))}</span>
          <span>{monthFormatter.format(new Date(data.months[data.months.length - 1].year, data.months[data.months.length - 1].month, 1))}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-zinc-300">All-time artists shown</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.artists.map((artist, index) => (
              <span key={artist} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette[index] }} />
                {artist}
              </span>
            ))}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />Other
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          {active ? (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-semibold text-white">{monthFormatter.format(new Date(active.year, active.month, 1))}</p>
                <p className="text-sm text-zinc-400">{numberFormatter.format(active.totalPlays)} plays</p>
              </div>
              <div className="mt-3 space-y-2">
                {activeRows.slice(0, 5).map((row) => (
                  <div key={row.artist} className="flex items-center justify-between gap-4 text-sm">
                    <span className="flex min-w-0 items-center gap-2 text-zinc-200">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                      <span className="truncate">{row.artist}</span>
                    </span>
                    <span className="shrink-0 text-zinc-400">
                      {numberFormatter.format(row.plays)} · {Math.round((row.plays / Math.max(active.totalPlays, 1)) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-zinc-400">Move across the eras chart to see who dominated a particular month.</p>
          )}
        </div>
      </div>
    </section>
  );
}
