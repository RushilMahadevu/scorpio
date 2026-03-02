"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, logout, db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpaceBackground } from "@/components/ui/space-background";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Presentation, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryRole, setRecoveryRole] = useState<"student" | "teacher">("student");
  const [recoveryAccessCode, setRecoveryAccessCode] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    if (user && !recoveryEmail) {
      setRecoveryEmail(user.email || "");
    }
  }, [user, recoveryEmail]);

  useEffect(() => {
    if (!authLoading && user && role && role !== "checking") {
      router.push(role === "teacher" ? "/teacher" : "/student");
    }
  }, [user, role, authLoading, router]);

  const handleLogin = async (role: "teacher" | "student") => {
    setLoading(true);
    setError("");

    try {
      const userCredential = await login(email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // Set session cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, role }),
      });

      // Force redirect immediately instead of waiting for useEffect
      router.refresh(); // Update server components
      router.push(role === "teacher" ? "/teacher" : "/student");
    } catch (err) {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleRecovery = async () => {
    if (!recoveryEmail) {
      setError("Please enter your email");
      return;
    }

    if (recoveryRole === "teacher" && recoveryAccessCode !== process.env.NEXT_PUBLIC_TEACHER_ACCESS_CODE) {
      setError("Invalid Teacher Access Code");
      return;
    }

    setLoading(true);
    setIsRecovering(true);
    setError("");

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No session found. Please sign in again.");
      
      const collectionName = recoveryRole === "teacher" ? "teachers" : "students";
      const userData: any = {
        uid: currentUser.uid,
        email: recoveryEmail,
        name: recoveryEmail,
        role: recoveryRole,
        createdAt: new Date(),
      };

      console.log("Attempting to recover account for", currentUser.uid, "as", recoveryRole);

      // Attempt all writes and capture individual failures
      const results = await Promise.allSettled([
        setDoc(doc(db, "users", currentUser.uid), userData),
        setDoc(doc(db, collectionName, currentUser.uid), userData)
      ]);

      const failedIndices = results.map((r, i) => r.status === 'rejected' ? i : -1).filter(i => i !== -1);
      
      if (failedIndices.length > 0) {
        failedIndices.forEach(idx => {
          const collection = idx === 0 ? "users" : collectionName;
          const error = (results[idx] as PromiseRejectedResult).reason;
          console.error(`Firestore write failure in ${collection}:`, error);
        });
        throw (results[failedIndices[0]] as PromiseRejectedResult).reason;
      }

      // Force session refresh
      const idToken = await currentUser.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, role: recoveryRole }),
      });

      router.refresh();
      window.location.reload(); // Hard reload to refresh auth context
    } catch (err) {
      console.error("Recovery error:", err);
      setError("Account recovery failed. Please try again.");
      setLoading(false);
      setIsRecovering(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user && role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <SpaceBackground />
        <Card className="w-full max-w-md relative z-10 backdrop-blur-md bg-background/80 border-primary/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size={48} className="text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Account Recovery</CardTitle>
            <CardDescription>
              Profile setup was interrupted. Complete it now to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md mb-4"
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="rec-email" className="text-sm font-medium">Account Email</Label>
              <Input 
                id="rec-email" 
                type="email"
                placeholder="Enter your email" 
                value={recoveryEmail} 
                onChange={(e) => setRecoveryEmail(e.target.value)}
                disabled={loading}
                className="bg-background/50 border-white/10 focus:border-primary/50"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Account Role</Label>
              <Tabs 
                defaultValue="student" 
                onValueChange={(v) => setRecoveryRole(v as "student" | "teacher")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1">
                  <TabsTrigger value="student" className="flex items-center gap-2 cursor-pointer">
                    <GraduationCap className="h-4 w-4" />
                    Student
                  </TabsTrigger>
                  <TabsTrigger value="teacher" className="flex items-center gap-2 cursor-pointer">
                    <Presentation className="h-4 w-4" />
                    Teacher
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {recoveryRole === "teacher" && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 pt-2"
              >
                <Label htmlFor="rec-code" className="text-sm font-medium">Teacher Access Code</Label>
                <Input 
                  id="rec-code" 
                  type="password" 
                  placeholder="Enter required access code" 
                  value={recoveryAccessCode} 
                  onChange={(e) => setRecoveryAccessCode(e.target.value)}
                  disabled={loading}
                  className="bg-background/50 border-white/10 focus:border-primary/50"
                />
              </motion.div>
            )}

            <div className="pt-4 flex flex-col gap-3">
              <Button 
                className="w-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95 py-6 h-auto text-base" 
                onClick={handleRecovery}
                disabled={loading}
              >
                {loading && isRecovering ? "Setting up profile..." : "Finalize Profile"}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-foreground transition-colors py-2 h-auto" 
                onClick={handleLogout}
                disabled={loading}
              >
                Sign Out & Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <SpaceBackground />
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-background/80 rounded-full px-3 py-1 shadow-sm border border-border/50">
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card>
        <CardHeader className="text-center">
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Logo size={48} className="text-primary" />
          </motion.div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to Scorpio</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center gap-2 cursor-pointer">
                <GraduationCap className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="teacher" className="flex items-center gap-2 cursor-pointer">
                <Presentation className="h-4 w-4" />
                Teacher
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="student" className="mt-4">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="student@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Student Email"
                    required
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="student-password">Password</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="student-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      aria-label="Student Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20"
                  >
                    {error}
                  </motion.p>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    className="w-full transition-all active:scale-[0.98] hover:shadow-md" 
                    onClick={() => handleLogin("student")}
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in as Student"}
                  </Button>
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="teacher" className="mt-4">
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="teacher-email">Email</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="teacher@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Teacher Email"
                    required
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="teacher-password">Password</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="teacher-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      aria-label="Teacher Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20"
                  >
                    {error}
                  </motion.p>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    className="w-full transition-all active:scale-[0.98] hover:shadow-md" 
                    onClick={() => handleLogin("teacher")}
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in as Teacher"}
                  </Button>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
