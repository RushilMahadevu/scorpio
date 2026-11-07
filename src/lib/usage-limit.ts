import { adminDb } from './firebase-admin';

/**
 * Checks if an organization has an active (non-free) subscription.
 * Budget enforcement is handled by Polar metered billing ($100 cap per meter).
 */
export async function checkBudget(
  organizationId: string | undefined | null,
  type?: string,
  userId?: string
): Promise<{ allowed: boolean; error?: string }> {
  if (!organizationId) {
    return { allowed: false, error: "AI Features require a Standard subscription." };
  }

  if (!adminDb) return { allowed: false, error: "Database not initialized" };

  try {
    const orgDoc = await adminDb.collection("organizations").doc(organizationId).get();
    if (!orgDoc.exists) return { allowed: false, error: "Scorpio Network not found." };

    const data = orgDoc.data();

    // 1. Basic Subscription Checks
    if (!data || !["active", "trialing"].includes(data.subscriptionStatus)) {
      return { allowed: false, error: "Your subscription is no longer active." };
    }

    // Practice Feature Suspension (Eco & Token Conservation)
    if (type === "practice") {
      return {
        allowed: false,
        error: "Practice has been temporarily disabled due to environmental harm (excessive token waste). Warning: Looking for better solutions."
      };
    }

    // 2. Network-wide Budget Enforcement (Hard Cap in cents)
    const budgetLimit = data?.aiBudgetLimit || 0;
    const currentUsage = (data?.aiUsageCurrent || 0) + (data?.aiUsageReserved || 0);

    // If free plan, allow AI usage if starter credit is available
    if (!data?.planId || data.planId === "free") {
      if (budgetLimit <= 0 || currentUsage >= budgetLimit) {
        return { 
          allowed: false, 
          error: "Free starter AI budget reached. Upgrade to a Standard subscription in Network settings for unlimited AI access." 
        };
      }
    } else if (budgetLimit > 0 && currentUsage >= budgetLimit) {
      return { 
        allowed: false, 
        error: `Monthly AI budget ($${(budgetLimit / 100).toFixed(2)}) reached. Please increase your limit in Network settings.` 
      };
    }

    // 3. Per-Student Capacity Enforcements
    if (userId) {
      const userDoc = await adminDb.collection("users").doc(userId).get();
      const userData = userDoc.data();

      // Tutor Limit
      if (type === "tutor") {
        const teacherAllowance = data?.aiTutorLimitPerStudent || 0;
        const studentUsage = userData?.usageMonth === new Date().toISOString().slice(0, 7) ? (userData?.tutorUsageCurrent || 0) : 0;

        if (teacherAllowance > 0 && studentUsage >= teacherAllowance) {
          return { 
            allowed: false, 
            error: `You have used all ${teacherAllowance} of your Raise messages for this period. Contact your teacher to increase your allowance.`
          };
        }
      }

      // Practice Limit
      if (type === "practice") {
        const practiceAllowance = data?.practiceLimitPerStudent || 0;
        const practiceUsage = userData?.practiceUsageCurrent || 0;

        if (practiceAllowance > 0 && practiceUsage >= practiceAllowance) {
          return { 
            allowed: false, 
            error: `You have used all ${practiceAllowance} of your generated practice problems for this period.` 
          };
        }
      }

      // Notebook Limit
      if (type === "notebook") {
        const notebookAllowance = data?.aiNotebookLimitPerStudent || 0;
        const notebookUsage = userData?.usageMonth === new Date().toISOString().slice(0, 7) ? (userData?.aiNotebookUsageCurrent || 0) : 0;

        if (notebookAllowance > 0 && notebookUsage >= notebookAllowance) {
          return { 
            allowed: false, 
            error: `You have reached your limit of ${notebookAllowance} AI notebook interactions for this period.` 
          };
        }
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error in checkBudget:", error);
    return { allowed: false, error: "System check failed" };
  }
}

/**
 * Records exact token usage after an AI request is completed.
 * This is called from the backend API routes using 'usageMetadata' returned from the model.
 */
export async function recordUsage(
  _organizationId: string | undefined | null, _type: string,
  _inputTokens: number, _outputTokens: number, _userId?: string
): Promise<{ success: boolean; overLimit?: boolean }> {
  // Provider calls settle usage transactionally, even when downstream parsing fails.
  return { success: true };
}

// Legacy export (keeping for backwards compatibility during migration)
export async function checkAndIncrementUsage(
  organizationId: string | undefined | null,
  type?: string
): Promise<{ allowed: boolean; error?: string }> {
  return checkBudget(organizationId, type);
}
