"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  X,
  RefreshCw,
  Copy,
  Inbox,
  Building2,
  Briefcase,
  MessageSquare,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  institution: string;
  role: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string | null;
  reviewedAt: string | null;
  generatedCode: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  professor: "Professor",
  instructor: "Instructor / Lecturer",
  high_school_teacher: "High School Teacher",
  department_head: "Department Head",
  dean: "Dean / Admin",
  ta: "Teaching Assistant",
  other: "Other",
};

interface AccessRequestsProps {
  adminSecret: string;
}

export function AccessRequests({ adminSecret }: AccessRequestsProps) {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailRequest, setDetailRequest] = useState<AccessRequest | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [justApproved, setJustApproved] = useState<{ id: string; code: string } | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ action: "list" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load requests");
      setRequests(data.requests ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [adminSecret]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (req: AccessRequest) => {
    setProcessing(req.id);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ action: "approve", id: req.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to approve request");
      setJustApproved({ id: req.id, code: data.code });
      setDetailRequest(null);
      await fetchRequests();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (req: AccessRequest) => {
    setProcessing(req.id);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ action: "reject", id: req.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to reject request");
      setDetailRequest(null);
      await fetchRequests();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcessing(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  return (
    <>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Access Requests
                  {pending.length > 0 && (
                    <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/20 text-xs px-2 py-0.5">
                      {pending.length} pending
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-0.5">
                  Review org access requests. Approving auto-generates a 60-day invite code.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Just-approved banner */}
          <AnimatePresence>
            {justApproved && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-600 dark:text-green-400">Approved! Invite code:</span>
                  <code className="font-mono font-bold tracking-widest text-foreground">
                    {justApproved.code}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-7 text-xs"
                    onClick={() => copyToClipboard(justApproved.code)}
                  >
                    {copiedCode === justApproved.code ? (
                      <><Check className="h-3 w-3" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy</>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground"
                    onClick={() => setJustApproved(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pending", value: pending.length, color: "text-amber-500" },
              { label: "Approved", value: requests.filter((r) => r.status === "approved").length, color: "text-green-500" },
              { label: "Total", value: requests.length, color: "text-foreground" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-center"
              >
                <p className={cn("text-2xl font-bold tabular-nums", s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pending requests */}
          {pending.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pending Review
              </p>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Institution</TableHead>
                      <TableHead className="text-xs">Role</TableHead>
                      <TableHead className="text-xs">
                        <Clock className="h-3 w-3 inline mr-1" />Submitted
                      </TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.map((r) => (
                      <TableRow
                        key={r.id}
                        className="hover:bg-muted/20 cursor-pointer"
                        onClick={() => setDetailRequest(r)}
                      >
                        <TableCell className="text-sm font-medium">{r.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.institution}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ROLE_LABELS[r.role] ?? r.role}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(r.createdAt)}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                  onClick={() => handleApprove(r)}
                                  disabled={processing === r.id}
                                >
                                  {processing === r.id ? (
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Approve & generate code</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleReject(r)}
                                  disabled={processing === r.id}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reject request</TooltipContent>
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

          {/* Reviewed requests */}
          {reviewed.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Reviewed
              </p>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Institution</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Code</TableHead>
                      <TableHead className="text-xs">Reviewed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewed.map((r) => (
                      <TableRow key={r.id} className="opacity-70 hover:opacity-90 cursor-pointer" onClick={() => setDetailRequest(r)}>
                        <TableCell className="text-sm font-medium">{r.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.institution}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              r.status === "approved"
                                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            )}
                          >
                            {r.status === "approved" ? "Approved" : "Rejected"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-sm font-mono tracking-widest text-muted-foreground"
                          onClick={(e) => {
                            if (r.generatedCode) {
                              e.stopPropagation();
                              copyToClipboard(r.generatedCode);
                            }
                          }}
                        >
                          {r.generatedCode ? (
                            <span className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
                              {r.generatedCode}
                              {copiedCode === r.generatedCode ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 opacity-50" />
                              )}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(r.reviewedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {loading && requests.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading requests…
            </div>
          )}

          {!loading && requests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <Inbox className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No access requests yet.</p>
              <p className="text-xs text-muted-foreground/60">
                Requests submitted via /request-access will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailRequest} onOpenChange={(open) => !open && setDetailRequest(null)}>
        <DialogContent className="max-w-lg">
          {detailRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detailRequest.name}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      detailRequest.status === "pending"
                        ? "bg-amber-500/15 text-amber-500 border-amber-500/20"
                        : detailRequest.status === "approved"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {detailRequest.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>{detailRequest.email}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/30 border border-border/50 p-3 space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Institution
                    </p>
                    <p className="text-sm font-medium">{detailRequest.institution}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 border border-border/50 p-3 space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> Role
                    </p>
                    <p className="text-sm font-medium">
                      {ROLE_LABELS[detailRequest.role] ?? detailRequest.role}
                    </p>
                  </div>
                </div>

                {detailRequest.message && (
                  <div className="rounded-lg bg-muted/30 border border-border/50 p-3 space-y-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Message
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {detailRequest.message}
                    </p>
                  </div>
                )}

                {detailRequest.generatedCode && (
                  <div
                    className="rounded-lg bg-green-500/8 border border-green-500/20 p-3 flex items-center justify-between cursor-pointer hover:bg-green-500/15 transition-colors"
                    onClick={() => copyToClipboard(detailRequest.generatedCode!)}
                  >
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-green-600 dark:text-green-400 mb-0.5">
                        Generated Code
                      </p>
                      <code className="font-mono font-bold tracking-widest text-foreground">
                        {detailRequest.generatedCode}
                      </code>
                    </div>
                    {copiedCode === detailRequest.generatedCode ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Submitted: {formatDate(detailRequest.createdAt)}
                </p>

                {detailRequest.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(detailRequest)}
                      disabled={!!processing}
                    >
                      {processing === detailRequest.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve & Generate Code
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleReject(detailRequest)}
                      disabled={!!processing}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
