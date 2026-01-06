"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Users, CheckCircle, Clock, PlusCircle, List, Upload, GraduationCap } from "lucide-react";
import Link from "next/link";

interface Submission {
  id: string;
  graded?: boolean;
  assignmentId?: string;
  assignmentTitle?: string;
}

type PendingSubmission = Submission & { assignmentTitle: string };

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
  const [currentTip, setCurrentTip] = useState(0);

  const teachingTips = [
    "Provide timely feedback to help students learn from their mistakes. – Educational Research",
    "Clear learning objectives help students understand what's expected of them. – Instructional Design",
    "Regular formative assessments can identify learning gaps early. – Assessment Theory",
    "Breaking complex problems into smaller steps improves student understanding. – Cognitive Science",
    "Encourage students to explain their reasoning to deepen comprehension. – Physics Education Research",
    "Real-world examples make abstract physics concepts more relatable. – Pedagogy Best Practices"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % teachingTips.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const assignmentsSnap = await getDocs(query(collection(db, "assignments"), where("teacherId", "==", user.uid)));
        const studentsSnap = await getDocs(
          query(collection(db, "students"), where("teacherId", "==", user.uid))
        );
        
        // We can't query submissions by teacherId directly unless we add it to the submission.
        // Instead, filter submissions by checking if assignmentId belongs to one of our assignments.
        const myAssignmentIds = new Set(assignmentsSnap.docs.map(d => d.id));
        
        // Warning: Fetching all submissions might be slow if DB is large. 
        // Ideal: Submissions should have 'teacherId' or we query per assignment.
        // For now: Fetch all and filter client-side.
        const submissionsSnap = await getDocs(collection(db, "submissions"));

        const submissions: Submission[] = submissionsSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter(s => s.assignmentId && myAssignmentIds.has(s.assignmentId));

        const completed = submissions.filter((s) => s.graded).length;
        const pending = submissions.filter((s) => !s.graded).length;

        setStats({
          totalAssignments: assignmentsSnap.size,
          totalStudents: studentsSnap.size,
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
        assignmentsSnap.docs.forEach((doc) => {
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

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to do</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" className="h-16 flex-col gap-1 hover:bg-primary/5 hover:border-primary/50 transition-all border-dashed" asChild>
              <Link href="/teacher/create">
                <PlusCircle className="h-4 w-4 text-primary" />
                <span className="text-xs">Create Assignment</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1 hover:bg-primary/5 hover:border-primary/50 transition-all border-dashed" asChild>
              <Link href="/teacher/assignments">
                <List className="h-4 w-4 text-primary" />
                <span className="text-xs">All Assignments</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1 hover:bg-primary/5 hover:border-primary/50 transition-all border-dashed" asChild>
              <Link href="/teacher/uploads">
                <Upload className="h-4 w-4 text-primary" />
                <span className="text-xs">Upload PDF</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              Class Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4">
            <div 
              className="text-xl font-mono font-bold tracking-tight text-foreground bg-muted/50 px-4 py-2 rounded-lg border border-border shadow-sm select-all cursor-pointer hover:bg-muted transition-all w-full text-center truncate"
              onClick={() => {
                navigator.clipboard.writeText(user?.uid || "");
                alert("Code copied!");
              }}
              title="Click to copy"
            >
              {user?.uid}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground uppercase tracking-wider">Share with your students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teaching Tip</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[80px]">
            <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground">
              {teachingTips[currentTip]}
            </blockquote>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}