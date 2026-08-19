"use client";

import { useMemo, useState } from "react";

import { ArtistErasView } from "@/components/artist-eras";
import { ListeningTimeline, type SelectedMonth } from "@/components/listening-timeline";
import { MonthDetail } from "@/components/month-detail";
import { buildArtistEras } from "@/lib/analytics/artist-eras";
import { summarizeMonth } from "@/lib/analytics/month-detail";
import { aggregateMonthlyListening } from "@/lib/analytics/monthly";
import { summarizeListeningHistory } from "@/lib/analytics/summary";
import type { Play } from "@/lib/listening/play";

const numberFormatter = new Intl.NumberFormat("en-GB");
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function ListeningDashboard({ plays }: { plays: Play[] }) {
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth | null>(null);

  const summary = useMemo(() => summarizeListeningHistory(plays), [plays]);
  const monthly = useMemo(() => aggregateMonthlyListening(plays), [plays]);
  const artistEras = useMemo(() => buildArtistEras(plays), [plays]);
  const monthDetail = useMemo(
    () => (selectedMonth ? summarizeMonth(plays, selectedMonth.year, selectedMonth.month) : null),
    [plays, selectedMonth],
  );

  const metrics = [
    ["Plays", numberFormatter.format(summary.totalPlays)],
    ["Artists", numberFormatter.format(summary.uniqueArtists)],
    ["Tracks", numberFormatter.format(summary.uniqueTracks)],
    ["Albums", numberFormatter.format(summary.uniqueAlbums)],
  ];

  return (
    <div className="mt-8 border-t border-white/10 pt-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fuchsia-300">History loaded</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Your listening life, ready to explore.</h3>
        </div>
        <p className="text-sm text-zinc-400">
          {dateFormatter.format(summary.firstPlay)} → {dateFormatter.format(summary.lastPlay)}
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <dt className="text-sm text-zinc-400">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <ListeningTimeline data={monthly} selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
      {monthDetail ? <MonthDetail detail={monthDetail} /> : null}
      <ArtistErasView data={artistEras} plays={plays} />
    </div>
  );
}
