"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { gradeResponse } from "@/lib/gemini";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  type: "text" | "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  questions: Question[];
}

function AssignmentDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  useEffect(() => {
    async function fetchAssignment() {
      if (!id || !user) return;
      
      try {
        const docSnap = await getDoc(doc(db, "assignments", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAssignment({
            id: docSnap.id,
            title: data.title,
            description: data.description,
            dueDate: data.dueDate?.toDate?.() || new Date(data.dueDate),
            questions: data.questions || [],
          });
        }

        // Check for existing submission
        const submissionsQuery = query(
          collection(db, "submissions"),
          where("assignmentId", "==", id),
          where("studentId", "==", user.uid)
        );
        const submissionsSnap = await getDocs(submissionsQuery);
        if (!submissionsSnap.empty) {
          const existingData = submissionsSnap.docs[0].data();
          setExistingSubmission(existingData);
          setSubmitted(true);
          
          // Populate answers from existing submission
          const existingAnswers: Record<string, string> = {};
          existingData.answers?.forEach((ans: any) => {
            existingAnswers[ans.questionId] = ans.answer;
          });
          setAnswers(existingAnswers);
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignment();
  }, [id, user]);

  const handleSubmit = async () => {
    if (!assignment || !user) return;
    setSubmitting(true);

    try {
      const answersArray = assignment.questions.map((q) => ({
        questionId: q.id,
        questionText: q.text,
        answer: answers[q.id] || "",
      }));

      // Use AI to grade free-response answers
      let totalScore = 0;
      const gradedAnswers = await Promise.all(
        answersArray.map(async (ans) => {
          const question = assignment.questions.find((q) => q.id === ans.questionId);
          if (question?.type === "text" && ans.answer) {
            const feedback = await gradeResponse(ans.questionText, ans.answer);
            // Extract a simple score from feedback (this is a basic implementation)
            const scoreMatch = feedback.match(/(\d+)\/10|\b(\d+)%/);
            const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 70;
            totalScore += score;
            return { ...ans, feedback, score };
          }
          return ans;
        })
      );

      const averageScore = assignment.questions.length > 0 
        ? Math.round(totalScore / assignment.questions.filter(q => q.type === "text").length) 
        : 0;

      await addDoc(collection(db, "submissions"), {
        assignmentId: assignment.id,
        studentId: user.uid,
        studentEmail: user.email,
        answers: gradedAnswers,
        submittedAt: new Date(),
        graded: true,
        score: averageScore,
      });

      setSubmitted(true);
      router.push("/student/submissions");
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!assignment) {
    return <p className="text-destructive">Assignment not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/student/assignments" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Assignments
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{assignment.title}</CardTitle>
              <CardDescription>{assignment.description}</CardDescription>
            </div>
            {submitted && (
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Submitted
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {assignment.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <Label className="text-base">Question {index + 1}</Label>
              <p className="text-sm">{question.text}</p>
            </CardHeader>
            <CardContent>
              {question.type === "multiple-choice" && question.options ? (
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                  disabled={submitted}
                >
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                      <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : question.type === "true-false" ? (
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                  disabled={submitted}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="True" id={`${question.id}-true`} />
                    <Label htmlFor={`${question.id}-true`}>True</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="False" id={`${question.id}-false`} />
                    <Label htmlFor={`${question.id}-false`}>False</Label>
                  </div>
                </RadioGroup>
              ) : question.type === "short-answer" ? (
                <Input
                  value={answers[question.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  placeholder="Type your answer here..."
                  disabled={submitted}
                />
              ) : (
                <Textarea
                  value={answers[question.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  placeholder="Type your answer here..."
                  rows={4}
                  disabled={submitted}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!submitted && (
        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? "Submitting..." : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Assignment
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export default function AssignmentDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssignmentDetailContent />
    </Suspense>
  );
}