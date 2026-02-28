"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download } from "lucide-react";
import Link from "next/link";
import { GradeExportButton } from "@/components/grade-export-button";

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  submittedAt: Date;
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
        const allowedAssignmentIds = new Set(assignmentsSnapshot.docs.map(d => d.id));

        // Fetch submissions
        const q = query(collection(db, "submissions"), where("studentId", "==", studentId));
        const snapshot = await getDocs(q);

        const submissionsData = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          
          // Verify assignment ownership
          if (!allowedAssignmentIds.has(data.assignmentId)) return null;

          // Try to get student name from first submission if not available elsewhere
          if (data.studentName) setStudentName(data.studentName);

          // Fetch assignment title
          let assignmentTitle = "Unknown Assignment";
          let assignmentExists = false;
          if (data.assignmentId) {
            const assignmentDoc = await getDoc(doc(db, "assignments", data.assignmentId));
            if (assignmentDoc.exists()) {
              assignmentTitle = assignmentDoc.data().title;
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

        setSubmissions(submissionsData.filter((s): s is Submission => s !== null));
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [studentId, user]);

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

  // Filter submissions by selected assignment
  const filteredSubmissions = selectedAssignment
    ? submissions.filter((s) => s.assignmentId === selectedAssignment)
    : submissions;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
        <GradeExportButton 
          data={submissions.map(s => ({
            studentName,
            studentEmail: "—", // Not directly stored in submission here
            assignmentTitle: s.assignmentTitle,
            score: s.score || 0,
            totalPoints: 100,
            submittedAt: s.submittedAt?.toLocaleDateString() || "N/A"
          }))}
          filename={`grades-${studentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`}
        />
      </div>

      {/* Assignment Filter Dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="assignment-filter" className="text-sm font-medium">Filter by Assignment:</label>
        <select
          id="assignment-filter"
          className="border rounded px-2 py-1"
          value={selectedAssignment}
          onChange={(e) => setSelectedAssignment(e.target.value)}
        >
          <option value="">All Assignments</option>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>All assignments submitted by this student.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
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
                {filteredSubmissions.map((submission) => (
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
