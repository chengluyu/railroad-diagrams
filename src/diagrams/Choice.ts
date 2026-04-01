import { Options } from '../config.js';
import { DiagramMultiContainer } from '../base/DiagramMultiContainer.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { determineGaps, max } from '../utils/helpers.js';

export class Choice extends DiagramMultiContainer {
  normal: number;
  separators: number[];

  constructor(normal: number, ...items: unknown[]) {
    super('g', items);
    if (typeof normal !== 'number' || normal !== Math.floor(normal)) {
      throw new TypeError('The first argument of Choice() must be an integer.');
    } else if (normal < 0 || normal >= items.length) {
      throw new RangeError('The first argument of Choice() must be an index for one of the items.');
    } else {
      this.normal = normal;
    }
    this.width = max(this.items, (el) => el.width) + Options.AR * 4;
    const firstItem = this.items[0];
    const normalItem = this.items[normal];

    this.separators = Array.from({ length: items.length - 1 }, () => 0);

    this.up = 0;
    let arcs: number;
    for (let i = normal - 1; i >= 0; i--) {
      if (i === normal - 1) arcs = Options.AR * 2;
      else arcs = Options.AR;

      const item = this.items[i];
      const lowerItem = this.items[i + 1];

      const entryDelta = lowerItem.up + Options.VS + item.down + item.height;
      const exitDelta = lowerItem.height + lowerItem.up + Options.VS + item.down;

      let separator = Options.VS;
      if (exitDelta < arcs || entryDelta < arcs) {
        separator += Math.max(arcs - entryDelta, arcs - exitDelta);
      }
      this.separators[i] = separator;
      this.up += lowerItem.up + separator + item.down + item.height;
    }
    this.up += firstItem.up;

    this.height = normalItem.height;

    this.down = 0;
    for (let i = normal + 1; i < this.items.length; i++) {
      if (i === normal + 1) arcs = Options.AR * 2;
      else arcs = Options.AR;

      const item = this.items[i];
      const upperItem = this.items[i - 1];

      const entryDelta = upperItem.height + upperItem.down + Options.VS + item.up;
      const exitDelta = upperItem.down + Options.VS + item.up + item.height;

      let separator = Options.VS;
      if (entryDelta < arcs || exitDelta < arcs) {
        separator += Math.max(arcs - entryDelta, arcs - exitDelta);
      }
      this.separators[i - 1] = separator;
      this.down += upperItem.down + separator + item.up + item.height;
    }
    this.down += this.items[this.items.length - 1].down;

    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'choice';
    }
  }

  format(x: number, y: number, width: number): this {
    const gaps = determineGaps(width, this.width);
    new Path(x, y).h(gaps[0]).addTo(this);
    new Path(x + gaps[0] + this.width, y + this.height).h(gaps[1]).addTo(this);
    x += gaps[0];

    const last = this.items.length - 1;
    const innerWidth = this.width - Options.AR * 4;

    let distanceFromY = 0;
    for (let i = this.normal - 1; i >= 0; i--) {
      const item = this.items[i];
      const lowerItem = this.items[i + 1];
      distanceFromY += lowerItem.up + this.separators[i] + item.down + item.height;
      new Path(x, y)
        .arc('se')
        .upLine(distanceFromY - Options.AR * 2)
        .arc('wn')
        .addTo(this);
      item.format(x + Options.AR * 2, y - distanceFromY, innerWidth).addTo(this);
      new Path(x + Options.AR * 2 + innerWidth, y - distanceFromY + item.height)
        .arc('ne')
        .downLine(distanceFromY - item.height + this.height - Options.AR * 2)
        .arc('ws')
        .addTo(this);
    }

    new Path(x, y).right(Options.AR * 2).addTo(this);
    this.items[this.normal].format(x + Options.AR * 2, y, innerWidth).addTo(this);
    new Path(x + Options.AR * 2 + innerWidth, y + this.height).right(Options.AR * 2).addTo(this);

    distanceFromY = 0;
    for (let i = this.normal + 1; i <= last; i++) {
      const item = this.items[i];
      const upperItem = this.items[i - 1];
      distanceFromY += upperItem.height + upperItem.down + this.separators[i - 1] + item.up;
      new Path(x, y)
        .arc('ne')
        .downLine(distanceFromY - Options.AR * 2)
        .arc('ws')
        .addTo(this);
      if (!item.format) console.log(item);
      item.format(x + Options.AR * 2, y + distanceFromY, innerWidth).addTo(this);
      new Path(x + Options.AR * 2 + innerWidth, y + distanceFromY + item.height)
        .arc('se')
        .upLine(distanceFromY - Options.AR * 2 + item.height - this.height)
        .arc('wn')
        .addTo(this);
    }

    return this;
  }

  toTextDiagram(): TextDiagram {
    const [
      cross,
      line,
      line_vertical,
      roundcorner_bot_left,
      roundcorner_bot_right,
      roundcorner_top_left,
      roundcorner_top_right,
    ] = TextDiagram._getParts([
      'cross',
      'line',
      'line_vertical',
      'roundcorner_bot_left',
      'roundcorner_bot_right',
      'roundcorner_top_left',
      'roundcorner_top_right',
    ]);

    const itemTDs: TextDiagram[] = [];
    for (const item of this.items) {
      itemTDs.push(item.toTextDiagram().expand(1, 1, 0, 0));
    }
    const max_item_width = Math.max(...itemTDs.map((itemTD) => itemTD.width));
    let diagramTD = new TextDiagram(0, 0, []);

    for (const [itemNum, itemTD] of itemTDs.entries()) {
      const [leftPad, rightPad] = TextDiagram._gaps(max_item_width, itemTD.width);
      const paddedItemTD = itemTD.expand(leftPad, rightPad, 0, 0);
      let hasSeparator = true;
      const leftLines: string[] = [];
      const rightLines: string[] = [];
      for (let i = 0; i < paddedItemTD.height; i++) {
        leftLines.push(line_vertical);
        rightLines.push(line_vertical);
      }
      let moveEntry = false;
      let moveExit = false;
      if (itemNum <= this.normal) {
        leftLines[paddedItemTD.entry] = roundcorner_top_left;
        rightLines[paddedItemTD.exit] = roundcorner_top_right;
        if (itemNum === 0) {
          hasSeparator = false;
          for (let i = 0; i < paddedItemTD.entry; i++) {
            leftLines[i] = ' ';
          }
          for (let i = 0; i < paddedItemTD.exit; i++) {
            rightLines[i] = ' ';
          }
        }
      }
      if (itemNum >= this.normal) {
        leftLines[paddedItemTD.entry] = roundcorner_bot_left;
        rightLines[paddedItemTD.exit] = roundcorner_bot_right;
        if (itemNum === 0) {
          hasSeparator = false;
        }
        if (itemNum === this.items.length - 1) {
          for (let i = paddedItemTD.entry + 1; i < paddedItemTD.height; i++) {
            leftLines[i] = ' ';
          }
          for (let i = paddedItemTD.exit + 1; i < paddedItemTD.height; i++) {
            rightLines[i] = ' ';
          }
        }
      }
      if (itemNum === this.normal) {
        leftLines[paddedItemTD.entry] = cross;
        rightLines[paddedItemTD.exit] = cross;
        moveEntry = true;
        moveExit = true;
        if (itemNum === 0 && itemNum === this.items.length - 1) {
          leftLines[paddedItemTD.entry] = line;
          rightLines[paddedItemTD.exit] = line;
        } else if (itemNum === 0) {
          leftLines[paddedItemTD.entry] = roundcorner_top_right;
          rightLines[paddedItemTD.exit] = roundcorner_top_left;
        } else if (itemNum === this.items.length - 1) {
          leftLines[paddedItemTD.entry] = roundcorner_bot_right;
          rightLines[paddedItemTD.exit] = roundcorner_bot_left;
        }
      }
      const leftJointTD = new TextDiagram(paddedItemTD.entry, paddedItemTD.entry, leftLines);
      const rightJointTD = new TextDiagram(paddedItemTD.exit, paddedItemTD.exit, rightLines);
      const joinedItemTD = leftJointTD.appendRight(paddedItemTD, '').appendRight(rightJointTD, '');
      const separator = hasSeparator
        ? [line_vertical + ' '.repeat(TextDiagram._maxWidth(diagramTD, joinedItemTD) - 2) + line_vertical]
        : [];
      diagramTD = diagramTD.appendBelow(joinedItemTD, separator, moveEntry, moveExit);
    }
    return diagramTD;
  }
}
