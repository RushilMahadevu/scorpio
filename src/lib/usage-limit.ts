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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _type?: string
): Promise<{ allowed: boolean; error?: string }> {
  if (!organizationId) {
    return { allowed: false, error: "AI Features require a Standard subscription." };
  }

  if (!adminDb) return { allowed: false, error: "Database not initialized" };

  try {
    const orgDoc = await adminDb.collection("organizations").doc(organizationId).get();
    if (!orgDoc.exists) return { allowed: false, error: "Scorpio Network not found." };

    const data = orgDoc.data();

    if (!data?.planId || data.planId === "free") {
      return { allowed: false, error: "AI Features require a Standard subscription." };
    }

    if (data?.subscriptionStatus === "canceled" || data?.subscriptionStatus === "revoked") {
      return { allowed: false, error: "Your subscription is no longer active." };
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

  try {
    const orgRef = adminDb.collection("organizations").doc(organizationId);
    const usageLogRef = adminDb.collection("usage_analytics").doc();

    await adminDb.runTransaction(async (transaction) => {
      const orgDoc = await transaction.get(orgRef);
      if (!orgDoc.exists) return;

      const data = orgDoc.data();
      polarCustomerId = data?.polarCustomerId || null;
      const currentUsage = data?.aiUsageCurrent || 0;

      // Track usage in Firestore for analytics (billing cap is enforced by Polar's $100 meter limit)
      transaction.set(orgRef, {
        aiUsageCurrent: currentUsage + costCents,
        lastAiUsageAt: new Date(),
        aiUsageTotalCents: (data?.aiUsageTotalCents || 0) + costCents
      }, { merge: true });

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
    console.log("[Polar] polarCustomerId:", polarCustomerId, "| costCents:", costCents);
    if (polarCustomerId) {
      try {
        await polar.events.ingest({
          events: [{
            customerId: polarCustomerId,
            name: "ai_usage",
            timestamp: new Date(),
            metadata: {
              // Polar meter aggregation expects these exact property paths:
              // "Input Tokens" meter: sum of llm.input_tokens
              // "Output Tokens" meter: sum of llm.output_tokens
              "llm.input_tokens": inputTokens,
              "llm.output_tokens": outputTokens,
              // Extra context fields
              vendor: "google",
              model: "gemini-2.5-flash",
              costCents: parseFloat(costCents.toFixed(6)),
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
