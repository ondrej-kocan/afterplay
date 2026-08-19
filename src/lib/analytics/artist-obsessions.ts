import type { Play } from "@/lib/listening/play";

export type ArtistObsession = {
  artist: string;
  year: number;
  month: number;
  plays: number;
  totalPlays: number;
  share: number;
  baselineShare: number;
  lift: number;
  score: number;
};

export function findArtistObsessions(plays: Play[], limit = 8): ArtistObsession[] {
  if (plays.length === 0) return [];

  const artistTotals = new Map<string, number>();
  const monthTotals = new Map<string, number>();
  const monthArtists = new Map<string, Map<string, number>>();

  for (const play of plays) {
    artistTotals.set(play.artist, (artistTotals.get(play.artist) ?? 0) + 1);
    const key = `${play.playedAt.getFullYear()}-${play.playedAt.getMonth()}`;
    monthTotals.set(key, (monthTotals.get(key) ?? 0) + 1);
    const artists = monthArtists.get(key) ?? new Map<string, number>();
    artists.set(play.artist, (artists.get(play.artist) ?? 0) + 1);
    monthArtists.set(key, artists);
  }

  const candidates: ArtistObsession[] = [];
  for (const [key, artists] of monthArtists) {
    const [year, month] = key.split("-").map(Number);
    const totalPlays = monthTotals.get(key) ?? 0;
    if (totalPlays < 40) continue;

    for (const [artist, artistPlays] of artists) {
      if (artistPlays < 15) continue;
      const share = artistPlays / totalPlays;
      if (share < 0.08) continue;

      const baselineShare = (artistTotals.get(artist) ?? 0) / plays.length;
      const lift = baselineShare > 0 ? share / baselineShare : 0;
      if (lift < 2) continue;

      // Reward both concentration and surprise, while dampening tiny samples.
      const score = share * Math.log2(lift + 1) * Math.log10(artistPlays + 10);
      candidates.push({ artist, year, month, plays: artistPlays, totalPlays, share, baselineShare, lift, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score || b.plays - a.plays);

  // Keep the feed varied: one strongest moment per artist for now.
  const seen = new Set<string>();
  const result: ArtistObsession[] = [];
  for (const candidate of candidates) {
    if (seen.has(candidate.artist)) continue;
    seen.add(candidate.artist);
    result.push(candidate);
    if (result.length === limit) break;
  }

  return result;
}
