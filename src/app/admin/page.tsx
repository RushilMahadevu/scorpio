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
import { FirestoreExplorer } from "@/components/admin/firestore-explorer";
import { GlobalAnalytics } from "@/components/admin/global-analytics";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShieldCheck, Eye, EyeOff, Lock, Database, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"access" | "database" | "analytics">("access");

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
    <div className="min-h-screen w-full relative flex flex-col md:flex-row bg-background">
      <SpaceBackground />
      
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/40 relative z-20 bg-background/60 backdrop-blur-xl flex flex-col h-auto md:h-screen sticky top-0"
      >
        <div className="p-6 flex items-center gap-3 border-b border-border/40">
          <Logo size={24} className="text-foreground" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Admin</h1>
            <p className="text-xs text-muted-foreground">Scorpio Platform</p>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
            Modules
          </div>
          <Button
            variant={activeTab === "access" ? "secondary" : "ghost"}
            className="w-full justify-start font-medium"
            onClick={() => setActiveTab("access")}
          >
            <Lock className="mr-2 h-4 w-4" />
            Access & Security
          </Button>
          <Button
            variant={activeTab === "analytics" ? "secondary" : "ghost"}
            className="w-full justify-start font-medium"
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics & Insights
          </Button>
          <Button
            variant={activeTab === "database" ? "secondary" : "ghost"}
            className="w-full justify-start font-medium"
            onClick={() => setActiveTab("database")}
          >
            <Database className="mr-2 h-4 w-4" />
            Database Explorer
          </Button>
        </nav>

        <div className="p-4 border-t border-border/40 mt-auto">
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setAuthed(false)}
          >
            Log Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 relative z-10 p-6 md:p-10 h-[calc(100vh-80px)] md:h-screen overflow-y-auto">
        <TooltipProvider>
          <AnimatePresence mode="wait">
            {activeTab === "access" && (
              <motion.div
                key="access"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Access & Security</h2>
                  <p className="text-muted-foreground">Manage waitlist access requests and teacher invite codes.</p>
                </div>
                
                <AccessRequests adminSecret={secret} />
                <TeacherInviteCodes adminSecret={secret} />
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                <GlobalAnalytics />
              </motion.div>
            )}

            {activeTab === "database" && (
              <motion.div
                key="database"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto h-[80vh] flex flex-col space-y-4"
              >
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Database Explorer</h2>
                  <p className="text-muted-foreground">Query read-only platform data directly from Firestore.</p>
                </div>
                
                <div className="flex-1 min-h-0">
                  <FirestoreExplorer adminSecret={secret} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TooltipProvider>
      </main>
    </div>
  );
}
