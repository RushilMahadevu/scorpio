"use client";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { ArrowRight, FileText, RotateCcw, Users, PlusCircle, Upload, GraduationCap, Trash2, Copy, Link2, Building2, Waypoints, PackageCheck, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { RundownDialog } from "@/components/ui/rundown-dialog";
import { TeacherPageHeader } from "@/components/teacher/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { classInvitePath } from "@/lib/onboarding-links";
import { TeacherDashboardContent, type TeacherDashboardStats } from "@/components/teacher/dashboard-content";

interface Submission {
  id: string;
  graded?: boolean;
  status?: string;
  studentName?: string;
  assignmentId?: string;
  assignmentTitle?: string;
}

type PendingSubmission = Submission & { assignmentTitle: string };

interface Course {
  id: string;
  name: string;
  code: string;
  teacherId: string;
}

interface RecentAssignment {
  id: string;
  title?: string;
  dueDate?: string | number | Date | { seconds: number };
}

const emptySnapshot = { docs: [], size: 0 };

function assignmentDueLabel(dueDate: RecentAssignment["dueDate"]) {
  if (!dueDate) return "No due date";

  const date = typeof dueDate === "object" && "seconds" in dueDate
    ? new Date(dueDate.seconds * 1000)
    : new Date(dueDate);
  return `Due ${date.toLocaleDateString()}`;
}

export default function TeacherDashboard({ onLoaded }: { onLoaded?: () => void }) {
  const { user, profile } = useAuth();
  const networkId = profile?.organizationId;
  const [network, setNetwork] = useState<{ id: string; name: string } | null>(null);
  const [networkError, setNetworkError] = useState(false);
  const [setupError, setSetupError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [classAssignmentIds, setClassAssignmentIds] = useState<string[]>([]);
  const [courseError, setCourseError] = useState("");
  const [stats, setStats] = useState<TeacherDashboardStats>({
    totalAssignments: 0,
    totalStudents: 0,
    completedSubmissions: 0,
    pendingSubmissions: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [pendingGrading, setPendingGrading] = useState<PendingSubmission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    if (dataReady && onLoaded) {
      onLoaded();
    }
  }, [dataReady, onLoaded]);

  useEffect(() => {
    if (!networkId) return;
    let active = true;
    getDoc(doc(db, "organizations", networkId)).then(snapshot => {
      if (!snapshot.exists()) throw new Error("Network unavailable");
      if (active) setNetwork({ id: networkId, name: snapshot.data().name || "Your Network" });
    }).catch(() => {
      if (active) setNetworkError(true);
    });
    return () => { active = false; };
  }, [networkId, retry]);

  useEffect(() => {
    let active = true;
    async function fetchStats() {
      if (!user) return;
      try {
        const [courseSnapshot, assignmentsSnap] = await Promise.all([
          getDocs(query(collection(db, "courses"), where("teacherId", "==", user.uid))),
          getDocs(query(collection(db, "assignments"), where("teacherId", "==", user.uid))),
        ]);
        if (!active) return;

        const courseDocs = courseSnapshot.docs;
        setCourses(courseDocs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
        setClassAssignmentIds(assignmentsSnap.docs.map(doc => doc.data().courseId).filter(Boolean));

        const myCourseIdsArr = courseDocs.slice(0, 30).map(doc => doc.id);
        const [unifiedSnap, unifiedByCourseSnap] = await Promise.all([
          getDocs(query(collection(db, "users"), where("teacherId", "==", user.uid), where("role", "==", "student"))).catch(() => emptySnapshot),
          myCourseIdsArr.length > 0
            ? getDocs(query(collection(db, "users"), where("courseId", "in", myCourseIdsArr), where("role", "==", "student"))).catch(() => emptySnapshot)
            : Promise.resolve(emptySnapshot),
        ]);
        if (!active) return;

        const uniqueStudentIds = new Set([
          ...unifiedSnap.docs.map(d => d.id),
          ...unifiedByCourseSnap.docs.map(d => d.id)
        ]);
        
        // We can't query submissions by teacherId directly unless we add it to the submission.
        // Instead, filter submissions by checking if assignmentId belongs to one of our assignments.
        const myAssignmentIds = new Set(assignmentsSnap.docs.map(d => d.id));
        
        // CHUNKED FETCHING: Only fetch submissions for teacher's assignments
        // This is critical for security (prevent leaking all submissions) and performance.
        const myAssignmentIdsArr = Array.from(myAssignmentIds);
        const subChunks = [];
        for (let i = 0; i < myAssignmentIdsArr.length; i += 30) {
            subChunks.push(myAssignmentIdsArr.slice(i, i + 30));
        }
        
        const submissions: Submission[] = [];
        if (subChunks.length > 0) {
            const subResults = await Promise.all(subChunks.map(chunk => 
                getDocs(query(collection(db, "submissions"), where("assignmentId", "in", chunk))).catch(() => emptySnapshot)
            ));
            subResults.forEach(snap => {
                snap.docs.forEach(doc => {
                    submissions.push({ id: doc.id, ...doc.data() } as Submission);
                });
            });
        }


        if (!active) return;
        const submitted = submissions.filter((s) => s.status !== "draft");
        const pending = submitted.filter((s) => !s.graded);

        setStats({
          totalAssignments: assignmentsSnap.size,
          totalStudents: uniqueStudentIds.size,
          completedSubmissions: submitted.length - pending.length,
          pendingSubmissions: pending.length,
        });

        // Recent assignments (filtered)
        const recentQuery = query(
          collection(db, "assignments"),
          where("teacherId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const recentSnap = await getDocs(recentQuery).catch(() => emptySnapshot);
        if (!active) return;
        setRecentAssignments(recentSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Pending grading (ungraded submissions from MY assignments)
        const pendingSubs = pending.slice(0, 3);
        
        // Get assignment titles
        const assignmentsMap = new Map(assignmentsSnap.docs.map((doc) => [doc.id, doc.data()]));

        // Only include pending submissions whose assignmentId exists in assignmentsMap
        const pendingWithDetails = pendingSubs
          .map((sub) => {
            const assignmentId = sub.assignmentId;
            if (!assignmentId) return null;

            const assignment = assignmentsMap.get(assignmentId);
            if (!assignment) return null;

            return {
              ...sub,
              assignmentTitle: assignment.title || "Untitled",
            } satisfies PendingSubmission;
          })
          .filter((sub): sub is PendingSubmission => sub !== null);

        setPendingGrading(pendingWithDetails);

      } catch (error) {
        console.error("Error fetching stats:", error);
        if (active) setSetupError(true);
      } finally {
        if (active) setDataReady(true);
      }
    }

    fetchStats();
    return () => { active = false; };
  }, [user, retry]);

  const handleCreateCourse = async () => {
    if (!user || !newCourseName.trim() || !newCourseCode.trim()) return;
    setCourseError("");
    setIsCreatingCourse(true);
    const code = newCourseCode.trim();
    try {
      const response = await authenticatedFetch('/api/courses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newCourseName, code }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create the class.");

      const course = { id: result.id, name: newCourseName.trim().slice(0, 120), code, teacherId: user.uid };
      setCourses(current => [course, ...current]);
      setNewCourseName("");
      setNewCourseCode("");
      toast.success("Class created successfully!");
      setDialogOpen(false);
    } catch (error) {
      setCourseError(error instanceof Error ? error.message : "Could not create the class. Try again.");
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteDoc(doc(db, "courses", courseId));
      setCourses(courses.filter(c => c.id !== courseId));
      toast.success("Class deleted successfully!");
    } catch (error) {
       console.error("Error deleting course:", error);
       toast.error("Failed to delete course");
    }
  };

  function generateCourseCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    setNewCourseCode(Array.from(bytes, byte => alphabet[byte % alphabet.length]).join(""));
    setCourseError("");
  }

  function changeClassDialog(open: boolean) {
    if (open && !newCourseCode) generateCourseCode();
    if (!open) setCourseError("");
    setDialogOpen(open);
  }

  async function copyClassInvite(course: Course, link: boolean) {
    const text = link ? new URL(classInvitePath(course.code), window.location.origin).href : course.code;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(link ? "Student invite link copied." : "Class code copied.");
    } catch {
      toast.error(link ? "Could not copy the link. You can still share the class code." : "Could not copy the class code.");
    }
  }

  function retrySetup() {
    setNetworkError(false);
    setSetupError(false);
    setDataReady(false);
    setRetry(value => value + 1);
  }

  const firstClass = courses[0];
  const hasClassAssignment = courses.some(course => classAssignmentIds.includes(course.id));
  const networkName = network?.id === networkId ? network?.name : null;

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.displayName || "Teacher"}.`}
      >
        <RundownDialog 
          userRole="teacher"
          triggerLabel="Teacher Guide"
          title="Teacher Instruction Manual"
          steps={[
            {
              title: "1. The Teacher Dashboard",
              description: "Monitor your classroom status at a glance. The dashboard aggregates real-time stats including enrollment numbers, assignment completion rates, and highlights urgent submissions awaiting your manual review and grading.",
              icon: LayoutDashboard
            },
            {
              title: "2. Institutional Network",
              description: "The Network tool provides macro-level analytics across all your registered classes. Use this to compare performance trends, identify common conceptual hurdles across cohorts, and export data for institutional reporting.",
              icon: Building2
            },
            {
              title: "3. Student Management",
              description: "Manage your roster and view individual student profiles. Beyond basic data, you can audit their interaction logs with the Socratic AI to see exactly where they got stuck and what hints they required to proceed.",
              icon: Users
            },
            {
              title: "4. Grading & Feedback",
              description: "Review student submissions with automated scoring verified by our 4-layer architecture. You can manually override grades, provide specific written feedback, and track historical performance for each student.",
              icon: GraduationCap
            },
            {
              title: "5. Assignment Management",
              description: "Your central library for assignments. From here, you can manage the lifecycle of your content—drafting new materials, deploying them to specific classes, and closing submissions after deadlines.",
              icon: FileText
            },
            {
              title: "6. The Assignment Builder",
              description: "Build problems with custom inference-time constraints. You define the variables and derivation steps required, while the Socratic engine ensures students cannot bypass the learning process through simple prompt engineering.",
              icon: PlusCircle
            },
            {
              title: "7. Pedagogical Waypoints",
              description: "Waypoints are specific conceptual milestones. Configure assignments to require students to 'pass' certain waypoints through derivation or explanation before the AI allows them to proceed to the final solution.",
              icon: Waypoints
            },
            {
              title: "8. Vault Controls",
              description: "Define exactly which equations students can access in their Equation Vault. You can restrict standard physics formulas for specific classes or upload your own custom LaTeX equations to supplement the curriculum.",
              icon: PackageCheck
            },
            {
              title: "9. Curriculum Integration",
              description: "Upload your course syllabi, PDFs, and proprietary materials to the Resource Uploads. Scorpio indexses this content as a 'ground truth' reference, ensuring the AI responses align with your specific teaching methodology.",
              icon: Upload
            },
            {
              title: "10. How Socratic AI Works",
              description: "Scorpio's AI acts as a 4-layer pedagogical guardrail. It assesses student input for logic, identifies the specific misconception, and provides a scaffolded hint rather than the answer. This ensures verifiable academic integrity at scale.",
              icon: ShieldCheck,
              isSpecial: true
            }

          ]}
        />
        <Button asChild>
          <Link href="/teacher/create">
            <PlusCircle />
            Create Assignment
          </Link>
        </Button>
      </TeacherPageHeader>

      {networkName && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3">
          <div className="min-w-0">
            <p className="break-words text-sm font-medium">{networkName}</p>
            <p className="text-sm text-muted-foreground">Share teaching resources and collaborate with colleagues.</p>
          </div>
          <Button asChild variant="outline" size="sm"><Link href="/teacher/network">View Network</Link></Button>
        </div>
      )}

      {setupError || networkError ? (
        <Card className="shadow-none">
          <CardHeader><CardTitle>Couldn’t load your setup</CardTitle></CardHeader>
          <CardContent><Button variant="outline" onClick={retrySetup}>Try again</Button></CardContent>
        </Card>
      ) : !profile || (networkId && (!networkName || !dataReady)) ? (
        <p role="status" className="text-sm text-muted-foreground">Loading your classroom setup…</p>
      ) : !networkId || !hasClassAssignment ? (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="break-words">{!networkId ? "Set up your Network" : firstClass ? `Get ${firstClass.name} ready` : "Create your first class"}</CardTitle>
            <CardDescription>
              {!networkId ? "Create or join a Network to start teaching and share resources with colleagues."
                : firstClass ? "Share your class with students and give them their first assignment."
                : "Give your class a name. Scorpio will generate a code students can use to join."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {!networkId ? (
              <Button asChild><Link href="/teacher/network">Set up your Network</Link></Button>
            ) : firstClass ? (
              <>
                <Button asChild><Link href={`/teacher/create?courseId=${encodeURIComponent(firstClass.id)}`}>Create your first assignment</Link></Button>
                <Button variant="outline" onClick={() => copyClassInvite(firstClass, true)}>Copy student invite link</Button>
                <Button variant="outline" onClick={() => copyClassInvite(firstClass, false)}>Copy class code</Button>
              </>
            ) : <Button onClick={() => changeClassDialog(true)}>Create your first class</Button>}
          </CardContent>
        </Card>
      ) : null}

      <TeacherDashboardContent
        stats={stats}
        dataReady={dataReady}
        pending={{
          action: (
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground hover:text-foreground">
              <Link href="/teacher/grades">Gradebook <ArrowRight className="size-3.5" /></Link>
            </Button>
          ),
          rows: pendingGrading.map((submission) => (
            <li key={submission.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-foreground">{submission.assignmentTitle}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{submission.studentName || "Student submission"}</p>
              </div>
              <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                <Link href={`/teacher/submission/grade?id=${submission.id}`} aria-label={`Grade ${submission.assignmentTitle}`}>
                  Grade <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </li>
          )),
        }}
        assignments={{
          action: (
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground hover:text-foreground">
              <Link href="/teacher/assignments">All Assignments <ArrowRight className="size-3.5" /></Link>
            </Button>
          ),
          rows: recentAssignments.map((assignment) => (
            <li key={assignment.id}>
              <Link
                href={`/teacher/assignment-view?id=${assignment.id}`}
                className="group flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <div className="min-w-0">
                  <span className="block break-words text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                    {assignment.title || "Untitled"}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {assignmentDueLabel(assignment.dueDate)}
                  </span>
                </div>
                <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </li>
          )),
        }}
        classes={{
          action: (
            <Dialog open={dialogOpen} onOpenChange={changeClassDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 text-xs" disabled={!networkId || !dataReady || setupError}>
                  <PlusCircle className="size-3.5" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                  <DialogDescription>
                    Create a new class with a unique code for students to join.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Class Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. AP Physics Period 1"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Class Code</Label>
                    <Input
                      id="code"
                      placeholder="e.g. PHYS101"
                      value={newCourseCode}
                      onChange={(e) => {
                        setNewCourseCode(e.target.value.toUpperCase());
                        setCourseError("");
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={generateCourseCode} className="cursor-pointer">
                      <RotateCcw className="h-4 w-4" />
                      Generate Code
                    </Button>
                    <p className="text-xs text-muted-foreground">Use 6–64 letters, numbers, dashes, or underscores.</p>
                  </div>
                </div>
                {courseError && <p role="alert" className="text-sm text-destructive">{courseError}</p>}
                <DialogFooter>
                  <Button onClick={handleCreateCourse} disabled={isCreatingCourse || !newCourseName.trim() || !newCourseCode.trim()} className="cursor-pointer">
                    {isCreatingCourse ? "Creating..." : "Create Class"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ),
          rows: courses.map((course) => (
            <li key={course.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-foreground">{course.name}</p>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-mono font-medium text-foreground/80">{course.code}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-6 text-muted-foreground hover:text-foreground"
                    aria-label={`Copy class code for ${course.name}`}
                    onClick={() => copyClassInvite(course, false)}
                  >
                    <Copy className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-6 text-muted-foreground hover:text-foreground"
                    aria-label={`Copy student invite link for ${course.name}`}
                    onClick={() => copyClassInvite(course, true)}
                  >
                    <Link2 className="size-3" />
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-7 text-muted-foreground hover:text-destructive"
                aria-label={`Delete class ${course.name}`}
                onClick={() => setCourseToDelete(course.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          )),
        }}
      />

      <nav aria-label="Classroom tools" className="flex flex-wrap gap-2">
        <Button variant="outline" asChild><Link href="/teacher/uploads"><Upload /> Upload PDF</Link></Button>
        <Button variant="outline" asChild><Link href="/teacher/vault"><PackageCheck /> Vault Controls</Link></Button>
      </nav>

      <ConfirmDialog
        open={!!courseToDelete}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
        title="Delete Class"
        description="Students will lose access to assignments for this class."
        onConfirm={() => courseToDelete && handleDeleteCourse(courseToDelete)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
