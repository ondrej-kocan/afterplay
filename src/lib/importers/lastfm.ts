import type { ImportResult, ListeningHistoryImporter } from "@/lib/importers/types";
import { parseCsv } from "@/lib/importers/csv";
import type { Play } from "@/lib/listening/play";

const MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function parseLastFmDate(value: string): Date | null {
  const match = /^(\d{1,2}) ([A-Za-z]{3}) (\d{4}), (\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const [, dayText, monthText, yearText, hourText, minuteText] = match;
  const month = MONTHS[monthText];
  if (month === undefined) return null;

  const day = Number(dayText);
  const year = Number(yearText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const date = new Date(year, month, day, hour, minute, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null;
  }

  return date;
}

function isHeaderRow(row: string[]): boolean {
  if (row.length !== 4) return false;
  const normalized = row.map((value) => value.trim().toLowerCase().replaceAll(/[^a-z]/g, ""));
  return (
    normalized[0] === "artist" &&
    normalized[1] === "album" &&
    normalized[2] === "track" &&
    ["playedat", "timestamp", "date", "datetime"].includes(normalized[3])
  );
}

export class LastFmCsvImporter implements ListeningHistoryImporter {
  readonly source = "lastfm" as const;

  canImport(file: File): boolean {
    return file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
  }

  async import(file: File): Promise<ImportResult> {
    if (!this.canImport(file)) {
      throw new Error("Choose a CSV file to import.");
    }

    const rows = parseCsv(await file.text());
    if (rows.length === 0) {
      throw new Error("The CSV is empty.");
    }

    const startIndex = isHeaderRow(rows[0]) ? 1 : 0;
    const plays: Play[] = [];
    const errors: string[] = [];

    for (let index = startIndex; index < rows.length; index += 1) {
      const row = rows[index];
      const rowNumber = index + 1;

      if (row.length !== 4) {
        errors.push(`Row ${rowNumber} has ${row.length} columns; expected 4.`);
        if (errors.length >= 5) break;
        continue;
      }

      const [artistRaw, albumRaw, trackRaw, playedAtRaw] = row;
      const artist = artistRaw.trim();
      const track = trackRaw.trim();
      const album = albumRaw.trim();
      const playedAt = parseLastFmDate(playedAtRaw);

      if (!artist || !track || !playedAt) {
        errors.push(`Row ${rowNumber} is missing an artist/track or has an invalid timestamp.`);
        if (errors.length >= 5) break;
        continue;
      }

      plays.push({
        artist,
        track,
        album: album || undefined,
        playedAt,
        source: this.source,
      });
    }

    if (errors.length > 0) {
      throw new Error(`This does not look like a supported Last.fm export. ${errors.join(" ")}`);
    }

    if (plays.length === 0) {
      throw new Error("No listening history was found in this CSV.");
    }

    return {
      source: this.source,
      plays,
      warnings: [],
    };
  }
}
