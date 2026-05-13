<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api, type Poll, type RefreshReport } from "./lib/tauri";
import TrendChart from "./components/TrendChart.vue";
import PollOfPolls from "./components/PollOfPolls.vue";
import BlockSupport from "./components/BlockSupport.vue";
import SeatDistribution from "./components/SeatDistribution.vue";
import PollList from "./components/PollList.vue";
import KpiStrip from "./components/KpiStrip.vue";
import Vs2022 from "./components/Vs2022.vue";
import ThresholdRisk from "./components/ThresholdRisk.vue";
import CoalitionBuilder from "./components/CoalitionBuilder.vue";
import RiksdagArc from "./components/RiksdagArc.vue";

const polls = ref<Poll[]>([]);
const loading = ref(false);
const lastReport = ref<RefreshReport | null>(null);
const error = ref<string | null>(null);
const windowDays = ref(30);

const lastFetched = ref<Date | null>(null);
const lastFetchedLabel = computed(() => {
  if (!lastFetched.value) return "—";
  const diff = Date.now() - lastFetched.value.getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "just nu";
  if (min < 60) return `${min} min sedan`;
  return lastFetched.value.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
});

async function reload() {
  try {
    polls.value = await api.listPolls();
  } catch (e: any) {
    error.value = String(e);
  }
}

async function refresh() {
  loading.value = true;
  error.value = null;
  try {
    lastReport.value = await api.refresh();
    lastFetched.value = new Date();
    await reload();
  } catch (e: any) {
    error.value = String(e);
  } finally {
    loading.value = false;
  }
}

async function remove(id: number) {
  await api.deletePoll(id);
  await reload();
}

onMounted(reload);
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <img src="/icon.png" alt="Val 2026" class="logo" />
        <div>
          <h1>Val 2026</h1>
          <p class="sub">Opinionsmätningar inför riksdagsvalet</p>
        </div>
      </div>
      <div class="actions">
        <span class="updated" v-if="lastFetched">
          Uppdaterad <span class="num">{{ lastFetchedLabel }}</span>
        </span>
        <button class="btn" :disabled="loading" @click="refresh">
          <span class="dot" :class="{ pulse: loading }"></span>
          {{ loading ? "Hämtar…" : "Uppdatera" }}
        </button>
      </div>
    </header>

    <div v-if="error" class="banner err">{{ error }}</div>

    <KpiStrip :polls="polls" :window-days="windowDays" />

    <main class="grid">
      <div class="span-2">
        <TrendChart
          :polls="polls"
          :window-days="windowDays"
          @update:window-days="windowDays = $event"
        />
      </div>

      <PollOfPolls :polls="polls" :window-days="windowDays" />
      <SeatDistribution :polls="polls" :window-days="windowDays" />

      <div class="span-2">
        <RiksdagArc :polls="polls" :window-days="windowDays" />
      </div>

      <div class="span-2">
        <CoalitionBuilder :polls="polls" :window-days="windowDays" />
      </div>

      <Vs2022 :polls="polls" :window-days="windowDays" />
      <BlockSupport :polls="polls" :window-days="windowDays" />

      <div class="span-2">
        <ThresholdRisk :polls="polls" :window-days="windowDays" />
      </div>

      <div class="span-2">
        <PollList :polls="polls" @delete="remove" />
      </div>
    </main>

    <footer>
      <span v-if="lastReport">
        Senaste hämtning: {{ lastReport.total_inserted }} mätningar
        <span v-for="src in lastReport.per_source" :key="src.source" class="chip">
          {{ src.source }} <span class="num">+{{ src.fetched }}</span>
          <span v-if="src.error" class="warn" :title="src.error">⚠</span>
        </span>
      </span>
      <span class="muted">Källa: Wikipedia · Mandat: jämkad uddatalsmetod, 4% spärr</span>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: block;
  object-fit: contain;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
}
h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.015em;
}
.sub {
  margin: 0;
  color: var(--fg-muted);
  font-size: 11.5px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 14px;
}
.updated {
  font-size: 11.5px;
  color: var(--fg-muted);
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: var(--fg);
  color: var(--bg);
  border: none;
  padding: 7px 13px;
  border-radius: 7px;
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.1s ease;
}
.btn:hover {
  opacity: 0.9;
}
.btn:disabled {
  opacity: 0.6;
  cursor: progress;
}
.btn .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  flex-shrink: 0;
}
.btn .dot.pulse {
  animation: pulse 1.4s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.banner.err {
  padding: 9px 12px;
  background: color-mix(in srgb, var(--danger) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 12px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.span-2 {
  grid-column: 1 / -1;
}
@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 8px;
  font-size: 11px;
  color: var(--fg-muted);
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  margin-left: 6px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 5px;
  font-variant-numeric: tabular-nums;
}
.chip .warn {
  color: var(--warn);
}
.muted {
  color: var(--fg-subtle);
}
</style>
