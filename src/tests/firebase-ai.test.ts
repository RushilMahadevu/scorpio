/**
 * Firebase AI Test
 * 
 * This file contains tests for Firebase AI integration using the Gemini model
 */

import { model } from '../lib/firebase';

/**
 * Simple test function to generate text using Firebase AI (Gemini model)
 */
export async function testGeminiTextGeneration() {
  try {
    console.log("Starting Firebase AI Gemini test...");
    
    // Test prompt for text generation
    const prompt = "Explain what a spaced repetition system is in 2-3 sentences.";
    
    console.log(`Sending prompt to Gemini model: "${prompt}"`);
    
    // Generate content using the Gemini model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("AI Generation Successful!");
    console.log("Generated text:");
    console.log("-------------");
    console.log(text);
    console.log("-------------");
    
    return {
      success: true,
      generatedText: text
    };
  } catch (error) {
    console.error("Firebase AI test failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * More complex test for structured output generation
 */
export async function testStructuredGeneration() {
  try {
    console.log("Testing structured generation with Firebase AI...");
    
    // Sample prompt for generating a structured response
    const prompt = `
      Generate a flashcard for studying. The format should be:
      {
        "question": "The question text",
        "answer": "The answer text",
        "difficulty": "A value from 1-5"
      }
      
      The topic is: Benefits of spaced repetition for learning.
    `;
    
    console.log("Sending structured prompt to Gemini model...");
    
    // Generate structured content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("AI Structured Generation Successful!");
    console.log("Generated content:");
    console.log("-------------");
    console.log(text);
    console.log("-------------");
    
    // Try to parse as JSON if it looks like JSON
    let parsedData = null;
    try {
      if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
        parsedData = JSON.parse(text);
        console.log("Successfully parsed as JSON:", parsedData);
      }
    } catch (parseError) {
      console.log("Output is not valid JSON, returning as text");
    }
    
    return {
      success: true,
      generatedText: text,
      parsedData: parsedData
    };
  } catch (error) {
    console.error("Firebase AI structured test failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execution entry point when run directly
if (typeof window === 'undefined') {
  console.log("Running Firebase AI tests in Node environment...");
  
  // Run the text generation test
  testGeminiTextGeneration()
    .then(() => {
      console.log("\n");
      // Run the structured generation test
      return testStructuredGeneration();
    })
    .then(() => {
      console.log("\nAll Firebase AI tests completed.");
    })
    .catch(error => {
      console.error("Error running tests:", error);
      process.exit(1);
    });
}