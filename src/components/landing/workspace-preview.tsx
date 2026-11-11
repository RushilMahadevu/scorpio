"use client";

import * as React from "react";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import { TeacherDashboardContent } from "@/components/teacher/dashboard-content";
import { TeacherPageHeader } from "@/components/teacher/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RundownDialog } from "@/components/ui/rundown-dialog";
import type { StudentPortfolio } from "@/lib/types";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  FileUp,
  HelpCircle,
  Lock,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import {
  courseName,
  dueLabel,
  initialAssignments,
  initialCourses,
  initialPortfolios,
  initialResources,
  initialStudents,
  initialSubmissions,
  studentById,
  type Assignment,
  type PreviewCourse,
  type PreviewFormula,
  type PreviewResource,
  type PreviewStudent,
  type Question,
  type Submission,
  type SubmissionAnswer,
  type WaypointTemplate,
} from "./workspace-preview-data";
import {
  AssignmentsPage,
  CreateAssignmentPage,
  GradebookPage,
  NetworkPage,
  ResourcesPage,
  StudentsPage,
  VaultPage,
  WaypointsPage,
} from "./workspace-preview-pages";

const PREVIEW_PATHS = [
  "/teacher",
  "/teacher/network",
  "/teacher/students",
  "/teacher/grades",
  "/teacher/assignments",
  "/teacher/create",
  "/teacher/waypoints",
  "/teacher/vault",
  "/teacher/uploads",
] as const;

export type PreviewPathname = (typeof PREVIEW_PATHS)[number];

function isPreviewPathname(path: string): path is PreviewPathname {
  return (PREVIEW_PATHS as readonly string[]).includes(path);
}

