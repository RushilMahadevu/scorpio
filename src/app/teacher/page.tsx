"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, CheckCircle, Clock } from "lucide-react";

interface Stats {
  totalAssignments: number;
  totalStudents: number;
  completedSubmissions: number;
  pendingSubmissions: number;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAssignments: 0,
    totalStudents: 0,
    completedSubmissions: 0,
    pendingSubmissions: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const assignmentsSnap = await getDocs(collection(db, "assignments"));
        const studentsSnap = await getDocs(collection(db, "students"));
        const submissionsSnap = await getDocs(collection(db, "submissions"));

        const submissions = submissionsSnap.docs.map((doc) => doc.data());
        const completed = submissions.filter((s) => s.graded).length;
        const pending = submissions.filter((s) => !s.graded).length;

        setStats({
          totalAssignments: assignmentsSnap.size,
          totalStudents: studentsSnap.size,
          completedSubmissions: completed,
          pendingSubmissions: pending,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }

    fetchStats();
  }, []);

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
    </div>
  );
}
