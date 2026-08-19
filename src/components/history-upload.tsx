"use client";

import { useRef, useState } from "react";

export function HistoryUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const chooseFile = () => inputRef.current?.click();

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-fuchsia-300">
            Start with your history
          </p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Upload a listening-history CSV</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
            Your file stays in this browser. Afterplay will normalize every supported source into the same listening model before analysis.
          </p>
        </div>

        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={chooseFile}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-fuchsia-100"
          >
            Choose CSV
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-5 text-sm text-zinc-400">
        {file ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-zinc-100">{file.name}</span>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB · ready for importer</span>
          </div>
        ) : (
          <span>No file selected yet. Last.fm CSV support is the first importer we’ll add.</span>
        )}
      </div>
    </section>
  );
}
