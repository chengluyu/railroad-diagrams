import { Options } from '../config.js';
import { DiagramMultiContainer } from '../base/DiagramMultiContainer.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { determineGaps, enumerate, max, sum } from '../utils/helpers.js';
import { Sequence } from './Sequence.js';

export class HorizontalChoice extends DiagramMultiContainer {
  _upperTrack!: number;
  _lowerTrack!: number;

  constructor(...items: unknown[]) {
    super('g', items);
    if (items.length === 0) {
      throw new RangeError('HorizontalChoice() must have at least one child.');
    }
    if (items.length === 1) {
      return new Sequence(items[0]) as unknown as this;
    }
    const allButLast = this.items.slice(0, -1);
    const middles = this.items.slice(1, -1);
    const first = this.items[0];
    const last = this.items[this.items.length - 1];
    this.needsSpace = false;

    this.width = Options.AR;
    this.width += Options.AR * 2 * (this.items.length - 1);
    this.width += sum(this.items, (x) => x.width + (x.needsSpace ? 20 : 0));
    this.width += last.height > 0 ? Options.AR : 0;
    this.width += Options.AR;

    this.height = 0;

    this._upperTrack = Math.max(Options.AR * 2, Options.VS, max(allButLast, (x) => x.up) + Options.VS);
    this.up = Math.max(this._upperTrack, last.up);

    this._lowerTrack = Math.max(
      Options.VS,
      max(middles, (x) => x.height + Math.max(x.down + Options.VS, Options.AR * 2)),
      last.height + last.down + Options.VS
    );
    if (first.height < this._lowerTrack) {
      this._lowerTrack = Math.max(this._lowerTrack, first.height + Options.AR * 2);
    }
    this.down = Math.max(this._lowerTrack, first.height + first.down);

    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'horizontalchoice';
    }
  }

  format(x: number, y: number, width: number): this {
    const gaps = determineGaps(width, this.width);
    new Path(x, y).h(gaps[0]).addTo(this);
    new Path(x + gaps[0] + this.width, y + this.height).h(gaps[1]).addTo(this);
    x += gaps[0];

    const first = this.items[0];
    const last = this.items[this.items.length - 1];
    const allButFirst = this.items.slice(1);
    const allButLast = this.items.slice(0, -1);

    const upperSpan = sum(allButLast, (x) => x.width + (x.needsSpace ? 20 : 0)) + (this.items.length - 2) * Options.AR * 2 - Options.AR;
    new Path(x, y)
      .arc('se')
      .v(-(this._upperTrack - Options.AR * 2))
      .arc('wn')
      .h(upperSpan)
      .addTo(this);

    const lowerSpan =
      sum(allButFirst, (x) => x.width + (x.needsSpace ? 20 : 0)) +
      (this.items.length - 2) * Options.AR * 2 +
      (last.height > 0 ? Options.AR : 0) -
      Options.AR;
    const lowerStart = x + Options.AR + first.width + (first.needsSpace ? 20 : 0) + Options.AR * 2;
    new Path(lowerStart, y + this._lowerTrack)
      .h(lowerSpan)
      .arc('se')
      .v(-(this._lowerTrack - Options.AR * 2))
      .arc('wn')
      .addTo(this);

    for (const [i, item] of enumerate(this.items)) {
      if (i === 0) {
        new Path(x, y).h(Options.AR).addTo(this);
        x += Options.AR;
      } else {
        new Path(x, y - this._upperTrack)
          .arc('ne')
          .v(this._upperTrack - Options.AR * 2)
          .arc('ws')
          .addTo(this);
        x += Options.AR * 2;
      }

      const itemWidth = item.width + (item.needsSpace ? 20 : 0);
      item.format(x, y, itemWidth).addTo(this);
      x += itemWidth;

      if (i === this.items.length - 1) {
        if (item.height === 0) {
          new Path(x, y).h(Options.AR).addTo(this);
        } else {
          new Path(x, y + item.height).arc('se').addTo(this);
        }
      } else if (i === 0 && item.height > this._lowerTrack) {
        if (item.height - this._lowerTrack >= Options.AR * 2) {
          new Path(x, y + item.height)
            .arc('se')
            .v(this._lowerTrack - item.height + Options.AR * 2)
            .arc('wn')
            .addTo(this);
        } else {
          new Path(x, y + item.height).l(Options.AR * 2, this._lowerTrack - item.height).addTo(this);
        }
      } else {
        new Path(x, y + item.height)
          .arc('ne')
          .v(this._lowerTrack - item.height - Options.AR * 2)
          .arc('ws')
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
    const SOILToBaseline = Math.max(...itemTDs.slice(0, -1).map((itemTD) => itemTD.entry));
    const topToSOIL = diagramEntry - SOILToBaseline;
    const baselineToSUIL = Math.max(
      ...itemTDs.slice(1).map((itemTD) => itemTD.height - Math.min(itemTD.entry, itemTD.exit) - 1)
    );

    const lines: string[] = [];
    for (let i = 0; i < topToSOIL; i++) {
      lines.push('  ');
    }
    lines.push(roundcorner_top_left + line);
    for (let i = 0; i < SOILToBaseline; i++) {
      lines.push(line_vertical + ' ');
    }
    lines.push(roundcorner_bot_right + line);
    let diagramTD = new TextDiagram(lines.length - 1, lines.length - 1, lines);

    for (const [itemNum, itemTD] of enumerate(itemTDs)) {
      if (itemNum > 0) {
        const lines: string[] = [];
        for (let i = 0; i < topToSOIL; i++) {
          lines.push('  ');
        }
        const lineToNextItem = itemNum === itemTDs.length - 1 ? ' ' : line;
        lines.push(roundcorner_top_right + lineToNextItem);
        for (let i = 0; i < SOILToBaseline; i++) {
          lines.push(line_vertical + ' ');
        }
        lines.push(roundcorner_bot_left + line);
        for (let i = 0; i < baselineToSUIL; i++) {
          lines.push(line_vertical + ' ');
        }
        lines.push(line + line);
        const entryTD = new TextDiagram(diagramTD.exit, diagramTD.exit, lines);
        diagramTD = diagramTD.appendRight(entryTD, '');
      }

      let partTD = new TextDiagram(0, 0, []);
      if (itemNum < itemTDs.length - 1) {
        const lines: string[] = [];
        lines.push(line.repeat(itemTD.width));
        for (let i = 0; i < SOILToBaseline - itemTD.entry; i++) {
          lines.push(' '.repeat(itemTD.width));
        }
        const SOILSegment = new TextDiagram(0, 0, lines);
        partTD = partTD.appendBelow(SOILSegment, []);
      }
      partTD = partTD.appendBelow(itemTD, [], true, true);
      if (itemNum > 0) {
        const lines: string[] = [];
        for (let i = 0; i < baselineToSUIL - (itemTD.height - itemTD.entry) + 1; i++) {
          lines.push(' '.repeat(itemTD.width));
        }
        lines.push(line.repeat(itemTD.width));
        const SUILSegment = new TextDiagram(0, 0, lines);
        partTD = partTD.appendBelow(SUILSegment, []);
      }
      diagramTD = diagramTD.appendRight(partTD, '');

      if (itemNum < itemTDs.length - 1) {
        const lines: string[] = [];
        for (let i = 0; i < topToSOIL; i++) {
          lines.push('  ');
        }
        lines.push(line + line);
        for (let i = 0; i < diagramTD.exit - topToSOIL - 1; i++) {
          lines.push('  ');
        }
        lines.push(line + roundcorner_top_right);
        for (let i = 0; i < baselineToSUIL - (diagramTD.exit - diagramTD.entry); i++) {
          lines.push(' ' + line_vertical);
        }
        const lineFromPrevItem = itemNum > 0 ? line : ' ';
        lines.push(lineFromPrevItem + roundcorner_bot_left);
        const entry = diagramEntry + 1 + (diagramTD.exit - diagramTD.entry);
        const exitTD = new TextDiagram(entry, diagramEntry + 1, lines);
        diagramTD = diagramTD.appendRight(exitTD, '');
      } else {
        const lines: string[] = [];
        const lineFromExit = diagramTD.exit !== diagramTD.entry ? ' ' : line;
        lines.push(lineFromExit + roundcorner_top_left);
        for (let i = 0; i < diagramTD.exit - diagramTD.entry - 1; i++) {
          lines.push(' ' + line_vertical);
        }
        if (diagramTD.exit !== diagramTD.entry) {
          lines.push(line + roundcorner_bot_right);
        }
        for (let i = 0; i < baselineToSUIL - (diagramTD.exit - diagramTD.entry); i++) {
          lines.push(' ' + line_vertical);
        }
        lines.push(line + roundcorner_bot_right);
        const exitTD = new TextDiagram(diagramTD.exit - diagramTD.entry, 0, lines);
        diagramTD = diagramTD.appendRight(exitTD, '');
      }
    }
    return diagramTD;
  }
}
