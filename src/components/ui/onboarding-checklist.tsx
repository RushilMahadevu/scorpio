"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight, Sparkles, Building2, PlusCircle, Upload, School, FileText, FileCheck, PackageOpen, Bot } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, doc, updateDoc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  title: string;
  icon: any;
  link: string;
  check: (data: any) => boolean;
}

const TEACHER_ITEMS: ChecklistItem[] = [
  {
    id: "create_class",
    title: "Class Setup",
    icon: School,
    link: "/teacher",
    check: (data) => data.courseCount > 0,
  },
  {
    id: "join_network",
    title: "Network",
    icon: Building2,
    link: "/teacher/network",
    check: (data) => !!data.profile?.organizationId,
  },
  {
    id: "upload_resource",
    title: "Resources",
    icon: Upload,
    link: "/teacher/uploads",
    check: (data) => data.resourceCount > 0,
  },
  {
    id: "create_assignment",
    title: "Assignments",
    icon: PlusCircle,
    link: "/teacher/create",
    check: (data) => data.assignmentCount > 0,
  },
];

const STUDENT_ITEMS: ChecklistItem[] = [
  {
    id: "enroll_class",
    title: "Enrollment",
    icon: School,
    link: "/student",
    check: (data) => !!data.profile?.courseId,
  },
  {
    id: "complete_assignment",
    title: "First Submission",
    icon: FileText,
    link: "/student/assignments",
    check: (data) => data.completedCount > 0 || !!data.profile?.onboarding?.complete_assignment,
  },
  {
    id: "chat_tutor",
    title: "AI Guidance",
    icon: Bot,
    link: "/student/tutor",
    check: (data) => data.chatCount > 0 || !!data.profile?.onboarding?.chat_tutor,
  },
];

export function OnboardingChecklist({ 
  userRole,
  metadata = {}
}: { 
  userRole: "teacher" | "student",
  metadata?: any
}) {
  const { user, profile } = useAuth();
  const [isStabilized, setIsStabilized] = useState(false);
  const [autoProgress, setAutoProgress] = useState<any>({
    courseCount: 0,
    resourceCount: 0,
    assignmentCount: 0,
    completedCount: 0,
    chatCount: 0,
    vaultVisited: false,
    notebookCount: 0,
    ...metadata
  });
  
  const items = userRole === "teacher" ? TEACHER_ITEMS : STUDENT_ITEMS;
  
  const handleItemClick = async (itemId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        [`onboarding.${itemId}`]: true
      });
    } catch (e) {
      console.warn("Failed to mark onboarding item as done", e);
    }
  };

  useEffect(() => {
    // Wait for initial dashboard data to settle before showing the guide
    const timer = setTimeout(() => setIsStabilized(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch supplemental data that might not be in the dashboard props
    async function fetchChecklistData() {
      try {
        if (userRole === "teacher") {
          // Check resources
          const resSnap = await getDocs(query(collection(db, "resources"), where("teacherId", "==", user!.uid), limit(1)));
          setAutoProgress((prev: any) => ({ ...prev, resourceCount: resSnap.size }));
        } else {
          // Check tutor chats
          const chatSnap = await getDocs(query(collection(db, "chats"), where("userId", "==", user!.uid), limit(1)));
          // Check notebooks
          const notebookSnap = await getDocs(query(collection(db, "notebooks"), where("userId", "==", user!.uid), limit(1)));
          setAutoProgress((prev: any) => ({ 
            ...prev, 
            chatCount: chatSnap.size,
            notebookCount: notebookSnap.size
          }));
        }
      } catch (e) {
        console.warn("Checklist autocheck failed", e);
      }
    }

    fetchChecklistData();
  }, [user, userRole]);

  // Merge profile into autoProgress for the checks
  const checkData = { ...autoProgress, profile, ...metadata };
  const completedItems = items.filter(item => item.check(checkData));
  const progress = (completedItems.length / items.length) * 100;

  const shouldShow = isStabilized && progress < 100;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div 
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full overflow-hidden"
        >
          <Card className="border border-zinc-200/50 dark:border-white/5 bg-zinc-100/50 dark:bg-zinc-900/40 backdrop-blur-md shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-4 px-6 py-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none">Setup Guide</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">
                    Progress: {Math.round(progress)}%
                  </p>
                </div>
              </div>

              <div className="flex-1 w-full max-w-2xl mx-auto flex items-center justify-between gap-1">
                {items.map((item, index) => {
                  const isDone = item.check(checkData);
                  return (
                    <div key={item.id} className="flex items-center flex-1 last:flex-none">
                      <Link href={item.link} onClick={() => handleItemClick(item.id)} className="group relative flex flex-col items-center">
                        <div 
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500",
                            isDone 
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                              : "bg-background border-2 border-muted text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <item.icon className="h-4 w-4" />
                          )}
                        </div>
                        <span className={cn(
                          "absolute -bottom-5 whitespace-nowrap text-[9px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity",
                          isDone ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                        )}>
                          {item.title}
                        </span>
                      </Link>
                      
                      {index < items.length - 1 && (
                        <div className="flex-1 mx-2 h-[2px] bg-muted relative overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: isDone ? "100%" : "0%" }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 bg-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Link href={items.find(it => !it.check(checkData))?.link || items[0].link} className="shrink-0 ml-2 hidden lg:block">
                <Button size="sm" variant="outline" className="h-9 px-4 text-xs font-bold rounded-xl border-primary/20 hover:bg-primary/5 gap-2">
                  {progress === 100 ? "All Set!" : "Next Step"}
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
