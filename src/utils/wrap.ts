import { FakeSVG } from '../base/FakeSVG.js';
import { Terminal } from '../diagrams/Terminal.js';

/**
 * Wrap a string value in a Terminal if it's not already a FakeSVG
 */
export function wrapString(value: unknown): FakeSVG {
  return value instanceof FakeSVG ? value : new Terminal('' + value);
}
