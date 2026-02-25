"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, query, where, getDocs, setDoc } from "firebase/firestore";
import { db, uploadFilesToStorage, type WorkFile } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Send, CheckCircle, Clock, AlertTriangle, Play, Upload, X, FileText, Image as ImageIcon, Sparkles, BookOpen, AlertCircle, Save, Bot, Lightbulb, User, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { MathInputField } from "@/components/math-input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { helpSolveProblem } from "@/lib/gemini";
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
  allowAIHelp?: boolean;
  enableTabDetection?: boolean;
  type?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function AssignmentDetailContent() {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const id = searchParams ? searchParams.get("id") ?? "" : "";
  const router = useRouter();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [inGracePeriod, setInGracePeriod] = useState(false);

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  // Tab unfocus tracking
  const [unfocusCount, setUnfocusCount] = useState(0);
  const [showUnfocusPopup, setShowUnfocusPopup] = useState(false);
  const ignoreNextBlurRef = useState({ current: false })[0];
  const lastUploadClickTime = useRef<number>(0);

  useEffect(() => {
    const handleBlur = () => {
      // strict check for false
      if (assignment?.enableTabDetection === false) return; 

      if (ignoreNextBlurRef.current) {
        ignoreNextBlurRef.current = false;
        return;
      }

      // Check if blur is within 30 seconds of clicking upload button
      const now = Date.now();
      const timeSinceUploadClick = now - lastUploadClickTime.current;
      if (timeSinceUploadClick < 30000) { // 30 seconds in milliseconds
        return; // Ignore blur during file upload buffer period
      }

      setUnfocusCount((count) => count + 1);
      setShowUnfocusPopup(true);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [ignoreNextBlurRef, assignment]);

  useEffect(() => {
    async function fetchAssignment() {
      if (!id || !user) return;
      
      try {
        const docSnap = await getDoc(doc(db, "assignments", id));
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Check if student belongs to this teacher or course (New Strict Logic)
          const studentDoc = await getDoc(doc(db, "students", user.uid));
          const studentData = studentDoc.exists() ? studentDoc.data() : null;
          
          if (data.courseId) {
            // Strict Course Check
            if (studentData?.courseId !== data.courseId) {
               console.log("Unauthorized: Student not in this course");
               setLoading(false);
               return;
            }
          } else if (data.teacherId) {
            // Legacy Teacher Check
            if (!studentData || studentData.teacherId !== data.teacherId) {
               setLoading(false);
               return;
            }
          }

          const assignmentData = {
            id: docSnap.id,
            title: data.title,
            description: data.description,
            dueDate: data.dueDate?.toDate?.() || new Date(data.dueDate),
            questions: data.questions || [],
            gradingType: data.gradingType || "ai",
            timeLimit: data.timeLimit,
            requireWorkSubmission: data.requireWorkSubmission || false,
            allowAIHelp: data.allowAIHelp || false,
            enableTabDetection: data.enableTabDetection ?? true, // Default to true if not present
            type: data.type || "standard",
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
            setExistingSubmission({ ...existingData, id: submissionsSnap.docs[0].id });
            
            if (existingData.status === 'draft') {
                setSubmitted(false);
                setHasStarted(true);
            } else {
                setSubmitted(true);
                setHasStarted(true); // Already submitted means started
            }
            
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

  // AI Helper Logic
  const [aiHelperOpen, setAiHelperOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of AI messages
  useEffect(() => {
    if (scrollRef.current) {
        // Use scrollTo on the parent to avoid document-level jumping with scrollIntoView
        const container = scrollRef.current.parentElement;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
    }
  }, [aiMessages, aiLoading]);

  const handleAiSendMessage = async () => {
    if (!aiInput.trim() || aiLoading || !assignment) return;
    
    // Explicitly define the message structure to match ChatMessage interface
    const userMessage: ChatMessage = { 
      id: crypto.randomUUID(), 
      role: "user", 
      content: aiInput 
    };
    
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput("");
    setAiLoading(true);

    try {
        // Construct comprehensive context
        const assignmentContext = `ASSIGNMENT TITLE: ${assignment.title}
ASSIGNMENT DESCRIPTION: ${assignment.description}

ASSIGNMENT QUESTIONS:
${assignment.questions.map((q, i) => {
  const optionsStr = (q.type === 'multiple-choice' && q.options) 
    ? `\nOptions: ${q.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join(", ")}` 
    : "";
  return `QUESTION ${i + 1}:
Type: ${q.type}
Text: ${q.text || "[This question has no text description. Refer to the assignment title/description.]"}${optionsStr}`;
}).join("\n\n")}`;
        
        // Include current student answers in context if they exist
        const studentAnswersContext = Object.keys(answers).length > 0 
          ? `\n\nSTUDENT'S CURRENT ANSWERS (DRAFT):\n${assignment.questions.map((q, i) => answers[q.id] ? `Question ${i+1} Answer: ${answers[q.id]}` : "").filter(Boolean).join("\n")}`
          : "";
        
        const fullContext = assignmentContext + studentAnswersContext;
        
        // Map local ChatMessage to the format our API expects
        const historyForAi = aiMessages.map(m => ({ role: m.role, content: m.content }));
        
        const response = await fetch("/api/student/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage.content,
            userId: user?.uid,
            role: "student",
            mode: "tutor",
            chatHistory: historyForAi,
            assignmentContext: fullContext
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "AI service failed");
        }

        const data = await response.json();
        const responseText = data.response || "No response received.";
        
        const aiResponse: ChatMessage = { 
          id: crypto.randomUUID(), 
          role: "assistant", 
          content: responseText 
        };
        setAiMessages(prev => [...prev, aiResponse]);
    } catch (error) {
        console.error("AI Error:", error);
        setAiMessages(prev => [...prev, { 
          id: crypto.randomUUID(), 
          role: "assistant", 
          content: "I'm having trouble connecting right now. Please try again." 
        }]);
    } finally {
        setAiLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    files.forEach(file => {
      const isValidType = file.type === "application/pdf" || file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit (images will be compressed)
      
      if (!isValidType) {
        invalidFiles.push(`${file.name}: Invalid type (PDF or images only)`);
      } else if (!isValidSize) {
        invalidFiles.push(`${file.name}: Too large (max 10MB)`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      alert("Some files were not added:\n" + invalidFiles.join("\n"));
    }
    
    setUploadedFiles([...uploadedFiles, ...validFiles]);
    // Reset upload progress for new files
    setUploadProgress({});
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

  const handleSaveDraft = async () => {
    if (!assignment || !user) return;
    ignoreNextBlurRef.current = true;
    setSubmitting(true);
    try {
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

        const answersArray = assignment.questions.map((q) => ({
            questionId: q.id,
            questionText: q.text,
            answer: answers[q.id] || "",
        }));

        const submissionData = {
            assignmentId: assignment.id,
            studentId: user.uid,
            studentName: studentName,
            studentEmail: user.email,
            answers: answersArray,
            status: 'draft',
            updatedAt: new Date(),
        };

        if (existingSubmission?.id) {
            // Update existing draft
            await setDoc(doc(db, "submissions", existingSubmission.id), submissionData, { merge: true });
        } else {
            // Create new draft
            const docRef = await addDoc(collection(db, "submissions"), submissionData);
            setExistingSubmission({ ...submissionData, id: docRef.id });
        }
        alert("Draft saved!");
    } catch (error) {
        console.error("Error saving draft:", error);
        alert("Failed to save draft.");
    } finally {
        setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    setSubmitError(null);
    if (!assignment || !user) return;
    ignoreNextBlurRef.current = true;
    // Validate work submission
    if (assignment.requireWorkSubmission && uploadedFiles.length === 0) {
      alert("Please upload your work (PDF or images) before submitting.");
      return;
    }
    setSubmitting(true);
    setUploadProgress({}); // Reset progress

    try {
      // Upload files to Firebase Storage (Blaze plan compatible)
      let workFilesData: WorkFile[] = [];
      if (uploadedFiles.length > 0) {
        workFilesData = await uploadFilesToStorage(
          uploadedFiles,
          user.uid,
          (fileIndex, progress) => {
            setUploadProgress(prev => ({ ...prev, [fileIndex]: progress }));
          }
        );
      }

      const answersArray = assignment.questions.map((q) => ({
        questionId: q.id,
        questionText: q.text,
        answer: answers[q.id] || "",
      }));

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

      // Remove forbidden fields for student update
      const submissionData: any = {
        assignmentId: assignment.id,
        studentId: user.uid,
        studentName: studentName,
        studentEmail: user.email,
        answers: answersArray,
        submittedAt: new Date(),
        graded: false,
        totalPoints: assignment.questions.reduce((acc, q) => acc + (q.points || 10), 0),
        earnedPoints: null,
        workFiles: workFilesData,
        unfocusCount,
        status: 'submitted',
      };
      // Do not include score, feedback, gradedAnswers if present
      delete submissionData.score;
      delete submissionData.feedback;
      delete submissionData.gradedAnswers;

      let docRef;
      if (existingSubmission?.id) {
        docRef = doc(db, "submissions", existingSubmission.id);
        await setDoc(docRef, submissionData);
      } else {
        docRef = await addDoc(collection(db, "submissions"), submissionData);
      }

      // Trigger server-side grading
      if (assignment.gradingType === "ai") {
        try {
            await fetch('/api/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId: docRef.id })
            });
        } catch (gradeError) {
            console.error("Error triggering grading:", gradeError);
        }
      }

      setSubmitted(true);
      router.push("/student/submissions");
    } catch (error) {
      console.error("Error submitting:", error);
      setSubmitError(error instanceof Error ? error.message : String(error));
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
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden relative">
      <Dialog open={showUnfocusPopup}>
        <DialogContent 
          className={`sm:max-w-md border-2 ${unfocusCount <= 1 ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30" : "border-red-500 bg-red-50 dark:bg-red-950/30"}`}
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 text-lg font-bold ${unfocusCount <= 1 ? "text-yellow-700 dark:text-yellow-500" : "text-red-600"}`}>
              {unfocusCount <= 1 ? <AlertCircle className="h-6 w-6 text-yellow-600" /> : <AlertTriangle className="h-6 w-6 text-red-500" />}
              {unfocusCount <= 1 ? "Tab Switch Detected" : "Academic Integrity Violation"}
            </DialogTitle>
            <DialogDescription className={`pt-3 text-sm leading-relaxed ${unfocusCount <= 1 ? "text-yellow-800/80 dark:text-yellow-200/80" : "text-red-800/80 dark:text-red-200/80"}`}>
              {unfocusCount <= 1 ? (
                <div className="space-y-2 font-medium">
                  <p>It looks like you navigated away from the assignment tab.</p>
                  <p>Please remain on this page to ensure your assessment is completed without interruption. This is your first warning.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>Multiple instances of tab switching have been detected.</p>
                  <p className="font-bold underline text-red-700 dark:text-red-400">This event has been logged and your instructor has been notified.</p>
                  <p className="text-xs opacity-80 mt-2 italic">Continued violations may result in disciplinary action or a zero on this assessment.</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Button 
              size="lg"
              variant={unfocusCount <= 1 ? "default" : "destructive"} 
              onClick={() => setShowUnfocusPopup(false)}
              className="w-full sm:w-auto px-10 shadow-lg font-bold uppercase tracking-wide cursor-pointer"
            >
              {unfocusCount <= 1 ? "Return to Assignment" : "Acknowledge Violation"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel 
          id="main-content"
          order={1}
          defaultSize={aiHelperOpen && !isMobile ? 70 : 100} 
          className="h-full flex flex-col min-w-0"
        >
          <div className="flex-1 overflow-y-auto relative scroll-smooth">
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-6 pb-20">
              <div className="flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
        <Link href="/student/assignments" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs text-muted-foreground">Progress</span>
            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
              className="h-full bg-emerald-600 transition-all duration-500" 
              style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
          
          {timeLeft !== null && !submitted && (
            <div className="flex flex-col items-end gap-1">
              {inGracePeriod && (
                <span className="text-xs text-orange-600 font-semibold">GRACE PERIOD</span>
              )}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono font-bold text-sm ${inGracePeriod ? 'bg-orange-100 text-orange-600' : timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-secondary'}`}>
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timeLeft)}
              </div>
            </div>
          )}

          {assignment?.allowAIHelp && !submitted && (
            <Button
              variant={aiHelperOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setAiHelperOpen(!aiHelperOpen)}
              className={`cursor-pointer transition-all duration-300 ${
                aiHelperOpen 
                  ? "bg-black hover:bg-zinc-900 text-white shadow-md ring-2 ring-zinc-500/20 ring-offset-2" 
                  : "border-zinc-300 hover:border-zinc-500 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              <Sparkles className={`h-4 w-4 mr-1.5 ${aiHelperOpen ? "animate-pulse" : ""}`} />
              <span className="hidden xs:inline">AI Tutor</span>
              <span className="xs:hidden">AI</span>
            </Button>
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
                onClick={() => {
                  lastUploadClickTime.current = Date.now();
                  document.getElementById('workFiles')?.click();
                }}
                disabled={submitted}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              <span className="text-sm text-muted-foreground">
                PDF or Images (Max 10MB each, images will be compressed)
              </span>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files ({uploadedFiles.length})</Label>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                      <div className="flex items-center gap-2 flex-1">
                        {file.type === "application/pdf" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm truncate block">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                          {submitting && uploadProgress[index] !== undefined && (
                            <div className="mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress[index]}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground mt-1">
                                {uploadProgress[index] < 100 ? 'Uploading...' : 'Complete'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={submitted || submitting}
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
        <div className="flex flex-col gap-4">
          {submitError && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm text-center">
              Submission failed: {submitError}
            </div>
          )}
          <Button 
            onClick={handleSaveDraft} 
            disabled={submitting} 
            variant="outline"
            className="w-full"
          >
            Save Draft
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || (assignment.requireWorkSubmission && uploadedFiles.length === 0)} 
            className="w-full"
          >
            {submitting ? (
              Object.keys(uploadProgress).length > 0 ? 
                `Uploading... (${Math.round(Object.values(uploadProgress).reduce((a, b) => a + b, 0) / Object.keys(uploadProgress).length)}%)` :
                "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Assignment
              </>
            )}
          </Button>
        </div>
      )}
            </div>
          </div>
        </ResizablePanel>

        {!isMobile && aiHelperOpen && (
          <>
            <ResizableHandle withHandle className="bg-zinc-200 dark:bg-zinc-800" />
            <ResizablePanel 
              id="ai-tutor-panel"
              order={2}
              defaultSize={30} 
              minSize={20} 
              className="bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col h-full overflow-hidden"
            >
               {/* Desktop Sidebar Content */}
               <div className="p-4 h-16 border-b flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-sm">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs tracking-tight leading-none uppercase">Physics Tutor</h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Socratic Mode</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setAiHelperOpen(false)} className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <X className="h-4 w-4" />
                  </Button>
               </div>
               
               <div className="flex-1 overflow-y-auto px-4 pt-4">
                  <div className="space-y-6 pb-10">
                    {aiMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-white dark:bg-zinc-900 border shadow-sm flex items-center justify-center mb-6">
                          <Lightbulb className="h-8 w-8 text-zinc-400" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Need a hint?</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                          Instead of answers, I'll ask questions to help you unlock the logic behind these physics problems.
                        </p>
                        <div className="mt-8 w-full space-y-2">
                           <Button variant="outline" size="sm" className="w-full justify-start text-[11px] h-auto py-2.5 px-3 border-zinc-200 hover:bg-white dark:hover:bg-zinc-900 transition-all font-medium" onClick={() => { setAiInput("How do I start thinking about Question 1?"); handleAiSendMessage(); }}>
                              <ChevronRight className="h-3 w-3 mr-2 opacity-50" />
                              Approach to Question 1
                           </Button>
                           <Button variant="outline" size="sm" className="w-full justify-start text-[11px] h-auto py-2.5 px-3 border-zinc-200 hover:bg-white dark:hover:bg-zinc-900 transition-all font-medium" onClick={() => { setAiInput("What are the key principles for this topic?"); handleAiSendMessage(); }}>
                              <ChevronRight className="h-3 w-3 mr-2 opacity-50" />
                              Key Principles
                           </Button>
                        </div>
                      </div>
                    )}

                    {aiMessages.map((msg) => (
                      <motion.div
                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={msg.id}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`flex items-start gap-3 max-w-[95%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`mt-1 h-7 w-7 rounded-full shrink-0 flex items-center justify-center shadow-sm ${
                            msg.role === 'user' ? 'bg-zinc-900 text-white' : 'bg-white border dark:bg-zinc-800'
                          }`}>
                            {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-zinc-400" />}
                          </div>
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-sm border ${
                              msg.role === 'user'
                                ? 'bg-zinc-900 text-white border-transparent rounded-tr-none'
                                : 'bg-white dark:bg-zinc-900 text-foreground border-zinc-100 dark:border-zinc-800 rounded-tl-none'
                            }`}
                          >
                             <MarkdownRenderer className="text-sm leading-relaxed prose-sm dark:prose-invert prose-p:my-0.5 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800">{msg.content}</MarkdownRenderer>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {aiLoading && (
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-7 w-7 rounded-full bg-white border dark:bg-zinc-800 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center justify-center shadow-sm">
                          <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
               </div>

               <div className="p-4 bg-white dark:bg-zinc-900 border-t">
                  <div className="relative flex items-end gap-2">
                    <Textarea
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Ask for guidance..."
                      disabled={aiLoading}
                      rows={1}
                      className="min-h-[48px] max-h-[160px] pr-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 resize-none py-3.5 focus-visible:ring-zinc-900"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAiSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleAiSendMessage}
                      disabled={aiLoading || !aiInput.trim()} 
                      size="icon"
                      className="absolute right-1.5 bottom-1.5 h-9 w-9 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[8px] text-center mt-3 uppercase tracking-[0.2em] font-black text-zinc-300 dark:text-zinc-600">
                    AI Pedagogical Protocol Active
                  </p>
               </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && aiHelperOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAiHelperOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] bg-background z-[101] shadow-2xl flex flex-col"
            >
                <div className="p-4 border-b flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black">
                      <Bot className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-tight">AI Advisor</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setAiHelperOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-4 py-8">
                   <div className="space-y-6 pb-10">
                      {aiMessages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm border ${msg.role === 'user' ? 'bg-zinc-900 text-white rounded-tr-none border-transparent' : 'bg-white dark:bg-zinc-800 text-foreground rounded-tl-none border-zinc-100 dark:border-zinc-700'}`}>
                             <MarkdownRenderer>{msg.content}</MarkdownRenderer>
                          </div>
                        </div>
                      ))}
                      <div ref={scrollRef} />
                   </div>
                </div>

                <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-900 pb-10">
                   <div className="flex gap-2">
                      <Input 
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="rounded-full bg-white dark:bg-black p-6 shadow-md border-zinc-200"
                        onKeyDown={(e) => e.key === 'Enter' && handleAiSendMessage()}
                      />
                      <Button onClick={handleAiSendMessage} className="rounded-full h-12 w-12 p-0 bg-zinc-900 dark:bg-white">
                        <Send className="h-5 w-5" />
                      </Button>
                   </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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