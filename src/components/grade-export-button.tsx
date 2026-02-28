"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface GradeData {
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  score: number;
  totalPoints: number;
  submittedAt: string;
}

interface GradeExportButtonProps {
  data: GradeData[];
  filename?: string;
}

export function GradeExportButton({ data, filename = "scorpio-grades.csv" }: GradeExportButtonProps) {
  const exportToCsv = () => {
    if (data.length === 0) return;

    // CSV Headers
    const headers = ["Student Name", "Email", "Assignment", "Score", "Total Points", "Percentage", "Date"];
    
    // CSV Rows
    const rows = data.map(item => [
      `"${item.studentName}"`,
      `"${item.studentEmail}"`,
      `"${item.assignmentTitle}"`,
      item.score,
      item.totalPoints,
      ((item.score / item.totalPoints) * 100).toFixed(2) + "%",
      `"${item.submittedAt}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={exportToCsv} 
      disabled={data.length === 0}
      className="gap-2"
    >
      <Download className="size-4" />
      Export Grades (.CSV)
    </Button>
  );
}
