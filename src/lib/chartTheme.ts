function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

export function chartColors() {
  return {
    fg: cssVar("--fg", "#0a0a0a"),
    muted: cssVar("--fg-muted", "#737373"),
    subtle: cssVar("--fg-subtle", "#a3a3a3"),
    border: cssVar("--border", "#e5e5e5"),
    borderStrong: cssVar("--border-strong", "#d4d4d4"),
    bgElev: cssVar("--bg-elev", "#fff"),
    danger: cssVar("--danger", "#dc2626"),
  };
}

export function baseAxis() {
  const c = chartColors();
  return {
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: c.border, type: "dashed" as const } },
    axisLabel: { color: c.muted, fontSize: 11 },
    nameTextStyle: { color: c.muted, fontSize: 11 },
  };
}

export function timeAxis() {
  const c = chartColors();
  return {
    type: "time" as const,
    axisLine: { show: false },
    axisTick: { show: false, alignWithLabel: true },
    splitLine: { show: false },
    axisLabel: { color: c.muted, fontSize: 11, hideOverlap: true },
  };
}

export function tooltip() {
  const c = chartColors();
  return {
    backgroundColor: c.bgElev,
    borderColor: c.border,
    borderWidth: 1,
    padding: [8, 10] as [number, number],
    textStyle: { color: c.fg, fontSize: 12 },
    extraCssText: "border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.12);",
  };
}

export function dataZoomBottom() {
  const c = chartColors();
  return [
    { type: "inside" as const, throttle: 50 },
    {
      type: "slider" as const,
      height: 18,
      bottom: 8,
      borderColor: "transparent",
      backgroundColor: "transparent",
      fillerColor: c.border,
      handleSize: 16,
      handleStyle: { color: c.muted, borderColor: c.muted },
      moveHandleSize: 4,
      brushSelect: false,
      textStyle: { color: c.muted, fontSize: 10 },
    },
  ];
}
