import type { PartyCode } from "./parties";

export const ELECTION_2022: Record<PartyCode, number> = {
  S: 30.33,
  M: 19.10,
  SD: 20.54,
  V: 6.75,
  C: 6.71,
  KD: 5.34,
  MP: 5.08,
  L: 4.61,
};

export const ELECTION_2022_DATE = "2022-09-11";

export function deltaVs2022(code: PartyCode, current: number): number {
  return +(current - ELECTION_2022[code]).toFixed(1);
}
