"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpaceBackground } from "@/components/ui/space-background";
import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Building2,
  Mail,
  User,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
export default function RequestAccessPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !institution || !role) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    let res: Response;
    try {
      res = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, institution, role, message }),
      });
    } catch {
      setError("Unable to reach the server. Please check your internet connection and try again.");
      setLoading(false);
      return;
    }

    try {
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      // Server returned a non-JSON response (e.g. a crash page)
      setError(
        res.ok
          ? "Unexpected server response. Please try again."
          : `Server error (${res.status}). Please try again later.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <SpaceBackground />
        <Link
          href="/"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all bg-background/40 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg z-10"
        >
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            <CardContent className="pt-12 pb-12 flex flex-col items-center text-center gap-6 relative z-10">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30"
              >
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-3"
              >
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Request Received</h2>
                <div className="space-y-2 max-w-sm mx-auto">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Thank you, <span className="text-foreground font-semibold text-primary">{name}</span>. Your access
                    request for <span className="text-foreground font-semibold text-primary">{institution}</span> is in our queue.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our team manually reviews every educator request. We&apos;ll reach out to{" "}
                    <span className="text-foreground font-semibold text-primary">{email}</span> within 24–48 hours.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-3 w-full max-w-xs pt-4"
              >
                <Link href="/signup">
                  <Button className="w-full rounded-full h-11 bg-primary text-primary-foreground hover:opacity-90 transition-opacity" variant="default">
                    Go to Sign Up
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full rounded-full h-11 border-border/50" variant="outline">
                    Return Home
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch relative overflow-hidden bg-background transition-colors duration-300">
      <div className="absolute inset-0 z-0 dark:opacity-100 opacity-30 pointer-events-none">
        <SpaceBackground />
      </div>

      {/* Navigation */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-30 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all bg-background/40 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-border/50"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Return Home</span>
      </Link>

      <div className="flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto z-10">
        {/* Left Side: Form */}
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-24 relative overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto w-full lg:mx-0"
          >
            <div className="mb-10 space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center mb-2"
              >
                <KeyRound className="h-6 w-6 text-primary" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-foreground/60">
                Join the Network
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                Scorpio is currently in invite-only beta for verified educators.
                Apply for institutional access and we&apos;ll help you get started.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2.5"
              >
                <Label htmlFor="req-name" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  Full Name
                </Label>
                <Input
                  id="req-name"
                  placeholder="Dr. William Adams"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-secondary/30 border-border/50 h-11 focus:ring-primary/50 transition-all rounded-lg"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-2.5"
              >
                <Label htmlFor="req-email" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Work Email
                </Label>
                <Input
                  id="req-email"
                  type="email"
                  placeholder="William@stanford.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary/30 border-border/50 h-11 focus:ring-primary/50 transition-all rounded-lg"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="space-y-2.5">
                <Label htmlFor="req-institution" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  Institution
                </Label>
                <Input
                  id="req-institution"
                  placeholder="Stanford University, Berkeley High School..."
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                  className="bg-secondary/30 border-border/50 h-11 focus:ring-primary/50 transition-all rounded-lg"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  Scientific Role
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="cursor-pointer bg-secondary/30 border-border/50 h-11 focus:ring-primary/50 rounded-lg">
                    <SelectValue placeholder="Select your role…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professor" className="cursor-pointer">Professor</SelectItem>
                    <SelectItem value="instructor" className="cursor-pointer">Instructor / Lecturer</SelectItem>
                    <SelectItem value="high_school_teacher" className="cursor-pointer">High School Teacher</SelectItem>
                    <SelectItem value="department_head" className="cursor-pointer">Department Head</SelectItem>
                    <SelectItem value="dean" className="cursor-pointer">Dean / Administrator</SelectItem>
                    <SelectItem value="ta" className="cursor-pointer">Teaching Assistant</SelectItem>
                    <SelectItem value="other" className="cursor-pointer">Other Academic Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="req-message" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Project Goals <span className="text-[10px] uppercase font-bold tracking-wider opacity-50 ml-1">(Optional)</span>
                </Label>
                <Textarea
                  id="req-message"
                  placeholder="How do you plan to use Scorpio in your classroom or research?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-secondary/30 border-border/50 min-h-[120px] focus:ring-primary/50 transition-all rounded-lg resize-none"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-semibold text-red-100 bg-red-500/10 border border-red-500/20 p-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <Button
                className="cursor-pointer w-full h-12 text-base font-semibold transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-primary/20 rounded-lg bg-primary text-primary-foreground"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Submit Access Request"
                )}
              </Button>

              <div className="pt-2 text-center text-sm text-muted-foreground">
                Already have an invite?{" "}
                <Link href="/signup" className="text-primary hover:underline font-semibold underline-offset-4 decoration-2">
                  Sign up instead
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Image/Branding */}
        <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-20 animate-pulse" />
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-10" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 w-full max-w-lg aspect-square"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-2xl opacity-40 -rotate-3 translate-y-4" />
            <div className="relative h-full w-full rounded-3xl border border-border/50 bg-secondary/30 backdrop-blur-sm shadow-2xl overflow-hidden group">
              <img
                src="/mission-control.png"
                alt="Scorpio Faculty Network"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent flex flex-col justify-end p-8">
                <div className="space-y-2">
                  <div className="h-1 w-12 bg-primary rounded-full" />
                  <h3 className="text-2xl font-bold text-foreground">Scientific Knowledge, Democratized.</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Empower your students with AI-first physics tutoring and real-time verifiable intelligence.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating badges/elements for "premium" feel */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 p-4 px-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-tighter">Verified</p>
                  <p className="text-[10px] text-muted-foreground">Educator Badge</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-8 p-4 px-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground uppercase tracking-tighter">Institution</p>
                  <p className="text-[10px] text-muted-foreground">Early Access Program</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
