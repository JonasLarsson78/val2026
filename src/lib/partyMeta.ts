import type { PartyCode } from "./parties";

export interface PartyMeta {
  code: PartyCode;
  leader: string;
  leaderRole?: string;
  founded: number;
  homepage: string;
  ideology: string;
  description: string;
}

export const PARTY_META: Record<PartyCode, PartyMeta> = {
  S: {
    code: "S",
    leader: "Magdalena Andersson",
    leaderRole: "Partiordförande",
    founded: 1889,
    homepage: "https://www.socialdemokraterna.se",
    ideology: "Socialdemokrati",
    description:
      "Sveriges största parti historiskt sett. Värnar välfärdsstaten, full sysselsättning och en stark offentlig sektor.",
  },
  M: {
    code: "M",
    leader: "Ulf Kristersson",
    leaderRole: "Statsminister",
    founded: 1904,
    homepage: "https://moderaterna.se",
    ideology: "Konservativ liberalism",
    description:
      "Center-höger med fokus på företagande, sänkta skatter och lag och ordning. Leder Tidöregeringen.",
  },
  SD: {
    code: "SD",
    leader: "Jimmie Åkesson",
    leaderRole: "Partiledare",
    founded: 1988,
    homepage: "https://sd.se",
    ideology: "Socialkonservatism, nationalism",
    description:
      "Stramare migrationspolitik, hårdare brottsbekämpning. Stödparti till Tidöregeringen via Tidöavtalet.",
  },
  V: {
    code: "V",
    leader: "Nooshi Dadgostar",
    leaderRole: "Partiledare",
    founded: 1917,
    homepage: "https://www.vansterpartiet.se",
    ideology: "Socialism, feminism",
    description:
      "Vill begränsa vinster i välfärden, höja skatten på de rika och stärka arbetstagarnas rättigheter.",
  },
  C: {
    code: "C",
    leader: "Muharrem Demirok",
    leaderRole: "Partiledare",
    founded: 1913,
    homepage: "https://www.centerpartiet.se",
    ideology: "Socialliberalism, decentralism",
    description:
      "Liberal mittenpolitik med stark förankring på landsbygden. Värnar småföretagande och miljö.",
  },
  KD: {
    code: "KD",
    leader: "Ebba Busch",
    leaderRole: "Energi- och näringsminister",
    founded: 1964,
    homepage: "https://kristdemokraterna.se",
    ideology: "Kristdemokrati, värdekonservatism",
    description:
      "Familjepolitik, äldreomsorg och kristna värderingar. Ingår i Tidöregeringen.",
  },
  MP: {
    code: "MP",
    leader: "Daniel Helldén & Amanda Lind",
    leaderRole: "Språkrör",
    founded: 1981,
    homepage: "https://www.mp.se",
    ideology: "Grön politik, ekologism",
    description:
      "Klimatfrågan i centrum. Vill snabba på den gröna omställningen och minska utsläppen.",
  },
  L: {
    code: "L",
    leader: "Johan Pehrson",
    leaderRole: "Arbetsmarknads- och integrationsminister",
    founded: 1934,
    homepage: "https://www.liberalerna.se",
    ideology: "Socialliberalism",
    description:
      "Skolan i fokus, EU-vänlig liberalism. Mindre partner i Tidöregeringen.",
  },
};
