"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Waypoints,
  Cpu,
  Sliders,
} from "lucide-react";

export interface DepartmentUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  feature?: "waypoints" | "vault-custom" | "vault-lock" | "network-share" | "general";
  hasNoOrg?: boolean;
}

const FEATURE_CONFIGS = {
  waypoints: {
    badge: "Template Library",
    title: "Unlock Full Waypoint Library",
    description: "Free plans include 3 starter waypoints. A Department License gives your entire department unlimited access to all 20+ physics templates.",
  },
  "vault-custom": {
    badge: "Vault Controls",
    title: "Unlock Custom Equations",
    description: "Add and distribute custom LaTeX formulas across all your classes with a Department License.",
  },
  "vault-lock": {
    badge: "Exam Integrity",
    title: "Exam Equation Controls",
    description: "Lock and unlock specific equations per class during assessments with a Department License. All 24 standard formulas remain permanently active on the Free plan.",
  },
  "network-share": {
    badge: "Department Collaboration",
    title: "Unlock Department Sharing",
    description: "Collaborate with physics teachers across your school to share assignments, curriculum templates, and standardized vaults.",
  },
  general: {
    badge: "Department License",
    title: "Upgrade to Department License",
    description: "Empower your physics department with collaborative curriculum sharing, advanced exam integrity controls, and full AI access.",
  },
};

export function DepartmentUpgradeDialog({
  open,
  onOpenChange,
  title,
  description,
  feature = "general",
  hasNoOrg = false,
}: DepartmentUpgradeDialogProps) {
  const config = FEATURE_CONFIGS[feature] || FEATURE_CONFIGS.general;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const billingHref = hasNoOrg ? "/teacher/network" : "/teacher/network/billing";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-purple-500/20 rounded-3xl">
        <div className="relative bg-gradient-to-br from-purple-950/40 via-purple-900/10 to-background p-6 border-b border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20 uppercase tracking-widest text-[10px] font-bold">
              <Sparkles className="h-3 w-3 mr-1" />
              {config.badge}
            </Badge>
          </div>
          <DialogHeader className="text-left space-y-1.5">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500 shrink-0" />
              {displayTitle}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {displayDescription}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Included with Department License
          </p>

          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <Waypoints className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <span className="text-foreground">
                <strong>Unlimited Waypoints:</strong> Access all 20+ verified physics curriculum templates
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Sliders className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <span className="text-foreground">
                <strong>Custom Vault Equations:</strong> Author custom LaTeX formulas for your courses
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <span className="text-foreground">
                <strong>Exam Vault Locking:</strong> Selectively lock equations per class for tests
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Cpu className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <span className="text-foreground">
                <strong>Department AI Budget:</strong> Full access to Raise AI hints, rubrics & generation
              </span>
            </li>
          </ul>

          <div className="rounded-xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/20 p-3 text-xs text-purple-900 dark:text-purple-200">
            <strong>Free Plan Status:</strong> Standard physics features remain active for all your classes, including all 24 core physics equations and 3 starter waypoints.
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="sm:order-1 font-medium"
          >
            Maybe Later
          </Button>
          <Button
            asChild
            className="sm:order-2 bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2"
          >
            <Link href={billingHref} onClick={() => onOpenChange(false)}>
              {hasNoOrg ? "Join or Create Department" : "View Department License"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
