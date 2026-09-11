import { corners, type Point } from '../hex';
import { palette, terrainFill, TILE, type Terrain } from '../theme';
import { mulberry32, type Rng } from './rng';
import { num, pointsAttr, polyPath, svg, type Attrs } from './svg';

// A tile is a sand-colored card; the terrain is "printed" in a slightly smaller hex on top.
export const TILE_INSET = 0.965;
export const PRINT_INSET = 0.9;

interface Layer {
  d: string;
  fill: string;
  stroke?: string;
}

const SQRT3 = Math.sqrt(3);

function inHex(p: Point, radius: number): boolean {
  const ax = Math.abs(p.x);
  return ax <= (radius * SQRT3) / 2 && ax / SQRT3 + Math.abs(p.y) <= radius;
}

function scatter(s: number, stepX: number, stepY: number, rng: Rng, jitter: number): Point[] {
  const points: Point[] = [];
  for (let row = 0, y = -s; y <= s; row++, y += stepY) {
    for (let x = -s + (row % 2) * (stepX / 2); x <= s; x += stepX) {
      points.push({ x: x + (rng() - 0.5) * stepX * jitter, y: y + (rng() - 0.5) * stepY * jitter });
    }
  }
  return points;
}

// A filled curve that tapers to a point at both ends, like a single cut of a carving tool.
function taper(p0: Point, c1: Point, c2: Point, p3: Point, thickness: number): string {
  const len = Math.hypot(p3.x - p0.x, p3.y - p0.y) || 1;
  const ox = (-(p3.y - p0.y) / len) * thickness;
  const oy = ((p3.x - p0.x) / len) * thickness;
  return (
    `M${num(p0.x)} ${num(p0.y)}C${num(c1.x)} ${num(c1.y)} ${num(c2.x)} ${num(c2.y)} ${num(p3.x)} ${num(p3.y)}` +
    `C${num(c2.x + ox)} ${num(c2.y + oy)} ${num(c1.x + ox)} ${num(c1.y + oy)} ${num(p0.x)} ${num(p0.y)}Z`
  );
}

function jagged(a: Point, b: Point, segments: number, amplitude: number, rng: Rng): Point[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const points = [a];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const off = (rng() - 0.5) * 2 * amplitude;
    points.push({ x: a.x + dx * t - (dy / len) * off, y: a.y + dy * t + (dx / len) * off });
  }
  points.push(b);
  return points;
}

function water(s: number, rng: Rng): Layer[] {
  let d = '';
  for (const p of scatter(s, s * 0.3, s * 0.19, rng, 0.35)) {
    if (!inHex(p, s)) continue;
    const w = s * (0.08 + rng() * 0.04);
    const h = s * (0.045 + rng() * 0.02);
    d += taper(
      { x: p.x - w, y: p.y },
      { x: p.x - w * 0.35, y: p.y - h * 1.6 },
      { x: p.x + w * 0.35, y: p.y + h * 1.2 },
      { x: p.x + w, y: p.y - h * 0.3 },
      h * 0.7,
    );
  }
  return [{ d, fill: palette.ink }];
}

function pine(cx: number, base: number, h: number, w: number, rng: Rng): string {
  const top = base - h;
  const canopyBottom = base - h * 0.14;
  const tiers = 3;
  const right: Point[] = [];
  for (let i = 1; i <= tiers; i++) {
    const ty = top + ((canopyBottom - top) * i) / tiers;
    const tw = (w / 2) * (0.4 + (0.6 * i) / tiers) * (0.85 + rng() * 0.3);
    right.push({ x: tw, y: ty });
    if (i < tiers) right.push({ x: tw * 0.35, y: ty - h * 0.05 });
  }
  right.push({ x: w * 0.06, y: canopyBottom }, { x: w * 0.06, y: base });
  const left = right.map((p) => ({ x: -p.x, y: p.y })).reverse();
  return polyPath([{ x: 0, y: top }, ...right, ...left].map((p) => ({ x: cx + p.x, y: p.y })));
}

function forest(s: number, rng: Rng): Layer[] {
  let d = '';
  for (const p of scatter(s, s * 0.17, s * 0.15, rng, 0.4)) {
    if (!inHex(p, s * 1.05)) continue;
    const h = s * (0.2 + rng() * 0.08);
    d += pine(p.x, p.y + h / 2, h, s * (0.13 + rng() * 0.04), rng);
  }
  return [{ d, fill: palette.ink }];
}

