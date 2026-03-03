"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart3, Info } from "lucide-react";

interface GradeDistributionProps {
  submissions: {
    score: number;
  }[];
  title?: string;
  description?: string;
}

export function GradeDistributionChart({ 
  submissions, 
  title = "Grade Distribution", 
  description = "Overview of student performance ranges" 
}: GradeDistributionProps) {
  const distributionData = useMemo(() => {
    const buckets = [
      { range: "0-59", min: 0, max: 59, count: 0, color: "#ef4444" }, // red-500
      { range: "60-69", min: 60, max: 69, count: 0, color: "#f97316" }, // orange-500
      { range: "70-79", min: 70, max: 79, count: 0, color: "#eab308" }, // yellow-500
      { range: "80-89", min: 80, max: 89, count: 0, color: "#3b82f6" }, // blue-500
      { range: "90-100", min: 90, max: 100, count: 0, color: "#10b981" }, // emerald-500
    ];

    submissions.forEach((sub) => {
      const score = sub.score;
      const bucket = buckets.find((b) => score >= b.min && score <= b.max);
      if (bucket) {
        bucket.count++;
      }
    });

    return buckets;
  }, [submissions]);

  const chartConfig = {
    count: {
      label: "Students",
      color: "hsl(var(--primary))",
    },
  };

  if (submissions.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          No submission data available for this selection.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="text-[10px]">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[250px] w-full">
          <ChartContainer config={chartConfig}>
            <BarChart
              data={distributionData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis
                dataKey="range"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 10 }}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                barSize={40}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-lg">
          <Info className="h-3 w-3" />
          <span>Total Submissions: {submissions.length}</span>
        </div>
      </CardContent>
    </Card>
  );
}
