<script setup lang="ts">
defineProps<{ title?: string; meta?: string }>();
</script>

<template>
  <section class="card">
    <header v-if="title || $slots.header" class="card-header">
      <div class="title">
        <h2 v-if="title">{{ title }}</h2>
        <span v-if="meta" class="meta">{{ meta }}</span>
      </div>
      <div class="actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 10px;
  gap: 12px;
  flex-wrap: wrap;
}
.title {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
h2 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
}
.meta {
  color: var(--fg-muted);
  font-size: 11.5px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--fg-muted);
}
.body {
  padding: 4px 12px 12px;
}
</style>
