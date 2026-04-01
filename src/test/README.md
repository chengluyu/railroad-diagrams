# Railroad Diagrams Test Suite

This directory contains comprehensive tests for the TypeScript implementation of railroad diagrams.

## Test Structure

### `generate-test-cases.ts`
Generates a large volume of test cases (300+) using permutations and combinations:
- **Sequence tests**: Various lengths and element combinations
- **Choice tests**: Different numbers of options with varying default selections
- **OptionalSequence tests**: Multiple elements in optional sequences
- **Stack tests**: Various element combinations
- **OneOrMore tests**: With different repeat elements
- **ZeroOrMore tests**: With different repeat and skip options
- **Optional tests**: With and without skip parameter
- **Group tests**: With various labels and nested content
- **AlternatingSequence tests**: Different element combinations
- **HorizontalChoice tests**: Various element counts
- **MultipleChoice tests**: Both 'any' and 'all' types
- **Nested tests**: Complex deeply-nested structures
- **Start/End tests**: Different type variants
- **Text element tests**: Various text lengths and options
- **Block tests**: Different dimension configurations
- **Diagram tests**: Full diagram constructions

### `run-tests.ts`
Main test runner that:
1. Constructs all test elements
2. Formats them (validates internal structure)
3. Generates SVG output
4. Generates text diagram output
5. Validates output structure

Options:
```bash
npm run test              # Run all tests
npm run test:verbose      # Show detailed failure information
npm run test:snapshots    # Generate snapshot files for comparison
```

### `compare-with-original.ts`
Validates TypeScript output by:
1. Creating representative test cases
2. Generating SVG output
3. Saving outputs for manual inspection
4. Running batch tests with random combinations

Options:
```bash
npm run test:compare      # Run comparison tests
npm run test:batch        # Run 300 random batch tests
```

## Running All Tests

```bash
# Build the TypeScript first
npm run build

# Run the full test suite
npm run test:all
```

This will:
1. Run ~300 element construction and formatting tests
2. Run 30+ comparison validation tests
3. Run 300 random batch tests

## Test Output

Test outputs are saved to:
- `test-output/*.svg` - Individual SVG files for visual inspection
- `test-snapshots/snapshot.json` - Serialized outputs for comparison

## Adding New Tests

To add new test cases, edit `generate-test-cases.ts` and add to the appropriate generator function:

```typescript
export function generateNewTests(): Railroad.SomeType[] {
  const tests: Railroad.SomeType[] = [];
  // Add your test cases here
  tests.push(new Railroad.SomeType(...));
  return tests;
}
```

Then update `generateAllTests()` to include the new tests.
