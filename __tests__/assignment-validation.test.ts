import { validateQuestionAnswers, ValidatableQuestion } from "@/lib/assignment-validation";

describe("validateQuestionAnswers", () => {
  test("allows questions with all valid selected answers", () => {
    const questions: ValidatableQuestion[] = [
      {
        id: "q1",
        type: "multiple-choice",
        text: "What is gravity?",
        options: ["A force", "A fruit", "A color"],
        correctAnswer: "A force",
      },
      {
        id: "q2",
        type: "true-false",
        text: "F = ma",
        options: ["True", "False"],
        correctAnswer: "True",
      },
      {
        id: "q3",
        type: "short-answer",
        text: "Value of g on Earth?",
        correctAnswer: "9.8 m/s^2",
      },
      {
        id: "q4",
        type: "text",
        text: "Explain Newton's third law.",
      },
    ];

    const result = validateQuestionAnswers(questions);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("rejects multiple choice questions with no correct answer selected", () => {
    const questions: ValidatableQuestion[] = [
      {
        id: "q1",
        type: "multiple-choice",
        text: "Select the speed of light:",
        options: ["3e8 m/s", "100 m/s"],
        correctAnswer: "",
      },
    ];

    const result = validateQuestionAnswers(questions);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Question 1 (Multiple Choice)");
    expect(result.questionIndex).toBe(0);
  });

  test("rejects multiple choice questions where correctAnswer is not in options", () => {
    const questions: ValidatableQuestion[] = [
      {
        id: "q1",
        type: "multiple-choice",
        text: "Select one:",
        options: ["Option A", "Option B"],
        correctAnswer: "Option C",
      },
    ];

    const result = validateQuestionAnswers(questions);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Question 1 (Multiple Choice)");
  });

  test("rejects true-false questions without True or False selected", () => {
    const questions: ValidatableQuestion[] = [
      {
        id: "q1",
        type: "true-false",
        text: "Is energy conserved?",
        options: ["True", "False"],
        correctAnswer: "",
      },
    ];

    const result = validateQuestionAnswers(questions);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Question 1 (True/False)");
  });

  test("rejects short-answer questions with empty correctAnswer", () => {
    const questions: ValidatableQuestion[] = [
      {
        id: "q1",
        type: "short-answer",
        text: "Calculate power",
        correctAnswer: "   ",
      },
    ];

    const result = validateQuestionAnswers(questions);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Question 1 (Short Answer)");
  });

  test("allows text questions with or without grading rubric", () => {
    const questions: ValidatableQuestion[] = [
      {
        id: "q1",
        type: "text",
        text: "Free response essay",
        correctAnswer: "",
      },
    ];

    const result = validateQuestionAnswers(questions);
    expect(result.valid).toBe(true);
  });
});
