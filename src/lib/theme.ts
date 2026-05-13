import { computed } from "vue";
import { PARTIES, type Party, type PartyCode } from "./parties";
import { BLOCKS, type Block } from "./blocks";
import { isDark } from "./themeMode";

export { isDark };

export function partyColor(p: Party | PartyCode): string {
  const party = typeof p === "string" ? PARTIES.find((x) => x.code === p) : p;
  if (!party) return "#888";
  return isDark.value ? party.colorDark : party.colorLight;
}

export const partyColors = computed(() =>
  Object.fromEntries(
    PARTIES.map((p) => [p.code, isDark.value ? p.colorDark : p.colorLight])
  ) as Record<PartyCode, string>
);

export function blockColor(b: Block): string {
  return isDark.value ? b.colorDark : b.colorLight;
}

export const blockColors = computed(() =>
  Object.fromEntries(
    BLOCKS.map((b) => [b.id, isDark.value ? b.colorDark : b.colorLight])
  )
);
