"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Eye, Share2, Globe, Lock, ShieldCheck } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  questions: any[];
  createdAt: Date;
  courseId?: string;
  courseName?: string;
  visibility?: "private" | "network" | "global";
  organizationId?: string;
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<{id: string, name: string}[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("dueDateAsc");

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

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await deleteDoc(doc(db, "assignments", id));
      setAssignments(assignments.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting assignment:", error);
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
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">Manage your class assignments</p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-2 flex-wrap items-center">
            {/* Class Filter */}
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">All Classes</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          {/* Filtering Dropdown */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px] cursor-pointer">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
              <SelectItem value="active" className="cursor-pointer">Active</SelectItem>
              <SelectItem value="pastDue" className="cursor-pointer">Past Due</SelectItem>
            </SelectContent>
          </Select>

          {/* Sorting Dropdown */}
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[200px] cursor-pointer">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDateAsc" className="cursor-pointer">Due Date (Earliest)</SelectItem>
              <SelectItem value="dueDateDesc" className="cursor-pointer">Due Date (Latest)</SelectItem>
              <SelectItem value="titleAsc" className="cursor-pointer">Title (A-Z)</SelectItem>
              <SelectItem value="titleDesc" className="cursor-pointer">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Create Assignment Button on right */}
        <div className="flex justify-end">
          <Link href="/teacher/create">
            <Button className="cursor-pointer">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>{filteredAssignments.length} total assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Card className="my-8 mx-auto max-w-md text-center">
              <CardContent className="py-8 flex flex-col items-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader animate-spin mb-2 text-muted-foreground"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path></svg>
                <p className="text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ) : filteredAssignments.length === 0 ? (
            <Card className="my-8 mx-auto max-w-md text-center">
              <CardContent className="py-8 flex flex-col items-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text mb-2 text-muted-foreground"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <p className="text-muted-foreground">No assignments found.</p>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>
                        {assignment.courseName ? (
                            <Badge variant="outline">{assignment.courseName}</Badge>
                        ) : (
                            <span className="text-xs text-muted-foreground italic">Legacy / All</span>
                        )}
                    </TableCell>
                    <TableCell>{assignment.questions?.length || 0}</TableCell>
                    <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select 
                        value={assignment.visibility || "private"} 
                        onValueChange={(val: "private" | "network" | "global") => updateVisibility(assignment.id, val)}
                      >
                        <SelectTrigger className="w-[110px] h-8 text-xs cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private" className="text-xs cursor-pointer">
                            <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Private</span>
                          </SelectItem>
                          <SelectItem value="network" className="text-xs cursor-pointer">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Network</span>
                          </SelectItem>
                          <SelectItem value="global" className="text-xs cursor-pointer">
                            <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> Global</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/teacher/assignment-view?id=${assignment.id}`}>
                          <Button variant="ghost" size="sm" className="cursor-pointer">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => handleDelete(assignment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
