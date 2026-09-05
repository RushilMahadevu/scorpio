"use client"

import * as React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/prompt-kit/chat-container"
import {
  Message as PromptMessage,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/prompt-kit/message"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input"
import { ScrollButton } from "@/components/prompt-kit/scroll-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { CruxLogo } from "@/components/ui/crux-logo"
import { cn } from "@/lib/utils"
import { Organization } from "@/lib/types"
import { db } from "@/lib/firebase"
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  query,
  where,
  deleteDoc,
  addDoc,
} from "firebase/firestore"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowUp,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit2,
  Lightbulb,
  Lock,
  MessageSquare,
  Mic,
  MicOff,
  MoreHorizontal,
  Pencil,
  Plus,
  PlusIcon,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash,
  Trash2,
  X,
  Zap,
} from "lucide-react"

// Typewriter effect for fresh assistant responses
function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("")

  useEffect(() => {
    if (!text) return

    let currentIndex = 0
    let cancelled = false

    const interval = setInterval(() => {
      if (cancelled) return
      currentIndex++
      setDisplayed(text.slice(0, currentIndex))
      if (currentIndex >= text.length) {
        clearInterval(interval)
        onDone?.()
      }
    }, 8)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [text, onDone])

  return <MarkdownRenderer>{displayed}</MarkdownRenderer>
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  type?: "concept" | "problem"
}

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

function groupSessionsByPeriod(sessions: ChatSession[]) {
  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime()
  const startOfYesterday = startOfToday - 86400000
  const startOf7Days = startOfToday - 6 * 86400000
  const startOf30Days = startOfToday - 29 * 86400000

  const groups: { period: string; conversations: ChatSession[] }[] = [
    { period: "Today", conversations: [] },
    { period: "Yesterday", conversations: [] },
    { period: "Last 7 days", conversations: [] },
    { period: "Last 30 days", conversations: [] },
    { period: "Older", conversations: [] },
  ]

  sessions.forEach((session) => {
    const time = session.updatedAt || session.createdAt || 0
    if (time >= startOfToday) {
      groups[0].conversations.push(session)
    } else if (time >= startOfYesterday) {
      groups[1].conversations.push(session)
    } else if (time >= startOf7Days) {
      groups[2].conversations.push(session)
    } else if (time >= startOf30Days) {
      groups[3].conversations.push(session)
    } else {
      groups[4].conversations.push(session)
    }
  })

  return groups.filter((g) => g.conversations.length > 0)
}

const STARTER_PROMPTS = [
  {
    title: "Newton's First Law",
    prompt: "Can you explain Newton's first law of motion and give real-world examples?",
    mode: "concept" as const,
    icon: Sparkles,
  },
  {
    title: "Kinetic & Potential Energy",
    prompt: "How do I calculate kinetic and gravitational potential energy for a rollercoaster?",
    mode: "problem" as const,
    icon: Calculator,
  },
  {
    title: "Electromagnetic Induction",
    prompt: "Explain electromagnetic induction and Faraday's Law step by step.",
    mode: "concept" as const,
    icon: Zap,
  },
  {
    title: "Projectile Motion Problem",
    prompt: "How do I break down a 2D projectile motion problem into horizontal and vertical components?",
    mode: "problem" as const,
    icon: Calculator,
  },
]

