'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type UserRole = 'student' | 'teacher';

interface NavigationChatbotProps {
  userRole: UserRole;
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
  { path: '/teacher/uploads', label: 'Uploads' },
  { path: '/teacher', label: 'Dashboard' },
];

export function NavigationChatbot({ userRole }: NavigationChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navigationOptions = userRole === 'student' ? studentNavigationOptions : teacherNavigationOptions;

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
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
          {/* Header */}
          <div className="p-3 border-b">
            <h3 className="font-semibold text-sm">Quick Navigation</h3>
          </div>

          {/* Content */}
          <div className="p-2 space-y-1 overflow-auto">
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
              <p>Need help? Email:</p>
              <a href="mailto:rushil.mahadevu@gmail.com" className="text-primary hover:underline">
                rushil.mahadevu@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
