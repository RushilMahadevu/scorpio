import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-verify';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getStorage } from 'firebase-admin/storage';

async function records(uid: string) {
  const results = await Promise.all(['submissions','practice_history','notebooks','tutor_sessions','portfolios'].map(async name => ({
    name, docs: (await adminDb.collection(name).where('studentId','==',uid).get()).docs,
  })));
  for (const name of ['users','students','teachers','notebooks','tutor_sessions','portfolios']) {
    const doc = await adminDb.collection(name).doc(uid).get();
    if (doc.exists) results.push({ name, docs: [doc as FirebaseFirestore.QueryDocumentSnapshot] });
  }
  return results;
}
export async function GET(req: NextRequest) {
  const caller = await authenticateRequest(req);
  if (!caller) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const result = await records(caller.uid);
  return NextResponse.json(result.map(group => ({ collection: group.name, records: group.docs.map(doc=>({id:doc.id,...doc.data()})) })), { headers: { 'Cache-Control': 'no-store', 'Content-Disposition': 'attachment; filename="scorpio-data.json"' } });
}
export async function DELETE(req: NextRequest) {
  const caller = await authenticateRequest(req);
  if (!caller) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  if (Date.now()/1000 - caller.auth_time > 300) return NextResponse.json({ error: 'Sign out and sign in again before deleting your account' }, { status: 403 });
  const profile = (await adminDb.collection('users').doc(caller.uid).get()).data();
  if (profile?.role === 'teacher') {
    const [owned, students, assignments, courses] = await Promise.all([
      adminDb.collection('organizations').where('ownerId','==',caller.uid).limit(1).get(),
      adminDb.collection('users').where('teacherId','==',caller.uid).limit(1).get(),
      adminDb.collection('assignments').where('teacherId','==',caller.uid).limit(1).get(),
      adminDb.collection('courses').where('teacherId','==',caller.uid).limit(1).get(),
    ]);
    if (![owned,students,assignments,courses].every(s=>s.empty)) return NextResponse.json({ error: 'Transfer network ownership and arrange class/data handoff with support before deleting this teacher account' }, { status: 409 });
  }
  try {
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucket) throw new Error('Storage is not configured');
    await getStorage().bucket(bucket).deleteFiles({ prefix: `submissions/${caller.uid}/` });
    const groups = await records(caller.uid);
    const unique = new Map(groups.flatMap(g=>g.docs).map(d=>[d.ref.path,d.ref]));
    // Delete the profile last so failed deletion can be retried while still authenticated.
    const refs = [...unique.values()].filter(r=>r.path!==`users/${caller.uid}`);
    for (let i=0;i<refs.length;i+=400) {
      const batch=adminDb.batch(); refs.slice(i,i+400).forEach(ref=>batch.delete(ref)); await batch.commit();
    }
    await adminAuth.deleteUser(caller.uid);
    await adminDb.collection('users').doc(caller.uid).delete();
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Deletion did not complete. Contact support to finish removal.' }, { status: 500 }); }
}
