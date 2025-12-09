'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, X, Send, Navigation, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getGenerativeModel } from 'firebase/ai';
import { genAI } from '@/lib/firebase';

type UserRole = 'student' | 'teacher';
type ChatMode = 'menu' | 'chat';

interface NavigationChatbotProps {
  userRole: UserRole;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

const studentNavigationOptions = [
  { path: '/student/assignments', label: 'Assignments' },
  { path: '/student/grades', label: 'Grades' },
  { path: '/student/submissions', label: 'Submissions' },
  { path: '/student/resources', label: 'Resources' },
  { path: '/student/tutor', label: 'Tutor' },
  { path: '/student', label: 'Dashboard' },
];

const teacherNavigationOptions = [
  { path: '/teacher/assignments', label: 'Assignments' },
  { path: '/teacher/create', label: 'Create Assignment' },
  { path: '/teacher/grades', label: 'Grades' },
  { path: '/teacher/students', label: 'Students' },
  { path: '/teacher/analytics', label: 'Analytics' },
  { path: '/teacher/uploads', label: 'Uploads' },
  { path: '/teacher', label: 'Dashboard' },
];

export function NavigationChatbot({ userRole }: NavigationChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('menu');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigationOptions = userRole === 'student' ? studentNavigationOptions : teacherNavigationOptions;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (mode === 'chat' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const model = getGenerativeModel(genAI, { model: 'gemini-2.0-flash-exp' });
      const context = userRole === 'student' 
        ? 'You are a helpful assistant for a physics learning platform. Help students with navigation, questions about assignments, grades, resources, and general physics help. Keep responses brief and friendly.'
        : 'You are a helpful assistant for a physics teaching platform. Help teachers with navigation, questions about managing assignments, grading, student analytics, and platform features. Keep responses brief and professional.';
      
      const prompt = `${context}\n\nUser question: ${inputValue}\n\nProvide a helpful, concise response.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botText = response.text();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        isBot: true,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again or contact support at support@physicsplatform.com',
        isBot: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const switchToChat = () => {
    setMode('chat');
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '0',
        text: `Hi! I'm your AI assistant. Ask me anything about ${userRole === 'student' ? 'your assignments, grades, or physics concepts' : 'managing your class, assignments, or platform features'}. For general support, email: support@physicsplatform.com`,
        isBot: true,
      };
      setMessages([welcomeMessage]);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
        size="icon"
        aria-label="Help & Navigation"
      >
        {isOpen ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </Button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-background border rounded-lg shadow-xl z-50 flex flex-col max-h-[500px]">
          {/* Header with Mode Toggle */}
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm">Help & Support</h3>
            <div className="flex gap-1">
              <Button
                variant={mode === 'menu' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('menu')}
                className="h-7 px-2"
              >
                <Navigation className="h-3 w-3" />
              </Button>
              <Button
                variant={mode === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={switchToChat}
                className="h-7 px-2"
              >
                <MessageCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {mode === 'menu' ? (
            <div className="p-2 space-y-1 overflow-auto">
              <p className="text-xs text-muted-foreground px-2 py-1">Quick Navigation</p>
              {navigationOptions.map((option) => (
                <Button
                  key={option.path}
                  variant="ghost"
                  className="w-full justify-start text-sm h-8"
                  onClick={() => handleNavigation(option.path)}
                >
                  {option.label}
                </Button>
              ))}
              <div className="pt-2 px-2 text-xs text-muted-foreground border-t mt-2">
                <p>Need help? Switch to chat or email:</p>
                <p className="text-primary">support@physicsplatform.com</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div ref={scrollRef} className="flex-1 p-3 space-y-2 overflow-auto min-h-[200px] max-h-[350px]">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      message.isBot 
                        ? 'bg-muted text-foreground' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      {message.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-2 border-t">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="flex-1 px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background disabled:opacity-50"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon" 
                    disabled={!inputValue.trim() || isLoading}
                    className="h-8 w-8"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
