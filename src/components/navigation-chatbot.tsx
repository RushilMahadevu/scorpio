'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  X, Send, Home, FileText, GraduationCap, BarChart,
  Upload, Users, BookOpen, Rocket, Zap,
  NotebookPen, BowArrow, Building2, LifeBuoy,
  Compass, ArrowRight, Image as ImageIcon, Trash2
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { MarkdownRenderer } from './markdown-renderer';
import { cn } from '@/lib/utils';
import { CruxLogo } from './ui/crux-logo';
import { toast } from 'sonner';
import Image from 'next/image';

type UserRole = 'student' | 'teacher';
type ActiveTab = 'support' | 'nav';

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
  { icon: GraduationCap, label: 'Tutor', path: '/student/tutor' },
  { icon: BowArrow, label: 'Practice', path: '/student/practice' },
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
  "What is Tutor?",
  "How does Practice work?",
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('support');

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
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(
    userRole === 'teacher' ? teacherSuggested : studentSuggested
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const quickActions = userRole === 'student' ? studentQuickActions : teacherQuickActions;

  const extractAllNavigationPaths = (text: string): NavDestination[] => {
    const matches = Array.from(text.matchAll(/\((\/(?:student|teacher)[^)\s]*)\)/g));
    const destinations: NavDestination[] = [];

    for (const match of matches) {
      const path = match[1];
      if (!destinations.some(d => d.path === path)) {
        const action = quickActions.find(a => a.path === path);
        const fallbackLabel = path.split('/').pop()?.replace(/-/g, ' ') || path;
        const label = action ? action.label : (fallbackLabel.charAt(0).toUpperCase() + fallbackLabel.slice(1));
        destinations.push({ path, label });
      }
    }
    return destinations;
  };

  const formatMessageWithLinks = (text: string): string => {
    // Replace `(/student/grades)` with `[Grades](/student/grades)` or `[/student/grades](/student/grades)`
    return text.replace(/\((\/(?:student|teacher)[^)\s]*)\)/g, (_match, path) => {
      const action = quickActions.find(a => a.path === path);
      const label = action ? action.label : path;
      return `[${label}](${path})`;
    });
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  useEffect(() => {
    const firstName = profile?.displayName?.split(' ')[0] || (userRole === 'teacher' ? 'Teacher' : 'there');
    const roleBlurb = userRole === 'teacher'
      ? `I can help you navigate [Assignments](/teacher/assignments), [Create Assignment](/teacher/create), [Gradebook](/teacher/grades), [Network Limits](/teacher/network), [Waypoints](/teacher/waypoints), and more.`
      : `I can help you navigate [Assignments](/student/assignments), your [Tutor](/student/tutor), [Practice](/student/practice), [Notebook](/student/notebook), and [Grades](/student/grades).`;

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
      const response = await fetch('/api/support/report', {
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
      const response = await fetch('/api/chat', {
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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.text,
        navigation: navDestinations.length > 0 ? navDestinations : undefined,
      }]);

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
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 h-12 px-5 rounded-full cursor-pointer transition-all duration-200 shadow-2xl active:scale-95 select-none",
          "bg-primary text-white hover:bg-primary/90 border border-black",
          "dark:bg-primary dark:text-black dark:hover:bg-primary/90 dark:border-white"
        )}
        aria-label="Support & Help"
      >
        {isOpen ? (
          <>
            <X className="h-5 w-5 shrink-0" />
            <span className="text-sm font-bold">Close</span>
          </>
        ) : (
          <>
            <LifeBuoy className="h-6 w-6 shrink-0" />
            <span className="text-md font-bold tracking-tight">Support</span>
          </>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-22 right-6 z-50 flex flex-col",
          "w-[520px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)]",
          "bg-background border border-border rounded-2xl shadow-2xl overflow-hidden",
          "animate-in fade-in-0 zoom-in-95 duration-150"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-muted/30 shrink-0">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('support')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer",
                  activeTab === 'support'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Support
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('nav')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer",
                  activeTab === 'nav'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Nav Help
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* TAB 1: SUPPORT / REPORT BUG */}
          {activeTab === 'support' && (
            <div className="flex-1 overflow-y-auto p-5" onPaste={handlePaste}>
              {submittedTicketId ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-4">
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
                <form onSubmit={handleSupportSubmit} className="space-y-4 flex flex-col h-full">
                  {/* Issue Type Pills */}
                  <div className="flex gap-2">
                    {([
                      { id: 'bug' as const, label: 'Bug / Issue' },
                      { id: 'feature' as const, label: 'Feature Request' },
                      { id: 'question' as const, label: 'Help / Question' },
                    ]).map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setIssueType(t.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                          issueType === t.id
                            ? "bg-foreground text-background border-foreground shadow-sm"
                            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Main Textarea */}
                  <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                    <Textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what happened or what you need help with... (You can also paste screenshots directly with Cmd+V)"
                      className="flex-1 min-h-[140px] text-sm bg-card resize-none rounded-xl border-border focus-visible:ring-1"
                    />
                  </div>

                  {/* Screenshot Attachments */}
                  <div className="space-y-2">
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
                        Paste directly or click to upload
                      </span>
                    </div>

                    {/* Previews */}
                    {screenshots.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {screenshots.map((src, i) => (
                          <div key={i} className="relative group h-16 w-24 rounded-lg overflow-hidden border border-border bg-muted">
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

                  {/* Footer & Submit Button */}
                  <div className="pt-3 border-t border-border flex items-center justify-between shrink-0">
                    <span className="text-[11px] text-muted-foreground">
                      Direct contact: <a href="mailto:rushil@scorpioedu.org" className="underline hover:text-foreground">rushil@scorpioedu.org</a>
                    </span>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !description.trim()}
                      className={cn(
                        "h-9 px-4 rounded-lg text-xs font-bold cursor-pointer",
                        "bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85"
                      )}
                    >
                      {isSubmitting ? 'Sending...' : 'Submit'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: NAV HELP */}
          {activeTab === 'nav' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Quick Navigation Shortcuts */}
              <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20 shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Compass className="h-3 w-3" /> Jump to page
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {quickActions.map((action) => (
                    <button
                      key={action.path}
                      type="button"
                      onClick={() => handleNavigation(action.path)}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-muted text-left transition-colors cursor-pointer border border-transparent hover:border-border/50 group"
                    >
                      <action.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className={cn("flex gap-2", m.role === 'user' ? "justify-end" : "justify-start")}>
                      {m.role === 'assistant' && (
                        <div className="h-6 w-6 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 mt-0.5">
                          <CruxLogo size={12} className="currentColor" />
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs",
                        m.role === 'user'
                          ? "bg-foreground text-background"
                          : "bg-muted text-foreground"
                      )}>
                        {m.role === 'user' ? (
                          <p>{m.content}</p>
                        ) : (
                          <MarkdownRenderer
                            onLinkClick={(href) => handleNavigation(href)}
                            className="prose prose-xs dark:prose-invert prose-p:my-0"
                          >
                            {formatMessageWithLinks(m.content)}
                          </MarkdownRenderer>
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
                            className="h-7 text-xs font-bold rounded-lg border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer gap-1 shadow-xs"
                          >
                            <Compass className="h-3 w-3" />
                            Open {nav.label} →
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Suggested Questions */}
                {!isLoading && messages.length <= 2 && (
                  <div className="space-y-1 pt-1 ml-8">
                    {suggestedPrompts.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendMessage(p)}
                        className="flex items-center gap-1.5 w-full text-left text-xs text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
                      >
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                      <CruxLogo size={12} className="currentColor" />
                    </div>
                    <div className="bg-muted rounded-xl px-3 py-2 text-xs text-muted-foreground">
                      Typing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border shrink-0 bg-background">
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-1.5 border border-border">
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
                          placeholder="Ask Tutor where to find things..."
                    className="flex-1 bg-transparent border-0 resize-none p-0 text-xs focus-visible:ring-0 min-h-[20px] max-h-[60px]"
                    rows={1}
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="h-6 w-6 rounded-lg bg-foreground text-background hover:opacity-80 transition-opacity cursor-pointer shrink-0"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
