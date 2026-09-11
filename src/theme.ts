// Hex circumradius in SVG units. All art is drawn at this size; zoom comes from the viewBox.
export const TILE = 50;

export const palette = {
  ink: '#2a2620',
  sand: '#d9b77e',
  plains: '#cdb071',
  forest: '#7d8a3e',
  water: '#a9cfd6',
  mountain: '#bfb193',
  mountainRock: '#7a7282',
  field: '#e0a23a',
  fieldDark: '#7d4c16',
  fieldStalk: '#a8661c',
  burn: '#5e3a1a',
  shadow: '#1a120a',
  table: '#3b2f25',
} as const;

export const TERRAINS = ['water', 'forest', 'mountain', 'field', 'plains'] as const;
export type Terrain = (typeof TERRAINS)[number];

export const terrainFill: Record<Terrain, string> = {
  water: palette.water,
  forest: palette.forest,
  mountain: palette.mountain,
  field: palette.fieldDark,
  plains: palette.plains,
};

export const PLAYERS = ['red', 'blue', 'yellow', 'black'] as const;
export type PlayerColor = (typeof PLAYERS)[number];

export const playerColors: Record<PlayerColor, { fill: string; light: string; shade: string }> = {
  red: { fill: '#d8432b', light: '#f07a5e', shade: '#7d2112' },
  blue: { fill: '#2a62c9', light: '#6a95e6', shade: '#16336e' },
  yellow: { fill: '#f1c232', light: '#fbe28c', shade: '#8c6a12' },
  black: { fill: '#3a3632', light: '#6e6760', shade: '#141210' },
};

export const PIECES = ['infantry', 'cavalry', 'ship', 'walls'] as const;
export type PieceKind = (typeof PIECES)[number];
