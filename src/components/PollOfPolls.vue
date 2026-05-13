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
import { PARTIES, THRESHOLD_PCT } from "../lib/parties";
import type { Poll } from "../lib/tauri";
import { latestAverage } from "../lib/pollOfPolls";
import { baseAxis, chartColors, tooltip } from "../lib/chartTheme";
import { partyColors } from "../lib/theme";
import { ELECTION_2022 } from "../lib/elections";
import Card from "./Card.vue";

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, MarkLineComponent]);

const props = defineProps<{ polls: Poll[]; windowDays: number }>();

const shares = computed(() => latestAverage(props.polls, props.windowDays));
const sortedParties = computed(() =>
  [...PARTIES].sort(
    (a, b) => (shares.value[b.code] ?? 0) - (shares.value[a.code] ?? 0)
  )
);

const option = computed(() => {
  const c = chartColors();
  const _ = partyColors.value;
  const success = getComputedStyle(document.documentElement)
    .getPropertyValue("--success")
    .trim() || "#16a34a";
  const danger = c.danger;
  return {
    animation: false,
    tooltip: {
      ...tooltip(),
      trigger: "axis",
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        const code = p.name as keyof typeof ELECTION_2022;
        const cur = p.value as number;
        const base = ELECTION_2022[code];
        const delta = +(cur - base).toFixed(1);
        const sign = delta >= 0 ? "+" : "";
        return `<strong>${code}</strong> · ${cur.toFixed(1)}%<br>2022: ${base.toFixed(2)}% (${sign}${delta.toFixed(1)})`;
      },
    },
    grid: { left: 36, right: 80, top: 4, bottom: 4, containLabel: false },
    xAxis: {
      ...baseAxis(),
      type: "value",
      max: (val: { max: number }) => Math.max(40, Math.ceil(val.max + 4)),
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      ...baseAxis(),
      type: "category",
      data: sortedParties.value.map((p) => p.code),
      splitLine: { show: false },
      axisLabel: { ...baseAxis().axisLabel, fontWeight: 600, color: c.fg },
    },
    series: [
      {
        type: "bar",
        barWidth: 16,
        data: sortedParties.value.map((p) => ({
          value: shares.value[p.code] ?? 0,
          itemStyle: { color: _[p.code], borderRadius: [0, 4, 4, 0] },
        })),
        label: {
          show: true,
          position: "right",
          formatter: (params: any) => {
            const code = params.name as keyof typeof ELECTION_2022;
            const v = params.value as number;
            const delta = +(v - ELECTION_2022[code]).toFixed(1);
            const sign = delta >= 0 ? "+" : "";
            const tag = delta >= 0 ? "up" : "down";
            return `{v|${v.toFixed(1)}%}  {${tag}|${sign}${delta.toFixed(1)}}`;
          },
          rich: {
            v: { color: c.fg, fontSize: 11.5, fontWeight: 600 },
            up: { color: success, fontSize: 10.5, fontWeight: 600 },
            down: { color: danger, fontSize: 10.5, fontWeight: 600 },
          },
        },
        markLine: {
          symbol: "none",
          silent: true,
          lineStyle: { color: c.borderStrong, type: "dashed", width: 1 },
          label: { color: c.subtle, fontSize: 10, formatter: "4%" },
          data: [{ xAxis: THRESHOLD_PCT }],
        },
      },
      {
        type: "scatter",
        symbol: "rect",
        symbolSize: [2, 16],
        silent: true,
        z: 5,
        data: sortedParties.value.map((p) => [ELECTION_2022[p.code], p.code]),
        itemStyle: { color: c.fg, opacity: 0.55 },
        tooltip: { show: false },
      },
    ],
  };
});
</script>

<template>
  <Card title="Poll of polls" :meta="`${windowDays}d snitt · streck = 2022`">
    <v-chart :option="option" autoresize style="height: 340px" />
  </Card>
</template>
