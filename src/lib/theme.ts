import { ref, computed } from "vue";
import { PARTIES, type Party, type PartyCode } from "./parties";
import { BLOCKS, type Block } from "./blocks";

const matcher =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

const isDarkRef = ref(matcher?.matches ?? false);

if (matcher) {
  matcher.addEventListener("change", (e) => {
    isDarkRef.value = e.matches;
  });
}

export const isDark = computed(() => isDarkRef.value);

export function partyColor(p: Party | PartyCode): string {
  const party = typeof p === "string" ? PARTIES.find((x) => x.code === p) : p;
  if (!party) return "#888";
  return isDarkRef.value ? party.colorDark : party.colorLight;
}

export const partyColors = computed(() =>
  Object.fromEntries(
    PARTIES.map((p) => [p.code, isDarkRef.value ? p.colorDark : p.colorLight])
  ) as Record<PartyCode, string>
);

export function blockColor(b: Block): string {
  return isDarkRef.value ? b.colorDark : b.colorLight;
}

export const blockColors = computed(() =>
  Object.fromEntries(
    BLOCKS.map((b) => [b.id, isDarkRef.value ? b.colorDark : b.colorLight])
  )
);
