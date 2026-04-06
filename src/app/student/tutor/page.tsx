"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, User, Lightbulb, Calculator, Lock, Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Edit2, Check, X, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { toast } from "sonner";
import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp, setDoc, collection, query, where, orderBy, getDocs, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Organization } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { CruxLogo } from "@/components/ui/crux-logo";


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

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export default function TutorPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"concept" | "problem">("concept");
  const [typingId, setTypingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260); // Responsive default
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, profile } = useAuth();
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [isFreePlan, setIsFreePlan] = useState(false);
  const [planLoading, setPlanLoading] = useState(true);
  const [orgData, setOrgData] = useState<Organization | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- AUTO-SCROLL TO BOTTOM ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --- ONBOARDING COMPLETION ---
  useEffect(() => {
    if (user && profile && !profile.onboarding?.chat_tutor) {
      updateDoc(doc(db, "users", user.uid), {
        "onboarding.chat_tutor": true
      }).catch((e) => console.warn("Onboarding update failed", e));
    }
  }, [user, profile]);

  // --- LOAD ALL SESSIONS (List Only) ---
  useEffect(() => {
    if (!user || user.uid === "loading") return;

    const sessionsRef = collection(db, "tutor_sessions");
    // Simplified query - only filter by studentId, sort in memory 
    // to avoid the CA9 watcher sync bug in Firestore on composite queries
    const q = query(
      sessionsRef,
      where("studentId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      let loaded: ChatSession[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "Untitled Chat",
          messages: data.messages || [],
          createdAt: data.createdAt?.toMillis?.() ?? (data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0),
          updatedAt: data.updatedAt?.toMillis?.() ?? (data.updatedAt?.seconds ? data.updatedAt.seconds * 1000 : 0),
        };
      });

      // Sort in-memory to be safer against SDK version state bugs
      loaded.sort((a, b) => b.updatedAt - a.updatedAt);

      setSessions(loaded);

      // Initial active session selection (only if none)
      setActiveSessionId(curr => {
        if (!curr && loaded.length > 0) return loaded[0].id;
        return curr;
      });
    }, (error) => {
      console.error("Sessions list listener error:", error);
    });

    return () => unsubscribe();
  }, [user]); // Removed activeSessionId from deps

  // --- LOAD ACTIVE SESSION MESSAGES ---
  useEffect(() => {
    if (!user || !activeSessionId) return;

    const sessionRef = doc(db, "tutor_sessions", activeSessionId);
    const unsubscribe = onSnapshot(sessionRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMessages(data.messages || []);
      }
    }, (error) => {
      console.error("Active session listener error:", error);
    });

    return () => unsubscribe();
  }, [user, activeSessionId]);

  // Sync messages when switching sessions
  const switchSession = useCallback((session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setRateLimitError(null);
    setTypingId(null);
  }, []);

  const createNewSession = useCallback(async () => {
    if (!user || user.uid === "loading") return;
    const newRef = await addDoc(collection(db, "tutor_sessions"), {
      studentId: user.uid,
      title: "New Chat",
      messages: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setActiveSessionId(newRef.id);
    setMessages([]);
    setRateLimitError(null);
    setTypingId(null);
  }, [user]);

  const deleteSession = useCallback(async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await deleteDoc(doc(db, "tutor_sessions", sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
        setMessages(remaining[0].messages);
      } else {
        setActiveSessionId(null);
        setMessages([]);
      }
    }
  }, [user, activeSessionId, sessions]);

  const handleRename = useCallback(async (sessionId: string, newTitle: string) => {
    if (!user || !newTitle.trim()) return;
    try {
      await updateDoc(doc(db, "tutor_sessions", sessionId), {
        title: newTitle.trim(),
        updatedAt: serverTimestamp(),
      });
      setEditingTitleId(null);
    } catch (e) {
      console.error("Rename error:", e);
      toast.error("Failed to rename chat");
    }
  }, [user]);

  const startEditing = useCallback((session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleId(session.id);
    setEditingTitleText(session.title);
  }, []);

  // --- PLAN CHECK ---
  useEffect(() => {
    async function checkPlan() {
      let organizationId = profile?.organizationId;

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
        return;
      }

      try {
        const orgSnap = await getDoc(doc(db, "organizations", organizationId));
        if (orgSnap.exists()) {
          const data = orgSnap.data() as Organization;
          setOrgData(data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRateLimitError(null);
    if (!input.trim() || loading) return;

    if (!user || user.uid === "loading") {
      toast.error("Please wait... loading user profile");
      return;
    }

    // Create a session if none exists
    let sessionId = activeSessionId;
    if (!sessionId) {
      const newRef = await addDoc(collection(db, "tutor_sessions"), {
        studentId: user.uid,
        title: input.slice(0, 40) || "New Chat",
        messages: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      sessionId = newRef.id;
      setActiveSessionId(sessionId);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      type: mode,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch("/api/student/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userId: user.uid,
          role: "student",
          mode,
          chatHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        type: mode,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      setTypingId(assistantMessage.id);

      // --- AUTO-TITLE LOGIC ---
      let newTitle = undefined;
      // We check finalMessages.length === 2 (1 user + 1 assistant)
      if (finalMessages.length === 2) {
        try {
          // Ask AI for a short title based on the first interaction
          const titleRes = await fetch("/api/ai/generate-title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userMessage: input,
              aiResponse: assistantMessage.content,
              context: "Physics Tutor"
            })
          });
          if (titleRes.ok) {
            const titleData = await titleRes.json();
            // Hard-clamp to 35 chars so sidebar titles never overflow
            if (titleData.title) {
              newTitle = (titleData.title as string).slice(0, 35);
            }
          }
        } catch (e) {
          console.error("Auto-title error:", e);
        }
        // Fallback to first message if AI title fails
        if (!newTitle) newTitle = input.slice(0, 35) + (input.length > 35 ? "..." : "");
      }

      await updateDoc(doc(db, "tutor_sessions", sessionId), {
        messages: finalMessages,
        updatedAt: serverTimestamp(),
        ...(newTitle ? { title: newTitle } : {}),
      });
    } catch (error: any) {
      console.error("Error getting response:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: error.message || "Sorry, I encountered an error.",
      };

      const updatedWithErr = [...updatedMessages, errorMessage];
      setMessages(updatedWithErr);
      setTypingId(null);

      if (sessionId) {
        updateDoc(doc(db, "tutor_sessions", sessionId), {
          messages: updatedWithErr,
          updatedAt: serverTimestamp(),
        });
      }

      if (error.message.includes("Budget")) {
        setRateLimitError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col overflow-hidden">
      
      <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold">AI Physics Tutor</h1>
          <p className="text-muted-foreground text-sm">Ask questions about physics concepts or get help solving problems</p>
        </div>

        {/* --- Desktop AI Tutor Meter --- */}
        {!isFreePlan && orgData && (orgData.aiTutorLimitPerStudent ?? 0) > 0 && (
          <div className="hidden md:flex items-center gap-4 bg-card/60 border border-border/80 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-sm">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase text-primary/70 tracking-[0.15em] leading-none mb-1">Tutor Messages</span>
              <span className="text-xs font-black tracking-tight flex items-center gap-1.5">
                {(profile as any)?.tutorUsageCurrent || 0}
                <span className="text-muted-foreground/30 font-medium">/</span>
                {orgData.aiTutorLimitPerStudent}
              </span>
            </div>
            <div className="w-16 h-8 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-muted/30 rounded-full" />
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 transition-all duration-700 rounded-full",
                  ((profile as any)?.tutorUsageCurrent || 0) / orgData.aiTutorLimitPerStudent! > 0.8 ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                )}
                style={{ width: `${Math.min(100, (((profile as any)?.tutorUsageCurrent || 0) / orgData.aiTutorLimitPerStudent!) * 100)}%` }}
              />
              <div className="relative z-10 text-[9px] font-black text-white mix-blend-difference">
                {Math.round((((profile as any)?.tutorUsageCurrent || 0) / orgData.aiTutorLimitPerStudent!) * 100)}%
              </div>
            </div>
          </div>
        )}
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
        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">

          {/* --- AI Tutor Meter (Mobile/Desktop Header) --- */}
          {orgData && (orgData.aiTutorLimitPerStudent ?? 0) > 0 && (
            <div className="md:hidden shrink-0">
              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-primary/20 shadow-sm overflow-hidden">
                <CardContent className="p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-zinc-900 rounded-lg shadow-sm border border-white/5">
                      <CruxLogo size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 mb-0.5">Tutor Messages</p>
                      <p className="text-sm font-bold tracking-tight">
                        {(profile as any)?.tutorUsageCurrent || 0} <span className="text-muted-foreground/60 font-medium">/ {orgData.aiTutorLimitPerStudent}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 max-w-[100px] h-1.5 bg-muted rounded-full overflow-hidden border border-border/10">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        ((profile as any)?.tutorUsageCurrent || 0) / orgData.aiTutorLimitPerStudent! > 0.8 ? "bg-orange-500" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(100, (((profile as any)?.tutorUsageCurrent || 0) / orgData.aiTutorLimitPerStudent!) * 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* --- Chat History Sidebar --- */}
          <div
            className={cn(
              "flex flex-col border rounded-xl bg-card transition-all duration-300 ease-in-out shrink-0 overflow-hidden relative shadow-sm h-full group/sidebar",
              sidebarOpen ? "translate-x-0" : "-translate-x-full absolute opacity-0 pointer-events-none"
            )}
            style={{ width: sidebarOpen ? `${sidebarWidth}px` : "0px" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                Chat History
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={createNewSession}
                  title="New chat"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer h-7 w-7 rounded-md hover:bg-muted"
                  onClick={() => setSidebarOpen(false)}
                  title="Close sidebar"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1.5">
                {sessions.length === 0 ? (
                  <div className="text-[11px] text-muted-foreground text-center py-8 px-4 italic">
                    Your past conversations will appear here.
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id}>
                      {editingTitleId === session.id ? (
                        /* --- Inline Rename Row --- */
                        <div className="flex items-center gap-2 rounded-xl px-3 py-2 border border-primary/30 bg-primary/5">
                          <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                          <Input
                            value={editingTitleText}
                            onChange={(e) => setEditingTitleText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(session.id, editingTitleText);
                              if (e.key === "Escape") setEditingTitleId(null);
                            }}
                            className="flex-1 h-7 text-xs px-2 min-w-0 bg-background border-primary/20 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-md"
                            autoFocus
                            maxLength={50}
                          />
                          <Button size="icon" variant="ghost" className="cursor-pointer h-7 w-7 shrink-0 text-green-600 hover:bg-green-50" onClick={() => handleRename(session.id, editingTitleText)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="cursor-pointer h-7 w-7 shrink-0 hover:bg-muted" onClick={() => setEditingTitleId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        /* --- Normal Session Row --- */
                        <div
                          className={cn(
                            "group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all duration-150 border border-transparent select-none",
                            session.id === activeSessionId
                              ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                              : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {/* Clicking the text/icon area opens the chat and collapses sidebar */}
                          <button
                            className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                            onClick={() => { switchSession(session); setSidebarOpen(false); }}
                          >
                            <MessageSquare className={cn(
                              "h-4 w-4 shrink-0",
                              session.id === activeSessionId ? "text-primary" : "text-muted-foreground/60"
                            )} />
                            <span className="truncate text-xs font-medium leading-tight">
                              {session.title}
                            </span>
                          </button>

                          {/* Always-visible ⋯ menu — no hover needed */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="cursor-pointer h-7 w-7 shrink-0 rounded-md opacity-40 group-hover:opacity-100 hover:opacity-100 transition-opacity hover:bg-muted"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); startEditing(session, e as any); }}
                                className="gap-2 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); deleteSession(session.id, e as any); }}
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* --- Resize Handle --- */}
            <div
              className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-primary/40 transition-colors opacity-0 group-hover/sidebar:opacity-100"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = sidebarWidth;
                const handleMouseMove = (mmE: MouseEvent) => {
                  const newWidth = Math.min(Math.max(200, startWidth + (mmE.clientX - startX)), 450);
                  setSidebarWidth(newWidth);
                };
                const handleMouseUp = () => {
                  window.removeEventListener('mousemove', handleMouseMove);
                  window.removeEventListener('mouseup', handleMouseUp);
                };
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </div>

          {/* --- Main Chat Area --- */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 transition-all duration-300 overflow-hidden">
            <div className="flex gap-2 mb-4 items-center shrink-0">
              {!sidebarOpen && (
                <Button
                  size="icon"
                  variant="outline"
                  className="cursor-pointer h-9 w-9 shrink-0"
                  onClick={() => setSidebarOpen(true)}
                  title="Open Chat History"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant={mode === "concept" ? "default" : "outline"}
                onClick={() => setMode("concept")}
                className="cursor-pointer flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Lightbulb className="h-4 w-4" />
                Explain Concept
              </Button>
              <Button
                variant={mode === "problem" ? "default" : "outline"}
                onClick={() => setMode("problem")}
                className="cursor-pointer flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Calculator className="h-4 w-4" />
                Solve Problem
              </Button>
            </div>

            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center shadow-lg border border-white/5">
                    <CruxLogo size={16} className="text-white" />
                  </div>
                  Chat with Crux
                </CardTitle>
                <CardDescription>
                  {mode === "concept"
                    ? "Ask about any physics concept and I'll explain it simply"
                    : "Describe your problem and I'll help you solve it step by step"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden relative">
                <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
                  <div className="p-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-zinc-900 flex items-center justify-center shadow-xl border border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                        <CruxLogo size={40} className="text-white" />
                      </div>
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
                            className={cn(
                              "flex gap-3",
                              message.role === "assistant" ? "flex-row" : "flex-row-reverse self-end"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full mt-1 border border-white/5",
                                message.role === "assistant"
                                  ? "bg-zinc-900 text-white shadow-md"
                                  : "bg-muted"
                              )}
                            >
                              {message.role === "assistant" ? <CruxLogo size={14} className="text-white" /> : <User className="h-4 w-4" />}
                            </div>
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-2.5 max-w-[85%] shadow-sm overflow-hidden",
                                message.role === "assistant"
                                  ? "bg-muted/60 text-foreground"
                                  : "bg-primary text-primary-foreground"
                              )}
                            >
                              {message.role === "assistant" ? (
                                isLastAssistant ? (
                                  <Typewriter text={message.content} onDone={() => setTypingId(null)} />
                                ) : (
                                  <MarkdownRenderer>{message.content}</MarkdownRenderer>
                                )
                              ) : (
                                <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{message.content}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {loading && (
                        <div className="flex gap-3 animate-pulse">
                          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-zinc-900 text-white border border-white/5 shadow-sm">
                            <CruxLogo size={14} className="text-white" />
                          </div>
                          <div className="rounded-2xl px-4 py-2 bg-muted/40 border border-muted-foreground/10">
                            <div className="flex gap-1 items-center h-5">
                              <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <span className="w-1 h-1 bg-primary/40 rounded-full animate-bounce" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                  </div>
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
                    <Button
                      type="submit"
                      disabled={loading || !input.trim() || !!rateLimitError}
                      className="cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}