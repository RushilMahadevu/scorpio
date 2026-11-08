"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db, cleanupStudentData } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TeacherPageHeader } from "@/components/teacher/workspace";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, BarChart3, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { GradeExportButton } from "@/components/grade-export-button";
import { GradeDistributionChart } from "@/components/admin/grade-distribution-chart";

interface Student {
  id: string;
  name: string;
  email: string;
  submissionCount: number;
  averageScore: number;
  gradedCount: number;
}

export default function TeacherGradesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<{id: string, name: string, code: string}[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<{id: string, title: string, courseId?: string}[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("all");
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);


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
        } finally {
            setAssignmentsLoaded(true);
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

        if (!assignmentsLoaded) {
            return;
        }

        if (filteredAssignmentIds.length === 0) {
            // No assignments for this teacher or filter combination
            setStudents([]);
            setLoading(false);
            return;
        }

        // 2. Query relevant submissions
        let submissionsDocs: any[] = [];
        if (selectedAssignmentId !== "all") {
            const snap = await getDocs(query(collection(db, "submissions"), where("assignmentId", "==", selectedAssignmentId)));
            submissionsDocs = snap.docs;
        } else {
            // CHUNKED FETCHING: Only fetch submissions for teacher's assignments
            // This is critical for security (prevent leaking all submissions) and performance.
            const chunks = [];
            for (let i = 0; i < filteredAssignmentIds.length; i += 30) {
                chunks.push(filteredAssignmentIds.slice(i, i + 30));
            }
            
            if (chunks.length > 0) {
               const results = await Promise.all(chunks.map(chunk => 
                  getDocs(query(collection(db, "submissions"), where("assignmentId", "in", chunk)))
               ));
               results.forEach(snap => submissionsDocs.push(...snap.docs));
            }
        }
        
        const studentMap = new Map<string, { name: string; email: string; scores: number[]; count: number }>();
        const validAssignmentIds = new Set(filteredAssignmentIds);


        // Fetch students in the course to cross-reference (if course selected)
        let courseStudentIds = new Set<string>();
        if (selectedCourseId !== "all") {
            const snap = await getDocs(query(collection(db, "users"), where("courseId", "==", selectedCourseId), where("role", "==", "student")));
            snap.docs.forEach(d => courseStudentIds.add(d.id));
        }

        submissionsDocs.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'draft') return; 
          
          // Verify assignment belongs to filter
          if (!validAssignmentIds.has(data.assignmentId)) return;

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
          if (data.graded && typeof data.score === "number" && Number.isFinite(data.score)) {
            student.scores.push(data.score);
          }
        });


        // 3. Populate names from student docs if missing
        const unknownStudents = Array.from(studentMap.entries())
          .filter(([_, data]) => data.name === "Unknown Student");
        
        await Promise.all(
          unknownStudents.map(async ([studentId, _]) => {
            try {
              // Try unified users
              const userDoc = await getDoc(doc(db, "users", studentId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const student = studentMap.get(studentId);
                if (student) {
                  student.name = userData.displayName || userData.name || "Unknown Student";
                  student.email = userData.email || student.email;
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
            averageScore,
            gradedCount: data.scores.length,
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
  }, [selectedAssignmentId, selectedCourseId, user, assignments, assignmentsLoaded]);


  const deleteStudent = async (studentId: string) => {
    try {
      // 1. Cleanup Storage and Submissions
      await cleanupStudentData(studentId, selectedCourseId === "all" ? undefined : selectedCourseId);
      
      setStudents(students.filter((s) => s.id !== studentId));
      toast.success("Student records removed.");
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error(`Failed to delete student: ${error.message}`);
    }
  };

  const selectedAssignmentTitle = assignments.find((assignment) => assignment.id === selectedAssignmentId)?.title;
  const gradedStudents = students.filter((student) => student.gradedCount > 0);

  return (
    <div className="space-y-6">
      <TeacherPageHeader title="Gradebook" description="Review student scores and submission history.">
        <GradeExportButton
          data={loading ? [] : students.map((student) => ({
            studentName: student.name,
            studentEmail: student.email,
            assignmentTitle: selectedAssignmentTitle || "All Assignments Summary",
            score: student.averageScore,
            totalPoints: 100,
            submittedAt: new Date().toLocaleDateString(),
          }))}
          filename={`grades-${selectedCourseId}-${new Date().toISOString().split("T")[0]}.csv`}
        />
      </TeacherPageHeader>

      <Card className="min-w-0 gap-0 py-0">
        <CardHeader className="flex flex-wrap items-end justify-between gap-4 px-4 py-4 sm:px-5">
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
            <div className="min-w-0 space-y-1.5">
              <label htmlFor="gradebook-class" className="block text-xs font-medium text-muted-foreground">Class</label>
              <Select
                value={selectedCourseId}
                onValueChange={(value) => {
                  setSelectedCourseId(value);
                  setSelectedAssignmentId("all");
                }}
              >
                <SelectTrigger id="gradebook-class" className="w-full cursor-pointer sm:w-44">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-1.5">
              <label htmlFor="gradebook-assignment" className="block text-xs font-medium text-muted-foreground">Assignment</label>
              <Select value={selectedAssignmentId} onValueChange={setSelectedAssignmentId}>
                <SelectTrigger id="gradebook-assignment" className="w-full cursor-pointer sm:w-52">
                  <SelectValue placeholder="All Assignments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignments</SelectItem>
                  {assignments.filter((assignment) => selectedCourseId === "all" || assignment.courseId === selectedCourseId)
                    .map((assignment) => <SelectItem key={assignment.id} value={assignment.id}>{assignment.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={showDistribution}
            aria-controls="grade-distribution"
            onClick={() => setShowDistribution((open) => !open)}
          >
            <BarChart3 />
            {showDistribution ? "Hide distribution" : "Grade distribution"}
          </Button>
        </CardHeader>
        <div className="border-t" id="grade-distribution" hidden={!showDistribution}>
          {showDistribution && (
            <GradeDistributionChart
              submissions={loading ? [] : gradedStudents.map((student) => ({ score: student.averageScore }))}
              title={selectedAssignmentTitle || "Grade distribution"}
              description="Students grouped by their average score"
            />
          )}
        </div>
        <CardContent className="border-t p-0">
          {loading || students.length === 0 ? (
            <p role="status" className="px-5 py-10 text-center text-sm text-muted-foreground">
              {loading ? "Loading grades…" : "No submissions match these filters."}
            </p>
          ) : (
            <Table aria-label="Student grades">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="pl-4 sm:pl-5">Student</TableHead>
                  <TableHead className="text-right">Submissions</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="max-w-64 whitespace-normal py-3 pl-4 sm:pl-5">
                      <Link
                        href={`/teacher/grades/student?studentId=${student.id}`}
                        className="inline-flex items-baseline gap-1.5 break-words font-medium hover:text-primary hover:underline"
                      >
                        {student.name} <ArrowUpRight aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
                      </Link>
                      {student.email && <p className="break-all text-xs text-muted-foreground">{student.email}</p>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{student.submissionCount}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {student.gradedCount ? `${student.averageScore}%` : <span aria-label="Awaiting a grade">—</span>}
                    </TableCell>
                    <TableCell className="pr-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${student.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem variant="destructive" onSelect={() => setStudentToDelete(student.id)}>
                            <Trash2 /> Remove records
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!studentToDelete}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
        title="Remove Student Records"
        description="Are you sure you want to remove this student from the gradebook? This will delete all their submissions and uploaded storage files to save space."
        onConfirm={() => studentToDelete && deleteStudent(studentToDelete)}
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
}
