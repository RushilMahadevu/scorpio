'use client';
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  X, Send, Home, FileText, BarChart,
  Upload, Users, BookOpen, Rocket, Zap,
  NotebookPen, Building2, LifeBuoy,
  Compass, ArrowRight, Image as ImageIcon, Trash2, Hand,
  Maximize2, Minimize2
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { MarkdownRenderer } from './markdown-renderer';
import { cn } from '@/lib/utils';
import { RaiseLogo } from './ui/raise-logo';
import { toast } from 'sonner';
import Image from 'next/image';

type UserRole = 'student' | 'teacher';
type ActiveTab = 'nav' | 'support';

interface NavigationChatbotProps {
  userRole: UserRole;
}

interface NavDestination {
  path: string;
  label: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  navigation?: NavDestination[];
  isWelcome?: boolean;
  isTyping?: boolean;
}

interface QuickAction {
  icon: React.ElementType;
  label: string;
  path: string;
}

const studentQuickActions: QuickAction[] = [
  { icon: Home, label: 'Dashboard', path: '/student' },
  { icon: FileText, label: 'Assignments', path: '/student/assignments' },
  { icon: BarChart, label: 'Grades', path: '/student/grades' },
  { icon: Hand, label: 'Raise', path: '/student/tutor' },
  { icon: NotebookPen, label: 'Notebook', path: '/student/notebook' },
  { icon: Upload, label: 'Submissions', path: '/student/submissions' },
  { icon: BookOpen, label: 'Resources', path: '/student/resources' },
];

const teacherQuickActions: QuickAction[] = [
  { icon: Home, label: 'Dashboard', path: '/teacher' },
  { icon: FileText, label: 'Assignments', path: '/teacher/assignments' },
  { icon: Rocket, label: 'Create', path: '/teacher/create' },
  { icon: BarChart, label: 'Grades', path: '/teacher/grades' },
  { icon: Users, label: 'Students', path: '/teacher/students' },
  { icon: Upload, label: 'Uploads', path: '/teacher/uploads' },
  { icon: Zap, label: 'Waypoints', path: '/teacher/waypoints' },
  { icon: Building2, label: 'Network', path: '/teacher/network' },
];

const studentSuggested = [
  "How do I start an assignment?",
  "What is Raise?",
  "How do I use the Notebook?",
  "Where are my grades?",
];

const teacherSuggested = [
  "How do I create an assignment?",
  "What are Waypoints?",
  "How does AI grading work?",
  "How do I manage my AI budget?",
];

