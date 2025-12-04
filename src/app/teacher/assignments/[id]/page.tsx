"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

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
  score?: number;
}

export default function AssignmentDetailsPage() {
  const params = useParams();
  const assignmentId = params.id as string;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!assignmentId) return;

      try {
        // Fetch Assignment Details
        const assignmentDoc = await getDoc(doc(db, "assignments", assignmentId));
        if (assignmentDoc.exists()) {
          setAssignment({ id: assignmentDoc.id, ...assignmentDoc.data() } as Assignment);
        }

        // Fetch Submissions
        const q = query(collection(db, "submissions"), where("assignmentId", "==", assignmentId));
        const snapshot = await getDocs(q);
        
        const submissionsData = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          
          // Fetch student details if not in submission
          let studentName = "Unknown Student";
          let studentEmail = "";
          
          if (data.studentId) {
            const studentDoc = await getDoc(doc(db, "students", data.studentId));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              studentName = studentData.name || "Unknown";
              studentEmail = studentData.email;
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

        setSubmissions(submissionsData as Submission[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [assignmentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!assignment) {
    return <div>Assignment not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/assignments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          <p className="text-muted-foreground">Submissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
          <CardDescription>{submissions.length} submissions received</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-muted-foreground">No submissions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{submission.studentName}</p>
                        <p className="text-xs text-muted-foreground">{submission.studentEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{submission.submittedAt.toLocaleString()}</TableCell>
                    <TableCell>
                      {submission.score !== undefined ? (
                        <Badge variant="outline">{submission.score}%</Badge>
                      ) : (
                        <Badge variant="secondary">Not Graded</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
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
