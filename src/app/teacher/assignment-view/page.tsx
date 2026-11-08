"use client";
import { getTeacherAssignment } from "@/lib/authenticated-fetch";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ChevronRight } from "lucide-react";
import Link from "next/link";
import { downloadCSV } from "@/lib/utils";
import { TeacherPageHeader, TeacherSummary } from "@/components/teacher/workspace";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: any;
}

interface Submission {
  id: string;
  studentId: string;
  studentName?: string; // We might need to fetch this or store it in submission
  studentEmail?: string;
  submittedAt: any;
  answers: any;
  score?: number | null;
}

function AssignmentDetailsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const assignmentId = searchParams ? searchParams.get("id") ?? "" : "";
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!assignmentId || !user) return;

      try {
        const assignmentDoc = await getTeacherAssignment(assignmentId);
        if (assignmentDoc.exists()) {
            const data = assignmentDoc.data();
            if (data.teacherId && data.teacherId !== user.uid) {
                setLoading(false);
                return;
            }
          setAssignment({ id: assignmentDoc.id, ...data } as Assignment);
        } else {
            setLoading(false);
            return;
        }

        const q = query(collection(db, "submissions"), where("assignmentId", "==", assignmentId));
        const snapshot = await getDocs(q);
        
        const submissionsData = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          
          // Filter out draft submissions
          if (data.status === 'draft') return null;
          
          // Use studentName and studentEmail from submission document
          let studentName = data.studentName || "Unknown Student";
          let studentEmail = data.studentEmail || "";
          
          // Fallback to users collection if name is missing
          if (studentName === "Unknown Student" && data.studentId) {
            try {
              const userDoc = await getDoc(doc(db, "users", data.studentId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                studentName = userData.displayName || userData.name || "Unknown Student";
                studentEmail = userData.email || studentEmail;
              }
            } catch (error) {
              console.error(`Error fetching user ${data.studentId}:`, error);
            }
          }

          return {
            id: docSnapshot.id,
            ...data,
            studentName,
            studentEmail,
            submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
          };
        }));

        // Filter out null entries (draft submissions)
        setSubmissions(submissionsData.filter(s => s !== null) as Submission[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [assignmentId, user]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-bold">Assignment not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/teacher/assignments">Return to List</Link>
        </Button>
      </div>
    );
  }

  const scores = submissions.flatMap(({ score }) => typeof score === "number" ? [score] : []);
  const gradedCount = scores.length;
  const averageScore = gradedCount ? Math.round(scores.reduce((total, score) => total + score, 0) / gradedCount) : 0;

  const dueDate = new Date(assignment.dueDate?.toDate?.() || assignment.dueDate);

  return (
    <div className="space-y-6">
      <Link href="/teacher/assignments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Assignments
      </Link>

      <TeacherPageHeader title={assignment.title} description={assignment.description}>
        <Button
          variant="outline"
          disabled={submissions.length === 0}
          onClick={() => {
            const rows = submissions.map((submission) => ({
              submissionId: submission.id,
              studentId: submission.studentId,
              studentName: submission.studentName,
              studentEmail: submission.studentEmail,
              submittedAt: submission.submittedAt?.toString?.() || String(submission.submittedAt),
              score: submission.score ?? "",
              graded: typeof submission.score === "number" ? "true" : "false",
            }));
            downloadCSV(`${assignment.title || "assignment"}-grades.csv`, rows);
          }}
        >
          <Download /> Export CSV
        </Button>
      </TeacherPageHeader>

      <TeacherSummary
        label="Assignment overview"
        items={[
          { label: "Submissions", value: submissions.length },
          { label: "Graded", value: gradedCount },
          { label: "Average score", value: gradedCount ? `${averageScore}%` : "—" },
          { label: "Due date", value: Number.isNaN(dueDate.getTime()) ? "—" : dueDate.toLocaleDateString() },
        ]}
      />

      <Card className="min-w-0 gap-0 py-0">
        <CardHeader className="px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold">Submissions</h2>
        </CardHeader>
        <CardContent className="border-t p-0">
          {submissions.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <Table aria-label="Assignment submissions">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="pl-4 sm:pl-5">Student</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right pr-4 sm:pr-5">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="max-w-64 whitespace-normal py-3 pl-4 sm:pl-5">
                      <p className="break-words font-medium">{submission.studentName}</p>
                      <p className="break-all text-xs text-muted-foreground">{submission.studentEmail}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{submission.submittedAt.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {submission.submittedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {typeof submission.score === "number" ? `${submission.score}%` : <span className="text-muted-foreground">Pending</span>}
                    </TableCell>
                    <TableCell className="text-right pr-4 sm:pr-5">
                      <Button asChild variant={typeof submission.score === "number" ? "ghost" : "outline"} size="sm">
                        <Link href={`/teacher/submission/grade?id=${submission.id}`}>
                          {typeof submission.score === "number" ? "Review" : "Grade"} <ChevronRight />
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

export default function AssignmentDetailsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <AssignmentDetailsContent />
    </Suspense>
  );
}