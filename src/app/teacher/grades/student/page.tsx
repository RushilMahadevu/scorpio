"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  submittedAt: Date;
  score: number | null;
  graded: boolean;
}

export default function StudentDetailsPage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [studentName, setStudentName] = useState("Student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    async function fetchStudentData() {
      try {
        // Fetch submissions
        const q = query(collection(db, "submissions"), where("studentId", "==", studentId));
        const snapshot = await getDocs(q);

        const submissionsData = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          
          // Try to get student name from first submission if not available elsewhere
          if (data.studentName) setStudentName(data.studentName);

          // Fetch assignment title
          let assignmentTitle = "Unknown Assignment";
          if (data.assignmentId) {
            const assignmentDoc = await getDoc(doc(db, "assignments", data.assignmentId));
            if (assignmentDoc.exists()) {
              assignmentTitle = assignmentDoc.data().title;
            }
          }

          return {
            id: docSnapshot.id,
            assignmentId: data.assignmentId,
            assignmentTitle,
            submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
            score: data.score,
            graded: data.graded,
          };
        }));

        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!studentId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/teacher/grades">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Error</h1>
            <p className="text-muted-foreground">No student ID provided.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/grades">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{studentName}</h1>
          <p className="text-muted-foreground">Submission History</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>All assignments submitted by this student.</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-muted-foreground">No submissions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Submitted Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.assignmentTitle}</TableCell>
                    <TableCell>{submission.submittedAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      {submission.graded ? (
                        <Badge className="bg-green-500">Graded</Badge>
                      ) : (
                        <Badge variant="secondary">Pending Grading</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.graded ? (
                        <span className="font-bold">{submission.score}%</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/teacher/submission/grade?id=${submission.id}`}>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          {submission.graded ? "View" : "Grade"}
                        </Button>
                      </Link>
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
