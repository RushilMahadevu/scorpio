"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, User, Calendar, CheckCircle, Clock, ChevronRight, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { downloadCSV } from "@/lib/utils";

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
        const assignmentDoc = await getDoc(doc(db, "assignments", assignmentId));
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
  }, [assignmentId, user]);

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-bold">Assignment not found</p>
        <Link href="/teacher/assignments" className="mt-4">
          <Button variant="outline">Return to List</Button>
        </Link>
      </div>
    );
  }

  const gradedCount = submissions.filter(s => s.score !== undefined).length;
  const averageScore = gradedCount > 0 
    ? Math.round(submissions.filter(s => s.score !== undefined).reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedCount)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/teacher/assignments" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-fit cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
            <p className="text-muted-foreground">{assignment.description || "No description provided for this assignment."}</p>
          </div>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              const rows = submissions.map((s) => ({
                submissionId: s.id,
                studentId: s.studentId,
                studentName: s.studentName,
                studentEmail: s.studentEmail,
                submittedAt: s.submittedAt?.toString?.() || String(s.submittedAt),
                score: s.score ?? "",
                graded: s.score !== undefined ? "true" : "false",
              }));
              downloadCSV(`${assignment.title || 'assignment'}-grades.csv`, rows);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" /> Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Graded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gradedCount} <span className="text-sm text-muted-foreground font-normal">of {submissions.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" /> Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Due Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {new Date(assignment.dueDate?.toDate?.() || assignment.dueDate).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission Registry</CardTitle>
          <CardDescription>Review and grade student submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">Awaiting Submissions</p>
              <p className="text-sm">Submissions will appear here in real-time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold uppercase">
                              {submission.studentName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{submission.studentName}</span>
                            <span className="text-xs text-muted-foreground">{submission.studentEmail}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{submission.submittedAt.toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {submission.submittedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission.score !== undefined ? (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none">
                            Graded
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="animate-pulse">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.score !== undefined ? (
                          <span className="font-bold text-lg">{submission.score}%</span>
                        ) : (
                          <span className="text-muted-foreground font-black italic tracking-widest text-xs opacity-30">---</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/teacher/submission/grade?id=${submission.id}`}>
                          <Button variant="ghost" size="sm" className="cursor-pointer">
                            {submission.score !== undefined ? "Review" : "Grade"}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AssignmentDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssignmentDetailsContent />
    </Suspense>
  );
}