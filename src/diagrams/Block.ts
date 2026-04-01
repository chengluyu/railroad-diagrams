import { Options, Style } from '../config.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { determineGaps } from '../utils/helpers.js';

export interface BlockOptions {
  width?: number;
  up?: number;
  height?: number;
  down?: number;
  needsSpace?: boolean;
}

export class Block extends FakeSVG {
  constructor({ width = 50, up = 15, height = 25, down = 15, needsSpace = true }: BlockOptions = {}) {
    super('g');
    this.width = width;
    this.height = height;
    this.up = up;
    this.down = down;
    this.needsSpace = needsSpace;
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'block';
    }
  }

  format(x: number, y: number, width: number): this {
    const gaps = determineGaps(width, this.width);
    new Path(x, y).h(gaps[0]).addTo(this);
    new Path(x + gaps[0] + this.width, y).h(gaps[1]).addTo(this);
    x += gaps[0];

    new FakeSVG('rect', {
      x: x,
      y: y - this.up!,
      width: this.width,
      height: this.up! + this.height + this.down!,
      'stroke-width': Style.RECT_STROKE_WIDTH,
      stroke: Style.RECT_STROKE,
      fill: Style.RECT_FILL,
    }).addTo(this);
    return this;
  }

  toTextDiagram(): TextDiagram {
    return TextDiagram.rect('');
  }
}
