import { ref, computed, watchEffect } from "vue";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "val2026.theme";

function load(): ThemeMode {
  if (typeof localStorage === "undefined") return "system";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" ? v : "system";
}

export const themeMode = ref<ThemeMode>(load());

const matcher =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

const systemDark = ref(matcher?.matches ?? false);
matcher?.addEventListener("change", (e) => {
  systemDark.value = e.matches;
});

export const isDark = computed(() => {
  if (themeMode.value === "dark") return true;
  if (themeMode.value === "light") return false;
  return systemDark.value;
});

watchEffect(() => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = isDark.value ? "dark" : "light";
  document.documentElement.style.colorScheme = isDark.value ? "dark" : "light";
});

watchEffect(() => {
  if (typeof localStorage === "undefined") return;
  if (themeMode.value === "system") {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, themeMode.value);
  }
});

export function setMode(mode: ThemeMode) {
  themeMode.value = mode;
}
