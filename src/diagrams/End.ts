import { Options, Style } from '../config.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { TextDiagram } from '../text/TextDiagram.js';

export interface EndOptions {
  type?: 'simple' | 'complex';
}

export class End extends FakeSVG {
  type: string;

  constructor({ type = 'simple' }: EndOptions = {}) {
    super('path');
    this.width = 20;
    this.height = 0;
    this.up = 10;
    this.down = 10;
    this.type = type;
    this.attrs['stroke-width'] = Style.PATH_STROKE_WIDTH;
    this.attrs.stroke = Style.PATH_STROKE;
    this.attrs.fill = Style.PATH_FILL;
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'end';
    }
  }

  format(x: number, y: number): this {
    if (this.type === 'complex') {
      this.attrs.d = 'M ' + x + ' ' + y + ' h 20 m 0 -10 v 20';
    } else {
      this.attrs.d = 'M ' + x + ' ' + y + ' h 20 m -10 -10 v 20 m 10 -20 v 20';
    }
    return this;
  }

  toTextDiagram(): TextDiagram {
    const [cross, line, tee_left] = TextDiagram._getParts(['cross', 'line', 'tee_left']);
    const end = this.type === 'simple' ? line + cross + tee_left : line + tee_left;
    return new TextDiagram(0, 0, [end]);
  }
}
