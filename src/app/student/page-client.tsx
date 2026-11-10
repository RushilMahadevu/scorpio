"use client";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkspaceHeader, WorkspaceSummary } from "@/components/ui/workspace";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { FileText, FileCheck, ArrowRight, PackageOpen, LayoutDashboard, GraduationCap, NotebookPen, ShieldCheck } from "lucide-react";
import { RaiseLogo } from "@/components/ui/raise-logo";
import Link from "next/link";
import { RundownDialog } from "@/components/ui/rundown-dialog";
import { StudentProgressChart } from "@/components/dashboard/student-progress-chart";

interface Stats {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
}

interface RecentAssignment {
  id: string;
  title: string;
  dueDate: any;
  isSubmitted: boolean;
}

interface ScorePoint {
  title: string;
  score: number;
  date: string;
}

export default function StudentDashboard({ onLoaded }: { onLoaded?: () => void }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([]);
  const [recentScores, setRecentScores] = useState<ScorePoint[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [classCode, setClassCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [enrollmentReady, setEnrollmentReady] = useState(false);
  const [dashboardError, setDashboardError] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(false);
  const [firstSubmissionDone, setFirstSubmissionDone] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (dataReady && onLoaded) {
      onLoaded();
    }
  }, [dataReady, onLoaded]);

  const profileCourseId = profile?.courseId;
  const profileTeacherId = profile?.teacherId;
  const hasProfile = !!profile;
  useEffect(() => {
    if (!user || !hasProfile) return;
    let active = true;

    async function loadEnrollment() {
      try {
        const legacy = !profileCourseId && user ? (await getDoc(doc(db, "students", user.uid))).data() : null;
        const nextCourseId = profileCourseId || legacy?.courseId || null;
        const nextTeacherId = profileTeacherId || legacy?.teacherId || null;
        const course = nextCourseId ? (await getDoc(doc(db, "courses", nextCourseId))).data() : null;
        if (!active) return;
        setCourseId(nextCourseId);
        setTeacherId(nextTeacherId);
        setCourseName(course?.name || null);
        setCourseCode(course?.code || null);
        setEnrollmentReady(true);
      } catch (error) {
        console.error("Error syncing profile:", error);
        if (active) {
          setEnrollmentError(true);
          setDataReady(true);
        }
      }
    }

    loadEnrollment();
    return () => { active = false; };
  }, [user, hasProfile, profileCourseId, profileTeacherId, retry]);

  useEffect(() => {
    if (!user || !enrollmentReady) return;
    let active = true;

    async function fetchDashboardData() {
      if (!user) return;
      setDataReady(false);
      setDashboardError(false);
      try {
        if (teacherId) {
          const teacherDoc = await getDoc(doc(db, "teachers", teacherId)).catch(() => null);
          if (active) setTeacherName(teacherDoc?.data()?.name || null);
        } else {
          setTeacherName(null);
        }

        let totalAssignments = 0;
        let currentAssignmentIds = new Set<string>();
        let assignmentsList: any[] = [];

        // FETCHING LOGIC: Priority to courseId, fallback to teacherId (legacy)
        if (courseId) {
          const assignmentsSnap = await getDocs(
            query(collection(db, "assignments"), where("answerKeySeparated", "==", true), where("courseId", "==", courseId))
          );
          totalAssignments = assignmentsSnap.size;
          assignmentsSnap.docs.forEach(doc => {
            currentAssignmentIds.add(doc.id);
            assignmentsList.push({ id: doc.id, ...doc.data() });
          });
        } else if (teacherId) {
          // Fallback for legacy mode: fetch ALL assignments for this teacher
          // Note: If teacherId is a code, we'll try to resolve it first in syncTeacherId
          const assignmentsSnap = await getDocs(
            query(collection(db, "assignments"), where("answerKeySeparated", "==", true), where("teacherId", "==", teacherId), where("courseId", "==", null))
          );
          totalAssignments = assignmentsSnap.size;
          assignmentsSnap.docs.forEach(doc => {
            currentAssignmentIds.add(doc.id);
            assignmentsList.push({ id: doc.id, ...doc.data() });
          });
        }

        const submissionsSnap = await getDocs(
          query(collection(db, "submissions"), where("studentId", "==", user.uid))
        );

        const submissions = submissionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        const submittedAssignmentIds = new Set(
          submissions.filter(data => data.status !== 'draft').map(data => data.assignmentId)
        );
        const completedAssignments = submissions.filter(data =>
          data.status !== 'draft' && currentAssignmentIds.has(data.assignmentId)
        ).length;

        // Map assignment title lookup
        const titleMap = new Map<string, string>();
        assignmentsList.forEach(a => titleMap.set(a.id, a.title || "Assignment"));

        // Extract score points sorted chronologically
        const gradedSubmissions = submissions
          .filter(s => s.graded && typeof s.score === 'number' && s.status !== 'draft' && currentAssignmentIds.has(s.assignmentId))
          .sort((a, b) => {
            const timeA = a.submittedAt?.seconds ? a.submittedAt.seconds * 1000 : (a.submittedAt ? new Date(a.submittedAt).getTime() : 0);
            const timeB = b.submittedAt?.seconds ? b.submittedAt.seconds * 1000 : (b.submittedAt ? new Date(b.submittedAt).getTime() : 0);
            return timeA - timeB;
          });

        const scorePoints: ScorePoint[] = gradedSubmissions.map(s => {
          const rawDate = s.submittedAt?.seconds ? new Date(s.submittedAt.seconds * 1000) : (s.submittedAt ? new Date(s.submittedAt) : null);
          return {
            title: titleMap.get(s.assignmentId) || "Assignment",
            score: s.score,
            date: rawDate ? rawDate.toLocaleDateString() : "",
          };
        });

        // Determine top upcoming assignments: unsubmitted first, sorted by due date ascending
        const upcoming: RecentAssignment[] = assignmentsList
          .map(a => ({
            id: a.id,
            title: a.title || "Untitled",
            dueDate: a.dueDate,
            isSubmitted: submittedAssignmentIds.has(a.id),
          }))
          .sort((a, b) => {
            if (a.isSubmitted !== b.isSubmitted) {
              return a.isSubmitted ? 1 : -1;
            }
            const timeA = a.dueDate?.seconds ? a.dueDate.seconds * 1000 : (a.dueDate ? new Date(a.dueDate).getTime() : Infinity);
            const timeB = b.dueDate?.seconds ? b.dueDate.seconds * 1000 : (b.dueDate ? new Date(b.dueDate).getTime() : Infinity);
            return timeA - timeB;
          })
          .slice(0, 3);

        if (!active) return;
        setFirstSubmissionDone(submittedAssignmentIds.size > 0);
        setStats({
          totalAssignments,
          completedAssignments,
          pendingAssignments: Math.max(0, totalAssignments - completedAssignments),
        });
        setRecentScores(scorePoints);
        setRecentAssignments(upcoming);
        setDataReady(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (active) {
          setDashboardError(true);
          setDataReady(true);
        }
      }
    }

    fetchDashboardData();
    return () => { active = false; };
  }, [user, enrollmentReady, teacherId, courseId, retry]);

  function retryDashboard() {
    setEnrollmentError(false);
    setDashboardError(false);
    setEnrollmentReady(false);
    setDataReady(false);
    setRetry(value => value + 1);
  }

  const handleJoinClass = async () => {
    if (!user || !classCode) return;
    setJoining(true);
    try {
      const response = await authenticatedFetch('/api/student/enrollment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: classCode.trim() }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      setClassCode("");
      toast.success('Joined class successfully');
      router.refresh(); // Refresh to pick up new claims without full reload
    } catch (error: any) {
      console.error("Error joining class:", error);
      toast.error(`Failed to join class: ${error.message}`);
    }
    finally {
      setJoining(false);
    }
  };

  const handleLeaveClass = async () => {
    if (!user) return;
    setLeaving(true);
    try {
      const response = await authenticatedFetch('/api/student/enrollment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'leave' }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      setClassCode("");
      toast.success("Successfully left class.");
      router.refresh(); // Refresh to clear context without full reload
    } catch (error: any) {
      console.error("Error leaving class:", error);
      toast.error(`Failed to leave class: ${error.message}`);
    } finally {
      setLeaving(false);
    }
  };

  const firstAssignment = recentAssignments.find(assignment => !assignment.isSubmitted);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        title="Dashboard"
        description={`${getGreeting()}, ${profile?.displayName?.split(" ")[0] || "Student"}.`}
      >
        <RundownDialog
          userRole="student"
          triggerLabel="Student Tutorial"
          title="System Navigation Guide"
          steps={[
            {
              title: "1. The Student Dashboard",
              description: "Your primary overview page. See your class, coursework progress, and study tools.",
              icon: LayoutDashboard
            },
            {
              title: "2. Working on Assignments",
              description: "The core of the system. Select an assignment to begin solving problems. Use the Socratic AI chat to get help—but remember, the system is designed to guide you through steps, not give away answers.",
              icon: FileText
            },
            {
              title: "3. Reviewing Submissions",
              description: "Access your completed work. Review your answers and any feedback your instructor has shared.",
              icon: FileCheck
            },
            {
              title: "4. Grade Tracking",
              description: "View your current academic standing. See your scores and open feedback for each assignment.",
              icon: GraduationCap
            },
            {
              title: "5. Digital Notebook",
              description: "A persistent, Markdown-supported space for your notes. Use it to document derivations, save conceptual explanations, and prep for exams without switching platforms.",
              icon: NotebookPen
            },
            {
              title: "6. The Equation Vault",
              description: "Your searchable database for physics formulas and constants. You can quickly search for specific equations and reference them while working on problems.",
              icon: PackageOpen
            },
            {
              title: "7. Raise & Learning Library",
              description: "Access general conceptual help outside of specific assignments. If you're confused about a fundamental law of physics, use Raise for a deep-dive explanation or browse curated resources.",
              icon: RaiseLogo
            },
            {
              title: "8. Working with the Socratic AI",
              description: "To succeed, share your logic with the AI. If you're stuck, describe what you've tried or provide a partial derivation. The AI will analyze your work and provide a targeted hint to help you reach the next step.",
              icon: ShieldCheck,
              isSpecial: true
            }
          ]}
        />
      </WorkspaceHeader>

      {enrollmentError ? (
        <Card className="shadow-none">
          <CardHeader><CardTitle>Couldn’t load your enrollment</CardTitle></CardHeader>
          <CardContent><Button variant="outline" onClick={retryDashboard}>Try again</Button></CardContent>
        </Card>
      ) : !enrollmentReady ? (
        <p role="status" className="text-sm text-muted-foreground">Checking your enrollment…</p>
      ) : !courseId ? (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Join your class
            </CardTitle>
            <CardDescription className="text-base">
              {teacherId ?
                "Please enter your Class Code to access assignments and resources." :
                "To get started, please enter the Class Code provided by your teacher."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md" onSubmit={event => {
              event.preventDefault();
              handleJoinClass();
            }}>
              <Input
                placeholder="Class Code (e.g. PHYS101)"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                aria-label="Class code"
              />
              <Button type="submit" disabled={joining || !classCode.trim()}>
                {joining ? "Enrolling..." : "Enroll"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-none">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="break-words text-lg">{courseName || "Physics Course"}</CardTitle>
              <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                {courseCode && <Badge variant="secondary">{courseCode}</Badge>}
                {teacherName || "Instructor"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowLeaveConfirm(true)} disabled={leaving}>
              {leaving ? "Leaving..." : "Leave class"}
            </Button>
          </CardHeader>
        </Card>
      )}

      {!enrollmentError && enrollmentReady && courseId && (
        dashboardError ? (
          <Card className="shadow-none">
            <CardHeader><CardTitle>Couldn’t load your assignments</CardTitle></CardHeader>
            <CardContent><Button variant="outline" onClick={retryDashboard}>Try again</Button></CardContent>
          </Card>
        ) : !dataReady ? (
          <p role="status" className="text-sm text-muted-foreground">Loading your assignments…</p>
        ) : !firstSubmissionDone ? (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>{firstAssignment ? "Start your first assignment" : "You’re enrolled"}</CardTitle>
              <CardDescription className="break-words">{firstAssignment?.title || "Your teacher hasn’t posted an assignment yet."}</CardDescription>
            </CardHeader>
            {firstAssignment && (
              <CardContent>
                <Button asChild>
                  <Link href={`/student/assignment-view?id=${encodeURIComponent(firstAssignment.id)}`}>Start your first assignment</Link>
                </Button>
              </CardContent>
            )}
          </Card>
        ) : null
      )}

      <ConfirmDialog
        open={showLeaveConfirm}
        onOpenChange={setShowLeaveConfirm}
        title="Leave Class"
        description="Are you sure you want to leave this class? You will no longer be able to access assignments or resources from this instructor."
        onConfirm={handleLeaveClass}
        confirmText="Leave Class"
        cancelText="Stay"
      />

      <StudentProgressChart
        totalAssignments={stats.totalAssignments}
        completedAssignments={stats.completedAssignments}
        pendingAssignments={stats.pendingAssignments}
        scores={recentScores}
      />

      <Card className="gap-0 py-0 shadow-none overflow-hidden">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-muted/40 px-5 py-3.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Upcoming assignments</h2>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/student/assignments">All Assignments <ArrowRight className="size-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0 bg-card">
          {recentAssignments.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentAssignments.map((assignment) => (
                <li key={assignment.id}>
                  <Link
                    href={assignment.isSubmitted ? `/student/submissions` : `/student/assignment-view?id=${assignment.id}`}
                    className="group flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="block break-words text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                          {assignment.title}
                        </span>
                        {assignment.isSubmitted && (
                          <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 font-normal">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {assignment.dueDate
                          ? `Due ${new Date(assignment.dueDate.seconds ? assignment.dueDate.seconds * 1000 : assignment.dueDate).toLocaleDateString()}`
                          : "No due date"}
                      </span>
                    </div>
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              {dashboardError || enrollmentError ? "Coursework is unavailable." : dataReady ? "No coursework assigned yet." : "Loading coursework…"}
            </p>
          )}
        </CardContent>
      </Card>

      <section aria-labelledby="study-heading" className="space-y-3 pt-1">
        <h2 id="study-heading" className="text-sm font-semibold tracking-tight text-foreground">
          Study Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/student/tutor"
            className="group rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                <RaiseLogo size={16} aria-hidden /> Ask Raise
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Socratic physics AI guidance
            </p>
          </Link>

          <Link
            href="/student/vault"
            className="group rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Equation Vault
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Physics formulas & constants
            </p>
          </Link>

          <Link
            href="/student/notebook"
            className="group rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Notebook
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Derivations & Markdown notes
            </p>
          </Link>

          <Link
            href="/student/resources"
            className="group rounded-xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:bg-muted/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Resources
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Course materials & references
            </p>
          </Link>
        </div>
      </section>

    </div>
  );
}
