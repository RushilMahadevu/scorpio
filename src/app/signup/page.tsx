"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpaceBackground } from "@/components/ui/space-background";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState(""); // Add state for access code
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (role: "teacher" | "student") => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Validate teacher access code
    if (role === "teacher" && accessCode !== "PHYSICS2024") {
      setError("Invalid Teacher Access Code");
      return;
    }

    // Validate student class code
    if (role === "student" && !accessCode) {
      setError("Class Code is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(email, password, role, name, role === "student" ? accessCode.trim() : undefined);
      router.push(role === "teacher" ? "/teacher" : "/student");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Email is already in use");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <SpaceBackground />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Join Scorpio</CardTitle>
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
                <Label htmlFor="student-name">Full Name</Label>
                <Input
                  id="student-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="student-code">Class Code (Required)</Label>
                <Input
                  id="student-code"
                  placeholder="Enter teacher's code to join class"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button 
                className="w-full" 
                onClick={() => handleSignup("student")}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign up as Student"}
              </Button>
            </TabsContent>

            <TabsContent value="teacher" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-name">Full Name</Label>
                <Input
                  id="teacher-name"
                  placeholder="Dr. Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="teacher-code">Access Code</Label>
                <Input
                  id="teacher-code"
                  type="password"
                  placeholder="Required for teacher accounts"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button 
                className="w-full" 
                onClick={() => handleSignup("teacher")}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign up as Teacher"}
              </Button>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
