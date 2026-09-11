import type { Point } from '../hex';

const SVG_NS = 'http://www.w3.org/2000/svg';

export type Attrs = Record<string, string | number>;

export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: Element[] = [],
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
  el.append(...children);
  return el;
}

// Rounds to keep generated path strings short.
export const num = (v: number): string => (Math.round(v * 1000) / 1000).toString();

export function pointsAttr(points: Point[]): string {
  return points.map((p) => `${num(p.x)},${num(p.y)}`).join(' ');
}

export function polyPath(points: Point[]): string {
  return `M${points.map((p) => `${num(p.x)} ${num(p.y)}`).join('L')}Z`;
}

export function circlePath(cx: number, cy: number, r: number): string {
  const [x0, x1, y, rr] = [num(cx - r), num(cx + r), num(cy), num(r)];
  return `M${x0} ${y}A${rr} ${rr} 0 1 1 ${x1} ${y}A${rr} ${rr} 0 1 1 ${x0} ${y}Z`;
}
