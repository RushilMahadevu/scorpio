"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Award, Activity, FileCheck, Clock, ChevronRight, Sparkles, Calendar } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion, AnimatePresence } from "framer-motion";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  submittedAt: Date | null;
  score: number | null;
  graded: boolean;
  feedback?: string;
  answers?: any;
  status?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function StudentGradesPage() {
  const { user, profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    async function fetchGrades() {
      if (!user) return;

      try {
        let studentTeacherId = profile?.teacherId;
        let studentCourseId = profile?.courseId;

        if (!studentTeacherId || !studentCourseId) {
          try {
            const studentDoc = await getDoc(doc(db, "students", user.uid));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              studentTeacherId = studentTeacherId || studentData.teacherId;
              studentCourseId = studentCourseId || studentData.courseId;
            }
          } catch (e) {
            console.error("Could not fetch legacy student profile", e);
          }
        }

        if (studentTeacherId && !studentCourseId) {
          const codeMatch = await getDocs(
            query(collection(db, "courses"), where("code", "==", studentTeacherId.trim()))
          );
          if (!codeMatch.empty) {
            const courseDoc = codeMatch.docs[0];
            const courseData = courseDoc.data();
            studentCourseId = courseDoc.id;
            studentTeacherId = courseData.teacherId;
          }
        }

        const q = query(collection(db, "submissions"), where("studentId", "==", user.uid));
        const snapshot = await getDocs(q);

        const submissionsData: (Submission | null)[] = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();

            let assignmentTitle = "Unknown Assignment";
            let assignmentExists = false;
            let assignmentTeacherId = null;
            let assignmentCourseId = null;

            if (data.assignmentId) {
              const assignmentDoc = await getDoc(doc(db, "assignments", data.assignmentId));
              if (assignmentDoc.exists()) {
                const assignData = assignmentDoc.data();
                assignmentTitle = assignData.title;
                assignmentTeacherId = assignData.teacherId;
                assignmentCourseId = assignData.courseId;
                assignmentExists = true;
              }
            }

            if (!assignmentExists) return null;

            if (studentCourseId) {
              if (assignmentCourseId !== studentCourseId) return null;
            } else if (studentTeacherId && assignmentTeacherId && studentTeacherId !== assignmentTeacherId) {
              return null;
            }

            return {
              id: docSnapshot.id,
              assignmentId: data.assignmentId,
              assignmentTitle,
              submittedAt: data.submittedAt?.toDate?.() || (data.submittedAt ? new Date(data.submittedAt) : null),
              score: data.score,
              graded: data.graded,
              feedback: data.feedback,
              answers: data.answers,
              status: data.status || (data.graded ? "graded" : "submitted"),
            } satisfies Submission;
          })
        );

        const filteredSubmissions = submissionsData.filter(
          (s): s is Submission => s !== null && s.status !== "draft"
        );
        
        filteredSubmissions.sort((a, b) => {
          const dateA = a.submittedAt?.getTime() || 0;
          const dateB = b.submittedAt?.getTime() || 0;
          return dateB - dateA; // Sort newest first for the history list
        });

        setSubmissions(filteredSubmissions);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGrades();
  }, [user, profile]);

  const stats = useMemo(() => {
    const graded = submissions.filter((s) => s.graded && s.score !== null);
    const scores = graded.map((s) => s.score as number);
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    const total = submissions.length;
    const pending = submissions.filter((s) => !s.graded).length;

    return { average, highest, total, pending };
  }, [submissions]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl mx-auto pb-20"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-black tracking-tight">Grades</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Track your performance and submission history.
          </p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="border border-zinc-200/50 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all hover:shadow-md ring-1 ring-black/5 dark:ring-white/5 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                Overall Average
                <Award className="w-4 h-4 text-primary opacity-50" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats.average.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">All graded courses</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border border-zinc-200/50 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all hover:shadow-md ring-1 ring-black/5 dark:ring-white/5 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                Highest Score
                <Sparkles className="w-4 h-4 text-primary opacity-50" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-primary">{stats.highest}%</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Personal best</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border border-zinc-200/50 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all hover:shadow-md ring-1 ring-black/5 dark:ring-white/5 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                Submissions
                <FileCheck className="w-4 h-4 text-emerald-500 opacity-50" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                {stats.total - stats.pending} Graded ({stats.total > 0 ? (((stats.total - stats.pending) / stats.total) * 100).toFixed(0) : 0}%)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border border-zinc-200/50 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all hover:shadow-md ring-1 ring-black/5 dark:ring-white/5 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                Pending Review
                <Clock className="w-4 h-4 text-amber-500 opacity-50" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-amber-500">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Awaiting instructor evaluation</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* History Table */}
      <motion.div variants={itemVariants}>
        <Card className="border border-zinc-200/50 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/5 rounded-3xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-black">Submission History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {submissions.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <FileText className="w-12 h-12 text-zinc-300 mb-4" />
                <h3 className="text-xl font-bold">No submissions yet</h3>
                <p className="text-muted-foreground mt-2 font-medium text-sm">Your graded assignments will appear here once submitted.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-zinc-50/50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-8 py-5 text-xs font-black uppercase tracking-widest">Assignment</TableHead>
                      <TableHead className="py-5 text-xs font-black uppercase tracking-widest">Date</TableHead>
                      <TableHead className="py-5 text-xs font-black uppercase tracking-widest text-center">Status</TableHead>
                      <TableHead className="py-5 text-xs font-black uppercase tracking-widest text-center">Score</TableHead>
                      <TableHead className="text-right px-8 py-5 text-xs font-black uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {submissions.map((submission, idx) => (
                        <motion.tr
                          key={submission.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="group border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors"
                        >
                          <TableCell className="px-8 py-5">
                            <div className="font-bold text-lg group-hover:text-primary transition-colors">{submission.assignmentTitle}</div>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                              <Calendar className="w-3.5 h-3.5" />
                              {submission.submittedAt ? submission.submittedAt.toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="py-5 text-center">
                            {submission.graded ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-bold text-[10px] uppercase">
                                Graded
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-none px-3 py-1 font-bold text-[10px] uppercase">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-5 text-center">
                            {submission.graded ? (
                              <span className={`font-black text-lg ${submission.score! >= 90 ? "text-emerald-500" : "text-foreground"}`}>
                                {submission.score}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground opacity-30 font-bold">--</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right px-8 py-5">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="rounded-xl px-4 font-black text-xs uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  View Details
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl p-0 border-zinc-200 dark:border-white/10 dark:bg-zinc-900 shadow-2xl">
                                <DialogHeader className="p-8 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800/30">
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      <DialogTitle className="text-3xl font-black tracking-tight">{submission.assignmentTitle}</DialogTitle>
                                      <DialogDescription className="text-sm font-medium mt-1">
                                        Submitted on {submission.submittedAt ? submission.submittedAt.toLocaleDateString(undefined, {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        }) : "N/A"}
                                      </DialogDescription>
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-5xl font-black ${submission.score! >= 90 ? "text-emerald-500" : "text-primary"}`}>
                                        {submission.graded ? `${submission.score}%` : "---"}
                                      </div>
                                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Score Mastery</div>
                                    </div>
                                  </div>
                                </DialogHeader>
                                
                                <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/20 dark:bg-zinc-900/50">
                                  {/* Graded Copy Section */}
                                  {submission.graded && Array.isArray(submission.answers) && submission.answers.length > 0 ? (
                                    <div className="space-y-6">
                                      {submission.answers.map((q: any, idx: number) => (
                                        <div
                                          key={q.questionId || idx}
                                          className="border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 rounded-2xl p-6 space-y-4 shadow-sm"
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                                                {idx + 1}
                                              </div>
                                              <p className="font-black text-sm uppercase tracking-wider text-muted-foreground">
                                                Question {idx + 1}
                                              </p>
                                            </div>
                                            <Badge className={`${typeof q.score === "number" && q.score > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"} border-none font-black text-[10px] px-3 py-1 uppercase`}>
                                              Points: {typeof q.score === "number" ? q.score : "-"}
                                            </Badge>
                                          </div>

                                          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-lg font-bold text-foreground/90 border border-zinc-200 dark:border-white/5">
                                            <MarkdownRenderer noProse>
                                              {q.questionText}
                                            </MarkdownRenderer>
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                            <div className="space-y-2">
                                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Your Answer
                                              </p>
                                              <div className="p-4 bg-zinc-100/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5 font-medium text-sm">
                                                {q.answer?.trim() ? (
                                                  <MarkdownRenderer noProse>
                                                    {q.answer}
                                                  </MarkdownRenderer>
                                                ) : <span className="italic opacity-50">No answer provided</span>}
                                              </div>
                                            </div>

                                            {q.feedback?.trim() && (
                                              <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                                                  Feedback
                                                </p>
                                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 font-medium italic text-sm text-foreground/80">
                                                  <MarkdownRenderer noProse>
                                                    {q.feedback}
                                                  </MarkdownRenderer>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10">
                                      <Activity className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                                      <p className="font-bold text-muted-foreground">Evaluation in progress</p>
                                      <p className="text-xs font-medium text-muted-foreground/60 mt-1 uppercase tracking-widest">Responses will appear once graded</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </motion.tr>
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
