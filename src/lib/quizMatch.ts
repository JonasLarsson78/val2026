import { PARTIES, type PartyCode } from "./parties";
import { QUESTIONS, type Position } from "./quiz";

export interface PartyMatch {
  code: PartyCode;
  name: string;
  match: number;
  agreements: number;
}

export function computeMatches(answers: (Position | null)[]): PartyMatch[] {
  const answered = answers
    .map((a, i) => ({ a, q: QUESTIONS[i] }))
    .filter((x): x is { a: Position; q: (typeof QUESTIONS)[number] } => x.a !== null);

  const maxPerQuestion = 4;
  const total = answered.length * maxPerQuestion;

  return PARTIES.map((p) => {
    let distance = 0;
    let agreements = 0;
    for (const { a, q } of answered) {
      const pos = q.positions[p.code];
      distance += Math.abs(a - pos);
      if (Math.sign(a) === Math.sign(pos) && a !== 0) agreements++;
      if (a === 0 && pos === 0) agreements++;
    }
    const match = total === 0 ? 0 : 1 - distance / total;
    return {
      code: p.code,
      name: p.name,
      match: +(match * 100).toFixed(1),
      agreements,
    };
  }).sort((a, b) => b.match - a.match);
}
