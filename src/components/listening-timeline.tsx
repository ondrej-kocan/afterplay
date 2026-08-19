"use client";

import { useMemo, useState } from "react";
import type { MonthlyListening } from "@/lib/analytics/monthly";
import { normalizePeriod, type ExcludedPeriod, type MonthPoint } from "@/lib/analytics/exclusions";

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const numberFormatter = new Intl.NumberFormat("en-GB");

export type SelectedMonth = MonthPoint;

type ListeningTimelineProps = {
  data: MonthlyListening[];
  selectedMonth: SelectedMonth | null;
  excludedPeriods: ExcludedPeriod[];
  onSelectMonth: (month: SelectedMonth) => void;
  onExcludePeriod: (period: ExcludedPeriod) => void;
};

export function ListeningTimeline({
  data,
  selectedMonth,
  excludedPeriods,
  onSelectMonth,
  onExcludePeriod,
}: ListeningTimelineProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [candidatePeriod, setCandidatePeriod] = useState<ExcludedPeriod | null>(null);

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
    return { width, height, padding, xStep, points, path: points.map((p) => `${p.x},${p.y}`).join(" ") };
  }, [data]);

  if (data.length === 0) return null;

  const selectedIndex = selectedMonth
    ? data.findIndex((point) => point.year === selectedMonth.year && point.month === selectedMonth.month)
    : -1;
  const displayIndex = hoverIndex ?? (selectedIndex >= 0 ? selectedIndex : null);
  const active = displayIndex === null ? null : chart.points[displayIndex];

  const indexFromPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * chart.width;
    const index = Math.round(((x - chart.padding) / (chart.width - chart.padding * 2)) * (data.length - 1));
    return Math.max(0, Math.min(data.length - 1, index));
  };

  const pointAt = (index: number): MonthPoint => ({ year: data[index].year, month: data[index].month });

  const move = (event: React.PointerEvent<SVGSVGElement>) => {
    const index = indexFromPointer(event);
    setHoverIndex(index);
    if (dragStartIndex !== null && index !== dragStartIndex) {
      setCandidatePeriod(normalizePeriod(pointAt(dragStartIndex), pointAt(index)));
    }
  };

  const startInteraction = (event: React.PointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    const index = indexFromPointer(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStartIndex(index);
    setHoverIndex(index);
    setCandidatePeriod(null);
  };

  const endInteraction = (event: React.PointerEvent<SVGSVGElement>) => {
    const index = indexFromPointer(event);
    if (dragStartIndex === null || index === dragStartIndex) {
      onSelectMonth(pointAt(index));
      setCandidatePeriod(null);
    } else {
      setCandidatePeriod(normalizePeriod(pointAt(dragStartIndex), pointAt(index)));
    }
    setHoverIndex(index);
    setDragStartIndex(null);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const xForMonth = (point: MonthPoint) => {
    const index = data.findIndex((item) => item.year === point.year && item.month === point.month);
    return index < 0 ? null : chart.points[index].x;
  };

  const rangeRect = (period: ExcludedPeriod) => {
    const startX = xForMonth(period.start);
    const endX = xForMonth(period.end);
    if (startX === null || endX === null) return null;
    const half = Math.max(chart.xStep / 2, 2);
    const x = Math.max(chart.padding, startX - half);
    const right = Math.min(chart.width - chart.padding, endX + half);
    return { x, width: right - x };
  };

  return (
    <div className="mt-8 border-t border-white/10 pt-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fuchsia-300">Listening timeline</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Your history, month by month.</h3>
        </div>
        <p className="text-sm text-zinc-400">
          {candidatePeriod
            ? `${monthFormatter.format(new Date(candidatePeriod.start.year, candidatePeriod.start.month, 1))} → ${monthFormatter.format(new Date(candidatePeriod.end.year, candidatePeriod.end.month, 1))}`
            : active
              ? `${monthFormatter.format(new Date(active.year, active.month, 1))} · ${numberFormatter.format(active.plays)} plays`
              : "Tap for a month, or drag to select a period"}
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
          onPointerCancel={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            setDragStartIndex(null);
            setHoverIndex(null);
          }}
          onPointerLeave={() => {
            if (dragStartIndex === null) setHoverIndex(null);
          }}
        >
          <line x1="20" y1="240" x2="980" y2="240" stroke="currentColor" className="text-white/10" />
          <line x1="20" y1="20" x2="980" y2="20" stroke="currentColor" className="text-white/5" />

          {excludedPeriods.map((period, index) => {
            const rect = rangeRect(period);
            return rect ? <rect key={index} x={rect.x} y="20" width={rect.width} height="220" className="fill-zinc-700/35" /> : null;
          })}

          {candidatePeriod ? (() => {
            const rect = rangeRect(candidatePeriod);
            return rect ? <rect x={rect.x} y="20" width={rect.width} height="220" stroke="currentColor" strokeWidth="2" className="fill-fuchsia-400/20 text-fuchsia-300" /> : null;
          })() : null}

          <polyline points={chart.path} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-fuchsia-300" />

          {active && !candidatePeriod ? (
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

      {candidatePeriod ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-3">
          <p className="text-sm text-fuchsia-100">
            Exclude {monthFormatter.format(new Date(candidatePeriod.start.year, candidatePeriod.start.month, 1))} through {monthFormatter.format(new Date(candidatePeriod.end.year, candidatePeriod.end.month, 1))} from analysis?
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setCandidatePeriod(null)} className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300">Cancel</button>
            <button
              type="button"
              onClick={() => {
                onExcludePeriod(candidatePeriod);
                setCandidatePeriod(null);
              }}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950"
            >
              Exclude period
            </button>
          </div>
        </div>
      ) : null}

      {excludedPeriods.length > 0 ? (
        <p className="mt-3 text-xs text-zinc-500">Shaded periods are excluded from all analysis below.</p>
      ) : null}
    </div>
  );
}
