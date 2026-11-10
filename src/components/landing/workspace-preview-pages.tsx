"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TeacherPageHeader, TeacherSummary } from "@/components/teacher/workspace";
import { GradeDistributionChart } from "@/components/admin/grade-distribution-chart";
import { GradeExportButton } from "@/components/grade-export-button";
import { MathInputField } from "@/components/math-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { parseQuestionsManually } from "@/lib/assignment-parser";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
  BookOpen,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  FileUp,
  FolderOpen,
  GripVertical,
  HelpCircle,
  Loader2,
  Lock,
  MoreHorizontal,
  Plus,
  PlusCircle,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import {
  courseName,
  dueLabel,
  studentById,
  type Assignment,
  type PreviewCourse,
  type PreviewResource,
  type PreviewStudent,
  type Question,
  type Submission,
  type SubmissionAnswer,
} from "./workspace-preview-data";

export {
  NetworkPage,
  StudentsPage,
  WaypointsPage,
  VaultPage,
} from "./workspace-preview-tabs";

// ============================================================================
// GRADING TERMINAL VIEW (Shared between Dashboard, Gradebook, Assignment View)
// ============================================================================

export function GradingTerminalView({
  submission,
  assignment,
  student,
  courseLabel,
  onBack,
  onSaveGrade,
}: {
  submission: Submission;
  assignment?: Assignment;
  student?: PreviewStudent;
  courseLabel?: string;
  onBack: () => void;
  onSaveGrade: (
    submissionId: string,
    score: number,
    updatedAnswers: SubmissionAnswer[]
  ) => void;
}) {
  const [answers, setAnswers] = React.useState<SubmissionAnswer[]>(() =>
    submission.answers.map((a) => ({ ...a }))
  );
  const [isRegrading, setIsRegrading] = React.useState(false);
  const [savedNotice, setSavedNotice] = React.useState(false);
  const [workDialogOpen, setWorkDialogOpen] = React.useState(false);

  const questions = React.useMemo<Question[]>(() => {
    if (assignment?.questions?.length) return assignment.questions;
    return answers.map((a, idx) => ({
      id: a.questionId || `q-${idx + 1}`,
      text: a.questionText || `Question ${idx + 1}`,
      points: 10,
      type: "short-answer",
      correctAnswer: "",
    }));
  }, [assignment, answers]);

  const maxPointsSum = React.useMemo(() => {
    const sum = questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
    return sum > 0 ? sum : 100;
  }, [questions]);

  const earnedPoints = React.useMemo(() => {
    return answers.reduce((acc, a) => acc + (Number(a.score) || 0), 0);
  }, [answers]);

  const calculatedScore = React.useMemo(() => {
    return Math.min(100, Math.max(0, Math.round((earnedPoints / maxPointsSum) * 100)));
  }, [earnedPoints, maxPointsSum]);

  const updateAnswerField = (
    idx: number,
    field: "score" | "feedback",
    value: number | string
  ) => {
    setAnswers((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a))
    );
    setSavedNotice(false);
  };

  const handleRegradeWithAI = () => {
    setIsRegrading(true);
    setTimeout(() => {
      setAnswers((prev) =>
        prev.map((ans, idx) => {
          const q = questions[idx];
          const maxPts = q?.points ?? 10;
          const autoScore = ans.score !== undefined ? ans.score : maxPts;
          return {
            ...ans,
            score: autoScore,
            feedback:
              ans.feedback ||
              (autoScore === maxPts
                ? "Complete derivation with accurate symbolic reasoning and SI units."
                : "Solid physical intuition; verify intermediate algebraic sign conventions."),
            reasoning:
              ans.reasoning ||
              `Evaluated against ${maxPts} pt rubric criteria. Symbolic expressions and boundary conditions verified by Raise.`,
          };
        })
      );
      setIsRegrading(false);
      toast.success("Submission re-evaluated with Raise.");
    }, 550);
  };

  const handleSave = () => {
    onSaveGrade(submission.id, calculatedScore, answers);
    setSavedNotice(true);
    toast.success("Grades saved and published to student.");
  };

  const formattedSubmittedAt = React.useMemo(() => {
    const d = new Date(submission.submittedAt);
    if (isNaN(d.getTime())) return submission.submittedAt;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [submission.submittedAt]);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="cursor-pointer">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gradebook
        </Button>
        {courseLabel && (
          <Badge variant="outline" className="text-xs font-medium">
            {courseLabel}
          </Badge>
        )}
      </div>

      {/* Lockdown Integrity Banner */}
      {(submission.unfocusCount ?? 0) > 0 && (
        <div className="bg-destructive/10 border-2 border-destructive/20 rounded-xl p-4 flex items-center justify-between text-destructive">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 shrink-0" />
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Integrity Alert: Focus Lost
              </h4>
              <p className="text-xs opacity-90">
                This student left the assignment tab{" "}
                <strong>{submission.unfocusCount}</strong>{" "}
                {submission.unfocusCount === 1 ? "time" : "times"} while Lockdown
                Mode was active.
              </p>
            </div>
          </div>
          <Badge variant="destructive" className="font-mono text-sm px-3 py-1">
            {submission.unfocusCount} Focus Switch{submission.unfocusCount === 1 ? "" : "es"}
          </Badge>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Grading Terminal
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {assignment?.title || "Physics Assignment"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Submitted by{" "}
            <span className="text-foreground font-medium">
              {student?.name || "Student"}
            </span>{" "}
            on {formattedSubmittedAt}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegradeWithAI}
            disabled={isRegrading}
            className="h-10 cursor-pointer"
          >
            {isRegrading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Re-grade with Raise
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="h-10 px-6 font-bold cursor-pointer"
          >
            {savedNotice ? (
              <>
                <Check className="mr-1.5 h-4 w-4" />
                Saved
              </>
            ) : (
              "Save Grades"
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {questions.map((q, index) => {
            const ans = answers[index] || {
              questionId: q.id,
              questionText: q.text,
              answer: "",
              score: 0,
              feedback: "",
            };
            const maxPts = q.points || 10;
            const currentScore = ans.score ?? 0;

            return (
              <Card key={q.id || index} className="overflow-hidden border-muted/60">
                <CardHeader className="bg-muted/20 border-b py-3.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {index + 1}
                      </span>
                      <CardTitle className="text-sm font-semibold">
                        Question {index + 1}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-normal"
                      >
                        {q.type === "text" ? "free-response" : q.type}
                      </Badge>
                    </div>
                    <Badge
                      variant={
                        currentScore === maxPts
                          ? "default"
                          : currentScore > 0
                          ? "secondary"
                          : "destructive"
                      }
                      className="font-mono text-xs"
                    >
                      {currentScore} / {maxPts} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                        Original Question
                      </Label>
                      <div className="p-3 bg-muted/40 rounded-lg border text-sm">
                        <MarkdownRenderer>{q.text}</MarkdownRenderer>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                        Student Answer
                      </Label>
                      <div className="p-3.5 bg-background rounded-lg border-2 border-primary/10 text-sm shadow-sm">
                        {ans.answer ? (
                          <MarkdownRenderer>{ans.answer}</MarkdownRenderer>
                        ) : (
                          <span className="italic text-muted-foreground">
                            No answer provided
                          </span>
                        )}
                      </div>
                    </div>

                    {q.correctAnswer && (
                      <div className="space-y-1.5">
                        <Label className="text-emerald-600 dark:text-emerald-400 uppercase text-[10px] tracking-wider font-bold">
                          Correct Answer Reference
                        </Label>
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-sm">
                          <MarkdownRenderer>{q.correctAnswer}</MarkdownRenderer>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grading Controls */}
                  <div className="pt-4 border-t space-y-4">
                    {ans.reasoning && (
                      <div className="bg-primary/5 rounded-lg p-3.5 border border-primary/10 space-y-1">
                        <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider">
                          <HelpCircle className="h-3.5 w-3.5" />
                          AI Reasoning / Grading Logic
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          <MarkdownRenderer>{ans.reasoning}</MarkdownRenderer>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pt-1">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={`score-${index}`}
                          className="text-xs font-bold"
                        >
                          Points Earned
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`score-${index}`}
                            type="number"
                            max={maxPts}
                            min={0}
                            step="0.5"
                            className="font-mono font-bold h-9"
                            value={currentScore}
                            onChange={(e) =>
                              updateAnswerField(
                                index,
                                "score",
                                Math.min(
                                  maxPts,
                                  Math.max(0, parseFloat(e.target.value) || 0)
                                )
                              )
                            }
                          />
                          <span className="text-xs text-muted-foreground shrink-0">
                            / {maxPts}
                          </span>
                        </div>
                      </div>
                      <div className="md:col-span-3 space-y-1.5">
                        <Label
                          htmlFor={`feedback-${index}`}
                          className="text-xs font-bold"
                        >
                          Feedback to Student
                        </Label>
                        <Textarea
                          id={`feedback-${index}`}
                          placeholder="Add or edit feedback..."
                          value={ans.feedback || ""}
                          onChange={(e) =>
                            updateAnswerField(index, "feedback", e.target.value)
                          }
                          rows={2}
                          className="resize-none text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Sidebar: Overall Score & Student Work */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Overall Score</CardTitle>
              <CardDescription className="text-xs">
                Calculated from individual question scores.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center">
                <svg className="h-32 w-32">
                  <circle
                    className="text-muted stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary stroke-current transition-all duration-500 ease-in-out"
                    strokeWidth="8"
                    strokeDasharray={351.8}
                    strokeDashoffset={351.8 - (351.8 * calculatedScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <span className="absolute text-3xl font-bold font-mono">
                  {calculatedScore}%
                </span>
              </div>
              <p className="mt-4 text-xs text-muted-foreground text-center">
                {earnedPoints} of {maxPointsSum} points earned across{" "}
                {questions.length} questions.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full cursor-pointer" onClick={handleSave}>
                {savedNotice ? "Grades Updated" : "Update Final Grade"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Student Work</CardTitle>
              </div>
              <CardDescription className="text-xs">
                PDFs or derivations uploaded for this assignment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {submission.workFiles && submission.workFiles.length > 0 ? (
                submission.workFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          PDF attachment
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 cursor-pointer"
                      onClick={() => setWorkDialogOpen(true)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                  No handwritten work files attached.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Handwritten work preview dialog */}
      <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {submission.workFiles?.[0]?.name || "Student Derivation"}
            </DialogTitle>
            <DialogDescription>
              Uploaded by {student?.name || "Student"} · {formattedSubmittedAt}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/20 p-5 space-y-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Scanned Free-Body Diagram & Symbolic Work
            </p>
            <div className="rounded-md bg-background border p-4 space-y-3">
              <MarkdownRenderer>
                {`$$\\sum F_x = F_{\\text{push}} - f_k = ma_x$$\n$$a_x = \\frac{12\\text{ N} - 4.0\\text{ N}}{2.0\\text{ kg}} = 4.0\\text{ m/s}^2$$\n$$a_{\\text{Atwood}} = \\frac{m_2 - m_1}{m_1 + m_2}g = 2.45\\text{ m/s}^2$$`}
              </MarkdownRenderer>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWorkDialogOpen(false)}
            >
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// GRADEBOOK PAGE (Matches src/app/teacher/grades/page.tsx)
// ============================================================================

export function GradebookPage({
  courses,
  students,
  assignments,
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
  onSaveGrade,
}: {
  courses: PreviewCourse[];
  students: PreviewStudent[];
  assignments: Assignment[];
  submissions: Submission[];
  selectedSubmissionId: string | null;
  onSelectSubmission: (id: string | null) => void;
  onSaveGrade: (
    submissionId: string,
    score: number,
    updatedAnswers: SubmissionAnswer[]
  ) => void;
}) {
  const [selectedCourse, setSelectedCourse] = React.useState<string>("all");
  const [selectedAssignment, setSelectedAssignment] =
    React.useState<string>("all");
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const [selectedStudentId, setSelectedStudentId] = React.useState<
    string | null
  >(null);

  const assignmentById = React.useMemo(
    () => new Map(assignments.map((a) => [a.id, a])),
    [assignments]
  );

  const filteredAssignments = React.useMemo(() => {
    if (selectedCourse === "all") return assignments;
    return assignments.filter((a) => a.courseId === selectedCourse);
  }, [assignments, selectedCourse]);

  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter((s) => {
      const assign = assignmentById.get(s.assignmentId);
      const courseMatch =
        selectedCourse === "all" || assign?.courseId === selectedCourse;
      const assignmentMatch =
        selectedAssignment === "all" || s.assignmentId === selectedAssignment;
      return courseMatch && assignmentMatch;
    });
  }, [submissions, assignmentById, selectedCourse, selectedAssignment]);

  const studentGrades = React.useMemo(() => {
    const filteredStudents =
      selectedCourse === "all"
        ? students
        : students.filter((st) => st.courseId === selectedCourse);

    return filteredStudents.map((st) => {
      const subs = filteredSubmissions.filter((s) => s.studentId === st.id);
      const gradedScores = subs
        .filter((s) => s.graded && typeof s.score === "number")
        .map((s) => s.score as number);
      const averageGrade =
        gradedScores.length > 0
          ? gradedScores.reduce((a, b) => a + b, 0) / gradedScores.length
          : 0;
      return {
        id: st.id,
        name: st.name,
        email: st.email,
        completedCount: subs.length,
        gradedScores,
        averageGrade,
      };
    });
  }, [students, selectedCourse, filteredSubmissions]);

  const allScores = React.useMemo(() => {
    return filteredSubmissions
      .filter((s) => s.graded && typeof s.score === "number")
      .map((s) => ({ score: s.score as number }));
  }, [filteredSubmissions]);

  const exportData = React.useMemo(() => {
    return filteredSubmissions
      .filter((s) => s.graded && typeof s.score === "number")
      .map((sub) => {
        const st = studentById(students, sub.studentId);
        const assign = assignmentById.get(sub.assignmentId);
        return {
          studentName: st?.name || "Student",
          studentEmail: st?.email || "",
          assignmentTitle: assign?.title || "Physics Assignment",
          score: sub.score as number,
          totalPoints: 100,
          submittedAt: dueLabel(sub.submittedAt),
        };
      });
  }, [filteredSubmissions, students, assignmentById]);

  const activeSubmission = React.useMemo(
    () => submissions.find((s) => s.id === selectedSubmissionId) || null,
    [submissions, selectedSubmissionId]
  );

  // If a specific submission is open in the Grading Terminal
  if (activeSubmission) {
    const assignment = assignmentById.get(activeSubmission.assignmentId);
    const student = studentById(students, activeSubmission.studentId);
    return (
      <GradingTerminalView
        submission={activeSubmission}
        assignment={assignment}
        student={student}
        courseLabel={courseName(courses, assignment?.courseId)}
        onBack={() => onSelectSubmission(null)}
        onSaveGrade={onSaveGrade}
      />
    );
  }

  // If a specific student's grade breakdown is open
  if (selectedStudentId) {
    const student = studentById(students, selectedStudentId);
    const studentSubs = submissions.filter(
      (s) => s.studentId === selectedStudentId
    );
    const graded = studentSubs.filter(
      (s) => s.graded && typeof s.score === "number"
    );
    const avg =
      graded.length > 0
        ? graded.reduce((acc, s) => acc + (s.score || 0), 0) / graded.length
        : 0;

    return (
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedStudentId(null)}
            className="mb-3 -ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gradebook
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {(student?.name || "S").charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {student?.name || "Student"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {student?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-muted/30 p-3.5 rounded-xl border">
              <div className="text-center px-3 border-r">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Average Score
                </p>
                <p className="text-xl font-bold text-primary font-mono">
                  {graded.length > 0 ? `${avg.toFixed(1)}%` : "Pending"}
                </p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Completed
                </p>
                <p className="text-xl font-bold font-mono">
                  {studentSubs.length} / {assignments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assignment Breakdown</CardTitle>
            <CardDescription className="text-xs">
              Detailed performance across submitted assignments. Click any row
              to open the Grading Terminal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentSubs.map((sub) => {
                  const assign = assignmentById.get(sub.assignmentId);
                  return (
                    <TableRow
                      key={sub.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelectSubmission(sub.id)}
                    >
                      <TableCell className="font-medium">
                        {assign?.title || "Physics Assignment"}
                      </TableCell>
                      <TableCell>
                        {sub.graded ? (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Graded
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" /> Needs Grading
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {dueLabel(sub.submittedAt)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {sub.graded && sub.score !== undefined
                          ? `${sub.score}%`
                          : "Pending"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs cursor-pointer"
                        >
                          {sub.graded ? "Review" : "Grade"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Gradebook"
        description="Filter by class or assignment, inspect submission scores, or export grades to CSV."
      >
        <GradeExportButton
          data={exportData}
          filename={`grades_${selectedCourse}_${selectedAssignment}.csv`}
        />
      </TeacherPageHeader>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between border-b border-border pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Class
            </label>
            <Select
              value={selectedCourse}
              onValueChange={(value) => {
                setSelectedCourse(value);
                setSelectedAssignment("all");
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Assignment
            </label>
            <Select
              value={selectedAssignment}
              onValueChange={setSelectedAssignment}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All assignments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignments</SelectItem>
                {filteredAssignments.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 shrink-0 cursor-pointer"
          onClick={() => setShowAnalytics((v) => !v)}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Grade distribution
          {showAnalytics ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {showAnalytics && (
        <div className="rounded-lg border border-border overflow-hidden">
          <GradeDistributionChart submissions={allScores} />
        </div>
      )}

      {/* Student Grades Summary Table */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="text-sm font-medium text-foreground">
            Student grades
          </h2>
          <p className="text-xs text-muted-foreground">
            Click a student to view their assignment history, or click a
            submission below to open the Grading Terminal.
          </p>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead className="text-right">Average</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentGrades.map((student) => (
                <TableRow
                  key={student.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedStudentId(student.id)}
                >
                  <TableCell className="font-medium text-primary">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {student.email}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {student.completedCount} / {filteredAssignments.length}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {student.gradedScores.length > 0
                      ? `${student.averageGrade.toFixed(1)}%`
                      : "Pending"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Submissions Queue / Direct Grading Access */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="text-sm font-medium text-foreground">
            Submissions ({filteredSubmissions.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Click any submission to inspect question-by-question responses and
            AI grading logic.
          </p>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Student</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((sub) => {
                const st = studentById(students, sub.studentId);
                const assign = assignmentById.get(sub.assignmentId);
                return (
                  <TableRow
                    key={sub.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onSelectSubmission(sub.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{st?.name || "Student"}</span>
                        {(sub.unfocusCount ?? 0) > 0 && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] h-4 px-1.5"
                          >
                            {sub.unfocusCount} focus alert
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {assign?.title || "Physics Assignment"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {dueLabel(sub.submittedAt)}
                    </TableCell>
                    <TableCell>
                      {sub.graded ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        >
                          Graded
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Needs grading
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {sub.graded && sub.score !== undefined
                        ? `${sub.score}%`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={sub.graded ? "ghost" : "outline"}
                        size="sm"
                        className="h-7 text-xs cursor-pointer"
                      >
                        {sub.graded ? "Review" : "Grade"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ASSIGNMENT DETAILS VIEW & ASSIGNMENTS PAGE
// ============================================================================

export function AssignmentDetailsView({
  assignment,
  courses,
  students,
  submissions,
  onBack,
  onOpenSubmission,
}: {
  assignment: Assignment;
  courses: PreviewCourse[];
  students: PreviewStudent[];
  submissions: Submission[];
  onBack: () => void;
  onOpenSubmission: (submissionId: string) => void;
}) {
  const assignmentSubmissions = React.useMemo(
    () => submissions.filter((s) => s.assignmentId === assignment.id),
    [submissions, assignment.id]
  );

  const gradedScores = assignmentSubmissions
    .filter((s) => s.graded && typeof s.score === "number")
    .map((s) => s.score as number);

  const averageScore =
    gradedScores.length > 0
      ? `${(
          gradedScores.reduce((a, b) => a + b, 0) / gradedScores.length
        ).toFixed(1)}%`
      : "—";

  const isPastDue = new Date(assignment.due) < new Date("2026-11-09");

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-3 -ml-2 h-8 text-muted-foreground cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          My Assignments
        </Button>
        <TeacherPageHeader
          title={assignment.title}
          description={`${courseName(courses, assignment.courseId)} · Due ${dueLabel(assignment.due)}`}
        >
          <div className="flex items-center gap-2">
            {assignment.lockdownMode && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Lock className="h-3 w-3" /> Lockdown Enabled
              </Badge>
            )}
            <Badge variant={isPastDue ? "secondary" : "default"}>
              {isPastDue ? "Past due" : "Active"}
            </Badge>
          </div>
        </TeacherPageHeader>
      </div>

      <TeacherSummary
        label="Assignment overview"
        items={[
          { label: "Submissions", value: assignmentSubmissions.length },
          { label: "Class average", value: averageScore },
          {
            label: "Status",
            value: isPastDue ? "Past due" : "Active",
          },
        ]}
      />

      {/* Questions Preview */}
      <div>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Questions ({assignment.questions.length})
        </h2>
        <div className="space-y-3">
          {assignment.questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">
                    Q{idx + 1}
                  </span>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {q.type === "text" ? "free-response" : q.type}
                  </Badge>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {q.points} pts
                </span>
              </div>
              <div className="text-sm">
                <MarkdownRenderer>{q.text}</MarkdownRenderer>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Submissions Table */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-medium text-foreground">
            Student submissions
          </h2>
          <p className="text-xs text-muted-foreground">
            Review individual responses and scores in the Grading Terminal.
          </p>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignmentSubmissions.length > 0 ? (
                assignmentSubmissions.map((sub) => {
                  const st = studentById(students, sub.studentId);
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium text-sm">
                        {st?.name || "Student"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {dueLabel(sub.submittedAt)}
                      </TableCell>
                      <TableCell>
                        {sub.graded && sub.score !== undefined ? (
                          <Badge
                            variant={sub.score > 70 ? "default" : "destructive"}
                            className="font-mono text-xs font-normal"
                          >
                            {sub.score}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs font-normal">
                            Needs grading
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs cursor-pointer"
                          onClick={() => onOpenSubmission(sub.id)}
                        >
                          {sub.graded ? "Review" : "Grade"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-20 text-center text-sm text-muted-foreground"
                  >
                    No submissions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export function AssignmentsPage({
  courses,
  students,
  assignments,
  submissions,
  selectedAssignmentId,
  onSelectAssignment,
  onOpenCreate,
  onDuplicateAssignment,
  onUpdateVisibility,
  onDeleteAssignment,
  onOpenSubmission,
}: {
  courses: PreviewCourse[];
  students: PreviewStudent[];
  assignments: Assignment[];
  submissions: Submission[];
  selectedAssignmentId: string | null;
  onSelectAssignment: (id: string | null) => void;
  onOpenCreate: () => void;
  onDuplicateAssignment: (assignment: Assignment) => void;
  onUpdateVisibility: (
    assignmentId: string,
    visibility: Assignment["visibility"]
  ) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onOpenSubmission: (submissionId: string) => void;
}) {
  const [selectedCourse, setSelectedCourse] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortOrder, setSortOrder] = React.useState<string>("dueDate-desc");
  const [assignmentToDelete, setAssignmentToDelete] =
    React.useState<Assignment | null>(null);

  const filteredAndSorted = React.useMemo(() => {
    return assignments
      .filter((a) => {
        const isPastDue = new Date(a.due) < new Date("2026-11-09");
        const courseMatch =
          selectedCourse === "all" || a.courseId === selectedCourse;
        const statusMatch =
          statusFilter === "all" ||
          (statusFilter === "active" && !isPastDue) ||
          (statusFilter === "past-due" && isPastDue);
        return courseMatch && statusMatch;
      })
      .sort((a, b) => {
        switch (sortOrder) {
          case "title-asc":
            return a.title.localeCompare(b.title);
          case "title-desc":
            return b.title.localeCompare(a.title);
          case "dueDate-asc":
            return a.due.localeCompare(b.due);
          case "dueDate-desc":
          default:
            return b.due.localeCompare(a.due);
        }
      });
  }, [assignments, selectedCourse, statusFilter, sortOrder]);

  const activeAssignment = React.useMemo(
    () => assignments.find((a) => a.id === selectedAssignmentId) || null,
    [assignments, selectedAssignmentId]
  );

  if (activeAssignment) {
    return (
      <AssignmentDetailsView
        assignment={activeAssignment}
        courses={courses}
        students={students}
        submissions={submissions}
        onBack={() => onSelectAssignment(null)}
        onOpenSubmission={onOpenSubmission}
      />
    );
  }

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="My Assignments"
        description="Filter by class or status, adjust visibility, duplicate templates, or inspect submissions."
      >
        <Button
          size="sm"
          className="h-9 cursor-pointer"
          onClick={onOpenCreate}
        >
          <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
          Create assignment
        </Button>
      </TeacherPageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Class
          </label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="past-due">Past due</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Sort
          </label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="h-9">
              <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate-desc">Due date (newest)</SelectItem>
              <SelectItem value="dueDate-asc">Due date (oldest)</SelectItem>
              <SelectItem value="title-asc">Title (A–Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z–A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Class</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="hidden sm:table-cell">Visibility</TableHead>
              <TableHead className="w-[72px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.map((assignment) => {
              const isPastDue = new Date(assignment.due) < new Date("2026-11-09");
              return (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">
                    <button
                      type="button"
                      onClick={() => onSelectAssignment(assignment.id)}
                      className="hover:underline text-left text-foreground cursor-pointer font-medium"
                    >
                      {assignment.title}
                    </button>
                    <p className="text-xs text-muted-foreground md:hidden mt-0.5">
                      {courseName(courses, assignment.courseId)}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {courseName(courses, assignment.courseId)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">{dueLabel(assignment.due)}</span>
                      <Badge
                        variant={isPastDue ? "secondary" : "outline"}
                        className="w-fit text-[10px] font-normal px-1.5 py-0"
                      >
                        {isPastDue ? "Past due" : "Active"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Select
                      value={assignment.visibility}
                      onValueChange={(val) => {
                        onUpdateVisibility(
                          assignment.id,
                          val as Assignment["visibility"]
                        );
                        toast.success("Assignment visibility updated.");
                      }}
                    >
                      <SelectTrigger className="w-[118px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="network">Department</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onSelectAssignment(assignment.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View submissions
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDuplicateAssignment(assignment)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setAssignmentToDelete(assignment)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!assignmentToDelete}
        onOpenChange={(open) => !open && setAssignmentToDelete(null)}
        title="Delete assignment?"
        description={`This permanently removes "${assignmentToDelete?.title}" and its associated submissions.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={() => {
          if (assignmentToDelete) {
            onDeleteAssignment(assignmentToDelete.id);
            setAssignmentToDelete(null);
            toast.success("Assignment deleted.");
          }
        }}
      />
    </div>
  );
}

// ============================================================================
// CREATE ASSIGNMENT PAGE (Matches src/app/teacher/create/page.tsx & teacher-editor.png)
// ============================================================================

export function CreateAssignmentPage({
  courses,
  initialDraft,
  onClearDraft,
  onCreateAssignment,
  onCancel,
}: {
  courses: PreviewCourse[];
  initialDraft?: {
    title: string;
    description: string;
    courseId?: string;
    questions: Question[];
    gradingRubric?: string;
  } | null;
  onClearDraft?: () => void;
  onCreateAssignment: (payload: {
    title: string;
    courseId: string;
    due: string;
    description: string;
    questions: Question[];
    lockdownMode: boolean;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = React.useState(
    initialDraft?.title || "Rotational Dynamics & Angular Momentum Problem Set"
  );
  const [selectedCourse, setSelectedCourse] = React.useState(
    initialDraft?.courseId || courses[0]?.id || "mechanics"
  );
  const [dueDate, setDueDate] = React.useState("2026-11-24");
  const [description, setDescription] = React.useState(
    initialDraft?.description ||
      "Derive angular acceleration, rotational kinetic energy, and conservation of angular momentum for rigid-body systems. Show full symbolic steps before substituting numerical values."
  );
  const [questions, setQuestions] = React.useState<Question[]>(
    initialDraft?.questions?.length
      ? initialDraft.questions
      : [
          {
            id: "q-create-1",
            text: "A uniform solid disk of mass $M = 3.0\\text{ kg}$ and radius $R = 0.40\\text{ m}$ is free to rotate about a frictionless axle. A tangential force $F = 12\\text{ N}$ is applied at the rim. Derive and calculate the angular acceleration $\\alpha$ using $\\tau_{\\text{net}} = I\\alpha$ where $I = \\frac{1}{2}MR^2$.",
            points: 50,
            type: "text",
            correctAnswer:
              "$I = \\frac{1}{2}(3.0)(0.40)^2 = 0.24\\text{ kg}\\cdot\\text{m}^2$, $\\tau = FR = 4.8\\text{ N}\\cdot\\text{m}$, $\\alpha = \\frac{\\tau}{I} = 20\\text{ rad/s}^2$.",
          },
          {
            id: "q-create-2",
            text: "When a spinning figure skater pulls their arms inward without external torque, which of the following statements is true regarding angular momentum $L$ and rotational kinetic energy $K_{\\text{rot}}$?",
            points: 50,
            type: "multiple-choice",
            options: [
              "$L$ remains constant while $K_{\\text{rot}}$ increases due to internal work",
              "Both $L$ and $K_{\\text{rot}}$ remain constant",
              "$L$ increases while $K_{\\text{rot}}$ remains constant",
              "Both $L$ and $K_{\\text{rot}}$ decrease as $I$ decreases",
            ],
            correctAnswer:
              "$L$ remains constant while $K_{\\text{rot}}$ increases due to internal work",
          },
        ]
  );

  // Sync when initialDraft changes (from Waypoint fork or Assignment duplicate)
  React.useEffect(() => {
    if (initialDraft) {
      setTitle(initialDraft.title);
      setDescription(initialDraft.description);
      if (initialDraft.courseId) setSelectedCourse(initialDraft.courseId);
      const totalPts = initialDraft.questions.reduce(
        (acc, q) => acc + (Number(q.points) || 0),
        0
      );
      if (Math.abs(totalPts - 100) > 0.01 && initialDraft.questions.length > 0) {
        const base =
          Math.floor((100 / initialDraft.questions.length) * 10) / 10;
        const rem = Number(
          (100 - base * (initialDraft.questions.length - 1)).toFixed(1)
        );
        setQuestions(
          initialDraft.questions.map((q, idx) => ({
            ...q,
            points: idx === initialDraft.questions.length - 1 ? rem : base,
          }))
        );
      } else {
        setQuestions(initialDraft.questions);
      }
      if (initialDraft.gradingRubric) {
        setGradingRubric(initialDraft.gradingRubric);
      }
      onClearDraft?.();
    }
  }, [initialDraft, onClearDraft]);

  // Advanced settings
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [aiDifficulty, setAiDifficulty] = React.useState("standard");
  const [scaffoldingLevel, setScaffoldingLevel] = React.useState("medium");
  const [lockdownMode, setLockdownMode] = React.useState(false);
  const [stealthAssessment, setStealthAssessment] = React.useState(false);
  const [gradingRubric, setGradingRubric] = React.useState(
    initialDraft?.gradingRubric ||
      "Award 60% for symbolic derivation from rotational Newton's second law, 25% for algebraic substitution, and 15% for units and sign conventions."
  );
  const [isSynthesizingRubric, setIsSynthesizingRubric] = React.useState(false);

  // AI Question Generator Dialog
  const [aiGenOpen, setAiGenOpen] = React.useState(false);
  const [aiTopic, setAiTopic] = React.useState(
    "Conservation of angular momentum in inelastic rotational collisions"
  );
  const [aiDifficultySelect, setAiDifficultySelect] = React.useState("Hard");
  const [aiCount, setAiCount] = React.useState(2);
  const [isGeneratingQuestions, setIsGeneratingQuestions] =
    React.useState(false);

  // Import Text Dialog
  const [importOpen, setImportOpen] = React.useState(false);
  const [rawImportText, setRawImportText] = React.useState(
    "1. A 2.0 kg block slides down a frictionless incline of height 4.5 m. Find its speed at the bottom. (25 points)\n\n2. True or False: Mechanical energy is conserved when non-conservative forces do zero net work. (25 points)"
  );

  // Student Preview Dialog
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const totalPts = questions.reduce(
    (acc, q) => acc + (Number(q.points) || 0),
    0
  );
  const isPointsValid = Math.abs(totalPts - 100) < 0.01;

  const distributePointsEvenly = () => {
    if (questions.length === 0) return;
    const base = Math.floor((100 / questions.length) * 10) / 10;
    const remainder = Number((100 - base * (questions.length - 1)).toFixed(1));
    setQuestions((prev) =>
      prev.map((q, i) => ({
        ...q,
        points: i === prev.length - 1 ? remainder : base,
      }))
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-create-${Date.now()}`,
        text: "",
        points: 0,
        type: "short-answer",
        correctAnswer: "",
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (
    id: string,
    field: keyof Question,
    value: unknown
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const updated: Question = { ...q, [field]: value } as Question;
        if (field === "type") {
          if (value === "multiple-choice" && !q.options) {
            updated.options = ["Option A", "Option B", "Option C", "Option D"];
          } else if (value === "true-false") {
            updated.options = ["True", "False"];
            updated.correctAnswer = "True";
          }
        }
        return updated;
      })
    );
  };

  const handleGenerateQuestionsWithAI = () => {
    if (!aiTopic.trim()) return;
    setIsGeneratingQuestions(true);
    setTimeout(() => {
      const generated: Question[] = [
        {
          id: `q-ai-${Date.now()}-1`,
          text: `A horizontal turntable of moment of inertia $I_1 = 0.60\\text{ kg}\\cdot\\text{m}^2$ rotates at $\\omega_0 = 8.0\\text{ rad/s}$. A stationary ring of moment of inertia $I_2 = 0.20\\text{ kg}\\cdot\\text{m}^2$ is dropped coaxially onto the turntable. Find the final angular velocity $\\omega_f$ and the fractional kinetic energy lost $\\frac{\\Delta K}{K_0}$ (${aiDifficultySelect}).`,
          points: 25,
          type: "text",
          correctAnswer:
            "$\\omega_f = \\frac{I_1}{I_1 + I_2}\\omega_0 = 6.0\\text{ rad/s}$, $\\frac{\\Delta K}{K_0} = -\\frac{I_2}{I_1 + I_2} = -25\\%$.",
        },
        ...(aiCount > 1
          ? [
              {
                id: `q-ai-${Date.now()}-2`,
                text: `Explain why angular momentum is conserved during the coaxial drop in terms of internal frictional torques between the ring and turntable.`,
                points: 25,
                type: "short-answer" as const,
                correctAnswer:
                  "Internal kinetic friction torques form an action-reaction pair ($\\vec{\\tau}_{12} = -\\vec{\\tau}_{21}$), so $\\sum \\vec{\\tau}_{\\text{ext}} = 0$.",
              },
            ]
          : []),
      ];
      setQuestions((prev) => [...prev, ...generated]);
      setIsGeneratingQuestions(false);
      setAiGenOpen(false);
      toast.success("AI questions appended to assignment.");
    }, 550);
  };

  const handleParseImport = () => {
    const parsed = parseQuestionsManually(rawImportText);
    if (parsed.length > 0) {
      const mapped: Question[] = parsed.map((p, idx) => ({
        id: `q-import-${Date.now()}-${idx}`,
        text: p.text,
        points: p.points || 25,
        type: p.type === "free-response" ? "text" : p.type,
        options:
          p.type === "multiple-choice"
            ? p.options
            : p.type === "true-false"
            ? ["True", "False"]
            : undefined,
        correctAnswer: p.correctAnswer || "",
      }));
      setQuestions((prev) => [...prev, ...mapped]);
      toast.success(`Imported ${mapped.length} questions.`);
    }
    setImportOpen(false);
  };

  const handleSynthesizeRubric = () => {
    setIsSynthesizingRubric(true);
    setTimeout(() => {
      setGradingRubric(
        `1. Symbolic Formulation (45 pts): Explicitly state rotational Newton's second law ($\\sum \\tau = I\\alpha$) or angular momentum conservation ($L_i = L_f$) before numerical substitution.\n2. Algebraic Execution (35 pts): Accurate moment of inertia substitution and sign consistency.\n3. Physical Interpretation & Units (20 pts): Proper SI units ($\\text{rad/s}^2$, $\\text{N}\\cdot\\text{m}$, $\\text{J}$) and physical explanation of energy dissipation.`
      );
      setIsSynthesizingRubric(false);
      toast.success("Grading rubric synthesized with Raise.");
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !isPointsValid) return;
    onCreateAssignment({
      title: title.trim(),
      courseId: selectedCourse,
      due: dueDate,
      description,
      questions,
      lockdownMode,
    });
    toast.success("Assignment published to class.");
  };

  return (
    <div className="space-y-6 pb-8">
      <TeacherPageHeader
        title="Create Assignment"
        description="Set up details, build questions with LaTeX, or generate with Raise."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Assignment Details Card */}
        <Card className="shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">
              Assignment details
            </CardTitle>
            <CardDescription>
              Title, class, due date, and student instructions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-title">Title</Label>
                <Input
                  id="create-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Lab 1: Kinematics"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="create-course">Class</Label>
                  <Select
                    value={selectedCourse}
                    onValueChange={setSelectedCourse}
                  >
                    <SelectTrigger id="create-course">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="create-due">Due Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="create-due"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-desc">Description & Instructions</Label>
              <Textarea
                id="create-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Provide instructions for your students..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Card */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle className="text-base font-medium">Questions</CardTitle>
              <CardDescription>
                Add questions manually, import text, or generate with AI. Total
                points must equal 100.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Generate with AI Dialog */}
              <Dialog open={aiGenOpen} onOpenChange={setAiGenOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 cursor-pointer"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Generate with AI
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Question Generator
                    </DialogTitle>
                    <DialogDescription>
                      Describe the physics topic and Raise will generate
                      rigorous LaTeX-formatted questions and answer keys.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-3">
                    <div className="space-y-1.5">
                      <Label>Topic or Learning Objective</Label>
                      <Textarea
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Difficulty</Label>
                        <Select
                          value={aiDifficultySelect}
                          onValueChange={setAiDifficultySelect}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard (AP/Honors)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Question Count</Label>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={aiCount}
                          onChange={(e) =>
                            setAiCount(parseInt(e.target.value) || 1)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={handleGenerateQuestionsWithAI}
                      disabled={isGeneratingQuestions}
                      className="w-full cursor-pointer"
                    >
                      {isGeneratingQuestions ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Synthesizing Physics Problems...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Questions
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Import Text Dialog */}
              <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 cursor-pointer"
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Import text
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Smart Assignment Import</DialogTitle>
                    <DialogDescription>
                      Paste questions from an existing worksheet or exam to
                      parse them into structured items automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <Label>Worksheet Text</Label>
                    <Textarea
                      rows={6}
                      value={rawImportText}
                      onChange={(e) => setRawImportText(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={handleParseImport}
                      className="w-full cursor-pointer"
                    >
                      Parse & Append Questions
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Points Allocation Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-full",
                    isPointsValid
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}
                >
                  {isPointsValid ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Points Allocation:
                    </span>
                    <span
                      className={cn(
                        "text-base font-black font-mono",
                        isPointsValid
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {totalPts.toFixed(1)} / 100
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isPointsValid
                      ? "Point distribution is balanced at 100 points."
                      : `Adjust question points by ${Math.abs(
                          100 - totalPts
                        ).toFixed(1)} to reach 100.`}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={distributePointsEvenly}
                className="h-8 text-xs font-semibold cursor-pointer"
              >
                Distribute Evenly
              </Button>
            </div>

            {/* Question Editor Cards */}
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="p-4 border border-border rounded-lg relative space-y-4 bg-card"
              >
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground font-bold text-xs">
                      {index + 1}
                    </div>
                    <h4 className="font-bold text-xs uppercase tracking-wider">
                      Question {index + 1}
                    </h4>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive h-7 w-7 cursor-pointer"
                    onClick={() => removeQuestion(q.id)}
                    disabled={questions.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">
                      Question Text (Supports LaTeX)
                    </Label>
                    <MathInputField
                      value={q.text}
                      onChange={(val) => updateQuestion(q.id, "text", val)}
                      placeholder="Enter your question here... Use the math toolbar for symbols."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">
                        Question Type
                      </Label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(
                          [
                            { id: "short-answer", label: "Short Answer" },
                            { id: "multiple-choice", label: "Multiple Choice" },
                            { id: "true-false", label: "True / False" },
                            { id: "text", label: "Free Response" },
                          ] as const
                        ).map((type) => (
                          <Button
                            key={type.id}
                            type="button"
                            variant={q.type === type.id ? "default" : "outline"}
                            className="h-8 text-[11px] font-medium justify-start px-2.5 cursor-pointer"
                            onClick={() =>
                              updateQuestion(q.id, "type", type.id)
                            }
                          >
                            {type.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">
                        Points Weight
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.5"
                          value={q.points}
                          onChange={(e) =>
                            updateQuestion(
                              q.id,
                              "points",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="pr-10 font-mono font-bold h-9"
                        />
                        <span className="absolute right-3 top-2 text-xs text-muted-foreground font-bold">
                          PTS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multiple choice options */}
                {q.type === "multiple-choice" && q.options && (
                  <div className="space-y-2 pt-3 border-t border-dashed">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">
                      Answer Choices (Click check to mark correct)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant={
                              q.correctAnswer === opt ? "default" : "outline"
                            }
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-lg cursor-pointer"
                            onClick={() =>
                              updateQuestion(q.id, "correctAnswer", opt)
                            }
                          >
                            <CheckCircle2
                              className={cn(
                                "h-4 w-4",
                                q.correctAnswer === opt
                                  ? "scale-100"
                                  : "scale-75 opacity-30"
                              )}
                            />
                          </Button>
                          <Input
                            value={opt}
                            onChange={(e) => {
                              const nextOpts = [...(q.options || [])];
                              nextOpts[oIdx] = e.target.value;
                              updateQuestion(q.id, "options", nextOpts);
                            }}
                            className="h-8 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Short Answer / Free Response Key */}
                {(q.type === "short-answer" || q.type === "text") && (
                  <div className="space-y-1.5 pt-3 border-t border-dashed">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">
                      {q.type === "short-answer"
                        ? "Expected Answer / Key"
                        : "Sample Solution / Grading Guide"}
                    </Label>
                    <MathInputField
                      value={q.correctAnswer || ""}
                      onChange={(val) =>
                        updateQuestion(q.id, "correctAnswer", val)
                      }
                      placeholder="Provide the reference solution or grading criteria for Raise..."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              className="w-full cursor-pointer"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </CardContent>
        </Card>

        {/* Advanced Settings Card */}
        <Card className="border-border shadow-none">
          <CardHeader
            className="cursor-pointer select-none flex flex-row items-center justify-between py-4"
            onClick={() => setAdvancedOpen((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base">Advanced Settings</CardTitle>
                <CardDescription className="text-xs">
                  Customize AI behavior, lockdown browser controls, and custom
                  grading rubrics.
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" type="button">
              {advancedOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>

          {advancedOpen && (
            <CardContent className="space-y-5 pt-2 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                <div className="space-y-1.5">
                  <Label>AI Tutoring Difficulty</Label>
                  <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supportive">
                        Supportive (More hints)
                      </SelectItem>
                      <SelectItem value="standard">
                        Standard (Balanced Socratic)
                      </SelectItem>
                      <SelectItem value="rigorous">
                        Rigorous (Minimal hints)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Scaffolding Level</Label>
                  <Select
                    value={scaffoldingLevel}
                    onValueChange={setScaffoldingLevel}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Direct)</SelectItem>
                      <SelectItem value="medium">
                        Medium (Step-by-step)
                      </SelectItem>
                      <SelectItem value="high">
                        High (Guided discovery)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 border rounded-lg bg-background cursor-pointer">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-sm font-medium">Lockdown Mode</span>
                    <p className="text-[11px] text-muted-foreground">
                      Enforce full-screen & log focus switches during work.
                    </p>
                  </div>
                  <Checkbox
                    checked={lockdownMode}
                    onCheckedChange={(v) => setLockdownMode(!!v)}
                  />
                </label>

                <label className="flex items-center justify-between p-3 border rounded-lg bg-background cursor-pointer">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-sm font-medium">
                      Stealth Assessment
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Grade students silently without showing real-time scores.
                    </p>
                  </div>
                  <Checkbox
                    checked={stealthAssessment}
                    onCheckedChange={(v) => setStealthAssessment(!!v)}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Custom AI Grading Rubric</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSynthesizeRubric}
                    disabled={isSynthesizingRubric}
                    className="h-7 text-xs gap-1.5 border-primary/20 cursor-pointer"
                  >
                    {isSynthesizingRubric ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-primary" />
                    )}
                    Synthesize with AI
                  </Button>
                </div>
                <Textarea
                  rows={3}
                  value={gradingRubric}
                  onChange={(e) => setGradingRubric(e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPreviewOpen(true)}
            className="cursor-pointer"
          >
            <Eye className="mr-1.5 h-4 w-4" />
            Student preview
          </Button>
          <Button
            type="submit"
            disabled={!isPointsValid}
            className="cursor-pointer"
          >
            Create assignment
          </Button>
        </div>
      </form>

      {/* Student Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Student View Simulation
              </span>
            </div>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {questions.map((q, i) => (
              <Card key={q.id} className="border-muted/60">
                <CardHeader className="bg-muted/30 py-2.5 flex flex-row items-center justify-between">
                  <span className="text-xs font-bold uppercase text-muted-foreground">
                    Question {i + 1}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {q.points} PTS
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="text-sm">
                    <MarkdownRenderer>
                      {q.text || "_No question text entered._"}
                    </MarkdownRenderer>
                  </div>
                  {q.type === "multiple-choice" && q.options && (
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3 p-2.5 rounded-lg border bg-muted/10 text-xs"
                        >
                          <div className="h-3.5 w-3.5 rounded-full border border-primary/40" />
                          <MarkdownRenderer>{opt}</MarkdownRenderer>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// RESOURCE UPLOADS PAGE (Matches src/app/teacher/uploads/page.tsx)
// ============================================================================

export function ResourcesPage({
  courses,
  resources,
  onAddResource,
  onDeleteResource,
}: {
  courses: PreviewCourse[];
  resources: PreviewResource[];
  onAddResource: (resource: Omit<PreviewResource, "id" | "createdAt">) => void;
  onDeleteResource: (id: string) => void;
}) {
  const [selectedCourseFilter, setSelectedCourseFilter] =
    React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [courseId, setCourseId] = React.useState<string>("all");
  const [fileName, setFileName] = React.useState(
    "ap_physics_rotational_dynamics_notes.pdf"
  );
  const [resourceToDelete, setResourceToDelete] =
    React.useState<PreviewResource | null>(null);
  const [previewResource, setPreviewResource] =
    React.useState<PreviewResource | null>(null);

  const filteredResources = React.useMemo(() => {
    return resources.filter((r) => {
      const matchesCourse =
        selectedCourseFilter === "all" || r.courseId === selectedCourseFilter;
      const matchesSearch = r.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCourse && matchesSearch;
    });
  }, [resources, selectedCourseFilter, searchQuery]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddResource({
      title: title.trim(),
      url: `/uploads/${fileName}`,
      type: "document",
      courseId,
    });
    setTitle("");
    setDialogOpen(false);
    toast.success("Study material uploaded and shared with class.");
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Resource Uploads"
        description="Share syllabi, formula sheets, and reference materials with your classes."
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleUploadSubmit}>
              <DialogHeader>
                <DialogTitle>Upload Study Material</DialogTitle>
                <DialogDescription>
                  Provide a title and assign this PDF or document to a specific
                  class.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="res-title">Resource Title *</Label>
                  <Input
                    id="res-title"
                    placeholder="e.g., Unit 4: Simple Harmonic Motion Notes.pdf"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="res-course">Assign to Class</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger id="res-course">
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes (General)</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="res-file">Document File *</Label>
                  <Input
                    id="res-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg"
                    className="cursor-pointer"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFileName(f.name);
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </TeacherPageHeader>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5 text-primary" />
                Uploaded Materials
              </CardTitle>
              <CardDescription>
                Students can access these materials directly from their Course
                Resources tab and Problem Solver sidebar.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  className="pl-9 w-full sm:w-[220px] h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedCourseFilter}
                onValueChange={setSelectedCourseFilter}
              >
                <SelectTrigger className="w-full sm:w-[190px] h-9">
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResources.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
              <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3 opacity-50" />
              <h3 className="text-base font-medium">No resources found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Try adjusting your search or class filter, or upload a new
                document.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Resource</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Class
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Uploaded
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id} className="group">
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded bg-primary/10 text-primary mt-0.5">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setPreviewResource(resource)}
                              className="font-medium hover:underline flex items-center gap-1.5 text-left cursor-pointer"
                            >
                              {resource.title}
                              <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <span className="text-[10px] text-muted-foreground/70 font-mono uppercase">
                              {resource.type} · {resource.url}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {courseName(courses, resource.courseId)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                        {resource.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                            onClick={() => setPreviewResource(resource)}
                            title="View Document"
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={() => setResourceToDelete(resource)}
                            title="Delete Resource"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Preview Dialog */}
      <Dialog
        open={!!previewResource}
        onOpenChange={(open) => !open && setPreviewResource(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {previewResource?.title}
            </DialogTitle>
            <DialogDescription>
              {courseName(courses, previewResource?.courseId)} · Uploaded{" "}
              {previewResource?.createdAt}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/20 p-4 space-y-3 text-sm">
            <div className="rounded-md bg-background border p-3.5 text-xs space-y-2">
              <p className="font-semibold text-foreground">
                Reference Equations & Notes
              </p>
              <MarkdownRenderer>
                {`$$\\sum \\vec{F} = m\\vec{a}, \\quad W_{\\text{net}} = \\Delta K, \\quad \\oint \\vec{E}\\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}$$`}
              </MarkdownRenderer>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewResource(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!resourceToDelete}
        onOpenChange={(open) => !open && setResourceToDelete(null)}
        title="Delete Resource?"
        description={`Are you sure you want to delete "${resourceToDelete?.title}"? Students will no longer have access to this study material.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={() => {
          if (resourceToDelete) {
            onDeleteResource(resourceToDelete.id);
            setResourceToDelete(null);
            toast.success("Resource removed.");
          }
        }}
      />
    </div>
  );
}
