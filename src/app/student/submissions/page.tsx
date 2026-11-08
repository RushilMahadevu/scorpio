"use client";

import { useEffect, useState } from "react";
import { collection, query, where, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkspaceHeader } from "@/components/ui/workspace";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  answers: any[];
  submittedAt: Date | null;
  graded: boolean;
  score: number | null;
  feedback?: string;
  status?: string;
}

export default function SubmissionsPage() {
  const { user, profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // 1. Listen for new submissions in real-time
    const q = query(collection(db, "submissions"), where("studentId", "==", user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const submissionsData: (Submission | null)[] = await Promise.all(
        snapshot.docs.map(async (submissionDoc) => {
          const data = submissionDoc.data();
          try {
            // Fetch Assignment Details (Cache these maybe? For now just fetch)
            const assignmentDoc = await getDoc(doc(db, "assignments", data.assignmentId));
            if (!assignmentDoc.exists()) return null;

            const assignData = assignmentDoc.data();
            
            // Filter logic
            if (profile?.courseId) {
                if (assignData.courseId !== profile.courseId) return null;
            } else if (profile?.teacherId && assignData.teacherId && profile.teacherId !== assignData.teacherId) {
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
            console.error("Error fetching assignment for submission:", e);
            return null;
          }
        })
      );

      const filteredSubmissions = submissionsData.filter((s): s is Submission => s !== null && s.status !== 'draft');
      // Sort by submittedAt descending
      filteredSubmissions.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateB - dateA;
      });
      setSubmissions(filteredSubmissions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-6">
      <WorkspaceHeader title="My Submissions" description="Check which assignments you’ve turned in.">
        <Button asChild variant="outline"><Link href="/student/grades">View grades</Link></Button>
      </WorkspaceHeader>

      <Card className="overflow-hidden py-0 shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <p role="status" className="p-6 text-sm text-muted-foreground">Loading submissions…</p>
          ) : submissions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Your submitted assignments will appear here.</p>
          ) : (
            <Table aria-label="Submission history">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="px-4">Assignment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="min-w-32 whitespace-normal px-4 py-3 font-medium">
                      <span className="break-words">{submission.assignmentTitle}</span>
                      <p className="text-xs font-normal text-muted-foreground">{submission.submittedAt?.toLocaleDateString() ?? "—"}</p>
                    </TableCell>
                    <TableCell>
                      {submission.graded ? (
                        <Badge variant="secondary">
                          Graded
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Awaiting grade
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {submission.graded && submission.score !== null
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
