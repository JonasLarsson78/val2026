import { ref } from "vue";
import { api, type UpdateInfo } from "./tauri";

const DISMISS_KEY = "val2026.dismissedUpdate";

export const updateInfo = ref<UpdateInfo | null>(null);
export const updateDismissed = ref(false);

export async function checkForUpdate() {
  try {
    const result = await api.checkUpdate();
    if (!result.update_available) return;
    if (localStorage.getItem(DISMISS_KEY) === result.latest) {
      updateDismissed.value = true;
    }
    updateInfo.value = result;
  } catch {
    // silent
  }
}

export function simulateUpdate() {
  updateInfo.value = {
    current: updateInfo.value?.current ?? "0.0.0",
    latest: "99.0.0",
    update_available: true,
    release_url: "https://github.com/JonasLarsson78/val2026/releases",
    published_at: new Date().toISOString(),
  };
  updateDismissed.value = false;
  localStorage.removeItem(DISMISS_KEY);
}

export function clearUpdate() {
  updateInfo.value = null;
  updateDismissed.value = false;
}

export function dismissUpdate() {
  if (!updateInfo.value) return;
  localStorage.setItem(DISMISS_KEY, updateInfo.value.latest);
  updateDismissed.value = true;
}
