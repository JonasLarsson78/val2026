<script setup lang="ts">
import { computed, ref } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, ScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
} from "echarts/components";
import { PARTIES } from "../lib/parties";
import type { Poll } from "../lib/tauri";
import { rollingAverage } from "../lib/pollOfPolls";
import { baseAxis, chartColors, dataZoomBottom, timeAxis, tooltip } from "../lib/chartTheme";
import { partyColors } from "../lib/theme";
import Card from "./Card.vue";

use([
  CanvasRenderer,
  LineChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
]);

const props = defineProps<{ polls: Poll[]; windowDays: number }>();
const emit = defineEmits<{ (e: "update:windowDays", v: number): void }>();
const showRaw = ref(true);

const option = computed(() => {
  const averages = rollingAverage(props.polls, props.windowDays);

  const colors = partyColors.value;
  const series = PARTIES.flatMap((party) => {
    const color = colors[party.code];
    const trend = averages
      .map((a) => [a.date, a.shares[party.code]])
      .filter((p): p is [string, number] => typeof p[1] === "number");
    const raw = props.polls
      .map((poll): [string, number] | null => {
        const r = poll.results.find((x) => x.party === party.code);
        return r ? [poll.field_end, r.percent] : null;
      })
      .filter((p): p is [string, number] => p !== null);

    const out: any[] = [
      {
        name: party.code,
        type: "line",
        data: trend,
        showSymbol: false,
        smooth: 0.3,
        lineStyle: { width: 2, color },
        itemStyle: { color },
        emphasis: { focus: "series", lineStyle: { width: 3 } },
      },
    ];
    if (showRaw.value) {
      out.push({
        name: `${party.code} (rå)`,
        type: "scatter",
        data: raw,
        symbolSize: 4,
        itemStyle: { color, opacity: 0.3 },
        tooltip: { show: false },
        legendHoverLink: false,
      });
    }
    return out;
  });

  const c = chartColors();
  return {
    animation: false,
    tooltip: {
      ...tooltip(),
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: { color: c.borderStrong, type: "dashed" },
      },
      valueFormatter: (v: number) =>
        typeof v === "number" ? v.toFixed(1) + "%" : v,
    },
    legend: {
      data: PARTIES.map((p) => p.code),
      top: 0,
      icon: "roundRect",
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: { color: c.fg, fontSize: 12 },
    },
    grid: { left: 36, right: 8, top: 36, bottom: 50 },
    xAxis: timeAxis(),
    yAxis: {
      ...baseAxis(),
      type: "value",
      axisLabel: { ...baseAxis().axisLabel, formatter: "{value}%" },
    },
    dataZoom: dataZoomBottom(),
    series,
  };
});

function setWindow(v: number) {
  emit("update:windowDays", v);
}
</script>

<template>
  <Card title="Trender per parti" :meta="`${windowDays}-dagars snitt`">
    <template #actions>
      <div class="segmented">
        <button
          v-for="v in [14, 30, 60, 90]"
          :key="v"
          :class="{ active: windowDays === v }"
          @click="setWindow(v)"
        >
          {{ v }}d
        </button>
      </div>
      <label class="toggle">
        <input type="checkbox" v-model="showRaw" />
        Råa
      </label>
    </template>
    <v-chart
      v-if="polls.length"
      :option="option"
      autoresize
      style="height: 420px"
    />
    <p v-else class="empty">Inga mätningar inlästa.</p>
  </Card>
</template>

<style scoped>
.segmented {
  display: flex;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 2px;
}
.segmented button {
  background: transparent;
  border: none;
  color: var(--fg-muted);
  padding: 3px 9px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 11.5px;
  font-weight: 500;
  transition: all 0.1s ease;
}
.segmented button:hover {
  color: var(--fg);
}
.segmented button.active {
  background: var(--bg-elev);
  color: var(--fg);
  box-shadow: var(--shadow-sm);
}
.toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--fg-muted);
  cursor: pointer;
}
.toggle input {
  margin: 0;
  cursor: pointer;
}
.empty {
  padding: 80px 0;
  text-align: center;
  color: var(--fg-muted);
}
</style>
