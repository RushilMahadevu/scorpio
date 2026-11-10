'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, ArrowRight, ArrowUp } from 'lucide-react';
import { MarkdownRenderer } from './markdown-renderer';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { RaiseLogo } from './ui/raise-logo';

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
}

const suggestedPrompts = [
  'How does Raise give hints?',
  'What are Waypoints?',
  'How much does Scorpio cost?',
];

const quickLinks = [
  { label: 'Platform', href: '#features' },
  { label: 'Research', href: '#efficacy' },
  { label: 'Pricing', href: '#pricing-teaser' },
];

export function LandingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState<number>(LIMIT);
  const [limitReached, setLimitReached] = useState(false);
  const [visitorId, setVisitorId] = useState('');
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const hasMessages = messages.length > 0;

  // Init visitor ID + local count on mount
  useEffect(() => {
    const id = getOrCreateVisitorId();
    setVisitorId(id);
    const used = getLocalCount();
    setRemaining(Math.max(0, LIMIT - used));
    if (used >= LIMIT) setLimitReached(true);
  }, []);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (isOpen && hasMessages && scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
  }, [isOpen, hasMessages, messages.length, isLoading]);

  function closeChat() {
    setIsOpen(false);
    launcherRef.current?.focus({ preventScroll: true });
  }

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
        if (data?.limitReached) {
          setLimitReached(true);
          setRemaining(0);
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
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (isOpen ? closeChat() : setIsOpen(true))}
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'landing-raise-chat' : undefined}
        aria-label={isOpen ? 'Close Raise chat' : 'Ask Raise'}
        className="flex h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-md transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none sm:px-4"
      >
        {isOpen ? <X aria-hidden="true" className="size-4" /> : <RaiseLogo size={18} aria-hidden="true" />}
        <span className="hidden sm:inline">{isOpen ? 'Close' : 'Ask Raise'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="landing-raise-chat"
            role="dialog"
            aria-labelledby="landing-raise-title"
            onKeyDown={(event) => {
              if (event.key === 'Escape') closeChat();
            }}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: 'easeOut' }}
            className="absolute right-0 bottom-full mb-3 flex h-[32rem] max-h-[calc(100dvh-6rem)] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <RaiseLogo size={19} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="landing-raise-title" className="text-base font-semibold leading-tight">Raise</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Scorpio product guide</p>
              </div>
              <Button
                ref={closeRef}
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeChat}
                aria-label="Close chat"
                className="size-9 rounded-lg text-muted-foreground"
              >
                <X aria-hidden="true" />
              </Button>
            </div>

            <div
              ref={scrollRef}
              data-lenis-prevent
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4"
            >
              {!hasMessages && (
                <div>
                  <p className="font-medium">How can I help?</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Ask about using Scorpio in class, how Raise gives hints, or what it costs.
                  </p>
                  {!limitReached && (
                    <div className="mt-4 space-y-2">
                      {suggestedPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => sendMessage(prompt)}
                          className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none"
                        >
                          {prompt}
                          <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}
                  <nav aria-label="Explore Scorpio" className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                    {quickLinks.map(({ label, href }) => (
                      <a key={href} href={href} onClick={closeChat} className="rounded-sm py-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                        {label}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              <div role="log" aria-label="Raise conversation" className="space-y-3 empty:hidden">
                {messages.map((message, index) => (
                  <div key={index} className={cn(
                    'w-fit max-w-[90%] break-words rounded-xl px-3 py-2.5 text-sm leading-relaxed',
                    message.role === 'user' ? 'ml-auto bg-primary/10' : 'bg-muted',
                  )}>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {message.role === 'user' ? 'You' : 'Raise'}
                    </p>
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <MarkdownRenderer className="prose prose-sm max-w-none dark:prose-invert prose-p:my-0 prose-p:leading-relaxed prose-ul:my-1">
                        {message.content}
                      </MarkdownRenderer>
                    )}
                  </div>
                ))}
              </div>

              {isLoading && <p role="status" className="text-sm text-muted-foreground">Raise is replying…</p>}

              {limitReached && (
                <div role="status" className="rounded-xl border border-border bg-muted/40 p-3">
                  <p className="text-sm font-medium">You’ve reached the demo limit.</p>
                  <Button asChild size="sm" className="mt-2 rounded-lg">
                    <Link href="/signup" onClick={closeChat}>
                      Sign up for free <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            <form
              className="shrink-0 border-t border-border px-4 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage(input);
              }}
            >
              <div className="flex items-end gap-2 rounded-xl border border-border bg-muted/30 p-1.5 focus-within:border-ring">
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
                  placeholder={limitReached ? 'Demo limit reached' : 'Ask about Scorpio…'}
                  className="max-h-24 min-h-9 min-w-0 flex-1 resize-none rounded-md border-0 px-2 py-1.5 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
                  rows={1}
                  maxLength={4000}
                  disabled={limitReached}
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send message"
                  disabled={!input.trim() || isLoading || limitReached}
                  className="size-9 rounded-lg"
                >
                  <ArrowUp aria-hidden="true" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {remaining} of {LIMIT} demo messages left
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
