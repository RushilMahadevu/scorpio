"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface TeacherGradingProgressProps {
  completedSubmissions: number;
  pendingSubmissions: number;
  totalAssignments: number;
  totalStudents: number;
  dataReady: boolean;
}

export function TeacherGradingProgress({
  completedSubmissions,
  pendingSubmissions,
  totalAssignments,
  totalStudents,
  dataReady,
}: TeacherGradingProgressProps) {
  const totalSubmissions = completedSubmissions + pendingSubmissions;
  const gradedPercentage =
    totalSubmissions > 0
      ? Math.round((completedSubmissions / totalSubmissions) * 100)
      : totalAssignments > 0
      ? 100
      : 0;

  return (
    <Card className="gap-0 py-0 shadow-none overflow-hidden">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-muted/40 px-5 py-3.5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Grading & Review Status
        </h2>
        <Link
          href="/teacher/grades"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Open Gradebook <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:items-center">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                Grading Turnaround
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {dataReady ? `${gradedPercentage}% graded` : "—"}
              </span>
            </div>
            <Progress
              value={dataReady ? gradedPercentage : 0}
              className="h-2.5 bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              {!dataReady ? (
                "Loading review status…"
              ) : pendingSubmissions > 0 ? (
                <>
                  <span className="font-medium text-foreground">
                    {pendingSubmissions}
                  </span>{" "}
                  {pendingSubmissions === 1 ? "submission" : "submissions"}{" "}
                  waiting for grading.
                </>
              ) : (
                "All student submissions are graded."
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <p className="text-lg font-semibold tabular-nums text-foreground">
                {dataReady ? completedSubmissions : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">Graded</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <p className="text-lg font-semibold tabular-nums text-foreground">
                {dataReady ? pendingSubmissions : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground">To Grade</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
