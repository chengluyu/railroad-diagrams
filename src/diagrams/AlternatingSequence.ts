import { Options } from '../config.js';
import { DiagramMultiContainer } from '../base/DiagramMultiContainer.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { determineGaps, max } from '../utils/helpers.js';
import { Sequence } from './Sequence.js';

export class AlternatingSequence extends DiagramMultiContainer {
  constructor(...items: unknown[]) {
    super('g', items);
    if (items.length === 1) {
      return new Sequence(items[0]) as unknown as this;
    }
    if (items.length !== 2) {
      throw new RangeError('AlternatingSequence() must have one or two children.');
    }
    this.needsSpace = false;

    const arc = Options.AR;
    const vert = Options.VS;
    const first = this.items[0];
    const second = this.items[1];

    const arcX = (1 / Math.sqrt(2)) * arc * 2;
    const arcY = (1 - 1 / Math.sqrt(2)) * arc * 2;
    const crossY = Math.max(arc, Options.VS);
    const crossX = crossY - arcY + arcX;

    const firstOut = Math.max(arc + arc, crossY / 2 + arc + arc, crossY / 2 + vert + first.down);
    this.up = firstOut + first.height + first.up;

    const secondIn = Math.max(arc + arc, crossY / 2 + arc + arc, crossY / 2 + vert + second.up);
    this.down = secondIn + second.height + second.down;

    this.height = 0;

    const firstWidth = 2 * (first.needsSpace ? 10 : 0) + first.width;
    const secondWidth = 2 * (second.needsSpace ? 10 : 0) + second.width;
    this.width = 2 * arc + Math.max(firstWidth, crossX, secondWidth) + 2 * arc;

    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'altseq';
    }
  }

  format(x: number, y: number, width: number): this {
    const arc = Options.AR;
    const gaps = determineGaps(width, this.width);
    new Path(x, y).right(gaps[0]).addTo(this);
    x += gaps[0];
    new Path(x + this.width, y).right(gaps[1]).addTo(this);

    const first = this.items[0];
    const second = this.items[1];

    const firstIn = this.up - first.up;
    const firstOut = this.up - first.up - first.height;
    new Path(x, y).arc('se').upLine(firstIn - 2 * arc).arc('wn').addTo(this);
    first.format(x + 2 * arc, y - firstIn, this.width - 4 * arc).addTo(this);
    new Path(x + this.width - 2 * arc, y - firstOut).arc('ne').downLine(firstOut - 2 * arc).arc('ws').addTo(this);

    const secondIn = this.down - second.down - second.height;
    const secondOut = this.down - second.down;
    new Path(x, y).arc('ne').downLine(secondIn - 2 * arc).arc('ws').addTo(this);
    second.format(x + 2 * arc, y + secondIn, this.width - 4 * arc).addTo(this);
    new Path(x + this.width - 2 * arc, y + secondOut).arc('se').upLine(secondOut - 2 * arc).arc('wn').addTo(this);

    const arcX = (1 / Math.sqrt(2)) * arc * 2;
    const arcY = (1 - 1 / Math.sqrt(2)) * arc * 2;
    const crossY = Math.max(arc, Options.VS);
    const crossX = crossY - arcY + arcX;
    const crossBar = (this.width - 4 * arc - crossX) / 2;
    new Path(x + arc, y - crossY / 2 - arc)
      .arc('ws')
      .right(crossBar)
      .arc_8('n', 'cw')
      .l(crossX - arcX, crossY - arcY)
      .arc_8('sw', 'ccw')
      .right(crossBar)
      .arc('ne')
      .addTo(this);
    new Path(x + arc, y + crossY / 2 + arc)
      .arc('wn')
      .right(crossBar)
      .arc_8('s', 'ccw')
      .l(crossX - arcX, -(crossY - arcY))
      .arc_8('nw', 'cw')
      .right(crossBar)
      .arc('se')
      .addTo(this);

    return this;
  }

  toTextDiagram(): TextDiagram {
    const [
      cross_diag,
      corner_bot_left,
      corner_bot_right,
      corner_top_left,
      corner_top_right,
      line,
      line_vertical,
      tee_left,
      tee_right,
    ] = TextDiagram._getParts([
      'cross_diag',
      'roundcorner_bot_left',
      'roundcorner_bot_right',
      'roundcorner_top_left',
      'roundcorner_top_right',
      'line',
      'line_vertical',
      'tee_left',
      'tee_right',
    ]);

    const firstTD = this.items[0].toTextDiagram();
    const secondTD = this.items[1].toTextDiagram();
    const maxWidth = TextDiagram._maxWidth(firstTD, secondTD);
    const leftLines: string[] = [];
    const rightLines: string[] = [];
    const separator: string[] = [];
    const [leftGap, rightGap] = TextDiagram._gaps(maxWidth, firstTD.width);
    let diagramTD = firstTD.expand(leftGap, rightGap, 0, 0);

    for (let i = 0; i < diagramTD.entry; i++) {
      leftLines.push('  ');
    }
    leftLines.push(corner_top_left + line);
    for (let i = 0; i < diagramTD.height - diagramTD.entry - 1; i++) {
      leftLines.push(line_vertical + ' ');
    }
    leftLines.push(corner_bot_left + line);
    for (let i = 0; i < diagramTD.exit; i++) {
      rightLines.push('  ');
    }
    rightLines.push(line + corner_top_right);
    for (let i = 0; i < diagramTD.height - diagramTD.exit - 1; i++) {
      rightLines.push(' ' + line_vertical);
    }
    rightLines.push(line + corner_bot_right);

    const [leftSepWidth, rightSepWidth] = TextDiagram._gaps(maxWidth, 3, 'center');
    separator.push(line.repeat(leftSepWidth) + corner_top_right + ' ' + corner_top_left + line.repeat(rightSepWidth));
    separator.push(' '.repeat(leftSepWidth) + ' ' + cross_diag + ' ' + ' '.repeat(rightSepWidth));
    separator.push(line.repeat(leftSepWidth) + corner_bot_right + ' ' + corner_bot_left + line.repeat(rightSepWidth));
    leftLines.push('  ');
    rightLines.push('  ');

    const [secondLeftGap, secondRightGap] = TextDiagram._gaps(maxWidth, secondTD.width);
    const expandedSecondTD = secondTD.expand(secondLeftGap, secondRightGap, 0, 0);
    diagramTD = diagramTD.appendBelow(expandedSecondTD, separator, true, true);
    leftLines.push(corner_top_left + line);
    for (let i = 0; i < expandedSecondTD.entry; i++) {
      leftLines.push(line_vertical + ' ');
    }
    leftLines.push(corner_bot_left + line);
    rightLines.push(line + corner_top_right);
    for (let i = 0; i < expandedSecondTD.exit; i++) {
      rightLines.push(' ' + line_vertical);
    }
    rightLines.push(line + corner_bot_right);

    diagramTD = diagramTD.alter(firstTD.height + Math.trunc(separator.length / 2), firstTD.height + Math.trunc(separator.length / 2));
    const leftTD = new TextDiagram(firstTD.height + Math.trunc(separator.length / 2), firstTD.height + Math.trunc(separator.length / 2), leftLines);
    const rightTD = new TextDiagram(firstTD.height + Math.trunc(separator.length / 2), firstTD.height + Math.trunc(separator.length / 2), rightLines);
    diagramTD = leftTD.appendRight(diagramTD, '').appendRight(rightTD, '');
    diagramTD = new TextDiagram(1, 1, [corner_top_left, tee_left, corner_bot_left])
      .appendRight(diagramTD, '')
      .appendRight(new TextDiagram(1, 1, [corner_top_right, tee_right, corner_bot_right]), '');
    return diagramTD;
  }
}
