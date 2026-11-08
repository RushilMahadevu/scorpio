import type { ReactNode } from "react";

export function WorkspaceHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
      <div className="min-w-0 space-y-1.5">
        <h1 className="break-words text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function WorkspaceSummary({
  label,
  items,
}: {
  label: string;
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl aria-label={label} className={`grid gap-px overflow-hidden rounded-xl border border-border bg-border ${items.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0 space-y-1 bg-card px-4 py-3 sm:px-5">
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="break-words text-lg font-semibold tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
