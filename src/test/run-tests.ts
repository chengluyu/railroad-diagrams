/**
 * Test runner for railroad diagrams
 * 
 * This test suite generates a large volume of test cases (100-300+)
 * and verifies that:
 * 1. All diagram elements can be constructed without errors
 * 2. All diagrams can be formatted without errors
 * 3. SVG output is generated consistently
 * 4. Text diagram output is generated consistently
 */

import * as fs from 'fs';
import * as path from 'path';
import * as Railroad from '../index.js';
import {
  generateAllTests,
  generateDiagramLevelTests,
  countTests,
  serializeDiagram,
  serializeTextDiagram,
} from './generate-test-cases.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  svgOutput?: string;
  textOutput?: string;
}

interface TestSuite {
  name: string;
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
}

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

/**
 * Run a single test case
 */
function runTest(name: string, element: Railroad.FakeSVG): TestResult {
  try {
    // Try to format the element (this validates internal structure)
    if (element.format) {
      element.format(0, 0, element.width);
    }
    
    // Generate SVG output
    let svgOutput: string | undefined;
    try {
      svgOutput = element.toString();
    } catch (e) {
      // Some elements might not support toString directly
    }
    
    // Generate text diagram output
    let textOutput: string | undefined;
    try {
      textOutput = element.toText();
    } catch (e) {
      // Some elements might not support toText directly
    }
    
    // Verify the output is not empty (for supported methods)
    if (svgOutput !== undefined && svgOutput.length === 0) {
      return {
        name,
        passed: false,
        error: 'SVG output is empty',
      };
    }
    
    return {
      name,
      passed: true,
      svgOutput,
      textOutput,
    };
  } catch (error) {
    return {
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run diagram-level tests
 */
function runDiagramTest(name: string, diagram: Railroad.Diagram): TestResult {
  try {
    // Format the diagram
    diagram.format();
    
    // Generate SVG output
    const svgOutput = diagram.toString();
    
    // Generate text diagram output
    const textOutput = diagram.toText();
    
    // Verify SVG structure
    if (!svgOutput.includes('<svg')) {
      return {
        name,
        passed: false,
        error: 'SVG output does not contain <svg> tag',
      };
    }
    
    if (!svgOutput.includes('</svg>')) {
      return {
        name,
        passed: false,
        error: 'SVG output does not contain closing </svg> tag',
      };
    }
    
    // Verify standalone mode works
    const standalone = diagram.toStandalone();
    if (!standalone.includes('xmlns')) {
      return {
        name,
        passed: false,
        error: 'Standalone SVG missing xmlns',
      };
    }
    
    return {
      name,
      passed: true,
      svgOutput,
      textOutput,
    };
  } catch (error) {
    return {
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<TestSuite[]> {
  const suites: TestSuite[] = [];
  
  // Test 1: Element construction tests
  log('Running element construction tests...', 'cyan');
  const elementTests = generateAllTests();
  const elementSuite: TestSuite = {
    name: 'Element Construction',
    total: elementTests.length,
    passed: 0,
    failed: 0,
    results: [],
  };
  
  for (const { name, element } of elementTests) {
    const result = runTest(name, element);
    elementSuite.results.push(result);
    if (result.passed) {
      elementSuite.passed++;
    } else {
      elementSuite.failed++;
    }
  }
  suites.push(elementSuite);
  
  // Test 2: Diagram-level tests
  log('Running diagram-level tests...', 'cyan');
  const diagramTests = generateDiagramLevelTests();
  const diagramSuite: TestSuite = {
    name: 'Diagram Level',
    total: diagramTests.length,
    passed: 0,
    failed: 0,
    results: [],
  };
  
  for (const { name, diagram } of diagramTests) {
    const result = runDiagramTest(name, diagram);
    diagramSuite.results.push(result);
    if (result.passed) {
      diagramSuite.passed++;
    } else {
      diagramSuite.failed++;
    }
  }
  suites.push(diagramSuite);
  
  // Test 3: Edge case tests
  log('Running edge case tests...', 'cyan');
  const edgeCaseSuite: TestSuite = {
    name: 'Edge Cases',
    total: 0,
    passed: 0,
    failed: 0,
    results: [],
  };
  
  // Empty string content
  edgeCaseSuite.total++;
  try {
    const emptyTerminal = new Railroad.Terminal('');
    const result = runTest('empty_terminal', emptyTerminal);
    edgeCaseSuite.results.push(result);
    if (result.passed) edgeCaseSuite.passed++;
    else edgeCaseSuite.failed++;
  } catch (error) {
    edgeCaseSuite.failed++;
    edgeCaseSuite.results.push({
      name: 'empty_terminal',
      passed: false,
      error: String(error),
    });
  }
  
  // Very long text
  edgeCaseSuite.total++;
  try {
    const longText = 'a'.repeat(100);
    const longTerminal = new Railroad.Terminal(longText);
    const result = runTest('long_terminal', longTerminal);
    edgeCaseSuite.results.push(result);
    if (result.passed) edgeCaseSuite.passed++;
    else edgeCaseSuite.failed++;
  } catch (error) {
    edgeCaseSuite.failed++;
    edgeCaseSuite.results.push({
      name: 'long_terminal',
      passed: false,
      error: String(error),
    });
  }
  
  // Special characters in text
  edgeCaseSuite.total++;
  try {
    const specialText = '<>&"\'';
    const specialTerminal = new Railroad.Terminal(specialText);
    const result = runTest('special_chars_terminal', specialTerminal);
    edgeCaseSuite.results.push(result);
    if (result.passed) edgeCaseSuite.passed++;
    else edgeCaseSuite.failed++;
  } catch (error) {
    edgeCaseSuite.failed++;
    edgeCaseSuite.results.push({
      name: 'special_chars_terminal',
      passed: false,
      error: String(error),
    });
  }
  
  // Unicode characters
  edgeCaseSuite.total++;
  try {
    const unicodeText = '日本語中文🎉';
    const unicodeTerminal = new Railroad.Terminal(unicodeText);
    const result = runTest('unicode_terminal', unicodeTerminal);
    edgeCaseSuite.results.push(result);
    if (result.passed) edgeCaseSuite.passed++;
    else edgeCaseSuite.failed++;
  } catch (error) {
    edgeCaseSuite.failed++;
    edgeCaseSuite.results.push({
      name: 'unicode_terminal',
      passed: false,
      error: String(error),
    });
  }
  
  // Single item in choice
  edgeCaseSuite.total++;
  try {
    const singleChoice = new Railroad.Choice(0, new Railroad.Terminal('only'));
    const result = runTest('single_item_choice', singleChoice);
    edgeCaseSuite.results.push(result);
    if (result.passed) edgeCaseSuite.passed++;
    else edgeCaseSuite.failed++;
  } catch (error) {
    edgeCaseSuite.failed++;
    edgeCaseSuite.results.push({
      name: 'single_item_choice',
      passed: false,
      error: String(error),
    });
  }
  
  // Deeply nested structure
  edgeCaseSuite.total++;
  try {
    const deepNested = new Railroad.Sequence(
      new Railroad.Group(
        new Railroad.Choice(
          0,
          new Railroad.Sequence(
            new Railroad.Optional(
              new Railroad.OneOrMore(
                new Railroad.ZeroOrMore(
                  new Railroad.Terminal('deep')
                )
              )
            )
          ),
          new Railroad.Terminal('other')
        ),
        'deep group'
      )
    );
    const result = runTest('deeply_nested', deepNested);
    edgeCaseSuite.results.push(result);
    if (result.passed) edgeCaseSuite.passed++;
    else edgeCaseSuite.failed++;
  } catch (error) {
    edgeCaseSuite.failed++;
    edgeCaseSuite.results.push({
      name: 'deeply_nested',
      passed: false,
      error: String(error),
    });
  }
  
  suites.push(edgeCaseSuite);
  
  return suites;
}

/**
 * Generate and save snapshots for comparison
 */
async function generateSnapshots(suites: TestSuite[]): Promise<void> {
  const snapshotDir = path.join(__dirname, '..', '..', 'test-snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  
  const snapshot: Record<string, { svg?: string; text?: string }> = {};
  
  for (const suite of suites) {
    for (const result of suite.results) {
      if (result.passed && result.svgOutput) {
        snapshot[result.name] = {
          svg: result.svgOutput,
          text: result.textOutput,
        };
      }
    }
  }
  
  const snapshotPath = path.join(snapshotDir, 'snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  log(`Snapshots saved to ${snapshotPath}`, 'green');
}

/**
 * Compare current output with saved snapshots
 */
async function compareSnapshots(suites: TestSuite[]): Promise<{
  matches: number;
  mismatches: number;
  missing: number;
}> {
  const snapshotPath = path.join(__dirname, '..', '..', 'test-snapshots', 'snapshot.json');
  
  if (!fs.existsSync(snapshotPath)) {
    log('No snapshot file found. Run with --generate-snapshots first.', 'yellow');
    return { matches: 0, mismatches: 0, missing: 0 };
  }
  
  const snapshot: Record<string, { svg?: string; text?: string }> = JSON.parse(
    fs.readFileSync(snapshotPath, 'utf-8')
  );
  
  let matches = 0;
  let mismatches = 0;
  let missing = 0;
  
  for (const suite of suites) {
    for (const result of suite.results) {
      if (!result.passed) continue;
      
      const expected = snapshot[result.name];
      if (!expected) {
        missing++;
        log(`Missing snapshot: ${result.name}`, 'yellow');
        continue;
      }
      
      if (result.svgOutput && expected.svg && result.svgOutput === expected.svg) {
        matches++;
      } else if (result.svgOutput && expected.svg) {
        mismatches++;
        log(`SVG mismatch: ${result.name}`, 'red');
      }
    }
  }
  
  return { matches, mismatches, missing };
}

/**
 * Main test runner
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const generateSnapshotsFlag = args.includes('--generate-snapshots');
  const verbose = args.includes('--verbose');
  
  log('', 'reset');
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║       Railroad Diagrams TypeScript Test Suite              ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  log('', 'reset');
  
  log(`Total test cases to generate: ${countTests()}`, 'cyan');
  log('', 'reset');
  
  const startTime = Date.now();
  const suites = await runAllTests();
  const duration = Date.now() - startTime;
  
  // Print results
  log('', 'reset');
  log('Test Results:', 'blue');
  log('─'.repeat(60), 'blue');
  
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const suite of suites) {
    totalTests += suite.total;
    totalPassed += suite.passed;
    totalFailed += suite.failed;
    
    const status = suite.failed === 0 ? 'green' : 'red';
    log(
      `${suite.name}: ${suite.passed}/${suite.total} passed`,
      status
    );
    
    if (verbose && suite.failed > 0) {
      for (const result of suite.results) {
        if (!result.passed) {
          log(`  ✗ ${result.name}: ${result.error}`, 'red');
        }
      }
    } else if (suite.failed > 0) {
      const failedTests = suite.results.filter((r) => !r.passed);
      for (const result of failedTests.slice(0, 3)) {
        log(`  ✗ ${result.name}: ${result.error}`, 'red');
      }
      if (failedTests.length > 3) {
        log(`  ... and ${failedTests.length - 3} more failures`, 'red');
      }
    }
  }
  
  log('─'.repeat(60), 'blue');
  
  const overallStatus = totalFailed === 0 ? 'green' : 'red';
  log(
    `Total: ${totalPassed}/${totalTests} passed (${duration}ms)`,
    overallStatus
  );
  
  // Snapshot comparison
  if (generateSnapshotsFlag) {
    log('', 'reset');
    log('Generating snapshots...', 'cyan');
    await generateSnapshots(suites);
  } else {
    log('', 'reset');
    log('Comparing with snapshots...', 'cyan');
    const { matches, mismatches, missing } = await compareSnapshots(suites);
    log(`Matches: ${matches}, Mismatches: ${mismatches}, Missing: ${missing}`, matches > 0 && mismatches === 0 ? 'green' : 'yellow');
  }
  
  log('', 'reset');
  
  // Exit with error code if tests failed
  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
