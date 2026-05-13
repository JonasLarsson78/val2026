import { PARTIES, THRESHOLD_PCT, TOTAL_SEATS, type PartyCode } from "./parties";

export type PartyShare = Partial<Record<PartyCode, number>>;

export function distributeSeats(
  shares: PartyShare,
  totalSeats: number = TOTAL_SEATS,
  threshold: number = THRESHOLD_PCT
): Record<PartyCode, number> {
  const seats: Record<PartyCode, number> = Object.fromEntries(
    PARTIES.map((p) => [p.code, 0])
  ) as Record<PartyCode, number>;

  const eligible = PARTIES.filter(
    (p) => (shares[p.code] ?? 0) >= threshold
  ).map((p) => p.code);

  if (eligible.length === 0) return seats;

  for (let i = 0; i < totalSeats; i++) {
    let bestParty: PartyCode | null = null;
    let bestQuotient = -Infinity;
    for (const code of eligible) {
      const votes = shares[code] ?? 0;
      const divisor = seats[code] === 0 ? 1.4 : 2 * seats[code] + 1;
      const q = votes / divisor;
      if (q > bestQuotient) {
        bestQuotient = q;
        bestParty = code;
      }
    }
    if (bestParty) seats[bestParty] += 1;
  }

  return seats;
}
