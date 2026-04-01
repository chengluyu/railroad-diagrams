import { Optional } from './Optional.js';
import { OneOrMore } from './OneOrMore.js';
import { Skip } from './Skip.js';
import { FakeSVG } from '../base/FakeSVG.js';

export class ZeroOrMore extends Optional {
  constructor(item: unknown, rep?: unknown, skip?: string) {
    super(new OneOrMore(item, rep), skip);
  }
}