export function NavigationChatbot({ userRole }: NavigationChatbotProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('nav');

  // Support Form State
  const [issueType, setIssueType] = useState<'bug' | 'feature' | 'question'>('bug');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(
    userRole === 'teacher' ? teacherSuggested : studentSuggested
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  const quickActions = userRole === 'student' ? studentQuickActions : teacherQuickActions;

  const extractAllNavigationPaths = (text: string): NavDestination[] => {
    const matches = Array.from(
      text.matchAll(/(?:\[([^\]]+)\]\((\/(?:student|teacher)[^)\s]*)\)|(?<!\])\((\/(?:student|teacher)[^)\s]*)\))/g)
    );
    const destinations: NavDestination[] = [];

    for (const match of matches) {
      const explicitLabel = match[1];
      const path = match[2] || match[3];
      if (!path || !path.startsWith('/')) continue;
      if (!destinations.some(d => d.path === path)) {
        const action = quickActions.find(a => a.path === path);
        const fallbackLabel = path.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || path;
        const label = explicitLabel || (action ? action.label : (fallbackLabel.charAt(0).toUpperCase() + fallbackLabel.slice(1)));
        destinations.push({ path, label });
      }
    }
    return destinations;
  };

  const formatMessageWithLinks = (text: string): string => {
    if (!text) return '';
    // If the path is already inside a markdown link [Label](/path), preserve it intact.
    // Only convert standalone paths like `(/student/grades)` into `[Grades](/student/grades)`
    return text.replace(
      /(?<!!)\[([^\]]+)\]\((\/(?:student|teacher)[^)\s]*)\)|(?<!\])\((\/(?:student|teacher)[^)\s]*)\)/g,
      (fullMatch, _existingLabel, existingPath, standalonePath) => {
        if (existingPath) {
          return fullMatch;
        }
        const path = standalonePath;
        const action = quickActions.find(a => a.path === path);
        const fallbackLabel = path.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || path;
        const label = action ? action.label : (fallbackLabel.charAt(0).toUpperCase() + fallbackLabel.slice(1));
        return `[${label}](${path})`;
      }
    );
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  useEffect(() => {
    const firstName = profile?.displayName?.split(' ')[0] || (userRole === 'teacher' ? 'Teacher' : 'there');
    const roleBlurb = userRole === 'teacher'
      ? `I can help you navigate [Assignments](/teacher/assignments), [Create Assignment](/teacher/create), [Gradebook](/teacher/grades), [Network Limits](/teacher/network), [Waypoints](/teacher/waypoints), and more.`
      : `I can help you navigate [Assignments](/student/assignments), your [Raise](/student/tutor), [Notebook](/student/notebook), and [Grades](/student/grades).`;

    setMessages([{
      role: 'assistant',
      content: `**Hi, ${firstName}!** 👋\n\nI'm your Scorpio guide. ${roleBlurb}\n\nWhere would you like to go?`,
      isWelcome: true,
    }]);
  }, [profile?.displayName, userRole]);

  useEffect(() => {
    if (isOpen && activeTab === 'nav') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (activeTab === 'nav') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remainingSlots = 3 - screenshots.length;
    if (remainingSlots <= 0) {
      toast.error('You can attach up to 3 screenshots.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are supported.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Screenshot must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setScreenshots(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const fakeList = [file] as unknown as FileList;
          handleImageUpload(fakeList);
        }
      }
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please enter a description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authenticatedFetch('/api/support/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          category: issueType,
          pageUrl: pathname || window.location.pathname,
          userRole,
          userId: user?.uid || null,
          userEmail: user?.email || profile?.email || null,
          userName: profile?.displayName || null,
          screenshots,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to submit report');

      setSubmittedTicketId(data.ticketId);
      setDescription('');
      setScreenshots([]);
      toast.success('Report submitted successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !user) return;
    setInput('');

    const userMessage = text.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await authenticatedFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, userRole, userId: user.uid }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data?.error || 'Something went wrong.' }]);
        return;
      }

      const navDestinations = extractAllNavigationPaths(data.text);
      const fullText = data.text;
      const tokens = fullText.split(/(\s+)/);
      let i = 0;
      let accumulated = '';
      setIsTyping(true);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        navigation: navDestinations.length > 0 ? navDestinations : undefined,
        isTyping: true,
      }]);

      if (typingTimerRef.current) clearInterval(typingTimerRef.current);

      typingTimerRef.current = setInterval(() => {
        if (i < tokens.length) {
          accumulated += tokens[i];
          i++;
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, content: accumulated, isTyping: true };
            }
            return next;
          });
        } else {
          if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
          }
          setIsTyping(false);
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, content: fullText, isTyping: false };
            }
            return next;
          });
        }
      }, 18);

      if (data.suggestedPrompts?.length) {
        setSuggestedPrompts(data.suggestedPrompts);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!isOpen) {
            setActiveTab('nav');
          }
          setIsOpen(!isOpen);
        }}
        className={cn(
          "fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 h-11 sm:h-12 px-4 sm:px-5 rounded-full cursor-pointer transition-all duration-200 shadow-2xl active:scale-95 select-none",
          "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20"
        )}
        aria-label="Support & Help"
      >
        {isOpen ? (
          <>
            <X className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">Close</span>
          </>
        ) : (
          <>
            <LifeBuoy className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">Support</span>
          </>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          {isExpanded && (
            <div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
              aria-hidden="true"
            />
          )}
          <div className={cn(
            "z-50 flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-200",
            isExpanded
              ? "fixed inset-3 sm:inset-6 md:inset-8 w-auto h-auto max-w-4xl mx-auto my-auto"
              : "fixed bottom-[74px] sm:bottom-20 right-3 sm:right-6 w-[calc(100vw-1.5rem)] sm:w-[480px] h-[560px] max-h-[calc(100vh-6.5rem)] animate-in fade-in-0 zoom-in-95 duration-150"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-border/70 bg-muted/30 shrink-0">
              {/* Tab Switcher: Nav Help first, Support / Ticket after Nav Help */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('nav')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                    activeTab === 'nav'
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Nav Help</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('support')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                    activeTab === 'support'
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LifeBuoy className="h-3.5 w-3.5" />
                  <span>Support / Ticket</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label={isExpanded ? "Collapse dialog" : "Expand to fullscreen"}
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

          {/* TAB 1: NAV HELP */}
          {activeTab === 'nav' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Quick Navigation Shortcuts */}
              <div className="px-3.5 sm:px-4 py-2 border-b border-border/40 bg-muted/20 shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Compass className="h-3 w-3" /> Jump to page
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {quickActions.map((action) => (
                    <button
                      key={action.path}
                      type="button"
                      onClick={() => handleNavigation(action.path)}
                      title={action.label}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg text-left transition-colors cursor-pointer border border-border/60 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground group min-w-0"
                    >
                      <action.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 min-h-0">
                {messages.map((m, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className={cn("flex gap-2", m.role === 'user' ? "justify-end" : "justify-start")}>
                      {m.role === 'assistant' && (
                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <RaiseLogo size={12} className="currentColor" />
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs",
                        m.role === 'user'
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted text-foreground"
                      )}>
                        {m.role === 'user' ? (
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        ) : (
                          <div className="relative">
                            <MarkdownRenderer
                              onLinkClick={(href) => handleNavigation(href)}
                              className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed prose-p:my-1 prose-p:leading-relaxed prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1.5 prose-headings:text-xs prose-headings:font-bold prose-code:text-[11px] prose-code:bg-background/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:my-1.5 prose-pre:p-2 prose-pre:bg-background/80 overflow-hidden break-words"
                            >
                              {formatMessageWithLinks(m.content)}
                            </MarkdownRenderer>
                            {m.isTyping && (
                              <span
                                className="inline-block w-1.5 h-3 ml-1 bg-primary align-baseline animate-pulse"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dedicated Open Page Buttons for Assistant Suggestions */}
                    {m.navigation && m.navigation.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 ml-8 pt-0.5">
                        {m.navigation.map((nav, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            onClick={() => handleNavigation(nav.path)}
                            className="h-7 text-xs font-bold rounded-full border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer gap-1 shadow-xs max-w-[200px]"
                          >
                            <Compass className="h-3 w-3 shrink-0" />
                            <span className="truncate">Open {nav.label} →</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Suggested Questions */}
                {!isLoading && !isTyping && messages.length <= 2 && (
                  <div className="space-y-1 pt-1 ml-8">
                    {suggestedPrompts.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendMessage(p)}
                        className="flex items-center gap-1.5 w-full text-left text-xs text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
                      >
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        <span>{p}</span>
                      </button>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <div className="flex gap-2 items-center" role="status">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                      <RaiseLogo size={12} className="currentColor" />
                    </div>
                    <div className="bg-muted rounded-xl px-3 py-2 text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
                      <span className="size-1.5 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
                      <span className="size-1.5 rounded-full bg-primary/70 animate-bounce" />
                      <span className="sr-only">Raise is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border shrink-0 bg-background">
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-1.5 border border-border focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(input);
                      }
                    }}
                    placeholder="Ask Raise where to find things..."
                    className="flex-1 bg-transparent border-0 resize-none p-1 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:outline-none focus:ring-0 min-h-[22px] max-h-[72px] leading-relaxed"
                    rows={1}
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    type="button"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="h-6 w-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-opacity cursor-pointer shrink-0"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUPPORT / REPORT BUG */}
          {activeTab === 'support' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden" onPaste={handlePaste}>
              {submittedTicketId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-6">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xl">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">Report Sent</h3>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Thanks for helping us improve Scorpio. Our team will review this shortly.
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground pt-1">
                      Ticket #{submittedTicketId}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSubmittedTicketId(null)}
                    className="mt-2 text-xs font-semibold cursor-pointer"
                  >
                    Submit another report
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                    {/* Issue Type Pills */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Category</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {([
                          { id: 'bug' as const, label: 'Bug / Issue' },
                          { id: 'feature' as const, label: 'Feature' },
                          { id: 'question' as const, label: 'Question' },
                        ]).map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setIssueType(t.id)}
                            className={cn(
                              "px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center truncate",
                              issueType === t.id
                                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Main Textarea */}
                    <div className="space-y-1 flex flex-col">
                      <label className="text-[11px] font-semibold text-muted-foreground">Description</label>
                      <textarea
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what happened or what you need help with... (Paste screenshots directly with Cmd+V)"
                        className="w-full min-h-[110px] sm:min-h-[130px] p-3 text-xs bg-card resize-none rounded-xl border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 leading-relaxed"
                      />
                    </div>

                    {/* Screenshot Attachments */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files)}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={screenshots.length >= 3}
                          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                          <span>Add Screenshot {screenshots.length > 0 && `(${screenshots.length}/3)`}</span>
                        </button>
                        <span className="text-[10px] text-muted-foreground/60">
                          Paste directly or upload
                        </span>
                      </div>

                      {/* Previews */}
                      {screenshots.length > 0 && (
                        <div className="flex gap-2 pt-1 overflow-x-auto pb-1">
                          {screenshots.map((src, i) => (
                            <div key={i} className="relative group h-14 w-20 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                              <Image src={src} alt="screenshot" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => removeScreenshot(i)}
                                className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer & Submit Button */}
                  <div className="p-3 sm:px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between shrink-0">
                    <span className="text-[11px] text-muted-foreground truncate mr-2">
                      Direct contact: <a href="mailto:rushil@scorpioedu.org" className="underline hover:text-foreground">rushil@scorpioedu.org</a>
                    </span>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !description.trim()}
                      className="h-8 px-4 rounded-full text-xs font-bold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                    >
                      {isSubmitting ? 'Sending...' : 'Submit'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </>
    )}
    </>
  );
}
