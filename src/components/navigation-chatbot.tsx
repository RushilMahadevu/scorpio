'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Home, FileText, GraduationCap, BarChart, Upload, Users, BookOpen, Video, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { MarkdownRenderer } from './markdown-renderer';

type UserRole = 'student' | 'teacher';

interface NavigationChatbotProps {
  userRole: UserRole;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  navigation?: { path: string; label: string };
}

interface QuickAction {
  icon: React.ElementType;
  label: string;
  path: string;
}

export function NavigationChatbot({ userRole }: NavigationChatbotProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `I can help you navigate the platform and find features.\n\nTry asking: "Where do I check my grades?" or "Take me to assignments"` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const studentQuickActions: QuickAction[] = [
    { icon: Home, label: 'Dashboard', path: '/student' },
    { icon: FileText, label: 'Assignments', path: '/student/assignments' },
    { icon: BarChart, label: 'Grades', path: '/student/grades' },
    { icon: BookOpen, label: 'Resources', path: '/student/resources' },
    { icon: GraduationCap, label: 'Tutor', path: '/student/tutor' },
    { icon: Upload, label: 'Submissions', path: '/student/submissions' },
  ];

  const teacherQuickActions: QuickAction[] = [
    { icon: Home, label: 'Dashboard', path: '/teacher' },
    { icon: FileText, label: 'Assignments', path: '/teacher/assignments' },
    { icon: Rocket, label: 'Create New', path: '/teacher/create' },
    { icon: BarChart, label: 'Grades', path: '/teacher/grades' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: Upload, label: 'Uploads', path: '/teacher/uploads' },
  ];

  const quickActions = userRole === 'student' ? studentQuickActions : teacherQuickActions;

  const handleNavigation = (path: string, label: string) => {
    router.push(path);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: `Taking you to ${label}...` 
    }]);
    setTimeout(() => setIsOpen(false), 500);
  };

  const extractNavigationPath = (text: string): { path: string; label: string } | null => {
    const pathMatch = text.match(/\(([^)]+)\)/);
    if (pathMatch) {
      const path = pathMatch[1];
      const action = quickActions.find(a => a.path === path);
      if (action) {
        return { path, label: action.label };
      }
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !user) return;
    setRateLimitError(null);
    setRateLimitWarning(null);

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userRole,
          userId: user.uid
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setRateLimitError(data.error);
          return;
        }
        throw new Error(data.error || 'Failed to get AI response');
      }

      const aiResponse = data.text;
      const navPath = extractNavigationPath(aiResponse);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse,
        navigation: navPath || undefined
      }]);

      if (data.remainingRequests <= 3 && data.remainingRequests > 0) {
        setRateLimitWarning(`Warning: Only ${data.remainingRequests} navigation AI requests left in this hour.`);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble right now. Try using the quick actions below or contact support at rushil.mahadevu@gmail.com" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-md z-50 bg-card/40 border border-border/50 backdrop-blur-sm hover:bg-card/60 hover:border-border transition-all cursor-pointer"
        size="icon"
        aria-label="Navigation Assistant"
      >
        {isOpen ? <X className="h-5 w-5 text-foreground" /> : <MessageCircle className="h-5 w-5 text-foreground" />}
      </Button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-card border rounded-lg shadow-2xl z-50 flex flex-col h-[600px]">
          {/* Header */}
          <div className="p-4 border-b opacity-90 transition-opacity">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">Navigation Assistant</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ask where to find things or get platform info
            </p>
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-b opacity-70 hover:opacity-100 transition-opacity">
            <p className="text-xs font-medium mb-2 text-muted-foreground">Quick Navigation</p>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(action.path, action.label)}
                  className="flex flex-col items-center p-2 rounded-md hover:bg-accent transition-all group cursor-pointer"
                  title={action.label}
                >
                  <action.icon className="h-5 w-5 mb-1" />
                  <span className="text-[10px] font-medium text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : (
                      <MarkdownRenderer className="text-sm prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:my-2 prose-ul:my-2 prose-li:my-0 break-words max-w-none">
                        {message.content.replace(/\([^)]+\)/g, '')}
                      </MarkdownRenderer>
                    )}
                  </div>
                </div>
                {message.navigation && (
                  <div className="flex justify-start mt-2">
                    <Button
                      onClick={() => handleNavigation(message.navigation!.path, message.navigation!.label)}
                      size="sm"
                      className="h-8"
                    >
                      Go to {message.navigation.label} →
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t opacity-90 transition-opacity">
            <div className="flex gap-2">
              {rateLimitError && (
                <div className="p-2 text-red-600 text-xs font-semibold border-b bg-red-50 rounded mb-2">
                  {rateLimitError}
                </div>
              )}
              {rateLimitWarning && !rateLimitError && (
                <div className="p-2 text-yellow-700 text-xs font-semibold border-b bg-yellow-50 rounded mb-2">
                  {rateLimitWarning}
                </div>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Where do you want to go?"
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                disabled={isLoading || !!rateLimitError}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                disabled={!input.trim() || isLoading || !!rateLimitError}
                className="h-10 w-10 cursor-pointer hover:bg-primary/80 transition-all"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center opacity-60">
              AI-powered navigation • Scorpio
            </p>
          </div>
        </div>
      )}
    </>
  );
}
