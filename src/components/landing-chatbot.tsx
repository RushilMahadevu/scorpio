'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle, X, Send, Bot, Sparkles, ArrowRight,
  GraduationCap, BookOpen, BarChart2, Zap, Users, Brain
} from 'lucide-react';
import { MarkdownRenderer } from './markdown-renderer';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const LIMIT = 10;
const VISITOR_KEY = 'scorpio_landing_visitor_id';
const COUNT_KEY = 'scorpio_landing_msg_count';

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getLocalCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);
}

function incrementLocalCount() {
  if (typeof window === 'undefined') return;
  const current = getLocalCount();
  localStorage.setItem(COUNT_KEY, String(current + 1));
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isWelcome?: boolean;
}

const suggestedPrompts = [
  'How does Scorpio prevent cheating?',
  'What is Inference-Time Scaffolding?',
  "How is this different from ChatGPT?",
  'How much does it cost?',
  'What are Waypoints?',
  'How does AI grading work?',
];

const quickLinks = [
  { label: 'Research', icon: Brain, id: 'efficacy' },
  { label: 'Platform', icon: GraduationCap, id: 'mission-control' },
  { label: 'Comparison', icon: BarChart2, id: 'comparison' },
  { label: 'Pricing', icon: Zap, id: 'pricing' },
  { label: 'Demos', icon: BookOpen, id: 'demos' },
  { label: 'Network', icon: Users, id: 'waypoints' },
];

export function LandingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState<number>(LIMIT);
  const [limitReached, setLimitReached] = useState(false);
  const [visitorId, setVisitorId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Init visitor ID + local count on mount
  useEffect(() => {
    const id = getOrCreateVisitorId();
    setVisitorId(id);
    const used = getLocalCount();
    setRemaining(Math.max(0, LIMIT - used));
    if (used >= LIMIT) setLimitReached(true);
  }, []);

  // Welcome message
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `**Welcome to Scorpio AI!** 👋\n\nI'm your product guide. Ask me anything about how Scorpio works, our research, pricing, or how we compare to other tools.\n\n_You have ${LIMIT} free messages to explore._`,
      isWelcome: true,
    }]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  }, []);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || limitReached || !visitorId) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, visitorId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 || data?.limitReached) {
          setLimitReached(true);
          setRemaining(0);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `**You've reached the ${LIMIT}-message demo limit.**\n\nSign up to get unlimited access to all Scorpio features, including the full AI assistant.`,
          }]);
          return;
        }
        setMessages(prev => [...prev, { role: 'assistant', content: data?.error || 'Something went wrong.' }]);
        return;
      }

      incrementLocalCount();
      const newRemaining = data.remaining ?? Math.max(0, remaining - 1);
      setRemaining(newRemaining);
      if (newRemaining <= 0) setLimitReached(true);

      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 cursor-pointer',
          'h-14 w-14 bg-card/40 border border-border/50 backdrop-blur-sm hover:bg-card/60 hover:border-border hover:scale-105'
        )}
        aria-label="Ask Scorpio AI"
      >
        {isOpen
          ? <X className="h-5 w-5 text-foreground" />
          : <MessageCircle className="h-5 w-5 text-foreground" />
        }
        {hasUnread && !isOpen && (
          <span className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-900 animate-pulse" />
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed bottom-24 right-6 z-50 flex flex-col',
              'w-[calc(100vw-48px)] sm:w-[540px] md:w-[720px] h-[600px] max-h-[calc(100vh-140px)]',
              'bg-background border border-border/60 rounded-3xl shadow-2xl overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow">
                  <Bot className="h-[18px] w-[18px] text-zinc-100 dark:text-zinc-900" />
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black tracking-tight text-foreground">Scorpio AI</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online · Product Guide
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Remaining counter */}
                <span className={cn(
                  'text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full border',
                  remaining <= 3
                    ? 'text-rose-500 border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800'
                    : 'text-muted-foreground border-border/40 bg-muted/30'
                )}>
                  {remaining}/{LIMIT}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Quick section links */}
            <div className="shrink-0 px-4 pt-3 pb-2 border-b border-border/30">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-2">Jump To</p>
              <div className="grid grid-cols-6 gap-1">
                {quickLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-accent transition-colors cursor-pointer group"
                  >
                    <link.icon className="h-3.5 w-3.5 text-primary transition-transform group-hover:scale-110" />
                    <span className="text-[8px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 overscroll-contain"
            >
              {messages.map((message, i) => (
                <div key={i} className={cn('flex gap-2.5', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'assistant' && (
                    <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-zinc-100 dark:text-zinc-900" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                    message.role === 'user'
                      ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-foreground rounded-tl-sm border border-border/30',
                    message.isWelcome && 'border-l-2 border-l-emerald-400'
                  )}>
                    {message.role === 'user' ? (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    ) : (
                      <MarkdownRenderer className="text-sm prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-p:my-0 prose-ul:my-1 prose-li:my-0 max-w-none">
                        {message.content}
                      </MarkdownRenderer>
                    )}
                  </div>
                </div>
              ))}

              {/* Suggested prompts on fresh conversation */}
              {!isLoading && messages.length <= 2 && !limitReached && (
                <div className="space-y-1.5 ml-8">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="flex items-center gap-2 w-full text-left text-[11px] font-medium text-muted-foreground hover:text-foreground bg-zinc-100 dark:bg-zinc-800/60 hover:bg-accent px-3 py-2 rounded-xl transition-colors cursor-pointer border border-border/30 hover:border-border"
                    >
                      <Sparkles className="h-3 w-3 text-purple-400 shrink-0" />
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 text-zinc-100 dark:text-zinc-900" />
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl rounded-tl-sm px-4 py-3 border border-border/30">
                    <div className="flex gap-1 items-center h-4">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '120ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '240ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Limit reached CTA */}
              {limitReached && (
                <div className="ml-8 p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                  <p className="text-xs font-semibold text-foreground">Ready to get full access?</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Sign up for Scorpio and unlock unlimited AI tutoring, practice, and platform features.</p>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full rounded-xl font-bold text-xs cursor-pointer h-8 mt-1">
                      Sign up for free <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 px-4 pb-4 pt-2 border-t border-border/30 bg-background">
              <div className={cn(
                'relative flex items-end gap-2 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl px-4 py-2.5 border border-border/40 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors',
                limitReached && 'opacity-50 pointer-events-none'
              )}>
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder={limitReached ? 'Demo limit reached — sign up for more' : 'Ask me anything about Scorpio...'}
                  className="flex-1 bg-transparent border-0 resize-none p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 min-h-[24px] max-h-[80px] leading-relaxed"
                  rows={1}
                  disabled={isLoading || limitReached}
                />
                <Button
                  size="icon"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading || limitReached}
                  className="h-7 w-7 shrink-0 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5 text-zinc-100 dark:text-zinc-900" />
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground/40 text-center mt-2 font-medium tracking-wide uppercase">
                Scorpio AI · Product Guide · {remaining} messages left
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
