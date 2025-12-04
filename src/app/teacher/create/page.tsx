"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: "text" | "multiple-choice";
  options?: string[];
  correctAnswer?: string;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "assignments"), {
        title,
        description,
        dueDate: new Date(dueDate),
        questions,
        createdAt: new Date(),
      });
      router.push("/teacher/assignments");
    } catch (error) {
      console.error("Error creating assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Assignment</h1>
        <p className="text-muted-foreground">Create a new physics assignment for your students.</p>
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
                  <Textarea
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                    placeholder="Enter your question..."
                    rows={2}
                  />
                  <div className="flex gap-2">
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
                      variant={question.type === "multiple-choice" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateQuestion(question.id, { type: "multiple-choice" })}
                    >
                      Multiple Choice
                    </Button>
                  </div>
                  {question.type === "multiple-choice" && (
                    <div className="space-y-2 pl-4">
                      {question.options?.map((option, optionIndex) => (
                        <Input
                          key={optionIndex}
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                        />
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
