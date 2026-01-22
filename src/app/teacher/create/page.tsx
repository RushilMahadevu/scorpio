"use client";
// Fix for custom window property
declare global {
  interface Window {
    firebaseAuth?: any;
  }
}

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { generateAssignmentQuestions, parseQuestionsFromText, parseQuestionsManually } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Trash2, Sparkles, Loader2, ChevronDown, ChevronUp, FileText } from "lucide-react";
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
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | "">("");
  const [gradingType, setGradingType] = useState<"ai" | "manual">("manual");
  const [requireWorkSubmission, setRequireWorkSubmission] = useState(false);
  const [allowAIHelp, setAllowAIHelp] = useState(false);
  const [enableTabDetection, setEnableTabDetection] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [rubric, setRubric] = useState("");

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
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(3);
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiQuestionType, setAiQuestionType] = useState("mixed");
  const [aiLoading, setAiLoading] = useState(false);

  // Import from Text State
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
        parsedQuestions = await parseQuestionsFromText(importText);
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
      alert(`Successfully imported ${newQuestions.length} questions!`);
    } catch (error) {
      console.error("Failed to import questions", error);
      alert(error instanceof Error ? error.message : "Failed to import questions. Please try again or paste fewer questions at once.");
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

  const handleAiGenerate = async () => {
    if (!aiTopic) return;
    setAiLoading(true);
    try {
      const generatedQuestions = await generateAssignmentQuestions(aiTopic, aiCount, aiDifficulty, aiQuestionType);
      const newQuestions = generatedQuestions.map((q: any) => ({
        id: crypto.randomUUID(),
        text: q.text,
        type: q.type,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        points: 10,
      }));
      
      setQuestions([...questions, ...newQuestions]);
      setAiOpen(false);
      setAiTopic("");
    } catch (error) {
      console.error("Failed to generate questions", error);
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
        teacherId: user?.uid,
        courseId: selectedCourseId,
        dueDate: new Date(dueDate),
        timeLimit: timeLimit === "" ? null : Number(timeLimit),
        gradingType,
        requireWorkSubmission,
        enableTabDetection,
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
                <Button variant="secondary" className="cursor-pointer">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Generate Questions with AI</DialogTitle>
                  <DialogDescription>
                    Enter a topic and let AI create questions for you.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Topic</Label>
                      <Input 
                        placeholder="e.g. Kinematics, Thermodynamics" 
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Questions</Label>
                      <Input 
                        type="number" 
                        min={1} 
                        max={10} 
                        value={aiCount}
                        onChange={(e) => setAiCount(parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <RadioGroup value={aiDifficulty} onValueChange={setAiDifficulty} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Easy" id="easy" />
                          <Label htmlFor="easy">Easy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Medium" id="medium" />
                          <Label htmlFor="medium">Medium</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Hard" id="hard" />
                          <Label htmlFor="hard">Hard</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <RadioGroup value={aiQuestionType} onValueChange={setAiQuestionType} className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mixed" id="mixed" />
                          <Label htmlFor="mixed">Mixed</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="multiple-choice" id="mcq" />
                          <Label htmlFor="mcq">Multiple Choice</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true-false" id="tf" />
                          <Label htmlFor="tf">True/False</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="short-answer" id="sa" />
                          <Label htmlFor="sa">Short Answer</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="text" id="text" />
                          <Label htmlFor="text">Free Response</Label>
                        </div>
                      </RadioGroup>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAiGenerate} disabled={aiLoading || !aiTopic}>
                      {aiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generate
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Import from Text Dialog */}
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Import from Text
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
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>Basic information and class settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Newton's Laws Practice"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Assign to Class <span className="text-destructive">*</span></Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger id="course" className="cursor-pointer">
                    <SelectValue placeholder="Select a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.length === 0 ? (
                      <SelectItem value="none" disabled>No classes found. Create one first.</SelectItem>
                    ) : (
                      courses.map(course => (
                        <SelectItem key={course.id} value={course.id} className="cursor-pointer">
                          {course.name} <span className="text-muted-foreground text-xs">({course.code})</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students need to do..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date <span className="text-destructive">*</span></Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="0"
                  placeholder="Optional (leave empty for no limit)"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value === "" ? "" : parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Set a time limit in minutes. Leave empty for no time limit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collapsible advanced options */}
        <CollapsibleSection title="Advanced Options" defaultOpen={false}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Grading Type</Label>
              <RadioGroup value={gradingType} onValueChange={(v) => setGradingType(v as "ai" | "manual")} className="flex gap-4">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="ai" id="grading-ai" className="cursor-pointer" />
                  <Label htmlFor="grading-ai" className="cursor-pointer font-normal">AI Graded</Label>
                </div>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <RadioGroupItem value="manual" id="grading-manual" className="cursor-pointer" />
                  <Label htmlFor="grading-manual" className="cursor-pointer font-normal">Teacher Graded</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                AI Graded assignments are graded immediately upon submission. Teacher Graded assignments require manual review.
              </p>
            </div>
            <div className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                id="requireWork"
                checked={requireWorkSubmission}
                onChange={(e) => setRequireWorkSubmission(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 cursor-pointer"
              />
              <Label htmlFor="requireWork" className="cursor-pointer font-normal">
                Require students to submit work (PDF/Images)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              When enabled, students must upload their work (PDFs or images) to submit the assignment. For timed tests, students will have 5 additional minutes after time expires to upload their work.
            </p>

            <div className="flex items-center space-x-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                id="allowAIHelp"
                checked={allowAIHelp}
                onChange={(e) => setAllowAIHelp(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 cursor-pointer"
              />
              <Label htmlFor="allowAIHelp" className="cursor-pointer font-normal">
                Allow AI Assistance (Beta)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              When enabled, students can use the AI tutor to get help with specific questions during the assignment.
            </p>

            <div className="flex items-center space-x-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                id="enableTabDetection"
                checked={enableTabDetection}
                onChange={(e) => setEnableTabDetection(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 cursor-pointer"
              />
              <Label htmlFor="enableTabDetection" className="cursor-pointer font-normal">
                Enable Tab/Focus Detection
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              When enabled, the system will track if a student leaves the assignment tab and warn/notify you of potential cheating.
            </p>

            <div className="space-y-2">
              <Label htmlFor="rubric">Rubric / Grading Criteria</Label>
              <Textarea
                id="rubric"
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                placeholder="Enter grading criteria or rubric details..."
                rows={4}
              />
            </div>
          </div>
        </CollapsibleSection>

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
                    <Label>Question {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <MathInputField
                    value={question.text}
                    onChange={(value) => updateQuestion(question.id, { text: value })}
                    placeholder="Enter your question..."
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
                        className="cursor-pointer"
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
    </div>
  );
}
