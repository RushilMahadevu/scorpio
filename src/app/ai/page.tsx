"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, RefreshCw, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CruxLogo } from "@/components/ui/crux-logo";
import { SiteHeader } from "@/components/landing/site-header";
import { SpaceBackground } from "@/components/ui/space-background";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

// ─── Starter Prompts ────────────────────────────────────────────────────────────

const STARTERS: { label: string; prompt: string; response: string }[] = [
  {
    label: "Incline acceleration",
    prompt: "A 5 kg block slides down a frictionless 30° incline. What is its acceleration?",
    response:
      "Before arriving at a number, let's build the correct physical picture.\n\n**Draw a free-body diagram.** Two forces act on this block: gravity ($\\vec{F}_g = mg$ downward) and the normal force ($\\vec{N}$, perpendicular to the surface). No friction — so those are the only two.\n\n**Decompose gravity along the incline's axes.** If the ramp makes angle $\\theta$ with the horizontal, the component of gravity *parallel* to the surface is\n\n$$F_{\\parallel} = mg\\sin\\theta$$\n\nand the component *perpendicular* to the surface (balanced by $N$) is\n\n$$F_{\\perp} = mg\\cos\\theta$$\n\n**Apply Newton's Second Law along the incline:**\n\n$$ma = mg\\sin\\theta \\implies a = g\\sin\\theta$$\n\nNow — *why* does mass cancel here? And what does that tell you about which objects would slide fastest on this ramp?",
  },
  {
    label: "Normal force misconception",
    prompt: "My teacher said the normal force always equals mg. Is that correct?",
    response:
      "That statement is true in one specific case — and false in most others. Catching this early will save you from a lot of incorrect free-body diagrams.\n\n**When $N = mg$:** A block on a flat horizontal surface in static equilibrium, with no vertical acceleration. The surface pushes up with exactly $mg$ to prevent the block from falling through.\n\n**When $N \\neq mg$:**\n\n- *Inclined surface:* The normal force is perpendicular to the ramp, so $N = mg\\cos\\theta$ — which is always *less* than $mg$ for $\\theta > 0$.\n- *Elevator accelerating upward:* Newton's second law gives $N - mg = ma$, so $N = m(g + a) > mg$.\n- *Object on a curved surface at speed $v$:* Centripetal acceleration modifies the equation further.\n\nThe general principle is: **the normal force is whatever value is required to satisfy Newton's Second Law in the direction perpendicular to the surface.**\n\nWith that in mind — on a 30° ramp, what is the correct expression for $N$?",
  },
  {
    label: "Newton's Third Law",
    prompt: "I don't understand Newton's Third Law. Can you explain it?",
    response:
      "Newton's Third Law states:\n\n> *For every force exerted by object A on object B, there is an equal and opposite force exerted by object B on object A.*\n\nMore compactly: $\\vec{F}_{AB} = -\\vec{F}_{BA}$.\n\n**The critical distinction students miss:** These two forces act on *different* objects. They never cancel each other — they can't, because cancellation only applies to forces on the *same* object.\n\n**A concrete example:** You push on a wall with force $\\vec{F} = 10\\,\\text{N}$ to the right. The wall pushes back on *you* with $10\\,\\text{N}$ to the left. The wall doesn't move because the *floor* provides an equal-and-opposite horizontal friction force on it — that's a separate pair.\n\nHere's a question to test your understanding: A horse pulls a cart. The cart pulls the horse backward with an equal and opposite force. If the forces are equal, why does the horse-cart system accelerate forward at all?",
  },
];

const LIMIT = 3;
const COUNT_KEY = "scorpio_ai_page_msg_count";
const VISITOR_KEY = "scorpio_ai_page_visitor_id";
const SESSION_MESSAGES_KEY = "scorpio_ai_session_messages";
const SESSION_QLEFT_KEY = "scorpio_ai_session_qleft";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getLocalCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(COUNT_KEY) || "0", 10);
}

function incrementLocalCount() {
  if (typeof window === "undefined") return;
  localStorage.setItem(COUNT_KEY, String(getLocalCount() + 1));
}

function loadSessionMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SESSION_MESSAGES_KEY);
    if (!raw) return [];
    // Strip isStreaming flag — any in-flight stream is gone after reload
    const parsed: Message[] = JSON.parse(raw);
    return parsed.map((m) => ({ ...m, isStreaming: false }));
  } catch {
    return [];
  }
}

function saveSessionMessages(msgs: Message[]) {
  if (typeof window === "undefined") return;
  try {
    // Only persist fully resolved messages (no in-progress streams)
    sessionStorage.setItem(
      SESSION_MESSAGES_KEY,
      JSON.stringify(msgs.map((m) => ({ ...m, isStreaming: false })))
    );
  } catch { /* quota exceeded — silent fail */ }
}

