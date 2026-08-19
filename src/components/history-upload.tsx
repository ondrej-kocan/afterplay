"use client";

import { useRef, useState } from "react";

import { summarizeListeningHistory, type ListeningSummary } from "@/lib/analytics/summary";
import { LastFmCsvImporter } from "@/lib/importers/lastfm";

const importer = new LastFmCsvImporter();
const numberFormatter = new Intl.NumberFormat("en-GB");
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function HistoryUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<ListeningSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const chooseFile = () => inputRef.current?.click();

  const importFile = async (nextFile: File | null) => {
    setFile(nextFile);
    setSummary(null);
    setError(null);

    if (!nextFile) return;

    setIsImporting(true);
    try {
      const result = await importer.import(nextFile);
      setSummary(summarizeListeningHistory(result.plays));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Afterplay could not import this file.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-fuchsia-300">
            Start with your history
          </p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Upload a listening-history CSV</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
            Your file stays in this browser. Afterplay normalizes supported sources into the same listening model before analysis.
          </p>
        </div>

        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => void importFile(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={chooseFile}
            disabled={isImporting}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-fuchsia-100 disabled:cursor-wait disabled:opacity-60"
          >
            {isImporting ? "Reading history…" : summary ? "Choose another CSV" : "Choose CSV"}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-5 text-sm text-zinc-400">
        {file ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-zinc-100">{file.name}</span>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB · {isImporting ? "processing locally" : summary ? "imported locally" : "not imported"}</span>
          </div>
        ) : (
          <span>Last.fm CSV is supported first. More listening-history sources will follow.</span>
        )}
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-4 text-sm leading-6 text-red-100" role="alert">
          <span className="font-semibold">Couldn’t import that file.</span> {error}
        </div>
      ) : null}

      {summary ? <HistorySummary summary={summary} /> : null}
    </section>
  );
}

function HistorySummary({ summary }: { summary: ListeningSummary }) {
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
    </div>
  );
}
