"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Eye } from "lucide-react";
import { ChevronDown } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  questions: any[];
  createdAt: Date;
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("dueDateAsc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  async function fetchAssignments() {
    if (!user) return;
    try {
      const q = query(collection(db, "assignments"), where("teacherId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate?.() || new Date(doc.data().dueDate),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
      })) as Assignment[];
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

  const isPastDue = (date: Date) => new Date(date) < new Date();

  // Filtering
  let filteredAssignments = assignments.filter((assignment) => {
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
          {/* Filtering Dropdown */}
          <div className="relative inline-block">
            <Button variant="outline" className="flex items-center gap-2 min-w-[140px]" onClick={() => setFilterOpen((open) => !open)}>
              Status: {(() => {
                if (filter === "all") return "All";
                if (filter === "active") return "Active";
                if (filter === "pastDue") return "Past Due";
                return "All";
              })()} <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
            {filterOpen && (
              <div className="absolute bg-popover rounded shadow mt-2 min-w-[140px] z-10">
                <button className="block w-full px-4 py-2 text-left hover:bg-muted" onClick={() => { setFilter('all'); setFilterOpen(false); }}>All</button>
                <button className="block w-full px-4 py-2 text-left hover:bg-muted" onClick={() => { setFilter('active'); setFilterOpen(false); }}>Active</button>
                <button className="block w-full px-4 py-2 text-left hover:bg-muted" onClick={() => { setFilter('pastDue'); setFilterOpen(false); }}>Past Due</button>
              </div>
            )}
          </div>
          {/* Sorting Dropdown */}
          <div className="relative inline-block">
            <Button variant="outline" className="flex items-center gap-2 min-w-[180px]" onClick={() => setSortOpen((open) => !open)}>
              Sort by: {(() => {
                if (sort === "dueDateAsc") return "Due Date (Earliest)";
                if (sort === "dueDateDesc") return "Due Date (Latest)";
                if (sort === "titleAsc") return "Title (A-Z)";
                if (sort === "titleDesc") return "Title (Z-A)";
                return "Due Date (Earliest)";
              })()} <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
            {sortOpen && (
              <div className="absolute bg-popover rounded shadow mt-2 min-w-[180px] z-10">
                <button className="block w-full px-4 py-2 text-left hover:bg-muted" onClick={() => { setSort('dueDateAsc'); setSortOpen(false); }}>Due Date (Earliest)</button>
                <button className="block w-full px-4 py-2 text-left hover:bg-muted" onClick={() => { setSort('dueDateDesc'); setSortOpen(false); }}>Due Date (Latest)</button>
                <button className="block w-full px-4 py-2 text-left hover:bg-muted" onClick={() => { setSort('titleAsc'); setSortOpen(false); }}>Title (A-Z)</button>
                <button className="block w-full px-4 py-2 text-left hover:bg-muted" onClick={() => { setSort('titleDesc'); setSortOpen(false); }}>Title (Z-A)</button>
              </div>
            )}
          </div>
        </div>
        {/* Create Assignment Button on right */}
        <div className="flex justify-end">
          <Link href="/teacher/create">
            <Button>
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
                  <TableHead>Questions</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{assignment.questions?.length || 0}</TableCell>
                    <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={isPastDue(assignment.dueDate) ? "secondary" : "default"}>
                        {isPastDue(assignment.dueDate) ? "Past Due" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/teacher/assignment-view?id=${assignment.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
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
