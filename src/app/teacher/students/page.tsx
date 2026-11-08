"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs, query, where, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db, cleanupStudentData } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, ExternalLink, Users, Sparkles, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { RosterImport } from "@/components/roster-import";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkStudents } from "@/components/teacher/network-students";

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

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Users className="h-7 w-7 text-primary" />
            Students & Learning
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Manage course enrollments, import rosters, and explore student AI learning insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RosterImport />
          {user && (
            <Button variant="outline" asChild className="rounded-xl font-semibold cursor-pointer">
              <Link href="/teacher" className="flex items-center gap-2">
                Manage Classes <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs: Roster vs. AI Insights */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="border-b border-border/50 pb-3">
          <TabsList className="grid grid-cols-2 w-full sm:w-auto p-1 bg-muted/60 rounded-xl h-auto">
            <TabsTrigger value="roster" className="text-xs font-bold py-2 px-5 cursor-pointer gap-2">
              <Users className="h-3.5 w-3.5" />
              Enrolled Roster ({students.length})
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs font-bold py-2 px-5 cursor-pointer gap-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Learning Radar & Insights
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Tab 1: Class Roster ──────────────────────────────── */}
        <TabsContent value="roster" className="space-y-4 outline-none">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Class Roster</CardTitle>
              <CardDescription>{students.length} students enrolled across your classes</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center text-muted-foreground font-medium animate-pulse">
                  Loading student roster...
                </div>
              ) : students.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No students enrolled yet. Share your class codes or import a roster to get started.
                </div>
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
                      <TableRow key={student.id} className="hover:bg-muted/40">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                                {getInitials(student.email)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-sm">
                              {student.name || student.email.split("@")[0]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground font-mono">{student.email}</span>
                        </TableCell>
                        <TableCell>
                          {student.courseName ? (
                            <Badge variant="outline" className="font-medium text-xs">
                              {student.courseName}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Direct / General</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setStudentToDelete(student.id)}
                            className="hover:text-destructive cursor-pointer h-8 w-8"
                            title="Remove Student"
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
        </TabsContent>

        {/* ─── Tab 2: Learning Insights & Radar ─────────────────── */}
        <TabsContent value="insights" className="space-y-4 outline-none">
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
