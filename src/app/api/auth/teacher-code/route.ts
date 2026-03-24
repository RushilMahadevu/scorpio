import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminFieldWithValue as FieldValue } from '@/lib/firebase-admin';
import { randomBytes } from 'crypto';

function generateCode(): string {
  const segment = () => randomBytes(2).toString('hex').toUpperCase();
  return `SCORP-${segment()}-${segment()}`;
}

export async function POST(req: NextRequest) {
  try {
  if (!adminDb) {
    console.error('[teacher-code] adminDb is null — Firebase Admin SDK not initialized. Check FIREBASE_* env vars on Cloud Run.');
    return NextResponse.json({ error: 'Service unavailable: Firebase Admin not initialized' }, { status: 500 });
  }

  const body = await req.json();
  const { action, code, label, usedBy, usedByEmail, organizationId } = body;

  // ─── GENERATE (admin only) ───────────────────────────────────────────────
  if (action === 'generate') {
    const adminSecret = req.headers.get('x-admin-secret');
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newCode = generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day expiry

    await adminDb.collection('teacherInviteCodes').doc(newCode).set({
      code: newCode,
      label: label?.trim() || null,
      organizationId: organizationId || null, // Optional: auto-join an org
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
      isUsed: false,
      usedAt: null,
      usedBy: null,
      usedByEmail: null,
    });

    return NextResponse.json({ code: newCode });
  }

  // ─── LIST (admin only) ────────────────────────────────────────────────────
  if (action === 'list') {
    const adminSecret = req.headers.get('x-admin-secret');
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection('teacherInviteCodes')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const codes = snapshot.docs.map((doc: any) => {
      const d = doc.data();
      return {
        code: d.code,
        label: d.label,
        isUsed: d.isUsed,
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        expiresAt: d.expiresAt instanceof Date ? d.expiresAt.toISOString() : d.expiresAt?.toDate?.()?.toISOString() ?? null,
        usedAt: d.usedAt?.toDate?.()?.toISOString() ?? null,
        usedByEmail: d.usedByEmail,
      };
    });

    return NextResponse.json({ codes });
  }

  // ─── REVOKE (admin only) ──────────────────────────────────────────────────
  if (action === 'revoke') {
    const adminSecret = req.headers.get('x-admin-secret');
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

    const docRef = adminDb.collection('teacherInviteCodes').doc(code.trim().toUpperCase());
    const doc = await docRef.get();
    if (!doc.exists) return NextResponse.json({ error: 'Code not found' }, { status: 404 });

    await docRef.update({ isUsed: true, revokedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true });
  }

  // ─── VALIDATE (public — called during signup) ─────────────────────────────
  if (action === 'validate') {
    if (!code) return NextResponse.json({ valid: false, reason: 'Missing code' }, { status: 400 });

    const normalized = code.trim().toUpperCase();
    const docRef = adminDb.collection('teacherInviteCodes').doc(normalized);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ valid: false, reason: 'Invalid code' });
    }

    const data = doc.data()!;

    if (data.isUsed) {
      return NextResponse.json({ valid: false, reason: 'Code already used' });
    }

    const expiresAt = data.expiresAt instanceof Date
      ? data.expiresAt
      : data.expiresAt?.toDate?.();

    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json({ valid: false, reason: 'Code expired' });
    }

    return NextResponse.json({
      valid: true,
      organizationId: data.organizationId || null
    });
  }

  // ─── MARK USED (called after successful signup) ───────────────────────────
  if (action === 'markUsed') {
    if (!code || !usedBy) {
      return NextResponse.json({ error: 'Missing code or usedBy' }, { status: 400 });
    }

    const normalized = code.trim().toUpperCase();
    const docRef = adminDb.collection('teacherInviteCodes').doc(normalized);

    try {
      await adminDb.runTransaction(async (t: any) => {
        const doc = await t.get(docRef);
        if (!doc.exists) throw new Error('Code not found');
        if (doc.data()!.isUsed) throw new Error('Code already used');

        t.update(docRef, {
          isUsed: true,
          usedAt: FieldValue.serverTimestamp(),
          usedBy,
          usedByEmail: usedByEmail || null,
        });
      });

      return NextResponse.json({ success: true });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('[teacher-code] Unhandled error:', err);
    return NextResponse.json({ error: err?.message ?? 'Internal error', stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined }, { status: 500 });
  }
}
