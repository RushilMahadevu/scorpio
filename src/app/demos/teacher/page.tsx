import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WorkspacePreview } from "@/components/landing/workspace-preview";
import { ModeToggle } from "@/components/mode-toggle";

export const metadata: Metadata = {
  title: "Teacher Dashboard Demo",
  description: "Explore a sample Scorpio physics classroom from the teacher dashboard.",
};

export default function TeacherDemoPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border bg-background px-4 py-2 sm:px-6">
        <Link
          href="/#dashboard-preview"
          className="inline-flex min-h-9 items-center gap-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Scorpio
        </Link>
        <p className="order-last w-full text-xs text-muted-foreground sm:order-none sm:w-auto sm:text-sm">
          <span className="font-semibold text-foreground">Teacher demo</span>
          {" · "}Sample data resets when you reload.
        </p>
        <ModeToggle />
      </header>
      <WorkspacePreview />
    </main>
  );
}
