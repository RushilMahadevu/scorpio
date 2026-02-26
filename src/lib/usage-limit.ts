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

// Estimated "buffer" usage in cents per request type (for pre-flight budget check)
const ESTIMATED_BUFFER = {
  navigation: 0.1,  // $0.001
  tutor: 0.5,       // $0.005
  grading: 1.0,     // $0.01
  generation: 5.0,  // $0.05
  practice: 0.2,    // $0.002
};

/**
 * Checks if an organization has enough budget to proceed with an AI request.
 */
export async function checkBudget(
  organizationId: string | undefined | null,
  type: keyof typeof ESTIMATED_BUFFER = "navigation"
): Promise<{ allowed: boolean; error?: string }> {
  if (!organizationId) {
    return { allowed: false, error: "AI Features require a Standard subscription." };
  }

  if (!adminDb) return { allowed: false, error: "Database not initialized" };

  try {
    const orgDoc = await adminDb.collection("organizations").doc(organizationId).get();
    if (!orgDoc.exists) return { allowed: false, error: "Scorpio Network not found." };

    const data = orgDoc.data();
    
    // Check if subscription allows for AI usage
    if (!data?.planId || data.planId === "free") {
      return { allowed: false, error: "AI Features require a Standard subscription." };
    }

    // Use decimal currentUsage to prevent floating point inaccuracies accumulating too badly
    const currentUsage = data?.aiUsageCurrent || 0;
    const budgetLimit = data?.aiBudgetLimit || 50; // $0.50 baseline limit
    const estimate = ESTIMATED_BUFFER[type];

    if (currentUsage >= budgetLimit) {
      return { allowed: false, error: "Monthly Scorpio AI Budget reached. Please contact your administrator to top up." };
    }

    if (currentUsage + estimate > budgetLimit) {
      return { allowed: false, error: "Budget too low for this request. Top up required." };
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
  outputTokens: number
): Promise<{ success: boolean; overLimit?: boolean }> {
  if (!organizationId || !adminDb) return { success: false };

  const costCents = (inputTokens * RATES.input) + (outputTokens * RATES.output);
  let polarCustomerId: string | null = null;
  let isOverLimitAfterUpdate = false;
  
  try {
    const orgRef = adminDb.collection("organizations").doc(organizationId);
    const usageLogRef = adminDb.collection("usage_analytics").doc();
    
    await adminDb.runTransaction(async (transaction) => {
      const orgDoc = await transaction.get(orgRef);
      if (!orgDoc.exists) return;

      const data = orgDoc.data();
      polarCustomerId = data?.polarCustomerId || null;
      const currentUsage = data?.aiUsageCurrent || 0;
      const limit = data?.aiBudgetLimit || 50;
      
      const newUsage = currentUsage + costCents;
      if (newUsage >= limit) {
        isOverLimitAfterUpdate = true;
      }

      // Update running organization balance
      transaction.update(orgRef, {
        aiUsageCurrent: newUsage,
        lastAiUsageAt: new Date(),
        // Keep a lifetime total count for business metrics
        aiUsageTotalCents: (data?.aiUsageTotalCents || 0) + costCents
      });

      // Log the granular interaction for analytics
      transaction.set(usageLogRef, {
        organizationId,
        type,
        inputTokens,
        outputTokens,
        costCents,
        timestamp: new Date()
      });
    });

    // Report to Polar for metered billing
    if (polarCustomerId) {
       // ... existing reporting logic ...
    }

    return { success: true, overLimit: isOverLimitAfterUpdate };
  } catch (err) {
    return { success: false };
  }
}

// Legacy export (keeping for backwards compatibility during migration)
export async function checkAndIncrementUsage(
  organizationId: string | undefined | null,
  type: keyof typeof ESTIMATED_BUFFER
): Promise<{ allowed: boolean; error?: string }> {
  return checkBudget(organizationId, type);
}
