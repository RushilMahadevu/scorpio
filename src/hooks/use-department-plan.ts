"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Organization } from "@/lib/types";

export function isOnDepartmentPlan(org: Partial<Organization> | null | undefined): boolean {
  if (!org) return false;
  const plan = org.planId;
  const status = org.subscriptionStatus;
  if (!plan || plan === "free") return false;
  return status === "active";
}

export function useDepartmentPlan() {
  const { profile, loading: authLoading } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);

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
          console.error("Error fetching organization in useDepartmentPlan:", error);
          setOrganization(null);
        }
      );
    } catch (err) {
      console.error("Failed to subscribe to organization in useDepartmentPlan:", err);
    }

    return () => {
      unsubscribe?.();
    };
  }, [profile?.organizationId, authLoading]);

  const effectiveOrg = profile?.organizationId ? organization : null;
  const isDepartment = Boolean(profile?.organizationId && isOnDepartmentPlan(effectiveOrg));

  return {
    isDepartmentPlan: isDepartment,
    isFreePlan: !isDepartment,
    organization: effectiveOrg,
    loading: authLoading,
    hasNoOrg: !profile?.organizationId,
  };
}
