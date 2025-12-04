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
  assignmentTitle?: string;
  answers: any[];
  submittedAt: Date;
  graded: boolean;
  score?: number;
  feedback?: string;
}

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      if (!user) return;
      try {
        const submissionsSnap = await getDocs(
          query(collection(db, "submissions"), where("studentId", "==", user.uid))
        );

        const submissionsData = await Promise.all(
          submissionsSnap.docs.map(async (submissionDoc) => {
            const data = submissionDoc.data();
            let assignmentTitle = "Unknown Assignment";
            
            try {
              const assignmentDoc = await getDoc(doc(db, "assignments", data.assignmentId));
              if (assignmentDoc.exists()) {
                assignmentTitle = assignmentDoc.data().title;
              }
            } catch (e) {
              console.error("Error fetching assignment:", e);
            }

            return {
              id: submissionDoc.id,
              assignmentId: data.assignmentId,
              assignmentTitle,
              answers: data.answers || [],
              submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
              graded: data.graded || false,
              score: data.score,
              feedback: data.feedback,
            };
          })
        );

        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, [user]);

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
                    <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {submission.graded ? (
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
