"use client";

import { useState } from "react";
import { SpaceBackground } from "@/components/ui/space-background";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AccessRequests } from "@/components/admin/access-requests";
import { TeacherInviteCodes } from "@/components/admin/teacher-invite-codes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShieldCheck, KeyRound, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const handleUnlock = async () => {
    if (!secret.trim()) {
      setError("Enter the admin secret.");
      return;
    }
    setChecking(true);
    setError("");
    try {
      // Verify the secret by attempting a list call
      const res = await fetch("/api/auth/teacher-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret.trim(),
        },
        body: JSON.stringify({ action: "list" }),
      });
      if (res.status === 401) {
        setError("Invalid admin secret.");
        return;
      }
      setAuthed(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <SpaceBackground />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">Admin Access</CardTitle>
              <CardDescription>Enter the admin secret to continue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-secret">Admin Secret</Label>
                <div className="relative">
                  <Input
                    id="admin-secret"
                    type={showSecret ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !checking && handleUnlock()}
                    className="pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <Button className="w-full" onClick={handleUnlock} disabled={checking}>
                {checking ? "Verifying…" : "Unlock"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <SpaceBackground />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Logo size={24} className="text-foreground" />
          <div>
            <h1 className="text-xl font-extrabold">Scorpio Admin</h1>
            <p className="text-xs text-muted-foreground">Access requests · Teacher invite codes</p>
          </div>
        </motion.div>

        <TooltipProvider>
          {/* Access Requests — shown first so you can immediately act on them */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AccessRequests adminSecret={secret} />
          </motion.div>

          {/* Teacher Invite Codes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TeacherInviteCodes adminSecret={secret} />
          </motion.div>
        </TooltipProvider>
      </div>
    </div>
  );
}
