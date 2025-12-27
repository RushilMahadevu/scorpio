"use client";
// Fix for custom window property
declare global {
  interface Window {
    firebaseAuth?: any;
  }
}

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateAssignmentQuestions } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Trash2, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
// Collapsible section for advanced options
function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded mb-4">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2 bg-muted hover:bg-muted/70 font-medium text-left"
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | "">("");
  const [gradingType, setGradingType] = useState<"ai" | "manual">("manual");
  const [requireWorkSubmission, setRequireWorkSubmission] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGoogleForm, setIsGoogleForm] = useState(false);
  const [googleFormLink, setGoogleFormLink] = useState("");

  // AI Generation State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(3);
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiQuestionType, setAiQuestionType] = useState("mixed");
  const [aiLoading, setAiLoading] = useState(false);

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
    setLoading(true);
    try {
      // 1. Create assignment
      const assignmentRef = await addDoc(collection(db, "assignments"), {
        title,
        description,
        dueDate: new Date(dueDate),
        timeLimit: timeLimit === "" ? null : Number(timeLimit),
        gradingType,
        requireWorkSubmission,
        questions: isGoogleForm ? [] : questions,
        createdAt: new Date(),
        type: isGoogleForm ? "google-form" : "standard",
        googleFormLink: isGoogleForm ? googleFormLink : null,
      });

      // 2. Fetch all students for this teacher
      let teacherId = null;
      if (typeof window !== "undefined") {
        teacherId = localStorage.getItem("uid");
      }
      if (!teacherId && typeof window !== "undefined" && window.firebaseAuth) {
        teacherId = window.firebaseAuth.currentUser?.uid;
      }
      if (teacherId) {
        const studentsSnap = await getDocs(query(collection(db, "students"), where("teacherId", "==", teacherId)));
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Create Assignment</h1>
        <p className="text-muted-foreground mb-2">Create a new physics assignment for your students.</p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2">
          <Dialog open={aiOpen} onOpenChange={setAiOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
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
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>Basic information about the assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Newton's Laws Practice"
                required
              />
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
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
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
          </CardContent>
        </Card>

        {/* Collapsible advanced options */}
        <CollapsibleSection title="Advanced Options" defaultOpen={false}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Grading Type</Label>
              <RadioGroup value={gradingType} onValueChange={(v) => setGradingType(v as "ai" | "manual")} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ai" id="grading-ai" />
                  <Label htmlFor="grading-ai">AI Graded</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="grading-manual" />
                  <Label htmlFor="grading-manual">Teacher Graded</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                AI Graded assignments are graded immediately upon submission. Teacher Graded assignments require manual review.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requireWork"
                checked={requireWorkSubmission}
                onChange={(e) => setRequireWorkSubmission(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="requireWork" className="cursor-pointer">
                Require students to submit work (PDF/Images)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              When enabled, students must upload their work (PDFs or images) to submit the assignment. For timed tests, students will have 5 additional minutes after time expires to upload their work.
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="googleFormAssignment"
                checked={isGoogleForm}
                onChange={(e) => setIsGoogleForm(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="googleFormAssignment" className="cursor-pointer">
                Google Form Assignment
              </Label>
            </div>
            {isGoogleForm && (
              <div className="space-y-2">
                <Label htmlFor="googleFormLink">Google Form Link</Label>
                <Input
                  id="googleFormLink"
                  value={googleFormLink}
                  onChange={(e) => setGoogleFormLink(e.target.value)}
                  placeholder="Paste the Google Form link here"
                  required={isGoogleForm}
                />
                <p className="text-xs text-muted-foreground">
                  Students will complete this assignment via the provided Google Form.
                </p>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {!isGoogleForm && (
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
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
              <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Assignment"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
