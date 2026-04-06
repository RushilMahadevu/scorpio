'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle, X, Send, Home, FileText, GraduationCap, BarChart,
  Upload, Users, BookOpen, Rocket, Bot, ChevronDown, Zap,
  NotebookPen, BowArrow, Building2, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { MarkdownRenderer } from './markdown-renderer';
import { cn } from '@/lib/utils';

import { CruxLogo } from './ui/crux-logo';

type UserRole = 'student' | 'teacher';

interface NavigationChatbotProps {
  userRole: UserRole;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  navigation?: { path: string; label: string };
  isWelcome?: boolean;
}

interface QuickAction {
  icon: React.ElementType;
  label: string;
  path: string;
  color: string;
}

const studentQuickActions: QuickAction[] = [
  { icon: Home, label: 'Dashboard', path: '/student', color: 'text-blue-500' },
  { icon: FileText, label: 'Assignments', path: '/student/assignments', color: 'text-violet-500' },
  { icon: BarChart, label: 'Grades', path: '/student/grades', color: 'text-emerald-500' },
  { icon: GraduationCap, label: 'Tutor', path: '/student/tutor', color: 'text-purple-500' },
  { icon: BowArrow, label: 'Practice', path: '/student/practice', color: 'text-orange-500' },
  { icon: NotebookPen, label: 'Notebook', path: '/student/notebook', color: 'text-sky-500' },
  { icon: Upload, label: 'Submissions', path: '/student/submissions', color: 'text-rose-500' },
  { icon: BookOpen, label: 'Resources', path: '/student/resources', color: 'text-amber-500' },
];

const teacherQuickActions: QuickAction[] = [
  { icon: Home, label: 'Dashboard', path: '/teacher', color: 'text-blue-500' },
  { icon: FileText, label: 'Assignments', path: '/teacher/assignments', color: 'text-violet-500' },
  { icon: Rocket, label: 'Create', path: '/teacher/create', color: 'text-emerald-500' },
  { icon: BarChart, label: 'Grades', path: '/teacher/grades', color: 'text-amber-500' },
  { icon: Users, label: 'Students', path: '/teacher/students', color: 'text-sky-500' },
  { icon: Upload, label: 'Uploads', path: '/teacher/uploads', color: 'text-orange-500' },
  { icon: Zap, label: 'Waypoints', path: '/teacher/waypoints', color: 'text-rose-500' },
  { icon: Building2, label: 'Network', path: '/teacher/network', color: 'text-purple-500' },
];

const studentSuggested = [
  "How do I start an assignment?",
  "What is Crux?",
  "How does Practice work?",
  "Where are my grades?",
];

