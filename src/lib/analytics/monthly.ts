import type { Play } from "@/lib/listening/play";

export type MonthlyListening = {
  year: number;
  month: number;
  plays: number;
};

export function aggregateMonthlyListening(plays: Play[]): MonthlyListening[] {
  if (plays.length === 0) return [];

  const counts = new Map<string, number>();
  let first = plays[0].playedAt;
  let last = plays[0].playedAt;

  for (const play of plays) {
    const year = play.playedAt.getFullYear();
    const month = play.playedAt.getMonth();
    const key = `${year}-${month}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (play.playedAt < first) first = play.playedAt;
    if (play.playedAt > last) last = play.playedAt;
  }

  const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
  const end = new Date(last.getFullYear(), last.getMonth(), 1);
  const result: MonthlyListening[] = [];

  while (cursor <= end) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    result.push({ year, month, plays: counts.get(`${year}-${month}`) ?? 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return result;
}
