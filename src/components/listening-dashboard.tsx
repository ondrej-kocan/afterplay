"use client";

import { useMemo, useState } from "react";

import { ArtistComebacks } from "@/components/artist-comebacks";
import { ArtistErasView } from "@/components/artist-eras";
import { ArtistObsessions } from "@/components/artist-obsessions";
import { ListeningTimeline, type SelectedMonth } from "@/components/listening-timeline";
import { MonthDetail } from "@/components/month-detail";
import { TrackObsessions } from "@/components/track-obsessions";
import { findArtistComebacks } from "@/lib/analytics/artist-comebacks";
import { buildArtistEras } from "@/lib/analytics/artist-eras";
import { findArtistObsessions } from "@/lib/analytics/artist-obsessions";
import { filterExcludedPlays, mergeExcludedPeriods, type ExcludedPeriod } from "@/lib/analytics/exclusions";
import { summarizeMonth } from "@/lib/analytics/month-detail";
import { aggregateMonthlyListening } from "@/lib/analytics/monthly";
import { summarizeListeningHistory } from "@/lib/analytics/summary";
import { findTrackObsessions } from "@/lib/analytics/track-obsessions";
import type { Play } from "@/lib/listening/play";

const numberFormatter = new Intl.NumberFormat("en-GB");
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });

export function ListeningDashboard({ plays }: { plays: Play[] }) {
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth | null>(null);
  const [excludedPeriods, setExcludedPeriods] = useState<ExcludedPeriod[]>([]);

  const analysisPlays = useMemo(() => filterExcludedPlays(plays, excludedPeriods), [plays, excludedPeriods]);
  const timelineMonthly = useMemo(() => aggregateMonthlyListening(plays), [plays]);
  const summary = useMemo(() => summarizeListeningHistory(analysisPlays), [analysisPlays]);
  const artistEras = useMemo(() => buildArtistEras(analysisPlays), [analysisPlays]);
  const artistObsessions = useMemo(() => findArtistObsessions(analysisPlays), [analysisPlays]);
  const trackObsessions = useMemo(() => findTrackObsessions(analysisPlays), [analysisPlays]);
  const artistComebacks = useMemo(() => findArtistComebacks(analysisPlays), [analysisPlays]);
  const monthDetail = useMemo(
    () => (selectedMonth ? summarizeMonth(analysisPlays, selectedMonth.year, selectedMonth.month) : null),
    [analysisPlays, selectedMonth],
  );

  const addExcludedPeriod = (period: ExcludedPeriod) => {
    setExcludedPeriods((current) => mergeExcludedPeriods([...current, period]));
    setSelectedMonth(null);
  };

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

      <ListeningTimeline
        data={timelineMonthly}
        selectedMonth={selectedMonth}
        excludedPeriods={excludedPeriods}
        onSelectMonth={setSelectedMonth}
        onExcludePeriod={addExcludedPeriod}
      />

      {excludedPeriods.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-200">Excluded periods</p>
              <p className="mt-1 text-xs text-zinc-500">These ranges are ignored by every analysis except the source timeline.</p>
            </div>
            <button type="button" onClick={() => setExcludedPeriods([])} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300">
              Restore all
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {excludedPeriods.map((period, index) => (
              <button
                key={`${period.start.year}-${period.start.month}-${period.end.year}-${period.end.month}`}
                type="button"
                onClick={() => setExcludedPeriods((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300"
                title="Restore this period"
              >
                {monthFormatter.format(new Date(period.start.year, period.start.month, 1))} → {monthFormatter.format(new Date(period.end.year, period.end.month, 1))} · restore
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {monthDetail && monthDetail.totalPlays > 0 ? <MonthDetail detail={monthDetail} /> : null}
      <ArtistErasView data={artistEras} plays={analysisPlays} />
      <ArtistObsessions obsessions={artistObsessions} />
      <TrackObsessions obsessions={trackObsessions} />
      <ArtistComebacks comebacks={artistComebacks} />
    </div>
  );
}
