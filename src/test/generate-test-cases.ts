/**
 * Test case generator for railroad diagrams
 * Generates various permutations and combinations of diagram elements
 */

import * as Railroad from '../index.js';

// Helper to serialize diagram output for comparison
export function serializeDiagram(diagram: Railroad.Diagram): string {
  return diagram.toString();
}

// Helper to serialize text diagram output
export function serializeTextDiagram(diagram: Railroad.Diagram): string {
  return diagram.toText();
}

// Basic elements
const terminal = (text: string) => new Railroad.Terminal(text);
const nonTerminal = (text: string) => new Railroad.NonTerminal(text);
const comment = (text: string) => new Railroad.Comment(text);
const skip = () => new Railroad.Skip();

// Generate permutations of sequences with different lengths
export function generateSequenceTests(): Railroad.Sequence[] {
  const tests: Railroad.Sequence[] = [];
  const elements = [
    terminal('a'),
    terminal('b'),
    nonTerminal('A'),
    nonTerminal('B'),
  ];
  
  // Generate sequences of length 1-4
  for (let len = 1; len <= 4; len++) {
    const permutations = getPermutations(elements, len);
    for (const perm of permutations.slice(0, 20)) {
      tests.push(new Railroad.Sequence(...perm));
    }
  }
  
  return tests;
}

// Generate choice combinations
export function generateChoiceTests(): Railroad.Choice[] {
  const tests: Railroad.Choice[] = [];
  const elements = [
    terminal('opt1'),
    terminal('opt2'),
    nonTerminal('Opt1'),
    nonTerminal('Opt2'),
    new Railroad.Skip(),
  ];
  
  // Generate choices with 2-5 options, varying the default selection
  for (let count = 2; count <= 5; count++) {
    const combos = getCombinations(elements, count);
    for (const combo of combos.slice(0, 15)) {
      for (let normal = 0; normal < count && normal < combo.length; normal++) {
        tests.push(new Railroad.Choice(normal, ...combo));
      }
    }
  }
  
  return tests;
}

// Generate optional sequence tests
export function generateOptionalSequenceTests(): Railroad.OptionalSequence[] {
  const tests: Railroad.OptionalSequence[] = [];
  const elements = [
    terminal('a'),
    nonTerminal('A'),
    terminal('b'),
    nonTerminal('B'),
  ];
  
  // Generate optional sequences of length 2-5
  for (let len = 2; len <= 5; len++) {
    const permutations = getPermutations(elements, len);
    for (const perm of permutations.slice(0, 10)) {
      tests.push(new Railroad.OptionalSequence(...perm));
    }
  }
  
  return tests;
}

// Generate stack tests
export function generateStackTests(): Railroad.Stack[] {
  const tests: Railroad.Stack[] = [];
  const elements = [
    terminal('first'),
    nonTerminal('Second'),
    terminal('third'),
    new Railroad.Comment('comment'),
  ];
  
  // Generate stacks of length 2-4
  for (let len = 2; len <= 4; len++) {
    const permutations = getPermutations(elements, len);
    for (const perm of permutations.slice(0, 10)) {
      tests.push(new Railroad.Stack(...perm));
    }
  }
  
  return tests;
}

// Generate OneOrMore tests with various repeat elements
export function generateOneOrMoreTests(): Railroad.OneOrMore[] {
  const tests: Railroad.OneOrMore[] = [];
  const items = [
    terminal('item'),
    nonTerminal('Item'),
  ];
  const repeats: Array<Railroad.FakeSVG | undefined> = [
    undefined,
    skip(),
    terminal(','),
    comment('separator'),
  ];
  
  for (const item of items) {
    for (const repeat of repeats) {
      tests.push(new Railroad.OneOrMore(item, repeat));
    }
  }
  
  return tests;
}

// Generate ZeroOrMore tests
export function generateZeroOrMoreTests(): Railroad.ZeroOrMore[] {
  const tests: Railroad.ZeroOrMore[] = [];
  const items = [
    terminal('item'),
    nonTerminal('Item'),
  ];
  const repeats: Array<Railroad.FakeSVG | undefined> = [
    undefined,
    skip(),
    terminal(','),
  ];
  const skips: Array<string | undefined> = [undefined, 'skip'];
  
  for (const item of items) {
    for (const repeat of repeats) {
      for (const skipOpt of skips) {
        tests.push(new Railroad.ZeroOrMore(item, repeat, skipOpt));
      }
    }
  }
  
  return tests;
}

