import { Options, Style } from '../config.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { determineGaps } from '../utils/helpers.js';

export interface CommentOptions {
  href?: string;
  title?: string;
  cls?: string;
}

export class Comment extends FakeSVG {
  text: string;
  href?: string;
  title?: string;
  cls: string;

  constructor(text: string, { href, title, cls = '' }: CommentOptions = {}) {
    super('g', Options.USE_CSS_CLASSES ? { class: ['comment', cls].filter(Boolean).join(' ') } : {});
    this.text = '' + text;
    this.href = href;
    this.title = title;
    this.cls = cls;
    this.width = this.text.length * Options.COMMENT_CHAR_WIDTH + 10;
    this.height = 0;
    this.up = 8;
    this.down = 8;
    this.needsSpace = true;
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'comment';
    }
  }

  format(x: number, y: number, width: number): this {
    const gaps = determineGaps(width, this.width);
    new Path(x, y).h(gaps[0]).addTo(this);
    new Path(x + gaps[0] + this.width, y + this.height).h(gaps[1]).addTo(this);
    x += gaps[0];

    const text = new FakeSVG(
      'text',
      {
        x: x + this.width / 2,
        y: y + 5,
        font: Style.COMMENT_FONT,
        'text-anchor': Style.TEXT_ANCHOR,
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
      new FakeSVG('title', {}, this.title).addTo(this);
    }
    return this;
  }

  toTextDiagram(): TextDiagram {
    return new TextDiagram(0, 0, [this.text]);
  }
}
