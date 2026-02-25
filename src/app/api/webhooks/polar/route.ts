import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { validateEvent } from "@polar-sh/nextjs/webhooks";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("polar-signature")!;

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  let event;
  try {
    event = validateEvent(body, signature, process.env.POLAR_WEBHOOK_SECRET!);
  } catch (error: any) {
    console.error("Polar Webhook validation failed:", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "subscription.created":
      case "subscription.updated":
        // data is a Subscription object
        const sub = data as any; 
        const metadata = sub.metadata || {};
        const organizationId = metadata.organizationId;
        const userId = metadata.userId;
        const planId = metadata.planId;

        if (organizationId && userId) {
          // 1. Determine base fee based on the planId
          const planFees: Record<string, number> = {
            standard_monthly: 499,
            standard_yearly: 2988,
            // Transition fallbacks
            pro_monthly: 499,
            pro_yearly: 2988,
            scorpio_monthly: 499,
            scorpio_yearly: 2988,
            department_monthly: 499,
            department_yearly: 2988, 
          };
          const baseMonthlyFee = planFees[planId] || 499; // Default 4.90/4.99 fallback

          // 2. Update Organization in Firestore
          await adminDb!.collection("organizations").doc(organizationId).update({
            polarCustomerId: sub.customer_id,
            subscriptionId: sub.id,
            subscriptionStatus: sub.status === "active" ? "active" : "none",
            planId: planId || "standard_monthly",
            aiBudgetLimit: 200,    // $2.00 default monthly AI budget for paid users (Start of metered billing threshold)
            // Only reset usage on new creations, not random updates (unless period changed)
            ...(type === "subscription.created" ? { aiUsageCurrent: 0 } : {}),
            baseMonthlyFee,        // Actual amount charged per interval
          });

          // ... claims ...
        }
        break;

      case "order.created":
        // This usually signals a payment for a renewal or a new checkout
        const order = data as any;
        const orgIdFromMetadata = order.metadata?.organizationId;
        
        if (orgIdFromMetadata) {
          console.log(`[Polar] New order ${order.id} for org ${orgIdFromMetadata} - resetting monthly usage.`);
          // Reset monthly AI usage on every successful order (renewal payment)
          await adminDb!.collection("organizations").doc(orgIdFromMetadata).update({
            aiUsageCurrent: 0,
            lastRenewalAt: new Date(),
          });
        }
        break;

      case "subscription.revoked":
        const revokedSub = data as any;
        const orgId = revokedSub.metadata?.organizationId;
        
        if (orgId) {
          await adminDb!.collection("organizations").doc(orgId).update({
            subscriptionStatus: "canceled",
            planId: "free",
          });
        }
        break;

      default:
        console.log(`Unhandled Polar event: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Polar webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
