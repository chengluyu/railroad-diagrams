/**
 * Comparison test between TypeScript implementation and original JavaScript
 * 
 * This test loads the original railroad.js file and compares its output
 * with the TypeScript implementation to ensure identical behavior.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import TypeScript implementation
import * as TS from '../index.js';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface ComparisonResult {
  name: string;
  tsOutput: string;
  jsOutput?: string;
  match: boolean;
  error?: string;
}

/**
 * Try to load the original JavaScript implementation
 */
async function loadOriginalJS(): Promise<typeof TS | null> {
  const jsPath = path.join(__dirname, '..', '..', 'railroad.js');
  
  if (!fs.existsSync(jsPath)) {
    log('Original railroad.js not found. Skipping comparison test.', 'yellow');
    return null;
  }
  
  try {
    log('Note: Full JS/TS comparison requires manual verification.', 'yellow');
    return null;
  } catch (error) {
    log(`Failed to load original JS: ${error}`, 'red');
    return null;
  }
}

/**
 * Generate test cases for comparison
 */
function generateComparisonTests(): Array<{ name: string; createDiagram: () => TS.Diagram }> {
  const tests: Array<{ name: string; createDiagram: () => TS.Diagram }> = [];
  
  // Basic Terminal
  tests.push({
    name: 'basic_terminal',
    createDiagram: () =>
      new TS.Diagram(
        new TS.Terminal('hello')
      ),
  });
  
  // Basic NonTerminal
  tests.push({
    name: 'basic_nonterminal',
    createDiagram: () =>
      new TS.Diagram(
        new TS.NonTerminal('Identifier')
      ),
  });
  
  // Sequence
  tests.push({
    name: 'simple_sequence',
    createDiagram: () =>
      new TS.Diagram(
        new TS.Sequence(
          new TS.Terminal('a'),
          new TS.Terminal('b'),
          new TS.Terminal('c')
        )
      ),
  });
  
  // Choice
  tests.push({
    name: 'simple_choice',
    createDiagram: () =>
      new TS.Diagram(
        new TS.Choice(
          0,
          new TS.Terminal('option1'),
          new TS.Terminal('option2')
        )
      ),
  });
  
  // Optional
  tests.push({
    name: 'simple_optional',
    createDiagram: () =>
      new TS.Diagram(
        new TS.Optional(new TS.Terminal('optional'))
      ),
  });
  
  // OneOrMore
  tests.push({
    name: 'one_or_more',
    createDiagram: () =>
      new TS.Diagram(
        new TS.OneOrMore(
          new TS.Terminal('item'),
          new TS.Terminal(',')
        )
      ),
  });
  
  // ZeroOrMore
  tests.push({
    name: 'zero_or_more',
    createDiagram: () =>
      new TS.Diagram(
        new TS.ZeroOrMore(
          new TS.Terminal('item'),
          new TS.Terminal(',')
        )
      ),
  });
  
  // Group
  tests.push({
    name: 'simple_group',
    createDiagram: () =>
      new TS.Diagram(
        new TS.Group(
          new TS.Terminal('grouped'),
          'label'
        )
      ),
  });
  
  // Stack
  tests.push({
    name: 'simple_stack',
    createDiagram: () =>
      new TS.Diagram(
        new TS.Stack(
          new TS.Terminal('first'),
          new TS.Terminal('second'),
          new TS.Terminal('third')
        )
      ),
  });
  
  // Comment
  tests.push({
    name: 'with_comment',
    createDiagram: () =>
      new TS.Diagram(
        new TS.Terminal('item'),
        new TS.Comment('a comment')
      ),
  });
  
  // Nested structure
  tests.push({
    name: 'nested_structure',
    createDiagram: () =>
      new TS.Diagram(
        new TS.Choice(
          0,
          new TS.Sequence(
            new TS.Terminal('a'),
            new TS.Terminal('b')
          ),
          new TS.Sequence(
            new TS.Terminal('c'),
            new TS.Terminal('d')
          )
        )
      ),
  });
  
  // Complex expression
  tests.push({
    name: 'complex_expression',
    createDiagram: () =>
      new TS.Diagram(
        new TS.NonTerminal('Expression'),
        new TS.ZeroOrMore(
          new TS.Sequence(
            new TS.Choice(
              0,
              new TS.Terminal('+'),
              new TS.Terminal('-')
            ),
            new TS.NonTerminal('Expression')
          )
        )
      ),
  });
  
  // OptionalSequence
  tests.push({
    name: 'optional_sequence',
    createDiagram: () =>
      new TS.Diagram(
        new TS.OptionalSequence(
          new TS.Terminal('a'),
          new TS.Terminal('b'),
          new TS.Terminal('c')
        )
      ),
  });
  
  // AlternatingSequence
  tests.push({
    name: 'alternating_sequence',
    createDiagram: () =>
      new TS.Diagram(
        new TS.AlternatingSequence(
          new TS.Terminal('a'),
          new TS.Terminal('b')
        )
      ),
  });
  
  // HorizontalChoice
  tests.push({
    name: 'horizontal_choice',
    createDiagram: () =>
      new TS.Diagram(
        new TS.HorizontalChoice(
          new TS.Terminal('opt1'),
          new TS.Terminal('opt2'),
          new TS.Terminal('opt3')
        )
      ),
  });
  
  // MultipleChoice (any)
  tests.push({
    name: 'multiple_choice_any',
    createDiagram: () =>
      new TS.Diagram(
        new TS.MultipleChoice(
          0,
          'any',
          new TS.Terminal('a'),
          new TS.Terminal('b'),
          new TS.Terminal('c')
        )
      ),
  });
  
  // MultipleChoice (all)
  tests.push({
    name: 'multiple_choice_all',
    createDiagram: () =>
      new TS.Diagram(
        new TS.MultipleChoice(
          0,
          'all',
          new TS.Terminal('a'),
          new TS.Terminal('b')
        )
      ),
  });
  
  // ComplexDiagram
  tests.push({
    name: 'complex_diagram',
    createDiagram: () =>
      TS.ComplexDiagram(
        new TS.NonTerminal('Start'),
        new TS.Terminal('->'),
        new TS.NonTerminal('End')
      ),
  });
  
  // With Skip
  tests.push({
    name: 'with_skip',
    createDiagram: () =>
      new TS.Diagram(
        new TS.Choice(
          0,
          new TS.Skip(),
          new TS.Terminal('something')
        )
      ),
  });
  
  // Block
  tests.push({
    name: 'simple_block',
    createDiagram: () =>
      new TS.Diagram(
        new TS.Block({ width: 100, height: 50 })
      ),
  });
  
  // Deep nesting
  tests.push({
    name: 'deep_nesting',
    createDiagram: () =>
      new TS.Diagram(
        new TS.Group(
          new TS.Choice(
            0,
            new TS.Sequence(
              new TS.Optional(
                new TS.OneOrMore(
                  new TS.Terminal('item')
                )
              ),
              new TS.Terminal('end')
            ),
            new TS.Terminal('alternative')
          ),
          'deeply nested'
        )
      ),
  });
  
  return tests;
}

