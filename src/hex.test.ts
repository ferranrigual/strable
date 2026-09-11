import { describe, expect, it } from 'vitest';
import { corners, distance, hex, hexToPixel, key, neighbors, pixelToHex, ring, spiral } from './hex';

const SIZE = 50;
const map = spiral(hex(0, 0), 4);

describe('hex grid', () => {
  it('a radius-4 map has 61 distinct hexes', () => {
    expect(map).toHaveLength(61);
    expect(new Set(map.map(key)).size).toBe(61);
  });

  it('ring k has 6k hexes, all k steps from the center', () => {
    for (let k = 1; k <= 4; k++) {
      const hexes = ring(hex(0, 0), k);
      expect(hexes).toHaveLength(6 * k);
      for (const h of hexes) expect(distance(h, hex(0, 0))).toBe(k);
    }
  });

  it('every hex has 6 distinct neighbors, each 1 step away', () => {
    for (const h of map) {
      const around = neighbors(h);
      expect(new Set(around.map(key)).size).toBe(6);
      for (const n of around) expect(distance(h, n)).toBe(1);
    }
  });

  it('pixel conversion round-trips for every hex center', () => {
    for (const h of map) expect(pixelToHex(hexToPixel(h, SIZE), SIZE)).toEqual(h);
  });

  it('points just inside a hex, toward each corner, map back to that hex', () => {
    for (const h of map) {
      for (const c of corners(SIZE * 0.95, hexToPixel(h, SIZE))) {
        expect(pixelToHex(c, SIZE)).toEqual(h);
      }
    }
  });
});
