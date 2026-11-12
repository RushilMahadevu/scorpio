export interface ValidatableQuestion {
  id?: string;
  type: "text" | "multiple-choice" | "true-false" | "short-answer";
  text?: string;
  options?: string[];
  correctAnswer?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  questionIndex?: number;
}

export function validateQuestionAnswers(questions: ValidatableQuestion[]): ValidationResult {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qNum = i + 1;
    if (q.type === "multiple-choice") {
      const hasValidSelected = Boolean(
        q.correctAnswer && q.options?.some(opt => opt.trim() && opt === q.correctAnswer)
      );
      if (!hasValidSelected) {
        return {
          valid: false,
          error: `Question ${qNum} (Multiple Choice): please select which option is the correct answer.`,
          questionIndex: i,
        };
      }
    } else if (q.type === "true-false") {
      if (!q.correctAnswer || (q.correctAnswer !== "True" && q.correctAnswer !== "False")) {
        return {
          valid: false,
          error: `Question ${qNum} (True/False): please select whether True or False is the correct answer.`,
          questionIndex: i,
        };
      }
    } else if (q.type === "short-answer") {
      if (!q.correctAnswer || !q.correctAnswer.trim()) {
        return {
          valid: false,
          error: `Question ${qNum} (Short Answer): please provide an expected answer for grading.`,
          questionIndex: i,
        };
      }
    }
  }
  return { valid: true };
}
