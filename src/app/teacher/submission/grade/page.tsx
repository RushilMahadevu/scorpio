"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, type WorkFile } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, FileText, Image as ImageIcon, Download, Brain, Sparkles, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  type: "text" | "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface Answer {
  questionId: string;
  questionText: string;
  answer: string;
  score?: number;
  feedback?: string;
  reasoning?: string;
}

interface User {
  id: string;
  name: string;
  organizationId: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  submittedAt: Date;
  answers: Answer[];
  score: number | null;
  graded: boolean;
  workFiles?: WorkFile[];
  unfocusCount?: number;
}

interface Assignment {
  id: string;
  title: string;
  questions: Question[];
}

export default function GradeSubmissionPage() {
  const searchParams = useSearchParams();
  const id = searchParams ? searchParams.get('id') ?? "" : "";
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gradingQuestion, setGradingQuestion] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [aiReasoning, setAiReasoning] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchSubmission() {
      try {
        const docSnap = await getDoc(doc(db, "submissions", id!));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const sub = {
            id: docSnap.id,
            ...data,
            submittedAt: data.submittedAt?.toDate?.() || new Date(data.submittedAt),
          } as Submission;
          
          setSubmission(sub);

          // Fetch assignment details to get question metadata
          const assignmentDoc = await getDoc(doc(db, "assignments", data.assignmentId));
          if (assignmentDoc.exists()) {
            setAssignment({ id: assignmentDoc.id, ...assignmentDoc.data() } as Assignment);
          }

          // Initialize grades and feedback
          const initialGrades: Record<string, number> = {};
          const initialFeedback: Record<string, string> = {};
          const initialReasoning: Record<string, string> = {};
          sub.answers.forEach((ans) => {
            if (ans.score !== undefined) initialGrades[ans.questionId] = ans.score;
            if (ans.feedback) initialFeedback[ans.questionId] = ans.feedback;
            if (ans.reasoning) initialReasoning[ans.questionId] = ans.reasoning;
          });
          setGrades(initialGrades);
          setFeedback(initialFeedback);
          setAiReasoning(initialReasoning);
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmission();
  }, [id]);

  const handleAiGrade = async (questionId: string) => {
    if (!submission || !assignment) return;
    setGradingQuestion(questionId);

    try {
      // For now, we reuse the API or just call it for specific question
      // But the API grades the whole submission.
      // Let's create an "AI Assistant" effect or just call the grading API and refresh.
      // Actually, we can implement a specific AI grading logic here too.
      // But the best UX is to just trigger the global API if they want to re-evaluate everything
      // OR specifically grade one.
      
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: submission.id })
      });

      if (response.ok) {
        // Refresh the submission data
        const docSnap = await getDoc(doc(db, "submissions", submission.id));
        if (docSnap.exists()) {
          const updatedSub = docSnap.data() as Submission;
          const initialGrades: Record<string, number> = {};
          const initialFeedback: Record<string, string> = {};
          const initialReasoning: Record<string, string> = {};
          
          updatedSub.answers.forEach((ans) => {
            if (ans.score !== undefined) initialGrades[ans.questionId] = ans.score;
            if (ans.feedback) initialFeedback[ans.questionId] = ans.feedback;
            if (ans.reasoning) initialReasoning[ans.questionId] = ans.reasoning;
          });
          
          setGrades(initialGrades);
          setFeedback(initialFeedback);
          setAiReasoning(initialReasoning);
          setSubmission({ ...submission, answers: updatedSub.answers });
          toast.success("AI grading complete!");
        }
      } else {
        let errMsg = "AI grading failed.";
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch (e) {
          errMsg = `AI Grading API error (${response.status})`;
        }
        throw new Error(errMsg);
      }
    } catch (error: any) {
      console.error("AI Grading failed:", error);
      toast.error(error.message || "AI grading failed. Please check your account budget.");
    } finally {
      setGradingQuestion(null);
    }
  };

  const handleSave = async () => {
    if (!submission || !id || !assignment) return;
    setSaving(true);

    try {
      // Calculate total score based on earned points vs total possible points
      let totalEarnedPoints = 0;
      let totalPossiblePoints = 0;

      submission.answers.forEach(ans => {
        const question = assignment.questions.find(q => q.id === ans.questionId);
        if (question) {
          totalEarnedPoints += grades[ans.questionId] || 0;
          totalPossiblePoints += question.points;
        }
      });

      // Calculate percentage score (0-100)
      const percentageScore = totalPossiblePoints > 0 
        ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100)
        : 0;

      // Update answers with new grades/feedback
      const updatedAnswers = submission.answers.map(ans => ({
        ...ans,
        score: grades[ans.questionId] || 0,
        feedback: feedback[ans.questionId] || "",
        reasoning: aiReasoning[ans.questionId] || ""
      }));

      await updateDoc(doc(db, "submissions", id), {
        answers: updatedAnswers,
        score: percentageScore,
        totalEarnedPoints,
        totalPossiblePoints,
        graded: true,
        gradedAt: new Date()
      });

      router.back();
    } catch (error) {
      console.error("Error saving grades:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!id) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Error</h1>
            <p className="text-muted-foreground">No submission ID provided.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return <div>Submission not found</div>;
  }

  // Calculate current total score for display
  const calculateCurrentScore = () => {
    if (!assignment) return { earned: 0, total: 0, percentage: 0 };
    
    let totalEarned = 0;
    let totalPossible = 0;

    submission.answers.forEach(ans => {
      const question = assignment.questions.find(q => q.id === ans.questionId);
      if (question) {
        totalEarned += grades[ans.questionId] || 0;
        totalPossible += question.points;
      }
    });

    const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
    return { earned: totalEarned, total: totalPossible, percentage };
  };

  const currentScore = calculateCurrentScore();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Integrity Alert */}
      {submission.unfocusCount !== undefined && submission.unfocusCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900">
            <CardHeader className="py-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <CardTitle className="text-yellow-800 dark:text-yellow-500 text-sm font-bold">Integrity Alert</CardTitle>
                  <CardDescription className="text-yellow-700 dark:text-yellow-400/80 text-xs">
                    Student switched tabs <span className="font-bold">{submission.unfocusCount}</span> time{submission.unfocusCount === 1 ? '' : 's'}. This may indicate searching for answers.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px] tracking-wider uppercase">
                Grading Terminal
              </Badge>
              <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <span className="text-xs text-muted-foreground">Submission ID: {submission.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {submission.studentName || "Student Submission"}
            </h1>
            <p className="text-muted-foreground text-sm">
              Submitted on {submission.submittedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => handleAiGrade('all')} 
            variant="outline"
            disabled={gradingQuestion === 'all'}
            size="sm"
          >
            {gradingQuestion === 'all' ? (
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Re-grade with AI
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Grades"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence>
            {submission.answers.map((ans, index) => {
              const question = assignment?.questions.find(q => q.id === ans.questionId);
              const isMCQOrTrueFalse = question?.type === "multiple-choice" || question?.type === "true-false";
              const maxPoints = question?.points || 10;
              const isGrading = gradingQuestion === ans.questionId || gradingQuestion === 'all';

              return (
                <motion.div
                  key={ans.questionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
                    <div className="flex flex-col">
                      {/* Sub-Header */}
                      <div className="bg-muted/30 px-6 py-3 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-md bg-foreground flex items-center justify-center text-[10px] font-bold text-background">
                            {index + 1}
                          </div>
                          <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                            {question?.type || "Question"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="text-[10px] border-muted-foreground/30">
                             Max Points: {maxPoints}
                           </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6 space-y-6">
                        {/* Question Text */}
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Original Question</Label>
                          <div className="prose prose-zinc dark:prose-invert max-w-none text-sm">
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {ans.questionText}
                            </ReactMarkdown>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Student Answer */}
                          <div className="space-y-3 bg-muted/20 p-4 rounded-lg border">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Student Answer</Label>
                            <div className="prose prose-sm dark:prose-invert max-w-none min-h-[40px]">
                              {ans.answer ? (
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                  {ans.answer}
                                </ReactMarkdown>
                              ) : (
                                <span className="text-muted-foreground italic text-xs">No response provided.</span>
                              )}
                            </div>
                          </div>

                          {/* Correct Answer Reference */}
                          {question?.correctAnswer && (
                            <div className="space-y-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <Label className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                <CheckCircle className="h-3 w-3" />
                                Correct Answer Reference
                              </Label>
                              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                  {question.correctAnswer}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Analysis */}
                        {(aiReasoning[ans.questionId] || isGrading) && (
                          <div className="bg-primary/5 border border-primary/10 rounded-lg p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-[10px] uppercase font-bold text-primary">AI Reasoning / Grading logic</span>
                              </div>
                              {isGrading && (
                                <div className="flex items-center gap-2 text-[10px] font-medium text-primary animate-pulse">
                                  AI is grading...
                                </div>
                              )}
                            </div>
                            {!isGrading && aiReasoning[ans.questionId] && (
                              <div className="text-sm text-foreground/80 leading-relaxed italic">
                                "{aiReasoning[ans.questionId]}"
                              </div>
                            )}
                          </div>
                        )}

                        {/* Teacher Inputs */}
                        <div className="pt-4 border-t space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Points Earned</Label>
                                {isMCQOrTrueFalse ? (
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      variant={grades[ans.questionId] === maxPoints ? "default" : "outline"}
                                      size="sm"
                                      className="h-10 text-xs"
                                      onClick={() => setGrades({ ...grades, [ans.questionId]: maxPoints })}
                                    >
                                      Correct
                                    </Button>
                                    <Button
                                      variant={grades[ans.questionId] === 0 ? "destructive" : "outline"}
                                      size="sm"
                                      className="h-10 text-xs"
                                      onClick={() => setGrades({ ...grades, [ans.questionId]: 0 })}
                                    >
                                      Incorrect
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="relative group">
                                    <Input
                                      type="number"
                                      value={grades[ans.questionId] ?? ""}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setGrades({ ...grades, [ans.questionId]: Math.min(val, maxPoints) });
                                      }}
                                      className="h-10 bg-background rounded-lg font-mono text-base pr-12"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                      / {maxPoints}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="md:col-span-3 space-y-2">
                                 <Label className="text-[10px] uppercase font-bold text-muted-foreground">Feedback for Student</Label>
                                 <Textarea
                                   value={feedback[ans.questionId] || ""}
                                   onChange={(e) => setFeedback({ ...feedback, [ans.questionId]: e.target.value })}
                                   className="min-h-[100px] bg-background rounded-lg resize-none"
                                   placeholder="Add any specific feedback for the student..."
                                 />
                              </div>
                           </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Sidebar (Right) */}
        <div className="space-y-6">
          <div className="sticky top-6 space-y-6">
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Overall Score</CardTitle>
                <CardDescription className="text-[10px]">Points and percentage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight">
                    {currentScore.earned}
                  </span>
                  <span className="text-xl text-muted-foreground">points</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Percentage</span>
                    <span className="font-bold">{currentScore.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary" 
                      initial={{ width: 0 }}
                      animate={{ width: `${currentScore.percentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="pt-4 grid grid-cols-2 gap-4 border-t">
                   <div>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Possible</p>
                     <p className="text-sm font-medium">{currentScore.total}</p>
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</p>
                     <p className="text-sm font-medium">{currentScore.percentage >= 60 ? "Passing" : "Needs Review"}</p>
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Files Section */}
            {submission.workFiles && submission.workFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Student Work
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {submission.workFiles.map((file, index) => (
                    <div key={index} className="group p-2 bg-muted/30 border rounded-lg hover:border-primary/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {file.type === "application/pdf" ? (
                            <FileText className="h-4 w-4 text-red-500 shrink-0" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <p className="text-xs font-medium truncate w-32">{file.name}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = file.url;
                            link.download = file.name;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      {file.type.startsWith('image/') && (
                        <div className="mt-2 relative">
                          <img src={file.url} alt={file.name} className="w-full h-24 object-cover rounded" />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
