"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Organization } from "@/lib/types";
import { RaiseLogo } from "@/components/ui/raise-logo";
import { ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SNOOZE_KEY = "scorpio_department_banner_snooze_until";
const SNOOZE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Helper to determine whether an organization has an active Department plan.
 */
export function isOnDepartmentPlan(org: Partial<Organization> | null | undefined): boolean {
  if (!org) return false;
  if (!org.planId || org.planId === "free") return false;
  if (org.subscriptionStatus && org.subscriptionStatus !== "active") return false;
  return true;
}

export function DepartmentBanner({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, profile, loading: authLoading } = useAuth();
  const [organization, setOrganization] = useState<Organization | null | undefined>(undefined);
  const [isSnoozed, setIsSnoozed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(SNOOZE_KEY);
      if (raw) {
        const until = parseInt(raw, 10);
        if (Number.isFinite(until) && Date.now() < until) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (authLoading || !profile?.organizationId) return;

    let unsubscribe: (() => void) | undefined;
    try {
      const orgRef = doc(db, "organizations", profile.organizationId);
      unsubscribe = onSnapshot(
        orgRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setOrganization({ id: snapshot.id, ...snapshot.data() } as Organization);
          } else {
            setOrganization(null);
          }
        },
        (error) => {
          console.error("Error fetching organization for department banner:", error);
          setOrganization(null);
        }
      );
    } catch (err) {
      console.error("Failed to subscribe to organization for department banner:", err);
    }

    return () => {
      unsubscribe?.();
    };
  }, [profile?.organizationId, authLoading]);

  const handleDismiss = () => {
    setIsSnoozed(true);
    try {
      localStorage.setItem(SNOOZE_KEY, (Date.now() + SNOOZE_DURATION_MS).toString());
    } catch {
      // Ignore
    }
  };

  // Do not show while auth is loading, if user is missing, if student, or if snoozed
  if (authLoading || !user || profile?.role === "student" || isSnoozed) {
    return null;
  }

  // Hide on billing page itself (user is already there)
  if (pathname === "/teacher/network/billing") {
    return null;
  }

  // If profile is loaded without an organization, user is not on department
  const hasNoOrg = profile !== null && !profile?.organizationId;

  // While fetching org for a user with organizationId, do not show yet
  if (!hasNoOrg && organization === undefined) {
    return null;
  }

  const onDepartment = !hasNoOrg && isOnDepartmentPlan(organization);
  if (onDepartment) {
    return null;
  }

  return (
    <div className="sticky top-2.5 z-30 flex w-full justify-center px-4 pointer-events-none mb-1">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          className={cn(
            "pointer-events-auto flex items-center gap-2 rounded-full border border-purple-500/35 bg-purple-950/85 px-3.5 py-1.5 text-xs text-purple-200 shadow-md shadow-purple-950/40 backdrop-blur-md transition-colors hover:border-purple-500/50",
            className
          )}
        >
          <RaiseLogo size={13} className="text-purple-400 shrink-0" />
          <span className="text-[11px] sm:text-xs font-medium text-purple-100">
            AI features with Raise are limited on your current plan.
          </span>
          <Link
            href="/teacher/network/billing"
            className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-bold text-white underline underline-offset-2 hover:text-purple-200 transition-colors ml-0.5"
          >
            Upgrade in Billing
            <ArrowRight className="size-3 inline-block" />
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="ml-1 rounded-full p-0.5 text-purple-400/80 hover:bg-purple-800/50 hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss for 7 days"
            title="Dismiss for 7 days"
          >
            <X className="size-3.5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default DepartmentBanner;
