import { PARTIES, THRESHOLD_PCT, type PartyCode } from "./parties";
import type { Poll } from "./tauri";
import { latestAverage } from "./pollOfPolls";

const RISK_WINDOW = 20;
const WATCH_THRESHOLD = 6.0;

export type RiskLevel = "danger" | "warn" | "watch" | "safe";

export interface PartyRisk {
  code: PartyCode;
  name: string;
  current: number;
  marginToThreshold: number;
  recent: Array<{ date: string; pct: number }>;
  belowThresholdCount: number;
  level: RiskLevel;
}

export function classify(current: number): RiskLevel {
  if (current < THRESHOLD_PCT) return "danger";
  if (current < THRESHOLD_PCT + 1) return "warn";
  if (current < WATCH_THRESHOLD) return "watch";
  return "safe";
}

export function computeRisk(polls: Poll[], windowDays: number): PartyRisk[] {
  const avg = latestAverage(polls, windowDays);
  const sorted = [...polls].sort((a, b) => b.field_end.localeCompare(a.field_end));

  return PARTIES.map((p) => {
    const current = avg[p.code] ?? 0;
    const recent = sorted
      .map((poll) => {
        const r = poll.results.find((x) => x.party === p.code);
        return r ? { date: poll.field_end, pct: r.percent } : null;
      })
      .filter((x): x is { date: string; pct: number } => x !== null)
      .slice(0, RISK_WINDOW)
      .reverse();

    const belowThresholdCount = recent.filter((r) => r.pct < THRESHOLD_PCT).length;

    return {
      code: p.code,
      name: p.name,
      current: +current.toFixed(2),
      marginToThreshold: +(current - THRESHOLD_PCT).toFixed(2),
      recent,
      belowThresholdCount,
      level: classify(current),
    };
  });
}

export function atRisk(parties: PartyRisk[]): PartyRisk[] {
  return parties
    .filter((p) => p.level !== "safe")
    .sort((a, b) => a.current - b.current);
}
