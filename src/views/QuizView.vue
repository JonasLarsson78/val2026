<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { QUESTIONS, SCALE, type Position } from "../lib/quiz";
import { computeMatches } from "../lib/quizMatch";
import { partyColors } from "../lib/theme";
import Card from "../components/Card.vue";

const STORAGE_KEY = "val2026.quiz.answers";

function load(): (Position | null)[] {
  if (typeof localStorage === "undefined") return Array(QUESTIONS.length).fill(null);
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (Array.isArray(v) && v.length === QUESTIONS.length) return v;
  } catch {}
  return Array(QUESTIONS.length).fill(null);
}

const answers = ref<(Position | null)[]>(load());
const current = ref(0);

const answeredCount = computed(() => answers.value.filter((a) => a !== null).length);
const progressPct = computed(() => (answeredCount.value / QUESTIONS.length) * 100);
const completed = computed(() => answeredCount.value === QUESTIONS.length);
const matches = computed(() => computeMatches(answers.value));
const top = computed(() => matches.value[0]);

const showResults = ref(completed.value);

watch(answers, (v) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
}, { deep: true });

function setAnswer(p: Position) {
  answers.value[current.value] = p;
  if (current.value < QUESTIONS.length - 1) {
    current.value++;
  } else if (completed.value) {
    showResults.value = true;
  }
}

function go(idx: number) {
  current.value = Math.max(0, Math.min(QUESTIONS.length - 1, idx));
  showResults.value = false;
}

function restart() {
  answers.value = Array(QUESTIONS.length).fill(null);
  current.value = 0;
  showResults.value = false;
  localStorage.removeItem(STORAGE_KEY);
}

function viewResults() {
  showResults.value = true;
}
</script>

<template>
  <div class="quiz">
    <Card v-if="!showResults" :title="`Fråga ${current + 1} av ${QUESTIONS.length}`" :meta="QUESTIONS[current].topic">
      <template #actions>
        <button v-if="completed" class="results-btn" @click="viewResults">
          Se resultat →
        </button>
      </template>

      <div class="progress">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>

      <p class="statement">{{ QUESTIONS[current].statement }}</p>

      <div class="options">
        <button
          v-for="opt in SCALE"
          :key="opt.value"
          class="option"
          :class="{
            selected: answers[current] === opt.value,
            disagree: opt.value < 0,
            agree: opt.value > 0,
            neutral: opt.value === 0,
          }"
          @click="setAnswer(opt.value)"
        >
          <span class="opt-mark">{{ opt.short }}</span>
          <span class="opt-label">{{ opt.label }}</span>
        </button>
      </div>

      <div class="nav">
        <button class="nav-btn" :disabled="current === 0" @click="go(current - 1)">
          ← Föregående
        </button>
        <div class="dots">
          <button
            v-for="(_, i) in QUESTIONS"
            :key="i"
            class="dot"
            :class="{
              done: answers[i] !== null,
              active: i === current,
            }"
            @click="go(i)"
            :title="`Fråga ${i + 1}`"
          ></button>
        </div>
        <button
          class="nav-btn"
          :disabled="current === QUESTIONS.length - 1"
          @click="go(current + 1)"
        >
          Nästa →
        </button>
      </div>
    </Card>

    <Card v-else title="Ditt resultat" :meta="`${answeredCount} av ${QUESTIONS.length} frågor besvarade`">
      <template #actions>
        <button class="results-btn" @click="restart">Gör om</button>
        <button class="results-btn ghost" @click="showResults = false">
          ← Justera svar
        </button>
      </template>

      <div v-if="top" class="hero">
        <div class="hero-label">Du står närmast</div>
        <div class="hero-party">
          <span class="hero-dot" :style="{ background: partyColors[top.code] }"></span>
          <span class="hero-name">{{ top.name }}</span>
        </div>
        <div class="hero-pct num">{{ top.match.toFixed(0) }}<span class="pct-suffix">%</span></div>
        <div class="hero-detail">
          {{ top.agreements }} av {{ answeredCount }} frågor i samma riktning
        </div>
      </div>

      <div class="bars">
        <div v-for="m in matches" :key="m.code" class="bar-row">
          <span class="bar-code">{{ m.code }}</span>
          <span class="bar-name">{{ m.name }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width: m.match + '%',
                background: partyColors[m.code],
              }"
            ></div>
          </div>
          <span class="bar-pct num">{{ m.match.toFixed(1) }}%</span>
        </div>
      </div>
    </Card>

    <Card title="Om valkompassen" meta="metod">
      <p class="meta-text">
        Frågorna har en 5-gradig skala från Helt emot till Helt för. Partiernas
        positioner är hämtade från deras valplattformar och offentliga
        uttalanden. Procentsiffran är hur nära ditt svar ligger partiets
        position på alla frågor du besvarat.
      </p>
    </Card>
  </div>