export default function TutorPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"concept" | "problem">("concept")
  const [typingId, setTypingId] = useState<string | null>(null)

  // Feedback state: messageId -> "up" | "down"
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({})

  // Sidebar & Search state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarSearch, setSidebarSearch] = useState("")
  const [showSearchInput, setShowSearchInput] = useState(false)

  // Rename modal / inline state
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editingTitleText, setEditingTitleText] = useState("")

  // Delete modal state
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<{ stop: () => void; start: () => void } | null>(null)

  // Plan check & usage state
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)
  const [isFreePlan, setIsFreePlan] = useState(false)
  const [orgData, setOrgData] = useState<Organization | null>(null)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when messages change or loading
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, isLoading])

  // Complete onboarding flag if not completed
  useEffect(() => {
    if (user && profile && !profile.onboarding?.chat_tutor) {
      updateDoc(doc(db, "users", user.uid), {
        "onboarding.chat_tutor": true,
      }).catch((e) => console.warn("Onboarding update failed", e))
    }
  }, [user, profile])

  // Plan verification
  useEffect(() => {
    async function checkPlan() {
      const studentProfile = profile as (typeof profile & { teacherId?: string }) | null
      let organizationId = studentProfile?.organizationId

      if (!organizationId && studentProfile?.teacherId) {
        try {
          const teacherDoc = await getDoc(
            doc(db, "users", studentProfile.teacherId)
          )
          if (teacherDoc.exists()) {
            organizationId = teacherDoc.data()?.organizationId
          }
        } catch (e) {
          console.error("Error fetching teacher org", e)
        }
      }

      if (!organizationId) return

      try {
        const orgSnap = await getDoc(doc(db, "organizations", organizationId))
        if (orgSnap.exists()) {
          const data = orgSnap.data() as Organization
          setOrgData(data)
          setIsFreePlan(!data.planId || data.planId === "free")
        }
      } catch (e) {
        console.error("Error checking plan:", e)
      }
    }
    if (profile) checkPlan()
  }, [profile])

  // Load all sessions from Firestore
  useEffect(() => {
    if (!user || user.uid === "loading") return

    const sessionsRef = collection(db, "tutor_sessions")
    const q = query(sessionsRef, where("studentId", "==", user.uid))

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const loaded: ChatSession[] = snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            title: data.title || "Untitled Chat",
            messages: data.messages || [],
            createdAt:
              data.createdAt?.toMillis?.() ??
              (data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0),
            updatedAt:
              data.updatedAt?.toMillis?.() ??
              (data.updatedAt?.seconds ? data.updatedAt.seconds * 1000 : 0),
          }
        })

        loaded.sort((a, b) => b.updatedAt - a.updatedAt)
        setSessions(loaded)

        setActiveSessionId((curr) => {
          if (!curr && loaded.length > 0) return loaded[0].id
          return curr
        })
      },
      (error) => {
        console.error("Sessions listener error:", error)
      }
    )

    return () => unsubscribe()
  }, [user])

  // Load active session messages from Firestore
  useEffect(() => {
    if (!user || !activeSessionId) {
      if (!activeSessionId) setMessages([])
      return
    }

    const sessionRef = doc(db, "tutor_sessions", activeSessionId)
    const unsubscribe = onSnapshot(
      sessionRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          setMessages(data.messages || [])
        }
      },
      (error) => {
        console.error("Active session listener error:", error)
      }
    )

    return () => unsubscribe()
  }, [user, activeSessionId])

  // Switch session
  const switchSession = useCallback((session: ChatSession) => {
    setActiveSessionId(session.id)
    setMessages(session.messages)
    setRateLimitError(null)
    setTypingId(null)
  }, [])

  // Create new session
  const createNewSession = useCallback(async () => {
    setActiveSessionId(null)
    setMessages([])
    setPrompt("")
    setRateLimitError(null)
    setTypingId(null)
    toast.success("Ready for a new conversation")
  }, [])

  // Delete chat session
  const handleDeleteSession = useCallback(
    async (session: ChatSession) => {
      if (!user) return
      try {
        await deleteDoc(doc(db, "tutor_sessions", session.id))
        toast.success(`Deleted "${session.title}"`)

        if (activeSessionId === session.id) {
          const remaining = sessions.filter((s) => s.id !== session.id)
          if (remaining.length > 0) {
            setActiveSessionId(remaining[0].id)
            setMessages(remaining[0].messages)
          } else {
            setActiveSessionId(null)
            setMessages([])
          }
        }
      } catch (err) {
        console.error("Delete session error:", err)
        toast.error("Failed to delete chat")
      }
    },
    [user, activeSessionId, sessions]
  )

  // Rename session
  const handleRename = useCallback(
    async (sessionId: string, newTitle: string) => {
      if (!user || !newTitle.trim()) {
        setEditingTitleId(null)
        return
      }
      try {
        await updateDoc(doc(db, "tutor_sessions", sessionId), {
          title: newTitle.trim(),
          updatedAt: serverTimestamp(),
        })
        setEditingTitleId(null)
        toast.success("Chat renamed")
      } catch (e) {
        console.error("Rename error:", e)
        toast.error("Failed to rename chat")
      }
    },
    [user]
  )

  // Delete single message
  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      const updated = messages.filter((m) => m.id !== messageId)
      setMessages(updated)

      if (activeSessionId) {
        try {
          await updateDoc(doc(db, "tutor_sessions", activeSessionId), {
            messages: updated,
            updatedAt: serverTimestamp(),
          })
          toast.success("Message deleted")
        } catch (e) {
          console.error("Error deleting message:", e)
          toast.error("Failed to delete message from history")
        }
      }
    },
    [messages, activeSessionId]
  )

  // Edit / Reprompt user message
  const handleEditMessage = useCallback((content: string) => {
    setPrompt(content)
  }, [])

  // Copy message to clipboard
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard")
  }, [])

  // Upvote / Downvote reaction
  const handleFeedback = useCallback(
    (messageId: string, type: "up" | "down") => {
      setFeedback((prev) => ({
        ...prev,
        [messageId]: prev[messageId] === type ? undefined! : type,
      }))
      toast.success(
        type === "up" ? "Thanks for the positive feedback!" : "Feedback recorded"
      )
    },
    []
  )

  // Keyboard shortcut: Cmd+N / Ctrl+N for new chat, Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault()
        createNewSession()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setShowSearchInput((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [createNewSession])

  // Voice recording toggle
  const toggleVoiceRecording = useCallback(() => {
    if (typeof window === "undefined") return

    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => {
        continuous: boolean
        interimResults: boolean
        lang: string
        onstart: () => void
        onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void
        onerror: (event: { error: string }) => void
        onend: () => void
        start: () => void
        stop: () => void
      }
      webkitSpeechRecognition?: new () => {
        continuous: boolean
        interimResults: boolean
        lang: string
        onstart: () => void
        onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void
        onerror: (event: { error: string }) => void
        onend: () => void
        start: () => void
        stop: () => void
      }
    }

    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition ||
      windowWithSpeech.webkitSpeechRecognition

    if (!SpeechRecognitionClass) {
      toast.error("Voice input is not supported by your browser")
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    try {
      const recognition = new SpeechRecognitionClass()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsRecording(true)
        toast.info("Listening... Speak your physics question")
      }

      recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
        const transcript = event.results[0]?.[0]?.transcript
        if (transcript) {
          setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript))
        }
      }

      recognition.onerror = (event: { error: string }) => {
        console.error("Speech recognition error:", event.error)
        setIsRecording(false)
        toast.error("Voice recognition failed. Please try typing.")
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error("Voice start error:", err)
      setIsRecording(false)
      toast.error("Could not start voice input")
    }
  }, [isRecording])

  // Submit chat prompt
  const handleSubmit = async (textToSubmit?: string) => {
    const inputContent = (textToSubmit || prompt).trim()
    if (!inputContent || isLoading) return

    setRateLimitError(null)

    if (!user || user.uid === "loading") {
      toast.error("Please wait... loading user profile")
      return
    }

    setPrompt("")
    setIsLoading(true)

    // Create session in Firestore if none active
    let sessionId = activeSessionId
    if (!sessionId) {
      try {
        const newRef = await addDoc(collection(db, "tutor_sessions"), {
          studentId: user.uid,
          title: inputContent.slice(0, 35) || "New Physics Chat",
          messages: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        sessionId = newRef.id
        setActiveSessionId(sessionId)
      } catch (err) {
        console.error("Error creating session:", err)
        toast.error("Failed to initialize conversation")
        setIsLoading(false)
        return
      }
    }

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputContent,
      type: mode,
    }

    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const res = await fetch("/api/student/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputContent,
          userId: user.uid,
          role: "student",
          mode,
          chatHistory,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to get response")

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        type: mode,
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)
      setTypingId(assistantMessage.id)

      // Auto-title on first exchange
      let newTitle: string | undefined = undefined
      if (finalMessages.length === 2) {
        try {
          const titleRes = await fetch("/api/ai/generate-title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userMessage: inputContent,
              aiResponse: assistantMessage.content,
              context: "Physics Tutor",
            }),
          })
          if (titleRes.ok) {
            const titleData = await titleRes.json()
            if (titleData.title) {
              newTitle = (titleData.title as string).slice(0, 35)
            }
          }
        } catch (e) {
          console.error("Auto-title error:", e)
        }
        if (!newTitle) {
          newTitle =
            inputContent.slice(0, 35) +
            (inputContent.length > 35 ? "..." : "")
        }
      }

      if (sessionId) {
        await updateDoc(doc(db, "tutor_sessions", sessionId), {
          messages: finalMessages,
          updatedAt: serverTimestamp(),
          ...(newTitle ? { title: newTitle } : {}),
        })
      }
    } catch (error: unknown) {
      console.error("Error getting response:", error)
      const errMessage =
        error instanceof Error
          ? error.message
          : "Sorry, I encountered an error answering your question. Please try again."

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: errMessage,
      }

      const updatedWithErr = [...updatedMessages, errorMessage]
      setMessages(updatedWithErr)
      setTypingId(null)

      if (sessionId) {
        updateDoc(doc(db, "tutor_sessions", sessionId), {
          messages: updatedWithErr,
          updatedAt: serverTimestamp(),
        }).catch(() => {})
      }

      if (errMessage.includes("Budget")) {
        setRateLimitError(errMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Filtered sessions for sidebar
  const filteredSessions = useMemo(() => {
    if (!sidebarSearch.trim()) return sessions
    const queryStr = sidebarSearch.toLowerCase()
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(queryStr) ||
        s.messages.some((m) => m.content.toLowerCase().includes(queryStr))
    )
  }, [sessions, sidebarSearch])

  // Grouped history
  const groupedSessions = useMemo(
    () => groupSessionsByPeriod(filteredSessions),
    [filteredSessions]
  )

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  // Free Tier Restriction Guard
  if (isFreePlan) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-dashed shadow-xl bg-card">
          <CardContent className="flex flex-col items-center gap-4 pt-10 pb-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-sm">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold">
                AI Physics Tutor Restricted
              </CardTitle>
              <CardDescription>
                Your network is on the **Free tier**. AI-powered tutor features
                require an active Department Network subscription.
              </CardDescription>
            </div>
            <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground border border-border/40">
              Ask your teacher or department lead to upgrade the network for AI access.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/student")}
              className="mt-2"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tutorUsage = (profile as (typeof profile & { tutorUsageCurrent?: number }) | null)?.tutorUsageCurrent || 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.992, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-screen w-screen overflow-hidden bg-background text-foreground"
    >
      {/* ========================================================================= */}
      {/* SIDEBAR: Chat History (Full Height Left Panel)                           */}
      {/* ========================================================================= */}
      <aside
        className={cn(
          "flex flex-col h-full shrink-0 border-r border-border/50 bg-card/90 backdrop-blur-xl transition-all duration-300 ease-in-out select-none z-20",
          sidebarOpen ? "w-72 md:w-80" : "w-0 overflow-hidden opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 p-3 shrink-0 h-14">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => router.push("/student")}
              title="Back to Student Dashboard"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 border border-primary/25 size-8 rounded-lg flex items-center justify-center shadow-xs">
                <CruxLogo size={16} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-foreground leading-none">
                  Tutor
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Physics learning guide
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-7 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                showSearchInput && "bg-muted text-foreground"
              )}
              onClick={() => setShowSearchInput(!showSearchInput)}
              title="Search chats (⌘K)"
            >
              <Search className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              onClick={() => setSidebarOpen(false)}
              title="Collapse sidebar"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>

        {/* New Chat & Search Toolbar */}
        <div className="p-3 space-y-2 shrink-0 border-b border-border/30">
          <Button
            variant="outline"
            className="w-full justify-between h-9 rounded-xl border-border/60 bg-muted/30 hover:bg-muted/70 hover:border-border shadow-2xs font-medium text-xs transition-all cursor-pointer"
            onClick={createNewSession}
          >
            <span className="flex items-center gap-2">
              <PlusIcon className="size-3.5 text-primary" />
              <span>New Chat</span>
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/50 bg-background/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘N
            </kbd>
          </Button>

          {showSearchInput && (
            <div className="relative flex items-center animate-in fade-in slide-in-from-top-1 duration-150">
              <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search conversations..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="h-8 pl-8 pr-7 text-xs rounded-lg border-border/60 bg-background focus-visible:ring-1 focus-visible:ring-primary/40"
                autoFocus
              />
              {sidebarSearch && (
                <button
                  type="button"
                  className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setSidebarSearch("")}
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-3">
          {groupedSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="size-8 text-muted-foreground/30 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-muted-foreground">
                {sidebarSearch ? "No matching chats found" : "No conversation history"}
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                {sidebarSearch
                  ? "Try a different search query"
                  : "Your past discussions will appear here"}
              </p>
            </div>
          ) : (
            groupedSessions.map((group) => (
              <div key={group.period} className="space-y-1">
                <div className="text-[11px] font-bold tracking-wider text-muted-foreground/60 uppercase px-2.5 py-1">
                  {group.period}
                </div>
                <div className="space-y-0.5">
                  {group.conversations.map((conversation) => {
                    const isActive = conversation.id === activeSessionId
                    const isEditing = editingTitleId === conversation.id

                    if (isEditing) {
                      return (
                        <div
                          key={conversation.id}
                          className="flex items-center gap-1 rounded-xl border border-primary/40 bg-primary/10 p-1 px-1.5 shadow-xs"
                        >
                          <Input
                            value={editingTitleText}
                            onChange={(e) => setEditingTitleText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleRename(conversation.id, editingTitleText)
                              if (e.key === "Escape") setEditingTitleId(null)
                            }}
                            className="h-7 text-xs px-2 bg-background border-none focus-visible:ring-0"
                            autoFocus
                            maxLength={50}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-6 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                            onClick={() => handleRename(conversation.id, editingTitleText)}
                          >
                            <Check className="size-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-6 text-muted-foreground hover:bg-muted cursor-pointer"
                            onClick={() => setEditingTitleId(null)}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => switchSession(conversation)}
                        className={cn(
                          "group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all cursor-pointer",
                          isActive
                            ? "bg-primary/10 font-semibold text-primary border border-primary/20 shadow-2xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                          <MessageSquare
                            className={cn(
                              "size-3.5 shrink-0 transition-colors",
                              isActive ? "text-primary" : "text-muted-foreground/60"
                            )}
                          />
                          <span className="truncate font-normal">
                            {conversation.title}
                          </span>
                        </div>

                        {/* Dropdown Menu for Rename & Delete */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "size-6 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/80 cursor-pointer",
                                isActive && "opacity-100"
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingTitleId(conversation.id)
                                setEditingTitleText(conversation.title)
                              }}
                            >
                              <Edit2 className="size-3.5" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSessionToDelete(conversation)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="size-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Usage Quota Widget */}
        {orgData && (orgData.aiTutorLimitPerStudent ?? 0) > 0 && (
          <div className="border-t border-border/40 p-3 bg-muted/20 shrink-0">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-muted-foreground tracking-tight">
                  Tutor Messages
                </span>
                <span className="font-mono text-xs font-semibold text-foreground">
                  {tutorUsage}{" "}
                  <span className="text-muted-foreground font-normal">
                    / {orgData.aiTutorLimitPerStudent}
                  </span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted/80 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    tutorUsage / orgData.aiTutorLimitPerStudent! > 0.8
                      ? "bg-amber-500"
                      : "bg-primary"
                  )}
                  style={{
                    width: `${Math.min(
                      100,
                      (tutorUsage / orgData.aiTutorLimitPerStudent!) * 100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground/60">
                Department Quota
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CHAT CONTENT AREA (Rigid Flex Column)                                */}
      {/* ========================================================================= */}
      <main className="flex flex-1 flex-col h-full min-w-0 min-h-0 overflow-hidden bg-background">
        {/* Top Header */}
        <header className="bg-card/40 backdrop-blur-md z-10 flex h-14 w-full shrink-0 items-center justify-between border-b border-border/40 px-4">
          <div className="flex items-center gap-3 min-w-0">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setSidebarOpen(true)}
                title="Open Chat History"
              >
                <ChevronRight className="size-4" />
              </Button>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate font-semibold text-sm text-foreground">
                {activeSession?.title || "New Physics Chat"}
              </span>
              {activeSession && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-foreground rounded-md cursor-pointer"
                  onClick={() => {
                    setEditingTitleId(activeSession.id)
                    setEditingTitleText(activeSession.title)
                  }}
                  title="Rename chat"
                >
                  <Pencil className="size-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Mode Switcher & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl bg-muted/60 p-0.5 border border-border/50 shadow-2xs">
              <button
                type="button"
                onClick={() => setMode("concept")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                  mode === "concept"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Lightbulb className="size-3.5 text-amber-500" />
                <span>Concept</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("problem")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                  mode === "problem"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Calculator className="size-3.5 text-primary" />
                <span>Problem</span>
              </button>
            </div>

            {activeSession && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg cursor-pointer">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-xs"
                    onClick={() => {
                      setEditingTitleId(activeSession.id)
                      setEditingTitleText(activeSession.title)
                    }}
                  >
                    <Edit2 className="size-3.5" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                    onClick={() => {
                      setSessionToDelete(activeSession)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="size-3.5" /> Delete Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 hidden sm:flex cursor-pointer"
              onClick={() => router.push("/student")}
            >
              <ArrowLeft className="size-3.5" />
              <span>Dashboard</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Messages Container (Pure Flex-1 Scrollable Area) */}
        <ChatContainerRoot ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto relative w-full">
          <ChatContainerContent className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-6">
            {messages.length === 0 ? (
              /* Empty State / Welcome Screen */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
                  <CruxLogo size={28} className="text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  How can I help you in Physics today?
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                  Ask conceptual questions, break down difficult homework problems, or derive formulas step-by-step.
                </p>

                {/* Starter Chips */}
                <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {STARTER_PROMPTS.map((item, idx) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setMode(item.mode)
                          setPrompt(item.prompt)
                          handleSubmit(item.prompt)
                        }}
                        className="group flex flex-col items-start rounded-2xl border border-border/60 bg-card/60 p-4 text-left transition-all hover:border-primary/40 hover:bg-card hover:shadow-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                          <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Icon className="size-3.5" />
                          </div>
                          <span>{item.title}</span>
                        </div>
                        <span className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.prompt}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Message List */
              messages.map((message, index) => {
                const isAssistant = message.role === "assistant"
                const isLastMessage = index === messages.length - 1
                const isTyping =
                  isAssistant &&
                  isLastMessage &&
                  message.id === typingId

                return (
                  <PromptMessage
                    key={message.id}
                    className={cn(
                      "flex w-full flex-col gap-2",
                      isAssistant ? "items-start" : "items-end"
                    )}
                  >
                    {isAssistant ? (
                      /* Assistant Message */
                      <div className="group flex w-full flex-col gap-1.5">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                            <CruxLogo size={12} className="text-primary" />
                          </div>
                          <span className="text-xs font-semibold text-foreground">
                            Tutor
                          </span>
                          {message.type && (
                            <Badge
                              variant="outline"
                              className="h-4 px-1.5 text-[9px] font-normal uppercase tracking-wider text-muted-foreground"
                            >
                              {message.type}
                            </Badge>
                          )}
                        </div>

                        <MessageContent
                          className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed pl-8"
                          markdown={!isTyping}
                        >
                          {isTyping ? (
                            <Typewriter
                              text={message.content}
                              onDone={() => setTypingId(null)}
                            />
                          ) : (
                            message.content
                          )}
                        </MessageContent>

                        {/* Assistant Actions */}
                        <MessageActions
                          className={cn(
                            "pl-8 flex gap-1 pt-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                            (isLastMessage || feedback[message.id]) &&
                              "opacity-100"
                          )}
                        >
                          <MessageAction tooltip="Copy message">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() =>
                                handleCopyMessage(message.content)
                              }
                            >
                              <Copy className="size-3.5" />
                            </Button>
                          </MessageAction>

                          <MessageAction tooltip="Good response">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "size-7 rounded-full transition-colors cursor-pointer",
                                feedback[message.id] === "up"
                                  ? "text-primary bg-primary/10"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                              onClick={() =>
                                handleFeedback(message.id, "up")
                              }
                            >
                              <ThumbsUp className="size-3.5" />
                            </Button>
                          </MessageAction>

                          <MessageAction tooltip="Bad response">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "size-7 rounded-full transition-colors cursor-pointer",
                                feedback[message.id] === "down"
                                  ? "text-destructive bg-destructive/10"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                              onClick={() =>
                                handleFeedback(message.id, "down")
                              }
                            >
                              <ThumbsDown className="size-3.5" />
                            </Button>
                          </MessageAction>

                          <MessageAction tooltip="Delete message">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-full text-muted-foreground hover:text-destructive cursor-pointer"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash className="size-3.5" />
                            </Button>
                          </MessageAction>
                        </MessageActions>
                      </div>
                    ) : (
                      /* User Message */
                      <div className="group flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[75%]">
                        <MessageContent className="rounded-3xl bg-muted/80 text-foreground border border-border/40 px-5 py-2.5 text-[14px] shadow-2xs leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </MessageContent>

                        {/* User Actions */}
                        <MessageActions className="flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 pr-1">
                          <MessageAction tooltip="Edit prompt">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() =>
                                handleEditMessage(message.content)
                              }
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </MessageAction>

                          <MessageAction tooltip="Copy text">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                              onClick={() =>
                                handleCopyMessage(message.content)
                              }
                            >
                              <Copy className="size-3.5" />
                            </Button>
                          </MessageAction>

                          <MessageAction tooltip="Delete prompt">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-full text-muted-foreground hover:text-destructive cursor-pointer"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash className="size-3.5" />
                            </Button>
                          </MessageAction>
                        </MessageActions>
                      </div>
                    )}
                  </PromptMessage>
                )
              })
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex w-full items-start gap-3 pl-1 animate-pulse">
                <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-xs">
                  <CruxLogo size={12} className="text-primary" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-card/60 border border-border/40 px-4 py-2.5 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-1.5 rounded-full bg-primary/60 animate-bounce" />
                  <span className="ml-1.5">Thinking & solving...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </ChatContainerContent>

          {/* Floating Scroll to Bottom Button */}
          <div className="sticky bottom-4 right-4 flex justify-end px-6 pointer-events-none">
            <div className="pointer-events-auto">
              <ScrollButton
                containerRef={chatContainerRef}
                className="shadow-lg border-border/60 bg-card/90"
              />
            </div>
          </div>
        </ChatContainerRoot>

        {/* Rate Limit Banner */}
        {rateLimitError && (
          <div className="mx-auto max-w-3xl px-4 py-2 w-full shrink-0">
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center justify-between">
              <span>{rateLimitError}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-destructive hover:bg-destructive/20"
                onClick={() => setRateLimitError(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* LOCKED BOTTOM PROMPT BAR                                              */}
        {/* ===================================================================== */}
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl p-3 md:p-4 shrink-0 z-20">
          <div className="mx-auto max-w-3xl">
            <PromptInput
              isLoading={isLoading}
              value={prompt}
              onValueChange={setPrompt}
              onSubmit={() => handleSubmit()}
              className="border-border/70 bg-card/90 backdrop-blur-xl relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20"
            >
              <div className="flex flex-col">
                <PromptInputTextarea
                  placeholder={
                    mode === "concept"
                      ? "Ask about any physics concept (e.g. electromagnetic induction)..."
                      : "Describe your physics problem step-by-step..."
                  }
                  className="min-h-[48px] pt-3.5 pl-5 pr-4 text-[14px] leading-relaxed"
                />

                <PromptInputActions className="mt-2 flex w-full items-center justify-between gap-2 px-3 pb-3">
                  {/* Left Actions */}
                  <div className="flex items-center gap-1.5">
                    <PromptInputAction tooltip="New conversation">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full border-border/60 hover:bg-muted cursor-pointer"
                        onClick={createNewSession}
                      >
                        <Plus size={16} />
                      </Button>
                    </PromptInputAction>

                    <PromptInputAction
                      tooltip={
                        mode === "concept"
                          ? "Switch to Problem Solving"
                          : "Switch to Concept Explanation"
                      }
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 rounded-full px-3 text-xs gap-1.5 border-border/60 cursor-pointer",
                          mode === "problem" && "bg-primary/10 text-primary border-primary/30 font-semibold"
                        )}
                        onClick={() =>
                          setMode(mode === "concept" ? "problem" : "concept")
                        }
                      >
                        {mode === "concept" ? (
                          <>
                            <Lightbulb size={14} className="text-amber-500" />
                            <span>Concept</span>
                          </>
                        ) : (
                          <>
                            <Calculator size={14} className="text-primary" />
                            <span>Problem</span>
                          </>
                        )}
                      </Button>
                    </PromptInputAction>

                    <PromptInputAction tooltip="Formula suggestions">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-full border-border/60 cursor-pointer"
                          >
                            <Sparkles size={14} className="text-primary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuItem
                            className="text-xs cursor-pointer"
                            onClick={() =>
                              setPrompt(
                                (prev) =>
                                  `${prev ? prev + " " : ""}Explain how kinetic energy K = 1/2 m v^2 is derived.`
                              )
                            }
                          >
                            Kinetic Energy Derivation
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs cursor-pointer"
                            onClick={() =>
                              setPrompt(
                                (prev) =>
                                  `${prev ? prev + " " : ""}How do I use Newton's 2nd Law F = ma for an inclined plane?`
                              )
                            }
                          >
                            Inclined Plane with F = ma
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs cursor-pointer"
                            onClick={() =>
                              setPrompt(
                                (prev) =>
                                  `${prev ? prev + " " : ""}Explain Faraday's Law of Induction step by step.`
                              )
                            }
                          >
                            Faraday&apos;s Law of Induction
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </PromptInputAction>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5">
                    <PromptInputAction
                      tooltip={isRecording ? "Stop listening" : "Voice input"}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn(
                          "size-8 rounded-full border-border/60 transition-colors cursor-pointer",
                          isRecording &&
                            "bg-destructive/10 text-destructive border-destructive/40 animate-pulse"
                        )}
                        onClick={toggleVoiceRecording}
                      >
                        {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                      </Button>
                    </PromptInputAction>

                    <Button
                      type="button"
                      size="icon"
                      disabled={!prompt.trim() || isLoading}
                      onClick={() => handleSubmit()}
                      className="size-8 rounded-full shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      {!isLoading ? (
                        <ArrowUp size={16} />
                      ) : (
                        <span className="size-2 rounded-2xs bg-background animate-spin" />
                      )}
                    </Button>
                  </div>
                </PromptInputActions>
              </div>
            </PromptInput>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* CONFIRM DELETE DIALOG                                                     */}
      {/* ========================================================================= */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base">Delete Conversation</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete &quot;{sessionToDelete?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (sessionToDelete) {
                  handleDeleteSession(sessionToDelete)
                }
                setDeleteDialogOpen(false)
                setSessionToDelete(null)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}