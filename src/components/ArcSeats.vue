<script setup lang="ts">
import { computed } from "vue";
import { type PartyCode } from "../lib/parties";
import { partyColors } from "../lib/theme";
import { ARC, computeArcLayout } from "../lib/arcLayout";

const props = withDefaults(
  defineProps<{
    seats: Record<PartyCode, number>;
    order?: PartyCode[];
    highlighted?: Set<PartyCode> | null;
    centerValue?: string | number;
    centerCaption?: string;
    showMidline?: boolean;
  }>(),
  {
    order: () => ["V", "S", "MP", "C", "L", "KD", "M", "SD"] as PartyCode[],
    highlighted: null,
    centerCaption: "mandat",
    showMidline: true,
  }
);

const layout = computeArcLayout();

interface Seat {
  party: PartyCode;
  color: string;
  dim: boolean;
  cx: number;
  cy: number;
}

const seats = computed<Seat[]>(() => {
  const out: Seat[] = [];
  let idx = 0;
  for (const code of props.order) {
    const n = props.seats[code] ?? 0;
    const partyColor = partyColors.value[code];
    const dim = props.highlighted ? !props.highlighted.has(code) : false;
    for (let i = 0; i < n && idx < layout.length; i++) {
      const pos = layout[idx++];
      out.push({
        party: code,
        color: partyColor,
        dim,
        cx: pos.cx,
        cy: pos.cy,
      });
    }
  }
  return out;
});

const totalDisplay = computed(() => {
  if (props.centerValue !== undefined) return String(props.centerValue);
  return String(seats.value.length);
});
</script>

<template>
  <svg viewBox="-160 -160 320 175" preserveAspectRatio="xMidYMid meet" class="arc">
    <line
      v-if="showMidline"
      x1="0"
      y1="-155"
      x2="0"
      y2="-60"
      stroke="var(--border-strong)"
      stroke-dasharray="2 3"
      stroke-width="1"
    />
    <g>
      <circle
        v-for="(s, i) in seats"
        :key="i"
        :cx="s.cx"
        :cy="s.cy"
        :r="ARC.seatR"
        :fill="s.dim ? 'var(--border-strong)' : s.color"
        :class="{ dim: s.dim }"
      />
    </g>
    <text x="0" y="-10" text-anchor="middle" class="total">
      {{ totalDisplay }}
    </text>
    <text x="0" y="4" text-anchor="middle" class="caption">
      {{ centerCaption }}
    </text>
  </svg>
</template>

<style scoped>
.arc {
  width: 100%;
  height: auto;
  display: block;
}
.arc circle {
  transition: fill 0.2s ease, opacity 0.2s ease;
}
.arc circle.dim {
  opacity: 0.5;
}
.total {
  font-size: 28px;
  font-weight: 700;
  fill: var(--fg);
  letter-spacing: -0.02em;
  font-family: var(--font-sans);
}
.caption {
  font-size: 9px;
  fill: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: var(--font-sans);
}
</style>
