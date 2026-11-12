"use client";
import { networkInvitePath } from "@/lib/onboarding-links";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RaiseLogo } from "@/components/ui/raise-logo";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building2,
  Users,
  ShieldAlert,
  AlertTriangle,
  HandCoins,
  Info,
  PlusCircle,
  UserPlus,
  Link as LinkIcon,
  Copy,
  LogOut,
  ChevronRight,
  ArrowRight,
  Loader2,
  TrendingUp,
  NotebookPen,
  CheckCircle2,
  MoreHorizontal,
  Crown,
  UserMinus,
  Lock,
  CreditCard,
  HelpCircle,
  Send,
  Pencil,
  Share2,
  Check,
  Sliders,
  BarChart3,
  GraduationCap,
  Sparkles,
  RefreshCw
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Organization } from "@/lib/types";
import { UsageAnalytics } from "@/components/admin/usage-analytics";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { NetworkTutorial } from "@/components/network-tutorial";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function NetworkPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [networkMembers, setNetworkMembers] = useState<any[]>([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [memberToKick, setMemberToKick] = useState<{ id: string, name: string } | null>(null);
  const [ownerToTransfer, setOwnerToTransfer] = useState<{ id: string, name: string } | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [joiningOrgId, setJoiningOrgId] = useState("");
  const [updatingBudget, setUpdatingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState<string>("");
  const [updatingNotebook, setUpdatingNotebook] = useState(false);
  const [tempNotebookLimitPerStudent, setTempNotebookLimitPerStudent] = useState<string>("");
  const [tempAiNotebookLimitPerStudent, setTempAiNotebookLimitPerStudent] = useState<string>("");
  const [updatingTutor, setUpdatingTutor] = useState(false);
  const [tempTutorLimitPerStudent, setTempTutorLimitPerStudent] = useState<string>("");
  const [studentCount, setStudentCount] = useState<number>(0);

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Active Tab
  const [activeTab, setActiveTab] = useState("faculty");

  // Limits Assistant
  const [limitsOpen, setLimitsOpen] = useState(false);
  const [limitsMessages, setLimitsMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hi! I'm your Scorpio guide. Ask me anything about your network's limits, budgets, or capacities — I'll explain what each setting does and suggest optimal values for your class size. 🎯" }
  ]);
  const [limitsInput, setLimitsInput] = useState("");
  const [limitsLoading, setLimitsLoading] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamedOrgName, setRenamedOrgName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);

  useEffect(() => {
    if (organization?.aiBudgetLimit !== undefined) {
      setTempBudget((organization.aiBudgetLimit / 100).toFixed(2));
    } else {
      setTempBudget("10.00");
    }

    if (organization?.notebookLimitPerStudent !== undefined) {
      setTempNotebookLimitPerStudent(organization.notebookLimitPerStudent.toString());
    } else {
      setTempNotebookLimitPerStudent("5");
    }

    if (organization?.aiNotebookLimitPerStudent !== undefined) {
      setTempAiNotebookLimitPerStudent(organization.aiNotebookLimitPerStudent.toString());
    } else {
      setTempAiNotebookLimitPerStudent("50");
    }

    if (organization?.aiTutorLimitPerStudent !== undefined) {
      setTempTutorLimitPerStudent(organization.aiTutorLimitPerStudent.toString());
    } else {
      setTempTutorLimitPerStudent("30");
    }
  }, [organization]);

  useEffect(() => {
    if (searchParams?.get("success") === "true") {
      toast.success("Subscription updated! Accessing Pro features...");
      router.replace("/teacher/network");
    }
  }, [searchParams, router]);

  const handleRenameNetwork = async () => {
    if (!user || !organization || user.uid !== organization.ownerId || !renamedOrgName.trim()) return;
    setUpdatingName(true);
    try {
      await updateDoc(doc(db, "organizations", organization.id), {
        name: renamedOrgName.trim()
      });
      toast.success("Department renamed successfully.");
      setOrganization(prev => prev ? { ...prev, name: renamedOrgName.trim() } : null);
      setIsRenaming(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to rename department.");
    } finally {
      setUpdatingName(false);
    }
  };

  const handleUpdateTutorLimit = async () => {
    if (!user || !organization || user.uid !== organization.ownerId) return;
    const perMember = parseInt(tempTutorLimitPerStudent);
    if (isNaN(perMember) || perMember < 0) {
      toast.error("Please enter a valid allowance.");
      return;
    }
    setUpdatingTutor(true);
    try {
      await updateDoc(doc(db, "organizations", organization.id), {
        aiTutorLimitPerStudent: perMember
      });
      toast.success(`Raise limit updated to ${perMember} messages/month per student.`);
      setOrganization(prev => prev ? { ...prev, aiTutorLimitPerStudent: perMember } : null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update Raise limit.");
    } finally {
      setUpdatingTutor(false);
    }
  };

  const sendLimitsMessage = async () => {
    if (!limitsInput.trim() || !user || limitsLoading) return;
    const userMsg = { role: "user" as const, content: limitsInput.trim() };
    setLimitsMessages(prev => [...prev, userMsg]);
    setLimitsInput("");
    setLimitsLoading(true);
    try {
      const res = await authenticatedFetch("/api/chat/limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          chatHistory: limitsMessages.slice(-8),
          userId: user.uid
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get response");
      setLimitsMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (e: any) {
      setLimitsMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that right now. Please try again." }]);
    } finally {
      setLimitsLoading(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!user || !organization || user.uid !== organization.ownerId) return;

    const budget = parseFloat(tempBudget);
    if (isNaN(budget) || budget < 0) {
      toast.error("Please enter a valid budget.");
      return;
    }

    setUpdatingBudget(true);
    try {
      const budgetInCents = Math.round(budget * 100);
      await updateDoc(doc(db, "organizations", organization.id), {
        aiBudgetLimit: budgetInCents
      });
      toast.success(`Monthly AI Budget Cap set to $${budget.toFixed(2)}`);
      setOrganization(prev => prev ? {
        ...prev,
        aiBudgetLimit: budgetInCents
      } : null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update budget.");
    } finally {
      setUpdatingBudget(false);
    }
  };

  const handleUpdateNotebookLimit = async () => {
    if (!user || !organization || user.uid !== organization.ownerId) return;

    const perMember = parseInt(tempNotebookLimitPerStudent);
    const aiPerMember = parseInt(tempAiNotebookLimitPerStudent);
    if (isNaN(perMember) || perMember < 0 || isNaN(aiPerMember) || aiPerMember < 0) {
      toast.error("Please enter a valid allowance.");
      return;
    }

    setUpdatingNotebook(true);
    try {
      await updateDoc(doc(db, "organizations", organization.id), {
        notebookLimitPerStudent: perMember,
        aiNotebookLimitPerStudent: aiPerMember
      });
      toast.success(`Notebook limits updated!`);
      setOrganization(prev => prev ? {
        ...prev,
        notebookLimitPerStudent: perMember,
        aiNotebookLimitPerStudent: aiPerMember
      } : null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update notebook limit.");
    } finally {
      setUpdatingNotebook(false);
    }
  };

  async function createInvite() {
    setCreatingInvite(true);
    setInviteError("");
    try {
      const response = await authenticatedFetch("/api/teacher/network/invites", { method: "POST", body: "{}" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create an invite.");
      setInviteUrl(new URL(networkInvitePath(result.code), window.location.origin).href);
      setCopiedLink(false);
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : "Could not create an invite. Try again.");
    } finally {
      setCreatingInvite(false);
    }
  }

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      toast.success("Invite link copied.");
    } catch {
      toast.error("Couldn’t copy the invite link. Select the link to copy it manually.");
    }
  }

  function changeInviteDialog(open: boolean) {
    if (!open && creatingInvite) return;
    setInviteModalOpen(open);
    if (!open) {
      setInviteUrl("");
      setCopiedLink(false);
      setInviteError("");
    }
  }

  const transferOwnership = async (newOwnerId: string, newOwnerName: string) => {
    if (!user || !organization || user.uid !== organization.ownerId) return;
    setOwnerToTransfer({ id: newOwnerId, name: newOwnerName });
  };

  const handleTransferOwnership = async () => {
    if (!user || !organization || !ownerToTransfer) return;

    try {
      await updateDoc(doc(db, "organizations", organization.id), {
        ownerId: ownerToTransfer.id
      });
      toast.success(`Department leadership transferred to ${ownerToTransfer.name}`);
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Failed to transfer leadership.");
    } finally {
      setOwnerToTransfer(null);
    }
  };

  const kickMember = async (memberId: string, name: string) => {
    if (!user || !organization || user.uid !== organization.ownerId) return;
    if (memberId === user.uid) return;
    setMemberToKick({ id: memberId, name });
  };

  const handleKickMember = async () => {
    if (!user || !organization || !memberToKick) return;

    try {
      await membershipAction({ action: 'remove', memberId: memberToKick.id });
      toast.success(`${memberToKick.name} has been removed from the department.`);
      setNetworkMembers(prev => prev.filter(m => m.uid !== memberToKick.id));
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove member.");
    } finally {
      setMemberToKick(null);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (user && profile?.organizationId) {
      fetchNetworkInfo();
    } else {
      setLoading(false);
    }
  }, [user, profile, authLoading]);

  async function fetchNetworkInfo() {
    if (!profile?.organizationId) {
      setLoading(false);
      return;
    }

    try {
      const orgRef = doc(db, "organizations", profile.organizationId);
      const orgSnap = await getDoc(orgRef);
      if (orgSnap.exists()) {
        setOrganization({ id: orgSnap.id, ...orgSnap.data() } as Organization);
      }

      const membersSnap = await getDocs(query(
        collection(db, "users"),
        where("organizationId", "==", profile.organizationId),
        where("role", "==", "teacher")
      ));
      const members = membersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
      setNetworkMembers(members);

      const teacherIds = members.map(m => m.uid);
      if (teacherIds.length > 0) {
        const studentsSnap = await getDocs(query(
          collection(db, "users"),
          where("teacherId", "in", teacherIds),
          where("role", "==", "student")
        ));
        setStudentCount(studentsSnap.size);
      } else {
        setStudentCount(0);
      }
    } catch (e) {
      console.error("Error fetching network info:", e);
    } finally {
      setLoading(false);
    }
  }

  async function membershipAction(body: Record<string, string>) {
    const response = await authenticatedFetch('/api/teacher/network/membership', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    router.refresh();
  }

  async function createOrganization() {
    try {
      await membershipAction({ action: 'create', name: newOrgName });
      toast.success('Department network created!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create department network');
    }
  }

  async function joinOrganization() {
    try {
      await membershipAction({ action: 'join', code: joiningOrgId.trim() });
      toast.success('Joined department network!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to join department network');
    }
  }

  async function leaveNetwork() {
    if (!user || !profile?.organizationId || !organization) return;

    const isOwner = user.uid === organization.ownerId;
    if (isOwner) {
      const confirmName = prompt(`To disband this department network, please type its name: ${organization.name}`);
      if (confirmName !== organization.name) {
        toast.error("Department name did not match. Disband cancelled.");
        return;
      }
    } else {
      setShowLeaveConfirm(true);
      return;
    }

    await handleLeaveNetwork();
  }

  async function handleLeaveNetwork() {
    if (!user || !profile?.organizationId || !organization) return;
    setLoading(true);
    try {
      await membershipAction({ action: 'leave' });
      router.refresh();
    } catch (e) {
      console.error("Error leaving network:", e);
      toast.error("Failed to leave network accurately.");
    } finally {
      setLoading(false);
    }
  }

  // Quick numerical steppers
  const stepBudget = (delta: number) => {
    const current = parseFloat(tempBudget) || 0;
    setTempBudget(Math.max(0, current + delta).toFixed(2));
  };

  const stepTutor = (delta: number) => {
    const current = parseInt(tempTutorLimitPerStudent) || 0;
    setTempTutorLimitPerStudent(Math.max(0, current + delta).toString());
  };

  const stepNotebook = (delta: number) => {
    const current = parseInt(tempNotebookLimitPerStudent) || 0;
    setTempNotebookLimitPerStudent(Math.max(0, current + delta).toString());
  };

  const stepAiNotebook = (delta: number) => {
    const current = parseInt(tempAiNotebookLimitPerStudent) || 0;
    setTempAiNotebookLimitPerStudent(Math.max(0, current + delta).toString());
  };

  // High-level calculations
  const spentDollars = (organization?.aiUsageCurrent || 0) / 100;
  const budgetCapDollars = (organization?.aiBudgetLimit || 0) / 100;
  const budgetPercentUsed = budgetCapDollars > 0 ? Math.min((spentDollars / budgetCapDollars) * 100, 100) : 0;
  const budgetRemaining = Math.max(budgetCapDollars - spentDollars, 0);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse text-lg">
          Connecting to Department Network...
        </p>
      </div>
    );
  }

  const isFreePlan = organization?.planId === "free";
  const isOwner = user?.uid === organization?.ownerId;
  const inviteEmailBody = `Join ${organization?.name || "our Network"} on Scorpio to share teaching resources.\n\n${inviteUrl}`;
  const inviteEmailDraft = `mailto:?subject=Invitation%20to%20join%20Scorpio&body=${encodeURIComponent(inviteEmailBody)}`;

  return (
    <TooltipProvider>
      <div className="space-y-6">

        {/* ─── Top Department Pulse Header ───────────────────────── */}
        <div className="flex flex-col gap-5 border-b border-border/60 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                {organization && isRenaming && isOwner ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={renamedOrgName}
                      onChange={e => setRenamedOrgName(e.target.value)}
                      aria-label="Department name"
                      className="h-9 w-full text-base font-medium sm:w-64"
                      placeholder="Department Name"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleRenameNetwork} disabled={updatingName} className="h-9 cursor-pointer">
                      {updatingName ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsRenaming(false)} className="h-9 cursor-pointer">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex min-w-0 items-center gap-2">
                    <h1 className="min-w-0 break-words text-3xl font-semibold tracking-tight">
                      {organization ? organization.name : "Scorpio Network"}
                    </h1>
                    {organization && isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-opacity cursor-pointer"
                        onClick={() => { setIsRenaming(true); setRenamedOrgName(organization.name); }}
                        title="Rename Department"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                {organization && (
                  <Badge variant={isFreePlan ? "outline" : "default"} className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    isFreePlan ? "text-muted-foreground border-border" : "bg-emerald-600 text-white"
                  )}>
                    {isFreePlan ? "Free Plan" : "Department License"}
                  </Badge>
                )}
              </div>

              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>Collaborative Physics Department</span>
                {organization && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-xs text-muted-foreground/80">ID: {organization.id}</span>
                  </>
                )}
              </p>
            </div>

            {/* Header Action Strip */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {organization && (
                <>
                  {isOwner && (
                    <Button onClick={() => changeInviteDialog(true)} className="h-9 gap-2 text-xs font-bold shadow-sm rounded-xl px-4">
                      <UserPlus className="h-3.5 w-3.5" />
                      Invite Colleague
                    </Button>
                  )}
                  {isOwner && (
                    <Button asChild variant="outline" size="sm" className="h-9 gap-2 text-xs font-semibold rounded-xl cursor-pointer">
                      <Link href="/teacher/network/billing">
                        <CreditCard className="h-3.5 w-3.5" />
                        Billing & Plan
                      </Link>
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-[11px] font-bold gap-1.5 rounded-xl px-3 cursor-pointer"
                onClick={() => setTutorialOpen(true)}
              >
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                Guide
              </Button>
            </div>
          </div>

          {/* ─── Numerical Status Strip (Live Metrics Pulse) ─────── */}
          {organization && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-2 xl:grid-cols-4">
              {/* Metric 1: Faculty */}
              <div className="flex items-center gap-3 p-2 bg-background/70 border border-border/40 rounded-xl">
                <div className="size-7 rounded-lg sm:size-10 bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-black font-mono leading-none">{networkMembers.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1 truncate">
                    Faculty
                  </div>
                </div>
              </div>

              {/* Metric 2: Enrolled Students */}
              <Link href="/teacher/students?tab=insights" className="block group">
                <div className="flex items-center gap-3 p-2 bg-background/70 hover:bg-background border border-border/40 hover:border-primary/50 transition-all rounded-xl cursor-pointer">
                  <div className="size-7 rounded-lg sm:size-10 bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl font-black font-mono leading-none flex items-center justify-between">
                      <span>{studentCount}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1 truncate">
                      Student insights
                    </div>
                  </div>
                </div>
              </Link>

              {/* Metric 3: AI Spending Meter */}
              <div className="flex items-center gap-3 p-2 bg-background/70 border border-border/40 rounded-xl">
                <div className="size-7 rounded-lg sm:size-10 bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <HandCoins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-xl font-black font-mono leading-none text-emerald-600 dark:text-emerald-400">
                      ${spentDollars.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">
                      / ${budgetCapDollars.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-border/40 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        budgetPercentUsed >= 90 ? "bg-red-500" : budgetPercentUsed >= 70 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${budgetPercentUsed}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Metric 4: Raise Tutor Capacity */}
              <div className="flex items-center gap-3 p-2 bg-background/70 border border-border/40 rounded-xl">
                <div className="size-7 rounded-lg sm:size-10 bg-purple-500/10 flex items-center justify-center shrink-0">
                  <RaiseLogo size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-black font-mono leading-none text-purple-600 dark:text-purple-400">
                    {organization.aiTutorLimitPerStudent || 0}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1 truncate">
                    msgs / student ({(organization.aiTutorLimitPerStudent || 0) * studentCount} pool)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <NetworkTutorial open={tutorialOpen} onOpenChange={setTutorialOpen} />

        {/* ─── If Not in a Network (Get Started) ───────────────── */}
        {!profile?.organizationId ? (
          <div className="max-w-4xl mx-auto py-10">
            <div className="text-center mb-8 space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Connect with Your Science Department</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Collaborate with fellow physics teachers, pool student AI tutoring allowances, and share Waypoints curriculum.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
              <Card className="relative overflow-hidden group hover:border-primary/50 transition-all shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <PlusCircle className="h-6 w-6 text-primary" />
                    Start New Department
                  </CardTitle>
                  <CardDescription>
                    For Department Heads or Lead Teachers setting up the team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name" className="text-xs font-bold uppercase text-muted-foreground">Department / School Name</Label>
                    <Input
                      id="org-name"
                      placeholder="e.g. Scarsdale High Physics"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={createOrganization} className="w-full h-11 font-bold cursor-pointer">
                    Create Department
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="relative overflow-hidden group hover:border-primary/50 transition-all shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <UserPlus className="h-6 w-6 text-primary" />
                    Join Existing Department
                  </CardTitle>
                  <CardDescription>
                    Joining your school's team? Enter the code provided by your lead.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-id" className="text-xs font-bold uppercase text-muted-foreground">Department invite code</Label>
                    <Input
                      id="org-id"
                      placeholder="Paste an invite code"
                      value={joiningOrgId}
                      onChange={(e) => setJoiningOrgId(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={joinOrganization} variant="outline" className="w-full h-11 font-bold cursor-pointer">
                    Join Team
                    <LinkIcon className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : !organization ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Retrieving department details...</p>
          </div>
        ) : (
          /* ─── 3 Clean, Focused Tabs ───────────────────────────── */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
              <TabsList className="grid h-auto w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="faculty" className="min-h-8 px-2 sm:px-4">
                  <Users className="h-3.5 w-3.5" />
                  Faculty
                </TabsTrigger>
                <TabsTrigger value="limits" className="min-h-8 px-2 sm:px-4">
                  <Sliders className="h-3.5 w-3.5" />
                  Quotas
                </TabsTrigger>
                <TabsTrigger value="analytics" className="min-h-8 px-2 sm:px-4">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {activeTab === "limits" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex h-9 text-xs font-bold gap-2 cursor-pointer rounded-xl"
                  onClick={() => setLimitsOpen(true)}
                >
                  <RaiseLogo size={15} className="text-primary" />
                  Ask Raise for Advice
                </Button>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════
                TAB 1: FACULTY & ROSTER
               ═══════════════════════════════════════════════════════ */}
            <TabsContent value="faculty" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Faculty List Table (2 Columns) */}
                <Card className="lg:col-span-2 border-border/60 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Department Teachers ({networkMembers.length})
                      </CardTitle>
                      <CardDescription className="text-xs">
                        All educators sharing this network's curriculum and AI pool.
                      </CardDescription>
                    </div>
                    {isOwner && (
                      <Button size="sm" className="text-xs font-semibold rounded-xl" onClick={() => changeInviteDialog(true)}>
                        <UserPlus className="h-3.5 w-3.5" />
                        Add Teacher
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Educator</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="pr-6 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {networkMembers.map((member) => (
                          <TableRow key={member.uid} className="hover:bg-muted/40">
                            <TableCell className="pl-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                                  {(member.displayName || member.name || "E").charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-sm truncate">
                                    {member.displayName || member.name || "Educator"}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground font-mono">
                                    ID: {member.uid.slice(0, 10)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">{member.email || "—"}</span>
                            </TableCell>
                            <TableCell>
                              {organization.ownerId === member.uid ? (
                                <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60 font-semibold text-[10px] gap-1">
                                  <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  Lead Admin
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] font-medium">
                                  Educator
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="pr-6 text-right">
                              {isOwner && member.uid !== user?.uid ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-amber-600 focus:text-amber-700 cursor-pointer"
                                      onClick={() => transferOwnership(member.uid, member.displayName || member.name || "this educator")}
                                    >
                                      <Crown className="h-4 w-4 mr-2" />
                                      Transfer Lead Role
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive cursor-pointer"
                                      onClick={() => kickMember(member.uid, member.displayName || member.name || "this educator")}
                                    >
                                      <UserMinus className="h-4 w-4 mr-2" />
                                      Remove from Department
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <div className="h-8 w-8" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Right Side Column: Quick Invite & Department Info */}
                <div className="space-y-5">
                  {isOwner && (
                    <Card className="border-primary/20 bg-primary/5 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Share2 className="size-4 text-primary" /> Invite fellow teachers
                        </CardTitle>
                        <CardDescription>Share Waypoints and teaching resources with a colleague.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button size="sm" onClick={() => changeInviteDialog(true)}>Invite a colleague</Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Plan / Subscription Summary Card */}
                  {isOwner && (
                    <Card className="border-border/60 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            Department Billing
                          </span>
                          <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-[10px]">
                            {organization.planId === "free" ? "Free Tier" : "Pro Active"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Managed through Polar metered billing. Department spend is tracked centrally.
                        </p>
                        <Button asChild variant="outline" className="w-full text-xs h-9 font-semibold cursor-pointer">
                          <Link href="/teacher/network/billing">
                            Manage Subscription & Invoices
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Department Actions / Danger Zone */}
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-destructive" />
                        Department Controls
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-9 text-destructive border-destructive/20 hover:bg-destructive/10 cursor-pointer font-semibold"
                        onClick={leaveNetwork}
                      >
                        <LogOut className="mr-2 h-3.5 w-3.5" />
                        {isOwner ? "Disband Department Network" : "Leave Department"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════
                TAB 2: QUOTAS & LIMITS (ADVANCED NUMERICAL CONTROLS)
               ═══════════════════════════════════════════════════════ */}
            <TabsContent value="limits" className="space-y-6 outline-none">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-secondary/20 p-4 border border-border/50 rounded-2xl">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-primary" />
                    Numerical Safety & Quota Dials
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Precise numerical thresholds to prevent budget overages and calibrate student AI engagement.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono border-border bg-background">
                    Resets Every 30 Days
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px] font-bold gap-1.5 cursor-pointer rounded-xl"
                    onClick={() => setLimitsOpen(true)}
                  >
                    <RaiseLogo size={14} className="text-primary" />
                    Ask Raise
                  </Button>
                </div>
              </div>

              {/* 2x2 Numerical Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Monthly AI Budget Cap ($) */}
                <Card className={cn(
                  "border-emerald-200/50 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm relative overflow-hidden",
                  isFreePlan && "grayscale-[0.5]"
                )}>
                  {isFreePlan && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] p-6 text-center">
                      <Lock className="h-5 w-5 text-white mb-2" />
                      <p className="text-xs font-bold text-white mb-3">Unlock Budget Controls on Pro</p>
                      <Button asChild size="sm" variant="secondary" className="h-8 text-xs font-bold px-4 rounded-xl cursor-pointer">
                        <Link href="/teacher/network/billing">
                          Upgrade to Pro
                        </Link>
                      </Button>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                        <HandCoins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Monthly AI Spending Cap
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono border-emerald-300 text-emerald-700 bg-emerald-100/50 dark:bg-emerald-950 dark:text-emerald-400">
                        HARD STOP SAFETY
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      All AI features pause automatically when this exact dollar threshold is reached. No surprise invoices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Numerical Spent / Remaining Gauge */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-background/80 border rounded-xl shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                          Spent This Month
                        </span>
                        <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                          ${spentDollars.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-3 bg-background/80 border rounded-xl shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                          Remaining Buffer
                        </span>
                        <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                          ${budgetRemaining.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground">Usage Consumption</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{budgetPercentUsed.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-border/40 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", budgetPercentUsed >= 90 ? "bg-red-500" : budgetPercentUsed >= 70 ? "bg-amber-500" : "bg-emerald-500")}
                          style={{ width: `${budgetPercentUsed}%` }}
                        />
                      </div>
                    </div>

                    {isOwner && (
                      <div className="space-y-3 pt-2 border-t border-emerald-200/40 dark:border-emerald-900/30">
                        <div className="space-y-1.5">
                          <Label htmlFor="ai-budget-input" className="text-xs font-bold text-muted-foreground">
                            Set Safety Cap (USD)
                          </Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground font-mono">$</span>
                              <Input
                                id="ai-budget-input"
                                type="number"
                                step="0.50"
                                min="0"
                                placeholder="15.00"
                                className="h-10 pl-7 font-mono font-bold text-sm bg-background"
                                value={tempBudget}
                                onChange={(e) => setTempBudget(e.target.value)}
                              />
                            </div>
                            <Button
                              className="h-10 px-4 font-bold cursor-pointer rounded-xl"
                              onClick={handleUpdateBudget}
                              disabled={updatingBudget}
                            >
                              {updatingBudget ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Cap"}
                            </Button>
                          </div>
                        </div>

                        {/* Quick Step Pills */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Quick Add:</span>
                          {[5, 10, 25].map(amount => (
                            <Button
                              key={amount}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px] font-mono font-bold cursor-pointer rounded-full"
                              onClick={() => stepBudget(amount)}
                            >
                              +${amount}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2. Raise AI Tutor Message Allowance */}
                <Card className={cn(
                  "border-purple-200/50 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/10 shadow-sm relative overflow-hidden",
                  isFreePlan && "grayscale-[0.5]"
                )}>
                  {isFreePlan && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] p-6 text-center">
                      <Lock className="h-5 w-5 text-white mb-2" />
                      <p className="text-xs font-bold text-white mb-3">Unlock Raise Quotas on Pro</p>
                      <Button asChild size="sm" variant="secondary" className="h-8 text-xs font-bold px-4 rounded-xl cursor-pointer">
                        <Link href="/teacher/network/billing">
                          Upgrade to Pro
                        </Link>
                      </Button>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-800 dark:text-purple-300">
                        <RaiseLogo size={17} className="text-purple-600 dark:text-purple-400" />
                        Raise AI Tutor Allowance
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono border-purple-300 text-purple-700 bg-purple-100/50 dark:bg-purple-950 dark:text-purple-400">
                        PER STUDENT · MONTHLY
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Maximum Socratic help queries each student can ask Raise every month.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Live Department Capacity Multiplier */}
                    <div className="p-3 bg-background/80 border rounded-xl shadow-xs">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          Active Allowance
                        </span>
                        <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                          {studentCount} Students Enrolled
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
                          {organization.aiTutorLimitPerStudent || 0}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                          messages / student / month
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Department Pool:</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {(organization.aiTutorLimitPerStudent || 0) * studentCount} total messages
                        </span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="space-y-3 pt-2 border-t border-purple-200/40 dark:border-purple-900/30">
                        <div className="space-y-1.5">
                          <Label htmlFor="tutor-limit-input" className="text-xs font-bold text-muted-foreground">
                            Edit Messages per Student
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="tutor-limit-input"
                              type="number"
                              min="0"
                              placeholder="30"
                              className="h-10 font-mono font-bold text-sm bg-background flex-1"
                              value={tempTutorLimitPerStudent}
                              onChange={(e) => setTempTutorLimitPerStudent(e.target.value)}
                            />
                            <Button
                              className="h-10 px-4 font-bold cursor-pointer rounded-xl"
                              onClick={handleUpdateTutorLimit}
                              disabled={updatingTutor}
                            >
                              {updatingTutor ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Limit"}
                            </Button>
                          </div>
                        </div>

                        {/* Quick Step Pills + Live Projection */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Step:</span>
                            {[5, 10, 20].map(amount => (
                              <Button
                                key={amount}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-[10px] font-mono font-bold cursor-pointer rounded-full"
                                onClick={() => stepTutor(amount)}
                              >
                                +{amount}
                              </Button>
                            ))}
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            = {(parseInt(tempTutorLimitPerStudent || "0") * studentCount)} dept total
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 3. Notebook Research Workspaces */}
                <Card className={cn(
                  "border-blue-200/50 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10 shadow-sm relative overflow-hidden",
                  isFreePlan && "grayscale-[0.5]"
                )}>
                  {isFreePlan && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] p-6 text-center">
                      <Lock className="h-5 w-5 text-white mb-2" />
                      <p className="text-xs font-bold text-white mb-3">Unlock Notebook Limits on Pro</p>
                      <Button asChild size="sm" variant="secondary" className="h-8 text-xs font-bold px-4 rounded-xl cursor-pointer">
                        <Link href="/teacher/network/billing">
                          Upgrade to Pro
                        </Link>
                      </Button>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300">
                        <NotebookPen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Notebook Capacity & AI Inquiries
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono border-blue-300 text-blue-700 bg-blue-100/50 dark:bg-blue-950 dark:text-blue-400">
                        PER STUDENT · WORKSPACE
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Number of research derivation notebooks and in-notebook AI inquiries per student.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-background/80 border rounded-xl shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                          Notebooks / Student
                        </span>
                        <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                          {organization.notebookLimitPerStudent || 0}
                        </span>
                      </div>
                      <div className="p-3 bg-background/80 border rounded-xl shadow-xs">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                          AI Inquiries / Mo
                        </span>
                        <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                          {organization.aiNotebookLimitPerStudent || 0}
                        </span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="space-y-3 pt-2 border-t border-blue-200/40 dark:border-blue-900/30">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="nb-input" className="text-[11px] font-bold text-muted-foreground">Notebooks / Student</Label>
                            <Input
                              id="nb-input"
                              type="number"
                              min="0"
                              placeholder="5"
                              className="h-9 font-mono font-bold text-sm bg-background"
                              value={tempNotebookLimitPerStudent}
                              onChange={(e) => setTempNotebookLimitPerStudent(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="ai-nb-input" className="text-[11px] font-bold text-muted-foreground">AI Inquiries / Mo</Label>
                            <Input
                              id="ai-nb-input"
                              type="number"
                              min="0"
                              placeholder="50"
                              className="h-9 font-mono font-bold text-sm bg-background"
                              value={tempAiNotebookLimitPerStudent}
                              onChange={(e) => setTempAiNotebookLimitPerStudent(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px] font-mono font-bold cursor-pointer"
                              onClick={() => stepNotebook(1)}
                            >
                              +1 NB
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px] font-mono font-bold cursor-pointer"
                              onClick={() => stepAiNotebook(10)}
                            >
                              +10 Inquiries
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            className="h-8 px-4 font-bold cursor-pointer rounded-xl"
                            onClick={handleUpdateNotebookLimit}
                            disabled={updatingNotebook}
                          >
                            {updatingNotebook ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
            </TabsContent>


            {/* ═══════════════════════════════════════════════════════
                TAB 4: DEEP TOKEN ANALYTICS & LOGS
               ═══════════════════════════════════════════════════════ */}
            <TabsContent value="analytics" className="space-y-6 outline-none">
              {profile?.role === "teacher" && profile?.organizationId && (
                <UsageAnalytics organizationId={profile.organizationId} />
              )}
            </TabsContent>
          </Tabs>
        )}

        {isOwner && (
          <Dialog open={inviteModalOpen} onOpenChange={changeInviteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a colleague</DialogTitle>
                <DialogDescription>
                  Each link can be used once and expires after seven days. Create a separate link for each teacher.
                </DialogDescription>
              </DialogHeader>
              {inviteUrl && (
                <div className="space-y-2">
                  <Label htmlFor="network-invite-link">Invitation link</Label>
                  <Input id="network-invite-link" readOnly value={inviteUrl} onFocus={event => event.target.select()} />
                </div>
              )}
              {inviteError && <p role="alert" className="text-sm text-destructive">{inviteError}</p>}
              <div className="flex flex-wrap justify-end gap-2">
                {inviteUrl ? (
                  <>
                    <Button asChild variant="outline">
                      <a href={inviteEmailDraft}>
                        Email draft
                      </a>
                    </Button>
                    <Button onClick={copyInviteLink}>
                      {copiedLink ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {copiedLink ? "Link copied" : "Copy link"}
                    </Button>
                  </>
                ) : (
                  <Button onClick={createInvite} disabled={creatingInvite}>
                    {creatingInvite ? "Creating link…" : "Create invite link"}
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* ─── Limits Assistant Dialog ────────────────────────────── */}
        <Dialog open={limitsOpen} onOpenChange={setLimitsOpen}>
          <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0 overflow-hidden border-border/60 rounded-3xl">
            <DialogHeader className="p-6 bg-secondary/30 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <RaiseLogo size={20} className="text-purple-500" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black tracking-tight">Limits & Safety Assistant</DialogTitle>
                  <DialogDescription className="text-xs">Context-aware recommendations for department caps.</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {limitsMessages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl p-4 text-sm shadow-sm",
                    msg.role === "user"
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-tr-none"
                      : "bg-secondary text-foreground rounded-tl-none border border-border/50"
                  )}>
                    <MarkdownRenderer>{msg.content}</MarkdownRenderer>
                  </div>
                </div>
              ))}
              {limitsLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-tl-none p-4 border border-border/50">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-background border-t border-border/50">
              <div className="flex gap-2 relative">
                <Textarea
                  placeholder="Ask Raise about quotas (e.g. 'What is a good budget for 60 students?')..."
                  className="min-h-[44px] h-[44px] resize-none pr-12 rounded-2xl border-border"
                  value={limitsInput}
                  onChange={(e) => setLimitsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendLimitsMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-7 w-7 rounded-xl cursor-pointer"
                  aria-label="Send message to Raise"
                  onClick={sendLimitsMessage}
                  disabled={limitsLoading || !limitsInput.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ─── Confirmation Dialogs ───────────────────────────────── */}
        <ConfirmDialog
          open={!!memberToKick}
          onOpenChange={(open) => !open && setMemberToKick(null)}
          title="Remove Member from Department"
          description={`Are you sure you want to remove ${memberToKick?.name} from the department? They will lose access to shared Waypoints and the department AI pool.`}
          onConfirm={handleKickMember}
          confirmText="Remove"
          cancelText="Cancel"
        />

        <ConfirmDialog
          open={!!ownerToTransfer}
          onOpenChange={(open) => !open && setOwnerToTransfer(null)}
          title="Transfer Department Leadership"
          description={`Are you sure you want to transfer ownership to ${ownerToTransfer?.name}? You will step down as Lead Admin.`}
          onConfirm={handleTransferOwnership}
          confirmText="Transfer"
          cancelText="Cancel"
        />

        <ConfirmDialog
          open={showLeaveConfirm}
          onOpenChange={setShowLeaveConfirm}
          title="Leave Department Network"
          description="Are you sure you want to leave this department network? You will no longer share the collective AI budget or Waypoints."
          onConfirm={handleLeaveNetwork}
          confirmText="Leave"
          cancelText="Cancel"
        />
      </div>
    </TooltipProvider>
  );
}
