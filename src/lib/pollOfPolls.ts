import type { Poll } from "./tauri";
import type { PartyShare } from "./mandates";
import type { PartyCode } from "./parties";

export interface AveragePoint {
  date: string;
  shares: PartyShare;
  windowSize: number;
}

export function rollingAverage(
  polls: Poll[],
  windowDays: number = 30
): AveragePoint[] {
  const sorted = [...polls].sort((a, b) =>
    a.field_end.localeCompare(b.field_end)
  );
  const result: AveragePoint[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const anchor = new Date(sorted[i].field_end);
    const cutoff = new Date(anchor);
    cutoff.setDate(cutoff.getDate() - windowDays);
    const window = sorted.filter((p) => {
      const d = new Date(p.field_end);
      return d <= anchor && d >= cutoff;
    });
    if (window.length === 0) continue;
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    for (const poll of window) {
      for (const r of poll.results) {
        sums[r.party] = (sums[r.party] ?? 0) + r.percent;
        counts[r.party] = (counts[r.party] ?? 0) + 1;
      }
    }
    const shares: PartyShare = {};
    for (const code of Object.keys(sums)) {
      shares[code as PartyCode] = sums[code] / counts[code];
    }
    result.push({
      date: sorted[i].field_end,
      shares,
      windowSize: window.length,
    });
  }
  return result;
}

export function latestAverage(
  polls: Poll[],
  windowDays: number = 30
): PartyShare {
  const points = rollingAverage(polls, windowDays);
  return points.length ? points[points.length - 1].shares : {};
}
