"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Eye } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  questions: any[];
  createdAt: Date;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      const snapshot = await getDocs(collection(db, "assignments"));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Manage your class assignments</p>
        </div>
        <Link href="/teacher/create">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>{assignments.length} total assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : assignments.length === 0 ? (
            <p className="text-muted-foreground">No assignments yet. Create one to get started!</p>
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
                {assignments.map((assignment) => (
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
                        <Link href={`/teacher/assignments/${assignment.id}`}>
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
