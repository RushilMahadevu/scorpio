"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Lightbulb, Calculator, ShieldAlert, Zap, Lock } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Organization } from "@/lib/types";


// Typewriter effect for assistant messages
function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
    if (!text) return;
    let cancelled = false;
    function type() {
      if (cancelled) return;
      setDisplayed((prev) => {
        const next = text.slice(0, indexRef.current + 1);
        return next;
      });
      indexRef.current++;
      if (indexRef.current < text.length) {
        setTimeout(type, 5); // Faster typing speed
      } else if (onDone) {
        onDone();
      }
    }
    type();
    return () => {
      cancelled = true;
    };
    // Only restart when text changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <MarkdownRenderer>{displayed}</MarkdownRenderer>;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "concept" | "problem";
}


// --- Rate Limiting Config ---
const RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // max 30 requests per window per student
};

// Helper: get and set usage from localStorage (for demo; replace with backend for production)
function getStudentUsage(studentId: string) {
  const raw = localStorage.getItem(`ai-usage-${studentId}`);
  if (!raw) return { count: 0, windowStart: Date.now() };
  try {
    return JSON.parse(raw);
  } catch {
    return { count: 0, windowStart: Date.now() };
  }
}
function setStudentUsage(studentId: string, usage: { count: number; windowStart: number }) {
  localStorage.setItem(`ai-usage-${studentId}` , JSON.stringify(usage));
}

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"concept" | "problem">("concept");
  const [typingId, setTypingId] = useState<string | null>(null); // Track which message is typing
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, profile } = useAuth();
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [isFreePlan, setIsFreePlan] = useState(false);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    async function checkPlan() {
      // 1. Try student's direct organization first
      let organizationId = profile?.organizationId;
      
      // 2. Fallback: If student doesn't have an org, check their teacher's org
      if (!organizationId && (profile as any)?.teacherId) {
        try {
          const teacherDoc = await getDoc(doc(db, "users", (profile as any).teacherId));
          if (teacherDoc.exists()) {
            organizationId = teacherDoc.data()?.organizationId;
          }
        } catch (e) { console.error("Error fetching teacher org", e); }
      }

      if (!organizationId) {
        setPlanLoading(false);
        // By default, if no organization is found at all, we'll let them try 
        // and the backend will enforce individual vs network limits.
        return;
      }

      try {
        const orgRef = doc(db, "organizations", organizationId);
        const orgSnap = await getDoc(orgRef);
        if (orgSnap.exists()) {
          const data = orgSnap.data() as Organization;
          setIsFreePlan(!data.planId || data.planId === "free");
        }
      } catch (e) {
        console.error("Error checking plan:", e);
      } finally {
        setPlanLoading(false);
      }
    }
    if (profile) checkPlan();
  }, [profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRateLimitError(null);
    if (!input.trim() || loading) return;

    if (!user || user.uid === "loading") {
      toast.error("Please wait... loading user profile");
      return;
    }

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
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call secure proxy endpoint with budgeting
      const res = await fetch("/api/student/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userId: user.uid,
          role: "student",
          mode,
          chatHistory
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        type: mode,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setTypingId(assistantMessage.id);
    } catch (error: any) {
      console.error("Error getting response:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: error.message || "Sorry, I encountered an error.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setTypingId(null);
      
      if (error.message.includes("Budget")) {
        setRateLimitError(error.message);
      }
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

      {isFreePlan ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-dashed">
            <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="space-y-2">
                <CardTitle>AI Tutoring Restricted</CardTitle>
                <CardDescription>
                  Your current network is on the **Free tier**. AI-powered tutor features require a Department Network subscription.
                </CardDescription>
              </div>
              <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                Ask your teacher or department lead to upgrade the network for AI access.
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === "concept" ? "default" : "outline"}
              onClick={() => setMode("concept")}
              className="flex items-center gap-2 cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Lightbulb className="h-4 w-4" />
              Explain Concept
            </Button>
            <Button
              variant={mode === "problem" ? "default" : "outline"}
              onClick={() => setMode("problem")}
              className="flex items-center gap-2 cursor-pointer hover:bg-primary/90 transition-colors"
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
                    {messages.map((message, idx) => {
                      const isLastAssistant =
                        message.role === "assistant" && idx === messages.length - 1 && message.id === typingId;
                      return (
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
                            {message.role === "assistant" ? (
                              isLastAssistant ? (
                                <Typewriter
                                  text={message.content}
                                  onDone={() => setTypingId(null)}
                                />
                              ) : (
                                <MarkdownRenderer>{message.content}</MarkdownRenderer>
                              )
                            ) : (
                              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

              {rateLimitError && (
                <div className="p-4 text-red-600 text-sm font-semibold border-b bg-red-50 rounded">
                  {rateLimitError}
                </div>
              )}
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
                    disabled={!!rateLimitError}
                  />
                  <Button type="submit" disabled={loading || !input.trim() || !!rateLimitError} className="cursor-pointer hover:bg-primary/90 transition-colors">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}