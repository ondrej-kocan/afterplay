import type { Play } from "@/lib/listening/play";

export type ListeningSummary = {
  totalPlays: number;
  uniqueArtists: number;
  uniqueTracks: number;
  uniqueAlbums: number;
  firstPlay: Date;
  lastPlay: Date;
};

export function summarizeListeningHistory(plays: Play[]): ListeningSummary {
  if (plays.length === 0) {
    throw new Error("Cannot summarize an empty listening history.");
  }

  const artists = new Set<string>();
  const tracks = new Set<string>();
  const albums = new Set<string>();
  let firstPlay = plays[0].playedAt;
  let lastPlay = plays[0].playedAt;

  for (const play of plays) {
    artists.add(play.artist);
    tracks.add(`${play.artist}\u0000${play.track}`);
    if (play.album) albums.add(`${play.artist}\u0000${play.album}`);

    if (play.playedAt < firstPlay) firstPlay = play.playedAt;
    if (play.playedAt > lastPlay) lastPlay = play.playedAt;
  }

  return {
    totalPlays: plays.length,
    uniqueArtists: artists.size,
    uniqueTracks: tracks.size,
    uniqueAlbums: albums.size,
    firstPlay,
    lastPlay,
  };
}
