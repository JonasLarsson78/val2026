<script setup lang="ts">
import { computed } from "vue";
import { PARTIES, type PartyCode } from "../lib/parties";
import { partyColors } from "../lib/theme";
import { latestAverage } from "../lib/pollOfPolls";
import { ELECTION_2022 } from "../lib/elections";
import type { Poll } from "../lib/tauri";
import Card from "./Card.vue";
import PartyLogo from "./PartyLogo.vue";

const props = defineProps<{ polls: Poll[]; windowDays: number }>();

const rows = computed(() => {
  const cur = latestAverage(props.polls, props.windowDays);
  const items = PARTIES.map((p) => {
    const baseline = ELECTION_2022[p.code];
    const current = cur[p.code] ?? 0;
    const delta = +(current - baseline).toFixed(1);
    return {
      code: p.code as PartyCode,
      name: p.name,
      baseline,
      current: +current.toFixed(1),
      delta,
      color: partyColors.value[p.code],
    };
  });
  items.sort((a, b) => b.delta - a.delta);
  return items;
});

const maxAbs = computed(() =>
  Math.max(2, ...rows.value.map((r) => Math.abs(r.delta)))
);

function barWidth(d: number) {
  return (Math.abs(d) / maxAbs.value) * 50;
}
</script>

<template>
  <Card title="Förändring sedan valet 2022" meta="procentenheter">
    <div class="rows">
      <div v-for="r in rows" :key="r.code" class="row" :title="r.name">
        <PartyLogo :code="r.code" :size="20" />
        <span class="baseline num">{{ r.baseline.toFixed(1) }}</span>
        <span class="arrow">→</span>
        <span class="current num">{{ r.current.toFixed(1) }}</span>

        <div class="track">
          <div class="zero"></div>
          <div
            v-if="r.delta < 0"
            class="bar neg"
            :style="{ width: barWidth(r.delta) + '%', right: '50%' }"
          ></div>
          <div
            v-else
            class="bar pos"
            :style="{ width: barWidth(r.delta) + '%', left: '50%' }"
          ></div>
        </div>

        <span class="delta num" :class="{ up: r.delta > 0, down: r.delta < 0 }">
          {{ r.delta > 0 ? "+" : "" }}{{ r.delta.toFixed(1) }}
        </span>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.rows {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.row {
  display: grid;
  grid-template-columns: 24px 44px 14px 44px 1fr 50px;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}
.row:last-child {
  border-bottom: none;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.code {
  font-weight: 600;
  color: var(--fg);
}
.baseline {
  color: var(--fg-muted);
  text-align: right;
}
.arrow {
  color: var(--fg-subtle);
  text-align: center;
}
.current {
  color: var(--fg);
  font-weight: 600;
  text-align: right;
}
.track {
  position: relative;
  height: 10px;
  background: var(--bg-hover);
  border-radius: 3px;
  margin: 0 4px;
}
.zero {
  position: absolute;
  top: -2px;
  bottom: -2px;
  left: calc(50% - 0.5px);
  width: 1px;
  background: var(--border-strong);
}
.bar {
  position: absolute;
  top: 1px;
  bottom: 1px;
  border-radius: 2px;
}
.bar.pos {
  background: var(--success);
}
.bar.neg {
  background: var(--danger);
}
.delta {
  text-align: right;
  font-weight: 600;
  color: var(--fg-muted);
}
.delta.up {
  color: var(--success);
}
.delta.down {
  color: var(--danger);
}
</style>
