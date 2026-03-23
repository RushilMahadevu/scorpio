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
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <SpaceBackground />
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-background/80 rounded-full px-3 py-1 shadow-sm border border-border/50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-5">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center"
              >
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-2"
              >
                <h2 className="text-2xl font-bold">Request Submitted</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Thank you, <span className="text-foreground font-semibold">{name}</span>. Your access
                  request for <span className="text-foreground font-semibold">{institution}</span> has
                  been received.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed pt-1">
                  We&apos;ll review your request and send your invite code to{" "}
                  <span className="text-foreground font-semibold">{email}</span> within 1–2 business days.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-2 w-full pt-2"
              >
                <Link href="/signup">
                  <Button className="w-full rounded-full" variant="outline">
                    Back to Sign Up
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full rounded-full" variant="ghost">
                    Return to Home
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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <SpaceBackground />
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-background/80 rounded-full px-3 py-1 shadow-sm border border-border/50"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardHeader className="text-center">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-7 w-7 text-primary" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold">Request Organization Access</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Teacher accounts require an invite code. Tell us about your institution and
              we&apos;ll send one directly to your inbox.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="req-name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="req-name"
                  placeholder="Dr. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-2"
              >
                <Label htmlFor="req-email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="req-email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </motion.div>
            </div>

            {/* Institution */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="req-institution" className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Institution / Organization <span className="text-destructive">*</span>
              </Label>
              <Input
                id="req-institution"
                placeholder="MIT, Harvard, Lincoln High School…"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
              />
            </motion.div>

            {/* Role */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <Label className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                Your Role <span className="text-destructive">*</span>
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="instructor">Instructor / Lecturer</SelectItem>
                  <SelectItem value="high_school_teacher">High School Teacher</SelectItem>
                  <SelectItem value="department_head">Department Head</SelectItem>
                  <SelectItem value="dean">Dean / Administrator</SelectItem>
                  <SelectItem value="ta">Teaching Assistant</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="req-message" className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                How do you plan to use Scorpio?{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="req-message"
                placeholder="e.g. I teach introductory mechanics to ~120 students each semester and want to add scaffolded AI tutoring…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </motion.div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                className="w-full transition-all active:scale-[0.98] hover:shadow-md"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Submitting…" : "Submit Access Request"}
              </Button>
            </motion.div>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Already have an invite code?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up here
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-[11px] text-muted-foreground/60 mt-4 px-4"
        >
          Requests are reviewed manually. We typically respond within 1–2 business days.
          By submitting, you agree to our{" "}
          <Link href="/terms" className="hover:underline">Terms</Link> and{" "}
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>.
        </motion.p>
      </motion.div>
    </div>
  );
}
