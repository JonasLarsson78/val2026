<script setup lang="ts">
import { Sun, Moon, Monitor } from "lucide-vue-next";
import { themeMode, setMode, type ThemeMode } from "../lib/themeMode";

const options: { mode: ThemeMode; label: string; icon: any }[] = [
  { mode: "light",  label: "Ljust",  icon: Sun },
  { mode: "system", label: "System", icon: Monitor },
  { mode: "dark",   label: "Mörkt",  icon: Moon },
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
      <component :is="o.icon" :size="14" :stroke-width="1.75" />
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
