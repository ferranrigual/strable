import { corners } from '../hex';
import { palette, TILE } from '../theme';
import { mulberry32 } from './rng';
import { pointsAttr, svg } from './svg';
import { PRINT_INSET } from './terrain';

const GRAIN_SIZE = 96;

// Shared SVG definitions every tile references by id.
export function createDefs(): SVGDefsElement {
  return svg('defs', {}, [
    svg('clipPath', { id: 'print-clip', clipPathUnits: 'userSpaceOnUse' }, [
      svg('polygon', { points: pointsAttr(corners(TILE * PRINT_INSET)) }),
    ]),
    svg('radialGradient', { id: 'tile-burn' }, [burnStop(0.72, 0), burnStop(0.9, 0.3), burnStop(1, 0.55)]),
    svg('pattern', { id: 'grain', patternUnits: 'userSpaceOnUse', width: GRAIN_SIZE, height: GRAIN_SIZE }, [
      svg('image', { href: grainTexture(), width: GRAIN_SIZE, height: GRAIN_SIZE }),
    ]),
  ]);
}

function burnStop(offset: number, opacity: number): SVGStopElement {
  return svg('stop', { offset, 'stop-color': palette.burn, 'stop-opacity': opacity });
}

// Paper grain baked once into a small image; much cheaper to pan and zoom than an SVG noise filter.
function grainTexture(): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = GRAIN_SIZE;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(GRAIN_SIZE, GRAIN_SIZE);
  const rng = mulberry32(7);
  for (let i = 0; i < image.data.length; i += 4) {
    const dark = rng() < 0.5;
    image.data.set(dark ? [40, 28, 16] : [255, 244, 220], i);
    image.data[i + 3] = Math.floor(rng() * (dark ? 34 : 22));
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
