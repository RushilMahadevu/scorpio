"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, logout } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpaceBackground } from "@/components/ui/space-background";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Presentation, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && role && role !== "checking") {
      router.push(role === "teacher" ? "/teacher" : "/student");
    }
  }, [user, role, authLoading, router]);

  const handleLogin = async (role: "teacher" | "student") => {
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      // The useEffect will handle the redirect once the auth state updates
    } catch (err) {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user && role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">Account Error</CardTitle>
            <CardDescription>
              Your account was created but the profile setup is incomplete. This usually happens if there was a permission error during sign up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Please sign out and try creating a new account with a different email address.
            </p>
            <Button className="w-full" onClick={handleLogout}>
              Sign Out
            </Button>
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
            
            <TabsContent value="student" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="student-email">Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  placeholder="student@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-password">Password</Label>
                <div className="relative">
                  <Input
                    id="student-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button 
                className="w-full" 
                onClick={() => handleLogin("student")}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in as Student"}
              </Button>
            </TabsContent>

            <TabsContent value="teacher" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-email">Email</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  placeholder="teacher@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-password">Password</Label>
                <div className="relative">
                  <Input
                    id="teacher-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button 
                className="w-full" 
                onClick={() => handleLogin("teacher")}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in as Teacher"}
              </Button>
              <div className="flex flex-col gap-2 mt-2">
                <Button
                  className="w-full border border-border bg-background hover:bg-accent text-foreground"
                  variant="outline"
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    try {
                      // Google sign-in for teacher
                      const user = await import("@/lib/firebase").then(mod => mod.signInWithGoogleForTeacher());
                      // Redirect to teacher dashboard
                      router.push("/teacher");
                    } catch (err: any) {
                      setError(err.message || "Google sign-in failed");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  <span className="inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20"><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C36.45 2.7 30.6 0 24 0 14.64 0 6.4 5.48 2.44 13.44l8.01 6.23C12.7 13.36 17.89 9.5 24 9.5z"/><path fill="#34A853" d="M46.09 24.5c0-1.64-.15-3.22-.43-4.75H24v9h12.44c-.54 2.9-2.16 5.36-4.6 7.04l7.19 5.59C43.98 37.36 46.09 31.36 46.09 24.5z"/><path fill="#FBBC05" d="M12.45 28.67c-1.13-3.36-1.13-6.98 0-10.34l-8.01-6.23C1.09 16.36 0 20.05 0 24c0 3.95 1.09 7.64 3.01 10.9l8.01-6.23z"/><path fill="#EA4335" d="M24 48c6.6 0 12.15-2.18 16.19-5.95l-7.19-5.59c-2.01 1.35-4.59 2.14-7.5 2.14-6.11 0-11.3-3.86-13.55-9.17l-8.01 6.23C6.4 42.52 14.64 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
                    Sign in with Google (Teacher)
                  </span>
                </Button>
              </div>
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
