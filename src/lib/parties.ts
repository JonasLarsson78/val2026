export type PartyCode = "S" | "M" | "SD" | "V" | "C" | "KD" | "MP" | "L";

export interface Party {
  code: PartyCode;
  name: string;
  colorLight: string;
  colorDark: string;
}

export const PARTIES: Party[] = [
  { code: "S",  name: "Socialdemokraterna",  colorLight: "#E8112D", colorDark: "#FF4D63" },
  { code: "M",  name: "Moderaterna",         colorLight: "#52BDEC", colorDark: "#7DD3FC" },
  { code: "SD", name: "Sverigedemokraterna", colorLight: "#C6B600", colorDark: "#EAE234" },
  { code: "V",  name: "Vänsterpartiet",      colorLight: "#AF0000", colorDark: "#F87171" },
  { code: "C",  name: "Centerpartiet",       colorLight: "#009933", colorDark: "#34D399" },
  { code: "KD", name: "Kristdemokraterna",   colorLight: "#000077", colorDark: "#818CF8" },
  { code: "MP", name: "Miljöpartiet",        colorLight: "#83CF39", colorDark: "#A3E635" },
  { code: "L",  name: "Liberalerna",         colorLight: "#006AB3", colorDark: "#60A5FA" },
];

export const PARTY_BY_CODE: Record<PartyCode, Party> = Object.fromEntries(
  PARTIES.map((p) => [p.code, p])
) as Record<PartyCode, Party>;

export const THRESHOLD_PCT = 4.0;
export const TOTAL_SEATS = 349;
