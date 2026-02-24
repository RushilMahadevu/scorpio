"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Users, Building2, UserPlus, LogOut, Loader2, Link, Crown, UserMinus, ShieldAlert, MoreHorizontal, Copy } from "lucide-react";
import { Organization, UserProfile } from "@/lib/types";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, CreditCard, CheckCircle2 } from "lucide-react";

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
      const orgSnap = await getDocs(query(collection(db, "organizations"), where("id", "==", profile.organizationId)));
      if (!orgSnap.empty) {
        setOrganization({ id: orgSnap.docs[0].id, ...orgSnap.docs[0].data() } as Organization);
      }

      // 2. Fetch network members
      const membersSnap = await getDocs(query(collection(db, "users"), where("organizationId", "==", profile.organizationId)));
      setNetworkMembers(membersSnap.docs.map(d => ({ uid: d.id, ...d.data() })));
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
        ownerEmail: user.email || "", // Add for Stripe sessions
        subscriptionStatus: "none",
        planId: "free",
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
      // Verify org exists
      const orgSnap = await getDocs(query(collection(db, "organizations"), where("id", "==", cleanId)));
      if (orgSnap.empty) {
        alert("Network not found. Please check the ID.");
        return;
      }

      await setDoc(doc(db, "users", user.uid), {
        organizationId: cleanId,
        role: "teacher", // Ensure role is set during migration
        email: user.email,
        displayName: user.displayName || "Unknown Teacher",
        lastLoginAt: new Date()
      }, { merge: true });
      window.location.reload();
    } catch (e) {
      console.error(e);
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
        <h1 className="text-3xl font-bold tracking-tight">Physics Network</h1>
        <p className="text-muted-foreground max-w-2xl">
          Coordinate with your department, share curriculum resources, and build a localized physics teaching collective.
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
                <div className="flex items-center gap-4">
                  {user?.uid === organization.ownerId && organization.planId === "free" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      onClick={() => handleUpgrade("department_network")}
                      disabled={upgrading}
                    >
                      {upgrading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Upgrade to Pro
                    </Button>
                  )}
                  <Badge variant="secondary" className="capitalize">
                    {organization?.planId} Plan
                  </Badge>
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
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                <Button className="w-full" onClick={copyInviteLink}>
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
                <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10" onClick={leaveNetwork}>
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
    </div>
  );
}
