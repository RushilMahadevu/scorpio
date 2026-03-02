"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, setDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, UserPlus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Organization } from "@/lib/types";

export default function JoinNetworkPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params?.id as string;
  const { user, profile, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [joining, setJoining] = useState(false);
  const [alreadyIn, setAlreadyIn] = useState(false);

  useEffect(() => {
    async function fetchOrg() {
      if (!orgId) return;
      try {
        const docSnap = await getDoc(doc(db, "organizations", orgId));
        if (docSnap.exists()) {
          setOrganization({ id: docSnap.id, ...docSnap.data() } as Organization);
        } else {
          toast.error("Network not found.");
          router.push("/teacher/network");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrg();
  }, [orgId, router]);

  useEffect(() => {
    if (profile?.organizationId === orgId) {
      setAlreadyIn(true);
    }
  }, [profile, orgId]);

  const handleJoin = async () => {
    if (!user || !orgId) {
      router.push(`/login?redirectTo=/join/${orgId}`);
      return;
    }

    setJoining(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        organizationId: orgId,
        role: "teacher", 
        email: user.email,
        displayName: user.displayName || "Teacher",
        lastLoginAt: new Date()
      }, { merge: true });
      
      toast.success(`Joined ${organization?.name}!`);
      router.push("/teacher/network");
    } catch (e) {
      console.error(e);
      toast.error("Failed to join network.");
    } finally {
      setJoining(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/30">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join Physics Network</CardTitle>
          <CardDescription>You've been invited to join a collaborative department.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-lg bg-background text-center">
            <div className="text-sm text-muted-foreground mb-1 font-medium">Network Name</div>
            <div className="text-xl font-bold">{organization?.name}</div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Shared Benefits:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Collaborate on physics assignments
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Share laboratory resources
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Unified department data (Beta)
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          {alreadyIn ? (
            <Button className="w-full" variant="outline" onClick={() => router.push("/teacher/network")}>
              You're already a member
            </Button>
          ) : (
            <Button 
              className="w-full gap-2 text-lg py-6" 
              onClick={handleJoin} 
              disabled={joining}
            >
              {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-5 w-5" />}
              Join this Network
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
