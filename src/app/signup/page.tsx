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
import { ArrowLeft, GraduationCap, Presentation, Eye, EyeOff, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [accessCode, setAccessCode] = useState(""); // Add state for access code
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 10) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength(password);
  const strengthColor = strength <= 2 ? "bg-destructive" : strength <= 4 ? "bg-yellow-500" : "bg-green-500";
  const strengthText = strength <= 2 ? "Weak" : strength <= 4 ? "Medium" : "Strong";

  const handleSignup = async (role: "teacher" | "student") => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Validate teacher access code
    if (role === "teacher" && accessCode !== process.env.NEXT_PUBLIC_TEACHER_ACCESS_CODE) {
      setError("Invalid Teacher Access Code");
      return;
    }
    // No class code required for student signup; will be needed to join a class later

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
          <CardTitle className="text-2xl font-bold">Join Scorpio</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
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
                  <Label htmlFor="student-name">Full Name</Label>
                  <Input
                    id="student-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label="Full Name"
                    required
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-2"
                >
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="student@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email"
                    required
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="student-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="student-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      aria-label="Password"
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
                  {password && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1"
                    >
                      <div className="flex h-1 w-full gap-1 overflow-hidden rounded-full bg-muted">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-full flex-1 transition-colors duration-300 ${
                              i <= strength ? strengthColor : "bg-transparent"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right">
                        Strength: <span className="font-medium">{strengthText}</span>
                      </p>
                    </motion.div>
                  )}
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Label htmlFor="student-code">Class Code (Optional)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Ask your teacher for a code to join their class.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="student-code"
                    placeholder="e.g. CLASS123"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    aria-label="Class Code"
                  />
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
                    onClick={() => handleSignup("student")}
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Sign up as Student"}
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
                  <Label htmlFor="teacher-name">Full Name</Label>
                  <Input
                    id="teacher-name"
                    placeholder="Dr. Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label="Full Name"
                    required
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-2"
                >
                  <Label htmlFor="teacher-email">Email</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="teacher@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email"
                    required
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="teacher-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="teacher-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      aria-label="Password"
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
                  {password && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1"
                    >
                      <div className="flex h-1 w-full gap-1 overflow-hidden rounded-full bg-muted">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-full flex-1 transition-colors duration-300 ${
                              i <= strength ? strengthColor : "bg-transparent"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right">
                        Strength: <span className="font-medium">{strengthText}</span>
                      </p>
                    </motion.div>
                  )}
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Label htmlFor="teacher-code">Access Code</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Enter the special code provided to teachers.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <Input
                      id="teacher-code"
                      type={showAccessCode ? "text" : "password"}
                      placeholder="Required for teacher accounts"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="pr-10"
                      aria-label="Teacher Access Code"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessCode(!showAccessCode)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showAccessCode ? "Hide access code" : "Show access code"}
                    >
                      {showAccessCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    onClick={() => handleSignup("teacher")}
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Sign up as Teacher"}
                  </Button>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
          </TooltipProvider>
          
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
