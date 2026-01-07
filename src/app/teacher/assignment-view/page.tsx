"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, User, Calendar, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { downloadCSV } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: any;
}

interface Submission {
  id: string;
  studentId: string;
  studentName?: string; // We might need to fetch this or store it in submission
  studentEmail?: string;
  submittedAt: any;
  answers: any;
  score?: number;
}

function AssignmentDetailsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const assignmentId = searchParams ? searchParams.get("id") ?? "" : "";
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!assignmentId || !user) return;

      try {
        const assignmentDoc = await getDoc(doc(db, "assignments", assignmentId));
        if (assignmentDoc.exists()) {
            const data = assignmentDoc.data();
            if (data.teacherId && data.teacherId !== user.uid) {
                setLoading(false);
                return;
            }
          setAssignment({ id: assignmentDoc.id, ...data } as Assignment);
        } else {
            setLoading(false);
            return;
        }

        const q = query(collection(db, "submissions"), where("assignmentId", "==", assignmentId));
        const snapshot = await getDocs(q);
        
        const submissionsData = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          let studentName = "Unknown Student";
          let studentEmail = "";
          
          if (data.studentId) {
            const studentDoc = await getDoc(doc(db, "students", data.studentId));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              studentName = studentData.name || "Unknown";
              studentEmail = studentData.email;
            }
          }

          return {
            id: docSnapshot.id,
            ...data,
            studentName,
            studentEmail,
            submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
          };
        }));

        setSubmissions(submissionsData as Submission[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [assignmentId, user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-bold">Assignment not found</p>
        <Link href="/teacher/assignments" className="mt-4">
          <Button variant="outline">Return to List</Button>
        </Link>
      </div>
    );
  }

  const gradedCount = submissions.filter(s => s.score !== undefined).length;
  const averageScore = gradedCount > 0 
    ? Math.round(submissions.filter(s => s.score !== undefined).reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedCount)
    : 0;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero Header */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-700 p-8 text-white shadow-xl isolate"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/teacher/assignments" className="group flex items-center gap-2 text-indigo-100 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Assignments</span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">{assignment.title}</h1>
              </div>
              <p className="text-indigo-50/80 text-lg max-w-2xl leading-relaxed italic">
                {assignment.description || "No description provided for this assignment."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 min-w-[160px] text-center">
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">Submissions</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black">{submissions.length}</span>
                  <span className="text-indigo-200/60 text-xs">total</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 min-w-[160px] text-center">
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">Avg Score</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black">{averageScore}%</span>
                  <span className="text-indigo-200/60 text-xs">graded</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center gap-4 text-sm font-medium text-indigo-100/90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due: {new Date(assignment.dueDate?.toDate?.() || assignment.dueDate).toLocaleDateString()}
                </div>
                <div className="h-4 w-px bg-white/20 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {gradedCount} of {submissions.length} graded
                </div>
             </div>
             
             <Button
                variant="secondary"
                onClick={() => {
                  const rows = submissions.map((s) => ({
                    submissionId: s.id,
                    studentId: s.studentId,
                    studentName: s.studentName,
                    studentEmail: s.studentEmail,
                    submittedAt: s.submittedAt?.toString?.() || String(s.submittedAt),
                    score: s.score ?? "",
                    graded: s.score !== undefined ? "true" : "false",
                  }));
                  downloadCSV(`${assignment.title || 'assignment'}-grades.csv`, rows);
                }}
                className="bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl px-4 font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 bg-indigo-500/20 rounded-full blur-3xl" />
      </motion.div>

      {/* Submissions Table Selection */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl">
          <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Submission Registry</CardTitle>
                <CardDescription>Click on a student to grade or review their work</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 rounded-full bg-indigo-50 text-indigo-400 mb-4 animate-pulse">
                  <Clock className="h-10 w-10" />
                </div>
                <p className="text-lg font-bold text-foreground">Awaiting Submissions</p>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Encourage your students to complete their assignment. Submissions will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10 text-xs uppercase tracking-widest font-black text-muted-foreground/60">
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead className="py-4 pl-8">Student</TableHead>
                      <TableHead className="py-4">Timestamp</TableHead>
                      <TableHead className="py-4">Grading Status</TableHead>
                      <TableHead className="py-4">Result</TableHead>
                      <TableHead className="py-4 text-right pr-8">Review</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {submissions.map((submission) => (
                        <TableRow 
                          key={submission.id}
                          className="group hover:bg-indigo-50/20 transition-colors border-border/40"
                        >
                          <TableCell className="py-6 pl-8">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10 ring-2 ring-indigo-100 shadow-sm border-2 border-white">
                                <AvatarFallback className="bg-indigo-600 text-white font-bold uppercase text-[10px]">
                                  {submission.studentName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground group-hover:text-indigo-700 transition-colors">
                                  {submission.studentName}
                                </span>
                                <span className="text-[10px] text-muted-foreground lowercase">
                                  {submission.studentEmail}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm font-medium">
                              <span className="text-foreground/80">{submission.submittedAt.toLocaleDateString()}</span>
                              <span className="text-[10px] text-muted-foreground opacity-60">
                                {submission.submittedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {submission.score !== undefined ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                                <CheckCircle className="h-3 w-3" />
                                Evaluated
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                <Clock className="h-3 w-3" />
                                Needs Review
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.score !== undefined ? (
                              <div className="flex flex-col gap-1">
                                <span className={`text-lg font-black ${
                                  (submission.score || 0) >= 80 ? 'text-emerald-600' :
                                  (submission.score || 0) >= 60 ? 'text-amber-600' : 'text-rose-600'
                                }`}>
                                  {submission.score}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/30 text-xs font-black uppercase italic tracking-widest">---</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <Link href={`/teacher/submission/grade?id=${submission.id}`}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="group/btn h-10 rounded-xl px-4 hover:bg-indigo-600 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest"
                              >
                                {submission.score !== undefined ? "Review" : "Grade"}
                                <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function AssignmentDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssignmentDetailsContent />
    </Suspense>
  );
}