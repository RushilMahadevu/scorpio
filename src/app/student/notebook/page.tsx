"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  deleteDoc,
  increment 
} from "firebase/firestore";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { 
  BookOpen, 
  Sparkles, 
  Send, 
  Loader2, 
  Save, 
  Clock, 
  PenLine, 
  Eye, 
  Cpu,
  Trash2,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Search,
  BookMarked,
  Lock,
  NotebookPen,
  Type,
  Hash,
  Files,
  Plus,
  MoreVertical,
  X,
  Crown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Minimize2
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Notebook {
  id: string;
  title: string;
  content: string;
  studentId: string;
  createdAt: any;
  updatedAt: any;
}
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import TurndownService from "turndown";
import Showdown from "showdown";

const turndown = new TurndownService();
const converter = new Showdown.Converter();

// Lazy load RichTextEditor to avoid SSR hydration issues
const RichTextEditor = dynamic(() => import("@/components/rich-text-editor").then(mod => mod.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-50 dark:bg-zinc-900/10 animate-pulse flex items-center justify-center text-[10px] font-bold text-zinc-400">LOADING EDITOR...</div>
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function NotebookPage() {
  const { user } = useAuth();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("Untitled Notebook");
  const [isEditing, setIsEditing] = useState(true);
  const [editorMode, setEditorMode] = useState<'markdown' | 'rich-text'>('rich-text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [orgData, setOrgData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [studentUsage, setStudentUsage] = useState<number>(0);
  const [showCopilot, setShowCopilot] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);

  // Use onSnapshot for real-time usage tracking from the user document
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        setStudentUsage(doc.data().aiUsageCount || 0);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // AI is disabled IF:
  // 1. Organization has exhausted its budget (aiUsageCurrent >= aiBudgetLimit, with safety for 0 limits)
  // 2. Student has reached their personal monthly interaction limit
  const isAiDisabled = 
    (orgData?.aiBudgetLimit > 0 && (orgData?.aiUsageCurrent || 0) >= (orgData?.aiBudgetLimit || 0)) ||
    (orgData?.aiNotebookLimitPerStudent > 0 && studentUsage >= (orgData?.aiNotebookLimitPerStudent || 0));

  // Helper to get HTML from Markdown
  const getHtml = (md: string) => converter.makeHtml(md);
  // Helper to get Markdown from HTML
  const getMarkdown = (html: string) => turndown.turndown(html);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch List of Notebooks & Org Settings
  useEffect(() => {
    if (!user) return;

    // 1. Fetch Organization Data first for limits
    async function fetchOrgSettings() {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        const orgId = userData?.organizationId;
        
        if (orgId) {
          // Use onSnapshot for real-time subscription status updates
          const unsubscribeOrg = onSnapshot(doc(db, "organizations", orgId), (orgSnap) => {
            if (orgSnap.exists()) {
              const data = orgSnap.data();
              setOrgData(data);
              if (data?.notebookLimit === 0) setIsLocked(true);
            }
          });
          return unsubscribeOrg;
        }
      } catch (err) {
        console.error("Access config failed:", err);
      }
    }

    const orgPromise = fetchOrgSettings();
    let orgUnsubscribe: (() => void) | undefined;
    orgPromise.then(unsub => { orgUnsubscribe = unsub; });

    // 2. Load Notebook List
    const q = query(collection(db, "notebooks"), where("studentId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const handleSnapshot = async () => {
        let list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notebook));
        
        // Migration: Check if a notebook existed at notebooks/{uid} (the old structure)
        if (list.length === 0) {
          try {
            const oldRef = doc(db, "notebooks", user.uid);
            const oldSnap = await getDoc(oldRef);
            
            if (oldSnap.exists()) {
              const oldData = oldSnap.data();
              if (!oldData.studentId) {
                const newRef = doc(collection(db, "notebooks"));
                await setDoc(newRef, {
                  title: "Initial Notebook",
                  content: oldData.content || "",
                  studentId: user.uid,
                  createdAt: oldData.createdAt || serverTimestamp(),
                  updatedAt: oldData.updatedAt || serverTimestamp()
                });
                await updateDoc(oldRef, { studentId: user.uid, title: "Initial Notebook Migration" });
                return; // Re-fire listener
              }
            } else {
              // New user - create one
              const newRef = doc(collection(db, "notebooks"));
              await setDoc(newRef, {
                title: "My Research Notebook",
                content: "# Welcome\n\nCapture your thoughts here.",
                studentId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              return; // Re-fire listener
            }
          } catch (err) {
            console.error("Migration/Setup error:", err);
            // Fallback: clear loading so user doesn't get stuck even if setup fails
            setLoading(false);
          }
        } else {
          setNotebooks(list);

          if (!activeNotebookId && list.length > 0) {
            setActiveNotebookId(list[0].id);
          }
          
          setLoading(false);
        }
      };

      handleSnapshot();
    }, (error) => {
      console.error("Snapshot error:", error);
      setLoading(false);
      toast.error("Cloud synchronization error.");
    });

    return () => {
      unsubscribe();
      if (orgUnsubscribe) orgUnsubscribe();
    };
  }, [user]);

  // Sync content and message history with active notebook
  useEffect(() => {
    if (!activeNotebookId || !user) return;

    const docRef = doc(db, "notebooks", activeNotebookId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!hasUnsavedChanges) {
          setContent(data.content || "");
          setTitle(data.title || "Untitled");
          setLastSavedAt(data.updatedAt?.toDate() || null);
          // Load chat history from the notebook document
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
          } else {
            setMessages([]);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [activeNotebookId, hasUnsavedChanges]);

  // Auto-save logic
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timeoutId = setTimeout(async () => {
      await saveNotebook();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [hasUnsavedChanges, content, title]);

  const saveNotebook = async () => {
    if (!user || !activeNotebookId || !hasUnsavedChanges) return;
    
    setIsSaving(true);
    try {
      const docRef = doc(db, "notebooks", activeNotebookId);
      await updateDoc(docRef, {
        content: content,
        title: title,
        updatedAt: serverTimestamp()
      });
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Sync failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const createNewNotebook = async () => {
    if (!user || !orgData) return;
    
    const limit = orgData?.notebookLimitPerStudent || 1; 
    if (notebooks.length >= limit) {
      toast.error(`Allowance exceeded. Limited to ${limit} notebooks.`);
      return;
    }

    try {
      const newRef = doc(collection(db, "notebooks"));
      await setDoc(newRef, {
        title: "New Notebook",
        content: "",
        studentId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setActiveNotebookId(newRef.id);
      toast.success("New notebook initialized.");
    } catch (err) {
      toast.error("Notebook creation failed.");
    }
  };

  const deleteNotebook = async (id: string) => {
    if (!id || notebooks.length <= 1) {
      toast.error("At least one notebook is required.");
      return;
    }

    if (!confirm("Delete this notebook? This cannot be undone.")) return;

    try {
      await deleteDoc(doc(db, "notebooks", id));
      if (activeNotebookId === id) {
        const remaining = notebooks.filter(n => n.id !== id);
        setActiveNotebookId(remaining[0]?.id || null);
      }
      toast.success("Notebook erased.");
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val !== content) {
      setContent(val);
      setHasUnsavedChanges(true);
    }
  };

  const handleRichTextChange = (html: string) => {
    const md = getMarkdown(html);
    if (md !== content) {
      setContent(md);
      setHasUnsavedChanges(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || isLoading) return;

    if (isAiDisabled) {
      toast.error(
        studentUsage >= (orgData?.aiNotebookLimitPerStudent || 0) && (orgData?.aiNotebookLimitPerStudent || 0) > 0
          ? "Monthly interaction limit reached. Contact your instructor to increase your quota."
          : "Network monthly AI budget reached."
      );
      return;
    }

    const userMessage: Message = { role: 'user', content: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    // Also persist users's message to notebook right away
    if (activeNotebookId) {
      updateDoc(doc(db, "notebooks", activeNotebookId), {
        messages: newMessages,
        updatedAt: serverTimestamp()
      });
    }

    try {
      const response = await fetch('/api/notebook/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          notebookContent: content,
          studentId: user.uid
        })
      });

      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setMessages(prev => {
        const updatedMessages = [...prev, { role: 'assistant', content: data.content }];
        // Persist messages to the notebook document
        if (activeNotebookId) {
          const notebookRef = doc(db, "notebooks", activeNotebookId);
          updateDoc(notebookRef, {
            messages: updatedMessages,
            updatedAt: serverTimestamp()
          });
        }
        return updatedMessages;
      });
      
      // Persist usage count to Firestore
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          aiUsageCount: increment(1)
        });
      }
    } catch (error) {
      toast.error("Copilot connection severed.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] space-y-6 text-center">
        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-full">
          <Lock className="h-12 w-12 text-amber-500" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Access Restricted</h2>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed">
            Your instructor has not enabled Digital Notebook access for this network. 
            Please contact your teacher to activate this researcher tool.
          </p>
        </div>
        <Button variant="outline" className="rounded-xl font-bold px-8 cursor-pointer" onClick={() => window.history.back()}>
           Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
      {/* FULL SCREEN VIEWER OVERLAY */}
      {isFullScreen && !isEditing && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col overflow-hidden">
          {/* FOCUS HEADER */}
          <div className="flex items-center justify-between p-6 md:px-12 lg:px-20 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10">
             <div className="flex items-center gap-4">
               <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                 <BookMarked className="h-5 w-5" />
               </div>
               <div>
                 <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                 <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Focus Mode Active</p>
               </div>
             </div>
             
             <div className="flex items-center gap-3">
               <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 rounded-lg cursor-pointer"
                   onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                 >
                   <ZoomOut className="h-4 w-4" />
                 </Button>
                 <div className="px-3 min-w-[60px] text-center">
                    <span className="text-[11px] font-black font-mono">{zoomLevel}%</span>
                 </div>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 rounded-lg cursor-pointer"
                   onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                 >
                   <ZoomIn className="h-4 w-4" />
                 </Button>
                 <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 rounded-lg cursor-pointer"
                   onClick={() => setZoomLevel(100)}
                 >
                   <RotateCcw className="h-3.5 w-3.5" />
                 </Button>
               </div>

               <Button 
                variant="outline" 
                className="rounded-xl h-10 px-4 font-bold flex items-center gap-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                onClick={() => {
                  setIsFullScreen(false);
                  setZoomLevel(100);
                }}
               >
                 <Minimize2 className="h-4 w-4" /> EXIT FOCUS
               </Button>
             </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto w-full custom-scrollbar scroll-smooth">
             <div className="min-h-full p-8 md:p-12 lg:p-20 flex justify-center">
                <div 
                  className="w-full max-w-4xl transition-all duration-200 origin-top"
                  style={{ transform: `scale(${zoomLevel / 100})`, width: `${100 * (100 / zoomLevel)}%` }}
                >
                   <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-900/50 prose-pre:rounded-2xl pb-60">
                      <MarkdownRenderer noProse>{content}</MarkdownRenderer>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
             <NotebookPen className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <input 
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="text-xl font-bold tracking-tight bg-transparent border-none focus:ring-0 p-0 w-auto min-w-[100px] outline-none"
              />
              <Badge variant="outline" className="text-[10px] font-mono bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800">BETA</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium uppercase tracking-wider">
               {isSaving ? (
                 <span className="flex items-center gap-1 text-zinc-500 animate-pulse">
                   <CloudUpload className="h-2.5 w-2.5" /> Synchronizing Notes...
                 </span>
               ) : lastSavedAt ? (
                 <span className="flex items-center gap-1">
                   <Clock className="h-2.5 w-2.5" /> Last sync at {lastSavedAt.toLocaleTimeString()}
                 </span>
               ) : (
                 "Preparing Workspace..."
               )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <div className="flex p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/50 mr-2">
              <Button
                variant={editorMode === "rich-text" ? "secondary" : "ghost"}
                size="sm"
                className={cn("h-7 rounded-[9px] text-[10px] font-bold px-3 transition-all cursor-pointer", editorMode === "rich-text" && "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100")}
                onClick={() => setEditorMode("rich-text")}
              >
                <Type className="h-3 w-3 mr-1.5" />
                RICH TEXT
              </Button>
              <Button
                variant={editorMode === "markdown" ? "secondary" : "ghost"}
                size="sm"
                className={cn("h-7 rounded-[9px] text-[10px] font-bold px-3 transition-all cursor-pointer", editorMode === "markdown" && "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100")}
                onClick={() => setEditorMode("markdown")}
              >
                <Hash className="h-3 w-3 mr-1.5" />
                MARKDOWN
              </Button>
            </div>
          )}

          <div className="flex p-0.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
            <Button
              variant={isEditing ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-7 rounded-[9px] text-[10px] font-bold px-3 transition-all cursor-pointer", isEditing && "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100")}
              onClick={() => setIsEditing(true)}
            >
              <PenLine className="h-3.5 w-3.5 mr-1.5" />
              EDITOR
            </Button>
            <Button
              variant={!isEditing ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-7 rounded-[9px] text-[10px] font-bold px-3 transition-all cursor-pointer", !isEditing && "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100")}
              onClick={() => setIsEditing(false)}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              VIEWER
            </Button>
            {!isEditing && (
              <Button
                variant={isFullScreen ? "default" : "ghost"}
                size="sm"
                className={cn("h-7 rounded-[9px] text-[10px] font-bold px-3 transition-all cursor-pointer")}
                onClick={() => setIsFullScreen(!isFullScreen)}
              >
                {isFullScreen ? <Minimize2 className="h-3.5 w-3.5 mr-1.5" /> : <Maximize2 className="h-3.5 w-3.5 mr-1.5" />}
                {isFullScreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
              </Button>
            )}
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ml-1 cursor-pointer" onClick={saveNotebook} disabled={!hasUnsavedChanges || isSaving}>
            <Save className={cn("h-4 w-4", isSaving && "animate-spin")} />
          </Button>
          <Button 
            variant={showCopilot ? "secondary" : "outline"} 
            size="icon" 
            className={cn(
              "h-9 w-9 rounded-xl ml-1 transition-all cursor-pointer",
              showCopilot ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-200 dark:border-zinc-700"
            )}
            onClick={() => setShowCopilot(!showCopilot)}
          >
            <Sparkles className={cn("h-4 w-4", showCopilot && "animate-pulse")} />
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm bg-background">
        {/* NOTEBOOKS LIST PANEL */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full flex flex-col bg-zinc-50/30 dark:bg-zinc-950/40 border-r border-zinc-200/50 dark:border-zinc-800/50">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
                <Files className="h-3 w-3" /> My Library
              </Label>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                onClick={createNewNotebook}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {notebooks.map((nb) => (
                  <div 
                    key={nb.id}
                    className={cn(
                      "group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border",
                      activeNotebookId === nb.id 
                        ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm" 
                        : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/50 text-zinc-500"
                    )}
                    onClick={() => {
                      if (activeNotebookId !== nb.id) {
                        if (hasUnsavedChanges) saveNotebook();
                        setActiveNotebookId(nb.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                      <BookMarked className={cn("h-3.5 w-3.5 shrink-0", activeNotebookId === nb.id ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400")} />
                      {editingTitleId === nb.id ? (
                        <input
                          autoFocus
                          className="text-[11px] font-bold bg-transparent outline-none border-b border-zinc-400 w-full"
                          defaultValue={nb.title}
                          onBlur={async (e) => {
                            const newTitle = e.target.value.trim() || "Untitled";
                            setEditingTitleId(null);
                            if (newTitle !== nb.title) {
                              await updateDoc(doc(db, "notebooks", nb.id), { title: newTitle });
                              if (activeNotebookId === nb.id) setTitle(newTitle);
                            }
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              const target = e.target as HTMLInputElement;
                              const newTitle = target.value.trim() || "Untitled";
                              setEditingTitleId(null);
                              if (newTitle !== nb.title) {
                                await updateDoc(doc(db, "notebooks", nb.id), { title: newTitle });
                                if (activeNotebookId === nb.id) setTitle(newTitle);
                              }
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className={cn(
                          "text-[11px] font-bold truncate tracking-tight",
                          activeNotebookId === nb.id ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500"
                        )}>
                          {nb.title || "Untitled"}
                        </span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-opacity shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem 
                          className="text-[11px] font-bold py-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitleId(nb.id);
                          }}
                        >
                          <PenLine className="h-3.5 w-3.5 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        {notebooks.length > 1 && (
                          <DropdownMenuItem 
                            className="text-red-500 dark:text-red-400 focus:text-red-500 text-[11px] font-bold py-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotebook(nb.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50">
               <div className="flex items-center justify-between px-1">
                 <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                   {notebooks.length} / {orgData?.notebookLimitPerStudent || 1} Used
                 </span>
                 {orgData?.subscriptionStatus === "none" && (
                   <Badge variant="outline" className="text-[8px] bg-zinc-200/20 border-zinc-300 text-zinc-400 font-black px-1.5 py-0">FREE</Badge>
                 )}
               </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="w-1.5 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors" />

        {/* NOTEBOOK EDITOR/VIEWER PANEL */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50">
               <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
                  <PenLine className="h-3 w-3" /> Notes Editor
               </Label>
               <Badge variant="secondary" className="text-[9px] bg-zinc-200/20 text-zinc-500 border-none uppercase font-bold tracking-tighter">
                 {isEditing ? (editorMode === 'rich-text' ? "Rich Text Mode" : "Markdown Mode") : "Read Only"}
               </Badge>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center bg-zinc-50/5 dark:bg-zinc-900/5 backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-300 mx-auto" />
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">Accessing Notes Library...</p>
                  </div>
                </div>
              ) : isEditing ? (
                editorMode === "rich-text" ? (
                  <RichTextEditor 
                    content={getHtml(content)} 
                    onChange={handleRichTextChange} 
                  />
                ) : (
                  <Textarea
                    value={content}
                    onChange={handleMarkdownChange}
                    placeholder="# Start your research summary here... \n\nUse Markdown for formatting, and ask the Copilot for help with synthesis!"
                    className="w-full h-full p-8 resize-none border-none focus-visible:ring-0 rounded-none font-mono text-sm leading-relaxed bg-transparent dark:text-zinc-300"
                  />
                )
              ) : (
                <ScrollArea className="h-full bg-white dark:bg-zinc-950">
                  <div className="p-8 pb-20">
                    <MarkdownRenderer className="min-h-full">
                      {content || "*Start typing to capture your research findings.*"}
                    </MarkdownRenderer>
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="w-1.5 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors" />

        {/* AI COPILOT PANEL */}
        {showCopilot && (
          <ResizablePanel defaultSize={35} minSize={25}>
            <div className="h-full flex flex-col bg-zinc-50/10 dark:bg-zinc-950/20">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                 <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> Study Copilot
                 </Label>
                 <div className="flex items-center gap-1">
                    {orgData?.aiNotebookLimitPerStudent > 0 && (
                     <div className="flex flex-col items-end mr-2">
                       <div className="flex items-center gap-1.5 mb-1">
                         <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Usage</span>
                         <span className="text-[10px] font-black tabular-nums">{studentUsage} / {orgData.aiNotebookLimitPerStudent}</span>
                       </div>
                       <div className="w-20 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                         <div 
                           className={cn(
                             "h-full transition-all duration-500",
                             (studentUsage / orgData.aiNotebookLimitPerStudent) > 0.9 ? "bg-red-500" : 
                             (studentUsage / orgData.aiNotebookLimitPerStudent) > 0.7 ? "bg-amber-500" : "bg-emerald-500"
                           )}
                           style={{ width: `${Math.min(100, (studentUsage / orgData.aiNotebookLimitPerStudent) * 100)}%` }}
                         />
                       </div>
                     </div>
                   )}
                   <Cpu className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700" />
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                    onClick={() => setShowCopilot(false)}
                   >
                     <X className="h-3 w-3" />
                   </Button>
                 </div>
              </div>

              {/* CHAT AREA */}
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4 pb-20">
                  {isAiDisabled && (
                    <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 text-center space-y-2 mb-4">
                      <Crown className="h-5 w-5 text-amber-500 mx-auto" />
                      <h4 className="text-[11px] font-black uppercase text-amber-900 dark:text-amber-500 tracking-wider">AI Access Restricted</h4>
                      <p className="text-[10px] text-amber-800/70 dark:text-amber-500/60 font-medium leading-relaxed">
                        {studentUsage >= (orgData?.aiNotebookLimitPerStudent || 0) && (orgData?.aiNotebookLimitPerStudent || 0) > 0
                          ? "You have reached your personal monthly AI interaction limit."
                          : "Your network's monthly AI research budget has been reached."}
                        <br />Contact your instructor to unlock synthesis tools.
                      </p>
                    </div>
                  )}
                  {messages.length === 0 && (
                    <div className="text-center py-12 px-4 space-y-4">
                      <div className="inline-flex p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                        <Sparkles className="h-6 w-6 text-zinc-400" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-1">Notes Assistant Ready</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          I can help you summarize your notes, suggest research topics, 
                          or explain concepts you've written about.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2 pt-2">
                        <Button variant="outline" size="sm" className="h-8 text-[10px] rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 transition-all dark:hover:bg-zinc-800/50 cursor-pointer" onClick={() => setInputValue("Can you summarize my current notes?")}>
                          Summarize my notes
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 transition-all dark:hover:bg-zinc-800/50 cursor-pointer" onClick={() => setInputValue("Give me 3 follow-up questions for research.")}>
                          Suggest research paths
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((m, idx) => (
                    <div key={idx} className={cn(
                      "flex flex-col gap-2 w-full",
                      m.role === 'user' ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm border max-w-[92%]",
                        m.role === 'user' 
                          ? "bg-zinc-900 text-white border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 font-medium" 
                          : "bg-white text-zinc-900 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800"
                      )}>
                        {m.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-800/50 prose-pre:p-2 prose-pre:rounded-lg">
                            <MarkdownRenderer noProse>{m.content}</MarkdownRenderer>
                          </div>
                        ) : m.content}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex flex-col gap-2 max-w-[85%] items-start">
                      <div className="p-3 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Processing</span>
                      </div>
                    </div>
                  )}
                  {/* Scroll Anchor */}
                  <div ref={scrollRef} className="h-1" />
                </div>
              </ScrollArea>

              {/* INPUT AREA */}
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                 <div className="relative group">
                   <Textarea 
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSendMessage();
                       }
                     }}
                     disabled={isAiDisabled}
                     placeholder={isAiDisabled ? "AI Assistant Disabled" : "Ask Copilot..."}
                     className="min-h-[60px] max-h-[120px] pr-12 text-[12px] rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all focus-visible:ring-zinc-500 disabled:bg-zinc-100 disabled:opacity-50"
                   />
                   <Button 
                     size="icon" 
                     className="absolute bottom-2 right-2 h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 cursor-pointer"
                     onClick={handleSendMessage}
                     disabled={!inputValue.trim() || isLoading || isAiDisabled}
                   >
                     <Send className="h-3.5 w-3.5" />
                   </Button>
                 </div>
                 <p className="mt-2 text-[9px] text-center text-muted-foreground uppercase tracking-widest font-bold">
                    AI uses network budget. Use wisely.
                 </p>
              </div>
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}

function CloudUpload(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
  );
}
