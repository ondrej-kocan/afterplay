"use client";

import { useMemo, useState } from "react";
import type { MonthlyListening } from "@/lib/analytics/monthly";

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const numberFormatter = new Intl.NumberFormat("en-GB");

export function ListeningTimeline({ data }: { data: MonthlyListening[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chart = useMemo(() => {
    const width = 1000;
    const height = 260;
    const padding = 20;
    const max = Math.max(...data.map((point) => point.plays), 1);
    const xStep = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
    const points = data.map((point, index) => ({
      ...point,
      x: padding + index * xStep,
      y: height - padding - (point.plays / max) * (height - padding * 2),
    }));
    return { width, height, max, points, path: points.map((p) => `${p.x},${p.y}`).join(" ") };
  }, [data]);

  if (data.length === 0) return null;

  const active = activeIndex === null ? null : chart.points[activeIndex];

  const move = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * chart.width;
    const index = Math.round(((x - 20) / (chart.width - 40)) * (data.length - 1));
    setActiveIndex(Math.max(0, Math.min(data.length - 1, index)));
  };

  const startInteraction = (event: React.PointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    move(event);
  };

  const endInteraction = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="mt-8 border-t border-white/10 pt-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fuchsia-300">Listening timeline</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Your history, month by month.</h3>
        </div>
        <p className="text-sm text-zinc-400">
          {active
            ? `${monthFormatter.format(new Date(active.year, active.month, 1))} · ${numberFormatter.format(active.plays)} plays`
            : "Move across the chart to inspect a month"}
        </p>
      </div>

      <div className="mt-6 select-none overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="block h-auto w-full cursor-crosshair select-none touch-none"
          role="img"
          aria-label="Monthly listening history timeline"
          onPointerDown={startInteraction}
          onPointerMove={move}
          onPointerUp={endInteraction}
          onPointerCancel={endInteraction}
          onPointerLeave={() => setActiveIndex(null)}
        >
          <line x1="20" y1="240" x2="980" y2="240" stroke="currentColor" className="text-white/10" />
          <line x1="20" y1="20" x2="980" y2="20" stroke="currentColor" className="text-white/5" />
          <polyline
            points={chart.path}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-fuchsia-300"
          />
          {active ? (
            <>
              <line x1={active.x} y1="20" x2={active.x} y2="240" stroke="currentColor" className="text-white/20" />
              <circle cx={active.x} cy={active.y} r="8" fill="currentColor" className="text-white" />
            </>
          ) : null}
        </svg>
        <div className="mt-2 flex select-none justify-between text-xs text-zinc-500">
          <span>{monthFormatter.format(new Date(data[0].year, data[0].month, 1))}</span>
          <span>{monthFormatter.format(new Date(data[data.length - 1].year, data[data.length - 1].month, 1))}</span>
        </div>
      </div>
    </div>
  );
}
