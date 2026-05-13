import type { PartyCode } from "./parties";

export interface Block {
  id: string;
  name: string;
  parties: PartyCode[];
  colorLight: string;
  colorDark: string;
}

export const BLOCKS: Block[] = [
  {
    id: "tido",
    name: "Tidöblocket (M + KD + L + SD)",
    parties: ["M", "KD", "L", "SD"],
    colorLight: "#1f4e79",
    colorDark: "#7DB8FF",
  },
  {
    id: "rgop",
    name: "Rödgröna + C (S + V + MP + C)",
    parties: ["S", "V", "MP", "C"],
    colorLight: "#c1272d",
    colorDark: "#FB7185",
  },
  {
    id: "rg",
    name: "Rödgröna (S + V + MP)",
    parties: ["S", "V", "MP"],
    colorLight: "#a01c20",
    colorDark: "#F87171",
  },
];
