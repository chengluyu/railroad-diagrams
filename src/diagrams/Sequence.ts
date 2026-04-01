import { Options } from '../config.js';
import { DiagramMultiContainer } from '../base/DiagramMultiContainer.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { determineGaps, max } from '../utils/helpers.js';
import { FakeSVG } from '../base/FakeSVG.js';

export class Sequence extends DiagramMultiContainer {
  constructor(...items: unknown[]) {
    super('g', items);
    this.needsSpace = true;
    this.up = this.down = this.height = this.width = 0;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      this.width += item.width + (item.needsSpace ? 20 : 0);
      this.up = Math.max(this.up, item.up - this.height);
      this.height += item.height;
      this.down = Math.max(this.down - item.height, item.down);
    }
    if (this.items[0].needsSpace) this.width -= 10;
    if (this.items[this.items.length - 1].needsSpace) this.width -= 10;
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'sequence';
    }
  }

  format(x: number, y: number, width: number): this {
    const gaps = determineGaps(width, this.width);
    new Path(x, y).h(gaps[0]).addTo(this);
    new Path(x + gaps[0] + this.width, y + this.height).h(gaps[1]).addTo(this);
    x += gaps[0];

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.needsSpace && i > 0) {
        new Path(x, y).h(10).addTo(this);
        x += 10;
      }
      item.format(x, y, item.width).addTo(this);
      x += item.width;
      y += item.height;
      if (item.needsSpace && i < this.items.length - 1) {
        new Path(x, y).h(10).addTo(this);
        x += 10;
      }
    }
    return this;
  }

  toTextDiagram(): TextDiagram {
    const [separator] = TextDiagram._getParts(['separator']);
    let diagramTD = new TextDiagram(0, 0, ['']);
    for (const item of this.items) {
      let itemTD = item.toTextDiagram();
      if (item.needsSpace) {
        itemTD = itemTD.expand(1, 1, 0, 0);
      }
      diagramTD = diagramTD.appendRight(itemTD, separator);
    }
    return diagramTD;
  }
}
