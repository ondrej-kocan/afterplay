export type ListeningSource = "lastfm" | "spotify" | "apple-music" | "unknown";

export type Play = {
  playedAt: Date;
  artist: string;
  track: string;
  album?: string;
  source: ListeningSource;
};
