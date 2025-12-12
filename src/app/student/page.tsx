"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc, updateDoc, orderBy, limit } from "firebase/firestore";
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
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [currentQuote, setCurrentQuote] = useState(0);

  const motivationalQuotes = [
    "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
    "The only way to learn mathematics is to do mathematics. – Paul Halmos",
    "In physics, you don't have to go around making trouble for yourself—nature does it for you. – Frank Wilczek",
    "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible. – Richard Feynman",
    "Physics is really figuring out how to discover new things that are counterintuitive, like quantum mechanics. – Elon Musk",
    "The important thing is not to stop questioning. Curiosity has its own reason for existing. – Albert Einstein",
    "An expert is a person who has made all the mistakes that can be made in a very narrow field. – Niels Bohr",
    "The scientist does not study nature because it is useful; he studies it because he delights in it. – Henri Poincaré"
  ];

  useEffect(() => {
    // Change quote every 10 seconds
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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

        // Assignments and submissions
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

        // Upcoming assignments (next 3 by dueDate)
        const upcomingQuery = query(
          collection(db, "assignments"),
          orderBy("dueDate", "asc"),
          limit(3)
        );
        const upcomingSnap = await getDocs(upcomingQuery);
        setUpcomingAssignments(upcomingSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
      
      try {
        const teacherDoc = await getDoc(doc(db, "teachers", classCode.trim()));
        if (teacherDoc.exists()) {
          setTeacherName(teacherDoc.data().name);
        }
      } catch (err) {
        console.error("Error fetching teacher details:", err);
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
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Scorpio - Powering Physics at Sage Ridge</p>
      </div>

      {/* Class Enrollment Status */}
      {!teacherId ? (
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive text-base">
              <School className="h-4 w-4" />
              Join a Class
            </CardTitle>
            <CardDescription className="text-xs">Enter your teacher's code to get started.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input 
              placeholder="Class Code" 
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="max-w-[200px] h-9"
            />
            <Button onClick={handleJoinClass} disabled={joining} size="sm">
              {joining ? "Joining..." : "Join"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-primary text-base">
                <School className="h-4 w-4" />
                {teacherName ? `${teacherName}'s Class` : "Enrolled"}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Code: <code className="bg-background px-1.5 py-0.5 rounded text-xs">{teacherId}</code>
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLeaveClass} 
              disabled={leaving} 
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
            >
              <LogOut className="h-3 w-3 mr-1" />
              {leaving ? "Leaving..." : "Leave"}
            </Button>
          </CardHeader>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-3 md:grid-cols-3">
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

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Assignments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upcoming Assignments</CardTitle>
            <CardDescription className="text-xs">Next assignments due</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAssignments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming assignments.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingAssignments.map((a) => (
                  <li key={a.id} className="flex justify-between items-start p-2 rounded-md border text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{a.title || "Untitled"}</span>
                      <span className="text-xs text-muted-foreground">
                        Due: {a.dueDate ? new Date(a.dueDate.seconds ? a.dueDate.seconds * 1000 : a.dueDate).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* AI Tutor Widget - Simple */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-4 w-4" />
              AI Physics Tutor
            </CardTitle>
            <CardDescription className="text-xs">Get help with physics concepts 24/7</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Stuck on a problem? Need help understanding a concept? Get instant, personalized explanations from our AI tutor.
            </p>
            <Link href="/student/tutor">
              <Button size="sm" className="w-full">Start Learning →</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Navigate to key sections</CardDescription>
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

        {/* Motivational Tip */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Daily Motivation</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground">
              {motivationalQuotes[currentQuote]}
            </blockquote>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}