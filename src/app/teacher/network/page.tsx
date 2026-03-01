"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import framer from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building2, 
  Users, 
  ShieldAlert, 
  Zap, 
  Info, 
  ArrowRight, 
  PlusCircle, 
  UserPlus, 
  Link as LinkIcon, 
  Copy, 
  LogOut, 
  ChevronRight, 
  Loader2, 
  ClipboardCheck, 
  TrendingUp,
  Sparkles,
  School,
  BowArrow,
  NotebookPen,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  TrendingDown,
  ChevronLeft,
  Search,
  History,
  Trophy,
  MoreHorizontal,
  Crown,
  UserMinus,
  Lock,
  CreditCard,
  Notebook,
  HelpCircle
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Organization, UserProfile } from "@/lib/types";
import { UsageAnalytics } from "@/components/admin/usage-analytics";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function NetworkPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [networkMembers, setNetworkMembers] = useState<any[]>([]);
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [joiningOrgId, setJoiningOrgId] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [updatingBudget, setUpdatingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState<string>("");
  const [updatingPractice, setUpdatingPractice] = useState(false);
  const [tempPracticeLimit, setTempPracticeLimit] = useState<string>("");
  const [tempPracticeLimitPerStudent, setTempPracticeLimitPerStudent] = useState<string>("");
  const [updatingNotebook, setUpdatingNotebook] = useState(false);
  const [tempNotebookLimitPerStudent, setTempNotebookLimitPerStudent] = useState<string>("");
  const [tempAiNotebookLimitPerStudent, setTempAiNotebookLimitPerStudent] = useState<string>("");
  const [studentCount, setStudentCount] = useState<number>(0);

  useEffect(() => {
    if (organization?.aiBudgetLimit !== undefined) {
      setTempBudget((organization.aiBudgetLimit / 100).toFixed(4));
    } else {
      setTempBudget("10.0000");
    }

    if (organization?.practiceLimitPerStudent !== undefined) {
      setTempPracticeLimitPerStudent(organization.practiceLimitPerStudent.toString());
    } else {
      setTempPracticeLimitPerStudent("0");
    }

    if (organization?.notebookLimitPerStudent !== undefined) {
      setTempNotebookLimitPerStudent(organization.notebookLimitPerStudent.toString());
    } else {
      setTempNotebookLimitPerStudent("0");
    }

    if (organization?.aiNotebookLimitPerStudent !== undefined) {
      setTempAiNotebookLimitPerStudent(organization.aiNotebookLimitPerStudent.toString());
    } else {
      setTempAiNotebookLimitPerStudent("50");
    }
  }, [organization]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription updated! Accessing Pro features...");
      // Remove query param
      router.replace("/teacher/network");
    }
  }, [searchParams, router]);

  const handleUpdatePracticeLimit = async () => {
    if (!user || !organization || user.uid !== organization.ownerId) return;
    
    const perMember = parseInt(tempPracticeLimitPerStudent);
    if (isNaN(perMember) || perMember < 0) {
      toast.error("Please enter a valid allowance.");
      return;
    }

    // Practice limit is strictly for students
    const totalLimit = perMember * studentCount;

    setUpdatingPractice(true);
    try {
      await updateDoc(doc(db, "organizations", organization.id), {
        practiceLimitPerStudent: perMember,
        practiceLimit: totalLimit
      });
      toast.success(`Practice Limit updated to ${totalLimit} total student units!`);
      setOrganization(prev => prev ? { 
        ...prev, 
        practiceLimitPerStudent: perMember,
        practiceLimit: totalLimit 
      } : null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update practice limit.");
    } finally {
      setUpdatingPractice(false);
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
      // Store in cents for precision
      const budgetInCents = Math.round(budget * 100);
      await updateDoc(doc(db, "organizations", organization.id), {
        aiBudgetLimit: budgetInCents
      });
      toast.success(`Monthly AI Budget updated to $${budget.toFixed(4)}`);
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

  const handleUpgrade = async (planId: string) => {
    if (!user || !organization) return;
    
    setUpgrading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          organizationId: organization.id,
          planId: planId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to start checkout.");
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to start upgrade process.");
    } finally {
      setUpgrading(false);
    }
  };

  const copyInviteLink = () => {
    if (!organization?.id) return;
    const url = `${window.location.protocol}//${window.location.host}/join/${organization.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Invitation link copied!");
  };

  const transferOwnership = async (newOwnerId: string, newOwnerName: string) => {
    if (!user || !organization || user.uid !== organization.ownerId) return;
    if (!confirm(`Are you sure you want to transfer ownership to ${newOwnerName}? You will lose administrative control.`)) return;

    try {
      await updateDoc(doc(db, "organizations", organization.id), {
        ownerId: newOwnerId
      });
      toast.success(`Ownership transferred to ${newOwnerName}`);
      window.location.reload();
    } catch (e) {
      console.error(e);
      toast.error("Failed to transfer ownership.");
    }
  };

  const kickMember = async (memberId: string, name: string) => {
    if (!user || !organization || user.uid !== organization.ownerId) return;
    if (memberId === user.uid) return;
    if (!confirm(`Are you sure you want to remove ${name} from the network?`)) return;

    try {
      await updateDoc(doc(db, "users", memberId), {
        organizationId: null
      });
      toast.success(`${name} has been removed.`);
      setNetworkMembers(prev => prev.filter(m => m.uid !== memberId));
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove member.");
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
      // 1. Fetch organization details
      const orgRef = doc(db, "organizations", profile.organizationId);
      const orgSnap = await getDoc(orgRef);
      if (orgSnap.exists()) {
        setOrganization({ id: orgSnap.id, ...orgSnap.data() } as Organization);
      }

      // 2. Fetch network members (teachers only for primary pool)
      const membersSnap = await getDocs(query(
        collection(db, "users"), 
        where("organizationId", "==", profile.organizationId),
        where("role", "==", "teacher")
      ));
      const members = membersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
      setNetworkMembers(members);

      // 3. Count students across all network teachers
      const teacherIds = members.map(m => m.uid);
      if (teacherIds.length > 0) {
          // Robust query: Look in users collection for anyone with role student and pointing to a teacher in this network
          const studentsSnap = await getDocs(query(
            collection(db, "users"), 
            where("teacherId", "in", teacherIds), 
            where("role", "==", "student")
          ));
          setStudentCount(studentsSnap.size);
          console.log(`Found ${studentsSnap.size} network students for teachers: ${teacherIds.join(', ')}`);
      } else {
          setStudentCount(0);
      }
    } catch (e) {
      console.error("Error fetching network info:", e);
    } finally {
      setLoading(false);
    }
  }

  async function createOrganization() {
    if (!user || !newOrgName) return;
    try {
      const orgRef = doc(collection(db, "organizations"));
      const newOrg: Organization = {
        id: orgRef.id,
        name: newOrgName,
        ownerId: user.uid,
        ownerEmail: user.email || "", // Add for Polar sessions
        subscriptionStatus: "none",
        planId: "free",
        aiUsageCurrent: 0,
        aiBudgetLimit: 50, // Individual/Free $0.50 starting credit
        practiceLimitPerStudent: 10, // BowArrow allowance per student
        practiceLimit: 0, // No students added yet
        practiceUsageCurrent: 0,
        baseMonthlyFee: 0,
        createdAt: new Date(),
      };
      
      await setDoc(orgRef, newOrg);
      
      // Update teacher profile in the unified collection (Phase 2.1)
      await setDoc(doc(db, "users", user.uid), {
        organizationId: orgRef.id,
        role: "teacher", // Ensure role is set during migration
        email: user.email,
        displayName: user.displayName || "Unknown Teacher",
        lastLoginAt: new Date()
      }, { merge: true });

      // Refresh page state (assuming AuthProvider triggers or we manual update)
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  }

  async function joinOrganization() {
    const cleanId = joiningOrgId.trim();
    if (!user || !cleanId) return;
    try {
      // 1. Verify org exists and check capacity
      const orgRef = doc(db, "organizations", cleanId);
      const orgSnap = await getDoc(orgRef);
      
      if (!orgSnap.exists()) {
        toast.error("Network not found. Please check the ID.");
        return;
      }

      const orgData = orgSnap.data();
      const membersSnap = await getDocs(query(collection(db, "users"), where("organizationId", "==", cleanId)));
      
      if (membersSnap.size >= 10) {
        toast.error("This network has reached its 10-practitioner limit.");
        return;
      }

      // 2. Join the network
      await setDoc(doc(db, "users", user.uid), {
        organizationId: cleanId,
        role: "teacher",
        email: user.email,
        displayName: user.displayName || "Unknown Teacher",
        lastLoginAt: new Date()
      }, { merge: true });

      toast.success(`Joined ${orgData.name}! Connect with your students to sync your local collective.`);
      window.location.reload();
    } catch (e) {
      console.error(e);
      toast.error("Failed to join network. You may already be in one or have insufficient permissions.");
    }
  }

  async function leaveNetwork() {
    if (!user || !profile?.organizationId || !organization) return;
    if (!confirm("Are you sure you want to leave this network?")) return;
    
    setLoading(true);
    try {
      const orgId = profile.organizationId;
      
      // 1. Check if I'm the last member
      const membersSnap = await getDocs(query(collection(db, "users"), where("organizationId", "==", orgId)));
      const isLastMember = membersSnap.size <= 1;

      // 2. Remove org link from user profile
      await setDoc(doc(db, "users", user.uid), {
        organizationId: null
      }, { merge: true });

      // 3. If I was the last member, delete the organization doc
      if (isLastMember) {
        await deleteDoc(doc(db, "organizations", orgId));
        console.log("Last member left. Organization deleted.");
      }

      window.location.reload();
    } catch (e) {
      console.error("Error leaving network:", e);
      toast.error("Failed to leave network accurately.");
    } finally {
      setLoading(false);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-muted-foreground font-medium animate-pulse text-lg">
          Syncing with Physics Network...
        </p>
      </div>
    );
  }

  const isFreePlan = organization?.planId === "free";

  return (
    <TooltipProvider>
      <div className="container p-6 mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              Scorpio Network
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-5 w-5 text-muted-foreground/50 cursor-help hover:text-primary transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[340px] p-0 overflow-hidden border-primary/20 shadow-2xl rounded-2xl">
                  <div className="bg-primary p-5 text-primary-foreground">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5" />
                      <p className="font-black text-[10px] uppercase tracking-[0.2em]">Network Command</p>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90 font-medium font-sans">
                      Think of your Network as a physical Department. It synchronizes curriculum and pools AI resources for all associated teachers and students.
                    </p>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-4 bg-white dark:bg-zinc-950">
                    <div className="space-y-1.5">
                      <p className="font-bold text-[10px] uppercase text-primary font-mono tracking-tighter">Budgeting</p>
                      <p className="text-[10px] leading-tight text-muted-foreground font-medium">
                        Manage a shared safety cap for AI costs across your entire department.
                      </p>
                    </div>
                    <div className="space-y-1.5 border-l border-zinc-100 dark:border-zinc-800 pl-4">
                      <p className="font-bold text-[10px] uppercase text-primary font-mono tracking-tighter">Waypoints</p>
                      <p className="text-[10px] leading-tight text-muted-foreground font-medium">
                        Upload assignments once; every teacher in the network can use them.
                      </p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-zinc-50 dark:border-zinc-900">
                       <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center opacity-40">Connected Collective</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg font-medium">
              Coordinate with your department, share curriculum resources, and build your local Scorpio Collective.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Status</span>
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 All Systems Normal
              </span>
            </div>
          </div>
        </div>

        {!profile?.organizationId ? (
          <div className="max-w-4xl mx-auto py-12">
            <div className="text-center mb-10 space-y-2">
              <h2 className="text-2xl font-bold">Get Started</h2>
              <p className="text-muted-foreground">Choose how you want to connect with your colleagues.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
              <Card className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/5">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                   <Building2 className="h-24 w-24" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <PlusCircle className="h-6 w-6 text-primary" />
                    Start a New Network
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Perfect for Department Leads. Create a private workspace for your team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <Label htmlFor="org-name" className="text-xs font-bold uppercase text-muted-foreground">Network/Department Name</Label>
                    <Input 
                      id="org-name" 
                      placeholder="e.g. Scarsdale High Physics" 
                      value={newOrgName} 
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="h-12 border-muted-foreground/20 focus:ring-primary/50"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={createOrganization} className="w-full h-12 cursor-pointer font-bold text-base bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Initialize Collective
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/5">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                   <Users className="h-24 w-24" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <UserPlus className="h-6 w-6 text-primary" />
                    Join Existing Network
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Joining a team? Enter the ID provided by your department lead.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <Label htmlFor="org-id" className="text-xs font-bold uppercase text-muted-foreground">Network Identifier (Org ID)</Label>
                    <Input 
                      id="org-id" 
                      placeholder="Paste ID provided by lead..." 
                      value={joiningOrgId} 
                      onChange={(e) => setJoiningOrgId(e.target.value)}
                      className="h-12 border-muted-foreground/20 focus:ring-primary/50"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={joinOrganization} variant="outline" className="w-full h-12 cursor-pointer font-bold text-base hover:bg-primary hover:text-primary-foreground transition-all">
                    Link with Team
                    <Link className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="mt-12 p-6 bg-muted/30 border rounded-2xl flex flex-col items-center text-center gap-4 border-dashed max-w-2xl mx-auto">
              <div className="p-3 bg-background border rounded-full">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Why use a Network?</strong> Collective billing allows districts to manage AI costs from a single pool, while 
                Teachers can share verified "Waypoints" (curriculum benchmarks) across the entire department instantly.
              </p>
            </div>
          </div>
        ) : !organization ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Retrieving organization details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {organization?.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      Physics Network Active • ID: {organization?.id}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Practitioner</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {networkMembers.map((member) => (
                    <TableRow key={member.uid}>
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                            {(member.displayName || member.name || "E").charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {member.displayName || member.name || "Anonymous Educator"}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {member.uid.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{member.email}</span>
                      </TableCell>
                      <TableCell>
                        {organization.ownerId === member.uid ? (
                          <Badge variant="default" className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">
                            <Crown className="w-3 h-3 mr-1" /> Lead Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Educator</Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {user?.uid === organization.ownerId && member.uid !== user.uid ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-amber-600 focus:text-amber-700 cursor-pointer"
                                onClick={() => transferOwnership(member.uid, member.displayName || member.name || "this educator")}
                              >
                                <Crown className="h-4 w-4 mr-2" />
                                Transfer Ownership
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => kickMember(member.uid, member.displayName || member.name || "this educator")}
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remove Member
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

          <div className="space-y-6">
            {user?.uid === organization.ownerId && (
              <Card className="border-primary/20 bg-primary/5 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Network Billing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-background border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-bold">Current Plan</p>
                      <p className="text-sm font-bold capitalize">{organization.planId === "free" ? "Free" : "Standard"}</p>
                    </div>
                    {organization.planId !== "free" && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 shadow-[0_0_8px_rgba(16,185,129,0.2)]">Active</Badge>
                    )}
                  </div>
                  
                  <Link href="/teacher/network/billing" className="w-full">
                    <Button variant="outline" className="w-full text-xs h-9 cursor-pointer">
                      Manage Plan & Billing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/10 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Invite Colleagues
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px] p-4 space-y-2 border-primary/20 shadow-2xl rounded-2xl">
                      <p className="font-bold text-xs flex items-center gap-2 text-primary">
                        <Users className="h-3.5 w-3.5" />
                        Building the Collective
                      </p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        When colleagues join your network:
                      </p>
                      <ul className="space-y-1.5 pt-1">
                        <li className="flex items-start gap-2 text-[10px] font-medium leading-tight text-zinc-600 dark:text-zinc-400">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                          <span>Share <strong>Waypoints</strong> (curriculum resources) instantly.</span>
                        </li>
                        <li className="flex items-start gap-2 text-[10px] font-medium leading-tight text-zinc-600 dark:text-zinc-400">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                          <span>Pool <strong>Practice Units</strong> for your entire student body.</span>
                        </li>
                        <li className="flex items-start gap-2 text-[10px] font-medium leading-tight text-zinc-600 dark:text-zinc-400">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                          <span>View <strong>aggregated analytics</strong> on cost and mastery.</span>
                        </li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription>
                  Share this link with your department to join the network.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-background border rounded-lg text-xs font-mono group cursor-pointer" onClick={copyInviteLink}>
                  <div className="flex-1 truncate text-muted-foreground group-hover:text-foreground transition-colors">
                    {typeof window !== "undefined" && `${window.location.protocol}//${window.location.host}/join/${organization.id}`}
                  </div>
                  <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <Button className="cursor-pointer w-full" onClick={copyInviteLink}>
                  Copy Invitation Link
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                  Network Management
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage your association with this network.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="cursor-pointer w-full text-destructive hover:bg-destructive/10" onClick={leaveNetwork}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {user?.uid === organization.ownerId ? "Disband Network" : "Leave Network"}
                </Button>
                {user?.uid === organization.ownerId && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    Note: Disbanding will remove all members from the network.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {organization && (
        <div className="space-y-6 pt-8 border-t border-border/50">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold tracking-tight">Capacities & Limits</h2>
            <p className="text-sm text-muted-foreground">Manage pay-as-you-go AI limits and shared resources for your network.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className={cn(
              "border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10 transition-all duration-500 relative overflow-hidden",
              isFreePlan && "grayscale-[0.5] select-none scale-[0.98]"
            )}>
              {isFreePlan && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] p-6 text-center">
                  <div className="p-3 bg-zinc-900/80 rounded-full mb-3 border border-white/10 shadow-xl">
                    <Lock className="h-5 w-5 text-zinc-400" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/90 mb-4 px-4 py-1 bg-zinc-900/50 rounded-full border border-white/5">Network Feature</p>
                  <Link href="/teacher/network/billing" className="z-40">
                    <Button size="sm" variant="secondary" className="cursor-pointer h-8 text-[10px] font-bold uppercase tracking-widest px-6 rounded-full bg-white text-black hover:bg-zinc-200">
                      Upgrade to Unlock
                    </Button>
                  </Link>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    AI Budgeting
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help transition-all hover:text-emerald-500" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[320px] p-0 overflow-hidden border-emerald-200/50 shadow-2xl rounded-2xl">
                        <div className="bg-emerald-500 p-4 text-white">
                          <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert className="h-4 w-4" />
                            <p className="font-black text-xs uppercase tracking-widest">Safety Protocol</p>
                          </div>
                          <p className="text-[11px] leading-relaxed opacity-90 font-medium font-sans">
                            The AI Safety Cap is a hard financial limit set in USD ($) to prevent runaway costs from high-frequency AI tutoring or math analysis.
                          </p>
                        </div>
                        <div className="p-4 space-y-3 bg-white dark:bg-zinc-950">
                          <div className="space-y-1">
                            <p className="font-bold text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-mono tracking-tighter">Automatic Halt</p>
                            <p className="text-[11px] leading-tight text-muted-foreground font-medium">
                              Once your current bill reaches this cap, all AI-dependent features will temporarily pause.
                            </p>
                          </div>
                          <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40 flex flex-col gap-2">
                            <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 opacity-60">
                              <Zap className="h-3 w-3 text-amber-500" />
                              Start with a low cap ($1.00 - $5.00) for small classes.
                            </p>
                            <Link href="/teacher/network/investment" className="block">
                              <Button variant="secondary" size="sm" className="w-full text-[10px] h-7 font-black bg-zinc-900 text-white rounded-lg hover:bg-emerald-600 transition-colors gap-2">
                                <TrendingUp className="h-3 w-3" />
                                Open Investment Tracker
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono border-emerald-200 text-emerald-700 bg-emerald-100/50">
                    LIVE FEED
                  </Badge>
                </div>
                <CardDescription className="text-[11px]">
                  Monthly protective safety cap for AI services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background/60 backdrop-blur-sm border rounded-xl shadow-sm">
                    <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Current Bill
                    </p>
                    <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ${((organization.aiUsageCurrent || 0) / 100).toFixed(4)}
                    </p>
                  </div>
                  <div className="p-3 bg-background/60 backdrop-blur-sm border rounded-xl shadow-sm">
                    <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1.5">Safety Cap</p>
                    <p className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">
                      ${((organization.aiBudgetLimit || 0) / 100).toFixed(4)}
                    </p>
                  </div>
                </div>

                {user?.uid === organization.ownerId && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="ai-budget" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Monthly AI Cap ($)</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="ai-budget" 
                          type="number" 
                          step="0.0001" 
                          className="h-10 font-mono text-sm rounded-xl focus-visible:ring-emerald-500" 
                          value={tempBudget}
                          onChange={(e) => setTempBudget(e.target.value)}
                        />
                        <Button 
                          className="cursor-pointer h-10 px-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white hover:opacity-90 transition-opacity font-bold rounded-xl"
                          onClick={handleUpdateBudget}
                          disabled={updatingBudget}
                        >
                          {updatingBudget ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <Link href="/teacher/network/investment" className="block w-full">
                        <Button variant="outline" size="sm" className="w-full text-[10px] h-8 font-black uppercase tracking-widest border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all gap-2 rounded-xl group">
                            <TrendingUp className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                            ROI Projection Engine
                        </Button>
                      </Link>
                      <p className="text-[10px] text-muted-foreground leading-relaxed px-1">
                        AI services will halt automatically once this threshold is reached to prevent overages.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

              <Card className={cn(
                "border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/10 relative overflow-hidden transition-all duration-500",
                isFreePlan && "grayscale-[0.5] select-none scale-[0.98]"
              )}>
                {isFreePlan && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] p-6 text-center">
                    <div className="p-3 bg-zinc-900/80 rounded-full mb-3 border border-white/10 shadow-xl">
                      <Lock className="h-5 w-5 text-zinc-400" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/90 mb-4 px-4 py-1 bg-zinc-900/50 rounded-full border border-white/5">Network Feature</p>
                    <Link href="/teacher/network/billing" className="z-40">
                      <Button size="sm" variant="secondary" className="cursor-pointer h-8 text-[10px] font-bold uppercase tracking-widest px-6 rounded-full bg-white text-black hover:bg-zinc-200">
                        Upgrade to Unlock
                      </Button>
                    </Link>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BowArrow className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      Practice Capacity
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help transition-all hover:text-indigo-500" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[420px] p-0 overflow-hidden border-indigo-200/50 shadow-2xl rounded-2xl">
                          <div className="bg-indigo-600 p-5 text-white">
                            <div className="flex items-center gap-2 mb-1.5">
                              <BowArrow className="h-5 w-5" />
                              <p className="font-black text-sm uppercase tracking-widest">Shared Simulation Pool</p>
                            </div>
                            <p className="text-xs leading-relaxed opacity-90 font-medium font-sans">
                              Students consume units from this shared pool when generating new AI-powered physics scenarios in the Practice tab.
                            </p>
                          </div>
                          <div className="relative aspect-video overflow-hidden border-b border-indigo-100 dark:border-indigo-900/40 group">
                            <img 
                              src="/network-previews/practice.png" 
                              alt="Student Practice View Preview" 
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent pointer-events-none" />
                            <div className="absolute bottom-3 left-4 right-4 text-white">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Student Perspective</p>
                              <p className="text-xs font-bold leading-tight">Interactive sandbox where students experiment with physics variables in real-time.</p>
                            </div>
                          </div>
                          <div className="p-5 space-y-4 bg-white dark:bg-zinc-950">
                            <div className="space-y-2">
                              <p className="font-bold text-[10px] uppercase text-indigo-600 dark:text-indigo-400 font-mono tracking-tighter">Network Dynamics</p>
                              <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                                This screenshot shows the student dashboard. Every time a student clicks "Generate Scenario", it deducts from the global pool managed here. Setting a higher allowance expands the creative boundaries for your entire network.
                              </p>
                            </div>
                            <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tight opacity-60">
                                Collective Resource Scaling
                              </p>
                              <Badge variant="outline" className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 text-indigo-600">Auto-Scaling</Badge>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono border-indigo-200 text-indigo-700 bg-indigo-100/50">
                      NETWORK LIMIT
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px]">
                    Shared practice budget calculated based on enrollment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-background/60 backdrop-blur-sm border rounded-xl shadow-sm">
                      <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                        <BowArrow className="h-2.5 w-2.5 text-indigo-500" />
                        Usage
                      </p>
                      <p className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                        {organization.practiceUsageCurrent || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-background/60 backdrop-blur-sm border rounded-xl shadow-sm">
                      <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1.5 flex justify-between">
                        Pool
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-2.5 w-2.5 text-muted-foreground/30" />
                          </TooltipTrigger>
                          <TooltipContent className="text-[10px]">Total enrollment across all teachers in network.</TooltipContent>
                        </Tooltip>
                      </p>
                      <p className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">
                        {organization.practiceLimit || 0}
                      </p>
                    </div>
                  </div>

                  {user?.uid === organization.ownerId && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="practice-limit" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                          Allowance Per Student
                          <Badge variant="secondary" className="text-[8px] font-black h-4 px-1 leading-none">AUTO-SCALING</Badge>
                        </Label>
                        <div className="flex gap-2">
                          <Input 
                            id="practice-limit" 
                            type="number" 
                            className="h-10 font-mono text-sm rounded-xl focus-visible:ring-indigo-500" 
                            value={tempPracticeLimitPerStudent}
                            onChange={(e) => setTempPracticeLimitPerStudent(e.target.value)}
                          />
                          <Button 
                            className="cursor-pointer h-10 px-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white hover:opacity-90 transition-opacity font-bold rounded-xl"
                            onClick={handleUpdatePracticeLimit}
                            disabled={updatingPractice}
                          >
                            {updatingPractice ? <Loader2 className="h-4 w-4 animate-spin" /> : "Recalculate"}
                          </Button>
                        </div>
                      </div>
                      <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 transition-all hover:bg-indigo-500/10">
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest flex justify-between items-center">
                           <span>Pool Capacity</span>
                           <span className="font-black text-xs font-mono">{parseInt(tempPracticeLimitPerStudent || "0") * studentCount} units</span>
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                          <ShieldCheck className="h-2 w-2 text-indigo-400" />
                          Calculated from {studentCount} active student enrollments.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            <Card className={cn(
              "border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10 relative overflow-hidden transition-all duration-500",
              isFreePlan && "grayscale-[0.5] select-none scale-[0.98]"
            )}>
              {isFreePlan && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] p-6 text-center">
                  <div className="p-3 bg-zinc-900/80 rounded-full mb-3 border border-white/10 shadow-xl">
                    <Lock className="h-5 w-5 text-zinc-400" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/90 mb-4 px-4 py-1 bg-zinc-900/50 rounded-full border border-white/5">Network Feature</p>
                  <Link href="/teacher/network/billing" className="z-40">
                    <Button size="sm" variant="secondary" className="cursor-pointer h-8 text-[10px] font-bold uppercase tracking-widest px-6 rounded-full bg-white text-black hover:bg-zinc-200">
                      Upgrade to Unlock
                    </Button>
                  </Link>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <NotebookPen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Notebook Capacity
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help transition-all hover:text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[420px] p-0 overflow-hidden border-blue-200/50 shadow-2xl rounded-2xl">
                          <div className="bg-blue-600 p-5 text-white">
                            <div className="flex items-center gap-2 mb-1.5">
                              <NotebookPen className="h-5 w-5" />
                              <p className="font-black text-sm uppercase tracking-widest">Research Workspace</p>
                            </div>
                            <p className="text-xs leading-relaxed opacity-90 font-medium font-sans">
                              Controls the individual research and AI inquiry capacity provisioned for every student in your network.
                            </p>
                          </div>
                          <div className="relative aspect-video overflow-hidden border-b border-blue-100 dark:border-blue-900/40 group">
                            <img 
                              src="/network-previews/notebook.png" 
                              alt="Student Notebook View Preview" 
                              className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent pointer-events-none" />
                            <div className="absolute bottom-3 left-4 right-4 text-white">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Student Perspective</p>
                              <p className="text-xs font-bold leading-tight">A dedicated research portal where students store course insights and query the AI on specific topics.</p>
                            </div>
                          </div>
                          <div className="p-5 space-y-4 bg-white dark:bg-zinc-950">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1 bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-800/40">
                                <p className="font-black text-[9px] uppercase text-blue-600 dark:text-blue-400 font-mono tracking-tighter">Capacity</p>
                                <p className="text-[10px] text-muted-foreground leading-tight font-medium">The total notebooks a student can maintain at once.</p>
                              </div>
                              <div className="space-y-1 bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-xl border border-purple-100 dark:border-purple-800/40">
                                <p className="font-black text-[9px] uppercase text-purple-600 dark:text-purple-400 font-mono tracking-tighter">AI Depth</p>
                                <p className="text-[10px] text-muted-foreground leading-tight font-medium">The monthly message quota for deep research sessions.</p>
                              </div>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground font-medium px-1">
                              This preview displays the student's personal library. Setting these limits ensures everyone has a baseline for exploration while maintaining network-wide usage hygiene.
                            </p>
                            <div className="pt-3 border-t border-blue-100 dark:border-blue-900/40">
                              <p className="text-[10px] font-bold text-zinc-500 opacity-60 flex items-center gap-1.5 uppercase tracking-widest">
                                Member-Specific Provisioning
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono border-blue-200 text-blue-700 bg-blue-100/50">
                    MEMBER LIMIT
                  </Badge>
                </div>
                <CardDescription className="text-[11px]">
                  Research and note-taking capacity for individual members.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background/60 backdrop-blur-sm border rounded-xl shadow-sm">
                    <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1.5 flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      Notebook Limit
                    </p>
                    <p className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">
                      {organization.notebookLimitPerStudent || 0}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">Per Student</p>
                  </div>
                  <div className="p-3 bg-background/60 backdrop-blur-sm border rounded-xl shadow-sm">
                    <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1.5 text-blue-600 dark:text-blue-400">AI Chat Limit</p>
                    <p className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">
                      {organization.aiNotebookLimitPerStudent || 0}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">Per Month</p>
                  </div>
                </div>

                {user?.uid === organization.ownerId && (
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-1.5">
                        <Label htmlFor="nb-limit" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Notebooks</Label>
                        <Input 
                          id="nb-limit" 
                          type="number" 
                          className="h-10 font-mono text-sm rounded-xl focus-visible:ring-blue-500" 
                          value={tempNotebookLimitPerStudent}
                          onChange={(e) => setTempNotebookLimitPerStudent(e.target.value)}
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <Label htmlFor="ai-nb-limit" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">AI Chats</Label>
                        <Input 
                          id="ai-nb-limit" 
                          type="number" 
                          className="h-10 font-mono text-sm rounded-xl focus-visible:ring-blue-500" 
                          value={tempAiNotebookLimitPerStudent}
                          onChange={(e) => setTempAiNotebookLimitPerStudent(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          className="cursor-pointer h-10 px-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white hover:opacity-90 transition-opacity font-bold rounded-xl"
                          onClick={handleUpdateNotebookLimit}
                          disabled={updatingNotebook}
                        >
                          {updatingNotebook ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {profile?.role === "teacher" && profile?.organizationId && (
        <div className="grid grid-cols-1 gap-8 pt-8 border-t border-border/50">
          <div className="space-y-4">
            <UsageAnalytics organizationId={profile.organizationId} />
          </div>
        </div>
      )}
    </div>
  </TooltipProvider>
  );
}
