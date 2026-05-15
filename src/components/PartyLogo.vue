<script setup lang="ts">
import type { PartyCode } from "../lib/parties";
import { PARTY_LOGOS } from "../lib/partyLogos";

withDefaults(
  defineProps<{ code: PartyCode; size?: number; framed?: boolean }>(),
  { size: 32, framed: false }
);
</script>

<template>
  <span class="party-logo" :class="{ framed }" :style="{ height: size + 'px' }">
    <img :src="PARTY_LOGOS[code]" alt="" role="presentation" />
  </span>
</template>

<style scoped>
.party-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.party-logo.framed {
  aspect-ratio: 1;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 5px;
}
.party-logo img {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  display: block;
}
.party-logo.framed img {
  max-height: 100%;
}
</style>
