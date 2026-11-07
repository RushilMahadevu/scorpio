import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { validateEvent } from '@polar-sh/sdk/webhooks';
import { createHash } from 'node:crypto';

export async function POST(req: Request) {
  const body = await req.text();
  let event;
  try { event = validateEvent(body, Object.fromEntries(req.headers), process.env.POLAR_WEBHOOK_SECRET!); }
  catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 401 }); }
  // Orders are not subscription activation. Only signed subscription state drives access.
  if (!event.type.startsWith('subscription.')) return NextResponse.json({ received: true });
  const sub = event.data as {
    id: string; customerId: string; status: string; modifiedAt?: Date; createdAt: Date; currentPeriodStart: Date;
    metadata?: { organizationId?: string; planId?: string };
  };
  const orgId = sub.metadata?.organizationId;
  if (typeof orgId !== 'string' || orgId.includes('/')) return NextResponse.json({ received: true });
  const eventId = createHash('sha256').update(req.headers.get('webhook-id') || body).digest('hex');
  try {
    await adminDb.runTransaction(async tx => {
      const seenRef = adminDb.collection('billing_events').doc(eventId);
      const ref = adminDb.collection('organizations').doc(orgId);
      const seen = await tx.get(seenRef);
      const org = (await tx.get(ref)).data();
      if (seen.exists || !org) return;
      const modified = new Date(sub.modifiedAt || sub.createdAt).getTime();
      if (!Number.isFinite(modified) || modified < (org.billingUpdatedAt || 0)) return;
      const periodStart = new Date(sub.currentPeriodStart).toISOString();
      const newPeriod = org.billingPeriodStart !== periodStart;
      tx.update(ref, {
        polarCustomerId: sub.customerId, subscriptionId: sub.id, subscriptionStatus: sub.status,
        planId: sub.metadata?.planId || org.planId || 'free', billingUpdatedAt: modified, billingPeriodStart: periodStart,
        ...(newPeriod ? { aiUsageCurrent: 0, notebookUsageCurrent: 0, lastRenewalAt: new Date() } : {}),
      });
      tx.create(seenRef, { processedAt: new Date(), type: event.type });
    });
    return NextResponse.json({ received: true });
  } catch { return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 }); }
}
