import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  if (!sig || !endpointSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook construction error:", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const organizationId = session.client_reference_id as string;
        const customerId = session.customer as string;
        const planId = session.metadata?.planId as string;
        const userId = session.metadata?.userId as string;

        if (organizationId && userId) {
          // 1. Update Organization
          await adminDb!.collection("organizations").doc(organizationId).update({
            stripeCustomerId: customerId,
            subscriptionStatus: "active",
            planId: planId || "pro_teacher",
          });

          // 2. Set Custom Claims for the Lead Admin
          // This allows rules to check `request.auth.token.role` and `request.auth.token.orgId`
          await adminAuth!.setCustomUserClaims(userId, {
            role: "teacher",
            orgId: organizationId,
            plan: planId,
          });
          
          console.log(`Updated organization ${organizationId} and claims for user ${userId}`);
        }
        break;

      case "customer.subscription.deleted":
        const subscription = event.data.object;
        const orgId = subscription.metadata?.organizationId;
        
        if (orgId) {
          await adminDb!.collection("organizations").doc(orgId).update({
            subscriptionStatus: "canceled",
            planId: "free",
          });
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
