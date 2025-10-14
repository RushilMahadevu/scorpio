#!/usr/bin/env node

import { testGeminiTextGeneration, testStructuredGeneration } from './src/tests/firebase-ai.test.ts';

async function runTests() {
  console.log("=== Firebase AI Tests ===");
  
  try {
    // Run text generation test
    console.log("\n1. Running Text Generation Test");
    const textResult = await testGeminiTextGeneration();
    
    if (textResult.success) {
      console.log("✅ Text Generation Test PASSED");
    } else {
      console.log("❌ Text Generation Test FAILED");
      console.error(textResult.error);
    }
    
    // Run structured generation test
    console.log("\n2. Running Structured Generation Test");
    const structuredResult = await testStructuredGeneration();
    
    if (structuredResult.success) {
      console.log("✅ Structured Generation Test PASSED");
    } else {
      console.log("❌ Structured Generation Test FAILED");
      console.error(structuredResult.error);
    }
    
    console.log("\n=== Test Summary ===");
    console.log(`Text Generation: ${textResult.success ? "PASSED" : "FAILED"}`);
    console.log(`Structured Generation: ${structuredResult.success ? "PASSED" : "FAILED"}`);
    
  } catch (error) {
    console.error("Error running tests:", error);
    process.exit(1);
  }
}

runTests();