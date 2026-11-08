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
import { FileText, FileCheck, ArrowRight, PackageOpen, BowArrow, LayoutDashboard, GraduationCap, NotebookPen, ShieldCheck } from "lucide-react";
import { RaiseLogo } from "@/components/ui/raise-logo";
import Link from "next/link";
import { RundownDialog } from "@/components/ui/rundown-dialog";
import { OnboardingChecklist } from "@/components/ui/onboarding-checklist";
interface Stats {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
}

export default function StudentDashboard({ onLoaded }: { onLoaded?: () => void }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
  });
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

  useEffect(() => {
    if (dataReady && onLoaded) {
      onLoaded();
    }
  }, [dataReady, onLoaded]);

  useEffect(() => {
    async function syncTeacherId() {
      if (!user) return;
      try {
        // First try the unified profile from AuthContext (cached/fast)
        if (profile?.courseId) {
          setCourseId(profile.courseId);
          setTeacherId(profile.teacherId || null);

          try {
            const courseDoc = await getDoc(doc(db, "courses", profile.courseId));
            if (courseDoc.exists()) {
              setCourseName(courseDoc.data().name);
              setCourseCode(courseDoc.data().code);
            }
          } catch (e) { console.error("Error fetching course", e); }
          return;
        }

        // Fallback: Legacy profile
        const studentDoc = await getDoc(doc(db, "students", user.uid));
        if (studentDoc.exists()) {
          const data = studentDoc.data();
          let resolvedTid = data.teacherId || null;
          let resolvedCid = data.courseId || null;

          setTeacherId(resolvedTid);
          setCourseId(resolvedCid);

          if (resolvedCid) {
            try {
              const courseDoc = await getDoc(doc(db, "courses", resolvedCid));
              if (courseDoc.exists()) {
                setCourseName(courseDoc.data().name);
                setCourseCode(courseDoc.data().code);
              }
            } catch (e) { console.error("Error fetching course", e); }
          }
        }
      } catch (error) {
        console.error("Error syncing profile:", error);
      }
    }
    syncTeacherId();
  }, [user, profile]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      try {
        if (teacherId) {
          const teacherDoc = await getDoc(doc(db, "teachers", teacherId));
          if (teacherDoc.exists()) {
            setTeacherName(teacherDoc.data().name);
          }
        } else {
          setTeacherName(null);
        }

        let totalAssignments = 0;
        let currentAssignmentIds = new Set<string>();

        // FETCHING LOGIC: Priority to courseId, fallback to teacherId (legacy)
        if (courseId) {
          const assignmentsSnap = await getDocs(
            query(collection(db, "assignments"), where("answerKeySeparated", "==", true), where("courseId", "==", courseId))
          );
          totalAssignments = assignmentsSnap.size;
          assignmentsSnap.docs.forEach(doc => currentAssignmentIds.add(doc.id));
        } else if (teacherId) {
          // Fallback for legacy mode: fetch ALL assignments for this teacher
          // Note: If teacherId is a code, we'll try to resolve it first in syncTeacherId
          const assignmentsSnap = await getDocs(
            query(collection(db, "assignments"), where("answerKeySeparated", "==", true), where("teacherId", "==", teacherId), where("courseId", "==", null))
          );
          totalAssignments = assignmentsSnap.size;
          assignmentsSnap.docs.forEach(doc => currentAssignmentIds.add(doc.id));
        }

        const submissionsSnap = await getDocs(
          query(collection(db, "submissions"), where("studentId", "==", user.uid))
        );

        const submissions = submissionsSnap.docs.map(d => d.data());
        const completedAssignments = submissions.filter(data =>
          data.status !== 'draft' && currentAssignmentIds.has(data.assignmentId)
        ).length;

        setStats({
          totalAssignments,
          completedAssignments,
          pendingAssignments: Math.max(0, totalAssignments - completedAssignments),
        });
        setDataReady(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setDataReady(true); // Still ready even if error
      }
    }

    fetchDashboardData();
  }, [user, teacherId, courseId]);

  const handleJoinClass = async () => {
    if (!user || !classCode) return;
    setJoining(true);
    try {
      const response = await authenticatedFetch('/api/student/enrollment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: classCode.trim() }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
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
      setTeacherId(null);
      setTeacherName(null);
      setCourseId(null);
      setCourseName(null);
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
              title: "5. Adaptive Practice (Temporarily Paused)",
              description: "New problems are paused to reduce token use. Your recent attempts are still available.",
              icon: BowArrow
            },
            {
              title: "6. Digital Notebook",
              description: "A persistent, Markdown-supported space for your notes. Use it to document derivations, save conceptual explanations, and prep for exams without switching platforms.",
              icon: NotebookPen
            },
            {
              title: "7. The Equation Vault",
              description: "Your searchable database for physics formulas and constants. You can quickly search for specific equations and reference them while working on problems.",
              icon: PackageOpen
            },
            {
              title: "8. Raise & Learning Library",
              description: "Access general conceptual help outside of specific assignments. If you're confused about a fundamental law of physics, use Raise for a deep-dive explanation or browse curated resources.",
              icon: RaiseLogo
            },
            {
              title: "9. Working with the Socratic AI",
              description: "To succeed, share your logic with the AI. If you're stuck, describe what you've tried or provide a partial derivation. The AI will analyze your work and provide a targeted hint to help you reach the next step.",
              icon: ShieldCheck,
              isSpecial: true
            }
          ]}
        />
      </WorkspaceHeader>

      {!courseId ? (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Enroll in Class
            </CardTitle>
            <CardDescription className="text-base">
              {teacherId ?
                "Please enter your Class Code to access assignments and resources." :
                "To get started, please enter the Class Code provided by your teacher."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <Input
                placeholder="Class Code (e.g. PHYS101)"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                aria-label="Class code"
              />
              <Button onClick={handleJoinClass} disabled={joining || !classCode}>
                {joining ? "Enrolling..." : "Enroll"}
              </Button>
            </div>
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

      <ConfirmDialog
        open={showLeaveConfirm}
        onOpenChange={setShowLeaveConfirm}
        title="Leave Class"
        description="Are you sure you want to leave this class? You will no longer be able to access assignments or resources from this instructor."
        onConfirm={handleLeaveClass}
        confirmText="Leave Class"
        cancelText="Stay"
      />

      <section aria-labelledby="coursework-heading" className="space-y-3">
        <h2 id="coursework-heading" className="text-lg font-semibold">Coursework</h2>
        <WorkspaceSummary label="Assignment progress" items={[
          { label: "Assigned", value: stats.totalAssignments },
          { label: "Submitted", value: stats.completedAssignments },
          { label: "To do", value: stats.pendingAssignments },
        ]} />
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link href="/student/assignments">View assignments <ArrowRight /></Link></Button>
          <Button asChild variant="outline"><Link href="/student/grades">View grades</Link></Button>
        </div>
      </section>

      <section aria-labelledby="study-heading" className="space-y-3 border-t border-border pt-5">
        <h2 id="study-heading" className="text-lg font-semibold">Study tools</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link href="/student/tutor"><RaiseLogo size={16} aria-hidden /> Ask Raise</Link></Button>
          <Button asChild variant="outline"><Link href="/student/notebook">Notebook</Link></Button>
          <Button asChild variant="outline"><Link href="/student/vault">Equation Vault</Link></Button>
          <Button asChild variant="outline"><Link href="/student/resources">Resources</Link></Button>
        </div>
      </section>

      <OnboardingChecklist
        userRole="student"
        metadata={{ completedCount: stats.completedAssignments, enrolled: !!courseId }}
      />
    </div>
  );
}
