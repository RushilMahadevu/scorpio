"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, RefreshCw, Copy, Check, ShieldX, KeyRound, User, Clock, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface InviteCode {
  code: string;
  label: string | null;
  isUsed: boolean;
  createdAt: string | null;
  expiresAt: string | null;
  usedAt: string | null;
  usedByEmail: string | null;
}

interface TeacherInviteCodesProps {
  adminSecret: string;
}

export function TeacherInviteCodes({ adminSecret }: TeacherInviteCodesProps) {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/teacher-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ action: "list" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load codes");
      setCodes(data.codes ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [adminSecret]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/teacher-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ action: "generate", label: label.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate code");
      setLastGenerated(data.code);
      setLabel("");
      setDialogOpen(false);
      await fetchCodes();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (code: string) => {
    setRevoking(code);
    setError(null);
    try {
      const res = await fetch("/api/auth/teacher-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ action: "revoke", code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to revoke code");
      await fetchCodes();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRevoking(null);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const activeCodes = codes.filter((c) => !c.isUsed && !isExpired(c.expiresAt));
  const usedOrExpiredCodes = codes.filter((c) => c.isUsed || isExpired(c.expiresAt));

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Teacher Invite Codes</CardTitle>
              <CardDescription className="mt-0.5">
                Generate single-use codes to give teachers access. Each code expires in 30 days.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCodes}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  New Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Teacher Invite Code</DialogTitle>
                  <DialogDescription>
                    Add an optional label (e.g. the teacher's name or school) to keep track of who you gave this to.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="label">Label (optional)</Label>
                    <Input
                      id="label"
                      placeholder="e.g. Reddit demo, John Smith – Lincoln HS"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !generating && handleGenerate()}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        setLabel("");
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={generating}>
                      {generating ? "Generating…" : "Generate Code"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && !dialogOpen && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Last generated banner */}
        <AnimatePresence>
          {lastGenerated && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">New code generated:</span>
                <code className="font-mono font-bold tracking-widest">{lastGenerated}</code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-7 text-xs"
                onClick={() => copyToClipboard(lastGenerated)}
              >
                {copiedCode === lastGenerated ? (
                  <><Check className="h-3 w-3" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3" /> Copy</>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active", value: activeCodes.length, color: "text-green-500" },
            { label: "Used", value: usedOrExpiredCodes.filter((c) => c.isUsed && c.usedAt).length, color: "text-muted-foreground" },
            { label: "Total Generated", value: codes.length, color: "text-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-center">
              <p className={cn("text-2xl font-bold tabular-nums", stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Active codes table */}
        {activeCodes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Codes</p>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">Code</TableHead>
                    <TableHead className="text-xs"><Tag className="h-3 w-3 inline mr-1" />Label</TableHead>
                    <TableHead className="text-xs"><Clock className="h-3 w-3 inline mr-1" />Expires</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCodes.map((c) => (
                    <TableRow key={c.code} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-sm font-medium tracking-widest">
                        {c.code}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.label ?? <span className="italic text-muted-foreground/50">No label</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(c.expiresAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => copyToClipboard(c.code)}
                              >
                                {copiedCode === c.code ? (
                                  <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy code</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRevoke(c.code)}
                                disabled={revoking === c.code}
                              >
                                <ShieldX className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Revoke code</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Used / expired codes */}
        {usedOrExpiredCodes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Used / Expired</p>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">Code</TableHead>
                    <TableHead className="text-xs"><Tag className="h-3 w-3 inline mr-1" />Label</TableHead>
                    <TableHead className="text-xs"><User className="h-3 w-3 inline mr-1" />Used By</TableHead>
                    <TableHead className="text-xs"><Clock className="h-3 w-3 inline mr-1" />Used At</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usedOrExpiredCodes.map((c) => (
                    <TableRow key={c.code} className="opacity-60 hover:opacity-80">
                      <TableCell className="font-mono text-sm tracking-widest line-through text-muted-foreground">
                        {c.code}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.label ?? <span className="italic text-muted-foreground/50">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.usedByEmail ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(c.usedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {isExpired(c.expiresAt) && !c.usedAt ? "Expired" : "Used"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {loading && codes.length === 0 && (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading codes…
          </div>
        )}

        {!loading && codes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
            <KeyRound className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No invite codes yet.</p>
            <p className="text-xs text-muted-foreground/60">Generate a code to give a teacher access.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
