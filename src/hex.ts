// Axial hex coordinates, pointy-top. Reference: https://www.redblobgames.com/grids/hexagons/

export interface Hex {
  q: number;
  r: number;
}

export interface Point {
  x: number;
  y: number;
}

const SQRT3 = Math.sqrt(3);

export const hex = (q: number, r: number): Hex => ({ q, r });

export const DIRECTIONS: readonly Hex[] = [hex(1, 0), hex(1, -1), hex(0, -1), hex(-1, 0), hex(-1, 1), hex(0, 1)];

export const add = (a: Hex, b: Hex): Hex => hex(a.q + b.q, a.r + b.r);

export const scale = (a: Hex, k: number): Hex => hex(a.q * k, a.r * k);

export const key = (h: Hex): string => `${h.q},${h.r}`;

export const neighbors = (h: Hex): Hex[] => DIRECTIONS.map((d) => add(h, d));

export function distance(a: Hex, b: Hex): number {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
}

export function hexToPixel(h: Hex, size: number): Point {
  return { x: size * (SQRT3 * h.q + (SQRT3 / 2) * h.r), y: size * 1.5 * h.r };
}

export function pixelToHex(p: Point, size: number): Hex {
  return round(((SQRT3 / 3) * p.x - p.y / 3) / size, ((2 / 3) * p.y) / size);
}

export function round(fq: number, fr: number): Hex {
  const fs = -fq - fr;
  let q = Math.round(fq);
  let r = Math.round(fr);
  const s = Math.round(fs);
  const dq = Math.abs(q - fq);
  const dr = Math.abs(r - fr);
  const ds = Math.abs(s - fs);
  if (dq > dr && dq > ds) q = -r - s;
  else if (dr > ds) r = -q - s;
  // + 0 turns -0 into 0
  return hex(q + 0, r + 0);
}

export function corners(size: number, center: Point = { x: 0, y: 0 }): Point[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return { x: center.x + size * Math.cos(angle), y: center.y + size * Math.sin(angle) };
  });
}

export function ring(center: Hex, radius: number): Hex[] {
  if (radius === 0) return [center];
  const result: Hex[] = [];
  let h = add(center, scale(DIRECTIONS[4], radius));
  for (let side = 0; side < 6; side++) {
    for (let step = 0; step < radius; step++) {
      result.push(h);
      h = add(h, DIRECTIONS[side]);
    }
  }
  return result;
}

export function spiral(center: Hex, radius: number): Hex[] {
  const result: Hex[] = [];
  for (let k = 0; k <= radius; k++) result.push(...ring(center, k));
  return result;
}
