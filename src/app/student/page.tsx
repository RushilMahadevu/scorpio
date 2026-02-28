"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, Bot, School, LogOut, Library, FileCheck, Sigma, TrendingUp, Calendar, ArrowRight, Calculator, PackageOpen,  BrainCircuit, BowArrow } from "lucide-react";
import Link from "next/link";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from "recharts";

interface Stats {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  grades: { name: string; score: number }[];
}

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    grades: [],
  });
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [classCode, setClassCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

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

          // LEGACY CODE RESOLUTION
          // If we have a teacherId but NO courseId, the teacherId might actually be a Class Code
          if (resolvedTid && !resolvedCid) {
             const codeMatch = await getDocs(query(collection(db, "courses"), where("code", "==", resolvedTid.trim())));
             if (!codeMatch.empty) {
                const courseDoc = codeMatch.docs[0];
                const courseData = courseDoc.data();
                resolvedCid = courseDoc.id;
                resolvedTid = courseData.teacherId;
                
                // AUTO-SYNC these back to the student doc so it's resolved forever
                await setDoc(doc(db, "students", user.uid), { 
                  courseId: resolvedCid, 
                  teacherId: resolvedTid 
                }, { merge: true });
                
                // Also update unified user if available
                await setDoc(doc(db, "users", user.uid), { 
                  courseId: resolvedCid, 
                  teacherId: resolvedTid 
                }, { merge: true });
                
                console.log("Legacy teacher code resolved to:", resolvedTid, resolvedCid);
             }
          }
          
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
            query(collection(db, "assignments"), where("courseId", "==", courseId))
          );
          totalAssignments = assignmentsSnap.size;
          assignmentsSnap.docs.forEach(doc => currentAssignmentIds.add(doc.id));
        } else if (teacherId) {
          // Fallback for legacy mode: fetch ALL assignments for this teacher
          // Note: If teacherId is a code, we'll try to resolve it first in syncTeacherId
          const assignmentsSnap = await getDocs(
            query(collection(db, "assignments"), where("teacherId", "==", teacherId))
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

        // Fetch grades for progress chart (last 5 graded submissions)
        const gradedSubmissions = submissions
          .filter(d => d.graded && d.score !== undefined)
          .sort((a, b) => (b.submittedAt?.toDate?.() || 0) - (a.submittedAt?.toDate?.() || 0))
          .slice(0, 5)
          .reverse()
          .map((d, i) => ({
            name: `A${i+1}`,
            score: d.score
          }));

        setStats({
          totalAssignments,
          completedAssignments,
          pendingAssignments: Math.max(0, totalAssignments - completedAssignments),
          grades: gradedSubmissions,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchDashboardData();
  }, [user, teacherId, courseId]);

  const handleJoinClass = async () => {
    if (!user || !classCode) return;
    setJoining(true);
    try {
      const code = classCode.trim();
      // Check if code matches a course
      const coursesSnap = await getDocs(query(collection(db, "courses"), where("code", "==", code)));
      
      let newTeacherId = "";
      let newCourseId = "";
      let newCourseName = "";
      let newCourseCode = "";
      let newSchoolId = "";

      if (!coursesSnap.empty) {
        const courseDoc = coursesSnap.docs[0];
        const courseData = courseDoc.data();
        newTeacherId = courseData.teacherId;
        newCourseId = courseDoc.id;
        newCourseName = courseData.name;
        newCourseCode = courseData.code;
        newSchoolId = courseData.schoolId || "pilot_school";
      } else {
        throw new Error("Invalid class code.");
      }

      // Update student profile with new teacher, course, AND school
      const syncData = {
        role: "student",       // Explicitly set the role here for unified view query
        teacherId: newTeacherId,
        courseId: newCourseId,
        schoolId: newSchoolId, // Auto-migrate the student to the teacher's school
        email: user.email,     // Ensure student email is saved for teacher view
        name: profile?.displayName || profile?.name || user.displayName || user.email?.split("@")[0], // Ensure name is saved
        updatedAt: new Date()
      };

      // 1. Update legacy students collection (use setDoc with merge to avoid 'doc not found' error)
      await setDoc(doc(db, "students", user.uid), syncData, { merge: true });

      // 2. Also sync to the unified users collection for Phase 2.1 features (like AI billing)
      // Check if we can find the teacher's organizationId to inherit it
      let organizationId = null;
      try {
        const teacherUserDoc = await getDoc(doc(db, "users", newTeacherId));
        if (teacherUserDoc.exists()) {
          organizationId = teacherUserDoc.data()?.organizationId;
        }
      } catch (e) { console.error("Could not fetch teacher organization", e); }

      await setDoc(doc(db, "users", user.uid), {
        ...syncData,
        displayName: syncData.name, // Uniform naming across collections
        organizationId: organizationId || null
      }, { merge: true });
      
      alert(`Joined class successfully! ${organizationId ? "You now have access to your organization's AI budget." : ""}`);
      window.location.reload(); // Reload to pick up new claims
    } catch (error: any) {
      console.error("Error joining class:", error);
      alert(`Failed to join class: ${error.message}`);
    }
    finally {
      setJoining(false);
    }
  };

  const handleLeaveClass = async () => {
    if (!user || !confirm("Are you sure you want to leave this class?")) return;
    setLeaving(true);
    try {
      const resetData = {
        teacherId: null,
        courseId: null,
      };

      // Source of truth: Remove from both collections to be thorough
      // Use setDoc with merge: true to avoid "No document found" errors if a profile is partially missing
      let legacySuccess = false;
      let unifiedSuccess = false;

      try {
        await setDoc(doc(db, "students", user.uid), resetData, { merge: true });
        legacySuccess = true;
      } catch (e) { 
        console.warn("Error clearing legacy student doc:", e); 
      }

      try {
        await setDoc(doc(db, "users", user.uid), resetData, { merge: true });
        unifiedSuccess = true;
      } catch (e) { 
        console.warn("Error clearing unified user doc:", e); 
      }

      if (!legacySuccess && !unifiedSuccess) {
         throw new Error("Could not update your profile to leave class. Please check your connection.");
      }

      setTeacherId(null);
      setTeacherName(null);
      setCourseId(null);
      setCourseName(null);
      setClassCode("");
      alert("Successfully left class.");
      window.location.reload(); // Refresh to clear context fully
    } catch (error: any) {
      console.error("Error leaving class:", error);
      alert(`Failed to leave class: ${error.message}`);
    } finally {
      setLeaving(false);
    }
  };

  const assignmentData = [
    { name: "Completed", value: stats.completedAssignments, color: "#10b981" },
    { name: "Pending", value: stats.pendingAssignments, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  if (assignmentData.length === 0) {
    assignmentData.push({ name: "No Assignments", value: 1, color: "#e2e8f0" });
  }

  const statCards = [
    {
      title: "Total Assignments",
      value: stats.totalAssignments,
      icon: FileText,
      description: "All assignments",
    },
    {
      title: "Completed",
      value: stats.completedAssignments,
      icon: CheckCircle,
      description: "Submitted",
    },
    {
      title: "Pending",
      value: stats.pendingAssignments,
      icon: Clock,
      description: "Not yet submitted",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Scorpio - Powering Physics at Sage Ridge</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-none bg-zinc-50 dark:bg-zinc-900/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!courseId ? (
          <Card className="md:col-span-2 lg:col-span-3 border-2 border-dashed border-primary/20 bg-primary/5 rounded-3xl">
            <CardHeader className="py-8">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <School className="h-6 w-6 text-primary" />
                Enroll in Class
              </CardTitle>
              <CardDescription className="text-base">
                {teacherId ? 
                  "Please enter your Class Code to access assignments and resources." : 
                  "To get started, please enter the Class Code provided by your teacher."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                <Input 
                  placeholder="Class Code (e.g. PHYS101)" 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="font-mono h-12 text-lg"
                />
                <Button onClick={handleJoinClass} disabled={joining || !classCode} className="h-12 px-8 font-bold cursor-pointer transition-all">
                  {joining ? "Enrolling..." : "Enroll"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="md:col-span-2 lg:col-span-3 border-none bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between p-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                  <School className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {courseName || "Physics Course"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-3 text-sm font-medium">
                    <span className="font-mono bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs">{courseCode}</span>
                    <span className="opacity-50">•</span>
                    <span>{teacherName || "Instructor"}</span >
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLeaveClass} disabled={leaving} className="text-muted-foreground h-10 hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                {leaving ? "Leaving..." : "Leave Class"}
              </Button>
            </CardHeader>
          </Card>
        )}

        {/* Progress Overview Card */}
        <Card className="rounded-3xl border-none bg-zinc-50 dark:bg-zinc-900/50 shadow-sm flex flex-col">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-bold">Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assignmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assignmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="rounded-3xl border-none bg-zinc-50 dark:bg-zinc-900/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Quick Hub</CardTitle>
            <CardDescription className="font-medium">Direct Access</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 pb-8">
            <Link href="/student/assignments">
              <Button variant="outline" className="cursor-pointer w-full h-16 flex flex-col items-center justify-center gap-1 rounded-2xl hover:bg-primary/10 transition-all border-none bg-white dark:bg-zinc-800 shadow-sm">
                <FileText className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Assignments</span>
              </Button>
            </Link>
            <Link href="/student/practice">
              <Button variant="outline" className="cursor-pointer w-full h-16 flex flex-col items-center justify-center gap-1 rounded-2xl hover:bg-primary/10 transition-all border-none bg-white dark:bg-zinc-800 shadow-sm">
                <BowArrow className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Practice</span>
              </Button>
            </Link>
            <Link href="/student/formula-hub">
              <Button variant="outline" className="cursor-pointer w-full h-16 flex flex-col items-center justify-center gap-1 rounded-2xl hover:bg-primary/10 transition-all border-none bg-white dark:bg-zinc-800 shadow-sm">
                <PackageOpen className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Eq. Vault</span>
              </Button>
            </Link>
            <Link href="/student/submissions">
              <Button variant="outline" className="cursor-pointer w-full h-16 flex flex-col items-center justify-center gap-1 rounded-2xl hover:bg-primary/10 transition-all border-none bg-white dark:bg-zinc-800 shadow-sm">
                <FileCheck className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Grades</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* AI Tutor Card */}
        <Card className="rounded-3xl border-none bg-zinc-50 dark:bg-zinc-900/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Tutor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-sm font-medium opacity-90 leading-relaxed mb-4">
              Step-by-step physics guidance and conceptual help available anytime.
            </p>
            <Link href="/student/tutor">
              <Button className="w-full bg-primary text-background hover:bg-primary/90 font-bold rounded-2xl h-12 shadow-md">
                Ask Questions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}