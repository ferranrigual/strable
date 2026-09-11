import './style.css';
import { hex, hexToPixel, spiral, type Hex, type Point } from './hex';
import { createDefs } from './render/defs';
import { drawPiece } from './render/pieces';
import { hashHex } from './render/rng';
import { svg } from './render/svg';
import { drawTile } from './render/terrain';
import {
  palette,
  PIECES,
  PLAYERS,
  playerColors,
  TERRAINS,
  TILE,
  type PieceKind,
  type PlayerColor,
  type Terrain,
} from './theme';

const HEX_W = Math.sqrt(3) * TILE;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function art(viewBox: string, children: SVGElement[], label: string): SVGSVGElement {
  return svg('svg', { class: 'art', viewBox, role: 'img', 'aria-label': label }, children);
}

function at(node: SVGElement, p: Point): SVGGElement {
  return svg('g', { transform: `translate(${p.x} ${p.y})` }, [node]);
}

function section(title: string, note: string, ...content: Node[]): HTMLElement {
  const s = el('section');
  s.append(el('h2', '', title), el('p', '', note), ...content);
  return s;
}

function paletteSection(): HTMLElement {
  const grid = el('div', 'swatches');
  const entries: [string, string][] = [
    ...Object.entries(palette),
    ...PLAYERS.map((p): [string, string] => [p, playerColors[p].fill]),
  ];
  for (const [name, value] of entries) {
    const chip = el('div', 'swatch-chip');
    chip.style.background = value;
    const label = el('div', 'swatch-label');
    label.append(el('span', '', name), el('code', '', value));
    const swatch = el('div', 'swatch');
    swatch.append(chip, label);
    grid.append(swatch);
  }
  return section('Palette', 'Earth tones for the land, one strong color per player.', grid);
}

function terrainSection(): HTMLElement {
  const grid = el('div', 'terrain-grid');
  TERRAINS.forEach((terrain, t) => {
    const tiles = [0, 1, 2].map((i) => at(drawTile(terrain, hashHex(i, t)), { x: i * HEX_W, y: 0 }));
    const figure = el('figure');
    figure.append(
      art(`${-HEX_W / 2} ${-TILE} ${HEX_W * 3} ${TILE * 2}`, tiles, `${terrain} tiles`),
      el('figcaption', '', terrain),
    );
    grid.append(figure);
  });
  return section('Terrain', 'Three prints of each tile. The marks are generated, so no two tiles look the same.', grid);
}

const PIECE_GROUND: Record<PieceKind, Terrain> = {
  infantry: 'plains',
  cavalry: 'field',
  ship: 'water',
  walls: 'forest',
};

function piecesSection(): HTMLElement {
  const grid = el('div', 'piece-grid');
  for (const kind of PIECES) {
    grid.append(el('div', 'piece-row-label', kind));
    PLAYERS.forEach((color, i) => {
      grid.append(
        art(
          `${-HEX_W / 2} ${-TILE} ${HEX_W} ${TILE * 2}`,
          [drawTile(PIECE_GROUND[kind], hashHex(i, 9)), drawPiece(kind, color)],
          `${color} ${kind}`,
        ),
      );
    });
  }
  return section('Pieces', 'Chunky silhouettes with a drop shadow, like plastic pieces standing on the board.', grid);
}

// Terrain for each hex of a radius-2 spiral: center, then ring 1, then ring 2.
const PATCH_TERRAIN: Terrain[] = [
  'field',
  ...(['plains', 'forest', 'mountain', 'plains', 'water', 'forest'] as const),
  ...(['water', 'water', 'forest', 'mountain', 'mountain', 'plains', 'forest', 'water', 'water', 'water', 'plains', 'forest'] as const),
];

const PATCH_PIECES: [index: number, kind: PieceKind, color: PlayerColor][] = [
  [0, 'walls', 'red'],
  [9, 'walls', 'blue'],
  [0, 'infantry', 'red'],
  [1, 'cavalry', 'blue'],
  [5, 'ship', 'yellow'],
  [9, 'infantry', 'blue'],
  [12, 'infantry', 'black'],
];

function patchSection(): HTMLElement {
  const hexes = spiral(hex(0, 0), 2);
  const pos = (h: Hex) => hexToPixel(h, TILE);
  const tiles = hexes.map((h, i) => at(drawTile(PATCH_TERRAIN[i], hashHex(h.q, h.r)), pos(h)));
  // Walls go under figures, and lower figures overlap the ones behind them.
  const pieces = PATCH_PIECES.map(([i, kind, color]) => ({ kind, p: pos(hexes[i]), color }))
    .sort((a, b) => Number(b.kind === 'walls') - Number(a.kind === 'walls') || a.p.y - b.p.y)
    .map(({ kind, p, color }) => at(drawPiece(kind, color), p));
  const w = HEX_W * 5;
  const h = TILE * 8;
  const figure = el('figure', 'cluster');
  figure.append(art(`${-w / 2} ${-h / 2} ${w} ${h}`, [...tiles, ...pieces], 'A small patch of board'));
  return section('Board patch', 'How neighbouring tiles and pieces sit together.', figure);
}

document.body.prepend(svg('svg', { class: 'defs-host', 'aria-hidden': 'true' }, [createDefs()]));
document.querySelector<HTMLElement>('#app')!.append(paletteSection(), terrainSection(), piecesSection(), patchSection());
