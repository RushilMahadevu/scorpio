"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Clock, Bot } from "lucide-react";
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

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        const assignmentsSnap = await getDocs(collection(db, "assignments"));
        const submissionsSnap = await getDocs(
          query(collection(db, "submissions"), where("studentId", "==", user.uid))
        );

        const totalAssignments = assignmentsSnap.size;
        const completedAssignments = submissionsSnap.size;

        setStats({
          totalAssignments,
          completedAssignments,
          pendingAssignments: totalAssignments - completedAssignments,
        });
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
