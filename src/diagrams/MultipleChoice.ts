import { Options, Style } from '../config.js';
import { DiagramMultiContainer } from '../base/DiagramMultiContainer.js';
import { Path } from '../base/Path.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { determineGaps, max } from '../utils/helpers.js';
import { Choice } from './Choice.js';

export class MultipleChoice extends DiagramMultiContainer {
  normal: number;
  type: string;
  innerWidth: number;

  constructor(normal: number, type: string, ...items: unknown[]) {
    super('g', items);
    if (typeof normal !== 'number' || normal !== Math.floor(normal)) {
      throw new TypeError('The first argument of MultipleChoice() must be an integer.');
    } else if (normal < 0 || normal >= items.length) {
      throw new RangeError('The first argument of MultipleChoice() must be an index for one of the items.');
    } else {
      this.normal = normal;
    }
    if (type !== 'any' && type !== 'all') {
      throw new SyntaxError("The second argument of MultipleChoice must be 'any' or 'all'.");
    } else {
      this.type = type;
    }
    this.needsSpace = true;
    this.innerWidth = max(this.items, (x) => x.width);
    this.width = 30 + Options.AR + this.innerWidth + Options.AR + 20;
    this.up = this.items[0].up;
    this.down = this.items[this.items.length - 1].down;
    this.height = this.items[normal].height;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      let minimum: number;
      if (i === normal - 1 || i === normal + 1) minimum = 10 + Options.AR;
      else minimum = Options.AR;
      if (i < normal) {
        this.up += Math.max(minimum, item.height + item.down + Options.VS + this.items[i + 1].up);
      } else if (i > normal) {
        this.down += Math.max(minimum, item.up + Options.VS + this.items[i - 1].down + this.items[i - 1].height);
      }
    }
    this.down -= this.items[normal].height;
    if (Options.DEBUG) {
      this.attrs['data-updown'] = this.up + ' ' + this.height + ' ' + this.down;
      this.attrs['data-type'] = 'multiplechoice';
    }
  }

  format(x: number, y: number, width: number): this {
    const gaps = determineGaps(width, this.width);
    new Path(x, y).right(gaps[0]).addTo(this);
    new Path(x + gaps[0] + this.width, y + this.height).right(gaps[1]).addTo(this);
    x += gaps[0];

    const normal = this.items[this.normal];

    // Do the elements that curve above
    let distanceFromY = 0;
    for (let i = this.normal - 1; i >= 0; i--) {
      const item = this.items[i];
      if (i === this.normal - 1) {
        distanceFromY = Math.max(10 + Options.AR, normal.up + Options.VS + item.down + item.height);
      }
      new Path(x + 30, y).upLine(distanceFromY - Options.AR).arc('wn').addTo(this);
      item.format(x + 30 + Options.AR, y - distanceFromY, this.innerWidth).addTo(this);
      new Path(x + 30 + Options.AR + this.innerWidth, y - distanceFromY + item.height)
        .arc('ne')
        .downLine(distanceFromY - item.height + this.height - Options.AR - 10)
        .addTo(this);
      if (i !== 0) {
        distanceFromY += Math.max(Options.AR, item.up + Options.VS + this.items[i - 1].down + this.items[i - 1].height);
      }
    }

    new Path(x + 30, y).right(Options.AR).addTo(this);
    normal.format(x + 30 + Options.AR, y, this.innerWidth).addTo(this);
    new Path(x + 30 + Options.AR + this.innerWidth, y + this.height).right(Options.AR).addTo(this);

    // Do the elements that curve below
    distanceFromY = 0;
    for (let i = this.normal + 1; i < this.items.length; i++) {
      const item = this.items[i];
      if (i === this.normal + 1) {
        distanceFromY = Math.max(10 + Options.AR, normal.height + normal.down + Options.VS + item.up);
      }
      new Path(x + 30, y).downLine(distanceFromY - Options.AR).arc('ws').addTo(this);
      item.format(x + 30 + Options.AR, y + distanceFromY, this.innerWidth).addTo(this);
      new Path(x + 30 + Options.AR + this.innerWidth, y + distanceFromY + item.height)
        .arc('se')
        .upLine(distanceFromY - Options.AR + item.height - normal.height)
        .addTo(this);
      if (i !== this.items.length - 1) {
        distanceFromY += Math.max(Options.AR, item.height + item.down + Options.VS + this.items[i + 1].up);
      }
    }

    const text = new FakeSVG('g', {}).addTo(this);
    new FakeSVG(
      'title',
      {},
      this.type === 'any'
        ? 'take one or more branches, once each, in any order'
        : 'take all branches, once each, in any order'
    ).addTo(text);
    new FakeSVG('path', {
      d: 'M ' + (x + 30) + ' ' + (y - 10) + ' h -26 a 4 4 0 0 0 -4 4 v 12 a 4 4 0 0 0 4 4 h 26 z',
      'stroke-width': Style.DIAGRAM_TEXT_PATH_STROKE_WIDTH,
      stroke: Style.DIAGRAM_TEXT_PATH_STROKE,
      fill: Style.DIAGRAM_TEXT_PATH_FILL,
    }).addTo(text);
    new FakeSVG(
      'text',
      {
        x: x + 15,
        y: y + 4,
        'font-size': Style.DIAGRAM_TEXT_FONT_SIZE,
        font: Style.TEXT_FONT,
        'text-anchor': Style.TEXT_ANCHOR,
        fill: Style.TEXT_FILL,
      },
      this.type === 'any' ? '1+' : 'all'
    ).addTo(text);
    new FakeSVG('path', {
      d: 'M ' + (x + this.width - 20) + ' ' + (y - 10) + ' h 16 a 4 4 0 0 1 4 4 v 12 a 4 4 0 0 1 -4 4 h -16 z',
      'stroke-width': Style.DIAGRAM_TEXT_PATH_STROKE_WIDTH,
      stroke: Style.DIAGRAM_TEXT_PATH_STROKE,
      fill: Style.DIAGRAM_TEXT_PATH_FILL,
    }).addTo(text);
    new FakeSVG('path', {
      d: 'M ' + (x + this.width - 13) + ' ' + (y - 2) + ' a 4 4 0 1 0 6 -1 m 2.75 -1 h -4 v 4 m 0 -3 h 2',
      'stroke-width': '1.75',
      stroke: Style.PATH_STROKE,
      fill: Style.PATH_FILL,
    }).addTo(text);
    return this;
  }

  toTextDiagram(): TextDiagram {
    const [multi_repeat] = TextDiagram._getParts(['multi_repeat']);
    const anyAll = this.type === 'any' ? TextDiagram.rect('1+') : TextDiagram.rect('all');
    const diagramTD = Choice.prototype.toTextDiagram.call(this);
    const repeatTD = TextDiagram.rect(multi_repeat);
    return anyAll.appendRight(diagramTD, '').appendRight(repeatTD, '');
  }
}
