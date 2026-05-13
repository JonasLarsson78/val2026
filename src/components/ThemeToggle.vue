<script setup lang="ts">
import { themeMode, setMode, type ThemeMode } from "../lib/themeMode";

const options: { mode: ThemeMode; label: string }[] = [
  { mode: "light", label: "Ljust" },
  { mode: "system", label: "System" },
  { mode: "dark", label: "Mörkt" },
];
</script>

<template>
  <div class="seg" role="group" aria-label="Tema">
    <button
      v-for="o in options"
      :key="o.mode"
      class="seg-btn"
      :class="{ active: themeMode === o.mode }"
      :title="o.label"
      :aria-pressed="themeMode === o.mode"
      @click="setMode(o.mode)"
    >
      <svg
        v-if="o.mode === 'light'"
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      >
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1" />
      </svg>
      <svg
        v-else-if="o.mode === 'system'"
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      >
        <rect x="1.5" y="2.5" width="13" height="9" rx="1" />
        <path d="M5 14h6M8 11.5V14" stroke-linecap="round" />
      </svg>
      <svg
        v-else
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M13.5 9.5A6 6 0 1 1 6.5 2.5a4.5 4.5 0 0 0 7 7Z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.seg {
  display: inline-flex;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 2px;
  gap: 1px;
}
.seg-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 22px;
  background: transparent;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: var(--fg-muted);
  transition: all 0.12s ease;
}
.seg-btn:hover {
  color: var(--fg);
}
.seg-btn.active {
  background: var(--bg-elev);
  color: var(--fg);
  box-shadow: var(--shadow-sm);
}
</style>
