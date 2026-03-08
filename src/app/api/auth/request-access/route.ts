import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminFieldWithValue as FieldValue } from '@/lib/firebase-admin';
import { randomBytes } from 'crypto';

function generateCode(): string {
  const segment = () => randomBytes(2).toString('hex').toUpperCase();
  return `SCORP-${segment()}-${segment()}`;
}

function requireAdmin(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret');
  return !!(secret && secret === process.env.ADMIN_SECRET);
}

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      console.error('[request-access] adminDb is null — Firebase Admin SDK not initialized.');
      return NextResponse.json(
        { error: 'Service unavailable. Please try again later.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { action } = body;

    // ─── LIST (admin only) ────────────────────────────────────────────────────
    if (action === 'list') {
      if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const snapshot = await adminDb
        .collection('accessRequests')
        .orderBy('createdAt', 'desc')
        .limit(200)
        .get();

      const requests = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name,
          email: data.email,
          institution: data.institution,
          role: data.role,
          message: data.message ?? null,
          status: data.status,
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
          reviewedAt: data.reviewedAt?.toDate?.()?.toISOString() ?? null,
          generatedCode: data.generatedCode ?? null,
        };
      });

      return NextResponse.json({ requests });
    }

    // ─── APPROVE (admin only) — generates invite code + marks request approved ─
    if (action === 'approve') {
      if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const { id } = body;
      if (!id) return NextResponse.json({ error: 'Missing request id' }, { status: 400 });

      const reqDoc = await adminDb.collection('accessRequests').doc(id).get();
      if (!reqDoc.exists) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

      const data = reqDoc.data()!;
      if (data.status !== 'pending') {
        return NextResponse.json({ error: 'Request is not pending' }, { status: 409 });
      }

      // Generate a teacher invite code labelled with the requester's info
      const code = generateCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60); // 60-day expiry for requested codes

      await adminDb.collection('teacherInviteCodes').doc(code).set({
        code,
        label: `${data.name} — ${data.institution}`,
        organizationId: null,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt,
        isUsed: false,
        usedAt: null,
        usedBy: null,
        usedByEmail: null,
        requestId: id,
      });

      await adminDb.collection('accessRequests').doc(id).update({
        status: 'approved',
        reviewedAt: FieldValue.serverTimestamp(),
        generatedCode: code,
      });

      return NextResponse.json({ success: true, code });
    }

    // ─── REJECT (admin only) ──────────────────────────────────────────────────
    if (action === 'reject') {
      if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      const { id } = body;
      if (!id) return NextResponse.json({ error: 'Missing request id' }, { status: 400 });

      const reqDoc = await adminDb.collection('accessRequests').doc(id).get();
      if (!reqDoc.exists) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

      await adminDb.collection('accessRequests').doc(id).update({
        status: 'rejected',
        reviewedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    // ─── SUBMIT (public — called from /request-access page) ──────────────────
    const { name, email, institution, role, message } = body;

    if (!name?.trim() || !email?.trim() || !institution?.trim() || !role?.trim()) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const existingSnapshot = await adminDb
      .collection('accessRequests')
      .where('email', '==', email.trim().toLowerCase())
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: "A pending request already exists for this email. We'll be in touch soon." },
        { status: 409 }
      );
    }

    await adminDb.collection('accessRequests').add({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      institution: institution.trim(),
      role: role.trim(),
      message: message?.trim() || null,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      reviewedAt: null,
      generatedCode: null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[request-access] Error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
