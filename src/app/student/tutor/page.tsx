"use client";

import { useState, useRef, useEffect } from "react";
import { explainPhysicsConcept, helpSolveProblem } from "@/lib/gemini";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Lightbulb, Calculator } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "concept" | "problem";
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"concept" | "problem">("concept");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      type: mode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = mode === "concept" 
        ? await explainPhysicsConcept(input)
        : await helpSolveProblem(input);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
        type: mode,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">AI Physics Tutor</h1>
        <p className="text-muted-foreground">Ask questions about physics concepts or get help solving problems</p>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={mode === "concept" ? "default" : "outline"}
          onClick={() => setMode("concept")}
          className="flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          Explain Concept
        </Button>
        <Button
          variant={mode === "problem" ? "default" : "outline"}
          onClick={() => setMode("problem")}
          className="flex items-center gap-2"
        >
          <Calculator className="h-4 w-4" />
          Solve Problem
        </Button>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chat with AI Tutor
          </CardTitle>
          <CardDescription>
            {mode === "concept" 
              ? "Ask about any physics concept and I'll explain it simply" 
              : "Describe your problem and I'll help you solve it step by step"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation by asking a question!</p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="cursor-pointer" onClick={() => setInput("What is Newton's first law?")}>
                      What is Newton's first law?
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer" onClick={() => setInput("How do I calculate kinetic energy?")}>
                      How do I calculate kinetic energy?
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer" onClick={() => setInput("Explain electromagnetic induction")}>
                      Explain electromagnetic induction
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${
                        message.role === "assistant"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "assistant"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "concept"
                    ? "Ask about any physics concept..."
                    : "Describe the problem you need help with..."
                }
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
