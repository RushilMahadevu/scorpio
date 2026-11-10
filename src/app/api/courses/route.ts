import { NextResponse } from 'next/server';
import { authenticateRequest, withAuthorizedRequest } from '@/lib/auth-verify';
import { adminDb } from '@/lib/firebase-admin';
export const POST = withAuthorizedRequest(async req => {
  const caller = (await authenticateRequest(req))!;
  const { name, code } = await req.json();
  if (typeof name !== 'string' || !name.trim()) return NextResponse.json({ error: 'Enter a class name' }, { status: 400 });
  if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{6,64}$/.test(code)) return NextResponse.json({ error: 'Use a class code of 6–64 letters, numbers, dashes, or underscores' }, { status: 400 });
  const profile = (await adminDb.collection('users').doc(caller.uid).get()).data()!;
  if (!profile.organizationId) return NextResponse.json({ error: 'Join a network first' }, { status: 400 });
  try {
    const ref = adminDb.collection('courses').doc();
    await adminDb.runTransaction(async tx => {
      const codeRef = adminDb.collection('course_codes').doc(code);
      const reserved = await tx.get(codeRef);
      const existing = await tx.get(adminDb.collection('courses').where('code', '==', code).limit(1));
      if (reserved.exists || !existing.empty) throw new Error('Class code already exists');
      tx.create(codeRef, { courseId: ref.id });
      tx.create(ref, { name: name.trim().slice(0,120), code, teacherId: caller.uid, organizationId: profile.organizationId, createdAt: new Date().toISOString() });
    });
    return NextResponse.json({ id: ref.id });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not create class' }, { status: 400 }); }
}, { teacher: true });
