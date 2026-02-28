"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db, cleanupStudentData } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { RosterImport } from "@/components/roster-import";

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
        setLoading(true);
        // Fetch courses first to map IDs (include legacy search too)
        const [cSnap1, cSnap2] = await Promise.all([
           getDocs(query(collection(db, "courses"), where("teacherId", "==", user.uid))),
           getDocs(query(collection(db, "courses"), where("code", "==", user.uid)))
        ]);
        
        const courseMap: Record<string, string> = {};
        const myCourseIds = new Set<string>();
        const myCodes = new Set<string>();
        
        [...cSnap1.docs, ...cSnap2.docs].forEach(d => {
            courseMap[d.id] = d.data().name;
            myCourseIds.add(d.id);
            if (d.data().code) myCodes.add(d.data().code);
        });

        const myCodesArr = Array.from(myCodes);

        // Query both legacy and unified collections to find students assigned to this teacher
        // Added graceful catch to avoid one failing collection from blocking the whole list
        const [legacyByUid, legacyByCourses, unifiedByUid, unifiedByCourses, legacyByCodes] = await Promise.all([
          getDocs(query(collection(db, "students"), where("teacherId", "==", user.uid))).catch(() => ({docs:[]} as any)),
          (myCourseIds.size > 0 
             ? getDocs(query(collection(db, "students"), where("courseId", "in", Array.from(myCourseIds).slice(0, 30)))) 
             : Promise.resolve({docs:[]} as any)
          ),
          getDocs(query(collection(db, "users"), where("teacherId", "==", user.uid), where("role", "==", "student"))).catch(() => ({docs:[]} as any)),
          (myCourseIds.size > 0 
             ? getDocs(query(collection(db, "users"), where("courseId", "in", Array.from(myCourseIds).slice(0, 30)), where("role", "==", "student"))) 
             : Promise.resolve({docs:[]} as any)
          ),
          (myCodesArr.length > 0 
             ? getDocs(query(collection(db, "students"), where("teacherId", "in", myCodesArr.slice(0, 30)))) 
             : Promise.resolve({docs:[]} as any)
          )
        ]);

        const studentsMap = new Map<string, Student>();
        
        const allDocs = [
          ...legacyByUid.docs,
          ...legacyByCourses.docs,
          ...unifiedByUid.docs,
          ...unifiedByCourses.docs,
          ...legacyByCodes.docs
        ];

        allDocs.forEach((doc) => {
          const sData = doc.data();
          // Filter: only include if they direct-link to teacher, belong to one of our courses, or use one of our legacy codes
          const isOurStudent = sData.teacherId === user.uid || 
                               (sData.courseId && myCourseIds.has(sData.courseId)) ||
                               (sData.teacherId && myCodes.has(sData.teacherId));
          
          if (isOurStudent && !studentsMap.has(doc.id)) {
            studentsMap.set(doc.id, {
              id: doc.id,
              email: sData.email || "unknown@student.com",
              name: sData.displayName || sData.name || (sData.email ? sData.email.split("@")[0] : "Student"),
              createdAt: sData.createdAt?.toDate ? sData.createdAt.toDate() : (sData.createdAt ? new Date(sData.createdAt) : new Date()),
              courseId: sData.courseId,
              courseName: sData.courseId ? courseMap[sData.courseId] : undefined
            } as Student);
          }
        });

        setStudents(Array.from(studentsMap.values()));
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [user]);

  const deleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student? This will remove them from your class lists and delete their submissions to save storage space.")) return;
    try {
      // 1. Storage & Submissions Cleanup (Space saving)
      await cleanupStudentData(studentId);

      // 2. Remove Profile links from both systems
      await Promise.all([
        deleteDoc(doc(db, "students", studentId)),
        // We reset their teacherId/courseId instead of deleting the whole user doc
        // in case they want to join another teacher later.
        setDoc(doc(db, "users", studentId), { teacherId: null, courseId: null }, { merge: true })
      ]);
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
        <div className="flex items-center gap-3">
          <RosterImport />
          {user && (
            <Button variant="outline" asChild>
              <Link href="/teacher" className="flex items-center gap-2">
                  Manage Classes <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
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
