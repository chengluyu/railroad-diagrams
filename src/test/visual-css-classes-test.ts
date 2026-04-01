/**
 * Visual CSS Classes Test
 * 
 * Generates an HTML page comparing SVGs with USE_CSS_CLASSES on vs off.
 * This allows visual verification that both versions render identically.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as Railroad from '../index.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Test cases for visual comparison
const testCases = [
  {
    name: 'Terminal',
    create: () => new Railroad.Diagram(new Railroad.Terminal('hello')),
  },
  {
    name: 'NonTerminal',
    create: () => new Railroad.Diagram(new Railroad.NonTerminal('Identifier')),
  },
  {
    name: 'Comment',
    create: () => new Railroad.Diagram(new Railroad.Comment('a comment')),
  },
  {
    name: 'Sequence',
    create: () => new Railroad.Diagram(
      new Railroad.Sequence(
        new Railroad.Terminal('first'),
        new Railroad.Terminal('second'),
        new Railroad.Terminal('third')
      )
    ),
  },
  {
    name: 'Choice',
    create: () => new Railroad.Diagram(
      new Railroad.Choice(
        0,
        new Railroad.Terminal('option1'),
        new Railroad.Terminal('option2'),
        new Railroad.Terminal('option3')
      )
    ),
  },
  {
    name: 'Optional',
    create: () => new Railroad.Diagram(
      new Railroad.Optional(new Railroad.Terminal('optional'))
    ),
  },
  {
    name: 'OneOrMore',
    create: () => new Railroad.Diagram(
      new Railroad.OneOrMore(
        new Railroad.Terminal('item'),
        new Railroad.Terminal(',')
      )
    ),
  },
  {
    name: 'Group',
    create: () => new Railroad.Diagram(
      new Railroad.Group(
        new Railroad.Sequence(
          new Railroad.Terminal('{'),
          new Railroad.NonTerminal('body'),
          new Railroad.Terminal('}')
        ),
        'block'
      )
    ),
  },
  {
    name: 'Complex',
    create: () => new Railroad.Diagram(
      new Railroad.Sequence(
        new Railroad.Terminal('function'),
        new Railroad.NonTerminal('name'),
        new Railroad.Terminal('('),
        new Railroad.Optional(
          new Railroad.OneOrMore(
            new Railroad.NonTerminal('arg'),
            new Railroad.Terminal(',')
          )
        ),
        new Railroad.Terminal(')'),
        new Railroad.Comment('function call')
      )
    ),
  },
];

interface TestResult {
  name: string;
  withClasses: string;
  withoutClasses: string;
}

function runTest(name: string, createDiagram: () => Railroad.Diagram): TestResult {
  // Generate with CSS classes
  Railroad.Options.USE_CSS_CLASSES = true;
  const withClasses = createDiagram();
  withClasses.format();
  const withClassesSvg = withClasses.toString();

  // Generate without CSS classes
  Railroad.Options.USE_CSS_CLASSES = false;
  const withoutClasses = createDiagram();
  withoutClasses.format();
  const withoutClassesSvg = withoutClasses.toString();

  // Reset to default
  Railroad.Options.USE_CSS_CLASSES = true;

  return {
    name,
    withClasses: withClassesSvg,
    withoutClasses: withoutClassesSvg,
  };
}

function generateHTML(results: TestResult[]): string {
  const rows = results.map(result => `
    <tr>
      <td class="test-name">${result.name}</td>
      <td class="svg-cell">
        <div class="label">With CSS Classes</div>
        ${result.withClasses}
      </td>
      <td class="svg-cell">
        <div class="label">Without CSS Classes</div>
        ${result.withoutClasses}
      </td>
    </tr>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual CSS Classes Test</title>
  <style>
    body {
      font-family: -apple-system, system-ui, sans-serif;
      margin: 20px;
      background: #f5f5f5;
    }
    h1 {
      text-align: center;
      color: #333;
    }
    .description {
      text-align: center;
      max-width: 800px;
      margin: 0 auto 30px;
      color: #666;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 15px;
      border: 1px solid #ddd;
      vertical-align: top;
    }
    th {
      background: #333;
      color: white;
      text-align: left;
    }
    .test-name {
      font-weight: bold;
      width: 150px;
      background: #f9f9f9;
    }
    .svg-cell {
      text-align: center;
    }
    .label {
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    svg {
      max-width: 100%;
      height: auto;
    }
    .match-indicator {
      text-align: center;
      padding: 10px;
      margin-top: 20px;
      border-radius: 4px;
    }
    .match-indicator.identical {
      background: #d4edda;
      color: #155724;
    }
    .summary {
      background: white;
      padding: 20px;
      margin-top: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary h2 {
      margin-top: 0;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Inconsolata', monospace;
    }
  </style>
</head>
<body>
  <h1>Visual CSS Classes Test</h1>
  <div class="description">
    <p>This page compares SVG railroad diagrams generated with <code>USE_CSS_CLASSES = true</code> vs <code>USE_CSS_CLASSES = false</code>.</p>
    <p>Both versions should render <strong>identically</strong> since all styling is applied via inline SVG attributes.</p>
    <p>The only difference is the presence of <code>class</code> attributes in the SVG markup.</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Test Case</th>
        <th>With CSS Classes</th>
        <th>Without CSS Classes</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="summary">
    <h2>Expected Results</h2>
    <ul>
      <li>All diagrams in both columns should look <strong>identical</strong></li>
      <li>The left column has <code>class="terminal"</code>, <code>class="non-terminal"</code>, etc.</li>
      <li>The right column has no class attributes (better for Illustrator/Inkscape)</li>
      <li>Inline styles (stroke, fill, font) are identical in both</li>
    </ul>
    
    <h2>How to Use</h2>
    <p>For portable SVGs that work in graphic design applications:</p>
    <pre><code>import { Diagram, Terminal, Options } from "./railroad.js";

// Disable CSS classes for portable output
Options.USE_CSS_CLASSES = false;

const diagram = new Diagram(new Terminal("hello"));
diagram.format();

// Save the SVG - it has no class dependencies
const svg = diagram.toString();</code></pre>
  </div>

  <div class="match-indicator identical">
    ✓ Visual rendering should be identical in both columns
  </div>
</body>
</html>`;
}

function main(): void {
  console.log('Running visual CSS classes test...\n');

  const results: TestResult[] = [];
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    results.push(runTest(testCase.name, testCase.create));
  }

  const html = generateHTML(results);
  const outputPath = path.join(__dirname, '..', '..', 'test-output', 'visual-css-classes-test.html');
  fs.writeFileSync(outputPath, html);

  console.log(`\n✓ Generated visual test page: ${outputPath}`);
  console.log('  Open this file in a browser to verify both versions render identically.');
}

main();
