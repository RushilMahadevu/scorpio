export interface AssignmentQuestion {
  id: string;
  text: string;
  type?: string;
  points?: number;
  correctAnswer?: string;
  [field: string]: unknown;
}
interface AssignmentRecord {
  questions?: AssignmentQuestion[];
  rubric?: string;
  [field: string]: unknown;
}
interface AnswerKey { answers?: Record<string, string>; rubric?: string }
export function splitAssignmentQuestions(questions: Record<string, unknown>[]) {
  const answers: Record<string, string> = Object.create(null);
  const publicQuestions = questions.map(({ correctAnswer, ...question }) => {
    if (typeof question.id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(question.id) ||
        ['__proto__','constructor','prototype'].includes(question.id) || Object.prototype.hasOwnProperty.call(answers, question.id)) throw new Error('Question IDs must be unique and valid');
    if (typeof question.text !== 'string' || !question.text.trim() || question.text.length > 50000) throw new Error('Invalid question text');
    if (question.points !== undefined && (typeof question.points !== 'number' || !Number.isFinite(question.points) || question.points < 0)) throw new Error('Invalid question points');
    if (correctAnswer !== undefined && typeof correctAnswer !== 'string') throw new Error('Invalid answer key');
    answers[question.id] = correctAnswer ?? '';
    return question as AssignmentQuestion;
  });
  return { publicQuestions, answers };
}
export function mergeAnswerKey(assignment: AssignmentRecord, key?: AnswerKey) {
  return { ...assignment, rubric: key?.rubric || assignment.rubric || '', questions: (assignment.questions || []).map(q => ({ ...q, correctAnswer: key?.answers?.[q.id] ?? q.correctAnswer ?? ((q as Record<string, unknown>).answer as string | undefined) ?? '' })) };
}
