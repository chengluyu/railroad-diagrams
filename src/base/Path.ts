import { Options, Style } from '../config.js';
import { FakeSVG } from './FakeSVG.js';
import { TextDiagram } from '../text/TextDiagram.js';

/**
 * SVG Path element for drawing connections
 */
export class Path extends FakeSVG {
  constructor(x: number, y: number) {
    super('path');
    this.attrs.d = 'M' + x + ' ' + y;
    this.attrs['stroke-width'] = Style.PATH_STROKE_WIDTH;
    this.attrs.stroke = Style.PATH_STROKE;
    this.attrs.fill = Style.PATH_FILL;
  }

  m(x: number, y: number): this {
    this.attrs.d += 'm' + x + ' ' + y;
    return this;
  }

  h(val: number): this {
    this.attrs.d += 'h' + val;
    return this;
  }

  right(val: number): this {
    return this.h(Math.max(0, val));
  }

  left(val: number): this {
    return this.h(-Math.max(0, val));
  }

  v(val: number): this {
    this.attrs.d += 'v' + val;
    return this;
  }

  downLine(val: number): this {
    return this.v(Math.max(0, val));
  }

  upLine(val: number): this {
    return this.v(-Math.max(0, val));
  }

  arc(sweep: string): this {
    // 1/4 of a circle
    let x = Options.AR;
    let y = Options.AR;
    if (sweep[0] === 'e' || sweep[1] === 'w') {
      x *= -1;
    }
    if (sweep[0] === 's' || sweep[1] === 'n') {
      y *= -1;
    }
    const cw = sweep === 'ne' || sweep === 'es' || sweep === 'sw' || sweep === 'wn' ? 1 : 0;
    this.attrs.d += 'a' + Options.AR + ' ' + Options.AR + ' 0 0 ' + cw + ' ' + x + ' ' + y;
    return this;
  }

  arc_8(start: string, dir: 'cw' | 'ccw'): this {
    // 1/8 of a circle
    const arc = Options.AR;
    const s2 = (1 / Math.sqrt(2)) * arc;
    const s2inv = arc - s2;
    let path = 'a ' + arc + ' ' + arc + ' 0 0 ' + (dir === 'cw' ? '1' : '0') + ' ';
    const sd = start + dir;
    const offset =
      sd === 'ncw'
        ? [s2, s2inv]
        : sd === 'necw'
          ? [s2inv, s2]
          : sd === 'ecw'
            ? [-s2inv, s2]
            : sd === 'secw'
              ? [-s2, s2inv]
              : sd === 'scw'
                ? [-s2, -s2inv]
                : sd === 'swcw'
                  ? [-s2inv, -s2]
                  : sd === 'wcw'
                    ? [s2inv, -s2]
                    : sd === 'nwcw'
                      ? [s2, -s2inv]
                      : sd === 'nccw'
                        ? [-s2, s2inv]
                        : sd === 'nwccw'
                          ? [-s2inv, s2]
                          : sd === 'wccw'
                            ? [s2inv, s2]
                            : sd === 'swccw'
                              ? [s2, s2inv]
                              : sd === 'sccw'
                                ? [s2, -s2inv]
                                : sd === 'seccw'
                                  ? [s2inv, -s2]
                                  : sd === 'eccw'
                                    ? [-s2inv, -s2]
                                    : sd === 'neccw'
                                      ? [-s2, -s2inv]
                                      : null;
    if (offset === null) {
      throw new Error('Invalid arc_8 direction: ' + sd);
    }
    path += offset.join(' ');
    this.attrs.d += path;
    return this;
  }

  l(x: number, y: number): this {
    this.attrs.d += 'l' + x + ' ' + y;
    return this;
  }

  format(): this {
    // All paths in this library start/end horizontally.
    // The extra .5 ensures a minor overlap, so there's no seams in bad rasterizers.
    this.attrs.d += 'h.5';
    return this;
  }

  toTextDiagram(): TextDiagram {
    return new TextDiagram(0, 0, []);
  }
}
