import { Options, Style } from '../config.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { determineGaps } from '../utils/helpers.js';
import { wrapString } from '../utils/wrap.js';
import { Comment } from './Comment.js';

export class Group extends FakeSVG {
  item: FakeSVG;
  label?: FakeSVG;
  boxUp: number;

  constructor(item: unknown, label?: unknown) {
    super('g');
    this.item = wrapString(item);
    this.label =
      label instanceof FakeSVG
        ? label
        : label
          ? new Comment(label as string)
          : undefined;

    this.width = Math.max(
      this.item.width + (this.item.needsSpace ? 20 : 0),
      this.label ? this.label.width : 0,
      Options.AR * 2
    );
    this.height = this.item.height;
    this.boxUp = this.up = Math.max(this.item.up + Options.VS, Options.AR);
    if (this.label) {
      this.up += this.label.up + this.label.height + this.label.down;
    }
    this.down = Math.max(this.item.down + Options.VS, Options.AR);
    this.needsSpace = true;
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'group';
    }
  }

  format(x: number, y: number, width: number): this {
    const gaps = determineGaps(width, this.width);
    new Path(x, y).h(gaps[0]).addTo(this);
    new Path(x + gaps[0] + this.width, y + this.height).h(gaps[1]).addTo(this);
    x += gaps[0];

    new FakeSVG('rect', {
      x: x,
      y: y - this.boxUp,
      width: this.width,
      height: this.boxUp + this.height + this.down,
      rx: Options.AR,
      ry: Options.AR,
      'stroke-width': Style.RECT_STROKE_WIDTH,
      stroke: Style.GROUP_BOX_STROKE,
      'stroke-dasharray': Style.GROUP_BOX_STROKE_DASHARRAY,
      fill: Style.GROUP_BOX_FILL,
    }).addTo(this);

    this.item.format(x, y, this.width).addTo(this);
    if (this.label) {
      this.label.format(x, y - (this.boxUp + this.label.down + this.label.height), this.label.width).addTo(this);
    }

    return this;
  }

  toTextDiagram(): TextDiagram {
    let diagramTD = TextDiagram.roundrect(this.item.toTextDiagram(), true);
    if (this.label !== undefined) {
      const labelTD = this.label.toTextDiagram();
      diagramTD = labelTD.appendBelow(diagramTD, [], true, true).expand(0, 0, 1, 0);
    }
    return diagramTD;
  }

  walk(cb: (item: FakeSVG) => void): void {
    cb(this);
    this.item.walk(cb);
    if (this.label) {
      this.label.walk(cb);
    }
  }
}
