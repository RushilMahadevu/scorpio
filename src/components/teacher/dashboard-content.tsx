import type { ReactNode } from "react";
import { TeacherGradingProgress } from "@/components/dashboard/teacher-grading-progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TeacherSummary } from "./workspace";

export interface TeacherDashboardStats {
  totalAssignments: number;
  totalStudents: number;
  completedSubmissions: number;
  pendingSubmissions: number;
}

interface DashboardPanel {
  id?: string;
  action?: ReactNode;
  rows: ReactNode[];
}

interface TeacherDashboardContentProps {
  stats: TeacherDashboardStats;
  dataReady: boolean;
  showGradebookLink?: boolean;
  pending: DashboardPanel;
  assignments: DashboardPanel;
  classes: DashboardPanel;
}

function DashboardPanel({
  id,
  title,
  message,
  action,
  rows,
}: DashboardPanel & { title: string; message: string }) {
  return (
    <Card id={id} className="scroll-mt-20 min-w-0 gap-0 py-0 shadow-none overflow-hidden">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-muted/40 px-5 py-3.5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        {action}
      </CardHeader>
      <CardContent className="p-0 bg-card">
        {rows.length > 0 ? (
          <ul className="divide-y divide-border">{rows}</ul>
        ) : (
          <p className="px-5 py-6 text-sm text-muted-foreground">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function TeacherDashboardContent({
  stats,
  dataReady,
  showGradebookLink,
  pending,
  assignments,
  classes,
}: TeacherDashboardContentProps) {
  return (
    <>
      <TeacherSummary
        label="Classroom overview"
        items={[
          { label: "Assignments", value: dataReady ? stats.totalAssignments : "—" },
          { label: "Students", value: dataReady ? stats.totalStudents : "—" },
          { label: "Graded", value: dataReady ? stats.completedSubmissions : "—" },
          { label: "To grade", value: dataReady ? stats.pendingSubmissions : "—" },
        ]}
      />
      <TeacherGradingProgress
        completedSubmissions={stats.completedSubmissions}
        pendingSubmissions={stats.pendingSubmissions}
        totalAssignments={stats.totalAssignments}
        dataReady={dataReady}
        showGradebookLink={showGradebookLink}
      />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="grid min-w-0 gap-5">
          <DashboardPanel
            {...pending}
            title="To grade"
            message={dataReady ? "No submissions waiting for a grade." : "Loading submissions…"}
          />
          <DashboardPanel
            {...assignments}
            title="Recent assignments"
            message={dataReady ? "No assignments yet." : "Loading assignments…"}
          />
        </div>
        <DashboardPanel
          {...classes}
          title="My classes"
          message={dataReady ? "Create a class to get a code to share with students." : "Loading classes…"}
        />
      </div>
    </>
  );
}
