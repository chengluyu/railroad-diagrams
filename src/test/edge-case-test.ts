/**
 * Edge Case and Boundary Test Suite
 * 
 * Tests edge cases, boundary conditions, and unusual inputs
 * to ensure the library handles them gracefully.
 */

import * as Railroad from '../index.js';
import { Options } from '../config.js';

const originalOptions = { ...Options };
function resetOptions(): void {
  Object.assign(Options, originalOptions);
}

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void): void {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: String(error) });
    console.log(`✗ ${name}: ${error}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// ============================================================================
// Empty and Minimal Content Tests
// ============================================================================

console.log('\n=== Empty and Minimal Content ===\n');

test('Empty Terminal', () => {
  const terminal = new Railroad.Terminal('');
  assert(terminal.width > 0, 'Empty terminal should have positive width (padding)');
  const diagram = new Railroad.Diagram(terminal);
  diagram.format();
  const svg = diagram.toString();
  assert(svg.includes('<svg'), 'Should generate SVG');
});

test('Empty NonTerminal', () => {
  const nt = new Railroad.NonTerminal('');
  assert(nt.width > 0, 'Empty non-terminal should have positive width');
});

test('Empty Comment', () => {
  const comment = new Railroad.Comment('');
  assert(comment.width > 0, 'Empty comment should have positive width');
});

test('Single character Terminal', () => {
  const terminal = new Railroad.Terminal('x');
  assert(terminal.width === 1 * Options.CHAR_WIDTH + 20, 'Single char width calculation');
});

test('Single character NonTerminal', () => {
  const nt = new Railroad.NonTerminal('x');
  assert(nt.width === 1 * Options.CHAR_WIDTH + 20, 'Single char width calculation');
});

// ============================================================================
// Special Character Tests
// ============================================================================

console.log('\n=== Special Characters ===\n');

test('HTML special characters in Terminal', () => {
  const terminal = new Railroad.Terminal('<script>alert("xss")</script>');
  const diagram = new Railroad.Diagram(terminal);
  diagram.format();
  const svg = diagram.toString();
  assert(!svg.includes('<script>'), 'Should escape HTML tags in SVG');
});

test('Ampersand in Terminal', () => {
  const terminal = new Railroad.Terminal('A & B');
  const diagram = new Railroad.Diagram(terminal);
  diagram.format();
  const svg = diagram.toString();
  // SVG text content is output as-is; the important thing is it doesn't crash
  assert(svg.includes('A'), 'Should include text content');
});

test('Unicode characters', () => {
  const texts = ['日本語', '中文', '🎉🎊', 'αβγ', '∑∏∫'];
  for (const text of texts) {
    const terminal = new Railroad.Terminal(text);
    const diagram = new Railroad.Diagram(terminal);
    diagram.format();
    assert(diagram.toString().includes('<svg'), `Should handle: ${text}`);
  }
});

test('Newlines in text (should be handled)', () => {
  const terminal = new Railroad.Terminal('line1\nline2');
  const diagram = new Railroad.Diagram(terminal);
  diagram.format();
  // Newlines in text are unusual but shouldn't crash
});

test('Very long text', () => {
  const longText = 'a'.repeat(1000);
  const terminal = new Railroad.Terminal(longText);
  assert(terminal.width > 1000, 'Very long text should have large width');
  const diagram = new Railroad.Diagram(terminal);
  diagram.format();
  assert(diagram.toString().includes('<svg'), 'Should handle very long text');
});

test('Whitespace-only text', () => {
  const terminal = new Railroad.Terminal('   \t\n  ');
  const diagram = new Railroad.Diagram(terminal);
  diagram.format();
});

// ============================================================================
// Container Edge Cases
// ============================================================================

console.log('\n=== Container Edge Cases ===\n');

test('Sequence with single item', () => {
  const seq = new Railroad.Sequence(new Railroad.Terminal('only'));
  const diagram = new Railroad.Diagram(seq);
  diagram.format();
});

test('Sequence with many items', () => {
  const items = Array(20).fill(null).map((_, i) => new Railroad.Terminal(`item${i}`));
  const seq = new Railroad.Sequence(...items);
  const diagram = new Railroad.Diagram(seq);
  diagram.format();
  assert(diagram.toString().includes('<svg'), 'Should handle many items');
});

test('Choice with two identical options', () => {
  const choice = new Railroad.Choice(0,
    new Railroad.Terminal('same'),
    new Railroad.Terminal('same')
  );
  const diagram = new Railroad.Diagram(choice);
  diagram.format();
});

test('Choice with first item as default (index 0)', () => {
  const choice = new Railroad.Choice(0,
    new Railroad.Terminal('first'),
    new Railroad.Terminal('second'),
    new Railroad.Terminal('third')
  );
  assert(choice.normal === 0, 'Normal should be 0');
});

test('Choice with last item as default', () => {
  const items = [
    new Railroad.Terminal('a'),
    new Railroad.Terminal('b'),
    new Railroad.Terminal('c'),
    new Railroad.Terminal('d'),
    new Railroad.Terminal('e'),
  ];
  const choice = new Railroad.Choice(4, ...items);
  assert(choice.normal === 4, 'Normal should be 4');
});

test('Optional with skip', () => {
  const optional = new Railroad.Optional(new Railroad.Terminal('opt'), 'skip');
  const diagram = new Railroad.Diagram(optional);
  diagram.format();
});

test('ZeroOrMore with no repeat', () => {
  const zom = new Railroad.ZeroOrMore(new Railroad.Terminal('item'));
  const diagram = new Railroad.Diagram(zom);
  diagram.format();
});

test('ZeroOrMore with skip arrow', () => {
  const zom = new Railroad.ZeroOrMore(
    new Railroad.Terminal('item'),
    new Railroad.Terminal(','),
    'skip'
  );
  const diagram = new Railroad.Diagram(zom);
  diagram.format();
});

test('OneOrMore with no repeat', () => {
  const oom = new Railroad.OneOrMore(new Railroad.Terminal('item'));
  const diagram = new Railroad.Diagram(oom);
  diagram.format();
});

test('Group without label', () => {
  const group = new Railroad.Group(new Railroad.Terminal('content'));
  const diagram = new Railroad.Diagram(group);
  diagram.format();
});

test('Group with string label', () => {
  const group = new Railroad.Group(new Railroad.Terminal('content'), 'label');
  const diagram = new Railroad.Diagram(group);
  diagram.format();
});

test('Group with Comment label', () => {
  const group = new Railroad.Group(
    new Railroad.Terminal('content'),
    new Railroad.Comment('group comment')
  );
  const diagram = new Railroad.Diagram(group);
  diagram.format();
});

test('Stack with two items', () => {
  const stack = new Railroad.Stack(
    new Railroad.Terminal('first'),
    new Railroad.Terminal('second')
  );
  const diagram = new Railroad.Diagram(stack);
  diagram.format();
});

test('Stack with single item', () => {
  const stack = new Railroad.Stack(new Railroad.Terminal('only'));
  const diagram = new Railroad.Diagram(stack);
  diagram.format();
});

test('OptionalSequence with two items', () => {
  const optSeq = new Railroad.OptionalSequence(
    new Railroad.Terminal('a'),
    new Railroad.Terminal('b')
  );
  const diagram = new Railroad.Diagram(optSeq);
  diagram.format();
});

test('AlternatingSequence', () => {
  const altSeq = new Railroad.AlternatingSequence(
    new Railroad.Terminal('a'),
    new Railroad.Terminal('b')
  );
  const diagram = new Railroad.Diagram(altSeq);
  diagram.format();
});

test('HorizontalChoice', () => {
  const hChoice = new Railroad.HorizontalChoice(
    new Railroad.Terminal('a'),
    new Railroad.Terminal('b'),
    new Railroad.Terminal('c')
  );
  const diagram = new Railroad.Diagram(hChoice);
  diagram.format();
});

test('MultipleChoice (any)', () => {
  const mChoice = new Railroad.MultipleChoice(0, 'any',
    new Railroad.Terminal('a'),
    new Railroad.Terminal('b'),
    new Railroad.Terminal('c')
  );
  const diagram = new Railroad.Diagram(mChoice);
  diagram.format();
});

test('MultipleChoice (all)', () => {
  const mChoice = new Railroad.MultipleChoice(0, 'all',
    new Railroad.Terminal('a'),
    new Railroad.Terminal('b'),
    new Railroad.Terminal('c')
  );
  const diagram = new Railroad.Diagram(mChoice);
  diagram.format();
});

// ============================================================================
// Deep Nesting Tests
// ============================================================================

console.log('\n=== Deep Nesting ===\n');

test('Deeply nested Sequence', () => {
  let element: Railroad.FakeSVG = new Railroad.Terminal('deep');
  for (let i = 0; i < 10; i++) {
    element = new Railroad.Sequence(element, new Railroad.Terminal(`level${i}`));
  }
  const diagram = new Railroad.Diagram(element);
  diagram.format();
});

test('Deeply nested Choice', () => {
  let element: Railroad.FakeSVG = new Railroad.Terminal('deep');
  for (let i = 0; i < 5; i++) {
    element = new Railroad.Choice(0, element, new Railroad.Terminal(`level${i}`));
  }
  const diagram = new Railroad.Diagram(element);
  diagram.format();
});

test('Deeply nested Optional', () => {
  let element: Railroad.FakeSVG = new Railroad.Terminal('deep');
  for (let i = 0; i < 5; i++) {
    element = new Railroad.Optional(element);
  }
  const diagram = new Railroad.Diagram(element);
  diagram.format();
});

test('Mixed deep nesting', () => {
  const diagram = new Railroad.Diagram(
    new Railroad.Sequence(
      new Railroad.Choice(0,
        new Railroad.Optional(
          new Railroad.Group(
            new Railroad.OneOrMore(
              new Railroad.Sequence(
                new Railroad.Terminal('item'),
                new Railroad.Comment('nested deep')
              ),
              new Railroad.Terminal(',')
            ),
            'group'
          )
        ),
        new Railroad.Stack(
          new Railroad.Terminal('alt1'),
          new Railroad.Terminal('alt2')
        )
      ),
      new Railroad.ZeroOrMore(
        new Railroad.AlternatingSequence(
          new Railroad.Terminal('a'),
          new Railroad.Terminal('b')
        )
      )
    )
  );
  diagram.format();
});

// ============================================================================
// Block Element Tests
// ============================================================================

console.log('\n=== Block Element ===\n');

test('Block with default dimensions', () => {
  const block = new Railroad.Block();
  assert(block.width === 50, 'Default width should be 50');
  assert(block.height === 25, 'Default height should be 25');
  assert(block.up === 15, 'Default up should be 15');
  assert(block.down === 15, 'Default down should be 15');
});

test('Block with custom dimensions', () => {
  const block = new Railroad.Block({ width: 100, height: 50 });
  assert(block.width === 100, 'Custom width should be 100');
  assert(block.height === 50, 'Custom height should be 50');
});

test('Block with up/down values', () => {
  const block = new Railroad.Block({ width: 50, up: 30, height: 40, down: 20 });
  assert(block.up === 30, 'Up should be 30');
  assert(block.down === 20, 'Down should be 20');
});

test('Block with needsSpace', () => {
  const block = new Railroad.Block({ width: 50, needsSpace: true });
  assert(block.needsSpace === true, 'needsSpace should be true');
});

// ============================================================================
// Start/End Variations
// ============================================================================

console.log('\n=== Start/End Variations ===\n');

test('Start simple type', () => {
  const start = new Railroad.Start({ type: 'simple' });
  const diagram = new Railroad.Diagram(start, new Railroad.Terminal('test'));
  diagram.format();
});

test('Start complex type', () => {
  const start = new Railroad.Start({ type: 'complex' });
  const diagram = new Railroad.Diagram(start, new Railroad.Terminal('test'));
  diagram.format();
});

test('Start with label', () => {
  const start = new Railroad.Start({ type: 'simple', label: 'Entry' });
  const diagram = new Railroad.Diagram(start, new Railroad.Terminal('test'));
  diagram.format();
});

test('Start with long label', () => {
  const start = new Railroad.Start({ label: 'VeryLongEntryPointName' });
  const diagram = new Railroad.Diagram(start, new Railroad.Terminal('test'));
  diagram.format();
});

test('End simple type', () => {
  const diagram = new Railroad.Diagram(new Railroad.End({ type: 'simple' }));
  diagram.format();
});

test('End complex type', () => {
  const diagram = new Railroad.Diagram(new Railroad.End({ type: 'complex' }));
  diagram.format();
});

// ============================================================================
// Diagram Format Variations
// ============================================================================

console.log('\n=== Diagram Format Variations ===\n');

test('Format with no padding', () => {
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format(0);
});

test('Format with single padding', () => {
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format(10);
});

test('Format with two paddings (vertical, horizontal)', () => {
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format(10, 20);
});

test('Format with three paddings (top, horizontal, bottom)', () => {
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format(10, 20, 30);
});

test('Format with four paddings (top, right, bottom, left)', () => {
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format(10, 20, 30, 40);
});

test('ComplexDiagram creation', () => {
  const diagram = Railroad.ComplexDiagram(new Railroad.Terminal('test'));
  diagram.format();
});

// ============================================================================
// Link and Title Tests
// ============================================================================

console.log('\n=== Links and Titles ===\n');

test('Terminal with href', () => {
  const terminal = new Railroad.Terminal('link', { href: 'https://example.com' });
  const diagram = new Railroad.Diagram(terminal);
  diagram.format();
  const svg = diagram.toString();
  assert(svg.includes('xlink:href'), 'Should include xlink:href');
});

test('Terminal with title', () => {
  const terminal = new Railroad.Terminal('tip', { title: 'This is a tooltip' });
  const diagram = new Railroad.Diagram(terminal);
  diagram.format();
  const svg = diagram.toString();
  assert(svg.includes('<title>'), 'Should include title element');
});

test('Terminal with custom class', () => {
  Options.USE_CSS_CLASSES = true;
  const terminal = new Railroad.Terminal('styled', { cls: 'custom-class' });
  const diagram = new Railroad.Diagram(terminal);
  diagram.format();
  const svg = diagram.toString();
  assert(svg.includes('custom-class'), 'Should include custom class');
  resetOptions();
});

test('NonTerminal with href and title', () => {
  const nt = new Railroad.NonTerminal('link', { 
    href: '#anchor', 
    title: 'Go to anchor' 
  });
  const diagram = new Railroad.Diagram(nt);
  diagram.format();
});

test('Comment with href', () => {
  const comment = new Railroad.Comment('link', { href: '#ref' });
  const diagram = new Railroad.Diagram(comment);
  diagram.format();
});

// ============================================================================
// Text Diagram Output Tests
// ============================================================================

console.log('\n=== Text Diagram Output ===\n');

test('Terminal toText', () => {
  const terminal = new Railroad.Terminal('test');
  const text = terminal.toText();
  assert(text.includes('test'), 'Text should include terminal text');
});

test('NonTerminal toText', () => {
  const nt = new Railroad.NonTerminal('identifier');
  const text = nt.toText();
  assert(text.includes('identifier'), 'Text should include non-terminal text');
});

test('Sequence toText', () => {
  const seq = new Railroad.Sequence(
    new Railroad.Terminal('a'),
    new Railroad.Terminal('b')
  );
  const text = seq.toText();
  assert(text.includes('a'), 'Text should include first item');
  assert(text.includes('b'), 'Text should include second item');
});

test('Choice toText', () => {
  const choice = new Railroad.Choice(0,
    new Railroad.Terminal('opt1'),
    new Railroad.Terminal('opt2')
  );
  const text = choice.toText();
  assert(text.includes('opt1'), 'Text should include first option');
  assert(text.includes('opt2'), 'Text should include second option');
});

test('Full Diagram toText', () => {
  const diagram = new Railroad.Diagram(
    new Railroad.Sequence(
      new Railroad.Terminal('start'),
      new Railroad.Choice(0,
        new Railroad.Terminal('a'),
        new Railroad.Terminal('b')
      ),
      new Railroad.Terminal('end')
    )
  );
  const text = diagram.toText();
  assert(text.length > 0, 'Text diagram should not be empty');
  assert(text.includes('start'), 'Text should include start');
  assert(text.includes('end'), 'Text should include end');
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n=== Test Summary ===\n');

const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`Total: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  console.log('\nFailed tests:');
  results.filter(r => !r.passed).forEach(r => {
    console.log(`  - ${r.name}: ${r.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✓ All edge case tests passed!');
  process.exit(0);
}
