"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateAssignmentQuestions } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Trash2, Sparkles, Loader2 } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: "text" | "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer?: string;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [gradingType, setGradingType] = useState<"ai" | "manual">("ai");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // AI Generation State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(3);
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiQuestionType, setAiQuestionType] = useState("mixed");
  const [aiLoading, setAiLoading] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        text: "",
        type: "text",
        options: [],
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
      }));
      // Show preview so teacher can edit before accepting
      setPreviewQuestions(newQuestions);
      // keep aiOpen true and show preview area
    } catch (error) {
      console.error("Failed to generate questions", error);
    } finally {
      setAiLoading(false);
    }
  };

  const acceptPreview = () => {
    setQuestions([...questions, ...previewQuestions]);
    setPreviewQuestions([]);
    setAiOpen(false);
    setAiTopic("");
  };

  const cancelPreview = () => {
    setPreviewQuestions([]);
  };

  const regenerateQuestion = async (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    setAiLoading(true);
    try {
      const topicForRegenerate = aiTopic || title || question.text || "physics";
      const generated = await generateAssignmentQuestions(topicForRegenerate, 1, aiDifficulty, question.type === "text" ? "text" : question.type === "short-answer" ? "short-answer" : question.type === "true-false" ? "true-false" : "multiple-choice");
      const q = generated[0];
      if (q) {
        updateQuestion(questionId, {
          text: q.text,
          type: q.type,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
        });
      }
    } catch (err) {
      console.error("Error regenerating question", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "assignments"), {
        title,
        description,
        dueDate: new Date(dueDate),
        gradingType,
        questions,
        createdAt: new Date(),
      });
      router.push("/teacher/assignments");
      router.push("/teacher/assignments");
    } catch (error) {
      console.error("Error creating assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Assignment</h1>
          <p className="text-muted-foreground">Create a new physics assignment for your students.</p>
        </div>
        <Dialog open={aiOpen} onOpenChange={setAiOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Questions with AI</DialogTitle>
              <DialogDescription>
                Enter a topic and let AI create questions for you.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {previewQuestions.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preview Generated Questions</h3>
                  {previewQuestions.map((pq, idx) => (
                    <Card key={pq.id} className="p-3">
                      <div className="space-y-2">
                        <Label>Question {idx + 1}</Label>
                        <Textarea value={pq.text} onChange={(e) => setPreviewQuestions(prev => prev.map((x, i) => i === idx ? { ...x, text: e.target.value } : x))} rows={2} />
                        <div className="flex gap-2">
                          <Button size="sm" variant={pq.type === 'multiple-choice' ? 'default' : 'outline'} onClick={() => setPreviewQuestions(prev => prev.map((x, i) => i === idx ? { ...x, type: 'multiple-choice', options: x.options?.length ? x.options : ['', '', '', ''] } : x))}>Multiple Choice</Button>
                          <Button size="sm" variant={pq.type === 'true-false' ? 'default' : 'outline'} onClick={() => setPreviewQuestions(prev => prev.map((x, i) => i === idx ? { ...x, type: 'true-false', options: ['True', 'False'] } : x))}>True/False</Button>
                          <Button size="sm" variant={pq.type === 'short-answer' ? 'default' : 'outline'} onClick={() => setPreviewQuestions(prev => prev.map((x, i) => i === idx ? { ...x, type: 'short-answer', options: [] } : x))}>Short Answer</Button>
                          <Button size="sm" variant={pq.type === 'text' ? 'default' : 'outline'} onClick={() => setPreviewQuestions(prev => prev.map((x, i) => i === idx ? { ...x, type: 'text', options: [] } : x))}>Free Response</Button>
                        </div>
                        {pq.type === 'multiple-choice' && (
                          <div className="space-y-2 pl-4">
                            {pq.options?.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <Input value={opt} onChange={(e) => setPreviewQuestions(prev => prev.map((x, i) => i === idx ? { ...x, options: x.options!.map((o, k) => k === oi ? e.target.value : o) } : x))} placeholder={`Option ${oi + 1}`} />
                                <input type="radio" name={`correct-${idx}`} checked={pq.correctAnswer === opt} onChange={() => setPreviewQuestions(prev => prev.map((x, i) => i === idx ? { ...x, correctAnswer: opt } : x))} />
                              </div>
                            ))}
                            <Button size="sm" variant="outline" onClick={() => setPreviewQuestions(prev => prev.map((x, i) => i === idx ? { ...x, options: [...(x.options || []), ''] } : x))}>Add Option</Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
            <DialogFooter>
              {previewQuestions.length > 0 ? (
                <>
                  <Button variant="secondary" onClick={acceptPreview} disabled={aiLoading}>
                    Accept Questions
                  </Button>
                  <Button variant="ghost" onClick={cancelPreview}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleAiGenerate} disabled={aiLoading || !aiTopic}>
                  {aiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
          </CardContent>
        </Card>

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
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => regenerateQuestion(question.id)}>
                      Regenerate
                    </Button>
                  </div>
                  <Textarea
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                    placeholder="Enter your question..."
                    rows={2}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={question.type === "text" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateQuestion(question.id, { type: "text" })}
                    >
                      Free Response
                    </Button>
                    <Button
                      type="button"
                      variant={question.type === "short-answer" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateQuestion(question.id, { type: "short-answer" })}
                    >
                      Short Answer
                    </Button>
                    <Button
                      type="button"
                      variant={question.type === "multiple-choice" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateQuestion(question.id, { type: "multiple-choice" })}
                    >
                      Multiple Choice
                    </Button>
                    <Button
                      type="button"
                      variant={question.type === "true-false" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateQuestion(question.id, { type: "true-false", options: ["True", "False"] })}
                    >
                      True/False
                    </Button>
                  </div>
                  
                  {question.type === "multiple-choice" && (
                    <div className="space-y-2 pl-4">
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === option}
                            onChange={() => updateQuestion(question.id, { correctAnswer: option })}
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
