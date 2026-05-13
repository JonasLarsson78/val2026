<script setup lang="ts">
import { computed } from "vue";
import { THRESHOLD_PCT } from "../lib/parties";
import { partyColors } from "../lib/theme";
import { atRisk, computeRisk, type PartyRisk } from "../lib/threshold";
import type { Poll } from "../lib/tauri";
import Card from "./Card.vue";

const props = defineProps<{ polls: Poll[]; windowDays: number }>();

const risks = computed(() => computeRisk(props.polls, props.windowDays));
const visible = computed(() => atRisk(risks.value));

const LEVEL_LABEL: Record<PartyRisk["level"], string> = {
  danger: "Under spärren",
  warn: "Mycket nära",
  watch: "Inom riskzon",
  safe: "Säker",
};

function sparkPath(r: PartyRisk) {
  const w = 140;
  const h = 32;
  const ys = r.recent.map((x) => x.pct);
  if (ys.length < 2) return { line: "", area: "", points: [] as { x: number; y: number; pct: number }[] };
  const minY = Math.min(THRESHOLD_PCT - 0.5, ...ys);
  const maxY = Math.max(THRESHOLD_PCT + 1.5, ...ys);
  const span = Math.max(0.5, maxY - minY);
  const stepX = w / (ys.length - 1);
  const points = ys.map((y, i) => ({
    x: i * stepX,
    y: h - ((y - minY) / span) * h,
    pct: y,
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const thresholdY = h - ((THRESHOLD_PCT - minY) / span) * h;
  return { line, threshold: thresholdY, points };
}
</script>

<template>
  <Card
    title="Spärrrisk"
    :meta="`${visible.length} av 8 partier i riskzon · 4 % spärr`"
  >
    <div v-if="visible.length === 0" class="empty">
      Inget parti i farozonen just nu.
    </div>
    <div v-else class="rows">
      <div
        v-for="r in visible"
        :key="r.code"
        class="row"
        :class="['lvl-' + r.level]"
      >
        <div class="ident">
          <span class="dot" :style="{ background: partyColors[r.code] }"></span>
          <span class="code">{{ r.code }}</span>
        </div>

        <div class="meta">
          <span class="status">{{ LEVEL_LABEL[r.level] }}</span>
          <span class="margin">
            <template v-if="r.marginToThreshold >= 0">
              +{{ r.marginToThreshold.toFixed(1) }} ppt över spärren
            </template>
            <template v-else>
              {{ r.marginToThreshold.toFixed(1) }} ppt under spärren
            </template>
          </span>
        </div>

        <div class="value">
          <span class="cur num">{{ r.current.toFixed(1) }}%</span>
          <span class="recent">
            {{ r.belowThresholdCount }}/{{ r.recent.length }}
            <span class="recent-label">under 4 %</span>
          </span>
        </div>

        <svg
          class="spark"
          viewBox="0 0 140 32"
          preserveAspectRatio="none"
          width="140"
          height="32"
        >
          <line
            x1="0"
            x2="140"
            :y1="sparkPath(r).threshold"
            :y2="sparkPath(r).threshold"
            stroke="var(--border-strong)"
            stroke-dasharray="3 3"
            stroke-width="1"
          />
          <path
            :d="sparkPath(r).line"
            fill="none"
            :stroke="partyColors[r.code]"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            v-for="(pt, i) in sparkPath(r).points"
            :key="i"
            :cx="pt.x"
            :cy="pt.y"
            :r="pt.pct < THRESHOLD_PCT ? 2.2 : 1.5"
            :fill="pt.pct < THRESHOLD_PCT ? 'var(--danger)' : partyColors[r.code]"
            :opacity="pt.pct < THRESHOLD_PCT ? 1 : 0.6"
          />
        </svg>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.empty {
  padding: 30px 0;
  text-align: center;
  color: var(--fg-muted);
  font-size: 12px;
}
.rows {
  display: flex;
  flex-direction: column;
}
.row {
  display: grid;
  grid-template-columns: 60px 1fr auto 140px;
  align-items: center;
  gap: 14px;
  padding: 10px 4px;
  border-bottom: 1px solid var(--border);
  position: relative;
}
.row::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 0;
  bottom: 0;
  width: 3px;
}
.row.lvl-danger::before {
  background: var(--danger);
}
.row.lvl-warn::before {
  background: var(--warn);
}
.row.lvl-watch::before {
  background: var(--fg-subtle);
}
.row:last-child {
  border-bottom: none;
}
.ident {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.code {
  font-weight: 600;
  font-size: 13px;
}
.meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-size: 11.5px;
}
.status {
  font-weight: 500;
  color: var(--fg);
}
.lvl-danger .status {
  color: var(--danger);
}
.lvl-warn .status {
  color: var(--warn);
}
.lvl-watch .status {
  color: var(--fg-muted);
}
.margin {
  color: var(--fg-muted);
  font-size: 11px;
}
.value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}
.cur {
  font-weight: 600;
  font-size: 13px;
}
.lvl-danger .cur {
  color: var(--danger);
}
.recent {
  font-size: 10.5px;
  color: var(--fg-muted);
}
.recent-label {
  color: var(--fg-subtle);
  margin-left: 2px;
}
.spark {
  display: block;
}
</style>
