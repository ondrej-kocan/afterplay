import type { Play } from "@/lib/listening/play";

export type MonthPoint = {
  year: number;
  month: number;
};

export type ExcludedPeriod = {
  start: MonthPoint;
  end: MonthPoint;
};

function monthValue(point: MonthPoint) {
  return point.year * 12 + point.month;
}

export function normalizePeriod(a: MonthPoint, b: MonthPoint): ExcludedPeriod {
  return monthValue(a) <= monthValue(b) ? { start: a, end: b } : { start: b, end: a };
}

export function isMonthInPeriod(point: MonthPoint, period: ExcludedPeriod) {
  const value = monthValue(point);
  return value >= monthValue(period.start) && value <= monthValue(period.end);
}

export function filterExcludedPlays(plays: Play[], periods: ExcludedPeriod[]): Play[] {
  if (periods.length === 0) return plays;

  return plays.filter((play) => {
    const point = { year: play.playedAt.getFullYear(), month: play.playedAt.getMonth() };
    return !periods.some((period) => isMonthInPeriod(point, period));
  });
}

export function mergeExcludedPeriods(periods: ExcludedPeriod[]): ExcludedPeriod[] {
  if (periods.length <= 1) return periods;

  const sorted = [...periods]
    .map((period) => normalizePeriod(period.start, period.end))
    .sort((a, b) => monthValue(a.start) - monthValue(b.start));

  const merged: ExcludedPeriod[] = [sorted[0]];
  for (const period of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (monthValue(period.start) <= monthValue(last.end) + 1) {
      if (monthValue(period.end) > monthValue(last.end)) last.end = period.end;
    } else {
      merged.push(period);
    }
  }
  return merged;
}
