import { corners } from '../hex';
import { palette, playerColors, TILE, type PieceKind, type PlayerColor } from '../theme';
import { circlePath, polyPath, svg, type Attrs } from './svg';

// Glyphs are drawn in tile units (1 = TILE), standing on y = 0.
interface Glyph {
  parts: string[];
  light: string;
  detail: string;
  offsetY: number;
  lift: number;
}

const infantry: Glyph = {
  parts: [
    'M-0.2 -0.075H0.2V0H-0.2Z',
    'M-0.12 -0.07L0.12 -0.07L0.085 -0.33L-0.085 -0.33Z',
    'M-0.13 -0.3Q-0.13 -0.41 0 -0.41Q0.13 -0.41 0.13 -0.3Z',
    circlePath(0, -0.47, 0.075),
    'M0.155 -0.64H0.19V-0.075H0.155Z',
    'M0.14 -0.63L0.205 -0.63L0.1725 -0.74Z',
    'M-0.23 -0.36H-0.05V-0.22Q-0.05 -0.11 -0.14 -0.08Q-0.23 -0.11 -0.23 -0.22Z',
  ],
  light: 'M-0.2 -0.075H0.2V-0.055H-0.2Z' + 'M-0.21 -0.34H-0.15V-0.12Q-0.21 -0.14 -0.21 -0.22Z' + circlePath(-0.025, -0.495, 0.025),
  detail: 'M-0.14 -0.33V-0.11M-0.21 -0.25H-0.07',
  offsetY: 0.32,
  lift: 0.06,
};

const cavalry: Glyph = {
  parts: [
    'M-0.28 -0.075H0.28V0H-0.28Z',
    'M-0.18 -0.2H-0.14V-0.07H-0.18Z',
    'M-0.1 -0.2H-0.06V-0.07H-0.1Z',
    'M0.08 -0.2H0.12V-0.07H0.08Z',
    'M0.15 -0.2H0.19V-0.07H0.15Z',
    'M-0.21 -0.22Q-0.22 -0.33 -0.06 -0.33H0.13Q0.22 -0.33 0.22 -0.23Q0.22 -0.16 0.13 -0.16H-0.13Q-0.21 -0.16 -0.21 -0.22Z',
    'M-0.2 -0.29Q-0.31 -0.25 -0.28 -0.12L-0.24 -0.13Q-0.25 -0.22 -0.19 -0.24Z',
    'M0.12 -0.29L0.21 -0.45L0.31 -0.43L0.34 -0.36L0.25 -0.35L0.2 -0.24Z',
    'M-0.07 -0.3L0.06 -0.3L0.04 -0.47L-0.05 -0.47Z',
    circlePath(-0.005, -0.53, 0.06),
    'M-0.15 -0.3L0.4 -0.66L0.415 -0.635L-0.13 -0.27Z',
  ],
  light: 'M-0.28 -0.075H0.28V-0.055H-0.28Z' + 'M-0.15 -0.31H0.12Q0.18 -0.31 0.19 -0.27H-0.18Q-0.18 -0.3 -0.15 -0.31Z',
  detail: 'M0.28 -0.43L0.27 -0.48M-0.02 -0.32V-0.2',
  offsetY: 0.3,
  lift: 0.06,
};

const ship: Glyph = {
  parts: [
    'M-0.3 -0.17H0.3L0.22 -0.02Q0 0.03 -0.22 -0.02Z',
    'M-0.33 -0.28H-0.15V-0.16H-0.3Z',
    'M0.27 -0.15L0.43 -0.26L0.445 -0.24L0.29 -0.12Z',
    'M-0.015 -0.74H0.015V-0.16H-0.015Z',
    'M-0.19 -0.58H0.19Q0.25 -0.45 0.19 -0.3H-0.19Q-0.13 -0.45 -0.19 -0.58Z',
    'M-0.12 -0.66H0.12Q0.15 -0.63 0.12 -0.6H-0.12Q-0.09 -0.63 -0.12 -0.66Z',
    'M0.015 -0.74L0.13 -0.7L0.015 -0.66Z',
  ],
  light: 'M-0.17 -0.56H-0.08Q-0.03 -0.45 -0.08 -0.32H-0.17Q-0.12 -0.45 -0.17 -0.56Z' + 'M-0.3 -0.17H0.3L0.29 -0.145H-0.29Z',
  detail: 'M-0.25 -0.09H0.25M-0.17 -0.44Q0 -0.4 0.2 -0.44',
  offsetY: 0.28,
  lift: 0.05,
};

