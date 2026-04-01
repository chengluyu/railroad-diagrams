import { Diagram } from './Diagram.js';
import { Start } from './Start.js';
import { End } from './End.js';

export function ComplexDiagram(...items: unknown[]): Diagram {
  const diagram = new Diagram(...items);
  diagram.items[0] = new Start({ type: 'complex' });
  diagram.items[diagram.items.length - 1] = new End({ type: 'complex' });
  return diagram;
}
