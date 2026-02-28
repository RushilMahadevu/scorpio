"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, writeBatch, doc, getDoc } from "firebase/firestore";
import { db, cleanupStudentData } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, ChevronRight, Trash2, Download } from "lucide-react";
import Link from "next/link";
import { GradeExportButton } from "@/components/grade-export-button";

interface Student {
  id: string;
  name: string;
  email: string;
  submissionCount: number;
  averageScore: number;
}

export default function TeacherGradesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<{id: string, name: string, code: string}[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<{id: string, title: string, courseId?: string}[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("all");

  useEffect(() => {
    async function fetchCourses() {
        if (!user) return;
        try {
            const snap = await getDocs(query(collection(db, "courses"), where("teacherId", "==", user.uid)));
            const coursesData = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
            setCourses(coursesData);
            
            // If there's at least one course, select the first one by default 
            // instead of "All Classes" to satisfy "per class" requirement better
            if (coursesData.length > 0) {
                setSelectedCourseId(coursesData[0].id);
            }
        } catch (e) {
            console.error("Error fetching courses", e);
        }
    }
    fetchCourses();
  }, [user]);

  useEffect(() => {
    async function fetchAssignments() {
        if (!user) return;
        try {
            const snap = await getDocs(query(collection(db, "assignments"), where("teacherId", "==", user.uid)));
            setAssignments(snap.docs.map(d => ({ 
                id: d.id, 
                title: d.data().title,
                courseId: d.data().courseId
            })));
        } catch (e) {
            console.error("Error fetching assignments", e);
        }
    }
    fetchAssignments();
  }, [user]);

  useEffect(() => {
    async function fetchStudentsAndGrades() {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Get relevant assignments based on filters
        let filteredAssignmentIds = assignments.map(a => a.id);
        if (selectedCourseId !== "all") {
            filteredAssignmentIds = assignments
                .filter(a => a.courseId === selectedCourseId)
                .map(a => a.id);
        }
        
        if (selectedAssignmentId !== "all") {
            filteredAssignmentIds = [selectedAssignmentId];
        }

        if (filteredAssignmentIds.length === 0 && assignments.length > 0) {
            // No assignments for this course or filter combination
            setStudents([]);
            setLoading(false);
            return;
        }

        // 2. Query relevant submissions
        let q;
        if (selectedAssignmentId !== "all") {
            q = query(collection(db, "submissions"), where("assignmentId", "==", selectedAssignmentId));
        } else {
            // If we have a selected course, we could also filter by students in that course.
            // But let's stick to assignment-based filtering for now as it's more direct for "grades".
            q = collection(db, "submissions");
        }
        
        const submissionsSnap = await getDocs(q);
        const studentMap = new Map<string, { name: string; email: string; scores: number[]; count: number }>();
        const validAssignmentIds = new Set(filteredAssignmentIds);

        // Fetch students in the course to cross-reference (if course selected)
        let courseStudentIds = new Set<string>();
        if (selectedCourseId !== "all") {
            const [snap1, snap2] = await Promise.all([
                getDocs(query(collection(db, "students"), where("courseId", "==", selectedCourseId))),
                getDocs(query(collection(db, "users"), where("courseId", "==", selectedCourseId), where("role", "==", "student")))
            ]);
            snap1.docs.forEach(d => courseStudentIds.add(d.id));
            snap2.docs.forEach(d => courseStudentIds.add(d.id));
        }

        submissionsSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'draft') return; 
          
          // Verify assignment belongs to filter
          if (validAssignmentIds.size > 0 && !validAssignmentIds.has(data.assignmentId)) return;

          const studentId = data.studentId;
          
          // If course is selected, only show students in that course
          if (selectedCourseId !== "all" && !courseStudentIds.has(studentId)) return;

          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, { 
              name: data.studentName || "Unknown Student", 
              email: data.studentEmail || "",
              scores: [],
              count: 0
            });
          }

          const student = studentMap.get(studentId)!;
          student.count++;
          if (data.graded && data.score !== null) {
            student.scores.push(data.score);
          }
        });

        // 3. Populate names from student docs if missing
        const unknownStudents = Array.from(studentMap.entries())
          .filter(([_, data]) => data.name === "Unknown Student");
        
        await Promise.all(
          unknownStudents.map(async ([studentId, _]) => {
            try {
              // Try legacy students first
              const studentDoc = await getDoc(doc(db, "students", studentId));
              if (studentDoc.exists()) {
                const studentData = studentDoc.data();
                const student = studentMap.get(studentId);
                if (student) {
                  student.name = studentData.name || "Unknown Student";
                  student.email = studentData.email || student.email;
                }
              } else {
                // Try unified users second
                const userDoc = await getDoc(doc(db, "users", studentId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  const student = studentMap.get(studentId);
                  if (student) {
                    student.name = userData.displayName || userData.name || "Unknown Student";
                    student.email = userData.email || student.email;
                  }
                }
              }
            } catch (error) {
              console.error(`Error fetching student ${studentId}:`, error);
            }
          })
        );

        // Convert map to array
        const studentsArray: Student[] = Array.from(studentMap.entries()).map(([id, data]) => {
          const totalScore = data.scores.reduce((a, b) => a + b, 0);
          const averageScore = data.scores.length > 0 ? Math.round(totalScore / data.scores.length) : 0;
          
          return {
            id,
            name: data.name,
            email: data.email,
            submissionCount: data.count,
            averageScore
          };
        });

        setStudents(studentsArray);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentsAndGrades();
  }, [selectedAssignmentId, selectedCourseId, user, assignments]);

  const deleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the gradebook? This will delete all their submissions and uploaded storage files to save space.")) return;
    try {
      // 1. Cleanup Storage and Submissions
      await cleanupStudentData(studentId, selectedCourseId === "all" ? undefined : selectedCourseId);
      
      setStudents(students.filter((s) => s.id !== studentId));
    } catch (error: any) {
      console.error("Error deleting student:", error);
      alert(`Failed to delete student: ${error.message}`);
    }
  };

  if (loading && assignments.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold">Gradebook</h1>
            <p className="text-muted-foreground">View student performance and submissions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-lg border">
            <GradeExportButton 
                data={students.map(s => ({
                    studentName: s.name,
                    studentEmail: s.email,
                    assignmentTitle: selectedAssignmentId !== "all" 
                        ? assignments.find(a => a.id === selectedAssignmentId)?.title || "Selected Assignment" 
                        : "All Assignments Summary",
                    score: s.averageScore,
                    totalPoints: 100, // Normalized for now
                    submittedAt: new Date().toLocaleDateString()
                }))}
                filename={`grades-${selectedCourseId}-${new Date().toISOString().split('T')[0]}.csv`}
            />
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Class</label>
                <Select
                    value={selectedCourseId}
                    onValueChange={(value) => {
                        setSelectedCourseId(value);
                        setSelectedAssignmentId("all");
                    }}
                >
                    <SelectTrigger className="w-[180px] cursor-pointer bg-background">
                        <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="cursor-pointer">All Classes</SelectItem>
                        {courses.map(c => (
                            <SelectItem key={c.id} value={c.id} className="cursor-pointer">{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Assignment</label>
                <Select
                    value={selectedAssignmentId}
                    onValueChange={setSelectedAssignmentId}
                >
                    <SelectTrigger className="w-[200px] cursor-pointer bg-background">
                        <SelectValue placeholder="All Assignments" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="cursor-pointer">All Assignments</SelectItem>
                        {assignments
                            .filter(a => selectedCourseId === "all" || a.courseId === selectedCourseId)
                            .map(a => (
                                <SelectItem key={a.id} value={a.id} className="cursor-pointer">{a.title}</SelectItem>
                            ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Select a student to view detailed grades.</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground">No students found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Average Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.submissionCount}</TableCell>
                    <TableCell>{student.averageScore}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/teacher/grades/student?studentId=${student.id}`}>
                          <Button variant="ghost" size="sm" className="cursor-pointer">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => deleteStudent(student.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
