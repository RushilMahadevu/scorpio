"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { FileText, Users, CheckCircle, Clock } from "lucide-react";

interface Submission {
  id: string;
  graded?: boolean;
  assignmentId?: string;
  assignmentTitle?: string;
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
  const [pendingGrading, setPendingGrading] = useState<Submission[]>([]);
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
        const assignmentsSnap = await getDocs(collection(db, "assignments"));
        const studentsSnap = await getDocs(
          query(collection(db, "students"), where("teacherId", "==", user.uid))
        );
        const submissionsSnap = await getDocs(collection(db, "submissions"));

        const submissions: Submission[] = submissionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const completed = submissions.filter((s) => s.graded).length;
        const pending = submissions.filter((s) => !s.graded).length;

        setStats({
          totalAssignments: assignmentsSnap.size,
          totalStudents: studentsSnap.size,
          completedSubmissions: completed,
          pendingSubmissions: pending,
        });

        // Recent assignments
        const recentQuery = query(
          collection(db, "assignments"),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const recentSnap = await getDocs(recentQuery);
        setRecentAssignments(recentSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Pending grading (ungraded submissions)
        const pendingSubs = submissions.filter((s) => !s.graded).slice(0, 3);
        
        // Get assignment titles
        const assignmentsMap: Record<string, any> = {};
        assignmentsSnap.docs.forEach((doc) => {
          assignmentsMap[doc.id] = doc.data();
        });

        const pendingWithDetails = pendingSubs.map((sub) => ({
          ...sub,
          assignmentTitle: sub.assignmentId ? assignmentsMap[sub.assignmentId]?.title || "Assignment" : "Assignment"
        }));
        
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
              <ul className="space-y-2">
                {recentAssignments.map((a) => (
                  <li key={a.id} className="flex flex-col">
                    <span className="font-medium">{a.title || "Untitled"}</span>
                    <span className="text-xs text-muted-foreground">
                      Due: {a.dueDate ? new Date(a.dueDate.seconds ? a.dueDate.seconds * 1000 : a.dueDate).toLocaleDateString() : "N/A"}
                    </span>
                  </li>
                ))}
              </ul>
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
              <ul className="space-y-2">
                {pendingGrading.map((sub) => (
                  <li key={sub.id} className="flex flex-col">
                    <span className="font-medium">{sub.assignmentTitle}</span>
                    <span className="text-xs text-muted-foreground">Needs grading</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to do</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              <a href="/teacher/create">Create New Assignment</a>
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              <a href="/teacher/assignments">View All Assignments</a>
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              <a href="/teacher/uploads">Upload PDF</a>
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teaching Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground">
              {teachingTips[currentTip]}
            </blockquote>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}