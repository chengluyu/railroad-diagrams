/**
 * Railroad Diagrams
 * A TypeScript library for drawing railroad syntax diagrams
 * 
 * Originally by Tab Atkins Jr. (http://xanthir.com)
 * http://github.com/tabatkins/railroad-diagrams
 * 
 * Licensed under CC0: http://creativecommons.org/publicdomain/zero/1.0/
 */

// Configuration
export { Options, Style, defaultCSS, type OptionsConfig, type StyleConfig } from './config.js';

// Base classes
export { FakeSVG, type FakeSVGChildren } from './base/FakeSVG.js';
export { Path } from './base/Path.js';
export { DiagramMultiContainer } from './base/DiagramMultiContainer.js';

// Text diagram support
export { TextDiagram } from './text/TextDiagram.js';

// Utility functions
export {
  unnull,
  determineGaps,
  sum,
  max,
  SVG,
  escapeString,
  enumerate,
} from './utils/helpers.js';
export { wrapString } from './utils/wrap.js';

// Diagram elements
export { Diagram } from './diagrams/Diagram.js';
export { ComplexDiagram } from './diagrams/ComplexDiagram.js';
export { Sequence } from './diagrams/Sequence.js';
export { Stack } from './diagrams/Stack.js';
export { OptionalSequence } from './diagrams/OptionalSequence.js';
export { AlternatingSequence } from './diagrams/AlternatingSequence.js';
export { Choice } from './diagrams/Choice.js';
export { HorizontalChoice } from './diagrams/HorizontalChoice.js';
export { MultipleChoice } from './diagrams/MultipleChoice.js';
export { OneOrMore } from './diagrams/OneOrMore.js';
export { ZeroOrMore } from './diagrams/ZeroOrMore.js';
export { Optional } from './diagrams/Optional.js';
export { Group } from './diagrams/Group.js';
export { Start, type StartOptions } from './diagrams/Start.js';
export { End, type EndOptions } from './diagrams/End.js';
export { Terminal, type TerminalOptions } from './diagrams/Terminal.js';
export { NonTerminal, type NonTerminalOptions } from './diagrams/NonTerminal.js';
export { Comment, type CommentOptions } from './diagrams/Comment.js';
export { Skip } from './diagrams/Skip.js';
export { Block, type BlockOptions } from './diagrams/Block.js';

// Import classes for the factory
import { Diagram } from './diagrams/Diagram.js';
import { ComplexDiagram } from './diagrams/ComplexDiagram.js';
import { Sequence } from './diagrams/Sequence.js';
import { Stack } from './diagrams/Stack.js';
import { OptionalSequence } from './diagrams/OptionalSequence.js';
import { AlternatingSequence } from './diagrams/AlternatingSequence.js';
import { Choice } from './diagrams/Choice.js';
import { HorizontalChoice } from './diagrams/HorizontalChoice.js';
import { MultipleChoice } from './diagrams/MultipleChoice.js';
import { OneOrMore } from './diagrams/OneOrMore.js';
import { ZeroOrMore } from './diagrams/ZeroOrMore.js';
import { Optional } from './diagrams/Optional.js';
import { Group } from './diagrams/Group.js';
import { Start } from './diagrams/Start.js';
import { End } from './diagrams/End.js';
import { Terminal } from './diagrams/Terminal.js';
import { NonTerminal } from './diagrams/NonTerminal.js';
import { Comment } from './diagrams/Comment.js';
import { Skip } from './diagrams/Skip.js';
import { Block } from './diagrams/Block.js';

// Factory functions for convenient access
export const funcs = {
  Diagram: (item: unknown, ...rest: unknown[]) => new Diagram(item, ...rest),
  ComplexDiagram: (item: unknown, ...rest: unknown[]) => ComplexDiagram(item, ...rest),
  Sequence: (item: unknown, ...rest: unknown[]) => new Sequence(item, ...rest),
  Stack: (item: unknown, ...rest: unknown[]) => new Stack(item, ...rest),
  OptionalSequence: (item: unknown, ...rest: unknown[]) => new OptionalSequence(item, ...rest),
  AlternatingSequence: (item: unknown, ...rest: unknown[]) => new AlternatingSequence(item, ...rest),
  Choice: (normal: number, ...items: unknown[]) => new Choice(normal, ...items),
  HorizontalChoice: (item: unknown, ...rest: unknown[]) => new HorizontalChoice(item, ...rest),
  MultipleChoice: (normal: number, type: string, ...items: unknown[]) => new MultipleChoice(normal, type, ...items),
  OneOrMore: (item: unknown, rep?: unknown) => new OneOrMore(item, rep),
  ZeroOrMore: (item: unknown, rep?: unknown, skip?: string) => new ZeroOrMore(item, rep, skip),
  Optional: (item: unknown, skip?: string) => new Optional(item, skip),
  Group: (item: unknown, label?: unknown) => new Group(item, label),
  Start: (opts?: { type?: 'simple' | 'complex'; label?: string }) => new Start(opts),
  End: (opts?: { type?: 'simple' | 'complex' }) => new End(opts),
  Terminal: (text: string, opts?: { href?: string; title?: string; cls?: string }) => new Terminal(text, opts),
  NonTerminal: (text: string, opts?: { href?: string; title?: string; cls?: string }) => new NonTerminal(text, opts),
  Comment: (text: string, opts?: { href?: string; title?: string; cls?: string }) => new Comment(text, opts),
  Skip: () => new Skip(),
  Block: (opts?: { width?: number; up?: number; height?: number; down?: number; needsSpace?: boolean }) => new Block(opts),
};

export default funcs;
