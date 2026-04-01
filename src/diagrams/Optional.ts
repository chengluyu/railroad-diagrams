import { Choice } from './Choice.js';
import { Skip } from './Skip.js';

export class Optional extends Choice {
  constructor(item: unknown, skip?: string) {
    if (skip === undefined) super(1, new Skip(), item);
    else if (skip === 'skip') super(0, new Skip(), item);
    else throw new Error("Unknown value for Optional()'s 'skip' argument.");
  }
}
