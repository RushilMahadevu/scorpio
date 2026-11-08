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

  function formatDueDate(dueDate: Date | null | undefined, isSubmitted: boolean) {
    if (!dueDate || isNaN(new Date(dueDate).getTime())) {
      return {
        formattedDate: "No due date",
        relativeText: isSubmitted ? "Submitted" : "Open",
        urgency: "normal" as const,
      };
    }

    const now = new Date();
    const due = new Date(dueDate);

    // Strip time for day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const formattedDate = due.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: due.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });

    let relativeText = "";
    let urgency: "normal" | "urgent" | "past" | "submitted" = "normal";

    if (isSubmitted) {
      relativeText = "Submitted";
      urgency = "submitted";
    } else if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      relativeText = daysAgo === 1 ? "1 day overdue" : `${daysAgo} days overdue`;
      urgency = "past";
    } else if (diffDays === 0) {
      relativeText = "Due today";
      urgency = "urgent";
    } else if (diffDays === 1) {
      relativeText = "Due tomorrow";
      urgency = "urgent";
    } else if (diffDays <= 7) {
      relativeText = `In ${diffDays} days`;
      urgency = "normal";
    } else {
      relativeText = `${Math.ceil(diffDays / 7)} weeks left`;
      urgency = "normal";
    }

    return { formattedDate, relativeText, urgency };
  }

  // Filtering
  let filteredAssignments = assignments.filter((assignment) => {
    const isSubmitted = submissions.has(assignment.id);
    const pastDue = isPastDue(assignment.dueDate);
    if (filter === "submitted") return isSubmitted;
    if (filter === "pending") return !isSubmitted && !pastDue;
    if (filter === "pastDue") return !isSubmitted && pastDue;
    return true;
  });

  const counts = {
    all: assignments.length,
    pending: assignments.filter((a) => !submissions.has(a.id) && !isPastDue(a.dueDate)).length,
    submitted: assignments.filter((a) => submissions.has(a.id)).length,
    pastDue: assignments.filter((a) => !submissions.has(a.id) && isPastDue(a.dueDate)).length,
  };

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
            <Button variant="outline" size="sm" className="h-9">
              Status: {(() => {
                if (filter === "all") return `All (${counts.all})`;
                if (filter === "submitted") return `Submitted (${counts.submitted})`;
                if (filter === "pending") return `Pending (${counts.pending})`;
                if (filter === "pastDue") return `Past Due (${counts.pastDue})`;
                return "All";
              })()} <ChevronDown className="w-3.5 h-3.5 ml-1.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => setFilter("all")}>
              All ({counts.all})
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilter("pending")}>
              Pending ({counts.pending})
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilter("submitted")}>
              Submitted ({counts.submitted})
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilter("pastDue")}>
              Past Due ({counts.pastDue})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Sort by: {(() => {
                if (sort === "dueDateAsc") return "Due Date (Earliest)";
                if (sort === "dueDateDesc") return "Due Date (Latest)";
                if (sort === "titleAsc") return "Title (A–Z)";
                if (sort === "titleDesc") return "Title (Z–A)";
                return "Due Date (Earliest)";
              })()} <ChevronDown className="w-3.5 h-3.5 ml-1.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => setSort("dueDateAsc")}>Due Date (Earliest)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSort("dueDateDesc")}>Due Date (Latest)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSort("titleAsc")}>Title (A–Z)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSort("titleDesc")}>Title (Z–A)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Coursework ({filteredAssignments.length})
          </span>
          <span className="text-xs text-muted-foreground">
            {sort === "dueDateAsc"
              ? "Earliest due first"
              : sort === "dueDateDesc"
              ? "Latest due first"
              : sort === "titleAsc"
              ? "Alphabetical (A–Z)"
              : "Alphabetical (Z–A)"}
          </span>
        </div>

        {loading ? (
          <p role="status" className="p-6 text-sm text-muted-foreground">Loading assignments…</p>
        ) : filteredAssignments.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No assignments match this view.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filteredAssignments.map((assignment) => {
              const isSubmitted = submissions.has(assignment.id);
              const pastDue = !isSubmitted && isPastDue(assignment.dueDate);
              const dateInfo = formatDueDate(assignment.dueDate, isSubmitted);

              return (
                <li
                  key={assignment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/20"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-sm font-semibold text-foreground">
                        {assignment.title}
                      </h2>
                      {isSubmitted && (
                        <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 font-normal">
                          Submitted
                        </Badge>
                      )}
                    </div>
                    {assignment.description && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {assignment.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/80">
                      {assignment.questions?.length || 0}{" "}
                      {assignment.questions?.length === 1 ? "question" : "questions"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
                    <div className="text-left sm:text-right space-y-0.5 min-w-[110px]">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Due Date
                      </p>
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {dateInfo.formattedDate}
                      </p>
                      <p
                        className={`text-xs tabular-nums ${
                          dateInfo.urgency === "urgent"
                            ? "font-medium text-primary"
                            : dateInfo.urgency === "past"
                            ? "font-medium text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {dateInfo.relativeText}
                      </p>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      variant={isSubmitted ? "outline" : "default"}
                      className="shrink-0 h-9 px-4 text-xs font-medium"
                    >
                      <Link
                        href={`/student/assignment-view?id=${assignment.id}`}
                        aria-label={`${isSubmitted ? "View" : "Start"} ${assignment.title}`}
                      >
                        {isSubmitted ? "View" : "Start"}
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