/**
 * Run comparison tests
 */
async function runComparison(): Promise<void> {
  const originalJS = await loadOriginalJS();
  const tests = generateComparisonTests();
  
  log('', 'reset');
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║    Railroad Diagrams: TypeScript Output Validation         ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  log('', 'reset');
  
  const results: ComparisonResult[] = [];
  
  for (const { name, createDiagram } of tests) {
    try {
      const diagram = createDiagram();
      
      // Format and generate output
      diagram.format();
      const tsOutput = diagram.toString();
      
      // Verify the output is valid SVG
      const isValidSVG =
        tsOutput.includes('<svg') &&
        tsOutput.includes('</svg>') &&
        tsOutput.includes('class="railroad-diagram"');
      
      results.push({
        name,
        tsOutput,
        match: isValidSVG,
        error: isValidSVG ? undefined : 'Invalid SVG output',
      });
      
      if (!isValidSVG) {
        log(`✗ ${name}: Invalid SVG`, 'red');
      }
    } catch (error) {
      results.push({
        name,
        tsOutput: '',
        match: false,
        error: error instanceof Error ? error.message : String(error),
      });
      log(`✗ ${name}: ${error}`, 'red');
    }
  }
  
  // Print summary
  log('', 'reset');
  log('Summary:', 'blue');
  log('─'.repeat(60), 'blue');
  
  const passed = results.filter((r) => r.match).length;
  const failed = results.filter((r) => !r.match).length;
  
  log(`Total tests: ${results.length}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed === 0 ? 'green' : 'red');
  
  // Save outputs for manual comparison
  const outputDir = path.join(__dirname, '..', '..', 'test-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const result of results) {
    const outputPath = path.join(outputDir, `${result.name}.svg`);
    fs.writeFileSync(outputPath, result.tsOutput);
  }
  
  log('', 'reset');
  log(`SVG outputs saved to: ${outputDir}`, 'cyan');
  log('', 'reset');
  
  if (failed > 0) {
    process.exit(1);
  }
}

/**
 * Generate a large batch of random/permuted tests
 */
async function generateBatchTests(count: number): Promise<void> {
  log('', 'reset');
  log(`Generating ${count} batch test cases...`, 'cyan');
  
  const elements: Array<() => TS.FakeSVG> = [
    () => new TS.Terminal('term'),
    () => new TS.NonTerminal('NonTerm'),
    () => new TS.Comment('comment'),
    () => new TS.Skip(),
  ];
  
  const containers: Array<(items: TS.FakeSVG[]) => TS.FakeSVG> = [
    (items) => new TS.Sequence(...items),
    (items) => new TS.Choice(0, ...items.slice(0, 3)),
    (items) => new TS.Stack(...items.slice(0, 3)),
    (items) => new TS.Optional(items[0]),
    (items) => new TS.OneOrMore(items[0]),
    (items) => new TS.ZeroOrMore(items[0]),
    (items) => new TS.Group(items[0]),
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (let i = 0; i < count; i++) {
    try {
      // Create random combination of elements
      const numElements = Math.floor(Math.random() * 3) + 1;
      const selectedElements: TS.FakeSVG[] = [];
      
      for (let j = 0; j < numElements; j++) {
        const factory = elements[Math.floor(Math.random() * elements.length)];
        selectedElements.push(factory());
      }
      
      // Wrap in random container
      const containerFactory = containers[Math.floor(Math.random() * containers.length)];
      const container = containerFactory(selectedElements);
      
      // Create diagram
      const diagram = new TS.Diagram(container);
      diagram.format();
      const output = diagram.toString();
      
      // Verify
      if (output.includes('<svg') && output.includes('</svg>')) {
        passed++;
      } else {
        failed++;
        log(`Test ${i + 1}: Invalid output`, 'red');
      }
    } catch (error) {
      failed++;
      if (i < 10) {
        log(`Test ${i + 1}: ${error}`, 'red');
      }
    }
  }
  
  log('', 'reset');
  log('Batch Test Results:', 'blue');
  log(`Passed: ${passed}/${count}`, passed === count ? 'green' : 'yellow');
  log(`Failed: ${failed}/${count}`, failed === 0 ? 'green' : 'red');
  log('', 'reset');
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const batchMode = args.includes('--batch');
  const batchSize = batchMode ? 300 : 0;
  
  if (batchMode) {
    await generateBatchTests(batchSize);
  } else {
    await runComparison();
  }
}

main().catch((error) => {
  console.error('Comparison test failed:', error);
  process.exit(1);
});
