<script setup lang="ts">
import { computed } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
} from "echarts/components";
import { PARTIES, TOTAL_SEATS } from "../lib/parties";
import { BLOCKS } from "../lib/blocks";
import { distributeSeats } from "../lib/mandates";
import { latestAverage } from "../lib/pollOfPolls";
import type { Poll } from "../lib/tauri";
import { baseAxis, chartColors, tooltip } from "../lib/chartTheme";
import { blockColor, partyColors } from "../lib/theme";
import Card from "./Card.vue";

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, MarkLineComponent]);

const props = defineProps<{ polls: Poll[]; windowDays: number }>();

const seats = computed(() =>
  distributeSeats(latestAverage(props.polls, props.windowDays))
);

const blockSeats = computed(() =>
  BLOCKS.map((b) => ({
    ...b,
    color: blockColor(b),
    seats: b.parties.reduce((sum, code) => sum + (seats.value[code] ?? 0), 0),
  }))
);

const orderedParties = computed(() =>
  [...PARTIES].sort((a, b) => (seats.value[b.code] ?? 0) - (seats.value[a.code] ?? 0))
);

const option = computed(() => {
  const c = chartColors();
  const _ = partyColors.value;
  return {
    animation: false,
    tooltip: {
      ...tooltip(),
      trigger: "axis",
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        return `<strong>${p.name}</strong> · ${p.value} mandat`;
      },
    },
    grid: { left: 36, right: 40, top: 4, bottom: 4, containLabel: false },
    xAxis: {
      ...baseAxis(),
      type: "value",
      max: 180,
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      ...baseAxis(),
      type: "category",
      data: orderedParties.value.map((p) => p.code),
      splitLine: { show: false },
      axisLabel: { ...baseAxis().axisLabel, fontWeight: 600, color: c.fg },
    },
    series: [
      {
        type: "bar",
        barWidth: 16,
        data: orderedParties.value.map((p) => ({
          value: seats.value[p.code] ?? 0,
          itemStyle: { color: _[p.code], borderRadius: [0, 4, 4, 0] },
        })),
        label: {
          show: true,
          position: "right",
          color: c.fg,
          fontSize: 11.5,
          fontWeight: 600,
        },
        markLine: {
          symbol: "none",
          silent: true,
          lineStyle: { color: c.danger, type: "dashed", width: 1, opacity: 0.6 },
          label: { color: c.subtle, fontSize: 10, formatter: "175" },
          data: [{ xAxis: 175 }],
        },
      },
    ],
  };
});
</script>

<template>
  <Card title="Mandat (simulerat)" :meta="`${TOTAL_SEATS} mandat · jämkad uddatalsmetod`">
    <v-chart :option="option" autoresize style="height: 280px" />
    <div class="blocks">
      <div v-for="b in blockSeats" :key="b.id" class="block">
        <span class="dot" :style="{ background: b.color }"></span>
        <span class="name">{{ b.name.split(" (")[0] }}</span>
        <span class="seats num" :class="{ majority: b.seats >= 175 }">
          {{ b.seats }}
        </span>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.blocks {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.block {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  padding: 5px 4px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.name {
  flex: 1;
  color: var(--fg-muted);
}
.seats {
  font-weight: 600;
  color: var(--fg);
}
.seats.majority {
  color: var(--success);
}
</style>
