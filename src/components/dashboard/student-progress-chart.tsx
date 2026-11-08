"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ScoreDataPoint {
  title: string;
  score: number;
  date: string;
}

interface StudentProgressChartProps {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  scores: ScoreDataPoint[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as ScoreDataPoint;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="max-w-[200px] truncate text-xs font-medium text-foreground">
        {item.title}
      </p>
      <div className="mt-1 flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">Score:</span>
        <span className="font-semibold text-primary">{item.score}%</span>
      </div>
      {item.date && (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{item.date}</p>
      )}
    </div>
  );
}

export function StudentProgressChart({
  totalAssignments,
  completedAssignments,
  pendingAssignments,
  scores,
}: StudentProgressChartProps) {
  const completionPercentage =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;

  const hasScoreHistory = scores.length >= 2;

  // Calculate average score if scores are available
  const avgScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, item) => sum + item.score, 0) / scores.length
        )
      : null;

  return (
    <Card className="gap-0 py-0 shadow-none overflow-hidden">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-muted/40 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Progress & Performance
          </h2>
        </div>
        <Link
          href="/student/grades"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View Grades <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)] md:items-center">
          {/* Left Column: Simple Completion Progress */}
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Course Completion
                </span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {completionPercentage}%
                </span>
              </div>
              <Progress
                value={completionPercentage}
                className="mt-2 h-2.5 bg-muted"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  {completedAssignments}
                </p>
                <p className="text-[11px] text-muted-foreground">Completed</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  {pendingAssignments}
                </p>
                <p className="text-[11px] text-muted-foreground">To Do</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <p className="text-lg font-semibold tabular-nums text-foreground">
                  {avgScore !== null ? `${avgScore}%` : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </div>

          {/* Right Column: Minimalist Score Trajectory Graph */}
          <div className="min-w-0">
            {hasScoreHistory ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Recent Score Trajectory</span>
                  <span className="text-[11px]">Last {scores.length} graded</span>
                </div>
                <div className="h-[120px] w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={scores}
                      margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="scoreGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--primary)"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--primary)"
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                        opacity={0.6}
                      />
                      <XAxis
                        dataKey="title"
                        tick={false}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 50, 100]}
                        tick={{
                          fontSize: 10,
                          fill: "var(--muted-foreground)",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fill="url(#scoreGradient)"
                        activeDot={{
                          r: 4,
                          fill: "var(--primary)",
                          stroke: "var(--card)",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex h-[130px] flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/10 p-4 text-center">
                <CheckCircle2 className="size-5 text-primary/70 mb-1.5" />
                <p className="text-xs font-medium text-foreground">
                  Score trend activates with completed work
                </p>
                <p className="mt-0.5 max-w-xs text-[11px] text-muted-foreground">
                  Submit problem sets to track your grade performance curve over time.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
