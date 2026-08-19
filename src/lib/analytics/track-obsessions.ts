import type { Play } from "@/lib/listening/play";

export type TrackObsession = {
  artist: string;
  track: string;
  start: Date;
  end: Date;
  days: number;
  plays: number;
  totalPlays: number;
  share: number;
  baselineShare: number;
  lift: number;
  score: number;
};

type WindowSize = 7 | 14 | 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export function findTrackObsessions(plays: Play[], limit = 8): TrackObsession[] {
  if (plays.length === 0) return [];

  const sorted = [...plays].sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
  const trackTotals = new Map<string, number>();
  const trackMeta = new Map<string, { artist: string; track: string }>();

  for (const play of sorted) {
    const key = trackKey(play);
    trackTotals.set(key, (trackTotals.get(key) ?? 0) + 1);
    trackMeta.set(key, { artist: play.artist, track: play.track });
  }

  const candidates: TrackObsession[] = [];
  for (const days of [7, 14, 30] as WindowSize[]) {
    candidates.push(...scanWindow(sorted, trackTotals, trackMeta, days));
  }

  candidates.sort((a, b) => b.score - a.score || b.plays - a.plays);

  const seen = new Set<string>();
  const result: TrackObsession[] = [];
  for (const candidate of candidates) {
    const key = `${candidate.artist}\u0000${candidate.track}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(candidate);
    if (result.length === limit) break;
  }

  return result;
}

function scanWindow(
  plays: Play[],
  trackTotals: Map<string, number>,
  trackMeta: Map<string, { artist: string; track: string }>,
  days: WindowSize,
): TrackObsession[] {
  const windowMs = days * DAY_MS;
  const counts = new Map<string, number>();
  const candidates: TrackObsession[] = [];
  let left = 0;

  for (let right = 0; right < plays.length; right += 1) {
    const current = plays[right];
    const currentTime = current.playedAt.getTime();
    const key = trackKey(current);
    counts.set(key, (counts.get(key) ?? 0) + 1);

    while (left <= right && currentTime - plays[left].playedAt.getTime() >= windowMs) {
      const leftKey = trackKey(plays[left]);
      const next = (counts.get(leftKey) ?? 1) - 1;
      if (next <= 0) counts.delete(leftKey);
      else counts.set(leftKey, next);
      left += 1;
    }

    const totalPlays = right - left + 1;
    if (totalPlays < 25) continue;

    const trackPlays = counts.get(key) ?? 0;
    const minimumPlays = days === 7 ? 8 : days === 14 ? 12 : 16;
    if (trackPlays < minimumPlays) continue;

    const share = trackPlays / totalPlays;
    if (share < 0.025) continue;

    const baselineShare = (trackTotals.get(key) ?? 0) / plays.length;
    const lift = baselineShare > 0 ? share / baselineShare : 0;
    if (lift < 3) continue;

    const score = share * Math.log2(lift + 1) * Math.log10(trackPlays + 10) * (days === 7 ? 1.15 : days === 14 ? 1.08 : 1);
    const meta = trackMeta.get(key);
    if (!meta) continue;

    candidates.push({
      ...meta,
      start: plays[left].playedAt,
      end: current.playedAt,
      days,
      plays: trackPlays,
      totalPlays,
      share,
      baselineShare,
      lift,
      score,
    });
  }

  return candidates;
}

function trackKey(play: Play): string {
  return `${play.artist}\u0000${play.track}`;
}
