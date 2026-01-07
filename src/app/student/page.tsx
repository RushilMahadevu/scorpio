"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, Bot, School, LogOut, Library, FileCheck } from "lucide-react";
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
        const studentDoc = await getDoc(doc(db, "students", user.uid));
        if (studentDoc.exists()) {
          const data = studentDoc.data();
          setTeacherId(data.teacherId || null);
          setCourseId(data.courseId || null);
          
          if (data.courseId) {
             try {
                const courseDoc = await getDoc(doc(db, "courses", data.courseId));
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
  }, [user]);

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

        // Only fetch assignments if student is enrolled in a course
        if (courseId) {
          const assignmentsSnap = await getDocs(
            query(collection(db, "assignments"), where("courseId", "==", courseId))
          );
          totalAssignments = assignmentsSnap.size;
          assignmentsSnap.docs.forEach(doc => currentAssignmentIds.add(doc.id));
        } else {
           // Enforce strict mode: if no course ID, no assignments shown. 
           // Users on legacy must rejoin a class.
        }

        const submissionsSnap = await getDocs(
          query(collection(db, "submissions"), where("studentId", "==", user.uid))
        );

        // Only count submissions for assignments that belong to the current class
        const completedAssignments = submissionsSnap.docs.filter(doc => {
            const data = doc.data();
            return data.status !== 'draft' && currentAssignmentIds.has(data.assignmentId);
        }).length;

        setStats({
          totalAssignments,
          completedAssignments,
          pendingAssignments: Math.max(0, totalAssignments - completedAssignments),
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
      // Check if code matches a course
      const coursesSnap = await getDocs(query(collection(db, "courses"), where("code", "==", classCode.trim())));
      
      let newTeacherId = "";
      let newCourseId = "";
      let newCourseName = "";
      let newCourseCode = "";

      if (!coursesSnap.empty) {
        const courseDoc = coursesSnap.docs[0];
        const courseData = courseDoc.data();
        newTeacherId = courseData.teacherId;
        newCourseId = courseDoc.id;
        newCourseName = courseData.name;
        newCourseCode = courseData.code;
      } else {
        throw new Error("Invalid class code.");
      }

      await updateDoc(doc(db, "students", user.uid), {
        teacherId: newTeacherId,
        courseId: newCourseId
      });
      
      setTeacherId(newTeacherId);
      setCourseId(newCourseId);
      setCourseName(newCourseName);
      setCourseCode(newCourseCode);
      
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
        teacherId: null,
        courseId: null,
      });
      setTeacherId(null);
      setTeacherName(null);
      setCourseId(null);
      setCourseName(null);
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
        {!courseId ? (
          <Card className="md:col-span-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                Enroll in a Class
              </CardTitle>
              <CardDescription>
                {teacherId ? 
                  "You have a legacy connection from a previous version. Please enter your new Class Code to access assignments and resources." : 
                  "Welcome! To get started, please enter the Class Code provided by your teacher."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <Input 
                  placeholder="Enter Class Code (e.g. PHYS101)" 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  className="font-mono"
                />
                <Button onClick={handleJoinClass} disabled={joining || !classCode} className="shrink-0 cursor-pointer hover:bg-primary/90 transition-colors">
                  {joining ? "Enrolling..." : "Enroll Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="md:col-span-2 border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <School className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl text-primary">
                    {courseName || "My Class"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{courseCode}</span>
                    <span>•</span>
                    <span>{teacherName || "Teacher"}</span>
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLeaveClass} disabled={leaving} className="text-destructive cursor-pointer hover:text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4 mr-2" />
                {leaving ? "Leaving..." : "Leave Class"}
              </Button>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Everything you need for {courseName || "your class"}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            <Link href="/student/assignments">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent py-2 px-3">
                <FileText className="h-3.5 w-3.5 mr-2" />
                Assignments
              </Badge>
            </Link>
            <Link href="/student/resources">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent py-2 px-3">
                <Library className="h-3.5 w-3.5 mr-2" />
                Course Resources
              </Badge>
            </Link>
            <Link href="/student/tutor">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent py-2 px-3">
                <Bot className="h-3.5 w-3.5 mr-2" />
                Ask AI Tutor
              </Badge>
            </Link>
            <Link href="/student/submissions">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent py-2 px-3">
                <FileCheck className="h-3.5 w-3.5 mr-2" />
                My Grades
              </Badge>
            </Link>
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