// Generate Optional tests
export function generateOptionalTests(): Railroad.Optional[] {
  const tests: Railroad.Optional[] = [];
  const items = [
    terminal('optional'),
    nonTerminal('Optional'),
  ];
  const skips: Array<string | undefined> = [undefined, 'skip'];
  
  for (const item of items) {
    for (const skipOpt of skips) {
      tests.push(new Railroad.Optional(item, skipOpt));
    }
  }
  
  return tests;
}

// Generate Group tests
export function generateGroupTests(): Railroad.Group[] {
  const tests: Railroad.Group[] = [];
  const items = [
    terminal('grouped'),
    new Railroad.Sequence(terminal('a'), terminal('b')),
    new Railroad.Choice(0, terminal('x'), terminal('y')),
  ];
  const labels: Array<Railroad.FakeSVG | string | undefined> = [
    undefined,
    'label',
    new Railroad.Comment('group label'),
  ];
  
  for (const item of items) {
    for (const label of labels) {
      tests.push(new Railroad.Group(item, label));
    }
  }
  
  return tests;
}

// Generate AlternatingSequence tests
export function generateAlternatingSequenceTests(): Railroad.AlternatingSequence[] {
  const tests: Railroad.AlternatingSequence[] = [];
  const firstOptions = [terminal('a'), nonTerminal('A')];
  const secondOptions = [terminal('b'), nonTerminal('B')];
  
  for (const first of firstOptions) {
    for (const second of secondOptions) {
      tests.push(new Railroad.AlternatingSequence(first, second));
    }
  }
  
  return tests;
}

// Generate HorizontalChoice tests
export function generateHorizontalChoiceTests(): Railroad.HorizontalChoice[] {
  const tests: Railroad.HorizontalChoice[] = [];
  const elements = [
    terminal('a'),
    terminal('b'),
    nonTerminal('A'),
    nonTerminal('B'),
  ];
  
  // Generate horizontal choices of length 2-4
  for (let len = 2; len <= 4; len++) {
    const permutations = getPermutations(elements, len);
    for (const perm of permutations.slice(0, 8)) {
      tests.push(new Railroad.HorizontalChoice(...perm));
    }
  }
  
  return tests;
}

// Generate MultipleChoice tests
export function generateMultipleChoiceTests(): Railroad.MultipleChoice[] {
  const tests: Railroad.MultipleChoice[] = [];
  const elements = [
    terminal('opt1'),
    terminal('opt2'),
    nonTerminal('Opt1'),
    nonTerminal('Opt2'),
  ];
  const types: Array<'any' | 'all'> = ['any', 'all'];
  
  for (const type of types) {
    for (let len = 2; len <= 4; len++) {
      const combos = getCombinations(elements, len);
      for (const combo of combos.slice(0, 6)) {
        for (let normal = 0; normal < len && normal < combo.length; normal++) {
          tests.push(new Railroad.MultipleChoice(normal, type, ...combo));
        }
      }
    }
  }
  
  return tests;
}

// Generate complex nested diagram tests
export function generateNestedTests(): Array<
  | Railroad.Sequence
  | Railroad.Choice
  | Railroad.Group
  | Railroad.Stack
  | Railroad.OptionalSequence
> {
  const tests: Array<
    | Railroad.Sequence
    | Railroad.Choice
    | Railroad.Group
    | Railroad.Stack
    | Railroad.OptionalSequence
  > = [];
  
  // Nested sequences
  tests.push(
    new Railroad.Sequence(
      new Railroad.Sequence(terminal('a'), terminal('b')),
      new Railroad.Sequence(terminal('c'), terminal('d'))
    )
  );
  
  // Choice containing sequences
  tests.push(
    new Railroad.Choice(
      0,
      new Railroad.Sequence(terminal('a'), terminal('b')),
      new Railroad.Sequence(terminal('c'), terminal('d'))
    )
  );
  
  // Group containing choices
  tests.push(
    new Railroad.Group(
      new Railroad.Choice(0, terminal('x'), terminal('y')),
      'group label'
    )
  );
  
  // Stack containing sequences
  tests.push(
    new Railroad.Stack(
      new Railroad.Sequence(terminal('a'), nonTerminal('A')),
      new Railroad.Sequence(terminal('b'), nonTerminal('B'))
    )
  );
  
  // Optional sequence with complex elements
  tests.push(
    new Railroad.OptionalSequence(
      new Railroad.Group(terminal('a'), 'group1'),
      new Railroad.Optional(terminal('b')),
      new Railroad.OneOrMore(terminal('c'), terminal(','))
    )
  );
  
  // Complex nested structure
  tests.push(
    new Railroad.Sequence(
      new Railroad.Choice(
        0,
        terminal('start1'),
        terminal('start2')
      ),
      new Railroad.ZeroOrMore(
        new Railroad.Sequence(
          nonTerminal('Item'),
          terminal(',')
        )
      ),
      new Railroad.Group(
        new Railroad.AlternatingSequence(
          terminal('a'),
          terminal('b')
        ),
        'alternating'
      )
    )
  );
  
  return tests;
}

