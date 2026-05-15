<script setup lang="ts">
import { computed } from "vue";
import { CalendarDays, Users, Crown, ChartColumn } from "lucide-vue-next";
import { PARTIES } from "../lib/parties";
import { BLOCKS } from "../lib/blocks";
import { distributeSeats } from "../lib/mandates";
import { latestAverage } from "../lib/pollOfPolls";
import type { Poll } from "../lib/tauri";
import { blockColor, partyColor } from "../lib/theme";
import PartyLogo from "./PartyLogo.vue";

const props = defineProps<{ polls: Poll[]; windowDays: number }>();

const ELECTION = new Date("2026-09-13");

const daysToElection = computed(() => {
  const today = new Date();
  const ms = ELECTION.getTime() - today.getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
});

const seats = computed(() =>
  distributeSeats(latestAverage(props.polls, props.windowDays))
);

const blockSeats = computed(() =>
  BLOCKS.map((b) => ({
    ...b,
    color: blockColor(b),
    seats: b.parties.reduce((s, code) => s + (seats.value[code] ?? 0), 0),
  }))
);

const largest = computed(() => {
  const shares = latestAverage(props.polls, props.windowDays);
  const entries = Object.entries(shares) as [string, number][];
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  const [code, pct] = entries[0];
  const party = PARTIES.find((p) => p.code === code);
  return { code, pct, party, color: party ? partyColor(party) : "#888" };
});

const latestDate = computed(() => {
  if (!props.polls.length) return null;
  return props.polls[0].field_end;
});
</script>

<template>
  <div class="strip">
    <div class="kpi">
      <span class="label">
        <CalendarDays :size="12" :stroke-width="2" />
        Val 2026
      </span>
      <span class="value num">{{ daysToElection }}</span>
      <span class="unit">dagar kvar</span>
    </div>

    <div v-for="b in blockSeats" :key="b.id" class="kpi">
      <span class="label">
        <Users :size="12" :stroke-width="2" />
        <span class="dot" :style="{ background: b.color }"></span>
        {{ b.id === "tido" ? "Tidöblocket" : b.id === "rgop" ? "Röd-Grön + C" : "Röd-Grön" }}
      </span>
      <span class="value num" :class="{ majority: b.seats >= 175 }">{{ b.seats }}</span>
      <span class="unit">mandat<span v-if="b.seats >= 175"> · majoritet</span></span>
    </div>

    <div v-if="largest" class="kpi">
      <span class="label">
        <Crown :size="12" :stroke-width="2" />
        Största parti
      </span>
      <div class="value-row">
        <PartyLogo :code="largest.code as any" :size="28" />
        <span class="value num">{{ largest.pct.toFixed(1) }}<span class="pct">%</span></span>
      </div>
      <span class="unit">{{ largest.party?.name ?? largest.code }}</span>
    </div>

    <div class="kpi">
      <span class="label">
        <ChartColumn :size="12" :stroke-width="2" />
        Mätningar
      </span>
      <span class="value num">{{ polls.length }}</span>
      <span class="unit">
        <span v-if="latestDate">senast {{ latestDate }}</span>
        <span v-else>inga än</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.kpi {
  background: var(--bg-elev);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.label {
  font-size: 11.5px;
  color: var(--fg-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 6px;
}
.label :deep(svg) {
  color: var(--fg-subtle);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.value {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.value.majority {
  color: var(--success);
}
.value .pct {
  font-size: 14px;
  font-weight: 500;
  color: var(--fg-muted);
  margin-left: 2px;
}
.unit {
  font-size: 11.5px;
  color: var(--fg-muted);
}
</style>
