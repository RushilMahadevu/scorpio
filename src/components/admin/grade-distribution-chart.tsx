const scoreRanges = [
  { label: "0–59%", min: 0, max: 59 },
  { label: "60–69%", min: 60, max: 69 },
  { label: "70–79%", min: 70, max: 79 },
  { label: "80–89%", min: 80, max: 89 },
  { label: "90–100%", min: 90, max: 100 },
];

interface GradeDistributionProps {
  submissions: { score: number }[];
  title?: string;
  description?: string;
}

export function GradeDistributionChart({
  submissions,
  title = "Grade distribution",
  description = "Students grouped by their average score",
}: GradeDistributionProps) {
  return (
    <section aria-label={title} className="space-y-3 bg-muted/20 px-5 py-5">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No grades match these filters.</p>
      ) : (
        <ul aria-label="Students by score range" className="grid max-w-2xl gap-3">
          {scoreRanges.map(({ label, min, max }) => {
            const count = submissions.filter(({ score }) => score >= min && score <= max).length;
            return (
              <li key={label} className="grid grid-cols-[5rem_minmax(0,1fr)_2rem] items-center gap-3 text-sm tabular-nums">
                <span className="text-muted-foreground">{label}</span>
                <span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${count / submissions.length * 100}%` }} />
                </span>
                <span className="text-right">{count}<span className="sr-only"> students</span></span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
