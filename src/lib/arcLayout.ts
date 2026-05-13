import { TOTAL_SEATS } from "./parties";

export interface ArcPos {
  row: number;
  cx: number;
  cy: number;
}

export const ARC = {
  rows: 8,
  rInner: 70,
  rOuter: 145,
  seatR: 4,
};

export function computeArcLayout(): ArcPos[] {
  const { rows, rInner, rOuter } = ARC;
  const radii: number[] = [];
  for (let r = 0; r < rows; r++) {
    radii.push(rInner + (r / (rows - 1)) * (rOuter - rInner));
  }
  const totalR = radii.reduce((a, b) => a + b, 0);
  const seatsPerRow = radii.map((rad) =>
    Math.round((TOTAL_SEATS * rad) / totalR)
  );
  let sum = seatsPerRow.reduce((a, b) => a + b, 0);
  let k = 0;
  while (sum !== TOTAL_SEATS && k < 200) {
    if (sum < TOTAL_SEATS) {
      seatsPerRow[rows - 1 - (k % rows)]++;
      sum++;
    } else {
      seatsPerRow[k % rows]--;
      sum--;
    }
    k++;
  }

  const all: { row: number; angle: number; cx: number; cy: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const count = seatsPerRow[r];
    const rad = radii[r];
    for (let s = 0; s < count; s++) {
      const angle =
        count === 1 ? Math.PI / 2 : Math.PI - (s / (count - 1)) * Math.PI;
      all.push({
        row: r,
        angle,
        cx: rad * Math.cos(angle),
        cy: -rad * Math.sin(angle),
      });
    }
  }
  all.sort((a, b) => {
    if (Math.abs(b.angle - a.angle) > 0.001) return b.angle - a.angle;
    return b.row - a.row;
  });
  return all.map(({ row, cx, cy }) => ({ row, cx, cy }));
}
