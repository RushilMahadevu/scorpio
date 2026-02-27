"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
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
  Hash
} from "lucide-react";
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
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [editorMode, setEditorMode] = useState<'markdown' | 'rich-text'>('rich-text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to get HTML from Markdown
  const getHtml = (md: string) => converter.makeHtml(md);
  // Helper to get Markdown from HTML
  const getMarkdown = (html: string) => turndown.turndown(html);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load Notebook Data
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, "notebooks", user.uid);
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!hasUnsavedChanges) {
          setContent(data.content || "");
          setLastSavedAt(data.updatedAt?.toDate() || null);
        }
      } else {
        // Initialize notebook for new user
        await setDoc(docRef, {
          content: "",
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }

      // Check Organization Access
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        const orgId = userData?.organizationId;
        
        if (orgId) {
          const orgDoc = await getDoc(doc(db, "organizations", orgId));
          const orgData = orgDoc.data();
          // If the teacher has set the limit to 0, it's considered "disabled"
          if (orgData?.notebookLimit === 0) {
            setIsLocked(true);
          }
        }
      } catch (err) {
        console.error("Access check failed:", err);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Snapshot error for notebooks:", error);
      setLoading(false);
      if (error.code === 'permission-denied') {
        toast.error("Cloud synchronization access denied.");
      }
    });

    return () => unsubscribe();
  }, [user, hasUnsavedChanges]);

  // Auto-save logic
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timeoutId = setTimeout(async () => {
      await saveNotebook();
    }, 3000); // 3-second debounce for autosave

    return () => clearTimeout(timeoutId);
  }, [hasUnsavedChanges, content]);

  const saveNotebook = async () => {
    if (!user || !hasUnsavedChanges) return;
    
    setIsSaving(true);
    try {
      const docRef = doc(db, "notebooks", user.uid);
      await updateDoc(docRef, {
        content: content,
        updatedAt: serverTimestamp()
      });
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Cloud synchronization failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleRichTextChange = (html: string) => {
    const md = getMarkdown(html);
    setContent(md);
    setHasUnsavedChanges(true);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

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

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      toast.error("Copilot connection severed. Check your network.");
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
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
             <NotebookPen className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Digital Notebook
              <Badge variant="outline" className="text-[10px] font-mono bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800">BETA</Badge>
            </h1>
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
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ml-1 cursor-pointer" onClick={saveNotebook} disabled={!hasUnsavedChanges || isSaving}>
            <Save className={cn("h-4 w-4", isSaving && "animate-spin")} />
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden shadow-sm bg-background">
        {/* NOTEBOOK EDITOR/VIEWER PANEL */}
        <ResizablePanel defaultSize={65} minSize={40}>
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
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="h-full flex flex-col bg-zinc-50/10 dark:bg-zinc-950/20">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
               <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2">
                  <Sparkles className="h-3 w-3" /> Study Copilot
               </Label>
               <Cpu className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700" />
            </div>

            {/* CHAT AREA */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 pb-4">
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
                    "flex flex-col gap-2 max-w-[85%]",
                    m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <div className={cn(
                      "p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm border",
                      m.role === 'user' 
                        ? "bg-zinc-900 text-white border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900" 
                        : "bg-white text-zinc-900 border-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800"
                    )}>
                      {m.role === 'assistant' ? (
                        <MarkdownRenderer noProse>{m.content}</MarkdownRenderer>
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
                   placeholder="Ask Copilot..."
                   className="min-h-[60px] max-h-[120px] pr-12 text-[12px] rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all focus-visible:ring-zinc-500"
                 />
                 <Button 
                   size="icon" 
                   className="absolute bottom-2 right-2 h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 cursor-pointer"
                   onClick={handleSendMessage}
                   disabled={!inputValue.trim() || isLoading}
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
