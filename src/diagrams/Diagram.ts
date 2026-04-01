import { Options, Style, defaultCSS } from '../config.js';
import { DiagramMultiContainer } from '../base/DiagramMultiContainer.js';
import { Path } from '../base/Path.js';
import { FakeSVG } from '../base/FakeSVG.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { Start } from './Start.js';
import { End } from './End.js';

export class Diagram extends DiagramMultiContainer {
  formatted: boolean;

  constructor(...items: unknown[]) {
    super('svg', items, { class: Options.DIAGRAM_CLASS, style: 'background:' + Style.SVG_BACKGROUND });
    if (!(this.items[0] instanceof Start)) {
      this.items.unshift(new Start());
    }
    if (!(this.items[this.items.length - 1] instanceof End)) {
      this.items.push(new End());
    }
    this.up = this.down = this.height = this.width = 0;
    for (const item of this.items) {
      this.width += item.width + (item.needsSpace ? 20 : 0);
      this.up = Math.max(this.up, item.up - this.height);
      this.height += item.height;
      this.down = Math.max(this.down - item.height, item.down);
    }
    this.formatted = false;
  }

  format(paddingt?: number, paddingr?: number, paddingb?: number, paddingl?: number): this {
    paddingt = paddingt ?? 20;
    paddingr = paddingr ?? paddingt ?? 20;
    paddingb = paddingb ?? paddingt ?? 20;
    paddingl = paddingl ?? paddingr ?? 20;
    let x = paddingl;
    let y = paddingt;
    y += this.up;
    const g = new FakeSVG('g', Options.STROKE_ODD_PIXEL_LENGTH ? { transform: 'translate(.5 .5)' } : {});
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.needsSpace) {
        new Path(x, y).h(10).addTo(g);
        x += 10;
      }
      item.format(x, y, item.width).addTo(g);
      x += item.width;
      y += item.height;
      if (item.needsSpace) {
        new Path(x, y).h(10).addTo(g);
        x += 10;
      }
    }
    this.attrs.width = this.width + paddingl + paddingr;
    this.attrs.height = this.up + this.height + this.down + paddingt + paddingb;
    this.attrs.viewBox = '0 0 ' + this.attrs.width + ' ' + this.attrs.height;
    g.addTo(this);
    this.formatted = true;
    return this;
  }

  addTo(parent?: FakeSVG | Node): this | SVGElement {
    if (!parent) {
      const scriptTags = document.getElementsByTagName('script');
      const scriptTag = scriptTags[scriptTags.length - 1];
      parent = scriptTag.parentNode!;
    }
    return super.addTo(parent) as this;
  }

  toSVG(): SVGElement {
    if (!this.formatted) {
      this.format();
    }
    return super.toSVG();
  }

  toString(): string {
    if (!this.formatted) {
      this.format();
    }
    return super.toString();
  }

  toStandalone(style?: string): string {
    if (!this.formatted) {
      this.format();
    }
    if (style) {
      const s = new FakeSVG('style', {}, style);
      (this.children as FakeSVG[]).push(s);
    }
    this.attrs.xmlns = 'http://www.w3.org/2000/svg';
    this.attrs['xmlns:xlink'] = 'http://www.w3.org/1999/xlink';
    const result = super.toString();
    if (style) {
      (this.children as FakeSVG[]).pop();
    }
    delete this.attrs.xmlns;
    delete this.attrs['xmlns:xlink'];
    return result;
  }

  toTextDiagram(): TextDiagram {
    const [separator] = TextDiagram._getParts(['separator']);
    let diagramTD = this.items[0].toTextDiagram();
    for (const item of this.items.slice(1)) {
      let itemTD = item.toTextDiagram();
      if (item.needsSpace) {
        itemTD = itemTD.expand(1, 1, 0, 0);
      }
      diagramTD = diagramTD.appendRight(itemTD, separator);
    }
    return diagramTD;
  }
}
