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

export default function GradeSubmissionPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
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
    if (!submission || !id) return;
    setSaving(true);

    try {
      // Calculate total score
      const totalScore = Object.values(grades).reduce((a, b) => a + b, 0);
      const averageScore = submission.answers.length > 0 
        ? Math.round(totalScore / submission.answers.length) 
        : 0;

      // Update answers with new grades/feedback
      const updatedAnswers = submission.answers.map(ans => ({
        ...ans,
        score: grades[ans.questionId] || 0,
        feedback: feedback[ans.questionId] || ""
      }));

      await updateDoc(doc(db, "submissions", id), {
        answers: updatedAnswers,
        score: averageScore,
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

      <div className="space-y-6">
        {submission.answers.map((ans, index) => (
          <Card key={ans.questionId}>
            <CardHeader>
              <CardTitle className="text-base">Question {index + 1}</CardTitle>
              <CardDescription className="text-foreground font-medium mt-2">
                {ans.questionText}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <Label className="text-xs text-muted-foreground uppercase mb-1 block">Student Answer</Label>
                <p className="whitespace-pre-wrap">{ans.answer || "(No answer provided)"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label htmlFor={`score-${ans.questionId}`}>Score (0-100)</Label>
                  <Input
                    id={`score-${ans.questionId}`}
                    type="number"
                    min="0"
                    max="100"
                    value={grades[ans.questionId] ?? ""}
                    onChange={(e) => setGrades({ ...grades, [ans.questionId]: parseInt(e.target.value) || 0 })}
                  />
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
        ))}
      </div>
    </div>
  );
}
