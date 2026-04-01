import { Options } from '../config.js';
import { TextDiagram } from '../text/TextDiagram.js';
import { SVG, escapeString } from '../utils/helpers.js';

export type FakeSVGChildren = FakeSVG[] | string;

/**
 * Base class for all SVG diagram elements
 */
export class FakeSVG {
  tagName: string;
  attrs: Record<string, string | number | boolean | undefined>;
  children: FakeSVGChildren;
  needsSpace: boolean = false;
  up: number = 0;
  down: number = 0;
  height: number = 0;
  width: number = 0;

  constructor(tagName: string, attrs?: Record<string, string | number | boolean | undefined>, text?: string) {
    if (text) this.children = text;
    else this.children = [];
    this.tagName = tagName;
    this.attrs = attrs ?? {};
  }

  format(x: number, y: number, width?: number): this {
    // Virtual - to be overridden
    return this;
  }

  addTo(parent: FakeSVG | Node): this | SVGElement {
    if (parent instanceof FakeSVG) {
      if (typeof parent.children !== 'string') {
        parent.children.push(this);
      }
      return this;
    } else {
      const svg = this.toSVG();
      parent.appendChild(svg);
      return svg;
    }
  }

  toSVG(): SVGElement {
    const el = SVG(this.tagName, this.attrs as Record<string, string>);
    if (typeof this.children === 'string') {
      el.textContent = this.children;
    } else {
      this.children.forEach((e) => {
        el.appendChild(e.toSVG());
      });
    }
    return el;
  }

  toString(): string {
    let str = '<' + this.tagName;
    const group = this.tagName === 'g' || this.tagName === 'svg';
    for (const attr in this.attrs) {
      const val = this.attrs[attr];
      if (val !== undefined) {
        str +=
          ' ' +
          attr +
          '="' +
          String(val).replace(/&/g, '&amp;').replace(/"/g, '&quot;') +
          '"';
      }
    }
    str += '>';
    if (group) str += '\n';
    if (typeof this.children === 'string') {
      str += escapeString(this.children);
    } else {
      this.children.forEach((e) => {
        str += e.toString();
      });
    }
    str += '</' + this.tagName + '>\n';
    return str;
  }

  toTextDiagram(): TextDiagram {
    return new TextDiagram(0, 0, []);
  }

  toText(): string {
    const outputTD = this.toTextDiagram();
    let output = outputTD.lines.join('\n') + '\n';
    if (Options.ESCAPE_HTML) {
      output = output.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    return output;
  }

  walk(cb: (item: FakeSVG) => void): void {
    cb(this);
  }
}
