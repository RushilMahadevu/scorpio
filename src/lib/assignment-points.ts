const DEFAULT_QUESTION_POINTS = 10;

export function getAssignmentPoints(questions?: readonly { points?: number }[] | null) {
  return questions?.reduce((total, question) => total + (question.points || DEFAULT_QUESTION_POINTS), 0) ?? 0;
}

export function splitAssignmentPoints(total: number, questionCount: number) {
  if (questionCount === 0) return [];

  const basePoints = Math.floor(total / questionCount);
  const remainder = total % questionCount;
  return Array.from({ length: questionCount }, (_, index) => basePoints + (index < remainder ? 1 : 0));
}
