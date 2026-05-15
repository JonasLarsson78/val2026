import S from "../assets/parties/S.svg";
import M from "../assets/parties/M.svg";
import SD from "../assets/parties/SD.svg";
import V from "../assets/parties/V.svg";
import C from "../assets/parties/C.svg";
import KD from "../assets/parties/KD.svg";
import MP from "../assets/parties/MP.svg";
import L from "../assets/parties/L.svg";
import type { PartyCode } from "./parties";

export const PARTY_LOGOS: Record<PartyCode, string> = { S, M, SD, V, C, KD, MP, L };

export function richPartyLabel(size = 22) {
  const rich: Record<string, unknown> = {};
  for (const code of Object.keys(PARTY_LOGOS) as PartyCode[]) {
    rich[code] = {
      backgroundColor: { image: PARTY_LOGOS[code] },
      width: size,
      height: size,
    };
  }
  return {
    formatter: (val: string) => `{${val}|}`,
    rich,
  };
}

export function partyLegendIcons() {
  const out: Record<PartyCode, string> = {} as Record<PartyCode, string>;
  for (const code of Object.keys(PARTY_LOGOS) as PartyCode[]) {
    out[code] = `image://${PARTY_LOGOS[code]}`;
  }
  return out;
}
