import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import { Polar } from '@polar-sh/sdk';
const token = defineSecret('POLAR_ACCESS_TOKEN');
export const deliverBillingUsage = onDocumentCreated({ document: 'billing_outbox/{eventId}', secrets: [token], retry: true }, async event => {
 const ref = event.data?.ref;
 if (!ref) return;
 const current = (await ref.get()).data();
 if (!current || current.status === 'delivered') return;
 const polar = new Polar({ accessToken: token.value(), server: process.env.POLAR_ENV === 'sandbox' ? 'sandbox' : 'production' });
 await polar.events.ingest({ events: [{
  externalId: event.params.eventId, customerId: current.customerId, name: 'ai_usage', timestamp: current.timestamp.toDate(),
  metadata: { event_name: 'ai_usage', input_tokens: current.inputTokens, output_tokens: current.outputTokens,
    costUSD: current.costCents / 100, organizationId: current.organizationId, type: current.type, vendor: 'google', model: 'gemini-2.5-flash' },
 }] });
 await ref.update({ status: 'delivered', deliveredAt: new Date() });
});
