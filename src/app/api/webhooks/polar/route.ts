import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { validateEvent } from "@polar-sh/sdk/webhooks";

export async function POST(req: Request) {
  const body = await req.text();

  const headersRecord: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headersRecord[key] = value;
  });

  let event;
  try {
    event = validateEvent(
      body,
      headersRecord,
      process.env.POLAR_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Polar Webhook validation failed:", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { type, data } = event;
  console.log("[Polar Webhook] Event type:", type);
  console.log("[Polar Webhook] Metadata:", JSON.stringify((data as any).metadata));
  console.log("[Polar Webhook] adminDb initialized:", !!adminDb);

  if (!adminDb) {
    console.error("[Polar Webhook] adminDb is null — check FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID in .env.local");
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  try {
    switch (type) {
      case "subscription.created":
      case "subscription.updated":
      case "subscription.active":
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

          // 2. Update Organization in Firestore (use set+merge so it works even if doc fields are missing)
          await adminDb!.collection("organizations").doc(organizationId).set({
            polarCustomerId: sub.customerId ?? sub.customer_id ?? null,
            subscriptionId: sub.id,
            subscriptionStatus: sub.status === "active" ? "active" : "none",
            planId: planId || "standard_monthly",
            aiBudgetLimit: 200,
            ...(type === "subscription.created" || type === "subscription.active" ? { aiUsageCurrent: 0 } : {}),
            baseMonthlyFee,
          }, { merge: true });
          console.log(`[Polar] Updated org ${organizationId}: status=${sub.status}, planId=${planId}, customerId=${sub.customerId ?? sub.customer_id}`);

          // ... claims ...
        }
        break;

      case "order.created":
        const order = data as any;
        const orgIdFromMetadata = order.metadata?.organizationId;
        const orderPlanId = order.metadata?.planId;
        const orderUserId = order.metadata?.userId;

        if (orgIdFromMetadata) {
          console.log(`[Polar] Order ${order.id} for org ${orgIdFromMetadata}, plan=${orderPlanId}, status=${order.status}`);
          
          // If this order has a planId in metadata, treat it as a subscription activation
          // (happens when product is one-time or subscription fires order before subscription.created)
          if (orderPlanId && orderUserId) {
            const planFees: Record<string, number> = {
              standard_monthly: 499,
              standard_yearly: 2988,
              pro_monthly: 499,
              pro_yearly: 2988,
            };
            await adminDb!.collection("organizations").doc(orgIdFromMetadata).set({
              polarCustomerId: order.customerId ?? order.customer_id ?? null,
              subscriptionStatus: "active",
              planId: orderPlanId,
              aiBudgetLimit: 200,
              aiUsageCurrent: 0,
              baseMonthlyFee: planFees[orderPlanId] || 499,
              lastRenewalAt: new Date(),
            }, { merge: true });
            console.log(`[Polar] Activated org ${orgIdFromMetadata} via order.created`);
          } else {
            // Renewal-only reset
            await adminDb!.collection("organizations").doc(orgIdFromMetadata).set({
              aiUsageCurrent: 0,
              lastRenewalAt: new Date(),
            }, { merge: true });
          }
        }
        break;

      case "subscription.revoked":
        const revokedSub = data as any;
        const orgId = revokedSub.metadata?.organizationId;
        
        if (orgId) {
          await adminDb!.collection("organizations").doc(orgId).set({
            subscriptionStatus: "canceled",
            planId: "free",
          }, { merge: true });
        }
        break;

      default:
        console.log(`Unhandled Polar event: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Polar Webhook] Error processing event:", error?.message || error);
    console.error("[Polar Webhook] Stack:", error?.stack);
    return NextResponse.json({ error: "Internal Server Error", detail: error?.message }, { status: 500 });
  }
}
