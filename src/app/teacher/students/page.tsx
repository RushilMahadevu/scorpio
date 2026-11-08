"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs, query, where, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db, cleanupStudentData } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { RosterImport } from "@/components/roster-import";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkStudents } from "@/components/teacher/network-students";
import { TeacherPageHeader } from "@/components/teacher/workspace";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Student {
  id: string;
  email: string;
  name?: string;
  createdAt?: Date;
  courseId?: string;
  courseName?: string;
}

export default function StudentsPage() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams?.get("tab") || "roster");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [networkTeacherIds, setNetworkTeacherIds] = useState<string[]>([]);

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "insights" || tabParam === "roster") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchStudentsAndNetwork() {
      if (!user) return;
      try {
        setLoading(true);

        // Fetch department teachers if in an organization
        if (profile?.organizationId) {
          const membersSnap = await getDocs(query(
            collection(db, "users"),
            where("organizationId", "==", profile.organizationId),
            where("role", "==", "teacher")
          ));
          const teacherIds = membersSnap.docs.map(d => d.id);
          setNetworkTeacherIds(teacherIds.length > 0 ? teacherIds : [user.uid]);
        } else {
          setNetworkTeacherIds([user.uid]);
        }

        // Fetch courses first to map IDs (include legacy search too)
        const [cSnap1, cSnap2] = await Promise.all([
          getDocs(query(collection(db, "courses"), where("teacherId", "==", user.uid))),
          getDocs(query(collection(db, "courses"), where("teacherId", "==", user.uid), where("code", "==", user.uid)))
        ]);

        const courseMap: Record<string, string> = {};
        const myCourseIds = new Set<string>();
        const myCodes = new Set<string>();

        [...cSnap1.docs, ...cSnap2.docs].forEach(d => {
          courseMap[d.id] = d.data().name;
          myCourseIds.add(d.id);
          if (d.data().code) myCodes.add(d.data().code);
        });

        // Query unified collections to find students assigned to this teacher
        const [unifiedByUid, unifiedByCourses] = await Promise.all([
          getDocs(query(collection(db, "users"), where("teacherId", "==", user.uid), where("role", "==", "student"))).catch(() => ({ docs: [] } as any)),
          (myCourseIds.size > 0
            ? getDocs(query(collection(db, "users"), where("courseId", "in", Array.from(myCourseIds).slice(0, 30)), where("role", "==", "student")))
            : Promise.resolve({ docs: [] } as any)
          )
        ]);

        const studentsMap = new Map<string, Student>();
        const allDocs = [...unifiedByUid.docs, ...unifiedByCourses.docs];

        allDocs.forEach((doc) => {
          const sData = doc.data();
          const isOurStudent = sData.teacherId === user.uid || (sData.courseId && myCourseIds.has(sData.courseId));

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
    fetchStudentsAndNetwork();
  }, [user, profile]);

  const deleteStudent = async (studentId: string) => {
    try {
      await cleanupStudentData(studentId, undefined, true);
      setStudents(students.filter((s) => s.id !== studentId));
      toast.success("Student records removed.");
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error(`Failed to delete student: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader title="Students" description="Manage enrollments and explore how students use Raise.">
        {user && (
          <Button variant="outline" asChild>
            <Link href="/teacher">Manage Classes <ArrowUpRight /></Link>
          </Button>
        )}
        <RosterImport />
      </TeacherPageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 gap-4">
        <TabsList className="h-auto max-w-full flex-wrap">
          <TabsTrigger value="roster" className="min-h-8">Roster</TabsTrigger>
          <TabsTrigger value="insights" className="min-h-8">Learning insights</TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <Card className="min-w-0 gap-0 py-0">
            <CardHeader className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-5">
              <h2 className="text-base font-semibold">Class roster</h2>
              {!loading && <span className="text-sm text-muted-foreground">{students.length} enrolled</span>}
            </CardHeader>
            <CardContent className="border-t p-0">
              {loading || students.length === 0 ? (
                <p role="status" className="px-5 py-10 text-center text-sm text-muted-foreground">
                  {loading ? "Loading the roster…" : "No students enrolled yet. Share a class code or import a roster to get started."}
                </p>
              ) : (
                <Table aria-label="Class roster">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="pl-4 sm:pl-5">Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="max-w-64 whitespace-normal py-3 pl-4 sm:pl-5">
                          <p className="break-words font-medium">{student.name || student.email.split("@")[0]}</p>
                          <p className="break-all text-xs text-muted-foreground">{student.email}</p>
                        </TableCell>
                        <TableCell className="max-w-48 whitespace-normal break-words text-muted-foreground">
                          {student.courseName || "No class assigned"}
                        </TableCell>
                        <TableCell className="pr-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${student.name || student.email}`}>
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem variant="destructive" onSelect={() => setStudentToDelete(student.id)}>
                                <Trash2 /> Remove student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <NetworkStudents
            organizationId={profile?.organizationId || undefined}
            teacherIds={networkTeacherIds.length > 0 ? networkTeacherIds : (user ? [user.uid] : [])}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!studentToDelete}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
        title="Remove Student"
        description="Are you sure you want to remove this student? This will remove them from your class lists and delete their submissions to save storage space."
        onConfirm={() => studentToDelete && deleteStudent(studentToDelete)}
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
}
