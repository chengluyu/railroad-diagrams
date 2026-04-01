import { Options } from '../config.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';

export class Skip extends FakeSVG {
  constructor() {
    super('g');
    this.width = 0;
    this.height = 0;
    this.up = 0;
    this.down = 0;
    this.needsSpace = false;
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'skip';
    }
  }

  format(x: number, y: number, width: number): this {
    new Path(x, y).right(width).addTo(this);
    return this;
  }

  toTextDiagram(): TextDiagram {
    const [line] = TextDiagram._getParts(['line']);
    return new TextDiagram(0, 0, [line]);
  }
}
