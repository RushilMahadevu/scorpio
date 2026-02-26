"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Users, CheckCircle, Clock, PlusCircle, List, Upload, GraduationCap, School, Trash2, Copy } from "lucide-react";
import Link from "next/link";

interface Submission {
  id: string;
  graded?: boolean;
  assignmentId?: string;
  assignmentTitle?: string;
}

type PendingSubmission = Submission & { assignmentTitle: string };

interface Course {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  createdAt: any;
}

interface Stats {
  totalAssignments: number;
  totalStudents: number;
  completedSubmissions: number;
  pendingSubmissions: number;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalAssignments: 0,
    totalStudents: 0,
    completedSubmissions: 0,
    pendingSubmissions: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [pendingGrading, setPendingGrading] = useState<PendingSubmission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        // 1. Fetch courses first (including legacy) to resolve course-based student counts
        const [cSnap1, cSnap2] = await Promise.all([
           getDocs(query(collection(db, "courses"), where("teacherId", "==", user.uid))).catch(() => ({docs:[]} as any)),
           getDocs(query(collection(db, "courses"), where("code", "==", user.uid))).catch(() => ({docs:[]} as any))
        ]);
        
        const courseDocs = [...cSnap1.docs, ...cSnap2.docs];
        const myCourseIdsArr = Array.from(new Set(courseDocs.map(d => d.id))).slice(0, 30);
        const myCodesArr = Array.from(new Set(courseDocs.map(d => d.data().code))).filter(code => !!code).slice(0, 30);
        
        // 2. Fetch all relevant data snapshots
        // Fetch data with individual error handling to avoid one query failure blocking everything
        const [assignmentsSnap, legacySnap, unifiedSnap, legacyByCourseSnap, unifiedByCourseSnap, legacyByCodeSnap] = await Promise.all([
          getDocs(query(collection(db, "assignments"), where("teacherId", "==", user.uid))).catch(e => ({ docs: [], size: 0 } as any)),
          getDocs(query(collection(db, "students"), where("teacherId", "==", user.uid))).catch(e => ({ docs: [], size: 0 } as any)),
          getDocs(query(collection(db, "users"), where("teacherId", "==", user.uid), where("role", "==", "student"))).catch(e => ({ docs: [], size: 0 } as any)),
          (myCourseIdsArr.length > 0 
            ? getDocs(query(collection(db, "students"), where("courseId", "in", myCourseIdsArr))).catch(e => ({ docs: [], size: 0 } as any))
            : Promise.resolve({ docs: [], size: 0 } as any)),
          (myCourseIdsArr.length > 0 
            ? getDocs(query(collection(db, "users"), where("courseId", "in", myCourseIdsArr), where("role", "==", "student"))).catch(e => ({ docs: [], size: 0 } as any))
            : Promise.resolve({ docs: [], size: 0 } as any)),
          (myCodesArr.length > 0
            ? getDocs(query(collection(db, "students"), where("teacherId", "in", myCodesArr))).catch(e => ({ docs: [], size: 0 } as any))
            : Promise.resolve({ docs: [], size: 0 } as any))
        ]);

        const uniqueStudentIds = new Set([
          ...legacySnap.docs.map((d: any) => d.id),
          ...unifiedSnap.docs.map((d: any) => d.id),
          ...legacyByCourseSnap.docs.map((d: any) => d.id),
          ...unifiedByCourseSnap.docs.map((d: any) => d.id),
          ...legacyByCodeSnap.docs.map((d: any) => d.id)
        ]);
        
