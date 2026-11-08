"use client";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

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
import { WorkspaceHeader } from "@/components/ui/workspace";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  Send,
  Loader2,
  Save,
  PenLine,
  Eye,
  Cpu,
  Trash2,
  Maximize2,
  BookMarked,
  Lock,
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RaiseLogo } from "@/components/ui/raise-logo";

const turndown = new TurndownService();
const converter = new Showdown.Converter();

// Lazy load RichTextEditor to avoid SSR hydration issues
const RichTextEditor = dynamic(() => import("@/components/rich-text-editor").then(mod => mod.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center text-[10px] font-bold text-muted-foreground">Loading editor…</div>
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
  const [notebookToDelete, setNotebookToDelete] = useState<string | null>(null);
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
  const [showCopilot, setShowCopilot] = useState(false);
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
  const helpPanelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (showCopilot && window.matchMedia("(max-width: 1279px)").matches) {
      helpPanelRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [showCopilot]);

  // Fetch List of Notebooks & Org Settings
  useEffect(() => {
    if (!user) return;

    // 1. Fetch Organization Data first for limits
    async function fetchOrgSettings() {
      try {
        const userDoc = await getDoc(doc(db, "users", user!.uid));
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

    setNotebookToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!notebookToDelete) return;

    try {
      await deleteDoc(doc(db, "notebooks", notebookToDelete));
      if (activeNotebookId === notebookToDelete) {
        const remaining = notebooks.filter(n => n.id !== notebookToDelete);
        setActiveNotebookId(remaining[0]?.id || null);
      }
      toast.success("Notebook erased.");
    } catch (err) {
      toast.error("Deletion failed.");
    } finally {
      setNotebookToDelete(null);
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
      const response = await authenticatedFetch('/api/notebook/chat', {
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
        const updatedMessages = [...prev, { role: 'assistant' as const, content: data.content }];
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
      <div className="flex flex-col items-center justify-center min-h-[50dvh] space-y-6 text-center">
        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-full">
          <Lock className="h-12 w-12 text-amber-500" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Access Restricted</h2>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
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
    <div className="space-y-5">

      {/* FULL SCREEN VIEWER OVERLAY */}
      {isFullScreen && !isEditing && (
        <div className="fixed inset-0 z-[100] bg-background  flex flex-col overflow-hidden">
          {/* FOCUS HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 sm:px-6 border-b border-border bg-background  backdrop-blur-md z-10">
            <div className="flex min-w-0 items-center gap-2">
              <div className="p-2.5 bg-muted rounded-xl">
                <BookMarked className="h-5 w-5" />
              </div>
              <div>
                <h1 className="break-all text-lg font-semibold tracking-tight">{title}</h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Focus view</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-muted p-1 rounded-xl border border-border ">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg cursor-pointer"
                  aria-label="Zoom out"
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
                  aria-label="Zoom in"
                  onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-muted mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg cursor-pointer"
                  aria-label="Reset zoom"
                  onClick={() => setZoomLevel(100)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Button
                variant="outline"
                className="rounded-xl h-10 px-4 font-bold flex items-center gap-2 border-border hover:bg-accent  transition-all cursor-pointer"
                onClick={() => {
                  setIsFullScreen(false);
                  setZoomLevel(100);
                }}
              >
                <Minimize2 className="h-4 w-4" /> Exit focus
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
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-muted-foreground  prose-p:leading-relaxed prose-pre:bg-muted prose-pre:rounded-2xl pb-60">
                  <MarkdownRenderer noProse>{content}</MarkdownRenderer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <WorkspaceHeader title="Notebook" description="Keep class notes and review them in one place." />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" aria-pressed={!isEditing} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <><Eye /> Preview</> : <><PenLine /> Edit notes</>}
          </Button>
          {isEditing ? (
            <Select value={editorMode} onValueChange={(value: "rich-text" | "markdown") => setEditorMode(value)}>
              <SelectTrigger size="sm" aria-label="Editor format"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rich-text">Rich text</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsFullScreen(true)}>
              <Maximize2 /> Focus view
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={showCopilot ? "secondary" : "outline"} size="sm" aria-pressed={showCopilot} onClick={() => setShowCopilot(!showCopilot)}>
            <RaiseLogo size={16} aria-hidden /> Raise help
          </Button>
          <Button size="sm" onClick={saveNotebook} disabled={!hasUnsavedChanges || isSaving}>
            <Save /> {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className={cn("grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[12rem_minmax(0,1fr)]", showCopilot && "xl:grid-cols-[12rem_minmax(0,1fr)_18rem]")}>
        {/* NOTEBOOKS LIST PANEL */}
        <section aria-labelledby="notebook-library" className="flex min-w-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 id="notebook-library" className="text-sm font-medium">My notebooks</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md hover:bg-accent  cursor-pointer"
                aria-label="New notebook"
                onClick={createNewNotebook}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="max-h-36 overflow-y-auto lg:max-h-[54dvh]">
              <div className="p-2 space-y-1">
                {notebooks.map((nb) => (
                  <div
                    key={nb.id}
                    className={cn(
                      "group flex items-center justify-between rounded-lg border",
                      activeNotebookId === nb.id
                        ? "bg-background  border-border shadow-sm"
                        : "border-transparent hover:bg-accent text-muted-foreground"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center px-2">
                      {editingTitleId === nb.id ? (
                        <input
                          autoFocus
                          aria-label="Rename notebook"
                          className="text-[11px] font-bold bg-transparent outline-none border-b border-border w-full"
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
                        <button
                          type="button"
                          className="min-w-0 flex-1 truncate rounded-sm py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-ring"
                          aria-current={activeNotebookId === nb.id ? "true" : undefined}
                          onClick={() => {
                            if (activeNotebookId === nb.id) return;
                            if (hasUnsavedChanges) saveNotebook();
                            setActiveNotebookId(nb.id);
                          }}
                        >
                          {nb.title || "Untitled"}
                        </button>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mr-1 size-7 shrink-0"
                          aria-label={`Options for ${nb.title || "Untitled"}`}
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
            </div>
            <div className="p-3 border-t border-border bg-muted">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  {notebooks.length} / {orgData?.notebookLimitPerStudent || 1} Used
                </span>
                {orgData?.subscriptionStatus === "none" && (
                  <Badge variant="outline" className="text-[8px] bg-muted border-border text-muted-foreground font-black px-1.5 py-0">FREE</Badge>
                )}
              </div>
            </div>
        </section>

        <section aria-label="Notes editor" className="flex h-[60dvh] min-h-96 min-w-0 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <input
              aria-label="Notebook title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setHasUnsavedChanges(true);
              }}
              className="min-w-0 flex-1 rounded-sm bg-transparent font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {lastSavedAt && <span className="text-xs text-muted-foreground" role="status">{hasUnsavedChanges ? "Unsaved changes" : "Saved"}</span>}
          </div>
            <div className="flex-1 overflow-hidden relative">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center bg-muted backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Loading notebooks…</p>
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
                    className="w-full h-full p-8 resize-none border-none focus-visible:ring-0 rounded-none font-mono text-sm leading-relaxed bg-transparent "
                  />
                )
              ) : (
                <ScrollArea className="h-full bg-background ">
                  <div className="p-8 pb-20">
                    <MarkdownRenderer className="min-h-full">
                      {content || "*Start typing to capture your research findings.*"}
                    </MarkdownRenderer>
                  </div>
                </ScrollArea>
              )}
            </div>
        </section>

        {showCopilot && (
          <section ref={helpPanelRef} aria-label="Raise help" className="flex h-[60dvh] min-h-96 min-w-0 flex-col border-t border-border lg:col-span-2 xl:col-span-1 xl:border-l xl:border-t-0">
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted ">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                  <RaiseLogo className="h-3 w-3" /> Raise Help
                </Label>
                <div className="flex items-center gap-1">
                  {orgData?.aiNotebookLimitPerStudent > 0 && (
                    <div className="flex flex-col items-end mr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Usage</span>
                        <span className="text-[10px] font-black tabular-nums">{studentUsage} / {orgData.aiNotebookLimitPerStudent}</span>
                      </div>
                      <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
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
                  <Cpu className="h-3.5 w-3.5 text-muted-foreground " />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md hover:bg-accent  cursor-pointer"
                    aria-label="Close Raise help"
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
                      <h4 className="text-[11px] font-black uppercase text-amber-900 dark:text-amber-500 tracking-wider">Raise is unavailable</h4>
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
                      <div className="inline-flex p-3 bg-muted rounded-2xl">
                        <RaiseLogo className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-1">Ask about your notes</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          I can help you summarize your notes, suggest research topics,
                          or explain concepts you've written about.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2 pt-2">
                        <Button variant="outline" size="sm" className="h-8 text-[10px] rounded-xl border-border text-muted-foreground hover:text-foreground transition-all  cursor-pointer" onClick={() => setInputValue("Can you summarize my current notes?")}>
                          Summarize my notes
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] rounded-xl border-border text-muted-foreground hover:text-foreground transition-all  cursor-pointer" onClick={() => setInputValue("Give me 3 follow-up questions for research.")}>
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
                          ? "bg-muted text-white border-border  font-medium"
                          : "bg-background text-foreground border-border  "
                      )}>
                        {m.role === 'assistant' ? (
                          <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-muted prose-pre:p-2 prose-pre:rounded-lg">
                            <MarkdownRenderer noProse>{m.content}</MarkdownRenderer>
                          </div>
                        ) : m.content}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex flex-col gap-2 max-w-[85%] items-start">
                      <div className="p-3 rounded-2xl border border-dashed border-border bg-muted flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Processing</span>
                      </div>
                    </div>
                  )}
                  {/* Scroll Anchor */}
                  <div ref={scrollRef} className="h-1" />
                </div>
              </ScrollArea>

              {/* INPUT AREA */}
              <div className="p-4 border-t border-border bg-muted ">
                <div className="relative group">
                  <Textarea
                    aria-label="Message Raise"
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
                    className="min-h-[60px] max-h-[120px] pr-12 text-[12px] rounded-2xl border-border bg-background  shadow-sm transition-all focus-visible:ring-ring  disabled:opacity-50"
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 size-8"
                    aria-label="Send message to Raise"
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
          </section>
        )}
      </div>

      <ConfirmDialog
        open={!!notebookToDelete}
        onOpenChange={(open) => !open && setNotebookToDelete(null)}
        title="Delete Notebook"
        description="Are you sure you want to delete this notebook? This cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
