import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, withAuthorizedRequest } from '@/lib/auth-verify';
import { adminDb } from '@/lib/firebase-admin';
import { splitAssignmentQuestions, mergeAnswerKey } from '@/lib/assignment-security';

export const POST = withAuthorizedRequest(async (req) => {
  const caller = (await authenticateRequest(req))!;
  const data = await req.json();
  const profile = (await adminDb.collection('users').doc(caller.uid).get()).data()!;
  if (!Array.isArray(data.questions) || data.questions.length > 100 || !data.title) return NextResponse.json({ error: 'Invalid assignment' }, { status: 400 });
  if (data.courseId) {
    const course = (await adminDb.collection('courses').doc(data.courseId).get()).data();
    if (course?.teacherId !== caller.uid) return NextResponse.json({ error: 'Invalid class' }, { status: 403 });
  }
  const { publicQuestions, answers } = splitAssignmentQuestions(data.questions);
  const ref = adminDb.collection('assignments').doc();
  const batch = adminDb.batch();
  batch.set(ref, { ...data, teacherId: caller.uid, organizationId: profile.organizationId || null,
    questions: publicQuestions, rubric: null, answerKeySeparated: true,
    dueDate: data.dueDate ? new Date(data.dueDate) : null, createdAt: new Date() });
  batch.set(adminDb.collection('assignment_keys').doc(ref.id), { answers, rubric: data.rubric || '', teacherId: caller.uid });
  await batch.commit();
  return NextResponse.json({ id: ref.id });
}, { teacher: true });

export async function GET(req: NextRequest) {
  const caller = await authenticateRequest(req);
  if (!caller) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id || id.includes('/')) return NextResponse.json({ error: 'Invalid assignment' }, { status: 400 });
  const assignment = (await adminDb.collection('assignments').doc(id).get()).data();
  const profile = (await adminDb.collection('users').doc(caller.uid).get()).data();
  if (profile?.role !== 'teacher' || !assignment || !(assignment.teacherId === caller.uid || assignment.visibility === 'global' ||
      (assignment.visibility === 'network' && profile.organizationId && assignment.organizationId === profile.organizationId))) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  const key = (await adminDb.collection('assignment_keys').doc(id).get()).data();
  return NextResponse.json(mergeAnswerKey(assignment, key));
}
