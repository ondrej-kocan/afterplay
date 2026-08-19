import type { Play } from "@/lib/listening/play";

export type RankedArtist = {
  artist: string;
  plays: number;
};

export type RankedTrack = {
  artist: string;
  track: string;
  plays: number;
};

export type MonthDetail = {
  year: number;
  month: number;
  totalPlays: number;
  topArtists: RankedArtist[];
  topTracks: RankedTrack[];
};

export function summarizeMonth(
  plays: Play[],
  year: number,
  month: number,
  limit = 5,
): MonthDetail {
  const artists = new Map<string, number>();
  const tracks = new Map<string, RankedTrack>();
  let totalPlays = 0;

  for (const play of plays) {
    if (play.playedAt.getFullYear() !== year || play.playedAt.getMonth() !== month) continue;

    totalPlays += 1;
    artists.set(play.artist, (artists.get(play.artist) ?? 0) + 1);

    const trackKey = `${play.artist}\u0000${play.track}`;
    const existing = tracks.get(trackKey);
    if (existing) {
      existing.plays += 1;
    } else {
      tracks.set(trackKey, { artist: play.artist, track: play.track, plays: 1 });
    }
  }

  const topArtists = [...artists.entries()]
    .map(([artist, artistPlays]) => ({ artist, plays: artistPlays }))
    .sort((a, b) => b.plays - a.plays || a.artist.localeCompare(b.artist))
    .slice(0, limit);

  const topTracks = [...tracks.values()]
    .sort(
      (a, b) =>
        b.plays - a.plays ||
        a.artist.localeCompare(b.artist) ||
        a.track.localeCompare(b.track),
    )
    .slice(0, limit);

  return { year, month, totalPlays, topArtists, topTracks };
}
