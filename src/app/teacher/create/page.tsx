"use client";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { parseQuestionsManually } from "@/lib/assignment-parser";
import { getAssignmentPoints, splitAssignmentPoints } from "@/lib/assignment-points";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ChevronDown, Eye, FileDown, Loader2, Lock, Plus, Settings2, Sparkles, Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Organization } from "@/lib/types";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MathInputField } from "@/components/math-input";
import { TeacherPageHeader } from "@/components/teacher/workspace";
import { SmartDateTimePicker } from "@/components/ui/smart-datetime-picker";

function AdvancedSettings({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left hover:bg-muted/50 focus-visible:outline-ring focus-visible:outline-offset-[-2px] sm:px-6"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Settings2 className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="flex-1 space-y-1">
          <span className="block text-sm font-semibold">Advanced settings</span>
          <span className="block text-sm text-muted-foreground">Time limits, student tools, and sharing</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && <div className="divide-y border-t px-4 sm:px-6">{children}</div>}
    </div>
  );
}

interface Question {
  id: string;
  text: string;
  type: "text" | "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer?: string;
  points: number;
}

const QUESTION_TYPES = [
  { type: "text", label: "Free Response" },
  { type: "short-answer", label: "Short Answer" },
  { type: "multiple-choice", label: "Multiple Choice" },
  { type: "true-false", label: "True/False" },
] as const;

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
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [timeLimit, setTimeLimit] = useState<number | "">("");
  const [visibility, setVisibility] = useState<"private" | "network" | "global">("private");
  const [topic, setTopic] = useState<string>("other");
  const [requireWorkSubmission, setRequireWorkSubmission] = useState(false);
  const [allowAIHelp, setAllowAIHelp] = useState(false);
  const [allowCalculator, setAllowCalculator] = useState(false);
  const [enableTabDetection, setEnableTabDetection] = useState(true);
  const [lockdownMode, setLockdownMode] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const questionToFocus = useRef<string>(null);
  const [assignmentPoints, setAssignmentPoints] = useState(100);
  const [customPoints, setCustomPoints] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (questionToFocus.current) {
      document.getElementById(`question-${questionToFocus.current}`)?.focus();
      questionToFocus.current = null;
    }
  }, [questions]);

  const isFreePlan = authLoading || !organization || (
    organization.planId === "free" && (organization.aiBudgetLimit || 0) <= (organization.aiUsageCurrent || 0)
  );

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
          if (assignment.allowCalculator !== undefined) {
            setAllowCalculator(!!assignment.allowCalculator);
          }
          if (assignment.allowAIHelp !== undefined) {
            setAllowAIHelp(!!assignment.allowAIHelp);
          }
          if (assignment.questions?.length) {
            const copiedQuestions = assignment.questions.map((question: Question) => ({
              ...question,
              id: crypto.randomUUID(),
              points: question.points || 10,
            }));
            setQuestions(copiedQuestions);
            setAssignmentPoints(assignment.totalPoints ?? getAssignmentPoints(copiedQuestions));
            setCustomPoints(true);
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
      toast.error("Please paste some text to import questions.");
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
        const res = await authenticatedFetch("/api/ai/parse", {
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
        correctAnswer: q.correctAnswer ?? "",
        points: 10,
      }));
      setQuestions((current) => [...current, ...newQuestions]);
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
    const question: Question = {
      id: crypto.randomUUID(),
      text: "",
      type: "text",
      options: [],
      points: 10,
    };
    questionToFocus.current = question.id;
    setQuestions((current) => [...current, question]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((current) =>
      current.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions((current) => current.filter((q) => q.id !== id));
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
      const correctAnswer = question.correctAnswer && question.correctAnswer === question.options[optionIndex]
        ? value
        : question.correctAnswer;
      updateQuestion(questionId, { options: newOptions, correctAnswer: correctAnswer ?? "" });
    }
  };

  const [aiGenerating, setAiGenerating] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSynthesizeRubric = async (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.text) return;

    setAiGenerating(questionId);
    try {
      const res = await authenticatedFetch("/api/ai/synthesize-rubric", {
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
      const res = await authenticatedFetch("/api/ai/generate", {
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
        correctAnswer: q.correctAnswer ?? "",
        points: q.points || 10,
      }));

      setQuestions((current) => [...current, ...newQuestions]);
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

  const validTotal = Number.isSafeInteger(assignmentPoints) && assignmentPoints > 0;
  const evenlySplitPoints = splitAssignmentPoints(validTotal ? assignmentPoints : 0, questions.length);
  const scoredQuestions = customPoints
    ? questions
    : questions.map((question, index) => ({ ...question, points: evenlySplitPoints[index] }));
  const allocatedPoints = scoredQuestions.reduce((total, question) => total + question.points, 0);
  const remainingPoints = assignmentPoints - allocatedPoints;

  let pointsError = "";
  if (!validTotal) {
    pointsError = "Enter a positive whole number for the assignment total.";
  } else if (assignmentPoints < questions.length) {
    pointsError = "The assignment needs at least 1 point per question.";
  } else if (scoredQuestions.some(({ points }) => !Number.isSafeInteger(points) || points < 1)) {
    pointsError = "Give each question at least 1 whole point.";
  } else if (questions.length > 0 && remainingPoints !== 0) {
    const difference = Math.abs(remainingPoints);
    const pointCount = `${difference} ${difference === 1 ? "point" : "points"}`;
    pointsError = remainingPoints > 0
      ? `${pointCount} left to assign.`
      : `${pointCount} over the assignment total.`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error("Please select a class for this assignment.");
      return;
    }
    if (questions.length === 0 || pointsError) {
      toast.error(pointsError || "Add at least one question before creating the assignment.");
      return;
    }
    if (timeLimit !== "" && timeLimit < 0) {
      toast.error("Enter a time limit of 0 or more minutes in Advanced settings.");
      return;
    }
    setLoading(true);
    try {
      // 1. Create assignment
      const createResponse = await authenticatedFetch("/api/assignments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        title,
        description,
        topic,
        teacherId: user?.uid,
        organizationId: profile?.organizationId || null,
        visibility,
        courseId: selectedCourseId,
        dueDate: dueDate || new Date(),
        timeLimit: timeLimit === "" ? null : Number(timeLimit),
        gradingType: "manual",
        requireWorkSubmission,
        enableTabDetection,
        lockdownMode,
        allowAIHelp,
        allowCalculator,
        totalPoints: assignmentPoints,
        questions: scoredQuestions,
        createdAt: new Date(),
        type: "standard",
        googleFormLink: null,
        rubric: null,
      }) });

      if (!createResponse.ok) throw new Error((await createResponse.json()).error || "Could not create assignment");

      // The email notifications to students are now automatically handled in the background
      // by the Firebase Cloud Function 'onAssignmentCreated'.

      router.push("/teacher/assignments");
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Couldn’t create the assignment. Your changes are still here. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/teacher/assignments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Assignments
      </Link>
      <TeacherPageHeader title="Create assignment" />

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <form onSubmit={handleSubmit} className="space-y-6">

          <Card className="gap-5">
            <CardHeader className="px-4 sm:px-6">
              <h2 className="font-semibold">Assignment details</h2>
            </CardHeader>
            <CardContent className="space-y-5 px-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Unit 1 review"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem]">
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="course">Class</Label>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId} required>
                    <SelectTrigger id="course" className="w-full">
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length === 0 ? (
                        <SelectItem value="none" disabled>No classes found</SelectItem>
                      ) : (
                        courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <SmartDateTimePicker
                  value={dueDate?.toISOString()}
                  onChange={setDueDate}
                  label="Due date"
                  placeholder="e.g. Friday at 5 pm"
                />
                <div className="space-y-2">
                  <Label htmlFor="assignment-points">Total points</Label>
                  <Input
                    id="assignment-points"
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={assignmentPoints || ""}
                    onChange={(event) => setAssignmentPoints(event.target.valueAsNumber || 0)}
                    aria-invalid={!validTotal}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Student instructions <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What should students know before they start?"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="gap-5">
            <CardHeader className="flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6">
              <div>
                <h2 className="font-semibold">Questions</h2>
                <p className="mt-1 text-sm text-muted-foreground">Write your own, generate them, or import text.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Dialog open={aiOpen} onOpenChange={setAiOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" size="sm" variant="outline" disabled={isFreePlan} title={isFreePlan ? "Requires AI access" : undefined}>
                      <Sparkles />
                      Generate with AI
                      {isFreePlan && <Lock className="size-3" />}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        Generate questions
                      </DialogTitle>
                      <DialogDescription>
                        Choose a topic, then review the generated questions before assigning them.
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
                <Dialog open={importOpen} onOpenChange={setImportOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" size="sm" variant="outline" disabled={isFreePlan} title={isFreePlan ? "Requires AI access" : undefined}>
                      <FileDown />
                      Import text
                      {isFreePlan && <Lock className="size-3" />}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Import questions</DialogTitle>
                      <DialogDescription>
                        Paste questions from a document or form. Include answer choices and answer keys if you have them.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label htmlFor="question-import-text">Questions to import</Label>
                      <Textarea
                        id="question-import-text"
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder="Paste your questions here..."
                        rows={8}
                        className="max-h-[45dvh] resize-y"
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
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {questions.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
                  <div role="status" className="space-y-1">
                    <p className="text-sm font-semibold tabular-nums">
                      {allocatedPoints} / {assignmentPoints || 0} points assigned
                    </p>
                    <p className={pointsError ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                      {pointsError || (customPoints ? "Custom points per question" : "Points split evenly across questions")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!customPoints && !!pointsError}
                    onClick={() => {
                      if (!customPoints) setQuestions(scoredQuestions);
                      setCustomPoints(!customPoints);
                    }}
                  >
                    {customPoints ? "Split evenly" : "Customize points"}
                  </Button>
                </div>
              )}
              {scoredQuestions.map((question, index) => (
                <section
                  key={question.id}
                  aria-labelledby={`question-${question.id}`}
                  className="overflow-hidden rounded-lg border"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2 sm:px-4">
                    <h3 id={`question-${question.id}`} tabIndex={-1} className="scroll-mt-4 text-sm font-semibold">
                      Question {index + 1}
                    </h3>
                    <div className="flex items-center gap-2">
                      {customPoints ? (
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`points-${question.id}`}>Points</Label>
                          <Input
                            id={`points-${question.id}`}
                            type="number"
                            min={1}
                            step={1}
                            required
                            value={question.points || ""}
                            onChange={(event) => updateQuestion(question.id, { points: event.target.valueAsNumber || 0 })}
                            className="h-8 w-16"
                          />
                        </div>
                      ) : (
                        <Badge variant="secondary" className="tabular-nums">{question.points} pts</Badge>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeQuestion(question.id)}
                        aria-label={`Remove question ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4 p-3 sm:p-4">
                    <fieldset className="min-w-0">
                      <legend className="mb-2 text-sm font-medium">Question type</legend>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {QUESTION_TYPES.map(({ type, label }) => (
                          <Button
                            key={type}
                            type="button"
                            variant="outline"
                            aria-pressed={question.type === type}
                            className="h-auto min-h-9 whitespace-normal px-2 aria-pressed:border-primary/60 aria-pressed:bg-primary/10 aria-pressed:text-primary"
                            onClick={() => {
                              if (type === "true-false") {
                                updateQuestion(question.id, { type, options: ["True", "False"] });
                              } else if (type === "multiple-choice" && !question.options?.length) {
                                updateQuestion(question.id, { type, options: ["", ""] });
                              } else {
                                updateQuestion(question.id, { type });
                              }
                            }}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </fieldset>
                    <MathInputField
                      value={question.text}
                      onChange={(value) => updateQuestion(question.id, { text: value })}
                      ariaLabel={`Prompt for question ${index + 1}`}
                      placeholder="Write the question students will see"
                      rows={3}
                      defaultPreviewOpen={false}
                    />
                    {(question.type === "text" || question.type === "short-answer") && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Label htmlFor={`answer-${question.id}`}>
                            {question.type === "text" ? "Grading guide" : "Expected answer"}
                            <span className="font-normal text-muted-foreground">(optional)</span>
                          </Label>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            disabled={aiGenerating === question.id || !question.text}
                            onClick={() => handleSynthesizeRubric(question.id)}
                            className="h-auto p-0 text-xs"
                          >
                            {aiGenerating === question.id ? "Generating…" : "Generate with AI"}
                          </Button>
                        </div>
                        <Textarea
                          id={`answer-${question.id}`}
                          value={question.correctAnswer || ""}
                          onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                          placeholder={question.type === "text" ? "What should a correct response include?" : "Enter an answer to use when grading"}
                          rows={2}
                        />
                      </div>
                    )}

                    {question.type === "multiple-choice" && (
                      <fieldset className="min-w-0 space-y-3">
                        <legend className="mb-1 text-sm font-medium">Answer choices</legend>
                        <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer.</p>
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-start gap-3">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              aria-label={`Mark choice ${optionIndex + 1} as correct`}
                              checked={!!option.trim() && question.correctAnswer === option}
                              disabled={!option.trim()}
                              onChange={() => updateQuestion(question.id, { correctAnswer: option })}
                              className="mt-3.5 size-4 shrink-0 accent-primary"
                            />
                            <div className="min-w-0 flex-1">
                              <MathInputField
                                value={option}
                                onChange={(value) => updateOption(question.id, optionIndex, value)}
                                placeholder={`Choice ${optionIndex + 1}`}
                                rows={1}
                                compact
                              />
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(question.id)}
                        >
                          <Plus /> Add choice
                        </Button>
                      </fieldset>
                    )}
                    {question.type === "true-false" && (
                      <fieldset className="space-y-2">
                        <legend className="text-sm font-medium">Correct answer</legend>
                        <RadioGroup
                          aria-label="Correct answer"
                          value={typeof question.correctAnswer === "string" ? question.correctAnswer.trim().toLowerCase() : ""}
                          onValueChange={(value) => updateQuestion(question.id, { correctAnswer: value === "true" ? "True" : "False" })}
                          className="flex gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="true" id={`true-${question.id}`} />
                            <Label htmlFor={`true-${question.id}`}>True</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="false" id={`false-${question.id}`} />
                            <Label htmlFor={`false-${question.id}`}>False</Label>
                          </div>
                        </RadioGroup>
                      </fieldset>
                    )}
                  </div>
                </section>
              ))}
              <div className={questions.length ? "" : "flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-7 text-center"}>
                {questions.length === 0 && <p className="text-sm text-muted-foreground">No questions yet</p>}
                <Button type="button" variant={questions.length ? "outline" : "default"} onClick={addQuestion}>
                  <Plus />
                  {questions.length ? "Add another question" : "Add a question"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <AdvancedSettings>
            <section className="space-y-3 py-5" aria-labelledby="assignment-options-heading">
              <h2 id="assignment-options-heading" className="text-sm font-semibold">Assignment options</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger id="topic" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kinematics">Kinematics</SelectItem>
                      <SelectItem value="dynamics">Dynamics (Newton&apos;s Laws)</SelectItem>
                      <SelectItem value="energy">Energy &amp; Momentum</SelectItem>
                      <SelectItem value="thermo">Thermodynamics</SelectItem>
                      <SelectItem value="em">Electricity &amp; Magnetism</SelectItem>
                      <SelectItem value="waves">Waves &amp; Optics</SelectItem>
                      <SelectItem value="modern">Modern Physics</SelectItem>
                      <SelectItem value="other">General / Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min={0}
                    placeholder="Unlimited"
                    value={timeLimit}
                    onChange={(event) => setTimeLimit(event.target.value === "" ? "" : parseInt(event.target.value, 10))}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 py-5" aria-labelledby="student-tools-heading">
              <h2 id="student-tools-heading" className="text-sm font-semibold">Student tools and test security</h2>
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {[
                  { id: "allowCalculator", label: "Allow calculator", description: "Give students an on-screen scientific calculator.", checked: allowCalculator, setChecked: setAllowCalculator },
                  { id: "allowAIHelp", label: "Allow Raise hints", description: isFreePlan ? "Requires AI access." : "Give students guided hints as they work.", checked: allowAIHelp, setChecked: setAllowAIHelp, disabled: isFreePlan },
                  { id: "requireWork", label: "Require work upload", description: "Have students submit a photo or PDF of their work.", checked: requireWorkSubmission, setChecked: setRequireWorkSubmission },
                  { id: "enableTabDetection", label: "Track tab switching", description: "Record when students leave the assignment tab.", checked: enableTabDetection, setChecked: setEnableTabDetection },
                  { id: "lockdownMode", label: "Lockdown mode", description: "Require full screen and restrict copy and paste.", checked: lockdownMode, setChecked: setLockdownMode },
                ].map(({ id, label, description, checked, setChecked, disabled }) => (
                  <div key={id} className="flex items-start gap-2.5">
                    <Checkbox id={id} checked={checked} disabled={disabled} onCheckedChange={(value) => setChecked(value === true)} aria-describedby={`${id}-help`} className="mt-0.5" />
                    <div className="space-y-1">
                      <Label htmlFor={id}>{label}</Label>
                      <p id={`${id}-help`} className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3 py-5" aria-labelledby="sharing-heading">
              <h2 id="sharing-heading" className="text-sm font-semibold">Sharing</h2>
              <RadioGroup aria-labelledby="sharing-heading" value={visibility} onValueChange={(value) => setVisibility(value as typeof visibility)}>
                {[
                  { value: "private", label: "Private", description: "Keep this assignment out of the shared library." },
                  { value: "network", label: "School network", description: profile?.organizationId ? "Share a copy with teachers in your network." : "Requires a school network.", disabled: !profile?.organizationId },
                  { value: "global", label: "Global Waypoint", description: "Make a copy available in the shared Waypoints library." },
                ].map(({ value, label, description, disabled }) => (
                  <div key={value} className="flex items-start gap-2.5">
                    <RadioGroupItem value={value} id={`visible-${value}`} disabled={disabled} aria-describedby={`visible-${value}-help`} className="mt-0.5" />
                    <div className="space-y-1">
                      <Label htmlFor={`visible-${value}`}>{label}</Label>
                      <p id={`visible-${value}-help`} className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </section>
          </AdvancedSettings>

          <div className="z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-3 shadow-sm sm:sticky sm:bottom-20 sm:px-4">
            <p className="text-sm text-muted-foreground">
              {questions.length} {questions.length === 1 ? "question" : "questions"}
              {validTotal && <> <span aria-hidden="true">·</span> {assignmentPoints} {assignmentPoints === 1 ? "point" : "points"}</>}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <DialogTrigger asChild>
                <Button type="button" variant="outline"><Eye /> Preview</Button>
              </DialogTrigger>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                {loading ? "Creating…" : "Create assignment"}
              </Button>
            </div>
          </div>
        </form>

        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student preview</DialogTitle>
            <DialogDescription>
              Review the instructions, questions, and points before creating the assignment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8 py-4">
            <div className="space-y-2 border-b pb-6">
              <h2 className="text-3xl font-bold tracking-tight">{title || "Untitled Assignment"}</h2>
              <p className="text-muted-foreground">{description || "No description provided."}</p>
              <div className="flex flex-wrap gap-4 text-xs font-medium uppercase tracking-tighter text-muted-foreground pt-2">
                <span>Due {dueDate ? dueDate.toLocaleString() : "when created"}</span>
                {validTotal && <span>{assignmentPoints} points total</span>}
                {timeLimit && <span>Time Limit: {timeLimit} mins</span>}
              </div>
            </div>

            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground italic">No questions added yet.</p>
                </div>
              ) : (
                scoredQuestions.map((question, index) => (
                  <Card key={question.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-semibold">Question {index + 1}</h3>
                        <Badge variant="outline" className="font-mono">{question.points} PTS</Badge>
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
                              <div key={oIdx} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                <div className="w-4 h-4 rounded-full border border-muted-foreground/50" />
                                <MarkdownRenderer className="text-sm prose-p:my-0">{option || `Option ${oIdx + 1}`}</MarkdownRenderer>
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === "true-false" && (
                          <div className="grid gap-2">
                            {["True", "False"].map((option) => (
                              <div key={option} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                <div className="w-4 h-4 rounded-full border border-muted-foreground/50" />
                                <span className="text-sm">{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {(question.type === "text" || question.type === "short-answer") && (
                          <div className="p-4 rounded-lg border border-dashed bg-muted/30 text-muted-foreground text-sm italic">
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
              Close preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
