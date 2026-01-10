"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  email: string;
  name?: string;
  createdAt?: Date;
  courseId?: string;
  courseName?: string;
}

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      if (!user) return;
      try {
        // Fetch courses first to map IDs
        const coursesSnap = await getDocs(query(collection(db, "courses"), where("teacherId", "==", user.uid)));
        const courseMap: Record<string, string> = {};
        coursesSnap.docs.forEach(d => {
            courseMap[d.id] = d.data().name;
        });

        const q = query(collection(db, "students"), where("teacherId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => {
           const sData = doc.data();
           return {
            id: doc.id,
            ...sData,
            courseName: sData.courseId ? courseMap[sData.courseId] : undefined
          };
        }) as Student[];
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [user]);

  const deleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    try {
      await deleteDoc(doc(db, "students", studentId));
      setStudents(students.filter((s) => s.id !== studentId));
    } catch (error: any) {
      console.error("Error deleting student:", error);
      alert(`Failed to delete student: ${error.message}`);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">View and manage your students</p>
        </div>
        {user && (
           <Button variant="outline" asChild>
             <Link href="/teacher" className="flex items-center gap-2">
                Manage Classes <ExternalLink className="h-4 w-4" />
             </Link>
           </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
          <CardDescription>{students.length} students enrolled</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : students.length === 0 ? (
            <p className="text-muted-foreground">No students enrolled yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(student.email)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name || student.email.split("@")[0]}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                        {student.courseName ? (
                            <Badge variant="outline">{student.courseName}</Badge>
                        ) : (
                            <span className="text-muted-foreground text-xs italic">Legacy / Direct</span>
                        )}
                    </TableCell>
                    <TableCell>
                      <Badge>Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStudent(student.id)}
                        className="hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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
