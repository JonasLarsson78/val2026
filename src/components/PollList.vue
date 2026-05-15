<script setup lang="ts">
import { computed, ref } from "vue";
import { PARTIES } from "../lib/parties";
import { partyColors } from "../lib/theme";
import type { Poll } from "../lib/tauri";
import Card from "./Card.vue";
import PartyLogo from "./PartyLogo.vue";

const props = defineProps<{ polls: Poll[] }>();
const emit = defineEmits<{ (e: "delete", id: number): void }>();

const limit = ref(20);

const visible = computed(() => props.polls.slice(0, limit.value));

function pct(poll: Poll, code: string) {
  const r = poll.results.find((x) => x.party === code);
  return r ? r.percent.toFixed(1) : "—";
}

function topPartyColor(poll: Poll) {
  if (!poll.results.length) return "transparent";
  const top = [...poll.results].sort((a, b) => b.percent - a.percent)[0];
  return partyColors.value[top.party as keyof typeof partyColors.value] ?? "transparent";
}
</script>

<template>
  <Card title="Senaste mätningarna" :meta="`${polls.length} totalt`">
    <template #actions>
      <button class="more" @click="limit += 20" v-if="limit < polls.length">
        Visa fler
      </button>
    </template>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fält</th>
            <th>Institut</th>
            <th v-for="p in PARTIES" :key="p.code" class="num party-th">
              <PartyLogo :code="p.code" :size="18" />
            </th>
            <th class="num">n</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="poll in visible" :key="poll.id">
            <td>
              <span class="led" :style="{ background: topPartyColor(poll) }"></span>
              {{ poll.field_end }}
            </td>
            <td>{{ poll.institute }}</td>
            <td v-for="p in PARTIES" :key="p.code" class="num">{{ pct(poll, p.code) }}</td>
            <td class="num muted">{{ poll.sample_size ?? "—" }}</td>
            <td class="action-cell">
              <button class="del" @click="emit('delete', poll.id)" title="Ta bort">×</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Card>
</template>

<style scoped>
.more {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
  padding: 3px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 11.5px;
  font-weight: 500;
}
.more:hover {
  background: var(--bg-hover);
}
.table-wrap {
  overflow-x: auto;
  margin: 0 -12px;
  padding: 0 12px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
th,
td {
  text-align: left;
  padding: 7px 8px;
  border-bottom: 1px solid var(--border);
}
th {
  font-weight: 500;
  color: var(--fg-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg-elev);
}
.party-th {
  text-align: center;
}
.party-th :deep(.party-logo) {
  display: inline-flex;
}
.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.muted {
  color: var(--fg-muted);
}
.led {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}
tbody tr:hover {
  background: var(--bg-hover);
}
.action-cell {
  width: 32px;
  text-align: right;
}
.del {
  background: transparent;
  border: none;
  color: var(--fg-subtle);
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  border-radius: 4px;
}
.del:hover {
  color: var(--danger);
  background: var(--bg-hover);
}
</style>
