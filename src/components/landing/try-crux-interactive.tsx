"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User, ArrowRight, RefreshCw, Lock, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CruxLogo } from "@/components/ui/crux-logo";
import { TextAnimate } from "@/components/ui/text-animate";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const DEMO_SCENARIOS = [
  {
    id: "give-answer",
    label: "Ask for the direct answer",
    prompt: "I'm stuck on this homework. Can you just give me the final answer for the tension in the rope?",
    response: "I can't just give you the final answer, because my goal is to help you understand the physics behind it. \n\nLet's figure it out together. What are the forces acting on the object attached to the rope? Have you tried drawing a free-body diagram yet?"
  },
  {
    id: "misconception",
    label: "Common misconception",
    prompt: "Isn't the normal force always equal to gravity ($mg$)?",
    response: "Not always! That's a very common misconception. \n\nThe normal force is the force a surface exerts to prevent an object from falling through it. If you have a block resting on a **flat surface**, then yes, $N = mg$. \n\nBut what if the block is on a ramp? Does the normal force point straight up, or perpendicular to the ramp?"
  },
  {
    id: "formula-hunt",
    label: "Formula hunting",
    prompt: "What formula do I use for kinematics?",
    response: "There isn't just one formula! It depends on what information you are given and what you are trying to find. \n\nBefore picking an equation, let's list our known variables. Do we know the initial velocity ($v_0$) and acceleration ($a$)?"
  }
];

export function TryCruxInteractive() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const simulateStreaming = (fullText: string, messageId: string) => {
    let currentText = "";
    const words = fullText.split(" ");
    let i = 0;

    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, content: currentText } : m
          )
        );
        i++;
        scrollToBottom();
      } else {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, isStreaming: false } : m
          )
        );
      }
    }, 45); // Adjust typing speed here
  };

  const handleSend = (text: string, predefinedResponse?: string) => {
    if (!text.trim() || questionsLeft <= 0 || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setQuestionsLeft((prev) => prev - 1);

    // Simulate network delay
    setTimeout(() => {
      setIsTyping(false);
      const assistantMessageId = (Date.now() + 1).toString();
      
      const responseContent = predefinedResponse || 
        "That's an interesting thought. In a live classroom environment, I would analyze your specific assignment and course material here. \n\nFor now, ask yourself: what is the fundamental physics principle at play? (This is a demo sandbox!)";

      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "", isStreaming: true },
      ]);

      simulateStreaming(responseContent, assistantMessageId);
    }, 800);
  };

  const isLimitReached = questionsLeft <= 0;

  return (
    <section id="try-crux" className="container mx-auto px-4 sm:px-6 py-24 relative z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">
        
        {/* Left Side: Context & Copy */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 mb-6 rounded-full border border-primary/20 bg-primary/10 text-[10px] font-black tracking-[0.2em] uppercase text-primary">
              <Zap className="h-3.5 w-3.5" />
              <span>Interactive Demo</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-foreground leading-[1.1]">
              Experience <span className="text-primary italic">Socratic AI</span> live.
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed font-medium mb-6">
              Unlike generic AI, Crux structurally refuses to give direct answers. It enforces the <strong className="text-foreground">productive struggle</strong> that leads to true mastery.
            </p>

            <ul className="space-y-3 mb-8 text-left max-w-sm mx-auto lg:mx-0">
              {[
                "Zero 'homework-solving' loopholes.",
                "Identifies root misconceptions.",
                "Guides via conceptual questioning."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-semibold text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>

          </motion.div>
        </div>

        {/* Right Side: The Sandbox UI */}
        <div className="w-full lg:w-7/12 relative">
          
          {/* Glassmorphism Window */}
          <motion.div 
            className="w-full rounded-2xl md:rounded-[2rem] border border-border/50 bg-background/40 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col relative z-20"
            style={{ height: "600px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Window Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-border/30 bg-zinc-900/40 dark:bg-black/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/10 shadow-inner">
                  <CruxLogo size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground tracking-tight leading-tight">Crux Engine</h3>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online & Active
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-background/50">
                <span className="text-xs font-bold text-muted-foreground">Demo Limit:</span>
                <span className={cn(
                  "text-xs font-black",
                  questionsLeft === 0 ? "text-red-400" : "text-primary"
                )}>
                  {questionsLeft}/3
                </span>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative scroll-smooth">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 h-full pb-10">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h4 className="text-lg font-bold text-foreground">Select a scenario to test</h4>
                    <p className="text-sm font-medium text-muted-foreground">See how Crux behaves when a student tries to bypass the learning process.</p>
                  </div>
                  
                  <div className="w-full max-w-sm flex flex-col gap-2">
                    {DEMO_SCENARIOS.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => handleSend(scenario.prompt, scenario.response)}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border/40 bg-zinc-100/50 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors text-left group"
                      >
                        <span className="text-sm font-bold text-foreground/90 group-hover:text-foreground transition-colors">{scenario.label}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m) => (
                    <motion.div 
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-4 max-w-[85%]", 
                        m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                        m.role === "user" ? "bg-zinc-200 dark:bg-zinc-800" : "bg-primary text-primary-foreground"
                      )}>
                        {m.role === "user" ? <User className="h-4 w-4 text-zinc-600 dark:text-zinc-300" /> : <CruxLogo size={14} className="text-white" />}
                      </div>
                      
                      <div className={cn(
                        "rounded-2xl px-5 py-3.5 text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap shadow-sm font-medium",
                        m.role === "user" 
                          ? "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-sm" 
                          : "bg-background border border-border/50 text-foreground rounded-tl-sm dark:bg-zinc-900/50"
                      )}>
                        {m.content}
                        {m.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-primary animate-pulse" />}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%] mr-auto">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                        <CruxLogo size={14} className="text-white" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm px-5 py-4 bg-background border border-border/50 flex items-center gap-1.5 h-12">
                        <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} className="h-1" />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/60 backdrop-blur-md border-t border-border/30 relative">
              {isLimitReached && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="text-center space-y-3 p-4">
                    <p className="text-sm font-bold flex items-center justify-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Demo Limit Reached
                    </p>
                    <Link href="/signup">
                      <Button size="sm" className="w-full rounded-full font-bold cursor-pointer hover:scale-105 transition-transform">
                        Get Full Access <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
              
              <div className="relative flex items-end gap-2 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl px-4 py-3 border border-border/50 focus-within:border-primary/50 transition-colors shadow-inner">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(input);
                    }
                  }}
                  placeholder={isLimitReached ? "Sign up to continue..." : "Type your question..."}
                  className="flex-1 bg-transparent border-0 resize-none p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 min-h-[24px] max-h-[100px] leading-relaxed font-medium"
                  rows={1}
                  disabled={isLimitReached || isTyping}
                />
                <Button
                  size="icon"
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isLimitReached || isTyping}
                  className="h-8 w-8 shrink-0 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center mt-3">
                <button 
                  onClick={() => { setMessages([]); setQuestionsLeft(3); setInput(""); }}
                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset Session
                </button>
              </div>
            </div>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 h-24 w-24 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
