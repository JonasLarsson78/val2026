<script setup lang="ts">
import { computed, ref } from "vue";
import { PARTIES, type PartyCode } from "../lib/parties";
import { partyColors } from "../lib/theme";
import { distributeSeats } from "../lib/mandates";
import { latestAverage } from "../lib/pollOfPolls";
import type { Poll } from "../lib/tauri";
import Card from "./Card.vue";
import ArcSeats from "./ArcSeats.vue";

const props = defineProps<{ polls: Poll[]; windowDays: number }>();

const PARTY_ORDER: PartyCode[] = ["V", "S", "MP", "C", "L", "KD", "M", "SD"];
const hovered = ref<PartyCode | null>(null);

const seats = computed(() =>
  distributeSeats(latestAverage(props.polls, props.windowDays))
);

const totalSeats = computed(() =>
  PARTY_ORDER.reduce((s, c) => s + (seats.value[c] ?? 0), 0)
);

const leftSeats = computed(() =>
  ["V", "S", "MP", "C"].reduce((s, c) => s + (seats.value[c as PartyCode] ?? 0), 0)
);
const rightSeats = computed(() =>
  ["L", "KD", "M", "SD"].reduce((s, c) => s + (seats.value[c as PartyCode] ?? 0), 0)
);

const legend = computed(() =>
  PARTY_ORDER.map((code) => ({
    code,
    name: PARTIES.find((p) => p.code === code)?.name ?? code,
    seats: seats.value[code] ?? 0,
    color: partyColors.value[code],
  }))
);

const highlightSet = computed(() =>
  hovered.value ? new Set<PartyCode>([hovered.value]) : null
);
</script>

<template>
  <Card
    title="Riksdagshalvmånen"
    :meta="`${totalSeats} mandat · politisk vänster ← → höger`"
  >
    <div class="arc-wrap">
      <ArcSeats
        :seats="seats"
        :order="PARTY_ORDER"
        :highlighted="highlightSet"
        :center-value="totalSeats"
      />

      <div class="halves">
        <div class="half">
          <span class="half-label">V · S · MP · C</span>
          <span class="half-seats num">{{ leftSeats }}</span>
        </div>
        <div class="half right">
          <span class="half-seats num">{{ rightSeats }}</span>
          <span class="half-label">L · KD · M · SD</span>
        </div>
      </div>
    </div>

    <div class="legend">
      <button
        v-for="p in legend"
        :key="p.code"
        class="leg"
        :class="{ active: hovered === p.code }"
        @mouseenter="hovered = p.code"
        @mouseleave="hovered = null"
        :title="p.name"
      >
        <span class="dot" :style="{ background: p.color }"></span>
        <span class="code">{{ p.code }}</span>
        <span class="seats num">{{ p.seats }}</span>
      </button>
    </div>
  </Card>
</template>

<style scoped>
.arc-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0 4px;
}
.arc-wrap :deep(svg) {
  max-width: 520px;
}
.halves {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 520px;
  margin-top: 4px;
  font-size: 11px;
}
.half {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--fg-muted);
}
.half.right {
  justify-content: flex-end;
}
.half-seats {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
}
.half-label {
  font-weight: 500;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.leg {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: var(--fg);
  transition: all 0.1s ease;
}
.leg:hover,
.leg.active {
  background: var(--bg-hover);
  border-color: var(--border);
}
.leg .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.leg .seats {
  color: var(--fg-muted);
  font-weight: 500;
  font-size: 11.5px;
  padding-left: 6px;
  border-left: 1px solid var(--border);
}
</style>
