"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  Clock,
  Component,
  Copy,
  CreditCard,
  Crown,
  DollarSign,
  Download,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  GraduationCap,
  HandCoins,
  HelpCircle,
  Info,
  Lightbulb,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPinned,
  MessageCircle,
  MoreHorizontal,
  Network,
  Notebook,
  NotebookPen,
  PackageOpen,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Unlock,
  Upload,
  UserMinus,
  UserPlus,
  Users,
  Waypoints,
  Zap,
} from "lucide-react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RaiseLogo } from "@/components/ui/raise-logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NetworkTutorial } from "@/components/network-tutorial";
import { TeacherPageHeader } from "@/components/teacher/workspace";
import type { StudentPortfolio } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  DEFAULT_VAULT_FORMULAS,
  VAULT_CATEGORIES,
  courseName,
  initialDailyUsage,
  initialFaculty,
  initialTypeDistribution,
  initialUsageEvents,
  initialWaypoints,
  type FacultyMember,
  type PreviewCourse,
  type PreviewFormula,
  type PreviewStudent,
  type WaypointTemplate,
} from "./workspace-preview-data";

/* ═══════════════════════════════════════════════════════════════════════════
   1. NETWORK PAGE (Matches /teacher/network + UsageAnalytics)
   ═══════════════════════════════════════════════════════════════════════════ */

