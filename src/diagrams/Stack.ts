import { Options } from '../config.js';
import { DiagramMultiContainer } from '../base/DiagramMultiContainer.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { enumerate, max } from '../utils/helpers.js';

function determineGaps(outer: number, inner: number): [number, number] {
  const diff = outer - inner;
  return [diff / 2, diff / 2];
}

export class Stack extends DiagramMultiContainer {
  constructor(...items: unknown[]) {
    super('g', items);
    if (items.length === 0) {
      throw new RangeError('Stack() must have at least one child.');
    }
    this.width = Math.max(...this.items.map((e) => e.width + (e.needsSpace ? 20 : 0)));
    if (this.items.length > 1) {
      this.width += Options.AR * 2;
    }
    this.needsSpace = true;
    this.up = this.items[0].up;
    this.down = this.items[this.items.length - 1].down;

    this.height = 0;
    const last = this.items.length - 1;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      this.height += item.height;
      if (i > 0) {
        this.height += Math.max(Options.AR * 2, item.up + Options.VS);
      }
      if (i < last) {
        this.height += Math.max(Options.AR * 2, item.down + Options.VS);
      }
    }
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'stack';
    }
  }

  format(x: number, y: number, width: number): this {
    const gaps = determineGaps(width, this.width);
    new Path(x, y).h(gaps[0]).addTo(this);
    x += gaps[0];
    const xInitial = x;
    if (this.items.length > 1) {
      new Path(x, y).h(Options.AR).addTo(this);
      x += Options.AR;
    }

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const innerWidth = this.width - (this.items.length > 1 ? Options.AR * 2 : 0);
      item.format(x, y, innerWidth).addTo(this);
      x += innerWidth;
      y += item.height;

      if (i !== this.items.length - 1) {
        new Path(x, y)
          .arc('ne')
          .downLine(Math.max(0, item.down + Options.VS - Options.AR * 2))
          .arc('es')
          .left(innerWidth)
          .arc('nw')
          .downLine(Math.max(0, this.items[i + 1].up + Options.VS - Options.AR * 2))
          .arc('ws')
          .addTo(this);
        y += Math.max(item.down + Options.VS, Options.AR * 2) + Math.max(this.items[i + 1].up + Options.VS, Options.AR * 2);
        x = xInitial + Options.AR;
      }
    }

    if (this.items.length > 1) {
      new Path(x, y).h(Options.AR).addTo(this);
      x += Options.AR;
    }
    new Path(x, y).h(gaps[1]).addTo(this);

    return this;
  }

  toTextDiagram(): TextDiagram {
    const [
      corner_bot_left,
      corner_bot_right,
      corner_top_left,
      corner_top_right,
      line,
      line_vertical,
    ] = TextDiagram._getParts([
      'corner_bot_left',
      'corner_bot_right',
      'corner_top_left',
      'corner_top_right',
      'line',
      'line_vertical',
    ]);

    const itemTDs: TextDiagram[] = [];
    for (const item of this.items) {
      itemTDs.push(item.toTextDiagram());
    }
    const maxWidth = Math.max(...itemTDs.map((itemTD) => itemTD.width));

    const leftLines: string[] = [];
    const rightLines: string[] = [];
    const separatorTD = new TextDiagram(0, 0, [line.repeat(maxWidth)]);
    let diagramTD: TextDiagram | null = null;

    for (const [itemNum, itemTD] of enumerate(itemTDs)) {
      if (itemNum === 0) {
        leftLines.push(line + line);
        for (let i = 0; i < itemTD.height - itemTD.entry - 1; i++) {
          leftLines.push('  ');
        }
      } else {
        diagramTD = diagramTD!.appendBelow(separatorTD, []);
        leftLines.push(corner_top_left + line);
        for (let i = 0; i < itemTD.entry; i++) {
          leftLines.push(line_vertical + ' ');
        }
        leftLines.push(corner_bot_left + line);
        for (let i = 0; i < itemTD.height - itemTD.entry - 1; i++) {
          leftLines.push('  ');
        }
        for (let i = 0; i < itemTD.exit; i++) {
          rightLines.push('  ');
        }
      }
      if (itemNum < itemTDs.length - 1) {
        rightLines.push(line + corner_top_right);
        for (let i = 0; i < itemTD.height - itemTD.exit - 1; i++) {
          rightLines.push(' ' + line_vertical);
        }
        rightLines.push(line + corner_bot_right);
      } else {
        rightLines.push(line + line);
      }
      const [leftPad, rightPad] = TextDiagram._gaps(maxWidth, itemTD.width);
      const paddedItemTD = itemTD.expand(leftPad, rightPad, 0, 0);
      if (itemNum === 0) {
        diagramTD = paddedItemTD;
      } else {
        diagramTD = diagramTD!.appendBelow(paddedItemTD, []);
      }
    }

    const leftTD = new TextDiagram(0, 0, leftLines);
    diagramTD = leftTD.appendRight(diagramTD!, '');
    const rightTD = new TextDiagram(0, rightLines.length - 1, rightLines);
    diagramTD = diagramTD.appendRight(rightTD, '');
    return diagramTD;
  }
}