export function WorkspacePreview() {
  const [activePath, setActivePath] =
    React.useState<PreviewPathname>("/teacher");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Shared interactive state across all tabs
  const [courses, setCourses] = React.useState<PreviewCourse[]>(initialCourses);
  const [students, setStudents] =
    React.useState<PreviewStudent[]>(initialStudents);
  const [portfolios, setPortfolios] =
    React.useState<Record<string, StudentPortfolio>>(initialPortfolios);
  const [assignments, setAssignments] =
    React.useState<Assignment[]>(initialAssignments);
  const [submissions, setSubmissions] =
    React.useState<Submission[]>(initialSubmissions);
  const [resources, setResources] =
    React.useState<PreviewResource[]>(initialResources);

  // Deep-link state between tabs
  const [selectedSubmissionId, setSelectedSubmissionId] = React.useState<
    string | null
  >(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = React.useState<
    string | null
  >(null);
  const [studentsInitialTab, setStudentsInitialTab] = React.useState<
    "roster" | "insights"
  >("roster");
  const [createDraft, setCreateDraft] = React.useState<{
    title: string;
    description: string;
    courseId?: string;
    questions: Question[];
    gradingRubric?: string;
  } | null>(null);

  // Dashboard class creation & deletion state
  const [createClassOpen, setCreateClassOpen] = React.useState(false);
  const [newClassName, setNewClassName] = React.useState("");
  const [newClassCode, setNewClassCode] = React.useState("");
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] =
    React.useState<PreviewCourse | null>(null);

  const viewportRef = React.useRef<HTMLDivElement>(null);

  const navigate = React.useCallback((href: string) => {
    const normalized = href.split("?")[0];
    if (isPreviewPathname(normalized)) {
      setActivePath(normalized);
      if (normalized !== "/teacher/grades") {
        setSelectedSubmissionId(null);
      }
      if (normalized !== "/teacher/assignments") {
        setSelectedAssignmentId(null);
      }
      if (normalized !== "/teacher/students") {
        setStudentsInitialTab("roster");
      }
      viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const assignmentById = React.useMemo(
    () => new Map(assignments.map((a) => [a.id, a])),
    [assignments]
  );

  const ungradedSubmissions = React.useMemo(
    () => submissions.filter((s) => !s.graded),
    [submissions]
  );

  const gradedCount = submissions.length - ungradedSubmissions.length;

  const generateClassCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewClassCode(result);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassCode.trim()) return;
    const created: PreviewCourse = {
      id: `course-${Date.now()}`,
      name: newClassName.trim(),
      code: newClassCode.trim().toUpperCase(),
      restrictedFormulaIds: [],
    };
    setCourses((prev) => [...prev, created]);
    setNewClassName("");
    setNewClassCode("");
    setCreateClassOpen(false);
    toast.success(`Class "${created.name}" created.`);
  };

  const handleDeleteCourse = () => {
    if (!courseToDelete) return;
    setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
    setCourseToDelete(null);
    toast.success("Class removed.");
  };

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    toast.success("Class code copied to clipboard.");
    setTimeout(() => setCopiedCode(null), 1800);
  };

  // Gradebook handlers
  const handleSaveGrade = (
    submissionId: string,
    score: number,
    updatedAnswers: SubmissionAnswer[]
  ) => {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              graded: true,
              score,
              answers: updatedAnswers,
            }
          : sub
      )
    );
  };

  const openSubmissionInTerminal = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setActivePath("/teacher/grades");
    viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAssignmentDetails = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setActivePath("/teacher/assignments");
    viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Assignment handlers
  const handleCreateAssignment = (payload: {
    title: string;
    courseId: string;
    due: string;
    description: string;
    questions: Question[];
    lockdownMode: boolean;
  }) => {
    const newAssignment: Assignment = {
      id: `assign-${Date.now()}`,
      title: payload.title,
      courseId: payload.courseId,
      due: payload.due,
      topic: "dynamics",
      visibility: "network",
      description: payload.description,
      questions: payload.questions,
      hints: true,
      calculator: true,
      lockdownMode: payload.lockdownMode,
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    setSelectedAssignmentId(newAssignment.id);
    setActivePath("/teacher/assignments");
    viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDuplicateAssignment = (assignment: Assignment) => {
    setCreateDraft({
      title: `${assignment.title} (Copy)`,
      description: assignment.description,
      courseId: assignment.courseId,
      questions: assignment.questions.map((q) => ({ ...q })),
    });
    setActivePath("/teacher/create");
    viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleForkWaypoint = (waypoint: WaypointTemplate) => {
    setCreateDraft({
      title: `${waypoint.title} (Forked)`,
      description: waypoint.description,
      courseId: courses[0]?.id || "mechanics",
      questions: waypoint.questions.map((q) => ({ ...q })),
    });
    setActivePath("/teacher/create");
    viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateVisibility = (
    assignmentId: string,
    visibility: Assignment["visibility"]
  ) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignmentId ? { ...a, visibility } : a))
    );
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    setSubmissions((prev) =>
      prev.filter((s) => s.assignmentId !== assignmentId)
    );
  };

  // Student handlers
  const handleAddStudent = (student: PreviewStudent) => {
    setStudents((prev) => [...prev, student]);
  };

  const handleRemoveStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  const handleRefreshPortfolio = (studentId: string) => {
    setPortfolios((prev) => {
      const existing = prev[studentId];
      if (!existing) return prev;
      return {
        ...prev,
        [studentId]: {
          ...existing,
          lastUpdated: new Date(),
        },
      };
    });
  };

  // Vault handler
  const handleUpdateCourseVault = (
    courseId: string,
    restrictedIds: string[],
    customFormulas: PreviewFormula[]
  ) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? { ...c, restrictedFormulaIds: restrictedIds, customFormulas }
          : c
      )
    );
  };

  // Resource handlers
  const handleAddResource = (
    resource: Omit<PreviewResource, "id" | "createdAt">
  ) => {
    setResources((prev) => [
      {
        ...resource,
        id: `res-${Date.now()}`,
        createdAt: "Nov 9, 2026",
      },
      ...prev,
    ]);
  };

  const handleDeleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div id="dashboard-preview" className="flex min-h-0 flex-1 flex-col bg-card">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <TeacherSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((v) => !v)}
          sample={{
            activeHref: activePath,
            onSelect: navigate,
          }}
        />

        <div
          ref={viewportRef}
          role="region"
          aria-label="Teacher workspace preview"
          tabIndex={0}
          className="min-h-0 min-w-0 flex-1 overflow-auto bg-background/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <div className="w-full px-4 py-6 sm:px-6 md:p-8">
            <div className="max-w-6xl mx-auto">
              {activePath === "/teacher" && (
                <div className="space-y-6">
                  <TeacherPageHeader
                    title="Dashboard"
                    description="Review submissions, manage physics sections, and track assignment progress."
                  >
                    <RundownDialog
                      userRole="teacher"
                      title="Teacher Portal Guide"
                      triggerLabel="Teacher Guide"
                      steps={[
                        {
                          title: "1. Class Architecture & Enrollment",
                          description:
                            "Create your classes and distribute the unique 6-character Class Code to your students. Once joined, they immediately inherit your specific AI constraints, equation vault locks, and assignments.",
                          icon: Users,
                        },
                        {
                          title: "2. AI-Assisted Assignment Building",
                          description:
                            "Navigate to 'Create Assignment' or 'Waypoints' to build problem sets. Use the AI Generator to draft questions from scratch, or import an existing worksheet to automatically parse and digitize it into LaTeX.",
                          icon: Sparkles,
                        },
                        {
                          title: "3. Pedagogical & Integrity Controls",
                          description:
                            "Configure assignment-level AI Scaffolding, enable Lockdown Mode to detect tab-switching, or use 'Vault Controls' to lock specific physics equations during assessments.",
                          icon: ShieldAlert,
                        },
                        {
                          title: "4. Automated Grading & Analytics",
                          description:
                            "Submissions are evaluated step-by-step against your custom rubric. Review AI reasoning and student work in the Grading Terminal, or open Learning insights to review student strengths and focus areas.",
                          icon: HelpCircle,
                        },
                      ]}
                    />
                    <Button
                      size="sm"
                      className="h-9 cursor-pointer"
                      onClick={() => navigate("/teacher/create")}
                    >
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                      Create Assignment
                    </Button>
                  </TeacherPageHeader>

                  <TeacherDashboardContent
                    stats={{
                      totalAssignments: assignments.length,
                      totalStudents: students.length,
                      completedSubmissions: gradedCount,
                      pendingSubmissions: ungradedSubmissions.length,
                    }}
                    dataReady
                    showGradebookLink={false}
                    pending={{
                      action: (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs cursor-pointer"
                          onClick={() => navigate("/teacher/grades")}
                        >
                          Open Gradebook
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      ),
                      rows: ungradedSubmissions.map((sub) => {
                        const st = studentById(students, sub.studentId);
                        const assign = assignmentById.get(sub.assignmentId);
                        return (
                          <li
                            key={sub.id}
                            className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">
                                  {st?.name || "Student"}
                                </p>
                                {(sub.unfocusCount ?? 0) > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px] h-4 px-1.5"
                                  >
                                    {sub.unfocusCount} focus alert
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {assign?.title} ·{" "}
                                {courseName(courses, assign?.courseId)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 shrink-0 text-xs cursor-pointer"
                              onClick={() => openSubmissionInTerminal(sub.id)}
                            >
                              Grade
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </li>
                        );
                      }),
                    }}
                    assignments={{
                      action: (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs cursor-pointer"
                          onClick={() => navigate("/teacher/assignments")}
                        >
                          View all
                        </Button>
                      ),
                      rows: assignments.slice(0, 4).map((assignment) => (
                        <li key={assignment.id}>
                          <button
                            type="button"
                            onClick={() => openAssignmentDetails(assignment.id)}
                            className="w-full text-left flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {assignment.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {courseName(courses, assignment.courseId)}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                              Due {dueLabel(assignment.due)}
                            </span>
                          </button>
                        </li>
                      )),
                    }}
                    classes={{
                      action: (
                        <Dialog
                          open={createClassOpen}
                          onOpenChange={setCreateClassOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs cursor-pointer"
                            >
                              <PlusCircle className="mr-1 h-3.5 w-3.5" />
                              New class
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <form onSubmit={handleCreateCourse}>
                              <DialogHeader>
                                <DialogTitle>Create a New Class</DialogTitle>
                                <DialogDescription>
                                  Enter the details for your new physics course.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="dash-class-name">
                                    Class Name
                                  </Label>
                                  <Input
                                    id="dash-class-name"
                                    placeholder="e.g., AP Physics C: Mechanics"
                                    value={newClassName}
                                    onChange={(e) =>
                                      setNewClassName(e.target.value)
                                    }
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="dash-class-code">
                                    Class Code
                                  </Label>
                                  <div className="flex gap-2">
                                    <Input
                                      id="dash-class-code"
                                      placeholder="e.g., AP1P2X"
                                      value={newClassCode}
                                      onChange={(e) =>
                                        setNewClassCode(
                                          e.target.value.toUpperCase()
                                        )
                                      }
                                      required
                                      className="font-mono"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={generateClassCode}
                                      className="cursor-pointer shrink-0"
                                    >
                                      Generate Code
                                    </Button>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground">
                                    Students use this 6-character code to enroll
                                    in your class.
                                  </p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" className="cursor-pointer">
                                  Create Class
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      ),
                      rows: courses.map((course) => (
                        <li
                          key={course.id}
                          className="px-5 py-3.5 flex flex-col gap-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="font-medium text-sm leading-tight truncate">
                                  {course.name}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                              onClick={() => setCourseToDelete(course)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleCopyCode(course.code)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-mono text-foreground hover:bg-muted transition-colors cursor-pointer"
                              title="Copy class code"
                            >
                              {copiedCode === course.code ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-600" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  {course.code}
                                  <Copy className="h-3 w-3 opacity-60" />
                                </>
                              )}
                            </button>
                            <div className="flex items-center gap-2">
                              {(course.restrictedFormulaIds?.length ?? 0) >
                                0 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] gap-1 font-normal text-muted-foreground"
                                >
                                  <Lock className="h-2.5 w-2.5" />
                                  {course.restrictedFormulaIds?.length} locked
                                </Badge>
                              )}
                              <span className="text-[11px] text-muted-foreground">
                                Join code
                              </span>
                            </div>
                          </div>
                        </li>
                      )),
                    }}
                  />

                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs cursor-pointer"
                      onClick={() => navigate("/teacher/uploads")}
                    >
                      <FileUp className="mr-1.5 h-3.5 w-3.5" />
                      Upload PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs cursor-pointer"
                      onClick={() => navigate("/teacher/vault")}
                    >
                      <Lock className="mr-1.5 h-3.5 w-3.5" />
                      Vault Controls
                    </Button>
                  </div>
                </div>
              )}

              {activePath === "/teacher/network" && (
                <NetworkPage
                  studentCount={students.length}
                  onOpenStudentInsights={() => {
                    setStudentsInitialTab("insights");
                    setActivePath("/teacher/students");
                    viewportRef.current?.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                />
              )}

              {activePath === "/teacher/students" && (
                <StudentsPage
                  courses={courses}
                  students={students}
                  portfolios={portfolios}
                  initialTab={studentsInitialTab}
                  onAddStudent={handleAddStudent}
                  onRemoveStudent={handleRemoveStudent}
                  onManageClasses={() => navigate("/teacher")}
                  onRefreshPortfolio={handleRefreshPortfolio}
                />
              )}

              {activePath === "/teacher/grades" && (
                <GradebookPage
                  courses={courses}
                  students={students}
                  assignments={assignments}
                  submissions={submissions}
                  selectedSubmissionId={selectedSubmissionId}
                  onSelectSubmission={setSelectedSubmissionId}
                  onSaveGrade={handleSaveGrade}
                />
              )}

              {activePath === "/teacher/assignments" && (
                <AssignmentsPage
                  courses={courses}
                  students={students}
                  assignments={assignments}
                  submissions={submissions}
                  selectedAssignmentId={selectedAssignmentId}
                  onSelectAssignment={setSelectedAssignmentId}
                  onOpenCreate={() => navigate("/teacher/create")}
                  onDuplicateAssignment={handleDuplicateAssignment}
                  onUpdateVisibility={handleUpdateVisibility}
                  onDeleteAssignment={handleDeleteAssignment}
                  onOpenSubmission={openSubmissionInTerminal}
                />
              )}

              {activePath === "/teacher/create" && (
                <CreateAssignmentPage
                  courses={courses}
                  initialDraft={createDraft}
                  onClearDraft={() => setCreateDraft(null)}
                  onCreateAssignment={handleCreateAssignment}
                  onCancel={() => navigate("/teacher/assignments")}
                />
              )}

              {activePath === "/teacher/waypoints" && (
                <WaypointsPage onFork={handleForkWaypoint} />
              )}

              {activePath === "/teacher/vault" && (
                <VaultPage
                  courses={courses}
                  onUpdateCourseVault={handleUpdateCourseVault}
                />
              )}

              {activePath === "/teacher/uploads" && (
                <ResourcesPage
                  courses={courses}
                  resources={resources}
                  onAddResource={handleAddResource}
                  onDeleteResource={handleDeleteResource}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!courseToDelete}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
        title="Delete class?"
        description={`This removes "${courseToDelete?.name}" (${courseToDelete?.code}) from this sample workspace.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteCourse}
      />
    </div>
  );
}
