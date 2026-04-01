import { Options, Style } from '../config.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { determineGaps } from '../utils/helpers.js';

export interface TerminalOptions {
  href?: string;
  title?: string;
  cls?: string;
}

export class Terminal extends FakeSVG {
  text: string;
  href?: string;
  title?: string;
  cls?: string;

  constructor(text: string, { href, title, cls }: TerminalOptions = {}) {
    super('g', Options.USE_CSS_CLASSES ? { class: ['terminal', cls].filter(Boolean).join(' ') } : {});
    this.text = '' + text;
    this.href = href;
    this.title = title;
    this.cls = cls;
    this.width = this.text.length * Options.CHAR_WIDTH + 20;
    this.height = 0;
    this.up = 11;
    this.down = 11;
    this.needsSpace = true;
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'terminal';
    }
  }

  format(x: number, y: number, width: number): this {
    const gaps = determineGaps(width, this.width);
    new Path(x, y).h(gaps[0]).addTo(this);
    new Path(x + gaps[0] + this.width, y).h(gaps[1]).addTo(this);
    x += gaps[0];

    new FakeSVG('rect', {
      x: x,
      y: y - 11,
      width: this.width,
      height: this.up! + this.down!,
      rx: 10,
      ry: 10,
      'stroke-width': Style.RECT_STROKE_WIDTH,
      stroke: Style.RECT_STROKE,
      fill: Style.RECT_FILL,
    }).addTo(this);

    const text = new FakeSVG(
      'text',
      {
        x: x + this.width / 2,
        y: y + 4,
        font: Style.TEXT_FONT,
        'text-anchor': Style.TEXT_ANCHOR,
        'font-family': Style.TERMINAL_FONT_FAMILY,
        fill: Style.TEXT_FILL,
      },
      this.text
    );
    if (this.href) {
      new FakeSVG('a', { 'xlink:href': this.href }, [text] as unknown as string).addTo(this);
    } else {
      text.addTo(this);
    }
    if (this.title) {
      new FakeSVG('title', {}, [this.title] as unknown as string).addTo(this);
    }
    return this;
  }

  toTextDiagram(): TextDiagram {
    return TextDiagram.roundrect(this.text);
  }
}
