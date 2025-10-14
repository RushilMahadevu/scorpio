# Firebase AI Tests

This directory contains tests for the Firebase AI integration using the Gemini model.

## Available Tests

1. **Basic Text Generation** - Tests generating text from a simple prompt
2. **Structured Generation** - Tests generating structured data (JSON) from a prompt

## Running the Tests

You can run the tests using the npm script:

```bash
npm run test:ai
```

Or directly with tsx:

```bash
npx tsx run-ai-tests.ts
```

## How to Add More Tests

To add more AI tests:

1. Add new test functions to `firebase-ai.test.ts`
2. Import and call them in the `run-ai-tests.js` file
3. Make sure to handle errors and return standardized results

## Test Structure

Each test function should:

1. Take any necessary parameters
2. Return a consistent result object with at least:
   - `success`: boolean indicating if the test passed
   - `error?`: error message if the test failed
   - Any other relevant output data

Example:

```typescript
export async function testNewFeature() {
  try {
    // Test implementation
    const result = await model.generateContent("your prompt");
    return {
      success: true,
      data: result.response.text()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```