// Generate full diagram tests
export function generateDiagramTests(): Railroad.Diagram[] {
  const tests: Railroad.Diagram[] = [];
  
  // Simple diagram
  tests.push(
    new Railroad.Diagram(
      terminal('start'),
      nonTerminal('Middle'),
      terminal('end')
    )
  );
  
  // Complex diagram
  tests.push(
    Railroad.ComplexDiagram(
      nonTerminal('Expression'),
      new Railroad.ZeroOrMore(
        new Railroad.Sequence(
          terminal('+'),
          nonTerminal('Expression')
        )
      )
    )
  );
  
  // Diagram with various elements
  tests.push(
    new Railroad.Diagram(
      new Railroad.Choice(
        0,
        terminal('option1'),
        terminal('option2'),
        terminal('option3')
      ),
      new Railroad.Optional(terminal('optional')),
      new Railroad.OneOrMore(nonTerminal('Item'), terminal(','))
    )
  );
  
  // Diagram with stack
  tests.push(
    new Railroad.Diagram(
      new Railroad.Stack(
        new Railroad.Sequence(terminal('if'), terminal('('), nonTerminal('Condition'), terminal(')')),
        new Railroad.Sequence(nonTerminal('Statement')),
        new Railroad.Sequence(terminal('else'), nonTerminal('Statement'))
      )
    )
  );
  
  return tests;
}

// Generate Start/End variant tests
export function generateStartEndTests(): Array<Railroad.Start | Railroad.End> {
  const tests: Array<Railroad.Start | Railroad.End> = [];
  
  tests.push(new Railroad.Start({ type: 'simple' }));
  tests.push(new Railroad.Start({ type: 'complex' }));
  tests.push(new Railroad.Start({ type: 'simple', label: 'Start' }));
  tests.push(new Railroad.Start({ type: 'complex', label: 'Begin' }));
  tests.push(new Railroad.End({ type: 'simple' }));
  tests.push(new Railroad.End({ type: 'complex' }));
  
  return tests;
}

// Generate Terminal/NonTerminal/Comment variant tests
export function generateTextElementTests(): Array<
  Railroad.Terminal | Railroad.NonTerminal | Railroad.Comment
> {
  const tests: Array<Railroad.Terminal | Railroad.NonTerminal | Railroad.Comment> = [];
  
  // Different text lengths
  const texts = ['a', 'ab', 'abc', 'longtext', 'verylongtextindeed'];
  
  for (const text of texts) {
    tests.push(new Railroad.Terminal(text));
    tests.push(new Railroad.NonTerminal(text));
    tests.push(new Railroad.Comment(text));
    
    // With options
    tests.push(new Railroad.Terminal(text, { href: '#link', title: 'Title' }));
    tests.push(new Railroad.NonTerminal(text, { href: '#link', cls: 'custom' }));
    tests.push(new Railroad.Comment(text, { title: 'Comment title' }));
  }
  
  return tests;
}

// Generate Block tests
export function generateBlockTests(): Railroad.Block[] {
  const tests: Railroad.Block[] = [];
  
  tests.push(new Railroad.Block());
  tests.push(new Railroad.Block({ width: 100, height: 50 }));
  tests.push(new Railroad.Block({ width: 50, up: 20, height: 40, down: 20 }));
  tests.push(new Railroad.Block({ width: 80, up: 10, height: 30, down: 10, needsSpace: true }));
  tests.push(new Railroad.Block({ width: 60, up: 15, height: 35, down: 15, needsSpace: false }));
  
  return tests;
}

