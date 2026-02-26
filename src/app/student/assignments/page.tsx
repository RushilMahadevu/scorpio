"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { FileText, Clock, CheckCircle, ChevronDown } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  questions: any[];
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

        // --- LEGACY RESOLUTION START ---
        // If we have a teacherId but NO courseId, the teacherId might actually be a Class Code
        if (teacherId && !courseId) {
             const codeMatch = await getDocs(query(collection(db, "courses"), where("code", "==", teacherId.trim())));
             if (!codeMatch.empty) {
                const courseDoc = codeMatch.docs[0];
                const courseData = courseDoc.data();
                courseId = courseDoc.id;
                teacherId = courseData.teacherId;
                
                // AUTO-SYNC resolution so it persists
                try {
                  await setDoc(doc(db, "students", user.uid), { 
                    courseId, 
                    teacherId 
                  }, { merge: true });
                  
                  await setDoc(doc(db, "users", user.uid), { 
                    courseId, 
                    teacherId 
                  }, { merge: true });
                } catch (e) {
                  console.warn("Could not sync resolved legacy code", e);
                }

                console.log("Resolved legacy code in assignments page:", teacherId, courseId);
             }
        }
        // --- LEGACY RESOLUTION END ---

        let data: Assignment[] = [];
        if (courseId) {
          // New system: filter by specific course
          const assignmentsSnap = await getDocs(
            query(collection(db, "assignments"), where("courseId", "==", courseId))
          );
          data = assignmentsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate?.toDate?.() || (doc.data().dueDate ? new Date(doc.data().dueDate) : new Date()),
          })) as Assignment[];
        } else if (teacherId) {
          // Fallback for legacy connections
          const assignmentsSnap = await getDocs(
            query(collection(db, "assignments"), where("teacherId", "==", teacherId))
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
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">View and complete your assignments</p>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 min-w-[140px] cursor-pointer hover:bg-primary/90 transition-colors">
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
            <DropdownMenuItem onSelect={() => setFilter("all")} className="cursor-pointer hover:bg-primary/90 transition-colors">
              All
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilter("submitted")} className="cursor-pointer hover:bg-primary/90 transition-colors">
              Submitted
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilter("pending")} className="cursor-pointer hover:bg-primary/90 transition-colors">
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFilter("pastDue")} className="cursor-pointer hover:bg-primary/90 transition-colors">
              Past Due
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 min-w-[180px] cursor-pointer hover:bg-primary/90 transition-colors">
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
            <DropdownMenuItem onSelect={() => setSort("dueDateAsc")} className="cursor-pointer hover:bg-primary/90 transition-colors">Due Date (Earliest)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSort("dueDateDesc")} className="cursor-pointer hover:bg-primary/90 transition-colors">Due Date (Latest)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSort("titleAsc")} className="cursor-pointer hover:bg-primary/90 transition-colors">Title (A-Z)</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setSort("titleDesc")} className="cursor-pointer hover:bg-primary/90 transition-colors">Title (Z-A)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No assignments found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAssignments.map((assignment) => {
            const isSubmitted = submissions.has(assignment.id);
            const pastDue = isPastDue(assignment.dueDate);
            return (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {assignment.title}
                      </CardTitle>
                      <CardDescription>{assignment.description}</CardDescription>
                    </div>
                    {isSubmitted ? (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Submitted
                      </Badge>
                    ) : pastDue ? (
                      <Badge variant="destructive">Past Due</Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>{assignment.questions?.length || 0} questions</p>
                      <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                    </div>
                    <Link href={`/student/assignment-view?id=${assignment.id}`}>
                      <Button variant={isSubmitted ? "outline" : "default"} className="cursor-pointer hover:bg-primary/90 transition-colors">
                        {isSubmitted ? "View" : "Start"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
