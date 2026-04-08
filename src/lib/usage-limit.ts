import { adminDb } from './firebase-admin';
import { polar } from './polar';

/**
 * GEMINI 2.5 FLASH PRICING (Paid Tier):
 * - Input: $0.15 per 1,000,000 Tokens (0.000015 cents per token)
 * - Output: $0.60 per 1,000,000 Tokens (0.000060 cents per token)
 */

// Cost per single token in cents (floating point)
const RATES = {
  input: 0.000015,
  output: 0.000060,
};

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
    if (!data?.planId || data.planId === "free") {
      return { allowed: false, error: "AI Features require a Standard subscription." };
    }

    if (data?.subscriptionStatus === "canceled" || data?.subscriptionStatus === "revoked") {
      return { allowed: false, error: "Your subscription is no longer active." };
    }

    // 2. Network-wide Budget Enforcement (Hard Cap in cents)
    const budgetLimit = data?.aiBudgetLimit || 0;
    const currentUsage = data?.aiUsageCurrent || 0;

    if (budgetLimit > 0 && currentUsage >= budgetLimit) {
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
        const studentUsage = userData?.tutorUsageCurrent || 0;

        if (teacherAllowance > 0 && studentUsage >= teacherAllowance) {
          return { 
            allowed: false, 
            error: `You have used all ${teacherAllowance} of your AI Tutor messages for this period. Contact your teacher to increase your allowance.` 
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
        const notebookUsage = userData?.aiNotebookUsageCurrent || 0;

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
  organizationId: string | undefined | null,
  type: string,
  inputTokens: number,
  outputTokens: number,
  userId?: string
): Promise<{ success: boolean; overLimit?: boolean }> {
  if (!organizationId || !adminDb) return { success: false };

  const costCents = (inputTokens * RATES.input) + (outputTokens * RATES.output);
  let polarCustomerId: string | null = null;

  try {
    const orgRef = adminDb.collection("organizations").doc(organizationId);
    const userRef = userId ? adminDb.collection("users").doc(userId) : null;
    const usageLogRef = adminDb.collection("usage_analytics").doc();

    await adminDb.runTransaction(async (transaction) => {
      // ALL reads must come before any writes in a Firestore transaction
      const orgDoc = await transaction.get(orgRef);
      const userDoc = (["tutor", "practice", "notebook"].includes(type) && userRef) ? await transaction.get(userRef) : null;

      if (!orgDoc.exists) return;

      const data = orgDoc.data();
      const userData = userDoc?.data();
      polarCustomerId = data?.polarCustomerId || null;
      const currentUsage = data?.aiUsageCurrent || 0;

      // 1. Update Network Budget
      transaction.set(orgRef, {
        aiUsageCurrent: currentUsage + costCents,
        lastAiUsageAt: new Date(),
        aiUsageTotalCents: (data?.aiUsageTotalCents || 0) + costCents
      }, { merge: true });

      // 2. Update Student Specific Message Count
      if (userRef && userData) {
        if (type === "tutor") {
          transaction.set(userRef, {
            tutorUsageCurrent: (userData.tutorUsageCurrent || 0) + 1,
            lastTutorUsageAt: new Date()
          }, { merge: true });
        } else if (type === "practice") {
          transaction.set(userRef, {
            practiceUsageCurrent: (userData.practiceUsageCurrent || 0) + 1,
            lastPracticeUsageAt: new Date()
          }, { merge: true });
        } else if (type === "notebook") {
          transaction.set(userRef, {
            aiNotebookUsageCurrent: (userData.aiNotebookUsageCurrent || 0) + 1,
            lastAiNotebookUsageAt: new Date()
          }, { merge: true });
        }
      }

      // 3. Log into analytics
      transaction.set(usageLogRef, {
        organizationId,
        userId: userId || null,
        type,
        inputTokens,
        outputTokens,
        costCents,
        timestamp: new Date()
      });
    });

    // Report to Polar for metered billing
    console.log("[Polar] polarCustomerId:", polarCustomerId, "| costCents:", costCents);
    if (polarCustomerId) {
      try {
        await polar.events.ingest({
          events: [{
            customerId: polarCustomerId,
            name: "ai_usage",
            timestamp: new Date(),
            metadata: {
              // Polar meter filter: Metadata | event_name | equals | ai_usage
              event_name: "ai_usage",
              input_tokens: inputTokens,
              output_tokens: outputTokens,
              // Extra context fields
              vendor: "google",
              model: "gemini-2.5-flash",
              costUSD: parseFloat((costCents / 100).toFixed(8)),
              type: String(type),
              organizationId: String(organizationId),
            }
          }]
        });
        console.log("[Polar] Ingested ai_usage event for", polarCustomerId);
      } catch (polarErr) {
        console.error("[Polar] Failed to ingest usage event:", polarErr);
      }
    } else {
      console.warn("[Polar] Skipping metering — no polarCustomerId on org", organizationId);
    }

    return { success: true };
  } catch (err) {
    console.error("[recordUsage] Error:", err);
    return { success: false };
  }
}

// Legacy export (keeping for backwards compatibility during migration)
export async function checkAndIncrementUsage(
  organizationId: string | undefined | null,
  type?: string
): Promise<{ allowed: boolean; error?: string }> {
  return checkBudget(organizationId, type);
}
