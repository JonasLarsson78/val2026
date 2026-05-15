<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronDown, ExternalLink, User } from "lucide-vue-next";
import { openUrl } from "@tauri-apps/plugin-opener";
import { PARTIES, type PartyCode } from "../lib/parties";
import { PARTY_META } from "../lib/partyMeta";
import { partyColors } from "../lib/theme";
import { distributeSeats } from "../lib/mandates";
import { latestAverage } from "../lib/pollOfPolls";
import { ELECTION_2022 } from "../lib/elections";
import { QUESTIONS, SCALE, type Position } from "../lib/quiz";
import type { Poll } from "../lib/tauri";
import Card from "../components/Card.vue";
import PartyLogo from "../components/PartyLogo.vue";

const props = defineProps<{ polls: Poll[]; windowDays: number }>();

const avg = computed(() => latestAverage(props.polls, props.windowDays));
const seats = computed(() => distributeSeats(avg.value));

interface Profile {
  code: PartyCode;
  name: string;
  color: string;
  pct: number;
  delta: number;
  mandates: number;
  meta: (typeof PARTY_META)[PartyCode];
}

const profiles = computed<Profile[]>(() =>
  PARTIES.map((p) => {
    const pct = avg.value[p.code] ?? 0;
    return {
      code: p.code,
      name: p.name,
      color: partyColors.value[p.code],
      pct: +pct.toFixed(1),
      delta: +(pct - ELECTION_2022[p.code]).toFixed(1),
      mandates: seats.value[p.code] ?? 0,
      meta: PARTY_META[p.code],
    };
  }).sort((a, b) => b.pct - a.pct)
);

function positionLabel(p: Position): string {
  return SCALE.find((s) => s.value === p)?.label ?? "—";
}

function positionClass(p: Position): string {
  if (p <= -1) return "neg";
  if (p >= 1) return "pos";
  return "neu";
}

async function openHomepage(url: string) {
  try {
    await openUrl(url);
  } catch {
    /* ignore */
  }
}

const expanded = ref<Set<PartyCode>>(new Set());

function toggle(code: PartyCode) {
  const next = new Set(expanded.value);
  if (next.has(code)) next.delete(code);
  else next.add(code);
  expanded.value = next;
}
</script>

<template>
  <div class="profiles">
    <Card
      v-for="p in profiles"
      :key="p.code"
      :title="p.name"
      :meta="p.meta.ideology"
    >
      <template #actions>
        <button class="link-btn" @click="openHomepage(p.meta.homepage)">
          {{ p.meta.homepage.replace(/^https?:\/\/(www\.)?/, "") }}
          <ExternalLink :size="11" :stroke-width="2" />
        </button>
      </template>

      <div class="head" :style="{ borderTopColor: p.color }">
        <div class="ident">
          <PartyLogo :code="p.code" :size="56" framed />
          <div class="ident-meta">
            <div class="leader">
              <User :size="11" :stroke-width="2" />
              <strong>{{ p.meta.leader }}</strong>
              <span v-if="p.meta.leaderRole" class="role">· {{ p.meta.leaderRole }}</span>
            </div>
            <div class="founded">Grundat {{ p.meta.founded }}</div>
          </div>
        </div>

        <div class="stats">
          <div class="stat">
            <span class="stat-val num">{{ p.pct.toFixed(1) }}<span class="stat-suffix">%</span></span>
            <span class="stat-label">i snittet</span>
          </div>
          <div class="stat">
            <span
              class="stat-val num"
              :class="{ up: p.delta > 0, down: p.delta < 0 }"
            >
              {{ p.delta > 0 ? "+" : "" }}{{ p.delta.toFixed(1) }}
            </span>
            <span class="stat-label">sedan 2022</span>
          </div>
          <div class="stat">
            <span class="stat-val num">{{ p.mandates }}</span>
            <span class="stat-label">mandat</span>
          </div>
        </div>
      </div>

      <p class="desc">{{ p.meta.description }}</p>

      <div class="positions">
        <button
          class="positions-toggle"
          :aria-expanded="expanded.has(p.code)"
          @click="toggle(p.code)"
        >
          <ChevronDown
            :size="14"
            :stroke-width="2"
            class="chev"
            :class="{ open: expanded.has(p.code) }"
          />
          <span>Positioner i valkompassens frågor</span>
          <span class="positions-count">{{ QUESTIONS.length }} frågor</span>
        </button>
        <div v-if="expanded.has(p.code)" class="position-list">
          <div v-for="q in QUESTIONS" :key="q.id" class="pos-row">
            <span class="pos-topic">{{ q.topic }}</span>
            <span class="pos-statement">{{ q.statement }}</span>
            <span
              class="pos-pill"
              :class="positionClass(q.positions[p.code])"
            >
              {{ positionLabel(q.positions[p.code]) }}
            </span>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.profiles {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 980px;
  margin: 0 auto;
  width: 100%;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg-muted);
  padding: 3px 9px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  font-family: var(--font-mono);
  transition: all 0.1s ease;
}
.link-btn:hover {
  color: var(--fg);
  background: var(--bg-hover);
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 14px 0 16px;
  border-top: 3px solid transparent;
  border-bottom: 1px solid var(--border);
  margin: -6px 0 14px;
}
.ident {
  display: flex;
  align-items: center;
  gap: 14px;
}
.code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 0 10px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
}
.ident-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.leader {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--fg);
}
.leader :deep(svg) {
  color: var(--fg-subtle);
}
.leader strong {
  font-weight: 600;
}
.role {
  color: var(--fg-muted);
  font-weight: 500;
}
.founded {
  font-size: 11px;
  color: var(--fg-subtle);
}

.stats {
  display: flex;
  gap: 22px;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.stat-val {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--fg);
}
.stat-val.up {
  color: var(--success);
}
.stat-val.down {
  color: var(--danger);
}
.stat-suffix {
  font-size: 12px;
  font-weight: 500;
  color: var(--fg-muted);
  margin-left: 2px;
}
.stat-label {
  font-size: 10.5px;
  color: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
}

.desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--fg);
  margin: 0 0 18px;
}

.positions-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 9px 12px;
  cursor: pointer;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--fg-muted);
  transition: all 0.12s ease;
}
.positions-toggle:hover {
  background: var(--bg-hover);
  color: var(--fg);
}
.positions-toggle[aria-expanded="true"] {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.positions-toggle .chev {
  transition: transform 0.18s ease;
  color: var(--fg-subtle);
}
.positions-toggle .chev.open {
  transform: rotate(180deg);
}
.positions-count {
  margin-left: auto;
  font-size: 10.5px;
  color: var(--fg-subtle);
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}
.position-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  margin-top: -1px;
}
.pos-row {
  display: grid;
  grid-template-columns: 90px 1fr 110px;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-elev);
  font-size: 12px;
  border-bottom: 1px solid var(--border);
}
.pos-row:last-child {
  border-bottom: none;
}
.pos-row:hover {
  background: var(--bg-hover);
}
.pos-topic {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pos-statement {
  color: var(--fg);
}
.pos-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  text-align: center;
}
.pos-pill.pos {
  background: color-mix(in srgb, var(--success) 15%, transparent);
  color: var(--success);
}
.pos-pill.neg {
  background: color-mix(in srgb, var(--danger) 15%, transparent);
  color: var(--danger);
}
.pos-pill.neu {
  background: var(--bg-hover);
  color: var(--fg-muted);
}

@media (max-width: 640px) {
  .pos-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .stats {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
  }
}
</style>
