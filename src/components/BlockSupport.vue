<script setup lang="ts">
import { computed } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
} from "echarts/components";
import { BLOCKS } from "../lib/blocks";
import type { Poll } from "../lib/tauri";
import { rollingAverage } from "../lib/pollOfPolls";
import { baseAxis, chartColors, dataZoomBottom, timeAxis, tooltip } from "../lib/chartTheme";
import { blockColor, isDark } from "../lib/theme";
import Card from "./Card.vue";

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
]);

const props = defineProps<{ polls: Poll[]; windowDays: number }>();

const option = computed(() => {
  void isDark.value;
  const c = chartColors();
  const averages = rollingAverage(props.polls, props.windowDays);
  const series: any[] = BLOCKS.map((block) => {
    const color = blockColor(block);
    const data = averages
      .map((a): [string, number] | null => {
        let sum = 0;
        let any = false;
        for (const code of block.parties) {
          const v = a.shares[code];
          if (typeof v === "number") {
            sum += v;
            any = true;
          }
        }
        return any ? [a.date, +sum.toFixed(2)] : null;
      })
      .filter((p): p is [string, number] => p !== null);
    return {
      name: block.name.split(" (")[0],
      type: "line",
      smooth: 0.3,
      showSymbol: false,
      data,
      lineStyle: { width: 2, color },
      itemStyle: { color },
      emphasis: { focus: "series", lineStyle: { width: 3 } },
    };
  });
  series.push({
    name: "majoritet",
    type: "line",
    data: [],
    markLine: {
      symbol: "none",
      silent: true,
      lineStyle: { color: c.borderStrong, type: "dashed" },
      label: { color: c.subtle, fontSize: 10, formatter: "50%" },
      data: [{ yAxis: 50 }],
    },
  });

  return {
    animation: false,
    tooltip: {
      ...tooltip(),
      trigger: "axis",
      valueFormatter: (v: number) => (typeof v === "number" ? v.toFixed(1) + "%" : v),
    },
    legend: {
      top: 0,
      icon: "roundRect",
      itemWidth: 10,
      itemHeight: 10,
      data: BLOCKS.map((b) => b.name.split(" (")[0]),
      textStyle: { color: c.fg, fontSize: 12 },
    },
    grid: { left: 36, right: 8, top: 36, bottom: 50 },
    xAxis: timeAxis(),
    yAxis: {
      ...baseAxis(),
      type: "value",
      max: 70,
      axisLabel: { ...baseAxis().axisLabel, formatter: "{value}%" },
    },
    dataZoom: dataZoomBottom(),
    series,
  };
});
</script>

<template>
  <Card title="Blockstöd">
    <v-chart :option="option" autoresize style="height: 320px" />
  </Card>
</template>