const teacherSuggested = [
  "How do I create an assignment?",
  "What are Waypoints?",
  "How does AI grading work?",
  "How do I manage my AI budget?",
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function NavigationChatbot({ userRole }: NavigationChatbotProps) {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(
    userRole === 'teacher' ? teacherSuggested : studentSuggested
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const quickActions = userRole === 'student' ? studentQuickActions : teacherQuickActions;

  useEffect(() => {
    const firstName = profile?.displayName?.split(' ')[0] || (userRole === 'teacher' ? 'Teacher' : 'there');
    const roleBlurb = userRole === 'teacher'
      ? `I know every corner of Scorpio — assignments, Crux usage limits, network billing, grading, waypoints, and more. Just ask.`
      : `I know every feature of Scorpio — assignments, your AI Tutor, Practice mode, Notebook, grades, and more. Just ask.`;

    setMessages([{
      role: 'assistant',
      content: `**${getGreeting()}, ${firstName}!** 👋\n\nI'm **Crux** — your Scorpio platform expert.\n\n${roleBlurb}`,
      isWelcome: true,
    }]);
  }, [profile?.displayName, userRole]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleNavigation = (path: string, label: string) => {
    router.push(path);
    setTimeout(() => setIsOpen(false), 300);
  };

  const extractNavigationPath = (text: string): { path: string; label: string } | null => {
    const pathMatch = text.match(/\(([^)]+)\)/);
    if (pathMatch) {
      const path = pathMatch[1];
      const action = quickActions.find(a => a.path === path);
      if (action) return { path, label: action.label };
    }
    return null;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !user) return;
    setRateLimitError(null);
    setInput('');

    const userMessage = text.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, userRole, userId: user.uid }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setRateLimitError(data?.error || 'Rate limit exceeded.');
          setMessages(prev => [...prev, { role: 'assistant', content: `**Rate limit reached.** You've hit the hourly limit for AI requests. Please wait a moment and try again.` }]);
          return;
        }
        setMessages(prev => [...prev, { role: 'assistant', content: data?.error || `Something went wrong. Please try again.` }]);
        return;
      }

      const navPath = extractNavigationPath(data.text);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.text,
        navigation: navPath || undefined,
      }]);

      if (data.suggestedPrompts?.length) {
        setSuggestedPrompts(data.suggestedPrompts);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Connection error. Please check your connection and try again.` }]);
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
          "fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-md transition-all duration-300 cursor-pointer",
          "h-14 w-14 bg-zinc-900 border border-white/10 shadow-xl hover:bg-zinc-800 hover:border-white/20 hover:scale-105"
        )}
        aria-label="Crux AI Assistant"
      >
        {isOpen
          ? <X className="h-5 w-5 text-white" />
          : <CruxLogo size={20} className="text-white" />
        }
        {hasUnread && !isOpen && (
          <span className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-900 animate-pulse" />
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-24 right-6 z-50 flex flex-col",
          "w-[720px] h-[620px]",
          "bg-background border border-border/60 rounded-3xl shadow-2xl overflow-hidden",
          "animate-in slide-in-from-bottom-4 fade-in-0 duration-200"
        )}>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-zinc-900 flex items-center justify-center shadow-lg border border-white/5">
                <CruxLogo size={18} className="text-white" />
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-inter font-black tracking-tighter text-foreground">Crux</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                Online · Platform Expert
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Quick Nav Grid */}
          <div className="shrink-0 px-4 pt-3 pb-2 border-b border-border/30">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-2">Quick Navigate</p>
            <div className="grid grid-cols-4 gap-1.5">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => handleNavigation(action.path, action.label)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-accent transition-colors cursor-pointer group"
                >
                  <action.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", action.color)} />
                  <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((message, i) => (
              <div key={i}>
                <div className={cn("flex gap-2.5", message.role === 'user' ? "justify-end" : "justify-start")}>
                  {message.role === 'assistant' && (
                    <div className="h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5 border border-white/5">
                      <CruxLogo size={14} className="text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                    message.role === 'user'
                      ? "bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-sm"
                      : "bg-zinc-100 dark:bg-zinc-800/80 text-foreground rounded-tl-sm border border-border/30",
                    message.isWelcome && "border-l-2 border-l-emerald-400"
                  )}>
                    {message.role === 'user' ? (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    ) : (
                      <MarkdownRenderer className="text-sm prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-p:my-0 prose-ul:my-1 prose-li:my-0 max-w-none">
                        {message.content.replace(/\(\/[^)]+\)/g, '')}
                      </MarkdownRenderer>
                    )}
                  </div>
                </div>
                {message.navigation && (
                  <div className="flex justify-start mt-1.5 ml-9">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNavigation(message.navigation!.path, message.navigation!.label)}
                      className="h-7 text-[11px] font-bold rounded-full cursor-pointer border-primary/30 text-primary hover:bg-primary hover:text-primary transition-colors"
                    >
                      Go to {message.navigation.label} →
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Suggested prompts shown on fresh conversations */}
            {!isLoading && messages.length <= 2 && (
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
                <div className="h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border border-white/5">
                  <CruxLogo size={14} className="text-white" />
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
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 px-4 pb-4 pt-2 border-t border-border/30 bg-background">
            {rateLimitError && (
              <p className="text-[10px] text-rose-500 font-semibold mb-2 text-center">{rateLimitError}</p>
            )}
            <div className="relative flex items-end gap-2 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl px-4 py-2.5 border border-border/40 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors">
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
                placeholder="Ask Crux about Scorpio..."
                className="flex-1 bg-transparent border-0 resize-none p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 min-h-[24px] max-h-[80px] leading-relaxed"
                rows={1}
                disabled={isLoading || !!rateLimitError}
              />
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading || !!rateLimitError}
                className="h-7 w-7 shrink-0 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-zinc-100 dark:text-zinc-900" />
              </Button>
            </div>
            <p className="text-[9px] text-muted-foreground/40 text-center mt-2 font-medium tracking-wide uppercase">
              Crux · Scorpio Platform Expert
            </p>
          </div>
        </div>
      )}
    </>
  );
}
