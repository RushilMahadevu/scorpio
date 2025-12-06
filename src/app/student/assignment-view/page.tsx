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
import { ArrowLeft, Send, CheckCircle, Clock, AlertTriangle, Play } from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  type: "text" | "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer?: string;
  points?: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  questions: Question[];
  gradingType?: "ai" | "manual";
  timeLimit?: number;
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
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    async function fetchAssignment() {
      if (!id || !user) return;
      
      try {
        const docSnap = await getDoc(doc(db, "assignments", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          const assignmentData = {
            id: docSnap.id,
            title: data.title,
            description: data.description,
            dueDate: data.dueDate?.toDate?.() || new Date(data.dueDate),
            questions: data.questions || [],
            gradingType: data.gradingType || "ai",
            timeLimit: data.timeLimit,
          };
          setAssignment(assignmentData);

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
            setHasStarted(true); // Already submitted means started
            
            // Populate answers from existing submission
            const existingAnswers: Record<string, string> = {};
            existingData.answers?.forEach((ans: any) => {
              existingAnswers[ans.questionId] = ans.answer;
            });
            setAnswers(existingAnswers);
          } else {
            // Check for local start time if not submitted
            if (assignmentData.timeLimit) {
              const storedStart = localStorage.getItem(`assignment_start_${id}_${user.uid}`);
              if (storedStart) {
                const startTime = parseInt(storedStart);
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const remaining = (assignmentData.timeLimit * 60) - elapsed;
                
                if (remaining > 0) {
                  setTimeLeft(remaining);
                  setHasStarted(true);
                  setTimerActive(true);
                } else {
                  // Time expired while away
                  setTimeLeft(0);
                  setHasStarted(true);
                  // We should probably auto-submit here or show expired state
                  // For now, let's just set it to 0 and let the timer effect handle it
                }
              }
            } else {
              setHasStarted(true); // No timer, so "started" immediately
            }
          }
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssignment();
  }, [id, user]);

  // Timer Effect
  useEffect(() => {
    if (!timerActive || timeLeft === null) return;

    if (timeLeft <= 0) {
      setTimerActive(false);
      handleSubmit(); // Auto-submit
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleStartAssignment = () => {
    if (!assignment || !user) return;
    
    const now = Date.now();
    localStorage.setItem(`assignment_start_${assignment.id}_${user.uid}`, now.toString());
    
    if (assignment.timeLimit) {
      setTimeLeft(assignment.timeLimit * 60);
      setTimerActive(true);
    }
    setHasStarted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    if (!assignment) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / assignment.questions.length) * 100);
  };

  const handleSubmit = async () => {
    if (!assignment || !user) return;
    setSubmitting(true);

    try {
      const answersArray = assignment.questions.map((q) => ({
        questionId: q.id,
        questionText: q.text,
        answer: answers[q.id] || "",
      }));

      // Grade answers
      let totalScore = 0;
      let maxScore = 0;
      let gradedCount = 0;
      let gradedAnswers = answersArray;
      let isGraded = false;
      let finalScore = 0;

      if (assignment.gradingType === "ai") {
        gradedAnswers = await Promise.all(
          answersArray.map(async (ans) => {
            const question = assignment.questions.find((q) => q.id === ans.questionId);
            if (!question) return ans;

            const points = question.points || 10; // Default to 10 if not set
            maxScore += points;

            let score = 0;
            let feedback = "";

            if (question.type === "text" && ans.answer) {
              feedback = await gradeResponse(ans.questionText, ans.answer);
              const scoreMatch = feedback.match(/(\d+)\/10|\b(\d+)%/);
              let rawScore = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 70;
              
              // Normalize rawScore (which might be out of 10 or 100) to the question points
              if (rawScore <= 10) rawScore = (rawScore / 10) * 100; // Convert to percentage
              
              score = (rawScore / 100) * points;
            } else if (question.correctAnswer) {
              const isCorrect = ans.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
              score = isCorrect ? points : 0;
              feedback = isCorrect ? "Correct!" : `Incorrect. The correct answer was: ${question.correctAnswer}`;
            }

            totalScore += score;
            gradedCount++;
            return { ...ans, feedback, score, maxPoints: points };
          })
        );

        // Calculate final percentage score
        finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        isGraded = true;
      }

      await addDoc(collection(db, "submissions"), {
        assignmentId: assignment.id,
        studentId: user.uid,
        studentEmail: user.email,
        answers: gradedAnswers,
        submittedAt: new Date(),
        graded: isGraded,
        score: isGraded ? finalScore : null,
        totalPoints: maxScore,
        earnedPoints: totalScore
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

  if (!hasStarted && !submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Card className="text-center p-6">
          <CardHeader>
            <CardTitle className="text-2xl">{assignment.title}</CardTitle>
            <CardDescription className="text-lg mt-2">{assignment.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span>Time Limit</span>
              </div>
              <span className="text-2xl font-bold">
                {assignment.timeLimit ? `${assignment.timeLimit} Minutes` : "No Time Limit"}
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5" />
                <span>Total Questions</span>
              </div>
              <span className="text-2xl font-bold">{assignment.questions.length}</span>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm text-left">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <AlertTriangle className="h-4 w-4" />
                Important
              </div>
              <ul className="list-disc list-inside space-y-1">
                {assignment.timeLimit && <li>Once you start, the timer cannot be paused.</li>}
                <li>Do not refresh the page or close the browser window.</li>
                <li>Ensure you have a stable internet connection.</li>
              </ul>
            </div>

            <Button size="lg" className="w-full text-lg" onClick={handleStartAssignment}>
              <Play className="h-5 w-5 mr-2" />
              Start Assignment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
        <Link href="/student/assignments" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Progress</span>
            <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
          
          {timeLeft !== null && !submitted && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-secondary'}`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

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
              <div className="flex justify-between items-start">
                <Label className="text-base">Question {index + 1}</Label>
                <Badge variant="outline">{question.points || 10} pts</Badge>
              </div>
              <p className="text-sm mt-1">{question.text}</p>
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