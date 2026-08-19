import type { Play } from "@/lib/listening/play";

export type ArtistEraMonth = {
  year: number;
  month: number;
  totalPlays: number;
  counts: number[];
  other: number;
};

export type ArtistEras = {
  artists: string[];
  months: ArtistEraMonth[];
};

export function buildArtistEras(plays: Play[], artistLimit = 8): ArtistEras {
  if (plays.length === 0) return { artists: [], months: [] };

  const artistTotals = new Map<string, number>();
  let first = plays[0].playedAt;
  let last = plays[0].playedAt;

  for (const play of plays) {
    artistTotals.set(play.artist, (artistTotals.get(play.artist) ?? 0) + 1);
    if (play.playedAt < first) first = play.playedAt;
    if (play.playedAt > last) last = play.playedAt;
  }

  const artists = [...artistTotals.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, artistLimit)
    .map(([artist]) => artist);

  const artistIndex = new Map(artists.map((artist, index) => [artist, index]));
  const months: ArtistEraMonth[] = [];
  const monthIndex = new Map<string, number>();

  let cursorYear = first.getFullYear();
  let cursorMonth = first.getMonth();
  const lastYear = last.getFullYear();
  const lastMonth = last.getMonth();

  while (cursorYear < lastYear || (cursorYear === lastYear && cursorMonth <= lastMonth)) {
    const key = `${cursorYear}-${cursorMonth}`;
    monthIndex.set(key, months.length);
    months.push({
      year: cursorYear,
      month: cursorMonth,
      totalPlays: 0,
      counts: Array(artists.length).fill(0),
      other: 0,
    });

    cursorMonth += 1;
    if (cursorMonth === 12) {
      cursorMonth = 0;
      cursorYear += 1;
    }
  }

  for (const play of plays) {
    const index = monthIndex.get(`${play.playedAt.getFullYear()}-${play.playedAt.getMonth()}`);
    if (index === undefined) continue;

    const bucket = months[index];
    bucket.totalPlays += 1;
    const trackedIndex = artistIndex.get(play.artist);
    if (trackedIndex === undefined) bucket.other += 1;
    else bucket.counts[trackedIndex] += 1;
  }

  return { artists, months };
}
