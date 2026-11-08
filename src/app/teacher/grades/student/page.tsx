"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeacherPageHeader } from "@/components/teacher/workspace";
import { GradeExportButton } from "@/components/grade-export-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  submittedAt: Date | null;
  score: number | null;
  graded: boolean;
}

interface AssignmentOption {
  id: string;
  title: string;
}

export default function StudentDetailsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const studentId = searchParams ? searchParams.get('studentId') ?? "" : "";
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [studentName, setStudentName] = useState("Student");
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<AssignmentOption[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");

  useEffect(() => {
    if (!studentId || !user) {
      setLoading(false);
      return;
    }

    async function fetchStudentData() {
      try {
        // Fetch all assignments for filter dropdown (filtered by teacher)
        const assignmentsQuery = query(collection(db, "assignments"), where("teacherId", "==", user!.uid));
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        const assignmentOptions: AssignmentOption[] = assignmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || "Untitled Assignment",
        }));
        setAssignments(assignmentOptions);
        
        // Allowed assignments set for validation
        const allowedAssignmentIdsArr = Array.from(new Set(assignmentsSnapshot.docs.map(d => d.id)));
        const allowedAssignmentIdsSet = new Set(allowedAssignmentIdsArr);

        // Fetch submissions for this student belonging to the teacher's assignments
        let submissionsDocs: any[] = [];
        if (allowedAssignmentIdsArr.length > 0) {
            const chunks = [];
            for (let i = 0; i < allowedAssignmentIdsArr.length; i += 30) {
                chunks.push(allowedAssignmentIdsArr.slice(i, i + 30));
            }
            
            const results = await Promise.all(chunks.map(chunk => 
                getDocs(query(collection(db, "submissions"), where("studentId", "==", studentId), where("assignmentId", "in", chunk)))
            ));
            results.forEach(snap => submissionsDocs.push(...snap.docs));
        }

        const processedSubmissions = await Promise.all(submissionsDocs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          
          // Verify assignment ownership (redundant but safe)
          if (!allowedAssignmentIdsSet.has(data.assignmentId)) return null;

          // Try to get student name from first submission if not available elsewhere
          if (data.studentName) setStudentName(data.studentName);

          // Fetch assignment title
          let assignmentTitle = "Unknown Assignment";
          let assignmentExists = false;
          if (data.assignmentId) {
             const assignment = assignmentOptions.find(a => a.id === data.assignmentId);
             if (assignment) {
                 assignmentTitle = assignment.title;
                 assignmentExists = true;
             }
          }

          if (!assignmentExists) return null;
          if (data.status === 'draft') return null;

          return {
            id: docSnapshot.id,
            assignmentId: data.assignmentId,
            assignmentTitle,
            submittedAt: data.submittedAt?.toDate?.() || (data.submittedAt ? new Date(data.submittedAt) : null),
            score: data.score,
            graded: data.graded,
          };
        }));

        setSubmissions(processedSubmissions.filter((s): s is Submission => s !== null));

      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [studentId, user]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!studentId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/teacher/grades" aria-label="Back to grades">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Error</h1>
            <p className="text-muted-foreground">No student ID provided.</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter submissions by selected assignment
  const filteredSubmissions = selectedAssignment
    ? submissions.filter((s) => s.assignmentId === selectedAssignment)
    : submissions;

  return (
    <div className="space-y-6">
      <Link href="/teacher/grades" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Gradebook
      </Link>

      <TeacherPageHeader title={studentName} description="Submission history and grades.">
        <GradeExportButton
          data={submissions.map((submission) => ({
            studentName,
            studentEmail: "—",
            assignmentTitle: submission.assignmentTitle,
            score: submission.score || 0,
            totalPoints: 100,
            submittedAt: submission.submittedAt?.toLocaleDateString() || "N/A",
          }))}
          filename={`grades-${studentName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`}
        />
      </TeacherPageHeader>

      <Card className="min-w-0 gap-0 py-0">
        <CardHeader className="flex flex-wrap items-end justify-between gap-3 px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold">Submissions</h2>
          <div className="w-full space-y-1.5 sm:w-52">
            <label htmlFor="student-assignment" className="block text-xs font-medium text-muted-foreground">Assignment</label>
            <Select value={selectedAssignment || "all"} onValueChange={(value) => setSelectedAssignment(value === "all" ? "" : value)}>
              <SelectTrigger id="student-assignment" className="w-full cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                {assignments.map((assignment) => <SelectItem key={assignment.id} value={assignment.id}>{assignment.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="border-t p-0">
          {filteredSubmissions.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">No submissions match this filter.</p>
          ) : (
            <Table aria-label="Student submissions">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="pl-4 sm:pl-5">Assignment</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right pr-4 sm:pr-5">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="max-w-72 whitespace-normal py-3 pl-4 sm:pl-5">
                      <p className="break-words font-medium">{submission.assignmentTitle}</p>
                      <p className="text-xs text-muted-foreground">{submission.submittedAt ? `Submitted ${submission.submittedAt.toLocaleDateString()}` : "No submission date"}</p>
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {submission.graded ? (submission.score == null ? "—" : `${submission.score}%`) : <span className="text-muted-foreground">Pending</span>}
                    </TableCell>
                    <TableCell className="text-right pr-4 sm:pr-5">
                      <Button asChild variant={submission.graded ? "ghost" : "outline"} size="sm">
                        <Link href={`/teacher/submission/grade?id=${submission.id}`}>
                          {submission.graded ? "Review" : "Grade"} <ChevronRight />
                        </Link>
                      </Button>
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
