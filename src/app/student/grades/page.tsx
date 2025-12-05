"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  submittedAt: Date;
  score: number | null;
  graded: boolean;
}

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGrades() {
      if (!user) return;

      try {
        const q = query(collection(db, "submissions"), where("studentId", "==", user.uid));
        const snapshot = await getDocs(q);

        const submissionsData = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          
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
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGrades();
  }, [user]);

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
                    <TableCell>{submission.submittedAt.toLocaleDateString()}</TableCell>
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
                      <Link href={`/student/assignment-view?id=${submission.assignmentId}`}>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View
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
