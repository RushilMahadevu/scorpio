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
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && role) {
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

  if (user && !role) {
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Scorpio</CardTitle>
          <CardDescription>Powering Physics at Sage Ridge</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
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
                <Input
                  id="student-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
                <Input
                  id="teacher-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button 
                className="w-full" 
                onClick={() => handleLogin("teacher")}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in as Teacher"}
              </Button>
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
    </div>
  );
}
