import { Options, Style } from '../config.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';

export interface StartOptions {
  type?: 'simple' | 'complex';
  label?: string;
}

export class Start extends FakeSVG {
  type: string;
  label?: string;

  constructor({ type = 'simple', label }: StartOptions = {}) {
    super('g');
    this.width = 20;
    this.height = 0;
    this.up = 10;
    this.down = 10;
    this.type = type;
    if (label) {
      this.label = '' + label;
      this.width = Math.max(20, this.label.length * Options.CHAR_WIDTH + 10);
    }
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'start';
    }
  }

  format(x: number, y: number): this {
    const path = new Path(x, y - 10);
    if (this.type === 'complex') {
      path.downLine(20).m(0, -10).right(this.width).addTo(this);
    } else {
      path.downLine(20).m(10, -20).downLine(20).m(-10, -10).right(this.width).addTo(this);
    }
    if (this.label) {
      new FakeSVG('text', {
        x: x,
        y: y - 15,
        'text-anchor': 'start',
        font: Style.TEXT_FONT,
        fill: Style.TEXT_FILL,
      }, this.label).addTo(this);
    }
    return this;
  }

  toTextDiagram(): TextDiagram {
    const [cross, line, tee_right] = TextDiagram._getParts(['cross', 'line', 'tee_right']);
    const start = this.type === 'simple' ? tee_right + cross + line : tee_right + line;
    let labelTD = new TextDiagram(0, 0, []);
    if (this.label !== undefined) {
      labelTD = new TextDiagram(0, 0, [this.label]);
      const startTD = new TextDiagram(0, 0, [TextDiagram._padR(start, labelTD.width, line)]);
      return labelTD.appendBelow(startTD, [], true, true);
    }
    return labelTD.appendBelow(new TextDiagram(0, 0, [start]), [], true, true);
  }
}
