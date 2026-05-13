<script setup lang="ts">
import { computed, ref } from "vue";
import { PARTIES, TOTAL_SEATS, type PartyCode } from "../lib/parties";
import { partyColors } from "../lib/theme";
import { distributeSeats } from "../lib/mandates";
import { latestAverage } from "../lib/pollOfPolls";
import type { Poll } from "../lib/tauri";
import Card from "./Card.vue";
import ArcSeats from "./ArcSeats.vue";

const props = defineProps<{ polls: Poll[]; windowDays: number }>();

const MAJORITY = 175;
const PARTY_ORDER: PartyCode[] = ["V", "S", "MP", "C", "L", "KD", "M", "SD"];

const selected = ref<Set<PartyCode>>(new Set<PartyCode>(["M", "KD", "L", "SD"]));

const seats = computed(() =>
  distributeSeats(latestAverage(props.polls, props.windowDays))
);

interface PartyEntry {
  code: PartyCode;
  name: string;
  color: string;
  seats: number;
  selected: boolean;
  inThreshold: boolean;
}

const partyEntries = computed<PartyEntry[]>(() =>
  PARTIES.map((p) => ({
    code: p.code,
    name: p.name,
    color: partyColors.value[p.code],
    seats: seats.value[p.code] ?? 0,
    selected: selected.value.has(p.code),
    inThreshold: (seats.value[p.code] ?? 0) > 0,
  }))
);

const total = computed(() =>
  partyEntries.value
    .filter((p) => p.selected)
    .reduce((s, p) => s + p.seats, 0)
);

const status = computed(() => {
  const t = total.value;
  if (t >= MAJORITY) {
    return { label: "Majoritet", tone: "ok" as const, detail: `+${t - MAJORITY} över ${MAJORITY}` };
  }
  if (t === 0) {
    return { label: "Tom koalition", tone: "neutral" as const, detail: "Välj minst ett parti" };
  }
  return {
    label: "Saknar majoritet",
    tone: "warn" as const,
    detail: `${MAJORITY - t} mandat ifrån`,
  };
});

const selectedSummary = computed(() => {
  const codes = partyEntries.value.filter((p) => p.selected).map((p) => p.code);
  return codes.length ? codes.join(" + ") : "—";
});

function toggle(code: PartyCode) {
  const next = new Set(selected.value);
  if (next.has(code)) next.delete(code);
  else next.add(code);
  selected.value = next;
}

function setPreset(codes: PartyCode[]) {
  selected.value = new Set(codes);
}

const presets: { label: string; codes: PartyCode[] }[] = [
  { label: "Tidöblocket", codes: ["M", "KD", "L", "SD"] },
  { label: "Rödgröna + C", codes: ["S", "V", "MP", "C"] },
  { label: "Rödgröna", codes: ["S", "V", "MP"] },
  { label: "Mitten", codes: ["S", "M", "C", "L", "KD", "MP"] },
];
</script>