// Utility functions for permutations and combinations
function getPermutations<T>(arr: T[], length: number): T[][] {
  if (length === 0) return [[]];
  if (length === 1) return arr.map((item) => [item]);
  
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const perms = getPermutations(remaining, length - 1);
    for (const perm of perms) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

function getCombinations<T>(arr: T[], length: number): T[][] {
  if (length === 0) return [[]];
  if (length > arr.length) return [];
  if (length === arr.length) return [[...arr]];
  if (length === 1) return arr.map((item) => [item]);
  
  const result: T[][] = [];
  for (let i = 0; i <= arr.length - length; i++) {
    const current = arr[i];
    const remaining = arr.slice(i + 1);
    const combos = getCombinations(remaining, length - 1);
    for (const combo of combos) {
      result.push([current, ...combo]);
    }
  }
  return result;
}

// Generate all test cases
export function generateAllTests(): {
  name: string;
  element: Railroad.FakeSVG;
}[] {
  const tests: { name: string; element: Railroad.FakeSVG }[] = [];
  
  let counter = 0;
  
  // Sequence tests
  for (const seq of generateSequenceTests()) {
    tests.push({ name: `sequence_${++counter}`, element: seq });
  }
  
  // Choice tests
  counter = 0;
  for (const choice of generateChoiceTests()) {
    tests.push({ name: `choice_${++counter}`, element: choice });
  }
  
  // OptionalSequence tests
  counter = 0;
  for (const optSeq of generateOptionalSequenceTests()) {
    tests.push({ name: `optseq_${++counter}`, element: optSeq });
  }
  
  // Stack tests
  counter = 0;
  for (const stack of generateStackTests()) {
    tests.push({ name: `stack_${++counter}`, element: stack });
  }
  
  // OneOrMore tests
  counter = 0;
  for (const oom of generateOneOrMoreTests()) {
    tests.push({ name: `oneormore_${++counter}`, element: oom });
  }
  
  // ZeroOrMore tests
  counter = 0;
  for (const zom of generateZeroOrMoreTests()) {
    tests.push({ name: `zeroormore_${++counter}`, element: zom });
  }
  
  // Optional tests
  counter = 0;
  for (const opt of generateOptionalTests()) {
    tests.push({ name: `optional_${++counter}`, element: opt });
  }
  
  // Group tests
  counter = 0;
  for (const group of generateGroupTests()) {
    tests.push({ name: `group_${++counter}`, element: group });
  }
  
  // AlternatingSequence tests
  counter = 0;
  for (const altSeq of generateAlternatingSequenceTests()) {
    tests.push({ name: `altseq_${++counter}`, element: altSeq });
  }
  
  // HorizontalChoice tests
  counter = 0;
  for (const hChoice of generateHorizontalChoiceTests()) {
    tests.push({ name: `hchoice_${++counter}`, element: hChoice });
  }
  
  // MultipleChoice tests
  counter = 0;
  for (const mChoice of generateMultipleChoiceTests()) {
    tests.push({ name: `mchoice_${++counter}`, element: mChoice });
  }
  
  // Nested tests
  counter = 0;
  for (const nested of generateNestedTests()) {
    tests.push({ name: `nested_${++counter}`, element: nested });
  }
  
  // Start/End tests
  counter = 0;
  for (const se of generateStartEndTests()) {
    tests.push({ name: `startend_${++counter}`, element: se });
  }
  
  // Text element tests
  counter = 0;
  for (const elem of generateTextElementTests()) {
    tests.push({ name: `textelem_${++counter}`, element: elem });
  }
  
  // Block tests
  counter = 0;
  for (const block of generateBlockTests()) {
    tests.push({ name: `block_${++counter}`, element: block });
  }
  
  return tests;
}

// Generate diagram-level tests
export function generateDiagramLevelTests(): {
  name: string;
  diagram: Railroad.Diagram;
}[] {
  const tests: { name: string; diagram: Railroad.Diagram }[] = [];
  
  let counter = 0;
  for (const diagram of generateDiagramTests()) {
    tests.push({ name: `diagram_${++counter}`, diagram });
  }
  
  return tests;
}

// Count total tests
export function countTests(): number {
  return (
    generateSequenceTests().length +
    generateChoiceTests().length +
    generateOptionalSequenceTests().length +
    generateStackTests().length +
    generateOneOrMoreTests().length +
    generateZeroOrMoreTests().length +
    generateOptionalTests().length +
    generateGroupTests().length +
    generateAlternatingSequenceTests().length +
    generateHorizontalChoiceTests().length +
    generateMultipleChoiceTests().length +
    generateNestedTests().length +
    generateStartEndTests().length +
    generateTextElementTests().length +
    generateBlockTests().length +
    generateDiagramTests().length
  );
}

// Print test count
console.log('Total test cases:', countTests());