        // Auto-migrate the legacy course records found
        for (const d of cSnap2.docs) {
           if (d.data().teacherId !== user.uid) {
                try {
                  await setDoc(doc(db, "courses", d.id), { teacherId: user.uid }, { merge: true });
                } catch (e) { console.warn("Failed to auto-migrate course record", e); }
           }
        }
        setCourses(courseDocs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));

        // We can't query submissions by teacherId directly unless we add it to the submission.
        // Instead, filter submissions by checking if assignmentId belongs to one of our assignments.
        const myAssignmentIds = new Set(assignmentsSnap.docs.map((d: any) => d.id));
        
        // Warning: Fetching all submissions might be slow if DB is large. 
        // Ideal: Submissions should have 'teacherId' or we query per assignment.
        // For now: Fetch all and filter client-side.
        const submissionsSnap = await getDocs(collection(db, "submissions"));

        const submissions: Submission[] = submissionsSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() } as Submission))
            .filter(s => s.assignmentId && myAssignmentIds.has(s.assignmentId));

        const completed = submissions.filter((s) => s.graded).length;
        const pending = submissions.filter((s) => !s.graded).length;

        setStats({
          totalAssignments: assignmentsSnap.size,
          totalStudents: uniqueStudentIds.size,
          completedSubmissions: completed,
          pendingSubmissions: pending,
        });

        // Recent assignments (filtered)
        const recentQuery = query(
          collection(db, "assignments"),
          where("teacherId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const recentSnap = await getDocs(recentQuery);
        setRecentAssignments(recentSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Pending grading (ungraded submissions from MY assignments)
        const pendingSubs = submissions.filter((s) => !s.graded).slice(0, 3);
        
        // Get assignment titles
        const assignmentsMap: Record<string, any> = {};
        assignmentsSnap.docs.forEach((doc: any) => {
          assignmentsMap[doc.id] = doc.data();
        });

        // Only include pending submissions whose assignmentId exists in assignmentsMap
        const pendingWithDetails = pendingSubs
          .map((sub) => {
            const assignmentId = sub.assignmentId;
            if (!assignmentId) return null;

            const assignment = assignmentsMap[assignmentId];
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
      }
    }

    fetchStats();
  }, [user]);

  const handleCreateCourse = async () => {
    if (!user || !newCourseName || !newCourseCode) return;
    setIsCreatingCourse(true);
    const code = newCourseCode.trim();
    try {
      // Check if code exists in courses
      const existing = await getDocs(query(collection(db, "courses"), where("code", "==", code)));
      if (!existing.empty) {
        alert("Class code already exists. Please choose another.");
        setIsCreatingCourse(false);
        return;
      }
      
      // Check if code overlaps with a KEY legacy teacher ID (other than own)
      // We do this to prevent students from joining the "Wrong" teacher if they use a legacy code
      // Note: If you use your OWN legacy code, that is allowed (it acts as a migration)
      if (code !== user.uid) {
         try {
             // We can't query teachers by ID easily without knowing it, but we can try to fetch it
             const teacherDoc = await getDocs(query(collection(db, "teachers"), where("__name__", "==", code)));
             if (!teacherDoc.empty) {
                 alert("This code is reserved by another teacher (Legacy ID). Please choose another.");
                 setIsCreatingCourse(false);
                 return;
             }
         } catch (e) { console.log("Error checking legacy overlap", e); }
      }

      await addDoc(collection(db, "courses"), {
        name: newCourseName,
        code: code,
        teacherId: user.uid,
        createdAt: new Date().toISOString()
      });

      setNewCourseName("");
      setNewCourseCode("");
      setDialogOpen(false); // Close dialog after creation
      // Refresh courses
      const coursesSnap = await getDocs(query(collection(db, "courses"), where("teacherId", "==", user.uid), orderBy("createdAt", "desc")));
      setCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course");
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await deleteDoc(doc(db, "courses", courseId));
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (error) {
       console.error("Error deleting course:", error);
       alert("Failed to delete course");
    }
  };

  const statCards = [
    {
      title: "Total Assignments",
      value: stats.totalAssignments,
      icon: FileText,
      description: "Active assignments",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      description: "Enrolled students",
    },
    {
      title: "Graded",
      value: stats.completedSubmissions,
      icon: CheckCircle,
      description: "Submissions graded",
    },
    {
      title: "Pending Review",
      value: stats.pendingSubmissions,
      icon: Clock,
      description: "Awaiting grading",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your class.</p>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to do</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button variant="outline" className="h-16 flex-col gap-1 hover:bg-primary/5 hover:border-primary/50 transition-all border-dashed cursor-pointer" asChild>
            <Link href="/teacher/create">
              <PlusCircle className="h-4 w-4 text-primary" />
              <span className="text-xs">Create Assignment</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-1 hover:bg-primary/5 hover:border-primary/50 transition-all border-dashed cursor-pointer" asChild>
            <Link href="/teacher/assignments">
              <List className="h-4 w-4 text-primary" />
              <span className="text-xs">All Assignments</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-1 hover:bg-primary/5 hover:border-primary/50 transition-all border-dashed cursor-pointer" asChild>
            <Link href="/teacher/uploads">
              <Upload className="h-4 w-4 text-primary" />
              <span className="text-xs">Upload PDF</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>Manage your class names and codes</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 cursor-pointer hover:bg-primary/90 transition-colors" >
                <PlusCircle className="h-4 w-4" />
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
                    onChange={(e) => setNewCourseCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  />
                  <p className="text-xs text-muted-foreground">This is the code students will use to join.</p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateCourse} disabled={isCreatingCourse || !newCourseName || !newCourseCode} className="cursor-pointer">
                  {isCreatingCourse ? "Creating..." : "Create Class"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.length === 0 ? (
               <div className="text-center py-6 text-muted-foreground">
                 <School className="mx-auto h-12 w-12 opacity-20 mb-2" />
                 <p>No classes created yet.</p>
                 <p className="text-sm">Create a class to get a code for your students.</p>
               </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-xl bg-card/50">
                    <div className="space-y-1">
                      <p className="font-semibold">{course.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="font-mono text-xs">{course.code}</Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 cursor-pointer hover:bg-accent/50 transition-colors" 
                          onClick={() => {
                            navigator.clipboard.writeText(course.code);
                            alert("Code copied!");
                          }}
                          title="Copy Code"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-4 w-4 cursor-pointer hover:bg-destructive/10 transition-colors" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>Your latest created assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAssignments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No assignments yet.</p>
            ) : (
              <div className="divide-y rounded-lg overflow-hidden border bg-muted/40">
                {recentAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors group"
                  >
                    <div className="flex flex-col">
                      <a
                        href={a.id ? `/teacher/assignment-view?id=${a.id}` : '#'}
                        className="font-medium text-primary group-hover:underline"
                      >
                        {a.title || "Untitled"}
                      </a>
                      <span className="text-xs text-muted-foreground italic">
                        Due: {a.dueDate ? new Date(a.dueDate.seconds ? a.dueDate.seconds * 1000 : a.dueDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-4">Recent</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Grading</CardTitle>
            <CardDescription>Submissions awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingGrading.length === 0 ? (
              <p className="text-muted-foreground text-sm">All caught up!</p>
            ) : (
              <div className="divide-y rounded-lg overflow-hidden border bg-muted/40">
                {pendingGrading.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors group"
                  >
                    <div className="flex flex-col">
                      <a
                        href={sub.assignmentId ? `/teacher/assignment-view?id=${sub.assignmentId}` : '#'}
                        className="font-medium text-primary group-hover:underline"
                      >
                        {sub.assignmentTitle || "Untitled"}
                      </a>
                      <span className="text-xs text-muted-foreground italic">
                        Needs grading
                      </span>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100 px-2 py-1 rounded-full ml-4">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}