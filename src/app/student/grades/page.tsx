"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { WorkspaceHeader, WorkspaceSummary } from "@/components/ui/workspace";
import { MarkdownRenderer } from "@/components/markdown-renderer";
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
          } catch (e) {
            console.error("Could not fetch legacy student profile", e);
          }
        }

        if (studentTeacherId && !studentCourseId) {
          const codeMatch = await getDocs(
            query(collection(db, "courses"), where("code", "==", studentTeacherId.trim()))
          );
          if (!codeMatch.empty) {
            const courseDoc = codeMatch.docs[0];
            const courseData = courseDoc.data();
            studentCourseId = courseDoc.id;
            studentTeacherId = courseData.teacherId;
          }
        }

        const q = query(collection(db, "submissions"), where("studentId", "==", user.uid));
        const snapshot = await getDocs(q);

        const submissionsData: (Submission | null)[] = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();

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

            if (studentCourseId) {
              if (assignmentCourseId !== studentCourseId) return null;
            } else if (studentTeacherId && assignmentTeacherId && studentTeacherId !== assignmentTeacherId) {
              return null;
            }

            return {
              id: docSnapshot.id,
              assignmentId: data.assignmentId,
              assignmentTitle,
              submittedAt: data.submittedAt?.toDate?.() || (data.submittedAt ? new Date(data.submittedAt) : null),
              score: typeof data.score === "number" ? data.score : null,
              graded: data.graded,
              feedback: data.feedback,
              answers: data.answers,
              status: data.status || (data.graded ? "graded" : "submitted"),
            } satisfies Submission;
          })
        );

        const filteredSubmissions = submissionsData.filter(
          (s): s is Submission => s !== null && s.status !== "draft"
        );
        
        filteredSubmissions.sort((a, b) => {
          const dateA = a.submittedAt?.getTime() || 0;
          const dateB = b.submittedAt?.getTime() || 0;
          return dateB - dateA; // Sort newest first for the history list
        });

        setSubmissions(filteredSubmissions);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGrades();
  }, [user, profile]);

  const stats = useMemo(() => {
    const graded = submissions.filter((s) => s.graded && s.score !== null);
    const scores = graded.map((s) => s.score as number);
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    const total = submissions.length;
    const pending = submissions.filter((s) => !s.graded).length;

    return { average, highest, total, pending, hasScores: scores.length > 0 };
  }, [submissions]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader title="Grades" description="See your scores and review instructor feedback." />
      <WorkspaceSummary label="Grade summary" items={[
        { label: "Average", value: stats.hasScores ? `${stats.average.toFixed(1)}%` : "—" },
        { label: "Highest score", value: stats.hasScores ? `${stats.highest}%` : "—" },
        { label: "Graded", value: stats.total - stats.pending },
        { label: "Awaiting grade", value: stats.pending },
      ]} />

      <section aria-labelledby="grade-history" className="space-y-3">
        <h2 id="grade-history" className="text-lg font-semibold">Assignment results</h2>
        <Card className="overflow-hidden py-0 shadow-none">
          <CardContent className="p-0">
            {submissions.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Your scores will appear here after you submit coursework.</p>
            ) : (
              <Table aria-labelledby="grade-history">
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4">Assignment</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-right px-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="px-4 py-3">
                        <div className="whitespace-normal break-words font-medium">{submission.assignmentTitle}</div>
                        <div className="text-xs text-muted-foreground">
                          {submission.submittedAt ? submission.submittedAt.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        {submission.graded ? (
                          <Badge variant="secondary">
                            Graded
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className="font-medium tabular-nums">
                          {submission.graded && submission.score !== null ? `${submission.score}%` : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-4 py-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`View details for ${submission.assignmentTitle}`}
                            >
                              Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-3xl max-h-[90dvh] overflow-hidden flex flex-col gap-0 p-0">
                            <DialogHeader className="p-4 pr-12 sm:p-6 sm:pr-14 border-b border-border">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <DialogTitle className="break-words text-xl font-semibold tracking-tight">{submission.assignmentTitle}</DialogTitle>
                                  <DialogDescription className="text-sm font-medium mt-1">
                                    Submitted on {submission.submittedAt ? submission.submittedAt.toLocaleDateString(undefined, {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    }) : "N/A"}
                                  </DialogDescription>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-semibold tabular-nums">
                                    {submission.graded && submission.score !== null ? `${submission.score}%` : "—"}
                                  </div>
                                  <div className="text-xs text-muted-foreground">Score</div>
                                </div>
                              </div>
                            </DialogHeader>

                            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                              {/* Graded Copy Section */}
                              {submission.graded && Array.isArray(submission.answers) && submission.answers.length > 0 ? (
                                <div className="space-y-6">
                                  {submission.answers.map((q: any, idx: number) => (
                                    <div
                                      key={q.questionId || idx}
                                      className="space-y-4 border-b border-border pb-5 last:border-0 last:pb-0"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                          <p className="text-sm font-semibold">
                                            Question {idx + 1}
                                          </p>
                                        </div>
                                        <Badge variant="secondary">
                                          Points: {typeof q.score === "number" ? q.score : "-"}
                                        </Badge>
                                      </div>

                                      <div className="break-words text-sm font-medium">
                                        <MarkdownRenderer noProse>
                                          {q.questionText}
                                        </MarkdownRenderer>
                                      </div>

                                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                          <p className="text-xs font-medium text-muted-foreground">
                                            Your Answer
                                          </p>
                                          <div className="break-words rounded-lg bg-muted/40 p-3 text-sm">
                                            {q.answer?.trim() ? (
                                              <MarkdownRenderer noProse>
                                                {q.answer}
                                              </MarkdownRenderer>
                                            ) : <span className="italic opacity-50">No answer provided</span>}
                                          </div>
                                        </div>

                                        {q.feedback?.trim() && (
                                          <div className="space-y-2">
                                            <p className="text-xs font-medium text-muted-foreground">
                                              Feedback
                                            </p>
                                            <div className="break-words rounded-lg bg-muted/40 p-3 text-sm">
                                              <MarkdownRenderer noProse>
                                                {q.feedback}
                                              </MarkdownRenderer>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  {submission.graded ? "No question-by-question feedback is available." : "This submission is awaiting a grade."}
                                </p>
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
      </section>
    </div>
  );
}
