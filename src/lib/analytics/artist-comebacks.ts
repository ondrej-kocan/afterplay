import type { Play } from "@/lib/listening/play";

export type ArtistComeback = {
  artist: string;
  returnYear: number;
  returnMonth: number;
  previousYear: number;
  previousMonth: number;
  gapMonths: number;
  returnPlays: number;
  returnShare: number;
  score: number;
};

export function findArtistComebacks(plays: Play[], limit = 8): ArtistComeback[] {
  if (plays.length === 0) return [];

  const monthTotals = new Map<string, number>();
  const artistMonths = new Map<string, Map<number, number>>();

  let first = plays[0].playedAt;
  let last = plays[0].playedAt;
  for (const play of plays) {
    if (play.playedAt < first) first = play.playedAt;
    if (play.playedAt > last) last = play.playedAt;
  }

  const firstIndex = first.getFullYear() * 12 + first.getMonth();

  for (const play of plays) {
    const monthIndex = play.playedAt.getFullYear() * 12 + play.playedAt.getMonth();
    const key = `${play.playedAt.getFullYear()}-${play.playedAt.getMonth()}`;
    monthTotals.set(key, (monthTotals.get(key) ?? 0) + 1);

    const months = artistMonths.get(play.artist) ?? new Map<number, number>();
    months.set(monthIndex, (months.get(monthIndex) ?? 0) + 1);
    artistMonths.set(play.artist, months);
  }

  const candidates: ArtistComeback[] = [];

  for (const [artist, monthsMap] of artistMonths) {
    const activeMonths = [...monthsMap.entries()].sort((a, b) => a[0] - b[0]);
    if (activeMonths.length < 3) continue;

    for (let i = 1; i < activeMonths.length; i += 1) {
      const [currentIndex, returnPlays] = activeMonths[i];
      const [previousIndex, previousPlays] = activeMonths[i - 1];
      const gapMonths = currentIndex - previousIndex - 1;
      if (gapMonths < 12) continue;
      if (previousPlays < 8 || returnPlays < 15) continue;

      // Make sure the artist had meaningful history before disappearing, not just one stray play.
      const priorPlays = activeMonths.slice(0, i).reduce((sum, [, count]) => sum + count, 0);
      if (priorPlays < 30) continue;

      const returnYear = Math.floor(currentIndex / 12);
      const returnMonth = currentIndex % 12;
      const previousYear = Math.floor(previousIndex / 12);
      const previousMonth = previousIndex % 12;
      const totalPlays = monthTotals.get(`${returnYear}-${returnMonth}`) ?? 1;
      const returnShare = returnPlays / totalPlays;
      if (returnShare < 0.03) continue;

      const historyAgeMonths = Math.max(currentIndex - firstIndex, 1);
      const gapWeight = Math.log2(gapMonths + 1);
      const intensityWeight = Math.log10(returnPlays + 10);
      const shareWeight = Math.sqrt(returnShare);
      const ageWeight = Math.min(historyAgeMonths / 24, 1);
      const score = gapWeight * intensityWeight * shareWeight * ageWeight;

      candidates.push({
        artist,
        returnYear,
        returnMonth,
        previousYear,
        previousMonth,
        gapMonths,
        returnPlays,
        returnShare,
        score,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score || b.gapMonths - a.gapMonths || b.returnPlays - a.returnPlays);

  const seen = new Set<string>();
  const result: ArtistComeback[] = [];
  for (const candidate of candidates) {
    if (seen.has(candidate.artist)) continue;
    seen.add(candidate.artist);
    result.push(candidate);
    if (result.length === limit) break;
  }

  return result;
}
