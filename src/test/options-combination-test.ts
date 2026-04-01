/**
 * Options Combination Test Suite
 * 
 * Tests all configurable Options individually and in various combinations
 * to ensure they work correctly across all diagram element types.
 */

import * as Railroad from '../index.js';
import { Options, Style } from '../config.js';

// Save original options to restore after tests
const originalOptions = { ...Options };
const originalStyle = { ...Style };

function resetOptions(): void {
  Object.assign(Options, originalOptions);
  Object.assign(Style, originalStyle);
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
  if (!condition) {
    throw new Error(message);
  }
}

// ============================================================================
// Individual Option Tests
// ============================================================================

console.log('\n=== Testing Individual Options ===\n');

// Test DEBUG option
test('DEBUG: true adds debug attributes', () => {
  Options.DEBUG = true;
  const terminal = new Railroad.Terminal('test');
  assert(terminal.attrs['data-updown'] !== undefined, 'DEBUG should add data-updown attribute');
  assert(terminal.attrs['data-type'] === 'terminal', 'DEBUG should add data-type attribute');
  resetOptions();
});

test('DEBUG: false does not add debug attributes', () => {
  Options.DEBUG = false;
  const terminal = new Railroad.Terminal('test');
  assert(terminal.attrs['data-updown'] === undefined, 'DEBUG false should not add data-updown');
  resetOptions();
});

// Test VS (vertical separation)
test('VS: larger value increases vertical spacing', () => {
  Options.VS = 8;
  const choice1 = new Railroad.Choice(0, new Railroad.Terminal('a'), new Railroad.Terminal('b'));
  const height1 = choice1.up + choice1.down;
  
  Options.VS = 20;
  const choice2 = new Railroad.Choice(0, new Railroad.Terminal('a'), new Railroad.Terminal('b'));
  const height2 = choice2.up + choice2.down;
  
  assert(height2 > height1, 'Larger VS should increase vertical space');
  resetOptions();
});

// Test AR (arc radius)
test('AR: larger value increases arc radius', () => {
  Options.AR = 10;
  const choice1 = new Railroad.Choice(0, new Railroad.Terminal('a'), new Railroad.Terminal('b'));
  const width1 = choice1.width;
  
  Options.AR = 20;
  const choice2 = new Railroad.Choice(0, new Railroad.Terminal('a'), new Railroad.Terminal('b'));
  const width2 = choice2.width;
  
  assert(width2 > width1, 'Larger AR should increase width');
  resetOptions();
});

// Test DIAGRAM_CLASS
test('DIAGRAM_CLASS: custom class name', () => {
  Options.DIAGRAM_CLASS = 'my-custom-class';
  Options.USE_CSS_CLASSES = true;
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format();
  const svg = diagram.toString();
  assert(svg.includes('class="my-custom-class"'), 'Should use custom diagram class');
  resetOptions();
});

// Test STROKE_ODD_PIXEL_LENGTH
test('STROKE_ODD_PIXEL_LENGTH: true adds transform', () => {
  Options.STROKE_ODD_PIXEL_LENGTH = true;
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format();
  const svg = diagram.toString();
  assert(svg.includes('transform="translate(.5 .5)"'), 'Should add translate transform');
  resetOptions();
});

test('STROKE_ODD_PIXEL_LENGTH: false removes transform', () => {
  Options.STROKE_ODD_PIXEL_LENGTH = false;
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format();
  const svg = diagram.toString();
  assert(!svg.includes('translate(.5 .5)'), 'Should not add translate transform');
  resetOptions();
});

// Test INTERNAL_ALIGNMENT
test('INTERNAL_ALIGNMENT: left alignment', () => {
  Options.INTERNAL_ALIGNMENT = 'left';
  const choice = new Railroad.Choice(0, 
    new Railroad.Terminal('short'),
    new Railroad.Terminal('muchlongertext')
  );
  // Just verify it doesn't throw
  choice.format(0, 0, choice.width);
  resetOptions();
});

test('INTERNAL_ALIGNMENT: right alignment', () => {
  Options.INTERNAL_ALIGNMENT = 'right';
  const choice = new Railroad.Choice(0, 
    new Railroad.Terminal('short'),
    new Railroad.Terminal('muchlongertext')
  );
  choice.format(0, 0, choice.width);
  resetOptions();
});