<template>
  <Card title="Koalitionsbyggare" :meta="`majoritet ≥ ${MAJORITY}`">
    <template #actions>
      <div class="presets">
        <button
          v-for="p in presets"
          :key="p.label"
          class="preset"
          @click="setPreset(p.codes)"
        >
          {{ p.label }}
        </button>
        <button class="preset clear" @click="setPreset([])">Rensa</button>
      </div>
    </template>

    <div class="chips">
      <button
        v-for="p in partyEntries"
        :key="p.code"
        class="chip"
        :class="{ active: p.selected, zero: !p.inThreshold }"
        :style="
          p.selected
            ? { borderColor: p.color, background: p.color, color: 'white' }
            : { borderColor: 'var(--border)' }
        "
        @click="toggle(p.code)"
        :title="p.name"
      >
        <span class="dot" :style="{ background: p.color }"></span>
        <span class="code">{{ p.code }}</span>
        <span class="seats num">{{ p.seats }}</span>
      </button>
    </div>

    <div class="body-grid">
      <div class="arc-col">
        <ArcSeats
          :seats="seats"
          :order="PARTY_ORDER"
          :highlighted="selected"
          :center-value="total"
          center-caption="av 349 mandat"
        />
      </div>

      <div class="info-col">
        <div class="status-pill" :class="status.tone">{{ status.label }}</div>
        <div class="detail num">{{ status.detail }}</div>

        <div class="ratio">
          <div class="ratio-track">
            <div
              class="ratio-fill"
              :class="status.tone"
              :style="{ width: Math.min(100, (total / TOTAL_SEATS) * 100) + '%' }"
            ></div>
            <div
              class="ratio-marker"
              :style="{ left: (MAJORITY / TOTAL_SEATS) * 100 + '%' }"
            ></div>
          </div>
          <div class="ratio-scale">
            <span>0</span>
            <span class="m-tag">{{ MAJORITY }}</span>
            <span>{{ TOTAL_SEATS }}</span>
          </div>
        </div>

        <div class="summary">{{ selectedSummary }}</div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.preset {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg-muted);
  padding: 3px 9px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.1s ease;
}
.preset:hover {
  color: var(--fg);
  background: var(--bg-hover);
}
.preset.clear {
  color: var(--fg-subtle);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px 0 16px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px 5px 8px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--fg);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.12s ease;
}
.chip:hover {
  background: var(--bg-hover);
}
.chip.active {
  color: white;
}
.chip.active .dot {
  background: rgba(255, 255, 255, 0.85) !important;
}
.chip.zero {
  opacity: 0.45;
}
.chip .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.chip .seats {
  font-weight: 500;
  color: var(--fg-muted);
  font-size: 11.5px;
  padding-left: 6px;
  margin-left: 2px;
  border-left: 1px solid var(--border);
}
.chip.active .seats {
  color: rgba(255, 255, 255, 0.85);
  border-left-color: rgba(255, 255, 255, 0.3);
}

.body-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(180px, 1fr);
  gap: 20px;
  align-items: center;
}
@media (max-width: 720px) {
  .body-grid {
    grid-template-columns: 1fr;
  }
}
.arc-col {
  min-width: 0;
}
.arc-col :deep(svg) {
  max-width: 360px;
  margin: 0 auto;
}

.info-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.status-pill {
  display: inline-flex;
  align-self: flex-start;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
}
.status-pill.ok {
  background: color-mix(in srgb, var(--success) 15%, transparent);
  color: var(--success);
}
.status-pill.warn {
  background: color-mix(in srgb, var(--warn) 15%, transparent);
  color: var(--warn);
}
.status-pill.neutral {
  background: var(--bg-hover);
  color: var(--fg-muted);
}
.detail {
  color: var(--fg-muted);
  font-size: 12px;
}

.ratio {
  margin-top: 4px;
}
.ratio-track {
  position: relative;
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
}
.ratio-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 4px;
  transition: width 0.2s ease, background 0.2s ease;
}
.ratio-fill.ok {
  background: var(--success);
}
.ratio-fill.warn {
  background: var(--fg);
  opacity: 0.7;
}
.ratio-fill.neutral {
  background: var(--border-strong);
}
.ratio-marker {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  background: var(--danger);
  border-radius: 1px;
}
.ratio-scale {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  margin-top: 5px;
  font-size: 10px;
  color: var(--fg-subtle);
  font-variant-numeric: tabular-nums;
}
.ratio-scale > :nth-child(2) {
  color: var(--danger);
  font-weight: 600;
  text-align: center;
  margin-left: calc((175 / 349 - 0.5) * 100%);
}
.ratio-scale > :nth-child(3) {
  text-align: right;
}

.summary {
  margin-top: auto;
  font-size: 11px;
  color: var(--fg-subtle);
  padding-top: 8px;
  border-top: 1px solid var(--border);
}
</style>
