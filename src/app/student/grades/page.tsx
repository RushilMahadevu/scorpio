"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  submittedAt: Date | null;
  score: number | null;
  graded: boolean;
  feedback?: string;
  answers?: any;
  status?: string;
}

export default function StudentGradesPage() {
  const { user, profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrades() {
      if (!user) return;

      try {
        // Get Student's Teacher ID and Course ID from profile or legacy
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

        const q = query(collection(db, "submissions"), where("studentId", "==", user.uid));
        const snapshot = await getDocs(q);

        const submissionsData: (Submission | null)[] = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();

          // Fetch assignment
          let assignmentTitle = "Unknown Assignment";
          let assignmentExists = false;
          let assignmentTeacherId = null;
          let assignmentCourseId = null;

          if (data.assignmentId) {
            const assignmentDoc = await getDoc(doc(db, "assignments", data.assignmentId));
            if (assignmentDoc.exists()) {
              const assignData = assignmentDoc.data();
              assignmentTitle = assignData.title;
              assignmentTeacherId = assignData.teacherId;
              assignmentCourseId = assignData.courseId;
              assignmentExists = true;
            }
          }

          if (!assignmentExists) return null;
          
          // Strict Filtering:
          // 1. If student is in a course, only show assignments from that course
          if (studentCourseId) {
            if (assignmentCourseId !== studentCourseId) return null;
          } 
          // 2. Legacy fallback: if student has teacher but no course, filter by teacher
          else if (studentTeacherId && assignmentTeacherId && studentTeacherId !== assignmentTeacherId) {
             return null;
          }

          return {
            id: docSnapshot.id,
            assignmentId: data.assignmentId,
            assignmentTitle,
            submittedAt: data.submittedAt?.toDate?.() || (data.submittedAt ? new Date(data.submittedAt) : null),
            score: data.score,
            graded: data.graded,
            feedback: data.feedback,
            answers: data.answers,
            status: data.status || (data.graded ? 'graded' : 'submitted'),
          } satisfies Submission;
        }));

        const filteredSubmissions = submissionsData.filter((s): s is Submission => s !== null && s.status !== 'draft');
        setSubmissions(filteredSubmissions);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGrades();
  }, [user, profile]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Grades</h1>
        <p className="text-muted-foreground">View your assignment scores and feedback.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment History</CardTitle>
          <CardDescription>All your submitted assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-muted-foreground">No submissions yet.</p>
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
                    <TableCell>
                      {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      {submission.graded ? (
                        <Badge className="bg-green-500">Graded</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="cursor-pointer hover:text-primary">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{submission.assignmentTitle}</DialogTitle>
                            <DialogDescription>
                              Submitted on {submission.submittedAt ? submission.submittedAt.toLocaleDateString() : "N/A"}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                              <span className="font-medium">Score</span>
                              <Badge variant={submission.graded ? "default" : "secondary"}>
                                {submission.graded ? `${submission.score}%` : "Pending"}
                              </Badge>
                            </div>
                            {/* Graded Copy Section */}
                            {submission.graded && Array.isArray(submission.answers) && submission.answers.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-3">Graded Copy</h4>

                                <div
                                  className="space-y-6 max-h-[600px] overflow-y-auto pr-6 pl-6 py-4 bg-muted/40 rounded-2xl w-full max-w-4xl mx-auto"
                                  style={{ minWidth: 400 }}
                                >
                                  {submission.answers.map((q: any, idx: number) => (
                                    <div
                                      key={q.questionId || idx}
                                      className="border rounded-xl p-6 bg-card space-y-4 shadow-sm"
                                    >
                                      <div className="flex items-start justify-between">
                                        <p className="font-semibold text-base">
                                          Q{idx + 1}
                                        </p>
                                        <Badge variant={typeof q.score === "number" ? "default" : "secondary"}>
                                          {typeof q.score === "number" ? q.score : "-"}
                                        </Badge>
                                      </div>

                                      <p className="text-base text-muted-foreground">
                                        {q.questionText}
                                      </p>

                                      <div className="pt-3 border-t">
                                        <p className="font-medium text-base mb-1">Your Answer</p>
                                        <p className="text-base text-muted-foreground">
                                          {q.answer?.trim() ? q.answer : <span className="italic">No answer</span>}
                                        </p>
                                      </div>

                                      {q.feedback?.trim() && (
                                        <div className="pt-3 border-t">
                                          <p className="font-medium text-base mb-1">Feedback</p>
                                          <p className="text-base text-muted-foreground">{q.feedback}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
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