function mountain(s: number, rng: Rng): Layer[] {
  const layers: Layer[] = [];
  const peaks = [
    { x: -0.32, y: -0.12, w: 0.55, h: 0.42 },
    { x: 0.3, y: -0.02, w: 0.6, h: 0.5 },
    { x: -0.05, y: 0.42, w: 0.75, h: 0.55 },
  ];
  for (const peak of peaks) {
    const cx = (peak.x + (rng() - 0.5) * 0.12) * s;
    const base = (peak.y + (rng() - 0.5) * 0.08) * s;
    const w = peak.w * s * (0.9 + rng() * 0.2);
    const h = peak.h * s * (0.9 + rng() * 0.2);
    const apex = { x: cx + (rng() - 0.5) * w * 0.2, y: base - h };
    const leftBase = { x: cx - w / 2, y: base };
    const left = jagged(leftBase, apex, 4, s * 0.05, rng);
    const right = jagged(apex, { x: cx + w / 2, y: base }, 4, s * 0.05, rng);
    const ridge = jagged({ x: cx + w * 0.08, y: base }, apex, 3, s * 0.04, rng);

    let ink = polyPath([...right, ...ridge.slice(0, -1)]);
    for (const t of [0.35, 0.55, 0.75]) {
      const from = { x: apex.x + (leftBase.x - apex.x) * t + s * 0.03, y: apex.y + (leftBase.y - apex.y) * t };
      const to = { x: from.x + w * 0.14, y: from.y + h * 0.16 };
      ink += taper(from, { x: from.x + w * 0.05, y: from.y }, { x: to.x - w * 0.03, y: to.y - h * 0.05 }, to, s * 0.014);
    }

    layers.push({ d: polyPath([...left, ...right.slice(1)]), fill: palette.mountainRock, stroke: palette.ink });
    layers.push({ d: ink, fill: palette.ink });
  }
  return layers;
}

function field(s: number, rng: Rng): Layer[] {
  let bricks = '';
  let stalks = '';
  let shade = '';
  const bw = s * 0.28;
  const bh = s * 0.13;
  const gap = s * 0.045;
  const lean = s * 0.03;
  for (let row = 0, y = -s; y <= s; row++, y += bh + gap) {
    for (let x = -s - (row % 2) * (bw / 2); x <= s; x += bw + gap) {
      const x0 = x + (rng() - 0.5) * gap * 0.6;
      const y0 = y + (rng() - 0.5) * gap * 0.4;
      if (!inHex({ x: x0 + bw / 2, y: y0 + bh / 2 }, s * 1.1)) continue;
      bricks += polyPath([
        { x: x0 + lean, y: y0 },
        { x: x0 + bw + lean, y: y0 },
        { x: x0 + bw, y: y0 + bh },
        { x: x0, y: y0 + bh },
      ]);
      shade += polyPath([
        { x: x0, y: y0 + bh },
        { x: x0 + bw, y: y0 + bh },
        { x: x0 + bw - lean * 0.3, y: y0 + bh + gap * 0.55 },
        { x: x0 - lean * 0.3, y: y0 + bh + gap * 0.55 },
      ]);
      for (let i = 1; i <= 5; i++) {
        const sx = x0 + (bw * i) / 6;
        stalks += taper(
          { x: sx, y: y0 + bh * 0.9 },
          { x: sx + lean * 0.2, y: y0 + bh * 0.6 },
          { x: sx + lean * 0.5, y: y0 + bh * 0.35 },
          { x: sx + lean * 0.8, y: y0 + bh * 0.12 },
          s * 0.012,
        );
      }
    }
  }
  return [
    { d: bricks, fill: palette.field },
    { d: stalks, fill: palette.fieldStalk },
    { d: shade, fill: palette.ink },
  ];
}

function plains(s: number, rng: Rng): Layer[] {
  let d = '';
  for (const p of scatter(s, s * 0.26, s * 0.22, rng, 0.9)) {
    if (!inHex(p, s * 0.95) || rng() < 0.35) continue;
    const blades = 3 + Math.floor(rng() * 2);
    for (let i = 0; i < blades; i++) {
      const angle = (i / (blades - 1) - 0.5) * 1.1 + (rng() - 0.5) * 0.2;
      const len = s * (0.06 + rng() * 0.04);
      const bw = s * 0.012;
      d += polyPath([
        { x: p.x - bw, y: p.y },
        { x: p.x + Math.sin(angle) * len, y: p.y - Math.cos(angle) * len },
        { x: p.x + bw, y: p.y },
      ]);
    }
  }
  return [{ d, fill: palette.ink }];
}

const MARKS: Record<Terrain, (s: number, rng: Rng) => Layer[]> = { water, forest, mountain, field, plains };

function layerPath(layer: Layer): SVGPathElement {
  const attrs: Attrs = { d: layer.d, fill: layer.fill };
  if (layer.stroke) {
    Object.assign(attrs, { stroke: layer.stroke, 'stroke-width': TILE * 0.02, 'stroke-linejoin': 'round' });
  }
  return svg('path', attrs);
}

// Draws a tile centered on the origin. Needs the <defs> from createDefs() somewhere in the document.
export function drawTile(terrain: Terrain, seed: number): SVGGElement {
  const outline = pointsAttr(corners(TILE * TILE_INSET));
  return svg('g', { class: `tile tile-${terrain}` }, [
    svg('polygon', { points: outline, fill: palette.sand }),
    svg('polygon', { points: pointsAttr(corners(TILE * PRINT_INSET)), fill: terrainFill[terrain] }),
    svg('g', { 'clip-path': 'url(#print-clip)' }, MARKS[terrain](TILE, mulberry32(seed)).map(layerPath)),
    svg('polygon', { points: outline, fill: 'url(#tile-burn)' }),
    svg('polygon', { points: outline, fill: 'url(#grain)' }),
    svg('polygon', {
      points: outline,
      fill: 'none',
      stroke: palette.ink,
      'stroke-opacity': 0.5,
      'stroke-width': TILE * 0.02,
    }),
  ]);
}