test('INTERNAL_ALIGNMENT: center alignment', () => {
  Options.INTERNAL_ALIGNMENT = 'center';
  const choice = new Railroad.Choice(0, 
    new Railroad.Terminal('short'),
    new Railroad.Terminal('muchlongertext')
  );
  choice.format(0, 0, choice.width);
  resetOptions();
});

// Test CHAR_WIDTH
test('CHAR_WIDTH: affects terminal width', () => {
  Options.CHAR_WIDTH = 8;
  const term1 = new Railroad.Terminal('test');
  const width1 = term1.width;
  
  Options.CHAR_WIDTH = 12;
  const term2 = new Railroad.Terminal('test');
  const width2 = term2.width;
  
  assert(width2 > width1, 'Larger CHAR_WIDTH should increase terminal width');
  resetOptions();
});

// Test COMMENT_CHAR_WIDTH
test('COMMENT_CHAR_WIDTH: affects comment width', () => {
  Options.COMMENT_CHAR_WIDTH = 7;
  const comment1 = new Railroad.Comment('test');
  const width1 = comment1.width;
  
  Options.COMMENT_CHAR_WIDTH = 10;
  const comment2 = new Railroad.Comment('test');
  const width2 = comment2.width;
  
  assert(width2 > width1, 'Larger COMMENT_CHAR_WIDTH should increase comment width');
  resetOptions();
});

// Test ESCAPE_HTML
test('ESCAPE_HTML: true escapes special characters', () => {
  Options.ESCAPE_HTML = true;
  const diagram = new Railroad.Diagram(new Railroad.Terminal('<test>'));
  const text = diagram.toText();
  assert(!text.includes('<test>'), 'Should escape HTML characters');
  resetOptions();
});

// Test USE_CSS_CLASSES
test('USE_CSS_CLASSES: true includes class attributes', () => {
  Options.USE_CSS_CLASSES = true;
  const diagram = new Railroad.Diagram(
    new Railroad.Terminal('t'),
    new Railroad.NonTerminal('n'),
    new Railroad.Comment('c')
  );
  diagram.format();
  const svg = diagram.toString();
  assert(svg.includes('class="terminal"'), 'Should include terminal class');
  assert(svg.includes('class="non-terminal"'), 'Should include non-terminal class');
  assert(svg.includes('class="comment"'), 'Should include comment class');
  resetOptions();
});

test('USE_CSS_CLASSES: false excludes class attributes', () => {
  Options.USE_CSS_CLASSES = false;
  const diagram = new Railroad.Diagram(
    new Railroad.Terminal('t'),
    new Railroad.NonTerminal('n'),
    new Railroad.Comment('c')
  );
  diagram.format();
  const svg = diagram.toString();
  assert(!svg.includes('class="terminal"'), 'Should not include terminal class');
  assert(!svg.includes('class="non-terminal"'), 'Should not include non-terminal class');
  assert(!svg.includes('class="comment"'), 'Should not include comment class');
  resetOptions();
});

// ============================================================================
// Option Combination Tests
// ============================================================================

console.log('\n=== Testing Option Combinations ===\n');

const optionValues = {
  DEBUG: [true, false],
  VS: [4, 8, 16],
  AR: [5, 10, 20],
  STROKE_ODD_PIXEL_LENGTH: [true, false],
  INTERNAL_ALIGNMENT: ['left', 'center', 'right'] as const,
  CHAR_WIDTH: [6, 8.5, 12],
  COMMENT_CHAR_WIDTH: [5, 7, 10],
  ESCAPE_HTML: [true, false],
  USE_CSS_CLASSES: [true, false],
};

// Test a sample of combinations (not all, that would be too many)
const testCombinations = [
  { DEBUG: true, VS: 16, AR: 20 },
  { STROKE_ODD_PIXEL_LENGTH: false, INTERNAL_ALIGNMENT: 'right', CHAR_WIDTH: 12 },
  { COMMENT_CHAR_WIDTH: 10, ESCAPE_HTML: false, USE_CSS_CLASSES: false },
  { VS: 4, AR: 5, INTERNAL_ALIGNMENT: 'left', USE_CSS_CLASSES: false },
  { DEBUG: true, STROKE_ODD_PIXEL_LENGTH: true, ESCAPE_HTML: true },
];

