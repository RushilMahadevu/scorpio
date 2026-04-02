import { model, CONTEXT_WINDOW_SIZE } from "./ai/config";
import { scrubPII, splitIntoQuestions, repairIncompleteJson, validateAndNormalizeQuestions, classifyQuestion } from "./ai/utils";
import { ConstraintLevel, DOMAIN_CONSTRAINT, PEDAGOGICAL_CONSTRAINT, NOTATION_CONSTRAINT, SOCRATIC_CONSTRAINT, CONTACT_CONSTRAINT, STRICT_CONCISE_CONSTRAINT, CONSTRAINT_LEVELS } from "./ai/constants";
import { explainPhysicsConcept, helpSolveProblem } from "./ai/tutor";
import type { ChatMessage } from "./ai/tutor";
import { gradeResponse, synthesizeRubric, validateResponse } from "./ai/grading";
import type { ValidationResult } from "./ai/grading";
import { parseQuestionsManually, generateAssignmentQuestions, parseQuestionsFromText } from "./ai/assignment";
import { generatePracticeProblem } from "./ai/practice";
import { getNotebookAssistantResponse } from "./ai/notebook";
import { getNetworkLimitsHelp, generateStudentPortfolio } from "./ai/network";
import type { NetworkLimitsContext } from "./ai/network";
import { getNavigationResponse, getLandingChatbotResponse } from "./ai/chatbot";
import { 
  analyzeResponse, 
  runComprehensiveStudy, 
  aggregateByConstraintLevel, 
  aggregateByDifficulty, 
  exportToCSV, 
  generateComprehensiveLatexTables, 
  estimateStudyCost,
  runAblationStudy,
  COMPREHENSIVE_TEST_BATTERY
} from "./ai/research";
import type { 
  TestQuestion, 
  DetailedMetrics, 
  StudyResult, 
  AblationResult
} from "./ai/research";

/**
 * @deprecated Use specific modules in src/lib/ai/ instead.
 * This file is maintained for backward compatibility and will be removed in a future update.
 */
export {
  model,
  CONTEXT_WINDOW_SIZE,
  scrubPII,
  splitIntoQuestions,
  repairIncompleteJson,
  validateAndNormalizeQuestions,
  classifyQuestion,
  explainPhysicsConcept,
  helpSolveProblem,
  gradeResponse,
  synthesizeRubric,
  validateResponse,
  parseQuestionsManually,
  generateAssignmentQuestions,
  parseQuestionsFromText,
  generatePracticeProblem,
  getNotebookAssistantResponse,
  getNetworkLimitsHelp,
  generateStudentPortfolio,
  getNavigationResponse,
  getLandingChatbotResponse,
  runComprehensiveStudy,
  analyzeResponse,
  aggregateByConstraintLevel,
  aggregateByDifficulty,
  exportToCSV,
  generateComprehensiveLatexTables,
  estimateStudyCost,
  runAblationStudy,
  COMPREHENSIVE_TEST_BATTERY
};

export type {
  ConstraintLevel,
  ChatMessage,
  ValidationResult,
  NetworkLimitsContext,
  TestQuestion,
  DetailedMetrics,
  StudyResult,
  AblationResult
};