</template>

<style scoped>
.quiz {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 760px;
  margin: 0 auto;
  width: 100%;
}

.progress {
  height: 3px;
  background: var(--bg-hover);
  border-radius: 2px;
  margin: 4px 0 18px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.25s ease;
}

.statement {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.35;
  margin: 6px 0 22px;
  color: var(--fg);
  letter-spacing: -0.01em;
}

.options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-bottom: 24px;
}
.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.12s ease;
  color: var(--fg-muted);
}
.option:hover {
  background: var(--bg-hover);
  color: var(--fg);
  transform: translateY(-1px);
}
.option.selected {
  background: var(--bg-elev);
  color: var(--fg);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}
.option.selected.disagree {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 18%, transparent);
}
.option.selected.agree {
  border-color: var(--success);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--success) 18%, transparent);
}
.option.selected.neutral {
  border-color: var(--fg-muted);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--fg-muted) 18%, transparent);
}
.opt-mark {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}
.option.disagree .opt-mark {
  color: var(--danger);
}
.option.agree .opt-mark {
  color: var(--success);
}
.opt-label {
  font-size: 11px;
  font-weight: 500;
}
@media (max-width: 580px) {
  .options {
    grid-template-columns: repeat(5, 1fr);
  }
  .opt-label {
    display: none;
  }
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.nav-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg);
  padding: 5px 11px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}
.nav-btn:hover:not(:disabled) {
  background: var(--bg-hover);
}
.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.dots {
  display: flex;
  gap: 5px;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--border);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.15s ease;
}
.dot.done {
  background: var(--fg-muted);
}
.dot.active {
  background: var(--accent);
  transform: scale(1.35);
}
.dot:hover {
  background: var(--fg);
}

.results-btn {
  background: var(--accent);
  color: var(--accent-fg);
  border: none;
  border-radius: 6px;
  padding: 5px 11px;
  cursor: pointer;
  font-size: 11.5px;
  font-weight: 500;
}
.results-btn.ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg-muted);
}
.results-btn.ghost:hover {
  background: var(--bg-hover);
  color: var(--fg);
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 0 26px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 18px;
}
.hero-label {
  font-size: 11.5px;
  color: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}
.hero-party {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}
.hero-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}
.hero-name {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.hero-pct {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: var(--fg);
}
.pct-suffix {
  font-size: 22px;
  font-weight: 500;
  color: var(--fg-muted);
  margin-left: 2px;
}
.hero-detail {
  font-size: 12px;
  color: var(--fg-muted);
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bar-row {
  display: grid;
  grid-template-columns: 32px 1fr 1fr 60px;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}
.bar-code {
  font-weight: 700;
  color: var(--fg);
}
.bar-name {
  color: var(--fg-muted);
}
.bar-track {
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.35s ease;
}
.bar-pct {
  text-align: right;
  font-weight: 600;
  color: var(--fg);
}

.meta-text {
  font-size: 12.5px;
  color: var(--fg);
  line-height: 1.55;
  margin: 4px 0;
}
.meta-text.muted {
  color: var(--fg-muted);
  font-size: 11.5px;
}
.meta-text code {
  font-family: var(--font-mono);
  background: var(--bg-hover);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
}
</style>
