"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, FileCheck } from "lucide-react";

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  answers: any[];
  submittedAt: Date | null;
  graded: boolean;
  score?: number;
  feedback?: string;
  status?: string;
}

export default function SubmissionsPage() {
  const { user, profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      if (!user) return;
      try {
        // Get Student's Teacher ID and Course ID (Unified first)
        let studentTeacherId = profile?.teacherId;
        let studentCourseId = profile?.courseId;

        if (!studentTeacherId || !studentCourseId) {
          try {
            const studentDoc = await getDoc(doc(db, "students", user.uid));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              studentTeacherId = studentTeacherId || studentData.teacherId;
              studentCourseId = studentCourseId || studentData.courseId;
            }
          } catch (e) { console.error("Could not fetch legacy student profile", e); }
        }

        // --- LEGACY RESOLUTION START ---
        if (studentTeacherId && !studentCourseId) {
           const codeMatch = await getDocs(query(collection(db, "courses"), where("code", "==", studentTeacherId.trim())));
           if (!codeMatch.empty) {
              const courseDoc = codeMatch.docs[0];
              const courseData = courseDoc.data();
              studentCourseId = courseDoc.id;
              studentTeacherId = courseData.teacherId;
           }
        }
        // --- LEGACY RESOLUTION END ---

        const submissionsSnap = await getDocs(
          query(collection(db, "submissions"), where("studentId", "==", user.uid))
        );

        const submissionsData: (Submission | null)[] = await Promise.all(
          submissionsSnap.docs.map(async (submissionDoc) => {
            const data = submissionDoc.data();
            try {
              const assignmentDoc = await getDoc(doc(db, "assignments", data.assignmentId));
              if (!assignmentDoc.exists()) {
                return null; // Filter out if assignment is deleted
              }

              const assignData = assignmentDoc.data();
              // Filter logic
              if (studentCourseId) {
                  // Strict course filtering
                  if (assignData.courseId !== studentCourseId) return null;
              } else if (studentTeacherId && assignData.teacherId && studentTeacherId !== assignData.teacherId) {
                 // Fallback teacher filtering
                 return null;
              }

              return {
                id: submissionDoc.id,
                assignmentId: data.assignmentId,
                assignmentTitle: assignData.title,
                answers: data.answers || [],
                submittedAt: data.submittedAt?.toDate?.() || (data.submittedAt ? new Date(data.submittedAt) : null),
                graded: data.graded || false,
                score: data.score ?? null,
                feedback: data.feedback ?? "",
                status: data.status || (data.graded ? 'graded' : 'submitted'),
              } satisfies Submission;
            } catch (e) {
              console.error("Error fetching assignment:", e);
              return null;
            }
          })
        );

        const filteredSubmissions = submissionsData.filter((s): s is Submission => s !== null && s.status !== 'draft');
        setSubmissions(filteredSubmissions);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, [user, profile]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Submissions</h1>
        <p className="text-muted-foreground">View your submitted assignments and grades</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Submission History
          </CardTitle>
          <CardDescription>{submissions.length} submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : submissions.length === 0 ? (
            <p className="text-muted-foreground">No submissions yet. Complete an assignment to see it here!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.assignmentTitle}</TableCell>
                    <TableCell>
                        {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : "Draft"}
                    </TableCell>
                    <TableCell>
                      {submission.status === 'draft' ? (
                        <Badge variant="outline">Draft</Badge>
                      ) : submission.graded ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Graded
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.graded && submission.score !== undefined
                        ? `${submission.score}%`
                        : "-"}
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
