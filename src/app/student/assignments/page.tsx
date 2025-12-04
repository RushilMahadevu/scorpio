"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  questions: any[];
}

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const assignmentsSnap = await getDocs(collection(db, "assignments"));
        const data = assignmentsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate?.() || new Date(doc.data().dueDate),
        })) as Assignment[];
        setAssignments(data);

        const submissionsSnap = await getDocs(
          query(collection(db, "submissions"), where("studentId", "==", user.uid))
        );
        const submittedIds = new Set(submissionsSnap.docs.map((doc) => doc.data().assignmentId));
        setSubmissions(submittedIds);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const isPastDue = (date: Date) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">View and complete your assignments</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No assignments yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => {
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
                      <Button variant={isSubmitted ? "outline" : "default"}>
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
