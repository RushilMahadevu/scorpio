import type { firestore } from 'firebase-admin';
import { randomUUID } from 'node:crypto';

// Gemini 2.5 Flash text rates, cents/token. Includes thinking in output usage.
export const TOKEN_RATES = { input: 0.00003, output: 0.00025 };
export function estimateMaximumCost(inputBytes: number, outputTokens: number) {
  return (inputBytes + 1024) * TOKEN_RATES.input + outputTokens * TOKEN_RATES.output;
}
export async function reserveBudget(db: firestore.Firestore, organizationId: string, type: string, userId: string | undefined, maxCost: number) {
  if (!organizationId || !Number.isFinite(maxCost) || maxCost <= 0) throw new Error('Invalid AI budget reservation');
  const id = randomUUID();
  const orgRef = db.collection('organizations').doc(organizationId);
  const userRef = userId ? db.collection('users').doc(userId) : null;
  const month = new Date().toISOString().slice(0, 7);
  await db.runTransaction(async tx => {
    const org = (await tx.get(orgRef)).data();
    const user = userRef ? (await tx.get(userRef)).data() : null;
    if (!org || !['active','trialing'].includes(org.subscriptionStatus)) throw new Error('AI subscription is not active');
    const limit = org.planId === 'free' ? Math.min(org.aiBudgetLimit || 0, 50) : (org.aiBudgetLimit || 0);
    if ((org.aiUsageCurrent || 0) + (org.aiUsageReserved || 0) + maxCost > limit) throw new Error('Insufficient AI budget for this request');
    const fields: Record<string, [string,string]> = { tutor: ['tutorUsageCurrent','aiTutorLimitPerStudent'], notebook: ['aiNotebookUsageCurrent','aiNotebookLimitPerStudent'] };
    const fieldsForType = fields[type];
    if (userRef && user && fieldsForType) {
      const [counter, allowance] = fieldsForType;
      const usage = user.usageMonth === month ? (user[counter] || 0) : 0;
      if (org[allowance] > 0 && usage >= org[allowance]) throw new Error('Your monthly AI allowance has been reached');
      tx.update(userRef, { ...(user.usageMonth !== month ? { tutorUsageCurrent: 0, aiNotebookUsageCurrent: 0 } : {}), usageMonth: month, [counter]: usage + 1 });
    }
    tx.update(orgRef, { aiUsageReserved: (org.aiUsageReserved || 0) + maxCost });
    tx.create(db.collection('ai_reservations').doc(id), { organizationId, userId: userId || null, type, maxCost, createdAt: new Date(), status: 'pending' });
  });
  return id;
}
export async function settleBudget(db: firestore.Firestore, id: string, inputTokens: number, outputTokens: number) {
  if (![inputTokens,outputTokens].every(n=>Number.isFinite(n)&&n>=0)) throw new Error('Invalid provider usage');
  await db.runTransaction(async tx => {
    const ref = db.collection('ai_reservations').doc(id);
    const reservation = (await tx.get(ref)).data();
    if (!reservation || reservation.status !== 'pending') return;
    const orgRef = db.collection('organizations').doc(reservation.organizationId);
    const org = (await tx.get(orgRef)).data();
    if (!org) throw new Error('Network missing during usage settlement');
    const costCents = inputTokens * TOKEN_RATES.input + outputTokens * TOKEN_RATES.output;
    tx.update(orgRef, { aiUsageReserved: Math.max(0,(org.aiUsageReserved || 0)-reservation.maxCost), aiUsageCurrent: (org.aiUsageCurrent || 0)+costCents, aiUsageTotalCents: (org.aiUsageTotalCents || 0)+costCents, lastAiUsageAt: new Date() });
    tx.update(ref, { status: 'settled', costCents, settledAt: new Date() });
    tx.create(db.collection('usage_analytics').doc(id), { organizationId: reservation.organizationId, userId: reservation.userId, type: reservation.type, inputTokens, outputTokens, costCents, timestamp: new Date() });
    if (org.polarCustomerId && costCents > 0) tx.create(db.collection('billing_outbox').doc(id), {
      customerId: org.polarCustomerId, organizationId: reservation.organizationId, type: reservation.type,
      inputTokens, outputTokens, costCents, timestamp: new Date(), status: 'pending', attempts: 0,
    });
  });
}
