"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, writeBatch, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  email: string;
  submissionCount: number;
  averageScore: number;
}

export default function TeacherGradesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<{id: string, title: string}[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("all");

  useEffect(() => {
    async function fetchAssignments() {
        try {
            const snap = await getDocs(collection(db, "assignments"));
            setAssignments(snap.docs.map(d => ({ id: d.id, title: d.data().title })));
        } catch (e) {
            console.error("Error fetching assignments", e);
        }
    }
    fetchAssignments();
  }, []);

  useEffect(() => {
    async function fetchStudentsAndGrades() {
      setLoading(true);
      try {
        let q;
        if (selectedAssignmentId === "all") {
            q = collection(db, "submissions");
        } else {
            q = query(collection(db, "submissions"), where("assignmentId", "==", selectedAssignmentId));
        }
        
        const submissionsSnap = await getDocs(q);
        const studentMap = new Map<string, { name: string; email: string; scores: number[]; count: number }>();

        submissionsSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'draft') return; // Skip drafts in gradebook

          const studentId = data.studentId;
          
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, { 
              name: data.studentName || "Unknown Student", 
              email: data.studentEmail || "",
              scores: [],
              count: 0
            });
          }

          const student = studentMap.get(studentId)!;
          student.count++;
          if (data.graded && data.score !== null) {
            student.scores.push(data.score);
          }
        });

        // Fetch names from students collection for any "Unknown Student" entries
        const unknownStudents = Array.from(studentMap.entries())
          .filter(([_, data]) => data.name === "Unknown Student");
        
        await Promise.all(
          unknownStudents.map(async ([studentId, _]) => {
            try {
              const studentDoc = await getDoc(doc(db, "students", studentId));
              if (studentDoc.exists()) {
                const studentData = studentDoc.data();
                const student = studentMap.get(studentId);
                if (student) {
                  student.name = studentData.name || "Unknown Student";
                  student.email = studentData.email || student.email;
                }
              }
            } catch (error) {
              console.error(`Error fetching student ${studentId}:`, error);
            }
          })
        );

        // Convert map to array
        const studentsArray: Student[] = Array.from(studentMap.entries()).map(([id, data]) => {
          const totalScore = data.scores.reduce((a, b) => a + b, 0);
          const averageScore = data.scores.length > 0 ? Math.round(totalScore / data.scores.length) : 0;
          
          return {
            id,
            name: data.name,
            email: data.email,
            submissionCount: data.count,
            averageScore
          };
        });

        setStudents(studentsArray);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentsAndGrades();
  }, [selectedAssignmentId]);

  const deleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the gradebook? This will delete all their submissions.")) return;
    try {
      const q = query(collection(db, "submissions"), where("studentId", "==", studentId));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      setStudents(students.filter((s) => s.id !== studentId));
    } catch (error: any) {
      console.error("Error deleting student:", error);
      alert(`Failed to delete student: ${error.message}`);
    }
  };

  if (loading && assignments.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Gradebook</h1>
            <p className="text-muted-foreground">View student performance and submissions.</p>
        </div>
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Filter by Assignment:</label>
            <select 
                className="border rounded p-2 bg-background"
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
            >
                <option value="all">All Assignments</option>
                {assignments.map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                ))}
            </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Select a student to view detailed grades.</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground">No students found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Average Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.submissionCount}</TableCell>
                    <TableCell>{student.averageScore}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/teacher/grades/student?studentId=${student.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStudent(student.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
