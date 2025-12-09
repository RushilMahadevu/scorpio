"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db, convertFilesToBase64, type WorkFile } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { gradeResponse } from "@/lib/gemini";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Send, CheckCircle, Clock, AlertTriangle, Play, Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { MathInputField } from "@/components/math-input";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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
  requireWorkSubmission?: boolean;
}

function AssignmentDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [googleFormLink, setGoogleFormLink] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [inGracePeriod, setInGracePeriod] = useState(false);
  
  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
            requireWorkSubmission: data.requireWorkSubmission || false,
            type: data.type || "standard",
            googleFormLink: data.googleFormLink || "",
          };
          setAssignment(assignmentData);
          if (data.type === "google-form" && data.googleFormLink) {
            setGoogleFormLink(data.googleFormLink);
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
      // If work submission is required and there are timed limits, enter grace period
      if (assignment?.requireWorkSubmission && assignment?.timeLimit) {
        setInGracePeriod(true);
        setTimeLeft(300); // 5 minutes = 300 seconds
        setTimerActive(true);
      } else {
        handleSubmit(); // Auto-submit
      }
      return;
    }

    // In grace period, auto-submit when time runs out
    if (inGracePeriod && timeLeft <= 0) {
      setTimerActive(false);
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, inGracePeriod, assignment]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    files.forEach(file => {
      const isValidType = file.type === "application/pdf" || file.type.startsWith("image/");
      const isValidSize = file.size <= 800 * 1024; // 800KB limit per file (Firestore has 1MB doc limit)
      
      if (!isValidType) {
        invalidFiles.push(`${file.name}: Invalid type (PDF or images only)`);
      } else if (!isValidSize) {
        invalidFiles.push(`${file.name}: Too large (max 800KB)`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      alert("Some files were not added:\n" + invalidFiles.join("\n"));
    }
    
    setUploadedFiles([...uploadedFiles, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
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
    
    // Validate work submission
    if (assignment.requireWorkSubmission && uploadedFiles.length === 0) {
      alert("Please upload your work (PDF or images) before submitting.");
      return;
    }
    
    setSubmitting(true);

    try {
      // Convert files to base64 (no Firebase Storage needed - free Spark plan compatible)
      let workFilesData: WorkFile[] = [];
      if (uploadedFiles.length > 0) {
        workFilesData = await convertFilesToBase64(uploadedFiles);
      }

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

      // Fetch student name from students collection
      let studentName = user.displayName || "";
      try {
        const studentDoc = await getDoc(doc(db, "students", user.uid));
        if (studentDoc.exists()) {
          studentName = studentDoc.data().name || studentName;
        }
      } catch (error) {
        console.error("Error fetching student name:", error);
      }

      await addDoc(collection(db, "submissions"), {
        assignmentId: assignment.id,
        studentId: user.uid,
        studentName: studentName,
        studentEmail: user.email,
        answers: gradedAnswers,
        submittedAt: new Date(),
        graded: isGraded,
        score: isGraded ? finalScore : null,
        totalPoints: maxScore,
        earnedPoints: totalScore,
        workFiles: workFilesData,
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

  // Google Form assignment rendering
  if (assignment.type === "google-form" && assignment.googleFormLink) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle>{assignment.title}</CardTitle>
            <CardDescription>{assignment.description}</CardDescription>
            <p className="text-sm text-muted-foreground">
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="my-6">
              <iframe
                src={assignment.googleFormLink}
                width="100%"
                height="700"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Google Form Assignment"
                allowFullScreen
              >
                Loading…
              </iframe>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Please complete the form above. Your teacher will enter your grade after you submit.
            </div>
          </CardContent>
        </Card>
      </div>
    );
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

            {assignment.requireWorkSubmission && (
              <div className="flex flex-col items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Upload className="h-5 w-5" />
                  <span className="font-semibold">Work Submission Required</span>
                </div>
                <span className="text-sm text-blue-600">Upload PDF or images</span>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm text-left">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <AlertTriangle className="h-4 w-4" />
                Important
              </div>
              <ul className="list-disc list-inside space-y-1">
                {assignment.timeLimit && <li>Once you start, the timer cannot be paused.</li>}
                {assignment.requireWorkSubmission && (
                  <li className="font-semibold">You must upload your work (PDF/images) to submit.</li>
                )}
                {assignment.requireWorkSubmission && assignment.timeLimit && (
                  <li>You'll have 5 extra minutes to upload work after time expires.</li>
                )}
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
            <div className="flex flex-col items-end gap-1">
              {inGracePeriod && (
                <span className="text-xs text-orange-600 font-semibold">GRACE PERIOD</span>
              )}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono font-bold ${inGracePeriod ? 'bg-orange-100 text-orange-600' : timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-secondary'}`}>
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
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
              <div className="prose prose-sm dark:prose-invert max-w-none mt-1">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {question.text}
                </ReactMarkdown>
              </div>
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
                <MathInputField
                  value={answers[question.id] || ""}
                  onChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                  placeholder="Type your answer here..."
                  disabled={submitted}
                  rows={2}
                />
              ) : (
                <MathInputField
                  value={answers[question.id] || ""}
                  onChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                  placeholder="Type your answer here..."
                  disabled={submitted}
                  rows={4}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!submitted && assignment.requireWorkSubmission && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Your Work {assignment.requireWorkSubmission && <span className="text-red-500">*</span>}
            </CardTitle>
            <CardDescription>
              {inGracePeriod 
                ? "Time's up! You have 5 minutes to upload your work before automatic submission."
                : "Upload PDFs or images of your work. Required to submit this assignment."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="workFiles"
                accept="application/pdf,image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={submitted}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('workFiles')?.click()}
                disabled={submitted}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              <span className="text-sm text-muted-foreground">
                PDF or Images (Max 800KB each)
              </span>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files ({uploadedFiles.length})</Label>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                      <div className="flex items-center gap-2">
                        {file.type === "application/pdf" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                        <span className="text-sm truncate max-w-xs">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={submitted}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!submitted && (
        <Button 
          onClick={handleSubmit} 
          disabled={submitting || (assignment.requireWorkSubmission && uploadedFiles.length === 0)} 
          className="w-full"
        >
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