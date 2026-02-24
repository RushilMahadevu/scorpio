import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { userId, organizationId, planId } = await req.json();

    if (!userId || !organizationId || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify organization exists and user is the owner
    const orgDoc = await adminDb.collection("organizations").doc(organizationId).get();
    if (!orgDoc.exists) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    const orgData = orgDoc.data();
    if (orgData?.ownerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Define Price IDs (normally from env)
    // For demo/dev purposes, use hardcoded or from env
    const prices: Record<string, string> = {
      pro_teacher: process.env.STRIPE_PRO_TEACHER_PRICE_ID || "price_pro_teacher",
      department_network: process.env.STRIPE_NETWORK_PRICE_ID || "price_department_network",
    };

    const priceId = prices[planId];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/teacher/network?success=true`,
      cancel_url: `${req.headers.get("origin")}/teacher/network?canceled=true`,
      customer_email: orgData.ownerEmail, // We should ensure this exists
      client_reference_id: organizationId,
      metadata: {
        userId,
        organizationId,
        planId,
      },
      subscription_data: {
        metadata: {
          organizationId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