for (let i = 0; i < testCombinations.length; i++) {
  const combo = testCombinations[i];
  test(`Combination ${i + 1}: ${JSON.stringify(combo)}`, () => {
    Object.assign(Options, combo);
    
    // Create various diagram types
    const diagram = new Railroad.Diagram(
      new Railroad.Sequence(
        new Railroad.Terminal('start'),
        new Railroad.Choice(0,
          new Railroad.NonTerminal('OptionA'),
          new Railroad.NonTerminal('OptionB')
        ),
        new Railroad.Optional(
          new Railroad.OneOrMore(
            new Railroad.Terminal('item'),
            new Railroad.Terminal(',')
          )
        ),
        new Railroad.Comment('end')
      )
    );
    
    diagram.format();
    const svg = diagram.toString();
    const text = diagram.toText();
    
    assert(svg.includes('<svg'), 'Should generate valid SVG');
    assert(svg.includes('</svg>'), 'Should have closing SVG tag');
    assert(text.length > 0, 'Should generate text output');
    
    resetOptions();
  });
}

// ============================================================================
// Edge Case Tests
// ============================================================================

console.log('\n=== Testing Edge Cases ===\n');

test('Extreme VS value: 1', () => {
  Options.VS = 1;
  const diagram = new Railroad.Diagram(
    new Railroad.Choice(0, new Railroad.Terminal('a'), new Railroad.Terminal('b'))
  );
  diagram.format();
  resetOptions();
});

test('Extreme VS value: 50', () => {
  Options.VS = 50;
  const diagram = new Railroad.Diagram(
    new Railroad.Choice(0, new Railroad.Terminal('a'), new Railroad.Terminal('b'))
  );
  diagram.format();
  resetOptions();
});

test('Extreme AR value: 1', () => {
  Options.AR = 1;
  const diagram = new Railroad.Diagram(
    new Railroad.Choice(0, new Railroad.Terminal('a'), new Railroad.Terminal('b'))
  );
  diagram.format();
  resetOptions();
});

test('Extreme AR value: 50', () => {
  Options.AR = 50;
  const diagram = new Railroad.Diagram(
    new Railroad.Choice(0, new Railroad.Terminal('a'), new Railroad.Terminal('b'))
  );
  diagram.format();
  resetOptions();
});

test('CHAR_WIDTH: 1 (minimum)', () => {
  Options.CHAR_WIDTH = 1;
  const terminal = new Railroad.Terminal('test');
  assert(terminal.width > 0, 'Width should be positive');
  resetOptions();
});

test('CHAR_WIDTH: 20 (large)', () => {
  Options.CHAR_WIDTH = 20;
  const terminal = new Railroad.Terminal('test');
  assert(terminal.width > 80, 'Width should be large');
  resetOptions();
});

// ============================================================================
// Style Configuration Tests
// ============================================================================

console.log('\n=== Testing Style Configuration ===\n');

test('Style.PATH_STROKE color change', () => {
  Style.PATH_STROKE = 'red';
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format();
  const svg = diagram.toString();
  assert(svg.includes('stroke="red"'), 'Should use custom stroke color');
  resetOptions();
});

test('Style.TEXT_FILL color change', () => {
  Style.TEXT_FILL = 'blue';
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format();
  const svg = diagram.toString();
  assert(svg.includes('fill="blue"'), 'Should use custom text fill color');
  resetOptions();
});

test('Style.RECT_FILL color change', () => {
  Style.RECT_FILL = '#ffffcc';
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format();
  const svg = diagram.toString();
  assert(svg.includes('fill="#ffffcc"'), 'Should use custom rect fill color');
  resetOptions();
});

test('Style.TERMINAL_FONT_FAMILY change', () => {
  Style.TERMINAL_FONT_FAMILY = 'Arial, sans-serif';
  const diagram = new Railroad.Diagram(new Railroad.Terminal('test'));
  diagram.format();
  const svg = diagram.toString();
  assert(svg.includes('font-family="Arial, sans-serif"'), 'Should use custom font family');
  resetOptions();
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
  console.log('\n✓ All option tests passed!');
  process.exit(0);
}
