import { Options } from '../config.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { determineGaps } from '../utils/helpers.js';
import { wrapString } from '../utils/wrap.js';
import { Skip } from './Skip.js';

export class OneOrMore extends FakeSVG {
  item: FakeSVG;
  rep: FakeSVG;

  constructor(item: unknown, rep?: unknown) {
    super('g');
    rep = rep ?? new Skip();
    this.item = wrapString(item);
    this.rep = wrapString(rep);
    this.width = Math.max(this.item.width, this.rep.width) + Options.AR * 2;
    this.height = this.item.height;
    this.up = this.item.up;
    this.down = Math.max(Options.AR * 2, this.item.down + Options.VS + this.rep.up + this.rep.height + this.rep.down);
    this.needsSpace = true;
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'oneormore';
    }
  }

  format(x: number, y: number, width: number): this {
    const gaps = determineGaps(width, this.width);
    new Path(x, y).h(gaps[0]).addTo(this);
    new Path(x + gaps[0] + this.width, y + this.height).h(gaps[1]).addTo(this);
    x += gaps[0];

    new Path(x, y).right(Options.AR).addTo(this);
    this.item.format(x + Options.AR, y, this.width - Options.AR * 2).addTo(this);
    new Path(x + this.width - Options.AR, y + this.height).right(Options.AR).addTo(this);

    const distanceFromY = Math.max(Options.AR * 2, this.item.height + this.item.down + Options.VS + this.rep.up);
    new Path(x + Options.AR, y).arc('nw').downLine(distanceFromY - Options.AR * 2).arc('ws').addTo(this);
    this.rep.format(x + Options.AR, y + distanceFromY, this.width - Options.AR * 2).addTo(this);
    new Path(x + this.width - Options.AR, y + distanceFromY + this.rep.height)
      .arc('se')
      .upLine(distanceFromY - Options.AR * 2 + this.rep.height - this.item.height)
      .arc('en')
      .addTo(this);

    return this;
  }

  toTextDiagram(): TextDiagram {
    const [
      line,
      repeat_top_left,
      repeat_left,
      repeat_bot_left,
      repeat_top_right,
      repeat_right,
      repeat_bot_right,
    ] = TextDiagram._getParts([
      'line',
      'repeat_top_left',
      'repeat_left',
      'repeat_bot_left',
      'repeat_top_right',
      'repeat_right',
      'repeat_bot_right',
    ]);

    const itemTD = this.item.toTextDiagram();
    const repeatTD = this.rep.toTextDiagram();
    const itemAndRepeatTD = itemTD.appendBelow(repeatTD, []);

    const leftLines: string[] = [];
    leftLines.push(repeat_top_left + line);
    for (let i = 0; i < itemTD.height - itemTD.entry + repeatTD.entry - 1; i++) {
      leftLines.push(repeat_left + ' ');
    }
    leftLines.push(repeat_bot_left + line);
    const leftTD = new TextDiagram(0, 0, leftLines);
    const leftWithItemTD = leftTD.appendRight(itemAndRepeatTD, '');

    const rightLines: string[] = [];
    rightLines.push(line + repeat_top_right);
    for (let i = 0; i < itemTD.height - itemTD.exit + repeatTD.exit - 1; i++) {
      rightLines.push(' ' + repeat_right);
    }
    rightLines.push(line + repeat_bot_right);
    const rightTD = new TextDiagram(0, 0, rightLines);
    return leftWithItemTD.appendRight(rightTD, '');
  }

  walk(cb: (item: FakeSVG) => void): void {
    cb(this);
    this.item.walk(cb);
    this.rep.walk(cb);
  }
}
