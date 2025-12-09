"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

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
}

interface Assignment {
  id: string;
  title: string;
  questions: Question[];
}

export default function GradeSubmissionPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

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
          sub.answers.forEach((ans) => {
            if (ans.score !== undefined) initialGrades[ans.questionId] = ans.score;
            if (ans.feedback) initialFeedback[ans.questionId] = ans.feedback;
          });
          setGrades(initialGrades);
          setFeedback(initialFeedback);
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmission();
  }, [id]);

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
        feedback: feedback[ans.questionId] || ""
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Grade Submission</h1>
            <p className="text-muted-foreground">
              {submission.studentName || "Student"} • Submitted {submission.submittedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Grades"}
        </Button>
      </div>

      {assignment && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Current Score</CardTitle>
            <CardDescription>Total points earned out of possible points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{currentScore.earned}</span>
              <span className="text-2xl text-muted-foreground">/ {currentScore.total}</span>
              <span className="text-2xl font-semibold ml-4">({currentScore.percentage}%)</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {submission.answers.map((ans, index) => {
          const question = assignment?.questions.find(q => q.id === ans.questionId);
          const isMCQOrTrueFalse = question?.type === "multiple-choice" || question?.type === "true-false";
          const maxPoints = question?.points || 10;

          return (
            <Card key={ans.questionId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-base">Question {index + 1}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {question?.type === "multiple-choice" ? "Multiple Choice" :
                         question?.type === "true-false" ? "True/False" :
                         question?.type === "short-answer" ? "Short Answer" :
                         "Free Response"}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {maxPoints} {maxPoints === 1 ? "point" : "points"}
                      </Badge>
                    </div>
                    <CardDescription className="text-foreground font-medium mt-2">
                      {ans.questionText}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {question?.correctAnswer && (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-md">
                    <Label className="text-xs text-green-700 dark:text-green-400 uppercase mb-1 block">
                      Correct Answer
                    </Label>
                    <p className="text-green-900 dark:text-green-200 font-medium">
                      {question.correctAnswer}
                    </p>
                  </div>
                )}

                <div className="bg-muted p-4 rounded-md">
                  <Label className="text-xs text-muted-foreground uppercase mb-1 block">Student Answer</Label>
                  <p className="whitespace-pre-wrap">{ans.answer || "(No answer provided)"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    {isMCQOrTrueFalse ? (
                      <>
                        <Label htmlFor={`score-${ans.questionId}`}>Score</Label>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant={grades[ans.questionId] === maxPoints ? "default" : "outline"}
                            size="sm"
                            onClick={() => setGrades({ ...grades, [ans.questionId]: maxPoints })}
                          >
                            Correct ({maxPoints})
                          </Button>
                          <Button
                            type="button"
                            variant={grades[ans.questionId] === 0 ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => setGrades({ ...grades, [ans.questionId]: 0 })}
                          >
                            Incorrect (0)
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Label htmlFor={`score-${ans.questionId}`}>
                          Score (0-{maxPoints})
                        </Label>
                        <Input
                          id={`score-${ans.questionId}`}
                          type="number"
                          min="0"
                          max={maxPoints}
                          value={grades[ans.questionId] ?? ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setGrades({ ...grades, [ans.questionId]: Math.min(value, maxPoints) });
                          }}
                        />
                      </>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`feedback-${ans.questionId}`}>Feedback</Label>
                    <Textarea
                      id={`feedback-${ans.questionId}`}
                      placeholder="Enter feedback for the student..."
                      value={feedback[ans.questionId] || ""}
                      onChange={(e) => setFeedback({ ...feedback, [ans.questionId]: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