export function NetworkPage({
  studentCount,
  onOpenStudentInsights,
}: {
  studentCount: number;
  onOpenStudentInsights: () => void;
}) {
  const [orgName, setOrgName] = useState("Demo Physics Department");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamedOrgName, setRenamedOrgName] = useState(orgName);
  const [members, setMembers] = useState<FacultyMember[]>(initialFaculty);
  const [activeTab, setActiveTab] = useState("faculty");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Quotas & Numerical Controls state
  const [spentDollars] = useState(4.28);
  const [budgetCapDollars, setBudgetCapDollars] = useState(25.0);
  const [tempBudget, setTempBudget] = useState("25.00");
  const [tutorLimit, setTutorLimit] = useState(30);
  const [tempTutorLimit, setTempTutorLimit] = useState("30");
  const [notebookLimit, setNotebookLimit] = useState(5);
  const [tempNotebookLimit, setTempNotebookLimit] = useState("5");
  const [aiNotebookLimit, setAiNotebookLimit] = useState(50);
  const [tempAiNotebookLimit, setTempAiNotebookLimit] = useState("50");

  // Limits Assistant dialog
  const [limitsOpen, setLimitsOpen] = useState(false);
  const [limitsInput, setLimitsInput] = useState("");
  const [limitsMessages, setLimitsMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Scorpio guide. Ask me anything about your network's limits, budgets, or capacities — I'll explain what each setting does and suggest optimal values for your class size.",
    },
  ]);

  // Analytics chart hover
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(3);

  const orgId = "demo-phys-8492a";
  const inviteUrl = `https://scorpioedu.org/join/${orgId}`;
  const budgetPercentUsed = budgetCapDollars > 0 ? Math.min((spentDollars / budgetCapDollars) * 100, 100) : 0;
  const budgetRemaining = Math.max(budgetCapDollars - spentDollars, 0);

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(inviteUrl);
    } catch {}
    setCopiedLink(true);
    toast.success("Invite link copied.");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyId = async () => {
    try {
      await navigator.clipboard?.writeText(orgId);
    } catch {}
    setCopiedId(true);
    toast.success("Department ID copied.");
    setTimeout(() => setCopiedId(false), 2500);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "navigation":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "tutor":
        return <RaiseLogo className="h-4 w-4 text-purple-500" size={17} />;
      case "grading":
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case "notebook":
        return <Notebook className="h-4 w-4 text-sky-500" />;
      case "generation":
        return <Sparkles className="h-4 w-4 text-pink-500" />;
      case "portfolio":
        return <BrainCircuit className="h-4 w-4 text-indigo-500" />;
      default:
        return <Activity className="h-4 w-4 text-zinc-500" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Top Department Pulse Header */}
        <div className="flex flex-col gap-5 border-b border-border/60 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                {isRenaming ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={renamedOrgName}
                      onChange={(e) => setRenamedOrgName(e.target.value)}
                      aria-label="Department name"
                      className="h-9 w-full text-base font-medium sm:w-64"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (renamedOrgName.trim()) {
                          setOrgName(renamedOrgName.trim());
                          toast.success("Department renamed successfully.");
                        }
                        setIsRenaming(false);
                      }}
                      className="h-9 cursor-pointer"
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsRenaming(false)} className="h-9 cursor-pointer">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex min-w-0 items-center gap-2">
                    <h1 id="dashboard-preview-heading" tabIndex={-1} className="min-w-0 break-words text-3xl font-semibold tracking-tight">
                      {orgName}
                    </h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary transition-opacity cursor-pointer"
                      onClick={() => {
                        setRenamedOrgName(orgName);
                        setIsRenaming(true);
                      }}
                      title="Rename Department"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <Badge className="bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider">
                  Standard Plan
                </Badge>
              </div>

              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>Collaborative Physics Department</span>
                <span>•</span>
                <span className="font-mono text-xs text-muted-foreground/80">ID: {orgId}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                onClick={() => setInviteModalOpen(true)}
                className="h-9 gap-2 text-xs font-bold shadow-sm rounded-xl px-4 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Invite Colleague
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-xs font-semibold rounded-xl cursor-pointer"
                onClick={() => setActiveTab("limits")}
              >
                <CreditCard className="h-3.5 w-3.5" />
                Billing & Plan
              </Button>
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

          {/* Numerical Status Strip */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-2 xl:grid-cols-4">
            <div className="flex items-center gap-3 p-2 bg-background/70 border border-border/40 rounded-xl">
              <div className="size-7 rounded-lg sm:size-10 bg-blue-500/10 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-black font-mono leading-none">{members.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1 truncate">
                  Faculty
                </div>
              </div>
            </div>

            <button type="button" onClick={onOpenStudentInsights} className="block group text-left">
              <div className="flex items-center gap-3 p-2 bg-background/70 hover:bg-background border border-border/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all rounded-xl cursor-pointer">
                <div className="size-7 rounded-lg sm:size-10 bg-indigo-500/10 group-hover:bg-indigo-500/20 flex items-center justify-center shrink-0 transition-colors">
                  <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
            </button>

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

            <div className="flex items-center gap-3 p-2 bg-background/70 border border-border/40 rounded-xl">
              <div className="size-7 rounded-lg sm:size-10 bg-purple-500/10 flex items-center justify-center shrink-0">
                <RaiseLogo size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-black font-mono leading-none text-purple-600 dark:text-purple-400">
                  {tutorLimit}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1 truncate">
                  msgs / student ({tutorLimit * studentCount} pool)
                </div>
              </div>
            </div>
          </div>
        </div>

        <NetworkTutorial open={tutorialOpen} onOpenChange={setTutorialOpen} />

        {/* 3 Clean, Focused Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
            <TabsList className="grid h-auto w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="faculty" className="min-h-8 px-2 sm:px-4 cursor-pointer">
                <Users className="h-3.5 w-3.5" />
                Faculty
              </TabsTrigger>
              <TabsTrigger value="limits" className="min-h-8 px-2 sm:px-4 cursor-pointer">
                <Sliders className="h-3.5 w-3.5" />
                Quotas
              </TabsTrigger>
              <TabsTrigger value="analytics" className="min-h-8 px-2 sm:px-4 cursor-pointer">
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

          {/* TAB 1: FACULTY */}
          <TabsContent value="faculty" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-border/60 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Department Teachers ({members.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      All educators sharing this network&apos;s curriculum and AI pool.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="text-xs font-semibold rounded-xl cursor-pointer"
                    onClick={() => setAddTeacherOpen(true)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add Teacher
                  </Button>
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
                      {members.map((member) => (
                        <TableRow key={member.uid} className="hover:bg-muted/40">
                          <TableCell className="pl-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm truncate">{member.name}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  ID: {member.uid.slice(0, 10)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">{member.email}</span>
                          </TableCell>
                          <TableCell>
                            {member.isOwner ? (
                              <Badge
                                variant="default"
                                className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60 font-semibold text-[10px] gap-1"
                              >
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
                            {!member.isOwner ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer" aria-label={`Manage ${member.name}`}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-amber-600 focus:text-amber-700 cursor-pointer"
                                    onClick={() => {
                                      setMembers((prev) =>
                                        prev.map((m) => ({ ...m, isOwner: m.uid === member.uid }))
                                      );
                                      toast.success(`Department leadership transferred to ${member.name}`);
                                    }}
                                  >
                                    <Crown className="h-4 w-4 mr-2" />
                                    Transfer Lead Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                    onClick={() => {
                                      setMembers((prev) => prev.filter((m) => m.uid !== member.uid));
                                      toast.success(`${member.name} has been removed from the department.`);
                                    }}
                                  >
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Remove from Department
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <div className="h-8 w-8 ml-auto" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Right Side Column */}
              <div className="space-y-5">
                <Card className="border-primary/20 bg-primary/5 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-primary" />
                      Invite Fellow Teachers
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Colleagues gain immediate access to shared Waypoints and department AI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 p-2.5 bg-background border rounded-xl text-xs font-mono">
                      <span className="flex-1 truncate text-muted-foreground select-all">{inviteUrl}</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 cursor-pointer" aria-label="Copy invite link" onClick={copyLink}>
                        {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 h-9 text-xs font-bold cursor-pointer gap-2" onClick={copyLink}>
                        {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 h-9 text-xs font-bold cursor-pointer"
                        onClick={() => setInviteModalOpen(true)}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Invite Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Department Billing
                      </span>
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-[10px]">
                        Pro Active
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Managed through Polar metered billing. Department spend is tracked centrally.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full text-xs h-9 font-semibold cursor-pointer"
                      onClick={() => setActiveTab("limits")}
                    >
                      Manage Quotas & Spend Cap
                    </Button>
                  </CardContent>
                </Card>

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
                      onClick={() => toast.info("Department network is active in this demo.")}
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Disband Department Network
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: QUOTAS & LIMITS */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Monthly AI Budget Cap */}
              <Card className="border-emerald-200/50 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm">
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
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          budgetPercentUsed >= 90 ? "bg-red-500" : budgetPercentUsed >= 70 ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${budgetPercentUsed}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-emerald-200/40 dark:border-emerald-900/30">
                    <div className="space-y-1.5">
                      <Label htmlFor="preview-ai-budget" className="text-xs font-bold text-muted-foreground">
                        Set Safety Cap (USD)
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-sm font-bold text-muted-foreground font-mono">$</span>
                          <Input
                            id="preview-ai-budget"
                            type="number"
                            step="0.50"
                            min="0"
                            className="h-10 pl-7 font-mono font-bold text-sm bg-background"
                            value={tempBudget}
                            onChange={(e) => setTempBudget(e.target.value)}
                          />
                        </div>
                        <Button
                          className="h-10 px-4 font-bold cursor-pointer rounded-xl"
                          onClick={() => {
                            const parsed = parseFloat(tempBudget);
                            if (!Number.isNaN(parsed) && parsed >= 0) {
                              setBudgetCapDollars(parsed);
                              toast.success(`Monthly AI Budget Cap set to $${parsed.toFixed(2)}`);
                            }
                          }}
                        >
                          Save Cap
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Quick Add:</span>
                      {[5, 10, 25].map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[10px] font-mono font-bold cursor-pointer rounded-full"
                          onClick={() => {
                            const next = Math.max(0, (parseFloat(tempBudget) || 0) + amount);
                            setTempBudget(next.toFixed(2));
                          }}
                        >
                          +${amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Raise AI Tutor Allowance */}
              <Card className="border-purple-200/50 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/10 shadow-sm">
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
                        {tutorLimit}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">
                        messages / student / month
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Department Pool:</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {tutorLimit * studentCount} total messages
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-purple-200/40 dark:border-purple-900/30">
                    <div className="space-y-1.5">
                      <Label htmlFor="preview-tutor-limit" className="text-xs font-bold text-muted-foreground">
                        Edit Messages per Student
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="preview-tutor-limit"
                          type="number"
                          min="0"
                          className="h-10 font-mono font-bold text-sm bg-background flex-1"
                          value={tempTutorLimit}
                          onChange={(e) => setTempTutorLimit(e.target.value)}
                        />
                        <Button
                          className="h-10 px-4 font-bold cursor-pointer rounded-xl"
                          onClick={() => {
                            const parsed = parseInt(tempTutorLimit, 10);
                            if (!Number.isNaN(parsed) && parsed >= 0) {
                              setTutorLimit(parsed);
                              toast.success(`Raise limit updated to ${parsed} messages/month per student.`);
                            }
                          }}
                        >
                          Save Limit
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Step:</span>
                        {[5, 10, 20].map((amount) => (
                          <Button
                            key={amount}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-[10px] font-mono font-bold cursor-pointer rounded-full"
                            onClick={() => {
                              const next = Math.max(0, (parseInt(tempTutorLimit, 10) || 0) + amount);
                              setTempTutorLimit(String(next));
                            }}
                          >
                            +{amount}
                          </Button>
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        = {(parseInt(tempTutorLimit || "0", 10) || 0) * studentCount} dept total
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Notebook Research Workspaces */}
              <Card className="border-blue-200/50 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10 shadow-sm md:col-span-2">
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
                <CardContent className="grid gap-4 md:grid-cols-2 md:items-center">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-background/80 border rounded-xl shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                        Notebooks / Student
                      </span>
                      <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                        {notebookLimit}
                      </span>
                    </div>
                    <div className="p-3 bg-background/80 border rounded-xl shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                        AI Inquiries / Mo
                      </span>
                      <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                        {aiNotebookLimit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="preview-nb-input" className="text-[11px] font-bold text-muted-foreground">
                          Notebooks / Student
                        </Label>
                        <Input
                          id="preview-nb-input"
                          type="number"
                          min="0"
                          className="h-9 font-mono font-bold text-sm bg-background"
                          value={tempNotebookLimit}
                          onChange={(e) => setTempNotebookLimit(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="preview-ai-nb-input" className="text-[11px] font-bold text-muted-foreground">
                          AI Inquiries / Mo
                        </Label>
                        <Input
                          id="preview-ai-nb-input"
                          type="number"
                          min="0"
                          className="h-9 font-mono font-bold text-sm bg-background"
                          value={tempAiNotebookLimit}
                          onChange={(e) => setTempAiNotebookLimit(e.target.value)}
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
                          onClick={() => setTempNotebookLimit(String((parseInt(tempNotebookLimit, 10) || 0) + 1))}
                        >
                          +1 NB
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[10px] font-mono font-bold cursor-pointer"
                          onClick={() => setTempAiNotebookLimit(String((parseInt(tempAiNotebookLimit, 10) || 0) + 10))}
                        >
                          +10 Inquiries
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        className="h-8 px-4 font-bold cursor-pointer rounded-xl"
                        onClick={() => {
                          setNotebookLimit(Math.max(0, parseInt(tempNotebookLimit, 10) || 0));
                          setAiNotebookLimit(Math.max(0, parseInt(tempAiNotebookLimit, 10) || 0));
                          toast.success("Notebook limits updated!");
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: ANALYTICS (Matches UsageAnalytics + public/mission-control.png) */}
          <TabsContent value="analytics" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Estimated Spend", val: `$${spentDollars.toFixed(4)}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "AI Interactions", val: "171", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "Token Volume", val: "184.2k", icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
              ].map((stat, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/40">
                  <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                    <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold font-mono">{stat.val}</div>
                    <p className="text-[10px] text-muted-foreground mt-1">Last 250 events</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Interactions & Cost Trend SVG Chart */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
                      Interactions & Cost Trend
                    </CardTitle>
                    <CardDescription className="text-[10px]">
                      AI engagement grouped by calendar date.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[9px] px-2 py-0 border-purple-500/30 text-purple-400 bg-purple-500/5 uppercase font-bold tracking-tight">
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-6">
                {(() => {
                  const dailyData = initialDailyUsage;
                  const n = dailyData.length;
                  const W = 1000;
                  const H = 260;
                  const PAD = { top: 36, right: 16, bottom: 44, left: 44 };
                  const cW = W - PAD.left - PAD.right;
                  const cH = H - PAD.top - PAD.bottom;

                  const maxQ = Math.max(...dailyData.map((d) => d.queries), 1);
                  const maxC = Math.max(...dailyData.map((d) => d.totalCost), 0.000001);

                  const xAt = (i: number) => PAD.left + (n > 1 ? (i / (n - 1)) * cW : cW / 2);
                  const yQ = (v: number) => PAD.top + (1 - v / maxQ) * cH;
                  const yC = (v: number) => PAD.top + (1 - v / maxC) * cH;

                  const qPts = dailyData.map((d, i) => `${xAt(i).toFixed(1)},${yQ(d.queries).toFixed(1)}`);
                  const cPts = dailyData.map((d, i) => `${xAt(i).toFixed(1)},${yC(d.totalCost).toFixed(1)}`);

                  const smoothCurve = (pts: string[]) => {
                    if (pts.length === 1) return `M ${pts[0]}`;
                    const points = pts.map((p) => {
                      const [x, y] = p.split(",").map(Number);
                      return { x, y };
                    });
                    const np = points.length;
                    if (np === 2) return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)},${points[1].y.toFixed(1)}`;
                    const h: number[] = [];
                    const delta: number[] = [];
                    for (let i = 0; i < np - 1; i++) {
                      h[i] = points[i + 1].x - points[i].x;
                      delta[i] = (points[i + 1].y - points[i].y) / h[i];
                    }
                    const m: number[] = new Array(np);
                    m[0] = delta[0];
                    m[np - 1] = delta[np - 2];
                    for (let i = 1; i < np - 1; i++) {
                      m[i] = delta[i - 1] * delta[i] <= 0 ? 0 : (delta[i - 1] + delta[i]) / 2;
                    }
                    let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
                    for (let i = 0; i < np - 1; i++) {
                      const p1 = points[i];
                      const p2 = points[i + 1];
                      const cp1x = p1.x + h[i] / 3;
                      const cp1y = p1.y + (m[i] * h[i]) / 3;
                      const cp2x = p2.x - h[i] / 3;
                      const cp2y = p2.y - (m[i + 1] * h[i]) / 3;
                      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
                    }
                    return d;
                  };

                  const botY = PAD.top + cH;
                  const areaD = (pts: string[]) =>
                    `${smoothCurve(pts)} L ${xAt(n - 1).toFixed(1)},${botY.toFixed(1)} L ${xAt(0).toFixed(1)},${botY.toFixed(1)} Z`;

                  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
                    v: Math.round(maxQ * t),
                    y: yQ(maxQ * t),
                  }));
                  const hi = hoveredTrendIdx;
                  const hiDay = hi !== null ? dailyData[hi] : null;

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-blue-500/60">Peak</span>
                          <span className="text-xs font-black font-mono text-blue-500 tabular-nums">{maxQ}</span>
                          <span className="text-[9px] uppercase font-bold tracking-widest text-blue-500/60">interactions</span>
                        </div>
                        <div className="w-px h-3 bg-border/50" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-purple-500/60">Spend</span>
                          <span className="text-xs font-black font-mono text-purple-500 tabular-nums">${spentDollars.toFixed(4)}</span>
                          <span className="text-[9px] uppercase font-bold tracking-widest text-purple-500/60">USD</span>
                        </div>
                      </div>

                      <svg
                        viewBox={`0 0 ${W} ${H}`}
                        className="w-full block"
                        style={{ overflow: "visible", cursor: "crosshair" }}
                        onMouseLeave={() => setHoveredTrendIdx(3)}
                      >
                        <defs>
                          <linearGradient id="preview-gQ" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
                          </linearGradient>
                          <linearGradient id="preview-gC" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>

                        {yTicks.map((tk, i) => (
                          <line
                            key={i}
                            x1={PAD.left}
                            y1={tk.y}
                            x2={PAD.left + cW}
                            y2={tk.y}
                            stroke="currentColor"
                            strokeOpacity="0.06"
                            strokeWidth="1"
                            className="text-foreground"
                          />
                        ))}

                        {yTicks.map((tk, i) => (
                          <text
                            key={i}
                            x={PAD.left - 8}
                            y={tk.y + 4}
                            textAnchor="end"
                            fontSize="12"
                            fontWeight="500"
                            fill="currentColor"
                            fillOpacity="0.3"
                            className="text-foreground"
                          >
                            {tk.v}
                          </text>
                        ))}

                        <path d={areaD(cPts)} fill="url(#preview-gC)" />
                        <path d={areaD(qPts)} fill="url(#preview-gQ)" />

                        <path
                          d={smoothCurve(cPts)}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="7 4"
                        />

                        <path
                          d={smoothCurve(qPts)}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {hi !== null && (
                          <line
                            x1={xAt(hi)}
                            y1={PAD.top}
                            x2={xAt(hi)}
                            y2={botY}
                            stroke="currentColor"
                            strokeOpacity="0.12"
                            strokeWidth="1"
                            className="text-foreground"
                          />
                        )}

                        {dailyData.map((d, i) => (
                          <g key={i}>
                            <circle cx={xAt(i)} cy={yQ(d.queries)} r={hi === i ? 7 : 4} fill="#3b82f6" stroke="white" strokeWidth="2" />
                            <circle cx={xAt(i)} cy={yC(d.totalCost)} r={hi === i ? 5 : 3} fill="#a855f7" stroke="white" strokeWidth="1.5" />
                          </g>
                        ))}

                        {hi !== null && hiDay && (() => {
                          const tx = xAt(hi);
                          const TW = 164;
                          const TH = 64;
                          const TX = Math.min(Math.max(tx - TW / 2, PAD.left), PAD.left + cW - TW);
                          const TY = PAD.top - TH - 8;
                          return (
                            <g>
                              <rect x={TX} y={TY} width={TW} height={TH} rx="8" ry="8" fill="#18181b" opacity="0.95" />
                              <text x={TX + 12} y={TY + 16} fontSize="12" fontWeight="600" fill="white" fillOpacity="0.45">
                                {hiDay.date}
                              </text>
                              <text x={TX + 12} y={TY + 36} fontSize="12" fontFamily="monospace" fontWeight="800" fill="#60a5fa">
                                {hiDay.queries} interactions
                              </text>
                              <text x={TX + 12} y={TY + 52} fontSize="12" fontFamily="monospace" fontWeight="600" fill="#c084fc">
                                ${hiDay.totalCost.toFixed(4)} USD
                              </text>
                            </g>
                          );
                        })()}

                        {dailyData.map((_, i) => {
                          const colW = cW / (n - 1);
                          return (
                            <rect
                              key={i}
                              x={xAt(i) - colW / 2}
                              y={PAD.top}
                              width={colW}
                              height={cH}
                              fill="transparent"
                              onMouseEnter={() => setHoveredTrendIdx(i)}
                            />
                          );
                        })}

                        {dailyData.map((d, i) => (
                          <text
                            key={i}
                            x={xAt(i)}
                            y={botY + 28}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="500"
                            fill="currentColor"
                            fillOpacity="0.35"
                            className="text-foreground"
                          >
                            {d.date}
                          </text>
                        ))}
                      </svg>

                      <div className="flex items-center gap-4 px-0.5">
                        <div className="flex items-center gap-1.5">
                          <svg width="16" height="3" viewBox="0 0 16 3">
                            <line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                          <span className="text-[10px] text-muted-foreground/70 font-medium">Interactions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg width="16" height="3" viewBox="0 0 16 3">
                            <line x1="0" y1="1.5" x2="16" y2="1.5" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 2.5" />
                          </svg>
                          <span className="text-[10px] text-muted-foreground/70 font-medium">Cost (independent scale)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Interactions by Type */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Component className="h-3.5 w-3.5 text-emerald-400" />
                  Interactions by Type
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Workload breakdown across services.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {(() => {
                  const total = initialTypeDistribution.reduce((sum, d) => sum + d.value, 0);
                  return initialTypeDistribution.map((item) => {
                    const pct = Math.round((item.value / total) * 100);
                    return (
                      <div key={item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-md bg-muted/50 border border-border/40 shrink-0">
                              {getTypeIcon(item.name)}
                            </div>
                            <span className="text-[11px] font-bold capitalize">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] text-muted-foreground font-mono tabular-nums">{item.value}</span>
                            <span className="text-[10px] font-black tabular-nums font-mono w-9 text-right">{pct}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </CardContent>
            </Card>

            {/* AI Interaction Detail */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-purple-500" />
                    AI Interaction Detail
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Displaying recent organizational usage events.
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider gap-2 cursor-pointer">
                      <Download className="h-3 w-3" />
                      Export Audit Log
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => toast.success("Exported usage-report-demo-phys.csv")}
                      className="gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                      <span>Export as CSV (.csv)</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.success("Exported usage-report-demo-phys.json")}
                      className="gap-2 cursor-pointer"
                    >
                      <FileJson className="h-4 w-4 text-amber-500" />
                      <span>Export as JSON (.json)</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead className="text-[10px] uppercase font-bold text-muted-foreground">Type</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold text-muted-foreground">Tokens</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Cost</TableHead>
                      <TableHead className="text-right text-[10px] uppercase font-bold text-muted-foreground">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialUsageEvents.map((entry) => (
                      <TableRow key={entry.id} className="border-border/20">
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(entry.type)}
                            <span className="text-[10px] font-medium capitalize">{entry.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {((entry.inputTokens + entry.outputTokens) / 1000).toFixed(1)}k
                          </span>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ${(entry.costCents / 100).toFixed(4)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <span className="text-[10px] text-muted-foreground font-medium">{entry.timestamp}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Invite Colleague Dialog */}
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-border/60 rounded-3xl">
            <DialogHeader className="p-6 bg-secondary/30 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black tracking-tight">Invite Teachers to Department</DialogTitle>
                  <DialogDescription className="text-xs">
                    Collaborate with physics teachers across your school or district.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Department Invitation Link</Label>
                <div className="flex items-center gap-2 p-2.5 bg-secondary/30 border rounded-xl text-xs font-mono">
                  <span className="flex-1 truncate select-all">{inviteUrl}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 cursor-pointer" onClick={copyLink}>
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Department Identifier (ID)</Label>
                <div className="flex items-center gap-2 p-2.5 bg-secondary/30 border rounded-xl text-xs font-mono">
                  <span className="flex-1 truncate select-all">{orgId}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 cursor-pointer" onClick={copyId}>
                    {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-1.5">
                <p className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  What new members receive:
                </p>
                <ul className="text-[11px] text-blue-800 dark:text-blue-300 space-y-1 pl-4 list-disc">
                  <li>Instant access to all shared Waypoints & curriculum benchmarks</li>
                  <li>Pooled student AI tutoring and research notebook quotas</li>
                  <li>Unified learning analytics and diagnostic radar views</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Teacher Dialog */}
        <Dialog open={addTeacherOpen} onOpenChange={setAddTeacherOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Department Educator</DialogTitle>
              <DialogDescription>Enroll a physics colleague into {orgName}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="new-faculty-name">Educator Name</Label>
                <Input
                  id="new-faculty-name"
                  placeholder="e.g. Dr. Marcus Lin"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-faculty-email">School Email</Label>
                <Input
                  id="new-faculty-email"
                  type="email"
                  placeholder="mlin@example.com"
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="cursor-pointer"
                disabled={!newTeacherName.trim() || !newTeacherEmail.trim()}
                onClick={() => {
                  setMembers((prev) => [
                    ...prev,
                    {
                      uid: `t-${crypto.randomUUID().slice(0, 7)}`,
                      name: newTeacherName.trim(),
                      email: newTeacherEmail.trim(),
                    },
                  ]);
                  setNewTeacherName("");
                  setNewTeacherEmail("");
                  setAddTeacherOpen(false);
                  toast.success("Educator added to department network.");
                }}
              >
                Add Educator
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Limits Assistant Dialog */}
        <Dialog open={limitsOpen} onOpenChange={setLimitsOpen}>
          <DialogContent className="sm:max-w-[500px] h-[520px] flex flex-col p-0 gap-0 overflow-hidden border-border/60 rounded-3xl">
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
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl p-4 text-sm shadow-sm",
                      msg.role === "user"
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-tr-none"
                        : "bg-secondary text-foreground rounded-tl-none border border-border/50"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
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
                      if (!limitsInput.trim()) return;
                      const q = limitsInput.trim();
                      setLimitsInput("");
                      setLimitsMessages((prev) => [
                        ...prev,
                        { role: "user", content: q },
                        {
                          role: "assistant",
                          content: `For ${studentCount} active students across 3 physics sections, a $25.00/month cap with 30 Raise messages/student provides full weekly homework scaffolding with an ~80% safety buffer.`,
                        },
                      ]);
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-7 w-7 rounded-xl cursor-pointer"
                  aria-label="Send message to Raise"
                  disabled={!limitsInput.trim()}
                  onClick={() => {
                    const q = limitsInput.trim();
                    if (!q) return;
                    setLimitsInput("");
                    setLimitsMessages((prev) => [
                      ...prev,
                      { role: "user", content: q },
                      {
                        role: "assistant",
                        content: `For ${studentCount} active students across 3 physics sections, a $25.00/month cap with 30 Raise messages/student provides full weekly homework scaffolding with an ~80% safety buffer.`,
                      },
                    ]);
                  }}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. STUDENTS PAGE (Matches /teacher/students + NetworkStudents + Radar)
   ═══════════════════════════════════════════════════════════════════════════ */

const MASTERY_CONFIG: Record<string, { label: string; color: string; dot: string; bar: string }> = {
  Expert: {
    label: "Expert",
    color: "text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  Advanced: {
    label: "Advanced",
    color: "text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/30",
    dot: "bg-indigo-500",
    bar: "bg-indigo-500",
  },
  Intermediate: {
    label: "Intermediate",
    color: "text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30",
    dot: "bg-amber-500",
    bar: "bg-amber-400",
  },
  Beginner: {
    label: "Beginner",
    color: "text-zinc-500 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/30",
    dot: "bg-zinc-400",
    bar: "bg-zinc-400",
  },
};

const DIALOG_MASTERY_COLORS: Record<string, string> = {
  Expert: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  Advanced: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  Intermediate: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  Beginner: "bg-zinc-500/10 text-zinc-300 border-zinc-500/30",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CognitiveRadarChart({ strengths = [], weaknesses = [] }: { strengths?: string[]; weaknesses?: string[] }) {
  const allItems = [
    ...strengths.slice(0, 3).map((s, idx) => ({ label: s, score: [0.92, 0.86, 0.88][idx] ?? 0.85, type: "strength" as const })),
    ...weaknesses.slice(0, 3).map((w, idx) => ({ label: w, score: [0.38, 0.32, 0.42][idx] ?? 0.35, type: "weakness" as const })),
  ];

  if (allItems.length < 3) return null;

  const cx = 110;
  const cy = 110;
  const maxR = 80;
  const n = allItems.length;
  const angleStep = (2 * Math.PI) / n;

  function polarToXY(i: number, r: number) {
    const angle = i * angleStep - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const rings = [0.25, 0.5, 0.75, 1];
  const axes = allItems.map((item, i) => {
    const outer = polarToXY(i, maxR);
    const labelPos = polarToXY(i, maxR + 22);
    return { ...outer, label: item.label, lx: labelPos.x, ly: labelPos.y };
  });
  const dataPoints = allItems.map((item, i) => polarToXY(i, maxR * item.score));
  const polyPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
          Cognitive Radar
        </h4>
      </div>
      <div className="rounded-xl bg-secondary/20 border border-border/30 p-4 w-full flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 220 220" width="220" height="220" className="overflow-visible">
          {rings.map((r, ri) => {
            const pts = Array.from({ length: n }, (_, i) => {
              const p = polarToXY(i, maxR * r);
              return `${p.x},${p.y}`;
            }).join(" ");
            return (
              <polygon
                key={ri}
                points={pts}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeWidth="1"
                className="text-foreground"
              />
            );
          })}
          {axes.map((ax, i) => (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={ax.x}
              y2={ax.y}
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeWidth="1"
              className="text-foreground"
            />
          ))}
          <polygon points={polyPoints} fill="#6366f1" fillOpacity="0.18" stroke="#6366f1" strokeWidth="1.75" strokeOpacity="0.8" />
          {dataPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill={allItems[i].type === "strength" ? "#10b981" : "#f43f5e"}
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
          {axes.map((ax, i) => {
            const word = ax.label.split(" ")[0];
            const isLeft = ax.lx < cx - 10;
            const anchor = isLeft ? "end" : ax.lx > cx + 10 ? "start" : "middle";
            return (
              <text
                key={i}
                x={ax.lx}
                y={ax.ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize="8"
                fontWeight="600"
                fill="currentColor"
                fillOpacity="0.65"
                className="text-foreground font-sans"
              >
                {word}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          Strength
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          Focus Area
        </span>
      </div>
    </div>
  );
}

export function StudentsPage({
  courses,
  students,
  portfolios,
  initialTab = "roster",
  onAddStudent,
  onRemoveStudent,
  onManageClasses,
  onRefreshPortfolio,
}: {
  courses: PreviewCourse[];
  students: PreviewStudent[];
  portfolios: Record<string, StudentPortfolio>;
  initialTab?: "roster" | "insights";
  onAddStudent: (student: PreviewStudent) => void;
  onRemoveStudent: (id: string) => void;
  onManageClasses: () => void;
  onRefreshPortfolio: (studentId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [importOpen, setImportOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentCourse, setNewStudentCourse] = useState(courses[0]?.id ?? "mechanics");
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [dialogTab, setDialogTab] = useState<"insights" | "radar" | "card">("insights");
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const filteredRoster = students.filter((s) => selectedCourse === "all" || s.courseId === selectedCourse);

  // Insights stats
  const total = students.length;
  const assessed = students.filter((s) => portfolios[s.id]).length;
  const coveragePct = total > 0 ? Math.round((assessed / total) * 100) : 0;
  const dist = { Expert: 0, Advanced: 0, Intermediate: 0, Beginner: 0 };
  students.forEach((s) => {
    const level = portfolios[s.id]?.masteryLevel as keyof typeof dist | undefined;
    if (level && level in dist) dist[level]++;
  });
  const R = 28;
  const C = 2 * Math.PI * R;
  const filled = C * (coveragePct / 100);

  return (
    <div className="space-y-6">
      <TeacherPageHeader title="Students" description="Manage enrollments and explore how students use Raise.">
        <Button variant="outline" onClick={onManageClasses} className="cursor-pointer">
          Manage Classes <ArrowUpRight />
        </Button>
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Upload /> Import Roster
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enroll Student in Roster</DialogTitle>
              <DialogDescription>Add a student directly to one of your physics classes.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="import-student-name">Student Name</Label>
                <Input
                  id="import-student-name"
                  placeholder="e.g. Elena Rostova"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="import-student-email">Student Email</Label>
                <Input
                  id="import-student-email"
                  type="email"
                  placeholder="erostova@example.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="import-student-course">Class</Label>
                <Select value={newStudentCourse} onValueChange={setNewStudentCourse}>
                  <SelectTrigger id="import-student-course">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="cursor-pointer"
                disabled={!newStudentName.trim() || !newStudentEmail.trim()}
                onClick={() => {
                  onAddStudent({
                    id: crypto.randomUUID(),
                    name: newStudentName.trim(),
                    email: newStudentEmail.trim(),
                    courseId: newStudentCourse,
                    createdAt: new Date().toISOString().split("T")[0],
                  });
                  setNewStudentName("");
                  setNewStudentEmail("");
                  setImportOpen(false);
                  toast.success("Student enrolled in class roster.");
                }}
              >
                Enroll Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TeacherPageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 gap-4">
        <TabsList className="h-auto max-w-full flex-wrap">
          <TabsTrigger value="roster" className="min-h-8 cursor-pointer">
            Roster
          </TabsTrigger>
          <TabsTrigger value="insights" className="min-h-8 cursor-pointer">
            Learning insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <Card className="min-w-0 gap-0 py-0">
            <CardHeader className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold">Class roster</h2>
                <span className="text-sm text-muted-foreground">{filteredRoster.length} enrolled</span>
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger aria-label="Filter by class" className="w-full sm:w-56 cursor-pointer">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="border-t p-0">
              <Table aria-label="Class roster">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="pl-4 sm:pl-5">Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoster.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="max-w-64 whitespace-normal py-3 pl-4 sm:pl-5">
                        <p className="break-words font-medium">{student.name}</p>
                        <p className="break-all text-xs text-muted-foreground">{student.email}</p>
                      </TableCell>
                      <TableCell className="max-w-56 whitespace-normal break-words text-muted-foreground">
                        {courseName(courses, student.courseId)}
                      </TableCell>
                      <TableCell className="pr-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="cursor-pointer" aria-label={`Actions for ${student.name}`}>
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setActiveTab("insights")} className="cursor-pointer">
                              <Sparkles /> View AI portfolio
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setStudentToDelete(student.id)}
                              className="cursor-pointer"
                            >
                              <Trash2 /> Remove student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-5">
          {/* Network Figure Banner */}
          <Card className="border-border/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-purple-500/[0.04] pointer-events-none" />
            <CardContent className="p-5 relative">
              <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                <div className="flex items-center gap-5 shrink-0">
                  <div className="relative shrink-0">
                    <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
                      <circle cx="38" cy="38" r={R} fill="none" strokeWidth="5" className="stroke-border/30" />
                      <circle
                        cx="38"
                        cy="38"
                        r={R}
                        fill="none"
                        strokeWidth="5"
                        stroke="#6366f1"
                        strokeLinecap="round"
                        strokeDasharray={`${filled} ${C}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-black tracking-tighter leading-none">{coveragePct}%</span>
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">AI</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
                        <Network className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-base font-black tracking-tighter">Network Overview</h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug max-w-[200px]">
                      AI portfolio coverage across your educator network
                    </p>
                  </div>
                </div>

                <div className="hidden lg:block w-px self-stretch bg-border/30" />

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-secondary/40 border-border/40">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-black leading-none">{total}</div>
                      <div className="text-[9px] uppercase tracking-wider mt-0.5 text-muted-foreground">Students</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200/40 dark:border-indigo-800/40">
                    <Zap className="h-3.5 w-3.5 text-indigo-500" />
                    <div>
                      <div className="text-sm font-black leading-none text-indigo-700 dark:text-indigo-300">{assessed}</div>
                      <div className="text-[9px] uppercase tracking-wider mt-0.5 text-indigo-600/60 dark:text-indigo-400/60">Profiled</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-secondary/40 border-border/40">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <div>
                      <div className="text-sm font-black leading-none">{dist.Expert + dist.Advanced}</div>
                      <div className="text-[9px] uppercase tracking-wider mt-0.5 text-muted-foreground">High Mastery</div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block w-px self-stretch bg-border/30" />

                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    Mastery Distribution
                  </p>
                  {(Object.entries(dist) as [string, number][]).map(([level, count]) => {
                    const cfg = MASTERY_CONFIG[level];
                    const pct = assessed > 0 ? Math.round((count / assessed) * 100) : 0;
                    return (
                      <div key={level} className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-muted-foreground w-20 shrink-0">{level}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-border/30 overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-700", cfg.bar)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-bold w-5 text-right text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profiled Student Cards Grid */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Profiled</p>
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-[10px] text-muted-foreground">{students.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {students.map((student) => {
                const portfolio = portfolios[student.id];
                const cfg = MASTERY_CONFIG[portfolio?.masteryLevel ?? "Beginner"] ?? MASTERY_CONFIG.Beginner;

                return (
                  <Card
                    key={student.id}
                    className="group relative overflow-hidden border border-indigo-200/40 dark:border-indigo-800/30 hover:border-indigo-300/60 dark:hover:border-indigo-700/50 transition-all duration-200"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />
                    <CardContent className="p-4 relative">
                      <div className="flex items-start gap-3">
                        <div className="relative rounded-full w-11 h-11 text-[13px] flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/60 dark:to-purple-950/60 ring-2 ring-offset-2 ring-offset-background ring-indigo-300/50 dark:ring-indigo-700/50">
                          <span className="font-black tracking-tighter text-indigo-700 dark:text-indigo-300">
                            {getInitials(student.name)}
                          </span>
                          <span className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background", cfg.dot)} />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold truncate">{student.name}</p>
                            <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border", cfg.color)}>
                              {cfg.label}
                            </Badge>
                          </div>
                          <p className="text-[10px] font-mono text-muted-foreground truncate">{student.email}</p>
                          <div className="flex items-center gap-1 pt-0.5">
                            <Clock className="h-2.5 w-2.5 text-muted-foreground/50" />
                            <span className="text-[9px] text-muted-foreground/60 font-mono">
                              {courseName(courses, student.courseId)}
                            </span>
                          </div>
                        </div>

                        <Dialog onOpenChange={(open) => open && setDialogTab("insights")}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 gap-1.5 text-xs font-semibold shrink-0 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3" />
                              View
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent showCloseButton={false} className="sm:max-w-[720px] p-0 overflow-hidden border-border/50 outline-none gap-0">
                            {/* Dark Indigo Gradient Header (Matches public/radar-portfolio.png) */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/90 via-zinc-900 to-purple-950/70 px-6 pt-5 pb-5 border-b border-white/[0.06]">
                              <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                              <div className="relative z-10 flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm shrink-0">
                                    <span className="text-sm font-black text-white/90 tracking-tighter">{getInitials(student.name)}</span>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[9px] font-black uppercase tracking-[0.2em] rounded-full border px-2.5 py-0.5",
                                      DIALOG_MASTERY_COLORS[portfolio?.masteryLevel ?? "Beginner"]
                                    )}
                                  >
                                    {portfolio?.masteryLevel ?? "Beginner"} Mastery
                                  </Badge>
                                </div>
                                <DialogClose asChild>
                                  <button
                                    type="button"
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-white/60 hover:text-white/90 cursor-pointer"
                                  >
                                    ✕
                                    <span className="sr-only">Close</span>
                                  </button>
                                </DialogClose>
                              </div>

                              <div className="relative z-10 space-y-0.5">
                                <DialogTitle className="text-[22px] font-black tracking-tighter text-white leading-none">
                                  {student.name}&apos;s AI Profile
                                </DialogTitle>
                                <DialogDescription className="text-white/45 text-xs font-medium mt-1">
                                  Network-wide learning activity · Derived from Raise sessions
                                </DialogDescription>
                              </div>

                              <div className="relative z-10 flex items-center gap-1 mt-4">
                                {(["insights", "radar", "card"] as const).map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setDialogTab(t)}
                                    className={cn(
                                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all cursor-pointer",
                                      dialogTab === t
                                        ? "bg-white/15 text-white border border-white/15"
                                        : "text-white/40 hover:text-white/70 hover:bg-white/8"
                                    )}
                                  >
                                    {t === "insights" ? "Insights" : t === "radar" ? "Radar" : "Profile Card"}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Body */}
                            <div className="bg-background max-h-[55vh] overflow-y-auto px-6 py-5">
                              {dialogTab === "insights" && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="rounded-xl border p-4 space-y-3 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/30 dark:border-emerald-800/20">
                                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                                        <Lightbulb className="h-3.5 w-3.5" />
                                        Demonstrated Strengths
                                      </div>
                                      <ul className="space-y-2">
                                        {(portfolio?.strengths ?? []).map((item, i) => (
                                          <li key={i} className="flex items-start gap-2 text-[12px]">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                            <span>{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div className="rounded-xl border p-4 space-y-3 bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/30 dark:border-rose-800/20">
                                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        Focus Areas
                                      </div>
                                      <ul className="space-y-2">
                                        {(portfolio?.weaknesses ?? []).map((item, i) => (
                                          <li key={i} className="flex items-start gap-2 text-[12px]">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                            <span>{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-4 border-t border-border/40">
                                    <div className="flex items-center gap-2">
                                      <BrainCircuit className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                                        Cognitive Trajectory
                                      </h4>
                                    </div>
                                    <div className="rounded-xl bg-secondary/30 border border-border/40 px-4 py-3">
                                      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-serif">
                                        {portfolio?.aiSummary}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {dialogTab === "radar" && (
                                <CognitiveRadarChart
                                  strengths={portfolio?.strengths}
                                  weaknesses={portfolio?.weaknesses}
                                />
                              )}

                              {dialogTab === "card" && (
                                <div className="space-y-4">
                                  <div className="relative rounded-2xl overflow-hidden border border-indigo-200/30 dark:border-indigo-800/20 bg-gradient-to-br from-indigo-950/90 via-zinc-900 to-purple-950/80 p-5 space-y-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-base font-black text-white/90">
                                          {getInitials(student.name)}
                                        </div>
                                        <div>
                                          <p className="text-[17px] font-black tracking-tighter text-white leading-none">{student.name}</p>
                                          <p className="text-[10px] font-mono text-white/40 mt-0.5">{student.email}</p>
                                        </div>
                                      </div>
                                      <div
                                        className={cn(
                                          "text-[9px] font-black uppercase tracking-[0.2em] rounded-full border px-2.5 py-1",
                                          DIALOG_MASTERY_COLORS[portfolio?.masteryLevel ?? "Beginner"]
                                        )}
                                      >
                                        {portfolio?.masteryLevel ?? "Beginner"} Mastery
                                      </div>
                                    </div>
                                    <p className="text-xs text-white/75 leading-relaxed">{portfolio?.aiSummary}</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-8 gap-2 text-xs font-semibold cursor-pointer"
                                    onClick={() => toast.success("Profile copied to clipboard")}
                                  >
                                    <Share2 className="h-3.5 w-3.5" />
                                    Copy Profile to Clipboard
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between gap-3 px-6 py-3.5 border-t border-border/40 bg-secondary/20">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-muted-foreground/50" />
                                <span className="text-[10px] text-muted-foreground font-mono">Synced Nov 8, 2:22 PM</span>
                              </div>
                              <Button
                                size="sm"
                                disabled={refreshingId === student.id}
                                className="cursor-pointer h-8 px-5 gap-2 text-xs font-bold rounded-lg bg-secondary border border-border/60 text-foreground hover:bg-secondary/80"
                                onClick={() => {
                                  setRefreshingId(student.id);
                                  setTimeout(() => {
                                    onRefreshPortfolio(student.id);
                                    setRefreshingId(null);
                                    toast.success("AI Portfolio synthesis refreshed.");
                                  }, 400);
                                }}
                              >
                                {refreshingId === student.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3.5 w-3.5" />
                                )}
                                Refresh Synthesis
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {portfolio?.strengths && portfolio.strengths.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <div className="flex flex-wrap gap-1.5">
                            {portfolio.strengths.slice(0, 3).map((s, i) => (
                              <span
                                key={i}
                                className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/30 max-w-[200px] truncate"
                              >
                                {s}
                              </span>
                            ))}
                            {portfolio.strengths.length > 3 && (
                              <span className="text-[9px] text-muted-foreground px-1">+{portfolio.strengths.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!studentToDelete}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
        title="Remove Student"
        description="Are you sure you want to remove this student from your class roster?"
        onConfirm={() => {
          if (studentToDelete) {
            onRemoveStudent(studentToDelete);
            setStudentToDelete(null);
            toast.success("Student records removed.");
          }
        }}
        confirmText="Remove"
        variant="destructive"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. WAYPOINTS PAGE (Matches /teacher/waypoints + public/waypoints.png)
   ═══════════════════════════════════════════════════════════════════════════ */

export function WaypointsPage({ onFork }: { onFork: (waypoint: WaypointTemplate) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("global");
  const [topicFilter, setTopicFilter] = useState("all");

  const filteredWaypoints = initialWaypoints.filter((wp) => {
    const matchesScope = wp.visibility === activeTab;
    const matchesTopic = topicFilter === "all" || wp.topic === topicFilter;
    const matchesSearch =
      wp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesScope && matchesTopic && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-5 md:p-6 shadow-sm">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-32 w-32 rounded-full bg-gray-500/5 blur-[40px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/20 uppercase tracking-widest">
              <Sparkles className="h-3 w-3" />
              Template library
            </div>
            <h1 id="dashboard-preview-heading" tabIndex={-1} className="text-3xl font-semibold tracking-tight text-foreground">
              Waypoints
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Find a shared assignment and copy it into your class.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400/80 bg-emerald-500/10 dark:bg-emerald-500/5 w-fit px-2 py-0.5 rounded-md border border-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse" />
              Department access · demo-phys-8492a
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="h-24 w-24 rounded-full border-2 border-dashed border-border flex items-center justify-center relative bg-background/50 backdrop-blur-sm">
              <Waypoints className="h-10 w-10 text-muted-foreground" />
              <div className="absolute inset-0 border-t-2 border-primary/40 rounded-full animate-spin [animation-duration:10s]" />
              <div className="absolute inset-4 border-b-2 border-primary/20 rounded-full animate-spin [animation-duration:15s]" />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <div className="relative w-full lg:min-w-48 lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Search templates"
            placeholder="Search templates…"
            className="pl-11 h-12 bg-background dark:bg-background border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="h-auto w-full">
            <TabsTrigger value="global" className="min-h-9 gap-2 px-3 cursor-pointer">
              <Globe className="h-4 w-4" />
              Global
            </TabsTrigger>
            <TabsTrigger value="network" className="min-h-9 gap-2 px-3 cursor-pointer">
              <Users className="h-4 w-4" />
              Department
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger aria-label="Topic" className="cursor-pointer w-full sm:w-44 data-[size=default]:h-12 bg-background dark:bg-background border-border">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="All Topics" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            <SelectItem value="kinematics">Kinematics</SelectItem>
            <SelectItem value="dynamics">Dynamics</SelectItem>
            <SelectItem value="rotation">Rotational Physics</SelectItem>
            <SelectItem value="thermodynamics">Thermodynamics</SelectItem>
            <SelectItem value="waves">Waves & Optics</SelectItem>
            <SelectItem value="fluids">Fluid Mechanics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Waypoints Grid */}
      {filteredWaypoints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-3xl bg-muted/30">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-border">
            <MapPinned className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">No templates found</h3>
          <p className="text-sm text-muted-foreground max-w-sm px-4">Try another search or topic filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWaypoints.map((waypoint) => (
            <Card
              key={waypoint.id}
              className="group relative h-full flex flex-col overflow-hidden bg-card border border-border hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-bl-full blur-2xl group-hover:bg-primary/10 transition-colors" />

              <CardHeader className="pb-4 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {waypoint.componentCount} Components
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border-primary/20 capitalize font-mono text-[10px]">
                      {waypoint.topic}
                    </Badge>
                  </div>
                  {waypoint.visibility === "global" ? (
                    <div title="Publicly Available" className="p-1.5 bg-blue-500/10 rounded-lg">
                      <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  ) : (
                    <div title="Department Shared" className="p-1.5 bg-orange-500/10 rounded-lg">
                      <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {waypoint.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground line-clamp-3 min-h-[4.5rem] mt-2 leading-relaxed">
                  {waypoint.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 flex-grow relative z-10">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-2 rounded-xl">
                  <span className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-primary" />
                    {waypoint.forkCount} Active Forks
                  </span>
                  <span>{waypoint.version}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-2 pb-6 px-6 relative z-10 mt-auto">
                <Button
                  onClick={() => {
                    toast.success(`Loaded "${waypoint.title}" into Assignment Builder.`);
                    onFork(waypoint);
                  }}
                  className="w-full h-11 font-bold active:scale-[0.98] cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  Acquire Template
                  <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. VAULT CONTROLS PAGE (Matches /teacher/vault + public/vault-controls.png)
   ═══════════════════════════════════════════════════════════════════════════ */

export function VaultPage({
  courses,
  onUpdateCourseVault,
}: {
  courses: PreviewCourse[];
  onUpdateCourseVault: (courseId: string, restrictedIds: string[], customFormulas: PreviewFormula[]) => void;
}) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? "mechanics");
  const currentCourse = courses.find((c) => c.id === selectedCourseId) ?? courses[0];

  const [restrictedIds, setRestrictedIds] = useState<string[]>(currentCourse?.restrictedFormulaIds ?? []);
  const [customFormulas, setCustomFormulas] = useState<PreviewFormula[]>(currentCourse?.customFormulas ?? []);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isAddingFormula, setIsAddingFormula] = useState(false);
  const [newFormula, setNewFormula] = useState({ name: "", latex: "", category: "custom" });

  const hasUnsavedChanges =
    JSON.stringify([...restrictedIds].sort()) !== JSON.stringify([...(currentCourse?.restrictedFormulaIds ?? [])].sort()) ||
    JSON.stringify(customFormulas) !== JSON.stringify(currentCourse?.customFormulas ?? []);

  const handleSelectCourse = (nextId: string) => {
    setSelectedCourseId(nextId);
    const nextCourse = courses.find((c) => c.id === nextId);
    setRestrictedIds(nextCourse?.restrictedFormulaIds ?? []);
    setCustomFormulas(nextCourse?.customFormulas ?? []);
  };

  const toggleFormula = (id: string) => {
    setRestrictedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const allFormulas = [...DEFAULT_VAULT_FORMULAS, ...customFormulas];
  const filteredFormulas = allFormulas.filter((formula) => {
    const matchesSearch =
      formula.name.toLowerCase().includes(search.toLowerCase()) ||
      formula.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || formula.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <TeacherPageHeader title="Vault Controls" description="Choose which formulas students can use in each class.">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline" className="cursor-pointer">
                <HelpCircle /> Guide
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-72" side="bottom">
              Choose a class, click any equation card to lock or unlock it for students, then save your changes.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Dialog open={isAddingFormula} onOpenChange={setIsAddingFormula}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus />
              Add Formula
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Add Custom Equation</DialogTitle>
              <DialogDescription className="font-medium">
                Create a new formula to appear in this class&apos;s vault.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="vault-formula-name" className="font-bold ml-1">
                  Equation Name
                </Label>
                <Input
                  id="vault-formula-name"
                  placeholder="e.g. Angular Impulse"
                  className="h-11 rounded-xl"
                  value={newFormula.name}
                  onChange={(e) => setNewFormula({ ...newFormula, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vault-formula-latex" className="font-bold ml-1">
                  LaTeX Expression
                </Label>
                <Textarea
                  id="vault-formula-latex"
                  placeholder="e.g. \Delta L = \tau_{net} \Delta t"
                  className="font-mono rounded-xl min-h-[90px]"
                  value={newFormula.latex}
                  onChange={(e) => setNewFormula({ ...newFormula, latex: e.target.value })}
                />
                <div className="bg-muted/40 border border-border p-5 rounded-2xl flex items-center justify-center min-h-[80px] shadow-inner">
                  {newFormula.latex ? (
                    <BlockMath math={newFormula.latex} />
                  ) : (
                    <span className="text-muted-foreground text-sm italic">Live preview</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vault-formula-category" className="font-bold ml-1">
                  Category
                </Label>
                <Select value={newFormula.category} onValueChange={(v) => setNewFormula({ ...newFormula, category: v })}>
                  <SelectTrigger id="vault-formula-category" className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {VAULT_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-lg">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                className="w-full h-12 rounded-xl font-bold cursor-pointer"
                onClick={() => {
                  if (!newFormula.name.trim() || !newFormula.latex.trim()) {
                    toast.error("Name and LaTeX formula are required");
                    return;
                  }
                  const created: PreviewFormula = {
                    id: `custom-${Date.now()}`,
                    name: newFormula.name.trim(),
                    latex: newFormula.latex.trim(),
                    category: newFormula.category,
                    isCustom: true,
                  };
                  const nextCustom = [...customFormulas, created];
                  setCustomFormulas(nextCustom);
                  onUpdateCourseVault(selectedCourseId, restrictedIds, nextCustom);
                  setIsAddingFormula(false);
                  setNewFormula({ name: "", latex: "", category: "custom" });
                  toast.success("Custom formula added to class vault!");
                }}
              >
                Add to Vault
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TeacherPageHeader>

      {/* Filter Bar (Matches public/vault-controls.png) */}
      <div className="bg-muted/50 p-2 rounded-[2rem] border border-border flex flex-col lg:flex-row items-center gap-2">
        <div className="w-full lg:w-72">
          <Select value={selectedCourseId} onValueChange={handleSelectCourse}>
            <SelectTrigger aria-label="Class" className="w-full data-[size=default]:h-12 rounded-2xl border-border bg-background dark:bg-background shadow-sm font-bold px-4 cursor-pointer">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Select Class" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id} className="rounded-xl cursor-pointer py-3">
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Search formulas"
            placeholder="Search formulas…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-2xl border-border bg-background dark:bg-background shadow-sm"
          />
        </div>

        <div className="w-full lg:w-64">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger aria-label="Formula category" className="w-full data-[size=default]:h-12 rounded-2xl border-border bg-background dark:bg-background shadow-sm font-bold px-4 cursor-pointer">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Filter Category" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {VAULT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="rounded-xl cursor-pointer py-3">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 shadow-sm sm:px-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-foreground">
              Unsaved formula visibility changes for {currentCourse?.name}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRestrictedIds(currentCourse?.restrictedFormulaIds ?? []);
                setCustomFormulas(currentCourse?.customFormulas ?? []);
                toast.info("Changes discarded");
              }}
              className="text-muted-foreground hover:text-destructive font-bold rounded-xl h-9 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Discard
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onUpdateCourseVault(selectedCourseId, restrictedIds, customFormulas);
                toast.success(`Vault settings saved for ${currentCourse?.name}!`);
              }}
              className="h-9 cursor-pointer"
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Formula Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFormulas.map((formula) => {
          const isRestricted = restrictedIds.includes(formula.id);
          const isCustom = formula.isCustom;
          return (
            <Card
              key={formula.id}
              onClick={() => toggleFormula(formula.id)}
              className={cn(
                "group transition-all duration-300 border-none cursor-pointer rounded-3xl overflow-hidden shadow-md",
                isRestricted
                  ? "bg-red-50 dark:bg-red-950/20 ring-1 ring-red-200 dark:ring-red-900/50"
                  : isCustom
                  ? "bg-primary/5 ring-1 ring-primary/20"
                  : "bg-muted/40 hover:ring-2 hover:ring-primary/50"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-black truncate">{formula.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md">
                        {formula.category}
                      </Badge>
                      {isCustom && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md">
                          Custom
                        </Badge>
                      )}
                      {isRestricted && (
                        <Badge variant="destructive" className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md">
                          Hidden
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {isCustom && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                        aria-label={`Delete ${formula.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomFormulas((prev) => prev.filter((f) => f.id !== formula.id));
                          setRestrictedIds((prev) => prev.filter((id) => id !== formula.id));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Visible to students: ${formula.name}`}
                      aria-pressed={!isRestricted}
                      title={isRestricted ? "Show formula" : "Hide formula"}
                      className={cn("cursor-pointer", isRestricted ? "text-destructive" : "text-primary")}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFormula(formula.id);
                      }}
                    >
                      {isRestricted ? <Lock /> : <Unlock />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="bg-background rounded-2xl p-6 text-center shadow-sm flex flex-col items-center justify-center min-h-[100px] overflow-x-auto">
                  <BlockMath math={formula.latex} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFormulas.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted/50">
          <PackageOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-lg font-bold text-muted-foreground">No formulas match your search.</p>
        </div>
      )}
    </div>
  );
}
