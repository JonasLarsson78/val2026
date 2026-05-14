import type { PartyCode } from "./parties";

export type Position = -2 | -1 | 0 | 1 | 2;

export interface Question {
  id: string;
  topic: string;
  statement: string;
  positions: Record<PartyCode, Position>;
}

export const SCALE: { value: Position; label: string; short: string }[] = [
  { value: -2, label: "Helt emot",     short: "−−" },
  { value: -1, label: "Delvis emot",   short: "−" },
  { value:  0, label: "Neutral",       short: "0" },
  { value:  1, label: "Delvis för",    short: "+" },
  { value:  2, label: "Helt för",      short: "++" },
];

export const QUESTIONS: Question[] = [
  {
    id: "forsvar",
    topic: "Försvar",
    statement: "Sverige ska öka försvarsutgifterna kraftigt.",
    positions: { V: -1, S:  1, MP: -1, C:  2, L:  2, KD:  2, M:  2, SD:  2 },
  },
  {
    id: "vinst-friskolor",
    topic: "Skola",
    statement: "Friskolor ska få dela ut vinst till sina ägare.",
    positions: { V: -2, S: -2, MP: -2, C:  2, L:  1, KD:  1, M:  2, SD: -1 },
  },
  {
    id: "migration",
    topic: "Migration",
    statement: "Sverige ska minska asylinvandringen.",
    positions: { V: -2, S:  1, MP: -2, C:  0, L:  1, KD:  2, M:  2, SD:  2 },
  },
  {
    id: "karnkraft",
    topic: "Energi",
    statement: "Sverige ska bygga ut kärnkraften med nya reaktorer.",
    positions: { V: -2, S:  0, MP: -2, C: -1, L:  1, KD:  2, M:  2, SD:  2 },
  },
  {
    id: "klimat",
    topic: "Klimat",
    statement: "Klimatet är viktigare än ekonomisk tillväxt.",
    positions: { V:  2, S:  1, MP:  2, C:  0, L:  0, KD: -1, M: -1, SD: -2 },
  },
  {
    id: "hog-skatt",
    topic: "Skatt",
    statement: "Höga inkomster ska beskattas hårdare.",
    positions: { V:  2, S:  1, MP:  1, C: -1, L: -1, KD: -1, M: -2, SD:  0 },
  },
  {
    id: "vinster-valfard",
    topic: "Välfärd",
    statement: "Vinster i välfärden ska förbjudas.",
    positions: { V:  2, S:  1, MP:  1, C: -2, L: -1, KD:  0, M: -2, SD:  0 },
  },
  {
    id: "straff",
    topic: "Brott",
    statement: "Straffen för grova brott ska skärpas.",
    positions: { V: -1, S:  1, MP: -1, C:  0, L:  1, KD:  2, M:  2, SD:  2 },
  },
  {
    id: "eu",
    topic: "EU",
    statement: "Sverige ska driva på för mer EU-samarbete.",
    positions: { V: -2, S:  0, MP:  1, C:  1, L:  2, KD: -1, M:  1, SD: -2 },
  },
  {
    id: "bidrag",
    topic: "Bidrag",
    statement: "Statliga bidrag till individer ska sänkas.",
    positions: { V: -2, S: -1, MP: -1, C:  1, L:  1, KD:  1, M:  2, SD:  0 },
  },
];
