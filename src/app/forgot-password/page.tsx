"use client";

import { useState } from "react";
import { resetPassword } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpaceBackground } from "@/components/ui/space-background";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error("Reset password error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <SpaceBackground />
      
      <Link 
        href="/login" 
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-background/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-border/50 z-20"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Login</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-primary/20 shadow-2xl backdrop-blur-md bg-background/80">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Logo size={56} className="text-primary" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password?</CardTitle>
            <CardDescription className="text-balance px-4 mt-2">
              No problem! It happens to the best of us. Enter your email and we&apos;ll send you a link to reset it.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSubmit} 
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium ml-1">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50 border-white/10 focus:border-primary/50 py-6"
                      disabled={loading}
                    />
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-lg flex items-center gap-2"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                      {error}
                    </motion.div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full py-6 h-auto text-base font-semibold transition-all active:scale-[0.98] shadow-lg shadow-primary/20 hover:shadow-primary/30" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Reset Link
                      </span>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-6"
                >
                  <div className="flex justify-center flex-col items-center gap-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Check your email</h3>
                      <p className="text-sm text-muted-foreground px-4">
                        We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>. Click the link in the email to set a new password.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full py-6 h-auto border-white/10 bg-primary/5 hover:bg-primary/10" 
                      onClick={() => setSuccess(false)}
                    >
                      Try a different email
                    </Button>
                    <Link href="/login" className="block">
                      <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                        Return to sign in
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        
        <p className="text-center mt-8 text-xs text-muted-foreground/60 tracking-wider font-medium">
          SCORPIO PLATFORM &copy; 2026
        </p>
      </motion.div>
    </div>
  );
}
