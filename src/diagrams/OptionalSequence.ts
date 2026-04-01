import { Options } from '../config.js';
import { DiagramMultiContainer } from '../base/DiagramMultiContainer.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { determineGaps, max, sum } from '../utils/helpers.js';
import { Sequence } from './Sequence.js';

export class OptionalSequence extends DiagramMultiContainer {
  constructor(...items: unknown[]) {
    super('g', items);
    if (items.length === 0) {
      throw new RangeError('OptionalSequence() must have at least one child.');
    }
    if (items.length === 1) {
      return new Sequence(items[0]) as unknown as this;
    }
    const arc = Options.AR;
    this.needsSpace = false;
    this.width = 0;
    this.up = 0;
    this.height = sum(this.items, (x) => x.height);
    this.down = this.items[0].down;
    let heightSoFar = 0;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      this.up = Math.max(this.up, Math.max(arc * 2, item.up + Options.VS) - heightSoFar);
      heightSoFar += item.height;
      if (i > 0) {
        this.down = Math.max(this.height + this.down, heightSoFar + Math.max(arc * 2, item.down + Options.VS)) - this.height;
      }
      const itemWidth = (item.needsSpace ? 10 : 0) + item.width;
      if (i === 0) {
        this.width += arc + Math.max(itemWidth, arc);
      } else {
        this.width += arc * 2 + Math.max(itemWidth, arc) + arc;
      }
    }
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'optseq';
    }
  }

  format(x: number, y: number, width: number): this {
    const arc = Options.AR;
    const gaps = determineGaps(width, this.width);
    new Path(x, y).right(gaps[0]).addTo(this);
    new Path(x + gaps[0] + this.width, y + this.height).right(gaps[1]).addTo(this);
    x += gaps[0];
    const upperLineY = y - this.up;
    const last = this.items.length - 1;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const itemSpace = item.needsSpace ? 10 : 0;
      const itemWidth = item.width + itemSpace;

      if (i === 0) {
        new Path(x, y)
          .arc('se')
          .upLine(y - upperLineY - arc * 2)
          .arc('wn')
          .right(itemWidth - arc)
          .arc('ne')
          .downLine(y + item.height - upperLineY - arc * 2)
          .arc('ws')
          .addTo(this);
        new Path(x, y).right(itemSpace + arc).addTo(this);
        item.format(x + itemSpace + arc, y, item.width).addTo(this);
        x += itemWidth + arc;
        y += item.height;
      } else if (i < last) {
        new Path(x, upperLineY)
          .right(arc * 2 + Math.max(itemWidth, arc) + arc)
          .arc('ne')
          .downLine(y - upperLineY + item.height - arc * 2)
          .arc('ws')
          .addTo(this);
        new Path(x, y).right(arc * 2).addTo(this);
        item.format(x + arc * 2, y, item.width).addTo(this);
        new Path(x + item.width + arc * 2, y + item.height).right(itemSpace + arc).addTo(this);
        new Path(x, y)
          .arc('ne')
          .downLine(item.height + Math.max(item.down + Options.VS, arc * 2) - arc * 2)
          .arc('ws')
          .right(itemWidth - arc)
          .arc('se')
          .upLine(item.down + Options.VS - arc * 2)
          .arc('wn')
          .addTo(this);
        x += arc * 2 + Math.max(itemWidth, arc) + arc;
        y += item.height;
      } else {
        new Path(x, y).right(arc * 2).addTo(this);
        item.format(x + arc * 2, y, item.width).addTo(this);
        new Path(x + arc * 2 + item.width, y + item.height).right(itemSpace + arc).addTo(this);
        new Path(x, y)
          .arc('ne')
          .downLine(item.height + Math.max(item.down + Options.VS, arc * 2) - arc * 2)
          .arc('ws')
          .right(itemWidth - arc)
          .arc('se')
          .upLine(item.down + Options.VS - arc * 2)
          .arc('wn')
          .addTo(this);
      }
    }
    return this;
  }

  toTextDiagram(): TextDiagram {
    const [
      line,
      line_vertical,
      roundcorner_bot_left,
      roundcorner_bot_right,
      roundcorner_top_left,
      roundcorner_top_right,
    ] = TextDiagram._getParts([
      'line',
      'line_vertical',
      'roundcorner_bot_left',
      'roundcorner_bot_right',
      'roundcorner_top_left',
      'roundcorner_top_right',
    ]);

    const itemTDs: TextDiagram[] = [];
    for (const item of this.items) {
      itemTDs.push(item.toTextDiagram());
    }
    const diagramEntry = Math.max(...itemTDs.map((itemTD) => itemTD.entry));
    const SOILHeight = Math.max(...itemTDs.slice(0, -1).map((itemTD) => itemTD.entry));
    const topToSOIL = diagramEntry - SOILHeight;

    const lines: string[] = [];
    for (let i = 0; i < topToSOIL; i++) {
      lines.push('  ');
    }
    lines.push(roundcorner_top_left + line);
    for (let i = 0; i < SOILHeight; i++) {
      lines.push(line_vertical + ' ');
    }
    lines.push(roundcorner_bot_right + line);
    let diagramTD = new TextDiagram(lines.length - 1, lines.length - 1, lines);

    for (const [itemNum, itemTD] of itemTDs.entries()) {
      if (itemNum > 0) {
        const lines: string[] = [];
        for (let i = 0; i < topToSOIL; i++) {
          lines.push('  ');
        }
        lines.push(line + line);
        for (let i = 0; i < diagramTD.exit - topToSOIL - 1; i++) {
          lines.push('  ');
        }
        lines.push(line + roundcorner_top_right);
        for (let i = 0; i < itemTD.height - itemTD.entry - 1; i++) {
          lines.push(' ' + line_vertical);
        }
        lines.push(' ' + roundcorner_bot_left);
        const skipDownTD = new TextDiagram(diagramTD.exit, diagramTD.exit, lines);
        diagramTD = diagramTD.appendRight(skipDownTD, '');

        const entryLines: string[] = [];
        for (let i = 0; i < topToSOIL; i++) {
          entryLines.push('  ');
        }
        const lineToNextItem = itemNum < itemTDs.length - 1 ? line : ' ';
        entryLines.push(line + roundcorner_top_right + lineToNextItem);
        for (let i = 0; i < diagramTD.exit - topToSOIL - 1; i++) {
          entryLines.push(' ' + line_vertical + ' ');
        }
        entryLines.push(line + roundcorner_bot_left + line);
        for (let i = 0; i < itemTD.height - itemTD.entry - 1; i++) {
          entryLines.push('   ');
        }
        entryLines.push(line + line + line);
        const entryTD = new TextDiagram(diagramTD.exit, diagramTD.exit, entryLines);
        diagramTD = diagramTD.appendRight(entryTD, '');
      }

      let partTD = new TextDiagram(0, 0, []);
      if (itemNum < itemTDs.length - 1) {
        const lines: string[] = [];
        lines.push(line.repeat(itemTD.width));
        for (let i = 0; i < SOILHeight - itemTD.entry; i++) {
          lines.push(' '.repeat(itemTD.width));
        }
        const SOILSegment = new TextDiagram(0, 0, lines);
        partTD = partTD.appendBelow(SOILSegment, []);
      }
      partTD = partTD.appendBelow(itemTD, [], true, true);
      if (itemNum > 0) {
        const SUILSegment = new TextDiagram(0, 0, [line.repeat(itemTD.width)]);
        partTD = partTD.appendBelow(SUILSegment, []);
      }
      diagramTD = diagramTD.appendRight(partTD, '');

      if (itemNum > 0) {
        const lines: string[] = [];
        for (let i = 0; i < topToSOIL; i++) {
          lines.push('  ');
        }
        const skipOverChar = itemNum < itemTDs.length - 1 ? line : ' ';
        lines.push(skipOverChar.repeat(2));
        for (let i = 0; i < diagramTD.exit - topToSOIL - 1; i++) {
          lines.push('  ');
        }
        lines.push(line + roundcorner_top_left);
        for (let i = 0; i < partTD.height - partTD.exit - 2; i++) {
          lines.push(' ' + line_vertical);
        }
        lines.push(line + roundcorner_bot_right);
        const skipUpTD = new TextDiagram(diagramTD.exit, diagramTD.exit, lines);
        diagramTD = diagramTD.appendRight(skipUpTD, '');
      }
    }
    return diagramTD;
  }
}
