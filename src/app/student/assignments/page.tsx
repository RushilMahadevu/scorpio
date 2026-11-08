"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { WorkspaceHeader } from "@/components/ui/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  questions?: unknown[];
  courseId: string;
  teacherId: string;
}

export default function StudentAssignmentsPage() {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("dueDateAsc");

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        // Source of truth: Use unified profile if available, otherwise fallback to legacy students collection
        let teacherId = profile?.teacherId;
        let courseId = profile?.courseId;

        if (!courseId || !teacherId) {
          try {
            const studentDoc = await getDoc(doc(db, "students", user.uid));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              teacherId = teacherId || studentData.teacherId;
              courseId = courseId || studentData.courseId;
            }
          } catch (e) { console.error("Could not fetch legacy student profile", e); }
        }



        let data: Assignment[] = [];
        if (courseId) {
          // New system: filter by specific course
          const assignmentsSnap = await getDocs(
            query(collection(db, "assignments"), where("answerKeySeparated", "==", true), where("courseId", "==", courseId))
          );
          data = assignmentsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate?.toDate?.() || (doc.data().dueDate ? new Date(doc.data().dueDate) : new Date()),
          })) as Assignment[];
        } else if (teacherId) {
          // Fallback for legacy connections
          const assignmentsSnap = await getDocs(
            query(collection(db, "assignments"), where("answerKeySeparated", "==", true), where("teacherId", "==", teacherId), where("courseId", "==", null))
          );
          data = assignmentsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate?.toDate?.() || new Date(doc.data().dueDate),
          })) as Assignment[];
        }
        setAssignments(data);

        const submissionsSnap = await getDocs(
          query(collection(db, "submissions"), where("studentId", "==", user.uid))
        );
        const submittedIds = new Set(
          submissionsSnap.docs
            .filter(doc => doc.data().status !== 'draft')
            .map((doc) => doc.data().assignmentId)
        );
        setSubmissions(submittedIds);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, profile]);

  const isPastDue = (date: Date) => new Date(date) < new Date();

  // Filtering
  let filteredAssignments = assignments.filter((assignment) => {
    const isSubmitted = submissions.has(assignment.id);
    const pastDue = isPastDue(assignment.dueDate);
    if (filter === "submitted") return isSubmitted;
    if (filter === "pending") return !isSubmitted && !pastDue;
    if (filter === "pastDue") return !isSubmitted && pastDue;
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
      <WorkspaceHeader title="Assignments" description="Open coursework and check what’s due." />
      <div className="flex flex-wrap gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status: {(() => {
                if (filter === "all") return "All";
                if (filter === "submitted") return "Submitted";
                if (filter === "pending") return "Pending";
                if (filter === "pastDue") return "Past Due";
                return "All";
              })()} <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => setFilter("all")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilter("submitted")}>
              Submitted
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilter("pending")}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilter("pastDue")}>
              Past Due
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Sort by: {(() => {
                if (sort === "dueDateAsc") return "Due Date (Earliest)";
                if (sort === "dueDateDesc") return "Due Date (Latest)";
                if (sort === "titleAsc") return "Title (A-Z)";
                if (sort === "titleDesc") return "Title (Z-A)";
                return "Due Date (Earliest)";
              })()} <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => setSort("dueDateAsc")}>Due Date (Earliest)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSort("dueDateDesc")}>Due Date (Latest)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSort("titleAsc")}>Title (A-Z)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSort("titleDesc")}>Title (Z-A)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <p role="status" className="p-6 text-sm text-muted-foreground">Loading assignments…</p>
        ) : filteredAssignments.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No assignments match this view.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filteredAssignments.map((assignment) => {
              const isSubmitted = submissions.has(assignment.id);
              const pastDue = !isSubmitted && isPastDue(assignment.dueDate);
              return (
                <li key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                  <div className="min-w-0 flex-1 basis-48 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="min-w-0 break-words font-medium">{assignment.title}</h2>
                      <Badge variant={pastDue ? "destructive" : isSubmitted ? "secondary" : "outline"}>
                        {isSubmitted ? "Submitted" : pastDue ? "Past due" : "Pending"}
                      </Badge>
                    </div>
                    {assignment.description && <p className="break-words text-sm text-muted-foreground">{assignment.description}</p>}
                    <p className="text-xs text-muted-foreground">
                      Due {assignment.dueDate.toLocaleDateString()} · {assignment.questions?.length || 0} {assignment.questions?.length === 1 ? "question" : "questions"}
                    </p>
                  </div>
                  <Button asChild size="sm" variant={isSubmitted ? "outline" : "default"}>
                    <Link href={`/student/assignment-view?id=${assignment.id}`} aria-label={`${isSubmitted ? "View" : "Start"} ${assignment.title}`}>
                      {isSubmitted ? "View" : "Start"}
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
