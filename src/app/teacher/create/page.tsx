"use client";
// Fix for custom window property
declare global {
  interface Window {
    firebaseAuth?: any;
  }
}

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { parseQuestionsManually } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusCircle, Trash2, Sparkles, ListFilterPlus, Loader2, ChevronDown, ChevronUp, FileText, Copy, Lock, Eye, Waypoints, ShieldCheck, BrainCircuit, FileUp, HelpCircle, Info, CheckCircle2, Bot } from "lucide-react";
import { toast } from "sonner";
import { Organization } from "@/lib/types";
import { MarkdownRenderer } from "@/components/markdown-renderer";
// Collapsible section for advanced options
function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded mb-4">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2 bg-muted hover:bg-muted/70 font-medium text-left cursor-pointer"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}
import { MathInputField } from "@/components/math-input";

interface Question {
  id: string;
  text: string;
  type: "text" | "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export default function CreateAssignmentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
      <CreateAssignmentForm />
    </Suspense>
  );
}

function CreateAssignmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forkId = searchParams?.get("fork");
  const { user, profile, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | "">("");
  const [gradingType, setGradingType] = useState<"ai" | "manual">("manual");
  const [visibility, setVisibility] = useState<"private" | "network" | "global">("private");
  const [topic, setTopic] = useState<string>("other");
  const [requireWorkSubmission, setRequireWorkSubmission] = useState(false);
  const [allowAIHelp, setAllowAIHelp] = useState(false);
  const [enableTabDetection, setEnableTabDetection] = useState(true);
  const [lockdownMode, setLockdownMode] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [rubric, setRubric] = useState("");

  const isFreePlan = authLoading || !organization || organization.planId === "free";

  useEffect(() => {
    async function fetchOrg() {
      if (profile?.organizationId) {
        try {
          const orgSnap = await getDoc(doc(db, "organizations", profile.organizationId));
          if (orgSnap.exists()) {
            setOrganization({ id: orgSnap.id, ...orgSnap.data() } as Organization);
          }
        } catch (e) {
          console.error("Error fetching organization", e);
        }
      }
    }
    fetchOrg();
  }, [profile?.organizationId]);

  useEffect(() => {
    if (forkId === "true") {
      const stored = sessionStorage.getItem("forked_assignment");
      if (stored) {
        try {
          const assignment = JSON.parse(stored);
          setTitle(`${assignment.title} (Copy)`);
          setDescription(assignment.description || "");
          setVisibility("private"); // Default to private for copies
          if (assignment.questions) {
            setQuestions(assignment.questions.map((q: any) => ({
              ...q,
              id: crypto.randomUUID()
            })));
          }
          toast.success("Assignment forked! Choose a class to assign it.");
          // We'll keep it in sessionStorage for now in case of refresh
        } catch (e) {
          console.error("Error parsing forked assignment", e);
        }
      }
    }
  }, [forkId]);

  useEffect(() => {
    async function fetchCourses() {
      if (!user) return;
      try {
        const q = query(collection(db, "courses"), where("teacherId", "==", user.uid));
        const snap = await getDocs(q);
        setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error("Error fetching courses", e); }
    }
    fetchCourses();
  }, [user]);

  // AI Generation State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState(""); const [aiContext, setAiContext] = useState(""); const [aiCount, setAiCount] = useState(3);
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiQuestionType, setAiQuestionType] = useState("mixed");
  const [aiLoading, setAiLoading] = useState(false);

  // Import from Text State
  // Cleanup or final actions can be placed here if needed
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importLoading, setImportLoading] = useState(false);

  const handleImportQuestions = async () => {
    if (!importText.trim()) {
      alert("Please paste some text to import questions.");
      return;
    }
    setImportLoading(true);
    try {
      let parsedQuestions: any[] = [];
      // Try manual parser first
      try {
        parsedQuestions = parseQuestionsManually(importText);
        if (parsedQuestions.length > 0) {
          console.log("Successfully parsed with manual parser");
        } else {
          throw new Error("Manual parser found no questions");
        }
      } catch (manualError) {
        console.log("Manual parsing failed, trying AI parser...", manualError);
        // Fall back to AI parsing
        const res = await fetch("/api/ai/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: importText, userId: user?.uid }),
        });

        if (!res.ok) {
          let errMsg = "AI Parsing failed";
          try {
            const err = await res.json();
            errMsg = err.error || errMsg;
          } catch (e) {
            errMsg = `Parsing error (${res.status})`;
          }
          throw new Error(errMsg);
        }

        const result = await res.json();
        parsedQuestions = result.questions;
      }
      const newQuestions = parsedQuestions.map((q: any) => ({
        id: crypto.randomUUID(),
        text: q.text,
        type: q.type,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        points: 10,
      }));
      setQuestions([...questions, ...newQuestions]);
      setImportOpen(false);
      setImportText("");
      toast.success(`Successfully imported ${newQuestions.length} questions!`);
    } catch (error: any) {
      console.error("Failed to import questions", error);
      toast.error(error.message || "Failed to import questions. Please try again.");
    } finally {
      setImportLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        text: "",
        type: "text",
        options: [],
        points: 10,
      },
    ]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: [...(question.options || []), ""],
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const [aiGenerating, setAiGenerating] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSynthesizeRubric = async (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.text) return;

    setAiGenerating(questionId);
    try {
      const res = await fetch("/api/ai/synthesize-rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: question.text,
          topic: title || "Physics Problem",
          userId: user?.uid,
        }),
      });

      if (!res.ok) {
        let errMsg = "AI failed to generate a grading rubric.";
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch (e) {
          errMsg = `Rubric synthesis error (${res.status})`;
        }
        throw new Error(errMsg);
      }

      const { rubric } = await res.json();
      updateQuestion(questionId, { correctAnswer: rubric });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate rubric.");
    } finally {
      setAiGenerating(null);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiTopic) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          count: aiCount,
          difficulty: aiDifficulty,
          questionType: aiQuestionType,
          userId: user?.uid,
          context: aiContext,
        }),
      });

      if (!res.ok) {
        let errMsg = "Failed to generate questions.";
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch (e) {
          errMsg = `AI Generation API error (${res.status})`;
        }
        throw new Error(errMsg);
      }

      const result = await res.json();
      const generatedQuestions = result.questions;
      const newQuestions = generatedQuestions.map((q: any) => ({
        id: crypto.randomUUID(),
        text: q.text,
        type: q.type,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        points: q.points || 10,
      }));

      setQuestions([...questions, ...newQuestions]);
      setAiOpen(false);
      setAiTopic("");
      toast.success(`Successfully generated ${newQuestions.length} questions!`);
    } catch (error: any) {
      console.error("Failed to generate questions", error);
      toast.error(error.message || "Failed to generate questions. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      alert("Please select a class for this assignment.");
      return;
    }
    setLoading(true);
    try {
      // 1. Create assignment
      const assignmentRef = await addDoc(collection(db, "assignments"), {
        title,
        description,
        topic,
        teacherId: user?.uid,
        organizationId: profile?.organizationId || null,
        visibility,
        courseId: selectedCourseId,
        dueDate: new Date(dueDate),
        timeLimit: timeLimit === "" ? null : Number(timeLimit),
        gradingType,
        requireWorkSubmission,
        enableTabDetection,
        lockdownMode,
        allowAIHelp,
        questions,
        createdAt: new Date(),
        type: "standard",
        googleFormLink: null,
        rubric: rubric || null,
      });

      // 2. Fetch students enrolled in this course
      if (user?.uid && selectedCourseId) {
        const studentsSnap = await getDocs(query(collection(db, "students"), where("courseId", "==", selectedCourseId)));
        for (const studentDoc of studentsSnap.docs) {
          const student = studentDoc.data();
          if (student.email) {
            // 3. Send email via API route
            await fetch('/api/send-assignment-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: student.email,
                assignmentTitle: title,
                dueDate,
                assignmentLink: `/student/assignments/${assignmentRef.id}`,
              }),
            });
          }
        }
      } else {
        console.warn("Could not determine teacherId for sending assignment emails.");
      }

      router.push("/teacher/assignments");
    } catch (error) {
      console.error("Error creating assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header: Title and AI button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Create Assignment</h1>
            <p className="text-muted-foreground">Create a new physics assignment for your students.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Generate with AI Dialog */}
            <Dialog open={aiOpen} onOpenChange={setAiOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="cursor-pointer"
                  disabled={isFreePlan}
                  onClick={(e) => {
                    if (isFreePlan) {
                      e.preventDefault();
                      toast.error("AI Generation requires a Standard subscription.");
                    }
                  }}
                >
                  <ListFilterPlus className="h-4 w-4 mr-2" />
                  Generate with AI
                  {isFreePlan && <Lock className="ml-2 h-3 w-3" />}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ListFilterPlus className="h-5 w-5 text-primary" />
                    AI Question Generator
                  </DialogTitle>
                  <DialogDescription>
                    Provide a topic and context to automatically generate assignment questions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-topic">Focus Topic</Label>
                      <Input
                        id="ai-topic"
                        placeholder="e.g. Kinematics"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ai-count">Number of Questions</Label>
                      <Input
                        id="ai-count"
                        type="number"
                        min={1}
                        max={10}
                        value={aiCount}
                        onChange={(e) => setAiCount(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-context">Instructions or Learning Objectives (Optional)</Label>
                    <Textarea
                      id="ai-context"
                      placeholder="e.g. Focus on Newton's Second Law, include technical friction analysis..."
                      value={aiContext}
                      onChange={(e) => setAiContext(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Difficulty Level</Label>
                      <RadioGroup value={aiDifficulty} onValueChange={setAiDifficulty} className="flex gap-4">
                        {['Easy', 'Medium', 'Hard'].map((diff) => (
                          <div key={diff} className="flex items-center space-x-2">
                            <RadioGroupItem value={diff} id={`diff-${diff}`} />
                            <Label htmlFor={`diff-${diff}`} className="text-sm font-normal">{diff}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <RadioGroup value={aiQuestionType} onValueChange={setAiQuestionType} className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'mixed', label: 'Mixed' },
                          { value: 'multiple-choice', label: 'Multiple Choice' },
                          { value: 'true-false', label: 'True/False' },
                          { value: 'short-answer', label: 'Short Answer' },
                          { value: 'text', label: 'Free Response' }
                        ].map((type) => (
                          <div key={type.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                            <Label htmlFor={`type-${type.value}`} className="text-xs font-normal">{type.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAiGenerate}
                    disabled={aiLoading || !aiTopic}
                    className="w-full sm:w-auto"
                  >
                    {aiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Questions
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Import from Text Dialog */}
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="cursor-pointer"
                  disabled={isFreePlan}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Import from Text
                  {isFreePlan && <Lock className="ml-2 h-3 w-3" />}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl w-full">
                <DialogHeader>
                  <DialogTitle>Import Questions from Text</DialogTitle>
                  <DialogDescription>
                    Paste questions copied from Google Forms, Word, or other sources. The AI will extract and format them.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Import with Text is still in production and might be buggy
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>This feature is experimental. If you encounter issues, please try again or use the manual question creation.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste your questions here..."
                    rows={15}
                    className="w-full h-64 max-h-[600px] resize-y overflow-auto whitespace-pre-wrap"
                    style={{ fontFamily: 'monospace', fontSize: '1rem' }}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleImportQuestions} disabled={importLoading || !importText}>
                    {importLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Import
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Full Preview Toggle */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
              className="cursor-pointer hover:bg-zinc-100 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Assignment
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-zinc-200 shadow-sm overflow-hidden">
            {gradingType === "ai" && (
              <div className="absolute top-0 right-0 p-4">
                <Badge variant="outline" className="text-[10px] font-medium border-primary/20 bg-primary/5">
                  AI GRADING ENABLED
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
              <CardDescription>Basic information for the assignment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Assignment Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Unit 1: Kinematics"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Class / Section <span className="text-destructive">*</span></Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Select a class..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length === 0 ? (
                        <SelectItem value="none" disabled>No classes found.</SelectItem>
                      ) : (
                        courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date <span className="text-destructive">*</span></Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (Minutes)</Label>
                  <div className="relative">
                    <Input
                      id="timeLimit"
                      type="number"
                      min="0"
                      placeholder="Unlimited"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value === "" ? "" : parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Subject</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger id="topic">
                      <SelectValue placeholder="Select a topic..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kinematics">Kinematics</SelectItem>
                      <SelectItem value="dynamics">Dynamics (Newton's Laws)</SelectItem>
                      <SelectItem value="energy">Energy & Momentum</SelectItem>
                      <SelectItem value="thermo">Thermodynamics</SelectItem>
                      <SelectItem value="em">Electricity & Magnetism</SelectItem>
                      <SelectItem value="waves">Waves & Optics</SelectItem>
                      <SelectItem value="modern">Modern Physics</SelectItem>
                      <SelectItem value="other">General / Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrity and Tutoring Settings - Pulled out of Advanced */}
          <Card className="border-primary/10 bg-primary/5 shadow-none overflow-hidden ring-1 ring-primary/5">
            <CardHeader className="py-4 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Integrity & Intelligence Guard
              </CardTitle>
              <CardDescription className="text-[10px]">Critical settings affecting student performance and academic honesty.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="lockdownMode"
                      checked={lockdownMode}
                      onCheckedChange={(checked) => setLockdownMode(!!checked)}
                    />
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="lockdownMode" className="text-xs font-bold flex items-center gap-1.5">
                        <Lock className="h-3 w-3" />
                        Lockdown
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] p-0 overflow-hidden border-red-200 shadow-2xl rounded-2xl">
                          <div className="bg-red-600 p-4 text-white">
                            <p className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                              <Lock className="h-3.5 w-3.5" />
                              Strict Integrity Mode
                            </p>
                          </div>
                          <div className="p-4 space-y-2.5 bg-white dark:bg-zinc-950">
                            <p className="text-[10px] font-medium leading-relaxed text-muted-foreground italic">
                              Used for high-stakes assessments.
                            </p>
                            <ul className="space-y-1.5 pt-1">
                              <li className="flex items-start gap-2 text-[10px] font-medium leading-tight text-zinc-600 dark:text-zinc-400">
                                <CheckCircle2 className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                                <span>Forces **Fullscreen** to participate.</span>
                              </li>
                              <li className="flex items-start gap-2 text-[10px] font-medium leading-tight text-zinc-600 dark:text-zinc-400">
                                <CheckCircle2 className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                                <span>Blocks **Copy, Paste, and Right-click**.</span>
                              </li>
                              <li className="flex items-start gap-2 text-[10px] font-medium leading-tight text-zinc-600 dark:text-zinc-400">
                                <CheckCircle2 className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                                <span>Requires approval to leave the view.</span>
                              </li>
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="enableTabDetection"
                      checked={enableTabDetection}
                      onCheckedChange={(checked) => setEnableTabDetection(!!checked)}
                    />
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="enableTabDetection" className="text-xs font-bold flex items-center gap-1.5">
                        <ShieldCheck className="h-3 w-3" />
                        Tab Detection
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] p-0 overflow-hidden border-orange-200 shadow-2xl rounded-2xl">
                          <div className="bg-orange-600 p-4 text-white">
                            <p className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Focus Monitoring
                            </p>
                          </div>
                          <div className="p-4 space-y-2.5 bg-white dark:bg-zinc-950">
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                              Detects when students minimize the window or focus on other applications.
                            </p>
                            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900/30">
                              <p className="text-[9px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-tighter">Violation Log</p>
                              <p className="text-[10px] text-orange-600 dark:text-orange-300 mt-1">
                                Each tab-switch is timestamped and flagged in your final report.
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                <div className={`flex flex-col gap-3 ${isFreePlan ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="allowAIHelp"
                      checked={allowAIHelp}
                      disabled={isFreePlan}
                      onCheckedChange={(checked) => setAllowAIHelp(!!checked)}
                    />
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="allowAIHelp" className="text-xs font-bold flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        AI Tutoring
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] p-0 overflow-hidden border-purple-200 shadow-2xl rounded-2xl">
                          <div className="bg-purple-600 p-4 text-white">
                            <p className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                              <Bot className="h-3.5 w-3.5" />
                              Socratic Assistance
                            </p>
                          </div>
                          <div className="p-4 space-y-2.5 bg-white dark:bg-zinc-950">
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                              Students can access **Scorpio AI** for conceptual hints during the task.
                            </p>
                            <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 border-t pt-2">
                              PEDAGOGICAL GUARDRAILS:
                            </p>
                            <p className="text-[10px] text-zinc-500 leading-tight">
                              The AI will guide students through the methodology without revealing final solutions.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="requireWork"
                      checked={requireWorkSubmission}
                      onCheckedChange={(checked) => setRequireWorkSubmission(!!checked)}
                    />
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="requireWork" className="text-xs font-bold flex items-center gap-1.5">
                        <FileUp className="h-3 w-3" />
                        Evidence
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] p-0 overflow-hidden border-emerald-200 shadow-2xl rounded-2xl">
                          <div className="bg-emerald-600 p-4 text-white">
                            <p className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                              <FileUp className="h-3.5 w-3.5" />
                              Process Submission
                            </p>
                          </div>
                          <div className="p-4 space-y-2.5 bg-white dark:bg-zinc-950">
                            <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                              Requires students to upload an artifact (PDF or Image) to complete their submission.
                            </p>
                            <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-md border border-emerald-100 dark:border-emerald-900/30">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Recommended for Show Your Work</p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructions & Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {gradingType === "ai" && (
                <div className="space-y-3 p-4 bg-muted/30 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rubric" className="text-sm font-semibold">Global Grading Rubric</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={async () => {
                        if (!title) {
                          toast.error("Please enter a title first.");
                          return;
                        }
                        setAiLoading(true);
                        try {
                          const prompt = `Generate a high-level grading rubric for an assignment titled "${title}". Focus on expectations for accuracy, units, and reasoning.`;
                          const response = await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              message: prompt,
                              userId: user?.uid,
                              userRole: 'teacher'
                            })
                          });

                          if (!response.ok) {
                            const err = await response.json();
                            throw new Error(err.error || "Failed to generate rubric.");
                          }

                          const data = await response.json();
                          setRubric(data.text);
                          toast.success("Rubric generated.");
                        } catch (e: any) {
                          toast.error(e.message || "Failed to generate rubric.");
                        } finally {
                          setAiLoading(false);
                        }
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-2" />
                      Generate Rubric
                    </Button>
                  </div>
                  <Textarea
                    id="rubric"
                    value={rubric}
                    onChange={(e) => setRubric(e.target.value)}
                    placeholder="General criteria for grading this assignment..."
                    rows={4}
                    className="bg-background text-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Learning objectives or instructions for students..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Collapsible advanced options */}
          <CollapsibleSection title="Advanced Configuration" defaultOpen={false}>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-1.5">
                      <Label className="font-bold text-sm">Course Visibility</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] p-4 space-y-2 border-primary/20 shadow-2xl rounded-2xl">
                          <p className="font-bold text-xs flex items-center gap-2 text-primary uppercase tracking-widest">
                            <Waypoints className="h-3.5 w-3.5" />
                            Sharing Options
                          </p>
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            Control who can access and fork this assignment.
                          </p>
                          <div className="space-y-2 pt-1 border-t">
                            <p className="text-[10px] font-medium leading-tight text-zinc-600 dark:text-zinc-400">
                              **Private**: Only you and your students.
                            </p>
                            <p className="text-[10px] font-medium leading-tight text-zinc-600 dark:text-zinc-400">
                              **Network**: Shared with your department colleagues.
                            </p>
                            <p className="text-[10px] font-medium leading-tight text-zinc-600 dark:text-zinc-400">
                              **Global**: Open to the entire Scorpio community.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black tracking-widest text-primary border-primary/20 bg-primary/5 uppercase">
                      Publishing
                    </Badge>
                  </div>

                  <RadioGroup value={visibility} onValueChange={(v) => setVisibility(v as "private" | "network" | "global")} className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-transparent hover:bg-muted/50 transition-colors cursor-pointer group">
                      <RadioGroupItem value="private" id="visible-private" className="mt-1" />
                      <div className="flex-grow">
                        <Label htmlFor="visible-private" className="cursor-pointer font-bold block text-sm">Private</Label>
                        <span className="text-xs text-muted-foreground">Only you and students in this class can access.</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-transparent hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="network" id="visible-network" disabled={!profile?.organizationId} className="mt-1" />
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="visible-network" className={`cursor-pointer font-bold block text-sm ${!profile?.organizationId ? 'text-muted-foreground' : ''}`}>
                            Department Network
                          </Label>
                          {!profile?.organizationId && <Badge variant="secondary" className="text-[10px]">LOCKED</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">Shared with colleagues in {profile?.organizationId || "your school"}.</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-transparent hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="global" id="visible-global" className="mt-1" />
                      <div className="flex-grow">
                        <Label htmlFor="visible-global" className="cursor-pointer font-bold block text-sm text-primary">Global Waypoint</Label>
                        <span className="text-xs text-muted-foreground">Contribute to the public library of verified benchmarks.</span>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-1.5">
                      <Label className="font-bold text-sm">Grading Logic</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px] p-4 space-y-2 border-primary/20 shadow-2xl rounded-2xl">
                          <p className="font-bold text-xs flex items-center gap-2 text-primary uppercase tracking-widest">
                            <BrainCircuit className="h-3.5 w-3.5" />
                            Review Strategy
                          </p>
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            Determines how submissions are evaluated.
                          </p>
                          <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">AI-Assisted</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">
                              Scorpio evaluates answers based on your rubric and drafting scores.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <RadioGroup
                    value={gradingType}
                    onValueChange={(v) => {
                      if (isFreePlan && v === "ai") {
                        toast.error("AI Grading requires a Standard subscription.");
                        return;
                      }
                      setGradingType(v as "ai" | "manual");
                    }}
                    className="space-y-3"
                  >
                    <div className={`flex items-start space-x-3 p-3 rounded-lg border border-transparent hover:bg-muted/50 transition-colors cursor-pointer ${isFreePlan ? 'opacity-60' : ''}`}>
                      <RadioGroupItem value="ai" id="grading-ai" disabled={isFreePlan} className="mt-1" />
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="grading-ai" className="cursor-pointer font-bold block text-sm">AI-Assisted Grading</Label>
                          {isFreePlan && <Lock className="h-3 w-3" />}
                        </div>
                        <span className="text-xs text-muted-foreground">Automated feedback and scoring based on your rubric.</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-transparent hover:bg-muted/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="manual" id="grading-manual" className="mt-1" />
                      <div className="flex-grow">
                        <Label htmlFor="manual" className="cursor-pointer font-bold block text-sm">Manual Teacher Review</Label>
                        <span className="text-xs text-muted-foreground">Traditional grading workflow for maximum oversight.</span>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Ensure proper nesting of the Card component */}
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>Add questions to your assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Question {index + 1}</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Points</Label>
                          <Input
                            type="number"
                            value={question.points || 10}
                            onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 0 })}
                            className="w-12 h-8 text-xs px-1 text-center"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <MathInputField
                      value={question.text}
                      onChange={(value) => updateQuestion(question.id, { text: value })}
                      placeholder="Enter your question text here..."
                      rows={3}
                    />
                    <div className="flex flex-wrap gap-2">
                      {[
                        { type: "text", label: "Free Response" },
                        { type: "short-answer", label: "Short Answer" },
                        { type: "multiple-choice", label: "Multiple Choice" },
                        { type: "true-false", label: "True/False" },
                      ].map((btn) => (
                        <Button
                          key={btn.type}
                          type="button"
                          variant={question.type === btn.type ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            updateQuestion(question.id, btn.type === "true-false"
                              ? { type: btn.type as "true-false", options: ["True", "False"] }
                              : { type: btn.type as "text" | "multiple-choice" | "short-answer" })
                          }
                        >
                          {btn.label}
                        </Button>
                      ))}
                    </div>
                    {(question.type === "text" || question.type === "short-answer") && (
                      <div className="space-y-3 bg-muted/20 p-4 rounded-lg border border-dashed">
                        <div className="flex items-center justify-between gap-4">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Grading Guide / Correct Answer</Label>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            disabled={aiGenerating === question.id || !question.text}
                            onClick={() => handleSynthesizeRubric(question.id)}
                            className="h-auto p-0 text-xs text-primary"
                          >
                            {aiGenerating === question.id ? "Generating..." : "Generate with AI"}
                          </Button>
                        </div>
                        <Textarea
                          value={question.correctAnswer || ""}
                          onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                          placeholder="Explain what defines a correct answer for this question..."
                          className="text-sm bg-background min-h-[100px]"
                        />
                      </div>
                    )}

                    {question.type === "multiple-choice" && (
                      <div className="space-y-2 pl-4">
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-start gap-2">
                            <div className="flex-1">
                              <MathInputField
                                value={option}
                                onChange={(value) => updateOption(question.id, optionIndex, value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                rows={2}
                                compact={true}
                              />
                            </div>
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === option}
                              onChange={() => updateQuestion(question.id, { correctAnswer: option })}
                              className="mt-3"
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => addOption(question.id)}
                        >
                          Add Option
                        </Button>
                      </div>
                    )}
                    {question.type === "true-false" && (
                      <div className="pl-4 text-sm text-muted-foreground">
                        Options set to: True / False
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={addQuestion} className="w-full cursor-pointer">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading ? "Creating..." : "Create Assignment"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="cursor-pointer">
              Cancel
            </Button>
          </div>
        </form>

        {/* Full Assignment Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Student View Preview</DialogTitle>
              <DialogDescription>
                This is how your assignment will appear to students.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 py-4">
              <div className="space-y-2 border-b pb-6">
                <h2 className="text-3xl font-bold tracking-tight">{title || "Untitled Assignment"}</h2>
                <p className="text-muted-foreground">{description || "No description provided."}</p>
                <div className="flex gap-4 text-xs font-medium uppercase tracking-tighter text-muted-foreground pt-2">
                  <span>Due: {dueDate ? new Date(dueDate).toLocaleString() : "Not set"}</span>
                  {timeLimit && <span>Time Limit: {timeLimit} mins</span>}
                </div>
              </div>

              <div className="space-y-6">
                {questions.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground italic">No questions added yet.</p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <Card key={question.id} className="overflow-hidden border-zinc-200">
                      <CardHeader className="bg-muted/30 pb-4">
                        <div className="flex justify-between items-start">
                          <Label className="text-base font-bold">Question {index + 1}</Label>
                          <Badge variant="outline" className="font-mono">{question.points || 10} PTS</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-6">
                        <MarkdownRenderer>
                          {question.text || "*No question text entered.*"}
                        </MarkdownRenderer>

                        <div className="space-y-3">
                          {question.type === "multiple-choice" && (
                            <div className="grid gap-2">
                              {question.options?.map((option, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-3 p-3 rounded-lg border bg-zinc-50/50">
                                  <div className="w-4 h-4 rounded-full border border-zinc-300" />
                                  <MarkdownRenderer className="text-sm prose-p:my-0">{option || `Option ${oIdx + 1}`}</MarkdownRenderer>
                                </div>
                              ))}
                            </div>
                          )}
                          {question.type === "true-false" && (
                            <div className="grid gap-2">
                              {["True", "False"].map((option) => (
                                <div key={option} className="flex items-center gap-3 p-3 rounded-lg border bg-zinc-50/50">
                                  <div className="w-4 h-4 rounded-full border border-zinc-300" />
                                  <span className="text-sm">{option}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {(question.type === "text" || question.type === "short-answer") && (
                            <div className="p-4 rounded-lg border border-dashed bg-zinc-50/30 text-muted-foreground text-sm italic">
                              Student will provide a {question.type === "short-answer" ? "short" : "long"}-form response.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
              <Button onClick={() => setIsPreviewOpen(false)} variant="default" className="w-full sm:w-auto">
                Close Preview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
