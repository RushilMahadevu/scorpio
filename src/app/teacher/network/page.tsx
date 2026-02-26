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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  PlusCircle, 
  Users, 
  Building2, 
  UserPlus, 
  LogOut, 
  Loader2, 
  Link, 
  Crown, 
  UserMinus, 
  ShieldAlert, 
  MoreHorizontal, 
  Copy, 
  Sparkles, 
  CreditCard, 
  CheckCircle2, 
  Lock,
  Calculator,
  Zap,
  Boxes
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Organization, UserProfile } from "@/lib/types";
import { AICostCalculator } from "@/components/admin/ai-cost-calculator";
import { UsageAnalytics } from "@/components/admin/usage-analytics";
import { cn } from "@/lib/utils";

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
  const [updatingSandbox, setUpdatingSandbox] = useState(false);
  const [tempSandboxLimit, setTempSandboxLimit] = useState<string>("");
  const [tempSandboxLimitPerStudent, setTempSandboxLimitPerStudent] = useState<string>("");
  const [studentCount, setStudentCount] = useState<number>(0);

  useEffect(() => {
    if (organization?.aiBudgetLimit !== undefined) {
      setTempBudget((organization.aiBudgetLimit / 100).toFixed(4));
    } else {
      setTempBudget("10.0000");
    }

    if (organization?.sandboxLimitPerStudent !== undefined) {
      setTempSandboxLimitPerStudent(organization.sandboxLimitPerStudent.toString());
    } else {
      setTempSandboxLimitPerStudent("0");
    }

    if (organization?.sandboxLimit !== undefined) {
      setTempSandboxLimit(organization.sandboxLimit.toString());
    } else {
      setTempSandboxLimit("0");
    }
  }, [organization]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription updated! Accessing Pro features...");
      // Remove query param
      router.replace("/teacher/network");
    }
  }, [searchParams, router]);

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
          planId,
        }),
      });
      const { url, error } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        toast.error(error || "Failed to initiate checkout.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred.");
    } finally {
      setUpgrading(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!user || !organization || user.uid !== organization.ownerId) return;
    
    const budgetCents = parseFloat(tempBudget) * 100;
    if (isNaN(budgetCents) || budgetCents < 0) {
      toast.error("Please enter a valid budget amount.");
      return;
    }

    setUpdatingBudget(true);
    try {
      await updateDoc(doc(db, "organizations", organization.id), {
        aiBudgetLimit: budgetCents
      });
      toast.success("AI Budget updated successfully!");
      setOrganization(prev => prev ? { ...prev, aiBudgetLimit: budgetCents } : null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update AI Budget.");
    } finally {
      setUpdatingBudget(false);
    }
  };

  const handleUpdateSandboxLimit = async () => {
    if (!user || !organization || user.uid !== organization.ownerId) return;
    
    const perMember = parseInt(tempSandboxLimitPerStudent);
    if (isNaN(perMember) || perMember < 0) {
      toast.error("Please enter a valid allowance.");
      return;
    }

    // Sandbox limit is strictly for students
    const totalLimit = perMember * studentCount;

    setUpdatingSandbox(true);
    try {
      await updateDoc(doc(db, "organizations", organization.id), {
        sandboxLimitPerStudent: perMember,
        sandboxLimit: totalLimit
      });
      toast.success(`Sandbox Limit updated to ${totalLimit} total student units!`);
      setOrganization(prev => prev ? { 
        ...prev, 
        sandboxLimitPerStudent: perMember,
        sandboxLimit: totalLimit 
      } : null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update sandbox limit.");
    } finally {
      setUpdatingSandbox(false);
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
        sandboxLimitPerStudent: 10, // Target allowance per student
        sandboxLimit: 0, // No students added yet
        sandboxUsageCurrent: 0,
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

  return (
    <div className="container p-6 mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Scorpio Network</h1>
        <p className="text-muted-foreground max-w-2xl">
          Coordinate with your department, share curriculum resources, and build your local Scorpio Collective.
        </p>
      </div>

      {!profile?.organizationId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Start a New Network
              </CardTitle>
              <CardDescription>Create a private network for your department or team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Network/Department Name</Label>
                <Input id="org-name" placeholder="e.g. Scarsdale High Physics" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={createOrganization} className="w-full cursor-pointer">Create Network</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Join Existing Network
              </CardTitle>
              <CardDescription>Enter a Network ID provided by your department lead.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-id">Network ID</Label>
                <Input id="org-id" placeholder="Paste ID here..." value={joiningOrgId} onChange={(e) => setJoiningOrgId(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={joinOrganization} variant="outline" className="w-full cursor-pointer">Join Network</Button>
            </CardFooter>
          </Card>
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
              <Card className="border-primary/20 bg-primary/5">
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
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-xs h-9 cursor-pointer">
                        Manage Plan & Billing
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl border-none bg-card p-0 overflow-hidden ring-1 ring-border shadow-2xl">                      
                      <div className="p-8 space-y-8">
                        <DialogHeader className="p-0">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                              <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-left">
                              <DialogTitle className="text-2xl font-bold tracking-tight">The Scorpio Network</DialogTitle>
                              <DialogDescription className="text-sm">
                                Elevate your department with classroom-grade AI and teacher-first tools.
                              </DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>

                        {/* Current Plan Overview (Compact) */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              organization.planId === "free" ? "bg-muted-foreground/30" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"
                            )} />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-0.5">Active Network License</p>
                              <div className="flex items-center gap-2">
                                <p className="text-base font-bold capitalize">
                                  {organization.planId === "free" ? "Free" : "Standard"}
                                </p>
                                {organization.planId !== "free" && (
                                  <Badge variant="outline" className="text-[9px] font-mono py-0 opacity-70">
                                    {organization.planId.includes("yearly") ? "ANNUAL" : "MONTHLY"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-background/50 border-none font-medium text-[10px] flex items-center gap-1.5">
                            Standard Capacity
                          </Badge>
                        </div>

                        {organization.planId === "free" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Monthly Plan */}
                            <div className="group relative p-6 border border-border bg-card rounded-3xl flex flex-col justify-between hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
                              <div className="space-y-6">
                                <div>
                                  <Badge variant="outline" className="mb-4 font-mono text-[9px] uppercase tracking-widest border-border/50">Standard Monthly</Badge>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black tracking-tighter">$4.99</span>
                                    <span className="text-muted-foreground text-sm font-medium">/mo</span>
                                  </div>
                                </div>
                                
                                <ul className="space-y-3">
                                  {[
                                    "Full Teacher AI Dashboard",
                                    "Shared Network Waypoints",
                                    "Real-time Mastery Views",
                                    "Cancel anytime"
                                  ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <Button 
                                className="cursor-pointer mt-8 w-full bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white hover:opacity-90 transition-opacity font-bold py-6 text-sm rounded-2xl"
                                onClick={() => handleUpgrade("standard_monthly")}
                                disabled={upgrading}
                              >
                                {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Start Monthly Standard"}
                              </Button>
                            </div>

                            {/* Yearly Plan - HIGH IMPACT */}
                            <div className="relative p-7 border-2 border-primary bg-primary/[0.01] rounded-3xl flex flex-col justify-between shadow-2xl shadow-primary/10 overflow-hidden transition-transform hover:scale-[1.02] duration-300">
                              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-4 py-1.5 font-black uppercase tracking-widest rounded-bl-2xl">
                                50% OFF • RECOMMENDED
                              </div>
                              
                              <div className="space-y-6">
                                <div>
                                  <Badge className="mb-4 bg-primary hover:bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest border-none">Standard Yearly</Badge>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter">$29.88</span>
                                    <span className="text-muted-foreground text-sm font-medium">/year</span>
                                  </div>
                                  <p className="text-[11px] text-primary font-bold mt-1.5 flex items-center gap-1.5">
                                    <Zap className="h-3 w-3" />
                                    Just $2.49/mo (Save $30/yr)
                                  </p>
                                </div>
                                
                                <ul className="space-y-3">
                                  {[
                                    "Everything in Monthly",
                                    "Priority Processing",
                                    "Extended Usage History",
                                    "Department-wide Discount"
                                  ].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-xs font-semibold">
                                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <Button 
                                className="cursor-pointer mt-8 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-6 text-sm rounded-2xl shadow-lg shadow-primary/20"
                                onClick={() => handleUpgrade("standard_yearly")}
                                disabled={upgrading}
                              >
                                {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Claim Annual Standard"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold">Subscription Fully Active</h4>
                                <p className="text-sm text-muted-foreground">Your department is powered by Scorpio AI.</p>
                              </div>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl text-xs text-center text-muted-foreground italic border border-border/50">
                                Management & Billing is handled securely via Polar. 
                                <a href="https://polar.sh/scorpio/portal" target="_blank" className="text-primary font-bold ml-1 hover:underline">Launch Portal</a>
                            </div>
                          </div>
                        )}

                        {/* Token Pricing Transparency Footer */}
                        {organization.planId === "free" && (
                          <div className="bg-zinc-100/50 dark:bg-zinc-900/50 border border-border/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-background border rounded-xl shadow-sm">
                                <Sparkles className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Zero Markup Policy</p>
                                <p className="text-sm font-medium">Pay exact raw Gemini 2.5 Flash token costs.</p>
                              </div>
                            </div>
                            <div className="flex gap-4">
                              <div className="text-center px-4 border-l border-border/50">
                                <p className="text-lg font-black font-mono leading-none">$0.15</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">1M Input</p>
                              </div>
                              <div className="text-center px-4 border-l border-border/50">
                                <p className="text-lg font-black font-mono leading-none">$0.60</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">1M Output</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/10 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Invite Colleagues
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

            {organization.planId !== "free" && (
              <Card className="border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      AI Budgeting (Monthly)
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono border-emerald-200 text-emerald-700 bg-emerald-100/50">
                      LIVE
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px]">
                    Manage pay-as-you-go AI limits for your network.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-background/60 backdrop-blur-sm border rounded-xl shadow-sm">
                      <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Usage
                      </p>
                      <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ${((organization.aiUsageCurrent || 0) / 100).toFixed(4)}
                      </p>
                    </div>
                    <div className="p-3 bg-background/60 backdrop-blur-sm border rounded-xl shadow-sm">
                      <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1.5">Limit</p>
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
                      <p className="text-[10px] text-muted-foreground leading-relaxed px-1">
                        AI services will halt automatically once this threshold is reached to prevent overages.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Sandbox Capacity (Monthly)
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono border-indigo-200 text-indigo-700 bg-indigo-100/50">
                    NETWORK LIMIT
                  </Badge>
                </div>
                <CardDescription className="text-[11px]">
                  Shared sandbox budget calculated as <strong>Total Students ({studentCount})</strong> × <strong>Allowance per Student</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background/60 backdrop-blur-sm border rounded-xl shadow-sm">
                    <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Boxes className="h-2.5 w-2.5 text-indigo-500" />
                      Sandbox Usage
                    </p>
                    <p className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                      {organization.sandboxUsageCurrent || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-background/60 backdrop-blur-sm border rounded-xl shadow-sm">
                    <p className="text-[9px] uppercase text-muted-foreground font-black tracking-widest mb-1.5">Network Pool</p>
                    <p className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">
                      {organization.sandboxLimit || 0}
                    </p>
                  </div>
                </div>

                {user?.uid === organization.ownerId && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="sandbox-limit" className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Allowance Per Student (Sandbox Only)</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="sandbox-limit" 
                          type="number" 
                          className="h-10 font-mono text-sm rounded-xl focus-visible:ring-indigo-500" 
                          value={tempSandboxLimitPerStudent}
                          onChange={(e) => setTempSandboxLimitPerStudent(e.target.value)}
                        />
                        <Button 
                          className="cursor-pointer h-10 px-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white hover:opacity-90 transition-opacity font-bold rounded-xl"
                          onClick={handleUpdateSandboxLimit}
                          disabled={updatingSandbox}
                        >
                          {updatingSandbox ? <Loader2 className="h-4 w-4 animate-spin" /> : "Recalculate"}
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest flex justify-between">
                         Current Capacity Estimate <span>{parseInt(tempSandboxLimitPerStudent || "0") * studentCount} Problems</span>
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-1 text-right italic">
                        Teachers are excluded from this pool. Only students are counted.
                      </p>
                    </div>
                  </div>
                )}
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

      {profile?.role === "teacher" && profile?.organizationId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-border/50">
          <div className="space-y-4">
            <UsageAnalytics organizationId={profile.organizationId} />
          </div>
          <div className="space-y-4">
            <AICostCalculator />
          </div>
        </div>
      )}
    </div>
  );
}
