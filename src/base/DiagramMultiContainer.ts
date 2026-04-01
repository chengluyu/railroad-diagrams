import { FakeSVG, FakeSVGChildren } from './FakeSVG.js';
import { wrapString } from '../utils/wrap.js';

/**
 * Base class for diagram elements that contain multiple child items
 */
export class DiagramMultiContainer extends FakeSVG {
  items: FakeSVG[];

  constructor(tagName: string, items: unknown[], attrs?: Record<string, string | number | boolean | undefined>, text?: string) {
    super(tagName, attrs, text);
    this.items = items.map(wrapString);
  }

  walk(cb: (item: FakeSVG) => void): void {
    cb(this);
    this.items.forEach((x) => x.walk(cb));
  }
}
