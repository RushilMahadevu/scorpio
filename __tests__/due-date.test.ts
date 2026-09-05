describe('Assignment Due Date Enforcement', () => {
  const isSubmissionLate = (dueDate: Date | string | { toDate: () => Date } | null | undefined, submissionDate: Date): boolean => {
    if (!dueDate) return false;
    const due = dueDate instanceof Date
      ? dueDate
      : typeof (dueDate as any)?.toDate === 'function'
      ? (dueDate as any).toDate()
      : new Date(dueDate as string);
    return submissionDate.getTime() > due.getTime();
  };

  it('marks submission as not late when submitted before due date', () => {
    const due = new Date('2026-05-01T12:00:00Z');
    const submission = new Date('2026-05-01T11:59:00Z');
    expect(isSubmissionLate(due, submission)).toBe(false);
  });

  it('marks submission as late when submitted after due date', () => {
    const due = new Date('2026-05-01T12:00:00Z');
    const submission = new Date('2026-05-01T12:01:00Z');
    expect(isSubmissionLate(due, submission)).toBe(true);
  });

  it('handles Firestore timestamp mock', () => {
    const dueMock = { toDate: () => new Date('2026-05-01T12:00:00Z') };
    const submission = new Date('2026-05-01T12:05:00Z');
    expect(isSubmissionLate(dueMock, submission)).toBe(true);
  });

  it('returns false if no due date is configured', () => {
    const submission = new Date('2026-05-01T12:05:00Z');
    expect(isSubmissionLate(null, submission)).toBe(false);
  });
});
