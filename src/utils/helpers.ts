import { Options } from '../config.js';

/**
 * Return the first value that isn't undefined.
 * More correct than `v1 || v2 || v3` because falsey values will be returned.
 */
export function unnull<T>(...args: (T | undefined)[]): T | undefined {
  return args.reduce((sofar, x) => (sofar !== undefined ? sofar : x), undefined as T | undefined);
}

/**
 * Determine the gaps for internal alignment
 */
export function determineGaps(outer: number, inner: number): [number, number] {
  const diff = outer - inner;
  switch (Options.INTERNAL_ALIGNMENT) {
    case 'left':
      return [0, diff];
    case 'right':
      return [diff, 0];
    default:
      return [diff / 2, diff / 2];
  }
}

/**
 * Sum the values of an iterable
 */
export function sum<T>(iter: T[], func?: (x: T) => number): number {
  if (!func) func = (x: unknown) => x as number;
  return iter.map(func).reduce((a, b) => a + b, 0);
}

/**
 * Get the maximum value from an iterable
 */
export function max<T>(iter: T[], func: (x: T) => number = (x: unknown) => x as number): number {
  return Math.max.apply(null, iter.map(func));
}

/**
 * Create an SVG element
 */
export function SVG(name: string, attrs?: Record<string, string | number | boolean>, text?: string): SVGElement {
  attrs = attrs || {};
  text = text || '';
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const attr in attrs) {
    if (attr === 'xlink:href') {
      el.setAttributeNS('http://www.w3.org/1999/xlink', 'href', String(attrs[attr]));
    } else {
      el.setAttribute(attr, String(attrs[attr]));
    }
  }
  el.textContent = text;
  return el;
}

/**
 * Escape markdown and HTML special characters
 */
export function escapeString(str: string): string {
  return str.replace(/[*_`\[\]<&]/g, (charString) => {
    return '&#' + charString.charCodeAt(0) + ';';
  });
}

/**
 * Enumerate an iterable with indices
 */
export function* enumerate<T>(iter: Iterable<T>): Generator<[number, T]> {
  let count = 0;
  for (const x of iter) {
    yield [count, x];
    count++;
  }
}
