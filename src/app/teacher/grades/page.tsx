"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, writeBatch } from "firebase/firestore";
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

  useEffect(() => {
    async function fetchStudentsAndGrades() {
      try {
        // 1. Fetch all students (assuming a 'students' or 'users' collection with role='student')
        // For this demo, we'll fetch from 'users' where role is student, or just infer from submissions if user management is simple.
        // Let's assume we query submissions to find unique students for now, as we might not have a full user list sync.
        
        const submissionsSnap = await getDocs(collection(db, "submissions"));
        const studentMap = new Map<string, { name: string; email: string; scores: number[]; count: number }>();

        submissionsSnap.forEach((doc) => {
          const data = doc.data();
          const studentId = data.studentId;
          
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, { 
              name: data.studentName || "Unknown Student", // Fallback if name not in submission
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
  }, []);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gradebook</h1>
        <p className="text-muted-foreground">View student performance and submissions.</p>
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
