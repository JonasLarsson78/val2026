<script setup lang="ts">
import { Download, Sparkles } from "lucide-vue-next";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  updateInfo,
  updateDismissed,
  dismissUpdate,
} from "../lib/updateCheck";

async function open() {
  if (!updateInfo.value) return;
  try {
    await openUrl(updateInfo.value.release_url);
  } catch {
    // ignore
  }
}
</script>

<template>
  <div
    v-if="updateInfo && updateInfo.update_available && !updateDismissed"
    class="banner"
  >
    <div class="left">
      <span class="badge">
        <Sparkles :size="11" :stroke-width="2.25" />
        Ny version
      </span>
      <span class="text">
        <strong class="num">v{{ updateInfo.latest }}</strong> finns att ladda ned
        <span class="cur num">(du har v{{ updateInfo.current }})</span>
      </span>
    </div>
    <div class="right">
      <button class="ghost" @click="dismissUpdate">Senare</button>
      <button class="primary" @click="open">
        <Download :size="13" :stroke-width="2.25" />
        Ladda ner
      </button>
    </div>
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--accent) 8%, var(--bg-elev));
  border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border));
  border-radius: var(--radius);
  font-size: 12.5px;
}
.left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--accent);
  color: var(--accent-fg);
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.text {
  color: var(--fg);
}
.text strong {
  font-weight: 700;
}
.cur {
  color: var(--fg-muted);
  font-weight: 500;
  margin-left: 4px;
}
.right {
  display: flex;
  gap: 8px;
}
button {
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 5px 11px;
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.1s ease;
}
.ghost {
  background: transparent;
  border-color: var(--border);
  color: var(--fg-muted);
}
.ghost:hover {
  color: var(--fg);
  background: var(--bg-hover);
}
.primary {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--accent);
  color: var(--accent-fg);
}
.primary:hover {
  opacity: 0.9;
}
</style>