function loadSessionQLeft(): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_QLEFT_KEY);
  if (raw === null) return null;
  return parseInt(raw, 10);
}

function saveSessionQLeft(n: number) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_QLEFT_KEY, String(n));
}

function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_MESSAGES_KEY);
  sessionStorage.removeItem(SESSION_QLEFT_KEY);
  localStorage.setItem(COUNT_KEY, "0");
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(LIMIT);
  const [visitorId, setVisitorId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Restore session on mount
  useEffect(() => {
    const id = getOrCreateVisitorId();
    setVisitorId(id);

    const sessionMsgs = loadSessionMessages();
    const sessionQLeft = loadSessionQLeft();

    if (sessionMsgs.length > 0) {
      setMessages(sessionMsgs);
    }

    if (sessionQLeft !== null) {
      setQuestionsLeft(sessionQLeft);
    } else {
      // Fall back to localStorage count if no session record yet
      const used = getLocalCount();
      setQuestionsLeft(Math.max(0, LIMIT - used));
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, isTyping, scrollToBottom]);

  const simulateStreaming = (fullText: string, messageId: string) => {
    const words = fullText.split(" ");
    let i = 0;
    let currentText = "";
    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, content: currentText } : m))
        );
        i++;
        scrollToBottom();
      } else {
        clearInterval(interval);
        // Flush final text and persist to session
        setMessages((prev) => {
          const next = prev.map((m) =>
            m.id === messageId ? { ...m, content: fullText, isStreaming: false } : m
          );
          saveSessionMessages(next);
          return next;
        });
      }
    }, 32);
  };

  const handleSend = useCallback(
    async (text: string, offlineResponse?: string) => {
      if (!text.trim() || questionsLeft <= 0 || isTyping) return;

      const newQ = questionsLeft - 1;
      setMessages((prev) => {
        const next = [...prev, { id: `u_${Date.now()}`, role: "user" as const, content: text }];
        saveSessionMessages(next);
        return next;
      });
      setInput("");
      setIsTyping(true);
      setQuestionsLeft(newQ);
      saveSessionQLeft(newQ);
      incrementLocalCount();

      if (offlineResponse) {
        setTimeout(() => {
          setIsTyping(false);
          const aid = `a_${Date.now()}`;
          setMessages((prev) => [
            ...prev,
            { id: aid, role: "assistant", content: "", isStreaming: true },
          ]);
          simulateStreaming(offlineResponse, aid);
        }, 650);
        return;
      }

      try {
        const res = await fetch("/api/chat/landing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, visitorId }),
        });
        const data = await res.json();
        setIsTyping(false);
        const aid = `a_${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          { id: aid, role: "assistant", content: "", isStreaming: true },
        ]);
        simulateStreaming(
          res.ok ? data.text : data?.error || "Something went wrong. Please try again.",
          aid
        );
      } catch {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `a_err_${Date.now()}`,
            role: "assistant",
            content: "Connection error. Please try again.",
          },
        ]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questionsLeft, isTyping, visitorId]
  );

  const reset = () => {
    clearSession();
    setMessages([]);
    setQuestionsLeft(LIMIT);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const isLimitReached = questionsLeft <= 0;
  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col relative">
      <SpaceBackground />
      <SiteHeader activeSection="ai" />

      <div
        className="flex flex-col flex-1 mx-auto w-full max-w-[680px] px-5 relative z-10"
        style={{ paddingTop: "88px" }}
      >

        {/* ── Empty / Welcome State ─────────────────────────────────────── */}
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col flex-1 justify-center pb-36"
            >
              {/* Identity */}
              <div className="flex items-center gap-2.5 mb-8">
                <div className="h-7 w-7 rounded-[7px] bg-foreground flex items-center justify-center">
                  <CruxLogo size={14} className="text-background" />
                </div>
                <span className="text-[14px] font-semibold text-foreground">Crux</span>
                <span className="text-[11px] font-medium text-muted-foreground border border-border rounded-md px-2 py-0.5 leading-none">
                  Socratic Engine
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-[28px] sm:text-[34px] font-bold tracking-[-0.03em] text-foreground leading-[1.2] mb-3">
                Ask a physics question.
              </h1>
              <p className="text-[15px] text-muted-foreground leading-[1.7] mb-9 max-w-[500px]">
                Crux will guide you to the answer — it will not give it to you directly. This is the same engine deployed in partner physics classrooms.{" "}
                <span className="text-foreground font-medium">{questionsLeft} questions available.</span>
              </p>

              {/* Starters */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60 mb-3">
                  Example questions
                </p>
                {STARTERS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.prompt, s.response)}
                    className="group w-full flex items-center justify-between gap-4 text-left px-4 py-3 rounded-lg border border-border/60 hover:border-foreground/20 hover:bg-muted/20 transition-all duration-150 cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 shrink-0 pt-[3px]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[13.5px] text-muted-foreground group-hover:text-foreground transition-colors leading-snug truncate">
                        {s.prompt}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Conversation ─────────────────────────────────────────────── */}
        {!isEmpty && (
          <div className="flex-1 py-10 space-y-8">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {m.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[75%] bg-muted rounded-2xl rounded-tr-sm px-4 py-3 text-[14.5px] leading-[1.65] text-foreground font-medium">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-start">
                    <div className="h-6 w-6 rounded-[6px] bg-foreground flex items-center justify-center shrink-0 mt-[2px]">
                      <CruxLogo size={12} className="text-background" />
                    </div>
                    <div className="flex-1 min-w-0 pt-[1px]">
                      {/* Use MarkdownRenderer for full KaTeX support */}
                      <MarkdownRenderer
                        className={cn(
                          "text-[14.5px] leading-[1.75]",
                          "[&_.katex]:text-[0.95em]",
                          "[&_.katex-display]:my-3",
                          "[&_p]:text-foreground [&_p]:leading-[1.75] [&_p]:my-1",
                          "[&_strong]:font-semibold [&_strong]:text-foreground",
                          "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_blockquote]:my-3",
                          "[&_ul]:my-2 [&_ul]:space-y-1 [&_li]:text-foreground",
                          "[&_ol]:my-2 [&_ol]:space-y-1",
                          "[&_code]:text-[0.84em] [&_code]:bg-muted [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5",
                          "[&_pre]:bg-muted [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:my-3 [&_pre]:overflow-x-auto",
                          m.isStreaming && "after:content-[''] after:inline-block after:w-[2px] after:h-[1em] after:bg-foreground/40 after:ml-0.5 after:align-middle after:animate-pulse"
                        )}
                        noProse
                      >
                        {m.content || " "}
                      </MarkdownRenderer>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing dots */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 items-center"
              >
                <div className="h-6 w-6 rounded-[6px] bg-foreground flex items-center justify-center shrink-0">
                  <CruxLogo size={12} className="text-background" />
                </div>
                <div className="flex items-center gap-[5px]">
                  <span className="h-[5px] w-[5px] rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-[5px] w-[5px] rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "140ms" }} />
                  <span className="h-[5px] w-[5px] rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "280ms" }} />
                </div>
              </motion.div>
            )}

            {/* Limit wall */}
            <AnimatePresence>
              {isLimitReached && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border rounded-xl px-5 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-foreground mb-0.5">
                      Demo limit reached
                    </p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      You've experienced how Crux enforces the productive struggle. Ready to deploy this for your class?
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={reset}
                      className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Reset
                    </button>
                    <Link href="/signup">
                      <Button size="sm" className="rounded-full h-8 px-4 text-[13px] font-semibold cursor-pointer">
                        Get access
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}

        {/* ── Input ─────────────────────────────────────────────────────── */}
        <div className={cn("sticky bottom-0 pb-5 pt-3 bg-background/80 backdrop-blur-xl", isEmpty && "mt-auto")}>
          {/* Fade mask above input when scrolled */}
          <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />

          <div
            className={cn(
              "relative rounded-xl border border-border bg-background transition-all duration-200",
              "focus-within:border-foreground/25 focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]",
              "dark:focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]",
              isLimitReached && "opacity-40 pointer-events-none select-none"
            )}
          >
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder={
                isLimitReached
                  ? "Demo limit reached"
                  : isEmpty
                  ? "Ask a physics question..."
                  : "Continue the conversation..."
              }
              className="w-full bg-transparent border-0 resize-none px-4 pt-3.5 pb-2 text-[14.5px] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 min-h-[52px] max-h-[180px] leading-[1.6]"
              rows={1}
              disabled={isLimitReached || isTyping}
            />

            {/* Toolbar row */}
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 select-none">
                <CornerDownLeft className="h-3 w-3" />
                <span>to send · Shift+Enter for new line</span>
              </div>
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLimitReached || isTyping}
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                  input.trim() && !isLimitReached && !isTyping
                    ? "bg-foreground text-background hover:opacity-80 active:scale-95"
                    : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                )}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Status row */}
          <div className="flex items-center justify-between mt-2 px-0.5">
            <p className="text-[11px] text-muted-foreground/40 font-medium">
              Crux · Socratic Engine · PhD-Verified
            </p>
            {isLimitReached ? (
              <button
                onClick={reset}
                className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="h-2.5 w-2.5" />
                Reset session
              </button>
            ) : (
              <p className="text-[11px] text-muted-foreground/40">
                {questionsLeft} of {LIMIT} questions remaining
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
