'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  X,
  ArrowRight,
  ArrowUp,
  Maximize2,
  Minimize2,
  HelpCircle,
  CircleDollarSign,
  GraduationCap,
  Microscope,
  Compass,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MarkdownRenderer } from './markdown-renderer';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { RaiseLogo } from './ui/raise-logo';
import reveal from './landing/home-reveal.module.css';

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
  isTyping?: boolean;
}

interface SuggestedPrompt {
  text: string;
  category: string;
  icon: LucideIcon;
}

const suggestedPrompts: SuggestedPrompt[] = [
  { text: 'How much does Scorpio cost?', category: 'Pricing', icon: CircleDollarSign },
  { text: 'How does Raise guide students without giving answers?', category: 'Socratic AI', icon: GraduationCap },
  { text: 'What were the results of the Ph.D. audit?', category: 'Research', icon: Microscope },
  { text: 'What are Waypoints?', category: 'Curriculum', icon: Compass },
];

const quickLinks = [
  { label: 'Platform Features', href: '#features' },
  { label: 'Research & DAR Study', href: '#efficacy' },
  { label: 'Transparent Pricing', href: '#pricing-teaser' },
];

export function LandingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTeaser, setShowTeaser] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [remaining, setRemaining] = useState<number>(LIMIT);
  const [limitReached, setLimitReached] = useState(false);
  const [visitorId, setVisitorId] = useState('');

  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reduceMotion = useReducedMotion();
  const hasMessages = messages.length > 0;
  const isBusy = isLoading || isTyping;

  // Init visitor ID + local count on mount
  useEffect(() => {
    const id = getOrCreateVisitorId();
    setVisitorId(id);
    const used = getLocalCount();
    setRemaining(Math.max(0, LIMIT - used));
    if (used >= LIMIT) setLimitReached(true);
    try {
      if (sessionStorage.getItem('scorpio_teaser_dismissed') === '1') {
        setShowTeaser(false);
      }
    } catch {}
  }, []);

  // Clean up typing animation on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (isOpen && hasMessages && scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [isOpen, hasMessages, messages.length, isLoading, isTyping]);

  function closeChat() {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setIsTyping(false);
    setIsExpanded(false);
    setIsOpen(false);
    launcherRef.current?.focus({ preventScroll: true });
  }

  function dismissTeaser() {
    setShowTeaser(false);
    try {
      sessionStorage.setItem('scorpio_teaser_dismissed', '1');
    } catch {}
  }

  const animateTyping = (fullText: string) => {
    const tokens = fullText.split(/(\s+)/);
    let i = 0;
    let accumulated = '';
    setIsTyping(true);

    setMessages((prev) => [...prev, { role: 'assistant', content: '', isTyping: true }]);

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    typingTimerRef.current = setInterval(() => {
      if (i < tokens.length) {
        accumulated += tokens[i];
        i++;
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === 'assistant') {
            next[next.length - 1] = { ...last, content: accumulated, isTyping: true };
          }
          return next;
        });
        const scrollArea = scrollRef.current;
        if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
      } else {
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        setIsTyping(false);
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === 'assistant') {
            next[next.length - 1] = { ...last, content: fullText, isTyping: false };
          }
          return next;
        });
      }
    }, 18);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy || limitReached || !visitorId) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, visitorId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.limitReached) {
          setLimitReached(true);
          setRemaining(0);
          return;
        }
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data?.error || 'Something went wrong.' },
        ]);
        return;
      }

      incrementLocalCount();
      const newRemaining = data.remaining ?? Math.max(0, remaining - 1);
      setRemaining(newRemaining);
      if (newRemaining <= 0) setLimitReached(true);

      if (reduceMotion) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        animateTyping(data.text);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop for fullscreen expanded mode */}
      <AnimatePresence>
        {isOpen && isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "fixed z-50 transition-all duration-200",
        isExpanded ? "inset-0 flex items-center justify-center p-3 sm:p-6 md:p-8 pointer-events-none" : "right-4 bottom-4 sm:right-6 sm:bottom-6"
      )}>
        {/* Launcher Button & Teaser (only when not expanded) */}
        {!isExpanded && (
          <div className="flex flex-col items-end">
            <AnimatePresence>
              {!isOpen && showTeaser && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    dismissTeaser();
                    setIsOpen(true);
                  }}
                  className="group mb-2.5 flex items-center gap-2.5 rounded-2xl border border-border/80 bg-background/95 p-2 pr-3 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:border-primary/50 hover:shadow-2xl max-w-[280px] sm:max-w-xs"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <HelpCircle className="size-3.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-semibold text-foreground leading-tight">Questions about Scorpio?</p>
                    <p className="text-[11px] text-muted-foreground leading-snug truncate">Ask Raise · Product Guide & Tutor</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissTeaser();
                    }}
                    aria-label="Dismiss hint"
                    className="ml-1 size-5 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted grid place-items-center shrink-0 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              ref={launcherRef}
              type="button"
              onClick={() => {
                dismissTeaser();
                if (isOpen) closeChat();
                else setIsOpen(true);
              }}
              aria-expanded={isOpen}
              aria-controls={isOpen ? 'landing-raise-chat' : undefined}
              aria-label={isOpen ? 'Close Raise chat' : 'Ask Raise — Scorpio Product Guide'}
              className={cn(
                reveal.enter,
                "flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-3.5 sm:px-4 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none cursor-pointer"
              )}
            >
              {isOpen ? (
                <>
                  <X aria-hidden="true" className="size-4" />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <RaiseLogo size={18} aria-hidden="true" />
                  <span>Ask Raise</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Dialog Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="landing-raise-chat"
              role="dialog"
              aria-labelledby="landing-raise-title"
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  if (isExpanded) {
                    setIsExpanded(false);
                  } else {
                    closeChat();
                  }
                }
              }}
              initial={reduceMotion ? false : { opacity: 0, y: isExpanded ? 0 : 8, scale: isExpanded ? 0.98 : 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: isExpanded ? 0 : 8, scale: isExpanded ? 0.98 : 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-200 pointer-events-auto",
                isExpanded
                  ? "w-full max-w-4xl h-[min(90vh,54rem)]"
                  : "absolute right-0 bottom-full mb-3 h-[34rem] max-h-[calc(100dvh-6rem)] w-[min(26rem,calc(100vw-2rem))]"
              )}
            >
              {/* Header */}
              <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 bg-muted/20">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <RaiseLogo size={19} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 id="landing-raise-title" className="text-base font-semibold leading-tight">Raise</h2>
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      Product Guide
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    Instant answers on pricing, features & research
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? 'Collapse view' : 'Expand view'}
                  title={isExpanded ? 'Collapse view' : 'Expand view'}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? <Minimize2 className="size-4" aria-hidden="true" /> : <Maximize2 className="size-4" aria-hidden="true" />}
                </Button>
                <Button
                  ref={closeRef}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={closeChat}
                  aria-label="Close chat"
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </div>

              {/* Scroll Area */}
              <div
                ref={scrollRef}
                className={cn(
                  "min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-5",
                  isExpanded && "max-w-3xl w-full mx-auto"
                )}
              >
                {!hasMessages && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                      <p className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                        <HelpCircle className="size-4 text-primary shrink-0" aria-hidden="true" />
                        Welcome to Scorpio!
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        I&apos;m Raise, Scorpio&apos;s learning assistant. Ask me anything about how we eliminate homework cheating, our zero-markup API billing, or test my Socratic physics tutoring!
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                        Suggested questions
                      </p>
                      <div className="space-y-2">
                        {suggestedPrompts.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.text}
                              type="button"
                              disabled={isBusy || limitReached}
                              onClick={() => sendMessage(item.text)}
                              className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/40 px-3.5 py-2 text-left text-xs sm:text-sm transition-all hover:bg-muted/70 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <Icon className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.category}</span>
                                </div>
                                <p className="font-medium text-foreground truncate">{item.text}</p>
                              </div>
                              <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                        Quick Links
                      </p>
                      <nav aria-label="Explore Scorpio" className="flex flex-wrap gap-2">
                        {quickLinks.map(({ label, href }) => (
                          <a
                            key={href}
                            href={href}
                            onClick={closeChat}
                            className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                          >
                            {label}
                          </a>
                        ))}
                        <Link
                          href="/ai"
                          onClick={closeChat}
                          className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                        >
                          Try AI Playground ↗
                        </Link>
                      </nav>
                    </div>
                  </div>
                )}

                {/* Conversation Log */}
                <div role="log" aria-label="Raise conversation" className="space-y-3.5 empty:hidden">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'w-fit max-w-[90%] sm:max-w-[85%] break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        message.role === 'user'
                          ? 'ml-auto bg-primary text-primary-foreground rounded-tr-sm shadow-xs'
                          : 'bg-muted/80 rounded-tl-sm border border-border/50'
                      )}
                    >
                      <p className={cn(
                        "mb-1 text-[11px] font-semibold uppercase tracking-wide",
                        message.role === 'user' ? "text-primary-foreground/75" : "text-primary"
                      )}>
                        {message.role === 'user' ? 'You' : 'Raise'}
                      </p>
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="relative">
                          <MarkdownRenderer className="prose prose-sm max-w-none dark:prose-invert prose-p:my-0 prose-p:leading-relaxed prose-ul:my-1">
                            {message.content}
                          </MarkdownRenderer>
                          {message.isTyping && (
                            <span
                              className="inline-block w-1.5 h-3.5 ml-1 bg-primary align-baseline animate-pulse"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Thinking / Typing Indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2.5 animate-in fade-in-0 duration-150" role="status">
                    <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary mt-0.5">
                      <RaiseLogo size={14} aria-hidden="true" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-muted/80 px-4 py-3 border border-border/40">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
                        <span className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
                        <span className="size-2 rounded-full bg-primary/70 animate-bounce" />
                      </div>
                      <span className="sr-only">Raise is replying…</span>
                    </div>
                  </div>
                )}

                {limitReached && (
                  <div role="status" className="rounded-xl border border-border bg-muted/40 p-3.5">
                    <p className="text-sm font-semibold text-foreground">You’ve reached the demo limit.</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Create a free teacher account to deploy Raise with custom limits for your classroom.</p>
                    <Button asChild size="sm" className="mt-3 rounded-lg">
                      <Link href="/signup" onClick={closeChat}>
                        Sign up for free <ArrowRight aria-hidden="true" className="ml-1 size-3.5" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form
                className={cn(
                  "shrink-0 border-t border-border px-4 py-3 bg-muted/10",
                  isExpanded && "max-w-3xl w-full mx-auto"
                )}
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage(input);
                }}
              >
                <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-1.5 focus-within:border-ring shadow-xs">
                  <Textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    aria-label="Ask about Scorpio"
                    placeholder={limitReached ? 'Demo limit reached' : 'Ask about Scorpio features, pricing, or physics…'}
                    className="max-h-24 min-h-9 min-w-0 flex-1 resize-none rounded-md border-0 px-2.5 py-1.5 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                    rows={1}
                    maxLength={4000}
                    disabled={limitReached || isBusy}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Send message"
                    disabled={!input.trim() || isBusy || limitReached}
                    className="size-9 rounded-lg shrink-0 cursor-pointer"
                  >
                    <ArrowUp aria-hidden="true" className="size-4" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between px-0.5">
                  <p className="text-[11px] text-muted-foreground">
                    {remaining} of {LIMIT} demo questions left
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 hidden sm:block">
                    Shift+Enter for new line · Enter to send
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