// A crenellated wall ring with a round tower on each corner, sitting around the tile edge.
function walls(): Glyph {
  // Everything must stay inside the printed area (0.9) so walls never spill onto neighbors.
  const outerR = 0.74;
  const innerR = 0.6;
  const midR = (outerR + innerR) / 2;
  const outer = corners(outerR);
  const mid = corners(midR);
  let merlons = '';
  let towers = '';
  let caps = '';
  let path = '';
  outer.forEach((a, i) => {
    const b = outer[(i + 1) % 6];
    const ux = (b.x - a.x) / outerR;
    const uy = (b.y - a.y) / outerR;
    const [nx, ny] = [uy, -ux];
    for (const t of [0.3, 0.5, 0.7]) {
      const cx = a.x + (b.x - a.x) * t - nx * 0.02;
      const cy = a.y + (b.y - a.y) * t - ny * 0.02;
      const depth = 0.07;
      merlons += polyPath([
        { x: cx - ux * 0.04, y: cy - uy * 0.04 },
        { x: cx - ux * 0.04 + nx * depth, y: cy - uy * 0.04 + ny * depth },
        { x: cx + ux * 0.04 + nx * depth, y: cy + uy * 0.04 + ny * depth },
        { x: cx + ux * 0.04, y: cy + uy * 0.04 },
      ]);
    }
    const spot = mid[i];
    towers += circlePath(spot.x, spot.y, 0.11);
    caps += circlePath(spot.x - 0.03, spot.y - 0.03, 0.05);
    const q = mid[(i + 1) % 6];
    path += `M${spot.x + (q.x - spot.x) * 0.25} ${spot.y + (q.y - spot.y) * 0.25}L${spot.x + (q.x - spot.x) * 0.75} ${spot.y + (q.y - spot.y) * 0.75}`;
  });
  return {
    parts: [polyPath(outer) + polyPath(corners(innerR)), merlons, towers],
    light: caps,
    detail: path,
    offsetY: 0,
    lift: 0.025,
  };
}

const GLYPHS: Record<PieceKind, Glyph> = { infantry, cavalry, ship, walls: walls() };

// Draws a piece centered on the origin of a tile.
export function drawPiece(kind: PieceKind, color: PlayerColor): SVGGElement {
  const glyph = GLYPHS[kind];
  const c = playerColors[color];
  const silhouette = (attrs: Attrs) =>
    svg('g', { 'fill-rule': 'evenodd', ...attrs }, glyph.parts.map((d) => svg('path', { d })));
  return svg('g', { class: `piece piece-${kind}`, transform: `scale(${TILE}) translate(0 ${glyph.offsetY})` }, [
    silhouette({ fill: palette.shadow, opacity: 0.38, transform: `translate(${glyph.lift * 0.6} ${glyph.lift})` }),
    // Wide stroke underneath the fill gives one clean outline around overlapping parts.
    silhouette({ fill: c.shade, stroke: c.shade, 'stroke-width': 0.05, 'stroke-linejoin': 'round' }),
    silhouette({ fill: c.fill }),
    svg('path', { d: glyph.light, fill: c.light, 'fill-opacity': 0.75 }),
    svg('path', { d: glyph.detail, fill: 'none', stroke: c.shade, 'stroke-width': 0.02, 'stroke-linecap': 'round' }),
  ]);
}
