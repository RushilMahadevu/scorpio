"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { getAssignmentPoints } from "@/lib/assignment-points";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { ArrowUpRight, PlusCircle, Trash2, Globe, Lock, ShieldCheck, ShieldAlert, Copy, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TeacherPageHeader } from "@/components/teacher/workspace";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  questions?: { points?: number }[];
  createdAt: Date;
  courseId?: string;
  courseName?: string;
  visibility?: "private" | "network" | "global";
  organizationId?: string;
  lockdownMode?: boolean;
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<{id: string, name: string}[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("dueDateDesc");
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
       if (!user) return;
       try {
         const snap = await getDocs(query(collection(db, "courses"), where("teacherId", "==", user.uid)));
         setCourses(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
       } catch (e) { console.error(e); }
    }
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  async function fetchAssignments() {
    if (!user) return;
    try {
      // 1. Fetch courses to map names
      const coursesSnap = await getDocs(query(collection(db, "courses"), where("teacherId", "==", user.uid)));
      const courseMap: Record<string, string> = {};
      coursesSnap.docs.forEach(d => courseMap[d.id] = d.data().name);

      // 2. Fetch assignments
      const q = query(collection(db, "assignments"), where("teacherId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          dueDate: d.dueDate?.toDate?.() || new Date(d.dueDate),
          createdAt: d.createdAt?.toDate?.() || new Date(d.createdAt),
          courseName: d.courseId ? courseMap[d.courseId] : undefined
        };
      }) as Assignment[];
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleDuplicate(assignment: Assignment) {
    if (!user) return;
    const { id, courseName, ...rest } = assignment;
    const waypointData = {
      ...rest,
      title: `${assignment.title}`,
    };
    sessionStorage.setItem("forked_assignment", JSON.stringify(waypointData));
    router.push("/teacher/create?fork=true");
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "assignments", id));
      setAssignments(assignments.filter((a) => a.id !== id));
      toast.success("Assignment deleted.");
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment.");
    }
  }

  async function updateVisibility(id: string, visibility: "private" | "network" | "global") {
    try {
      await updateDoc(doc(db, "assignments", id), { visibility });
      setAssignments(assignments.map(a => a.id === id ? { ...a, visibility } : a));
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  }

  const isPastDue = (date: Date) => new Date(date) < new Date();

  // Filtering
  let filteredAssignments = assignments.filter((assignment) => {
    if (selectedCourseId !== "all" && assignment.courseId !== selectedCourseId) return false;

    const pastDue = isPastDue(assignment.dueDate);
    if (filter === "active") return !pastDue;
    if (filter === "pastDue") return pastDue;
    return true;
  });

  // Sorting
  filteredAssignments = filteredAssignments.sort((a, b) => {
    if (sort === "dueDateAsc") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sort === "dueDateDesc") {
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    } else if (sort === "titleAsc") {
      return a.title.localeCompare(b.title);
    } else if (sort === "titleDesc") {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <TeacherPageHeader title="Assignments" description="Review deadlines, manage sharing, and open student submissions.">
        <Button asChild>
          <Link href="/teacher/create"><PlusCircle /> Create Assignment</Link>
        </Button>
      </TeacherPageHeader>

      <Card className="min-w-0 gap-0 py-0">
        <CardHeader className="flex flex-wrap items-end justify-between gap-3 px-4 py-4 sm:px-5">
          <div className="grid w-full max-w-xl gap-3 sm:grid-cols-3">
            <div className="min-w-0 space-y-1.5">
              <label htmlFor="assignment-class" className="block text-xs font-medium text-muted-foreground">Class</label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger id="assignment-class" className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-1.5">
              <label htmlFor="assignment-status" className="block text-xs font-medium text-muted-foreground">Status</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger id="assignment-status" className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pastDue">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-1.5">
              <label htmlFor="assignment-sort" className="block text-xs font-medium text-muted-foreground">Sort by</label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger id="assignment-sort" className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDateDesc">Due Date (Latest)</SelectItem>
                  <SelectItem value="dueDateAsc">Due Date (Earliest)</SelectItem>
                  <SelectItem value="titleAsc">Title (A–Z)</SelectItem>
                  <SelectItem value="titleDesc">Title (Z–A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!loading && <p className="text-sm text-muted-foreground">{filteredAssignments.length} assignments</p>}
        </CardHeader>
        <CardContent className="border-t p-0">
          {loading || filteredAssignments.length === 0 ? (
            <p role="status" className="px-5 py-10 text-center text-sm text-muted-foreground">
              {loading ? "Loading assignments…" : "No assignments match these filters."}
            </p>
          ) : (
            <Table aria-label="Assignments">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="pl-4 sm:pl-5">Assignment</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="max-w-80 whitespace-normal py-3 pl-4 sm:pl-5">
                      <Link
                        href={`/teacher/assignment-view?id=${assignment.id}`}
                        className="inline-flex items-baseline gap-1.5 break-words font-medium hover:text-primary hover:underline"
                      >
                        {assignment.title}
                        <ArrowUpRight aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{assignment.courseName || (assignment.courseId ? "Unknown class" : "All classes")}</span>
                        <span>{assignment.questions?.length || 0} questions · {getAssignmentPoints(assignment.questions)} pts</span>
                        {assignment.lockdownMode && (
                          <span className="inline-flex items-center gap-1"><ShieldAlert aria-hidden="true" className="size-3" /> Lockdown</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <p className="font-medium">{Number.isNaN(assignment.dueDate.getTime()) ? "No due date" : assignment.dueDate.toLocaleDateString()}</p>
                      <p className="text-muted-foreground">{isPastDue(assignment.dueDate) ? "Past due" : "Active"}</p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={assignment.visibility || "private"}
                        onValueChange={(value: "private" | "network" | "global") => updateVisibility(assignment.id, value)}
                      >
                        <SelectTrigger size="sm" aria-label={`Visibility for ${assignment.title}`} className="cursor-pointer text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private"><Lock /> Private</SelectItem>
                          <SelectItem value="network"><ShieldCheck /> Network</SelectItem>
                          <SelectItem value="global"><Globe /> Global</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="pr-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${assignment.title}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleDuplicate(assignment)}><Copy /> Duplicate</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onSelect={() => setAssignmentToDelete(assignment.id)}>
                            <Trash2 /> Delete assignment
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

      <ConfirmDialog
        open={!!assignmentToDelete}
        onOpenChange={(open) => !open && setAssignmentToDelete(null)}
        title="Delete Assignment"
        description="Are you sure you want to delete this assignment? This will permanently remove all student submissions for this assignment as well."
        onConfirm={() => assignmentToDelete && handleDelete(assignmentToDelete)}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
