import { NextResponse } from "next/server";
import { polar } from "@/lib/polar";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { userId, organizationId, planId } = await req.json();

    if (!userId || !organizationId || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify organization exists and user is the owner
    const orgDoc = await adminDb!.collection("organizations").doc(organizationId).get();
    if (!orgDoc.exists) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    const orgData = orgDoc.data();
    if (orgData?.ownerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Define Polar Product IDs
    const products: Record<string, string | undefined> = {
      standard_monthly: process.env.POLAR_MONTHLY_ID,
      standard_yearly: process.env.POLAR_YEARLY_ID,
      // Transition fallbacks
      pro_monthly: process.env.POLAR_MONTHLY_ID,
      pro_yearly: process.env.POLAR_YEARLY_ID,
      scorpio_monthly: process.env.POLAR_MONTHLY_ID,
      scorpio_yearly: process.env.POLAR_YEARLY_ID,
      scorpio_pro: process.env.POLAR_PRODUCT_ID,
      department_monthly: process.env.POLAR_MONTHLY_ID,
      department_yearly: process.env.POLAR_YEARLY_ID,
      department_network: process.env.POLAR_PRODUCT_ID,
    };

    const productId = products[planId];
    if (!productId) {
      console.error(`Missing Polar ID for plan: ${planId}. Check .env.local.`);
      return NextResponse.json({ 
        error: "Configuration Error", 
        message: `Plan ID '${planId}' is not mapped to a Polar Price ID in the environment variables.` 
      }, { status: 400 });
    }

    // 3. Create Polar Checkout Session
    try {
      if (!polar) {
        return NextResponse.json({ error: "Polar SDK not initialized" }, { status: 500 });
      }

      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const checkoutOptions: any = {
        products: [productId],
        successUrl: `${origin}/teacher/network?success=true`,
        includeConfirmationEmail: true,
        metadata: {
          organizationId: String(organizationId),
          userId: String(userId),
          planId: String(planId),
        },
      };

      if (orgData?.ownerEmail) {
        checkoutOptions.customerEmail = orgData.ownerEmail;
      }

      const result = await polar.checkouts.create(checkoutOptions);

      if (!result || !result.url) {
        return NextResponse.json({ error: "No checkout URL returned from Polar" }, { status: 500 });
      }

      return NextResponse.json({ url: result.url });
    } catch (polarError: any) {
      console.error("Polar API error details:", polarError);
      return NextResponse.json({ 
        error: "Polar Checkout Error", 
        message: polarError.message || "Unknown error",
        details: polarError.body || "No additional details"
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Checkout route error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      message: error?.message || "An unexpected error occurred"
    }, { status: 500 });
  }
}
