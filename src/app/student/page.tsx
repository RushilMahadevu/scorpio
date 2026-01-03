"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, Bot, School, LogOut } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
  });
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [classCode, setClassCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        // Fetch student profile
        const studentDoc = await getDoc(doc(db, "students", user.uid));
        if (studentDoc.exists()) {
          const data = studentDoc.data();
          setTeacherId(data.teacherId || null);
          
          if (data.teacherId) {
            const teacherDoc = await getDoc(doc(db, "teachers", data.teacherId));
            if (teacherDoc.exists()) {
              setTeacherName(teacherDoc.data().name);
            }
          }
        }

        const assignmentsSnap = await getDocs(collection(db, "assignments"));
        const submissionsSnap = await getDocs(
          query(collection(db, "submissions"), where("studentId", "==", user.uid))
        );

        const totalAssignments = assignmentsSnap.size;
        const completedAssignments = submissionsSnap.docs.filter(doc => doc.data().status !== 'draft').length;

        setStats({
          totalAssignments,
          completedAssignments,
          pendingAssignments: totalAssignments - completedAssignments,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [user]);

  const handleJoinClass = async () => {
    if (!user || !classCode) return;
    setJoining(true);
    try {
      await updateDoc(doc(db, "students", user.uid), {
        teacherId: classCode.trim()
      });
      setTeacherId(classCode.trim());
      
      // Fetch teacher name for the new class
      try {
        const teacherDoc = await getDoc(doc(db, "teachers", classCode.trim()));
        if (teacherDoc.exists()) {
          setTeacherName(teacherDoc.data().name);
        }
      } catch (err) {
        console.error("Error fetching teacher details:", err);
        // Don't fail the whole join process if just the name fetch fails
      }
      
      alert("Joined class successfully!");
    } catch (error: any) {
      console.error("Error joining class:", error);
      alert(`Failed to join class: ${error.message}`);
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveClass = async () => {
    if (!user || !confirm("Are you sure you want to leave this class?")) return;
    setLeaving(true);
    try {
      await updateDoc(doc(db, "students", user.uid), {
        teacherId: null
      });
      setTeacherId(null);
      setTeacherName(null);
      setClassCode("");
    } catch (error) {
      console.error("Error leaving class:", error);
      alert("Failed to leave class");
    } finally {
      setLeaving(false);
    }
  };

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Scorpio - Powering Physics at Sage Ridge</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
        {!teacherId ? (
          <Card className="md:col-span-2 border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <School className="h-5 w-5" />
                Join a Class
              </CardTitle>
              <CardDescription>You are not enrolled in a class yet. Enter your teacher's code below.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Input 
                placeholder="Enter Class Code" 
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleJoinClass} disabled={joining}>
                {joining ? "Joining..." : "Join Class"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="md:col-span-2 border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <School className="h-5 w-5" />
                  My Class
                </CardTitle>
                <CardDescription>You are enrolled in {teacherName ? `${teacherName}'s` : "a"} class.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLeaveClass} disabled={leaving} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4 mr-2" />
                {leaving ? "Leaving..." : "Leave Class"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Class Code:</span>
                <code className="bg-muted px-2 py-1 rounded">{teacherId}</code>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your learning</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              <Link href="/student/assignments">View Assignments</Link>
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              <Link href="/student/tutor">Ask AI Tutor</Link>
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              <Link href="/student/submissions">My Submissions</Link>
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Physics Tutor
            </CardTitle>
            <CardDescription>Get help with physics concepts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Need help understanding a concept or solving a problem? Our AI tutor is here to help!
            </p>
            <Link href="/student/tutor">
              <Badge className="cursor-pointer">Start Learning →</Badge>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}