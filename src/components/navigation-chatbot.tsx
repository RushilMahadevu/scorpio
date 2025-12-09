'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Home, FileText, GraduationCap, BarChart, Upload, Users, BookOpen, Video, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getGenerativeModel } from "firebase/ai";
import { genAI } from "@/lib/firebase";

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

const PLATFORM_CONTEXT = `
You are a navigation assistant for a physics learning platform. Your role is to:
1. Help users navigate to different parts of the platform
2. Explain what features are available and how to use them
3. Provide information about the platform's capabilities

STUDENT FEATURES:
- Dashboard (/student) - Overview of assignments and progress
- Assignments (/student/assignments) - View and access all assigned work
- Assignment View (/student/assignment-view) - Complete specific assignments
- Grades (/student/grades) - Check scores and feedback
- Submissions (/student/submissions) - Review past submissions
- Resources (/student/resources) - Access study materials
- Tutor (/student/tutor) - Get AI help with physics problems

TEACHER FEATURES:
- Dashboard (/teacher) - Overview of classes and student progress
- Assignments (/teacher/assignments) - Manage all assignments
- Create Assignment (/teacher/create) - Build new assignments with AI-generated questions
- Assignment View (/teacher/assignment-view) - View assignment details
- Grades (/teacher/grades) - Overview of all student grades
- Student Grades (/teacher/grades/student) - Individual student performance
- Grade Submission (/teacher/submission/grade) - Grade student work
- Students (/teacher/students) - Manage student roster
- Uploads (/teacher/uploads) - Upload and manage resources

When a user asks to go somewhere or about a feature, provide a helpful response and include the navigation path.
Keep responses brief and actionable. Always be friendly and helpful.
`;

export function NavigationChatbot({ userRole }: NavigationChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `I can help you navigate the platform and find features.\n\nTry asking: "Where do I check my grades?" or "Take me to assignments"` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const model = getGenerativeModel(genAI, { model: "gemini-2.5-flash" });
      
      const fullPrompt = `${PLATFORM_CONTEXT}\n\nUser role: ${userRole}\nUser question: ${userMessage}\n\nIf suggesting navigation, wrap the path in parentheses like this: (/student/grades)`;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const aiResponse = response.text();

      const navPath = extractNavigationPath(aiResponse);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse,
        navigation: navPath || undefined
      }]);
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-md z-50 bg-card/40 border border-border/50 backdrop-blur-sm hover:bg-card/60 hover:border-border transition-all"
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
                  className="flex flex-col items-center p-2 rounded-md hover:bg-accent transition-all group"
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
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content.replace(/\([^)]+\)/g, '')}
                    </p>
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
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Where do you want to go?"
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-10 w-10"
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
