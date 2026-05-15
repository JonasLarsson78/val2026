<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Gauge } from "lucide-vue-next";
import {
  QUESTIONS,
  QUIZ_SIZES,
  SCALE,
  type Position,
  type QuizSize,
} from "../lib/quiz";
import { computeMatches } from "../lib/quizMatch";
import { partyColors } from "../lib/theme";
import Card from "../components/Card.vue";

const ANSWERS_KEY = "val2026.quiz.answers";
const SIZE_KEY = "val2026.quiz.size";

function loadAnswers(): (Position | null)[] {
  if (typeof localStorage === "undefined") return Array(QUESTIONS.length).fill(null);
  try {
    const v = JSON.parse(localStorage.getItem(ANSWERS_KEY) || "null");
    if (Array.isArray(v)) {
      const out = Array(QUESTIONS.length).fill(null) as (Position | null)[];
      for (let i = 0; i < Math.min(v.length, QUESTIONS.length); i++) {
        out[i] = v[i];
      }
      return out;
    }
  } catch {}
  return Array(QUESTIONS.length).fill(null);
}

function loadSize(): QuizSize {
  if (typeof localStorage === "undefined") return 10;
  const v = parseInt(localStorage.getItem(SIZE_KEY) || "10", 10);
  return (QUIZ_SIZES.includes(v as QuizSize) ? v : 10) as QuizSize;
}

const answers = ref<(Position | null)[]>(loadAnswers());
const size = ref<QuizSize>(loadSize());
const current = ref(0);

const activeQuestions = computed(() => QUESTIONS.slice(0, size.value));
const activeAnswers = computed(() => answers.value.slice(0, size.value));

const answeredCount = computed(
  () => activeAnswers.value.filter((a) => a !== null).length
);
const progressPct = computed(() => (answeredCount.value / size.value) * 100);
const completed = computed(() => answeredCount.value === size.value);
const matches = computed(() =>
  computeMatches([
    ...activeAnswers.value,
    ...Array(QUESTIONS.length - size.value).fill(null),
  ])
);
const top = computed(() => matches.value[0]);

const showResults = ref(completed.value);

watch(answers, (v) => {
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(v));
}, { deep: true });

watch(size, (v) => {
  localStorage.setItem(SIZE_KEY, String(v));
  if (current.value >= v) current.value = v - 1;
  if (!completed.value) showResults.value = false;
});

function setSize(s: QuizSize) {
  size.value = s;
}

function setAnswer(p: Position) {
  answers.value[current.value] = p;
  if (current.value < size.value - 1) {
    current.value++;
  } else if (completed.value) {
    showResults.value = true;
  }
}

function go(idx: number) {
  current.value = Math.max(0, Math.min(size.value - 1, idx));
  showResults.value = false;
}

function restart() {
  answers.value = Array(QUESTIONS.length).fill(null);
  current.value = 0;
  showResults.value = false;
  localStorage.removeItem(ANSWERS_KEY);
}

function viewResults() {
  showResults.value = true;
}

const SIZE_LABEL: Record<QuizSize, string> = {
  10: "Snabb",
  15: "Medel",
  20: "Omfattande",
};
</script>

<template>
  <div class="quiz">
    <div class="size-bar">
      <span class="size-label">
        <Gauge :size="13" :stroke-width="2" />
        Antal frågor
      </span>
      <div class="size-seg">
        <button
          v-for="s in QUIZ_SIZES"
          :key="s"
          class="size-btn"
          :class="{ active: size === s }"
          @click="setSize(s)"
        >
          <span class="size-num num">{{ s }}</span>
          <span class="size-tag">{{ SIZE_LABEL[s] }}</span>
        </button>
      </div>
    </div>

    <Card
      v-if="!showResults"
      :title="`Fråga ${current + 1} av ${size}`"
      :meta="activeQuestions[current].topic"
    >
      <template #actions>
        <button v-if="completed" class="results-btn" @click="viewResults">
          Se resultat →
        </button>
      </template>

      <div class="progress">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>

      <p class="statement">{{ activeQuestions[current].statement }}</p>

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
            v-for="(_, i) in activeQuestions"
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
          :disabled="current === size - 1"
          @click="go(current + 1)"
        >
          Nästa →
        </button>
      </div>
    </Card>

    <Card v-else title="Ditt resultat" :meta="`${answeredCount} av ${size} frågor besvarade`">
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
        position på alla frågor du besvarat — fler frågor ger en mer nyanserad
        bild men inte alltid ett "bättre" svar.
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

.size-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  flex-wrap: wrap;
}
.size-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
}
.size-label :deep(svg) {
  color: var(--fg-subtle);
}
.size-seg {
  display: inline-flex;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 3px;
  gap: 1px;
}
.size-btn {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--fg-muted);
  padding: 5px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.12s ease;
}
.size-btn:hover {
  color: var(--fg);
}
.size-btn.active {
  background: var(--bg-elev);
  color: var(--fg);
  box-shadow: var(--shadow-sm);
}
.size-num {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.size-tag {
  font-size: 11px;
  font-weight: 500;
  color: var(--fg-subtle);
}
.size-btn.active .size-tag {
  color: var(--fg-muted);
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
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 60%;
}
.dot {
  width: 8px;
  height: 8px;
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
</style>
